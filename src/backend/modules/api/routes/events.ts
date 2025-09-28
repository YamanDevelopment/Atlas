import type { Request, Response } from 'express';
import { Router } from 'express';
import { requireAuth } from '../../auth/middleware/auth';
import type Handler from '../../database/services/handler';
import { Event } from '../../database/schemas/Event';
import { GeminiService } from '../../ai/gemini';

const router = Router();

// Handler instance (assuming it's available globally or can be imported)
// In your actual server.ts, you'll need to provide this instance
let handler: Handler;

export function setHandler(handlerInstance: Handler) {
	handler = handlerInstance;
}

/**
 * Events API Routes
 * GET /api/events - Get all events with optional filters
 * GET /api/events/:id - Get event by ID
 * POST /api/events - Create new event (requires auth)
 * GET /api/events/search - Search events
 * GET /api/events/by-date - Get events by date range
 * GET /api/events/by-tags - Get events by tags
 */

/**
 * GET /api/events
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
	try {
		const { limit = '20', skip = '0', sortBy = 'startDate', sortOrder = 'asc' } = req.query;

		const events = await handler.searchEvents('', {
			limit: parseInt(limit as string),
			skip: parseInt(skip as string),
			sortBy: sortBy as string,
			sortOrder: sortOrder as 'asc' | 'desc',
		});

		res.json({
			success: true,
			data: {
				events,
				count: events.length,
				pagination: {
					limit: parseInt(limit as string),
					skip: parseInt(skip as string),
				},
			},
		});

	} catch (error) {
		console.error('❌ Get events error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch events',
			message: 'An error occurred while retrieving events',
		});
	}
});

/**
 * GET /api/events/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
	try {
		const { id } = req.params;

		const event = await handler.getEventById(id);

		if (!event) {
			res.status(404).json({
				success: false,
				error: 'Event not found',
				message: 'No event found with the provided ID',
			});
			return;
		}

		res.json({
			success: true,
			data: {
				event,
			},
		});

	} catch (error) {
		console.error('❌ Get event by ID error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch event',
			message: 'An error occurred while retrieving the event',
		});
	}
});

/**
 * GET /api/events/search
 */
router.get('/search', async (req: Request, res: Response): Promise<void> => {
	try {
		const {
			q = '',
			limit = '20',
			skip = '0',
			sortBy = 'startDate',
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

		const events = await handler.searchEvents(q as string, {
			limit: parseInt(limit as string),
			skip: parseInt(skip as string),
			sortBy: sortBy as string,
			sortOrder: sortOrder as 'asc' | 'desc',
		});

		res.json({
			success: true,
			data: {
				events,
				count: events.length,
				query: q,
				pagination: {
					limit: parseInt(limit as string),
					skip: parseInt(skip as string),
				},
			},
		});

	} catch (error) {
		console.error('❌ Search events error:', error);
		res.status(500).json({
			success: false,
			error: 'Search failed',
			message: 'An error occurred while searching events',
		});
	}
});

/**
 * GET /api/events/by-date
 */
router.get('/by-date', async (req: Request, res: Response): Promise<void> => {
	try {
		const { startDate, endDate } = req.query;

		if (!startDate || !endDate) {
			res.status(400).json({
				success: false,
				error: 'Date range required',
				message: 'Please provide both startDate and endDate parameters',
			});
			return;
		}

		const start = new Date(startDate as string);
		const end = new Date(endDate as string);

		if (isNaN(start.getTime()) || isNaN(end.getTime())) {
			res.status(400).json({
				success: false,
				error: 'Invalid date format',
				message: 'Please provide valid ISO date strings',
			});
			return;
		}

		if (start > end) {
			res.status(400).json({
				success: false,
				error: 'Invalid date range',
				message: 'Start date must be before end date',
			});
			return;
		}

		const events = await handler.getEventsByDateRange(start, end);

		res.json({
			success: true,
			data: {
				events,
				count: events.length,
				dateRange: {
					startDate: start,
					endDate: end,
				},
			},
		});

	} catch (error) {
		console.error('❌ Get events by date range error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch events by date',
			message: 'An error occurred while retrieving events by date range',
		});
	}
});

/**
 * GET /api/events/by-tags
 */
router.get('/by-tags', async (req: Request, res: Response): Promise<void> => {
	try {
		const { tagIds } = req.query;

		if (!tagIds) {
			res.status(400).json({
				success: false,
				error: 'Tag IDs required',
				message: 'Please provide tagIds parameter (comma-separated)',
			});
			return;
		}

		const tagIdArray = Array.isArray(tagIds)
			? tagIds as string[]
			: (tagIds as string).split(',').map(id => id.trim());

		if (tagIdArray.length === 0) {
			res.status(400).json({
				success: false,
				error: 'No valid tag IDs provided',
				message: 'Please provide at least one valid tag ID',
			});
			return;
		}

		const events = await handler.getEventsByTags(tagIdArray);

		res.json({
			success: true,
			data: {
				events,
				count: events.length,
				tagIds: tagIdArray,
			},
		});

	} catch (error) {
		console.error('❌ Get events by tags error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch events by tags',
			message: 'An error occurred while retrieving events by tags',
		});
	}
});

/**
 * POST /api/events (Protected route - requires authentication)
 */
router.post('/',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const {
				name,
				description,
				startTime,
				endTime,
				location,
				url,
				organization,
				latitude,
				longitude,
			} = req.body;

			// Validate required fields
			if (!name || !description || !startTime) {
				res.status(400).json({
					success: false,
					error: 'Missing required fields',
					message: 'Name, description, and start time are required',
				});
				return;
			}

			// Get the next available ID
			const lastEvent = await Event.findOne().sort({ id: -1 });
			const nextId = lastEvent ? lastEvent.id + 1 : 1;

			// Create Gemini service for AI tagging
			const geminiService = new GeminiService();

			// Create event object for AI analysis
			const eventForAnalysis = {
				title: name,
				description,
				additionalContext: {
					location,
					eventType: 'general',
				},
			};

			// Generate AI tags
			const aiAnalysis = await geminiService.analyzeContent(eventForAnalysis);

			// Create the event with AI-generated tags
			const newEvent = new Event({
				id: nextId,
				name,
				description,
				startTime: new Date(startTime),
				endTime: endTime ? new Date(endTime) : undefined,
				location,
				url,
				organization,
				latitude,
				longitude,
				tags: aiAnalysis.tags,
				aiProcessing: {
					lastAnalyzed: new Date(),
					geminiModel: geminiService.getModelInfo().model,
				},
			});

			await newEvent.save();

			res.status(201).json({
				success: true,
				message: 'Event created successfully with AI tagging',
				data: {
					event: newEvent,
					aiAnalysis: {
						confidence: aiAnalysis.confidence,
						tagsGenerated: aiAnalysis.tags.length,
					},
				},
			});

		} catch (error) {
			console.error('❌ Create event error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to create event',
				message: 'An error occurred while creating the event',
			});
		}
	},
);

export default router;