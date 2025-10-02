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
								class="text-gray-500 hover:text-gray-700 transition-colors duration-200"
							>
								Explore
							</NuxtLink>
							<NuxtLink
								to="/profile"
								class="text-indigo-600 font-medium relative"
							>
								Profile
								<div class="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
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
							JD
						</NuxtLink>
					</div>
				</div>
			</div>
		</nav>

		<!-- Main Content -->
		<main class="max-w-4xl mx-auto px-4 py-8">
			<!-- Header -->
			<div class="mb-8">
				<h1 class="text-3xl font-bold text-gray-900">
					Profile Settings
				</h1>
				<p class="text-gray-600 mt-2">
					Manage your preferences to get better recommendations.
				</p>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<!-- Settings Navigation -->
				<div class="lg:col-span-1">
					<nav class="bg-white rounded-xl shadow-sm p-1">
						<ul class="space-y-1">
							<li>
								<button
									class="w-full text-left px-4 py-3 rounded-lg transition-colors"
									:class="activeSection === 'basic' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'"
									@click="activeSection = 'basic'"
								>
									<div class="flex items-center">
										<svg
											class="w-5 h-5 mr-3"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
											/>
										</svg>
										Basic Info
									</div>
								</button>
							</li>
							<li>
								<button
									class="w-full text-left px-4 py-3 rounded-lg transition-colors"
									:class="activeSection === 'interests' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'"
									@click="activeSection = 'interests'"
								>
									<div class="flex items-center">
										<svg
											class="w-5 h-5 mr-3"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
											/>
										</svg>
										Interests
									</div>
								</button>
							</li>
							<li>
								<button
									class="w-full text-left px-4 py-3 rounded-lg transition-colors"
									:class="activeSection === 'preferences' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'"
									@click="activeSection = 'preferences'"
								>
									<div class="flex items-center">
										<svg
											class="w-5 h-5 mr-3"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										Time & Preferences
									</div>
								</button>
							</li>
							<li>
								<button
									class="w-full text-left px-4 py-3 rounded-lg transition-colors"
									:class="activeSection === 'notifications' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'"
									@click="activeSection = 'notifications'"
								>
									<div class="flex items-center">
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
										<span style="margin-left: calc(var(--spacing) * 2.5)">Notifications</span>
									</div>
								</button>
							</li>
						</ul>
					</nav>
				</div>

				<!-- Main Settings Panel -->
				<div class="lg:col-span-2">
					<div class="bg-white rounded-xl shadow-sm">
						<!-- Basic Info Section -->
						<div
							v-if="activeSection === 'basic'"
							class="p-6"
						>
							<h2 class="text-xl font-semibold text-gray-900 mb-6">
								Basic Information
							</h2>

							<form
								class="space-y-6"
								@submit.prevent="saveBasicInfo"
							>
								<div>
									<label
										for="fullName"
										class="block text-sm font-medium text-gray-700 mb-2"
									>
										Full Name
									</label>
									<input
										id="fullName"
										v-model="profile.name"
										type="text"
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
									>
								</div>
								<div>
									<label
										for="username"
										class="block text-sm font-medium text-gray-700 mb-2"
									>
										Username
									</label>
									<input
										id="username"
										v-model="profile.username"
										type="text"
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
									>
								</div>

								<div>
									<label
										for="email"
										class="block text-sm font-medium text-gray-700 mb-2"
									>
										Email Address
									</label>
									<input
										id="email"
										v-model="profile.email"
										type="email"
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
									>
								</div>

								<div>
									<label
										for="major"
										class="block text-sm font-medium text-gray-700 mb-2"
									>
										Major
									</label>
									<select
										id="major"
										v-model="profile.major"
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
									>
										<option value="">
											Select your major...
										</option>
										<option
											v-for="major in majors"
											:key="major"
											:value="major"
										>
											{{ major }}
										</option>
									</select>
								</div>

								<div class="flex justify-end">
									<button
										type="submit"
										:disabled="isSaving"
										class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
									>
										{{ isSaving ? 'Saving...' : 'Save Changes' }}
									</button>
								</div>
							</form>
						</div>

						<!-- Interests Section -->
						<div
							v-else-if="activeSection === 'interests'"
							class="p-6"
						>
							<h2 class="text-xl font-semibold text-gray-900 mb-6">
								Your Interests
							</h2>

							<div class="space-y-6">
								<!-- Interest counter -->
								<div class="text-center p-4 bg-gray-50 rounded-lg">
									<span class="text-lg font-medium text-gray-900">
										{{ profile.interests.length }} / 10 interests selected
									</span>
									<p class="text-sm text-gray-500 mt-1">
										Select up to 10 interests to get personalized recommendations
									</p>
								</div>

								<!-- Search/Add interests -->
								<div class="space-y-4">
									<div class="relative">
										<input
											v-model="interestSearch"
											type="text"
											placeholder="Search interests or add custom ones..."
											class="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
											@input="handleInterestSearch"
											@focus="showInterestDropdown = true"
											@blur="closeInterestDropdown"
										>
										<button
											v-if="interestSearch && !searchResults.some((i: any) => i.name.toLowerCase() === interestSearch.toLowerCase())"
											:disabled="profile.interests.length >= 10"
											class="absolute right-2 top-2 px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
											@click="addCustomInterest"
										>
											Add Custom
										</button>

										<!-- Search Results Dropdown -->
										<div
											v-if="showInterestDropdown && searchResults.length > 0"
											class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
										>
											<button
												v-for="interest in searchResults"
												:key="interest.id"
												:disabled="!profile.interests.some((i: any) => i.id === interest.id) && profile.interests.length >= 10"
												class="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 disabled:opacity-50 last:border-b-0"
												:class="{ 'bg-indigo-50 text-indigo-700': profile.interests.some((i: any) => i.id === interest.id) }"
												@click="toggleInterest(interest)"
											>
												<div class="flex justify-between items-center">
													<span>{{ interest.name }}</span>
													<span
														class="text-xs px-2 py-1 rounded-full"
														:class="getCategoryColor(interest.category)"
													>
														{{ interest.category }}
													</span>
												</div>
											</button>
										</div>
									</div>
								</div>

								<!-- Selected interests -->
								<div
									v-if="profile.interests.length > 0"
									class="space-y-4"
								>
									<h3 class="text-lg font-medium text-gray-900">
										Your Interests
									</h3>
									<div class="flex flex-wrap gap-2">
										<div
											v-for="interest in profile.interests"
											:key="interest.id"
											class="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
										>
											<span>{{ interest.name }}</span>
											<button
												class="ml-2 text-indigo-600 hover:text-indigo-800"
												@click="removeInterest(interest)"
											>
												<svg
													class="w-4 h-4"
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
									</div>
								</div>

								<div class="flex justify-end">
									<button
										:disabled="isSaving"
										class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
										@click="saveInterests"
									>
										{{ isSaving ? 'Saving...' : 'Save Interests' }}
									</button>
								</div>
							</div>
						</div>

						<!-- Time & Preferences Section -->
						<div
							v-else-if="activeSection === 'preferences'"
							class="p-6"
						>
							<h2 class="text-xl font-semibold text-gray-900 mb-6">
								Time Budget & Preferences
							</h2>

							<div class="space-y-6">
								<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
									<div class="flex">
										<svg
											class="h-5 w-5 text-yellow-400 mr-3 mt-0.5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<div>
											<h3 class="text-sm font-medium text-yellow-800">
												Coming Soon
											</h3>
											<p class="text-sm text-yellow-700 mt-1">
												Time budget and preference settings will be available in a future update. For now, we'll use smart defaults based on your profile.
											</p>
										</div>
									</div>
								</div>

								<!-- Placeholder preference settings -->
								<div class="opacity-50 pointer-events-none">
									<div class="space-y-6">
										<div>
											<label class="block text-sm font-medium text-gray-700 mb-4">
												How much time do you want to commit per week?
											</label>
											<div class="space-y-3">
												<label class="flex items-start p-4 border rounded-lg border-indigo-600 bg-indigo-50">
													<input
														type="radio"
														checked
														disabled
														class="mt-1 mr-3 text-indigo-600"
													>
													<div>
														<div class="font-medium text-gray-900">3-5 hours per week</div>
														<div class="text-sm text-gray-500">Moderate involvement - ideal balance of commitment and flexibility</div>
													</div>
												</label>
												<label class="flex items-start p-4 border rounded-lg border-gray-300">
													<input
														type="radio"
														disabled
														class="mt-1 mr-3 text-indigo-600"
													>
													<div>
														<div class="font-medium text-gray-900">1-2 hours per week</div>
														<div class="text-sm text-gray-500">Light involvement - perfect for trying new things</div>
													</div>
												</label>
												<label class="flex items-start p-4 border rounded-lg border-gray-300">
													<input
														type="radio"
														disabled
														class="mt-1 mr-3 text-indigo-600"
													>
													<div>
														<div class="font-medium text-gray-900">6+ hours per week</div>
														<div class="text-sm text-gray-500">High involvement - ready for leadership roles</div>
													</div>
												</label>
											</div>
										</div>

										<div>
											<label class="block text-sm font-medium text-gray-700 mb-4">
												Current Involvements
											</label>
											<div class="space-y-2">
												<input
													type="text"
													placeholder="e.g., Study group, Part-time job..."
													disabled
													class="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
												>
												<button
													type="button"
													disabled
													class="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 opacity-50"
												>
													+ Add involvement
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- Notifications Section -->
						<div
							v-else-if="activeSection === 'notifications'"
							class="p-6"
						>
							<h2 class="text-xl font-semibold text-gray-900 mb-6">
								Notification Preferences
							</h2>

							<div class="space-y-6">
								<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
									<div class="flex">
										<svg
											class="h-5 w-5 text-yellow-400 mr-3 mt-0.5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<div>
											<h3 class="text-sm font-medium text-yellow-800">
												Coming Soon
											</h3>
											<p class="text-sm text-yellow-700 mt-1">
												Notification preferences will be available in a future update. For now, you'll receive important updates about your opportunities.
											</p>
										</div>
									</div>
								</div>

								<!-- Placeholder notification settings -->
								<div class="opacity-50 pointer-events-none">
									<div class="space-y-4">
										<div class="flex items-center justify-between">
											<div>
												<label class="text-sm font-medium text-gray-900">New Opportunity Matches</label>
												<p class="text-sm text-gray-500">
													Get notified when new clubs/events match your interests
												</p>
											</div>
											<input
												type="checkbox"
												checked
												disabled
												class="rounded text-indigo-600"
											>
										</div>
										<div class="flex items-center justify-between">
											<div>
												<label class="text-sm font-medium text-gray-900">Event Reminders</label>
												<p class="text-sm text-gray-500">
													Reminders about upcoming events you're attending
												</p>
											</div>
											<input
												type="checkbox"
												checked
												disabled
												class="rounded text-indigo-600"
											>
										</div>
										<div class="flex items-center justify-between">
											<div>
												<label class="text-sm font-medium text-gray-900">Weekly Digest</label>
												<p class="text-sm text-gray-500">
													Weekly summary of new opportunities
												</p>
											</div>
											<input
												type="checkbox"
												disabled
												class="rounded text-indigo-600"
											>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	</div>
