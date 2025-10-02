<template>
	<div class="min-h-screen bg-gray-50">
		<!-- Header -->
		<div class="bg-white shadow-sm border-b">
			<div class="max-w-3xl mx-auto px-4 py-4">
				<div class="flex justify-between items-center">
					<div class="text-2xl font-bold text-indigo-600">
						OppTrack
					</div>
					<div class="text-sm text-gray-500">
						Step {{ currentStep }} of {{ totalSteps }}
					</div>
				</div>
				<!-- Progress bar -->
				<div class="mt-4 bg-gray-200 rounded-full h-2">
					<div
						class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
						:style="{ width: `${(currentStep / totalSteps) * 100}%` }"
					/>
				</div>
			</div>
		</div>

		<div class="max-w-2xl mx-auto px-4 py-12">
			<!-- Step 1: Major -->
			<div
				v-if="currentStep === 1"
				class="space-y-8"
			>
				<div class="text-center">
					<h1 class="text-3xl font-bold text-gray-900 mb-4">
						What's your major?
					</h1>
					<p class="text-lg text-gray-600">
						This helps us recommend opportunities that align with your academic goals.
					</p>
				</div>

				<div class="space-y-4">
					<label class="block text-sm font-medium text-gray-700 mb-2">Select your major</label>
					<select
						v-model="selectedMajor"
						class="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
					>
						<option value="">
							Choose your major...
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
			</div>

			<!-- Step 2: Interests -->
			<div
				v-else-if="currentStep === 2"
				class="space-y-8"
			>
				<div class="text-center">
					<h1 class="text-3xl font-bold text-gray-900 mb-4">
						What are your interests?
					</h1>
					<p class="text-lg text-gray-600 mb-2">
						Select up to 10 interests. These can be academic, career-focused, hobbies, or lifestyle choices.
					</p>
					<p class="text-sm text-gray-500">
						Examples: pickleball, machine learning, Christianity, reading, entrepreneurship
					</p>
				</div>

				<!-- Interest counter -->
				<div class="text-center">
					<span class="text-sm text-gray-500">
						{{ selectedInterests.length }} / 10 interests selected
						<span
							v-if="customInterests.length > 0"
							class="text-indigo-600"
						>
							({{ customInterests.length }} custom)
						</span>
					</span>
				</div>

				<!-- Search/Add custom -->
				<div class="space-y-4">
					<div class="relative">
						<input
							v-model="interestSearch"
							type="text"
							placeholder="Search interests or add custom ones..."
							class="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
							@input="handleInterestSearch"
						>
						<button
							v-if="interestSearch && !searchResults.some(i => i.name.toLowerCase() === interestSearch.toLowerCase())"
							:disabled="selectedInterests.length >= 10 || customInterests.length >= 5"
							class="absolute right-2 top-2 px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
							@click="addCustomInterest"
						>
							Add Custom
						</button>
					</div>

					<!-- Search Results -->
					<div
						v-if="searchResults.length > 0"
						class="max-h-48 overflow-y-auto border rounded-lg"
					>
						<button
							v-for="interest in searchResults"
							:key="interest.id"
							:disabled="!selectedInterests.includes(interest) && selectedInterests.length >= 10"
							class="w-full text-left p-3 border-b border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
							:class="selectedInterests.includes(interest)
								? 'bg-indigo-50 text-indigo-700'
								: 'hover:bg-indigo-50 hover:text-indigo-700'"
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

				<!-- Selected interests -->
				<div
					v-if="selectedInterests.length > 0"
					class="space-y-4"
				>
					<h3 class="text-lg font-medium text-gray-900">
						Selected Interests
					</h3>
					<div class="flex flex-wrap gap-2">
						<div
							v-for="interest in selectedInterests"
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

				<!-- Custom interest limit notice -->
				<div
					v-if="customInterests.length >= 5"
					class="p-3 bg-yellow-50 border border-yellow-200 rounded-md"
				>
					<p class="text-sm text-yellow-800">
						You've reached the limit of 5 custom interests.
					</p>
				</div>
			</div>

			<!-- Step 3: Current Involvement -->
			<div
				v-else-if="currentStep === 3"
				class="space-y-8"
			>
				<div class="text-center">
					<h1 class="text-3xl font-bold text-gray-900 mb-4">
						Current Involvement
					</h1>
					<p class="text-lg text-gray-600">
						What are you currently involved in? (Optional)
					</p>
				</div>

				<!-- Searchable dropdown -->
				<div class="space-y-4">
					<div class="flex justify-between items-end">
						<label class="block text-sm font-medium text-gray-700 mb-2">
							Search and add your current involvements
						</label>
						<span
							v-if="!isLoadingInvolvements && availableInvolvements.length > 0"
							class="text-xs text-gray-500"
						>
							{{ availableInvolvements.length }} options available
						</span>
					</div>
					<div class="relative">
						<input
							v-model="involvementSearch"
							type="text"
							placeholder="Search for clubs, jobs, sports teams, etc..."
							class="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
							@input="handleInvolvementSearch"
							@focus="showInvolvementDropdown = true"
							@blur="closeDropdown"
						>

						<!-- Dropdown results -->
						<div
							v-if="showInvolvementDropdown && (filteredInvolvements.length > 0 || isLoadingInvolvements)"
							class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto"
						>
							<!-- Loading state -->
							<div
								v-if="isLoadingInvolvements"
								class="p-3 text-center text-gray-500"
							>
								Loading involvements...
							</div>

							<!-- Involvement options -->
							<button
								v-for="involvement in filteredInvolvements"
								:key="involvement.id"
								class="w-full text-left p-3 hover:bg-indigo-50 border-b border-gray-100 last:border-b-0 transition-colors"
								@click="addInvolvement(involvement)"
							>
								<div class="font-medium text-gray-900">
									{{ involvement.name }}
								</div>
								<div
									v-if="involvement.description"
									class="text-xs text-gray-500 mt-1 truncate"
								>
									{{ involvement.description }}
								</div>
							</button>
						</div>
					</div>
				</div>

				<!-- Selected involvements with status selection -->
				<div
					v-if="selectedInvolvements.length > 0"
					class="space-y-4"
				>
					<h3 class="text-lg font-medium text-gray-900">
						Your Current Involvements
					</h3>
					<div class="space-y-3">
						<div
							v-for="involvement in selectedInvolvements"
							:key="involvement.id"
							class="flex items-center justify-between p-4 rounded-lg bg-[rgb(87,87,87,0.03)]"
						>
							<div class="flex-1">
								<div class="font-medium text-gray-900 mb-2">
									{{ involvement.name }}
								</div>
								<div class="flex flex-wrap gap-2">
									<button
										v-for="status in memberStatuses"
										:key="status.value"
										:class="[
											'px-3 py-1 text-xs rounded-full border transition-all',
											involvement.status === status.value
												? getStatusColor(status.value)
												: 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
										]"
										:title="status.description"
										@click="updateInvolvementStatus(involvement.id, status.value as 'pending' | 'active' | 'passive' | 'inactive')"
									>
										{{ status.label }}
									</button>
								</div>
							</div>
							<button
								class="ml-4 text-red-600 hover:text-red-800"
								@click="removeInvolvement(involvement.id)"
							>
								<svg
									class="w-5 h-5"
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

				<div
					v-else
					class="text-center text-gray-500 py-8"
				>
					<p>Search and add your current involvements above to get personalized recommendations.</p>
					<p class="text-sm mt-1">
						No worries if you're not involved in anything yet - we'll help you find great opportunities!
					</p>
				</div>
			</div>

			<!-- Navigation -->
			<div class="flex justify-between pt-8">
				<button
					v-if="currentStep > 1"
					class="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
					@click="previousStep"
				>
					Back
				</button>
				<div v-else />

				<button
					:disabled="!canProceed"
					class="px-8 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
					@click="nextStep"
				>
					{{ currentStep === totalSteps ? (isLoading ? 'Finishing...' : 'Finish Setup') : 'Continue' }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { apiService } from '~/services/api';

// Require authentication for this page (onboarding should be for authenticated users)
// TODO: Re-enable after fixing redirect loop
// definePageMeta({
// 	middleware: 'auth',
// });

// Simple interface for onboarding interests (avoiding complex Interest type for now)
interface OnboardingInterest {
	id: string;
	name: string;
	category: string;
	isCustom: boolean;
}

// Interface for involvement items
interface InvolvementItem {
	id: string;
	name: string;
	status: 'pending' | 'active' | 'passive' | 'inactive';
	type?: string;
}

// State
const currentStep = ref(1);
const totalSteps = 3;
const isLoading = ref(false);

// Step 1: Major
const selectedMajor = ref('');
const majors = ref([
	'Computer Science', 'Computer Engineering', 'Electrical Engineering',
	'Mechanical Engineering', 'Business Administration', 'Biology', 'Psychology',
	'Mathematics', 'Physics', 'Chemistry', 'English', 'Marketing', 'Finance',
	'Accounting', 'Nursing', 'Pre-Med', 'Pre-Law', 'Communications',
	'Graphic Design', 'Art', 'Music', 'Theatre', 'History', 'Political Science',
	'International Relations', 'Environmental Science', 'Architecture', 'Other',
]);

// Step 2: Interests
const selectedInterests = ref<OnboardingInterest[]>([]);
const interestSearch = ref('');
const searchResults = ref<OnboardingInterest[]>([]);
const customInterests = ref<OnboardingInterest[]>([]);
const allInterests = ref<OnboardingInterest[]>([]);
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

			// Add interests from selected major using Gemini AI
			if (selectedMajor.value) {
				await addMajorAsInterest(selectedMajor.value);
			}
		}
	} catch (error) {
		console.error('Failed to load interests:', error);
		// Fallback to basic interests if API fails
		allInterests.value = [
			{ id: 'fallback-1', name: 'Academic Research', category: 'academic', isCustom: false },
			{ id: 'fallback-2', name: 'Career Development', category: 'career', isCustom: false },
		];
	} finally {
		isLoadingInterests.value = false;
	}
};

