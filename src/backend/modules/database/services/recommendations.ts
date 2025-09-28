/**
 * Atlas Comprehensive Recommendation System
 *
 * A complete recommendation service that provides intelligent suggestions for events,
 * organizations, and labs based on user interests using existing schemas.
 *
 * Features:
 * - Content-based filtering using tag similarities
 * - Collaborative filtering framework
 * - Hybrid recommendation algorithms
 * - Detailed scoring with confidence levels
 * - Performance metrics and explanations
 */

import { User } from '../schemas/User';
import { Interest } from '../schemas/Interest';
import { Event } from '../schemas/Event';
import { Organization } from '../schemas/Organization';
import { Lab } from '../schemas/Lab';
import { Tag } from '../schemas/Tag';

// ========================================
// TYPES AND INTERFACES
// ========================================

export interface RecommendationScore {
	score: number; // 0-1, overall recommendation strength
	confidence: number; // 0-1, confidence in this recommendation
	reasons: string[]; // Explanation of why this item is recommended
}

export interface EventRecommendation {
	event: any; // IEvent from existing schema
	score: RecommendationScore;
	matchedInterests: string[]; // Keywords of matched user interests
	matchedTags: number[]; // Tag IDs that contributed to the match
}

export interface OrganizationRecommendation {
	organization: any; // IOrganization from existing schema
	score: RecommendationScore;
	matchedInterests: string[]; // Keywords of matched user interests
	matchedTags: number[]; // Tag IDs that contributed to the match
}

export interface LabRecommendation {
	lab: any; // ILab from existing schema
	score: RecommendationScore;
	matchedInterests: string[]; // Keywords of matched user interests
	matchedTags: number[]; // Tag IDs that contributed to the match
}

export interface RecommendationOptions {
	algorithm?: 'content-based' | 'collaborative' | 'hybrid';
	limit?: number;
	minScore?: number; // Minimum score threshold (0-1)
	includeReasons?: boolean;
	timeRange?: {
		start?: Date;
		end?: Date;
	};
	categories?: string[]; // Filter by specific categories
}

export interface UserProfile {
	userId: string;
	interests: {
		keyword: string;
		linkedTags: {
			tagId: number;
			weight: number;
		}[];
	}[];
	interactionHistory?: {
		viewedEvents: string[];
		joinedOrganizations: string[];
		visitedLabs: string[];
	};
}

export interface SimilarUser {
	userId: string;
	similarityScore: number;
	commonInterests: string[];
}

export interface RecommendationMetrics {
	totalRecommendations: number;
	averageScore: number;
	algorithmsUsed: string[];
	processingTimeMs: number;
	coverageScore: number; // How well recommendations cover user's interests
}

// ========================================
// MAIN RECOMMENDATION SERVICE
// ========================================

/**
 * Comprehensive Recommendation Service
 * Uses existing schemas to provide intelligent recommendations based on user interests
 */
