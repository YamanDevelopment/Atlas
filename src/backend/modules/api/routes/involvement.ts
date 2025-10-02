import type { Request, Response } from 'express';
import { Router } from 'express';
import { requireAuth } from '../../auth/middleware/auth';
import { User } from '../../database/schemas/User';
import { Lab } from '../../database/schemas/Lab';
import { Organization } from '../../database/schemas/Organization';
import { Event } from '../../database/schemas/Event';
import { GeminiService } from '../../ai/gemini';

const router = Router();
const geminiService = new GeminiService();

/**
 * Involvement API Routes
 * GET /api/involvement/guide/:type/:id - Get involvement guide for lab/org
 * POST /api/involvement/join - Join a lab/org (simplified)
 * DELETE /api/involvement/leave - Leave a lab/org (simplified)
 * POST /api/involvement/bookmark - Bookmark an event
 * DELETE /api/involvement/unbookmark - Unbookmark an event
 * GET /api/involvement/commitments - Get user's commitments
 * GET /api/involvement/bookmarks - Get user's bookmarked events
 * GET /api/involvement/plan - Get personalized involvement plan
 */

/**
 * GET /api/involvement/guide/:type/:id
 * Get involvement guide for a specific lab or organization
 */
router.get('/guide/:type/:id',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { type, id } = req.params;
			const userId = (req as any).user?.userId;

			if (!['lab', 'organization'].includes(type)) {
				res.status(400).json({
					success: false,
					error: 'Invalid type',
					message: 'Type must be "lab" or "organization"',
				});
				return;
			}

			// Get the lab/org
			let item;
			if (type === 'lab') {
				item = await Lab.findOne({ id: parseInt(id) });
			} else {
				item = await Organization.findOne({ id: parseInt(id) });
			}

			if (!item) {
				res.status(404).json({
					success: false,
					error: `${type} not found`,
					message: `No ${type} found with the provided ID`,
				});
				return;
			}

			// Get user for personalization
			const user = await User.findById(userId);
			const userInterests: string[] = [];

			if (user && user.interests.length > 0) {
				// TODO: Fetch actual interest names based on IDs
				// For now, return the stored guide or generate a new one
			}

			// Return stored involvement guide or generate new one
			let involvementGuide;
			if (item.involvementGuide) {
				involvementGuide = item.involvementGuide;
			} else {
				// Generate new involvement guide if not stored
				const generated = await geminiService.generateInvolvementGuide(
					{
						name: item.name,
						description: item.description,
						website: item.url,
					},
					userInterests,
				);

				involvementGuide = {
					guide: generated.guide,
					actionableSteps: generated.actionableSteps,
					tips: generated.tips,
					lastUpdated: new Date(),
				};

				// Save the generated guide
				item.involvementGuide = involvementGuide;
				await item.save();
			}

			res.json({
				success: true,
				data: {
					item: {
						id: item.id,
						name: item.name,
						description: item.description,
						type,
					},
					involvementGuide,
				},
			});

		} catch (error) {
			console.error('❌ Get involvement guide error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to get involvement guide',
				message: 'An error occurred while retrieving the involvement guide',
			});
		}
	},
);

/**
 * POST /api/involvement/bulk-update
 * Bulk update user commitments from onboarding
 */
