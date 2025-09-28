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
 * Recommendations API Routes
 * GET /api/recommendations/events/:userId - Get event recommendations for user
 * GET /api/recommendations/organizations/:userId - Get organization recommendations for user
 * GET /api/recommendations/labs/:userId - Get lab recommendations for user
 * GET /api/recommendations/metrics - Get recommendation system metrics
 */

/**
 * GET /api/recommendations/events/:userId
 */
router.get('/events/:userId',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { userId } = req.params;
			const { limit = '10', algorithm = 'hybrid' } = req.query;

			const recommendations = await handler.getWeightedEventRecommendations(
				userId,
				parseInt(limit as string),
			);

			res.json({
				success: true,
				data: {
					recommendations,
					count: recommendations.length,
					userId,
					algorithm,
					type: 'events',
				},
			});

		} catch (error) {
			console.error('❌ Get event recommendations error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to get event recommendations',
				message: 'An error occurred while retrieving event recommendations',
			});
		}
	},
);

/**
 * GET /api/recommendations/organizations/:userId
 */
router.get('/organizations/:userId',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { userId } = req.params;
			const { limit = '10', algorithm = 'hybrid' } = req.query;

			const recommendations = await handler.getWeightedOrganizationRecommendations(
				userId,
				parseInt(limit as string),
			);

			res.json({
				success: true,
				data: {
					recommendations,
					count: recommendations.length,
					userId,
					algorithm,
					type: 'organizations',
				},
			});

		} catch (error) {
			console.error('❌ Get organization recommendations error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to get organization recommendations',
				message: 'An error occurred while retrieving organization recommendations',
			});
		}
	},
);

/**
 * GET /api/recommendations/labs/:userId
 */
router.get('/labs/:userId',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { userId } = req.params;
			const { limit = '10', algorithm = 'hybrid' } = req.query;

			const recommendations = await handler.getWeightedLabRecommendations(
				userId,
				parseInt(limit as string),
			);

			res.json({
				success: true,
				data: {
					recommendations,
					count: recommendations.length,
					userId,
					algorithm,
					type: 'labs',
				},
			});

		} catch (error) {
			console.error('❌ Get lab recommendations error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to get lab recommendations',
				message: 'An error occurred while retrieving lab recommendations',
			});
		}
	},
);

/**
 * GET /api/recommendations/metrics
 */
router.get('/metrics',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			// Get basic system stats instead of detailed metrics
			const stats = await handler.getDatabaseStats();

			res.json({
				success: true,
				data: {
					stats,
					message: 'Basic system statistics',
				},
			});

		} catch (error) {
			console.error('❌ Get recommendation metrics error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to get recommendation metrics',
				message: 'An error occurred while retrieving recommendation metrics',
			});
		}
	},
);

export default router;