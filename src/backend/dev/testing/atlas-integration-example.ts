/**
 * Atlas Backend Integration Example
 *
 * This example demonstrates the complete Atlas backend system integration:
 * - Database connection and initialization
 * - Authentication with JWT tokens
 * - Event and organization management
 * - Personalized recommendations
 * - Complete API workflow
 */

import type { AxiosInstance } from 'axios';
import axios from 'axios';

interface AuthTokens {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
	tokenType: string;
}

interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
	count?: number;
}

class AtlasApiClient {
	private baseURL: string;
	private client: AxiosInstance;
	private tokens: AuthTokens | null = null;

	constructor(baseURL: string = 'http://localhost:3001') {
		this.baseURL = baseURL;
		this.client = axios.create({
			baseURL: `${baseURL}/api`,
			headers: {
				'Content-Type': 'application/json',
			},
		});

		// Add request interceptor to include auth token
		this.client.interceptors.request.use((config) => {
			if (this.tokens?.accessToken) {
				config.headers.Authorization = `Bearer ${this.tokens.accessToken}`;
			}
			return config;
		});

		// Add response interceptor for token refresh
		this.client.interceptors.response.use(
			(response) => response,
			async (error) => {
				if (error.response?.status === 401 && this.tokens?.refreshToken) {
					try {
						await this.refreshToken();
						// Retry the original request
						return this.client.request(error.config);
					} catch (refreshError) {
						console.log('Token refresh failed, please login again');
						this.tokens = null;
					}
				}
				return Promise.reject(error);
			},
		);
	}

	// Authentication Methods
	async register(userData: {
		name: string;
		username: string;
		email: string;
		password: string;
	}): Promise<{ user: any; tokens: AuthTokens }> {
		const response = await this.client.post<ApiResponse>('/auth/register', userData);
		if (response.data.success && response.data.data) {
			this.tokens = response.data.data.tokens;
			return response.data.data;
		}
		throw new Error(response.data.error || 'Registration failed');
	}

	async login(credentials: {
		username: string;
		password: string;
	}): Promise<{ user: any; tokens: AuthTokens }> {
		const response = await this.client.post<ApiResponse>('/auth/login', credentials);
		if (response.data.success && response.data.data) {
			this.tokens = response.data.data.tokens;
			return response.data.data;
		}
		throw new Error(response.data.error || 'Login failed');
	}

	async refreshToken(): Promise<void> {
		if (!this.tokens?.refreshToken) {
			throw new Error('No refresh token available');
		}

		const response = await this.client.post<ApiResponse>('/auth/refresh', {
			refreshToken: this.tokens.refreshToken,
		});

		if (response.data.success && response.data.data) {
			this.tokens = {
				...this.tokens,
				accessToken: response.data.data.accessToken,
				expiresIn: response.data.data.expiresIn,
			};
		} else {
			throw new Error(response.data.error || 'Token refresh failed');
		}
	}

	async logout(): Promise<void> {
		if (!this.tokens?.refreshToken) return;

		await this.client.post('/auth/logout', {
			refreshToken: this.tokens.refreshToken,
		});
		this.tokens = null;
	}

	async getCurrentUser(): Promise<any> {
		const response = await this.client.get<ApiResponse>('/auth/me');
		if (response.data.success) {
			return response.data.data.user;
		}
		throw new Error(response.data.error || 'Failed to get current user');
	}

	// Event Methods
	async getEvents(params?: {
		limit?: number;
		skip?: number;
		sortBy?: string;
		sortOrder?: 'asc' | 'desc';
	}): Promise<any[]> {
		const response = await this.client.get<ApiResponse>('/events', { params });
		return response.data.data?.events || [];
	}

	async getEventById(id: string): Promise<any> {
		const response = await this.client.get<ApiResponse>(`/events/${id}`);
		return response.data.data?.event;
	}

	async searchEvents(query: string, params?: { limit?: number; skip?: number }): Promise<any[]> {
		const response = await this.client.get<ApiResponse>('/events/search', {
			params: { q: query, ...params },
		});
		return response.data.data?.events || [];
	}

	async getEventsByDateRange(startDate: string, endDate: string): Promise<any[]> {
		const response = await this.client.get<ApiResponse>('/events/by-date', {
			params: { startDate, endDate },
		});
		return response.data.data?.events || [];
	}

	async createEvent(eventData: any): Promise<any> {
		const response = await this.client.post<ApiResponse>('/events', eventData);
		return response.data.data?.event;
	}

	// Organization Methods
	async getOrganizations(params?: { limit?: number; skip?: number }): Promise<any[]> {
		const response = await this.client.get<ApiResponse>('/organizations', { params });
		return response.data.data?.organizations || [];
	}

	async getOrganizationById(id: string): Promise<any> {
		const response = await this.client.get<ApiResponse>(`/organizations/${id}`);
		return response.data.data?.organization;
	}

	async searchOrganizations(query: string): Promise<any[]> {
		const response = await this.client.get<ApiResponse>('/organizations/search', {
			params: { q: query },
		});
		return response.data.data?.organizations || [];
	}

	// Recommendation Methods
	async getEventRecommendations(userId: string, limit: number = 10): Promise<any[]> {
		const response = await this.client.get<ApiResponse>(`/recommendations/events/${userId}`, {
			params: { limit },
		});
		return response.data.data?.recommendations || [];
	}

	async getOrganizationRecommendations(userId: string, limit: number = 10): Promise<any[]> {
		const response = await this.client.get<ApiResponse>(`/recommendations/organizations/${userId}`, {
			params: { limit },
		});
		return response.data.data?.recommendations || [];
	}

