/**
 * OppTrack API Service
 * Handles all non-auth API calls including events, clubs, recommendations
 * Uses REAL backend API - NO fallback data
 */

import type { Event, Club, Professor, ApiResponse } from '~/types/auth';
import { authService } from './auth';

class ApiService {
	private baseURL = 'http://localhost:3001/api';

	/**
	 * Generic GET request
	 */
	async get(endpoint: string): Promise<ApiResponse> {
		console.log(`📡 API GET request to: ${this.baseURL}${endpoint}`);
		const response = await authService.authenticatedRequest(
			`${this.baseURL}${endpoint}`,
		);
		const data = await response.json();

		// Log organization data specifically
		if (endpoint.includes('organizations') && data.success && data.data.organizations) {
			console.log(`🏢 Received ${data.data.organizations.length} organizations from API`);
		}

		return data;
	}

	/**
	 * Generic POST request
	 */
	async post(endpoint: string, data: any): Promise<ApiResponse> {
		const response = await authService.authenticatedRequest(
			`${this.baseURL}${endpoint}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			},
		);
		return await response.json();
	}

	/**
	 * Generic PUT request
	 */
	async put(endpoint: string, data: any): Promise<ApiResponse> {
		const response = await authService.authenticatedRequest(
			`${this.baseURL}${endpoint}`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			},
		);
		return await response.json();
	}

	/**
	 * Generic DELETE request
	 */
	async delete(endpoint: string, data?: any): Promise<ApiResponse> {
		const options: RequestInit = {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		};

		if (data) {
			options.body = JSON.stringify(data);
		}

		const response = await authService.authenticatedRequest(
			`${this.baseURL}${endpoint}`,
			options,
		);
		return await response.json();
	}

	/**
   * Get user's recommended events
   */
	async getRecommendedEvents(userId?: number, limit?: number): Promise<Event[]> {
		console.log('🎯 getRecommendedEvents called with userId:', userId, 'limit:', limit);
		console.log('🔍 User ID type:', typeof userId, 'Is valid:', !!userId && !isNaN(userId));

		// Ensure userId is a valid number or undefined
		const validUserId = userId && !isNaN(userId) ? Number(userId) : undefined;
		
		let endpoint = validUserId
			? `${this.baseURL}/recommendations/events/${validUserId}`
			: `${this.baseURL}/events`;

		// Only add limit if specified
		if (limit) {
			endpoint += `?limit=${limit}`;
		}

		console.log('🌐 Fetching from endpoint:', endpoint);
		console.log('🎯 Using RECOMMENDATION endpoint:', endpoint.includes('/recommendations/'));
		
		if (endpoint.includes('/recommendations/')) {
			console.log('✅ CALLING PERSONALIZED RECOMMENDATION API for user:', validUserId);
		} else {
			console.log('⚠️  FALLING BACK to generic events API');
		}

		const response = await authService.authenticatedRequest(endpoint);
		const data: ApiResponse<any> = await response.json();

		if (data.success && data.data) {
			// Handle different response structures
			if (userId && data.data.recommendations) {
				// Recommendation endpoint returns { data: { recommendations: [...] } }
				return data.data.recommendations || [];
			} else if (data.data.events) {
				// Regular endpoint returns { data: { events: [...] } }
				return data.data.events || [];
			}
			return [];
		} else {
			throw new Error(data.message || 'Failed to get events');
		}
	}

	/**
   * Get all available events
   */
	async getAllEvents(limit?: number): Promise<Event[]> {
		let endpoint = `${this.baseURL}/events`;

		// Only add limit if specified
		if (limit) {
			endpoint += `?limit=${limit}`;
		}

		const response = await authService.authenticatedRequest(endpoint);
		const data: ApiResponse<{ events: Event[] }> = await response.json();

		if (data.success && data.data) {
			return data.data.events || [];
		} else {
			throw new Error(data.message || 'Failed to get events');
		}
	}

	/**
   * Get user's recommended clubs
   */
	async getRecommendedClubs(userId?: number, limit?: number): Promise<Club[]> {
		console.log('🎯 getRecommendedClubs called with userId:', userId, 'limit:', limit);
		console.log('🔍 User ID type:', typeof userId, 'Is valid:', !!userId && !isNaN(userId));

		// Ensure userId is a valid number or undefined
		const validUserId = userId && !isNaN(userId) ? Number(userId) : undefined;
		
		let endpoint = validUserId
			? `${this.baseURL}/recommendations/organizations/${validUserId}`
			: `${this.baseURL}/organizations`;

		// Only add limit if specified
		if (limit) {
			endpoint += `?limit=${limit}`;
		}

		console.log('🌐 Fetching from endpoint:', endpoint);
		console.log('🎯 Using RECOMMENDATION endpoint:', endpoint.includes('/recommendations/'));
		
		if (endpoint.includes('/recommendations/')) {
			console.log('✅ CALLING PERSONALIZED RECOMMENDATION API for user:', validUserId);
		} else {
			console.log('⚠️  FALLING BACK to generic organizations API');
		}

		const response = await authService.authenticatedRequest(endpoint);
		const data: ApiResponse<any> = await response.json();

		console.log('📊 API Response:', { success: data.success, dataKeys: Object.keys(data.data || {}) });

		if (data.success && data.data) {
			// Handle different response structures
			if (userId && data.data.recommendations) {
				// Recommendation endpoint returns { data: { recommendations: [...] } }
				return data.data.recommendations || [];
			} else if (data.data.organizations) {
				// Regular endpoint returns { data: { organizations: [...] } }
				return data.data.organizations || [];
			}
			return [];
		} else {
			throw new Error(data.message || 'Failed to get clubs');
		}
	}

	/**
   * Get all available clubs
   */
	async getAllClubs(limit?: number): Promise<Club[]> {
		let endpoint = `${this.baseURL}/organizations`;

		// Only add limit if specified
		if (limit) {
			endpoint += `?limit=${limit}`;
		}

		const response = await authService.authenticatedRequest(endpoint);
		const data: ApiResponse<{ organizations: Club[] }> = await response.json();

		if (data.success && data.data) {
			return data.data.organizations || [];
		} else {
			throw new Error(data.message || 'Failed to get clubs');
		}
	}

	/**
   * Get professors to connect with
   */
	async getProfessors(limit = 20): Promise<Professor[]> {
		const response = await authService.authenticatedRequest(
			`${this.baseURL}/professors?limit=${limit}`,
		);
		const data: ApiResponse<{ professors: Professor[] }> = await response.json();

		if (data.success && data.data) {
			return data.data.professors || [];
		} else {
			throw new Error(data.message || 'Failed to get professors');
		}
	}

	/**
   * Get research labs
   */
	async getLabs(limit?: number): Promise<any[]> {
		let endpoint = `${this.baseURL}/labs`;

		// Only add limit if specified
		if (limit) {
			endpoint += `?limit=${limit}`;
		}

		const response = await authService.authenticatedRequest(endpoint);
		const data: ApiResponse<{ labs: any[] }> = await response.json();

		if (data.success && data.data) {
			return data.data.labs || [];
		} else {
			throw new Error(data.message || 'Failed to get labs');
		}
	}

	/**
   * RSVP to an event
   */
	async rsvpToEvent(eventId: string, status: 'going' | 'interested' | 'not-going'): Promise<void> {
		const response = await authService.authenticatedRequest(
			`${this.baseURL}/events/${eventId}/rsvp`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ status }),
			},
		);

		const data: ApiResponse = await response.json();

		if (!data.success) {
			throw new Error(data.message || 'RSVP failed');
		}
	}

	/**
   * Follow/unfollow a club
   */
	async toggleClubFollow(clubId: string, follow = true): Promise<void> {
		const action = follow ? 'follow' : 'unfollow';
		const response = await authService.authenticatedRequest(
			`${this.baseURL}/organizations/${clubId}/${action}`,
			{
				method: 'POST',
			},
		);

		const data: ApiResponse = await response.json();

		if (!data.success) {
			throw new Error(data.message || `Failed to ${action} organization`);
		}
	}
}

// Export singleton instance
export const apiService = new ApiService();