#!/usr/bin/env tsx

/**
 * Complete Data Pipeline Script
 *
 * This script orchestrates the entire data flow:
 * 1. Scrapes UCF data (events, organizations, labs)
 * 2. Analyzes content with AI for hierarchical tagging
 * 3. Stores processed data in MongoDB
 *
 * Usage: npm run pipeline [mode]
 * Modes: fast, standard, comprehensive
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import type { CombinedData, StandardEvent, StandardOrganization } from '../modules/scraper/ucfData';
import { UCFDataScraper } from '../modules/scraper/ucfData';
import { configurations } from '../modules/scraper/fetchData';
import { GeminiService } from '../modules/ai/gemini';
import Handler from '../modules/database/services/handler';
import { DatabaseInitializer } from '../modules/database/services/initializer';
import appConfig from '../../config';

// Load environment variables from project root
config({ path: resolve(process.cwd(), '.env') });

interface ProcessingStats {
	scraped: {
		events: number;
		organizations: number;
		categories: number;
	};
	aiProcessed: {
		events: number;
		organizations: number;
		failed: number;
	};
	stored: {
		events: number;
		organizations: number;
		tags: number;
		failed: number;
	};
	timing: {
		scraping: number;
		aiAnalysis: number;
		storage: number;
		total: number;
	};
}

class DataPipelineManager {
	private scraper: UCFDataScraper;
	private geminiService: GeminiService;
	private dbHandler: Handler;
	private dbInitializer: DatabaseInitializer;
	private stats: ProcessingStats;

	constructor(configMode: keyof typeof configurations = 'standard') {
		this.scraper = new UCFDataScraper(configurations[configMode]);
		this.geminiService = new GeminiService();

		const dbUrl = appConfig.database.mongodb.uri + '/' + appConfig.database.mongodb.dbName;
		this.dbHandler = new Handler(dbUrl);
		this.dbInitializer = new DatabaseInitializer();

		this.stats = {
			scraped: { events: 0, organizations: 0, categories: 0 },
			aiProcessed: { events: 0, organizations: 0, failed: 0 },
			stored: { events: 0, organizations: 0, tags: 0, failed: 0 },
			timing: { scraping: 0, aiAnalysis: 0, storage: 0, total: 0 },
		};
	}

	/**
	 * Main pipeline execution
	 */
	async runPipeline(): Promise<void> {
		console.log('🚀 Starting Complete Data Pipeline');
		console.log('═'.repeat(50));

		const pipelineStart = Date.now();

		try {
			// Step 1: Initialize database
			await this.initializeDatabase();

			// Step 2: Scrape data
			const scrapedData = await this.scrapeData();

			// Step 3: Process with AI
			const processedData = await this.processWithAI(scrapedData);

			// Step 4: Store in database
			await this.storeInDatabase(processedData);

			// Step 5: Final statistics
			this.stats.timing.total = Date.now() - pipelineStart;
			this.displayFinalStats();

			console.log('\n✅ Pipeline completed successfully!');

		} catch (error) {
			console.error('\n❌ Pipeline failed:', error);
			throw error;
		} finally {
			// Clean up database connection
			await this.cleanup();
		}
	}

	/**
	 * Initialize database with default tags and interests
	 */
	private async initializeDatabase(): Promise<void> {
		console.log('\n📋 Step 1: Database Initialization');
		console.log('-'.repeat(30));

		// Wait for connection
		await new Promise(resolve => setTimeout(resolve, 2000));

		if (!this.dbHandler.isConnectionHealthy()) {
			throw new Error('Database connection failed');
		}

		console.log('✅ Database connected');

		// Initialize with default data
		const result = await this.dbInitializer.initialize();

		if (result.alreadyInitialized) {
			console.log('✅ Database already initialized');
		} else {
			console.log(`✅ Created ${result.tagsCreated} tags, ${result.interestsCreated} interests`);
		}

		this.stats.stored.tags = result.tagsCreated;
	}

	/**
	 * Scrape data from UCF sources
	 */
	private async scrapeData(): Promise<CombinedData> {
		console.log('\n📡 Step 2: Data Scraping');
		console.log('-'.repeat(30));

		const scrapeStart = Date.now();

		const data = await this.scraper.fetchAllData();

		this.stats.scraped.events = data.events.length;
		this.stats.scraped.organizations = data.organizations.length;
		this.stats.scraped.categories = data.categories.length;
		this.stats.timing.scraping = Date.now() - scrapeStart;

		console.log(`✅ Scraped ${data.events.length} events`);
		console.log(`✅ Scraped ${data.organizations.length} organizations`);
		console.log(`✅ Scraped ${data.categories.length} categories`);
		console.log(`⏱️  Scraping took ${(this.stats.timing.scraping / 1000).toFixed(1)}s`);

		return data;
	}

	/**
	 * Process scraped data with AI for hierarchical tagging
	 */
	private async processWithAI(data: CombinedData): Promise<{
		events: (StandardEvent & { aiTags?: any; aiProcessing?: any })[];
		organizations: (StandardOrganization & { aiTags?: any; aiProcessing?: any })[];
	}> {
		console.log('\n🧠 Step 3: AI Analysis & Tagging');
		console.log('-'.repeat(30));

		const aiStart = Date.now();

		// Process events with AI
		console.log('🔍 Analyzing events...');
		const processedEvents = await this.processEventsWithAI(data.events);

		// Process organizations with AI
		console.log('🔍 Analyzing organizations...');
		const processedOrganizations = await this.processOrganizationsWithAI(data.organizations);

		this.stats.timing.aiAnalysis = Date.now() - aiStart;
		console.log(`⏱️  AI analysis took ${(this.stats.timing.aiAnalysis / 1000).toFixed(1)}s`);

		return {
			events: processedEvents,
			organizations: processedOrganizations,
		};
	}

	/**
	 * Process events with AI tagging using optimized batch processing
	 */
	private async processEventsWithAI(events: StandardEvent[]): Promise<(StandardEvent & { aiTags?: any; aiProcessing?: any })[]> {
		if (events.length === 0) return [];

		console.log('🔍 Analyzing events with ULTRA FAST batching...');

		// Convert events to Gemini content format
		const contentRequests = events.map(event => ({
			title: event.name,
			description: event.description,
			additionalContext: {
				location: event.location,
				eventType: event.theme || 'general',
			},
		}));

		// Use the optimized batch processing from Gemini service
		const analysisResults = await this.geminiService.batchAnalyze(contentRequests);

		// Merge results back with events
		const processed = events.map((event, index) => {
			const result = analysisResults[index];

			if (result) {
				this.stats.aiProcessed.events++;
				return {
					...event,
					aiTags: result.tags,
					aiProcessing: {
						lastAnalyzed: new Date(),
						geminiModel: result.modelUsed,
						confidence: result.confidence,
					},
				};
			} else {
				this.stats.aiProcessed.failed++;
				// Return event without AI tags but still store it
				return {
					...event,
					aiTags: [],
					aiProcessing: null,
				};
			}
		});

		console.log(`   ✅ Events processed: ${this.stats.aiProcessed.events}/${events.length} (${Math.round(this.stats.aiProcessed.events / events.length * 100)}% success)`);
		if (this.stats.aiProcessed.failed > 0) {
			console.log(`   ⚠️  ${this.stats.aiProcessed.failed} events processed without AI tags`);
		}

		return processed;
	}

	/**
	 * Process organizations with AI tagging using optimized batch processing
	 */
	private async processOrganizationsWithAI(organizations: StandardOrganization[]): Promise<(StandardOrganization & { aiTags?: any; aiProcessing?: any })[]> {
		if (organizations.length === 0) return [];

		console.log('🏛️ Analyzing organizations with ULTRA FAST batching...');

		// Convert organizations to Gemini content format
		const contentRequests = organizations.map(org => ({
			title: org.name,
			description: org.description,
			additionalContext: {
				// Add category context from scraped categories
				department: org.categories.map((c: any) => c.name).join(', '),
			},
		}));

		// Use the optimized batch processing from Gemini service
		const analysisResults = await this.geminiService.batchAnalyze(contentRequests);

		// Merge results back with organizations
		const processed = organizations.map((org, index) => {
			const result = analysisResults[index];

			if (result) {
				this.stats.aiProcessed.organizations++;
				return {
					...org,
					aiTags: result.tags,
					aiProcessing: {
						lastAnalyzed: new Date(),
						geminiModel: result.modelUsed,
						confidence: result.confidence,
					},
				};
			} else {
				this.stats.aiProcessed.failed++;
				// Return org without AI tags but still store it
				return {
					...org,
					aiTags: [],
					aiProcessing: null,
				};
			}
		});

		console.log(`   ✅ Organizations processed: ${this.stats.aiProcessed.organizations}/${organizations.length} (${Math.round(this.stats.aiProcessed.organizations / organizations.length * 100)}% success)`);

		return processed;
	}

	/**
	 * Store processed data in MongoDB
	 */
	private async storeInDatabase(data: {
		events: (StandardEvent & { aiTags?: any; aiProcessing?: any })[];
		organizations: (StandardOrganization & { aiTags?: any; aiProcessing?: any })[];
	}): Promise<void> {
		console.log('\n💾 Step 4: Database Storage');
		console.log('-'.repeat(30));

		const storeStart = Date.now();

		// Store events (including those without AI tags)
		if (data.events.length > 0) {
			console.log(`📅 Storing ${data.events.length} events...`);
			const storedEvents = await this.storeEvents(data.events);
			this.stats.stored.events = storedEvents;
		}

		// Store organizations (including those without AI tags)
		if (data.organizations.length > 0) {
			console.log(`🏛️  Storing ${data.organizations.length} organizations...`);
			const storedOrgs = await this.storeOrganizations(data.organizations);
			this.stats.stored.organizations = storedOrgs;
		}

		this.stats.timing.storage = Date.now() - storeStart;
		console.log(`⏱️  Storage took ${(this.stats.timing.storage / 1000).toFixed(1)}s`);
	}

	/**
	 * Fix tag categories to match schema validation
	 */
	private fixTagCategories(tags: any[]): any[] {
		if (!tags || !Array.isArray(tags)) return [];

		return tags.map(tag => {
			// Determine if tag is primary or secondary based on parentTagId
			const category = tag.parentTagId ? 'secondary' : 'primary';

			return {
				tagId: tag.tagId,
				weight: tag.weight,
				category: category,
				...(tag.parentTagId && { parentTagId: tag.parentTagId }),
			};
		});
	}

	/**
	 * Store events in database with duplicate clearing
	 */
	private async storeEvents(events: (StandardEvent & { aiTags?: any; aiProcessing?: any })[]): Promise<number> {
		const eventDocuments = events.map((event, index) => ({
			id: parseInt(event.originalId.toString()) || index + 1,
			name: event.name,
			description: event.description,
			location: event.location,
			startTime: new Date(event.startTime),
			endTime: new Date(event.endTime),
			url: event.url,
			latitude: event.latitude || undefined,
			longitude: event.longitude || undefined,
			tags: this.fixTagCategories(event.aiTags), // Fix tag categories here
			aiProcessing: event.aiProcessing,
			organization: event.organization ? parseInt(event.organization.originalId.toString()) : undefined,
			createdAt: new Date(),
			updatedAt: new Date(),
		}));

		try {
			// Use clear and create to avoid duplicates
			const result = await this.dbHandler.clearAndCreateEvents(eventDocuments);
			console.log(`   ✅ Stored ${result.length} events (cleared existing)`);
			return result.length;
		} catch (error) {
			console.error('   ❌ Error storing events:', error);
			this.stats.stored.failed++;
			return 0;
		}
	}

	/**
	 * Store organizations in database with duplicate clearing
	 */
	private async storeOrganizations(organizations: (StandardOrganization & { aiTags?: any; aiProcessing?: any })[]): Promise<number> {
		const orgDocuments = organizations.map((org, index) => ({
			id: parseInt(org.originalId.toString()) || index + 1,
			name: org.name,
			shortName: org.shortName || '',
			url: org.url || '',
			logoUrl: org.logoUrl || '',
			description: org.description,
			tags: this.fixTagCategories(org.aiTags), // Fix tag categories here
			aiProcessing: org.aiProcessing,
			memberCount: 0, // Default value
			createdAt: new Date(),
			updatedAt: new Date(),
		}));

		try {
			// Use clear and create to avoid duplicates
			const result = await this.dbHandler.clearAndCreateOrganizations(orgDocuments);
			console.log(`   ✅ Stored ${result.length} organizations (cleared existing)`);
			return result.length;
		} catch (error) {
			console.error('   ❌ Error storing organizations:', error);
			this.stats.stored.failed++;
			return 0;
		}
	}

	/**
	 * Display final pipeline statistics
	 */
	private displayFinalStats(): void {
		console.log('\n📊 Pipeline Statistics');
		console.log('═'.repeat(50));

		console.log('📡 Scraping Results:');
		console.log(`   Events: ${this.stats.scraped.events}`);
		console.log(`   Organizations: ${this.stats.scraped.organizations}`);
		console.log(`   Categories: ${this.stats.scraped.categories}`);

		console.log('\n🧠 AI Processing Results:');
		console.log(`   Events analyzed: ${this.stats.aiProcessed.events}`);
		console.log(`   Organizations analyzed: ${this.stats.aiProcessed.organizations}`);
		if (this.stats.aiProcessed.failed > 0) {
			console.log(`   Failed analyses: ${this.stats.aiProcessed.failed}`);
		}

		console.log('\n💾 Storage Results:');
		console.log(`   Events stored: ${this.stats.stored.events}`);
		console.log(`   Organizations stored: ${this.stats.stored.organizations}`);
		console.log(`   Tags initialized: ${this.stats.stored.tags}`);
		if (this.stats.stored.failed > 0) {
			console.log(`   Storage failures: ${this.stats.stored.failed}`);
		}

		console.log('\n⏱️  Timing Breakdown:');
		console.log(`   Scraping: ${(this.stats.timing.scraping / 1000).toFixed(1)}s`);
		console.log(`   AI Analysis: ${(this.stats.timing.aiAnalysis / 1000).toFixed(1)}s`);
		console.log(`   Storage: ${(this.stats.timing.storage / 1000).toFixed(1)}s`);
		console.log(`   Total: ${(this.stats.timing.total / 1000).toFixed(1)}s`);

		// Success rate calculation
		const totalProcessed = this.stats.aiProcessed.events + this.stats.aiProcessed.organizations;
		const successRate = totalProcessed > 0 ? ((totalProcessed / (this.stats.scraped.events + this.stats.scraped.organizations)) * 100).toFixed(1) : '0';
		console.log(`\n✅ Overall Success Rate: ${successRate}%`);
	}

	/**
	 * Clean up resources
	 */
	private async cleanup(): Promise<void> {
		try {
			await this.dbHandler.close();
			console.log('🔄 Database connection closed');
		} catch (error) {
			console.error('⚠️  Error during cleanup:', error);
		}
	}
}

