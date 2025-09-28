/**
 * Events Composable
 * Manages event data fetching and state
 */

import type { Event } from '~/types/auth';
import { apiService } from '~/services/api';
import { useUser } from '~/composables/useUser';

export const useEvents = () => {
	const events = ref<Event[]>([]);
	const recommendedEvents = ref<Event[]>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	const { user } = useUser();

	/**
   * Fetch recommended events for the user
   */
	const fetchRecommendedEvents = async (limit = 10): Promise<void> => {
		isLoading.value = true;
		error.value = null;

		try {
			const userId = user.value?.id;
			const fetchedEvents = await apiService.getRecommendedEvents(userId, limit);
			recommendedEvents.value = fetchedEvents;
		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Failed to fetch recommended events';
			console.error('Failed to fetch recommended events:', err);
		} finally {
			isLoading.value = false;
		}
	};

	/**
   * Fetch all available events
   */
	const fetchAllEvents = async (limit = 50): Promise<void> => {
		isLoading.value = true;
		error.value = null;

		try {
			const fetchedEvents = await apiService.getAllEvents(limit);
			events.value = fetchedEvents;
		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Failed to fetch events';
			console.error('Failed to fetch events:', err);
		} finally {
			isLoading.value = false;
		}
	};

	/**
   * RSVP to an event
   */
	const rsvpToEvent = async (eventId: string, status: 'going' | 'interested' | 'not-going'): Promise<void> => {
		try {
			await apiService.rsvpToEvent(eventId, status);

			// Update local state if needed
			const updateEventRsvp = (eventList: Ref<Event[]>) => {
				const eventIndex = eventList.value.findIndex(e => e.id === eventId);
				if (eventIndex !== -1) {
					// This would need to be updated based on how RSVP status is stored in Event type
					// For now, we'll just refresh the data
				}
			};

			updateEventRsvp(events);
			updateEventRsvp(recommendedEvents);
		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Failed to RSVP to event';
			throw err;
		}
	};

	/**
   * Toggle bookmark status for an event
   */
	const toggleEventBookmark = (eventId: string): void => {
		const updateBookmark = (eventList: Ref<Event[]>) => {
			const eventIndex = eventList.value.findIndex(e => e.id === eventId);
			if (eventIndex !== -1 && eventList.value[eventIndex]) {
        eventList.value[eventIndex]!.isBookmarked = !eventList.value[eventIndex]!.isBookmarked;
			}
		};

		updateBookmark(events);
		updateBookmark(recommendedEvents);
	};

	/**
   * Get events by category
   */
	const getEventsByCategory = (category: string): ComputedRef<Event[]> => {
		return computed(() => {
			return events.value.filter(event =>
				event.category === category ||
        event.categories?.some(cat => cat.name.toLowerCase() === category.toLowerCase()),
			);
		});
	};

	/**
   * Get events by tag
   */
	const getEventsByTag = (tag: string): ComputedRef<Event[]> => {
		return computed(() => {
			return events.value.filter(event =>
				event.tags?.some(eventTag =>
					eventTag.toLowerCase().includes(tag.toLowerCase()),
				),
			);
		});
	};

	/**
   * Search events by name or description
   */
	const searchEvents = (query: string): ComputedRef<Event[]> => {
		return computed(() => {
			if (!query.trim()) return events.value;

			const lowerQuery = query.toLowerCase();
			return events.value.filter(event =>
				event.name.toLowerCase().includes(lowerQuery) ||
        event.description.toLowerCase().includes(lowerQuery) ||
        event.shortDescription?.toLowerCase().includes(lowerQuery) ||
        event.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)),
			);
		});
	};

	return {
		// State
		events: readonly(events),
		recommendedEvents: readonly(recommendedEvents),
		isLoading: readonly(isLoading),
		error: readonly(error),

		// Actions
		fetchRecommendedEvents,
		fetchAllEvents,
		rsvpToEvent,
		toggleEventBookmark,

		// Computed
		getEventsByCategory,
		getEventsByTag,
		searchEvents,
	};
};