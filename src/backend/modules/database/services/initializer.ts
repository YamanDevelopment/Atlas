import { Tag } from '../schemas/Tag';
import { Interest } from '../schemas/Interest';
import { COMPREHENSIVE_INTERESTS, COMPREHENSIVE_TAGS } from './defaults';

export interface InitializationResult {
	tagsCreated: number;
	interestsCreated: number;
	alreadyInitialized: boolean;
	errors: string[];
}

export class DatabaseInitializer {
	/**
	 * Check if the database has been initialized with default data
	 */
	async isInitialized(): Promise<boolean> {
		try {
			const tagCount = await Tag.countDocuments();
			const interestCount = await Interest.countDocuments();

			// Consider initialized if we have at least some tags and interests
			return tagCount > 0 && interestCount > 0;
		} catch (error) {
			console.error('Error checking initialization status:', error);
			return false;
		}
	}

	/**
	 * Initialize the database with default tags and interests
	 */
	async initialize(): Promise<InitializationResult> {
		const result: InitializationResult = {
			tagsCreated: 0,
			interestsCreated: 0,
			alreadyInitialized: false,
			errors: [],
		};

		try {
			// Check if already initialized
			if (await this.isInitialized()) {
				result.alreadyInitialized = true;
				console.log('Database already initialized with default data');
				return result;
			}

			console.log('Initializing database with default data...');

			// Initialize tags
			result.tagsCreated = await this.initializeTags();

			// Initialize interests
			result.interestsCreated = await this.initializeInterests();

			console.log(`Database initialization complete: ${result.tagsCreated} tags, ${result.interestsCreated} interests created`);

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			result.errors.push(errorMessage);
			console.error('Database initialization failed:', error);
		}

		return result;
	}

	/**
	 * Initialize hierarchical tags with proper parent-child relationships
	 */
	private async initializeTags(): Promise<number> {
		let createdCount = 0;
		const tagIdMap = new Map<string, number>(); // Map tag names to their IDs

		try {
			// First pass: Create all primary tags
			const primaryTags = COMPREHENSIVE_TAGS.filter(tag => tag.category === 'primary');
			for (let i = 0; i < primaryTags.length; i++) {
				const tagData = primaryTags[i];
				const tagId = i + 1;

				// Check if tag already exists
				const existingTag = await Tag.findOne({ name: tagData.name });
				if (existingTag) {
					console.log(`Primary tag "${tagData.name}" already exists, skipping`);
					tagIdMap.set(tagData.name, existingTag.id);
					continue;
				}

				// Create new primary tag
				await Tag.create({
					id: tagId,
					name: tagData.name,
					category: tagData.category,
					parentTag: undefined, // Primary tags have no parent
					parentId: null,
					popularity: 0,
				});

				tagIdMap.set(tagData.name, tagId);
				createdCount++;
				console.log(`Created primary tag: ${tagData.name} (ID: ${tagId})`);
			}

			// Second pass: Create secondary tags with parent references
			const secondaryTags = COMPREHENSIVE_TAGS.filter(tag => tag.category === 'secondary');
			let secondaryTagId = primaryTags.length + 1;

			for (const tagData of secondaryTags) {
				// Check if tag already exists
				const existingTag = await Tag.findOne({ name: tagData.name });
				if (existingTag) {
					console.log(`Secondary tag "${tagData.name}" already exists, skipping`);
					tagIdMap.set(tagData.name, existingTag.id);
					continue;
				}

				// Find parent tag ID
				const parentTagId = tagData.parentTag ? tagIdMap.get(tagData.parentTag) : null;
				if (tagData.parentTag && !parentTagId) {
					console.error(`Parent tag "${tagData.parentTag}" not found for secondary tag "${tagData.name}"`);
					continue;
				}

				// Create new secondary tag
				await Tag.create({
					id: secondaryTagId,
					name: tagData.name,
					category: tagData.category,
					parentTag: tagData.parentTag,
					parentId: parentTagId,
					popularity: 0,
				});

				tagIdMap.set(tagData.name, secondaryTagId);
				createdCount++;
				console.log(`Created secondary tag: ${tagData.name} (ID: ${secondaryTagId}, Parent: ${tagData.parentTag})`);
				secondaryTagId++;
			}

			console.log(`Created ${createdCount} hierarchical tags (${primaryTags.length} primary, ${secondaryTags.length} secondary)`);

		} catch (error) {
			console.error('Error creating hierarchical tags:', error);
			throw error;
		}

		return createdCount;
	}

