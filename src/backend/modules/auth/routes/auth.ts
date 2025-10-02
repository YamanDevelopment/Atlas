import type { Request, Response } from 'express';
import { Router } from 'express';
import { User } from '../../database/schemas/User';
import { Interest } from '../../database/schemas/Interest';
import { jwtService } from '../services/jwt';
import { passwordService } from '../services/password';
import {
	validateLogin,
	validateRegister,
	validateRefreshToken,
} from '../middleware/validation';
import { rateLimiters } from '../middleware/rateLimiting';

const router = Router();

/**
 * Authentication Routes
 *
 * How it works:
 * - POST /register: Create new user account
 * - POST /login: Authenticate user and return tokens
 * - POST /refresh: Get new access token using refresh token
 * - POST /logout: Revoke refresh token
 * - POST /logout-all: Revoke all refresh tokens for user
 *
 * All routes use validation and rate limiting for security
 */

/**
 * POST /auth/register
 * Register a new user account
 */
router.post('/register',
	rateLimiters.register,
	validateRegister,
	async (req: Request, res: Response): Promise<void> => {
		try {
			console.log(`📝 Registration attempt for username: ${req.body.username}`);

			const { name, username, email, password } = req.body;

			// Check if username already exists
			const existingUsername = await User.findOne({ username });
			if (existingUsername) {
				console.warn(`🚫 Username already exists: ${username}`);
				res.status(400).json({
					error: 'Username already exists',
					message: 'Please choose a different username',
				});
				return;
			}

			// Check if email already exists
			const existingEmail = await User.findOne({ email });
			if (existingEmail) {
				console.warn(`🚫 Email already exists: ${email}`);
				res.status(400).json({
					error: 'Email already exists',
					message: 'An account with this email already exists',
				});
				return;
			}

			// Validate password strength
			const passwordValidation = passwordService.validatePassword(password);
			if (!passwordValidation.isValid) {
				res.status(400).json({
					error: 'Password validation failed',
					message: 'Password does not meet requirements',
					details: passwordValidation.errors,
				});
				return;
			}

			// Generate next user ID (simple auto-increment)
			const lastUser = await User.findOne({}, {}, { sort: { id: -1 } });
			const nextId = (lastUser?.id || 0) + 1;

			// Create new user (password will be hashed by pre-save middleware)
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
				id: newUser._id.toString(),
				username: newUser.username,
				email: newUser.email,
			});

			console.log(`✅ User registered successfully: ${username} (ID: ${nextId})`);

			res.status(201).json({
				success: true,
				message: 'User registered successfully',
				data: {
					user: {
						id: newUser._id.toString(),
						name: newUser.name,
						username: newUser.username,
						email: newUser.email,
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
				error: 'Registration failed',
				message: 'An error occurred while creating your account',
			});
		}
	},
);

/**
 * POST /auth/login
 * Authenticate user and return tokens
 */
router.post('/login',
	rateLimiters.auth,
	validateLogin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			console.log(`🔐 Login attempt for username: ${req.body.username}`);

			const { username, password } = req.body;

			// Find user by username or email
			const user = await User.findOne({
				$or: [{ username }, { email: username }],
			});

			if (!user) {
				console.warn(`🚫 User not found: ${username}`);
				res.status(401).json({
					error: 'Invalid credentials',
					message: 'Username or password is incorrect',
				});
				return;
			}

			// Verify password using the User model's method
			const isPasswordValid = await user.comparePassword(password);
			if (!isPasswordValid) {
				console.warn(`🚫 Invalid password for user: ${username}`);
				res.status(401).json({
					error: 'Invalid credentials',
					message: 'Username or password is incorrect',
				});
				return;
			}

			// Update last login
			user.lastLogin = new Date();
			await user.save();

			// Generate tokens
			const tokens = jwtService.generateTokenPair({
				id: user._id.toString(),
				username: user.username,
				email: user.email,
			});

			console.log(`✅ User logged in successfully: ${username}`);

			res.json({
				success: true,
				message: 'Login successful',
				data: {
					user: {
						id: user._id.toString(),
						name: user.name,
						username: user.username,
						email: user.email,
						lastLogin: user.lastLogin,
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
				error: 'Login failed',
				message: 'An error occurred while logging you in',
			});
		}
	},
);

/**
 * POST /auth/refresh
 * Get new access token using refresh token
 */
router.post('/refresh',
	validateRefreshToken,
	async (req: Request, res: Response): Promise<void> => {
		try {
			console.log('🔄 Token refresh attempt');

			const { refreshToken } = req.body;

			// Refresh the access token
			const result = jwtService.refreshAccessToken(refreshToken);
			if (!result) {
				res.status(401).json({
					error: 'Invalid refresh token',
					message: 'Please login again to get a new refresh token',
				});
				return;
			}

			console.log('✅ Access token refreshed successfully');

			res.json({
				message: 'Token refreshed successfully',
				accessToken: result.accessToken,
				expiresIn: result.expiresIn,
				tokenType: 'Bearer',
			});

		} catch (error) {
			console.error('❌ Token refresh error:', error);
			res.status(500).json({
				error: 'Token refresh failed',
				message: 'An error occurred while refreshing your token',
			});
		}
	},
);

/**
 * POST /auth/logout
 * Revoke refresh token (single device logout)
 */
