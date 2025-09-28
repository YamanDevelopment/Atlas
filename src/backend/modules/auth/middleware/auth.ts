import type { Request, Response, NextFunction } from 'express';
import type { TokenPayload } from '../services/jwt';
import { jwtService } from '../services/jwt';

// Extend Express Request type to include user data
declare global {
	namespace Express {
		interface Request {
			user?: TokenPayload;
		}
	}
}

/**
 * Authentication Middleware
 *
 * How it works:
 * 1. Checks for Authorization header with Bearer token
 * 2. Verifies the JWT token using our JWT service
 * 3. Adds user info to req.user for use in route handlers
 * 4. Returns 401 if token is missing or invalid
 */

/**
 * Main authentication middleware - requires valid JWT token
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
	try {
		console.log(`🔐 Auth check for ${req.method} ${req.path}`);

		// Check for Authorization header
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			console.warn('🚫 No Authorization header provided');
			res.status(401).json({
				error: 'Authentication required',
				message: 'Please provide an Authorization header with a valid token',
			});
			return;
		}

		// Check Bearer format
		if (!authHeader.startsWith('Bearer ')) {
			console.warn('🚫 Invalid Authorization header format');
			res.status(401).json({
				error: 'Invalid token format',
				message: 'Authorization header must be in format: Bearer <token>',
			});
			return;
		}

		// Extract token
		const token = authHeader.substring(7); // Remove "Bearer " prefix
		if (!token) {
			console.warn('🚫 Empty token provided');
			res.status(401).json({
				error: 'Invalid token',
				message: 'Token cannot be empty',
			});
			return;
		}

		// Verify token
		const decoded = jwtService.verifyAccessToken(token);
		if (!decoded) {
			console.warn('🚫 Invalid or expired token');
			res.status(401).json({
				error: 'Invalid token',
				message: 'Token is invalid or expired. Please login again.',
			});
			return;
		}

		// Add user info to request
		req.user = decoded;
		console.log(`✅ Authenticated user: ${decoded.username} (${decoded.userId})`);

		next();
	} catch (error) {
		console.error('❌ Error in auth middleware:', error);
		res.status(500).json({
			error: 'Authentication error',
			message: 'An error occurred while verifying your token',
		});
	}
};

/**
 * Optional authentication middleware - doesn't require token but adds user if present
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
	try {
		const authHeader = req.headers.authorization;

		if (authHeader && authHeader.startsWith('Bearer ')) {
			const token = authHeader.substring(7);
			const decoded = jwtService.verifyAccessToken(token);

			if (decoded) {
				req.user = decoded;
				console.log(`✅ Optional auth - user identified: ${decoded.username}`);
			} else {
				console.log('⚠️ Optional auth - invalid token provided, continuing without user');
			}
		} else {
			console.log('ℹ️ Optional auth - no token provided, continuing without user');
		}

		next();
	} catch (error) {
		console.error('❌ Error in optional auth middleware:', error);
		// Don't fail the request for optional auth
		next();
	}
};

/**
 * Middleware to check if user owns the resource (for user-specific routes)
 */
export const requireOwnership = (userIdParam: string = 'userId') => {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.user) {
			res.status(401).json({
				error: 'Authentication required',
				message: 'This middleware requires requireAuth to be used first',
			});
			return;
		}

		const requestedUserId = req.params[userIdParam];
		if (!requestedUserId) {
			res.status(400).json({
				error: 'Invalid request',
				message: `Missing ${userIdParam} parameter`,
			});
			return;
		}

		if (req.user.userId !== requestedUserId) {
			console.warn(`🚫 User ${req.user.username} attempted to access resource owned by ${requestedUserId}`);
			res.status(403).json({
				error: 'Access denied',
				message: 'You can only access your own resources',
			});
			return;
		}

		console.log(`✅ Ownership verified for user: ${req.user.username}`);
		next();
	};
};

/**
 * Middleware to extract user ID from token and add to params (useful for some routes)
 */
export const extractUserId = (req: Request, res: Response, next: NextFunction): void => {
	if (req.user) {
		req.params.currentUserId = req.user.userId;
		console.log(`ℹ️ Added currentUserId to params: ${req.user.userId}`);
	}
	next();
};

/**
 * Middleware for admin-only routes (if you need this later)
 * Note: You'd need to add isAdmin field to your User schema
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
	if (!req.user) {
		res.status(401).json({
			error: 'Authentication required',
			message: 'This middleware requires requireAuth to be used first',
		});
		return;
	}

	// For now, we'll just check if it's a specific admin user
	// In production, you'd add an isAdmin field to your User schema
	const adminUsernames = ['admin', 'administrator']; // Configure this as needed

	if (!adminUsernames.includes(req.user.username.toLowerCase())) {
		console.warn(`🚫 User ${req.user.username} attempted to access admin-only resource`);
		res.status(403).json({
			error: 'Admin access required',
			message: 'This resource requires administrator privileges',
		});
		return;
	}

	console.log(`✅ Admin access granted for user: ${req.user.username}`);
	next();
};