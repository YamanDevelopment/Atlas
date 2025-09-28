import mongoose from 'mongoose';

import type { IUser } from '../schemas/User';
import { User } from '../schemas/User';
import type { ITag } from '../schemas/Tag';
import { Tag } from '../schemas/Tag';
import type { IInterest } from '../schemas/Interest';
import { Interest } from '../schemas/Interest';
import type { IOrganization } from '../schemas/Organization';
import { Organization } from '../schemas/Organization';
import type { IEvent } from '../schemas/Event';
import { Event } from '../schemas/Event';
import type { ILab } from '../schemas/Lab';
import { Lab } from '../schemas/Lab';
import type {
	EventRecommendation,
	OrganizationRecommendation,
	LabRecommendation,
	RecommendationOptions,
	RecommendationMetrics } from './recommendations';
import {
	RecommendationService,
} from './recommendations';

interface DatabaseStats {
	users: number;
	tags: number;
	interests: number;
	organizations: number;
	events: number;
	labs: number;
	uptime: number;
}

interface SearchOptions {
	limit?: number;
	skip?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

class Handler {
	private connectionStartTime: Date;
	private isConnected: boolean = false;
	private recommendationService: RecommendationService;

	constructor(dbUri: string, dbName?: string) {
		this.connectionStartTime = new Date();
		this.recommendationService = new RecommendationService();
		this.loadDatabase(dbUri, dbName);
	}

	/**
	 * DATABASE CONNECTION MANAGEMENT
	 * Handles MongoDB connection, reconnection, and connection monitoring
	 */
	private async loadDatabase(dbUri: string, dbName?: string): Promise<void> {
		try {
			// Configure mongoose for better connection handling
			mongoose.set('strictQuery', false);

			// Connect with separate URI and dbName (like the CLI script)
			const connectionOptions: any = {
				serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
				heartbeatFrequencyMS: 2000, // Check connection every 2s
			};

			if (dbName) {
				connectionOptions.dbName = dbName;
			}

			await mongoose.connect(dbUri, connectionOptions);

			this.isConnected = true;
			console.log('✅ Connected to MongoDB successfully');

			// Set up connection event listeners
			mongoose.connection.on('error', (error) => {
				console.error('❌ MongoDB connection error:', error);
				this.isConnected = false;
			});

			mongoose.connection.on('disconnected', () => {
				console.warn('⚠️  MongoDB disconnected');
				this.isConnected = false;
			});

			mongoose.connection.on('reconnected', () => {
				console.log('🔄 MongoDB reconnected');
				this.isConnected = true;
			});

		} catch (error) {
			this.isConnected = false;
			console.error('❌ Error connecting to MongoDB:', error);
			throw error;
		}
	}

	private async closeDatabase(): Promise<void> {
		try {
			await mongoose.disconnect();
			this.isConnected = false;
			console.log('🔌 Disconnected from MongoDB');
		} catch (error) {
			console.error('❌ Error disconnecting from MongoDB:', error);
			throw error;
		}
	}

	/**
	 * USER MANAGEMENT METHODS
	 * Complete CRUD operations for user management
	 */
	async createUser(userData: Partial<IUser>): Promise<IUser> {
		try {
			const user = new User(userData);
			return await user.save();
		} catch (error) {
			console.error('Error creating user:', error);
			throw error;
		}
	}

	async getUserById(id: string): Promise<IUser | null> {
		try {
			return await User.findById(id).populate('interests').populate('savedEvents').populate('savedOrganizations');
		} catch (error) {
			console.error('Error fetching user:', error);
			throw error;
		}
	}

	async getUserByEmail(email: string): Promise<IUser | null> {
		try {
			return await User.findOne({ email }).populate('interests');
		} catch (error) {
			console.error('Error fetching user by email:', error);
			throw error;
		}
	}

	async updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null> {
		try {
			return await User.findByIdAndUpdate(id, updates, { new: true }).populate('interests');
		} catch (error) {
			console.error('Error updating user:', error);
			throw error;
		}
	}

