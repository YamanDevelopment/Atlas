import dotenv from 'dotenv';
import AtlasApiServer from './modules/api/server';

// Load environment variables
dotenv.config();

/**
 * Atlas Backend Application
 *
 * Main entry point that orchestrates the entire Atlas backend system:
 * - Database connection and handler initialization
 * - Authentication system with JWT
 * - Recommendation engine
 * - REST API server with all routes
 * - Security middleware and rate limiting
 */

interface AtlasConfig {
	// Database
	mongodbUri: string;
	dbName: string;

	// API Server
	apiPort: number;
	nodeEnv: string;
	host: string;

	// CORS
	corsOrigin: string[];

	// Authentication
	jwtSecret: string;
	jwtAccessExpiry: string;
	jwtRefreshExpiry: string;
	bcryptRounds: number;

	// Rate Limiting
	rateLimitWindow: number;
	rateLimitMax: number;
	rateLimitRegisterMax: number;
	rateLimitAuthMax: number;

	// AI Configuration
	geminiApiKey?: string;
	geminiModel?: string;
	aiTaggingEnabled: boolean;
}

class AtlasApplication {
	private config: AtlasConfig;
	private apiServer: AtlasApiServer;

	constructor() {
		this.config = this.loadConfiguration();
		this.validateConfiguration();

		console.log('🎯 Atlas Backend Application Starting...');
		console.log(`📍 Environment: ${this.config.nodeEnv}`);
		console.log(`🌐 API Port: ${this.config.apiPort}`);
		console.log(`🗄️ Database: ${this.config.dbName}`);

		this.apiServer = new AtlasApiServer({
			port: this.config.apiPort,
			dbUri: this.config.mongodbUri,
			dbName: this.config.dbName,
			cors: {
				origin: this.config.corsOrigin,
				credentials: true,
			},
			rateLimiting: {
				windowMs: this.config.rateLimitWindow,
				max: this.config.rateLimitMax,
			},
		});
	}

	private loadConfiguration(): AtlasConfig {
		return {
			// Database
			mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
			dbName: process.env.DB_NAME || 'atlas',

			// API Server
			apiPort: parseInt(process.env.API_PORT || '3001'),
			nodeEnv: process.env.NODE_ENV || 'development',
			host: process.env.HOST || 'localhost',

			// CORS
			corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173')
				.split(',')
				.map(origin => origin.trim()),

			// Authentication
			jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
			jwtAccessExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
			jwtRefreshExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
			bcryptRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),

			// Rate Limiting
			rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 min
			rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'),
			rateLimitRegisterMax: parseInt(process.env.RATE_LIMIT_REGISTER_MAX || '5'),
			rateLimitAuthMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '10'),

			// AI Configuration
			geminiApiKey: process.env.GEMINI_API_KEY,
			geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
			aiTaggingEnabled: process.env.AI_ENABLE_AUTO_TAGGING === 'true',
		};
	}

	private validateConfiguration(): void {
		const requiredFields: (keyof AtlasConfig)[] = [
			'mongodbUri',
			'dbName',
			'jwtSecret',
		];

		const missingFields = requiredFields.filter(field => {
			const value = this.config[field];
			return !value || (typeof value === 'string' && value.trim() === '');
		});

		if (missingFields.length > 0) {
			console.error('❌ Missing required configuration:');
			missingFields.forEach(field => {
				console.error(`   - ${field.toUpperCase()}`);
			});
			console.error('\n💡 Please check your .env file and ensure all required variables are set.');
			process.exit(1);
		}

		// Validate JWT secret strength
		if (this.config.jwtSecret.length < 32) {
			console.error('❌ JWT_SECRET must be at least 32 characters long for security');
			process.exit(1);
		}

		// Warn about development settings
		if (this.config.nodeEnv === 'production') {
			if (this.config.jwtSecret === 'your-super-secret-jwt-key-change-in-production') {
				console.error('❌ Default JWT_SECRET detected in production! Please change it immediately.');
				process.exit(1);
			}
		}
	}

	public async start(): Promise<void> {
		try {
			console.log('🚀 Starting Atlas Backend System...');

			// Start the API server (which handles all subsystem initialization)
			await this.apiServer.start();

			console.log('✅ Atlas Backend System successfully started!');
			console.log(`
🎉 Atlas Backend is fully operational!

📚 API Documentation: http://${this.config.host}:${this.config.apiPort}/api
💓 Health Check: http://${this.config.host}:${this.config.apiPort}/health
🔐 Auth Endpoints: http://${this.config.host}:${this.config.apiPort}/api/auth
📊 Recommendations: http://${this.config.host}:${this.config.apiPort}/api/recommendations

🔧 Configuration:
   Environment: ${this.config.nodeEnv}
   Database: ${this.config.dbName}
   JWT Tokens: ${this.config.jwtAccessExpiry} access / ${this.config.jwtRefreshExpiry} refresh
   Rate Limiting: ${this.config.rateLimitMax} requests per ${this.config.rateLimitWindow / 1000 / 60} minutes
   AI Tagging: ${this.config.aiTaggingEnabled ? 'Enabled' : 'Disabled'}

🎯 Ready to serve requests!
			`);

		} catch (error) {
			console.error('❌ Failed to start Atlas Backend System:', error);
			process.exit(1);
		}
	}

	public async stop(): Promise<void> {
		console.log('🛑 Stopping Atlas Backend System...');

		try {
			await this.apiServer.getHandler().close();
			console.log('✅ Atlas Backend System stopped successfully');
		} catch (error) {
			console.error('❌ Error stopping Atlas Backend System:', error);
			process.exit(1);
		}
	}

	public getApiServer(): AtlasApiServer {
		return this.apiServer;
	}

	public getConfig(): AtlasConfig {
		return this.config;
	}
}

// Create and export the main application instance
const atlasApp = new AtlasApplication();

// Start the application if this file is run directly
if (require.main === module) {
	atlasApp.start().catch((error) => {
		console.error('❌ Fatal error starting Atlas Backend:', error);
		process.exit(1);
	});

	// Graceful shutdown handling
	const gracefulShutdown = async (signal: string) => {
		console.log(`\n🛑 Received ${signal}, shutting down Atlas Backend...`);
		try {
			await atlasApp.stop();
			process.exit(0);
		} catch (error) {
			console.error('❌ Error during graceful shutdown:', error);
			process.exit(1);
		}
	};

	process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
	process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export type { AtlasApplication, AtlasConfig };
export default atlasApp;