<template>
	<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
		<!-- Navigation -->
		<nav class="bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20">
			<div class="max-w-7xl mx-auto px-4">
				<div class="flex justify-between items-center h-16">
					<div class="flex items-center space-x-8">
						<NuxtLink
							to="/"
							class="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
						>
							OppTrack
						</NuxtLink>
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
						<!-- User Profile Dropdown -->
						<div class="relative">
							<button
								class="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer"
								@click="showProfileDropdown = !showProfileDropdown"
							>
								<ClientOnly fallback="U">
									{{ userInitials || 'U' }}
								</ClientOnly>
							</button>

							<!-- Profile Dropdown Menu -->
							<div
								v-if="showProfileDropdown"
								class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
							>
								<div class="px-4 py-2 border-b border-gray-100">
									<p class="font-medium text-gray-900">
										{{ fullName || user?.name || 'User' }}
									</p>
									<p class="text-sm text-gray-500">
										{{ user?.email || '' }}
									</p>
								</div>
								<NuxtLink
									to="/profile"
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
									@click="showProfileDropdown = false"
								>
									Profile Settings
								</NuxtLink>
								<button
									class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
									@click="handleLogout"
								>
									Sign Out
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</nav>

		<!-- Main Content -->
		<main class="max-w-7xl mx-auto px-4 py-8">
			<!-- Welcome Header -->
			<div class="mb-8 stats-section">
				<h1 class="text-3xl font-bold text-gray-900">
					<ClientOnly fallback="Welcome back, there!">
						Welcome back, {{ fullName || user?.name || 'there' }}!
					</ClientOnly>
				</h1>
				<p class="text-gray-600 mt-2">
					Here's what's happening in your campus journey.
				</p>
				<div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
					<div class="bg-white rounded-lg p-4 shadow-sm">
						<div class="text-2xl font-bold text-indigo-600">
							{{ commitments?.length || 0 }}
						</div>
						<div class="text-sm text-gray-600">
							Active Commitments
						</div>
					</div>
					<div class="bg-white rounded-lg p-4 shadow-sm">
						<div class="text-2xl font-bold text-green-600">
							{{ upcomingEvents?.length || 0 }}
						</div>
						<div class="text-sm text-gray-600">
							Upcoming Events
						</div>
					</div>
					<div class="bg-white rounded-lg p-4 shadow-sm">
						<div class="text-2xl font-bold text-purple-600">
							{{ recommendedClubs?.length || 'Loading...' }}
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
							<span class="text-sm text-gray-500">{{ commitments?.length || 0 }} active</span>
						</div>

						<div
							v-if="commitments?.length > 0"
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

					<!-- Club Recommendations Widget -->
					<div
						v-if="user && user.interests && user.interests?.length > 0 && recommendedClubs?.length > 0"
						class="bg-white rounded-xl shadow-sm p-6"
					>
						<div class="flex items-center justify-between mb-6">
							<h2 class="text-xl font-semibold text-gray-900">
								Recommended Clubs
							</h2>
							<span class="text-sm text-gray-500">Based on your interests</span>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div
								v-for="club in recommendedClubs.slice(0, 4)"
								:key="club.id"
								class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-indigo-300"
								@click="openClubModal(club)"
							>
								<div class="flex items-start justify-between mb-3">
									<h3 class="font-semibold text-gray-900 text-lg">
										{{ club.name }}
									</h3>
									<div class="flex items-center space-x-1">
										<span class="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
											Recommended
										</span>
									</div>
								</div>

								<p class="text-sm text-gray-600 mb-3 line-clamp-2">
									{{ club.description || club.shortDescription }}
								</p>

								<div
									v-if="club.categories && club.categories?.length > 0"
									class="mb-3"
								>
									<div class="flex flex-wrap gap-1">
										<span
											v-for="category in club.categories.slice(0, 2)"
											:key="category.id || category.name"
											class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
										>
											{{ category.name || category }}
										</span>
									</div>
								</div>

								<div class="flex items-center justify-between">
									<span class="text-sm text-gray-500">
										{{ club.memberCount || 0 }} members
									</span>
									<button
										class="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
										@click.stop="joinClubFromRecommendation(club)"
									>
										Join
									</button>
								</div>
							</div>
						</div>

						<div
							v-if="recommendedClubs?.length > 4"
							class="text-center mt-4"
						>
							<button
								class="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
								@click="$router.push('/explore')"
							>
								View All Recommendations →
							</button>
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
											{{ mockHighCommitment.name }}
										</h4>
										<p class="text-gray-600 text-sm mt-1">
											{{ mockHighCommitment.description || mockHighCommitment.shortDescription || 'Perfect for CS majors - research opportunities and leadership roles' }}
										</p>
										<div class="flex items-center mt-2 space-x-4 text-xs text-gray-500">
											<span>👥 {{ mockHighCommitment.memberCount || 87 }} members</span>
											<span>🎯 Matches your major & interests</span>
										</div>
									</div>
									<div class="flex justify-end">
										<button
											class="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-medium whitespace-nowrap"
											@click="acceptOpportunity(mockHighCommitment)"
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
													{{ mockLowCommitment1.name }}
												</h5>
												<p class="text-gray-600 text-sm mt-1">
													{{ mockLowCommitment1.description || mockLowCommitment1.shortDescription || 'Network with like-minded students and learn about startups' }}
												</p>
											</div>
											<div class="flex justify-end">
												<button
													class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap"
													@click="acceptOpportunity(mockLowCommitment1)"
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
													{{ mockLowCommitment2.name }}
												</h5>
												<p class="text-gray-600 text-sm mt-1">
													{{ mockLowCommitment2.description || mockLowCommitment2.shortDescription || 'Professional development and coding competitions' }}
												</p>
											</div>
											<div class="flex justify-end">
												<button
													class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap"
													@click="acceptOpportunity(mockLowCommitment2)"
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
											{{ mockDiscoveryClub.name }}
										</h4>
										<p class="text-gray-600 text-sm mt-1">
											{{ mockDiscoveryClub.description || mockDiscoveryClub.shortDescription || 'Explore your creative side and build a portfolio outside of tech' }}
										</p>
										<div class="flex items-center mt-2 space-x-4 text-xs text-gray-500">
											<span>👥 {{ mockDiscoveryClub.memberCount || 89 }} members</span>
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
							v-if="upcomingEvents?.length > 0"
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
										View All Recommendations
									</h4>
									<p class="text-sm text-gray-500">
										Explore all clubs, events and opportunities
									</p>
								</div>
							</NuxtLink>

							<button
								class="flex items-center w-full p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
								@click="showResearchGuide = true"
							>
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
										Learn how to get into research opportunities
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
			:current-commitments="commitments?.length || 0"
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

							<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
									<p class="text-gray-600 mb-6">
										{{ modalEventData.whyRecommended || 'Perfect opportunity to expand your network and learn something new!' }}
									</p>

									<!-- Tags -->
									<div
										v-if="modalEventData?.tags && modalEventData.tags?.length > 0"
										class="mb-6"
									>
										<h4 class="font-medium text-gray-900 mb-2">
											Tags
										</h4>
										<div class="flex flex-wrap gap-2">
											<span
												v-for="tag in modalEventData.tags"
												:key="tag"
												class="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium"
											>
												{{ tag }}
											</span>
										</div>
									</div>

									<!-- Additional Info -->
									<div class="space-y-3 text-sm">
										<div
											v-if="modalEventData.isFree"
											class="flex items-center text-green-600"
										>
											<svg
												class="w-4 h-4 mr-2"
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
											Free Event
										</div>
										<div
											v-if="modalEventData.isVirtual"
											class="flex items-center text-blue-600"
										>
											<svg
												class="w-4 h-4 mr-2"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
												/>
											</svg>
											Virtual Event
										</div>
									</div>
								</div>
							</div>

							<!-- Event Map - Full Width -->
							<EventMap :event="modalEventData" />

							<div class="flex gap-4 pt-6 border-t border-gray-200/50">
								<button
									class="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
									:class="{ 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800': (modalEventData as any).rsvpStatus === 'going' }"
									@click="rsvpEvent(modalEventData, 'going')"
								>
									{{ (modalEventData as any).rsvpStatus === 'going' ? '✓ Going' : 'I\'m Going' }}
								</button>
								<button
									class="flex-1 py-4 px-6 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium text-lg shadow-sm hover:shadow-md transform hover:-translate-y-1 hover:scale-105"
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

		<!-- Club Recommendation Modal -->
		<Transition
			enter-active-class="transition-all duration-300 ease-out"
			enter-from-class="opacity-0"
			enter-to-class="opacity-100"
			leave-active-class="transition-all duration-200 ease-in"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0"
		>
			<div
				v-if="showClubModal && selectedClub"
				class="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
				@click="closeClubModal"
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
						v-if="showClubModal && selectedClub"
						class="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto border border-white/20"
						@click.stop
					>
						<div class="p-6">
							<div class="flex justify-between items-start mb-6">
								<h2 class="text-2xl font-bold text-gray-900">
									{{ selectedClub.name }}
								</h2>
								<button
									class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
									@click="closeClubModal"
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

							<div class="space-y-6">
								<p class="text-gray-600 text-lg leading-relaxed">
									{{ selectedClub.description }}
								</p>

								<div v-if="selectedClub?.categories && selectedClub.categories?.length > 0">
									<h3 class="font-semibold text-gray-900 mb-3">
										Categories
									</h3>
									<div class="flex flex-wrap gap-2">
										<span
											v-for="category in selectedClub.categories"
											:key="category.id || category.name"
											class="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full"
										>
											{{ category.name || category }}
										</span>
									</div>
								</div>

								<div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
									<div v-if="selectedClub.memberCount">
										<span class="font-semibold">Members:</span> {{ selectedClub.memberCount }}
									</div>
									<div v-if="selectedClub.meetingSchedule">
										<span class="font-semibold">Meetings:</span> {{ selectedClub.meetingSchedule }}
									</div>
								</div>

								<div
									v-if="selectedClub?.upcomingEvents && selectedClub.upcomingEvents?.length > 0"
									class="border-t border-gray-200 pt-6"
								>
									<h3 class="font-semibold text-gray-900 mb-3">
										Upcoming Events
									</h3>
									<div class="space-y-3">
										<div
											v-for="event in selectedClub.upcomingEvents.slice(0, 3)"
											:key="event.id"
											class="p-3 bg-gray-50 rounded-lg"
										>
											<h4 class="font-medium text-gray-900">
												{{ event.name }}
											</h4>
											<p class="text-sm text-gray-600">
												{{ formatDate(event.startDate || event.startTime) }}
											</p>
										</div>
									</div>
								</div>

								<div class="flex gap-4 pt-6 border-t border-gray-200">
									<button
										class="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
										@click="joinClubFromRecommendation(selectedClub)"
									>
										{{ selectedClub.isJoined ? 'Joined' : 'Join Club' }}
									</button>
									<button
										v-if="selectedClub.url"
										class="py-3 px-6 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium"
										@click="openUrl(selectedClub.url)"
									>
										Visit Website
									</button>
								</div>
							</div>
						</div>
					</div>
				</Transition>
			</div>
		</Transition>

		<!-- Research Guide Modal -->
		<Transition
			enter-active-class="transition-all duration-300 ease-out"
			enter-from-class="opacity-0"
			enter-to-class="opacity-100"
			leave-active-class="transition-all duration-200 ease-in"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0"
		>
			<div
				v-if="showResearchGuide"
				class="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
				@click="showResearchGuide = false"
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
						v-if="showResearchGuide"
						class="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full mx-4 max-h-[85vh] overflow-y-auto border border-white/20"
						@click.stop
					>
						<!-- Research Guide Content -->
						<div class="p-8">
							<div class="flex justify-between items-start mb-8">
								<div class="flex-1 pr-6">
									<h2 class="text-2xl font-bold text-gray-900 mb-2">
										🔬 Student Research Guide
									</h2>
									<p class="text-gray-600">
										Your comprehensive guide to finding and getting involved in undergraduate research opportunities
									</p>
								</div>
								<button
									class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
									@click="showResearchGuide = false"
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

							<div class="space-y-8">
								<!-- Step 1 -->
								<div class="border-l-4 border-indigo-500 pl-6">
									<h3 class="text-xl font-semibold text-gray-900 mb-3">
										1. Explore Your Interests
									</h3>
									<p class="text-gray-700 mb-4">
										Start by identifying areas that genuinely interest you. Research is most rewarding when you're passionate about the subject matter.
									</p>
									<ul class="list-disc list-inside text-gray-600 space-y-2">
										<li>Review your coursework - which topics sparked your curiosity?</li>
										<li>Browse faculty research profiles in your department</li>
										<li>Attend research seminars and department talks</li>
										<li>Read recent papers in fields that interest you</li>
									</ul>
								</div>

								<!-- Step 2 -->
								<div class="border-l-4 border-green-500 pl-6">
									<h3 class="text-xl font-semibold text-gray-900 mb-3">
										2. Find Faculty Mentors
									</h3>
									<p class="text-gray-700 mb-4">
										Building relationships with faculty is crucial for getting involved in research. Start early and be genuine in your approach.
									</p>
									<ul class="list-disc list-inside text-gray-600 space-y-2">
										<li>Visit professors during office hours to discuss their research</li>
										<li>Attend department events and research presentations</li>
										<li>Read faculty publications before reaching out</li>
										<li>Volunteer for research-related tasks or projects</li>
									</ul>
								</div>

								<!-- Step 3 -->
								<div class="border-l-4 border-purple-500 pl-6">
									<h3 class="text-xl font-semibold text-gray-900 mb-3">
										3. Develop Essential Skills
									</h3>
									<p class="text-gray-700 mb-4">
										Research requires both technical and soft skills. Start building these early in your academic journey.
									</p>
									<ul class="list-disc list-inside text-gray-600 space-y-2">
										<li><strong>Technical:</strong> Programming, data analysis, lab techniques, literature review</li>
										<li><strong>Communication:</strong> Scientific writing, presentation skills, peer collaboration</li>
										<li><strong>Critical Thinking:</strong> Problem-solving, experimental design, hypothesis testing</li>
										<li><strong>Time Management:</strong> Project planning, deadline management, work-life balance</li>
									</ul>
								</div>

								<!-- Step 4 -->
								<div class="border-l-4 border-orange-500 pl-6">
									<h3 class="text-xl font-semibold text-gray-900 mb-3">
										4. Apply for Programs & Funding
									</h3>
									<p class="text-gray-700 mb-4">
										Many institutions offer structured research programs for undergraduates. These provide excellent entry points.
									</p>
									<ul class="list-disc list-inside text-gray-600 space-y-2">
										<li>Undergraduate Research Opportunity Programs (UROP)</li>
										<li>Summer research internships (REU, industry programs)</li>
										<li>Independent study courses for research credit</li>
										<li>Research scholarships and grants for undergraduates</li>
									</ul>
								</div>

								<!-- Tips Box -->
								<div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
									<h3 class="text-lg font-semibold text-blue-900 mb-4">
										💡 Pro Tips for Success
									</h3>
									<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
										<div>
											<h4 class="font-medium text-blue-800 mb-2">
												When Reaching Out:
											</h4>
											<ul class="text-blue-700 space-y-1">
												<li>• Be specific about your interests</li>
												<li>• Show you've done your homework</li>
												<li>• Attach a resume/CV</li>
												<li>• Be persistent but respectful</li>
											</ul>
										</div>
										<div>
											<h4 class="font-medium text-blue-800 mb-2">
												Building Your Profile:
											</h4>
											<ul class="text-blue-700 space-y-1">
												<li>• Maintain a strong GPA</li>
												<li>• Get involved in relevant clubs</li>
												<li>• Attend conferences when possible</li>
												<li>• Document your work and progress</li>
											</ul>
										</div>
									</div>
								</div>

								<!-- Action Items -->
								<div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
									<h3 class="text-lg font-semibold mb-4">
										🚀 Ready to Start? Your Next Steps:
									</h3>
									<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
										<div class="bg-white/20 rounded-lg p-4">
											<h4 class="font-medium mb-2">
												This Week
											</h4>
											<p>Identify 3-5 faculty members whose research interests you</p>
										</div>
										<div class="bg-white/20 rounded-lg p-4">
											<h4 class="font-medium mb-2">
												Next Week
											</h4>
											<p>Attend office hours or research seminars to learn more</p>
										</div>
										<div class="bg-white/20 rounded-lg p-4">
											<h4 class="font-medium mb-2">
												This Month
											</h4>
											<p>Apply to research programs and reach out to potential mentors</p>
										</div>
									</div>
								</div>
							</div>

							<div class="pt-6 border-t border-gray-200/50 mt-8">
								<button
									class="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
									@click="showResearchGuide = false"
								>
									Got it! Let's Get Started 🎯
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
import { useUser } from '~/composables/useUser';
import { useEvents } from '~/composables/useEvents';
import { useClubs } from '~/composables/useClubs';
import { apiService } from '~/services/api';