	async deleteUser(id: string): Promise<boolean> {
		try {
			const result = await User.findByIdAndDelete(id);
			return !!result;
		} catch (error) {
			console.error('Error deleting user:', error);
			throw error;
		}
	}

	/**
	 * TAG MANAGEMENT METHODS
	 * Handle hierarchical tag system with parent-child relationships
	 */
	async createTag(tagData: Partial<ITag>): Promise<ITag> {
		try {
			const tag = new Tag(tagData);
			return await tag.save();
		} catch (error) {
			console.error('Error creating tag:', error);
			throw error;
		}
	}

	async getTagById(id: string): Promise<ITag | null> {
		try {
			return await Tag.findById(id).populate('parentTag');
		} catch (error) {
			console.error('Error fetching tag:', error);
			throw error;
		}
	}

	async getTagByName(name: string): Promise<ITag | null> {
		try {
			return await Tag.findOne({ name: name.toLowerCase() }).populate('parentTag');
		} catch (error) {
			console.error('Error fetching tag by name:', error);
			throw error;
		}
	}

	async getPrimaryTags(): Promise<ITag[]> {
		try {
			return await Tag.find({ category: 'primary' }).sort({ popularity: -1 });
		} catch (error) {
			console.error('Error fetching primary tags:', error);
			throw error;
		}
	}

	async getSecondaryTags(parentTagId?: string): Promise<ITag[]> {
		try {
			const query = parentTagId ? { category: 'secondary', parentTag: parentTagId } : { category: 'secondary' };
			return await Tag.find(query).populate('parentTag').sort({ popularity: -1 });
		} catch (error) {
			console.error('Error fetching secondary tags:', error);
			throw error;
		}
	}

	async incrementTagPopularity(tagId: string): Promise<void> {
		try {
			await Tag.findByIdAndUpdate(tagId, { $inc: { popularity: 1 } });
		} catch (error) {
			console.error('Error incrementing tag popularity:', error);
			throw error;
		}
	}

	/**
	 * INTEREST MANAGEMENT METHODS
	 * Handle user interests with category and synonym support
	 */
	async createInterest(interestData: Partial<IInterest>): Promise<IInterest> {
		try {
			const interest = new Interest(interestData);
			return await interest.save();
		} catch (error) {
			console.error('Error creating interest:', error);
			throw error;
		}
	}

	async getInterestById(id: string): Promise<IInterest | null> {
		try {
			return await Interest.findById(id).populate('linkedTags.tagId');
		} catch (error) {
			console.error('Error fetching interest:', error);
			throw error;
		}
	}

	async searchInterestsByKeyword(keyword: string): Promise<IInterest[]> {
		try {
			return await Interest.find({
				keyword: { $regex: keyword, $options: 'i' },
			}).populate('linkedTags.tagId');
		} catch (error) {
			console.error('Error searching interests:', error);
			throw error;
		}
	}

	/**
	 * EVENT MANAGEMENT METHODS
	 * Complete event CRUD with search and filtering capabilities
	 */
	async createEvent(eventData: Partial<IEvent>): Promise<IEvent> {
		try {
			const event = new Event(eventData);
			return await event.save();
		} catch (error) {
			console.error('Error creating event:', error);
			throw error;
		}
	}

	async getEventById(id: string): Promise<IEvent | null> {
		try {
			return await Event.findById(id).populate('tags').populate('organization');
		} catch (error) {
			console.error('Error fetching event:', error);
			throw error;
		}
	}

	async searchEvents(query: string, options: SearchOptions = {}): Promise<IEvent[]> {
		try {
			const { limit = 20, skip = 0, sortBy = 'startDate', sortOrder = 'asc' } = options;

			return await Event.find({
				$or: [
					{ title: { $regex: query, $options: 'i' } },
					{ description: { $regex: query, $options: 'i' } },
					{ 'location.address': { $regex: query, $options: 'i' } },
				],
			})
				.populate('tags')
				.populate('organization')
				.sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
				.limit(limit)
				.skip(skip);
		} catch (error) {
			console.error('Error searching events:', error);
			throw error;
		}
	}

