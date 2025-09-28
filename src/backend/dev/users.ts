#!/usr/bin/env node

/**
 * Atlas User Management & Authentication CLI
 *
 * A powerful command-line interface for managing users and testing the
 * authentication system of the Atlas backend.
 *
 * Features:
 * - Add, delete, and list users with role management
 * - Test login directly against the database
 * - Test login via the live API endpoint with JWT validation
 * - Validate JWT tokens and decode payloads
 * - Bulk operations for testing scenarios
 *
 * Usage:
 *   npx tsx src/backend/dev/users.ts <command> [options]
 *
 * Commands:
 *   add <username> <email> [password] [role] [interests] - Add a new user
 *   delete <identifier>                                  - Delete user by username, email, or ID
 *   list [role] [limit]                                  - List users with optional role filter
 *   login-db <username> <password>                       - Test login directly against database
 *   login-api <username> <password> [apiUrl]            - Test login via API endpoint
 *   test-auth <token>                                    - Validate a JWT token
 *   info <identifier>                                    - Get detailed user information
 *   promote <identifier> <role>                          - Change user role
 *   reset-password <identifier> <newPassword>           - Reset user password
 *   bulk-create <count> [role]                          - Create multiple test users
 *   cleanup-test                                        - Remove all test users
 *
 * Examples:
 *   npx tsx src/backend/dev/users.ts add testuser test@example.com
 *   npx tsx src/backend/dev/users.ts add admin admin@atlas.com secret admin "1,2,3"
 *   npx tsx src/backend/dev/users.ts login-db admin secret
 *   npx tsx src/backend/dev/users.ts login-api admin secret http://localhost:3001
 *   npx tsx src/backend/dev/users.ts promote testuser admin
 */

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { User } from '../modules/database/schemas/User';
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
	header: (msg: string) => console.log(`${colors.cyan}${colors.bright}🏛️  ${msg}${colors.reset}`),
	data: (msg: string) => console.log(`${colors.magenta}   ${msg}${colors.reset}`),
	code: (msg: string) => console.log(`${colors.yellow}   ${msg}${colors.reset}`),
};

// Database connection helper
async function connectToDatabase(): Promise<void> {
	const mongoUri = atlasConfig.database.mongodb.uri;
	if (!mongoUri) {
		throw new Error('MongoDB URI not found in configuration');
	}

	await mongoose.connect(mongoUri, {
		dbName: atlasConfig.database.mongodb.dbName,
		...atlasConfig.database.mongodb.options,
	});
}

// API call helper with proper typing
interface LoginResponse {
	success: boolean;
	data?: {
		user: {
			id: number;
			username: string;
			email: string;
			name: string;
			role: string;
		};
		tokens: {
			accessToken: string;
			refreshToken: string;
		};
	};
	error?: string;
	message?: string;
}

