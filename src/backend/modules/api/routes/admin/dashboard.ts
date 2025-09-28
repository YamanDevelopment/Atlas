import type { Request, Response } from 'express';
import { Router } from 'express';
import { requireAdmin } from './middleware';
import type Handler from '../../../database/services/handler';

const router = Router();

// Handler instance
let handler: Handler;

export function setHandler(handlerInstance: Handler) {
	handler = handlerInstance;
}

/**
 * Admin Dashboard API Routes
 * GET /api/admin/dashboard - System overview and key metrics
 * GET /api/admin/dashboard/stats - Detailed system statistics
 * GET /api/admin/dashboard/recent-activity - Recent system activity
 * GET /api/admin/dashboard/system-health - System health metrics
 */

/**
 * GET /api/admin/dashboard
 * Main dashboard overview with key system metrics
 */
router.get('/',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			// Get basic database statistics
			const dbStats = await handler.getDatabaseStats();

			// Get system uptime
			const systemUptime = Math.floor(process.uptime());
			const dbUptime = handler.getConnectionUptime();

			// Get memory usage
			const memoryUsage = process.memoryUsage();

			// Basic system overview
			const overview = {
				system: {
					uptime: {
						formatted: formatUptime(systemUptime),
						seconds: systemUptime,
					},
					memory: {
						used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
						total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
						external: Math.round(memoryUsage.external / 1024 / 1024),
						rss: Math.round(memoryUsage.rss / 1024 / 1024),
					},
					nodeVersion: process.version,
					platform: process.platform,
					arch: process.arch,
				},
				database: {
					connected: handler.isConnectionHealthy(),
					uptime: {
						formatted: formatUptime(Math.floor(dbUptime / 1000)),
						milliseconds: dbUptime,
					},
					stats: dbStats,
				},
				api: {
					version: '1.0.0',
					environment: process.env.NODE_ENV || 'development',
					port: process.env.API_PORT || '3001',
				},
			};

			res.json({
				success: true,
				data: {
					overview,
					timestamp: new Date().toISOString(),
				},
			});

		} catch (error) {
			console.error('❌ Dashboard overview error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to load dashboard',
				message: 'An error occurred while loading dashboard data',
			});
		}
	},
);

/**
 * GET /api/admin/dashboard/stats
 * Detailed system statistics and metrics
 */
router.get('/stats',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const dbStats = await handler.getDatabaseStats();

			// Calculate growth metrics (simplified - in production you'd track these over time)
			const stats = {
				entities: {
					users: {
						total: dbStats.users,
						growth: { daily: 0, weekly: 0, monthly: 0 }, // Placeholder
					},
					events: {
						total: dbStats.events,
						growth: { daily: 0, weekly: 0, monthly: 0 },
					},
					organizations: {
						total: dbStats.organizations,
						growth: { daily: 0, weekly: 0, monthly: 0 },
					},
					labs: {
						total: dbStats.labs,
						growth: { daily: 0, weekly: 0, monthly: 0 },
					},
					tags: {
						total: dbStats.tags,
						growth: { daily: 0, weekly: 0, monthly: 0 },
					},
					interests: {
						total: dbStats.interests,
						growth: { daily: 0, weekly: 0, monthly: 0 },
					},
				},
				system: {
					requests: {
						total: 0, // Would need request counter middleware
						errors: 0,
						averageResponseTime: 0,
					},
					recommendations: {
						generated: 0, // Would track in recommendation service
						accepted: 0,
						successRate: 0,
					},
					authentication: {
						logins: 0, // Would track in auth service
						registrations: 0,
						activeTokens: 0,
					},
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
			console.error('❌ Dashboard stats error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to load statistics',
				message: 'An error occurred while loading system statistics',
			});
		}
	},
);

/**
 * GET /api/admin/dashboard/recent-activity
 * Recent system activity and events
 */
router.get('/recent-activity',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const limit = parseInt(req.query.limit as string) || 20;

			// Get recent activity from different sources
			// In a full implementation, you'd have an activity log system
			const activities = [
				{
					type: 'system',
					action: 'Server Started',
					details: 'Atlas API server initialized successfully',
					timestamp: new Date().toISOString(),
					severity: 'info',
				},
				{
					type: 'database',
					action: 'Connection Established',
					details: 'MongoDB connection established',
					timestamp: new Date().toISOString(),
					severity: 'info',
				},
			];

			res.json({
				success: true,
				data: {
					activities: activities.slice(0, limit),
					count: activities.length,
					hasMore: activities.length > limit,
				},
			});

		} catch (error) {
			console.error('❌ Recent activity error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to load recent activity',
				message: 'An error occurred while loading activity data',
			});
		}
	},
);

/**
 * GET /api/admin/dashboard/system-health
 * Detailed system health metrics
 */
router.get('/system-health',
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const memoryUsage = process.memoryUsage();
			const cpuUsage = process.cpuUsage();

			const health = {
				overall: 'healthy', // Would be calculated based on various metrics
				services: {
					database: {
						status: handler.isConnectionHealthy() ? 'healthy' : 'unhealthy',
						uptime: handler.getConnectionUptime(),
						latency: 0, // Would measure actual DB response time
					},
					api: {
						status: 'healthy',
						uptime: Math.floor(process.uptime() * 1000),
						memoryUsage: {
							heapUsed: memoryUsage.heapUsed,
							heapTotal: memoryUsage.heapTotal,
							external: memoryUsage.external,
							rss: memoryUsage.rss,
						},
						cpuUsage: {
							user: cpuUsage.user,
							system: cpuUsage.system,
						},
					},
					recommendations: {
						status: 'healthy',
						cacheHitRate: 0, // Would track recommendation cache performance
						averageGenerationTime: 0,
					},
					authentication: {
						status: 'healthy',
						tokenValidationRate: 100, // Would track auth success rate
						averageResponseTime: 0,
					},
				},
				alerts: [], // Would contain any active system alerts
				metrics: {
					errorRate: 0, // Would calculate from error logs
					responseTime: {
						average: 0,
						p95: 0,
						p99: 0,
					},
					throughput: {
						requestsPerSecond: 0,
						requestsPerMinute: 0,
					},
				},
			};

			res.json({
				success: true,
				data: {
					health,
					timestamp: new Date().toISOString(),
				},
			});

		} catch (error) {
			console.error('❌ System health error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to load system health',
				message: 'An error occurred while checking system health',
			});
		}
	},
);

/**
 * Helper function to format uptime in human-readable format
 */
function formatUptime(seconds: number): string {
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	const parts: string[] = [];
	if (days > 0) parts.push(`${days}d`);
	if (hours > 0) parts.push(`${hours}h`);
	if (minutes > 0) parts.push(`${minutes}m`);
	if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

	return parts.join(' ');
}

export default router;