/**
 * Clubs Composable
 * Manages club data fetching and state
 */

import type { Club } from '~/types/auth';
import { apiService } from '~/services/api';
import { useUser } from '~/composables/useUser';

export const useClubs = () => {
	const clubs = ref<Club[]>([]);
	const recommendedClubs = ref<Club[]>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	const { user } = useUser();

	/**
   * Fetch recommended clubs for the user
   */
	const fetchRecommendedClubs = async (limit = 10): Promise<void> => {
		isLoading.value = true;
		error.value = null;

		try {
			const userId = user.value?.id;
			const fetchedClubs = await apiService.getRecommendedClubs(userId, limit);
			recommendedClubs.value = fetchedClubs;
		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Failed to fetch recommended clubs';
			console.error('Failed to fetch recommended clubs:', err);
		} finally {
			isLoading.value = false;
		}
	};

	/**
   * Fetch all available clubs
   */
	const fetchAllClubs = async (limit = 100): Promise<void> => {
		isLoading.value = true;
		error.value = null;

		try {
			const fetchedClubs = await apiService.getAllClubs(limit);
			clubs.value = fetchedClubs;
		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Failed to fetch clubs';
			console.error('Failed to fetch clubs:', err);
		} finally {
			isLoading.value = false;
		}
	};

	/**
   * Toggle follow status for a club
   */
	const toggleClubFollow = async (clubId: string): Promise<void> => {
		try {
			const club = clubs.value.find(c => c.id === clubId) ||
                   recommendedClubs.value.find(c => c.id === clubId);

			if (!club) {
				throw new Error('Club not found');
			}

			const newFollowStatus = !club.isFollowing;
			await apiService.toggleClubFollow(clubId, newFollowStatus);

			// Update local state
			const updateClubFollow = (clubList: Ref<Club[]>) => {
				const clubIndex = clubList.value.findIndex(c => c.id === clubId);
				if (clubIndex !== -1 && clubList.value[clubIndex]) {
          clubList.value[clubIndex]!.isFollowing = newFollowStatus;
				}
			};

			updateClubFollow(clubs);
			updateClubFollow(recommendedClubs);
		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Failed to follow/unfollow club';
			throw err;
		}
	};

	/**
   * Get clubs by category
   */
	const getClubsByCategory = (category: string): ComputedRef<Club[]> => {
		return computed(() => {
			return clubs.value.filter(club =>
				club.category === category ||
        club.categories?.some(cat => cat.name.toLowerCase() === category.toLowerCase()),
			);
		});
	};

	/**
   * Get clubs by tag
   */
	const getClubsByTag = (tag: string): ComputedRef<Club[]> => {
		return computed(() => {
			return clubs.value.filter(club =>
				club.tags?.some(clubTag =>
					clubTag.toLowerCase().includes(tag.toLowerCase()),
				),
			);
		});
	};

	/**
   * Search clubs by name or description
   */
	const searchClubs = (query: string): ComputedRef<Club[]> => {
		return computed(() => {
			if (!query.trim()) return clubs.value;

			const lowerQuery = query.toLowerCase();
			return clubs.value.filter(club =>
				club.name.toLowerCase().includes(lowerQuery) ||
        club.description.toLowerCase().includes(lowerQuery) ||
        club.shortDescription?.toLowerCase().includes(lowerQuery) ||
        club.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)),
			);
		});
	};

	/**
   * Get professional clubs
   */
	const getProfessionalClubs = computed(() => {
		return clubs.value.filter(club => club.isProfessional);
	});

	/**
   * Get followed clubs
   */
	const getFollowedClubs = computed(() => {
		return clubs.value.filter(club => club.isFollowing);
	});

	return {
		// State
		clubs: readonly(clubs),
		recommendedClubs: readonly(recommendedClubs),
		isLoading: readonly(isLoading),
		error: readonly(error),

		// Actions
		fetchRecommendedClubs,
		fetchAllClubs,
		toggleClubFollow,

		// Computed
		getClubsByCategory,
		getClubsByTag,
		searchClubs,
		getProfessionalClubs,
		getFollowedClubs,
	};
};