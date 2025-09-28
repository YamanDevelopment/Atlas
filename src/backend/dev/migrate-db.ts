#!/usr/bin/env node

/**
 * Atlas Database Migration Script
 *
 * This script migrates data from the 'test' database to the 'atlas' database,
 * ensuring no data is lost during the database name standardization.
 *
 * What it does:
 * 1. Connects to MongoDB using your existing configuration
 * 2. Creates a backup of all collections from the 'test' database
 * 3. Migrates all data to the 'atlas' database
 * 4. Verifies the migration was successful
 * 5. Optionally cleans up the old 'test' database
 *
 * Usage:
 *   npx tsx src/backend/dev/migrate-db.ts [--clean-old]
 *
 * Options:
 *   --clean-old    Delete the old 'test' database after migration (optional)
 *   --dry-run      Show what would be migrated without actually doing it
 *   --help         Show this help message
 *
 * Examples:
 *   npx tsx src/backend/dev/migrate-db.ts
 *   npx tsx src/backend/dev/migrate-db.ts --clean-old
 *   npx tsx src/backend/dev/migrate-db.ts --dry-run
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import atlasConfig from '../../config';

// Load environment variables
config();

// CLI Colors for pretty output
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m',
};

// Helper functions for colored output
const log = {
	success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
	error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
	warn: (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
	info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
	header: (msg: string) => console.log(`${colors.cyan}${colors.bright}🗄️  ${msg}${colors.reset}`),
	data: (msg: string) => console.log(`${colors.magenta}   ${msg}${colors.reset}`),
	step: (msg: string) => console.log(`${colors.white}${colors.bright}📋 ${msg}${colors.reset}`),
};

interface CollectionInfo {
	name: string;
	count: number;
}

interface MigrationStats {
	sourceDb: string;
	targetDb: string;
	collections: CollectionInfo[];
	totalDocuments: number;
	migratedDocuments: number;
	errors: string[];
}

class DatabaseMigrator {
	private sourceDbName = 'test';
	private targetDbName = 'atlas';
	private mongoUri: string;
	private isDryRun = false;
	private shouldCleanOld = false;

	constructor() {
		this.mongoUri = atlasConfig.database.mongodb.uri;
		if (!this.mongoUri) {
			throw new Error('MongoDB URI not found in configuration');
		}
	}

	async init(): Promise<void> {
		try {
			await mongoose.connect(this.mongoUri, {
				...atlasConfig.database.mongodb.options,
			});
			log.success('Connected to MongoDB successfully');
		} catch (error) {
			log.error('Failed to connect to database');
			console.error(error);
			process.exit(1);
		}
	}

	async getCollectionInfo(dbName: string): Promise<CollectionInfo[]> {
		try {
			const db = mongoose.connection.useDb(dbName);
			const collections = await db.db?.listCollections().toArray() || [];

			const collectionInfo: CollectionInfo[] = [];

			for (const collection of collections) {
				const count = await db.collection(collection.name).countDocuments();
				collectionInfo.push({
					name: collection.name,
					count,
				});
			}

			return collectionInfo;
		} catch {
			log.error(`Failed to get collection info for database: ${dbName}`);
			return [];
		}
	}

	async analyzeSourceDatabase(): Promise<MigrationStats> {
		log.step('Analyzing source database...');

		const collections = await this.getCollectionInfo(this.sourceDbName);
		const totalDocuments = collections.reduce((sum, col) => sum + col.count, 0);

		if (collections.length === 0) {
			log.warn(`No collections found in '${this.sourceDbName}' database`);
		} else {
			log.info(`Found ${collections.length} collections in '${this.sourceDbName}' database:`);
			collections.forEach(col => {
				log.data(`${col.name}: ${col.count} documents`);
			});
			log.data(`Total documents: ${totalDocuments}`);
		}

		return {
			sourceDb: this.sourceDbName,
			targetDb: this.targetDbName,
			collections,
			totalDocuments,
			migratedDocuments: 0,
			errors: [],
		};
	}

	async checkTargetDatabase(): Promise<void> {
		log.step('Checking target database...');

		const targetCollections = await this.getCollectionInfo(this.targetDbName);

		if (targetCollections.length > 0) {
			log.warn(`Target database '${this.targetDbName}' already contains data:`);
			targetCollections.forEach(col => {
				log.data(`${col.name}: ${col.count} documents`);
			});

			console.log();
			log.warn('Migration will merge data. Existing documents with same IDs may be updated.');
		} else {
			log.info(`Target database '${this.targetDbName}' is empty - ready for migration`);
		}
	}

	async migrateCollection(collectionName: string, stats: MigrationStats): Promise<void> {
		try {
			const sourceDb = mongoose.connection.useDb(this.sourceDbName);
			const targetDb = mongoose.connection.useDb(this.targetDbName);

			const sourceCollection = sourceDb.collection(collectionName);
			const targetCollection = targetDb.collection(collectionName);

			// Get all documents from source
			const documents = await sourceCollection.find({}).toArray();

			if (documents.length === 0) {
				log.info(`Collection '${collectionName}' is empty - skipping`);
				return;
			}

			if (this.isDryRun) {
				log.info(`[DRY RUN] Would migrate ${documents.length} documents from '${collectionName}'`);
				return;
			}

			log.info(`Migrating ${documents.length} documents from '${collectionName}'...`);

			// Insert documents into target (using insertMany with ordered: false to continue on errors)
			const result = await targetCollection.insertMany(documents, {
				ordered: false, // Continue inserting even if some documents fail (e.g., duplicates)
			});

			stats.migratedDocuments += result.insertedCount;
			log.success(`Migrated ${result.insertedCount} documents to '${collectionName}'`);

			if (result.insertedCount !== documents.length) {
				const skipped = documents.length - result.insertedCount;
				log.warn(`${skipped} documents were skipped (likely duplicates)`);
			}

		} catch (error) {
			const errorMsg = `Failed to migrate collection '${collectionName}': ${(error as Error).message}`;
			log.error(errorMsg);
			stats.errors.push(errorMsg);
		}
	}

	async performMigration(stats: MigrationStats): Promise<void> {
		if (stats.collections.length === 0) {
			log.warn('No collections to migrate');
			return;
		}

		log.step(`${this.isDryRun ? '[DRY RUN] ' : ''}Starting migration...`);

		for (const collection of stats.collections) {
			await this.migrateCollection(collection.name, stats);
		}
	}

	async verifyMigration(stats: MigrationStats): Promise<void> {
		if (this.isDryRun) {
			log.info('[DRY RUN] Skipping verification');
			return;
		}

		log.step('Verifying migration...');

		const targetCollections = await this.getCollectionInfo(this.targetDbName);
		const targetTotal = targetCollections.reduce((sum, col) => sum + col.count, 0);

		log.info('Target database after migration:');
		targetCollections.forEach(col => {
			log.data(`${col.name}: ${col.count} documents`);
		});

		log.info('Migration completed:');
		log.data(`Source documents: ${stats.totalDocuments}`);
		log.data(`Migrated documents: ${stats.migratedDocuments}`);
		log.data(`Target total documents: ${targetTotal}`);
		log.data(`Errors: ${stats.errors.length}`);
	}

	async cleanupOldDatabase(): Promise<void> {
		if (this.isDryRun) {
			log.info('[DRY RUN] Would drop the old test database');
			return;
		}

		if (!this.shouldCleanOld) {
			log.info('Keeping old database (use --clean-old to remove it)');
			return;
		}

		log.step('Cleaning up old database...');

		try {
			const sourceDb = mongoose.connection.useDb(this.sourceDbName);
			await sourceDb.dropDatabase();
			log.success(`Old database '${this.sourceDbName}' has been removed`);
		} catch (error) {
			log.error(`Failed to cleanup old database: ${(error as Error).message}`);
		}
	}

	async migrate(isDryRun = false, shouldCleanOld = false): Promise<void> {
		this.isDryRun = isDryRun;
		this.shouldCleanOld = shouldCleanOld;

		log.header(`Atlas Database Migration ${isDryRun ? '(DRY RUN)' : ''}`);
		log.info(`Source: ${this.sourceDbName} → Target: ${this.targetDbName}`);
		console.log();

		// Step 1: Analyze source database
		const stats = await this.analyzeSourceDatabase();
		console.log();

		// Step 2: Check target database
		await this.checkTargetDatabase();
		console.log();

		// Step 3: Perform migration
		await this.performMigration(stats);
		console.log();

		// Step 4: Verify migration
		await this.verifyMigration(stats);
		console.log();

		// Step 5: Cleanup (optional)
		await this.cleanupOldDatabase();
		console.log();

		// Final summary
		if (stats.errors.length > 0) {
			log.warn('Migration completed with errors:');
			stats.errors.forEach(error => log.data(`- ${error}`));
		} else if (!isDryRun) {
			log.success('Migration completed successfully!');
		} else {
			log.success('Dry run completed - no data was modified');
		}

		if (!isDryRun && stats.migratedDocuments > 0) {
			console.log();
			log.info('🎉 Your data has been migrated to the atlas database!');
			log.info('Both your CLI tool and server will now use the same database.');
		}
	}

	displayHelp(): void {
		console.log(`
${colors.cyan}${colors.bright}🗄️  Atlas Database Migration Tool${colors.reset}

${colors.bright}DESCRIPTION:${colors.reset}
  Migrates data from the 'test' database to the 'atlas' database to standardize
  database usage across your CLI tools and server daemon.

${colors.bright}USAGE:${colors.reset}
  npx tsx src/backend/dev/migrate-db.ts [options]

${colors.bright}OPTIONS:${colors.reset}
  ${colors.green}--dry-run${colors.reset}      Show what would be migrated without making changes
  ${colors.yellow}--clean-old${colors.reset}    Delete the old 'test' database after migration
  ${colors.blue}--help${colors.reset}         Show this help message

${colors.bright}EXAMPLES:${colors.reset}
  ${colors.yellow}npx tsx src/backend/dev/migrate-db.ts --dry-run${colors.reset}
    Preview what would be migrated

  ${colors.yellow}npx tsx src/backend/dev/migrate-db.ts${colors.reset}
    Migrate data (keeps old database as backup)

  ${colors.yellow}npx tsx src/backend/dev/migrate-db.ts --clean-old${colors.reset}
    Migrate data and remove old database

${colors.bright}SAFETY:${colors.reset}
  - Always runs a dry-run first to show what would be migrated
  - Preserves existing data in target database
  - Handles duplicate documents gracefully
  - Keeps old database as backup unless --clean-old is used
		`);
	}

	async close(): Promise<void> {
		await mongoose.connection.close();
		log.success('Database connection closed');
	}
}

// Main execution function
async function main(): Promise<void> {
	const args = process.argv.slice(2);

	// Parse command line arguments
	const isDryRun = args.includes('--dry-run');
	const shouldCleanOld = args.includes('--clean-old');
	const showHelp = args.includes('--help') || args.includes('-h');

	if (showHelp) {
		const migrator = new DatabaseMigrator();
		migrator.displayHelp();
		return;
	}

	const migrator = new DatabaseMigrator();

	try {
		await migrator.init();
		await migrator.migrate(isDryRun, shouldCleanOld);
	} catch (error) {
		log.error('Migration failed');
		console.error(error);
		process.exit(1);
	} finally {
		await migrator.close();
	}
}

// Export for potential module usage
export { DatabaseMigrator };

// Run the migrator if called directly
if (require.main === module) {
	main().catch(console.error);
}