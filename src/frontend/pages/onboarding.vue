<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-3xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <div class="text-2xl font-bold text-indigo-600">OppTrack</div>
          <div class="text-sm text-gray-500">Step {{ currentStep }} of {{ totalSteps }}</div>
        </div>
        <!-- Progress bar -->
        <div class="mt-4 bg-gray-200 rounded-full h-2">
          <div 
            class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
          ></div>
        </div>
      </div>
    </div>

    <div class="max-w-2xl mx-auto px-4 py-12">
      <!-- Step 1: Major -->
      <div v-if="currentStep === 1" class="space-y-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">What's your major?</h1>
          <p class="text-lg text-gray-600">This helps us recommend opportunities that align with your academic goals.</p>
        </div>

        <div class="space-y-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Select your major</label>
          <select 
            v-model="selectedMajor"
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Choose your major...</option>
            <option v-for="major in majors" :key="major" :value="major">
              {{ major }}
            </option>
          </select>
        </div>
      </div>

      <!-- Step 2: Interests -->
      <div v-else-if="currentStep === 2" class="space-y-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">What are your interests?</h1>
          <p class="text-lg text-gray-600 mb-2">Select up to 10 interests. These can be academic, career-focused, hobbies, or lifestyle choices.</p>
          <p class="text-sm text-gray-500">Examples: pickleball, machine learning, Christianity, reading, entrepreneurship</p>
        </div>

        <!-- Interest counter -->
        <div class="text-center">
          <span class="text-sm text-gray-500">
            {{ selectedInterests.length }} / 10 interests selected
            <span v-if="customInterests.length > 0" class="text-indigo-600">
              ({{ customInterests.length }} custom)
            </span>
          </span>
        </div>

        <!-- Search/Add custom -->
        <div class="space-y-4">
          <div class="relative">
            <input
              v-model="interestSearch"
              @input="handleInterestSearch"
              type="text"
              placeholder="Search interests or add custom ones..."
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              v-if="interestSearch && !searchResults.some(i => i.name.toLowerCase() === interestSearch.toLowerCase())"
              @click="addCustomInterest"
              :disabled="selectedInterests.length >= 10 || customInterests.length >= 5"
              class="absolute right-2 top-2 px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Custom
            </button>
          </div>

          <!-- Search Results -->
          <div v-if="searchResults.length > 0" class="max-h-48 overflow-y-auto border rounded-lg">
            <button
              v-for="interest in searchResults"
              :key="interest.id"
              @click="toggleInterest(interest)"
              :disabled="!selectedInterests.includes(interest) && selectedInterests.length >= 10"
              class="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{ 'bg-indigo-50 text-indigo-700': selectedInterests.includes(interest) }"
            >
              <div class="flex justify-between items-center">
                <span>{{ interest.name }}</span>
                <span class="text-xs px-2 py-1 rounded-full" 
                      :class="getCategoryColor(interest.category)">
                  {{ interest.category }}
                </span>
              </div>
            </button>
          </div>
        </div>

        <!-- Selected interests -->
        <div v-if="selectedInterests.length > 0" class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Selected Interests</h3>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="interest in selectedInterests"
              :key="interest.id"
              class="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
            >
              <span>{{ interest.name }}</span>
              <button @click="removeInterest(interest)" class="ml-2 text-indigo-600 hover:text-indigo-800">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Custom interest limit notice -->
        <div v-if="customInterests.length >= 5" class="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p class="text-sm text-yellow-800">You've reached the limit of 5 custom interests.</p>
        </div>
      </div>

      <!-- Step 3: Current Involvement -->
      <div v-else-if="currentStep === 3" class="space-y-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">Current involvement</h1>
          <p class="text-lg text-gray-600">What are you currently involved in? (Optional)</p>
        </div>

        <div class="space-y-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Current commitments (clubs, jobs, sports, etc.)
          </label>
          <div class="space-y-2">
            <div
              v-for="(involvement, index) in currentInvolvements"
              :key="index"
              class="flex gap-2"
            >
              <input
                v-model="currentInvolvements[index]"
                type="text"
                placeholder="e.g., Study group, Part-time job, Soccer team..."
                class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                @click="removeInvolvement(index)"
                class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <button
              @click="addInvolvement"
              class="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600"
            >
              + Add another involvement
            </button>
          </div>
        </div>

        <!-- Quick options -->
        <div class="space-y-4">
          <p class="text-sm text-gray-600">Or select from common options:</p>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <button
              v-for="option in commonInvolvements"
              :key="option"
              @click="addCommonInvolvement(option)"
              class="p-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {{ option }}
            </button>
          </div>
        </div>
      </div>

      <!-- Step 4: Time Budget -->
      <div v-else-if="currentStep === 4" class="space-y-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">How much time do you want to commit?</h1>
          <p class="text-lg text-gray-600">This helps us recommend opportunities that fit your schedule.</p>
        </div>

        <div class="space-y-4">
          <div class="grid gap-4">
            <button
              v-for="option in timeBudgetOptions"
              :key="option.value"
              @click="selectedTimeBudget = option.value"
              class="p-6 border-2 rounded-lg text-left transition-all"
              :class="selectedTimeBudget === option.value 
                ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                : 'border-gray-300 hover:border-gray-400'"
            >
              <h3 class="text-lg font-semibold mb-2">{{ option.label }}</h3>
              <p class="text-gray-600">{{ option.description }}</p>
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex justify-between pt-8">
        <button
          v-if="currentStep > 1"
          @click="previousStep"
          class="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <div v-else></div>

        <button
          @click="nextStep"
          :disabled="!canProceed"
          class="px-8 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ currentStep === totalSteps ? (isLoading ? 'Finishing...' : 'Finish Setup') : 'Continue' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Interest } from '../types';

