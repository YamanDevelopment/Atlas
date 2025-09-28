import type { Express, Request, Response, NextFunction } from 'express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Handler from '../database/services/handler';
import { initializeApiRoutes } from './index';

/**
 * Atlas API Server Configuration
 *
 * This server provides RESTful API endpoints for the Atlas platform,
 * including authentication, events, organizations, labs, interests, tags,
 * and recommendations.
 */

interface ServerConfig {
	port: number;
	dbUri: string;
	dbName: string;
	cors?: {
		origin: string[];
		credentials: boolean;
	};
	rateLimiting?: {
		windowMs: number;
		max: number;
	};
}

class AtlasApiServer {
	private app: Express;
	private handler: Handler;
	private config: ServerConfig;

	constructor(config: ServerConfig) {
		this.config = config;
		this.app = express();
		this.handler = new Handler(config.dbUri, config.dbName);
		this.setupMiddleware();
		this.setupRoutes();
		this.setupErrorHandling();
	}

	private setupMiddleware(): void {
		// Security middleware
		this.app.use(helmet({
			crossOriginEmbedderPolicy: false,
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ['\'self\''],
					styleSrc: ['\'self\'', '\'unsafe-inline\''],
					scriptSrc: ['\'self\''],
					imgSrc: ['\'self\'', 'data:', 'https:'],
				},
			},
		}));

		// CORS configuration
		this.app.use(cors({
			origin: this.config.cors?.origin || [
				'http://localhost:3000',
				'http://localhost:5173',
				'http://localhost:8080',
			],
			credentials: this.config.cors?.credentials || true,
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
			allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
		}));

		// Rate limiting
		const limiter = rateLimit({
			windowMs: this.config.rateLimiting?.windowMs || 15 * 60 * 1000, // 15 minutes
			max: this.config.rateLimiting?.max || 1000, // limit each IP to 1000 requests per windowMs
			message: {
				error: 'Too many requests',
				message: 'Rate limit exceeded, please try again later',
			},
			standardHeaders: true,
			legacyHeaders: false,
		});
		this.app.use(limiter);

		// Body parsing middleware
		this.app.use(express.json({ limit: '10mb' }));
		this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

		// Request logging middleware
		this.app.use((req: Request, res: Response, next: NextFunction) => {
			console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
			next();
		});
	}

	private setupRoutes(): void {
		// Initialize API routes with handler instance
		const apiRouter = initializeApiRoutes(this.handler);
		this.app.use('/api', apiRouter);

		// Root endpoint
		this.app.get('/', (req: Request, res: Response) => {
			res.json({
				success: true,
				message: 'Atlas API Server',
				version: '1.0.0',
				endpoints: {
					api: '/api',
					health: '/health',
					docs: '/docs',
				},
				timestamp: new Date().toISOString(),
			});
		});

		// Health check endpoint
		this.app.get('/health', (req: Request, res: Response) => {
			const dbHealthy = this.handler.isConnectionHealthy();
			const uptime = this.handler.getConnectionUptime();

			res.status(dbHealthy ? 200 : 503).json({
				success: dbHealthy,
				message: dbHealthy ? 'Server is healthy' : 'Server is unhealthy',
				database: {
					connected: dbHealthy,
					uptime: `${Math.floor(uptime / 1000)}s`,
				},
				server: {
					uptime: process.uptime(),
					memory: process.memoryUsage(),
					nodeVersion: process.version,
				},
				timestamp: new Date().toISOString(),
			});
		});

		// Catch-all for undefined routes
		this.app.use((req: Request, res: Response) => {
			res.status(404).json({
				success: false,
				error: 'Route not found',
				message: `Cannot ${req.method} ${req.originalUrl}`,
				availableEndpoints: '/api',
			});
		});
	}

	private setupErrorHandling(): void {
		// Global error handling middleware
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
			console.error('❌ Unhandled error:', error);

			res.status(500).json({
				success: false,
				error: 'Internal server error',
				message: 'An unexpected error occurred',
				...(process.env.NODE_ENV === 'development' && {
					stack: error.stack,
					details: error.message,
				}),
			});
		});

		// Handle uncaught exceptions
		process.on('uncaughtException', (error: Error) => {
			console.error('❌ Uncaught Exception:', error);
			process.exit(1);
		});

		// Handle unhandled promise rejections
		process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
			console.error('❌ Unhandled Promise Rejection:', reason);
			console.error('Promise:', promise);
			process.exit(1);
		});
	}

	public async start(): Promise<void> {
		try {
			// Wait for database connection
			console.log('🔌 Connecting to database...');
			// The Handler constructor already handles connection

			// Start the server
			const server = this.app.listen(this.config.port, () => {
				console.log(`
🚀 Atlas API Server is running!
📍 Port: ${this.config.port}
🌐 URL: http://localhost:${this.config.port}
📚 API: http://localhost:${this.config.port}/api
💓 Health: http://localhost:${this.config.port}/health
🕐 Started: ${new Date().toISOString()}
				`);
			});

			// Graceful shutdown handling
			const gracefulShutdown = async (signal: string) => {
				console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);

				server.close(async () => {
					console.log('📴 HTTP server closed');

					try {
						await this.handler.close();
						console.log('🔌 Database connection closed');
						process.exit(0);
					} catch (error) {
						console.error('❌ Error during shutdown:', error);
						process.exit(1);
					}
				});
			};

			process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
			process.on('SIGINT', () => gracefulShutdown('SIGINT'));

		} catch (error) {
			console.error('❌ Failed to start server:', error);
			process.exit(1);
		}
	}

	public getApp(): Express {
		return this.app;
	}

	public getHandler(): Handler {
		return this.handler;
	}
}

export type { AtlasApiServer, ServerConfig };
export default AtlasApiServer;