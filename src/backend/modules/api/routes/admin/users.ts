import type { Request, Response } from 'express';
import { Router } from 'express';
import { requireAdmin } from './middleware';
import type Handler from '../../../database/services/handler';
import { User } from '../../../database/schemas/User';

const router = Router();

// Handler instance
let handler: Handler;

export function setHandler(handlerInstance: Handler) {
	handler = handlerInstance;
}

/**
 * Admin User Management API Routes
 * GET /api/admin/users - List all users with pagination and filtering
 * GET /api/admin/users/:id - Get user details
 * PUT /api/admin/users/:id - Update user details
 * PUT /api/admin/users/:id/role - Update user role
 * DELETE /api/admin/users/:id - Deactivate user
 * POST /api/admin/users/:id/activate - Reactivate user
 * GET /api/admin/users/:id/activity - Get user activity history
 */

/**
 * GET /api/admin/users
 * List all users with pagination, search, and role filtering
 */
router.get('/',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const {
				page = '1',
				limit = '20',
				search = '',
				role = '',
				sortBy = 'createdAt',
				sortOrder = 'desc',
				status = 'all',
			} = req.query;

			const pageNum = parseInt(page as string);
			const limitNum = parseInt(limit as string);
			const skip = (pageNum - 1) * limitNum;

			// Build query
			const query: any = {};

			// Search filter
			if (search) {
				query.$or = [
					{ name: { $regex: search, $options: 'i' } },
					{ username: { $regex: search, $options: 'i' } },
					{ email: { $regex: search, $options: 'i' } },
				];
			}

			// Role filter
			if (role && role !== 'all') {
				query.role = role;
			}

			// Status filter (for future use with user deactivation)
			// if (status !== 'all') {
			//   query.isActive = status === 'active';
			// }

			// Get users with pagination
			const users = await User.find(query)
				.select('-password') // Exclude password field
				.sort({ [sortBy as string]: sortOrder === 'desc' ? -1 : 1 })
				.limit(limitNum)
				.skip(skip)
				.populate('interests');

			// Get total count for pagination
			const total = await User.countDocuments(query);

			res.json({
				success: true,
				data: {
					users: users.map(user => ({
						id: user._id,
						userId: user.id,
						name: user.name,
						username: user.username,
						email: user.email,
						role: user.role,
						lastLogin: user.lastLogin,
						createdAt: user.createdAt,
						updatedAt: user.updatedAt,
						interests: user.interests,
						interestCount: user.interests.length,
					})),
					pagination: {
						page: pageNum,
						limit: limitNum,
						total,
						pages: Math.ceil(total / limitNum),
						hasNext: pageNum < Math.ceil(total / limitNum),
						hasPrev: pageNum > 1,
					},
					filters: {
						search,
						role,
						status,
						sortBy,
						sortOrder,
					},
				},
			});

		} catch (error) {
			console.error('❌ Get users error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to fetch users',
				message: 'An error occurred while fetching users',
			});
		}
	},
);

/**
 * GET /api/admin/users/:id
 * Get detailed user information
 */
router.get('/:id',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { id } = req.params;

			const user = await User.findById(id)
				.select('-password')
				.populate('interests');

			if (!user) {
				res.status(404).json({
					success: false,
					error: 'User not found',
					message: 'No user found with the provided ID',
				});
				return;
			}

			// Get additional statistics
			const userStats = {
				eventCount: 0, // Would query events created by user
				organizationCount: 0, // Would query organizations created by user
				labCount: 0, // Would query labs associated with user
				recommendationsReceived: 0, // Would track recommendations
			};

			res.json({
				success: true,
				data: {
					user: {
						id: user._id,
						userId: user.id,
						name: user.name,
						username: user.username,
						email: user.email,
						role: user.role,
						lastLogin: user.lastLogin,
						createdAt: user.createdAt,
						updatedAt: user.updatedAt,
						interests: user.interests,
					},
					stats: userStats,
				},
			});

		} catch (error) {
			console.error('❌ Get user details error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to fetch user details',
				message: 'An error occurred while fetching user details',
			});
		}
	},
);

/**
 * PUT /api/admin/users/:id
 * Update user information (admin only)
 */
router.put('/:id',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { id } = req.params;
			const updateData = req.body;

			// Prevent updating sensitive fields directly
			delete updateData.password;
			delete updateData.role; // Use separate endpoint for role changes
			delete updateData._id;
			delete updateData.id;

			updateData.updatedAt = new Date();

			const user = await User.findByIdAndUpdate(
				id,
				updateData,
				{ new: true, runValidators: true },
			).select('-password');

			if (!user) {
				res.status(404).json({
					success: false,
					error: 'User not found',
					message: 'No user found with the provided ID',
				});
				return;
			}

			res.json({
				success: true,
				message: 'User updated successfully',
				data: {
					user: {
						id: user._id,
						userId: user.id,
						name: user.name,
						username: user.username,
						email: user.email,
						role: user.role,
						lastLogin: user.lastLogin,
						createdAt: user.createdAt,
						updatedAt: user.updatedAt,
						interests: user.interests,
					},
				},
			});

		} catch (error) {
			console.error('❌ Update user error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to update user',
				message: 'An error occurred while updating the user',
			});
		}
	},
);

