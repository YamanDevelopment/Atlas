#!/usr/bin/env bun

import { config } from 'dotenv';
import dbHandler, { dbInitializer } from './src/backend/modules/database/main';
config();

async function test() {
	try {
		console.log('🧪 Testing database initialization...');
		await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for connection
		const result = await dbInitializer.initialize();
		console.log('✅ Database initialized:', result);
		process.exit(0);
	} catch (error) {
		console.error('❌ Error:', error);
		process.exit(1);
	}
}

test();