async function testApiLogin(username: string, password: string, apiUrl: string = 'http://localhost:3001'): Promise<LoginResponse | null> {
	try {
		// Use the built-in Node.js fetch (available in Node 18+)
		const response = await fetch(`${apiUrl}/api/auth/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username, password }),
		});

		return await response.json() as LoginResponse;
	} catch (error) {
		log.error(`Failed to connect to API at ${apiUrl}`);
		console.error(error);
		return null;
	}
}

// User management CLI class
class UserManagementCLI {
	private jwtSecret: string;

	constructor() {
		this.jwtSecret = atlasConfig.auth.jwt.secret;
	}

	async init(): Promise<void> {
		try {
			await connectToDatabase();
			log.success('Connected to Atlas MongoDB database');
		} catch (error) {
			log.error('Failed to connect to database');
			console.error(error);
			process.exit(1);
		}
	}

	// Add new user
	async addUser(username: string, email: string, password: string = 'password123', role: string = 'user', interests: string = ''): Promise<void> {
		try {
			log.info(`Creating user: ${username} (${email})`);

			// Check if user already exists
			const existingUser = await User.findOne({
				$or: [{ username }, { email }],
			});

			if (existingUser) {
				log.error(`User already exists with username "${username}" or email "${email}"`);
				return;
			}

			// Validate role
			if (!['user', 'admin', 'moderator'].includes(role)) {
				log.error(`Invalid role "${role}". Must be: user, admin, or moderator`);
				return;
			}

			// Parse interests
			const interestIds = interests ? interests.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];

			// Get next user ID
			const lastUser = await User.findOne().sort({ id: -1 });
			const nextId = (lastUser?.id || 0) + 1;

			// Create user (let User model handle password hashing via pre-save middleware)
			const newUser = new User({
				id: nextId,
				name: username.charAt(0).toUpperCase() + username.slice(1), // Capitalize first letter
				username,
				email,
				password: password, // Don't hash here - let the pre-save middleware handle it
				role: role as 'user' | 'admin' | 'moderator',
				interests: interestIds,
			});

			await newUser.save();

			log.success('User created successfully!');
			log.data(`User ID: ${newUser.id}`);
			log.data(`Name: ${newUser.name}`);
			log.data(`Username: ${newUser.username}`);
			log.data(`Email: ${newUser.email}`);
			log.data(`Role: ${newUser.role}`);
			log.data(`Interests: [${newUser.interests.join(', ')}]`);
			log.data(`Created: ${newUser.createdAt}`);

		} catch (error) {
			log.error('Failed to create user');
			console.error(error);
		}
	}

	// Delete user
	async deleteUser(identifier: string): Promise<void> {
		try {
			log.info(`Searching for user: ${identifier}`);

			// Find user by username, email, or user ID
			let user;
			if (!isNaN(Number(identifier))) {
				user = await User.findOne({ id: Number(identifier) });
			} else {
				user = await User.findOne({
					$or: [{ username: identifier }, { email: identifier }],
				});
			}

			if (!user) {
				log.error(`User not found: ${identifier}`);
				return;
			}

			// Show user info before deletion
			log.warn('About to delete user:');
			log.data(`User ID: ${user.id}`);
			log.data(`Name: ${user.name}`);
			log.data(`Username: ${user.username}`);
			log.data(`Email: ${user.email}`);
			log.data(`Role: ${user.role}`);

			await User.deleteOne({ _id: user._id });
			log.success(`User "${user.username}" deleted successfully`);

		} catch (error) {
			log.error('Failed to delete user');
			console.error(error);
		}
	}

	// List users
	async listUsers(roleFilter?: string, limit: number = 10): Promise<void> {
		try {
			log.info(`Listing users${roleFilter ? ` with role: ${roleFilter}` : ''} (limit: ${limit})`);

			const query = roleFilter ? { role: roleFilter } : {};
			const users = await User.find(query)
				.sort({ createdAt: -1 })
				.limit(limit)
				.select('-password');

			if (users.length === 0) {
				log.warn('No users found');
				return;
			}

			log.header(`Found ${users.length} user(s):`);
			console.log();

			users.forEach((user, index) => {
				console.log(`${colors.bright}${index + 1}. ${user.name} (@${user.username})${colors.reset}`);
				log.data(`   ID: ${user.id} | Email: ${user.email} | Role: ${user.role}`);
				log.data(`   Interests: [${user.interests.join(', ')}] | Created: ${user.createdAt.toLocaleDateString()}`);
				if (user.lastLogin) {
					log.data(`   Last Login: ${user.lastLogin.toLocaleString()}`);
				}
				console.log();
			});

		} catch (error) {
			log.error('Failed to list users');
			console.error(error);
		}
	}

	// Test database login
	async testDatabaseLogin(username: string, password: string): Promise<void> {
		try {
			log.info(`Testing database login for user: ${username}`);

			// Find user
			const user = await User.findOne({ username }).select('+password');
			if (!user) {
				log.error(`User not found: ${username}`);
				return;
			}

			// Check password
			const isValidPassword = await user.comparePassword(password);
			if (!isValidPassword) {
				log.error('Invalid password');
				return;
			}

			// Generate JWT tokens
			const payload = {
				userId: user.id,
				username: user.username,
				role: user.role,
			};

			const accessToken = jwt.sign(payload, this.jwtSecret, {
				expiresIn: atlasConfig.auth.jwt.expiresIn,
			} as jwt.SignOptions);

			const refreshToken = jwt.sign(payload, this.jwtSecret, {
				expiresIn: atlasConfig.auth.jwt.refreshExpiresIn,
			} as jwt.SignOptions);

			// Update last login
			user.lastLogin = new Date();
			await user.save();

			log.success('Database login successful!');
			console.log();
			log.header('User Information:');
			log.data(`User ID: ${user.id}`);
			log.data(`Name: ${user.name}`);
			log.data(`Username: ${user.username}`);
			log.data(`Email: ${user.email}`);
			log.data(`Role: ${user.role}`);
			log.data(`Interests: [${user.interests.join(', ')}]`);

			console.log();
			log.header('Generated JWT Tokens:');
			log.data(`Access Token: ${accessToken}`);
			log.data(`Refresh Token: ${refreshToken}`);

			console.log();
			log.info('Test these tokens with API endpoints:');
			log.code(`curl -H "Authorization: Bearer ${accessToken}" http://localhost:3001/api/auth/me`);
			log.code(`curl -H "Authorization: Bearer ${accessToken}" http://localhost:3001/api/recommendations/events/${user.id}`);

		} catch (error) {
			log.error('Database login test failed');
			console.error(error);
		}
	}

	// Test API login
	async testAPILogin(username: string, password: string, apiUrl: string = 'http://localhost:3001'): Promise<void> {
		try {
			log.info(`Testing API login for user: ${username} at ${apiUrl}`);

			const response = await testApiLogin(username, password, apiUrl);
			if (!response) {
				log.error('Failed to get response from API');
				return;
			}

			if (!response.success) {
				log.error(`API login failed: ${response.error || response.message}`);
				return;
			}

			const { user, tokens } = response.data!;

			log.success('API login successful!');
			console.log();
			log.header('User Information:');
			log.data(`User ID: ${user.id}`);
			log.data(`Name: ${user.name}`);
			log.data(`Username: ${user.username}`);
			log.data(`Email: ${user.email}`);
			log.data(`Role: ${user.role}`);

			console.log();
			log.header('Received JWT Tokens:');
			log.data(`Access Token: ${tokens.accessToken}`);
			log.data(`Refresh Token: ${tokens.refreshToken}`);

			console.log();
			log.info('Test these tokens with API endpoints:');
			log.code(`curl -H "Authorization: Bearer ${tokens.accessToken}" ${apiUrl}/api/auth/me`);
			log.code(`curl -H "Authorization: Bearer ${tokens.accessToken}" ${apiUrl}/api/recommendations/events/${user.id}`);

			// Test token validation
			console.log();
			log.info('Validating token...');
			await this.testAuth(tokens.accessToken);

		} catch (error) {
			log.error('API login test failed');
			console.error(error);
		}
	}

	// Get user info
	async getUserInfo(identifier: string): Promise<void> {
		try {
			log.info(`Getting info for user: ${identifier}`);

			// Find user by username, email, or user ID
			let user;
			if (!isNaN(Number(identifier))) {
				user = await User.findOne({ id: Number(identifier) }).select('-password');
			} else {
				user = await User.findOne({
					$or: [{ username: identifier }, { email: identifier }],
				}).select('-password');
			}

			if (!user) {
				log.error(`User not found: ${identifier}`);
				return;
			}

			log.success('User found!');
			console.log();
			log.header('User Details:');
			log.data(`User ID: ${user.id}`);
			log.data(`Name: ${user.name}`);
			log.data(`Username: ${user.username}`);
			log.data(`Email: ${user.email}`);
			log.data(`Role: ${user.role}`);
			log.data(`Interests: [${user.interests.join(', ')}]`);
			log.data(`Created: ${user.createdAt}`);
			log.data(`Updated: ${user.updatedAt}`);
			if (user.lastLogin) {
				log.data(`Last Login: ${user.lastLogin}`);
			}

		} catch (error) {
			log.error('Failed to get user info');
			console.error(error);
		}
	}

	// Promote user (change role)
	async promoteUser(identifier: string, newRole: string): Promise<void> {
		try {
			log.info(`Changing role for user: ${identifier} → ${newRole}`);

			// Validate role
			if (!['user', 'admin', 'moderator'].includes(newRole)) {
				log.error(`Invalid role "${newRole}". Must be: user, admin, or moderator`);
				return;
			}

			// Find user
			let user;
			if (!isNaN(Number(identifier))) {
				user = await User.findOne({ id: Number(identifier) });
			} else {
				user = await User.findOne({
					$or: [{ username: identifier }, { email: identifier }],
				});
			}

			if (!user) {
				log.error(`User not found: ${identifier}`);
				return;
			}

			const oldRole = user.role;
			user.role = newRole;
			await user.save();

			log.success('Role updated successfully!');
			log.data(`User: ${user.username} (${user.email})`);
			log.data(`Old Role: ${oldRole}`);
			log.data(`New Role: ${newRole}`);

		} catch (error) {
			log.error('Failed to promote user');
			console.error(error);
		}
	}

	// Reset user password
	async resetPassword(identifier: string, newPassword: string): Promise<void> {
		try {
			log.info(`Resetting password for user: ${identifier}`);

			// Find user
			const user = await User.findOne({
				$or: [{ username: identifier }, { email: identifier }],
			});

			if (!user) {
				log.error(`User not found: ${identifier}`);
				return;
			}

			// Hash new password (let User model handle it via pre-save middleware)
			user.password = newPassword; // Don't hash here - let middleware handle it
			await user.save();

			log.success('Password reset successfully!');
			log.data(`User: ${user.username} (${user.email})`);
			log.data(`New Password: ${newPassword}`);

		} catch (error) {
			log.error('Failed to reset password');
			console.error(error);
		}
	}

	// Test JWT token validation
	async testAuth(token: string): Promise<void> {
		try {
			log.info('Testing JWT token validation...');

			// Decode token
			const decoded = jwt.verify(token, this.jwtSecret) as any;

			log.header('Token Payload:');
			log.data(`User ID: ${decoded.userId}`);
			log.data(`Username: ${decoded.username || 'N/A'}`);
			log.data(`Email: ${decoded.email || 'N/A'}`);
			log.data(`Role: ${decoded.role || 'N/A'}`);
			log.data(`Issued At: ${new Date(decoded.iat * 1000)}`);
			log.data(`Expires At: ${new Date(decoded.exp * 1000)}`);

			// Try to find user by different methods since there's a schema mismatch
			let user = null;

			// First try by numeric id (our CLI schema)
			if (!isNaN(Number(decoded.userId))) {
				user = await User.findOne({ id: Number(decoded.userId) }).select('-password');
			}

			// If not found, try by MongoDB _id (API server schema)
			if (!user && decoded.userId) {
				try {
					user = await User.findById(decoded.userId).select('-password');
				} catch {
					// Invalid ObjectId format, ignore
				}
			}

			// If still not found, try by username
			if (!user && decoded.username) {
				user = await User.findOne({ username: decoded.username }).select('-password');
			}

			if (!user) {
				log.error('User not found for token - there may be a schema mismatch between API and CLI');
				log.warn('This suggests the API server and CLI are using different user ID formats');
				return;
			}

			log.success('Token is valid and user found!');
			console.log();
			log.header('Current User Data:');
			log.data(`User ID: ${user.id}`);
			log.data(`Name: ${user.name}`);
			log.data(`Username: ${user.username}`);
			log.data(`Email: ${user.email}`);
			log.data(`Role: ${user.role}`);
			log.data(`Interests: [${user.interests.join(', ')}]`);

		} catch (error) {
			if (error instanceof jwt.TokenExpiredError) {
				log.error('Token has expired');
			} else if (error instanceof jwt.JsonWebTokenError) {
				log.error('Invalid token');
			} else {
				log.error('Token validation failed');
				console.error(error);
			}
		}
	}

	// Bulk create test users
	async bulkCreateUsers(count: number, role: string = 'user'): Promise<void> {
		try {
			log.info(`Creating ${count} test users with role: ${role}`);

			// Validate role
			if (!['user', 'admin', 'moderator'].includes(role)) {
				log.error(`Invalid role "${role}". Must be: user, admin, or moderator`);
				return;
			}

			const users = [];
			const lastUser = await User.findOne().sort({ id: -1 });
			let nextId = (lastUser?.id || 0) + 1;

			for (let i = 0; i < count; i++) {
				const userNum = i + 1;

				users.push({
					id: nextId++,
					name: `Test User ${userNum}`,
					username: `testuser${userNum}`,
					email: `testuser${userNum}@example.com`,
					password: 'password123', // Let User model hash this via pre-save middleware
					role: role,
					interests: [1, 2, 3], // Default test interests
				});
			}

			await User.insertMany(users);

			log.success(`Created ${count} test users successfully!`);
			log.data(`Username pattern: testuser1, testuser2, ..., testuser${count}`);
			log.data('Email pattern: testuser1@example.com, testuser2@example.com, ...');
			log.data('Password: password123 (for all users)');
			log.data(`Role: ${role} (for all users)`);
			log.data('Default interests: [1, 2, 3]');

		} catch (error) {
			log.error('Failed to create test users');
			console.error(error);
		}
	}

	// Cleanup test users
	async cleanupTestUsers(): Promise<void> {
		try {
			log.info('Cleaning up test users...');

			const result = await User.deleteMany({
				username: /^testuser\d+$/,
				email: /^testuser\d+@example\.com$/,
			});

			log.success(`Deleted ${result.deletedCount} test users`);

		} catch (error) {
			log.error('Failed to cleanup test users');
			console.error(error);
		}
	}

	// Display help
	displayHelp(): void {
		console.log(`
${colors.cyan}${colors.bright}🏛️  Atlas User Management & Authentication CLI${colors.reset}

${colors.bright}USAGE:${colors.reset}
  npx tsx src/backend/dev/users.ts [command] [options]

${colors.bright}COMMANDS:${colors.reset}
  ${colors.green}add <username> <email> [password] [role] [interests]${colors.reset}
	Add new user (default password: password123, role: user)
	
  ${colors.red}delete <username|email|id>${colors.reset}
	Delete user by username, email, or user ID
	
  ${colors.blue}list [role] [limit]${colors.reset}
	List users, optionally filter by role (default limit: 10)
	
  ${colors.yellow}login-db <username> <password>${colors.reset}
	Test login directly against database with JWT generation
	
  ${colors.yellow}login-api <username> <password> [apiUrl]${colors.reset}
	Test login via API endpoint (default: http://localhost:3001)
	
  ${colors.magenta}info <username|email|id>${colors.reset}
	Get detailed user information
	
  ${colors.cyan}promote <username|email|id> <role>${colors.reset}
	Change user role (user, admin, moderator)
	
  ${colors.white}reset-password <username|email> <newPassword>${colors.reset}
	Reset user password
	
  ${colors.green}test-auth <token>${colors.reset}
	Validate JWT token and show payload
	
  ${colors.blue}bulk-create <count> [role]${colors.reset}
	Create multiple test users (default role: user)
	
  ${colors.red}cleanup-test${colors.reset}
	Remove all test users created with bulk-create

${colors.bright}EXAMPLES:${colors.reset}
  ${colors.yellow}npx tsx src/backend/dev/users.ts add johndoe john@example.com${colors.reset}
  ${colors.yellow}npx tsx src/backend/dev/users.ts add admin admin@atlas.com secret123 admin "1,2,3,4"${colors.reset}
  ${colors.yellow}npx tsx src/backend/dev/users.ts delete johndoe${colors.reset}
  ${colors.yellow}npx tsx src/backend/dev/users.ts login-db johndoe password123${colors.reset}
  ${colors.yellow}npx tsx src/backend/dev/users.ts login-api johndoe password123 http://localhost:3001${colors.reset}
  ${colors.yellow}npx tsx src/backend/dev/users.ts promote johndoe admin${colors.reset}
  ${colors.yellow}npx tsx src/backend/dev/users.ts list admin 5${colors.reset}
  ${colors.yellow}npx tsx src/backend/dev/users.ts bulk-create 10 user${colors.reset}

${colors.bright}AUTHENTICATION TESTING:${colors.reset}
  ${colors.blue}Database Test:${colors.reset} Tests authentication logic directly against MongoDB
  ${colors.blue}API Test:${colors.reset} Tests the full API endpoint including middleware, validation, etc.
  ${colors.blue}Token Validation:${colors.reset} Verifies JWT tokens work correctly with your secret
		`);
	}

	async close(): Promise<void> {
		await mongoose.connection.close();
		log.success('Database connection closed');
	}
}

