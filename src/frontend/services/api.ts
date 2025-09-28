/**
 * Atlas API Service
 * Handles all non-auth API calls including events, clubs, recommendations
 * Uses REAL backend API - NO fallback data
 */

import type { Event, Club, Professor, ApiResponse } from '~/types/auth';
import { authService } from './auth';

class ApiService {
  private baseURL = 'http://localhost:3001/api';

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
      `${this.baseURL}/events?limit=${limit}`
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
      ? `${this.baseURL}/recommendations/clubs/${userId}?limit=${limit}`
      : `${this.baseURL}/clubs?limit=${limit}`;
      
    const response = await authService.authenticatedRequest(endpoint);
    const data: ApiResponse<{ clubs: Club[] }> = await response.json();
    
    if (data.success && data.data) {
      return data.data.clubs || [];
    } else {
      throw new Error(data.message || 'Failed to get clubs');
    }
  }

  /**
   * Get all available clubs
   */
  async getAllClubs(limit = 100): Promise<Club[]> {
    const response = await authService.authenticatedRequest(
      `${this.baseURL}/clubs?limit=${limit}`
    );
    const data: ApiResponse<{ clubs: Club[] }> = await response.json();
    
    if (data.success && data.data) {
      return data.data.clubs || [];
    } else {
      throw new Error(data.message || 'Failed to get clubs');
    }
  }

  /**
   * Get professors to connect with
   */
  async getProfessors(limit = 20): Promise<Professor[]> {
    const response = await authService.authenticatedRequest(
      `${this.baseURL}/professors?limit=${limit}`
    );
    const data: ApiResponse<{ professors: Professor[] }> = await response.json();
    
    if (data.success && data.data) {
      return data.data.professors || [];
    } else {
      throw new Error(data.message || 'Failed to get professors');
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
      }
    );

    const data: ApiResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'RSVP failed');
    }
  }

  /**
   * Follow/unfollow a club
   */
  async toggleClubFollow(clubId: string, follow: boolean): Promise<void> {
    const response = await authService.authenticatedRequest(
      `${this.baseURL}/clubs/${clubId}/${follow ? 'follow' : 'unfollow'}`, 
      {
        method: 'POST',
      }
    );

    const data: ApiResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Follow/unfollow failed');
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();