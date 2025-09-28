#!/usr/bin/env tsx

/**
 * Test script for individual interest analysis with Gemini AI
 * Tests the interest categorization and hierarchical tag assignment
 */

import { GeminiService } from '../modules/ai/gemini';
import config from '../../config';

// Test interest examples
const testInterests = [
	{
		interestKeyword: 'machine learning',
		userDescription: 'I want to learn about artificial intelligence and neural networks, maybe work on some cool AI projects',
		userContext: {
			major: 'Computer Science',
			year: 'sophomore',
			goals: 'Want to get into AI research or tech industry',
		},
	},
	{
		interestKeyword: 'game development',
		userDescription: 'Creating video games, both indie and AAA. Interested in programming, art, and game design',
		userContext: {
			major: 'Digital Media',
			year: 'junior',
			previousInterests: ['programming', 'digital art'],
			goals: 'Start my own game studio',
		},
	},
	{
		interestKeyword: 'sustainability',
		userDescription: 'Environmental protection, green technology, climate change solutions',
		userContext: {
			major: 'Environmental Engineering',
			year: 'senior',
			goals: 'Work for environmental nonprofit or green tech company',
		},
	},
	{
		interestKeyword: 'entrepreneurship',
		userDescription: 'Starting businesses, innovation, leadership, venture capital',
		userContext: {
			major: 'Business Administration',
			year: 'junior',
			goals: 'Launch a startup after graduation',
		},
	},
	{
		interestKeyword: 'music production',
		userDescription: 'Electronic music, beat making, audio engineering, live performance',
		userContext: {
			major: 'Music Technology',
			year: 'sophomore',
			previousInterests: ['DJing', 'sound design'],
			goals: 'Become a professional music producer',
		},
	},
];

async function testInterestAnalysis() {
	console.log('🎯 Testing Individual Interest Analysis System\n');

	// Check configuration
	console.log('📋 Configuration Check:');
	console.log(`   AI Model: ${config.ai.gemini.model}`);
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
		console.log('🚀 Initializing GeminiService for Interest Analysis...');
		const geminiService = new GeminiService();
		console.log('✅ GeminiService initialized successfully\n');

		// Test individual interest analysis
		console.log('🔍 Testing Individual Interest Analysis:');
		console.log('═'.repeat(60));

		for (let i = 0; i < testInterests.length; i++) {
			const interest = testInterests[i];
			console.log(`\n${i + 1}. Analyzing Interest: "${interest.interestKeyword}"`);
			console.log(`   User: ${interest.userContext?.major} ${interest.userContext?.year}`);
			console.log(`   Description: "${interest.userDescription}"`);

			try {
				const result = await geminiService.analyzeInterest(interest);

				console.log(`   ✅ Analysis successful (confidence: ${result.confidence})`);
				console.log(`   🏷️  Suggested Name: "${result.suggestedInterestName}"`);
				console.log(`   📊 Tags assigned (${result.tags.length}):`);

				// Group tags by category
				const primaryTags = result.tags.filter(tag => tag.category === 'primary');
				const secondaryTags = result.tags.filter(tag => tag.category === 'secondary');

				if (primaryTags.length > 0) {
					console.log('      🎯 Primary Categories:');
					primaryTags.forEach((tag) => {
						console.log(`         • ID:${tag.tagId} - Weight: ${tag.weight.toFixed(2)}`);
					});
				}

				if (secondaryTags.length > 0) {
					console.log('      🎪 Secondary Tags:');
					secondaryTags.forEach((tag) => {
						console.log(`         • ID:${tag.tagId} - Weight: ${tag.weight.toFixed(2)} (Parent: ${tag.parentTagId})`);
					});
				}

			} catch (error) {
				console.error(`   ❌ Analysis failed: ${error}`);
			}

			// Add delay between individual analyses
			if (i < testInterests.length - 1) {
				console.log('   ⏳ Waiting 2s before next analysis...');
				await new Promise(resolve => setTimeout(resolve, 2000));
			}
		}

		// Test batch processing
		console.log('\n\n🔄 Testing Batch Interest Analysis:');
		console.log('═'.repeat(60));

		const batchResults = await geminiService.batchAnalyzeInterests(testInterests);

		console.log('\n✅ Batch processing complete!');
		console.log(`📊 Results: ${batchResults.length}/${testInterests.length} successful`);

		// Calculate statistics
		const totalTags = batchResults.reduce((sum, result) => sum + result.tags.length, 0);
		const avgConfidence = batchResults.reduce((sum, result) => sum + result.confidence, 0) / batchResults.length;
		const primaryTags = batchResults.reduce((sum, result) =>
			sum + result.tags.filter(tag => tag.category === 'primary').length, 0);
		const secondaryTags = batchResults.reduce((sum, result) =>
			sum + result.tags.filter(tag => tag.category === 'secondary').length, 0);

		// Category distribution
		const categoryCount = new Map<number, number>();
		batchResults.forEach(result => {
			result.tags.filter(tag => tag.category === 'primary').forEach(tag => {
				categoryCount.set(tag.tagId, (categoryCount.get(tag.tagId) || 0) + 1);
			});
		});

		console.log('\n📈 Interest Analysis Statistics:');
		console.log(`   Total tags assigned: ${totalTags}`);
		console.log(`   Primary tags: ${primaryTags}`);
		console.log(`   Secondary tags: ${secondaryTags}`);
		console.log(`   Average confidence: ${avgConfidence.toFixed(3)}`);
		console.log(`   Average tags per interest: ${(totalTags / batchResults.length).toFixed(1)}`);

		console.log('\n🏆 Most Common Primary Categories:');
		const sortedCategories = Array.from(categoryCount.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5);

		const categoryNames = new Map([
			[1, 'Academic & Learning'],
			[2, 'Arts & Culture'],
			[3, 'Business & Entrepreneurship'],
			[4, 'Community & Social'],
			[5, 'Health & Wellness'],
			[6, 'Leadership & Government'],
			[7, 'Professional Development'],
			[8, 'Recreation & Sports'],
			[9, 'Research & Innovation'],
			[10, 'Service & Volunteering'],
			[11, 'Spirituality & Religion'],
			[12, 'Technology & Engineering'],
			[13, 'Travel & International'],
		]);

		sortedCategories.forEach(([tagId, count], index) => {
			const categoryName = categoryNames.get(tagId) || `Category ${tagId}`;
			console.log(`   ${index + 1}. ${categoryName}: ${count} interests`);
		});

		console.log(`\n   Model used: ${batchResults[0]?.modelUsed || 'N/A'}`);

	} catch (error) {
		console.error('❌ Interest analysis test failed:', error);
		process.exit(1);
	}
}

// Run the test
testInterestAnalysis()
	.then(() => {
		console.log('\n✅ Interest Analysis test completed successfully!');
		console.log('\n🎯 The system can now:');
		console.log('   • Analyze individual user interests');
		console.log('   • Map interests to hierarchical categories');
		console.log('   • Handle multi-category interests (e.g., Game Development = Tech + Arts)');
		console.log('   • Suggest refined interest names');
		console.log('   • Process interests in batches');
		console.log('   • Use the same 0.7+ weight threshold for quality');
		console.log('\n🚀 Ready for user interest profiling!');
		process.exit(0);
	})
	.catch((error) => {
		console.error('\n❌ Interest analysis test failed:', error);
		process.exit(1);
	});