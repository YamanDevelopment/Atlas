import Database from './services/handler';
import { DatabaseInitializer } from './services/initializer';

const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/atlas';
const dbHandler = new Database(dbUrl);
const dbInitializer = new DatabaseInitializer();

// Initialize database with default data on startup
async function initializeDatabase() {
	try {
		// Wait for database connection to establish
		await new Promise(resolve => setTimeout(resolve, 2000));

		// Check if we have a healthy connection
		if (!dbHandler.isConnectionHealthy()) {
			throw new Error('Database connection is not healthy');
		}

		// Initialize default data (tags and interests)
		const result = await dbInitializer.initialize();

		if (result.alreadyInitialized) {
			console.log('✅ Database already contains default data');
		} else {
			console.log('✅ Database initialized successfully:');
			console.log(`   - Tags created: ${result.tagsCreated}`);
			console.log(`   - Interests created: ${result.interestsCreated}`);
		}

		if (result.errors.length > 0) {
			console.error('⚠️  Initialization warnings:', result.errors);
		}

		// Ensure all indexes are created
		await dbHandler.ensureIndexes();

		// Log current stats
		const stats = await dbHandler.getDatabaseStats();
		console.log(`📊 Database stats: ${stats.tags} tags, ${stats.interests} interests, ${stats.events} events, ${stats.organizations} orgs, ${stats.labs} labs`);

	} catch (error) {
		console.error('❌ Database initialization failed:', error);
		// Don't throw - let the application continue but log the error
	}
}

// Gracefully handle termination signals
async function gracefulShutdown() {
	console.log('🔄 Shutting down gracefully...');
	await dbHandler.close();
	process.exit(0);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Auto-initialize on import
initializeDatabase();

// Export both the handler and initializer for external use
export { dbInitializer };
export default dbHandler;