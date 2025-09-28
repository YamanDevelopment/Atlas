#!/usr/bin/env ts-node
import Handler from './src/backend/modules/database/services/handler';
import type { RecommendationOptions } from './src/backend/modules/database/services/recommendations';

// Example usage of the comprehensive recommendation system

const DB_URL = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb+srv://yamandev:jpOko2VPgWzkX5N9@opptrack.fqvreou.mongodb.net/atlas?retryWrites=true&w=majority&appName=OppTrack';

async function demonstrateRecommendationSystem() {
	console.log('🤖 Atlas Recommendation System Demo');
	console.log('='.repeat(50));

	const handler = new Handler(DB_URL);

	try {
		// Wait for database connection
		await new Promise(resolve => setTimeout(resolve, 2000));

		// Example user ID (you'd need to use a real user ID from your database)
		const exampleUserId = '507f1f77bcf86cd799439011'; // Replace with actual user ID

		console.log(`\n📊 Demonstrating recommendation system for user: ${exampleUserId}`);

		// Example 1: Get comprehensive recommendations (all types)
		console.log('\n🌟 COMPREHENSIVE RECOMMENDATIONS (All Types)');
		console.log('-'.repeat(60));

		const comprehensive = await handler.getComprehensiveRecommendations(exampleUserId, {
			limit: 5,
			algorithm: 'hybrid',
			includeReasons: true,
			minScore: 0.2,
		});

		console.log(`📅 Events: ${comprehensive.events?.recommendations.length || 0} recommendations`);
		comprehensive.events?.recommendations.forEach((rec, index) => {
			console.log(`  ${index + 1}. ${rec.event.name} (Score: ${rec.score.score.toFixed(3)})`);
			if (rec.score.reasons.length > 0) {
				console.log(`     Reasons: ${rec.score.reasons.join(', ')}`);
			}
		});

		console.log(`\n🏛️ Organizations: ${comprehensive.organizations?.recommendations.length || 0} recommendations`);
		comprehensive.organizations?.recommendations.forEach((rec, index) => {
			console.log(`  ${index + 1}. ${rec.organization.name} (Score: ${rec.score.score.toFixed(3)})`);
		});

		console.log(`\n🔬 Labs: ${comprehensive.labs?.recommendations.length || 0} recommendations`);
		comprehensive.labs?.recommendations.forEach((rec, index) => {
			console.log(`  ${index + 1}. ${rec.lab.name} (Score: ${rec.score.score.toFixed(3)})`);
		});

		console.log('\n📊 Overall Metrics:');
		console.log(`   Total Processing Time: ${comprehensive.overallMetrics.totalProcessingTimeMs}ms`);
		console.log(`   Total Recommendations: ${comprehensive.overallMetrics.totalRecommendations}`);

		// Example 2: Event-specific recommendations with custom options
		console.log('\n\n🎯 EVENT-SPECIFIC RECOMMENDATIONS');
		console.log('-'.repeat(60));

		const eventOptions: RecommendationOptions = {
			algorithm: 'content-based',
			limit: 3,
			minScore: 0.3,
			includeReasons: true,
			timeRange: {
				start: new Date(),
				end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
			},
		};

		const eventRecs = await handler.getEventRecommendationsWithDetails(exampleUserId, eventOptions);

		console.log(`Found ${eventRecs.recommendations.length} event recommendations:`);
		eventRecs.recommendations.forEach((rec, index) => {
			console.log(`\n${index + 1}. ${rec.event.name}`);
			console.log(`   Score: ${rec.score.score.toFixed(3)} (Confidence: ${rec.score.confidence.toFixed(3)})`);
			console.log(`   Date: ${new Date(rec.event.startTime).toLocaleDateString()}`);
			console.log(`   Location: ${rec.event.location || 'TBD'}`);
			console.log(`   Matched Interests: ${rec.matchedInterests.join(', ') || 'None'}`);
			if (rec.score.reasons.length > 0) {
				console.log(`   Reasons: ${rec.score.reasons.join(', ')}`);
			}
		});

		console.log('\nMetrics:');
		console.log(`   Average Score: ${eventRecs.metrics.averageScore.toFixed(3)}`);
		console.log(`   Coverage Score: ${eventRecs.metrics.coverageScore.toFixed(3)}`);
		console.log(`   Processing Time: ${eventRecs.metrics.processingTimeMs}ms`);
		console.log(`   Algorithms Used: ${eventRecs.metrics.algorithmsUsed.join(', ')}`);

		// Example 3: Different algorithm comparison
		console.log('\n\n🔄 ALGORITHM COMPARISON');
		console.log('-'.repeat(60));

		const algorithms: ('content-based' | 'collaborative' | 'hybrid')[] = ['content-based', 'hybrid'];

		for (const algorithm of algorithms) {
			console.log(`\n🧠 Testing ${algorithm.toUpperCase()} algorithm:`);
			const results = await handler.getEventRecommendationsWithDetails(exampleUserId, {
				algorithm,
				limit: 3,
				minScore: 0.1,
			});

			console.log(`   Recommendations: ${results.recommendations.length}`);
			console.log(`   Average Score: ${results.metrics.averageScore.toFixed(3)}`);
			console.log(`   Processing Time: ${results.metrics.processingTimeMs}ms`);

			if (results.recommendations.length > 0) {
				console.log(`   Top Recommendation: ${results.recommendations[0].event.name} (${results.recommendations[0].score.score.toFixed(3)})`);
			}
		}

		console.log('\n✅ Recommendation system demo completed successfully!');
		console.log('\n📝 Usage Summary:');
		console.log('   • Use getComprehensiveRecommendations() for all-in-one results');
		console.log('   • Use specific methods (getEventRecommendationsWithDetails, etc.) for targeted recommendations');
		console.log('   • Adjust algorithm, minScore, and other options based on your needs');
		console.log('   • All methods return detailed metrics and explanations');

	} catch (error) {
		console.error('❌ Error in recommendation demo:', error);

		// Check if it's a user not found error
		if (error instanceof Error && error.message.includes('Cast to ObjectId failed')) {
			console.log('\n💡 Note: Make sure to use a valid user ID from your database.');
			console.log('   You can find user IDs by running: db.users.find({}, {_id: 1, name: 1})');
		}
	} finally {
		await handler.close();
		console.log('🔌 Database connection closed');
	}
}

// Run the demo
if (require.main === module) {
	demonstrateRecommendationSystem();
}