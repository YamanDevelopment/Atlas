import { Router } from 'express';
import type Handler from '../database/services/handler';

// Import all route modules
import authRoutes from './routes/auth';
import eventsRoutes, { setHandler as setEventsHandler } from './routes/events';
import organizationsRoutes, { setHandler as setOrganizationsHandler } from './routes/organizations';
import labsRoutes, { setHandler as setLabsHandler } from './routes/labs';
import usersRoutes, { setHandler as setUsersHandler } from './routes/users';
import interestsRoutes, { setHandler as setInterestsHandler } from './routes/interests';
import tagsRoutes, { setHandler as setTagsHandler } from './routes/tags';
import recommendationsRoutes, { setHandler as setRecommendationsHandler } from './routes/recommendations';
import involvementRoutes from './routes/involvement';

// Import admin routes
import adminDashboardRoutes, { setHandler as setAdminDashboardHandler } from './routes/admin/dashboard';
import adminUsersRoutes, { setHandler as setAdminUsersHandler } from './routes/admin/users';
import adminContentRoutes from './routes/admin/content';
import adminAnalyticsRoutes, { setHandler as setAdminAnalyticsHandler } from './routes/admin/analytics';

const router = Router();

/**
 * Initialize API routes with handler instance
 * @param handler Database handler instance
 */
export function initializeApiRoutes(handler: Handler): Router {
	// Set handler for all route modules that need it
	setEventsHandler(handler);
	setOrganizationsHandler(handler);
	setLabsHandler(handler);
	setUsersHandler(handler);
	setInterestsHandler(handler);
	setTagsHandler(handler);
	setRecommendationsHandler(handler);

	// Set handler for admin routes
	setAdminDashboardHandler(handler);
	setAdminUsersHandler(handler);
	setAdminAnalyticsHandler(handler);

	// Mount all public routes
	router.use('/auth', authRoutes);
	router.use('/events', eventsRoutes);
	router.use('/organizations', organizationsRoutes);
	router.use('/labs', labsRoutes);
	router.use('/users', usersRoutes);
	router.use('/interests', interestsRoutes);
	router.use('/tags', tagsRoutes);
	router.use('/recommendations', recommendationsRoutes);
	router.use('/involvement', involvementRoutes);

	// Mount admin routes (protected by requireAdmin middleware)
	router.use('/admin/dashboard', adminDashboardRoutes);
	router.use('/admin/users', adminUsersRoutes);
	router.use('/admin/content', adminContentRoutes);
	router.use('/admin/analytics', adminAnalyticsRoutes);

	// API health check endpoint
	router.get('/health', (req, res) => {
		res.json({
			success: true,
			message: 'Atlas API is running',
			timestamp: new Date().toISOString(),
			version: '1.0.0',
		});
	});

	// API info endpoint
	router.get('/', (req, res) => {
		res.json({
			success: true,
			message: 'Welcome to the Atlas API',
			version: '1.0.0',
			endpoints: {
				auth: '/api/auth',
				events: '/api/events',
				organizations: '/api/organizations',
				labs: '/api/labs',
				users: '/api/users',
				interests: '/api/interests',
				tags: '/api/tags',
				recommendations: '/api/recommendations',
				involvement: '/api/involvement',
				health: '/api/health',
				admin: {
					dashboard: '/api/admin/dashboard',
					users: '/api/admin/users',
					content: '/api/admin/content',
					analytics: '/api/admin/analytics',
				},
			},
			documentation: 'https://github.com/your-org/atlas/docs/api',
		});
	});

	return router;
}

export default router;