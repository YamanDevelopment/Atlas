<template>
	<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
		<!-- Navigation -->
		<nav class="bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20">
			<div class="max-w-7xl mx-auto px-4">
				<div class="flex justify-between items-center h-16">
					<div class="flex items-center space-x-8">
						<div class="text-2xl font-bold text-indigo-600">
							OppTrack
						</div>
						<div class="hidden md:flex space-x-6">
							<NuxtLink
								to="/dashboard"
								class="text-indigo-600 font-medium relative"
							>
								Dashboard
								<div class="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
							</NuxtLink>
							<NuxtLink
								to="/explore"
								class="text-gray-500 hover:text-gray-700 transition-colors duration-200"
							>
								Explore
							</NuxtLink>
							<NuxtLink
								to="/profile"
								class="text-gray-500 hover:text-gray-700 transition-colors duration-200"
							>
								Profile
							</NuxtLink>
						</div>
					</div>

					<div class="flex items-center space-x-4">
						<!-- Notifications Dropdown -->
						<div class="relative">
							<button
								class="relative text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-white/50 backdrop-blur-sm transition-all duration-200"
								@click="toggleNotifications"
							>
								<svg
									class="w-6 h-6"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<path
										d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
								<!-- Notification badge -->
								<span
									v-if="nudges.length > 0"
									class="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
								>
									{{ nudges.length }}
								</span>
							</button>

							<!-- Notifications Dropdown -->
							<div
								v-if="showNotifications"
								class="absolute top-full right-0 mt-1 w-80 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 z-50"
							>
								<div class="p-4 border-b border-gray-200">
									<div class="flex items-center justify-between">
										<h3 class="text-lg font-semibold text-gray-900">
											Notifications
										</h3>
										<button
											v-if="nudges.length > 0"
											class="text-sm text-indigo-600 hover:text-indigo-800"
											@click="clearAllNotifications"
										>
											Clear all
										</button>
									</div>
								</div>

								<div class="max-h-96 overflow-y-auto">
									<div
										v-if="nudges.length === 0"
										class="p-6 text-center text-gray-500"
									>
										<svg
											class="w-12 h-12 mx-auto mb-4 text-gray-300"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M15 17h5l-5 5v-5zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<p class="text-sm">
											No new notifications
										</p>
									</div>

									<div
										v-else
										class="divide-y divide-gray-100"
									>
										<div
											v-for="nudge in nudges"
											:key="nudge.id"
											class="p-4 hover:bg-gray-50 transition-colors"
										>
											<div class="flex items-start justify-between">
												<div class="flex-1">
													<div class="flex items-center mb-2">
														<div class="w-2 h-2 bg-blue-500 rounded-full mr-2" />
														<span class="text-xs text-gray-500 uppercase tracking-wide">{{ nudge.type }}</span>
													</div>
													<p class="text-sm text-gray-900 mb-2">
														{{ nudge.message }}
													</p>
													<div class="flex items-center justify-between">
														<span class="text-xs text-gray-400">Just now</span>
														<button
															class="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
															@click="handleNotificationAction(nudge)"
														>
															View →
														</button>
													</div>
												</div>
												<button
													class="ml-2 text-gray-400 hover:text-gray-600"
													@click="dismissNotification(nudge.id)"
												>
													<svg
														class="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M6 18L18 6M6 6l12 12"
														/>
													</svg>
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<NuxtLink
							to="/profile"
							class="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer"
						>
							JD
						</NuxtLink>
					</div>
				</div>
			</div>
		</nav>

		<!-- Main Content -->
		<main class="max-w-7xl mx-auto px-4 py-8">
			<!-- Welcome Header -->
			<div class="mb-8 stats-section">
				<h1 class="text-3xl font-bold text-gray-900">
					Welcome back, John!
				</h1>
				<p class="text-gray-600 mt-2">
					Here's what's happening in your campus journey.
				</p>
				<div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
					<div class="bg-white rounded-lg p-4 shadow-sm">
						<div class="text-2xl font-bold text-indigo-600">
							{{ commitments.length }}
						</div>
						<div class="text-sm text-gray-600">
							Active Commitments
						</div>
					</div>
					<div class="bg-white rounded-lg p-4 shadow-sm">
						<div class="text-2xl font-bold text-green-600">
							{{ upcomingEvents.length }}
						</div>
						<div class="text-sm text-gray-600">
							Upcoming Events
						</div>
					</div>
					<div class="bg-white rounded-lg p-4 shadow-sm">
						<div class="text-2xl font-bold text-purple-600">
							{{ recommendedClubs.length }}
						</div>
						<div class="text-sm text-gray-600">
							Recommendations
						</div>
					</div>
				</div>
			</div>

			<!-- Grid Layout -->
			<div
				class="grid grid-cols-1 lg:grid-cols-3 gap-8"
				style="min-height: 500px;"
			>
				<!-- Left Column (2/3 width) -->
				<div
					class="lg:col-span-2 space-y-8"
					style="min-height: 400px;"
				>
					<!-- Your Commitments -->
					<div class="bg-white rounded-xl shadow-sm p-6 commitments-section min-h-[300px]">
						<div class="flex items-center justify-between mb-6">
							<h2 class="text-xl font-semibold text-gray-900">
								Your Commitments
							</h2>
							<span class="text-sm text-gray-500">{{ commitments.length }} active</span>
						</div>

						<div
							v-if="commitments.length > 0"
							class="space-y-4"
						>
							<div
								v-for="commitment in commitments"
								:key="commitment.id"
								class="flex items-center justify-between p-4 rounded-lg bg-gray-50"
							>
								<div class="flex items-center flex-1">
									<div
										class="w-3 h-3 rounded-full mr-3"
										:class="getCommitmentStatusColor(commitment.status)"
									/>
									<div>
										<h4 class="font-medium text-gray-900">
											{{ commitment.title }}
										</h4>
										<p class="text-sm text-gray-500 capitalize">
											{{ commitment.status }} • {{ commitment.type }}
										</p>
									</div>
								</div>
								<div class="flex items-center space-x-2">
									<select
										:value="commitment.status"
										class="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-200 font-medium text-gray-700"
										@change="updateCommitmentStatus(commitment.id, ($event.target as HTMLSelectElement).value)"
									>
										<option value="pending">
											Pending
										</option>
										<option value="active">
											Active
										</option>
										<option value="passive">
											Passive
										</option>
										<option value="inactive">
											Inactive
										</option>
									</select>
									<button
										class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
										title="Remove commitment"
										@click="removeCommitment(commitment.id)"
									>
										<svg
											class="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
											/>
										</svg>
									</button>
								</div>
							</div>
						</div>

						<div
							v-else
							class="text-center py-8 text-gray-500"
						>
							<p>No commitments yet. Accept some recommendations below to get started!</p>
						</div>
					</div>

					<!-- Your Starter Plan -->
					<div
						class="bg-white rounded-xl shadow-sm p-6"
						style="min-height: 300px;"
					>
						<div class="flex items-center justify-between mb-6">
							<h2 class="text-xl font-semibold text-gray-900">
								Involvement Plan
							</h2>
							<span class="text-sm text-gray-500">Suggestion</span>
						</div>

						<!-- Show recommendations if plan not accepted -->
						<div
							v-if="!planAccepted"
							class="min-h-[400px]"
						>
							<!-- Plan Description -->
							<div class="mb-6">
								<p class="text-gray-600 mb-4">
									Utilizing your field of study and interests, we've packaged the perfect involvement plan just for you!
									Check it out and see which of the suggested orgs you would like to get involved with.
								</p>

								<!-- What's Included -->
								<div class="bg-gray-50 rounded-lg p-4 mb-6">
									<h4 class="font-medium text-gray-900 mb-3">
										What's included:
									</h4>
									<ul class="space-y-2 text-sm text-gray-600">
										<li class="flex items-center">
											<span class="w-2 h-2 bg-indigo-600 rounded-full mr-3" />
											1x High Commitment Extracurricular
										</li>
										<li class="flex items-center">
											<span class="w-2 h-2 bg-indigo-600 rounded-full mr-3" />
											2x Lower Commitment Organizations
										</li>
										<li class="flex items-center">
											<span class="w-2 h-2 bg-indigo-600 rounded-full mr-3" />
											1x Non-technical Discovery Club
										</li>
										<li class="flex items-center">
											<span class="w-2 h-2 bg-indigo-600 rounded-full mr-3" />
											Some Upcoming events you may like
										</li>
									</ul>
								</div>
							</div>

							<!-- Involvement Plan Recommendations -->
							<div class="space-y-6 recommendations-section">
								<!-- High Commitment Extracurricular -->
								<div class="border border-red-200 rounded-lg p-4 bg-red-50">
									<div class="flex items-center mb-3">
										<span class="px-2 py-1 bg-red-600 text-white text-xs rounded-full font-medium">
											HIGH COMMITMENT
										</span>
										<span class="ml-2 text-sm text-gray-600">~8-12 hours/week</span>
									</div>
									<div class="mb-4">
										<h4 class="font-medium text-gray-900">
											{{ recommendedClubs[0]?.name || 'AI Research Club' }}
										</h4>
										<p class="text-gray-600 text-sm mt-1">
											{{ recommendedClubs[0]?.description || 'Perfect for CS majors - research opportunities and leadership roles' }}
										</p>
										<div class="flex items-center mt-2 space-x-4 text-xs text-gray-500">
											<span>👥 {{ recommendedClubs[0]?.memberCount || 87 }} members</span>
											<span>🎯 Matches your major & interests</span>
										</div>
									</div>
									<div class="flex justify-end">
										<button
											class="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-medium whitespace-nowrap"
											@click="acceptOpportunity(recommendedClubs[0] || mockHighCommitment)"
										>
											Accept
										</button>
									</div>
								</div>

								<!-- Lower Commitment Organizations -->
								<div>
									<h4 class="font-medium text-gray-900 mb-3">
										Lower Commitment Organizations
									</h4>
									<div class="space-y-3">
										<!-- First Low Commitment -->
										<div class="border border-blue-200 rounded-lg p-4 bg-blue-50">
											<div class="flex items-center mb-2">
												<span class="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
													LOW COMMITMENT
												</span>
												<span class="ml-2 text-sm text-gray-600">~2-4 hours/week</span>
											</div>
											<div class="mb-4">
												<h5 class="font-medium text-gray-900">
													{{ recommendedClubs[1]?.name || 'Tech Entrepreneurship Club' }}
												</h5>
												<p class="text-gray-600 text-sm mt-1">
													{{ recommendedClubs[1]?.description || 'Network with like-minded students and learn about startups' }}
												</p>
											</div>
											<div class="flex justify-end">
												<button
													class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap"
													@click="acceptOpportunity(recommendedClubs[1] || mockLowCommitment1)"
												>
													Accept
												</button>
											</div>
										</div>

										<!-- Second Low Commitment -->
										<div class="border border-blue-200 rounded-lg p-4 bg-blue-50">
											<div class="flex items-center mb-2">
												<span class="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
													LOW COMMITMENT
												</span>
												<span class="ml-2 text-sm text-gray-600">~2-4 hours/week</span>
											</div>
											<div class="mb-4">
												<h5 class="font-medium text-gray-900">
													{{ recommendedClubs[2]?.name || 'ACM Student Chapter' }}
												</h5>
												<p class="text-gray-600 text-sm mt-1">
													{{ recommendedClubs[2]?.description || 'Professional development and coding competitions' }}
												</p>
											</div>
											<div class="flex justify-end">
												<button
													class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap"
													@click="acceptOpportunity(recommendedClubs[2] || mockLowCommitment2)"
												>
													Accept
												</button>
											</div>
										</div>
									</div>
								</div>

								<!-- Non-technical Discovery Club -->
								<div class="border border-purple-200 rounded-lg p-4 bg-purple-50">
									<div class="flex items-center mb-3">
										<span class="px-2 py-1 bg-purple-600 text-white text-xs rounded-full font-medium">
											DISCOVERY
										</span>
										<span class="ml-2 text-sm text-gray-600">~1-3 hours/week</span>
									</div>
									<div class="mb-4">
										<h4 class="font-medium text-gray-900">
											Photography Club
										</h4>
										<p class="text-gray-600 text-sm mt-1">
											Explore your creative side and build a portfolio outside of tech
										</p>
										<div class="flex items-center mt-2 space-x-4 text-xs text-gray-500">
											<span>👥 89 members</span>
											<span>📸 Beginner friendly</span>
										</div>
									</div>
									<div class="flex justify-end">
										<button
											class="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 font-medium whitespace-nowrap"
											@click="acceptOpportunity(mockDiscoveryClub)"
										>
											Accept
										</button>
									</div>
								</div>
							</div>
						</div>

						<!-- Show acceptance confirmation if plan accepted -->
						<div
							v-else
							class="text-center py-8 min-h-[400px] flex flex-col justify-center"
						>
							<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg
									class="w-8 h-8 text-green-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
							<h3 class="text-lg font-medium text-gray-900">
								Plan Accepted!
							</h3>
							<p class="text-gray-600">
								Your commitments are now being tracked below.
							</p>
						</div>
					</div>
				</div>

				<!-- Right Column (1/3 width) -->
				<div
					class="space-y-8"
					style="min-height: 400px;"
				>
					<!-- Next Up -->
					<div
						class="bg-white rounded-xl shadow-sm p-6"
						style="min-height: 200px;"
					>
						<h2 class="text-xl font-semibold text-gray-900 mb-6">
							Next Up
						</h2>

						<div
							v-if="upcomingEvents.length > 0"
							class="space-y-4"
						>
							<div
								v-for="event in upcomingEvents"
								:key="event.id"
								class="border-l-4 border-indigo-500 pl-4 py-2 cursor-pointer hover:bg-gray-50 rounded-r-lg transition-colors duration-200"
								@click="openEventModal(event)"
							>
								<h4 class="font-medium text-gray-900 text-sm">
									{{ event.name }}
								</h4>
								<p class="text-xs text-gray-500">
									{{ formatDate(event.startTime) }}
								</p>
								<p class="text-xs text-gray-600 mt-1">
									{{ event.location }}
								</p>
							</div>
						</div>

						<div
							v-else
							class="text-center py-8 text-gray-500"
						>
							<p class="text-sm">
								No upcoming events. Check out the Explore page to find events!
							</p>
							<NuxtLink
								to="/explore"
								class="text-indigo-600 text-sm hover:text-indigo-800 mt-2 block"
							>
								Explore Events →
							</NuxtLink>
						</div>
					</div>

					<!-- Quick Actions -->
					<div class="bg-white rounded-xl shadow-sm p-6">
						<h2 class="text-xl font-semibold text-gray-900 mb-6">
							Quick Actions
						</h2>

						<div class="space-y-3">
							<NuxtLink
								to="/explore"
								class="flex items-center p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
							>
								<div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
									<svg
										class="w-5 h-5 text-indigo-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										/>
									</svg>
								</div>
								<div>
									<h4 class="font-medium text-gray-900">
										Explore Opportunities
									</h4>
									<p class="text-sm text-gray-500">
										Find new clubs and events
									</p>
								</div>
							</NuxtLink>

							<button class="flex items-center w-full p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors">
								<div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
									<svg
										class="w-5 h-5 text-green-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
										/>
									</svg>
								</div>
								<div class="text-left">
									<h4 class="font-medium text-gray-900">
										Research Guide
									</h4>
									<p class="text-sm text-gray-500">
										Learn how to get involved
									</p>
								</div>
							</button>

							<NuxtLink
								to="/profile"
								class="flex items-center p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
							>
								<div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
									<svg
										class="w-5 h-5 text-purple-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										/>
									</svg>
								</div>
								<div>
									<h4 class="font-medium text-gray-900">
										Update Profile
									</h4>
									<p class="text-sm text-gray-500">
										Manage your interests
									</p>
								</div>
							</NuxtLink>
						</div>
					</div>
				</div>
			</div>
		</main>

		<!-- Starter Plan Modal -->
		<StarterPlanModal
			:is-visible="showStarterPlanModal"
			:plan="starterPlan"
			:current-commitments="commitments.length"
			@close="showStarterPlanModal = false"
			@start-tour="startDashboardTour"
			@skip-tour="skipDashboardTour"
		/>

		<!-- Dashboard Tour -->
		<TourGuide
			:is-active="showTour"
			:steps="tourSteps"
			@tour-complete="onTourComplete"
			@tour-ended="onTourComplete"
		/>

		<!-- Event Modal -->
		<Transition
			enter-active-class="transition-all duration-300 ease-out"
			enter-from-class="opacity-0"
			enter-to-class="opacity-100"
			leave-active-class="transition-all duration-200 ease-in"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0"
		>
			<div
				v-if="showEventModal"
				class="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
				@click="closeEventModal"
			>
				<Transition
					enter-active-class="transition-all duration-300 ease-out"
					enter-from-class="opacity-0 transform scale-95 translate-y-4"
					enter-to-class="opacity-100 transform scale-100 translate-y-0"
					leave-active-class="transition-all duration-200 ease-in"
					leave-from-class="opacity-100 transform scale-100 translate-y-0"
					leave-to-class="opacity-0 transform scale-95 translate-y-4"
				>
					<div
						v-if="showEventModal && modalEventData"
						class="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-3xl w-full mx-4 max-h-[85vh] overflow-y-auto border border-white/20"
						@click.stop
					>
						<!-- Event Modal Content -->
						<div class="p-8">
							<div class="flex justify-between items-start mb-8">
								<div class="flex-1 pr-6">
									<h2 class="text-2xl font-bold text-gray-900 mb-2">
										{{ modalEventData.name }}
									</h2>
									<p class="text-gray-600">
										{{ modalEventData.description }}
									</p>
								</div>
								<button
									class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
									@click="closeEventModal"
								>
									<svg
										class="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
								<div>
									<h3 class="font-semibold text-gray-900 mb-4">
										Event Details
									</h3>
									<div class="space-y-3">
										<div class="flex items-center text-gray-600">
											<svg
												class="w-5 h-5 mr-3 text-gray-400"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
												/>
											</svg>
											<span>{{ formatDate(modalEventData.startTime) }}</span>
										</div>
										<div class="flex items-center text-gray-600">
											<svg
												class="w-5 h-5 mr-3 text-gray-400"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
												/>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
												/>
											</svg>
											<span>{{ modalEventData.location }}</span>
										</div>
										<div
											v-if="modalEventData.attendeeCount"
											class="flex items-center text-gray-600"
										>
											<svg
												class="w-5 h-5 mr-3 text-gray-400"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
												/>
											</svg>
											<span>{{ modalEventData.attendeeCount }} attending</span>
										</div>
										<div
											v-if="modalEventData.organizer"
											class="flex items-center text-gray-600"
										>
											<svg
												class="w-5 h-5 mr-3 text-gray-400"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
												/>
											</svg>
											<span>{{ modalEventData.organizer }}</span>
										</div>
									</div>
								</div>
								<div>
									<h3 class="font-semibold text-gray-900 mb-4">
										Why You'll Love This
									</h3>
									<p class="text-gray-600">
										{{ modalEventData.whyRecommended || 'Perfect opportunity to expand your network and learn something new!' }}
									</p>
								</div>
							</div>

							<div class="flex gap-4 pt-6 border-t border-gray-200/50">
								<button
									class="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
									:class="{ 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800': (modalEventData as any).rsvpStatus === 'going' }"
									@click="rsvpEvent(modalEventData, 'going')"
								>
									{{ (modalEventData as any).rsvpStatus === 'going' ? '✓ Going' : 'I\'m Going' }}
								</button>
								<button
									class="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium"
									:class="{ 'border-indigo-600 text-indigo-600 bg-indigo-50': (modalEventData as any).rsvpStatus === 'interested' }"
									@click="rsvpEvent(modalEventData, 'interested')"
								>
									{{ (modalEventData as any).rsvpStatus === 'interested' ? '✓ Interested' : 'Interested' }}
								</button>
							</div>
						</div>
					</div>
				</Transition>
			</div>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import type { Plan, Commitment, Event, Club } from '~/types';

