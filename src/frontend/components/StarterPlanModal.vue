<template>
  <div 
    v-if="isVisible" 
    class="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50 p-4"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">Welcome to OppTrack!</h2>
        <button 
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 text-2xl font-bold"
        >
          ×
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Plan Card -->
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-gray-900">{{ plan.name }}</h3>
            <span class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              Current Plan
            </span>
          </div>
          
          <p class="text-gray-600 mb-4">{{ plan.description }}</p>
          
          <!-- Features -->
          <div class="mb-4">
            <h4 class="font-medium text-gray-900 mb-2">What's included:</h4>
            <ul class="space-y-2">
              <li 
                v-for="feature in plan.features" 
                :key="feature"
                class="flex items-center text-sm text-gray-700"
              >
                <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Benefits Preview -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-900 mb-3">How OppTrack helps you:</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-start space-x-3">
              <div class="bg-blue-100 rounded-lg p-2">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
              </div>
              <div>
                <h5 class="font-medium text-gray-900">Track Everything</h5>
                <p class="text-sm text-gray-600">Never miss events, deadlines, or opportunities</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <div class="bg-green-100 rounded-lg p-2">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div>
                <h5 class="font-medium text-gray-900">Resume Building</h5>
                <p class="text-sm text-gray-600">Discover opportunities based on your interests to help gain experience</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <div class="bg-purple-100 rounded-lg p-2">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h5 class="font-medium text-gray-900">Balance Management</h5>
                <p class="text-sm text-gray-600">Avoid overcommitment with smart limits with smart limitations</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <div class="bg-orange-100 rounded-lg p-2">
                <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div>
                <h5 class="font-medium text-gray-900">Connect & Grow</h5>
                <p class="text-sm text-gray-600">Build your network through meaningful activities</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <button
          @click="skipTour"
          class="text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          Skip Tour
        </button>
        <div class="flex space-x-3">
          <button
            @click="startTour"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Take Dashboard Tour
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Plan } from '~/types';

interface Props {
  isVisible: boolean;
  plan: Plan;
  currentCommitments?: number;
}

interface Emits {
  'close': [];
  'start-tour': [];
  'skip-tour': [];
}

const props = withDefaults(defineProps<Props>(), {
  currentCommitments: 0
});

const emit = defineEmits<Emits>();

const commitmentProgress = computed(() => {
  return Math.min((props.currentCommitments / props.plan.commitmentLimit) * 100, 100);
});

const closeModal = () => {
  emit('close');
};

const startTour = () => {
  emit('start-tour');
  closeModal();
};

const skipTour = () => {
  emit('skip-tour');
  closeModal();
};

// Close modal on escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isVisible) {
      closeModal();
    }
  };
  
  document.addEventListener('keydown', handleEscape);
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape);
  });
});
</script>