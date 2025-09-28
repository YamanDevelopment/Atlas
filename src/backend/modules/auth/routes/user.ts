import type { Request, Response } from 'express';
import { Router } from 'express';
import { User } from '../../database/schemas/User';
import { requireAuth, requireOwnership } from '../middleware/auth';
import {
	validateUpdateProfile,
	validateChangePassword,
	validateGetUserById,
	validatePagination,
} from '../middleware/validation';
import { rateLimiters } from '../middleware/rateLimiting';
import { passwordService } from '../services/password';

const router = Router();

/**
 * User Profile Management Routes
 *
 * How it works:
 * - GET /users/:userId: Get user profile by ID
 * - PUT /users/:userId: Update user profile
 * - PUT /users/:userId/password: Change password
 * - GET /users: Search/list users (with pagination)
 * - DELETE /users/:userId: Delete user account
 *
 * All routes require authentication, profile routes require ownership
 */

/**
 * GET /users/:userId
 * Get user profile by ID
 */
router.get('/:userId',
	rateLimiters.api,
	requireAuth,
	validateGetUserById,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { userId } = req.params;
			console.log(`👤 Getting user profile for ID: ${userId}`);

			const user = await User.findById(userId)
				.populate('interests')
				.select('-password'); // Don't return password

			if (!user) {
				res.status(404).json({
					error: 'User not found',
					message: 'No user found with the specified ID',
				});
				return;
			}

			// Check if requesting own profile or public info
			const isOwnProfile = req.user?.userId === userId;

			// Return different info based on ownership
			const userInfo = {
				id: user._id.toString(),
				name: user.name,
				username: user.username,
				createdAt: user.createdAt,
				interests: user.interests,
				...(isOwnProfile && {
					email: user.email,
					lastLogin: user.lastLogin,
					updatedAt: user.updatedAt,
				}),
			};

			console.log(`✅ User profile retrieved: ${user.username}`);

			res.json({
				user: userInfo,
				isOwnProfile,
			});

		} catch (error) {
			console.error('❌ Get user profile error:', error);
			res.status(500).json({
				error: 'Failed to get user profile',
				message: 'An error occurred while retrieving the user profile',
			});
		}
	},
);

/**
 * PUT /users/:userId
 * Update user profile (requires ownership)
 */
router.put('/:userId',
	rateLimiters.api,
	requireAuth,
	requireOwnership(),
	validateUpdateProfile,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { userId } = req.params;
			const { name, email } = req.body;

			console.log(`✏️ Updating profile for user ID: ${userId}`);

			// Check if email is being changed and if it already exists
			if (email) {
				const existingUser = await User.findOne({
					email,
					_id: { $ne: userId },
				});

				if (existingUser) {
					res.status(400).json({
						error: 'Email already exists',
						message: 'Another user is already using this email address',
					});
					return;
				}
			}

			// Update user
			const updateData: any = {};
			if (name) updateData.name = name;
			if (email) updateData.email = email;

			const user = await User.findByIdAndUpdate(
				userId,
				updateData,
				{ new: true, runValidators: true },
			).select('-password');

			if (!user) {
				res.status(404).json({
					error: 'User not found',
					message: 'No user found with the specified ID',
				});
				return;
			}

			console.log(`✅ Profile updated successfully: ${user.username}`);

			res.json({
				message: 'Profile updated successfully',
				user: {
					id: user._id.toString(),
					name: user.name,
					username: user.username,
					email: user.email,
					updatedAt: user.updatedAt,
				},
			});

		} catch (error) {
			console.error('❌ Update profile error:', error);
			res.status(500).json({
				error: 'Failed to update profile',
				message: 'An error occurred while updating your profile',
			});
		}
	},
);

/**
 * PUT /users/:userId/password
 * Change user password (requires ownership)
 */
router.put('/:userId/password',
	rateLimiters.auth, // Use strict rate limiting for password changes
	requireAuth,
	requireOwnership(),
	validateChangePassword,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { userId } = req.params;
			const { currentPassword, newPassword } = req.body;

			console.log(`🔐 Password change attempt for user ID: ${userId}`);

			// Get user with password
			const user = await User.findById(userId);
			if (!user) {
				res.status(404).json({
					error: 'User not found',
					message: 'No user found with the specified ID',
				});
				return;
			}

			// Verify current password
			const isCurrentPasswordValid = await user.comparePassword(currentPassword);
			if (!isCurrentPasswordValid) {
				console.warn(`🚫 Invalid current password for user: ${user.username}`);
				res.status(400).json({
					error: 'Invalid current password',
					message: 'The current password you provided is incorrect',
				});
				return;
			}

			// Validate new password
			const passwordValidation = passwordService.validatePassword(newPassword);
			if (!passwordValidation.isValid) {
				res.status(400).json({
					error: 'Password validation failed',
					message: 'New password does not meet requirements',
					details: passwordValidation.errors,
				});
				return;
			}

			// Update password (will be hashed by pre-save middleware)
			user.password = newPassword;
			await user.save();

			console.log(`✅ Password changed successfully for user: ${user.username}`);

			res.json({
				message: 'Password changed successfully',
			});

		} catch (error) {
			console.error('❌ Change password error:', error);
			res.status(500).json({
				error: 'Failed to change password',
				message: 'An error occurred while changing your password',
			});
		}
	},
);