// Modal and tour states
const showStarterPlanModal = ref(false);
const showTour = ref(false);
const planAccepted = ref(false);
const showNotifications = ref(false);

// Event modal states
const showEventModal = ref(false);
const modalEventData = ref<Event | null>(null);

// Starter plan data
const starterPlan = ref<Plan>({
	id: 'starter-plan',
	name: 'Don\'t Know Where To Start?',
	description: 'Utilizing your field of study and interests, we\'ve packaged the perfect involvement plan just for you! Check it out and see which of the suggested orgs you would like to get involved with.',
	features: [
		'1x High Commitment Extracurricular',
		'2x Lower Commitment Organizations',
		'1x Non-technical Discovery Club',
		'Some Upcoming events you may like',
	],
	commitmentLimit: 5,
	price: 0,
	isPopular: true,
});

// Tour steps
const tourSteps = ref([
	{
		id: 'welcome',
		title: 'Welcome to Your Dashboard!',
		description: 'This is your command center for tracking your, clubs, commitments, upcoming school events, and staying connected with campus life.',
		target: 'body',
		position: 'top' as const,
	},
	{
		id: 'stats',
		title: 'Track Your Extracurriculars',
		description: 'Monitor your commitments and see how balanced your campus involvement is.',
		target: '.stats-section',
		position: 'bottom' as const,
	},
	{
		id: 'recommendations',
		title: 'Campus Involvement Plan',
		description: 'Utilizing your field of study and interests, we\'ve packaged the perfect involvement plan just for you! Check it out and see which of the suggested orgs you would like to get involved with',
		target: '.recommendations-section',
		position: 'top' as const,
	},
	{
		id: 'commitments',
		title: 'Current Involvements',
		description: 'Keep track of your clubs and member status in one place and update commitment levels easily.',
		target: '.commitments-section',
		position: 'top' as const,
	},
]);

