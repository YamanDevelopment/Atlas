<!-- Explore Page: Three-Section Horizontal Scrollable Layout -->
<template>
	<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
		<!-- Navigation -->
		<nav class="bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20">
			<div class="max-w-7xl mx-auto px-4">
				<div class="flex justify-between items-center h-16">
					<div class="flex items-center space-x-8">
						<NuxtLink
							to="/"
							class="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
						>
							OppTrack
						</NuxtLink>
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
						<!-- User Profile Button -->
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
			<!-- Page Header -->
			<div class="text-center mb-12">
				<h1 class="text-4xl font-bold text-gray-900 mb-4">
					Explore Opportunities
				</h1>
				<p class="text-lg text-gray-600 max-w-2xl mx-auto">
					Discover student organizations, exciting events, and cutting-edge research labs
				</p>
			</div>

			<!-- Organizations Section -->
			<section class="mb-12">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-2xl font-semibold text-gray-900">
						Student Organizations
					</h2>
					<span class="text-sm text-gray-500">{{ clubs?.length || 0 }} organizations</span>
				</div>

				<div
					v-if="clubs && clubs.length > 0"
					class="relative"
				>
					<div class="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
						<div
							v-for="club in clubs"
							:key="club.id"
							class="flex-shrink-0 w-80 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200"
							@click="openModal('club', club)"
						>
							<div class="p-6">
								<div class="flex items-start justify-between mb-4">
									<div>
										<h3 class="text-lg font-semibold text-gray-900 mb-2">
											{{ club.name }}
										</h3>
										<p class="text-sm text-gray-600 line-clamp-3">
											{{ club.shortDescription || club.description }}
										</p>
									</div>
								</div>

								<div class="flex flex-wrap gap-2 mb-4">
									<span
										v-for="category in club.categories?.slice(0, 3)"
										:key="category.id"
										class="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
									>
										{{ category.name }}
									</span>
								</div>

								<div class="flex items-center justify-between">
									<div class="flex items-center space-x-2">
										<span class="text-sm text-gray-500">{{ club.memberCount || 0 }} members</span>
										<span
											v-if="club.location"
											class="text-sm text-gray-500"
										>• {{ club.location }}</span>
									</div>
									<button
										class="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
										@click.stop="joinClub(club)"
									>
										{{ club.isJoined ? 'Joined' : 'Join' }}
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div
					v-else
					class="text-center py-12 text-gray-500"
				>
					<p>No student organizations available at the moment.</p>
				</div>
			</section>

			<!-- Events Section -->
			<section class="mb-12">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-2xl font-semibold text-gray-900">
						Upcoming Events
					</h2>
					<span class="text-sm text-gray-500">{{ events?.length || 0 }} events</span>
				</div>

				<div
					v-if="events && events.length > 0"
					class="relative"
				>
					<div class="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
						<div
							v-for="event in events"
							:key="event.id"
							class="flex-shrink-0 w-80 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200"
							@click="openModal('event', event)"
						>
							<div class="p-6">
								<div class="flex items-start justify-between mb-4">
									<div>
										<h3 class="text-lg font-semibold text-gray-900 mb-2">
											{{ event.name || event.title }}
										</h3>
										<p class="text-sm text-gray-600 line-clamp-3">
											{{ event.shortDescription || event.description }}
										</p>
									</div>
								</div>

								<div class="flex flex-wrap gap-2 mb-4">
									<span
										v-for="category in event.categories?.slice(0, 3)"
										:key="category.id"
										class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
									>
										{{ category.name }}
									</span>
								</div>

								<div class="flex items-center justify-between">
									<div class="text-sm text-gray-500">
										<div>{{ formatEventDate(event.startTime) }}</div>
										<div v-if="event.location">
											{{ event.location }}
										</div>
									</div>
									<button
										class="p-2 rounded-full hover:bg-gray-100 transition-colors"
										:title="event.isBookmarked ? 'Remove Bookmark' : 'Bookmark Event'"
										@click.stop="bookmarkEvent(event)"
									>
										<svg
											class="w-5 h-5"
											:class="event.isBookmarked ? 'text-yellow-500 fill-current' : 'text-gray-400'"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
											/>
										</svg>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div
					v-else
					class="text-center py-12 text-gray-500"
				>
					<p>No upcoming events available at the moment.</p>
				</div>
			</section>

			<!-- Labs Section -->
			<section>
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-2xl font-semibold text-gray-900">
						Research Labs
					</h2>
					<span class="text-sm text-gray-500">{{ labs?.length || 0 }} labs</span>
				</div>

				<div
					v-if="labs && labs.length > 0"
					class="relative"
				>
					<div class="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
						<div
							v-for="lab in labs"
							:key="lab.id"
							class="flex-shrink-0 w-80 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200"
							@click="openModal('lab', lab)"
						>
							<div class="p-6">
								<div class="flex items-start justify-between mb-4">
									<div>
										<h3 class="text-lg font-semibold text-gray-900 mb-2">
											{{ lab.labName || lab.name }}
										</h3>
										<p class="text-sm text-gray-600 line-clamp-3">
											{{ lab.labDescription || lab.description }}
										</p>
									</div>
								</div>

								<div class="flex flex-wrap gap-2 mb-4">
									<span
										v-for="area in lab.researchAreas?.slice(0, 3) || []"
										:key="area"
										class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
									>
										{{ area }}
									</span>
								</div>

								<div class="flex items-center justify-between">
									<div class="space-y-1">
										<div class="text-sm text-gray-500">
											{{ lab.department }}
										</div>
										<div class="text-xs text-gray-400">
											PI: {{ lab.name }}
										</div>
									</div>
									<div class="flex items-center space-x-2">
										<span
											class="px-2 py-1 text-xs rounded-full"
											:class="lab.isAcceptingStudents ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
										>
											{{ lab.isAcceptingStudents ? 'Available' : 'Full' }}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div
					v-else
					class="text-center py-12 text-gray-500"
				>
					<p>No research labs available at the moment.</p>
				</div>
			</section>
		</main>

		<!-- Club Modal -->
		<Transition name="modal">
			<div
				v-if="showClubModal && selectedClub"
				class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
				@click="showClubModal = false"
			>
				<div
					class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
					@click.stop
				>
					<div class="p-6">
						<div class="flex justify-between items-start mb-4">
							<h2 class="text-2xl font-bold text-gray-900">
								{{ selectedClub.name }}
							</h2>
							<button
								class="text-gray-400 hover:text-gray-600"
								@click="showClubModal = false"
							>
								<svg
									class="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						<div class="space-y-4">
							<p class="text-gray-600">
								{{ selectedClub.description }}
							</p>

							<div v-if="selectedClub.categories && selectedClub.categories.length > 0">
								<h3 class="font-semibold mb-2">
									Categories
								</h3>
								<div class="flex flex-wrap gap-2">
									<span
										v-for="category in selectedClub.categories"
										:key="category.id"
										class="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full"
									>
										{{ category.name }}
									</span>
								</div>
							</div>

							<div class="grid grid-cols-2 gap-4 text-sm">
								<div v-if="selectedClub.memberCount">
									<span class="font-semibold">Members:</span> {{ selectedClub.memberCount }}
								</div>
								<div v-if="selectedClub.location">
									<span class="font-semibold">Location:</span> {{ selectedClub.location }}
								</div>
								<div v-if="selectedClub.meetingSchedule">
									<span class="font-semibold">Meetings:</span> {{ selectedClub.meetingSchedule }}
								</div>
							</div>

							<div v-if="selectedClub.upcomingEvents && selectedClub.upcomingEvents.length > 0">
								<h3 class="font-semibold mb-2">
									Upcoming Events
								</h3>
								<div class="space-y-2">
									<div
										v-for="event in selectedClub.upcomingEvents.slice(0, 3)"
										:key="event.id"
										class="p-3 bg-gray-50 rounded-lg"
									>
										<div class="font-medium">
											{{ event.name }}
										</div>
										<div class="text-sm text-gray-600">
											{{ formatEventDate(event.startDate || event.startTime) }}
										</div>
									</div>
								</div>
							</div>

							<div class="flex space-x-4 pt-4">
								<button
									class="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
									@click="joinClub(selectedClub)"
								>
									{{ selectedClub.isJoined ? 'Joined' : 'Join' }}
								</button>
								<button
									v-if="selectedClub.url"
									class="flex-1 border border-indigo-600 text-indigo-600 py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors"
									@click="openUrl(selectedClub.url)"
								>
									Visit Website
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Transition>

		<!-- Event Modal -->
		<Transition name="modal">
			<div
				v-if="showEventModal && selectedEvent"
				class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
				@click="showEventModal = false"
			>
				<div
					class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
					@click.stop
				>
					<div class="p-6">
						<div class="flex justify-between items-start mb-4">
							<h2 class="text-2xl font-bold text-gray-900">
								{{ selectedEvent.name || selectedEvent.title }}
							</h2>
							<button
								class="text-gray-400 hover:text-gray-600"
								@click="showEventModal = false"
							>
								<svg
									class="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						<div class="space-y-4">
							<p class="text-gray-600">
								{{ selectedEvent.description }}
							</p>

							<div class="grid grid-cols-1 gap-4 text-sm">
								<div>
									<span class="font-semibold">Date & Time:</span> {{ formatEventDate(selectedEvent.startTime) }}
								</div>
								<div v-if="selectedEvent.location">
									<span class="font-semibold">Location:</span> {{ selectedEvent.location }}
								</div>
								<div v-if="selectedEvent.organization">
									<span class="font-semibold">Hosted by:</span> {{ selectedEvent.organization.name }}
								</div>
							</div>

							<div v-if="selectedEvent.categories && selectedEvent.categories.length > 0">
								<h3 class="font-semibold mb-2">
									Categories
								</h3>
								<div class="flex flex-wrap gap-2">
									<span
										v-for="category in selectedEvent.categories"
										:key="category.id"
										class="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
									>
										{{ category.name }}
									</span>
								</div>
							</div>

							<div class="flex space-x-2 pt-4">
								<button
									class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
									@click="bookmarkEvent(selectedEvent)"
								>
									<svg
										class="w-5 h-5 mr-2"
										:class="selectedEvent.isBookmarked ? 'text-yellow-500 fill-current' : 'text-gray-400'"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
										/>
									</svg>
									{{ selectedEvent.isBookmarked ? 'Bookmarked' : 'Bookmark' }}
								</button>
								<button
									v-if="selectedEvent.url"
									class="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
									@click="openUrl(selectedEvent.url)"
								>
									Visit Event
								</button>
								<button
									v-else
									class="flex-1 bg-gray-400 text-white py-2 px-4 rounded-lg cursor-not-allowed"
									disabled
								>
									No Event Link
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Transition>

		<!-- Professor Modal -->
		<Transition name="modal">
			<div
				v-if="showProfessorModal && selectedProfessor"
				class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
				@click="showProfessorModal = false"
			>
				<div
					class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
					@click.stop
				>
					<div class="p-6">
						<div class="flex justify-between items-start mb-4">
							<h2 class="text-2xl font-bold text-gray-900">
								{{ selectedProfessor.name }}
							</h2>
							<button
								class="text-gray-400 hover:text-gray-600"
								@click="showProfessorModal = false"
							>
								<svg
									class="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						<div class="space-y-4">
							<p class="text-gray-600">
								{{ selectedProfessor.title }}, {{ selectedProfessor.department }}
							</p>

							<div class="grid grid-cols-1 gap-4 text-sm">
								<div v-if="selectedProfessor.department">
									<span class="font-semibold">Department:</span> {{ selectedProfessor.department }}
								</div>
								<div v-if="selectedProfessor.email">
									<span class="font-semibold">Email:</span> {{ selectedProfessor.email }}
								</div>
							</div>

							<div v-if="selectedProfessor.researchAreas && selectedProfessor.researchAreas.length > 0">
								<h3 class="font-semibold mb-2">
									Research Areas
								</h3>
								<div class="flex flex-wrap gap-2">
									<span
										v-for="area in selectedProfessor.researchAreas"
										:key="area"
										class="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
									>
										{{ area }}
									</span>
								</div>
							</div>

							<div
								v-if="selectedProfessor.whyRecommended"
								class="bg-blue-50 p-4 rounded-lg"
							>
								<h4 class="font-semibold text-blue-900 mb-2">
									Why Recommended
								</h4>
								<p class="text-blue-800 text-sm">
									{{ selectedProfessor.whyRecommended }}
								</p>
							</div>

							<div class="flex space-x-4 pt-4">
								<button
									class="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
									:disabled="!selectedProfessor.isAcceptingStudents"
									@click="connectWithProfessor(selectedProfessor)"
								>
									{{ selectedProfessor.isAcceptingStudents ? 'Connect' : 'Not Accepting Students' }}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import type { Club, Event, Professor } from '../types';
