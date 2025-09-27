import { UCFDataScraper, ScraperConfig, CombinedData } from './ucfData.js';
import { writeFileSync } from 'node:fs';

// Example configurations for different use cases
const configurations = {
	// Fast configuration for development/testing
	fast: {
		maxPages: 2,
		campusLabsTimeout: 15_000,
		eventsUCFTimeout: 15_000,
		maxRetries: 2,
		retryDelay: 1000,
		requestDelay: 250,
	} as ScraperConfig,

	// Standard configuration for regular use
	standard: {
		maxPages: 5,
		campusLabsTimeout: 30_000,
		eventsUCFTimeout: 30_000,
		maxRetries: 3,
		retryDelay: 2000,
		requestDelay: 500,
	} as ScraperConfig,

	// Comprehensive configuration for full data collection
	comprehensive: {
		maxPages: 50,
		campusLabsTimeout: 60_000,
		eventsUCFTimeout: 60_000,
		maxRetries: 5,
		retryDelay: 3000,
		requestDelay: 1000,
	} as ScraperConfig,
};

async function fetchAndSaveUCFData(configName: keyof typeof configurations = 'standard') {
	try {
		console.log(`📡 Fetching UCF data with '${configName}' configuration...\n`);

		// Create scraper with chosen configuration
		const scraper = new UCFDataScraper(configurations[configName]);

		// Fetch all data
		const combinedData = await scraper.fetchAllData();

		// Save to JSON file
		const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
		const fileName = `ucf-data-${timestamp}-${configName}.json`;
		writeFileSync(fileName, JSON.stringify(combinedData, null, 2));

		console.log(`\n💾 Data saved to: ${fileName}`);
		console.log(`📊 File size: ${(JSON.stringify(combinedData).length / 1024 / 1024).toFixed(2)} MB`);

		// Display comprehensive statistics
		displayDataStatistics(combinedData);

		// Save a summary file as well
		const summaryFileName = `ucf-data-summary-${timestamp}-${configName}.json`;
		const summary = {
			metadata: combinedData.metadata,
			sampleEvents: combinedData.events.slice(0, 5),
			sampleOrganizations: combinedData.organizations.slice(0, 5),
			topCategories: combinedData.categories
				.sort((a, b) => a.name.localeCompare(b.name))
				.slice(0, 10),
		};
		writeFileSync(summaryFileName, JSON.stringify(summary, null, 2));
		console.log(`📄 Summary saved to: ${summaryFileName}`);

	} catch (error) {
		console.error('❌ Error:', error);
		process.exit(1);
	}
}

function displayDataStatistics(data: CombinedData) {
	console.log('\n📋 Data Statistics:');
	console.log('   📊 Metadata: scraped timestamp, sources, totals');
	console.log(`   📅 Events: ${data.events.length} events from ${data.metadata.sources.join(', ')}`);
	console.log(`   🏷️  Categories: ${data.categories.length} categories from both sources`);
	console.log(`   🏛️  Organizations: ${data.organizations.length} organizations (Campus Labs only)`);

	// Event statistics
	const eventsBySource = data.events.reduce((acc, event) => {
		acc[event.source] = (acc[event.source] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	console.log('\n📈 Source breakdown:');
	Object.entries(eventsBySource).forEach(([source, count]) => {
		const emoji = source === 'campuslabs' ? '🎓' : '🏛️';
		const name = source === 'campuslabs' ? 'Campus Labs' : 'Events UCF';
		console.log(`   ${emoji} ${name}: ${count} events`);
	});

	// Time range analysis
	const eventDates = data.events
		.map(e => new Date(e.startTime))
		.filter(d => !isNaN(d.getTime()))
		.sort((a, b) => a.getTime() - b.getTime());

	if (eventDates.length > 0) {
		const earliest = eventDates[0];
		const latest = eventDates[eventDates.length - 1];
		console.log('\n� Event time range:');
		console.log(`   ⏰ Earliest: ${earliest.toLocaleDateString()}`);
		console.log(`   ⏰ Latest: ${latest.toLocaleDateString()}`);
		console.log(`   📊 Span: ${Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24))} days`);
	}

	// Show sample events from each source
	console.log('\n📝 Sample events:');
	data.metadata.sources.forEach(source => {
		const sourceEvents = data.events.filter(e => e.source === source).slice(0, 2);
		sourceEvents.forEach((event, idx) => {
			const emoji = source === 'campuslabs' ? '🎓' : '🏛️';
			console.log(`   ${emoji} [${source}] ${event.name}`);
			console.log(`      📍 ${event.location || 'No location'} | ⏰ ${new Date(event.startTime).toLocaleDateString()}`);
			if (event.organization) {
				console.log(`      🏛️  ${event.organization.name}`);
			}
		});
	});

	// Category breakdown
	const categoriesBySource = data.categories.reduce((acc, cat) => {
		acc[cat.source] = (acc[cat.source] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	console.log('\n🏷️  Category breakdown:');
	Object.entries(categoriesBySource).forEach(([source, count]) => {
		const emoji = source === 'campuslabs' ? '🎓' : '🏛️';
		const name = source === 'campuslabs' ? 'Campus Labs' : 'Events UCF';
		console.log(`   ${emoji} ${name}: ${count} categories`);
	});
}

// Example functions for specific use cases
async function fetchOnlyCampusLabs() {
	console.log('🎓 Fetching Campus Labs data only...\n');
	const scraper = new UCFDataScraper(configurations.standard);
	const data = await scraper.fetchOnlyCampusLabsData();

	const fileName = `campus-labs-only-${new Date().toISOString().slice(0, 10)}.json`;
	writeFileSync(fileName, JSON.stringify(data, null, 2));
	console.log(`💾 Campus Labs data saved to: ${fileName}`);

	displayDataStatistics(data);
}

async function fetchOnlyEventsUCF() {
	console.log('🏛️ Fetching Events UCF data only...\n');
	const scraper = new UCFDataScraper(configurations.standard);
	const data = await scraper.fetchOnlyEventsUCFData();

	const fileName = `events-ucf-only-${new Date().toISOString().slice(0, 10)}.json`;
	writeFileSync(fileName, JSON.stringify(data, null, 2));
	console.log(`💾 Events UCF data saved to: ${fileName}`);

	displayDataStatistics(data);
}

// Main execution with command line argument support
async function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	switch (command) {
		case 'fast':
			await fetchAndSaveUCFData('fast');
			break;
		case 'comprehensive':
			await fetchAndSaveUCFData('comprehensive');
			break;
		case 'campus-only':
			await fetchOnlyCampusLabs();
			break;
		case 'events-only':
			await fetchOnlyEventsUCF();
			break;
		case 'standard':
		default:
			await fetchAndSaveUCFData('standard');
			break;
	}
}

// Export functions for programmatic use
export {
	fetchAndSaveUCFData,
	fetchOnlyCampusLabs,
	fetchOnlyEventsUCF,
	configurations,
	UCFDataScraper,
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	void main();
}