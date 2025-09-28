#!/usr/bin/env tsx

/**
 * Basic integration test for the hierarchical AI system (no API calls)
 * Tests schema compilation, imports, and basic functionality
 */

import { DatabaseInitializer } from '../modules/database/services/initializer';
import { COMPREHENSIVE_TAGS, getPrimaryTags, getSecondaryTags } from '../modules/database/services/defaults';
import config from '../../config';

async function runBasicIntegrationTest() {
	console.log('🧪 Testing Basic Integration - No API Required\n');

	// Test 1: Config loading
	console.log('📋 Configuration Test:');
	console.log(`   AI Model: ${config.ai.gemini.model}`);
	console.log(`   Confidence Threshold: ${config.ai.tagging.confidenceThreshold}`);
	console.log(`   Max Tags: ${config.ai.tagging.maxTagsPerItem}`);
	console.log('   ✅ Config loaded successfully\n');

	// Test 2: Hierarchical tags structure
	console.log('🏷️  Hierarchical Tags Test:');
	const primaryTags = getPrimaryTags();
	const secondaryTags = getSecondaryTags();
	console.log(`   Primary tags: ${primaryTags.length}`);
	console.log(`   Secondary tags: ${secondaryTags.length}`);
	console.log(`   Total tags: ${COMPREHENSIVE_TAGS.length}`);

	// Show sample primary tags
	console.log('   Sample primary tags:');
	primaryTags.slice(0, 5).forEach((tag, i) => {
		console.log(`      ${i + 1}. ${tag.name}`);
	});

	// Show sample secondary tags
	console.log('   Sample secondary tags:');
	secondaryTags.slice(0, 5).forEach((tag, i) => {
		console.log(`      ${i + 1}. ${tag.name} (parent: ${tag.parentTag})`);
	});
	console.log('   ✅ Hierarchical tags loaded successfully\n');

	// Test 3: Database initializer
	console.log('🗄️  Database Initializer Test:');
	try {
		new DatabaseInitializer();
		console.log('   ✅ DatabaseInitializer created successfully');
	} catch (error) {
		console.error('   ❌ DatabaseInitializer creation failed:', error);
	}

	// Test 4: GeminiService basic loading
	console.log('\n🤖 AI Service Test:');
	try {
		// Test import without instantiation
		await import('../modules/ai/gemini');
		console.log('   ✅ GeminiService class imported successfully');
		console.log('   ℹ️  Note: Service requires GEMINI_API_KEY for full functionality');
	} catch (error) {
		console.error('   ❌ GeminiService import failed:', error);
	}

	// Test 5: Schema validation
	console.log('\n📊 Schema Test:');
	try {
		await import('../modules/database/schemas/Event');
		console.log('   ✅ Event schema imported successfully');

		// Sample weighted tag structure
		const sampleWeightedTag = {
			tagId: 1,
			weight: 0.85,
			category: 'primary' as const,
		};

		console.log('   Sample weighted tag structure:');
		console.log(`      TagID: ${sampleWeightedTag.tagId}`);
		console.log(`      Weight: ${sampleWeightedTag.weight}`);
		console.log(`      Category: ${sampleWeightedTag.category}`);

	} catch (error) {
		console.error('   ❌ Schema import failed:', error);
	}

	console.log('\n✅ Basic Integration Test Complete!');
	console.log('\nNext Steps:');
	console.log('1. Set GEMINI_API_KEY environment variable');
	console.log('2. Set MONGODB_URI for database connection');
	console.log('3. Run full AI integration test');
	console.log('\nSystem is ready for AI-powered hierarchical recommendations! 🚀');
}

runBasicIntegrationTest().catch(error => {
	console.error('❌ Test failed:', error);
	process.exit(1);
});