#!/usr/bin/env tsx

/**
 * Test script for the new hierarchical AI-powered recommendation system
 * This script tests the GeminiService integration with our database schemas
 */

import { GeminiService } from '../modules/ai/gemini';
import config from '../../config';

// Test content examples
const testEvents = [
	{
		title: 'Machine Learning Workshop',
		description: 'Join us for an intensive workshop on machine learning fundamentals, covering neural networks, deep learning, and practical applications. This hands-on session will include coding exercises and real-world projects.',
		additionalContext: {
			department: 'Computer Science',
			eventType: 'workshop',
		},
	},
	{
		title: 'Knight Hacks Hackathon',
		description: 'UCF\'s premier hackathon event where students collaborate to build innovative software solutions. Teams compete for prizes while learning new technologies and networking with industry professionals.',
		additionalContext: {
			department: 'Student Life',
			eventType: 'competition',
		},
	},
	{
		title: 'Yoga in the Park',
		description: 'Free outdoor yoga session for UCF students and faculty. All skill levels welcome. Bring your own mat and water. Led by certified instructor focusing on stress relief and mindfulness.',
		additionalContext: {
			location: 'Memory Mall',
			eventType: 'wellness',
		},
	},
];

async function testAIIntegration() {
	console.log('🧪 Testing AI-Powered Hierarchical Tag Assignment System\n');

	// Check configuration
	console.log('📋 Configuration Check:');
	console.log(`   Model: ${config.ai.gemini.model}`);
	console.log(`   Max Tags: ${config.ai.tagging.maxTagsPerItem}`);
	console.log(`   Confidence Threshold: ${config.ai.tagging.confidenceThreshold}`);
	console.log(`   API Key: ${config.ai.gemini.apiKey ? '✅ Configured' : '❌ Missing'}\n`);

	if (!config.ai.gemini.apiKey) {
		console.error('❌ GEMINI_API_KEY is not configured. Please set it in your environment.');
		console.log('   export GEMINI_API_KEY="your-api-key-here"');
		return;
	}

	try {
		// Initialize Gemini service
		console.log('🚀 Initializing GeminiService...');
		const geminiService = new GeminiService();
		console.log('✅ GeminiService initialized successfully\n');

		// Test individual content analysis
		console.log('🔍 Testing Individual Content Analysis:');
		console.log('─'.repeat(50));

		for (let i = 0; i < testEvents.length; i++) {
			const event = testEvents[i];
			console.log(`\n${i + 1}. Analyzing: "${event.title}"`);

			try {
				const result = await geminiService.analyzeContent(event);

				console.log(`   ✅ Analysis successful (confidence: ${result.confidence})`);
				console.log(`   📊 Tags assigned (${result.tags.length}):`);

				result.tags.forEach((tag, index) => {
					const parentInfo = tag.parentTagId ? ` → Parent: ${tag.parentTagId}` : '';
					console.log(`      ${index + 1}. ID:${tag.tagId} (${tag.category}) - Weight: ${tag.weight}${parentInfo}`);
				});

			} catch (error) {
				console.error(`   ❌ Analysis failed: ${error}`);
			}
		}

		// Test batch processing
		console.log('\n\n🔄 Testing Batch Analysis:');
		console.log('─'.repeat(50));

		const batchResults = await geminiService.batchAnalyze(testEvents);

		console.log('\n✅ Batch processing complete!');
		console.log(`📊 Results: ${batchResults.length}/${testEvents.length} successful`);

		// Calculate statistics
		const totalTags = batchResults.reduce((sum, result) => sum + result.tags.length, 0);
		const avgConfidence = batchResults.reduce((sum, result) => sum + result.confidence, 0) / batchResults.length;
		const primaryTags = batchResults.reduce((sum, result) =>
			sum + result.tags.filter(tag => tag.category === 'primary').length, 0);
		const secondaryTags = batchResults.reduce((sum, result) =>
			sum + result.tags.filter(tag => tag.category === 'secondary').length, 0);

		console.log('\n📈 Analysis Statistics:');
		console.log(`   Total tags assigned: ${totalTags}`);
		console.log(`   Primary tags: ${primaryTags}`);
		console.log(`   Secondary tags: ${secondaryTags}`);
		console.log(`   Average confidence: ${avgConfidence.toFixed(3)}`);
		console.log(`   Model used: ${batchResults[0]?.modelUsed || 'N/A'}`);

	} catch (error) {
		console.error('❌ Test failed:', error);
		process.exit(1);
	}
}

// Run the test
testAIIntegration()
	.then(() => {
		console.log('\n✅ AI Integration test completed successfully!');
		process.exit(0);
	})
	.catch((error) => {
		console.error('\n❌ AI Integration test failed:', error);
		process.exit(1);
	});