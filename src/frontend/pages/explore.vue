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
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <NuxtLink 
              to="/profile"
              class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              JD
            </NuxtLink>
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
      <!-- Upcoming Events -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
        <div class="relative">
          <div class="flex gap-6 overflow-x-auto pb-4">
            <div
              v-for="event in upcomingEvents"
              :key="event.id"
              @click="openModal('event', event)"
              class="flex-shrink-0 w-80 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
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
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Dynamic Tag-Based Categories -->
      <section
        v-for="category in dynamicCategories"
        :key="category.tag"
        class="mb-12"
      >
        <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ category.title }}</h2>
        <div class="relative">
          <div class="flex gap-6 overflow-x-auto pb-4">
            <div
              v-for="club in category.clubs"
              :key="club.id"
              @click="openModal('club', club)"
              class="flex-shrink-0 w-80 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
            >
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
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
                  </div>
                </div>
                
                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>⏱️ {{ club.timeCommitment }}</span>
                  <span>👥 {{ club.memberCount }} members</span>
                </div>
                
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="tag in club.tags.slice(0, 3)"
                    :key="tag"
                    class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                  >
                    {{ tag }}
                  </span>
                </div>
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
              @click="openModal('professor', professor)"
              class="flex-shrink-0 w-80 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50"
      @click="closeModal"
    >
      <div
        class="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <!-- Club Modal -->
        <div v-if="modalType === 'club' && modalData" class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="flex items-center mb-2">
                <h2 class="text-2xl font-bold text-gray-900">{{ modalData.name }}</h2>
                <span
                  v-if="modalData.isProfessional"
                  class="ml-3 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                >
                  Professional
                </span>
              </div>
              <p class="text-gray-600">{{ modalData.description }}</p>
            </div>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">Details</h3>
              <div class="space-y-2 text-sm text-gray-600">
                <p><span class="font-medium">Time Commitment:</span> {{ modalData.timeCommitment }}</p>
                <p><span class="font-medium">Meeting Frequency:</span> {{ modalData.meetingFrequency }}</p>
                <p><span class="font-medium">Members:</span> {{ modalData.memberCount }}</p>
              </div>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">Tags</h3>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="tag in modalData.tags"
                  :key="tag"
                  class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="getInvolved(modalData)"
              class="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Get Involved
            </button>
            <button
              @click="closeModal"
              class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Event Modal -->
        <div v-if="modalType === 'event' && modalData" class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ modalData.title }}</h2>
              <p class="text-gray-600">{{ modalData.description }}</p>
            </div>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">Event Details</h3>
              <div class="space-y-2 text-sm text-gray-600">
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatEventDate(modalData.date) }}
                </div>
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {{ modalData.location }}
                </div>
                <div class="flex items-center">
                  <span v-if="modalData.isFree" class="text-green-600 font-medium">Free Event</span>
                  <span class="ml-2">👥 {{ modalData.attendeeCount }} going</span>
                </div>
              </div>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">Organizer</h3>
              <p class="text-gray-600">{{ modalData.organizer }}</p>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="rsvpEvent(modalData, 'going')"
              class="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              :class="{ 'bg-green-600': modalData.rsvpStatus === 'going' }"
            >
              {{ modalData.rsvpStatus === 'going' ? 'Going ✓' : 'RSVP' }}
            </button>
            <button
              @click="rsvpEvent(modalData, 'interested')"
              class="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:border-indigo-300 transition-colors"
              :class="{ 'border-indigo-600 text-indigo-600': modalData.rsvpStatus === 'interested' }"
            >
              {{ modalData.rsvpStatus === 'interested' ? 'Interested ✓' : 'Interested' }}
            </button>
            <button
              @click="closeModal"
              class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Professor Modal -->
        <div v-if="modalType === 'professor' && modalData" class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ modalData.name }}</h2>
              <p class="text-gray-600">{{ modalData.title }} • {{ modalData.department }}</p>
            </div>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="mb-6">
            <h3 class="font-semibold text-gray-900 mb-2">Research Areas</h3>
            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="area in modalData.researchAreas"
                :key="area"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
              >
                {{ area }}
              </span>
            </div>
            <div v-if="modalData.isAcceptingStudents" class="mb-4">
              <span class="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                Currently Accepting Students
              </span>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="connectWithProfessor(modalData)"
              class="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              View Contact Info
            </button>
            <button
              @click="closeModal"
              class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Club, Event, Professor, RSVPStatus } from '../types';

