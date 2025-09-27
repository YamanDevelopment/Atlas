import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';

// ===== STANDARDIZED INTERFACES =====

interface StandardCategory {
	id: string;
	name: string;
	source: 'campuslabs' | 'events.ucf.edu';
	originalId?: number | string;
	slug?: string;
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
	id: string;
	name: string;
	description: string;
	location: string;
	startTime: string;
	endTime: string;
	url: string;
	source: 'campuslabs' | 'events.ucf.edu';
	originalId: number;
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

// ===== RAW DATA INTERFACES =====

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

// ===== SCRAPER CONFIGURATION =====

interface ScraperConfig {
	campusLabsTimeout?: number;
	eventsUCFTimeout?: number;
	maxRetries?: number;
	retryDelay?: number;
	maxPages?: number;
	requestDelay?: number;
}

// ===== UCF DATA SCRAPER CLASS =====

class UCFDataScraper {
	private readonly campusLabsHttp: AxiosInstance;
	private readonly config: Required<ScraperConfig>;
	private readonly entityReplacements: Record<string, string>;

	// Constants
	private static readonly CAMPUS_LABS_API_BASE = 'https://ucf.campuslabs.com/engage/api';
	private static readonly CLINK_IMG_BASE = 'https://se-images.campuslabs.com/clink/images/';
	private static readonly LOGO_PRESET = 'small-sq';
	private static readonly MAX_RESULTS = 100_000;
	private static readonly EVENTS_UCF_BASE_URL = 'https://events.ucf.edu';
	private static readonly EVENTS_UCF_UPCOMING_URL = `${UCFDataScraper.EVENTS_UCF_BASE_URL}/upcoming/`;