// State
const currentStep = ref(1);
const totalSteps = 4;
const isLoading = ref(false);

// Step 1: Major
const selectedMajor = ref('');
const majors = ref([
  'Computer Science', 'Computer Engineering', 'Electrical Engineering', 
  'Mechanical Engineering', 'Business Administration', 'Biology', 'Psychology',
  'Mathematics', 'Physics', 'Chemistry', 'English', 'Marketing', 'Finance',
  'Accounting', 'Nursing', 'Pre-Med', 'Pre-Law', 'Communications', 
  'Graphic Design', 'Art', 'Music', 'Theatre', 'History', 'Political Science',
  'International Relations', 'Environmental Science', 'Architecture', 'Other'
]);

// Step 2: Interests
const selectedInterests = ref<Interest[]>([]);
const interestSearch = ref('');
const searchResults = ref<Interest[]>([]);
const customInterests = ref<Interest[]>([]);

const allInterests: Interest[] = [
  // Academic
  { id: '1', name: 'Machine Learning', category: 'academic', isCustom: false },
  { id: '2', name: 'Data Science', category: 'academic', isCustom: false },
  { id: '3', name: 'Web Development', category: 'academic', isCustom: false },
  { id: '4', name: 'Robotics', category: 'academic', isCustom: false },
  { id: '5', name: 'Cybersecurity', category: 'academic', isCustom: false },
  { id: '6', name: 'Biology Research', category: 'academic', isCustom: false },
  
  // Career
  { id: '11', name: 'Entrepreneurship', category: 'career', isCustom: false },
  { id: '12', name: 'Consulting', category: 'career', isCustom: false },
  { id: '13', name: 'Software Engineering', category: 'career', isCustom: false },
  { id: '14', name: 'Product Management', category: 'career', isCustom: false },
  
  // Hobbies
  { id: '16', name: 'Photography', category: 'hobby', isCustom: false },
  { id: '17', name: 'Music Production', category: 'hobby', isCustom: false },
  { id: '18', name: 'Gaming', category: 'hobby', isCustom: false },
  { id: '19', name: 'Reading', category: 'hobby', isCustom: false },
  { id: '20', name: 'Writing', category: 'hobby', isCustom: false },
  
  // Lifestyle
  { id: '22', name: 'Christianity', category: 'lifestyle', isCustom: false },
  { id: '23', name: 'Meditation', category: 'lifestyle', isCustom: false },
  { id: '24', name: 'Sustainability', category: 'lifestyle', isCustom: false },
  { id: '25', name: 'Volunteering', category: 'lifestyle', isCustom: false },
  
  // Sports
  { id: '26', name: 'Pickleball', category: 'sport', isCustom: false },
  { id: '27', name: 'Soccer', category: 'sport', isCustom: false },
  { id: '28', name: 'Basketball', category: 'sport', isCustom: false },
  { id: '29', name: 'Tennis', category: 'sport', isCustom: false },
];

