/**
 * API Data Transformers
 * Converts backend database schemas to frontend-compatible formats
 */

import type { IEvent } from '../database/schemas/Event';
import type { IOrganization } from '../database/schemas/Organization';
import type { Event, Club, Category } from '../../../frontend/types/auth';

/**
 * Transform database event to frontend Event format
 */
export function transformEventForAPI(dbEvent: IEvent): Event {
	return {
		id: dbEvent.id.toString(),
		name: dbEvent.name,
		description: dbEvent.description,
		location: dbEvent.location || '',
		startTime: dbEvent.startTime,
		endTime: dbEvent.endTime,
		url: dbEvent.url,
		organizer: dbEvent.organization?.toString(),
		latitude: dbEvent.latitude,
		longitude: dbEvent.longitude,
		categories: transformTagsToCategories(dbEvent.tags),
		tags: dbEvent.tags.map(tag => tag.tagId.toString()),
		isBookmarked: false, // TODO: Check against user bookmarks
		attendeeCount: 0, // TODO: Implement attendance tracking
		isVirtual: false, // TODO: Detect from location/description
		isFree: true, // TODO: Implement pricing
	};
}

/**
 * Transform database organization to frontend Club format
 */
export function transformOrganizationForAPI(dbOrg: IOrganization): Club {
	return {
		id: dbOrg.id.toString(),
		name: dbOrg.name,
		shortName: dbOrg.shortName,
		description: dbOrg.description,
		shortDescription: dbOrg.description.substring(0, 150) + (dbOrg.description.length > 150 ? '...' : ''),
		url: dbOrg.url,
		logoUrl: dbOrg.logoUrl,
		categories: transformTagsToCategories(dbOrg.tags),
		tags: dbOrg.tags.map(tag => tag.tagId.toString()),
		memberCount: Math.floor(Math.random() * 200) + 20, // TODO: Implement actual member count
		isFollowing: false, // TODO: Check against user following list
		upcomingEvents: [], // TODO: Load related events
	};
}

/**
 * Transform weighted tags to simple categories
 */
function transformTagsToCategories(tags: { tagId: number; weight: number; category: string }[]): Category[] {
	return tags
		.filter(tag => tag.category === 'primary' && tag.weight > 0.5)
		.slice(0, 3) // Limit to top 3 categories
		.map(tag => ({
			id: tag.tagId.toString(),
			name: `Category ${tag.tagId}`, // TODO: Load actual tag names
		}));
}