router.post('/bulk-update',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const userId = (req as any).user?.userId;
			const { involvements } = req.body;

			console.log(`📝 Bulk-update commitments for user ${userId}:`, involvements);

			if (!userId) {
				res.status(401).json({
					success: false,
					error: 'Authentication required',
					message: 'User not authenticated',
				});
				return;
			}

			if (!involvements || !Array.isArray(involvements)) {
				res.status(400).json({
					success: false,
					error: 'Invalid request',
					message: 'involvements array is required',
				});
				return;
			}

			const user = await User.findById(userId);
			if (!user) {
				res.status(404).json({
					success: false,
					error: 'User not found',
					message: 'No user found with the provided ID',
				});
				return;
			}

			// Process each involvement
			const results = [];
			for (const involvement of involvements) {
				const { type, itemId, status = 'active' } = involvement;

				if (!type || !itemId || !['lab', 'organization'].includes(type)) {
					console.warn('⚠️ Invalid involvement:', involvement);
					continue;
				}

				try {
					// Check if commitment already exists
					const existingCommitment = user.commitments.find(c =>
						c.type === type && c.itemId === itemId,
					);

					if (existingCommitment) {
						// Update existing commitment status
						await user.updateCommitmentStatus(type, itemId, status);
						console.log(`✅ Updated commitment: ${type} ${itemId} -> ${status}`);
					} else {
						// Add new commitment
						await user.addCommitment(type, itemId);
						if (status !== 'pending') {
							await user.updateCommitmentStatus(type, itemId, status);
						}
						console.log(`✅ Added commitment: ${type} ${itemId} (${status})`);
					}

					results.push({
						type,
						itemId,
						status,
						action: existingCommitment ? 'updated' : 'added',
					});
				} catch (error) {
					console.error(`❌ Failed to process involvement ${type} ${itemId}:`, error);
					results.push({
						type,
						itemId,
						status: 'error',
						action: 'failed',
						error: (error as Error).message,
					});
				}
			}

			console.log(`✅ Bulk-update complete: ${results.length} involvements processed`);

			res.json({
				success: true,
				message: `Successfully processed ${results.length} involvements`,
				data: {
					processed: results,
					totalCount: results.length,
					successCount: results.filter(r => r.action !== 'failed').length,
					errorCount: results.filter(r => r.action === 'failed').length,
				},
			});

		} catch (error) {
			console.error('❌ Bulk-update involvements error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to update involvements',
				message: 'An error occurred while updating involvements',
			});
		}
	},
);

/**
 * POST /api/involvement/join
 * Join a lab/org (simplified - just track commitment)
 */
router.post('/join',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const userId = (req as any).user?.userId;
			const { type, itemId } = req.body;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: 'Authentication required',
					message: 'User not authenticated',
				});
				return;
			}

			if (!type || !itemId || !['lab', 'organization'].includes(type)) {
				res.status(400).json({
					success: false,
					error: 'Invalid request',
					message: 'Type must be "lab" or "organization" and itemId is required',
				});
				return;
			}

			// Get user and item details
			const user = await User.findById(userId);
			if (!user) {
				res.status(404).json({
					success: false,
					error: 'User not found',
					message: 'No user found with the provided ID',
				});
				return;
			}

			// Get the lab/org details
			let item;
			if (type === 'lab') {
				item = await Lab.findOne({ id: itemId });
			} else {
				item = await Organization.findOne({ id: itemId });
			}

			if (!item) {
				res.status(404).json({
					success: false,
					error: `${type} not found`,
					message: `No ${type} found with the provided ID`,
				});
				return;
			}

			// Add commitment to user
			await user.addCommitment(type, itemId);

			res.json({
				success: true,
				message: `Successfully joined ${item.name}`,
				data: {
					commitment: {
						type,
						itemId,
						status: 'pending',
						joinedAt: new Date(),
					},
					involvementGuide: item.involvementGuide,
				},
			});

		} catch (error) {
			console.error('❌ Join involvement error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to join',
				message: 'An error occurred while joining the organization/lab',
			});
		}
	},
);

/**
 * PUT /api/involvement/status
 * Update commitment status
 */
router.put('/status',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const userId = (req as any).user?.userId;
			const { type, itemId, status } = req.body;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: 'Authentication required',
					message: 'User not authenticated',
				});
				return;
			}

			if (!type || !itemId || !status || !['lab', 'organization'].includes(type) || !['pending', 'active', 'passive', 'inactive'].includes(status)) {
				res.status(400).json({
					success: false,
					error: 'Invalid request',
					message: 'Valid type, itemId, and status are required',
				});
				return;
			}

			const user = await User.findById(userId);
			if (!user) {
				res.status(404).json({
					success: false,
					error: 'User not found',
					message: 'No user found with the provided ID',
				});
				return;
			}

			await user.updateCommitmentStatus(type, itemId, status);

			res.json({
				success: true,
				message: `Commitment status updated to ${status}`,
				data: {
					type,
					itemId,
					status,
					lastUpdated: new Date(),
				},
			});

		} catch (error) {
			console.error('❌ Update commitment status error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to update status',
				message: 'An error occurred while updating commitment status',
			});
		}
	},
);

/**
 * DELETE /api/involvement/leave
 * Leave a lab/org
 */