// Step 3: Current Involvement
const currentInvolvements = ref(['']);
const commonInvolvements = [
  'Study Group', 'Part-time Job', 'Internship', 'Greek Life', 
  'Student Government', 'Volunteer Work', 'Sports Team', 'Music Ensemble'
];

// Step 4: Time Budget
const selectedTimeBudget = ref('');
const timeBudgetOptions = [
  {
    value: '1-2 hours',
    label: '1-2 hours per week',
    description: 'Light involvement - perfect for trying new things or maintaining a low commitment'
  },
  {
    value: '3-5 hours',
    label: '3-5 hours per week',
    description: 'Moderate involvement - ideal balance of commitment and flexibility'
  },
  {
    value: '6+ hours',
    label: '6+ hours per week',
    description: 'High involvement - ready for leadership roles and significant time investment'
  }
];

// Computed
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1: return selectedMajor.value !== '';
    case 2: return selectedInterests.value.length > 0;
    case 3: return true; // Optional step
    case 4: return selectedTimeBudget.value !== '';
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
    searchResults.value = allInterests.filter(interest =>
      interest.name.toLowerCase().includes(interestSearch.value.toLowerCase())
    );
  } else {
    searchResults.value = allInterests.slice(0, 20); // Show first 20 by default
  }
};

const toggleInterest = (interest: Interest) => {
  const index = selectedInterests.value.findIndex(i => i.id === interest.id);
  if (index >= 0) {
    selectedInterests.value.splice(index, 1);
  } else if (selectedInterests.value.length < 10) {
    selectedInterests.value.push(interest);
  }
};

const removeInterest = (interest: Interest) => {
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
    const customInterest: Interest = {
      id: 'custom-' + Date.now(),
      name: interestSearch.value,
      category: 'hobby', // Default category
      isCustom: true
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
    sport: 'bg-red-100 text-red-800'
  };
  return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const addInvolvement = () => {
  currentInvolvements.value.push('');
};

const removeInvolvement = (index: number) => {
  currentInvolvements.value.splice(index, 1);
};

const addCommonInvolvement = (involvement: string) => {
  if (!currentInvolvements.value.includes(involvement)) {
    const emptyIndex = currentInvolvements.value.findIndex(inv => inv === '');
    if (emptyIndex >= 0) {
      currentInvolvements.value[emptyIndex] = involvement;
    } else {
      currentInvolvements.value.push(involvement);
    }
  }
};

const completeOnboarding = async () => {
  isLoading.value = true;
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const onboardingData = {
      major: selectedMajor.value,
      interests: selectedInterests.value,
      currentInvolvement: currentInvolvements.value.filter(inv => inv.trim() !== ''),
      timeBudget: selectedTimeBudget.value as any
    };
    
    console.log('Onboarding completed:', onboardingData);
    
    // Redirect to dashboard
    await navigateTo('/dashboard');
  } catch (error) {
    console.error('Onboarding failed:', error);
  } finally {
    isLoading.value = false;
  }
};

// Initialize
onMounted(() => {
  searchResults.value = allInterests.slice(0, 20);
});
</script>