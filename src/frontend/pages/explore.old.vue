<!-- Explore Page: Integration with real authentication and API services -->
<template>
	<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
		<!-- Navigation -->
		<nav class="bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20">
			<div class="max-w-7xl mx-auto px-4">
				<div class="flex justify-between items-center h-16">
					<div class="flex items-center space-x-8">
						<div class="text-2xl font-bold text-indigo-600">
							OppTrack
						</div>
						<div class="hidden md:flex space-x-6">
							<NuxtLink
								to="/dashboard"
								class="text-gray-500 hover:text-gray-700 transition-colors duration-200"
							>
								Dashboard
							</NuxtLink>
							<NuxtLink
								to="/explore"
								class="text-indigo-600 font-medium relative"
							>
								Explore
								<div class="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
							</NuxtLink>
							<NuxtLink
								to="/profile"
								class="text-gray-500 hover:text-gray-700 transition-colors duration-200"
							>
								Profile
							</NuxtLink>
						</div>
					</div>

					<div class="flex items-center space-x-4">
						<button class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
							<svg
								class="w-6 h-6"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</button>

						<NuxtLink
							to="/profile"
							class="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer"
						>
							{{ userInitials || 'U' }}
						</NuxtLink>
					</div>
				</div>
			</div>
		</nav>

		<!-- Loading State -->
		<div
			v-if="isLoading || eventsLoading || clubsLoading"
			class="max-w-7xl mx-auto px-4 py-8"
		>
			<div class="text-center">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
				<p class="mt-4 text-gray-600">
					Loading opportunities...
				</p>
			</div>
		</div>

		<!-- Error State -->
		<div
			v-else-if="error || eventsError || clubsError"
			class="max-w-7xl mx-auto px-4 py-8"
		>
			<div class="text-center text-red-600">
				<p>{{ error || eventsError || clubsError }}</p>
				<button
					class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
					@click="reloadData"
				>
					Try Again
				</button>
			</div>
		</div>

		<!-- Main Content -->
		<main
			v-else
			class="max-w-7xl mx-auto px-4 py-8"
		>
			<!-- Search Section -->
			<div class="mb-8">
				<div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-sm p-6 border border-white/20">
					<h1 class="text-3xl font-bold text-gray-900 mb-6">
						Explore Opportunities
					</h1>

					<!-- Search Input -->
					<div class="relative mb-6">
						<svg
							class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
						<input
							v-model="searchQuery"
							type="text"
							placeholder="Search clubs, events, or professors..."
							class="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
						>
					</div>

					<!-- Quick Filters -->
					<div class="flex flex-wrap gap-2">
						<button
							v-for="filter in quickFilters"
							:key="filter.key"
							class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
							:class="activeFilters.includes(filter.key)
								? 'bg-indigo-600 text-white shadow-lg'
								: 'bg-white/80 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200'"
							@click="toggleFilter(filter.key)"
						>
							{{ filter.label }}
						</button>
					</div>
				</div>
			</div>

			<!-- Events Section - Show at Top -->
			<div
				v-if="filteredEvents.length > 0"
				class="mb-8"
			>
				<div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-sm p-6 border border-white/20">
					<h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
						<span class="mr-2">🎯</span>
						Upcoming Events
					</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<div
							v-for="event in filteredEvents.slice(0, 6)"
							:key="event.id"
							class="bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4 hover:shadow-md transition-all duration-300 cursor-pointer group"
							@click="openModal('event', event)"
						>
							<div class="mb-3">
								<h3 class="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
									{{ event.name }}
								</h3>
								<p class="text-sm text-gray-600 mt-1">
									{{ event.shortDescription || event.description?.slice(0, 80) + '...' }}
								</p>
							</div>

							<div class="flex items-center text-xs text-gray-500 mb-2">
								<svg
									class="w-4 h-4 mr-1"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
								{{ formatEventDate(event.startTime) }}
							</div>

							<div class="flex items-center justify-between">
								<div class="flex items-center text-xs text-gray-500">
									<svg
										class="w-4 h-4 mr-1"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
										/>
									</svg>
									{{ event.location }}
								</div>
								<button
									class="px-3 py-1 bg-indigo-600 text-white text-xs rounded-full hover:bg-indigo-700 transition-colors duration-200"
									@click.stop="rsvpEvent(event, 'interested')"
								>
									Interested
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Dynamic Categories -->
			<div v-if="dynamicCategories.length > 0">
				<div
					v-for="category in dynamicCategories"
					:key="category.tag"
					class="mb-8"
				>
					<div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-sm p-6 border border-white/20">
						<h2 class="text-2xl font-bold text-gray-900 mb-6">
							{{ category.title }}
							<span class="text-lg font-normal text-gray-500 ml-2">
								({{ category.clubs.length }} organizations)
							</span>
						</h2>

						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<div
								v-for="club in category.clubs"
								:key="club.id"
								class="bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4 hover:shadow-md transition-all duration-300 cursor-pointer group"
								@click="openModal('club', club)"
							>
								<div class="mb-3">
									<h3 class="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
										{{ club.name }}
									</h3>
									<p class="text-sm text-gray-600 mt-1">
										{{ club.shortDescription || club.description?.slice(0, 80) + '...' }}
									</p>
								</div>

								<div class="flex items-center justify-between text-xs text-gray-500 mb-2">
									<span>👥 {{ club.memberCount }} members</span>
									<span v-if="club.timeCommitment">⏱️ {{ club.timeCommitment }}</span>
								</div>

								<!-- Tags -->
								<div
									v-if="club.tags && club.tags.length > 0"
									class="flex flex-wrap gap-1 mb-3"
								>
									<span
										v-for="tag in club.tags.slice(0, 3)"
										:key="tag"
										class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
									>
										{{ tag }}
									</span>
								</div>

								<button
									class="w-full py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors duration-200"
									@click.stop="getInvolved(club)"
								>
									{{ club.isFollowing ? 'Following' : 'Get Involved' }}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Professors Section -->
			<div
				v-if="filteredProfessors.length > 0"
				class="mb-8"
			>
				<div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-sm p-6 border border-white/20">
					<h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
						<span class="mr-2">👨‍🏫</span>
						Connect with Professors
					</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<div
							v-for="professor in filteredProfessors"
							:key="professor.id"
							class="bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4 hover:shadow-md transition-all duration-300 cursor-pointer group"
							@click="openModal('professor', professor)"
						>
							<div class="mb-3">
								<h3 class="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
									{{ professor.name }}
								</h3>
								<p class="text-sm text-gray-600">
									{{ professor.title }}, {{ professor.department }}
								</p>
							</div>

							<div class="mb-3">
								<p class="text-xs text-gray-500 mb-2">
									Research Areas:
								</p>
								<div class="flex flex-wrap gap-1">
									<span
										v-for="area in professor.researchAreas.slice(0, 3)"
										:key="area"
										class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
									>
										{{ area }}
									</span>
								</div>
							</div>

							<button
								class="w-full py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors duration-200"
								:disabled="!professor.isAcceptingStudents"
								@click.stop="connectWithProfessor(professor)"
							>
								{{ professor.isAcceptingStudents ? 'Connect' : 'Not Available' }}
							</button>
						</div>
					</div>
				</div>
			</div>
		</main>

		<!-- Modal -->
		<ModalOverlay
			:show="showModal"
			:type="modalType"
			:data="modalData"
			@close="closeModal"
			@get-involved="getInvolved"
			@rsvp-event="rsvpEvent"
			@connect-professor="connectWithProfessor"
		/>
	</div>
