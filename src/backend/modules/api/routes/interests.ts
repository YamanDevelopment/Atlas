import type { Request, Response } from 'express';
import { Router } from 'express';
import { requireAuth } from '../../auth/middleware/auth';
import type Handler from '../../database/services/handler';
import { Interest } from '../../database/schemas/Interest';
import { GeminiService } from '../../ai/gemini';

const router = Router();

// Handler instance
let handler: Handler;

export function setHandler(handlerInstance: Handler) {
	handler = handlerInstance;
}

/**
 * Interests API Routes
 * GET /api/interests - Get all interests
 * GET /api/interests/:id - Get interest by ID
 * POST /api/interests - Create new interest (requires auth)
 * GET /api/interests/search - Search interests by keyword
 */

/**
 * GET /api/interests
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
	try {
		const { search = '' } = req.query;

		const interests = await handler.searchInterestsByKeyword(search as string);

		res.json({
			success: true,
			data: {
				interests,
				count: interests.length,
			},
		});

	} catch (error) {
		console.error('❌ Get interests error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch interests',
			message: 'An error occurred while retrieving interests',
		});
	}
});

/**
 * GET /api/interests/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
	try {
		const { id } = req.params;

		const interest = await handler.getInterestById(id);

		if (!interest) {
			res.status(404).json({
				success: false,
				error: 'Interest not found',
				message: 'No interest found with the provided ID',
			});
			return;
		}

		res.json({
			success: true,
			data: {
				interest,
			},
		});

	} catch (error) {
		console.error('❌ Get interest by ID error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch interest',
			message: 'An error occurred while retrieving the interest',
		});
	}
});

/**
 * GET /api/interests/search
 */
router.get('/search', async (req: Request, res: Response): Promise<void> => {
	try {
		const { q = '' } = req.query;

		if (!q || typeof q !== 'string') {
			res.status(400).json({
				success: false,
				error: 'Invalid search query',
				message: 'Please provide a valid search query (q parameter)',
			});
			return;
		}

		const interests = await handler.searchInterestsByKeyword(q as string);

		res.json({
			success: true,
			data: {
				interests,
				count: interests.length,
				query: q,
			},
		});

	} catch (error) {
		console.error('❌ Search interests error:', error);
		res.status(500).json({
			success: false,
			error: 'Search failed',
			message: 'An error occurred while searching interests',
		});
	}
});

/**
 * POST /api/interests (Protected route - requires authentication)
 */
router.post('/',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { name, keyword, description, category } = req.body;

			// Validate required fields
			if (!keyword) {
				res.status(400).json({
					success: false,
					error: 'Missing required fields',
					message: 'Keyword is required',
				});
				return;
			}

			// Check if interest already exists
			const existingInterest = await Interest.findOne({
				$or: [
					{ keyword: keyword.toLowerCase() },
					{ name: (name || keyword).toLowerCase() },
				],
			});

			if (existingInterest) {
				res.status(400).json({
					success: false,
					error: 'Interest already exists',
					message: 'An interest with this keyword or name already exists',
				});
				return;
			}

			// Get the next available ID
			const lastInterest = await Interest.findOne().sort({ id: -1 });
			const nextId = lastInterest ? lastInterest.id + 1 : 1;

			// Create Gemini service for AI tagging
			const geminiService = new GeminiService();

			// Analyze interest with Gemini AI
			const interestAnalysis = await geminiService.analyzeInterest({
				interestKeyword: keyword,
				userDescription: description,
			});

			// Create the interest with AI tags
			const newInterest = new Interest({
				id: nextId,
				name: interestAnalysis.suggestedInterestName || name || keyword,
				keyword: keyword.toLowerCase(),
				description: description || `Interest in ${keyword}`,
				category: category || 'general',
				tags: interestAnalysis.tags,
			});

			await newInterest.save();

			res.status(201).json({
				success: true,
				message: 'Interest created successfully with AI tagging',
				data: {
					interest: newInterest,
					aiAnalysis: {
						confidence: interestAnalysis.confidence,
						tagsGenerated: interestAnalysis.tags.length,
						suggestedName: interestAnalysis.suggestedInterestName,
					},
				},
			});

		} catch (error) {
			console.error('❌ Create interest error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to create interest',
				message: 'An error occurred while creating the interest',
			});
		}
	},
);

export default router;