	async getEventsByDateRange(startDate: Date, endDate: Date): Promise<IEvent[]> {
		try {
			return await Event.find({
				startDate: { $gte: startDate, $lte: endDate },
			}).populate('tags').populate('organization').sort({ startDate: 1 });
		} catch (error) {
			console.error('Error fetching events by date range:', error);
			throw error;
		}
	}

	async getEventsByTags(tagIds: string[]): Promise<IEvent[]> {
		try {
			return await Event.find({
				tags: { $in: tagIds },
			}).populate('tags').populate('organization');
		} catch (error) {
			console.error('Error fetching events by tags:', error);
			throw error;
		}
	}

	/**
	 * ORGANIZATION MANAGEMENT METHODS
	 * Organization CRUD with search and category filtering
	 */
	async createOrganization(orgData: Partial<IOrganization>): Promise<IOrganization> {
		try {
			const organization = new Organization(orgData);
			return await organization.save();
		} catch (error) {
			console.error('Error creating organization:', error);
			throw error;
		}
	}

	async getOrganizationById(id: string): Promise<IOrganization | null> {
		try {
			return await Organization.findById(id).populate('tags');
		} catch (error) {
			console.error('Error fetching organization:', error);
			throw error;
		}
	}

	async searchOrganizations(query: string, options: SearchOptions = {}): Promise<IOrganization[]> {
		try {
			const { limit = 20, skip = 0, sortBy = 'name', sortOrder = 'asc' } = options;

			return await Organization.find({
				$or: [
					{ name: { $regex: query, $options: 'i' } },
					{ description: { $regex: query, $options: 'i' } },
					{ category: { $regex: query, $options: 'i' } },
				],
			})
				.populate('tags')
				.sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
				.limit(limit)
				.skip(skip);
		} catch (error) {
			console.error('Error searching organizations:', error);
			throw error;
		}
	}

	async getOrganizationsByCategory(category: string): Promise<IOrganization[]> {
		try {
			return await Organization.find({ category }).populate('tags').sort({ name: 1 });
		} catch (error) {
			console.error('Error fetching organizations by category:', error);
			throw error;
		}
	}

	/**
	 * LAB MANAGEMENT METHODS
	 * Research lab management with supervisor and research area tracking
	 */
	async createLab(labData: Partial<ILab>): Promise<ILab> {
		try {
			const lab = new Lab(labData);
			return await lab.save();
		} catch (error) {
			console.error('Error creating lab:', error);
			throw error;
		}
	}

	async getLabById(id: string): Promise<ILab | null> {
		try {
			return await Lab.findById(id).populate('tags');
		} catch (error) {
			console.error('Error fetching lab:', error);
			throw error;
		}
	}

	async searchLabs(query: string, options: SearchOptions = {}): Promise<ILab[]> {
		try {
			const { limit = 20, skip = 0, sortBy = 'name', sortOrder = 'asc' } = options;

			return await Lab.find({
				$or: [
					{ name: { $regex: query, $options: 'i' } },
					{ description: { $regex: query, $options: 'i' } },
					{ researchAreas: { $in: [new RegExp(query, 'i')] } },
					{ supervisor: { $regex: query, $options: 'i' } },
				],
			})
				.populate('tags')
				.sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
				.limit(limit)
				.skip(skip);
		} catch (error) {
			console.error('Error searching labs:', error);
			throw error;
		}
	}

	async getLabsByResearchArea(researchArea: string): Promise<ILab[]> {
		try {
			return await Lab.find({ researchAreas: { $in: [researchArea] } }).populate('tags').sort({ name: 1 });
		} catch (error) {
			console.error('Error fetching labs by research area:', error);
			throw error;
		}
	}

