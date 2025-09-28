import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface TokenPayload {
	userId: string;
	username: string;
	email: string;
	iat?: number;
	exp?: number;
}

export interface TokenPair {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}

export interface RefreshTokenData {
	userId: string;
	tokenId: string;
	expiresAt: Date;
}

/**
 * JWT Service for handling authentication tokens
 *
 * How it works:
 * 1. Access tokens are short-lived (15 minutes) and contain user info
 * 2. Refresh tokens are long-lived (7 days) and used to get new access tokens
 * 3. All tokens are signed with JWT_SECRET from environment
 * 4. Refresh tokens are stored in memory (in production, use Redis/database)
 */
export class JWTService {
	private readonly JWT_SECRET: string;
	private readonly ACCESS_TOKEN_EXPIRES_IN = '15m'; // 15 minutes
	private readonly REFRESH_TOKEN_EXPIRES_IN = '7d'; // 7 days

	// In-memory storage for refresh tokens (use Redis in production)
	private refreshTokenStore = new Map<string, RefreshTokenData>();

	constructor() {
		this.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

		if (!process.env.JWT_SECRET) {
			console.warn('⚠️  JWT_SECRET not set in environment variables, using default (NOT SECURE FOR PRODUCTION)');
		}
	}

	/**
	 * Generate both access and refresh tokens for a user
	 */
	generateTokenPair(user: { id: string; username: string; email: string }): TokenPair {
		console.log(`🔐 Generating token pair for user: ${user.username}`);

		// Create payload for access token
		const payload: TokenPayload = {
			userId: user.id,
			username: user.username,
			email: user.email,
		};

		// Generate access token (short-lived, contains user info)
		const accessToken = jwt.sign(payload, this.JWT_SECRET, {
			expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
			issuer: 'atlas-api',
			audience: 'atlas-client',
		});

		// Generate refresh token (long-lived, just for getting new access tokens)
		const refreshTokenId = crypto.randomBytes(32).toString('hex');
		const refreshToken = jwt.sign(
			{ userId: user.id, tokenId: refreshTokenId },
			this.JWT_SECRET,
			{
				expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
				issuer: 'atlas-api',
				audience: 'atlas-client',
			},
		);

		// Store refresh token data
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
		this.refreshTokenStore.set(refreshTokenId, {
			userId: user.id,
			tokenId: refreshTokenId,
			expiresAt,
		});

		console.log(`✅ Generated tokens for user ${user.username} (refresh token expires: ${expiresAt.toISOString()})`);

		return {
			accessToken,
			refreshToken,
			expiresIn: 15 * 60, // 15 minutes in seconds
		};
	}

	/**
	 * Verify and decode an access token
	 */
	verifyAccessToken(token: string): TokenPayload | null {
		try {
			const decoded = jwt.verify(token, this.JWT_SECRET, {
				issuer: 'atlas-api',
				audience: 'atlas-client',
			}) as TokenPayload;

			return decoded;
		} catch (error) {
			if (error instanceof jwt.JsonWebTokenError) {
				console.warn(`🚫 Invalid access token: ${error.message}`);
			} else if (error instanceof jwt.TokenExpiredError) {
				console.warn('🕐 Access token expired');
			} else {
				console.error('❌ Error verifying access token:', error);
			}
			return null;
		}
	}

	/**
	 * Verify refresh token and generate new access token
	 */
	refreshAccessToken(refreshToken: string): { accessToken: string; expiresIn: number } | null {
		try {
			console.log('🔄 Attempting to refresh access token');

			// Verify refresh token
			const decoded = jwt.verify(refreshToken, this.JWT_SECRET, {
				issuer: 'atlas-api',
				audience: 'atlas-client',
			}) as any;

			// Check if refresh token exists in our store
			const tokenData = this.refreshTokenStore.get(decoded.tokenId);
			if (!tokenData || tokenData.userId !== decoded.userId) {
				console.warn('🚫 Refresh token not found in store or user mismatch');
				return null;
			}

			// Check if refresh token is expired
			if (tokenData.expiresAt < new Date()) {
				console.warn('🕐 Refresh token expired');
				this.refreshTokenStore.delete(decoded.tokenId);
				return null;
			}

			// Generate new access token (need to get user info - this would typically come from database)
			// For now, we'll create a basic payload
			const newAccessToken = jwt.sign(
				{
					userId: decoded.userId,
					// Note: In production, you'd fetch username/email from database
					username: 'user', // This should be fetched from DB
					email: 'user@example.com', // This should be fetched from DB
				} as TokenPayload,
				this.JWT_SECRET,
				{
					expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
					issuer: 'atlas-api',
					audience: 'atlas-client',
				},
			);

			console.log(`✅ Refreshed access token for user: ${decoded.userId}`);

			return {
				accessToken: newAccessToken,
				expiresIn: 15 * 60, // 15 minutes in seconds
			};
		} catch (error) {
			console.warn('🚫 Invalid refresh token:', error instanceof Error ? error.message : error);
			return null;
		}
	}

	/**
	 * Revoke a refresh token (logout)
	 */
	revokeRefreshToken(refreshToken: string): boolean {
		try {
			const decoded = jwt.verify(refreshToken, this.JWT_SECRET) as any;
			const wasRevoked = this.refreshTokenStore.delete(decoded.tokenId);

			if (wasRevoked) {
				console.log(`🗑️ Revoked refresh token for user: ${decoded.userId}`);
			} else {
				console.warn('⚠️ Attempted to revoke non-existent refresh token');
			}

			return wasRevoked;
		} catch (error) {
			console.warn('🚫 Error revoking refresh token:', error instanceof Error ? error.message : error);
			return false;
		}
	}

	/**
	 * Revoke all refresh tokens for a user (logout from all devices)
	 */
	revokeAllUserTokens(userId: string): number {
		let revokedCount = 0;

		for (const [tokenId, tokenData] of this.refreshTokenStore.entries()) {
			if (tokenData.userId === userId) {
				this.refreshTokenStore.delete(tokenId);
				revokedCount++;
			}
		}

		console.log(`🗑️ Revoked ${revokedCount} refresh tokens for user: ${userId}`);
		return revokedCount;
	}

	/**
	 * Clean up expired refresh tokens
	 */
	cleanupExpiredTokens(): number {
		const now = new Date();
		let cleanedCount = 0;

		for (const [tokenId, tokenData] of this.refreshTokenStore.entries()) {
			if (tokenData.expiresAt < now) {
				this.refreshTokenStore.delete(tokenId);
				cleanedCount++;
			}
		}

		if (cleanedCount > 0) {
			console.log(`🧹 Cleaned up ${cleanedCount} expired refresh tokens`);
		}

		return cleanedCount;
	}

	/**
	 * Get token statistics (for monitoring)
	 */
	getTokenStats(): {
		totalRefreshTokens: number;
		expiredTokens: number;
		uniqueUsers: number;
		} {
		const now = new Date();
		let expiredCount = 0;
		const uniqueUsers = new Set<string>();

		for (const tokenData of this.refreshTokenStore.values()) {
			if (tokenData.expiresAt < now) {
				expiredCount++;
			}
			uniqueUsers.add(tokenData.userId);
		}

		return {
			totalRefreshTokens: this.refreshTokenStore.size,
			expiredTokens: expiredCount,
			uniqueUsers: uniqueUsers.size,
		};
	}
}

// Export singleton instance
export const jwtService = new JWTService();

// Auto-cleanup expired tokens every hour
setInterval(() => {
	jwtService.cleanupExpiredTokens();
}, 60 * 60 * 1000);