router.delete('/leave',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const userId = (req as any).user?.userId;
			const { type, itemId } = req.body;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: 'Authentication required',
					message: 'User not authenticated',
				});
				return;
			}

			if (!type || !itemId || !['lab', 'organization'].includes(type)) {
				res.status(400).json({
					success: false,
					error: 'Invalid request',
					message: 'Type must be "lab" or "organization" and itemId is required',
				});
				return;
			}

			const user = await User.findById(userId);
			if (!user) {
				res.status(404).json({
					success: false,
					error: 'User not found',
					message: 'No user found with the provided ID',
				});
				return;
			}

			await user.removeCommitment(type, itemId);

			res.json({
				success: true,
				message: 'Successfully left the organization/lab',
				data: {
					type,
					itemId,
					removedAt: new Date(),
				},
			});

		} catch (error) {
			console.error('❌ Leave involvement error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to leave',
				message: 'An error occurred while leaving the organization/lab',
			});
		}
	},
);

/**
 * POST /api/involvement/bookmark
 * Bookmark an event
 */
router.post('/bookmark',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const userId = (req as any).user?.userId;
			const { eventId } = req.body;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: 'Authentication required',
					message: 'User not authenticated',
				});
				return;
			}

			if (!eventId) {
				res.status(400).json({
					success: false,
					error: 'Invalid request',
					message: 'eventId is required',
				});
				return;
			}

			// Verify event exists
			const event = await Event.findOne({ id: eventId });
			if (!event) {
				res.status(404).json({
					success: false,
					error: 'Event not found',
					message: 'No event found with the provided ID',
				});
				return;
			}

			const user = await User.findById(userId);
			if (!user) {
				res.status(404).json({
					success: false,
					error: 'User not found',
					message: 'No user found with the provided ID',
				});
				return;
			}

			await user.bookmarkEvent(eventId);

			res.json({
				success: true,
				message: `Successfully bookmarked ${event.name}`,
				data: {
					eventId,
					bookmarkedAt: new Date(),
				},
			});

		} catch (error) {
			console.error('❌ Bookmark event error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to bookmark event',
				message: 'An error occurred while bookmarking the event',
			});
		}
	},
);

/**
 * DELETE /api/involvement/unbookmark
 * Unbookmark an event
 */
router.delete('/unbookmark',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const userId = (req as any).user?.userId;
			const { eventId } = req.body;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: 'Authentication required',
					message: 'User not authenticated',
				});
				return;
			}

			if (!eventId) {
				res.status(400).json({
					success: false,
					error: 'Invalid request',
					message: 'eventId is required',
				});
				return;
			}

			const user = await User.findById(userId);
			if (!user) {
				res.status(404).json({
					success: false,
					error: 'User not found',
					message: 'No user found with the provided ID',
				});
				return;
			}

			await user.unbookmarkEvent(eventId);

			res.json({
				success: true,
				message: 'Successfully unbookmarked event',
				data: {
					eventId,
					unbookmarkedAt: new Date(),
				},
			});

		} catch (error) {
			console.error('❌ Unbookmark event error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to unbookmark event',
				message: 'An error occurred while unbookmarking the event',
			});
		}
	},
);

/**
 * GET /api/involvement/commitments
 * Get user's current commitments
 */
router.get('/commitments',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const userId = (req as any).user?.userId;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: 'Authentication required',
					message: 'User not authenticated',
				});
				return;
			}

			const user = await User.findById(userId);
			if (!user) {
				res.status(404).json({
					success: false,
					error: 'User not found',
					message: 'No user found with the provided ID',
				});
				return;
			}

			// Get detailed information for each commitment
			const commitmentDetails = await Promise.all(
				user.commitments.map(async (commitment) => {
					let item;
					if (commitment.type === 'lab') {
						item = await Lab.findOne({ id: commitment.itemId });
					} else {
						item = await Organization.findOne({ id: commitment.itemId });
					}

					return {
						type: commitment.type,
						itemId: commitment.itemId,
						status: commitment.status,
						joinedAt: commitment.joinedAt,
						lastUpdated: commitment.lastUpdated,
						item: item ? {
							id: item.id,
							name: item.name,
							description: item.description,
							url: (item as any).url,
						} : null,
					};
				}),
			);

			res.json({
				success: true,
				data: {
					commitments: commitmentDetails,
					totalCount: commitmentDetails.length,
				},
			});

		} catch (error) {
			console.error('❌ Get commitments error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to get commitments',
				message: 'An error occurred while retrieving commitments',
			});
		}
	},
);