// Add major as interest using Gemini AI
const addMajorAsInterest = async (major: string) => {
	try {
		const response = await apiService.post('/interests', {
			keyword: major.toLowerCase(),
			name: major,
			description: `Academic major in ${major}`,
			category: 'academic',
		});

		if (response.success) {
			const newInterest = {
				id: response.data.interest.id.toString(),
				name: response.data.interest.name || response.data.interest.keyword,
				category: 'academic',
				isCustom: false,
			};

			// Add to all interests and auto-select it
			allInterests.value.unshift(newInterest);
			if (!selectedInterests.value.some(i => i.id === newInterest.id)) {
				selectedInterests.value.push(newInterest);
			}
		}
	} catch (error) {
		console.error('Failed to add major as interest:', error);
	}
};

// Step 3: Current Involvement - Load from backend
const selectedInvolvements = ref<InvolvementItem[]>([]);
const involvementSearch = ref('');
const showInvolvementDropdown = ref(false);
const availableInvolvements = ref<any[]>([]);
const isLoadingInvolvements = ref(false);

// Load organizations and labs from backend
const loadInvolvements = async () => {
	try {
		isLoadingInvolvements.value = true;
		const [orgsResponse, labsResponse] = await Promise.all([
			apiService.get('/organizations'),
			apiService.get('/labs'),
		]);		const involvements: any[] = [];

		// Add organizations
		if (orgsResponse.success && orgsResponse.data.organizations) {
			orgsResponse.data.organizations.forEach((org: any) => {
				involvements.push({
					id: `org-${org.id}`,
					name: org.name,
					type: 'organization',
					description: org.shortDescription || org.description,
				});
			});
		}

		// Add labs
		if (labsResponse.success && labsResponse.data.labs) {
			labsResponse.data.labs.forEach((lab: any) => {
				involvements.push({
					id: `lab-${lab.id}`,
					name: lab.name,
					type: 'lab',
					description: lab.description,
				});
			});
		}

		availableInvolvements.value = involvements;
	} catch (error) {
		console.error('Failed to load involvements:', error);
		// Fallback to basic options
		availableInvolvements.value = [
			{ id: 'other-1', name: 'Student Organizations', type: 'organization' },
			{ id: 'other-2', name: 'Research Labs', type: 'lab' },
		];
	} finally {
		isLoadingInvolvements.value = false;
	}
};

