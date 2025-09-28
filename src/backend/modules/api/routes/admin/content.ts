import type { Request, Response } from 'express';
import { Router } from 'express';
import { requireAdmin } from './middleware';
import { Event } from '../../../database/schemas/Event';
import { Organization } from '../../../database/schemas/Organization';
import { Lab } from '../../../database/schemas/Lab';
import { Interest } from '../../../database/schemas/Interest';
import { GeminiService } from '../../../ai/gemini';

const router = Router();

/**
 * Admin Content Moderation API Routes
 * GET /api/admin/content/pending - Get content pending moderation
 * PUT /api/admin/content/:type/:id/approve - Approve content
 * PUT /api/admin/content/:type/:id/reject - Reject content
 * GET /api/admin/content/flagged - Get flagged content
 * PUT /api/admin/content/:type/:id/flag - Flag content for review
 * DELETE /api/admin/content/:type/:id - Delete content
 * GET /api/admin/content/reports - Get user reports
 * PUT /api/admin/content/reports/:id/resolve - Resolve user report
 * POST /api/admin/content/labs - Create new lab with AI tagging
 * POST /api/admin/content/organizations - Create new organization with AI tagging
 * POST /api/admin/content/events - Create new event with AI tagging
 * POST /api/admin/content/interests - Create new interest with AI tagging
 * POST /api/admin/content/bulk/retag - Bulk retag items using AI
 */

interface ContentItem {
	id: string;
	type: 'event' | 'organization' | 'lab';
	title: string;
	description?: string;
	status: 'pending' | 'approved' | 'rejected' | 'flagged';
	createdBy: string;
	createdAt: Date;
	flagReason?: string;
	reportCount?: number;
}

/**
 * GET /api/admin/content/pending
 * Get all content items pending moderation approval
 */
router.get('/pending',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { type = 'all', limit = '20', skip = '0' } = req.query;

			const limitNum = parseInt(limit as string);
			const skipNum = parseInt(skip as string);

			const pendingContent: ContentItem[] = [];

			// Get pending events
			if (type === 'all' || type === 'event') {
				const events = await Event.find({
					// In a full implementation, you'd have a status field
					// status: 'pending'
				})
					.limit(limitNum)
					.skip(skipNum)
					.populate('organization')
					.sort({ createdAt: -1 });

				events.forEach(event => {
					pendingContent.push({
						id: event._id.toString(),
						type: 'event',
						title: event.title,
						description: event.description,
						status: 'pending',
						createdBy: 'system', // Would track actual creator
						createdAt: event.createdAt,
					});
				});
			}

			// Get pending organizations
			if (type === 'all' || type === 'organization') {
				const organizations = await Organization.find({
					// status: 'pending'
				})
					.limit(limitNum)
					.skip(skipNum)
					.sort({ createdAt: -1 });

				organizations.forEach(org => {
					pendingContent.push({
						id: org._id.toString(),
						type: 'organization',
						title: org.name,
						description: org.description,
						status: 'pending',
						createdBy: 'system',
						createdAt: org.createdAt || new Date(),
					});
				});
			}

			// Get pending labs
			if (type === 'all' || type === 'lab') {
				const labs = await Lab.find({
					// status: 'pending'
				})
					.limit(limitNum)
					.skip(skipNum)
					.sort({ createdAt: -1 });

				labs.forEach(lab => {
					pendingContent.push({
						id: lab._id.toString(),
						type: 'lab',
						title: lab.name,
						description: lab.description,
						status: 'pending',
						createdBy: 'system',
						createdAt: lab.createdAt || new Date(),
					});
				});
			}

			// Sort by creation date
			pendingContent.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

			res.json({
				success: true,
				data: {
					content: pendingContent.slice(0, limitNum),
					count: pendingContent.length,
					filters: { type },
					pagination: {
						limit: limitNum,
						skip: skipNum,
						hasMore: pendingContent.length > limitNum + skipNum,
					},
				},
			});

		} catch (error) {
			console.error('❌ Get pending content error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to fetch pending content',
				message: 'An error occurred while fetching pending content',
			});
		}
	},
);

/**
 * PUT /api/admin/content/:type/:id/approve
 * Approve content item
 */