import { useUser } from '~/composables/useUser';
import { useEvents } from '~/composables/useEvents';
import { useClubs } from '~/composables/useClubs';
import { apiService } from '~/services/api';

// Authentication setup
const { userInitials, init, isAuthenticated } = useUser();

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

// Modal states
const showClubModal = ref(false);
const showEventModal = ref(false);
const showProfessorModal = ref(false);
const selectedClub = ref<Club | null>(null);
const selectedEvent = ref<Event | null>(null);
const selectedProfessor = ref<Professor | null>(null);

// Loading state
const isLoading = ref(false);
const error = ref<string | null>(null);

// Labs/Research data loaded from API
interface Lab {
	id: string;
	name: string;
	labName?: string;
	description?: string;
	labDescription?: string;
	department: string;
	principalInvestigator: string;
	email?: string;
	location?: string;
	researchAreas: string[];
	isAcceptingStudents: boolean;
}

const labs = ref<Lab[]>([]);

// Fetch labs data from API
const fetchLabs = async (limit = 20) => {
	try {
		const labsData = await apiService.getLabs(limit);

		labs.value = labsData.map((lab: any) => ({
			id: lab.id.toString(),
			name: lab.principalInvestigator || 'Principal Investigator',
			labName: lab.name,
			description: lab.description,
			labDescription: lab.description,
			department: lab.department,
			principalInvestigator: lab.principalInvestigator,
			email: lab.email || `${(lab.principalInvestigator || 'contact').toLowerCase().replace(/\s+/g, '.')}@ucf.edu`,
			location: lab.location,
			researchAreas: lab.researchAreas || [],
			isAcceptingStudents: lab.acceptingStudents || false,
		}));
	} catch (fetchError) {
		console.error('Failed to fetch labs:', fetchError);
		labs.value = []; // Clear on error
	}
};