const memberStatuses = [
	{ value: 'pending', label: 'Pending', description: 'Application submitted, awaiting acceptance' },
	{ value: 'active', label: 'Active', description: 'Regular participation and engagement' },
	{ value: 'passive', label: 'Passive', description: 'Occasional participation' },
	{ value: 'inactive', label: 'Inactive', description: 'Member but not currently participating' },
];

// Computed for filtered search results
const filteredInvolvements = computed(() => {
	if (!involvementSearch.value) return availableInvolvements.value; // Show all involvements

	return availableInvolvements.value.filter((involvement: any) =>
		involvement.name.toLowerCase().includes(involvementSearch.value.toLowerCase()) &&
		!selectedInvolvements.value.some(selected => selected.id === involvement.id),
	);
});

// Computed
const canProceed = computed(() => {
	switch (currentStep.value) {
	case 1: return selectedMajor.value !== '';
	case 2: return selectedInterests.value.length > 0;
	case 3: return true; // Optional step
	default: return false;
	}
});

// Methods
const nextStep = async () => {
	if (currentStep.value < totalSteps) {
		currentStep.value++;
	} else {
		// Final step - complete onboarding
		await completeOnboarding();
	}
};

const previousStep = () => {
	if (currentStep.value > 1) {
		currentStep.value--;
	}
};

