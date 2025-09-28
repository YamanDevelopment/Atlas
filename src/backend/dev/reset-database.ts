#!/usr/bin/env bun

/**
 * Reset script to drop existing tags and start fresh with new schema
 */

import { config as loadEnv } from 'dotenv';
import mongoose from 'mongoose';
import config from '../../config';

// Load environment variables
loadEnv();

async function resetDatabase() {
	console.log('🗑️  Resetting database for schema changes...');

	try {
		// Connect to MongoDB
		await mongoose.connect(config.database.mongodb.uri + '/' + config.database.mongodb.dbName);
		console.log('✅ Connected to MongoDB');

		// Drop collections that need to be reset
		const collections = ['tags', 'interests', 'events', 'organizations', 'labs'];

		for (const collectionName of collections) {
			try {
				if (mongoose.connection.db) {
					await mongoose.connection.db.collection(collectionName).drop();
					console.log(`✅ Dropped collection: ${collectionName}`);
				}
			} catch (error: any) {
				if (error.code === 26) {
					console.log(`ℹ️  Collection ${collectionName} doesn't exist, skipping`);
				} else {
					console.error(`❌ Error dropping ${collectionName}:`, error.message);
				}
			}
		}

		console.log('✅ Database reset complete!');
		console.log('🚀 Run the data pipeline again to reinitialize with correct schema');

	} catch (error) {
		console.error('❌ Reset failed:', error);
		process.exit(1);
	} finally {
		await mongoose.disconnect();
		process.exit(0);
	}
}

resetDatabase();