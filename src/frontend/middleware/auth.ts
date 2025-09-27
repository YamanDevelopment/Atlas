// Demo middleware - in real app, would check actual auth state
export default defineNuxtRouteMiddleware((to) => {
  // For demo purposes, allow all routes
  // In real implementation, check authentication state here
  
  if (to.path === '/' || to.path === '/login' || to.path === '/signup') {
    // Public routes - always allow
    return;
  }
  
  // For demo, assume user is always authenticated after signup/login
  // In real app: check if user is authenticated, redirect to /login if not
  
  // Example real implementation:
  // const { $auth } = useNuxtApp();
  // if (!$auth.isAuthenticated) {
  //   return navigateTo('/login');
  // }
});