// Main CLI execution
async function main(): Promise<void> {
	const cli = new UserManagementCLI();
	await cli.init();

	const args = process.argv.slice(2);
	const command = args[0];

	try {
		switch (command) {
			case 'add':
				if (args.length < 3) {
					log.error('Usage: add <username> <email> [password] [role] [interests]');
					break;
				}
				await cli.addUser(args[1], args[2], args[3], args[4], args[5]);
				break;

			case 'delete':
				if (args.length < 2) {
					log.error('Usage: delete <username|email|id>');
					break;
				}
				await cli.deleteUser(args[1]);
				break;

			case 'list':
				await cli.listUsers(args[1], parseInt(args[2]) || 10);
				break;

			case 'login-db':
				if (args.length < 3) {
					log.error('Usage: login-db <username> <password>');
					break;
				}
				await cli.testDatabaseLogin(args[1], args[2]);
				break;

			case 'login-api':
				if (args.length < 3) {
					log.error('Usage: login-api <username> <password> [apiUrl]');
					break;
				}
				await cli.testAPILogin(args[1], args[2], args[3]);
				break;

			case 'info':
				if (args.length < 2) {
					log.error('Usage: info <username|email|id>');
					break;
				}
				await cli.getUserInfo(args[1]);
				break;

			case 'promote':
				if (args.length < 3) {
					log.error('Usage: promote <username|email|id> <role>');
					break;
				}
				await cli.promoteUser(args[1], args[2]);
				break;

			case 'reset-password':
				if (args.length < 3) {
					log.error('Usage: reset-password <username|email> <newPassword>');
					break;
				}
				await cli.resetPassword(args[1], args[2]);
				break;

			case 'test-auth':
				if (args.length < 2) {
					log.error('Usage: test-auth <token>');
					break;
				}
				await cli.testAuth(args[1]);
				break;

			case 'bulk-create':
				if (args.length < 2) {
					log.error('Usage: bulk-create <count> [role]');
					break;
				}
				await cli.bulkCreateUsers(parseInt(args[1]), args[2]);
				break;

			case 'cleanup-test':
				await cli.cleanupTestUsers();
				break;

			case 'help':
			case '--help':
			case '-h':
			default:
				cli.displayHelp();
				break;
		}
	} catch (error) {
		log.error('Command execution failed');
		console.error(error);
	} finally {
		await cli.close();
	}
}

// Export for potential module usage
export { UserManagementCLI };

// Run the CLI if called directly
if (require.main === module) {
	main().catch(console.error);
}