// Require authentication for this page
// TODO: Re-enable after fixing redirect loop
// definePageMeta({
// 	middleware: 'auth',
// });

// Check authentication and redirect if needed
const { user, isAuthenticated, userInitials, fullName, logout, init, isInitialized, isLoading } = useUser();

// Manual auth check since middleware is temporarily disabled
onMounted(async () => {
	console.log('📊 Dashboard: Starting auth check');

	// Ensure auth state is properly initialized
	if (!isInitialized.value) {
		console.log('📊 Dashboard: Auth not initialized, initializing...');
		await init();
		console.log('📊 Dashboard: Auth initialization complete');
	}

	console.log('📊 Dashboard: Auth state check', {
		isLoading: isLoading.value,
		isAuthenticated: isAuthenticated.value,
		hasUser: !!user.value,
		userId: user.value?.id,
		isInitialized: isInitialized.value,
	});

	// After initialization, check if user is authenticated
	if (!isLoading.value && !isAuthenticated.value) {
		console.log('📊 Dashboard: User not authenticated, redirecting to login');
		await navigateTo('/login');
		return;
	}

	console.log('📊 Dashboard: User is authenticated, staying on dashboard');

	// Check for onboarding redirect
	const searchParams = new URLSearchParams(window.location.search);
	if (searchParams.get('from') === 'onboarding') {
		showStarterPlanModal.value = true;
	}

	// Load dashboard data AFTER auth is complete and user is available
	console.log('📊 Dashboard: Loading data with user ID:', user.value?.id);
	console.log('📊 Dashboard: Full user object:', {
		id: user.value?.id,
		name: user.value?.name,
		hasInterests: (user.value?.interests?.length || 0) > 0,
	});
	
	try {
		await Promise.all([
			fetchRecommendedEvents(10),
			fetchRecommendedClubs(6),
			fetchCommitments(),
		]);
		console.log('📊 Dashboard: Data loading complete');
	} catch (error) {
		console.error('Failed to load dashboard data:', error);
	}

	// Setup client-side event listeners
	if (import.meta.client) {
		document.addEventListener('click', handleClickOutside);
	}
});// Use API services for data
const {
	events,
	recommendedEvents,
	isLoading: _eventsLoading,
	error: _eventsError,
	fetchRecommendedEvents,
	rsvpToEvent,
	toggleEventBookmark: _toggleEventBookmark,
} = useEvents();

