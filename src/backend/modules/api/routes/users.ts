import type { Request, Response } from 'express';
import { Router } from 'express';
import { requireAuth } from '../../auth/middleware/auth';
import { User } from '../../database/schemas/User';
import type Handler from '../../database/services/handler';

const router = Router();

// Handler instance
let handler: Handler;

export function setHandler(handlerInstance: Handler) {
	handler = handlerInstance;
}

/**
 * Users API Routes
 * GET /api/users/:id - Get user by ID (protected)
 * PUT /api/users/profile - Update own profile (protected)
 * PUT /api/users/password - Change password (protected)
 * PUT /api/users/interests - Update interests (protected)
 * POST /api/users - Create new user
 * DELETE /api/users/profile - Delete own account (protected)
 * Note: Most user operations are handled through auth routes
 */

/**
 * GET /api/users/:id (Protected route)
 */
router.get('/:id',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { id } = req.params;

			const user = await handler.getUserById(id);

			if (!user) {
				res.status(404).json({
					success: false,
					error: 'User not found',
					message: 'No user found with the provided ID',
				});
				return;
			}

			// Remove sensitive data before sending
			const userResponse = {
				id: user.id,
				name: user.name,
				username: user.username,
				email: user.email,
				interests: user.interests,
				createdAt: user.createdAt,
				lastLogin: user.lastLogin,
			};

			res.json({
				success: true,
				data: {
					user: userResponse,
				},
			});

		} catch (error) {
			console.error('❌ Get user by ID error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to fetch user',
				message: 'An error occurred while retrieving the user',
			});
		}
	},
);

/**
 * PUT /api/users/profile
 * Update user profile information
 */
router.put('/profile',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const userId = (req as any).user?.userId;
			const { name, email } = req.body;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: 'Authentication required',
					message: 'User not authenticated',
				});
				return;
			}

			// Find user by the MongoDB ObjectId from JWT token
			const user = await User.findById(userId);
			if (!user) {
				res.status(404).json({
					success: false,
					error: 'User not found',
					message: 'No user found with the provided ID',
				});
				return;
			}

			// Update allowed fields
			if (name) user.name = name;
			if (email) {
				// Check if email is already taken by another user
				const existingUser = await User.findOne({
					email: email.toLowerCase(),
					_id: { $ne: userId },
				});

				if (existingUser) {
					res.status(400).json({
						success: false,
						error: 'Email already in use',
						message: 'This email is already associated with another account',
					});
					return;
				}

				user.email = email.toLowerCase();
			}

			user.updatedAt = new Date();
			await user.save();

			res.json({
				success: true,
				message: 'Profile updated successfully',
				data: {
					user: {
						id: user.id,
						name: user.name,
						username: user.username,
						email: user.email,
						role: user.role,
						interests: user.interests,
						updatedAt: user.updatedAt,
					},
				},
			});

		} catch (error) {
			console.error('❌ Update profile error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to update profile',
				message: 'An error occurred while updating the profile',
			});
		}
	},
);

/**
 * PUT /api/users/interests
 * Update user interests
 */
router.put('/interests',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const userId = (req as any).user?.userId;
			const { interests } = req.body;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: 'Authentication required',
					message: 'User not authenticated',
				});
				return;
			}

			if (!Array.isArray(interests)) {
				res.status(400).json({
					success: false,
					error: 'Invalid interests format',
					message: 'Interests must be an array of interest IDs',
				});
				return;
			}

			// Find and update user
			const user = await User.findById(userId);
			if (!user) {
				res.status(404).json({
					success: false,
					error: 'User not found',
					message: 'No user found with the provided ID',
				});
				return;
			}

			user.interests = interests;
			user.updatedAt = new Date();
			await user.save();

			res.json({
				success: true,
				message: 'Interests updated successfully',
				data: {
					user: {
						id: user.id,
						name: user.name,
						username: user.username,
						email: user.email,
						role: user.role,
						interests: user.interests,
						updatedAt: user.updatedAt,
					},
				},
			});

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

/**
 * PUT /api/users/password
 * Change user password
 */
router.put('/password',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const userId = (req as any).user?.userId;
			const { currentPassword, newPassword } = req.body;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: 'Authentication required',
					message: 'User not authenticated',
				});
				return;
			}

			if (!currentPassword || !newPassword) {
				res.status(400).json({
					success: false,
					error: 'Missing required fields',
					message: 'Current password and new password are required',
				});
				return;
			}

			if (newPassword.length < 6) {
				res.status(400).json({
					success: false,
					error: 'Invalid password',
					message: 'New password must be at least 6 characters long',
				});
				return;
			}

			// Find user and include password for verification
			const user = await User.findById(userId).select('+password');
			if (!user) {
				res.status(404).json({
					success: false,
					error: 'User not found',
					message: 'No user found with the provided ID',
				});
				return;
			}

			// Verify current password
			const isCurrentPasswordValid = await user.comparePassword(currentPassword);
			if (!isCurrentPasswordValid) {
				res.status(400).json({
					success: false,
					error: 'Invalid current password',
					message: 'The current password you entered is incorrect',
				});
				return;
			}

			// Update password (will be hashed by pre-save middleware)
			user.password = newPassword;
			user.updatedAt = new Date();
			await user.save();

			res.json({
				success: true,
				message: 'Password updated successfully',
			});

		} catch (error) {
			console.error('❌ Update password error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to update password',
				message: 'An error occurred while updating the password',
			});
		}
	},
);

/**
 * DELETE /api/users/profile
 * Delete user account (with confirmation)
 */
router.delete('/profile',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const userId = (req as any).user?.userId;
			const { confirmPassword } = req.body;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: 'Authentication required',
					message: 'User not authenticated',
				});
				return;
			}

			if (!confirmPassword) {
				res.status(400).json({
					success: false,
					error: 'Password confirmation required',
					message: 'Please provide your password to confirm account deletion',
				});
				return;
			}

			// Find user and verify password
			const user = await User.findById(userId).select('+password');
			if (!user) {
				res.status(404).json({
					success: false,
					error: 'User not found',
					message: 'No user found with the provided ID',
				});
				return;
			}

			const isPasswordValid = await user.comparePassword(confirmPassword);
			if (!isPasswordValid) {
				res.status(400).json({
					success: false,
					error: 'Invalid password',
					message: 'Password confirmation failed',
				});
				return;
			}

			// Delete user account
			await User.findByIdAndDelete(userId);

			res.json({
				success: true,
				message: 'Account deleted successfully',
			});

		} catch (error) {
			console.error('❌ Delete account error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to delete account',
				message: 'An error occurred while deleting the account',
			});
		}
	},
);

/**
 * POST /api/users
 * Note: This is typically handled by auth/register, but provided for completeness
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
	try {
		const userData = req.body;

		// Validate required fields
		if (!userData.name || !userData.username || !userData.email) {
			res.status(400).json({
				success: false,
				error: 'Missing required fields',
				message: 'Name, username, and email are required',
			});
			return;
		}

		// Create the user
		const newUser = await handler.createUser(userData);

		// Remove sensitive data before sending
		const userResponse = {
			id: newUser.id,
			name: newUser.name,
			username: newUser.username,
			email: newUser.email,
			interests: newUser.interests,
			createdAt: newUser.createdAt,
		};

		res.status(201).json({
			success: true,
			message: 'User created successfully',
			data: {
				user: userResponse,
			},
		});

	} catch (error) {
		console.error('❌ Create user error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to create user',
			message: 'An error occurred while creating the user',
		});
	}
});

export default router;