// State
const searchQuery = ref('');
const activeFilters = ref<string[]>([]);

// Modal state
const showModal = ref(false);
const modalType = ref<'club' | 'event' | 'professor'>('club');
const modalData = ref<any>(null);

const quickFilters = [
  { key: 'today', label: 'Today' },
  { key: 'this-week', label: 'This Week' },
  { key: 'free', label: 'Free' },
  { key: 'virtual', label: 'Virtual' }
];

// All clubs data (combining previous separate arrays)
const allClubs = ref<Club[]>([
  {
    id: 'club-1',
    name: 'AI Research Club',
    description: 'A community of students passionate about artificial intelligence research, projects, and competitions.',
    shortDescription: 'Explore AI/ML through projects and competitions',
    tags: ['AI', 'Machine Learning', 'Research'],
    category: 'academic',
    timeCommitment: '4-6 hours/week',
    meetingFrequency: 'Weekly meetings',
    contactInfo: { email: 'ai@ucf.edu' },
    whyRecommended: 'Perfect match for your machine learning interest',
    memberCount: 87,
    isProfessional: true,
    categories: [{ id: 'tech', name: 'Technology' }],
    isFollowing: false,
    upcomingEvents: []
  },
  {
    id: 'club-2',
    name: 'Data Science Society',
    description: 'Learn data science through hands-on projects, workshops, and industry partnerships.',
    shortDescription: 'Master data analysis and visualization',
    tags: ['Data Science', 'Python', 'Analytics'],
    category: 'academic',
    timeCommitment: '3-5 hours/week',
    meetingFrequency: 'Bi-weekly workshops',
    contactInfo: { email: 'datascience@ucf.edu' },
    whyRecommended: 'Great complement to your ML interests',
    memberCount: 143,
    isProfessional: true,
    categories: [{ id: 'tech', name: 'Technology' }],
    isFollowing: false,
    upcomingEvents: []
  },
  {
    id: 'club-3',
    name: 'Google Developer Student Club',
    description: 'Connect with fellow developers and learn new technologies through Google-sponsored events and workshops.',
    shortDescription: 'Learn and build with Google technologies',
    tags: ['Google', 'Development', 'Technology'],
    category: 'professional',
    timeCommitment: '3-5 hours/week',
    meetingFrequency: 'Bi-weekly meetings',
    contactInfo: { email: 'gdsc@ucf.edu' },
    whyRecommended: 'Excellent for web development skills and career networking',
    memberCount: 156,
    isProfessional: true,
    categories: [{ id: 'tech', name: 'Technology' }],
    isFollowing: false,
    upcomingEvents: []
  },
  {
    id: 'club-4',
    name: 'Cybersecurity Club',
    description: 'Learn about information security, ethical hacking, and digital forensics through hands-on workshops.',
    shortDescription: 'Explore cybersecurity and ethical hacking',
    tags: ['Cybersecurity', 'Security', 'Technology'],
    category: 'academic',
    timeCommitment: '3-4 hours/week',
    meetingFrequency: 'Weekly meetings',
    contactInfo: { email: 'cybersec@ucf.edu' },
    whyRecommended: 'High-demand field with excellent career prospects',
    memberCount: 89,
    isProfessional: true,
    categories: [{ id: 'tech', name: 'Technology' }],
    isFollowing: false,
    upcomingEvents: []
  },
  {
    id: 'club-5',
    name: 'Photography Club',
    description: 'Capture the world through your lens and learn photography techniques in a creative community.',
    shortDescription: 'Explore photography and visual arts',
    tags: ['Photography', 'Arts', 'Creative'],
    category: 'hobby',
    timeCommitment: '2-3 hours/week',
    meetingFrequency: 'Bi-weekly meetups',
    contactInfo: { email: 'photo@ucf.edu' },
    whyRecommended: 'Great creative outlet and stress relief',
    memberCount: 76,
    isProfessional: false,
    categories: [{ id: 'hobby', name: 'Hobby' }],
    isFollowing: false,
    upcomingEvents: []
  },
  {
    id: 'club-6',
    name: 'Pickleball Club',
    description: 'Join UCF\'s fastest growing sport! All skill levels welcome for fun, fitness, and friendship.',
    shortDescription: 'Play pickleball and stay active',
    tags: ['Pickleball', 'Sports', 'Fitness'],
    category: 'sport',
    timeCommitment: '2-4 hours/week',
    meetingFrequency: '3x per week',
    contactInfo: { email: 'pickleball@ucf.edu' },
    whyRecommended: 'Perfect for staying active and meeting new people',
    memberCount: 124,
    isProfessional: false,
    categories: [{ id: 'sport', name: 'Sports' }],
    isFollowing: false,
    upcomingEvents: []
  },
  {
    id: 'club-7',
    name: 'Robotics Team',
    description: 'Design, build, and program robots for competitions and research projects.',
    shortDescription: 'Build and program robots',
    tags: ['Robotics', 'Engineering', 'Technology'],
    category: 'academic',
    timeCommitment: '6-8 hours/week',
    meetingFrequency: 'Twice weekly',
    contactInfo: { email: 'robotics@ucf.edu' },
    whyRecommended: 'Hands-on engineering experience and team collaboration',
    memberCount: 45,
    isProfessional: true,
    categories: [{ id: 'tech', name: 'Technology' }],
    isFollowing: false,
    upcomingEvents: []
  },
  {
    id: 'club-8',
    name: 'Investment Club',
    description: 'Learn about financial markets, investment strategies, and portfolio management.',
    shortDescription: 'Learn investing and financial markets',
    tags: ['Finance', 'Investment', 'Business'],
    category: 'professional',
    timeCommitment: '2-3 hours/week',
    meetingFrequency: 'Weekly meetings',
    contactInfo: { email: 'invest@ucf.edu' },
    whyRecommended: 'Valuable financial literacy and career networking',
    memberCount: 92,
    isProfessional: true,
    categories: [{ id: 'business', name: 'Business' }],
    isFollowing: false,
    upcomingEvents: []
  }
]);