const {
	clubs: _clubs,
	recommendedClubs,
	isLoading: _clubsLoading,
	error: _clubsError,
	fetchRecommendedClubs,
	toggleClubFollow,
} = useClubs();

// Modal and tour states
const showStarterPlanModal = ref(false);
const showTour = ref(false);
const planAccepted = ref(false);
const showNotifications = ref(false);
const showProfileDropdown = ref(false);
const showResearchGuide = ref(false);

// Event modal states
const showEventModal = ref(false);
const modalEventData = ref<Event | null>(null);

// Club modal states
const showClubModal = ref(false);
const selectedClub = ref<any>(null);

// Local state for commitments
const commitments = ref<Commitment[]>([]);
const commitmentsLoading = ref(false);

// Fetch user commitments
const fetchCommitments = async () => {
	try {
		commitmentsLoading.value = true;
		console.log('📋 Fetching user commitments...');

		const response = await apiService.get('/involvement/commitments');

		if (response.success) {
			commitments.value = response.data.commitments.map((c: any) => ({
				id: `${c.type}-${c.itemId}`,
				title: c.item?.name || `${c.type} ${c.itemId}`,
				status: c.status,
				type: c.type,
				itemId: c.itemId,
				joinedAt: c.joinedAt,
				lastUpdated: c.lastUpdated,
				item: c.item,
				// Default values for calendar fields (not used for lab/org commitments)
				startTime: new Date(c.joinedAt || new Date()),
				endTime: new Date(c.joinedAt || new Date()),
				priority: 'medium' as const,
				description: c.item?.description || '',
				location: 'Online',
				relatedId: c.itemId?.toString(),
			}));

			console.log(`✅ Loaded ${commitments.value?.length || 0} commitments`);
		} else {
			console.error('Failed to fetch commitments:', response.message);
		}
	} catch (error) {
		console.error('❌ Error fetching commitments:', error);
	} finally {
		commitmentsLoading.value = false;
	}
};

