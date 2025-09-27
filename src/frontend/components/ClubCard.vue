<template>
  <div 
    class="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 p-6"
    :class="[size === 'large' ? 'w-96' : 'w-80', { 'cursor-pointer': clickable }]"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <h3 class="font-semibold text-gray-900 mb-2">{{ club.name }}</h3>
        <p class="text-gray-600 text-sm mb-3">{{ club.shortDescription }}</p>
        <p class="text-indigo-600 text-xs mb-3">{{ club.whyRecommended }}</p>
      </div>
      <span
        v-if="club.isProfessional"
        class="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
      >
        Professional
      </span>
    </div>
    
    <!-- Stats -->
    <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
      <span>⏱️ {{ club.timeCommitment }}</span>
      <span>👥 {{ club.memberCount }} members</span>
    </div>
    
    <!-- Tags -->
    <div class="flex flex-wrap gap-1 mb-4" v-if="club.tags">
      <span
        v-for="tag in club.tags.slice(0, 3)"
        :key="tag"
        class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
      >
        {{ tag }}
      </span>
    </div>
    
    <!-- Action -->
    <button
      @click="$emit('action', club)"
      class="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
    >
      {{ actionText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Club } from '../types';

interface Props {
  club: Club;
  actionText?: string;
  size?: 'normal' | 'large';
  clickable?: boolean;
}

withDefaults(defineProps<Props>(), {
  actionText: 'Get Involved',
  size: 'normal',
  clickable: false
});

defineEmits<{
  action: [club: Club];
}>();
</script>