export class RecommendationService {
	/**
	 * Get event recommendations for a user
	 */
	async getEventRecommendations(
		userId: string,
		options: RecommendationOptions = {},
	): Promise<{
		recommendations: EventRecommendation[];
		metrics: RecommendationMetrics;
	}> {
		const startTime = Date.now();
		const {
			algorithm = 'hybrid',
			limit = 10,
			minScore = 0.1,
			includeReasons = true,
			timeRange,
		} = options;

		console.log(`🎯 Generating event recommendations for user ${userId} using ${algorithm} algorithm`);

		// Get user profile
		const userProfile = await this.getUserProfile(userId);
		if (!userProfile || userProfile.interests.length === 0) {
			console.warn(`No interests found for user ${userId}`);
			return {
				recommendations: [],
				metrics: this.createEmptyMetrics(Date.now() - startTime),
			};
		}

		let recommendations: EventRecommendation[] = [];
		const algorithmsUsed: string[] = [];

		// Content-based filtering
		if (algorithm === 'content-based' || algorithm === 'hybrid') {
			const contentRecs = await this.getContentBasedEventRecommendations(userProfile, timeRange);
			recommendations = this.mergeRecommendations(recommendations, contentRecs);
			algorithmsUsed.push('content-based');
		}

		// Collaborative filtering
		if (algorithm === 'collaborative' || algorithm === 'hybrid') {
			const collaborativeRecs = await this.getCollaborativeEventRecommendations(userProfile);
			recommendations = this.mergeRecommendations(recommendations, collaborativeRecs);
			algorithmsUsed.push('collaborative');
		}

		// Apply hybrid scoring if using hybrid algorithm
		if (algorithm === 'hybrid') {
			recommendations = this.applyHybridScoring(recommendations);
		}

		// Filter and sort
		recommendations = recommendations
			.filter(rec => rec.score.score >= minScore)
			.sort((a, b) => b.score.score - a.score.score)
			.slice(0, limit);

		// Add detailed reasons if requested
		if (includeReasons && recommendations.length > 0) {
			recommendations = await this.enrichWithReasons(recommendations, userProfile);
		}

		const metrics: RecommendationMetrics = {
			totalRecommendations: recommendations.length,
			averageScore: recommendations.length > 0
				? recommendations.reduce((sum, rec) => sum + rec.score.score, 0) / recommendations.length
				: 0,
			algorithmsUsed,
			processingTimeMs: Date.now() - startTime,
			coverageScore: this.calculateCoverageScore(recommendations, userProfile),
		};

		console.log(`✅ Generated ${recommendations.length} event recommendations in ${metrics.processingTimeMs}ms`);
		return { recommendations, metrics };
	}

	/**
	 * Get organization recommendations for a user
	 */
	async getOrganizationRecommendations(
		userId: string,
		options: RecommendationOptions = {},
	): Promise<{
		recommendations: OrganizationRecommendation[];
		metrics: RecommendationMetrics;
	}> {
		const startTime = Date.now();
		const { limit = 10, minScore = 0.1 } = options;

		console.log(`🏛️ Generating organization recommendations for user ${userId}`);

		const userProfile = await this.getUserProfile(userId);
		if (!userProfile || userProfile.interests.length === 0) {
			return {
				recommendations: [],
				metrics: this.createEmptyMetrics(Date.now() - startTime),
			};
		}

		// Get user's tag preferences
		const userTagWeights = this.extractUserTagWeights(userProfile);

		// Find organizations with matching tags
		const organizations = await Organization.find({
			'tags.tagId': { $in: Object.keys(userTagWeights).map(Number) },
		}).lean();

		const recommendations: OrganizationRecommendation[] = [];

		for (const org of organizations) {
			const score = this.calculateOrganizationScore(org, userTagWeights);

			if (score.score >= minScore) {
				const matchedTags = org.tags
					?.filter((tag: any) => userTagWeights[tag.tagId])
					.map((tag: any) => tag.tagId) || [];

				const matchedInterests = this.findMatchedInterests(matchedTags, userProfile);

				recommendations.push({
					organization: org,
					score,
					matchedTags,
					matchedInterests,
				});
			}
		}

		// Sort and limit
		const sortedRecs = recommendations
			.sort((a, b) => b.score.score - a.score.score)
			.slice(0, limit);

		const metrics: RecommendationMetrics = {
			totalRecommendations: sortedRecs.length,
			averageScore: sortedRecs.length > 0
				? sortedRecs.reduce((sum, rec) => sum + rec.score.score, 0) / sortedRecs.length
				: 0,
			algorithmsUsed: ['content-based'],
			processingTimeMs: Date.now() - startTime,
			coverageScore: this.calculateCoverageScore(sortedRecs, userProfile),
		};

		console.log(`✅ Generated ${sortedRecs.length} organization recommendations in ${metrics.processingTimeMs}ms`);
		return { recommendations: sortedRecs, metrics };
	}