</template>

<script setup lang="ts">
import type { Interest } from '~/types';
import { useUser } from '~/composables/useUser';
import { apiService } from '~/services/api';

// Require authentication for this page
// TODO: Re-enable after fixing redirect loop
// definePageMeta({
// 	middleware: 'auth',
// });

// Get user data from authentication
const { user, isLoading: userLoading, updateProfile, isAuthenticated, init } = useUser();

// State
const activeSection = ref('basic');
const isSaving = ref(false);
const interestSearch = ref('');
const searchResults = ref<SimpleInterest[]>([]);
const showInterestDropdown = ref(false);

// Profile data from authenticated user
const profile = ref({
	name: '',
	username: '',
	email: '',
	major: 'Computer Science',
	interests: [] as Interest[],
	timeBudget: '3-5 hours',
	currentInvolvement: [] as string[],
});

// Initialize profile data from user
watch(user, (newUser) => {
	if (newUser) {
		profile.value.name = newUser.name;
		profile.value.username = newUser.username;
		profile.value.email = newUser.email;
		// TODO: Load additional profile data from API when backend supports it
	}
}, { immediate: true });

const majors = [
	'Computer Science', 'Computer Engineering', 'Electrical Engineering',
	'Business Administration', 'Biology', 'Psychology', 'Mathematics',
	'Physics', 'Marketing', 'Finance', 'Other',
];