	/**
	 * BULK OPERATIONS
	 * Efficient bulk insert/update operations for data scraping with duplicate handling
	 */
	async clearAndCreateEvents(events: Partial<IEvent>[]): Promise<IEvent[]> {
		try {
			console.log('🧹 Clearing existing events...');
			await Event.deleteMany({});

			console.log(`🔄 Bulk creating ${events.length} fresh events...`);

			// Log first event sample for debugging
			if (events.length > 0) {
				console.log('📋 Sample event data:', JSON.stringify(events[0], null, 2));
			}

			const result = await Event.insertMany(events, {
				ordered: false,
			}) as IEvent[];

			console.log(`✅ Successfully inserted ${result.length} events`);
			return result;
		} catch (error: any) {
			console.error('❌ Error clearing and creating events:', error.message);
			console.error('❌ Full error:', error);

			// Check if it's a validation error
			if (error.name === 'ValidationError') {
				console.error('📋 Validation errors:', error.errors);
			}

			throw error;
		}
	}

	async clearAndCreateOrganizations(organizations: Partial<IOrganization>[]): Promise<IOrganization[]> {
		try {
			console.log('🧹 Clearing existing organizations...');
			await Organization.deleteMany({});

			console.log(`🔄 Bulk creating ${organizations.length} fresh organizations...`);

			// Log first org sample for debugging
			if (organizations.length > 0) {
				console.log('📋 Sample organization data:', JSON.stringify(organizations[0], null, 2));
			}

			const result = await Organization.insertMany(organizations, {
				ordered: false,
			}) as IOrganization[];

			console.log(`✅ Successfully inserted ${result.length} organizations`);
			return result;
		} catch (error: any) {
			console.error('❌ Error clearing and creating organizations:', error.message);
			console.error('❌ Full error:', error);

			if (error.name === 'ValidationError') {
				console.error('📋 Validation errors:', error.errors);
			}

			throw error;
		}
	}

	async bulkCreateEvents(events: Partial<IEvent>[]): Promise<IEvent[]> {
		try {
			console.log(`🔄 Bulk creating ${events.length} events...`);

			const result = await Event.insertMany(events, {
				ordered: false,
			});

			console.log(`✅ Successfully inserted ${result.length} events`);
			return result;

		} catch (error: any) {
			console.error('❌ Error bulk creating events:', error.message);

			// Handle duplicate key errors (11000) - some documents may still be inserted
			if (error.code === 11000 || error.name === 'BulkWriteError') {
				console.log('⚠️ Bulk insert partially successful - some duplicates skipped');

				// Get the successfully inserted documents count
				const insertedCount = error.result?.insertedCount || 0;
				console.log(`✅ ${insertedCount} events inserted despite duplicates`);

				// Query recently created events to return them
				if (insertedCount > 0) {
					const recentEvents = await Event.find().sort({ createdAt: -1 }).limit(insertedCount);
					return recentEvents;
				}

				return [];
			}

			throw error;
		}
	}

	async bulkCreateOrganizations(organizations: Partial<IOrganization>[]): Promise<IOrganization[]> {
		try {
			console.log(`🔄 Bulk creating ${organizations.length} organizations...`);

			const result = await Organization.insertMany(organizations, {
				ordered: false,
			});

			console.log(`✅ Successfully inserted ${result.length} organizations`);
			return result;

		} catch (error: any) {
			console.error('❌ Error bulk creating organizations:', error.message);

			if (error.code === 11000 || error.name === 'BulkWriteError') {
				console.log('⚠️ Bulk insert partially successful - some duplicates skipped');

				const insertedCount = error.result?.insertedCount || 0;
				console.log(`✅ ${insertedCount} organizations inserted despite duplicates`);

				if (insertedCount > 0) {
					const recentOrgs = await Organization.find().sort({ createdAt: -1 }).limit(insertedCount);
					return recentOrgs;
				}

				return [];
			}

			throw error;
		}
	}