/**
 * Main execution function
 */
async function main() {
	// Validate environment variables
	if (!appConfig.ai.gemini.apiKey) {
		console.error('❌ GEMINI_API_KEY is required in .env file');
		process.exit(1);
	}

	if (!appConfig.database.mongodb.uri) {
		console.error('❌ MONGODB_URI is required in .env file');
		process.exit(1);
	}

	// Parse command line arguments
	const args = process.argv.slice(2);
	const modeArg = args[0] || 'standard';
	const mode = modeArg as keyof typeof configurations;

	if (!configurations[mode]) {
		console.error(`❌ Invalid mode: ${modeArg}. Use: fast, standard, comprehensive`);
		process.exit(1);
	}

	console.log('🚀 UCF Data Pipeline Starting');
	console.log(`📋 Mode: ${mode}`);
	console.log(`🗄️  Database: ${appConfig.database.mongodb.uri}/${appConfig.database.mongodb.dbName}`);
	console.log(`🤖 AI Model: ${appConfig.ai.gemini.model}`);
	console.log(`⚙️  Config loaded from: ${process.cwd()}/.env`);

	try {
		const pipeline = new DataPipelineManager(mode);
		await pipeline.runPipeline();

		console.log('\n🎉 Pipeline completed successfully!');
		console.log('🔍 Check your MongoDB database for the processed data');
		process.exit(0);

	} catch (error) {
		console.error('\n💥 Pipeline failed with error:', error);
		process.exit(1);
	}
}

// Handle process interruption gracefully
process.on('SIGINT', () => {
	console.log('\n⏹️  Pipeline interrupted by user');
	process.exit(130);
});

process.on('SIGTERM', () => {
	console.log('\n⏹️  Pipeline terminated');
	process.exit(143);
});

// Run the pipeline
if (require.main === module) {
	void main();
}

export { DataPipelineManager };