const timeBudgetOptions = [
	{
		value: '1-2 hours',
		label: '1-2 hours per week',
		description: 'Light involvement for trying new things',
	},
	{
		value: '3-5 hours',
		label: '3-5 hours per week',
		description: 'Moderate involvement with good balance',
	},
	{
		value: '6+ hours',
		label: '6+ hours per week',
		description: 'High involvement for leadership roles',
	},
];

// Simple interface for profile interests
interface SimpleInterest {
	id: string;
	name: string;
	category: string;
	isCustom: boolean;
}

const allInterests = ref<SimpleInterest[]>([]);
const isLoadingInterests = ref(false);

// Load interests from backend API
const loadInterests = async () => {
	try {
		isLoadingInterests.value = true;
		const response = await apiService.get('/interests');

		if (response.success) {
			allInterests.value = response.data.interests.map((interest: any) => ({
				id: interest.id.toString(),
				name: interest.name || interest.keyword, // Use keyword if name doesn't exist
				category: interest.category || 'academic',
				isCustom: false,
			}));
		}
	} catch (error) {
		console.error('Failed to load interests:', error);
		// Fallback to basic interests if API fails
		allInterests.value = [
			{ id: '1', name: 'Machine Learning', category: 'academic', isCustom: false },
			{ id: '2', name: 'Data Science', category: 'academic', isCustom: false },
			{ id: '3', name: 'Web Development', category: 'academic', isCustom: false },
		];
	} finally {
		isLoadingInterests.value = false;
	}
};

