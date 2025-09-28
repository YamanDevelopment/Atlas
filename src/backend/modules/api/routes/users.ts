import type { Request, Response } from 'express';
import { Router } from 'express';
import { requireAuth } from '../../auth/middleware/auth';
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
 * POST /api/users - Create new user
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