	/**
	 * Get lab recommendations for a user
	 */
	async getLabRecommendations(
		userId: string,
		options: RecommendationOptions = {},
	): Promise<{
		recommendations: LabRecommendation[];
		metrics: RecommendationMetrics;
	}> {
		const startTime = Date.now();
		const { limit = 10, minScore = 0.1 } = options;

		console.log(`🔬 Generating lab recommendations for user ${userId}`);

		const userProfile = await this.getUserProfile(userId);
		if (!userProfile || userProfile.interests.length === 0) {
			return {
				recommendations: [],
				metrics: this.createEmptyMetrics(Date.now() - startTime),
			};
		}

		const userTagWeights = this.extractUserTagWeights(userProfile);

		const labs = await Lab.find({
			'tags.tagId': { $in: Object.keys(userTagWeights).map(Number) },
		}).lean();

		const recommendations: LabRecommendation[] = [];

		for (const lab of labs) {
			const score = this.calculateLabScore(lab, userTagWeights);

			if (score.score >= minScore) {
				const matchedTags = lab.tags
					?.filter((tag: any) => userTagWeights[tag.tagId])
					.map((tag: any) => tag.tagId) || [];

				const matchedInterests = this.findMatchedInterests(matchedTags, userProfile);

				recommendations.push({
					lab,
					score,
					matchedTags,
					matchedInterests,
				});
			}
		}

		const sortedRecs = recommendations
			.sort((a, b) => b.score.score - a.score.score)
			.slice(0, limit);

		const metrics: RecommendationMetrics = {
			totalRecommendations: sortedRecs.length,
			averageScore: sortedRecs.length > 0
				? sortedRecs.reduce((sum, rec) => sum + rec.score.score, 0) / sortedRecs.length
				: 0,
			algorithmsUsed: ['content-based'],
			processingTimeMs: Date.now() - startTime,
			coverageScore: this.calculateCoverageScore(sortedRecs, userProfile),
		};

		console.log(`✅ Generated ${sortedRecs.length} lab recommendations in ${metrics.processingTimeMs}ms`);
		return { recommendations: sortedRecs, metrics };
	}

	// ========================================
	// PRIVATE HELPER METHODS
	// ========================================

	/**
	 * Get comprehensive user profile from existing schemas
	 */
	private async getUserProfile(userId: string): Promise<UserProfile | null> {
		try {
			const user = await User.findById(userId).populate('interests').lean();
			if (!user) return null;

			const interests = await Interest.find({
				id: { $in: user.interests },
			}).lean();

			return {
				userId,
				interests: interests.map(interest => ({
					keyword: interest.keyword,
					linkedTags: interest.linkedTags,
				})),
			};
		} catch (error) {
			console.error(`Error getting user profile for ${userId}:`, error);
			return null;
		}
	}

	/**
	 * Extract user's tag preferences with weights
	 */
	private extractUserTagWeights(userProfile: UserProfile): Record<number, number> {
		const tagWeights: Record<number, number> = {};

		for (const interest of userProfile.interests) {
			for (const linkedTag of interest.linkedTags) {
				// Aggregate weights for tags that appear in multiple interests
				if (tagWeights[linkedTag.tagId]) {
					tagWeights[linkedTag.tagId] = Math.max(tagWeights[linkedTag.tagId], linkedTag.weight);
				} else {
					tagWeights[linkedTag.tagId] = linkedTag.weight;
				}
			}
		}

		return tagWeights;
	}

	/**
	 * Content-based event recommendations
	 */
	private async getContentBasedEventRecommendations(
		userProfile: UserProfile,
		timeRange?: { start?: Date; end?: Date },
	): Promise<EventRecommendation[]> {
		const userTagWeights = this.extractUserTagWeights(userProfile);

		// Build query
		const query: any = {
			'tags.tagId': { $in: Object.keys(userTagWeights).map(Number) },
		};

		// Add time filtering
		if (timeRange?.start) {
			query.startTime = { $gte: timeRange.start };
		} else {
			query.startTime = { $gte: new Date() }; // Default to future events
		}

		if (timeRange?.end) {
			query.endTime = { $lte: timeRange.end };
		}

		const events = await Event.find(query).lean();
		const recommendations: EventRecommendation[] = [];

		for (const event of events) {
			const score = this.calculateEventScore(event, userTagWeights);

			const matchedTags = event.tags
				?.filter((tag: any) => userTagWeights[tag.tagId])
				.map((tag: any) => tag.tagId) || [];

			const matchedInterests = this.findMatchedInterests(matchedTags, userProfile);

			recommendations.push({
				event,
				score,
				matchedTags,
				matchedInterests,
			});
		}

		return recommendations;
	}

