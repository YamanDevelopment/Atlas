import type { Request, Response } from 'express';
import { Router } from 'express';
import { requireAdmin } from './middleware';
import type Handler from '../../../database/services/handler';
import { Event } from '../../../database/schemas/Event';
import { Organization } from '../../../database/schemas/Organization';
import { Lab } from '../../../database/schemas/Lab';

const router = Router();

// Handler instance
let handler: Handler;

export function setHandler(handlerInstance: Handler) {
	handler = handlerInstance;
}

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

export default router;