const upcomingEvents = ref<Event[]>([
  {
    id: 'event-1',
    name: 'AI Workshop: Building Your First Neural Network',
    title: 'AI Workshop: Building Your First Neural Network',
    description: 'Hands-on workshop covering neural network fundamentals with practical coding exercises.',
    shortDescription: 'Learn neural network basics with hands-on coding',
    startTime: new Date('2025-09-30T18:00:00'),
    endTime: new Date('2025-09-30T20:00:00'),
    date: new Date('2025-09-30T18:00:00'),
    endDate: new Date('2025-09-30T20:00:00'),
    location: 'Engineering Building II, Room 208',
    organizer: 'AI Research Club',
    tags: ['AI', 'Workshop'],
    categories: [{ id: 'workshop', name: 'Workshop' }],
    category: 'workshop',
    whyRecommended: 'Perfect for diving deeper into your ML interests',
    attendeeCount: 45,
    isVirtual: false,
    isFree: true,
    isBookmarked: false,
    url: ''
  },
  {
    id: 'event-2',
    name: 'Tech Career Fair',
    title: 'Tech Career Fair',
    description: 'Meet with top tech companies and explore internship and full-time opportunities.',
    shortDescription: 'Network with tech recruiters and explore opportunities',
    startTime: new Date('2025-10-08T10:00:00'),
    endTime: new Date('2025-10-08T16:00:00'),
    date: new Date('2025-10-08T10:00:00'),
    endDate: new Date('2025-10-08T16:00:00'),
    location: 'Student Union Pegasus Ballroom',
    organizer: 'Career Services',
    tags: ['Career', 'Technology'],
    categories: [{ id: 'career', name: 'Career' }],
    category: 'career',
    whyRecommended: 'Excellent for your computer science career path',
    attendeeCount: 234,
    isVirtual: false,
    isFree: true,
    isBookmarked: false,
    url: ''
  },
  {
    id: 'event-3',
    name: 'Cybersecurity CTF Competition',
    title: 'Cybersecurity CTF Competition',
    description: 'Test your security skills in this capture-the-flag cybersecurity competition.',
    shortDescription: 'Compete in cybersecurity challenges',
    startTime: new Date('2025-10-12T14:00:00'),
    endTime: new Date('2025-10-12T18:00:00'),
    date: new Date('2025-10-12T14:00:00'),
    endDate: new Date('2025-10-12T18:00:00'),
    location: 'Harris Center Computer Lab',
    organizer: 'Cybersecurity Club',
    tags: ['Cybersecurity', 'Competition'],
    categories: [{ id: 'competition', name: 'Competition' }],
    category: 'competition',
    whyRecommended: 'Great way to test and improve your security skills',
    attendeeCount: 67,
    isVirtual: false,
    isFree: true,
    isBookmarked: false,
    url: ''
  }
]);