	async bulkCreateLabs(labs: Partial<ILab>[]): Promise<ILab[]> {
		try {
			console.log(`🔄 Bulk creating ${labs.length} labs...`);

			const result = await Lab.insertMany(labs, {
				ordered: false,
			});

			console.log(`✅ Successfully inserted ${result.length} labs`);
			return result;

		} catch (error: any) {
			console.error('❌ Error bulk creating labs:', error.message);

			if (error.code === 11000 || error.name === 'BulkWriteError') {
				console.log('⚠️ Bulk insert partially successful - some duplicates skipped');

				const insertedCount = error.result?.insertedCount || 0;
				console.log(`✅ ${insertedCount} labs inserted despite duplicates`);

				if (insertedCount > 0) {
					const recentLabs = await Lab.find().sort({ createdAt: -1 }).limit(insertedCount);
					return recentLabs;
				}

				return [];
			}

			throw error;
		}
	}

	/**
	 * COMPREHENSIVE RECOMMENDATION SYSTEM
	 * Advanced AI-powered recommendations using multiple algorithms
	 */

	/**
	 * Get comprehensive event recommendations with detailed scoring and explanations
	 */
	async getEventRecommendationsWithDetails(
		userId: string,
		options: RecommendationOptions = {},
	): Promise<{
		recommendations: EventRecommendation[];
		metrics: RecommendationMetrics;
	}> {
		try {
			console.log(`🎯 Getting detailed event recommendations for user ${userId}`);
			return await this.recommendationService.getEventRecommendations(userId, options);
		} catch (error) {
			console.error('Error getting detailed event recommendations:', error);
			throw error;
		}
	}

	/**
	 * Get comprehensive organization recommendations with detailed scoring
	 */
	async getOrganizationRecommendationsWithDetails(
		userId: string,
		options: RecommendationOptions = {},
	): Promise<{
		recommendations: OrganizationRecommendation[];
		metrics: RecommendationMetrics;
	}> {
		try {
			console.log(`🏛️ Getting detailed organization recommendations for user ${userId}`);
			return await this.recommendationService.getOrganizationRecommendations(userId, options);
		} catch (error) {
			console.error('Error getting detailed organization recommendations:', error);
			throw error;
		}
	}

	/**
	 * Get comprehensive lab recommendations with detailed scoring
	 */
	async getLabRecommendationsWithDetails(
		userId: string,
		options: RecommendationOptions = {},
	): Promise<{
		recommendations: LabRecommendation[];
		metrics: RecommendationMetrics;
	}> {
		try {
			console.log(`🔬 Getting detailed lab recommendations for user ${userId}`);
			return await this.recommendationService.getLabRecommendations(userId, options);
		} catch (error) {
			console.error('Error getting detailed lab recommendations:', error);
			throw error;
		}
	}

	/**
	 * Get all recommendations for a user (events, organizations, labs) in one call
	 */
	async getComprehensiveRecommendations(
		userId: string,
		options: RecommendationOptions & {
			includeEvents?: boolean;
			includeOrganizations?: boolean;
			includeLabs?: boolean;
		} = {},
	): Promise<{
		events?: { recommendations: EventRecommendation[]; metrics: RecommendationMetrics };
		organizations?: { recommendations: OrganizationRecommendation[]; metrics: RecommendationMetrics };
		labs?: { recommendations: LabRecommendation[]; metrics: RecommendationMetrics };
		overallMetrics: {
			totalProcessingTimeMs: number;
			totalRecommendations: number;
		};
	}> {
		const startTime = Date.now();
		const {
			includeEvents = true,
			includeOrganizations = true,
			includeLabs = true,
			...recOptions
		} = options;

		console.log(`🌟 Getting comprehensive recommendations for user ${userId}`);

		const results: any = {};
		let totalRecommendations = 0;

		// Get event recommendations
		if (includeEvents) {
			results.events = await this.getEventRecommendationsWithDetails(userId, recOptions);
			totalRecommendations += results.events.recommendations.length;
		}

		// Get organization recommendations
		if (includeOrganizations) {
			results.organizations = await this.getOrganizationRecommendationsWithDetails(userId, recOptions);
			totalRecommendations += results.organizations.recommendations.length;
		}

		// Get lab recommendations
		if (includeLabs) {
			results.labs = await this.getLabRecommendationsWithDetails(userId, recOptions);
			totalRecommendations += results.labs.recommendations.length;
		}

		results.overallMetrics = {
			totalProcessingTimeMs: Date.now() - startTime,
			totalRecommendations,
		};

		console.log(`✅ Generated ${totalRecommendations} total recommendations in ${results.overallMetrics.totalProcessingTimeMs}ms`);

		return results;
	}

