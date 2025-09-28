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
 * Organizations API Routes
 * GET /api/organizations - Get all organizations with optional filters
 * GET /api/organizations/:id - Get organization by ID
 * POST /api/organizations - Create new organization (requires auth)
 * GET /api/organizations/search - Search organizations
 * GET /api/organizations/by-category - Get organizations by category
 */

/**
 * GET /api/organizations
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
	try {
		const { limit = '20', skip = '0', sortBy = 'name', sortOrder = 'asc' } = req.query;

		const organizations = await handler.searchOrganizations('', {
			limit: parseInt(limit as string),
			skip: parseInt(skip as string),
			sortBy: sortBy as string,
			sortOrder: sortOrder as 'asc' | 'desc',
		});		res.json({
			success: true,
			data: {
				organizations,
				count: organizations.length,
				pagination: {
					limit: parseInt(limit as string),
					skip: parseInt(skip as string),
				},
			},
		});

	} catch (error) {
		console.error('❌ Get organizations error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch organizations',
			message: 'An error occurred while retrieving organizations',
		});
	}
});

/**
 * GET /api/organizations/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
	try {
		const { id } = req.params;

		const organization = await handler.getOrganizationById(id);

		if (!organization) {
			res.status(404).json({
				success: false,
				error: 'Organization not found',
				message: 'No organization found with the provided ID',
			});
			return;
		}

		res.json({
			success: true,
			data: {
				organization,
			},
		});

	} catch (error) {
		console.error('❌ Get organization by ID error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch organization',
			message: 'An error occurred while retrieving the organization',
		});
	}
});

/**
 * GET /api/organizations/search
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

		const organizations = await handler.searchOrganizations(q as string, {
			limit: parseInt(limit as string),
			skip: parseInt(skip as string),
			sortBy: sortBy as string,
			sortOrder: sortOrder as 'asc' | 'desc',
		});

		res.json({
			success: true,
			data: {
				organizations,
				count: organizations.length,
				query: q,
				pagination: {
					limit: parseInt(limit as string),
					skip: parseInt(skip as string),
				},
			},
		});

	} catch (error) {
		console.error('❌ Search organizations error:', error);
		res.status(500).json({
			success: false,
			error: 'Search failed',
			message: 'An error occurred while searching organizations',
		});
	}
});

/**
 * GET /api/organizations/by-category
 */
router.get('/by-category', async (req: Request, res: Response): Promise<void> => {
	try {
		const { category, limit = '20', skip = '0' } = req.query;

		if (!category) {
			res.status(400).json({
				success: false,
				error: 'Category required',
				message: 'Please provide a category parameter',
			});
			return;
		}

		// Use searchOrganizations with category filter
		const organizations = await handler.searchOrganizations(category as string, {
			limit: parseInt(limit as string),
			skip: parseInt(skip as string),
		});

		res.json({
			success: true,
			data: {
				organizations,
				count: organizations.length,
				category,
				pagination: {
					limit: parseInt(limit as string),
					skip: parseInt(skip as string),
				},
			},
		});

	} catch (error) {
		console.error('❌ Get organizations by category error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch organizations by category',
			message: 'An error occurred while retrieving organizations by category',
		});
	}
});

/**
 * POST /api/organizations (Protected route - requires authentication)
 */
router.post('/',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const organizationData = req.body;

			// Validate required fields
			if (!organizationData.name) {
				res.status(400).json({
					success: false,
					error: 'Missing required fields',
					message: 'Name is required',
				});
				return;
			}

			// Create the organization
			const newOrganization = await handler.createOrganization(organizationData);

			res.status(201).json({
				success: true,
				message: 'Organization created successfully',
				data: {
					organization: newOrganization,
				},
			});

		} catch (error) {
			console.error('❌ Create organization error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to create organization',
				message: 'An error occurred while creating the organization',
			});
		}
	},
);

export default router;