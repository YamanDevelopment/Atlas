import axios from 'axios';
import * as cheerio from 'cheerio';

// ===== STANDARDIZED INTERFACES =====

interface StandardCategory {
	id: string; // Use string to handle both numeric and slug-based IDs
	name: string;
	source: 'campuslabs' | 'events.ucf.edu';
	originalId?: number | string; // Keep original ID for reference
	slug?: string; // For events.ucf.edu categories
}

interface StandardOrganization {
	id: string;
	name: string;
	shortName?: string;
	url?: string;
	logoUrl?: string;
	categories: StandardCategory[];
	description: string;
	source: 'campuslabs';
	originalId: number;
}

interface StandardEvent {
	id: string; // Use string to handle both sources
	name: string;
	description: string;
	location: string;
	startTime: string; // ISO 8601
	endTime: string; // ISO 8601
	url: string;
	source: 'campuslabs' | 'events.ucf.edu';
	originalId: number;
	
	// Optional fields that may not exist in all sources
	organization?: StandardOrganization;
	latitude?: number;
	longitude?: number;
	theme?: string;
	categories: StandardCategory[];
	benefits?: string[];
	recurring?: boolean;
}

interface CombinedData {
	metadata: {
		scrapedAt: string;
		sources: string[];
		totalEvents: number;
		totalCategories: number;
		totalOrganizations: number;
	};
	events: StandardEvent[];
	categories: StandardCategory[];
	organizations: StandardOrganization[];
}

// ===== CAMPUS LABS DATA FETCHING (from test.ts) =====

interface OrganizationRaw {
	Id: number;
	Name: string;
	ShortName: string;
	Website?: string | null;
	ProfilePicture?: string | null;
	Description?: string | null;
	Status: string;
	CategoryNames?: string[] | null;
	CategoryIds?: number[] | null;
}

interface EventRaw {
	id: number;
	name: string;
	description?: string | null;
	location?: string | null;
	startsOn: string;
	endsOn: string;
	OrganizationId?: number | null;
	latitude?: number | null;
	longitude?: number | null;
	theme?: string | null;
	categoryNames?: string[] | null;
	categoryIds?: number[] | null;
	benefitNames?: string[] | null;
	status: string;
}

const CAMPUS_LABS_API_BASE = 'https://ucf.campuslabs.com/engage/api';
const CLINK_IMG_BASE = 'https://se-images.campuslabs.com/clink/images/';
const LOGO_PRESET = 'small-sq';
const MAX_RESULTS = 100_000;

// HTML entity decoding and cleanup
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

