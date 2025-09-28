#!/usr/bin/env node

/**
 * Atlas Integration Test Script
 * Tests the full authentication and API integration flow
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001';
const FRONTEND_BASE = 'http://localhost:3000';

// Colors for console output
const colors = {
	green: '\x1b[32m',
	red: '\x1b[31m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	reset: '\x1b[0m',
};

function log(message, color = colors.reset) {
	console.log(`${color}${message}${colors.reset}`);
}

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAPIHealthCheck() {
	log('\n🔍 Testing API Health Check...', colors.blue);
	try {
		const response = await axios.get(`${API_BASE}/health`);
		if (response.data.success) {
			log('✅ API Health Check: PASSED', colors.green);
			log(`   Database: ${response.data.database.connected ? 'Connected' : 'Disconnected'}`);
			return true;
		}
	} catch (error) {
		log('❌ API Health Check: FAILED', colors.red);
		log(`   Error: ${error.message}`);
		return false;
	}
}

async function testUserRegistration() {
	log('\n🔍 Testing User Registration...', colors.blue);
	try {
		const testUser = {
			name: 'Test User',
			username: 'testuser' + Date.now(),
			email: `test${Date.now()}@example.com`,
			password: 'password123',
		};

		const response = await axios.post(`${API_BASE}/api/auth/register`, testUser);

		if (response.data.success && response.data.data.user) {
			log('✅ User Registration: PASSED', colors.green);
			log(`   User ID: ${response.data.data.user.id}`);
			log(`   Username: ${response.data.data.user.username}`);
			log(`   Access Token: ${response.data.data.tokens.accessToken.substring(0, 20)}...`);
			return response.data.data;
		}
	} catch (error) {
		log('❌ User Registration: FAILED', colors.red);
		log(`   Error: ${error.response?.data?.message || error.message}`);
		return null;
	}
}

async function testUserLogin(username, password) {
	log('\n🔍 Testing User Login...', colors.blue);
	try {
		const response = await axios.post(`${API_BASE}/api/auth/login`, {
			username,
			password,
		});

		if (response.data.success && response.data.data.user) {
			log('✅ User Login: PASSED', colors.green);
			log(`   User ID: ${response.data.data.user.id}`);
			log(`   Access Token: ${response.data.data.tokens.accessToken.substring(0, 20)}...`);
			return response.data.data;
		}
	} catch (error) {
		log('❌ User Login: FAILED', colors.red);
		log(`   Error: ${error.response?.data?.message || error.message}`);
		return null;
	}
}

async function testProtectedRoute(accessToken) {
	log('\n🔍 Testing Protected Route (/api/auth/me)...', colors.blue);
	try {
		const response = await axios.get(`${API_BASE}/api/auth/me`, {
			headers: {
				'Authorization': `Bearer ${accessToken}`,
			},
		});

		if (response.data.success && response.data.data.user) {
			log('✅ Protected Route: PASSED', colors.green);
			log(`   User: ${response.data.data.user.name}`);
			return true;
		}
	} catch (error) {
		log('❌ Protected Route: FAILED', colors.red);
		log(`   Error: ${error.response?.data?.message || error.message}`);
		return false;
	}
}

async function testEventsAPI(accessToken) {
	log('\n🔍 Testing Events API...', colors.blue);
	try {
		const response = await axios.get(`${API_BASE}/api/events?limit=5`, {
			headers: {
				'Authorization': `Bearer ${accessToken}`,
			},
		});

		if (response.data.success && response.data.data.events) {
			log('✅ Events API: PASSED', colors.green);
			log(`   Events returned: ${response.data.data.events.length}`);
			return true;
		}
	} catch (error) {
		log('❌ Events API: FAILED', colors.red);
		log(`   Error: ${error.response?.data?.message || error.message}`);
		return false;
	}
}

async function testOrganizationsAPI(accessToken) {
	log('\n🔍 Testing Organizations API...', colors.blue);
	try {
		const response = await axios.get(`${API_BASE}/api/organizations?limit=5`, {
			headers: {
				'Authorization': `Bearer ${accessToken}`,
			},
		});

		if (response.data.success && response.data.data.organizations) {
			log('✅ Organizations API: PASSED', colors.green);
			log(`   Organizations returned: ${response.data.data.organizations.length}`);
			return true;
		}
	} catch (error) {
		log('❌ Organizations API: FAILED', colors.red);
		log(`   Error: ${error.response?.data?.message || error.message}`);
		return false;
	}
}

async function testFrontendHealth() {
	log('\n🔍 Testing Frontend Health...', colors.blue);
	try {
		const response = await axios.get(FRONTEND_BASE, { timeout: 5000 });
		if (response.status === 200) {
			log('✅ Frontend Health: PASSED', colors.green);
			return true;
		}
	} catch (error) {
		log('❌ Frontend Health: FAILED', colors.red);
		log(`   Error: ${error.message}`);
		log('   Make sure the frontend development server is running on port 3000');
		return false;
	}
}

async function runIntegrationTests() {
	log('🎯 Atlas Integration Tests Started', colors.blue);
	log('=' .repeat(50));

	const results = [];

	// Test API Health
	results.push(await testAPIHealthCheck());

	// Test Frontend Health
	results.push(await testFrontendHealth());

	// Test Registration Flow
	const registrationData = await testUserRegistration();
	results.push(!!registrationData);

	if (registrationData) {
		const { user, tokens } = registrationData;

		// Test Login Flow
		const loginData = await testUserLogin(user.username, 'password123');
		results.push(!!loginData);

		const accessToken = loginData ? loginData.tokens.accessToken : tokens.accessToken;

		// Test Protected Routes
		results.push(await testProtectedRoute(accessToken));

		// Test API Endpoints
		results.push(await testEventsAPI(accessToken));
		results.push(await testOrganizationsAPI(accessToken));
	} else {
		results.push(false, false, false, false); // Skip dependent tests
	}

	// Summary
	log('\n' + '=' .repeat(50));
	log('📊 Test Results Summary:', colors.blue);

	const passed = results.filter(Boolean).length;
	const total = results.length;

	log(`   Passed: ${passed}/${total}`, passed === total ? colors.green : colors.yellow);

	if (passed === total) {
		log('🎉 All tests PASSED! Atlas integration is working correctly.', colors.green);
		process.exit(0);
	} else {
		log('⚠️  Some tests FAILED. Please check the errors above.', colors.yellow);
		process.exit(1);
	}
}

// Run the tests
if (require.main === module) {
	runIntegrationTests().catch(error => {
		log('💥 Integration tests crashed:', colors.red);
		console.error(error);
		process.exit(1);
	});
}

module.exports = { runIntegrationTests };