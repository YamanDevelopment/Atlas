/**
 * Atlas Authentication System - Main Export
 *
 * This is your complete authentication system!
 *
 * How to use:
 * 1. Import and use the routes in your Express app
 * 2. Use middleware to protect your routes
 * 3. Configure environment variables (see .env.example)
 *
 * Example integration:
 * ```
 * import { authRoutes, userRoutes, requireAuth } from './modules/auth';
 *
 * app.use('/auth', authRoutes);
 * app.use('/users', userRoutes);
 * app.use('/api/protected', requireAuth, yourProtectedRoutes);
 * ```
 */

// Routes
export { default as authRoutes } from './routes/auth';
export { default as userRoutes } from './routes/user';

// Middleware
export {
	requireAuth,
	optionalAuth,
	requireOwnership,
	requireAdmin,
	extractUserId,
} from './middleware/auth';

export {
	validate,
	validateLogin,
	validateRegister,
	validateRefreshToken,
	validateUpdateProfile,
	validateChangePassword,
	validateGetUserById,
	validatePagination,
	validationSchemas,
} from './middleware/validation';

export {
	rateLimit,
	rateLimiters,
	createRateLimit,
	cleanupRateLimiter,
} from './middleware/rateLimiting';

// Services
export { jwtService } from './services/jwt';
export type { TokenPayload, TokenPair } from './services/jwt';
export { passwordService } from './services/password';

// Configuration
export { default as authConfig, validateAuthConfig, logAuthStartup } from './config';

// Re-export types for convenience
export type { Request, Response, NextFunction } from 'express';

/**
 * Quick setup function for Express apps
 */
export function setupAuth(app: any): void {
	const authRoutes = require('./routes/auth').default;
	const userRoutes = require('./routes/user').default;

	// Mount auth routes
	app.use('/auth', authRoutes);
	app.use('/users', userRoutes);

	console.log('✅ Authentication routes mounted:');
	console.log('   • POST /auth/register - Register new user');
	console.log('   • POST /auth/login - Login user');
	console.log('   • POST /auth/refresh - Refresh access token');
	console.log('   • POST /auth/logout - Logout (single device)');
	console.log('   • POST /auth/logout-all - Logout all devices');
	console.log('   • GET  /auth/me - Get current user info');
	console.log('   • GET  /users - Search users');
	console.log('   • GET  /users/:id - Get user profile');
	console.log('   • PUT  /users/:id - Update user profile');
	console.log('   • PUT  /users/:id/password - Change password');
	console.log('   • DELETE /users/:id - Delete user');
	console.log('   • POST /users/:id/interests - Add user interest');
	console.log('   • DELETE /users/:id/interests/:interestId - Remove interest');
}