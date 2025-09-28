<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-8">
            <div class="text-2xl font-bold text-indigo-600">OppTrack</div>
            <div class="hidden md:flex space-x-6">
              <NuxtLink to="/dashboard" class="text-indigo-600 font-medium border-b-2 border-indigo-600 pb-1">
                Dashboard
              </NuxtLink>
              <NuxtLink to="/explore" class="text-gray-500 hover:text-gray-700">
                Explore
              </NuxtLink>
              <NuxtLink to="/profile" class="text-gray-500 hover:text-gray-700">
                Profile
              </NuxtLink>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <button class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM13 3H4a2 2 0 00-2 2v14a2 2 0 002 2h5m11-9V7a2 2 0 00-2-2H9a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2z" />
              </svg>
            </button>
            <div class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              JD
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <!-- Welcome Header -->
      <div class="mb-8 stats-section">
        <h1 class="text-3xl font-bold text-gray-900">Welcome back, John!</h1>
        <p class="text-gray-600 mt-2">Here's what's happening in your campus journey.</p>
        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <div class="text-2xl font-bold text-indigo-600">{{ commitments.length }}</div>
            <div class="text-sm text-gray-600">Active Commitments</div>
          </div>
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <div class="text-2xl font-bold text-green-600">{{ upcomingEvents.length }}</div>
            <div class="text-sm text-gray-600">Upcoming Events</div>
          </div>
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <div class="text-2xl font-bold text-purple-600">{{ recommendedClubs.length }}</div>
            <div class="text-sm text-gray-600">Recommendations</div>
          </div>
        </div>
      </div>

      <!-- Nudges -->
      <div v-if="nudges.length > 0" class="mb-8 space-y-3">
        <div
          v-for="nudge in nudges"
          :key="nudge.id"
          class="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div class="flex items-center">
            <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span class="text-blue-800">{{ nudge.message }}</span>
          </div>
          <button class="text-blue-600 hover:text-blue-800 text-sm">
            View →
          </button>
        </div>
      </div>

      <!-- Grid Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column (2/3 width) -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Your Starter Plan -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Your Starter Plan</h2>
              <span class="text-sm text-gray-500">Personalized for you</span>
            </div>

            <!-- Show recommendations if plan not accepted -->
            <div v-if="!planAccepted">
              <!-- Club Recommendations -->
              <div class="space-y-6 recommendations-section">
                <h3 class="text-lg font-medium text-gray-900">Recommended for You</h3>
                
                <!-- Primary Recommendation (first club) -->
                <div v-if="recommendedClubs.length > 0" class="border-l-4 border-indigo-600 pl-4">
                  <div class="bg-indigo-50 rounded-lg p-4">
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <h4 class="font-medium text-indigo-900">{{ recommendedClubs[0].name }}</h4>
                        <p class="text-indigo-700 text-sm mt-1">{{ recommendedClubs[0].description }}</p>
                        <div class="flex items-center mt-2 space-x-4 text-xs text-indigo-600">
                          <span>👥 {{ recommendedClubs[0].memberCount }} members</span>
                          <span v-if="recommendedClubs[0].categories.length">
                            🏷️ {{ recommendedClubs[0].categories[0].name }}
                          </span>
                        </div>
                      </div>
                      <button
                        @click="acceptOpportunity(recommendedClubs[0])"
                        class="ml-4 px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Secondary Recommendations -->
                <div v-if="recommendedClubs.length > 1">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">More Options</h3>
                  <div class="grid md:grid-cols-2 gap-4">
                    <div
                      v-for="club in recommendedClubs.slice(1, 3)"
                      :key="club.id"
                      class="border rounded-lg p-4 hover:border-indigo-300 transition-colors"
                    >
                      <h4 class="font-medium text-gray-900">{{ club.name }}</h4>
                      <p class="text-gray-600 text-sm mt-1">{{ club.description }}</p>
                      <div class="flex justify-between items-center mt-3">
                        <span class="text-xs text-gray-500">{{ club.memberCount }} members</span>
                        <button
                          @click="acceptOpportunity(club)"
                          class="px-2 py-1 text-indigo-600 border border-indigo-600 text-xs rounded hover:bg-indigo-50"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Alternative Options -->
                <div v-if="recommendedClubs.length > 3">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Alternative Options</h3>
                  <div class="grid md:grid-cols-3 gap-3">
                    <div
                      v-for="club in recommendedClubs.slice(3)"
                      :key="club.id"
                      class="border rounded-lg p-3 hover:border-gray-300 transition-colors"
                    >
                      <h4 class="font-medium text-gray-900 text-sm">{{ club.name }}</h4>
                      <p class="text-gray-600 text-xs mt-1 line-clamp-2">{{ club.description }}</p>
                      <div class="flex justify-between items-center mt-2">
                        <span class="text-xs text-gray-500">{{ club.memberCount }} members</span>
                        <button
                          @click="acceptOpportunity(club)"
                          class="text-indigo-600 text-xs hover:text-indigo-800"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex justify-center pt-4">
                  <button
                    @click="acceptStarterPlan"
                    class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Accept Entire Plan
                  </button>
                </div>
              </div>
            </div>

            <!-- Show acceptance confirmation if plan accepted -->
            <div v-else class="text-center py-8">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900">Plan Accepted!</h3>
              <p class="text-gray-600">Your commitments are now being tracked below.</p>
            </div>
          </div>

          <!-- Your Commitments -->
          <div class="bg-white rounded-xl shadow-sm p-6 commitments-section">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Your Commitments</h2>
              <span class="text-sm text-gray-500">{{ commitments.length }} active</span>
            </div>

            <div v-if="commitments.length > 0" class="space-y-4">
              <div
                v-for="commitment in commitments"
                :key="commitment.id"
                class="flex items-center justify-between p-4 border rounded-lg"
              >
                <div class="flex items-center">
                  <div class="w-3 h-3 rounded-full mr-3"
                       :class="getCommitmentStatusColor(commitment.status)">
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900">{{ commitment.title }}</h4>
                    <p class="text-sm text-gray-500 capitalize">{{ commitment.status }} • {{ commitment.type }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <select
                    :value="commitment.status"
                    @change="updateCommitmentStatus(commitment.id, ($event.target as HTMLSelectElement).value)"
                    class="text-sm border rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="passive">Passive</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500">
              <p>No commitments yet. Accept some recommendations above to get started!</p>
            </div>
          </div>
        </div>

        <!-- Right Column (1/3 width) -->
        <div class="space-y-8">
          <!-- Next Up -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Next Up</h2>
            
            <div v-if="upcomingEvents.length > 0" class="space-y-4">
              <div
                v-for="event in upcomingEvents"
                :key="event.id"
                class="border-l-4 border-indigo-500 pl-4 py-2"
              >
                <h4 class="font-medium text-gray-900 text-sm">{{ event.name }}</h4>
                <p class="text-xs text-gray-500">{{ formatDate(event.startTime) }}</p>
                <p class="text-xs text-gray-600 mt-1">{{ event.location }}</p>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500">
              <p class="text-sm">No upcoming events. Check out the Explore page to find events!</p>
              <NuxtLink to="/explore" class="text-indigo-600 text-sm hover:text-indigo-800 mt-2 block">
                Explore Events →
              </NuxtLink>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            
            <div class="space-y-3">
              <NuxtLink
                to="/explore"
                class="flex items-center p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">Explore Opportunities</h4>
                  <p class="text-sm text-gray-500">Find new clubs and events</p>
                </div>
              </NuxtLink>

              <button class="flex items-center w-full p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div class="text-left">
                  <h4 class="font-medium text-gray-900">Research Guide</h4>
                  <p class="text-sm text-gray-500">Learn how to get involved</p>
                </div>
              </button>

              <NuxtLink
                to="/profile"
                class="flex items-center p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">Update Profile</h4>
                  <p class="text-sm text-gray-500">Manage your interests</p>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Starter Plan Modal -->
    <StarterPlanModal
      :is-visible="showStarterPlanModal"
      :plan="starterPlan"
      :current-commitments="commitments.length"
      @close="showStarterPlanModal = false"
      @start-tour="startDashboardTour"
      @skip-tour="skipDashboardTour"
    />

    <!-- Dashboard Tour -->
    <TourGuide
      :is-active="showTour"
      :steps="tourSteps"
      @tour-complete="onTourComplete"
      @tour-ended="onTourComplete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Plan, Commitment, Event, Club } from '~/types';

// Modal and tour states
const showStarterPlanModal = ref(false);
const showTour = ref(false);
const planAccepted = ref(false);

// Starter plan data
const starterPlan = ref<Plan>({
  id: 'starter-plan',
  name: 'Don\'t Know Where To Start?',
  description: 'Utilizing your field of study and interests, we\'ve packaged the perfect involvement plan just for you! Check it out and see which of the suggested orgs you would like to get involved with.',
  features: [
    '1x High Commitment Extracurricular',
    '2x Lower Commitment Organizations',
    '1x Non-technical Discovery Club',
    'Some Upcoming events you may like',
  ],
  commitmentLimit: 5,
  price: 0,
  isPopular: true
});

// Tour steps
const tourSteps = ref([
  {
    id: 'welcome',
    title: 'Welcome to Your Dashboard!',
    description: 'This is your command center for tracking your, clubs, commitments, upcoming school events, and staying connected with campus life.',
    target: 'body',
    position: 'top' as const
  },
  {
    id: 'stats',
    title: 'Track Your Extracurriculars',
    description: 'Monitor your commitments and see how balanced your campus involvement is.',
    target: '.stats-section',
    position: 'bottom' as const
  },
  {
    id: 'recommendations',
    title: 'Campus Involvement Plan',
    description: 'Utilizing your field of study and interests, we\'ve packaged the perfect involvement plan just for you! Check it out and see which of the suggested orgs you would like to get involved with',
    target: '.recommendations-section',
    position: 'top' as const
  },
  {
    id: 'commitments',
    title: 'Current Involvements',
    description: 'Keep track of your clubs and member status in one place and update commitment levels easily.',
    target: '.commitments-section',
    position: 'top' as const
  }
]);

// Mock data
const nudges = ref([
  {
    id: 'nudge-1',
    message: 'AI Research Club meeting today at 6 PM in Engineering Building',
    type: 'reminder',
    actionText: 'View Details'
  },
  {
    id: 'nudge-2', 
    message: 'You have 2 new event recommendations based on your interests',
    type: 'recommendation',
    actionText: 'View Recommendations'
  }
]);

const commitments = ref<Commitment[]>([
  {
    id: 'commitment-1',
    title: 'AI Research Club',
    type: 'club',
    description: 'Weekly meetings and project work',
    startTime: new Date(),
    endTime: new Date(),
    location: 'Engineering Building',
    priority: 'high',
    status: 'pending',
    relatedId: 'club-1'
  },
  {
    id: 'commitment-2', 
    title: 'Neural Networks Workshop',
    type: 'event',
    description: 'Learn about deep learning fundamentals',
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    location: 'Student Union',
    priority: 'medium',
    status: 'active',
    relatedId: 'event-1'
  }
]);

const upcomingEvents = ref<Event[]>([
  {
    id: 'event-1',
    name: 'AI Workshop: Neural Networks',
    description: 'Neural network workshop for beginners',
    location: 'Engineering Building Room 201',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    categories: [{ id: 'workshop', name: 'Workshop' }],
    isBookmarked: true,
    attendeeCount: 45,
    url: 'https://events.ucf.edu/ai-workshop'
  }
]);

const recommendedClubs = ref<Club[]>([
  {
    id: 'club-1',
    name: 'AI Research Club',
    description: 'A community of students passionate about artificial intelligence.',
    categories: [{ id: 'academic', name: 'Academic' }],
    memberCount: 87,
    isFollowing: false,
    upcomingEvents: [],
    logoUrl: '',
    url: 'https://ai.research.ucf.edu'
  },
  {
    id: 'club-2',
    name: 'Pickleball Club',
    description: 'Join UCF\'s fastest growing sport!',
    categories: [{ id: 'sport', name: 'Sport' }], 
    memberCount: 124,
    isFollowing: false,
    upcomingEvents: [],
    logoUrl: '',
    url: 'https://pickleball.ucf.edu'
  },
  {
    id: 'club-3',
    name: 'Photography Club',
    description: 'Capture the world through your lens!',
    categories: [{ id: 'hobby', name: 'Hobby' }],
    memberCount: 89, 
    isFollowing: false,
    upcomingEvents: [],
    logoUrl: '',
    url: 'https://photo.ucf.edu'
  }
]);

// Methods
const acceptOpportunity = async (club: Club) => {
  // Add to commitments
  const newCommitment: Commitment = {
    id: 'commitment-' + Date.now(),
    title: club.name,
    type: 'club',
    description: club.description,
    startTime: new Date(),
    endTime: new Date(),
    location: 'TBD',
    priority: 'medium',
    status: 'pending',
    relatedId: club.id
  };
  
  commitments.value.push(newCommitment);
  console.log('Accepted opportunity:', club.name);
};

const startDashboardTour = () => {
  showTour.value = true;
};

const skipDashboardTour = () => {
  console.log('User skipped dashboard tour');
};

const onTourComplete = () => {
  showTour.value = false;
  console.log('Dashboard tour completed');
};

const acceptStarterPlan = async () => {
  // Add all recommended clubs as commitments
  recommendedClubs.value.forEach(club => {
    const commitment: Commitment = {
      id: 'commitment-' + Date.now() + '-' + club.id,
      title: club.name,
      type: 'club',
      description: club.description,
      startTime: new Date(),
      endTime: new Date(),
      location: 'TBD',
      priority: 'medium',
      status: 'pending',
      relatedId: club.id
    };
    commitments.value.push(commitment);
  });
  
  planAccepted.value = true;
  console.log('Accepted starter plan with', recommendedClubs.value.length, 'club recommendations');
};

const updateCommitmentStatus = async (commitmentId: string, status: string) => {
  const commitment = commitments.value.find((c: Commitment) => c.id === commitmentId);
  if (commitment) {
    commitment.status = status as any;
    console.log('Updated commitment status:', status);
  }
};

const getCommitmentStatusColor = (status: string) => {
  const colors = {
    pending: 'bg-yellow-400',
    active: 'bg-green-400', 
    passive: 'bg-blue-400',
    inactive: 'bg-gray-400',
    upcoming: 'bg-blue-400',
    completed: 'bg-green-400',
    cancelled: 'bg-red-400'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-400';
};

const formatDate = (date: Date) => {
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return 'Invalid Date';
    }
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(parsedDate);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Check for fresh signup on mount
onMounted(() => {
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('from') === 'onboarding') {
    showStarterPlanModal.value = true;
  }
});
</script>