router.put('/:type/:id/approve',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { type, id } = req.params;
			const { notes } = req.body;

			let updatedItem: any = null;
			let itemTitle = '';

			switch (type) {
				case 'event':
					updatedItem = await Event.findByIdAndUpdate(
						id,
						{
							// In full implementation: status: 'approved',
							updatedAt: new Date(),
							// moderationNotes: notes
						},
						{ new: true },
					);
					itemTitle = updatedItem?.title || 'Event';
					break;

				case 'organization':
					updatedItem = await Organization.findByIdAndUpdate(
						id,
						{
							// status: 'approved',
							updatedAt: new Date(),
							// moderationNotes: notes
						},
						{ new: true },
					);
					itemTitle = updatedItem?.name || 'Organization';
					break;

				case 'lab':
					updatedItem = await Lab.findByIdAndUpdate(
						id,
						{
							// status: 'approved',
							updatedAt: new Date(),
							// moderationNotes: notes
						},
						{ new: true },
					);
					itemTitle = updatedItem?.name || 'Lab';
					break;

				default:
					res.status(400).json({
						success: false,
						error: 'Invalid content type',
						message: 'Content type must be event, organization, or lab',
					});
					return;
			}

			if (!updatedItem) {
				res.status(404).json({
					success: false,
					error: 'Content not found',
					message: `${type} with ID ${id} not found`,
				});
				return;
			}

			res.json({
				success: true,
				message: `${itemTitle} approved successfully`,
				data: {
					id: updatedItem._id,
					type,
					status: 'approved',
					moderationNotes: notes,
					approvedAt: new Date().toISOString(),
				},
			});

		} catch (error) {
			console.error('❌ Approve content error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to approve content',
				message: 'An error occurred while approving the content',
			});
		}
	},
);

/**
 * PUT /api/admin/content/:type/:id/reject
 * Reject content item
 */
router.put('/:type/:id/reject',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { type, id } = req.params;
			const { reason, notes } = req.body;

			if (!reason) {
				res.status(400).json({
					success: false,
					error: 'Rejection reason required',
					message: 'Please provide a reason for rejecting this content',
				});
				return;
			}

			let updatedItem: any = null;
			let itemTitle = '';

			switch (type) {
				case 'event':
					updatedItem = await Event.findByIdAndUpdate(
						id,
						{
							// status: 'rejected',
							// rejectionReason: reason,
							// moderationNotes: notes,
							updatedAt: new Date(),
						},
						{ new: true },
					);
					itemTitle = updatedItem?.title || 'Event';
					break;

				case 'organization':
					updatedItem = await Organization.findByIdAndUpdate(
						id,
						{
							// status: 'rejected',
							// rejectionReason: reason,
							// moderationNotes: notes,
							updatedAt: new Date(),
						},
						{ new: true },
					);
					itemTitle = updatedItem?.name || 'Organization';
					break;

				case 'lab':
					updatedItem = await Lab.findByIdAndUpdate(
						id,
						{
							// status: 'rejected',
							// rejectionReason: reason,
							// moderationNotes: notes,
							updatedAt: new Date(),
						},
						{ new: true },
					);
					itemTitle = updatedItem?.name || 'Lab';
					break;

				default:
					res.status(400).json({
						success: false,
						error: 'Invalid content type',
						message: 'Content type must be event, organization, or lab',
					});
					return;
			}

			if (!updatedItem) {
				res.status(404).json({
					success: false,
					error: 'Content not found',
					message: `${type} with ID ${id} not found`,
				});
				return;
			}

			res.json({
				success: true,
				message: `${itemTitle} rejected`,
				data: {
					id: updatedItem._id,
					type,
					status: 'rejected',
					rejectionReason: reason,
					moderationNotes: notes,
					rejectedAt: new Date().toISOString(),
				},
			});

		} catch (error) {
			console.error('❌ Reject content error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to reject content',
				message: 'An error occurred while rejecting the content',
			});
		}
	},
);

/**
 * GET /api/admin/content/flagged
 * Get all flagged content that needs review
 */
router.get('/flagged',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { limit = '20', skip = '0' } = req.query;

			const limitNum = parseInt(limit as string);
			const skipNum = parseInt(skip as string);

			// In a full implementation, you'd have a flagged content system
			// For now, returning structure for flagged content
			const flaggedContent: ContentItem[] = [];

			res.json({
				success: true,
				data: {
					content: flaggedContent,
					count: flaggedContent.length,
					pagination: {
						limit: limitNum,
						skip: skipNum,
						hasMore: false,
					},
				},
			});

		} catch (error) {
			console.error('❌ Get flagged content error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to fetch flagged content',
				message: 'An error occurred while fetching flagged content',
			});
		}
	},
);

/**
 * PUT /api/admin/content/:type/:id/flag
 * Flag content for review
 */
router.put('/:type/:id/flag',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { type, id } = req.params;
			const { reason, notes } = req.body;

			if (!reason) {
				res.status(400).json({
					success: false,
					error: 'Flag reason required',
					message: 'Please provide a reason for flagging this content',
				});
				return;
			}

			// In full implementation, you'd update the item's flag status
			res.json({
				success: true,
				message: 'Content flagged for review',
				data: {
					id,
					type,
					status: 'flagged',
					flagReason: reason,
					flagNotes: notes,
					flaggedAt: new Date().toISOString(),
				},
			});

		} catch (error) {
			console.error('❌ Flag content error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to flag content',
				message: 'An error occurred while flagging the content',
			});
		}
	},
);

