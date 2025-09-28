// Core types for Atlas frontend authentication and API integration
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  interests?: number[];
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: {
    user: User;
    tokens: AuthTokens;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
}

// Enhanced existing types with API compatibility

export interface Interest {
  id: number; // Changed from string to match API
  keyword: string;
  name?: string;
  category?: string;
  isCustom?: boolean;
  linkedTags: LinkedTag[];
  isUserGenerated?: boolean;
  createdBy?: string;
  createdAt: string; // Changed from Date to match API
  updatedAt: string; // Changed from Date to match API
}

export interface LinkedTag {
  tagId: number;
  weight: number;
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
  title: string;
  department: string;
  email: string;
  researchAreas: string[];
  whyRecommended: string;
  isAcceptingStudents: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  features: string[];
  commitmentLimit: number;
  price: number;
  isPopular: boolean;
}

export interface Commitment {
  id: string;
  title: string;
  description: string;
  type: string;
  location: string;
  priority: string;
  status: string;
  relatedId: string;
}

export type RSVPStatus = 'going' | 'interested' | 'not-going';

// API Error types
export interface ApiError {
  success: false;
  error: string;
  message: string;
}

// Auth state management
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}