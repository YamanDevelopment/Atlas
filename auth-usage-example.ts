#!/usr/bin/env ts-node
/**
 * Atlas Authentication System Usage Example
 *
 * This shows you exactly how to integrate the auth system into your Express app
 */

// First, you'd install the required packages:
// npm install express jsonwebtoken bcryptjs joi

// Then create your Express app like this:

/*
import express from 'express';
import cors from 'cors';
import {
	authRoutes,
	userRoutes,
	requireAuth,
	rateLimiters,
	logAuthStartup,
	authConfig
} from './src/backend/modules/auth';

const app = express();

// Log auth system startup
logAuthStartup();

// Basic middleware
app.use(express.json());
app.use(cors(authConfig.security.corsOptions));

// Apply general rate limiting to all routes
app.use(rateLimiters.api);

// Mount authentication routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Example protected route
app.get('/api/protected', requireAuth, (req, res) => {
	res.json({
		message: `Hello ${req.user.username}! This is a protected route.`,
		user: req.user,
	});
});

// Example recommendation routes (using your recommendation system)
app.get('/api/recommendations/events', requireAuth, async (req, res) => {
	try {
		const handler = new Handler(DATABASE_URL);
		const recommendations = await handler.getEventRecommendationsWithDetails(req.user.userId, {
			algorithm: 'hybrid',
			limit: 10,
			includeReasons: true
		});
		res.json(recommendations);
	} catch (error) {
		res.status(500).json({ error: 'Failed to get recommendations' });
	}
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
	console.log(`   • Auth endpoints: http://localhost:${PORT}/auth/*`);
	console.log(`   • User endpoints: http://localhost:${PORT}/users/*`);
	console.log(`   • Protected API: http://localhost:${PORT}/api/*`);
});
*/

console.log('🔐 Atlas Authentication System - Complete Implementation');
console.log('='.repeat(60));
console.log('');

console.log('✅ What I built for you:');
console.log('');

console.log('📁 File Structure:');
console.log('src/backend/modules/auth/');
console.log('├── services/');
console.log('│   ├── jwt.ts           # JWT token management');
console.log('│   └── password.ts      # Password hashing utilities');
console.log('├── middleware/');
console.log('│   ├── auth.ts          # Authentication middleware');
console.log('│   ├── validation.ts    # Input validation');
console.log('│   └── rateLimiting.ts  # Rate limiting protection');
console.log('├── routes/');
console.log('│   ├── auth.ts          # Login/register/logout routes');
console.log('│   └── user.ts          # User profile management');
console.log('├── config.ts            # Configuration settings');
console.log('└── index.ts             # Main export file');
console.log('');

console.log('🔑 Authentication Features:');
console.log('• User Registration with validation');
console.log('• Login with JWT tokens (15min access + 7day refresh)');
console.log('• Password hashing with bcrypt (salt rounds: 12)');
console.log('• Token refresh mechanism');
console.log('• Logout (single device & all devices)');
console.log('• Rate limiting to prevent brute force attacks');
console.log('• Input validation with detailed error messages');
console.log('• User profile management (view/edit/delete)');
console.log('• Interest management (add/remove user interests)');
console.log('• Ownership protection (users can only edit their own data)');
console.log('');

console.log('🛡️ Security Features:');
console.log('• JWT tokens with proper expiration');
console.log('• Password strength validation');
console.log('• Rate limiting (5 login attempts per 15min)');
console.log('• Input sanitization and validation');
console.log('• Protected routes with middleware');
console.log('• Automatic token cleanup');
console.log('');

console.log('📋 API Endpoints:');
console.log('Authentication:');
console.log('  POST /auth/register    - Create new account');
console.log('  POST /auth/login       - Login with username/password');
console.log('  POST /auth/refresh     - Refresh access token');
console.log('  POST /auth/logout      - Logout current device');
console.log('  POST /auth/logout-all  - Logout all devices');
console.log('  GET  /auth/me          - Get current user info');
console.log('');
console.log('User Management:');
console.log('  GET    /users          - Search users (paginated)');
console.log('  GET    /users/:id      - Get user profile');
console.log('  PUT    /users/:id      - Update profile');
console.log('  PUT    /users/:id/password - Change password');
console.log('  DELETE /users/:id      - Delete account');
console.log('  POST   /users/:id/interests - Add interest');
console.log('  DELETE /users/:id/interests/:id - Remove interest');
console.log('');

console.log('🔧 How to use it:');
console.log('');
console.log('1. Install dependencies:');
console.log('   npm install express jsonwebtoken bcryptjs joi');
console.log('');
console.log('2. Set environment variables:');
console.log('   JWT_SECRET=your-super-secret-key-at-least-32-chars');
console.log('   FRONTEND_URL=http://localhost:3000');
console.log('   NODE_ENV=development');
console.log('');
console.log('3. Import and use in your Express app:');
console.log('   import { authRoutes, userRoutes, requireAuth } from "./modules/auth";');
console.log('   app.use("/auth", authRoutes);');
console.log('   app.use("/users", userRoutes);');
console.log('   app.use("/api/protected", requireAuth, yourRoutes);');
console.log('');

console.log('🎯 Example Usage:');
console.log('');
console.log('// Register a new user');
console.log('POST /auth/register');
console.log(JSON.stringify({
	name: 'John Doe',
	username: 'johndoe',
	email: 'john@example.com',
	password: 'SecurePass123!',
}, null, 2));
console.log('');

console.log('// Login');
console.log('POST /auth/login');
console.log(JSON.stringify({
	username: 'johndoe',
	password: 'SecurePass123!',
}, null, 2));
console.log('');

console.log('// Use token in protected routes');
console.log('GET /users/12345');
console.log('Authorization: Bearer <your-access-token>');
console.log('');

console.log('💡 Integration with your recommendation system:');
console.log('You can now protect your recommendation routes like this:');
console.log('');
console.log('app.get("/api/recommendations", requireAuth, async (req, res) => {');
console.log('  const userId = req.user.userId; // Available from JWT token');
console.log('  const recommendations = await handler.getEventRecommendationsWithDetails(userId);');
console.log('  res.json(recommendations);');
console.log('});');
console.log('');

console.log('🎉 Your authentication system is ready to use!');
console.log('   All the database integration already works with your existing User schema');
console.log('   Just install the dependencies and start using the routes');