// Mock data
const nudges = ref([
	{
		id: 'nudge-1',
		message: 'AI Research Club meeting today at 6 PM in Engineering Building',
		type: 'reminder',
		actionText: 'View Details',
	},
	{
		id: 'nudge-2',
		message: 'You have 2 new event recommendations based on your interests',
		type: 'recommendation',
		actionText: 'View Recommendations',
	},
]);

const commitments = ref<Commitment[]>([
	{
		id: 'commitment-1',
		title: 'AI Research Club',
		type: 'club',
		description: 'Weekly meetings and project work',
		startTime: new Date(),
		endTime: new Date(),
		location: 'Engineering Building',
		priority: 'high',
		status: 'pending',
		relatedId: 'club-1',
	},
	{
		id: 'commitment-2',
		title: 'Neural Networks Workshop',
		type: 'event',
		description: 'Learn about deep learning fundamentals',
		startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		location: 'Student Union',
		priority: 'medium',
		status: 'active',
		relatedId: 'event-1',
	},
]);

const upcomingEvents = ref<Event[]>([
	{
		id: 'event-1',
		name: 'AI Workshop: Neural Networks',
		title: 'AI Workshop: Neural Networks',
		description: 'Learn the fundamentals of neural networks through hands-on coding exercises and real-world applications. Perfect for beginners and intermediate students.',
		shortDescription: 'Hands-on neural network workshop',
		location: 'Engineering Building Room 201',
		startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
		endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
		date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
		endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
		categories: [{ id: 'workshop', name: 'Workshop' }],
		category: 'workshop',
		tags: ['AI', 'Machine Learning', 'Workshop'],
		isBookmarked: true,
		attendeeCount: 45,
		organizer: 'AI Research Club',
		whyRecommended: 'Perfect match for your machine learning interests and career goals',
		isVirtual: false,
		isFree: true,
		url: 'https://events.ucf.edu/ai-workshop',
	},
	{
		id: 'event-2',
		name: 'Tech Career Fair',
		title: 'Tech Career Fair',
		description: 'Connect with top tech companies including Google, Microsoft, and local startups. Bring your resume and be prepared to network!',
		shortDescription: 'Network with tech recruiters',
		location: 'Student Union Pegasus Ballroom',
		startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
		endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
		date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
		endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
		categories: [{ id: 'career', name: 'Career' }],
		category: 'career',
		tags: ['Career', 'Technology', 'Networking'],
		isBookmarked: false,
		attendeeCount: 234,
		organizer: 'Career Services',
		whyRecommended: 'Excellent opportunity for your computer science career path',
		isVirtual: false,
		isFree: true,
		url: 'https://events.ucf.edu/tech-career-fair',
	},
]);