// Methods
const saveBasicInfo = async () => {
	isSaving.value = true;
	try {
		if (user.value) {
			await updateProfile({
				name: profile.value.name,
				// TODO: Add other profile fields when backend supports them
			});
			console.log('Saved basic info:', profile.value);
		}
	} catch (error) {
		console.error('Failed to save basic info:', error);
		// TODO: Show user-friendly error message
	} finally {
		isSaving.value = false;
	}
};

const handleInterestSearch = () => {
	if (interestSearch.value.length > 0) {
		searchResults.value = allInterests.value.filter((interest: SimpleInterest) =>
			interest.name.toLowerCase().includes(interestSearch.value.toLowerCase()),
		);
	} else {
		searchResults.value = allInterests.value.slice(0, 10);
	}
	showInterestDropdown.value = true;
};

const closeInterestDropdown = () => {
	setTimeout(() => {
		showInterestDropdown.value = false;
	}, 200);
};

const toggleInterest = (interest: SimpleInterest) => {
	const index = profile.value.interests.findIndex((i: Interest) => i.id === interest.id);
	if (index >= 0) {
		profile.value.interests.splice(index, 1);
	} else if (profile.value.interests.length < 10) {
		// Convert SimpleInterest to Interest format for profile
		const fullInterest: Interest = {
			...interest,
			keyword: interest.name.toLowerCase(),
			linkedTags: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		profile.value.interests.push(fullInterest);
	}

	// Close dropdown and clear search when interest is added
	showInterestDropdown.value = false;
	interestSearch.value = '';
};

const removeInterest = (interest: Interest) => {
	const index = profile.value.interests.findIndex((i: Interest) => i.id === interest.id);
	if (index >= 0) {
		profile.value.interests.splice(index, 1);
	}
};

const addCustomInterest = () => {
	if (interestSearch.value && profile.value.interests.length < 10) {
		const customInterest: Interest = {
			id: 'custom-' + Date.now(),
			name: interestSearch.value,
			keyword: interestSearch.value.toLowerCase(),
			category: 'hobby',
			isCustom: true,
			linkedTags: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		profile.value.interests.push(customInterest);
		interestSearch.value = '';
		searchResults.value = [];
		showInterestDropdown.value = false;
	}
};

const getCategoryColor = (category: string) => {
	const colors = {
		academic: 'bg-blue-100 text-blue-800',
		career: 'bg-green-100 text-green-800',
		hobby: 'bg-purple-100 text-purple-800',
		lifestyle: 'bg-orange-100 text-orange-800',
		sport: 'bg-red-100 text-red-800',
	};
	return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const saveInterests = async () => {
	isSaving.value = true;
	try {
		await new Promise(resolve => setTimeout(resolve, 1000));
		console.log('Saved interests:', profile.value.interests);
		// TODO: integrate real API
	} finally {
		isSaving.value = false;
	}
};

const addInvolvement = () => {
	profile.value.currentInvolvement.push('');
};

const removeInvolvement = (index: number) => {
	profile.value.currentInvolvement.splice(index, 1);
};

const savePreferences = async () => {
	isSaving.value = true;
	try {
		await new Promise(resolve => setTimeout(resolve, 1000));
		console.log('Saved preferences:', {
			timeBudget: profile.value.timeBudget,
			currentInvolvement: profile.value.currentInvolvement,
		});
		// TODO: integrate real API
	} finally {
		isSaving.value = false;
	}
};

// Initialize
onMounted(async () => {
	// Initialize user authentication first
	await init();

	// Check authentication after initialization
	if (!isAuthenticated.value) {
		await navigateTo('/login');
		return;
	}

	// Initialize search results
	await loadInterests();
	searchResults.value = allInterests.value.slice(0, 10);
});
</script>