// Computed values for dashboard stats
const upcomingEvents = computed(() => {
	const now = new Date();
	const upcoming = recommendedEvents.value.filter(event =>
		new Date(event.startTime) > now,
	).slice(0, 5); // Show only next 5 events

	return upcoming?.length > 0 ? upcoming : events.value.slice(0, 5);
});

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

// Mock data for notifications (would eventually be API-driven)
const nudges = ref([
	{
		id: 'nudge-1',
		message: `${recommendedClubs.value[0]?.name || 'AI Research Club'} meeting today at 6 PM in Engineering Building`,
		type: 'reminder',
		actionText: 'View Details',
	},
	{
		id: 'nudge-2',
		message: `You have ${recommendedEvents.value?.length || 0} new event recommendations based on your interests`,
		type: 'recommendation',
		actionText: 'View Recommendations',
	},
]);

// Close dropdowns when clicking outside
const handleClickOutside = (event: MouseEvent) => {
	const target = event.target as HTMLElement;
	if (showNotifications.value && !target.closest('.relative')) {
		showNotifications.value = false;
	}
	if (showProfileDropdown.value && !target.closest('.relative')) {
		showProfileDropdown.value = false;
	}
};

onUnmounted(() => {
	if (import.meta.client) {
		document.removeEventListener('click', handleClickOutside);
	}
});