const recommendedClubs = ref<Club[]>([
	{
		id: 'club-1',
		name: 'AI Research Club',
		description: 'A community of students passionate about artificial intelligence.',
		categories: [{ id: 'academic', name: 'Academic' }],
		memberCount: 87,
		isFollowing: false,
		upcomingEvents: [],
		logoUrl: '',
		url: 'https://ai.research.ucf.edu',
	},
	{
		id: 'club-2',
		name: 'Pickleball Club',
		description: 'Join UCF\'s fastest growing sport!',
		categories: [{ id: 'sport', name: 'Sport' }],
		memberCount: 124,
		isFollowing: false,
		upcomingEvents: [],
		logoUrl: '',
		url: 'https://pickleball.ucf.edu',
	},
	{
		id: 'club-3',
		name: 'Photography Club',
		description: 'Capture the world through your lens!',
		categories: [{ id: 'hobby', name: 'Hobby' }],
		memberCount: 89,
		isFollowing: false,
		upcomingEvents: [],
		logoUrl: '',
		url: 'https://photo.ucf.edu',
	},
]);

// Mock data for involvement plan - these would come from backend recommendations
const mockHighCommitment = ref<Club>({
	id: 'club-high-1',
	name: 'AI Research Club',
	description: 'Perfect for CS majors - research opportunities and leadership roles',
	categories: [{ id: 'academic', name: 'Academic' }],
	memberCount: 87,
	isFollowing: false,
	upcomingEvents: [],
	logoUrl: '',
	url: 'https://ai.research.ucf.edu',
});