</template>

<script setup lang="ts">
import type { Club, Event, Professor } from '../types';
import { useUser } from '~/composables/useUser';
import { useEvents } from '~/composables/useEvents';
import { useClubs } from '~/composables/useClubs';

// Authentication setup
const { user, isAuthenticated, userInitials, init } = useUser();

// Use API services
const {
	events,
	fetchAllEvents,
	rsvpToEvent,
	isLoading: eventsLoading,
	error: eventsError,
} = useEvents();

const {
	clubs,
	fetchAllClubs,
	toggleClubFollow,
	isLoading: clubsLoading,
	error: clubsError,
} = useClubs();

// Modal state
const showModal = ref(false);
const modalType = ref<'club' | 'event' | 'professor'>('club');
const modalData = ref<any>(null);

// Loading state
const isLoading = ref(false);
const error = ref<string | null>(null);

// Professors data (mock for now)
const professors = ref<Professor[]>([
	{
		id: 'prof-1',
		name: 'Dr. Sarah Johnson',
		title: 'Associate Professor',
		department: 'Computer Science',
		email: 'sarah.johnson@ucf.edu',
		researchAreas: ['Machine Learning', 'Computer Vision', 'AI Ethics'],
		whyRecommended: 'Leading researcher in your area of interest',
		isAcceptingStudents: true,
	},
	{
		id: 'prof-2',
		name: 'Dr. Michael Chen',
		title: 'Professor',
		department: 'Computer Science',
		email: 'michael.chen@ucf.edu',
		researchAreas: ['Cybersecurity', 'Network Security', 'Cryptography'],
		whyRecommended: 'Excellent mentor for cybersecurity research',
		isAcceptingStudents: true,
	},
	{
		id: 'prof-3',
		name: 'Dr. Lisa Rodriguez',
		title: 'Assistant Professor',
		department: 'Data Science',
		email: 'lisa.rodriguez@ucf.edu',
		researchAreas: ['Natural Language Processing', 'Data Mining', 'Sentiment Analysis'],
		whyRecommended: 'Perfect for NLP and text analysis projects',
		isAcceptingStudents: true,
	},
]);