	constructor(config: ScraperConfig = {}) {
		this.config = {
			campusLabsTimeout: config.campusLabsTimeout ?? 30_000,
			eventsUCFTimeout: config.eventsUCFTimeout ?? 30_000,
			maxRetries: config.maxRetries ?? 3,
			retryDelay: config.retryDelay ?? 2000,
			maxPages: config.maxPages ?? 5,
			requestDelay: config.requestDelay ?? 500,
		};

		this.campusLabsHttp = axios.create({
			baseURL: UCFDataScraper.CAMPUS_LABS_API_BASE,
			timeout: this.config.campusLabsTimeout,
		});

		this.entityReplacements = {
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
	}

	// ===== UTILITY METHODS =====

	private decodeEntities(text: string): string {
		let out = text;
		for (const [from, to] of Object.entries(this.entityReplacements)) {
			out = out.replaceAll(from, to);
		}
		return out;
	}

	private cleanDescription(html: string): string {
		return this.decodeEntities(
			html
				.replace(/<[^>]+>/g, ' ')
				.replace(/\s+/g, ' ')
				.trim(),
		);
	}

	private toOffsetISOString(d: Date): string {
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

	private ensureArray<T>(v: T[] | null | undefined): T[] {
		return Array.isArray(v) ? v : [];
	}

	private zipCategories(ids: number[] = [], names: string[] = []): { id: number; name: string }[] {
		const len = Math.min(ids.length, names.length);
		const out: { id: number; name: string }[] = [];
		for (let i = 0; i < len; i++) out.push({ id: ids[i], name: names[i] });
		return out;
	}

	private parseDateTime(dateTime: string): string {
		if (dateTime.match(/T\d{2}:\d{2}:\d{2}-\d{5}$/)) {
			const offset = dateTime.slice(-5);
			const hours = offset.slice(0, 3);
			const minutes = offset.slice(3);
			return dateTime.slice(0, -5) + hours + ':' + minutes;
		}
		return dateTime;
	}

	// ===== CAMPUS LABS DATA FETCHING =====

	async fetchCampusLabsData(): Promise<{
		organizations: StandardOrganization[];
		events: StandardEvent[];
		categories: StandardCategory[];
	}> {
		console.log('🎓 Fetching Campus Labs data...');

		try {
			// Fetch organizations
			const orgsRes = await this.campusLabsHttp.get<{ value: OrganizationRaw[] }>('discovery/search/organizations', {
				params: { top: UCFDataScraper.MAX_RESULTS },
			});

			const organizations = new Map<number, StandardOrganization>();
			const orgCategories = new Map<number, StandardCategory>();

			// Process organizations
			for (const org of orgsRes.data.value) {
				if (org.Status !== 'Active') continue;

				const standardOrg: StandardOrganization = {
					id: `campuslabs-org-${org.Id}`,
					originalId: org.Id,
					name: org.Name,
					shortName: org.ShortName,
					url: org.Website ?? '',
					logoUrl: org.ProfilePicture ? `${UCFDataScraper.CLINK_IMG_BASE}${org.ProfilePicture}?preset=${UCFDataScraper.LOGO_PRESET}` : '',
					categories: [],
					description: org.Description ? this.cleanDescription(org.Description) : '',
					source: 'campuslabs',
				};

				// Process organization categories
				for (const { id: catID, name: catName } of this.zipCategories(
					this.ensureArray(org.CategoryIds ?? []),
					this.ensureArray(org.CategoryNames ?? []),
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
			const eventsRes = await this.campusLabsHttp.get<{ value: EventRaw[] }>('discovery/event/search', {
				params: {
					endsAfter: this.toOffsetISOString(new Date()),
					orderByField: 'endsOn',
					status: 'Approved',
					take: UCFDataScraper.MAX_RESULTS,
				},
			});

			const events = new Map<number, StandardEvent>();
			const eventCategories = new Map<number, StandardCategory>();

			// Process events
			for (const ev of eventsRes.data.value) {
				if (ev.status !== 'Approved') continue;

				const standardEvent: StandardEvent = {
					id: `campuslabs-event-${ev.id}`,
					originalId: ev.id,
					name: ev.name,
					description: ev.description ? this.cleanDescription(ev.description) : '',
					location: ev.location ?? '',
					startTime: ev.startsOn,
					endTime: ev.endsOn,
					organization: ev.OrganizationId ? organizations.get(ev.OrganizationId) : undefined,
					url: `https://ucf.campuslabs.com/engage/event/${ev.id}`,
					latitude: ev.latitude ?? undefined,
					longitude: ev.longitude ?? undefined,
					theme: ev.theme ?? '',
					categories: [],
					benefits: this.ensureArray(ev.benefitNames ?? []),
					source: 'campuslabs',
				};

				// Process event categories
				for (const { id: catID, name: catName } of this.zipCategories(
					this.ensureArray(ev.categoryIds ?? []),
					this.ensureArray(ev.categoryNames ?? []),
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

		} catch (error) {
			console.error('❌ Campus Labs API error:', error);
			throw new Error(`Failed to fetch Campus Labs data: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	// ===== EVENTS.UCF.EDU DATA FETCHING =====

	private async fetchPage(pageNum: number): Promise<cheerio.CheerioAPI> {
		const url = pageNum === 1 ? UCFDataScraper.EVENTS_UCF_UPCOMING_URL : `${UCFDataScraper.EVENTS_UCF_UPCOMING_URL}?page=${pageNum}`;
		let retryCount = 0;

		while (retryCount < this.config.maxRetries) {
			try {
				const response = await axios.get(url, {
					headers: {
						'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
					},
					timeout: this.config.eventsUCFTimeout,
				});

				return cheerio.load(response.data);
			} catch (error) {
				retryCount++;
				console.log(`⚠️  Attempt ${retryCount}/${this.config.maxRetries} failed for page ${pageNum}, retrying...`);
				if (retryCount >= this.config.maxRetries) throw error;
				await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * retryCount));
			}
		}

		throw new Error('Max retries exceeded');
	}

	private extractUCFCategories($: cheerio.CheerioAPI): Map<string, StandardCategory> {
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

	private extractUCFEventsFromPage($: cheerio.CheerioAPI, categories: Map<string, StandardCategory>): StandardEvent[] {
		const events: StandardEvent[] = [];

		$('ul.event-list li.event').each((_, el) => {
			const $event = $(el);
			const $title = $event.find('h3 a.stretched-link');
			const name = $title.text().trim();
			const relativeUrl = $title.attr('href');

			if (!name || !relativeUrl) return;

			const url = `${UCFDataScraper.EVENTS_UCF_BASE_URL}${relativeUrl}`;
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

			const description = this.cleanDescription($event.find('p.description').text() || '');

			const eventCategories: StandardCategory[] = [];
			if (categoryClass && categories.has(categoryClass)) {
				eventCategories.push(categories.get(categoryClass)!);
			}

			const idMatch = relativeUrl.match(/\/event\/(\d+)\//);
			const extractedId = idMatch ? parseInt(idMatch[1]) : Date.now();

			const standardEvent: StandardEvent = {
				id: `events-ucf-${extractedId}`,
				originalId: extractedId,
				name,
				description,
				location,
				startTime: this.parseDateTime(startDateTime),
				endTime: this.parseDateTime(endDateTime),
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

	private async getMaxPages(): Promise<number> {
		const $ = await this.fetchPage(1);
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

	async fetchEventsUCFData(): Promise<{
		events: StandardEvent[];
		categories: StandardCategory[];
	}> {
		console.log('🏛️ Fetching events.ucf.edu data...');

		try {
			const $firstPage = await this.fetchPage(1);
			const categories = this.extractUCFCategories($firstPage);
			const maxPages = await this.getMaxPages();
			const pagesToScrape = Math.min(maxPages, this.config.maxPages);

			console.log(`📄 Found ${categories.size} categories and ${maxPages} pages (scraping ${pagesToScrape})`);

			let allEvents = this.extractUCFEventsFromPage($firstPage, categories);

			// Fetch remaining pages with delay
			for (let page = 2; page <= pagesToScrape; page++) {
				try {
					const $ = await this.fetchPage(page);
					const pageEvents = this.extractUCFEventsFromPage($, categories);
					allEvents = allEvents.concat(pageEvents);

					if (page < pagesToScrape) {
						await new Promise(resolve => setTimeout(resolve, this.config.requestDelay));
					}
				} catch (error) {
					console.error(`Error fetching page ${page}:`, error);
				}
			}

			// Remove duplicates
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

		} catch (error) {
			console.error('❌ Events UCF scraping error:', error);
			throw new Error(`Failed to fetch Events UCF data: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	// ===== MAIN COMBINATION METHOD =====

	async fetchAllData(): Promise<CombinedData> {
		console.log('🚀 Starting combined UCF data fetch...\n');

		let campusLabsData: { organizations: StandardOrganization[]; events: StandardEvent[]; categories: StandardCategory[] };
		let eventsUCFData: { events: StandardEvent[]; categories: StandardCategory[] };

		try {
			// Always try to fetch Campus Labs data first
			campusLabsData = await this.fetchCampusLabsData();

			// Try to fetch events.ucf.edu data with error handling
			try {
				eventsUCFData = await this.fetchEventsUCFData();
			} catch (error) {
				console.warn('⚠️  Failed to fetch events.ucf.edu data:', error instanceof Error ? error.message : String(error));
				console.log('📄 Continuing with Campus Labs data only...');
				eventsUCFData = { events: [], categories: [] };
			}

			// Combine all data
			const allEvents = [...campusLabsData.events, ...eventsUCFData.events];
			const allCategories = [...campusLabsData.categories, ...eventsUCFData.categories];
			const allOrganizations = campusLabsData.organizations;

			// Sort data
			allEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
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

	// ===== INDIVIDUAL DATA GETTERS =====

	async fetchOnlyCampusLabsData(): Promise<CombinedData> {
		console.log('🎓 Fetching Campus Labs data only...\n');
		const campusLabsData = await this.fetchCampusLabsData();

		return {
			metadata: {
				scrapedAt: new Date().toISOString(),
				sources: ['campuslabs'],
				totalEvents: campusLabsData.events.length,
				totalCategories: campusLabsData.categories.length,
				totalOrganizations: campusLabsData.organizations.length,
			},
			events: campusLabsData.events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
			categories: campusLabsData.categories.sort((a, b) => a.name.localeCompare(b.name)),
			organizations: campusLabsData.organizations,
		};
	}

	async fetchOnlyEventsUCFData(): Promise<CombinedData> {
		console.log('🏛️ Fetching Events UCF data only...\n');
		const eventsUCFData = await this.fetchEventsUCFData();

		return {
			metadata: {
				scrapedAt: new Date().toISOString(),
				sources: ['events.ucf.edu'],
				totalEvents: eventsUCFData.events.length,
				totalCategories: eventsUCFData.categories.length,
				totalOrganizations: 0,
			},
			events: eventsUCFData.events,
			categories: eventsUCFData.categories,
			organizations: [],
		};
	}
}

// ===== EXPORTS =====

export {
	UCFDataScraper,
	StandardEvent,
	StandardCategory,
	StandardOrganization,
	CombinedData,
	ScraperConfig,
};

// For backward compatibility
export const fetchCombinedUCFData = async (config?: ScraperConfig): Promise<CombinedData> => {
	const scraper = new UCFDataScraper(config);
	return scraper.fetchAllData();
};