const mockLowCommitment1 = ref<Club>({
	id: 'club-low-1',
	name: 'Tech Entrepreneurship Club',
	description: 'Network with like-minded students and learn about startups',
	categories: [{ id: 'career', name: 'Career' }],
	memberCount: 156,
	isFollowing: false,
	upcomingEvents: [],
	logoUrl: '',
	url: 'https://techentrepreneurship.ucf.edu',
});

const mockLowCommitment2 = ref<Club>({
	id: 'club-low-2',
	name: 'ACM Student Chapter',
	description: 'Professional development and coding competitions',
	categories: [{ id: 'academic', name: 'Academic' }],
	memberCount: 203,
	isFollowing: false,
	upcomingEvents: [],
	logoUrl: '',
	url: 'https://acm.ucf.edu',
});

const mockDiscoveryClub = ref<Club>({
	id: 'club-discovery-1',
	name: 'Photography Club',
	description: 'Explore your creative side and build a portfolio outside of tech',
	categories: [{ id: 'hobby', name: 'Hobby' }],
	memberCount: 89,
	isFollowing: false,
	upcomingEvents: [],
	logoUrl: '',
	url: 'https://photo.ucf.edu',
});

// Methods
const toggleNotifications = () => {
	showNotifications.value = !showNotifications.value;
};

