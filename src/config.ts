// Configuration for Atlas - UCF Events, Organizations & Labs Platform

// Load environment variables (install with: npm install dotenv)
// import dotenv from 'dotenv';
// dotenv.config();

export interface Config {
	// Server Configuration
	server: {
		port: number;
		host: string;
		environment: 'development' | 'production' | 'test';
		cors: {
			origin: string | string[];
			credentials: boolean;
		};
	};

	// Database Configuration
	database: {
		mongodb: {
			uri: string;
			dbName: string;
			options: {
				maxPoolSize: number;
				minPoolSize: number;
				maxIdleTimeMS: number;
				serverSelectionTimeoutMS: number;
			};
		};
	};

	// UCF Data Scraping Configuration
	scraping: {
		campusLabs: {
			baseUrl: string;
			timeout: number;
			retries: number;
			rateLimit: {
				requests: number;
				windowMs: number;
			};
		};
		ucfEvents: {
			baseUrl: string;
			timeout: number;
			retries: number;
			rateLimit: {
				requests: number;
				windowMs: number;
			};
		};
		schedule: {
			eventsSync: string; // cron expression
			organizationsSync: string; // cron expression
			labsSync: string; // cron expression
		};
	};

	// AI/ML Configuration
	ai: {
		gemini: {
			apiKey: string;
			model: string;
			maxTokens: number;
			temperature: number;
		};
		tagging: {
			confidenceThreshold: number;
			maxTagsPerItem: number;
			enableAutoTagging: boolean;
		};
		recommendations: {
			maxRecommendations: number;
			similarityThreshold: number;
			enablePersonalization: boolean;
		};
	};

	// Authentication Configuration
	auth: {
		jwt: {
			secret: string;
			expiresIn: string;
			refreshExpiresIn: string;
		};
		bcrypt: {
			saltRounds: number;
		};
	};

	// Logging Configuration
	logging: {
		level: 'error' | 'warn' | 'info' | 'debug';
		format: 'json' | 'simple';
		file: {
			enabled: boolean;
			filename: string;
			maxSize: string;
			maxFiles: number;
		};
	};
}

// Default configuration
const config: Config = {
	server: {
		port: parseInt(process.env.PORT || '3000', 10),
		host: process.env.HOST || 'localhost',
		environment: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
		cors: {
			origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
			credentials: true,
		},
	},

	database: {
		mongodb: {
			uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
			dbName: process.env.DB_NAME || 'atlas',
			options: {
				maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10', 10),
				minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '2', 10),
				maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME_MS || '30000', 10),
				serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT_MS || '5000', 10),
			},
		},
	},

	scraping: {
		campusLabs: {
			baseUrl: process.env.CAMPUS_LABS_API_URL || 'https://api.campuslabs.com',
			timeout: parseInt(process.env.SCRAPING_TIMEOUT || '10000', 10),
			retries: parseInt(process.env.SCRAPING_RETRIES || '3', 10),
			rateLimit: {
				requests: parseInt(process.env.CAMPUS_LABS_RATE_LIMIT_REQUESTS || '100', 10),
				windowMs: parseInt(process.env.CAMPUS_LABS_RATE_LIMIT_WINDOW || '60000', 10),
			},
		},
		ucfEvents: {
			baseUrl: process.env.UCF_EVENTS_URL || 'https://events.ucf.edu',
			timeout: parseInt(process.env.SCRAPING_TIMEOUT || '10000', 10),
			retries: parseInt(process.env.SCRAPING_RETRIES || '3', 10),
			rateLimit: {
				requests: parseInt(process.env.UCF_EVENTS_RATE_LIMIT_REQUESTS || '50', 10),
				windowMs: parseInt(process.env.UCF_EVENTS_RATE_LIMIT_WINDOW || '60000', 10),
			},
		},
		schedule: {
			eventsSync: process.env.EVENTS_SYNC_CRON || '0 */6 * * *', // Every 6 hours
			organizationsSync: process.env.ORGS_SYNC_CRON || '0 2 * * *', // Daily at 2 AM
			labsSync: process.env.LABS_SYNC_CRON || '0 3 * * *', // Daily at 3 AM
		},
	},

	ai: {
		gemini: {
			apiKey: process.env.GEMINI_API_KEY || '',
			model: process.env.GEMINI_MODEL || 'gemini-pro',
			maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '2048', 10),
			temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
		},
		tagging: {
			confidenceThreshold: parseFloat(process.env.AI_TAGGING_CONFIDENCE || '0.7'),
			maxTagsPerItem: parseInt(process.env.AI_MAX_TAGS_PER_ITEM || '5', 10),
			enableAutoTagging: process.env.AI_ENABLE_AUTO_TAGGING === 'true',
		},
		recommendations: {
			maxRecommendations: parseInt(process.env.AI_MAX_RECOMMENDATIONS || '20', 10),
			similarityThreshold: parseFloat(process.env.AI_SIMILARITY_THRESHOLD || '0.6'),
			enablePersonalization: process.env.AI_ENABLE_PERSONALIZATION === 'true',
		},
	},

	auth: {
		jwt: {
			secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
			expiresIn: process.env.JWT_EXPIRES_IN || '24h',
			refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
		},
		bcrypt: {
			saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
		},
	},

	logging: {
		level: (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
		format: (process.env.LOG_FORMAT as 'json' | 'simple') || 'json',
		file: {
			enabled: process.env.LOG_FILE_ENABLED === 'true',
			filename: process.env.LOG_FILENAME || 'logs/atlas.log',
			maxSize: process.env.LOG_MAX_SIZE || '10m',
			maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10),
		},
	},
};

// Validation function
export const validateConfig = (): void => {
	const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

	if (config.ai.tagging.enableAutoTagging && !config.ai.gemini.apiKey) {
		requiredEnvVars.push('GEMINI_API_KEY');
	}

	const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

	if (missingVars.length > 0) {
		throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
	}

	// Validate numeric ranges
	if (config.server.port < 1 || config.server.port > 65535) {
		throw new Error('Server port must be between 1 and 65535');
	}

	if (config.ai.tagging.confidenceThreshold < 0 || config.ai.tagging.confidenceThreshold > 1) {
		throw new Error('AI tagging confidence threshold must be between 0 and 1');
	}

	if (config.ai.recommendations.similarityThreshold < 0 || config.ai.recommendations.similarityThreshold > 1) {
		throw new Error('AI similarity threshold must be between 0 and 1');
	}
};

export default config;