const professors = ref<Professor[]>([
  {
    id: 'prof-1',
    name: 'Dr. Sarah Johnson',
    title: 'Associate Professor',
    department: 'Computer Science',
    email: 'sarah.johnson@ucf.edu',
    researchAreas: ['Machine Learning', 'Computer Vision', 'AI Ethics'],
    whyRecommended: 'Leading researcher in your area of interest',
    isAcceptingStudents: true
  }
]);

// Computed property for dynamic categories based on tags
const dynamicCategories = computed(() => {
  const tagCounts = new Map<string, Club[]>();
  
  // Group clubs by their most prominent tags
  allClubs.value.forEach(club => {
    if (club.tags && club.tags.length > 0) {
      club.tags.forEach(tag => {
        if (!tagCounts.has(tag)) {
          tagCounts.set(tag, []);
        }
        tagCounts.get(tag)!.push(club);
      });
    }
  });
  
  // Convert to categories array and sort by club count (most popular first)
  const categories = Array.from(tagCounts.entries())
    .filter(([_, clubs]) => clubs.length >= 2) // Only show tags with 2+ clubs
    .sort(([, clubsA], [, clubsB]) => clubsB.length - clubsA.length)
    .slice(0, 6) // Show top 6 categories
    .map(([tag, clubs]) => ({
      tag,
      title: `${tag} Organizations`,
      clubs: clubs.slice(0, 10) // Limit to 10 clubs per category
    }));
  
  return categories;
});

// Modal functions
const openModal = (type: 'club' | 'event' | 'professor', data: any) => {
  modalType.value = type;
  modalData.value = data;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  modalData.value = null;
};

// Methods
const toggleFilter = (filterKey: string) => {
  const index = activeFilters.value.indexOf(filterKey);
  if (index > -1) {
    activeFilters.value.splice(index, 1);
  } else {
    activeFilters.value.push(filterKey);
  }
};

const getInvolved = (club: any) => {
  console.log('Getting involved with:', club.name);
  // Implementation for getting involved
  closeModal();
};

const rsvpEvent = (event: any, status: string) => {
  console.log('RSVP for event:', event.title, 'with status:', status);
  // Update event RSVP status
  if (event.rsvpStatus) {
    event.rsvpStatus = status;
  }
};

const connectWithProfessor = (professor: any) => {
  console.log('Connecting with:', professor.name);
  // Implementation for professor connection
  closeModal();
};

const formatEventDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
};
</script>