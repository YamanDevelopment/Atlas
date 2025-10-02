/**
 * Authentication middleware
 * Redirects unauthenticated users to login page
 */

import { useUser } from '~/composables/useUser';

export default defineNuxtRouteMiddleware(async (to, _from) => {
	// Skip middleware on server side to prevent SSR issues
	if (import.meta.server) return;

	const { isAuthenticated, isInitialized, init } = useUser();

	// Allow access to login and signup pages for unauthenticated users
	const publicPages = ['/', '/login', '/signup', '/index'];

	// Initialize auth state if not done yet (critical for page refreshes!)
	if (!isInitialized.value) {
		try {
			await init();
		} catch (error) {
			console.warn('Auth initialization failed in middleware:', error);
			// If initialization fails and we're not on a public page, redirect to login
			if (!publicPages.includes(to.path)) {
				return navigateTo('/login');
			}
			return; // Allow access to public pages even if init fails
		}
	}

	// Simple auth check after initialization
	const isUserAuthenticated = isAuthenticated.value;

	// Redirect unauthenticated users to login (except for public pages)
	if (!isUserAuthenticated && !publicPages.includes(to.path)) {
		console.log('Auth middleware: Redirecting unauthenticated user to login');
		return navigateTo('/login');
	}

	// Redirect authenticated users away from login/signup pages to dashboard
	if (isUserAuthenticated && ['/login', '/signup'].includes(to.path)) {
		console.log('Auth middleware: Redirecting authenticated user to dashboard');
		return navigateTo('/dashboard');
	}
});