function toOffsetISOString(d: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	const yyyy = d.getFullYear();
	const mm = pad(d.getMonth() + 1);
	const dd = pad(d.getDate());
	const hh = pad(d.getHours());
	const mi = pad(d.getMinutes());
	const ss = pad(d.getSeconds());
	const tz = -d.getTimezoneOffset();
	const sign = tz >= 0 ? '+' : '-';
	const tzh = pad(Math.floor(Math.abs(tz) / 60));
	const tzm = pad(Math.abs(tz) % 60);
	return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}${sign}${tzh}:${tzm}`;
}

function ensureArray<T>(v: T[] | null | undefined): T[] {
	return Array.isArray(v) ? v : [];
}

function zipCategories(ids: number[] = [], names: string[] = []): { id: number; name: string }[] {
	const len = Math.min(ids.length, names.length);
	const out: { id: number; name: string }[] = [];
	for (let i = 0; i < len; i++) out.push({ id: ids[i], name: names[i] });
	return out;
}

async function fetchCampusLabsData(): Promise<{
	organizations: StandardOrganization[];
	events: StandardEvent[];
	categories: StandardCategory[];
}> {
	console.log('🎓 Fetching Campus Labs data...');
	
	const http = axios.create({
		baseURL: CAMPUS_LABS_API_BASE,
		timeout: 30_000,
	});

	// Fetch organizations
	const orgsRes = await http.get<{ value: OrganizationRaw[] }>('discovery/search/organizations', {
		params: { top: MAX_RESULTS },
	});

	const organizations = new Map<number, StandardOrganization>();
	const orgCategories = new Map<number, StandardCategory>();

	for (const org of orgsRes.data.value) {
		if (org.Status !== 'Active') continue;

		const standardOrg: StandardOrganization = {
			id: `campuslabs-org-${org.Id}`,
			originalId: org.Id,
			name: org.Name,
			shortName: org.ShortName,
			url: org.Website ?? '',
			logoUrl: org.ProfilePicture ? `${CLINK_IMG_BASE}${org.ProfilePicture}?preset=${LOGO_PRESET}` : '',
			categories: [],
			description: org.Description ? cleanDescription(org.Description) : '',
			source: 'campuslabs',
		};

		for (const { id: catID, name: catName } of zipCategories(
			ensureArray(org.CategoryIds ?? []),
			ensureArray(org.CategoryNames ?? []),
		)) {
			if (!orgCategories.has(catID)) {
				orgCategories.set(catID, {
					id: `campuslabs-cat-${catID}`,
					originalId: catID,
					name: catName,
					source: 'campuslabs',
				});
			}
			standardOrg.categories.push(orgCategories.get(catID)!);
		}

		organizations.set(org.Id, standardOrg);
	}

	// Fetch events
	const eventsRes = await http.get<{ value: EventRaw[] }>('discovery/event/search', {
		params: {
			endsAfter: toOffsetISOString(new Date()),
			orderByField: 'endsOn',
			status: 'Approved',
			take: MAX_RESULTS,
		},
	});

	const events = new Map<number, StandardEvent>();
	const eventCategories = new Map<number, StandardCategory>();

	for (const ev of eventsRes.data.value) {
		if (ev.status !== 'Approved') continue;

		const standardEvent: StandardEvent = {
			id: `campuslabs-event-${ev.id}`,
			originalId: ev.id,
			name: ev.name,
			description: ev.description ? cleanDescription(ev.description) : '',
			location: ev.location ?? '',
			startTime: ev.startsOn,
			endTime: ev.endsOn,
			organization: ev.OrganizationId ? organizations.get(ev.OrganizationId) : undefined,
			url: `https://ucf.campuslabs.com/engage/event/${ev.id}`,
			latitude: ev.latitude ?? undefined,
			longitude: ev.longitude ?? undefined,
			theme: ev.theme ?? '',
			categories: [],
			benefits: ensureArray(ev.benefitNames ?? []),
			source: 'campuslabs',
		};

		for (const { id: catID, name: catName } of zipCategories(
			ensureArray(ev.categoryIds ?? []),
			ensureArray(ev.categoryNames ?? []),
		)) {
			if (!eventCategories.has(catID)) {
				eventCategories.set(catID, {
					id: `campuslabs-event-cat-${catID}`,
					originalId: catID,
					name: catName,
					source: 'campuslabs',
				});
			}
			standardEvent.categories.push(eventCategories.get(catID)!);
		}

		events.set(ev.id, standardEvent);
	}

	// Combine all categories
	const allCategories = new Map<string, StandardCategory>();
	orgCategories.forEach(cat => allCategories.set(cat.id, cat));
	eventCategories.forEach(cat => allCategories.set(cat.id, cat));

	console.log(`✅ Campus Labs: ${events.size} events, ${organizations.size} orgs, ${allCategories.size} categories`);

	return {
		organizations: Array.from(organizations.values()),
		events: Array.from(events.values()),
		categories: Array.from(allCategories.values()),
	};
}

// ===== EVENTS.UCF.EDU DATA FETCHING =====

