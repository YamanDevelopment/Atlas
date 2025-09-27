import type { 
  User, 
  Club, 
  Event, 
  Professor, 
  StarterPlan, 
  Commitment, 
  Nudge,
  Interest,
  OnboardingData,
  RSVPStatus,
  ApiResponse
} from '../types';

import {
  MOCK_USER,
  MOCK_CLUBS,
  MOCK_EVENTS, 
  MOCK_PROFESSORS,
  MOCK_STARTER_PLAN,
  MOCK_COMMITMENTS,
  MOCK_NUDGES,
  MOCK_INTERESTS,
  MOCK_MAJORS
} from '../mock/seed';

// Mock Authentication Repository
export class AuthRepository {
  // TODO: integrate real API
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    return {
      success: true,
      data: {
        user: MOCK_USER,
        token: 'mock-jwt-token'
      }
    };
  }

  // TODO: integrate real API
  async signup(email: string, password: string, firstName: string, lastName: string): Promise<ApiResponse<{ user: User; token: string }>> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newUser: User = {
      ...MOCK_USER,
      id: 'user-' + Date.now(),
      email,
      firstName,
      lastName,
      onboardingComplete: false,
      createdAt: new Date()
    };

    return {
      success: true,
      data: {
        user: newUser,
        token: 'mock-jwt-token'
      }
    };
  }

  // TODO: integrate real API
  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Mock User Repository
export class UserRepository {
  // TODO: integrate real API
  async getCurrentUser(): Promise<ApiResponse<User>> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      data: MOCK_USER
    };
  }

  // TODO: integrate real API
  async updateUser(updates: Partial<User>): Promise<ApiResponse<User>> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const updatedUser = { ...MOCK_USER, ...updates };
    
    return {
      success: true,
      data: updatedUser
    };
  }

  // TODO: integrate real API
  async completeOnboarding(data: OnboardingData): Promise<ApiResponse<User>> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const updatedUser: User = {
      ...MOCK_USER,
      major: data.major,
      interests: data.interests,
      currentInvolvement: data.currentInvolvement,
      timeBudget: data.timeBudget,
      onboardingComplete: true
    };
    
    return {
      success: true,
      data: updatedUser
    };
  }
}

// Mock Opportunities Repository  
export class OpportunitiesRepository {
  // TODO: integrate real API
  async getClubs(filters?: any): Promise<ApiResponse<Club[]>> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      data: MOCK_CLUBS
    };
  }

  // TODO: integrate real API
  async getEvents(filters?: any): Promise<ApiResponse<Event[]>> {
    await new Promise(resolve => setTimeout(resolve, 900));
    
    return {
      success: true,
      data: MOCK_EVENTS
    };
  }

  // TODO: integrate real API
  async getProfessors(filters?: any): Promise<ApiResponse<Professor[]>> {
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    return {
      success: true,
      data: MOCK_PROFESSORS
    };
  }

  // TODO: integrate real API
  async getClubById(id: string): Promise<ApiResponse<Club | null>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const club = MOCK_CLUBS.find((c: Club) => c.id === id) || null;
    
    return {
      success: true,
      data: club
    };
  }

  // TODO: integrate real API
  async getEventById(id: string): Promise<ApiResponse<Event | null>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const event = MOCK_EVENTS.find((e: Event) => e.id === id) || null;
    
    return {
      success: true,
      data: event
    };
  }
}

// Mock Commitments Repository
export class CommitmentsRepository {
  // TODO: integrate real API
  async getUserCommitments(): Promise<ApiResponse<Commitment[]>> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      data: MOCK_COMMITMENTS
    };
  }

  // TODO: integrate real API
  async addCommitment(type: string, itemId: string, name: string): Promise<ApiResponse<Commitment>> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newCommitment: Commitment = {
      id: 'commitment-' + Date.now(),
      type: type as any,
      itemId,
      name,
      status: 'pending',
      addedAt: new Date()
    };
    
    return {
      success: true,
      data: newCommitment
    };
  }

  // TODO: integrate real API
  async updateCommitmentStatus(commitmentId: string, status: string): Promise<ApiResponse<Commitment>> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const commitment = MOCK_COMMITMENTS.find((c: Commitment) => c.id === commitmentId);
    if (commitment) {
      commitment.status = status as any;
    }
    
    return {
      success: true,
      data: commitment!
    };
  }

  // TODO: integrate real API 
  async removeCommitment(commitmentId: string): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      success: true,
      data: undefined
    };
  }
}

// Mock Events Repository
export class EventsRepository {
  // TODO: integrate real API
  async rsvpToEvent(eventId: string, status: RSVPStatus): Promise<ApiResponse<Event>> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const event = MOCK_EVENTS.find((e: Event) => e.id === eventId);
    if (event) {
      event.rsvpStatus = status;
    }
    
    return {
      success: true,
      data: event!
    };
  }

  // TODO: integrate real API
  async getUserEvents(): Promise<ApiResponse<Event[]>> {
    await new Promise(resolve => setTimeout(resolve, 900));
    
    const userEvents = MOCK_EVENTS.filter((e: Event) => e.rsvpStatus === 'going');
    
    return {
      success: true,
      data: userEvents
    };
  }
}

// Mock Recommendations Repository
export class RecommendationsRepository {
  // TODO: integrate real API
  async getStarterPlan(): Promise<ApiResponse<StarterPlan>> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      data: MOCK_STARTER_PLAN
    };
  }

  // TODO: integrate real API
  async acceptStarterPlan(): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      data: undefined
    };
  }

  // TODO: integrate real API
  async getNudges(): Promise<ApiResponse<Nudge[]>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      success: true,
      data: MOCK_NUDGES
    };
  }

  // TODO: integrate real API
  async dismissNudge(nudgeId: string): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      success: true,
      data: undefined
    };
  }
}

// Mock Interests Repository
export class InterestsRepository {
  // TODO: integrate real API
  async getAllInterests(): Promise<ApiResponse<Interest[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: MOCK_INTERESTS
    };
  }

  // TODO: integrate real API
  async searchInterests(query: string): Promise<ApiResponse<Interest[]>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const filteredInterests = MOCK_INTERESTS.filter((interest: Interest) =>
      interest.name.toLowerCase().includes(query.toLowerCase())
    );
    
    return {
      success: true,
      data: filteredInterests
    };
  }

  // TODO: integrate real API
  async createCustomInterest(name: string, category: string): Promise<ApiResponse<Interest>> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newInterest: Interest = {
      id: 'custom-' + Date.now(),
      name,
      category: category as any,
      isCustom: true
    };
    
    return {
      success: true,
      data: newInterest
    };
  }
}

// Mock Metadata Repository
export class MetadataRepository {
  // TODO: integrate real API
  async getMajors(): Promise<ApiResponse<string[]>> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      success: true,
      data: MOCK_MAJORS
    };
  }
}