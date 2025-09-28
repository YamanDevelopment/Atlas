import type { Request, Response } from 'express';
import { Router } from 'express';
import { requireAuth } from '../../auth/middleware/auth';
import type Handler from '../../database/services/handler';
import { Organization } from '../../database/schemas/Organization';
import { GeminiService } from '../../ai/gemini';
import { transformOrganizationForAPI } from '../transformers';

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
		});

		// Transform organizations to API format
		const transformedOrganizations = organizations.map(org => transformOrganizationForAPI(org));

		res.json({
			success: true,
			data: {
				organizations: transformedOrganizations,
				count: transformedOrganizations.length,
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

		// Transform organization to API format
		const transformedOrganization = transformOrganizationForAPI(organization);

		res.json({
			success: true,
			data: {
				organization: transformedOrganization,
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
 * POST /api/organizations/:id/follow (Protected route)
 */
router.post('/:id/follow',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { id: organizationId } = req.params;
			const userId = (req as any).user?.userId;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: 'Authentication required',
					message: 'User not authenticated',
				});
				return;
			}

			// Check if organization exists
			const organization = await handler.getOrganizationById(organizationId);
			if (!organization) {
				res.status(404).json({
					success: false,
					error: 'Organization not found',
					message: 'No organization found with the provided ID',
				});
				return;
			}

			// For now, just log the follow action (would implement actual following in production)
			console.log(`User ${userId} followed organization ${organizationId}`);

			res.json({
				success: true,
				message: 'Organization followed successfully',
				data: {
					organizationId,
					userId,
					action: 'follow',
					timestamp: new Date(),
				},
			});

		} catch (error) {
			console.error('❌ Follow organization error:', error);
			res.status(500).json({
				success: false,
				error: 'Follow failed',
				message: 'An error occurred while following the organization',
			});
		}
	},
);

/**
 * POST /api/organizations/:id/unfollow (Protected route)
 */
router.post('/:id/unfollow',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { id: organizationId } = req.params;
			const userId = (req as any).user?.userId;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: 'Authentication required',
					message: 'User not authenticated',
				});
				return;
			}

			// Check if organization exists
			const organization = await handler.getOrganizationById(organizationId);
			if (!organization) {
				res.status(404).json({
					success: false,
					error: 'Organization not found',
					message: 'No organization found with the provided ID',
				});
				return;
			}

			// For now, just log the unfollow action (would implement actual unfollowing in production)
			console.log(`User ${userId} unfollowed organization ${organizationId}`);

			res.json({
				success: true,
				message: 'Organization unfollowed successfully',
				data: {
					organizationId,
					userId,
					action: 'unfollow',
					timestamp: new Date(),
				},
			});

		} catch (error) {
			console.error('❌ Unfollow organization error:', error);
			res.status(500).json({
				success: false,
				error: 'Unfollow failed',
				message: 'An error occurred while unfollowing the organization',
			});
		}
	},
);

/**
 * POST /api/organizations (Protected route - requires authentication)
 */
router.post('/',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const {
				name,
				shortName,
				description,
				url,
				logoUrl,
			} = req.body;

			// Validate required fields
			if (!name || !description) {
				res.status(400).json({
					success: false,
					error: 'Missing required fields',
					message: 'Name and description are required',
				});
				return;
			}

			// Get the next available ID
			const lastOrg = await Organization.findOne().sort({ id: -1 });
			const nextId = lastOrg ? lastOrg.id + 1 : 1;

			// Create Gemini service for AI tagging
			const geminiService = new GeminiService();

			// Create organization object for AI analysis
			const orgForAnalysis = {
				title: name,
				description,
				additionalContext: {
					contactInfo: shortName,
				},
			};

			// Generate AI tags and involvement guide
			const [aiAnalysis, involvementGuide] = await Promise.all([
				geminiService.analyzeContent(orgForAnalysis),
				geminiService.generateInvolvementGuide(
					{
						name,
						description,
						website: url,
					},
					[], // No specific user interests for generic guide
				),
			]);

			// Create the organization with AI-generated content
			const newOrganization = new Organization({
				id: nextId,
				name,
				shortName,
				description,
				url,
				logoUrl,
				tags: aiAnalysis.tags,
				aiProcessing: {
					lastAnalyzed: new Date(),
					geminiModel: geminiService.getModelInfo().model,
				},
				involvementGuide: {
					guide: involvementGuide.guide,
					actionableSteps: involvementGuide.actionableSteps,
					tips: involvementGuide.tips,
					lastUpdated: new Date(),
				},
			});

			await newOrganization.save();

			res.status(201).json({
				success: true,
				message: 'Organization created successfully with AI tagging and involvement guide',
				data: {
					organization: newOrganization,
					aiAnalysis: {
						confidence: aiAnalysis.confidence,
						tagsGenerated: aiAnalysis.tags.length,
					},
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