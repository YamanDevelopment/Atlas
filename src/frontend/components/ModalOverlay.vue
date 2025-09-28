<!-- ModalOverlay Component for Explore Page -->
<template>
	<Transition
		enter-active-class="transition-all duration-300 ease-out"
		enter-from-class="opacity-0"
		enter-to-class="opacity-100"
		leave-active-class="transition-all duration-200 ease-in"
		leave-from-class="opacity-100"
		leave-to-class="opacity-0"
	>
		<div
			v-if="show"
			class="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
			@click="$emit('close')"
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
					v-if="show && data"
					class="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-3xl w-full mx-4 max-h-[85vh] overflow-y-auto border border-white/20"
					@click.stop
				>
					<!-- Club Modal -->
					<div
						v-if="type === 'club'"
						class="p-8"
					>
						<div class="flex justify-between items-start mb-8">
							<div class="flex-1 pr-6">
								<h2 class="text-2xl font-bold text-gray-900 mb-2">
									{{ data.name }}
								</h2>
								<p class="text-gray-600">
									{{ data.description }}
								</p>
							</div>
							<button
								class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
								@click="$emit('close')"
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
									Club Details
								</h3>
								<div class="space-y-3">
									<div
										v-if="data.memberCount"
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
												d="M17 20h5v-2a3 3 0 00-5.196-2.121M9 12a3 3 0 100-6 3 3 0 000 6zm7-3a3 3 0 11-6 0 3 3 0 016 0zm-7 9c0-3 4-4 7-4s7 1 7 4v2H2v-2z"
											/>
										</svg>
										<span>{{ data.memberCount }} members</span>
									</div>
									<div
										v-if="data.timeCommitment"
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
												d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<span>{{ data.timeCommitment }}</span>
									</div>
									<div
										v-if="data.meetingFrequency"
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
												d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
										<span>{{ data.meetingFrequency }}</span>
									</div>
									<div
										v-if="data.contactInfo?.email"
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
												d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
											/>
										</svg>
										<span>{{ data.contactInfo.email }}</span>
									</div>
								</div>
							</div>
							<div>
								<h3 class="font-semibold text-gray-900 mb-4">
									Why You'll Love This
								</h3>
								<p class="text-gray-600 mb-6">
									{{ data.whyRecommended || 'Great opportunity to expand your network and learn something new!' }}
								</p>

								<!-- Tags -->
								<div
									v-if="data.tags && data.tags.length > 0"
									class="mb-6"
								>
									<h4 class="font-medium text-gray-900 mb-2">
										Tags
									</h4>
									<div class="flex flex-wrap gap-2">
										<span
											v-for="tag in data.tags"
											:key="tag"
											class="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium"
										>
											{{ tag }}
										</span>
									</div>
								</div>
							</div>
						</div>

						<div class="flex gap-4 pt-6 border-t border-gray-200/50">
							<button
								class="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
								:class="{ 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800': data.isFollowing }"
								@click="$emit('get-involved', data)"
							>
								{{ data.isFollowing ? '✓ Following' : 'Get Involved' }}
							</button>
						</div>
					</div>

					<!-- Event Modal -->
					<div
						v-else-if="type === 'event'"
						class="p-8"
					>
						<div class="flex justify-between items-start mb-8">
							<div class="flex-1 pr-6">
								<h2 class="text-2xl font-bold text-gray-900 mb-2">
									{{ data.name }}
								</h2>
								<p class="text-gray-600">
									{{ data.description }}
								</p>
							</div>
							<button
								class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
								@click="$emit('close')"
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
										<span>{{ formatEventDate(data.startTime) }}</span>
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
										<span>{{ data.location }}</span>
									</div>
									<div
										v-if="data.attendeeCount"
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
										<span>{{ data.attendeeCount }} attending</span>
									</div>
									<div
										v-if="data.organizer"
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
										<span>{{ data.organizer }}</span>
									</div>
								</div>
							</div>
							<div>
								<h3 class="font-semibold text-gray-900 mb-4">
									Why You'll Love This
								</h3>
								<p class="text-gray-600 mb-6">
									{{ data.whyRecommended || 'Perfect opportunity to expand your network and learn something new!' }}
								</p>

								<!-- Tags -->
								<div
									v-if="data.tags && data.tags.length > 0"
									class="mb-6"
								>
									<h4 class="font-medium text-gray-900 mb-2">
										Tags
									</h4>
									<div class="flex flex-wrap gap-2">
										<span
											v-for="tag in data.tags"
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
										v-if="data.isFree"
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
										v-if="data.isVirtual"
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

						<!-- Event Map Component -->
						<EventMap :event="data" />

						<div class="flex gap-4 pt-6 border-t border-gray-200/50">
							<button
								class="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
								@click="$emit('rsvp-event', data, 'going')"
							>
								I'm Going
							</button>
							<button
								class="flex-1 py-4 px-6 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium text-lg shadow-sm hover:shadow-md transform hover:-translate-y-1"
								@click="$emit('rsvp-event', data, 'interested')"
							>
								Interested
							</button>
						</div>
					</div>

					<!-- Professor Modal -->
					<div
						v-else-if="type === 'professor'"
						class="p-8"
					>
						<div class="flex justify-between items-start mb-8">
							<div class="flex-1 pr-6">
								<h2 class="text-2xl font-bold text-gray-900 mb-2">
									{{ data.name }}
								</h2>
								<p class="text-gray-600">
									{{ data.title }}, {{ data.department }}
								</p>
							</div>
							<button
								class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
								@click="$emit('close')"
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

						<div class="mb-8">
							<h3 class="font-semibold text-gray-900 mb-4">
								Research Areas
							</h3>
							<div class="flex flex-wrap gap-2 mb-6">
								<span
									v-for="area in data.researchAreas"
									:key="area"
									class="px-3 py-2 bg-purple-100 text-purple-700 text-sm rounded-full font-medium"
								>
									{{ area }}
								</span>
							</div>

							<h3 class="font-semibold text-gray-900 mb-4">
								Why Connect
							</h3>
							<p class="text-gray-600 mb-6">
								{{ data.whyRecommended }}
							</p>
						</div>

						<div class="flex gap-4 pt-6 border-t border-gray-200/50">
							<button
								class="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
								:disabled="!data.isAcceptingStudents"
								:class="{ 'opacity-50 cursor-not-allowed': !data.isAcceptingStudents }"
								@click="$emit('connect-professor', data)"
							>
								{{ data.isAcceptingStudents ? 'Connect' : 'Not Accepting Students' }}
							</button>
						</div>
					</div>
				</div>
			</Transition>
		</div>
	</Transition>
</template>

<script setup lang="ts">
interface Props {
	show: boolean;
	type: 'club' | 'event' | 'professor';
	data: any;
}

defineProps<Props>();
defineEmits(['close', 'get-involved', 'rsvp-event', 'connect-professor']);

const formatEventDate = (date: Date | string) => {
	const eventDate = new Date(date);
	return eventDate.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};
</script>