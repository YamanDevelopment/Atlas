import type { Request, Response } from 'express';
import { Router } from 'express';
import {
	validateLogin,
	validateRegister,
	validateRefreshToken,
	rateLimiters,
} from '../../auth';
import { requireAuth } from '../../auth/middleware/auth';
import { authConfig } from '../../auth/config';
import { User } from '../../database/schemas/User';
import { jwtService } from '../../auth/services/jwt';
import { passwordService } from '../../auth/services/password';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = Router();

/**
 * Authentication API Routes
 * POST /api/auth/register - Register new user
 * POST /api/auth/login - Login user
 * POST /api/auth/refresh - Refresh access token
 * POST /api/auth/logout - Logout user
 * GET /api/auth/me - Get current user info
 */

/**
 * POST /api/auth/register
 */
router.post('/register',
	rateLimiters.register,
	validateRegister,
	async (req: Request, res: Response): Promise<void> => {
		try {
			console.log(`📝 API Registration for: ${req.body.username}`);

			const { name, username, email, password } = req.body;

			// Check existing username
			const existingUsername = await User.findOne({ username });
			if (existingUsername) {
				res.status(400).json({
					success: false,
					error: 'Username already exists',
					message: 'Please choose a different username',
				});
				return;
			}

			// Check existing email
			const existingEmail = await User.findOne({ email });
			if (existingEmail) {
				res.status(400).json({
					success: false,
					error: 'Email already exists',
					message: 'An account with this email already exists',
				});
				return;
			}

			// Validate password
			const passwordValidation = passwordService.validatePassword(password);
			if (!passwordValidation.isValid) {
				res.status(400).json({
					success: false,
					error: 'Password validation failed',
					message: 'Password does not meet requirements',
					details: passwordValidation.errors,
				});
				return;
			}

			// Generate next user ID
			const lastUser = await User.findOne({}, {}, { sort: { id: -1 } });
			const nextId = (lastUser?.id || 0) + 1;

			// Create user
			const newUser = new User({
				id: nextId,
				name,
				username,
				email,
				password,
			});

			await newUser.save();

			// Generate tokens
			const tokens = jwtService.generateTokenPair({
				id: String(newUser._id),
				username: newUser.username,
				email: newUser.email,
			});

			console.log(`✅ User registered: ${username}`);

			res.status(201).json({
				success: true,
				message: 'User registered successfully',
				data: {
					user: {
						id: newUser.id,
						name: newUser.name,
						username: newUser.username,
						email: newUser.email,
						role: newUser.role, // Add the role field
						createdAt: newUser.createdAt,
					},
					tokens: {
						accessToken: tokens.accessToken,
						refreshToken: tokens.refreshToken,
						expiresIn: tokens.expiresIn,
						tokenType: 'Bearer',
					},
				},
			});

		} catch (error) {
			console.error('❌ Registration error:', error);
			res.status(500).json({
				success: false,
				error: 'Registration failed',
				message: 'An error occurred during registration',
			});
		}
	},
);

/**
 * POST /api/auth/login
 */
router.post('/login',
	rateLimiters.auth,
	validateLogin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			console.log(`🔐 API Login attempt: ${req.body.username}`);

			const { username, password } = req.body;

			// Find user
			const user = await User.findOne({
				$or: [{ username }, { email: username }],
			});

			if (!user) {
				res.status(401).json({
					success: false,
					error: 'Invalid credentials',
					message: 'Username or password is incorrect',
				});
				return;
			}

			// Verify password
			const isPasswordValid = await user.comparePassword(password);
			if (!isPasswordValid) {
				res.status(401).json({
					success: false,
					error: 'Invalid credentials',
					message: 'Username or password is incorrect',
				});
				return;
			}

			// Update last login
			user.lastLogin = new Date();
			await user.save({ validateBeforeSave: false });

			// Generate tokens
			const tokens = jwtService.generateTokenPair({
				id: String(user._id),
				username: user.username,
				email: user.email,
			});

			console.log(`✅ User logged in: ${username}`);

			res.json({
				success: true,
				message: 'Login successful',
				data: {
					user: {
						id: user.id,
						name: user.name,
						username: user.username,
						email: user.email,
						role: user.role, // Add the role field
						lastLogin: user.lastLogin,
						interests: user.interests,
					},
					tokens: {
						accessToken: tokens.accessToken,
						refreshToken: tokens.refreshToken,
						expiresIn: tokens.expiresIn,
						tokenType: 'Bearer',
					},
				},
			});

		} catch (error) {
			console.error('❌ Login error:', error);
			res.status(500).json({
				success: false,
				error: 'Login failed',
				message: 'An error occurred during login',
			});
		}
	},
);

