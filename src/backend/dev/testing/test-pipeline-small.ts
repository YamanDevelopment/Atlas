#!/usr/bin/env bun
import { DatabaseService } from './src/backend/modules/database/services/DatabaseService';
import { GeminiService } from './src/backend/modules/ai/gemini';

console.log('🧪 Testing Small Pipeline - 3 Events');
console.log('====================================');

async function testSmallPipeline() {
	try {
		// Initialize services
		const db = new DatabaseService();
		const ai = new GeminiService();

		console.log('🔗 Connecting to database...');
		await db.connect();

		// Test sample events (small set)
		const testEvents = [
			{
				title: 'Programming Workshop',
				description: 'Learn JavaScript and web development basics in this hands-on coding workshop for beginners.',
			},
			{
				title: 'Student Government Elections',
				description: 'Vote for your next student body president and representatives. Leadership and civic engagement opportunity.',
			},
			{
				title: 'Basketball Intramural Game',
				description: 'Join us for competitive basketball games. All skill levels welcome for this sports event.',
			},
		];

		console.log('\n🧠 Testing AI Analysis (3 events)...');
		let successCount = 0;

		for (let i = 0; i < testEvents.length; i++) {
			const event = testEvents[i];
			console.log(`\n📝 Analyzing event ${i + 1}/3: "${event.title}"`);

			try {
				const result = await ai.analyzeContent(event);
				console.log(`✅ Success! Found ${result.tags.length} tags with confidence ${result.confidence}`);
				console.log('🏷️  Tags:', result.tags.map(tag => `${tag.category} (${tag.tagId}) - weight: ${tag.weight}`));
				successCount++;
			} catch (error: any) {
				console.error(`❌ Failed to analyze "${event.title}":`, error?.message || error);
			}

			// Rate limiting: wait 8 seconds between requests (except last one)
			if (i < testEvents.length - 1) {
				console.log('⏳ Waiting 8s for rate limiting...');
				await new Promise(resolve => setTimeout(resolve, 8000));
			}
		}

		console.log(`\n🎯 Test Results: ${successCount}/${testEvents.length} events analyzed successfully`);

		if (successCount > 0) {
			console.log('\n✅ PIPELINE TEST PASSED - AI analysis working correctly!');
			console.log('💡 Ready for full pipeline run (will take ~52 minutes for 389 events)');
		} else {
			console.log('\n❌ PIPELINE TEST FAILED - Check API credentials and rate limits');
		}

	} catch (error) {
		console.error('Pipeline test error:', error);
	}
}

testSmallPipeline();