/**
 * GET /users
 * Search and list users (with pagination)
 */
router.get('/',
	rateLimiters.search,
	requireAuth,
	validatePagination,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const {
				page = 1,
				limit = 10,
				search = '',
				sortBy = 'createdAt',
				sortOrder = 'desc',
			} = req.query as any;

			console.log(`🔍 User search: "${search}", page ${page}, limit ${limit}`);

			// Build search query
			const query: any = {};
			if (search) {
				query.$or = [
					{ name: { $regex: search, $options: 'i' } },
					{ username: { $regex: search, $options: 'i' } },
				];
			}

			// Build sort object
			const sort: any = {};
			sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

			// Execute query with pagination
			const skip = (page - 1) * limit;
			const [users, total] = await Promise.all([
				User.find(query)
					.select('name username createdAt lastLogin')
					.sort(sort)
					.skip(skip)
					.limit(limit)
					.lean(),
				User.countDocuments(query),
			]);

			const totalPages = Math.ceil(total / limit);
			const hasNextPage = page < totalPages;
			const hasPrevPage = page > 1;

			console.log(`✅ Found ${users.length} users (${total} total)`);

			res.json({
				users: users.map(user => ({
					id: user._id.toString(),
					name: user.name,
					username: user.username,
					createdAt: user.createdAt,
					lastLogin: user.lastLogin,
				})),
				pagination: {
					page,
					limit,
					total,
					totalPages,
					hasNextPage,
					hasPrevPage,
				},
				search: search || null,
			});

		} catch (error) {
			console.error('❌ Search users error:', error);
			res.status(500).json({
				error: 'Failed to search users',
				message: 'An error occurred while searching for users',
			});
		}
	},
);

/**
 * DELETE /users/:userId
 * Delete user account (requires ownership)
 */
router.delete('/:userId',
	rateLimiters.api,
	requireAuth,
	requireOwnership(),
	validateGetUserById,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { userId } = req.params;
			console.log(`🗑️ Deleting user account: ${userId}`);

			const user = await User.findByIdAndDelete(userId);
			if (!user) {
				res.status(404).json({
					error: 'User not found',
					message: 'No user found with the specified ID',
				});
				return;
			}

			// TODO: In production, you might want to:
			// 1. Soft delete instead of hard delete
			// 2. Clean up related data (user interests, etc.)
			// 3. Send confirmation email
			// 4. Revoke all JWT tokens for this user

			console.log(`✅ User account deleted: ${user.username}`);

			res.json({
				message: 'User account deleted successfully',
				deletedUser: {
					id: user._id.toString(),
					username: user.username,
					deletedAt: new Date(),
				},
			});

		} catch (error) {
			console.error('❌ Delete user error:', error);
			res.status(500).json({
				error: 'Failed to delete user',
				message: 'An error occurred while deleting the user account',
			});
		}
	},
);

/**
 * POST /users/:userId/interests
 * Add interest to user (requires ownership)
 */
router.post('/:userId/interests',
	rateLimiters.api,
	requireAuth,
	requireOwnership(),
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { userId } = req.params;
			const { interestId } = req.body;

			console.log(`📚 Adding interest ${interestId} to user ${userId}`);

			if (!interestId || typeof interestId !== 'number') {
				res.status(400).json({
					error: 'Invalid interest ID',
					message: 'Interest ID must be a number',
				});
				return;
			}

			const user = await User.findById(userId);
			if (!user) {
				res.status(404).json({
					error: 'User not found',
					message: 'No user found with the specified ID',
				});
				return;
			}

			// Use the User model's addInterest method
			await user.addInterest(interestId);

			console.log(`✅ Interest added to user: ${user.username}`);

			res.json({
				message: 'Interest added successfully',
				interests: user.interests,
			});

		} catch (error) {
			console.error('❌ Add interest error:', error);
			res.status(500).json({
				error: 'Failed to add interest',
				message: 'An error occurred while adding the interest',
			});
		}
	},
);

/**
 * DELETE /users/:userId/interests/:interestId
 * Remove interest from user (requires ownership)
 */
router.delete('/:userId/interests/:interestId',
	rateLimiters.api,
	requireAuth,
	requireOwnership(),
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { userId, interestId } = req.params;
			const interestIdNum = parseInt(interestId, 10);

			console.log(`🗑️ Removing interest ${interestId} from user ${userId}`);

			if (isNaN(interestIdNum)) {
				res.status(400).json({
					error: 'Invalid interest ID',
					message: 'Interest ID must be a valid number',
				});
				return;
			}

			const user = await User.findById(userId);
			if (!user) {
				res.status(404).json({
					error: 'User not found',
					message: 'No user found with the specified ID',
				});
				return;
			}

			// Use the User model's removeInterest method
			await user.removeInterest(interestIdNum);

			console.log(`✅ Interest removed from user: ${user.username}`);

			res.json({
				message: 'Interest removed successfully',
				interests: user.interests,
			});

		} catch (error) {
			console.error('❌ Remove interest error:', error);
			res.status(500).json({
				error: 'Failed to remove interest',
				message: 'An error occurred while removing the interest',
			});
		}
	},
);

export default router;