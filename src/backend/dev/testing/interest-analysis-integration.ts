/**
 * Example usage of the Interest Analysis system
 * Shows how to integrate with the existing database schemas
 */

import { GeminiService } from './src/backend/modules/ai/gemini';
import config from './src/config';

// Example: Creating user interests from natural language input
async function createUserInterestProfile(userId: string, interestInputs: string[]) {
	const geminiService = new GeminiService();
	const userInterests = [];

	for (const input of interestInputs) {
		try {
			// Analyze the interest
			const result = await geminiService.analyzeInterest({
				interestKeyword: input,
				userDescription: `User is interested in ${input}`,
			});

			// Convert to database format (matches Interest schema)
			const interest = {
				id: Date.now() + Math.random(), // Generate unique ID
				keyword: result.suggestedInterestName || input,
				linkedTags: result.tags.map((tag: any) => ({
					tagId: tag.tagId,
					weight: tag.weight, // Use AI-determined weight
				})),
				isUserGenerated: true,
				createdBy: userId,
				createdAt: new Date(),
			};

			userInterests.push(interest);

			console.log(`✅ Created interest: "${interest.keyword}" with ${interest.linkedTags.length} tags`);
		} catch (error) {
			console.error(`❌ Failed to analyze interest "${input}":`, error);
		}
	}

	return userInterests;
}

// Example: Finding matching content based on user interests
async function findMatchingContent(userInterests: any[]) {
	// Extract high-weight user tags
	const userTagWeights = new Map<number, number>();

	userInterests.forEach(interest => {
		interest.linkedTags.forEach((linkedTag: any) => {
			const currentWeight = userTagWeights.get(linkedTag.tagId) || 0;
			// Use maximum weight if user has multiple interests with the same tag
			userTagWeights.set(linkedTag.tagId, Math.max(currentWeight, linkedTag.weight));
		});
	});

	// Find primary tags with weight >= 0.7 (matches our AI threshold)
	const primaryTagIds = Array.from(userTagWeights.entries())
		.filter(([, weight]) => weight >= config.ai.tagging.confidenceThreshold)
		.map(([tagId]) => tagId);

	console.log(`🎯 User has high interest in ${primaryTagIds.length} primary categories`);

	// This would be used in database queries like the ones in our handler
	const matchQuery = {
		$or: [
			// High-weight primary tag matches
			{
				'tags.tagId': { $in: primaryTagIds },
				'tags.category': 'primary',
				'tags.weight': { $gte: 0.7 },
			},
			// Secondary tag matches for relevant primary categories
			{
				'tags.parentTagId': { $in: primaryTagIds },
				'tags.category': 'secondary',
				'tags.weight': { $gte: 0.6 },
			},
		],
	};

	return matchQuery;
}

// Example usage
export async function demonstrateInterestAnalysis() {
	console.log('🎯 Interest Analysis Integration Example\n');

	const sampleInterests = [
		'machine learning',
		'game development',
		'environmental sustainability',
		'music production',
	];

	console.log('📝 Sample user interests:', sampleInterests);

	// Step 1: Create AI-powered interest profile
	console.log('\n🧠 Step 1: Analyzing interests with AI...');
	const userInterests = await createUserInterestProfile('user123', sampleInterests);

	// Step 2: Generate matching query
	console.log('\n🔍 Step 2: Generating content matching query...');
	const matchQuery = await findMatchingContent(userInterests);

	console.log('📊 Generated MongoDB query for recommendations:');
	console.log(JSON.stringify(matchQuery, null, 2));

	// Step 3: Show interest profile summary
	console.log('\n👤 User Interest Profile Summary:');
	userInterests.forEach((interest, index) => {
		console.log(`${index + 1}. "${interest.keyword}"`);
		console.log(`   Tags: ${interest.linkedTags.length} (avg weight: ${
			(interest.linkedTags.reduce((sum: number, tag: any) => sum + tag.weight, 0) / interest.linkedTags.length).toFixed(2)
		})`);
	});

	console.log('\n✅ Interest analysis integration ready!');
	console.log('🔗 This integrates with:');
	console.log('   • Database Interest schema (weighted tags)');
	console.log('   • Recommendation algorithms (handler.ts)');
	console.log('   • Content matching queries (events, orgs, labs)');
	console.log('   • User profile creation workflows');
}

// Uncomment to run demo
// demonstrateInterestAnalysis().catch(console.error);