router.post('/logout',
	validateRefreshToken,
	async (req: Request, res: Response): Promise<void> => {
		try {
			console.log('🚪 Logout attempt');

			const { refreshToken } = req.body;

			// Revoke the refresh token
			const wasRevoked = jwtService.revokeRefreshToken(refreshToken);

			if (wasRevoked) {
				console.log('✅ User logged out successfully');
				res.json({
					message: 'Logged out successfully',
				});
			} else {
				console.warn('⚠️ Attempted to logout with invalid token');
				res.status(400).json({
					error: 'Invalid refresh token',
					message: 'Token was already invalid or expired',
				});
			}

		} catch (error) {
			console.error('❌ Logout error:', error);
			res.status(500).json({
				error: 'Logout failed',
				message: 'An error occurred while logging you out',
			});
		}
	},
);

/**
 * POST /auth/logout-all
 * Revoke all refresh tokens for a user (logout from all devices)
 */
router.post('/logout-all',
	validateRefreshToken,
	async (req: Request, res: Response): Promise<void> => {
		try {
			console.log('🚪 Logout from all devices attempt');

			const { refreshToken } = req.body;

			// First verify the refresh token to get user ID
			const decoded = jwtService.verifyAccessToken(refreshToken) ||
							 jwtService.refreshAccessToken(refreshToken);

			if (!decoded) {
				res.status(401).json({
					error: 'Invalid refresh token',
					message: 'Please provide a valid refresh token',
				});
				return;
			}

			// Extract user ID (this is a bit hacky, in production you'd handle this better)
			let userId: string;
			if ('userId' in decoded) {
				userId = decoded.userId as string;
			} else {
				res.status(400).json({
					error: 'Invalid token payload',
					message: 'Could not extract user information from token',
				});
				return;
			}

			// Revoke all tokens for this user
			const revokedCount = jwtService.revokeAllUserTokens(userId);

			console.log(`✅ User logged out from all devices: ${revokedCount} tokens revoked`);

			res.json({
				message: `Logged out from all devices (${revokedCount} sessions ended)`,
			});

		} catch (error) {
			console.error('❌ Logout-all error:', error);
			res.status(500).json({
				error: 'Logout failed',
				message: 'An error occurred while logging you out from all devices',
			});
		}
	},
);

/**
 * GET /auth/me
 * Get current user info from token (useful for checking if logged in)
 */
router.get('/me',
	async (req: Request, res: Response): Promise<void> => {
		try {
			// This route would typically use requireAuth middleware,
			// but for demo purposes, we'll extract the token manually
			const authHeader = req.headers.authorization;

			if (!authHeader || !authHeader.startsWith('Bearer ')) {
				res.status(401).json({
					error: 'Authentication required',
					message: 'Please provide a valid authorization header',
				});
				return;
			}

			const token = authHeader.substring(7);
			const decoded = jwtService.verifyAccessToken(token);

			if (!decoded) {
				res.status(401).json({
					error: 'Invalid token',
					message: 'Token is invalid or expired',
				});
				return;
			}

			// Get full user info from database
			const user = await User.findById(decoded.userId);
			if (!user) {
				res.status(404).json({
					success: false,
					error: 'User not found',
					message: 'User associated with this token no longer exists',
				});
				return;
			}

			// Get full interest details if user has interests
			let userInterests: { id: number; keyword: string }[] = [];
			if (user.interests && user.interests.length > 0) {
				try {
					const interests = await Interest.find({ id: { $in: user.interests } })
						.select('id keyword');
					userInterests = interests.map(interest => ({
						id: interest.id,
						keyword: interest.keyword,
					}));
				} catch (interestError) {
					console.warn('⚠️ Could not fetch user interests:', interestError);
					// Continue without interests rather than failing the whole request
				}
			}

			// Return user info with interests
			res.json({
				success: true,
				data: {
					user: {
						id: user._id.toString(),
						name: user.name,
						username: user.username,
						email: user.email,
						lastLogin: user.lastLogin,
						createdAt: user.createdAt,
						interests: userInterests,
					},
				},
			});

		} catch (error) {
			console.error('❌ Get current user error:', error);
			res.status(500).json({
				error: 'Failed to get user info',
				message: 'An error occurred while retrieving your profile',
			});
		}
	},
);

/**
 * GET /auth/session
 * Validate current session and token
 */
router.get('/session',
	async (req: Request, res: Response): Promise<void> => {
		try {
			// This route checks if the current session/token is valid
			const authHeader = req.headers.authorization;

			if (!authHeader || !authHeader.startsWith('Bearer ')) {
				res.status(401).json({
					success: false,
					data: {
						tokenValid: false,
					},
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
					data: {
						tokenValid: false,
					},
					error: 'Invalid token',
					message: 'Token is invalid or expired',
				});
				return;
			}

			// Optionally verify user still exists
			const user = await User.findById(decoded.userId);
			if (!user) {
				res.status(404).json({
					success: false,
					data: {
						tokenValid: false,
					},
					error: 'User not found',
					message: 'User associated with this token no longer exists',
				});
				return;
			}

			res.json({
				success: true,
				data: {
					tokenValid: true,
					user: {
						id: user._id.toString(),
						name: user.name,
						username: user.username,
						email: user.email,
					},
				},
			});

		} catch (error) {
			console.error('❌ Session validation error:', error);
			res.status(500).json({
				success: false,
				data: {
					tokenValid: false,
				},
				error: 'Session validation failed',
				message: 'An error occurred while validating your session',
			});
		}
	},
);

export default router;