<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Navigation -->
    <nav class="bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-8">
            <div class="text-2xl font-bold text-indigo-600">OppTrack</div>
            <div class="hidden md:flex space-x-6">
              <NuxtLink to="/dashboard" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                Dashboard
              </NuxtLink>
              <NuxtLink to="/explore" class="text-indigo-600 font-medium relative">
                Explore
                <div class="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
              </NuxtLink>
              <NuxtLink to="/profile" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                Profile
              </NuxtLink>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <button class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <NuxtLink 
              to="/profile"
              class="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              JD
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Search Section -->
    <div class="bg-white/70 backdrop-blur-lg border-b border-white/20 px-4 py-6">
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
              class="block w-full pl-10 pr-3 py-3 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 shadow-lg placeholder-gray-500 transition-all duration-300"
              placeholder="Search clubs, events, professors..."
            />
          </div>

          <!-- Quick Filters -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="filter in quickFilters"
              :key="filter.key"
              @click="toggleFilter(filter.key)"
              class="px-4 py-2 rounded-full text-sm transition-all duration-300 backdrop-blur-sm"
              :class="activeFilters.includes(filter.key) 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105' 
                : 'bg-white/50 text-gray-700 border border-white/30 hover:bg-white/70 hover:shadow-md hover:scale-105'"
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
          <div class="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            <div
              v-for="(event, index) in upcomingEvents"
              :key="event.id"
              @click="openModal('event', event)"
              class="event-card flex-shrink-0 w-96 bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 hover:shadow-xl cursor-pointer transform hover:scale-105 hover:-translate-y-2"
              :style="{ animationDelay: `${index * 100}ms` }"
            >
              <div class="p-8">
                <div class="mb-4">
                  <h3 class="font-semibold text-gray-900 mb-3 text-lg">{{ event.title }}</h3>
                  <p class="text-gray-600 text-sm mb-4 leading-relaxed">{{ event.shortDescription }}</p>
                  <p class="text-indigo-600 text-xs mb-4 font-medium">{{ event.whyRecommended }}</p>
                </div>
                
                <div class="space-y-3 text-sm text-gray-500 mb-6">
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ formatEventDate(event.date) }}
                  </div>
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {{ event.location }}
                  </div>
                  <div class="flex items-center justify-between pt-2">
                    <span v-if="event.isFree" class="px-3 py-1 text-xs bg-green-100/80 backdrop-blur-sm text-green-700 rounded-full font-medium">Free</span>
                    <span class="text-gray-600">👥 {{ event.attendeeCount }} going</span>
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
          <div class="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            <div
              v-for="(club, index) in category.clubs"
              :key="club.id"
              @click="openModal('club', club)"
              class="club-card flex-shrink-0 w-96 bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 hover:shadow-xl cursor-pointer transform hover:scale-105 hover:-translate-y-2"
              :style="{ animationDelay: `${index * 100}ms` }"
            >
              <div class="p-8">
                <div class="flex items-start justify-between mb-6">
                  <div class="flex-1">
                    <div class="flex items-center mb-3">
                      <h3 class="font-semibold text-gray-900 text-lg">{{ club.name }}</h3>
                      <span
                        v-if="club.isProfessional"
                        class="ml-3 px-3 py-1 text-xs bg-green-100/80 backdrop-blur-sm text-green-700 rounded-full font-medium"
                      >
                        Professional
                      </span>
                    </div>
                    <p class="text-gray-600 text-sm mb-4 leading-relaxed">{{ club.shortDescription }}</p>
                    <p class="text-indigo-600 text-xs mb-4 font-medium">{{ club.whyRecommended }}</p>
                  </div>
                </div>
                
                <div class="flex items-center justify-between text-sm text-gray-500 mb-6">
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ club.timeCommitment }}
                  </div>
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    {{ club.memberCount }} members
                  </div>
                </div>
                
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in club.tags.slice(0, 3)"
                    :key="tag"
                    class="px-3 py-1 text-xs bg-gray-100/80 backdrop-blur-sm text-gray-600 rounded-full font-medium"
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
          <div class="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            <div
              v-for="(professor, index) in professors"
              :key="professor.id"
              @click="openModal('professor', professor)"
              class="professor-card flex-shrink-0 w-96 bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 hover:shadow-xl cursor-pointer transform hover:scale-105 hover:-translate-y-2"
              :style="{ animationDelay: `${index * 100}ms` }"
            >
              <div class="p-8">
                <div class="mb-4">
                  <h3 class="font-semibold text-gray-900 mb-2 text-lg">{{ professor.name }}</h3>
                  <p class="text-gray-600 text-sm mb-3">{{ professor.title }} • {{ professor.department }}</p>
                  <p class="text-indigo-600 text-xs mb-4 font-medium">{{ professor.whyRecommended }}</p>
                </div>
                
                <div class="mb-6">
                  <h4 class="text-sm font-medium text-gray-900 mb-3">Research Areas:</h4>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="area in professor.researchAreas.slice(0, 3)"
                      :key="area"
                      class="px-3 py-1 text-xs bg-blue-100/80 backdrop-blur-sm text-blue-700 rounded-full font-medium"
                    >
                      {{ area }}
                    </span>
                  </div>
                </div>
                
                <div v-if="professor.isAcceptingStudents">
                  <span class="px-3 py-1 text-xs bg-green-100/80 backdrop-blur-sm text-green-700 rounded-full font-medium">
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
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
        @click="closeModal"
      >
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 transform scale-95 translate-y-4"
          enter-to-class="opacity-100 transform scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 transform scale-100 translate-y-0"
          leave-to-class="opacity-0 transform scale-95 translate-y-4"
        >
          <div
            v-if="showModal"
            class="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-3xl w-full mx-4 max-h-[85vh] overflow-y-auto border border-white/20"
            @click.stop
          >
            <!-- Club Modal -->
            <div v-if="modalType === 'club' && modalData" class="p-8">
              <div class="flex justify-between items-start mb-8">
                <div class="flex-1 pr-6">
                  <div class="flex items-center mb-4">
                    <h2 class="text-3xl font-bold text-gray-900">{{ modalData.name }}</h2>
                    <span
                      v-if="modalData.isProfessional"
                      class="ml-4 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full font-medium"
                    >
                      Professional
                    </span>
                  </div>
                  <p class="text-gray-600 text-lg leading-relaxed">{{ modalData.description }}</p>
                  <p class="text-indigo-600 text-sm mt-3 font-medium">{{ modalData.whyRecommended }}</p>
                </div>
                <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div class="space-y-4">
                  <h3 class="font-semibold text-gray-900 text-lg mb-4">Details</h3>
                  <div class="space-y-3 text-gray-600">
                    <div class="flex items-center">
                      <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="font-medium">Time Commitment:</span>
                      <span class="ml-2">{{ modalData.timeCommitment }}</span>
                    </div>
                    <div class="flex items-center">
                      <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-4 8V9m-4 8h8" />
                      </svg>
                      <span class="font-medium">Meetings:</span>
                      <span class="ml-2">{{ modalData.meetingFrequency }}</span>
                    </div>
                    <div class="flex items-center">
                      <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <span class="font-medium">Members:</span>
                      <span class="ml-2">{{ modalData.memberCount }}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-lg mb-4">Tags</h3>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="tag in modalData.tags"
                      :key="tag"
                      class="px-3 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg font-medium"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex gap-4 pt-6 border-t border-gray-200/50">
                <button
                  @click="getInvolved(modalData)"
                  class="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                >
                  Get Involved
                </button>
                <button
                  @click="closeModal"
                  class="px-8 py-4 bg-gray-100 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-200 hover:border-gray-300 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>

            <!-- Event Modal -->
            <div v-if="modalType === 'event' && modalData" class="p-8">
              <div class="flex justify-between items-start mb-8">
                <div class="flex-1 pr-6">
                  <h2 class="text-3xl font-bold text-gray-900 mb-4">{{ modalData.title }}</h2>
                  <p class="text-gray-600 text-lg leading-relaxed">{{ modalData.description }}</p>
                  <p class="text-indigo-600 text-sm mt-3 font-medium">{{ modalData.whyRecommended }}</p>
                </div>
                <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 class="font-semibold text-gray-900 text-lg mb-4">Event Details</h3>
                  <div class="space-y-4 text-gray-600">
                    <div class="flex items-center">
                      <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{{ formatEventDate(modalData.date) }}</span>
                    </div>
                    <div class="flex items-center">
                      <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span>{{ modalData.location }}</span>
                    </div>
                    <div class="flex items-center space-x-4">
                      <span v-if="modalData.isFree" class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full font-medium">Free Event</span>
                      <div class="flex items-center">
                        <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        {{ modalData.attendeeCount }} going
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-lg mb-4">Organizer</h3>
                  <p class="text-gray-600 text-lg">{{ modalData.organizer }}</p>
                </div>
              </div>

              <div class="flex gap-4 pt-6 border-t border-gray-200/50">
                <button
                  @click="rsvpEvent(modalData, 'going')"
                  class="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                  :class="{ 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800': modalData.rsvpStatus === 'going' }"
                >
                  {{ modalData.rsvpStatus === 'going' ? 'Going ✓' : 'RSVP' }}
                </button>
                <button
                  @click="rsvpEvent(modalData, 'interested')"
                  class="flex-1 py-4 px-6 bg-gray-100 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-200 hover:border-indigo-300 transition-all duration-300 font-medium"
                  :class="{ 'border-indigo-600 text-indigo-600 bg-indigo-50': modalData.rsvpStatus === 'interested' }"
                >
                  {{ modalData.rsvpStatus === 'interested' ? 'Interested ✓' : 'Interested' }}
                </button>
                <button
                  @click="closeModal"
                  class="px-8 py-4 bg-gray-100 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-200 hover:border-gray-300 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>

            <!-- Professor Modal -->
            <div v-if="modalType === 'professor' && modalData" class="p-8">
              <div class="flex justify-between items-start mb-8">
                <div class="flex-1 pr-6">
                  <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ modalData.name }}</h2>
                  <p class="text-gray-600 text-lg">{{ modalData.title }} • {{ modalData.department }}</p>
                  <p class="text-indigo-600 text-sm mt-3 font-medium">{{ modalData.whyRecommended }}</p>
                </div>
                <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="mb-8">
                <h3 class="font-semibold text-gray-900 text-lg mb-4">Research Areas</h3>
                <div class="flex flex-wrap gap-3 mb-6">
                  <span
                    v-for="area in modalData.researchAreas"
                    :key="area"
                    class="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-xl font-medium"
                  >
                    {{ area }}
                  </span>
                </div>
                <div v-if="modalData.isAcceptingStudents" class="mb-6">
                  <span class="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-xl font-medium inline-flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Currently Accepting Students
                  </span>
                </div>
              </div>

              <div class="flex gap-4 pt-6 border-t border-gray-200/50">
                <button
                  @click="connectWithProfessor(modalData)"
                  class="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                >
                  View Contact Info
                </button>
                <button
                  @click="closeModal"
                  class="px-8 py-4 bg-gray-100 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-200 hover:border-gray-300 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
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
  },
  {
    id: 'club-9',
    name: 'Debate Society',
    description: 'Develop your public speaking and argumentation skills through competitive debate.',
    shortDescription: 'Enhance critical thinking and public speaking',
    tags: ['Debate', 'Public Speaking', 'Leadership'],
    category: 'academic',
    timeCommitment: '4-5 hours/week',
    meetingFrequency: 'Twice weekly',
    contactInfo: { email: 'debate@ucf.edu' },
    whyRecommended: 'Perfect for developing leadership and communication skills',
    memberCount: 67,
    isProfessional: true,
    categories: [{ id: 'academic', name: 'Academic' }],
    isFollowing: false,
    upcomingEvents: []
  },
  {
    id: 'club-10',
    name: 'Gaming Club',
    description: 'Connect with fellow gamers and compete in esports tournaments.',
    shortDescription: 'Competitive gaming and esports community',
    tags: ['Gaming', 'Esports', 'Competition'],
    category: 'hobby',
    timeCommitment: '3-6 hours/week',
    meetingFrequency: 'Daily sessions',
    contactInfo: { email: 'gaming@ucf.edu' },
    whyRecommended: 'Great for stress relief and building teamwork skills',
    memberCount: 234,
    isProfessional: false,
    categories: [{ id: 'hobby', name: 'Hobby' }],
    isFollowing: false,
    upcomingEvents: []
  },
  {
    id: 'club-11',
    name: 'Environmental Club',
    description: 'Make a positive impact on campus sustainability and environmental awareness.',
    shortDescription: 'Promote sustainability and environmental action',
    tags: ['Environment', 'Sustainability', 'Activism'],
    category: 'service',
    timeCommitment: '2-4 hours/week',
    meetingFrequency: 'Weekly meetings',
    contactInfo: { email: 'environment@ucf.edu' },
    whyRecommended: 'Perfect for making a meaningful impact',
    memberCount: 89,
    isProfessional: false,
    categories: [{ id: 'service', name: 'Service' }],
    isFollowing: false,
    upcomingEvents: []
  },
  {
    id: 'club-12',
    name: 'Music Production Club',
    description: 'Learn music production, mixing, and collaborate with other musicians.',
    shortDescription: 'Create and produce music collaboratively',
    tags: ['Music', 'Production', 'Creative'],
    category: 'hobby',
    timeCommitment: '3-5 hours/week',
    meetingFrequency: 'Bi-weekly sessions',
    contactInfo: { email: 'music@ucf.edu' },
    whyRecommended: 'Excellent creative outlet and networking opportunity',
    memberCount: 78,
    isProfessional: false,
    categories: [{ id: 'creative', name: 'Creative' }],
    isFollowing: false,
    upcomingEvents: []
  },
  {
    id: 'club-13',
    name: 'Pre-Med Society',
    description: 'Support and resources for students pursuing medical careers.',
    shortDescription: 'Medical career preparation and networking',
    tags: ['Medicine', 'Healthcare', 'Pre-Med'],
    category: 'professional',
    timeCommitment: '3-4 hours/week',
    meetingFrequency: 'Weekly meetings',
    contactInfo: { email: 'premed@ucf.edu' },
    whyRecommended: 'Essential for medical school preparation',
    memberCount: 156,
    isProfessional: true,
    categories: [{ id: 'professional', name: 'Professional' }],
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
  },
  {
    id: 'event-4',
    name: 'Startup Pitch Competition',
    title: 'Startup Pitch Competition',
    description: 'Present your business idea to a panel of investors and entrepreneurs.',
    shortDescription: 'Pitch your startup idea for prizes and funding',
    startTime: new Date('2025-10-15T17:00:00'),
    endTime: new Date('2025-10-15T20:00:00'),
    date: new Date('2025-10-15T17:00:00'),
    endDate: new Date('2025-10-15T20:00:00'),
    location: 'Student Union Pegasus Ballroom',
    organizer: 'Entrepreneurship Society',
    tags: ['Business', 'Startup', 'Competition'],
    categories: [{ id: 'competition', name: 'Competition' }],
    category: 'competition',
    whyRecommended: 'Perfect opportunity to showcase your business ideas',
    attendeeCount: 89,
    isVirtual: false,
    isFree: true,
    isBookmarked: false,
    url: ''
  },
  {
    id: 'event-5',
    name: 'Photography Workshop',
    title: 'Photography Workshop',
    description: 'Learn advanced photography techniques and portfolio building.',
    shortDescription: 'Master photography fundamentals and techniques',
    startTime: new Date('2025-10-18T16:00:00'),
    endTime: new Date('2025-10-18T19:00:00'),
    date: new Date('2025-10-18T16:00:00'),
    endDate: new Date('2025-10-18T19:00:00'),
    location: 'Visual Arts Building, Studio A',
    organizer: 'Photography Club',
    tags: ['Photography', 'Workshop', 'Creative'],
    categories: [{ id: 'workshop', name: 'Workshop' }],
    category: 'workshop',
    whyRecommended: 'Great for developing your creative portfolio',
    attendeeCount: 32,
    isVirtual: false,
    isFree: true,
    isBookmarked: false,
    url: ''
  },
  {
    id: 'event-6',
    name: 'Medical School Info Session',
    title: 'Medical School Info Session',
    description: 'Learn about medical school applications, MCAT prep, and career paths.',
    shortDescription: 'Essential info for aspiring medical students',
    startTime: new Date('2025-10-20T18:30:00'),
    endTime: new Date('2025-10-20T20:00:00'),
    date: new Date('2025-10-20T18:30:00'),
    endDate: new Date('2025-10-20T20:00:00'),
    location: 'College of Medicine Auditorium',
    organizer: 'Pre-Med Society',
    tags: ['Medicine', 'Career', 'Information'],
    categories: [{ id: 'professional', name: 'Professional' }],
    category: 'professional',
    whyRecommended: 'Critical for medical school preparation',
    attendeeCount: 145,
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

<style scoped>
/* Hide scrollbar for cleaner look */
.scrollbar-hide {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* Card entrance animations */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Apply staggered animation to cards */
.event-card,
.club-card,
.professor-card {
  animation: slideInUp 0.6s ease-out forwards;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced hover effects */
.event-card:hover,
.club-card:hover,
.professor-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

/* Glassmorphism effects */
.backdrop-blur-lg {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Smooth transitions for all interactive elements */
button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced gradient backgrounds */
.bg-gradient-to-br {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
}

.bg-gradient-to-r {
  background: linear-gradient(90deg, var(--tw-gradient-stops));
}

/* Modal animations */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Button hover animations */
.transform:hover {
  transform: translateY(-1px) scale(1.05);
}

/* Card content animations */
.event-card .p-8,
.club-card .p-8,
.professor-card .p-8 {
  transition: all 0.3s ease;
}

.event-card:hover .p-8,
.club-card:hover .p-8,
.professor-card:hover .p-8 {
  transform: translateY(-2px);
}
</style>