/**
 * POST /api/auth/refresh
 */
router.post('/refresh',
	validateRefreshToken,
	async (req: Request, res: Response): Promise<void> => {
		try {
			console.log('🔄 API Token refresh');

			const { refreshToken } = req.body;
			const result = jwtService.refreshAccessToken(refreshToken);

			if (!result) {
				res.status(401).json({
					success: false,
					error: 'Invalid refresh token',
					message: 'Please login again',
				});
				return;
			}

			res.json({
				success: true,
				message: 'Token refreshed successfully',
				data: {
					accessToken: result.accessToken,
					expiresIn: result.expiresIn,
					tokenType: 'Bearer',
				},
			});

		} catch (error) {
			console.error('❌ Token refresh error:', error);
			res.status(500).json({
				success: false,
				error: 'Token refresh failed',
				message: 'An error occurred while refreshing token',
			});
		}
	},
);

/**
 * POST /api/auth/logout
 */
router.post('/logout',
	validateRefreshToken,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { refreshToken } = req.body;
			const wasRevoked = jwtService.revokeRefreshToken(refreshToken);

			if (wasRevoked) {
				res.json({
					success: true,
					message: 'Logged out successfully',
				});
			} else {
				res.status(400).json({
					success: false,
					error: 'Invalid refresh token',
					message: 'Token was already invalid or expired',
				});
			}

		} catch (error) {
			console.error('❌ Logout error:', error);
			res.status(500).json({
				success: false,
				error: 'Logout failed',
				message: 'An error occurred during logout',
			});
		}
	},
);

/**
 * GET /api/auth/me
 */
router.get('/me',
	async (req: Request, res: Response): Promise<void> => {
		try {
			const authHeader = req.headers.authorization;

			if (!authHeader || !authHeader.startsWith('Bearer ')) {
				res.status(401).json({
					success: false,
					error: 'Authentication required',
					message: 'Please provide a valid authorization header',
				});
				return;
			}

			const token = authHeader.substring(7);
			const decoded = jwtService.verifyAccessToken(token);

			if (!decoded) {
				res.status(401).json({
					success: false,
					error: 'Invalid token',
					message: 'Token is invalid or expired',
				});
				return;
			}

			// Get full user info
			const user = await User.findById(decoded.userId).populate('interests');
			if (!user) {
				res.status(404).json({
					success: false,
					error: 'User not found',
					message: 'User no longer exists',
				});
				return;
			}

			res.json({
				success: true,
				data: {
					user: {
						id: user.id,
						name: user.name,
						username: user.username,
						email: user.email,
						lastLogin: user.lastLogin,
						createdAt: user.createdAt,
						interests: user.interests,
					},
				},
			});

		} catch (error) {
			console.error('❌ Get current user error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to get user info',
				message: 'An error occurred while retrieving profile',
			});
		}
	},
);

