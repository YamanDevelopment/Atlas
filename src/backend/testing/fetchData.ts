import { fetchCombinedUCFData } from './ucfData.js';
import { writeFileSync } from 'node:fs';

async function fetchAndSaveUCFData() {
	try {
		console.log('📡 Fetching combined UCF data (events & organizations)...\n');

		const combinedData = await fetchCombinedUCFData();

		// Save to JSON file
		const fileName = `ucf-data-${new Date().toISOString().slice(0, 10)}.json`;
		writeFileSync(fileName, JSON.stringify(combinedData, null, 2));

		console.log(`\n💾 Data saved to: ${fileName}`);
		console.log('\n📋 Data structure:');
		console.log('   📊 Metadata: scraped timestamp, sources, totals');
		console.log(`   📅 Events: ${combinedData.events.length} events from both sources`);
		console.log(`   🏷️  Categories: ${combinedData.categories.length} categories from both sources`);
		console.log(`   🏛️  Organizations: ${combinedData.organizations.length} organizations (Campus Labs only)`);

		// Show some sample data
		console.log('\n📝 Sample events preview:');
		combinedData.events.slice(0, 3).forEach((event, idx) => {
			console.log(`   ${idx + 1}. [${event.source}] ${event.name}`);
			console.log(`      📍 ${event.location} | ⏰ ${new Date(event.startTime).toLocaleDateString()}`);
		});

		// Show source breakdown
		const campusLabsEvents = combinedData.events.filter(e => e.source === 'campuslabs').length;
		const ucfEvents = combinedData.events.filter(e => e.source === 'events.ucf.edu').length;

		console.log('\n📈 Source breakdown:');
		console.log(`   🎓 Campus Labs: ${campusLabsEvents} events`);
		console.log(`   🏛️  Events UCF: ${ucfEvents} events`);

	} catch (error) {
		console.error('❌ Error:', error);
		process.exit(1);
	}
}

// Run the script
void fetchAndSaveUCFData();