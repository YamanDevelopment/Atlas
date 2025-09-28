import AtlasApiServer from './server';

/**
 * Example server startup file
 * This shows how to initialize and start the Atlas API server
 */

async function startServer() {
	// Server configuration
	const config = {
		port: parseInt(process.env.PORT || '3001'),
		dbUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/atlas',
		cors: {
			origin: [
				'http://localhost:3000',
				'http://localhost:5173',
				'http://localhost:8080',
			],
			credentials: true,
		},
		rateLimiting: {
			windowMs: 15 * 60 * 1000, // 15 minutes
			max: 1000, // requests per window
		},
	};

	// Create and start server
	const server = new AtlasApiServer(config);
	await server.start();
}

// Start the server if this file is run directly
if (require.main === module) {
	startServer().catch((error) => {
		console.error('❌ Failed to start Atlas API server:', error);
		process.exit(1);
	});
}

export { startServer };