#!/usr/bin/env node

/**
 * Quick Registration Test
 * Tests user registration with a name containing spaces
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testRegistration() {
	console.log('🧪 Testing User Registration with Space in Name...');

	const testUser = {
		name: 'Thandi Menelas',
		username: 'thandi' + Date.now(),
		email: `thandi${Date.now()}@example.com`,
		password: 'password123',
	};

	try {
		const response = await axios.post(`${API_BASE}/api/auth/register`, testUser);

		if (response.data.success && response.data.data.user) {
			console.log('✅ Registration SUCCESS!');
			console.log(`   User: ${response.data.data.user.name}`);
			console.log(`   Username: ${response.data.data.user.username}`);
			console.log(`   Email: ${response.data.data.user.email}`);
			console.log(`   Token: ${response.data.data.tokens.accessToken.substring(0, 20)}...`);
			return true;
		}
	} catch (error) {
		console.log('❌ Registration FAILED:');
		if (error.response?.data?.message) {
			console.log(`   Error: ${error.response.data.message}`);
		} else if (error.response?.data?.details) {
			console.log(`   Details: ${error.response.data.details}`);
		} else {
			console.log(`   Error: ${error.message}`);
		}
		return false;
	}
}

async function testAuthValidation() {
	console.log('\n🧪 Testing Auth Session Validation...');

	try {
		// First register a user to get a token
		const testUser = {
			name: 'Test User',
			username: 'testuser' + Date.now(),
			email: `test${Date.now()}@example.com`,
			password: 'password123',
		};

		const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, testUser);

		if (!registerResponse.data.success) {
			console.log('❌ Could not register test user');
			return false;
		}

		const token = registerResponse.data.data.tokens.accessToken;

		// Test session validation
		const sessionResponse = await axios.get(`${API_BASE}/api/auth/session`, {
			headers: {
				'Authorization': `Bearer ${token}`,
			},
		});

		if (sessionResponse.data.success && sessionResponse.data.data.tokenValid) {
			console.log('✅ Session Validation SUCCESS!');
			console.log(`   User: ${sessionResponse.data.data.user.name}`);
			console.log(`   Token Valid: ${sessionResponse.data.data.tokenValid}`);
			return true;
		} else {
			console.log('❌ Session validation failed');
			return false;
		}
	} catch (error) {
		console.log('❌ Session Validation FAILED:');
		console.log(`   Error: ${error.response?.data?.message || error.message}`);
		return false;
	}
}

async function runTests() {
	console.log('🎯 Running Authentication Integration Tests\n');

	const results = [];

	results.push(await testRegistration());
	results.push(await testAuthValidation());

	const passed = results.filter(Boolean).length;
	const total = results.length;

	console.log(`\n📊 Results: ${passed}/${total} tests passed`);

	if (passed === total) {
		console.log('🎉 All tests PASSED!');
		process.exit(0);
	} else {
		console.log('⚠️  Some tests FAILED');
		process.exit(1);
	}
}

if (require.main === module) {
	runTests().catch(error => {
		console.error('💥 Test runner crashed:', error);
		process.exit(1);
	});
}