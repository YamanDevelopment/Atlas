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
 * Tags API Routes
 * GET /api/tags - Get all tags
 * GET /api/tags/:id - Get tag by ID
 * POST /api/tags - Create new tag (requires auth)
 * GET /api/tags/primary - Get primary tags
 * GET /api/tags/secondary - Get secondary tags
 * GET /api/tags/by-name/:name - Get tag by name
 */

/**
 * GET /api/tags/primary
 */
router.get('/primary', async (req: Request, res: Response): Promise<void> => {
	try {
		const primaryTags = await handler.getPrimaryTags();

		res.json({
			success: true,
			data: {
				tags: primaryTags,
				count: primaryTags.length,
				category: 'primary',
			},
		});

	} catch (error) {
		console.error('❌ Get primary tags error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch primary tags',
			message: 'An error occurred while retrieving primary tags',
		});
	}
});

/**
 * GET /api/tags/secondary
 */
router.get('/secondary', async (req: Request, res: Response): Promise<void> => {
	try {
		const { parentTagId } = req.query;

		const secondaryTags = await handler.getSecondaryTags(
			parentTagId ? parentTagId as string : undefined,
		);

		res.json({
			success: true,
			data: {
				tags: secondaryTags,
				count: secondaryTags.length,
				category: 'secondary',
				parentTagId: parentTagId || null,
			},
		});

	} catch (error) {
		console.error('❌ Get secondary tags error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch secondary tags',
			message: 'An error occurred while retrieving secondary tags',
		});
	}
});

/**
 * GET /api/tags/by-name/:name
 */
router.get('/by-name/:name', async (req: Request, res: Response): Promise<void> => {
	try {
		const { name } = req.params;

		const tag = await handler.getTagByName(name);

		if (!tag) {
			res.status(404).json({
				success: false,
				error: 'Tag not found',
				message: 'No tag found with the provided name',
			});
			return;
		}

		res.json({
			success: true,
			data: {
				tag,
			},
		});

	} catch (error) {
		console.error('❌ Get tag by name error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch tag by name',
			message: 'An error occurred while retrieving the tag',
		});
	}
});

/**
 * GET /api/tags/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
	try {
		const { id } = req.params;

		const tag = await handler.getTagById(id);

		if (!tag) {
			res.status(404).json({
				success: false,
				error: 'Tag not found',
				message: 'No tag found with the provided ID',
			});
			return;
		}

		res.json({
			success: true,
			data: {
				tag,
			},
		});

	} catch (error) {
		console.error('❌ Get tag by ID error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch tag',
			message: 'An error occurred while retrieving the tag',
		});
	}
});

/**
 * POST /api/tags (Protected route - requires authentication)
 */
router.post('/',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const tagData = req.body;

			// Validate required fields
			if (!tagData.name || !tagData.category) {
				res.status(400).json({
					success: false,
					error: 'Missing required fields',
					message: 'Name and category are required',
				});
				return;
			}

			// Create the tag
			const newTag = await handler.createTag(tagData);

			res.status(201).json({
				success: true,
				message: 'Tag created successfully',
				data: {
					tag: newTag,
				},
			});

		} catch (error) {
			console.error('❌ Create tag error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to create tag',
				message: 'An error occurred while creating the tag',
			});
		}
	},
);

export default router;