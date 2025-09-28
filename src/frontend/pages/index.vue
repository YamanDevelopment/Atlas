<template>
	<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
		<!-- Navigation -->
		<nav class="px-6 py-4">
			<div class="max-w-7xl mx-auto flex justify-between items-center">
				<div class="text-2xl font-bold text-indigo-600">
					OppTrack
				</div>
				<div class="space-x-4">
					<NuxtLink
						to="/login"
						class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md transition-colors"
					>
						Login
					</NuxtLink>
					<NuxtLink
						to="/signup"
						class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
					>
						Sign up
					</NuxtLink>
				</div>
			</div>
		</nav>

		<!-- Hero Section -->
		<main class="px-6 py-20">
			<div class="max-w-4xl mx-auto text-center">
				<!-- Logo -->
				<div class="mb-8">
					<div class="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-full mb-6">
						<svg
							class="w-10 h-10 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
					</div>
				</div>

				<!-- Main Heading -->
				<h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
					Find Your Perfect
					<span class="text-indigo-600 block">Campus Opportunities</span>
				</h1>

				<!-- Subtitle -->
				<p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
					Too lazy to find campus opportunities? <strong>OppTrack</strong> does the work for you - we automatically match you to labs, clubs & events that actually fit your vibe.
					<span class="text-indigo-600 font-semibold">Zero effort required.</span>
				</p>

				<!-- CTA Button -->
				<div class="mb-16">
					<NuxtLink
						to="/signup"
						class="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
					>
						Get Started - It's Free
						<svg
							class="ml-2 w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 8l4 4m0 0l-4 4m4-4H3"
							/>
						</svg>
					</NuxtLink>
				</div>

				<!-- Features -->
				<div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
					<div class="bg-white p-6 rounded-xl shadow-md">
						<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
							<svg
								class="w-6 h-6 text-blue-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
								/>
							</svg>
						</div>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">
							Smart Matching
						</h3>
						<p class="text-gray-600">
							AI-powered algorithm matches you with opportunities based on your interests, major, and time availability.
						</p>
					</div>

					<div class="bg-white p-6 rounded-xl shadow-md">
						<div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
							<svg
								class="w-6 h-6 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">
							Save Time
						</h3>
						<p class="text-gray-600">
							No more endless scrolling through club lists. Get personalized recommendations in seconds.
						</p>
					</div>

					<div class="bg-white p-6 rounded-xl shadow-md">
						<div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
							<svg
								class="w-6 h-6 text-purple-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
						</div>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">
							Track Everything
						</h3>
						<p class="text-gray-600">
							Manage all your campus involvements, events, and professor connections in one place.
						</p>
					</div>
				</div>
			</div>
		</main>

		<!-- Footer -->
		<footer class="px-6 py-8 text-center text-gray-500">
			<p>&copy; 2025 OppTrack. Built for students, by students.</p>
		</footer>
	</div>
</template>

<script setup lang="ts">
import { useUser } from '~/composables/useUser';

// Redirect to dashboard if already authenticated
const { isAuthenticated } = useUser();
if (isAuthenticated.value) {
  await navigateTo('/dashboard');
}
</script>