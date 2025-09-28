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
				Create your account
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Or
				<NuxtLink
					to="/login"
					class="font-medium text-indigo-600 hover:text-indigo-500"
				>
					sign in to your existing account
				</NuxtLink>
			</p>
		</div>

		<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
			<div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
				<form
					class="space-y-6"
					@submit.prevent="handleSignup"
				>
					<!-- Full Name -->
					<div>
						<label
							for="name"
							class="block text-sm font-medium text-gray-700"
						>
							Full Name
						</label>
						<div class="mt-1">
							<input
								id="name"
								v-model="name"
								name="name"
								type="text"
								required
								class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								placeholder="Enter your full name"
							>
						</div>
					</div>

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
								placeholder="Choose a username"
							>
						</div>
					</div>

					<!-- Email -->
					<div>
						<label
							for="email"
							class="block text-sm font-medium text-gray-700"
						>
							Email address
						</label>
						<div class="mt-1">
							<input
								id="email"
								v-model="email"
								name="email"
								type="email"
								autocomplete="email"
								required
								class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								placeholder="Enter your email"
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
								autocomplete="new-password"
								required
								class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								placeholder="Enter your password"
							>
						</div>
					</div>

					<!-- Confirm Password -->
					<div>
						<label
							for="confirmPassword"
							class="block text-sm font-medium text-gray-700"
						>
							Confirm Password
						</label>
						<div class="mt-1">
							<input
								id="confirmPassword"
								v-model="confirmPassword"
								name="confirmPassword"
								type="password"
								autocomplete="new-password"
								required
								class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								placeholder="Confirm your password"
							>
						</div>
					</div>

					<!-- Terms -->
					<div class="flex items-center">
						<input
							id="terms"
							v-model="agreeToTerms"
							name="terms"
							type="checkbox"
							required
							class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
						>
						<label
							for="terms"
							class="ml-2 block text-sm text-gray-900"
						>
							I agree to the
							<a
								href="#"
								class="text-indigo-600 hover:text-indigo-500"
							>Terms of Service</a>
							and
							<a
								href="#"
								class="text-indigo-600 hover:text-indigo-500"
							>Privacy Policy</a>
						</label>
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
							{{ isLoading ? 'Creating account...' : 'Create account' }}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useUser } from '~/composables/useUser';
import { authService } from '~/services/auth';
import type { RegisterData } from '~/types/auth';

const name = ref('');
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const agreeToTerms = ref(false);
const error = ref('');
const isLoading = ref(false);

const handleSignup = async () => {
	error.value = '';

	// Validation
	if (!name.value || !username.value || !email.value || !password.value) {
		error.value = 'Please fill in all fields';
		return;
	}

	if (password.value !== confirmPassword.value) {
		error.value = 'Passwords do not match';
		return;
	}

	if (password.value.length < 6) {
		error.value = 'Password must be at least 6 characters';
		return;
	}

	if (!agreeToTerms.value) {
		error.value = 'Please agree to the terms and conditions';
		return;
	}

	isLoading.value = true;

	try {
		const registerData: RegisterData = {
			name: name.value,
			username: username.value,
			email: email.value,
			password: password.value,
		};

		await authService.register(registerData);
		await navigateTo('/onboarding');
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Registration failed. Please try again.';
	} finally {
		isLoading.value = false;
	}
};
</script>