#!/usr/bin/env node

/**
 * Auth Flow Test
 * Tests the complete authentication flow including login with existing users
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testExistingUserLogin() {
	console.log('🧪 Testing login with existing user...');

	// Try to login with the user mentioned in the error log
	const credentials = {
		username: 'RealStr1ke',
		password: 'password123', // Common test password
	};

	try {
		const response = await axios.post(`${API_BASE}/api/auth/login`, credentials);

		if (response.data.success && response.data.data.user) {
			console.log('✅ Login SUCCESS!');
			console.log(`   User: ${response.data.data.user.name}`);
			console.log(`   Username: ${response.data.data.user.username}`);
			console.log(`   Token: ${response.data.data.tokens.accessToken.substring(0, 20)}...`);
			return { success: true, token: response.data.data.tokens.accessToken };
		}
	} catch (error) {
		console.log('❌ Login FAILED:');
		if (error.response?.data?.message) {
			console.log(`   Error: ${error.response.data.message}`);
		} else {
			console.log(`   Error: ${error.message}`);
		}
		return { success: false, error: error.response?.data?.message || error.message };
	}
}

async function testCreateAndLogin() {
	console.log('\n🧪 Testing create user and immediate login...');

	const timestamp = Date.now();
	const testUser = {
		name: `Test User ${timestamp}`,
		username: `testuser${timestamp}`,
		email: `test${timestamp}@example.com`,
		password: 'password123',
	};

	try {
		// Register user
		console.log('   📝 Registering new user...');
		const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, testUser);

		if (!registerResponse.data.success) {
			console.log('❌ Registration failed');
			return { success: false };
		}

		console.log('   ✅ Registration successful');

		// Test immediate login
		console.log('   🔐 Testing immediate login...');
		const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
			username: testUser.username,
			password: testUser.password,
		});

		if (loginResponse.data.success && loginResponse.data.data.user) {
			console.log('✅ Immediate login SUCCESS!');
			console.log(`   User: ${loginResponse.data.data.user.name}`);
			return { success: true, token: loginResponse.data.data.tokens.accessToken };
		}
	} catch (error) {
		console.log('❌ Create and login test FAILED:');
		console.log(`   Error: ${error.response?.data?.message || error.message}`);
		return { success: false };
	}
}

async function testSessionValidation(token) {
	console.log('\n🧪 Testing session validation...');

	try {
		const response = await axios.get(`${API_BASE}/api/auth/session`, {
			headers: {
				'Authorization': `Bearer ${token}`,
			},
		});

		if (response.data.success && response.data.data.tokenValid) {
			console.log('✅ Session validation SUCCESS!');
			console.log(`   User: ${response.data.data.user.name}`);
			return { success: true };
		}
	} catch (error) {
		console.log('❌ Session validation FAILED:');
		console.log(`   Error: ${error.response?.data?.message || error.message}`);
		return { success: false };
	}
}

async function runTests() {
	console.log('🎯 Running Complete Auth Flow Tests\n');

	const results = [];

	// Test 1: Try login with existing problematic user
	const existingUserResult = await testExistingUserLogin();
	results.push(existingUserResult.success);

	// Test 2: Create new user and test immediate login
	const newUserResult = await testCreateAndLogin();
	results.push(newUserResult.success);

	// Test 3: Session validation with a valid token
	if (newUserResult.success && newUserResult.token) {
		const sessionResult = await testSessionValidation(newUserResult.token);
		results.push(sessionResult.success);
	} else {
		results.push(false);
	}

	const passed = results.filter(Boolean).length;
	const total = results.length;

	console.log(`\n📊 Results: ${passed}/${total} tests passed`);

	if (passed === total) {
		console.log('🎉 All authentication tests PASSED!');
		console.log('✅ Backend authentication is working correctly');
		console.log('✅ Frontend can now safely authenticate users');
		process.exit(0);
	} else {
		console.log('⚠️  Some tests FAILED - please check the issues above');
		process.exit(1);
	}
}

if (require.main === module) {
	runTests().catch(error => {
		console.error('💥 Test runner crashed:', error.message);
		process.exit(1);
	});
}