	/**
	 * LEGACY RECOMMENDATION SYSTEM HELPERS
	 * Simple methods to support existing API (kept for backwards compatibility)
	 */
	async getRecommendedEvents(userId: string, limit: number = 10): Promise<IEvent[]> {
		try {
			const user = await User.findById(userId).populate<{ interests: IInterest[] }>('interests');
			if (!user) return [];

			// Get user's interest-linked tag IDs
			const userTagIds = user.interests?.flatMap((interest) =>
				interest.linkedTags.map(linkedTag => linkedTag.tagId),
			) || [];

			// Find events with matching tags
			return await Event.find({
				tags: { $in: userTagIds },
				startDate: { $gte: new Date() }, // Only future events
			})
				.populate('tags')
				.populate('organization')
				.sort({ startDate: 1 })
				.limit(limit);
		} catch (error) {
			console.error('Error getting recommended events:', error);
			throw error;
		}
	}

	async getRecommendedOrganizations(userId: string, limit: number = 10): Promise<IOrganization[]> {
		try {
			const user = await User.findById(userId).populate<{ interests: IInterest[] }>('interests');
			if (!user) return [];

			const userTagIds = user.interests?.flatMap((interest) =>
				interest.linkedTags.map(linkedTag => linkedTag.tagId),
			) || [];

			return await Organization.find({
				tags: { $in: userTagIds },
			})
				.populate('tags')
				.sort({ memberCount: -1 }) // Prioritize popular organizations
				.limit(limit);
		} catch (error) {
			console.error('Error getting recommended organizations:', error);
			throw error;
		}
	}

	/**
	 * HIERARCHICAL AI-POWERED RECOMMENDATIONS
	 * Advanced weighted tag matching with two-phase algorithm
	 */
	async getWeightedEventRecommendations(userId: string, limit: number = 10): Promise<IEvent[]> {
		try {
			const user = await User.findById(userId).populate<{ interests: IInterest[] }>('interests');
			if (!user || !user.interests?.length) return [];

			// Extract user interest tags with weights
			const userInterestTags = user.interests.flatMap(interest =>
				interest.linkedTags.map(linkedTag => ({
					tagId: linkedTag.tagId,
					weight: linkedTag.weight,
				})),
			);

			// Phase 1: Find primary tags with high user interest (>= 0.7)
			const primaryTagIds = userInterestTags
				.filter(userTag => userTag.weight >= 0.7)
				.map(userTag => userTag.tagId);

			if (primaryTagIds.length === 0) return [];

			// Phase 2: Build hierarchical matching query
			const matchQuery = {
				$and: [
					{ startDate: { $gte: new Date() } }, // Only future events
					{
						$or: [
							// High-weight primary tag matches
							{
								'tags.tagId': { $in: primaryTagIds },
								'tags.category': 'primary',
								'tags.weight': { $gte: 0.7 },
							},
							// Secondary tag matches for relevant primary categories
							{
								'tags.parentTagId': { $in: primaryTagIds },
								'tags.category': 'secondary',
								'tags.weight': { $gte: 0.6 },
							},
						],
					},
				],
			};

			return await Event.find(matchQuery)
				.populate('tags')
				.populate('organization')
				.sort({
					'tags.weight': -1, // Prioritize higher AI confidence
					startDate: 1,
				})
				.limit(limit);
		} catch (error) {
			console.error('Error getting weighted event recommendations:', error);
			throw error;
		}
	}