	/**
	 * Collaborative filtering event recommendations (placeholder implementation)
	 */
	private async getCollaborativeEventRecommendations(
		userProfile: UserProfile,
	): Promise<EventRecommendation[]> {
		// Find users with similar interests
		const similarUsers = await this.findSimilarUsers(userProfile.userId);

		if (similarUsers.length === 0) {
			return []; // No similar users found
		}

		// Get events that similar users might be interested in
		// This is a simplified approach - in production you might track actual user interactions
		const recommendations: EventRecommendation[] = [];

		// For now, return empty as a placeholder for collaborative filtering
		// In a real implementation, you'd track user interactions and preferences
		return recommendations;
	}

	/**
	 * Find users with similar interests (placeholder implementation)
	 */
	private async findSimilarUsers(userId: string): Promise<SimilarUser[]> {
		// This would require tracking user interactions or calculating interest similarity
		// For now, return empty array as placeholder
		return [];
	}

	/**
	 * Calculate recommendation score for an event
	 */
	private calculateEventScore(
		event: any,
		userTagWeights: Record<number, number>,
	): RecommendationScore {
		let totalScore = 0;
		let matchedTags = 0;
		let confidence = 0;

		// Calculate tag-based score
		if (event.tags && event.tags.length > 0) {
			for (const eventTag of event.tags) {
				const userWeight = userTagWeights[eventTag.tagId];
				if (userWeight !== undefined) {
					// Score based on both user interest weight and event tag weight
					const tagScore = (userWeight + eventTag.weight) / 2;
					totalScore += tagScore;
					matchedTags++;
				}
			}

			if (matchedTags > 0) {
				totalScore = totalScore / event.tags.length; // Normalize by total tags
				confidence = matchedTags / event.tags.length; // Confidence based on coverage
			}
		}

		// Apply recency boost for near-future events
		if (event.startTime) {
			const daysFromNow = (new Date(event.startTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
			if (daysFromNow >= 0 && daysFromNow <= 30) {
				const recencyBoost = Math.max(0.1, 1 - (daysFromNow / 30) * 0.3);
				totalScore *= recencyBoost;
			}
		}

		return {
			score: Math.max(0, Math.min(1, totalScore)),
			confidence: Math.max(0, Math.min(1, confidence)),
			reasons: [], // Will be filled by enrichWithReasons if requested
		};
	}

	/**
	 * Calculate recommendation score for an organization
	 */
	private calculateOrganizationScore(
		org: any,
		userTagWeights: Record<number, number>,
	): RecommendationScore {
		let totalScore = 0;
		let matchedTags = 0;

		if (org.tags && org.tags.length > 0) {
			for (const orgTag of org.tags) {
				const userWeight = userTagWeights[orgTag.tagId];
				if (userWeight !== undefined) {
					const tagScore = (userWeight + orgTag.weight) / 2;
					totalScore += tagScore;
					matchedTags++;
				}
			}

			if (matchedTags > 0) {
				totalScore = totalScore / org.tags.length;
			}
		}

		const confidence = matchedTags > 0 ? matchedTags / (org.tags?.length || 1) : 0;

		return {
			score: Math.max(0, Math.min(1, totalScore)),
			confidence: Math.max(0, Math.min(1, confidence)),
			reasons: [],
		};
	}

	/**
	 * Calculate recommendation score for a lab
	 */
	private calculateLabScore(
		lab: any,
		userTagWeights: Record<number, number>,
	): RecommendationScore {
		let totalScore = 0;
		let matchedTags = 0;

		if (lab.tags && lab.tags.length > 0) {
			for (const labTag of lab.tags) {
				const userWeight = userTagWeights[labTag.tagId];
				if (userWeight !== undefined) {
					const tagScore = (userWeight + labTag.weight) / 2;
					totalScore += tagScore;
					matchedTags++;
				}
			}

			if (matchedTags > 0) {
				totalScore = totalScore / lab.tags.length;
			}
		}

		const confidence = matchedTags > 0 ? matchedTags / (lab.tags?.length || 1) : 0;

		return {
			score: Math.max(0, Math.min(1, totalScore)),
			confidence: Math.max(0, Math.min(1, confidence)),
			reasons: [],
		};
	}

	/**
	 * Find which user interests match the given tags
	 */
	private findMatchedInterests(matchedTagIds: number[], userProfile: UserProfile): string[] {
		const matchedInterests: string[] = [];

		for (const interest of userProfile.interests) {
			const hasMatchingTag = interest.linkedTags.some(tag =>
				matchedTagIds.includes(tag.tagId),
			);

			if (hasMatchingTag) {
				matchedInterests.push(interest.keyword);
			}
		}

		return [...new Set(matchedInterests)]; // Remove duplicates
	}

	/**
	 * Merge recommendation arrays and handle duplicates
	 */
	private mergeRecommendations<T extends { event?: any; organization?: any; lab?: any; score: RecommendationScore }>(
		existingRecs: T[],
		newRecs: T[],
	): T[] {
		const merged = [...existingRecs];

		for (const newRec of newRecs) {
			const existingIndex = merged.findIndex(rec => {
				if (newRec.event && rec.event) return newRec.event.id === rec.event.id;
				if (newRec.organization && rec.organization) return newRec.organization.id === rec.organization.id;
				if (newRec.lab && rec.lab) return newRec.lab.id === rec.lab.id;
				return false;
			});

			if (existingIndex >= 0) {
				// Average the scores for duplicates
				const existingRec = merged[existingIndex];
				existingRec.score.score = (existingRec.score.score + newRec.score.score) / 2;
				existingRec.score.confidence = Math.max(existingRec.score.confidence, newRec.score.confidence);
			} else {
				merged.push(newRec);
			}
		}

		return merged;
	}

	/**
	 * Apply hybrid scoring adjustments
	 */
	private applyHybridScoring<T extends { score: RecommendationScore }>(recommendations: T[]): T[] {
		// Apply small bonus for items recommended by multiple algorithms
		return recommendations.map(rec => ({
			...rec,
			score: {
				...rec.score,
				score: Math.min(1, rec.score.score * 1.1), // 10% bonus for hybrid
				confidence: Math.min(1, rec.score.confidence * 1.05), // 5% confidence boost
			},
		}));
	}

	/**
	 * Add detailed reasoning to recommendations
	 */
	private async enrichWithReasons<T extends { score: RecommendationScore; matchedInterests: string[]; matchedTags: number[] }>(
		recommendations: T[],
		userProfile: UserProfile,
	): Promise<T[]> {
		// Get tag names for better explanations
		const allTagIds = [...new Set(recommendations.flatMap(rec => rec.matchedTags))];
		const tags = await Tag.find({ id: { $in: allTagIds } }).lean();
		const tagMap = new Map(tags.map(tag => [tag.id, tag.name]));

		return recommendations.map(rec => {
			const reasons: string[] = [];

			if (rec.matchedInterests.length > 0) {
				reasons.push(`Matches your interests: ${rec.matchedInterests.slice(0, 3).join(', ')}`);
			}

			if (rec.matchedTags.length > 0) {
				const tagNames = rec.matchedTags
					.slice(0, 3)
					.map(tagId => tagMap.get(tagId) || `Tag ${tagId}`)
					.join(', ');
				reasons.push(`Related to: ${tagNames}`);
			}

			if (rec.score.confidence > 0.8) {
				reasons.push('High confidence match');
			} else if (rec.score.confidence > 0.5) {
				reasons.push('Good match based on your profile');
			}

			return {
				...rec,
				score: {
					...rec.score,
					reasons,
				},
			};
		});
	}

	/**
	 * Calculate coverage score (how well recommendations cover user's interests)
	 */
	private calculateCoverageScore<T extends { matchedInterests: string[] }>(
		recommendations: T[],
		userProfile: UserProfile,
	): number {
		if (userProfile.interests.length === 0) return 0;

		const coveredInterests = new Set();
		for (const rec of recommendations) {
			rec.matchedInterests.forEach(interest => coveredInterests.add(interest));
		}

		return coveredInterests.size / userProfile.interests.length;
	}

	/**
	 * Create empty metrics for error cases
	 */
	private createEmptyMetrics(processingTime: number): RecommendationMetrics {
		return {
			totalRecommendations: 0,
			averageScore: 0,
			algorithmsUsed: [],
			processingTimeMs: processingTime,
			coverageScore: 0,
		};
	}
}