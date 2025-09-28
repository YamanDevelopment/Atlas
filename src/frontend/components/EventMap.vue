<template>
  <div v-if="event && hasCoordinates" class="mt-4">
    <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
      <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      Event Location
    </h4>
    <div 
      ref="mapContainer" 
      class="h-48 rounded-lg border border-gray-200 relative overflow-hidden bg-gray-50"
      :class="{ 'opacity-50': isLoading }"
    >
      <!-- Loading state -->
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
        <div class="flex items-center space-x-2 text-gray-500">
          <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading map...</span>
        </div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="mapError" class="absolute inset-0 flex items-center justify-center">
        <div class="text-center text-gray-500">
          <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm">Map unavailable</p>
        </div>
      </div>
      
      <!-- Map actions -->
      <div class="absolute top-2 right-2 z-20 flex space-x-2">
        <button
          v-if="!mapError"
          @click="openInMaps"
          class="bg-white/90 hover:bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 flex items-center"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7l10 10M17 7v10" />
          </svg>
          Open
        </button>
        <button
          @click="getDirections"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg shadow-sm text-sm font-medium transition-colors duration-200 flex items-center"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
          </svg>
          Directions
        </button>
      </div>
    </div>
    
    <!-- Location details -->
    <div class="mt-3 text-sm text-gray-600 flex items-center justify-between">
      <span>{{ event.location }}</span>
      <span v-if="hasCoordinates" class="text-xs text-gray-400">
        {{ event.latitude?.toFixed(4) }}, {{ event.longitude?.toFixed(4) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import type { Event } from '~/types';

interface Props {
  event: Event | null;
}

const props = defineProps<Props>();

// Map state
const mapContainer = ref<HTMLElement>();
const map = ref<any>(null);
const isLoading = ref(true);
const mapError = ref(false);
let L: any = null;

// Computed properties
const hasCoordinates = computed(() => {
  return props.event?.latitude && props.event?.longitude;
});

// Initialize map
const initializeMap = async () => {
  if (!hasCoordinates.value || !mapContainer.value) return;
  
  try {
    isLoading.value = true;
    
    // Try to dynamically import Leaflet
    try {
      L = await import('leaflet');
      
      // Import Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      
      await nextTick();
      
      // Initialize the map
      map.value = L.map(mapContainer.value).setView(
        [props.event!.latitude!, props.event!.longitude!], 
        16
      );
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map.value);
      
      // Add marker for the event location
      const marker = L.marker([props.event!.latitude!, props.event!.longitude!])
        .addTo(map.value);
      
      // Add popup with event info
      marker.bindPopup(`
        <div class="p-2">
          <h4 class="font-semibold text-sm mb-1">${props.event!.name}</h4>
          <p class="text-xs text-gray-600">${props.event!.location}</p>
        </div>
      `);
      
      isLoading.value = false;
    } catch (leafletError) {
      console.warn('Leaflet not available, falling back to simple map');
      
      // Fallback: Use OpenStreetMap iframe or simple map display
      if (mapContainer.value) {
        const lat = props.event!.latitude!;
        const lng = props.event!.longitude!;
        
        // Create a simple static map placeholder
        mapContainer.value.innerHTML = `
          <div class="w-full h-full bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center relative">
            <div class="text-center">
              <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p class="text-sm font-medium text-gray-700">${props.event!.name}</p>
              <p class="text-xs text-gray-500">${props.event!.location}</p>
              <div class="mt-2 text-xs text-gray-400">
                ${lat.toFixed(4)}, ${lng.toFixed(4)}
              </div>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
          </div>
        `;
      }
      
      isLoading.value = false;
    }
  } catch (error) {
    console.error('Failed to load map:', error);
    mapError.value = true;
    isLoading.value = false;
  }
};

// Open in external maps app
const openInMaps = () => {
  if (!hasCoordinates.value) return;
  
  const lat = props.event!.latitude!;
  const lng = props.event!.longitude!;
  const name = encodeURIComponent(props.event!.name);
  
  // Try to detect platform and use appropriate maps app
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  let url: string;
  
  if (isIOS) {
    // iOS - Apple Maps
    url = `maps://maps.apple.com/?q=${name}&ll=${lat},${lng}`;
  } else if (isMobile) {
    // Android - Google Maps
    url = `geo:${lat},${lng}?q=${lat},${lng}(${name})`;
  } else {
    // Desktop - Google Maps web
    url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${name}`;
  }
  
  window.open(url, '_blank');
};

// Get directions
const getDirections = () => {
  if (!hasCoordinates.value) return;
  
  const lat = props.event!.latitude!;
  const lng = props.event!.longitude!;
  const name = encodeURIComponent(props.event!.name);
  
  // Google Maps directions
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${name}`;
  window.open(url, '_blank');
};

// Cleanup map on unmount
const cleanup = () => {
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
};

// Lifecycle
onMounted(() => {
  if (hasCoordinates.value) {
    initializeMap();
  }
});

onUnmounted(() => {
  cleanup();
});

// Watch for event changes
watch(() => props.event, (newEvent) => {
  cleanup();
  if (newEvent && hasCoordinates.value) {
    nextTick(() => {
      initializeMap();
    });
  }
}, { deep: true });
</script>

<style scoped>
/* Map container styles */
.map-container {
  position: relative;
}

/* Override Leaflet default styles */
:deep(.leaflet-container) {
  border-radius: 0.5rem;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

:deep(.leaflet-popup-tip) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>