/**
 * Atlas App Plugin
 * Initializes authentication and global state
 */

import { useUser } from '~/composables/useUser';
import { useEvents } from '~/composables/useEvents';
import { useClubs } from '~/composables/useClubs';

export default defineNuxtPlugin(async () => {
	// Only run on client side
	if (import.meta.server) return;

	const { init: initUser, isAuthenticated, user } = useUser();

	try {
		// Initialize user authentication state
		await initUser();

		// If user is authenticated, load initial data
		if (isAuthenticated.value && user.value) {
			const { fetchRecommendedEvents } = useEvents();
			const { fetchRecommendedClubs } = useClubs();

			// Load initial recommended data in parallel (non-blocking)
			Promise.all([
				fetchRecommendedEvents(5).catch(err => console.warn('Failed to load recommended events:', err)),
				fetchRecommendedClubs(5).catch(err => console.warn('Failed to load recommended clubs:', err)),
			]);
		}
	} catch (error) {
		console.warn('Failed to initialize app state:', error);
		// Don't throw error - allow app to continue with unauthenticated state
	}
});