// Initialize data on mount
onMounted(async () => {
	// Initialize user authentication first
	await init();

	// Check authentication after initialization
	if (!isAuthenticated.value) {
		await navigateTo('/login');
		return;
	}

	try {
		isLoading.value = true;
		await Promise.all([
			fetchAllClubs(100),
			fetchAllEvents(50),
		]);
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Failed to load data';
		console.error('Failed to load explore data:', err);
	} finally {
		isLoading.value = false;
	}
});

// Methods
const reloadData = async () => {
	error.value = null;
	await Promise.all([
		fetchAllClubs(100),
		fetchAllEvents(50),
	]);
};

const openModal = (type: 'club' | 'event' | 'professor', data: any) => {
	modalType.value = type;
	modalData.value = data;
	showModal.value = true;
};

const closeModal = () => {
	showModal.value = false;
	modalData.value = null;
};

const getInvolved = async (club: Club) => {
	try {
		await toggleClubFollow(club.id);
		console.log('Toggled follow for club:', club.name);
	} catch (err) {
		console.error('Failed to follow/unfollow club:', err);
	}
};

const rsvpEvent = async (event: Event, status: 'going' | 'interested' | 'not-going') => {
	try {
		await rsvpToEvent(event.id, status);
		console.log('RSVP for event:', event.name, 'with status:', status);dashboard;
	} catch (err) {
		console.error('Failed to RSVP to event:', err);
	}
};

const connectWithProfessor = (professor: Professor) => {
	console.log('Connecting with professor:', professor.name);
	// This would integrate with email or messaging system
};

const formatEventDate = (date: Date | string) => {
	const eventDate = new Date(date);
	return eventDate.toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};
</script><style scoped>
.scrollbar-hide {
	-ms-overflow-style: none;
	scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
	display: none;
}

.line-clamp-3 {
	display: -webkit-box;
	-webkit-line-clamp: 3;
	line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
</style>