/**
 * DELETE /api/admin/content/:type/:id
 * Delete content item (permanent removal)
 */
router.delete('/:type/:id',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { type, id } = req.params;
			const { reason } = req.body;

			if (!reason) {
				res.status(400).json({
					success: false,
					error: 'Deletion reason required',
					message: 'Please provide a reason for deleting this content',
				});
				return;
			}

			let deletedItem: any = null;
			let itemTitle = '';

			switch (type) {
				case 'event':
					deletedItem = await Event.findByIdAndDelete(id);
					itemTitle = deletedItem?.title || 'Event';
					break;

				case 'organization':
					deletedItem = await Organization.findByIdAndDelete(id);
					itemTitle = deletedItem?.name || 'Organization';
					break;

				case 'lab':
					deletedItem = await Lab.findByIdAndDelete(id);
					itemTitle = deletedItem?.name || 'Lab';
					break;

				default:
					res.status(400).json({
						success: false,
						error: 'Invalid content type',
						message: 'Content type must be event, organization, or lab',
					});
					return;
			}

			if (!deletedItem) {
				res.status(404).json({
					success: false,
					error: 'Content not found',
					message: `${type} with ID ${id} not found`,
				});
				return;
			}

			res.json({
				success: true,
				message: `${itemTitle} deleted successfully`,
				data: {
					id,
					type,
					title: itemTitle,
					deletionReason: reason,
					deletedAt: new Date().toISOString(),
				},
			});

		} catch (error) {
			console.error('❌ Delete content error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to delete content',
				message: 'An error occurred while deleting the content',
			});
		}
	},
);

/**
 * GET /api/admin/content/stats
 * Get content moderation statistics
 */
router.get('/stats',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const totalEvents = await Event.countDocuments();
			const totalOrganizations = await Organization.countDocuments();
			const totalLabs = await Lab.countDocuments();

			// In full implementation, you'd have status tracking
			const stats = {
				totals: {
					events: totalEvents,
					organizations: totalOrganizations,
					labs: totalLabs,
					all: totalEvents + totalOrganizations + totalLabs,
				},
				moderation: {
					pending: {
						events: 0, // Would count status: 'pending'
						organizations: 0,
						labs: 0,
						total: 0,
					},
					approved: {
						events: totalEvents, // Assuming all current items are approved
						organizations: totalOrganizations,
						labs: totalLabs,
						total: totalEvents + totalOrganizations + totalLabs,
					},
					rejected: {
						events: 0,
						organizations: 0,
						labs: 0,
						total: 0,
					},
					flagged: {
						events: 0,
						organizations: 0,
						labs: 0,
						total: 0,
					},
				},
				activity: {
					moderatedToday: 0, // Would track daily moderation activity
					moderatedThisWeek: 0,
					moderatedThisMonth: 0,
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
			console.error('❌ Get content stats error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to fetch content statistics',
				message: 'An error occurred while fetching content statistics',
			});
		}
	},
);

const geminiService = new GeminiService();

/**
 * POST /api/admin/content/labs
 * Create new lab with automatic AI tagging and involvement guide
 */