// Keep professors computed for backward compatibility (but empty now)
const professors = computed(() => labs.value as any[]);

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
			fetchLabs(20),
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
	try {
		await Promise.all([
			fetchAllClubs(100),
			fetchAllEvents(50),
		]);
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Failed to reload data';
	}
};

const openModal = (type: 'club' | 'event' | 'professor' | 'lab', data: any) => {
	if (type === 'club') {
		selectedClub.value = data;
		showClubModal.value = true;
	} else if (type === 'event') {
		selectedEvent.value = data;
		showEventModal.value = true;
	} else if (type === 'professor' || type === 'lab') {
		selectedProfessor.value = data;
		showProfessorModal.value = true;
	}
};

const joinClub = async (club: any) => {
	try {
		// Add club as commitment instead of following
		const response = await apiService.post('/involvement/add-commitment', {
			type: 'organization',
			itemId: parseInt(club.id),
			status: 'active',
		});

		if (response.success) {
			club.isJoined = !club.isJoined;
			console.log('Joined club as commitment:', club.name);
		}
	} catch (err) {
		console.error('Failed to join club:', err);
	}
};

const bookmarkEvent = async (event: any) => {
	try {
		// Toggle bookmark status
		const response = await apiService.post(`/events/${event.id}/bookmark`, {
			bookmarked: !event.isBookmarked,
		});

		if (response.success) {
			event.isBookmarked = !event.isBookmarked;
			console.log('Toggled bookmark for event:', event.name);
		}
	} catch (err) {
		console.error('Failed to bookmark event:', err);
	}
};

const followClub = async (club: Club) => {
	try {
		await toggleClubFollow(club.id);
		club.isFollowing = !club.isFollowing;
		console.log('Toggled follow for club:', club.name);
	} catch (err) {
		console.error('Failed to follow/unfollow club:', err);
	}
};

const openUrl = (url: string) => {
	window.open(url, '_blank');
};

const rsvpEvent = async (event: Event, status: 'going' | 'interested' | 'not-going') => {
	try {
		await rsvpToEvent(event.id, status);
		console.log('RSVP for event:', event.name, 'with status:', status);

		// Close modal after RSVP
		showEventModal.value = false;
	} catch (err) {
		console.error('Failed to RSVP to event:', err);
	}
};

const connectWithProfessor = (professor: Professor) => {
	console.log('Connecting with professor:', professor.name);
	// This would integrate with email or messaging system
	// For now, just close the modal
	showProfessorModal.value = false;
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
</script>

<style scoped>
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

.modal-enter-active,
.modal-leave-active {
	transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
	opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
	transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
	transform: scale(0.9);
}
</style>