	async getWeightedOrganizationRecommendations(userId: string, limit: number = 10): Promise<IOrganization[]> {
		try {
			const user = await User.findById(userId).populate<{ interests: IInterest[] }>('interests');
			if (!user || !user.interests?.length) return [];

			const userInterestTags = user.interests.flatMap(interest =>
				interest.linkedTags.map(linkedTag => ({
					tagId: linkedTag.tagId,
					weight: linkedTag.weight,
				})),
			);

			const primaryTagIds = userInterestTags
				.filter(userTag => userTag.weight >= 0.7)
				.map(userTag => userTag.tagId);

			if (primaryTagIds.length === 0) return [];

			const matchQuery = {
				$or: [
					{
						'tags.tagId': { $in: primaryTagIds },
						'tags.category': 'primary',
						'tags.weight': { $gte: 0.7 },
					},
					{
						'tags.parentTagId': { $in: primaryTagIds },
						'tags.category': 'secondary',
						'tags.weight': { $gte: 0.6 },
					},
				],
			};

			return await Organization.find(matchQuery)
				.populate('tags')
				.sort({
					'tags.weight': -1,
					memberCount: -1,
				})
				.limit(limit);
		} catch (error) {
			console.error('Error getting weighted organization recommendations:', error);
			throw error;
		}
	}

	async getWeightedLabRecommendations(userId: string, limit: number = 10): Promise<ILab[]> {
		try {
			const user = await User.findById(userId).populate<{ interests: IInterest[] }>('interests');
			if (!user || !user.interests?.length) return [];

			const userInterestTags = user.interests.flatMap(interest =>
				interest.linkedTags.map(linkedTag => ({
					tagId: linkedTag.tagId,
					weight: linkedTag.weight,
				})),
			);

			const primaryTagIds = userInterestTags
				.filter(userTag => userTag.weight >= 0.7)
				.map(userTag => userTag.tagId);

			if (primaryTagIds.length === 0) return [];

			const matchQuery = {
				$and: [
					{ acceptingStudents: true }, // Only labs accepting students
					{
						$or: [
							{
								'tags.tagId': { $in: primaryTagIds },
								'tags.category': 'primary',
								'tags.weight': { $gte: 0.7 },
							},
							{
								'tags.parentTagId': { $in: primaryTagIds },
								'tags.category': 'secondary',
								'tags.weight': { $gte: 0.6 },
							},
						],
					},
				],
			};

			return await Lab.find(matchQuery)
				.populate('tags')
				.sort({
					'tags.weight': -1,
					updatedAt: -1,
				})
				.limit(limit);
		} catch (error) {
			console.error('Error getting weighted lab recommendations:', error);
			throw error;
		}
	}

	/**
	 * AI CONTENT ANALYSIS SUPPORT
	 * Methods to support AI-powered content categorization
	 */
	async findContentNeedingAnalysis(contentType: 'events' | 'organizations' | 'labs', limit: number = 50) {
		try {
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - 7); // Analyze content older than 7 days

			const baseQuery = {
				$or: [
					{ aiProcessing: { $exists: false } }, // Never analyzed
					{ 'aiProcessing.lastAnalyzed': { $lt: cutoffDate } }, // Stale analysis
				],
			};

			switch (contentType) {
				case 'events':
					return await Event.find(baseQuery)
						.limit(limit)
						.sort({ createdAt: -1 });
				case 'organizations':
					return await Organization.find(baseQuery)
						.limit(limit)
						.sort({ createdAt: -1 });
				case 'labs':
					return await Lab.find(baseQuery)
						.limit(limit)
						.sort({ createdAt: -1 });
				default:
					throw new Error(`Unsupported content type: ${contentType}`);
			}
		} catch (error) {
			console.error(`Error finding ${contentType} needing analysis:`, error);
			throw error;
		}
	}

