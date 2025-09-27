<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-8">
            <div class="text-2xl font-bold text-indigo-600">OppTrack</div>
            <div class="hidden md:flex space-x-6">
              <NuxtLink to="/dashboard" class="text-gray-500 hover:text-gray-700">
                Dashboard
              </NuxtLink>
              <NuxtLink to="/explore" class="text-indigo-600 font-medium border-b-2 border-indigo-600 pb-1">
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

    <!-- Search Section -->
    <div class="bg-white border-b px-4 py-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search Input -->
          <div class="flex-1 relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search clubs, events, professors..."
            />
          </div>

          <!-- Quick Filters -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="filter in quickFilters"
              :key="filter.key"
              @click="toggleFilter(filter.key)"
              class="px-4 py-2 rounded-full text-sm border transition-colors"
              :class="activeFilters.includes(filter.key) 
                ? 'bg-indigo-600 text-white border-indigo-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300'"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <!-- Recommended For You -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Because you like Machine Learning</h2>
        <div class="relative">
          <div class="flex gap-6 overflow-x-auto pb-4">
            <div
              v-for="club in recommendedClubs"
              :key="club.id"
              class="flex-shrink-0 w-80 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
            >
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900 mb-2">{{ club.name }}</h3>
                    <p class="text-gray-600 text-sm mb-3">{{ club.shortDescription }}</p>
                    <p class="text-indigo-600 text-xs mb-3">{{ club.whyRecommended }}</p>
                  </div>
                </div>
                
                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>⏱️ {{ club.timeCommitment }}</span>
                  <span>👥 {{ club.memberCount }} members</span>
                </div>
                
                <div class="flex flex-wrap gap-1 mb-4">
                  <span
                    v-for="tag in club.tags.slice(0, 3)"
                    :key="tag"
                    class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                  >
                    {{ tag }}
                  </span>
                </div>
                
                <button
                  @click="getInvolved(club)"
                  class="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Get Involved
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- For Your Major -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">For Computer Science Majors</h2>
        <div class="relative">
          <div class="flex gap-6 overflow-x-auto pb-4">
            <div
              v-for="club in majorClubs"
              :key="club.id"
              class="flex-shrink-0 w-80 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
            >
              <div class="p-6">
                <div class="flex items-center mb-2">
                  <h3 class="font-semibold text-gray-900">{{ club.name }}</h3>
                  <span
                    v-if="club.isProfessional"
                    class="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                  >
                    Professional
                  </span>
                </div>
                <p class="text-gray-600 text-sm mb-3">{{ club.shortDescription }}</p>
                <p class="text-indigo-600 text-xs mb-3">{{ club.whyRecommended }}</p>
                
                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>⏱️ {{ club.timeCommitment }}</span>
                  <span>👥 {{ club.memberCount }} members</span>
                </div>
                
                <button
                  @click="getInvolved(club)"
                  class="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Get Involved
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Upcoming Events -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Events This Week</h2>
        <div class="relative">
          <div class="flex gap-6 overflow-x-auto pb-4">
            <div
              v-for="event in upcomingEvents"
              :key="event.id"
              class="flex-shrink-0 w-80 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
            >
              <div class="p-6">
                <h3 class="font-semibold text-gray-900 mb-2">{{ event.title }}</h3>
                <p class="text-gray-600 text-sm mb-3">{{ event.shortDescription }}</p>
                <p class="text-indigo-600 text-xs mb-3">{{ event.whyRecommended }}</p>
                
                <div class="space-y-2 text-sm text-gray-500 mb-4">
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ formatEventDate(event.date) }}
                  </div>
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {{ event.location }}
                  </div>
                  <div class="flex items-center space-x-4">
                    <span v-if="event.isFree" class="text-green-600">Free</span>
                    <span>👥 {{ event.attendeeCount }} going</span>
                  </div>
                </div>
                
                <div class="flex gap-2">
                  <button
                    @click="rsvpEvent(event, 'going')"
                    class="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    :class="{ 'bg-green-600': event.rsvpStatus === 'going' }"
                  >
                    {{ event.rsvpStatus === 'going' ? 'Going ✓' : 'RSVP' }}
                  </button>
                  <button
                    @click="rsvpEvent(event, 'interested')"
                    class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-indigo-300 transition-colors"
                    :class="{ 'border-indigo-600 text-indigo-600': event.rsvpStatus === 'interested' }"
                  >
                    {{ event.rsvpStatus === 'interested' ? 'Interested ✓' : 'Interested' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Low Time Commitment -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Low Time Commitment</h2>
        <div class="relative">
          <div class="flex gap-6 overflow-x-auto pb-4">
            <div
              v-for="club in lowCommitmentClubs"
              :key="club.id"
              class="flex-shrink-0 w-80 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
            >
              <div class="p-6">
                <h3 class="font-semibold text-gray-900 mb-2">{{ club.name }}</h3>
                <p class="text-gray-600 text-sm mb-3">{{ club.shortDescription }}</p>
                <p class="text-indigo-600 text-xs mb-3">Perfect for a light commitment</p>
                
                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span class="text-green-600 font-medium">⏱️ {{ club.timeCommitment }}</span>
                  <span>👥 {{ club.memberCount }} members</span>
                </div>
                
                <button
                  @click="getInvolved(club)"
                  class="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Get Involved
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Connect With Professors -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Professors to Connect With</h2>
        <div class="relative">
          <div class="flex gap-6 overflow-x-auto pb-4">
            <div
              v-for="professor in professors"
              :key="professor.id"
              class="flex-shrink-0 w-80 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
            >
              <div class="p-6">
                <h3 class="font-semibold text-gray-900 mb-1">{{ professor.name }}</h3>
                <p class="text-gray-600 text-sm mb-2">{{ professor.title }} • {{ professor.department }}</p>
                <p class="text-indigo-600 text-xs mb-3">{{ professor.whyRecommended }}</p>
                
                <div class="mb-4">
                  <h4 class="text-sm font-medium text-gray-900 mb-2">Research Areas:</h4>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="area in professor.researchAreas.slice(0, 3)"
                      :key="area"
                      class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {{ area }}
                    </span>
                  </div>
                </div>
                
                <div v-if="professor.isAcceptingStudents" class="mb-4">
                  <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Accepting Students
                  </span>
                </div>
                
                <button
                  @click="connectWithProfessor(professor)"
                  class="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  View Contact Info
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { Club, Event, Professor, RSVPStatus } from '../types';

// State
const searchQuery = ref('');
const activeFilters = ref<string[]>([]);

const quickFilters = [
  { key: 'today', label: 'Today' },
  { key: 'this-week', label: 'This Week' },
  { key: 'free', label: 'Free' },
  { key: 'virtual', label: 'Virtual' }
];

// Mock data
const recommendedClubs = ref<Club[]>([
  {
    id: 'club-1',
    name: 'AI Research Club',
    description: 'A community of students passionate about artificial intelligence.',
    shortDescription: 'Explore AI/ML through projects and competitions',
    tags: ['AI', 'Machine Learning', 'Research'],
    category: 'academic',
    timeCommitment: '4-6 hours/week',
    meetingFrequency: 'Weekly meetings',
    contactInfo: { email: 'ai@ucf.edu' },
    whyRecommended: 'Perfect match for your machine learning interest',
    memberCount: 87,
    isProfessional: true
  },
  {
    id: 'club-7',
    name: 'Data Science Society',
    description: 'Learn data science through hands-on projects.',
    shortDescription: 'Master data analysis and visualization',
    tags: ['Data Science', 'Python', 'Analytics'],
    category: 'academic',
    timeCommitment: '3-5 hours/week',
    meetingFrequency: 'Bi-weekly workshops',
    contactInfo: { email: 'datascience@ucf.edu' },
    whyRecommended: 'Great complement to your ML interests',
    memberCount: 143,
    isProfessional: true
  }
]);

const majorClubs = ref<Club[]>([
  {
    id: 'club-3',
    name: 'Google Developer Student Club',
    description: 'Connect with fellow developers and learn new technologies.',
    shortDescription: 'Learn and build with Google technologies',
    tags: ['Google', 'Development', 'Technology'],
    category: 'professional',
    timeCommitment: '3-5 hours/week',
    meetingFrequency: 'Bi-weekly meetings',
    contactInfo: { email: 'gdsc@ucf.edu' },
    whyRecommended: 'Excellent for web development skills and career networking',
    memberCount: 156,
    isProfessional: true
  }
]);

const upcomingEvents = ref<Event[]>([
  {
    id: 'event-1',
    title: 'AI Workshop: Building Your First Neural Network',
    description: 'Hands-on workshop covering neural network fundamentals.',
    shortDescription: 'Learn neural network basics with hands-on coding',
    date: new Date('2025-09-30T18:00:00'),
    endDate: new Date('2025-09-30T20:00:00'),
    location: 'Engineering Building II, Room 208',
    organizer: 'AI Research Club',
    tags: ['AI', 'Workshop'],
    category: 'workshop',
    whyRecommended: 'Perfect for diving deeper into your ML interests',
    attendeeCount: 45,
    isVirtual: false,
    isFree: true
  },
  {
    id: 'event-2',
    title: 'Tech Career Fair',
    description: 'Meet with top tech companies.',
    shortDescription: 'Network with tech recruiters and explore opportunities',
    date: new Date('2025-10-08T10:00:00'),
    endDate: new Date('2025-10-08T16:00:00'),
    location: 'Student Union Pegasus Ballroom',
    organizer: 'Career Services',
    tags: ['Career', 'Technology'],
    category: 'career',
    whyRecommended: 'Excellent for your computer science career path',
    attendeeCount: 234,
    isVirtual: false,
    isFree: true
  }
]);

const lowCommitmentClubs = ref<Club[]>([
  {
    id: 'club-2',
    name: 'Pickleball Club',
    description: 'Join UCF\'s fastest growing sport!',
    shortDescription: 'Fun racquet sport for all levels',
    tags: ['Pickleball', 'Sports'],
    category: 'sport',
    timeCommitment: '1-2 hours/week',
    meetingFrequency: 'Optional practices',
    contactInfo: { email: 'pickleball@ucf.edu' },
    whyRecommended: 'Great way to stay active and social',
    memberCount: 124,
    isProfessional: false
  }
]);

const professors = ref<Professor[]>([
  {
    id: 'prof-1',
    name: 'Dr. Sarah Chen',
    title: 'Associate Professor',
    department: 'Computer Science',
    researchAreas: ['Machine Learning', 'Natural Language Processing', 'AI Ethics'],
    email: 'sarah.chen@ucf.edu',
    bio: 'Dr. Chen leads cutting-edge research in machine learning applications.',
    recentWork: ['Published in ICML 2024', 'NIH Grant: $2.3M'],
    whyRecommended: 'Perfect match for your machine learning interests - actively seeking students',
    labName: 'Intelligent Systems Lab',
    isAcceptingStudents: true
  }
]);

// Methods
const toggleFilter = (filterKey: string) => {
  const index = activeFilters.value.indexOf(filterKey);
  if (index >= 0) {
    activeFilters.value.splice(index, 1);
  } else {
    activeFilters.value.push(filterKey);
  }
  // TODO: Apply filters to data
};

const getInvolved = async (club: Club) => {
  // Add to commitments
  console.log('Getting involved with:', club.name);
  
  // Show success feedback
  // TODO: integrate real API and add to user commitments
  alert(`Great! You're now interested in ${club.name}. Check your dashboard to track your progress.`);
};

const rsvpEvent = async (event: Event, status: RSVPStatus) => {
  event.rsvpStatus = status;
  console.log('RSVP\'d to event:', event.title, 'Status:', status);
  
  // TODO: integrate real API
};

const connectWithProfessor = async (professor: Professor) => {
  // Show contact info
  alert(`Contact Dr. ${professor.name}:\n\nEmail: ${professor.email}\nResearch: ${professor.researchAreas.join(', ')}\n\nTip: Mention specific research interests when reaching out!`);
  
  // TODO: integrate real API - track professor connections
};

const formatEventDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(date));
};
</script>