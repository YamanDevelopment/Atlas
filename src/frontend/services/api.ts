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
		const response = await authService.authenticatedRequest(
			`${this.baseURL}${endpoint}`,
		);
		return await response.json();
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
   * Get user's recommended events
   */
	async getRecommendedEvents(userId?: number, limit = 10): Promise<Event[]> {
		const endpoint = userId
			? `${this.baseURL}/recommendations/events/${userId}?limit=${limit}`
			: `${this.baseURL}/events?limit=${limit}`;

		const response = await authService.authenticatedRequest(endpoint);
		const data: ApiResponse<{ events: Event[] }> = await response.json();

		if (data.success && data.data) {
			return data.data.events || [];
		} else {
			throw new Error(data.message || 'Failed to get events');
		}
	}

	/**
   * Get all available events
   */
	async getAllEvents(limit = 50): Promise<Event[]> {
		const response = await authService.authenticatedRequest(
			`${this.baseURL}/events?limit=${limit}`,
		);
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
	async getRecommendedClubs(userId?: number, limit = 10): Promise<Club[]> {
		const endpoint = userId
			? `${this.baseURL}/recommendations/organizations/${userId}?limit=${limit}`
			: `${this.baseURL}/organizations?limit=${limit}`;

		const response = await authService.authenticatedRequest(endpoint);
		const data: ApiResponse<{ organizations: Club[] }> = await response.json();

		if (data.success && data.data) {
			return data.data.organizations || [];
		} else {
			throw new Error(data.message || 'Failed to get clubs');
		}
	}

	/**
   * Get all available clubs
   */
	async getAllClubs(limit = 100): Promise<Club[]> {
		const response = await authService.authenticatedRequest(
			`${this.baseURL}/organizations?limit=${limit}`,
		);
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
	async getLabs(limit = 20): Promise<any[]> {
		const response = await authService.authenticatedRequest(
			`${this.baseURL}/labs?limit=${limit}`,
		);
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