const EVENTS_UCF_BASE_URL = 'https://events.ucf.edu';
const EVENTS_UCF_UPCOMING_URL = `${EVENTS_UCF_BASE_URL}/upcoming/`;

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
	const url = pageNum === 1 ? EVENTS_UCF_UPCOMING_URL : `${EVENTS_UCF_UPCOMING_URL}?page=${pageNum}`;
	
	let retryCount = 0;
	const maxRetries = 3;
	
	while (retryCount < maxRetries) {
		try {
			const response = await axios.get(url, {
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
				},
				timeout: 30000,
			});
			
			return cheerio.load(response.data);
		} catch (error) {
			retryCount++;
			console.log(`⚠️  Attempt ${retryCount}/${maxRetries} failed for page ${pageNum}, retrying...`);
			if (retryCount >= maxRetries) throw error;
			await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)); // Progressive delay
		}
	}
	
	throw new Error('Max retries exceeded');
}

function extractUCFCategories($: cheerio.CheerioAPI): Map<string, StandardCategory> {
	const categories = new Map<string, StandardCategory>();
	let categoryId = 1;
	
	$('aside ul.list-unstyled li').each((_, el) => {
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
							id: `events-ucf-cat-${slug}`,
							originalId: categoryId++,
							name,
							slug,
							source: 'events.ucf.edu',
						});
					}
				}
			}
		}
	});
	
	return categories;
}

