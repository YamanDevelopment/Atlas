<template>
	<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
		<div class="sm:mx-auto sm:w-full sm:max-w-md">
			<!-- Logo -->
			<div class="text-center">
				<NuxtLink
					to="/"
					class="text-3xl font-bold text-indigo-600"
				>
					OppTrack
				</NuxtLink>
			</div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
				Sign in to your account
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Or
				<NuxtLink
					to="/signup"
					class="font-medium text-indigo-600 hover:text-indigo-500"
				>
					create a new account
				</NuxtLink>
			</p>
		</div>

		<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
			<div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
				<form
					class="space-y-6"
					@submit.prevent="handleLogin"
				>
					<!-- Username -->
					<div>
						<label
							for="username"
							class="block text-sm font-medium text-gray-700"
						>
							Username
						</label>
						<div class="mt-1">
							<input
								id="username"
								v-model="username"
								name="username"
								type="text"
								autocomplete="username"
								required
								class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								placeholder="Enter your username"
							>
						</div>
					</div>

					<!-- Password -->
					<div>
						<label
							for="password"
							class="block text-sm font-medium text-gray-700"
						>
							Password
						</label>
						<div class="mt-1">
							<input
								id="password"
								v-model="password"
								name="password"
								type="password"
								autocomplete="current-password"
								required
								class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								placeholder="Enter your password"
							>
						</div>
					</div>

					<!-- Remember me -->
					<div class="flex items-center justify-between">
						<div class="flex items-center">
							<input
								id="remember-me"
								name="remember-me"
								type="checkbox"
								class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
							>
							<label
								for="remember-me"
								class="ml-2 block text-sm text-gray-900"
							>
								Remember me
							</label>
						</div>

						<div class="text-sm">
							<a
								href="#"
								class="font-medium text-indigo-600 hover:text-indigo-500"
							>
								Forgot your password?
							</a>
						</div>
					</div>

					<!-- Error message -->
					<div
						v-if="error"
						class="text-red-600 text-sm"
					>
						{{ error }}
					</div>

					<!-- Submit button -->
					<div>
						<button
							type="submit"
							:disabled="isLoading"
							class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<svg
								v-if="isLoading"
								class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								/>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
							{{ isLoading ? 'Signing in...' : 'Sign in' }}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useUser } from '~/composables/useUser';

// If already authenticated, redirect to dashboard
const { isAuthenticated, init } = useUser();

onMounted(async () => {
	await init();
	if (isAuthenticated.value) {
		await navigateTo('/dashboard');
	}
});

const username = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);
const { login: loginUser } = useUser();

const handleLogin = async () => {
	error.value = '';

	if (!username.value || !password.value) {
		error.value = 'Please fill in all fields';
		return;
	}

	isLoading.value = true;

	try {
		await loginUser(username.value, password.value);

		// Wait a moment for the authentication state to update
		await nextTick();

		// Navigate to dashboard
		await navigateTo('/dashboard');
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Login failed. Please try again.';
	} finally {
		isLoading.value = false;
	}
};
</script>