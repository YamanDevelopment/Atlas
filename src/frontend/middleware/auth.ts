/**
 * Authentication middleware
 * Redirects unauthenticated users to login page
 */

import { useUser } from '~/composables/useUser';

export default defineNuxtRouteMiddleware((to, from) => {
	const { isAuthenticated } = useUser();

	// Allow access to login and signup pages for unauthenticated users
	const publicPages = ['/', '/login', '/signup', '/index'];

	if (!isAuthenticated.value && !publicPages.includes(to.path)) {
		return navigateTo('/login');
	}

	// Redirect authenticated users away from login/signup pages to dashboard
	if (isAuthenticated.value && ['/login', '/signup'].includes(to.path)) {
		return navigateTo('/dashboard');
	}
});