/**
 * PUT /api/admin/users/:id/role
 * Update user role (super admin only)
 */
router.put('/:id/role',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { id } = req.params;
			const { role } = req.body;

			// Validate role
			const validRoles = ['user', 'admin', 'moderator'];
			if (!validRoles.includes(role)) {
				res.status(400).json({
					success: false,
					error: 'Invalid role',
					message: `Role must be one of: ${validRoles.join(', ')}`,
				});
				return;
			}

			const user = await User.findByIdAndUpdate(
				id,
				{ role, updatedAt: new Date() },
				{ new: true, runValidators: true },
			).select('-password');

			if (!user) {
				res.status(404).json({
					success: false,
					error: 'User not found',
					message: 'No user found with the provided ID',
				});
				return;
			}

			res.json({
				success: true,
				message: `User role updated to ${role}`,
				data: {
					user: {
						id: user._id,
						userId: user.id,
						name: user.name,
						username: user.username,
						email: user.email,
						role: user.role,
						updatedAt: user.updatedAt,
					},
				},
			});

		} catch (error) {
			console.error('❌ Update user role error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to update user role',
				message: 'An error occurred while updating the user role',
			});
		}
	},
);

/**
 * GET /api/admin/users/:id/activity
 * Get user activity history and statistics
 */
router.get('/:id/activity',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { id } = req.params;
			const { days = '30' } = req.query;

			const user = await User.findById(id).select('username email');

			if (!user) {
				res.status(404).json({
					success: false,
					error: 'User not found',
					message: 'No user found with the provided ID',
				});
				return;
			}

			const daysNum = parseInt(days as string);
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - daysNum);

			// In a full implementation, you'd have activity tracking
			// For now, providing structure for activity data
			const activity = {
				summary: {
					totalLogins: 0, // Would track from auth logs
					eventsCreated: 0, // Would query events table
					organizationsCreated: 0, // Would query organizations table
					recommendationsViewed: 0, // Would track from recommendations
					lastActive: user.lastLogin,
				},
				timeline: [
					// Would contain actual activity entries
					// {
					//   type: 'login',
					//   timestamp: new Date(),
					//   details: 'User logged in from IP 192.168.1.1'
					// }
				],
				analytics: {
					loginPattern: {
						hourly: [], // Login frequency by hour
						daily: [], // Login frequency by day
						weekly: [], // Login frequency by week
					},
					engagement: {
						eventsViewed: 0,
						searchQueries: 0,
						recommendationsAccepted: 0,
					},
				},
			};

			res.json({
				success: true,
				data: {
					user: {
						username: user.username,
						email: user.email,
					},
					period: {
						days: daysNum,
						startDate: startDate.toISOString(),
						endDate: new Date().toISOString(),
					},
					activity,
				},
			});

		} catch (error) {
			console.error('❌ Get user activity error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to fetch user activity',
				message: 'An error occurred while fetching user activity',
			});
		}
	},
);

/**
 * GET /api/admin/users/stats/summary
 * Get overall user statistics summary
 */
router.get('/stats/summary',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const totalUsers = await User.countDocuments();
			const adminUsers = await User.countDocuments({ role: 'admin' });
			const moderatorUsers = await User.countDocuments({ role: 'moderator' });
			const regularUsers = await User.countDocuments({ role: 'user' });

			// Recent registrations (last 30 days)
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
			const recentRegistrations = await User.countDocuments({
				createdAt: { $gte: thirtyDaysAgo },
			});

			// Active users (logged in within last 30 days)
			const activeUsers = await User.countDocuments({
				lastLogin: { $gte: thirtyDaysAgo },
			});

			const stats = {
				total: {
					users: totalUsers,
					admins: adminUsers,
					moderators: moderatorUsers,
					regular: regularUsers,
				},
				recent: {
					registrations: recentRegistrations,
					active: activeUsers,
				},
				growth: {
					daily: 0, // Would track daily registration growth
					weekly: 0, // Would track weekly registration growth
					monthly: recentRegistrations,
				},
				engagement: {
					averageInterests: 0, // Would calculate average interests per user
					activeRate: Math.round((activeUsers / totalUsers) * 100),
				},
			};

			res.json({
				success: true,
				data: {
					stats,
					generatedAt: new Date().toISOString(),
				},
			});

		} catch (error) {
			console.error('❌ Get user stats summary error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to fetch user statistics',
				message: 'An error occurred while fetching user statistics',
			});
		}
	},
);

export default router;