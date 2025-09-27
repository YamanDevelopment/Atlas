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
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Welcome back, John!</h1>
        <p class="text-gray-600 mt-2">Here's what's happening in your campus journey.</p>
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

            <div v-if="starterPlan && !starterPlan.accepted" class="space-y-6">
              <!-- Primary Recommendation -->
              <div class="border-l-4 border-indigo-600 pl-4">
                <h3 class="text-lg font-medium text-gray-900 mb-2">Primary Recommendation</h3>
                <div class="bg-indigo-50 rounded-lg p-4">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h4 class="font-medium text-indigo-900">{{ starterPlan.primaryRecommendation.name }}</h4>
                      <p class="text-indigo-700 text-sm mt-1">{{ starterPlan.primaryRecommendation.shortDescription }}</p>
                      <p class="text-indigo-600 text-xs mt-2">{{ starterPlan.primaryRecommendation.whyRecommended }}</p>
                      <div class="flex items-center mt-2 space-x-4 text-xs text-indigo-600">
                        <span>⏱️ {{ starterPlan.primaryRecommendation.timeCommitment }}</span>
                        <span>👥 {{ starterPlan.primaryRecommendation.memberCount }} members</span>
                      </div>
                    </div>
                    <button
                      @click="acceptOpportunity(starterPlan.primaryRecommendation)"
                      class="ml-4 px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              </div>

              <!-- Secondary Recommendations -->
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-4">Secondary Options</h3>
                <div class="grid md:grid-cols-2 gap-4">
                  <div
                    v-for="club in starterPlan.secondaryRecommendations"
                    :key="club.id"
                    class="border rounded-lg p-4 hover:border-indigo-300 transition-colors"
                  >
                    <h4 class="font-medium text-gray-900">{{ club.name }}</h4>
                    <p class="text-gray-600 text-sm mt-1">{{ club.shortDescription }}</p>
                    <p class="text-gray-500 text-xs mt-2">{{ club.whyRecommended }}</p>
                    <div class="flex justify-between items-center mt-3">
                      <span class="text-xs text-gray-500">{{ club.timeCommitment }}</span>
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

              <!-- Alternatives -->
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-4">Alternative Options</h3>
                <div class="grid md:grid-cols-3 gap-3">
                  <div
                    v-for="club in starterPlan.alternativeRecommendations"
                    :key="club.id"
                    class="border rounded-lg p-3 hover:border-gray-300 transition-colors"
                  >
                    <h4 class="font-medium text-gray-900 text-sm">{{ club.name }}</h4>
                    <p class="text-gray-600 text-xs mt-1">{{ club.shortDescription }}</p>
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

            <div v-else-if="starterPlan && starterPlan.accepted" class="text-center py-8">
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
          <div class="bg-white rounded-xl shadow-sm p-6">
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
                    <h4 class="font-medium text-gray-900">{{ commitment.name }}</h4>
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
                <h4 class="font-medium text-gray-900 text-sm">{{ event.title }}</h4>
                <p class="text-xs text-gray-500">{{ formatDate(event.date) }}</p>
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
  </div>
</template>

<script setup lang="ts">
import type { StarterPlan, Commitment, Event, Club } from '../types';

// Mock data
const starterPlan = ref<StarterPlan | null>({
  id: 'plan-1',
  userId: 'user-1',
  primaryRecommendation: {
    id: 'club-1',
    name: 'AI Research Club',
    description: 'A community of students passionate about artificial intelligence.',
    shortDescription: 'Explore AI/ML through projects and competitions',
    tags: ['AI', 'Machine Learning', 'Research'],
    category: 'academic' as any,
    timeCommitment: '4-6 hours/week',
    meetingFrequency: 'Weekly meetings + project time',
    contactInfo: { email: 'ai.research@ucf.edu' },
    whyRecommended: 'Perfect match for your machine learning interest',
    memberCount: 87,
    isProfessional: true
  },
  secondaryRecommendations: [
    {
      id: 'club-2',
      name: 'Pickleball Club',
      description: 'Join UCF\'s fastest growing sport!',
      shortDescription: 'Fun racquet sport for all levels',
      tags: ['Pickleball', 'Sports'],
      category: 'sport' as any,
      timeCommitment: '2-3 hours/week',
      meetingFrequency: '3x week practices',
      contactInfo: { email: 'pickleball@ucf.edu' },
      whyRecommended: 'Great way to stay active and social',
      memberCount: 124,
      isProfessional: false
    },
    {
      id: 'club-3',
      name: 'Photography Club',
      description: 'Capture the world through your lens!',
      shortDescription: 'Learn photography and explore creativity',
      tags: ['Photography', 'Art'],
      category: 'hobby' as any,
      timeCommitment: '2-4 hours/week',
      meetingFrequency: 'Weekly photo walks',
      contactInfo: { email: 'photo@ucf.edu' },
      whyRecommended: 'Perfect creative outlet',
      memberCount: 89,
      isProfessional: false
    }
  ],
  alternativeRecommendations: [
    {
      id: 'club-4',
      name: 'Google Developer Club',
      shortDescription: 'Learn with Google technologies',
      memberCount: 156,
    },
    {
      id: 'club-5',
      name: 'Christian Fellowship',
      shortDescription: 'Faith-based community',
      memberCount: 203,
    },
    {
      id: 'club-6',
      name: 'Entrepreneurship Society',
      shortDescription: 'Start and scale business ideas',
      memberCount: 167,
    }
  ] as Club[],
  createdAt: new Date(),
  accepted: false
});