const handleInterestSearch = () => {
	if (interestSearch.value.length > 0) {
		searchResults.value = allInterests.value.filter((interest: OnboardingInterest) =>
			interest.name.toLowerCase().includes(interestSearch.value.toLowerCase()),
		);
	} else {
		searchResults.value = allInterests.value.slice(0, 20); // Show first 20 by default
	}
};

const toggleInterest = (interest: OnboardingInterest) => {
	const index = selectedInterests.value.findIndex(i => i.id === interest.id);
	if (index >= 0) {
		selectedInterests.value.splice(index, 1);
	} else if (selectedInterests.value.length < 10) {
		selectedInterests.value.push(interest);
	}
};

const removeInterest = (interest: OnboardingInterest) => {
	const index = selectedInterests.value.findIndex(i => i.id === interest.id);
	if (index >= 0) {
		selectedInterests.value.splice(index, 1);
	}

	// Also remove from custom interests if it's custom
	if (interest.isCustom) {
		const customIndex = customInterests.value.findIndex(i => i.id === interest.id);
		if (customIndex >= 0) {
			customInterests.value.splice(customIndex, 1);
		}
	}
};

const addCustomInterest = () => {
	if (interestSearch.value && customInterests.value.length < 5 && selectedInterests.value.length < 10) {
		const customInterest: OnboardingInterest = {
			id: 'custom-' + Date.now(),
			name: interestSearch.value,
			category: 'hobby', // Default category
			isCustom: true,
		};

		customInterests.value.push(customInterest);
		selectedInterests.value.push(customInterest);
		interestSearch.value = '';
		searchResults.value = [];
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

// New involvement methods
const addInvolvement = (involvement: any) => {
	if (!selectedInvolvements.value.some(item => item.id === involvement.id)) {
		selectedInvolvements.value.push({
			id: involvement.id,
			name: involvement.name,
			status: 'active', // Default status
			type: involvement.type,
		});
		involvementSearch.value = '';
		showInvolvementDropdown.value = false;
	}
};

const removeInvolvement = (involvementId: string) => {
	const index = selectedInvolvements.value.findIndex(item => item.id === involvementId);
	if (index >= 0) {
		selectedInvolvements.value.splice(index, 1);
	}
};

const updateInvolvementStatus = (involvementId: string, status: 'pending' | 'active' | 'passive' | 'inactive') => {
	const involvement = selectedInvolvements.value.find(item => item.id === involvementId);
	if (involvement) {
		involvement.status = status;
	}
};

const getStatusColor = (status: string) => {
	const colors = {
		pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
		active: 'bg-green-100 text-green-700 border-green-300',
		passive: 'bg-blue-100 text-blue-700 border-blue-300',
		inactive: 'bg-gray-100 text-gray-700 border-gray-300',
	};
	return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-300';
};

const handleInvolvementSearch = () => {
	showInvolvementDropdown.value = true;
};

const closeDropdown = () => {
	setTimeout(() => {
		showInvolvementDropdown.value = false;
	}, 200);
};

const completeOnboarding = async () => {
	isLoading.value = true;

	try {
		// Update user's interests in the backend
		const interestIds = selectedInterests.value.map(interest => parseInt(interest.id));

		const updateResponse = await apiService.post('/auth/update-interests', {
			interests: interestIds,
		});

		if (!updateResponse.success) {
			throw new Error(updateResponse.message || 'Failed to update interests');
		}

		// Save involvement data if provided
		if (selectedInvolvements.value.length > 0) {
			const involvementResponse = await apiService.post('/involvement/bulk-update', {
				involvements: selectedInvolvements.value.map(inv => ({
					type: inv.type || (inv.id.startsWith('lab-') ? 'lab' : 'organization'),
					itemId: parseInt(inv.id.replace(/^(org-|lab-)/, '')),
					status: inv.status,
				})),
			});

			if (!involvementResponse.success) {
				console.warn('Failed to update involvements:', involvementResponse.message);
			}
		}

		console.log('Onboarding completed successfully');

		// Redirect to dashboard with flag for starter plan modal
		await navigateTo('/dashboard?from=onboarding');
	} catch (error) {
		console.error('Onboarding failed:', error);
		// Show error to user but still redirect to dashboard
		await navigateTo('/dashboard?from=onboarding&error=1');
	} finally {
		isLoading.value = false;
	}
};

// Initialize
onMounted(async () => {
	await loadInterests();
	await loadInvolvements();
	searchResults.value = allInterests.value.slice(0, 20);
});
</script>