import type { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../../auth/middleware/auth';
import { User } from '../../../database/schemas/User';
import type { TokenPayload } from '../../../auth/services/jwt';

/**
 * Admin Authentication Middleware
 * Extends the regular auth middleware to also check for admin role
 */

interface AuthenticatedRequest extends Request {
	user?: TokenPayload & {
		role?: string;
	};
}

/**
 * Middleware to require admin authentication
 * Must be used after requireAuth middleware
 */
export const requireAdmin = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		// First ensure user is authenticated
		await new Promise<void>((resolve, reject) => {
			requireAuth(req, res, (error?: any) => {
				if (error) reject(error);
				else resolve();
			});
		});

		// Check if user exists and has admin role
		if (!req.user?.userId) {
			res.status(401).json({
				success: false,
				error: 'Authentication required',
				message: 'Please login to access admin features',
			});
			return;
		}

		// Get user from database to check role
		const user = await User.findById(req.user.userId);

		if (!user) {
			res.status(401).json({
				success: false,
				error: 'User not found',
				message: 'User account no longer exists',
			});
			return;
		}

		// Check admin role
		if (user.role !== 'admin') {
			res.status(403).json({
				success: false,
				error: 'Admin access required',
				message: 'This endpoint requires administrator privileges',
			});
			return;
		}

		// Add user data to request for use in routes
		req.user = {
			...req.user,
			userId: (user._id as any).toString(),
			username: user.username,
			email: user.email,
			role: user.role,
		};

		next();
	} catch (error) {
		console.error('❌ Admin auth middleware error:', error);
		res.status(500).json({
			success: false,
			error: 'Authentication error',
			message: 'An error occurred during admin authentication',
		});
	}
};

/**
 * Middleware to optionally check admin status
 * Adds isAdmin flag to request without blocking non-admins
 */
export const checkAdmin = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		// Ensure user is authenticated first
		if (!req.user?.userId) {
			next();
			return;
		}

		// Get user and check role
		const user = await User.findById(req.user.userId);
		if (user && user.role === 'admin') {
			req.user.role = 'admin';
		}

		next();
	} catch (error) {
		console.error('❌ Check admin middleware error:', error);
		// Don't fail the request, just continue without admin status
		next();
	}
};

export default requireAdmin;