const clearAllNotifications = () => {
	nudges.value = [];
	showNotifications.value = false;
};

const dismissNotification = (notificationId: string) => {
	nudges.value = nudges.value.filter(nudge => nudge.id !== notificationId);
};

const handleNotificationAction = (nudge: any) => {
	// Handle notification action (e.g., navigate to relevant page)
	console.log('Notification action:', nudge);
	dismissNotification(nudge.id);
	showNotifications.value = false;
};

const acceptOpportunity = async (club: Club) => {
	// Add to commitments
	const newCommitment: Commitment = {
		id: 'commitment-' + Date.now(),
		title: club.name,
		type: 'club',
		description: club.description,
		startTime: new Date(),
		endTime: new Date(),
		location: 'TBD',
		priority: 'medium',
		status: 'pending',
		relatedId: club.id,
	};

	commitments.value.push(newCommitment);
	console.log('Accepted opportunity:', club.name);
};

const startDashboardTour = () => {
	showTour.value = true;
};

const skipDashboardTour = () => {
	console.log('User skipped dashboard tour');
};

const onTourComplete = () => {
	showTour.value = false;
	console.log('Dashboard tour completed');
};

const acceptStarterPlan = async () => {
	// Add all recommended clubs as commitments
	recommendedClubs.value.forEach(club => {
		const commitment: Commitment = {
			id: 'commitment-' + Date.now() + '-' + club.id,
			title: club.name,
			type: 'club',
			description: club.description,
			startTime: new Date(),
			endTime: new Date(),
			location: 'TBD',
			priority: 'medium',
			status: 'pending',
			relatedId: club.id,
		};
		commitments.value.push(commitment);
	});

	planAccepted.value = true;
	console.log('Accepted starter plan with', recommendedClubs.value.length, 'club recommendations');
};