// In-memory store for reset tokens (in production, use Redis or database)
const resetTokens = new Map<string, { userId: string; expires: Date }>();

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
	try {
		const { email } = req.body;

		if (!email) {
			res.status(400).json({
				success: false,
				error: 'Email required',
				message: 'Email address is required',
			});
			return;
		}

		const user = await User.findOne({ email: email.toLowerCase() });
		if (!user) {
			// Don't reveal whether user exists or not
			res.json({
				success: true,
				message: 'If an account with this email exists, a password reset link has been sent',
			});
			return;
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(32).toString('hex');
		const expires = new Date();
		expires.setHours(expires.getHours() + 1); // 1 hour expiry

		resetTokens.set(resetToken, {
			userId: user.id.toString(),
			expires,
		});

		// In production, send email here
		console.log(`Password reset token for ${user.email}: ${resetToken}`);

		res.json({
			success: true,
			message: 'Password reset instructions have been sent to your email',
			// For development only - remove in production
			devToken: resetToken,
		});

	} catch (error) {
		console.error('❌ Forgot password error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to process request',
			message: 'An error occurred while processing your request',
		});
	}
});

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
	try {
		const { token, newPassword } = req.body;

		if (!token || !newPassword) {
			res.status(400).json({
				success: false,
				error: 'Missing required fields',
				message: 'Reset token and new password are required',
			});
			return;
		}

		if (newPassword.length < 6) {
			res.status(400).json({
				success: false,
				error: 'Invalid password',
				message: 'Password must be at least 6 characters long',
			});
			return;
		}

		const tokenData = resetTokens.get(token);
		if (!tokenData || tokenData.expires < new Date()) {
			res.status(400).json({
				success: false,
				error: 'Invalid token',
				message: 'Reset token is invalid or has expired',
			});
			return;
		}

		const user = await User.findById(tokenData.userId);
		if (!user) {
			res.status(404).json({
				success: false,
				error: 'User not found',
				message: 'User account no longer exists',
			});
			return;
		}

		// Update password (will be hashed by pre-save middleware)
		user.password = newPassword;
		user.updatedAt = new Date();
		await user.save();

		// Remove used token
		resetTokens.delete(token);

		res.json({
			success: true,
			message: 'Password has been successfully reset',
		});

	} catch (error) {
		console.error('❌ Reset password error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to reset password',
			message: 'An error occurred while resetting your password',
		});
	}
});

/**
 * GET /api/auth/session
 * Get current user session info
 */
router.get('/session', async (req: Request, res: Response): Promise<void> => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			res.status(401).json({
				success: false,
				error: 'No token provided',
				message: 'Authorization token is required',
			});
			return;
		}

		const token = authHeader.substring(7);

		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
			const user = await User.findById(decoded.userId).select('-password');

			if (!user) {
				res.status(401).json({
					success: false,
					error: 'Invalid token',
					message: 'User not found',
				});
				return;
			}

			res.json({
				success: true,
				data: {
					user: {
						id: user.id,
						name: user.name,
						username: user.username,
						email: user.email,
						role: user.role,
						interests: user.interests,
						lastLogin: user.lastLogin,
						createdAt: user.createdAt,
					},
					tokenValid: true,
				},
			});

		} catch {
			res.status(401).json({
				success: false,
				error: 'Invalid token',
				message: 'Authorization token is invalid or expired',
			});
		}

	} catch (error) {
		console.error('❌ Session check error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to check session',
			message: 'An error occurred while checking your session',
		});
	}
});

/**
 * POST /api/auth/update-interests
 */
router.post('/update-interests',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { interests } = req.body;
			const token = req.headers.authorization?.split(' ')[1];

			if (!token) {
				res.status(401).json({
					success: false,
					error: 'No token provided',
					message: 'Authorization token is required',
				});
				return;
			}

			// Validate interests array
			if (!Array.isArray(interests)) {
				res.status(400).json({
					success: false,
					error: 'Invalid interests format',
					message: 'Interests must be an array of interest IDs',
				});
				return;
			}

			try {
				const decoded = jwt.verify(token, authConfig.jwt.secret) as { userId: string };
				const user = await User.findById(decoded.userId);

				if (!user) {
					res.status(404).json({
						success: false,
						error: 'User not found',
						message: 'User account not found',
					});
					return;
				}

				// Update user's interests
				user.interests = interests;
				await user.save();

				res.json({
					success: true,
					message: 'Interests updated successfully',
					data: {
						user: {
							id: user.id,
							name: user.name,
							email: user.email,
							interests: user.interests,
						},
					},
				});

			} catch {
				res.status(401).json({
					success: false,
					error: 'Invalid token',
					message: 'Authorization token is invalid or expired',
				});
			}

		} catch (error) {
			console.error('❌ Update interests error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to update interests',
				message: 'An error occurred while updating interests',
			});
		}
	},
);

export default router;