// Methods
const toggleNotifications = () => {
	showNotifications.value = !showNotifications.value;
};

const handleLogout = async () => {
	try {
		await logout();
		await navigateTo('/login');
	} catch (error) {
		console.error('Logout failed:', error);
		// Force navigation even if logout fails
		await navigateTo('/login');
	}
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
	try {
		// Follow the club via API
		await toggleClubFollow(club.id);

		// Add to local commitments list
		const newCommitment: Commitment = {
			id: 'commitment-' + Date.now(),
			title: club.name,
			type: 'club',
			description: club.description || club.shortDescription || '',
			startTime: new Date(),
			endTime: new Date(),
			location: 'TBD',
			priority: 'medium',
			status: 'pending',
			relatedId: club.id,
		};

		commitments.value.push(newCommitment);
		console.log('Accepted opportunity:', club.name);
	} catch (error) {
		console.error('Failed to accept opportunity:', error);
	}
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

const _acceptStarterPlan = async () => {
	try {
		// Follow all recommended clubs
		const followPromises = recommendedClubs.value.slice(0, 4).map(async (club) => {
			try {
				await toggleClubFollow(club.id);
				return club;
			} catch (error) {
				console.warn('Failed to follow club:', club.name, error);
				return null;
			}
		});

		const followedClubs = (await Promise.all(followPromises)).filter(Boolean) as Club[];

		// Add commitments for followed clubs
		followedClubs.forEach(club => {
			const commitment: Commitment = {
				id: 'commitment-' + Date.now() + '-' + club.id,
				title: club.name,
				type: 'club',
				description: club.description || club.shortDescription || '',
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
		console.log('Accepted starter plan with', followedClubs?.length || 0, 'club recommendations');
	} catch (error) {
		console.error('Failed to accept starter plan:', error);
	}
};

const updateCommitmentStatus = async (commitmentId: string, status: string) => {
	const commitment = commitments.value.find((c: Commitment) => c.id === commitmentId);
	if (!commitment) return;

	try {
		// Extract type and itemId from commitment
		const response = await apiService.put('/involvement/status', {
			type: commitment.type,
			itemId: commitment.itemId,
			status,
		});

		if (response.success) {
			commitment.status = status as any;
			console.log(`✅ Updated commitment status: ${commitment.title} -> ${status}`);
		} else {
			console.error('Failed to update commitment status:', response.message);
		}
	} catch (error) {
		console.error('❌ Error updating commitment status:', error);
	}
};

const removeCommitment = async (commitmentId: string) => {
	const commitment = commitments.value.find((c: Commitment) => c.id === commitmentId);
	if (!commitment) return;

	try {
		const response = await apiService.delete('/involvement/leave', {
			type: commitment.type,
			itemId: commitment.itemId,
		});

		if (response.success) {
			const index = commitments.value.findIndex((c: Commitment) => c.id === commitmentId);
			if (index > -1) {
				commitments.value.splice(index, 1);
				console.log(`✅ Removed commitment: ${commitment.title}`);
			}
		} else {
			console.error('Failed to remove commitment:', response.message);
		}
	} catch (error) {
		console.error('❌ Error removing commitment:', error);
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

const openUrl = (url: string) => {
	if (url) {
		window.open(url, '_blank');
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

// Club modal functions
const openClubModal = (club: any) => {
	selectedClub.value = club;
	showClubModal.value = true;
};

const closeClubModal = () => {
	showClubModal.value = false;
	selectedClub.value = null;
};

const joinClubFromRecommendation = async (club: any) => {
	try {
		const response = await apiService.post('/involvement/join', {
			type: 'organization',
			itemId: parseInt(club.id),
		});

		if (response.success) {
			console.log('✅ Joined club from recommendation:', club.name);
			// Refresh commitments to show the new one
			await fetchCommitments();
			// Optionally mark club as joined in the recommendations
			club.isJoined = true;
		} else {
			console.error('Failed to join club:', response.message);
		}
	} catch (error) {
		console.error('❌ Error joining club:', error);
	}
};

const rsvpEvent = async (event: Event, status: 'going' | 'interested' | 'not-going') => {
	try {
		await rsvpToEvent(event.id, status);
		console.log('RSVP for event:', event.name, 'with status:', status);

		// Update local state for immediate UI feedback
		const eventInList = upcomingEvents.value.find(e => e.id === event.id);
		if (eventInList && 'rsvpStatus' in eventInList) {
			(eventInList as any).rsvpStatus = status;
		}
		if (modalEventData.value && modalEventData.value.id === event.id) {
			(modalEventData.value as any).rsvpStatus = status;
		}
	} catch (error) {
		console.error('Failed to RSVP to event:', error);
	}
};

// Mock data fallbacks for involvement plan (using actual API data when available)
const mockHighCommitment = computed(() =>
	recommendedClubs.value[0] || {
		id: 'club-high-1',
		name: 'AI Research Club',
		description: 'Perfect for CS majors - research opportunities and leadership roles',
		categories: [{ id: 'academic', name: 'Academic' }],
		memberCount: 87,
		isFollowing: false,
		upcomingEvents: [],
		logoUrl: '',
		url: 'https://ai.research.ucf.edu',
	},
);

const mockLowCommitment1 = computed(() =>
	recommendedClubs.value[1] || {
		id: 'club-low-1',
		name: 'Tech Entrepreneurship Club',
		description: 'Network with like-minded students and learn about startups',
		categories: [{ id: 'career', name: 'Career' }],
		memberCount: 156,
		isFollowing: false,
		upcomingEvents: [],
		logoUrl: '',
		url: 'https://techentrepreneurship.ucf.edu',
	},
);

const mockLowCommitment2 = computed(() =>
	recommendedClubs.value[2] || {
		id: 'club-low-2',
		name: 'ACM Student Chapter',
		description: 'Professional development and coding competitions',
		categories: [{ id: 'academic', name: 'Academic' }],
		memberCount: 203,
		isFollowing: false,
		upcomingEvents: [],
		logoUrl: '',
		url: 'https://acm.ucf.edu',
	},
);

const mockDiscoveryClub = computed(() =>
	recommendedClubs.value[3] || {
		id: 'club-discovery-1',
		name: 'Photography Club',
		description: 'Explore your creative side and build a portfolio outside of tech',
		categories: [{ id: 'hobby', name: 'Hobby' }],
		memberCount: 89,
		isFollowing: false,
		upcomingEvents: [],
		logoUrl: '',
		url: 'https://photo.ucf.edu',
	},
);

// Check for fresh signup on mount
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