/**
 * GET /api/involvement/bookmarks
 * Get user's bookmarked events
 */
router.get('/bookmarks',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const userId = (req as any).user?.userId;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: 'Authentication required',
					message: 'User not authenticated',
				});
				return;
			}

			const user = await User.findById(userId);
			if (!user) {
				res.status(404).json({
					success: false,
					error: 'User not found',
					message: 'No user found with the provided ID',
				});
				return;
			}

			// Get detailed information for each bookmarked event
			const bookmarkDetails = await Promise.all(
				user.bookmarkedEvents.map(async (bookmark) => {
					const event = await Event.findOne({ id: bookmark.eventId });
					return {
						eventId: bookmark.eventId,
						bookmarkedAt: bookmark.bookmarkedAt,
						event: event ? {
							id: event.id,
							name: event.name,
							description: event.description,
							startTime: event.startTime,
							endTime: event.endTime,
							location: event.location,
							url: event.url,
						} : null,
					};
				}),
			);

			// Separate upcoming and past events
			const now = new Date();
			const upcomingEvents = bookmarkDetails.filter(b => b.event && new Date(b.event.startTime) >= now);
			const pastEvents = bookmarkDetails.filter(b => b.event && new Date(b.event.endTime) < now);

			res.json({
				success: true,
				data: {
					upcomingEvents,
					pastEvents,
					totalCount: bookmarkDetails.length,
				},
			});

		} catch (error) {
			console.error('❌ Get bookmarks error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to get bookmarks',
				message: 'An error occurred while retrieving bookmarks',
			});
		}
	},
);

/**
 * GET /api/involvement/plan
 * Get personalized involvement plan for new students
 */
router.get('/plan',
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const userId = (req as any).user?.userId;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: 'Authentication required',
					message: 'User not authenticated',
				});
				return;
			}

			const user = await User.findById(userId);
			if (!user) {
				res.status(404).json({
					success: false,
					error: 'User not found',
					message: 'No user found with the provided ID',
				});
				return;
			}

			// Import the recommendation service
			const { RecommendationService } = await import('../../database/services/recommendations');
			const recommendationService = new RecommendationService();

			// Get recommendations for the user
			const [eventRecs, orgRecs, labRecs] = await Promise.all([
				recommendationService.getEventRecommendations(user.id.toString(), {
					algorithm: 'hybrid',
					limit: 5,
					minScore: 0.3,
					includeReasons: true,
				}),
				recommendationService.getOrganizationRecommendations(user.id.toString(), {
					algorithm: 'hybrid',
					limit: 5,
					minScore: 0.3,
					includeReasons: true,
				}),
				recommendationService.getLabRecommendations(user.id.toString(), {
					algorithm: 'hybrid',
					limit: 5,
					minScore: 0.3,
					includeReasons: true,
				}),
			]);

			// Format opportunities for Gemini
			const opportunities = [
				...eventRecs.recommendations.map((e: any) => ({
					type: 'event' as const,
					item: e.event,
					score: Math.round(e.score.score * 100),
				})),
				...orgRecs.recommendations.map((o: any) => ({
					type: 'org' as const,
					item: o.organization,
					score: Math.round(o.score.score * 100),
				})),
				...labRecs.recommendations.map((l: any) => ({
					type: 'lab' as const,
					item: l.lab,
					score: Math.round(l.score.score * 100),
				})),
			];

			// Get user interest names for context
			const userInterestNames: string[] = []; // TODO: Fetch actual interest names based on IDs

			// Generate involvement plan using Gemini
			const involvementPlan = await geminiService.generateInvolvementPlan(
				userInterestNames,
				opportunities,
				[], // No professor recommendations since labs are added manually
			);

			res.json({
				success: true,
				data: {
					plan: involvementPlan,
					recommendations: {
						events: eventRecs.recommendations.slice(0, 5),
						organizations: orgRecs.recommendations.slice(0, 5),
						labs: labRecs.recommendations.slice(0, 5),
					},
					metrics: {
						events: eventRecs.metrics,
						organizations: orgRecs.metrics,
						labs: labRecs.metrics,
					},
				},
			});

		} catch (error) {
			console.error('❌ Get involvement plan error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to generate involvement plan',
				message: 'An error occurred while generating the involvement plan',
			});
		}
	},
);

export default router;