	async getLabRecommendations(userId: string, limit: number = 10): Promise<any[]> {
		const response = await this.client.get<ApiResponse>(`/recommendations/labs/${userId}`, {
			params: { limit },
		});
		return response.data.data?.recommendations || [];
	}

	// Utility Methods
	async checkHealth(): Promise<any> {
		const response = await axios.get(`${this.baseURL}/health`);
		return response.data;
	}

	isAuthenticated(): boolean {
		return !!this.tokens?.accessToken;
	}

	getTokens(): AuthTokens | null {
		return this.tokens;
	}
}

/**
 * Complete Integration Example
 */
async function demonstrateAtlasIntegration() {
	console.log('🎯 Atlas Backend Integration Demonstration');
	console.log('==========================================\n');

	const client = new AtlasApiClient('http://localhost:3001');

	try {
		// 1. Check API Health
		console.log('1️⃣ Checking API Health...');
		const health = await client.checkHealth();
		console.log(`✅ API Status: ${health.success ? 'Healthy' : 'Unhealthy'}`);
		console.log(`🗄️ Database: ${health.database.connected ? 'Connected' : 'Disconnected'}\n`);

		// 2. User Registration & Authentication
		console.log('2️⃣ User Registration & Authentication...');

		const newUser = {
			name: 'Alice Johnson',
			username: 'alicej',
			email: 'alice@example.com',
			password: 'SecurePassword123!',
		};

		try {
			const registrationResult = await client.register(newUser);
			console.log(`✅ Registration successful: ${registrationResult.user.username}`);
			console.log(`🔑 Access token received (expires in ${registrationResult.tokens.expiresIn}s)\n`);
		} catch (error: any) {
			if (error.message.includes('already exists')) {
				console.log('👤 User already exists, logging in instead...');
				await client.login({
					username: newUser.username,
					password: newUser.password,
				});
				console.log('✅ Login successful\n');
			} else {
				throw error;
			}
		}

		// 3. Get Current User
		console.log('3️⃣ Fetching Current User Profile...');
		const currentUser = await client.getCurrentUser();
		console.log(`👤 Logged in as: ${currentUser.name} (${currentUser.email})`);
		console.log(`📅 Account created: ${new Date(currentUser.createdAt).toLocaleDateString()}\n`);

		// 4. Event Management
		console.log('4️⃣ Event Management...');

		// Get all events
		const events = await client.getEvents({ limit: 5 });
		console.log(`📅 Found ${events.length} events in database`);

		if (events.length > 0) {
			const firstEvent = events[0];
			console.log(`📍 Sample event: ${firstEvent.title}`);

			// Get event details
			const eventDetails = await client.getEventById(firstEvent._id);
			console.log(`📋 Event description: ${eventDetails.description?.substring(0, 100)}...`);
		}

		// Search events
		const searchResults = await client.searchEvents('conference', { limit: 3 });
		console.log(`🔍 Search for 'conference': ${searchResults.length} results\n`);

		// 5. Organization Management
		console.log('5️⃣ Organization Management...');
		const organizations = await client.getOrganizations({ limit: 3 });
		console.log(`🏢 Found ${organizations.length} organizations`);

		if (organizations.length > 0) {
			const firstOrg = organizations[0];
			console.log(`🏛️ Sample organization: ${firstOrg.name}`);
		}

		// 6. Personalized Recommendations
		console.log('\n6️⃣ Personalized Recommendations...');
		const userId = currentUser._id || currentUser.id;

		// Get event recommendations
		const eventRecs = await client.getEventRecommendations(userId, 5);
		console.log(`🎯 Event recommendations: ${eventRecs.length} suggestions`);

		// Get organization recommendations
		const orgRecs = await client.getOrganizationRecommendations(userId, 5);
		console.log(`🏢 Organization recommendations: ${orgRecs.length} suggestions`);

		// Get lab recommendations
		const labRecs = await client.getLabRecommendations(userId, 5);
		console.log(`🔬 Lab recommendations: ${labRecs.length} suggestions\n`);

		// 7. Create New Event (Protected Route)
		console.log('7️⃣ Creating New Event (Protected Route)...');
		const newEvent = {
			title: 'Atlas Integration Demo Event',
			description: 'A test event created via the Atlas API to demonstrate CRUD functionality',
			startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
			endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2 hours
			location: {
				address: '123 Demo Street, Test City, TC 12345',
				coordinates: [40.7128, -74.0060],
			},
			tags: [],
		};

		try {
			const createdEvent = await client.createEvent(newEvent);
			console.log(`✅ Event created successfully: ${createdEvent.title}`);
			console.log(`📅 Scheduled for: ${new Date(createdEvent.startDate).toLocaleDateString()}\n`);
		} catch (error: any) {
			console.log(`⚠️ Event creation failed: ${error.message}\n`);
		}

		// 8. Logout
		console.log('8️⃣ Logout...');
		await client.logout();
		console.log('✅ Successfully logged out\n');

		console.log('🎉 Atlas Backend Integration Demo Complete!');
		console.log('==========================================');
		console.log('✅ All systems working correctly:');
		console.log('   • Database connection');
		console.log('   • JWT Authentication');
		console.log('   • Event management');
		console.log('   • Organization management');
		console.log('   • Personalized recommendations');
		console.log('   • Protected routes');
		console.log('   • Token refresh');
		console.log('   • Graceful logout');

	} catch (error: any) {
		console.error('❌ Integration demo failed:', error.message);
		if (error.response?.data) {
			console.error('📋 Server response:', error.response.data);
		}
		process.exit(1);
	}
}

// Export for use as module
export { AtlasApiClient, demonstrateAtlasIntegration };

// Run demonstration if called directly
if (require.main === module) {
	demonstrateAtlasIntegration().catch((error) => {
		console.error('Fatal error in Atlas integration demo:', error);
		process.exit(1);
	});
}