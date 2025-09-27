import axios from 'axios';
import * as cheerio from 'cheerio';

// Similar interfaces to test.ts but adapted for events.ucf.edu structure
interface Category {
	id: number;
	name: string;
	slug: string;
}

interface Event {
	id: number;
	name: string;
	description: string;
	location: string;
	startTime: string; // ISO 8601
	endTime: string; // ISO 8601
	url: string;
	theme: string; // category slug
	categories: Category[];
	recurring: boolean;
}

const BASE_URL = 'https://events.ucf.edu';
const UPCOMING_URL = `${BASE_URL}/upcoming/`;

// HTML entity decoding and cleanup (same as test.ts)
const entityReplacements: Record<string, string> = {
	'&nbsp;': ' ',
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#39;': '\'',
	'&#x27;': '\'',
	'&#x2F;': '/',
	'&#x60;': '`',
	'&#x3D;': '=',
	'&apos;': '\'',
	'&hellip;': '...',
	'&mdash;': '—',
	'&ndash;': '–',
	'&ldquo;': '"',
	'&rdquo;': '"',
	'&lsquo;': '\'',
	'&rsquo;': '\'',
	'&bull;': '•',
	'&deg;': '°',
	'&copy;': '©',
	'&reg;': '®',
	'&trade;': '™',
	'&cent;': '¢',
	'&pound;': '£',
	'&euro;': '€',
	'&yen;': '¥',
	'&ntilde;': 'ñ',
};

function decodeEntities(text: string): string {
	let out = text;
	for (const [from, to] of Object.entries(entityReplacements)) {
		out = out.replaceAll(from, to);
	}
	return out;
}

function cleanDescription(html: string): string {
	return decodeEntities(
		html
			.replace(/<[^>]+>/g, ' ') // strip tags
			.replace(/\s+/g, ' ')
			.trim(),
	);
}

function parseDateTime(dateTime: string): string {
	// Input format: "2025-09-27T11:00:00-14400"
	// Convert to proper ISO format: "2025-09-27T11:00:00-04:00"
	if (dateTime.match(/T\d{2}:\d{2}:\d{2}-\d{5}$/)) {
		const offset = dateTime.slice(-5);
		const hours = offset.slice(0, 3);
		const minutes = offset.slice(3);
		return dateTime.slice(0, -5) + hours + ':' + minutes;
	}
	return dateTime;
}

async function fetchPage(pageNum: number): Promise<cheerio.CheerioAPI> {
	const url = pageNum === 1 ? UPCOMING_URL : `${UPCOMING_URL}?page=${pageNum}`;
	console.log(`Fetching page ${pageNum}...`);

	const response = await axios.get(url, {
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
		},
		timeout: 30000,
	});

	return cheerio.load(response.data);
}