const updateCommitmentStatus = async (commitmentId: string, status: string) => {
	const commitment = commitments.value.find((c: Commitment) => c.id === commitmentId);
	if (commitment) {
		commitment.status = status as any;
		console.log('Updated commitment status:', status);
	}
};

const removeCommitment = async (commitmentId: string) => {
	const index = commitments.value.findIndex((c: Commitment) => c.id === commitmentId);
	if (index > -1) {
		const [removedCommitment] = commitments.value.splice(index, 1);
		if (removedCommitment) {
			console.log('Removed commitment:', removedCommitment.title);
		}
	}
};

const getCommitmentStatusColor = (status: string) => {
	const colors = {
		pending: 'bg-yellow-400',
		active: 'bg-green-400',
		passive: 'bg-blue-400',
		inactive: 'bg-gray-400',
		upcoming: 'bg-blue-400',
		completed: 'bg-green-400',
		cancelled: 'bg-red-400',
	};
	return colors[status as keyof typeof colors] || 'bg-gray-400';
};

const formatDate = (date: Date) => {
	try {
		const parsedDate = new Date(date);
		if (isNaN(parsedDate.getTime())) {
			return 'Invalid Date';
		}
		return new Intl.DateTimeFormat('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
		}).format(parsedDate);
	} catch (error) {
		console.error('Error formatting date:', error);
		return 'Invalid Date';
	}
};

