// Frontend types for OppTrack MVP

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  interests: Interest[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Interest {
  id: string;
  keyword: string;
  name?: string; // For frontend display
  category?: string; // For categorization
  isCustom?: boolean; // For user-generated interests
  linkedTags: LinkedTag[];
  isUserGenerated?: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkedTag {
  tagId: number;
  weight: number; // 0-1
}

export interface Tag {
  id: number;
  name: string;
  category: 'primary' | 'secondary';
  parentTag?: string;
  description: string;
  synonyms?: string[];
}

export interface Club {
  id: string;
  name: string;
  shortName?: string;
  description: string;
  shortDescription?: string;
  url?: string;
  logoUrl?: string;
  categories: Category[];
  tags?: string[];
  category?: string;
  whyRecommended?: string;
  timeCommitment?: string;
  meetingFrequency?: string;
  contactInfo?: { email: string; phone?: string };
  isProfessional?: boolean;
  memberCount: number;
  isFollowing: boolean;
  upcomingEvents: Event[];
}

export interface Event {
  id: string;
  name: string;
  title?: string;
  description: string;
  shortDescription?: string;
  location: string;
  startTime: Date;
  endTime: Date;
  date?: Date;
  endDate?: Date;
  url?: string;
  organizer?: string;
  organization?: Club;
  latitude?: number;
  longitude?: number;
  theme?: string;
  categories: Category[];
  tags?: string[];
  category?: string;
  whyRecommended?: string;
  benefits?: string[];
  recurring?: boolean;
  isBookmarked: boolean;
  attendeeCount?: number;
  isVirtual?: boolean;
  isFree?: boolean;
  rsvpStatus?: RSVPStatus;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  color?: string;
}

export interface Professor {
  id: string;
  name: string;
  title?: string;
  department: string;
  email: string;
  office?: string;
  researchAreas: string[];
  courses?: Course[];
  isFollowing?: boolean;
  whyRecommended?: string;
  isAcceptingStudents?: boolean;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: string;
  year: number;
}

export interface Commitment {
  id: string;
  title: string;
  type: 'event' | 'club' | 'course' | 'other' | 'lab' | 'organization';
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'upcoming' | 'completed' | 'cancelled' | 'pending' | 'active' | 'passive' | 'inactive';
  relatedId?: string; // ID of related event/club/course
  itemId?: number; // Backend itemId for lab/organization commitments
}

// Tour and onboarding types
export interface TourStep {
  id: string;
  title: string;
  content: string;
  targetElement: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  showNext: boolean;
  showPrev: boolean;
  showSkip: boolean;
}

// Starter plan type
export interface Plan {
  id: string;
  name: string;
  description: string;
  features: string[];
  commitmentLimit: number;
  price: number;
  isPopular?: boolean;
}

// RSVP Status types
export type RSVPStatus = 'going' | 'maybe' | 'not-going' | 'none';

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  categories?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  location?: string;
  tags?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}