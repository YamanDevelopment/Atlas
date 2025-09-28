/**
 * Authentication System Configuration
 *
 * This file centralizes all auth-related configuration
 * and provides easy exports for the entire auth system
 */

// Environment configuration
export const authConfig = {
	// JWT Configuration
	jwt: {
		secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
		accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
		refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
		issuer: process.env.JWT_ISSUER || 'atlas-api',
		audience: process.env.JWT_AUDIENCE || 'atlas-client',
	},

	// Password Policy
	password: {
		minLength: 6,
		requireUppercase: true,
		requireLowercase: true,
		requireNumbers: true,
		requireSpecialChars: true,
		saltRounds: 12,
	},

	// Rate Limiting Configuration
	rateLimit: {
		// Authentication endpoints (stricter)
		auth: {
			windowMs: 15 * 60 * 1000, // 15 minutes
			maxRequests: 5,
		},
		// Registration (prevent spam)
		register: {
			windowMs: 60 * 60 * 1000, // 1 hour
			maxRequests: 3,
		},
		// General API usage
		api: {
			windowMs: 15 * 60 * 1000, // 15 minutes
			maxRequests: 100,
		},
		// Search endpoints
		search: {
			windowMs: 60 * 1000, // 1 minute
			maxRequests: 30,
		},
	},

	// Session Configuration
	session: {
		// How often to clean up expired tokens
		cleanupIntervalMs: 60 * 60 * 1000, // 1 hour
		// Maximum number of concurrent sessions per user (0 = unlimited)
		maxConcurrentSessions: 0,
	},

	// Security Headers
	security: {
		enableCORS: true,
		corsOptions: {
			origin: process.env.FRONTEND_URL || 'http://localhost:3000',
			credentials: true,
		},
		enableHelmet: true,
		enableHSTS: process.env.NODE_ENV === 'production',
	},

	// Validation Settings
	validation: {
		// User fields
		user: {
			nameMinLength: 2,
			nameMaxLength: 100,
			usernameMinLength: 3,
			usernameMaxLength: 30,
		},
		// Pagination limits
		pagination: {
			defaultLimit: 10,
			maxLimit: 100,
		},
	},
};

/**
 * Validate authentication configuration
 */
export function validateAuthConfig(): {
	isValid: boolean;
	errors: string[];
	warnings: string[];
	} {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Check JWT secret
	if (!process.env.JWT_SECRET) {
		warnings.push('JWT_SECRET not set in environment - using default (not secure for production)');
	} else if (process.env.JWT_SECRET.length < 32) {
		warnings.push('JWT_SECRET is shorter than 32 characters - consider using a longer secret');
	}

	// Check environment
	if (process.env.NODE_ENV === 'production') {
		if (!process.env.JWT_SECRET) {
			errors.push('JWT_SECRET must be set in production environment');
		}
		if (!process.env.FRONTEND_URL) {
			warnings.push('FRONTEND_URL not set - CORS will use default localhost:3000');
		}
	}

	// Validate rate limits
	Object.entries(authConfig.rateLimit).forEach(([key, config]) => {
		if (config.maxRequests <= 0) {
			errors.push(`Rate limit ${key} must have maxRequests > 0`);
		}
		if (config.windowMs <= 0) {
			errors.push(`Rate limit ${key} must have windowMs > 0`);
		}
	});

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * Log authentication system startup info
 */
export function logAuthStartup(): void {
	console.log('🔐 Atlas Authentication System');
	console.log('='.repeat(40));

	const validation = validateAuthConfig();

	if (!validation.isValid) {
		console.error('❌ Authentication configuration errors:');
		validation.errors.forEach(error => console.error(`   • ${error}`));
		throw new Error('Invalid authentication configuration');
	}

	if (validation.warnings.length > 0) {
		console.warn('⚠️  Authentication configuration warnings:');
		validation.warnings.forEach(warning => console.warn(`   • ${warning}`));
	}

	console.log('✅ Authentication system configured successfully');
	console.log(`   • JWT Access Token Expiry: ${authConfig.jwt.accessTokenExpiry}`);
	console.log(`   • JWT Refresh Token Expiry: ${authConfig.jwt.refreshTokenExpiry}`);
	console.log(`   • Password Min Length: ${authConfig.password.minLength}`);
	console.log(`   • Auth Rate Limit: ${authConfig.rateLimit.auth.maxRequests}/${authConfig.rateLimit.auth.windowMs}ms`);
	console.log(`   • API Rate Limit: ${authConfig.rateLimit.api.maxRequests}/${authConfig.rateLimit.api.windowMs}ms`);
	console.log(`   • Environment: ${process.env.NODE_ENV || 'development'}`);
	console.log('');
}

// Default export
export default authConfig;