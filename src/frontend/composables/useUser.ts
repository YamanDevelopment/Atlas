/**
 * User Composable
 * Manages user authentication state and profile data
 */

import type { User } from '~/types/auth';
import { authService } from '~/services/auth';

export const useUser = () => {
	const user = ref<User | null>(null);
	const isLoading = ref(false);
	const error = ref<string | null>(null);
	const isInitialized = ref(false);

	/**
   * Initialize user state - called on app startup
   */
	const init = async () => {
		if (isInitialized.value) {
			return; // Already initialized
		}

		isLoading.value = true;
		error.value = null;

		try {
			// Check if we have tokens in storage and validate them
			if (authService.isAuthenticated()) {
				const isValid = await authService.validateAuthentication();

				if (isValid) {
					// Tokens are valid, fetch user data
					await refreshUser();
				} else {
					// Tokens are invalid, clear user state
					user.value = null;
				}
			} else {
				// No tokens found
				user.value = null;
			}
		} catch (err) {
			// Authentication check failed, clear state
			user.value = null;
			error.value = err instanceof Error ? err.message : 'Failed to initialize user';
			console.warn('User initialization failed:', err);
		} finally {
			isLoading.value = false;
			isInitialized.value = true;
		}
	};

	/**
   * Login with username and password
   */
	const login = async (username: string, password: string): Promise<void> => {
		isLoading.value = true;
		error.value = null;

		try {
			const userData = await authService.login({ username, password });
			user.value = userData;
		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Login failed';
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	/**
   * Register a new user account
   */
	const register = async (userData: {
    name: string;
    username: string;
    email: string;
    password: string;
  }): Promise<void> => {
		isLoading.value = true;
		error.value = null;

		try {
			const newUser = await authService.register(userData);
			user.value = newUser;
		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Registration failed';
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	/**
   * Logout the current user
   */
	const logout = async (): Promise<void> => {
		isLoading.value = true;
		error.value = null;

		try {
			await authService.logout();
			user.value = null;
		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Logout failed';
			console.error('Logout failed:', err);
		} finally {
			isLoading.value = false;
		}
	};

	/**
   * Refresh user data from the server
   */
	const refreshUser = async (): Promise<void> => {
		if (!authService.isAuthenticated()) {
			user.value = null;
			return;
		}

		try {
			const userData = await authService.getCurrentUser();
			user.value = userData;
			error.value = null; // Clear any previous errors
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to refresh user data';

			// If it's an authentication error, clear user state
			if (errorMessage.includes('Authentication') || errorMessage.includes('Unauthorized') || errorMessage.includes('login again')) {
				user.value = null;
				await authService.logout(); // Clear tokens
				error.value = 'Session expired, please login again';
			} else {
				error.value = errorMessage;
			}

			console.warn('User refresh failed:', err);
		}
	};

	/**
   * Update user profile
   */
	const updateProfile = async (updates: Partial<User>): Promise<void> => {
		if (!user.value) {
			throw new Error('No user logged in');
		}

		isLoading.value = true;
		error.value = null;

		try {
			// Note: This would need to be implemented in the AuthService
			// For now, just update locally
			user.value = { ...user.value, ...updates };

			// TODO: Implement API call to update user profile
			// const updatedUser = await authService.updateProfile(updates);
			// user.value = updatedUser;
		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Profile update failed';
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	// Computed properties
	const isAuthenticated = computed(() => {
		// User is authenticated if we have user data and auth service has tokens
		return user.value !== null && authService.isAuthenticated();
	});
	const userInitials = computed(() => {
		if (!user.value?.name) return '';
		const nameParts = user.value.name.split(' ').filter(part => part.length > 0);
		if (nameParts.length >= 2) {
			return `${nameParts[0]?.[0] || ''}${nameParts[nameParts.length - 1]?.[0] || ''}`.toUpperCase();
		}
		return user.value.name.slice(0, 2).toUpperCase();
	});
	const fullName = computed(() => {
		return user.value?.name || '';
	});

	return {
		// State
		user: readonly(user),
		isLoading: readonly(isLoading),
		error: readonly(error),
		isInitialized: readonly(isInitialized),

		// Computed
		isAuthenticated,
		userInitials,
		fullName,

		// Actions
		init,
		login,
		register,
		logout,
		refreshUser,
		updateProfile,
	};
};