// Event modal methods
const openEventModal = (event: Event) => {
	modalEventData.value = event;
	showEventModal.value = true;
};

const closeEventModal = () => {
	showEventModal.value = false;
	modalEventData.value = null;
};

const rsvpEvent = (event: Event, status: string) => {
	console.log('RSVP for event:', event.name, 'with status:', status);
	// Update event RSVP status
	const eventInList = upcomingEvents.value.find(e => e.id === event.id);
	if (eventInList && 'rsvpStatus' in eventInList) {
		(eventInList as any).rsvpStatus = status;
	}
};

// Check for fresh signup on mount
onMounted(() => {
	const searchParams = new URLSearchParams(window.location.search);
	if (searchParams.get('from') === 'onboarding') {
		showStarterPlanModal.value = true;
	}

	// Close notifications dropdown when clicking outside
	const handleClickOutside = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		if (showNotifications.value && !target.closest('.relative')) {
			showNotifications.value = false;
		}
	};

	document.addEventListener('click', handleClickOutside);

	onUnmounted(() => {
		document.removeEventListener('click', handleClickOutside);
	});
});
</script>

<style scoped>
/* Prevent layout shifts by ensuring stable grid layout */
.grid {
  contain: layout;
}

/* Ensure minimum heights are maintained for stability */
@media (min-width: 1024px) {
  .lg\:col-span-2 {
    min-height: 500px;
  }
}

/* Smooth transitions for content changes */
.space-y-8 > * {
  transition: all 0.2s ease-in-out;
}
</style>