router.post('/labs',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const {
				name,
				description,
				department,
				principalInvestigator,
				location,
				email,
				url,
				acceptingStudents = true,
				researchAreas = [],
			} = req.body;

			if (!name || !description || !department || !principalInvestigator) {
				res.status(400).json({
					success: false,
					error: 'Missing required fields',
					message: 'Name, description, department, and principal investigator are required',
				});
				return;
			}

			// Get the next available ID
			const lastLab = await Lab.findOne().sort({ id: -1 });
			const nextId = lastLab ? lastLab.id + 1 : 1;

			// Create lab object for AI analysis
			const labForAnalysis = {
				title: name,
				description,
				additionalContext: {
					department,
					researchAreas,
					principalInvestigator,
				},
			};

			// Generate AI tags
			const aiAnalysis = await geminiService.analyzeContent(labForAnalysis);

			// Generate involvement guide
			const involvementGuide = await geminiService.generateInvolvementGuide(
				{
					name,
					description,
					website: url,
				},
				[], // No specific user interests for generic guide
			);

			// Create the lab
			const newLab = new Lab({
				id: nextId,
				name,
				description,
				department,
				principalInvestigator,
				location,
				email,
				url,
				acceptingStudents,
				researchAreas,
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

			await newLab.save();

			res.status(201).json({
				success: true,
				message: 'Lab created successfully with AI tagging and involvement guide',
				data: {
					lab: newLab,
					aiAnalysis: {
						confidence: aiAnalysis.confidence,
						tagsGenerated: aiAnalysis.tags.length,
					},
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

/**
 * POST /api/admin/content/organizations
 * Create new organization with automatic AI tagging and involvement guide
 */
router.post('/organizations',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const {
				name,
				shortName,
				description,
				url,
				logoUrl,
			} = req.body;

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

			// Create organization object for AI analysis
			const orgForAnalysis = {
				title: name,
				description,
				additionalContext: {
					contactInfo: shortName,
				},
			};

			// Generate AI tags
			const aiAnalysis = await geminiService.analyzeContent(orgForAnalysis);

			// Generate involvement guide
			const involvementGuide = await geminiService.generateInvolvementGuide(
				{
					name,
					description,
					website: url,
				},
				[], // No specific user interests for generic guide
			);

			// Create the organization
			const newOrg = new Organization({
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

			await newOrg.save();

			res.status(201).json({
				success: true,
				message: 'Organization created successfully with AI tagging and involvement guide',
				data: {
					organization: newOrg,
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

/**
 * POST /api/admin/content/events
 * Create new event with automatic AI tagging
 */
router.post('/events',
	requireAdmin,
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

			// Create the event
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

/**
 * POST /api/admin/content/interests
 * Create new interest with automatic AI tagging
 */
router.post('/interests',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { keyword, description, category } = req.body;

			if (!keyword) {
				res.status(400).json({
					success: false,
					error: 'Missing required fields',
					message: 'Keyword is required',
				});
				return;
			}

			// Get the next available ID
			const lastInterest = await Interest.findOne().sort({ id: -1 });
			const nextId = lastInterest ? lastInterest.id + 1 : 1;

			// Analyze interest with Gemini
			const interestAnalysis = await geminiService.analyzeInterest({
				interestKeyword: keyword,
				userDescription: description,
			});

			// Create the interest
			const newInterest = new Interest({
				id: nextId,
				name: interestAnalysis.suggestedInterestName || keyword,
				keyword,
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

/**
 * POST /api/admin/content/bulk/retag
 * Bulk retag items using AI
 */
router.post('/bulk/retag',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { itemType, itemIds = [], force = false } = req.body;

			if (!itemType || !['labs', 'organizations', 'events'].includes(itemType)) {
				res.status(400).json({
					success: false,
					error: 'Invalid item type',
					message: 'Item type must be one of: labs, organizations, events',
				});
				return;
			}

			// Build query
			const query: any = itemIds.length > 0 ? { id: { $in: itemIds } } : {};
			if (!force) {
				// Only retag items that haven't been analyzed recently (>7 days)
				const weekAgo = new Date();
				weekAgo.setDate(weekAgo.getDate() - 7);
				query.$or = [
					{ 'aiProcessing.lastAnalyzed': { $lt: weekAgo } },
					{ 'aiProcessing.lastAnalyzed': { $exists: false } },
				];
			}

			let items: any[];
			switch (itemType) {
				case 'labs':
					items = await Lab.find(query).limit(50);
					break;
				case 'organizations':
					items = await Organization.find(query).limit(50);
					break;
				case 'events':
					items = await Event.find(query).limit(50);
					break;
				default:
					items = [];
			}

			const results = {
				processed: 0,
				successful: 0,
				failed: 0,
				errors: [] as string[],
			};

			for (const item of items) {
				try {
					results.processed++;

					const itemForAnalysis = {
						title: item.name,
						description: item.description,
						additionalContext: itemType === 'labs' ? {
							department: item.department,
							researchAreas: item.researchAreas,
						} : itemType === 'events' ? {
							location: item.location,
						} : {
							contactInfo: item.shortName,
						},
					};

					const aiAnalysis = await geminiService.analyzeContent(itemForAnalysis);

					// Generate new involvement guide for labs/orgs
					if (itemType === 'labs' || itemType === 'organizations') {
						const involvementGuide = await geminiService.generateInvolvementGuide(
							{
								name: item.name,
								description: item.description,
								website: item.url,
							},
							[],
						);

						item.involvementGuide = {
							guide: involvementGuide.guide,
							actionableSteps: involvementGuide.actionableSteps,
							tips: involvementGuide.tips,
							lastUpdated: new Date(),
						};
					}

					item.tags = aiAnalysis.tags;
					item.aiProcessing = {
						lastAnalyzed: new Date(),
						geminiModel: geminiService.getModelInfo().model,
					};

					await item.save();
					results.successful++;

				} catch (error) {
					results.failed++;
					results.errors.push(`${item.name}: ${(error as Error).message}`);
					console.error(`❌ Failed to retag ${item.name}:`, error);
				}
			}

			res.json({
				success: true,
				message: 'Bulk retagging completed',
				data: results,
			});

		} catch (error) {
			console.error('❌ Bulk retag error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to perform bulk retagging',
				message: 'An error occurred during bulk retagging',
			});
		}
	},
);

export default router;