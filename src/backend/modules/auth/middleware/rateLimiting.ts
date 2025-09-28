import type { Request, Response, NextFunction } from 'express';

/**
 * Rate Limiting Middleware
 *
 * How it works:
 * 1. Tracks requests by IP address in memory
 * 2. Different limits for different types of endpoints
 * 3. Uses sliding window approach
 * 4. Returns 429 (Too Many Requests) when limit exceeded
 *
 * Note: In production, use Redis for distributed rate limiting
 */

interface RateLimitEntry {
	requests: number[];
	lastReset: number;
}

class RateLimiter {
	private store = new Map<string, RateLimitEntry>();
	private cleanupInterval: NodeJS.Timeout;

	constructor() {
		// Clean up old entries every 5 minutes
		this.cleanupInterval = setInterval(() => {
			this.cleanup();
		}, 5 * 60 * 1000);
	}

	private cleanup(): void {
		const now = Date.now();
		const oneHour = 60 * 60 * 1000;

		for (const [key, entry] of this.store.entries()) {
			if (now - entry.lastReset > oneHour) {
				this.store.delete(key);
			}
		}
	}

	private getKey(req: Request): string {
		// Use IP address as the key (you might want to use user ID for authenticated requests)
		const ip = req.ip || req.connection.remoteAddress || 'unknown';
		return `${ip}:${req.path}`;
	}

	checkLimit(req: Request, windowMs: number, maxRequests: number): boolean {
		const key = this.getKey(req);
		const now = Date.now();

		let entry = this.store.get(key);
		if (!entry) {
			entry = { requests: [], lastReset: now };
			this.store.set(key, entry);
		}

		// Remove requests outside the window
		entry.requests = entry.requests.filter(timestamp => now - timestamp < windowMs);

		// Check if limit exceeded
		if (entry.requests.length >= maxRequests) {
			console.warn(`🚫 Rate limit exceeded for ${key}: ${entry.requests.length}/${maxRequests} requests`);
			return false;
		}

		// Add current request
		entry.requests.push(now);
		entry.lastReset = now;

		console.log(`✅ Rate limit check passed for ${key}: ${entry.requests.length}/${maxRequests} requests`);
		return true;
	}

	getRemainingRequests(req: Request, windowMs: number, maxRequests: number): {
		remaining: number;
		resetTime: number;
	} {
		const key = this.getKey(req);
		const now = Date.now();

		const entry = this.store.get(key);
		if (!entry) {
			return { remaining: maxRequests, resetTime: now + windowMs };
		}

		// Remove requests outside the window
		const validRequests = entry.requests.filter(timestamp => now - timestamp < windowMs);
		const remaining = Math.max(0, maxRequests - validRequests.length);
		const oldestRequest = validRequests[0] || now;
		const resetTime = oldestRequest + windowMs;

		return { remaining, resetTime };
	}

	destroy(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
		}
	}
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

/**
 * Generic rate limiting middleware factory
 */
export const rateLimit = (options: {
	windowMs: number;
	maxRequests: number;
	message?: string;
	skipSuccessfulRequests?: boolean;
}) => {
	const {
		windowMs,
		maxRequests,
		message = 'Too many requests, please try again later.',
		skipSuccessfulRequests = false,
	} = options;

	return (req: Request, res: Response, next: NextFunction): void => {
		const isAllowed = rateLimiter.checkLimit(req, windowMs, maxRequests);

		if (!isAllowed) {
			const { remaining, resetTime } = rateLimiter.getRemainingRequests(req, windowMs, maxRequests);

			res.status(429).json({
				error: 'Too Many Requests',
				message,
				retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
				limit: maxRequests,
				remaining: 0,
				resetTime: new Date(resetTime).toISOString(),
			});
			return;
		}

		// Add rate limit info to response headers
		const { remaining, resetTime } = rateLimiter.getRemainingRequests(req, windowMs, maxRequests);
		res.set({
			'X-RateLimit-Limit': maxRequests.toString(),
			'X-RateLimit-Remaining': remaining.toString(),
			'X-RateLimit-Reset': new Date(resetTime).toISOString(),
		});

		// If skipSuccessfulRequests is true, we need to handle this after the response
		if (skipSuccessfulRequests) {
			const originalSend = res.send;
			res.send = function(body: any) {
				if (res.statusCode >= 400) {
					// Only count failed requests
					return originalSend.call(this, body);
				}
				// For successful requests, we would remove the request from count
				// This is complex to implement correctly, so we'll skip for now
				return originalSend.call(this, body);
			};
		}

		next();
	};
};

// Predefined rate limiters for different scenarios
export const rateLimiters = {
	// Very strict for auth endpoints (prevent brute force)
	auth: rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		maxRequests: 5, // 5 attempts per 15 minutes
		message: 'Too many login attempts, please try again in 15 minutes.',
	}),

	// Moderate for registration (prevent spam)
	register: rateLimit({
		windowMs: 60 * 60 * 1000, // 1 hour
		maxRequests: 3, // 3 registrations per hour per IP
		message: 'Too many registration attempts, please try again in an hour.',
	}),

	// More lenient for general API usage
	api: rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		maxRequests: 100, // 100 requests per 15 minutes
		message: 'Too many API requests, please try again later.',
	}),

	// Very lenient for static content
	static: rateLimit({
		windowMs: 60 * 1000, // 1 minute
		maxRequests: 60, // 60 requests per minute
		message: 'Too many requests for static content.',
	}),

	// Strict for password reset (security sensitive)
	passwordReset: rateLimit({
		windowMs: 60 * 60 * 1000, // 1 hour
		maxRequests: 3, // 3 password reset attempts per hour
		message: 'Too many password reset attempts, please try again in an hour.',
	}),

	// Moderate for search/browse endpoints
	search: rateLimit({
		windowMs: 60 * 1000, // 1 minute
		maxRequests: 30, // 30 searches per minute
		message: 'Too many search requests, please slow down.',
	}),
};

// Helper to create custom rate limiter
export const createRateLimit = (windowMs: number, maxRequests: number, message?: string) => {
	return rateLimit({ windowMs, maxRequests, message });
};

// Cleanup function for graceful shutdown
export const cleanupRateLimiter = (): void => {
	rateLimiter.destroy();
};