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
 * Labs API Routes
 * GET /api/labs - Get all labs with optional filters
 * GET /api/labs/:id - Get lab by ID
 * POST /api/labs - Create new lab (requires auth)
 * GET /api/labs/search - Search labs
 * GET /api/labs/by-research-area - Get labs by research area
 */

/**
 * GET /api/labs
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
	try {
		const { limit = '20', skip = '0', sortBy = 'name', sortOrder = 'asc' } = req.query;

		const labs = await handler.searchLabs('', {
			limit: parseInt(limit as string),
			skip: parseInt(skip as string),
			sortBy: sortBy as string,
			sortOrder: sortOrder as 'asc' | 'desc',
		});

		res.json({
			success: true,
			data: {
				labs,
				count: labs.length,
				pagination: {
					limit: parseInt(limit as string),
					skip: parseInt(skip as string),
				},
			},
		});

	} catch (error) {
		console.error('❌ Get labs error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch labs',
			message: 'An error occurred while retrieving labs',
		});
	}
});

/**
 * GET /api/labs/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
	try {
		const { id } = req.params;

		const lab = await handler.getLabById(id);

		if (!lab) {
			res.status(404).json({
				success: false,
				error: 'Lab not found',
				message: 'No lab found with the provided ID',
			});
			return;
		}

		res.json({
			success: true,
			data: {
				lab,
			},
		});

	} catch (error) {
		console.error('❌ Get lab by ID error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch lab',
			message: 'An error occurred while retrieving the lab',
		});
	}
});

/**
 * GET /api/labs/search
 */
router.get('/search', async (req: Request, res: Response): Promise<void> => {
	try {
		const {
			q = '',
			limit = '20',
			skip = '0',
			sortBy = 'name',
			sortOrder = 'asc',
		} = req.query;

		if (!q || typeof q !== 'string') {
			res.status(400).json({
				success: false,
				error: 'Invalid search query',
				message: 'Please provide a valid search query (q parameter)',
			});
			return;
		}

		const labs = await handler.searchLabs(q as string, {
			limit: parseInt(limit as string),
			skip: parseInt(skip as string),
			sortBy: sortBy as string,
			sortOrder: sortOrder as 'asc' | 'desc',
		});

		res.json({
			success: true,
			data: {
				labs,
				count: labs.length,
				query: q,
				pagination: {
					limit: parseInt(limit as string),
					skip: parseInt(skip as string),
				},
			},
		});

	} catch (error) {
		console.error('❌ Search labs error:', error);
		res.status(500).json({
			success: false,
			error: 'Search failed',
			message: 'An error occurred while searching labs',
		});
	}
});

/**
 * GET /api/labs/by-research-area
 */
router.get('/by-research-area', async (req: Request, res: Response): Promise<void> => {
	try {
		const { researchArea, limit = '20', skip = '0' } = req.query;

		if (!researchArea) {
			res.status(400).json({
				success: false,
				error: 'Research area required',
				message: 'Please provide a researchArea parameter',
			});
			return;
		}

		const labs = await handler.getLabsByResearchArea(researchArea as string);

		// Apply manual pagination since getLabsByResearchArea doesn't support it
		const skipNum = parseInt(skip as string);
		const limitNum = parseInt(limit as string);
		const paginatedLabs = labs.slice(skipNum, skipNum + limitNum);

		res.json({
			success: true,
			data: {
				labs: paginatedLabs,
				count: paginatedLabs.length,
				totalCount: labs.length,
				researchArea,
				pagination: {
					limit: limitNum,
					skip: skipNum,
				},
			},
		});

	} catch (error) {
		console.error('❌ Get labs by research area error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch labs by research area',
			message: 'An error occurred while retrieving labs by research area',
		});
	}
});

/**
 * POST /api/labs (Protected route - requires authentication)
 */
router.post('/',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const labData = req.body;

			// Validate required fields
			if (!labData.name) {
				res.status(400).json({
					success: false,
					error: 'Missing required fields',
					message: 'Name is required',
				});
				return;
			}

			// Create the lab
			const newLab = await handler.createLab(labData);

			res.status(201).json({
				success: true,
				message: 'Lab created successfully',
				data: {
					lab: newLab,
				},
			});

		} catch (error) {
			console.error('❌ Create lab error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to create lab',
				message: 'An error occurred while creating the lab',
			});
		}
	},
);

export default router;