	/**
	 * Initialize default interests from the defaults.ts file
	 */
	private async initializeInterests(): Promise<number> {
		let createdCount = 0;

		for (let i = 0; i < COMPREHENSIVE_INTERESTS.length; i++) {
			const interestData = COMPREHENSIVE_INTERESTS[i];

			try {
				// Check if interest already exists
				const existingInterest = await Interest.findOne({ keyword: interestData.keyword });
				if (existingInterest) {
					console.log(`Interest "${interestData.keyword}" already exists, skipping`);
					continue;
				}

				// Find related tags by name matching and create linkedTags structure
				const linkedTags: { tagId: number; confidence: number }[] = [];
				for (const tagName of interestData.relatedTags) {
					const tag = await Tag.findOne({ name: tagName });
					if (tag) {
						linkedTags.push({
							tagId: tag.id, // Use the sequential ID instead of ObjectId
							confidence: 0.8, // Default confidence for pre-defined relationships
						});
					}
				}

				// Create new interest
				await Interest.create({
					id: i + 1, // Sequential ID starting from 1
					keyword: interestData.keyword,
					linkedTags: linkedTags,
					isUserGenerated: false, // These are system-generated defaults
				});

				createdCount++;
				console.log(`Created interest: ${interestData.keyword} with ${linkedTags.length} linked tags`);

			} catch (error) {
				console.error(`Error creating interest "${interestData.keyword}":`, error);
				throw error;
			}
		}

		return createdCount;
	}

	/**
	 * Force reinitialize - clears existing data and recreates defaults
	 * WARNING: This will delete all existing tags and interests!
	 */
	async forceReinitialize(): Promise<InitializationResult> {
		console.log('Force reinitializing database - clearing existing data...');

		try {
			// Clear existing data
			await Tag.deleteMany({});
			await Interest.deleteMany({});
			console.log('Cleared existing tags and interests');

			// Reinitialize
			return await this.initialize();
		} catch (error) {
			console.error('Force reinitialization failed:', error);
			throw error;
		}
	}

	/**
	 * Add missing defaults without clearing existing data
	 */
	async addMissingDefaults(): Promise<InitializationResult> {
		console.log('Adding missing default data...');

		const result: InitializationResult = {
			tagsCreated: 0,
			interestsCreated: 0,
			alreadyInitialized: false,
			errors: [],
		};

		try {
			// Always try to add missing tags and interests
			result.tagsCreated = await this.initializeTags();
			result.interestsCreated = await this.initializeInterests();

			console.log(`Added missing defaults: ${result.tagsCreated} tags, ${result.interestsCreated} interests`);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			result.errors.push(errorMessage);
			console.error('Adding missing defaults failed:', error);
		}

		return result;
	}

	/**
	 * Get initialization statistics
	 */
	async getStats(): Promise<{
		totalTags: number;
		totalInterests: number;
		primaryTags: number;
		secondaryTags: number;
	}> {
		const [totalTags, totalInterests, primaryTags, secondaryTags] = await Promise.all([
			Tag.countDocuments(),
			Interest.countDocuments(),
			Tag.countDocuments({ category: 'primary' }),
			Tag.countDocuments({ category: 'secondary' }),
		]);

		return {
			totalTags,
			totalInterests,
			primaryTags,
			secondaryTags,
		};
	}
}

export default DatabaseInitializer;