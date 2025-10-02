/**
 * OppTrack Authentication Service
 * Handles all authentication operations including login, register, token management
 * Integrates with real backend API at localhost:3001
 */

import type {
	User,
	AuthTokens,
	AuthResponse,
	LoginCredentials,
	RegisterData,
	ApiResponse,
} from '~/types/auth';

class AuthService {
	private baseURL = 'http://localhost:3001/api/auth';
	private accessToken: string | null = null;
	private refreshToken: string | null = null;

	constructor() {
		// Initialize tokens from sessionStorage on client-side only (for better persistence)
		if (typeof window !== 'undefined') {
			// Try sessionStorage first (survives page refresh, cleared on browser close)
			this.accessToken = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
			this.refreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');

			// Migrate from localStorage to sessionStorage if found
			if (localStorage.getItem('accessToken')) {
				sessionStorage.setItem('accessToken', localStorage.getItem('accessToken')!);
				sessionStorage.setItem('refreshToken', localStorage.getItem('refreshToken')!);
				localStorage.removeItem('accessToken');
				localStorage.removeItem('refreshToken');
			}
		}
	}

	/**
   * Register a new user
   */
	async register(userData: RegisterData): Promise<User> {
		try {
			const response = await fetch(`${this.baseURL}/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(userData),
			});

			const data: AuthResponse = await response.json();

			if (data.success && data.data) {
				this.setTokens(data.data.tokens);
				return data.data.user;
			} else {
				// Handle different types of errors
				let errorMessage = data.message || 'Registration failed';

				if (errorMessage.includes('Username already exists')) {
					errorMessage = 'This username is already taken. Please choose a different one.';
				} else if (errorMessage.includes('Email already exists')) {
					errorMessage = 'An account with this email already exists. Try logging in instead.';
				} else if (errorMessage.includes('Password validation failed')) {
					errorMessage = 'Password must be at least 6 characters long.';
				} else if (errorMessage.includes('validation failed')) {
					errorMessage = 'Please check that all fields are filled out correctly.';
				}

				throw new Error(errorMessage);
			}
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error('Registration failed - network error');
		}
	}

	/**
   * Login existing user
   */
	async login(credentials: LoginCredentials): Promise<User> {
		console.log('🔐 AuthService: Starting login process');
		try {
			const response = await fetch(`${this.baseURL}/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(credentials),
			});

			const data: AuthResponse = await response.json();
			console.log('🔐 AuthService: Login response received', { success: data.success, hasTokens: !!data.data?.tokens });

			if (data.success && data.data) {
				console.log('🔐 AuthService: Setting tokens');
				this.setTokens(data.data.tokens);
				console.log('🔐 AuthService: Tokens set, returning user data');
				return data.data.user;
			} else {
				// Handle different types of errors
				let errorMessage = data.message || 'Login failed';

				if (data.error === 'Invalid credentials') {
					errorMessage = 'Invalid username or password';
				} else if (errorMessage.includes('validation failed')) {
					errorMessage = 'Account data validation error. Please contact support.';
				}

				console.error('🔐 AuthService: Login failed', errorMessage);
				throw new Error(errorMessage);
			}
		} catch (error) {
			console.error('🔐 AuthService: Login error', error);
			if (error instanceof Error) {
				throw error;
			}
			throw new Error('Login failed - network error');
		}
	}

	/**
   * Get current user profile
   */
	async getCurrentUser(): Promise<User> {
		try {
			const response = await this.authenticatedRequest(`${this.baseURL}/me`);
			const data: ApiResponse<{ user: User }> = await response.json();

			if (data.success && data.data) {
				return data.data.user;
			} else {
				throw new Error(data.message || 'Failed to get user profile');
			}
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error('Failed to get user profile');
		}
	}

	/**
   * Refresh access token
   */
	async refreshAccessToken(): Promise<string> {
		if (!this.refreshToken) {
			throw new Error('No refresh token available');
		}

		try {
			const response = await fetch(`${this.baseURL}/refresh`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ refreshToken: this.refreshToken }),
			});

			const data: ApiResponse<{ accessToken: string; expiresIn: number; tokenType: string }> = await response.json();

			if (data.success && data.data) {
				this.accessToken = data.data.accessToken;
				if (import.meta.client) {
					sessionStorage.setItem('accessToken', this.accessToken);
					localStorage.setItem('accessToken', this.accessToken);
				}
				return this.accessToken;
			} else {
				// Refresh failed, clear tokens and force re-login
				this.logout();
				throw new Error('Session expired, please login again');
			}
		} catch (error) {
			this.logout();
			throw new Error('Session expired, please login again');
		}
	}

	/**
   * Logout user
   */
	async logout(): Promise<void> {
		if (this.refreshToken) {
			try {
				await fetch(`${this.baseURL}/logout`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ refreshToken: this.refreshToken }),
				});
			} catch (error) {
				console.warn('Logout request failed:', error);
			}
		}

		this.clearTokens();
	}

	/**
   * Make authenticated requests with automatic token refresh
   */
	async authenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
		if (!this.accessToken) {
			throw new Error('No access token available');
		}

		// First attempt with current token
		let response = await fetch(url, {
			...options,
			headers: {
				...options.headers,
				'Authorization': `Bearer ${this.accessToken}`,
			},
		});

		// If token expired, try to refresh and retry
		if (response.status === 401) {
			try {
				await this.refreshAccessToken();

				// Retry with new token
				response = await fetch(url, {
					...options,
					headers: {
						...options.headers,
						'Authorization': `Bearer ${this.accessToken}`,
					},
				});
			} catch (refreshError) {
				throw new Error('Authentication failed, please login again');
			}
		}

		return response;
	}

	/**
   * Set tokens in memory and storage
   */
	private setTokens(tokens: AuthTokens): void {
		console.log('🔑 AuthService: Setting tokens in memory and storage');
		this.accessToken = tokens.accessToken;
		this.refreshToken = tokens.refreshToken;

		if (typeof window !== 'undefined') {
			console.log('🔑 AuthService: Storing tokens in browser storage');
			// Store in sessionStorage for better security (clears on browser close)
			sessionStorage.setItem('accessToken', tokens.accessToken);
			sessionStorage.setItem('refreshToken', tokens.refreshToken);

			// Also store in localStorage as backup (persists longer)
			localStorage.setItem('accessToken', tokens.accessToken);
			localStorage.setItem('refreshToken', tokens.refreshToken);

			// Verify storage worked
			const storedAccess = sessionStorage.getItem('accessToken');
			console.log('🔑 AuthService: Token storage verification', {
				hasSessionToken: !!storedAccess,
				hasLocalToken: !!localStorage.getItem('accessToken'),
				isAuthenticated: this.isAuthenticated(),
			});
		}
	}

	/**
   * Clear tokens from memory and storage
   */
	private clearTokens(): void {
		this.accessToken = null;
		this.refreshToken = null;

		if (typeof window !== 'undefined') {
			// Clear from both storage locations
			sessionStorage.removeItem('accessToken');
			sessionStorage.removeItem('refreshToken');
			localStorage.removeItem('accessToken');
			localStorage.removeItem('refreshToken');
		}
	}

	/**
   * Check if user is authenticated
   */
	isAuthenticated(): boolean {
		return !!this.accessToken;
	}

	/**
   * Validate current authentication status by checking with server
   */
	async validateAuthentication(): Promise<boolean> {
		if (!this.accessToken) {
			return false;
		}

		try {
			const response = await fetch(`${this.baseURL}/session`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${this.accessToken}`,
				},
			});

			const data: ApiResponse<{ user: User; tokenValid: boolean }> = await response.json();

			if (data.success && data.data?.tokenValid) {
				return true;
			} else {
				// Token is invalid, clear it
				this.clearTokens();
				return false;
			}
		} catch (error) {
			// Network or other error, assume token is invalid
			this.clearTokens();
			return false;
		}
	}

	/**
   * Get current access token
   */
	getAccessToken(): string | null {
		return this.accessToken;
	}
}

// Export singleton instance
export const authService = new AuthService();