function extractCategories($: cheerio.CheerioAPI): Map<string, Category> {
	const categories = new Map<string, Category>();
	let categoryId = 1;

	// Extract categories from the sidebar filter section
	$('aside ul.list-unstyled li').each((_: number, el: cheerio.Element) => {
		const $el = $(el);
		const $link = $el.find('a');
		if ($link.length) {
			const href = $link.attr('href');
			const name = $link.text().trim();

			if (href && name) {
				const match = href.match(/\/category\/\d+\/([^\/]+)\//);
				if (match) {
					const slug = match[1];
					if (!categories.has(slug)) {
						categories.set(slug, {
							id: categoryId++,
							name,
							slug,
						});
					}
				}
			}
		}
	});

	return categories;
}

function extractEventsFromPage($: cheerio.CheerioAPI, categories: Map<string, Category>): Event[] {
	const events: Event[] = [];
	let eventId = 1;

	$('ul.event-list li.event').each((_: number, el: cheerio.Element) => {
		const $event = $(el);

		// Extract basic info
		const $title = $event.find('h3 a.stretched-link');
		const name = $title.text().trim();
		const relativeUrl = $title.attr('href');

		if (!name || !relativeUrl) return;

		const url = `${BASE_URL}${relativeUrl}`;

		// Check if recurring
		const recurring = $event.find('.fa-sync-alt').length > 0;

		// Extract category from CSS class
		const classList = $event.attr('class')?.split(' ') || [];
		const categoryClass = classList.find((cls: string) =>
			cls !== 'event' && cls !== 'mb-3' && cls !== 'mb-md-4',
		);

		// Extract times
		const startDateTime = $event.find('time.dtstart').attr('datetime') || '';
		const endDateTime = $event.find('time.dtend').attr('datetime') || '';

		// Extract location - could be physical location or virtual
		const $location = $event.find('.location');
		let location = '';
		if ($location.length) {
			const locationText = $location.text().trim();
			// Remove the map marker icon text
			location = locationText.replace(/^\s*\uf041\s*/, '').trim();
		}

		// Extract description
		const description = cleanDescription($event.find('p.description').text() || '');

		// Find matching category
		const eventCategories: Category[] = [];
		if (categoryClass && categories.has(categoryClass)) {
			eventCategories.push(categories.get(categoryClass)!);
		}

		// Extract ID from URL if possible
		const idMatch = relativeUrl.match(/\/event\/(\d+)\//);
		const extractedId = idMatch ? parseInt(idMatch[1]) : eventId++;

		const event: Event = {
			id: extractedId,
			name,
			description,
			location,
			startTime: parseDateTime(startDateTime),
			endTime: parseDateTime(endDateTime),
			url,
			theme: categoryClass || 'uncategorized',
			categories: eventCategories,
			recurring,
		};

		events.push(event);
	});

	return events;
}

async function getMaxPages(): Promise<number> {
	const $ = await fetchPage(1);

	// Look for the last page number in pagination
	let maxPages = 1;
	$('ul.pagination li.page-item a.page-link').each((_: number, el: cheerio.Element) => {
		const pageText = $(el).text().trim();
		const pageNum = parseInt(pageText);
		if (!isNaN(pageNum) && pageNum > maxPages) {
			maxPages = pageNum;
		}
	});

	return maxPages;
}

async function fetchAllEvents(): Promise<{ events: Event[]; categories: Category[] }> {
	console.log('Starting to fetch UCF official events...');

	// Get first page to extract categories and determine max pages
	const $firstPage = await fetchPage(1);
	const categories = extractCategories($firstPage);
	const maxPages = await getMaxPages();

	console.log(`Found ${categories.size} categories and ${maxPages} pages to scrape`);

	// Extract events from first page
	let allEvents = extractEventsFromPage($firstPage, categories);

	// Fetch remaining pages with some delay to be respectful
	for (let page = 2; page <= maxPages; page++) {
		try {
			const $ = await fetchPage(page);
			const pageEvents = extractEventsFromPage($, categories);
			allEvents = allEvents.concat(pageEvents);

			// Small delay between requests
			if (page < maxPages) {
				await new Promise(resolve => setTimeout(resolve, 500));
			}
		} catch (error) {
			console.error(`Error fetching page ${page}:`, error);
			// Continue with other pages
		}
	}

	// Remove duplicates based on ID
	const uniqueEvents = new Map<number, Event>();
	allEvents.forEach(event => {
		uniqueEvents.set(event.id, event);
	});

	const events = Array.from(uniqueEvents.values());
	const categoriesArray = Array.from(categories.values());

	console.log(`Successfully scraped ${events.length} unique events and ${categoriesArray.length} categories`);

	return {
		events: events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
		categories: categoriesArray.sort((a, b) => a.id - b.id),
	};
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function main(): Promise<void> {
	try {
		const { events, categories } = await fetchAllEvents();

		const output = {
			source: 'events.ucf.edu',
			scrapedAt: new Date().toISOString(),
			events,
			categories,
		};

		console.log(JSON.stringify(output, null, 2));
	} catch (error) {
		console.error('Error fetching official UCF events:', error);
		// process.exitCode = 1;
	}
}

// Export for use in other files
export { fetchAllEvents, Event, Category };

// Run if called directly (commented out for now)
// if (require.main === module) {
// 	void main();
// }
