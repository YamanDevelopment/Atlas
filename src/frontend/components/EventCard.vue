<template>
	<div
		class="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 p-6"
		:class="[size === 'large' ? 'w-96' : 'w-80', { 'cursor-pointer': clickable }]"
	>
		<!-- Header -->
		<div class="flex items-start justify-between mb-4">
			<div class="flex-1">
				<h3 class="font-semibold text-gray-900 mb-2">
					{{ event.title }}
				</h3>
				<p class="text-gray-600 text-sm mb-3">
					{{ event.shortDescription }}
				</p>
				<p class="text-indigo-600 text-xs mb-3">
					{{ event.whyRecommended }}
				</p>
			</div>
		</div>

		<!-- Event Details -->
		<div class="space-y-2 text-sm text-gray-500 mb-4">
			<div class="flex items-center">
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
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				{{ formatDate(event.date) }}
			</div>
			<div class="flex items-center">
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
						d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
					/>
				</svg>
				{{ event.location }}
			</div>
			<div class="flex items-center space-x-4">
				<span
					v-if="event.isFree"
					class="text-green-600 font-medium"
				>Free</span>
				<span>👥 {{ event.attendeeCount }} going</span>
			</div>
		</div>

		<!-- Tags -->
		<div
			v-if="event.tags"
			class="flex flex-wrap gap-1 mb-4"
		>
			<span
				v-for="tag in event.tags.slice(0, 3)"
				:key="tag"
				class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
			>
				{{ tag }}
			</span>
		</div>

		<!-- Actions -->
		<div class="flex gap-2">
			<button
				class="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
				:class="{ 'bg-green-600': event.rsvpStatus === 'going' }"
				@click="$emit('rsvp', event, 'going')"
			>
				{{ event.rsvpStatus === 'going' ? 'Going ✓' : 'RSVP' }}
			</button>
			<button
				class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-indigo-300 transition-colors"
				:class="{ 'border-indigo-600 text-indigo-600': event.rsvpStatus === 'interested' }"
				@click="$emit('rsvp', event, 'interested')"
			>
				{{ event.rsvpStatus === 'interested' ? 'Interested ✓' : 'Interested' }}
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Event, RSVPStatus } from '../types';

interface Props {
	event: Event;
	size?: 'normal' | 'large';
	clickable?: boolean;
}

withDefaults(defineProps<Props>(), {
	size: 'normal',
	clickable: false,
});

defineEmits<{
	rsvp: [event: Event, status: RSVPStatus];
}>();

const formatDate = (date: Date) => {
	return new Intl.DateTimeFormat('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	}).format(new Date(date));
};
</script>