#!/usr/bin/env tsx

/**
 * Atlas Backend Development Server
 *
 * Quick development startup with hot reloading and detailed logging.
 * This script is optimized for development workflow.
 */

import dotenv from 'dotenv';
import atlasApp from './src/backend/app';

// Load environment variables with development defaults
dotenv.config();

// Override for development
process.env.NODE_ENV = 'development';
process.env.API_PORT = process.env.API_PORT || '3001';
process.env.LOG_LEVEL = 'debug';

console.log('🔥 Starting Atlas Backend in DEVELOPMENT mode...');
console.log('📝 Hot reloading enabled via tsx');
console.log('🐛 Debug logging enabled');

// Enhanced error handling for development
process.on('uncaughtException', (error) => {
	console.error('💥 Uncaught Exception in Development:', error);
	console.error('Stack:', error.stack);
	process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('🚫 Unhandled Promise Rejection in Development:', reason);
	console.error('Promise:', promise);
	process.exit(1);
});

// Start the application
atlasApp.start().catch((error) => {
	console.error('❌ Failed to start Atlas Backend in development:', error);
	process.exit(1);
});