/**
 * Atlas App Plugin
 * Initializes authentication and global state
 */

import { useUser } from '~/composables/useUser';
import { useEvents } from '~/composables/useEvents';
import { useClubs } from '~/composables/useClubs';

export default defineNuxtPlugin(async () => {
  // Only run on client side
  if (process.server) return;

  const { init: initUser } = useUser();
  
  try {
    // Initialize user authentication state
    await initUser();
    
    // If user is authenticated, load initial data
    const { user } = useUser();
    if (user.value) {
      const { fetchRecommendedEvents } = useEvents();
      const { fetchRecommendedClubs } = useClubs();
      
      // Load initial recommended data in parallel
      await Promise.all([
        fetchRecommendedEvents(5), // Limit initial load
        fetchRecommendedClubs(5),
      ]);
    }
  } catch (error) {
    console.warn('Failed to initialize app state:', error);
  }
});