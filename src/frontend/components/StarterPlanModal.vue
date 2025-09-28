<template>
	<Transition
		enter-active-class="modal-backdrop-enter-active"
		enter-from-class="modal-backdrop-enter-from"
		enter-to-class="modal-backdrop-enter-to"
		leave-active-class="modal-backdrop-leave-active"
		leave-from-class="modal-backdrop-leave-from"
		leave-to-class="modal-backdrop-leave-to"
	>
		<div
			v-if="isVisible"
			class="fixed inset-0 bg-gradient-to-br from-indigo-900/60 via-purple-900/60 to-pink-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
			@click.self="closeModal"
		>
			<Transition
				enter-active-class="modal-content-enter-active"
				enter-from-class="modal-content-enter-from"
				enter-to-class="modal-content-enter-to"
				leave-active-class="modal-content-leave-active"
				leave-from-class="modal-content-leave-from"
				leave-to-class="modal-content-leave-to"
			>
				<div
					v-if="isVisible"
					class="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-white/20"
				>
					<!-- Header -->
					<div class="relative px-8 py-8 text-center">
						<button
							class="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors rounded-full p-2 hover:bg-gray-100/50"
							@click="closeModal"
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

						<!-- Welcome Animation -->
						<div class="mb-6">
							<div class="hero-logo w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
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
							<h1 class="hero-title text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
								Welcome to OppTrack!
							</h1>
							<p class="hero-subtitle text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
								Your personal campus involvement companion that helps you discover, track, and balance meaningful opportunities while building an impressive resume.
							</p>
						</div>
					</div>

					<!-- Main Content -->
					<div class="px-8 pb-8">
						<!-- Key Benefits Cards -->
						<div class="mb-8">
							<h2 class="section-title text-2xl font-semibold text-gray-900 text-center mb-8">
								How OppTrack transforms your college experience
							</h2>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
								<!-- Track Everything -->
								<div
									class="benefit-card group bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
									style="animation-delay: 0.1s"
								>
									<div class="flex items-center mb-4">
										<div class="bg-blue-600 rounded-xl p-3 mr-4 group-hover:scale-110 transition-transform duration-300">
											<svg
												class="w-6 h-6 text-white"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
												/>
											</svg>
										</div>
										<h3 class="text-xl font-semibold text-gray-900">
											Track Everything
										</h3>
									</div>
									<p class="text-gray-600 leading-relaxed">
										Never miss important events, deadlines, or opportunities. Keep all your commitments organized in one beautiful, easy-to-use dashboard.
									</p>
								</div>

								<!-- Resume Building -->
								<Transition
									name="benefit-card"
									appear
								>
									<div
										class="benefit-card group bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
										style="animation-delay: 0.2s"
									>
										<div class="flex items-center mb-4">
											<div class="bg-green-600 rounded-xl p-3 mr-4 group-hover:scale-110 transition-transform duration-300">
												<svg
													class="w-6 h-6 text-white"
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
											<h3 class="text-xl font-semibold text-gray-900">
												Resume Building
											</h3>
										</div>
										<p class="text-gray-600 leading-relaxed">
											Discover personalized opportunities that align with your career goals and interests. Build impressive experience that makes you stand out.
										</p>
									</div>
								</Transition>

								<!-- Balance Management -->
								<Transition
									name="benefit-card"
									appear
								>
									<div
										class="benefit-card group bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
										style="animation-delay: 0.3s"
									>
										<div class="flex items-center mb-4">
											<div class="bg-purple-600 rounded-xl p-3 mr-4 group-hover:scale-110 transition-transform duration-300">
												<svg
													class="w-6 h-6 text-white"
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
											<h3 class="text-xl font-semibold text-gray-900">
												Balance Management
											</h3>
										</div>
										<p class="text-gray-600 leading-relaxed">
											Avoid overcommitment with smart recommendations and time management tools. Find the perfect balance between academics and involvement.
										</p>
									</div>
								</Transition>

								<!-- Connect & Grow -->
								<Transition
									name="benefit-card"
									appear
								>
									<div
										class="benefit-card group bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
										style="animation-delay: 0.4s"
									>
										<div class="flex items-center mb-4">
											<div class="bg-orange-600 rounded-xl p-3 mr-4 group-hover:scale-110 transition-transform duration-300">
												<svg
													class="w-6 h-6 text-white"
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
											<h3 class="text-xl font-semibold text-gray-900">
												Connect & Grow
											</h3>
										</div>
										<p class="text-gray-600 leading-relaxed">
											Build meaningful connections with peers, professors, and professionals. Grow your network through activities that truly matter to you.
										</p>
									</div>
								</Transition>
							</div>
						</div>

						<!-- Call to Action -->
						<div class="text-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-200">
							<h3 class="text-2xl font-semibold text-gray-900 mb-4">
								Ready to get started?
							</h3>
							<p class="text-gray-600 mb-6 max-w-2xl mx-auto">
								Take our quick dashboard tour to see how OppTrack can help you make the most of your college experience, or dive right in and start exploring!
							</p>

							<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
								<button
									class="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center"
									@click="startTour"
								>
									<svg
										class="w-5 h-5 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293L12 11l.707-.707A1 1 0 0113.414 10H15M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									Take the Tour
								</button>

								<button
									class="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-xl font-semibold text-lg hover:border-gray-400 transition-all duration-300 flex items-center"
									@click="skipTour"
								>
									<svg
										class="w-5 h-5 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									Start Exploring
								</button>
							</div>
						</div>
					</div>
				</div>
			</Transition>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import type { Plan } from '~/types';

interface Props {
	isVisible: boolean;
	plan: Plan;
	currentCommitments?: number;
}

interface Emits {
	'close': [];
	'start-tour': [];
	'skip-tour': [];
}

const props = withDefaults(defineProps<Props>(), {
	currentCommitments: 0,
});

const emit = defineEmits<Emits>();

const commitmentProgress = computed(() => {
	return Math.min((props.currentCommitments / props.plan.commitmentLimit) * 100, 100);
});

const closeModal = () => {
	emit('close');
};

const startTour = () => {
	emit('start-tour');
	closeModal();
};

const skipTour = () => {
	emit('skip-tour');
	closeModal();
};

// Close modal on escape key
onMounted(() => {
	const handleEscape = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && props.isVisible) {
			closeModal();
		}
	};

	document.addEventListener('keydown', handleEscape);

	onUnmounted(() => {
		document.removeEventListener('keydown', handleEscape);
	});
});
</script>

<style scoped>
/* Modal Entrance Animation */
.modal-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.32, 0, 0.67, 0);
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

/* Benefit Cards Animation */
.benefit-card-enter-active {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.benefit-card-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

/* Staggered animation delays */
.benefit-card:nth-child(1) {
  animation-delay: 0.1s;
}

.benefit-card:nth-child(2) {
  animation-delay: 0.2s;
}

.benefit-card:nth-child(3) {
  animation-delay: 0.3s;
}

.benefit-card:nth-child(4) {
  animation-delay: 0.4s;
}
</style>