	async updateContentWithAITags(
		contentType: 'events' | 'organizations' | 'labs',
		contentId: string,
		tags: { tagId: number; weight: number; category: 'primary' | 'secondary'; parentTagId?: number }[],
		modelUsed: string,
	): Promise<boolean> {
		try {
			const updateData = {
				tags,
				aiProcessing: {
					lastAnalyzed: new Date(),
					geminiModel: modelUsed,
				},
			};

			let result;
			switch (contentType) {
				case 'events':
					result = await Event.findByIdAndUpdate(contentId, updateData, { new: true });
					break;
				case 'organizations':
					result = await Organization.findByIdAndUpdate(contentId, updateData, { new: true });
					break;
				case 'labs':
					result = await Lab.findByIdAndUpdate(contentId, updateData, { new: true });
					break;
				default:
					throw new Error(`Unsupported content type: ${contentType}`);
			}

			return !!result;
		} catch (error) {
			console.error(`Error updating ${contentType} with AI tags:`, error);
			throw error;
		}
	}

	/**
	 * HIERARCHICAL TAG QUERIES
	 * Support for parent-child tag relationships
	 */
	async getHierarchicalTagStats(): Promise<{ primary: number; secondary: number; totalRelations: number }> {
		try {
			const [primaryCount, secondaryCount] = await Promise.all([
				Tag.countDocuments({ parentId: null }),
				Tag.countDocuments({ parentId: { $ne: null } }),
			]);

			const totalRelations = await Tag.countDocuments({ parentId: { $ne: null } });

			return {
				primary: primaryCount,
				secondary: secondaryCount,
				totalRelations,
			};
		} catch (error) {
			console.error('Error getting hierarchical tag stats:', error);
			throw error;
		}
	}

	async getTagWithChildren(tagId: number): Promise<{ parent: ITag; children: ITag[] } | null> {
		try {
			const [parent, children] = await Promise.all([
				Tag.findOne({ id: tagId }),
				Tag.find({ parentId: tagId }),
			]);

			if (!parent) return null;

			return { parent, children };
		} catch (error) {
			console.error('Error getting tag with children:', error);
			throw error;
		}
	}

	/**
	 * DATABASE MAINTENANCE AND UTILITIES
	 * Administrative functions for database management
	 */
	async getDatabaseStats(): Promise<DatabaseStats> {
		try {
			const [users, tags, interests, organizations, events, labs] = await Promise.all([
				User.countDocuments(),
				Tag.countDocuments(),
				Interest.countDocuments(),
				Organization.countDocuments(),
				Event.countDocuments(),
				Lab.countDocuments(),
			]);

			return {
				users,
				tags,
				interests,
				organizations,
				events,
				labs,
				uptime: Date.now() - this.connectionStartTime.getTime(),
			};
		} catch (error) {
			console.error('Error getting database stats:', error);
			throw error;
		}
	}

	async clearDatabase(): Promise<void> {
		try {
			await Promise.all([
				User.deleteMany({}),
				Tag.deleteMany({}),
				Interest.deleteMany({}),
				Organization.deleteMany({}),
				Event.deleteMany({}),
				Lab.deleteMany({}),
			]);
			console.log('🧹 Database cleared successfully');
		} catch (error) {
			console.error('❌ Error clearing database:', error);
			throw error;
		}
	}

	async ensureIndexes(): Promise<void> {
		try {
			await Promise.all([
				User.ensureIndexes(),
				Tag.ensureIndexes(),
				Interest.ensureIndexes(),
				Organization.ensureIndexes(),
				Event.ensureIndexes(),
				Lab.ensureIndexes(),
			]);
			console.log('📊 Database indexes ensured');
		} catch (error) {
			console.error('❌ Error ensuring indexes:', error);
			throw error;
		}
	}

	/**
	 * CONNECTION STATUS AND CLEANUP
	 */
	public isConnectionHealthy(): boolean {
		return this.isConnected && mongoose.connection.readyState === 1;
	}

	public async close(): Promise<void> {
		await this.closeDatabase();
	}

	public getConnectionUptime(): number {
		return Date.now() - this.connectionStartTime.getTime();
	}
}

export default Handler;