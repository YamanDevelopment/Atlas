<template>
	<div
		v-if="isActive"
		class="fixed inset-0 z-50"
	>
		<!-- Overlay with holes -->
		<div class="absolute inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-50">
			<!-- Spotlight hole -->
			<div
				v-if="currentStep"
				class="absolute rounded-lg transition-all duration-300"
				:style="spotlightStyle"
			/>
		</div>

		<!-- Tour tooltip -->
		<div
			v-if="currentStep"
			class="absolute bg-white rounded-lg shadow-xl p-6 max-w-sm z-60 transition-all duration-300"
			:style="tooltipStyle"
		>
			<div class="flex items-start justify-between mb-4">
				<h3 class="text-lg font-semibold text-gray-900">
					{{ currentStep.title }}
				</h3>
				<button
					class="text-gray-400 hover:text-gray-600"
					@click="endTour"
				>
					<svg
						class="w-5 h-5"
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

			<p class="text-gray-600 mb-6">
				{{ currentStep.description }}
			</p>

			<div class="flex items-center justify-between">
				<div class="flex space-x-2">
					<span
						v-for="(step, index) in tourSteps"
						:key="index"
						class="w-2 h-2 rounded-full transition-colors"
						:class="index === currentStepIndex ? 'bg-indigo-600' : 'bg-gray-300'"
					/>
				</div>

				<div class="flex gap-3">
					<button
						v-if="currentStepIndex > 0"
						class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
						@click="previousStep"
					>
						Back
					</button>
					<button
						class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
						@click="nextStep"
					>
						{{ currentStepIndex === tourSteps.length - 1 ? 'Finish' : 'Next' }}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
interface TourStep {
	id: string;
	title: string;
	description: string;
	target: string; // CSS selector
	position: 'top' | 'bottom' | 'left' | 'right';
}

interface Props {
	steps: TourStep[];
	isActive: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	'tour-complete': [];
	'tour-ended': [];
}>();

const currentStepIndex = ref(0);
const spotlightStyle = ref({});
const tooltipStyle = ref({});

const tourSteps = computed(() => props.steps);
const currentStep = computed(() => tourSteps.value[currentStepIndex.value]);

const updatePositions = () => {
	if (!currentStep.value) return;

	const targetElement = document.querySelector(currentStep.value.target);
	if (!targetElement) return;

	const rect = targetElement.getBoundingClientRect();
	const padding = 8;

	// Create spotlight hole
	spotlightStyle.value = {
		left: `${rect.left - padding}px`,
		top: `${rect.top - padding}px`,
		width: `${rect.width + padding * 2}px`,
		height: `${rect.height + padding * 2}px`,
		boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
		pointerEvents: 'none',
	};

	// Position tooltip
	const tooltipOffset = 16;
	let tooltipLeft = rect.left;
	let tooltipTop = rect.bottom + tooltipOffset;

	switch (currentStep.value.position) {
	case 'top':
		tooltipTop = rect.top - 200 - tooltipOffset;
		break;
	case 'bottom':
		tooltipTop = rect.bottom + tooltipOffset;
		break;
	case 'left':
		tooltipLeft = rect.left - 350 - tooltipOffset;
		tooltipTop = rect.top;
		break;
	case 'right':
		tooltipLeft = rect.right + tooltipOffset;
		tooltipTop = rect.top;
		break;
	}

	// Keep tooltip on screen
	tooltipLeft = Math.max(16, Math.min(tooltipLeft, window.innerWidth - 350 - 16));
	tooltipTop = Math.max(16, Math.min(tooltipTop, window.innerHeight - 200 - 16));

	tooltipStyle.value = {
		left: `${tooltipLeft}px`,
		top: `${tooltipTop}px`,
	};
};

const nextStep = () => {
	if (currentStepIndex.value < tourSteps.value.length - 1) {
		currentStepIndex.value++;
		nextTick(() => updatePositions());
	} else {
		emit('tour-complete');
	}
};

const previousStep = () => {
	if (currentStepIndex.value > 0) {
		currentStepIndex.value--;
		nextTick(() => updatePositions());
	}
};

const endTour = () => {
	emit('tour-ended');
};

// Update positions when step changes or window resizes
watch(() => props.isActive, (active) => {
	if (active) {
		nextTick(() => updatePositions());
		window.addEventListener('resize', updatePositions);
	} else {
		window.removeEventListener('resize', updatePositions);
	}
});

watch(currentStepIndex, () => {
	nextTick(() => updatePositions());
});

onMounted(() => {
	if (props.isActive) {
		nextTick(() => updatePositions());
	}
});

onUnmounted(() => {
	window.removeEventListener('resize', updatePositions);
});
</script>