function extractUCFEventsFromPage($: cheerio.CheerioAPI, categories: Map<string, StandardCategory>): StandardEvent[] {
	const events: StandardEvent[] = [];
	
	$('ul.event-list li.event').each((_, el) => {
		const $event = $(el);
		
		const $title = $event.find('h3 a.stretched-link');
		const name = $title.text().trim();
		const relativeUrl = $title.attr('href');
		
		if (!name || !relativeUrl) return;
		
		const url = `${EVENTS_UCF_BASE_URL}${relativeUrl}`;
		const recurring = $event.find('.fa-sync-alt').length > 0;
		
		const classList = $event.attr('class')?.split(' ') || [];
		const categoryClass = classList.find((cls: string) =>
			cls !== 'event' && cls !== 'mb-3' && cls !== 'mb-md-4',
		);
		
		const startDateTime = $event.find('time.dtstart').attr('datetime') || '';
		const endDateTime = $event.find('time.dtend').attr('datetime') || '';
		
		const $location = $event.find('.location');
		let location = '';
		if ($location.length) {
			const locationText = $location.text().trim();
			location = locationText.replace(/^\s*\uf041\s*/, '').trim();
		}
		
		const description = cleanDescription($event.find('p.description').text() || '');
		
		const eventCategories: StandardCategory[] = [];
		if (categoryClass && categories.has(categoryClass)) {
			eventCategories.push(categories.get(categoryClass)!);
		}
		
		const idMatch = relativeUrl.match(/\/event\/(\d+)\//);
		const extractedId = idMatch ? parseInt(idMatch[1]) : Date.now(); // fallback ID
		
		const standardEvent: StandardEvent = {
			id: `events-ucf-${extractedId}`,
			originalId: extractedId,
			name,
			description,
			location,
			startTime: parseDateTime(startDateTime),
			endTime: parseDateTime(endDateTime),
			url,
			theme: categoryClass || 'uncategorized',
			categories: eventCategories,
			recurring,
			source: 'events.ucf.edu',
		};
		
		events.push(standardEvent);
	});
	
	return events;
}

async function getMaxPages(): Promise<number> {
	const $ = await fetchPage(1);
	
	let maxPages = 1;
	$('ul.pagination li.page-item a.page-link').each((_, el) => {
		const pageText = $(el).text().trim();
		const pageNum = parseInt(pageText);
		if (!isNaN(pageNum) && pageNum > maxPages) {
			maxPages = pageNum;
		}
	});
	
	return maxPages;
}

async function fetchEventsUCFData(): Promise<{
	events: StandardEvent[];
	categories: StandardCategory[];
}> {
	console.log('🏛️ Fetching events.ucf.edu data...');
	
	const $firstPage = await fetchPage(1);
	const categories = extractUCFCategories($firstPage);
	const maxPages = await getMaxPages();
	
	console.log(`📄 Found ${categories.size} categories and ${maxPages} pages to scrape`);
	
	let allEvents = extractUCFEventsFromPage($firstPage, categories);
	
	// Fetch remaining pages with delay
	for (let page = 2; page <= Math.min(maxPages, 5); page++) { // Limit to 5 pages for testing
		try {
			const $ = await fetchPage(page);
			const pageEvents = extractUCFEventsFromPage($, categories);
			allEvents = allEvents.concat(pageEvents);
			
			if (page < maxPages) {
				await new Promise(resolve => setTimeout(resolve, 500));
			}
		} catch (error) {
			console.error(`Error fetching page ${page}:`, error);
		}
	}
	
	const uniqueEvents = new Map<string, StandardEvent>();
	allEvents.forEach(event => {
		uniqueEvents.set(event.id, event);
	});
	
	const events = Array.from(uniqueEvents.values());
	const categoriesArray = Array.from(categories.values());
	
	console.log(`✅ Events UCF: ${events.length} unique events and ${categoriesArray.length} categories`);
	
	return {
		events: events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
		categories: categoriesArray.sort((a, b) => a.name.localeCompare(b.name)),
	};
}

// ===== MAIN COMBINATION FUNCTION =====

async function fetchCombinedUCFEvents(): Promise<CombinedData> {
	console.log('🚀 Starting combined UCF events fetch...\n');
	
	let campusLabsData: { organizations: StandardOrganization[]; events: StandardEvent[]; categories: StandardCategory[] };
	let eventsUCFData: { events: StandardEvent[]; categories: StandardCategory[] };
	
	try {
		// Always try to fetch Campus Labs data first
		console.log('🎓 Fetching Campus Labs data...');
		campusLabsData = await fetchCampusLabsData();
		
		// Try to fetch events.ucf.edu data with error handling
		try {
			console.log('🏛️ Fetching events.ucf.edu data...');
			eventsUCFData = await fetchEventsUCFData();
		} catch (error) {
			console.warn('⚠️  Failed to fetch events.ucf.edu data:', error instanceof Error ? error.message : String(error));
			console.log('📄 Continuing with Campus Labs data only...');
			eventsUCFData = { events: [], categories: [] };
		}
		
		// Combine all data
		const allEvents = [...campusLabsData.events, ...eventsUCFData.events];
		const allCategories = [...campusLabsData.categories, ...eventsUCFData.categories];
		const allOrganizations = campusLabsData.organizations; // Only Campus Labs has organizations
		
		// Sort events by start time
		allEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
		
		// Sort categories by name
		allCategories.sort((a, b) => a.name.localeCompare(b.name));
		
		const sources: string[] = ['campuslabs'];
		if (eventsUCFData.events.length > 0) {
			sources.push('events.ucf.edu');
		}
		
		const combinedData: CombinedData = {
			metadata: {
				scrapedAt: new Date().toISOString(),
				sources,
				totalEvents: allEvents.length,
				totalCategories: allCategories.length,
				totalOrganizations: allOrganizations.length,
			},
			events: allEvents,
			categories: allCategories,
			organizations: allOrganizations,
		};
		
		console.log('\n📊 FINAL SUMMARY:');
		console.log(`   📅 Total Events: ${combinedData.metadata.totalEvents}`);
		console.log(`   🏷️  Total Categories: ${combinedData.metadata.totalCategories}`);
		console.log(`   🏛️  Total Organizations: ${combinedData.metadata.totalOrganizations}`);
		console.log(`   📊 Sources: ${combinedData.metadata.sources.join(', ')}`);
		
		return combinedData;
		
	} catch (error) {
		console.error('❌ Error fetching combined data:', error);
		throw error;
	}
}

// ===== EXPORTS AND MAIN =====

export { fetchCombinedUCFEvents, StandardEvent, StandardCategory, StandardOrganization, CombinedData };

// Main function for direct execution
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function main(): Promise<void> {
	try {
		const combinedData = await fetchCombinedUCFEvents();
		console.log('\n📄 Combined data ready!');
		console.log(JSON.stringify(combinedData, null, 2));
	} catch (error) {
		console.error('Error in main:', error);
	}
}

// Uncomment to run directly
// void main();