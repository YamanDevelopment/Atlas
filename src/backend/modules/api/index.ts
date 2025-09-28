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

	// Mount all routes
	router.use('/auth', authRoutes);
	router.use('/events', eventsRoutes);
	router.use('/organizations', organizationsRoutes);
	router.use('/labs', labsRoutes);
	router.use('/users', usersRoutes);
	router.use('/interests', interestsRoutes);
	router.use('/tags', tagsRoutes);
	router.use('/recommendations', recommendationsRoutes);

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
				health: '/api/health',
			},
			documentation: 'https://github.com/your-org/atlas/docs/api',
		});
	});

	return router;
}

export default router;