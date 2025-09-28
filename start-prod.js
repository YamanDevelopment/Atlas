#!/usr/bin/env node

/**
 * Atlas Backend Production Server
 *
 * Production-optimized startup script with proper error handling,
 * process management, and graceful shutdown.
 */

require('dotenv').config();

// Ensure production environment
process.env.NODE_ENV = 'production';

const { default: atlasApp } = require('./dist/backend/app');

console.log('🚀 Starting Atlas Backend in PRODUCTION mode...');
console.log('⚡ Optimized for performance and stability');

// Production error handling
process.on('uncaughtException', (error) => {
	console.error('💥 CRITICAL: Uncaught Exception:', error.message);
	console.error('🔍 Stack trace logged separately for debugging');

	// Log full stack trace to error log in production
	if (process.env.LOG_LEVEL === 'debug') {
		console.error(error.stack);
	}

	process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('🚫 CRITICAL: Unhandled Promise Rejection:', reason);
	console.error('📍 Promise:', promise);
	process.exit(1);
});

// Handle process signals for graceful shutdown
const gracefulShutdown = async (signal) => {
	console.log(`\n🛑 Received ${signal} in production, initiating graceful shutdown...`);

	try {
		await atlasApp.stop();
		console.log('✅ Atlas Backend shut down gracefully');
		process.exit(0);
	} catch (error) {
		console.error('❌ Error during graceful shutdown:', error.message);
		process.exit(1);
	}
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the application
atlasApp.start().then(() => {
	console.log('🎉 Atlas Backend successfully started in production!');
}).catch((error) => {
	console.error('❌ FATAL: Failed to start Atlas Backend:', error.message);
	process.exit(1);
});