const commitments = ref<Commitment[]>([
  {
    id: 'commitment-1',
    type: 'club',
    itemId: 'club-1',
    name: 'AI Research Club',
    status: 'pending',
    addedAt: new Date('2025-09-26'),
    notes: 'Applied for membership'
  },
  {
    id: 'commitment-2',
    type: 'event',
    itemId: 'event-1',
    name: 'AI Workshop: Neural Networks',
    status: 'active',
    addedAt: new Date('2025-09-25')
  }
]);

const upcomingEvents = ref<Event[]>([
  {
    id: 'event-1',
    title: 'AI Workshop: Neural Networks',
    description: 'Learn neural network basics',
    shortDescription: 'Neural network workshop',
    date: new Date('2025-09-30T18:00:00'),
    location: 'Engineering Building II',
    organizer: 'AI Research Club',
    tags: ['AI', 'Workshop'],
    category: 'workshop',
    whyRecommended: 'Perfect for your interests',
    attendeeCount: 45,
    isVirtual: false,
    isFree: true
  }
]);

const nudges = ref([
  {
    id: 'nudge-1',
    message: '2 new robotics opportunities added this week',
    type: 'new-opportunities' as any,
    actionUrl: '/explore?category=robotics',
    createdAt: new Date(),
    dismissed: false
  },
  {
    id: 'nudge-2',
    message: 'Pickleball tournament registration closes in 3 days',
    type: 'deadline-reminder' as any,
    actionUrl: '/event/event-2',
    createdAt: new Date(),
    dismissed: false
  }
]);

// Methods
const acceptOpportunity = async (club: Club) => {
  // Add to commitments
  const newCommitment: Commitment = {
    id: 'commitment-' + Date.now(),
    type: 'club',
    itemId: club.id,
    name: club.name,
    status: 'pending',
    addedAt: new Date()
  };
  
  commitments.value.push(newCommitment);
  
  // TODO: integrate real API
  console.log('Accepted opportunity:', club.name);
};

const acceptStarterPlan = async () => {
  if (starterPlan.value) {
    starterPlan.value.accepted = true;
    
    // Add all recommendations to commitments
    const allClubs = [
      starterPlan.value.primaryRecommendation,
      ...starterPlan.value.secondaryRecommendations
    ];
    
    allClubs.forEach(club => {
      const commitment: Commitment = {
        id: 'commitment-' + Date.now() + '-' + club.id,
        type: 'club',
        itemId: club.id,
        name: club.name,
        status: 'pending',
        addedAt: new Date()
      };
      commitments.value.push(commitment);
    });
    
    // TODO: integrate real API
    console.log('Accepted entire starter plan');
  }
};

const updateCommitmentStatus = async (commitmentId: string, status: string) => {
  const commitment = commitments.value.find((c: Commitment) => c.id === commitmentId);
  if (commitment) {
    commitment.status = status as any;
    // TODO: integrate real API
    console.log('Updated commitment status:', status);
  }
};

const getCommitmentStatusColor = (status: string) => {
  const colors = {
    pending: 'bg-yellow-400',
    active: 'bg-green-400',
    passive: 'bg-blue-400',
    inactive: 'bg-gray-400'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-400';
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(date));
};
</script>