import { 
  AuthRepository, 
  UserRepository, 
  OpportunitiesRepository, 
  CommitmentsRepository, 
  EventsRepository, 
  RecommendationsRepository, 
  InterestsRepository, 
  MetadataRepository 
} from '../repositories';
import type { User, OnboardingData } from '../types';

// Authentication composable
export const useAuth = () => {
  const authRepo = new AuthRepository();
  const userRepo = new UserRepository();
  
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => !!user.value);
  const isLoading = ref(false);

  const login = async (email: string, password: string) => {
    isLoading.value = true;
    try {
      const response = await authRepo.login(email, password);
      if (response.success) {
        user.value = response.data.user;
        await navigateTo('/dashboard');
      }
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    isLoading.value = true;
    try {
      const response = await authRepo.signup(email, password, firstName, lastName);
      if (response.success) {
        user.value = response.data.user;
        await navigateTo('/onboarding');
      }
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    await authRepo.logout();
    user.value = null;
    await navigateTo('/');
  };

  const completeOnboarding = async (data: OnboardingData) => {
    isLoading.value = true;
    try {
      const response = await userRepo.completeOnboarding(data);
      if (response.success) {
        user.value = response.data;
        await navigateTo('/dashboard');
      }
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  // Auto-login for demo purposes
  onMounted(async () => {
    if (!user.value) {
      const response = await userRepo.getCurrentUser();
      if (response.success) {
        user.value = response.data;
      }
    }
  });

  return {
    user: readonly(user),
    isAuthenticated,
    isLoading,
    login,
    signup, 
    logout,
    completeOnboarding
  };
};

// Opportunities composable
export const useOpportunities = () => {
  const repo = new OpportunitiesRepository();
  
  const clubs = ref([]);
  const events = ref([]);
  const professors = ref([]);
  const isLoading = ref(false);

  const fetchClubs = async (filters?: any) => {
    isLoading.value = true;
    try {
      const response = await repo.getClubs(filters);
      if (response.success) {
        clubs.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const fetchEvents = async (filters?: any) => {
    isLoading.value = true;
    try {
      const response = await repo.getEvents(filters);
      if (response.success) {
        events.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const fetchProfessors = async (filters?: any) => {
    isLoading.value = true;
    try {
      const response = await repo.getProfessors(filters);
      if (response.success) {
        professors.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  return {
    clubs: readonly(clubs),
    events: readonly(events), 
    professors: readonly(professors),
    isLoading,
    fetchClubs,
    fetchEvents,
    fetchProfessors
  };
};

// Commitments composable
export const useCommitments = () => {
  const repo = new CommitmentsRepository();
  
  const commitments = ref([]);
  const isLoading = ref(false);

  const fetchCommitments = async () => {
    isLoading.value = true;
    try {
      const response = await repo.getUserCommitments();
      if (response.success) {
        commitments.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const addCommitment = async (type: string, itemId: string, name: string) => {
    const response = await repo.addCommitment(type, itemId, name);
    if (response.success) {
      await fetchCommitments(); // Refresh
    }
    return response;
  };

  const updateStatus = async (commitmentId: string, status: string) => {
    const response = await repo.updateCommitmentStatus(commitmentId, status);
    if (response.success) {
      await fetchCommitments(); // Refresh
    }
    return response;
  };

  return {
    commitments: readonly(commitments),
    isLoading,
    fetchCommitments,
    addCommitment,
    updateStatus
  };
};

// Recommendations composable
export const useRecommendations = () => {
  const repo = new RecommendationsRepository();
  
  const starterPlan = ref(null);
  const nudges = ref([]);
  const isLoading = ref(false);

  const fetchStarterPlan = async () => {
    isLoading.value = true;
    try {
      const response = await repo.getStarterPlan();
      if (response.success) {
        starterPlan.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const acceptStarterPlan = async () => {
    const response = await repo.acceptStarterPlan();
    if (response.success && starterPlan.value) {
      starterPlan.value.accepted = true;
    }
    return response;
  };

  const fetchNudges = async () => {
    const response = await repo.getNudges();
    if (response.success) {
      nudges.value = response.data;
    }
  };

  return {
    starterPlan: readonly(starterPlan),
    nudges: readonly(nudges),
    isLoading,
    fetchStarterPlan,
    acceptStarterPlan,
    fetchNudges
  };
};

// Events composable 
export const useEvents = () => {
  const repo = new EventsRepository();
  const opportunitiesRepo = new OpportunitiesRepository();
  
  const userEvents = ref([]);
  const isLoading = ref(false);

  const rsvpToEvent = async (eventId: string, status: string) => {
    const response = await repo.rsvpToEvent(eventId, status as any);
    return response;
  };

  const fetchUserEvents = async () => {
    isLoading.value = true;
    try {
      const response = await repo.getUserEvents();
      if (response.success) {
        userEvents.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  return {
    userEvents: readonly(userEvents),
    isLoading,
    rsvpToEvent,
    fetchUserEvents
  };
};

// Interests composable
export const useInterests = () => {
  const repo = new InterestsRepository();
  
  const allInterests = ref([]);
  const searchResults = ref([]);
  const isLoading = ref(false);

  const fetchAllInterests = async () => {
    isLoading.value = true;
    try {
      const response = await repo.getAllInterests();
      if (response.success) {
        allInterests.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const searchInterests = async (query: string) => {
    const response = await repo.searchInterests(query);
    if (response.success) {
      searchResults.value = response.data;
    }
    return response;
  };

  const createCustomInterest = async (name: string, category: string) => {
    const response = await repo.createCustomInterest(name, category);
    return response;
  };

  return {
    allInterests: readonly(allInterests),
    searchResults: readonly(searchResults),
    isLoading,
    fetchAllInterests,
    searchInterests,
    createCustomInterest
  };
};

// Metadata composable
export const useMetadata = () => {
  const repo = new MetadataRepository();
  
  const majors = ref([]);
  const isLoading = ref(false);

  const fetchMajors = async () => {
    isLoading.value = true;
    try {
      const response = await repo.getMajors();
      if (response.success) {
        majors.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  return {
    majors: readonly(majors),
    isLoading,
    fetchMajors
  };
};