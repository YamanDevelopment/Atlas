import axios from 'axios';

interface Category {
	id: number;
	name: string;
}

interface Organization {
	id: number;
	name: string;
	shortName: string;
	url: string;
	logoUrl: string;
	categories: Category[];
	description: string;
}

interface Event {
	id: number;
	name: string;
	description: string;
	location: string;
	startTime: string; // ISO 8601
	endTime: string; // ISO 8601
	organization: Organization | null;
	url: string;
	latitude: number | null;
	longitude: number | null;
	theme: string;
	categories: Category[];
	benefits: string[];
}

// Raw API shapes (only the fields we use)
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

const API_BASE = 'https://ucf.campuslabs.com/engage/api';
const CLINK_IMG_BASE = 'https://se-images.campuslabs.com/clink/images/';
const LOGO_PRESET = 'small-sq';
const MAX_RESULTS = 100_000;

const http = axios.create({
	baseURL: API_BASE,
	timeout: 30_000,
});

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

// Helpers
function ensureArray<T>(v: T[] | null | undefined): T[] {
	return Array.isArray(v) ? v : [];
}

function zipCategories(ids: number[] = [], names: string[] = []): { id: number; name: string }[] {
	const len = Math.min(ids.length, names.length);
	const out: { id: number; name: string }[] = [];
	for (let i = 0; i < len; i++) out.push({ id: ids[i], name: names[i] });
	return out;
}

// Fetchers
async function fetchOrganizations(): Promise<{ orgs: Map<number, Organization>; orgCategories: Map<number, Category> }> {
	const res = await http.get<{ value: OrganizationRaw[] }>('discovery/search/organizations', {
		params: { top: MAX_RESULTS },
	});

	const orgs = new Map<number, Organization>();
	const orgCategories = new Map<number, Category>();

	for (const org of res.data.value) {
		if (org.Status !== 'Active') continue;

		const o: Organization = {
			id: org.Id,
			name: org.Name,
			shortName: org.ShortName,
			url: org.Website ?? '',
			logoUrl: org.ProfilePicture ? `${CLINK_IMG_BASE}${org.ProfilePicture}?preset=${LOGO_PRESET}` : '',
			categories: [],
			description: org.Description ? cleanDescription(org.Description) : '',
		};

		for (const { id: catID, name: catName } of zipCategories(
			ensureArray(org.CategoryIds ?? []),
			ensureArray(org.CategoryNames ?? []),
		)) {
			if (!orgCategories.has(catID)) orgCategories.set(catID, { id: catID, name: catName });
			o.categories.push(orgCategories.get(catID)!);
		}

		orgs.set(o.id, o);
	}

	return { orgs, orgCategories };
}

async function fetchEvents(): Promise<EventRaw[]> {
	const res = await http.get<{ value: EventRaw[] }>('discovery/event/search', {
		params: {
			endsAfter: toOffsetISOString(new Date()),
			orderByField: 'endsOn',
			status: 'Approved',
			take: MAX_RESULTS,
		},
	});
	return res.data.value;
}

async function main(): Promise<void> {
	try {
		const [{ orgs, orgCategories }, eventsRaw] = await Promise.all([fetchOrganizations(), fetchEvents()]);

		const events = new Map<number, Event>();
		const eventCategories = new Map<number, Category>();

		for (const ev of eventsRaw) {
			if (ev.status !== 'Approved') continue;

			const e: Event = {
				id: ev.id,
				name: ev.name,
				description: ev.description ? cleanDescription(ev.description) : '',
				location: ev.location ?? '',
				startTime: ev.startsOn,
				endTime: ev.endsOn,
				organization: ev.OrganizationId ? orgs.get(ev.OrganizationId) ?? null : null,
				url: `https://ucf.campuslabs.com/engage/event/${ev.id}`,
				latitude: ev.latitude ?? null,
				longitude: ev.longitude ?? null,
				theme: ev.theme ?? '',
				categories: [],
				benefits: ensureArray(ev.benefitNames ?? []),
			};

			for (const { id: catID, name: catName } of zipCategories(
				ensureArray(ev.categoryIds ?? []),
				ensureArray(ev.categoryNames ?? []),
			)) {
				if (!eventCategories.has(catID)) eventCategories.set(catID, { id: catID, name: catName });
				e.categories.push(eventCategories.get(catID)!);
			}

			events.set(e.id, e);
		}

		// Stable output (sorted by id)
		const byIdAsc = <T extends { id: number }>(a: T, b: T) => a.id - b.id;

		const output = {
			organizations: Array.from(orgs.values()).sort(byIdAsc),
			categories: Array.from(orgCategories.values()).sort(byIdAsc),
			events: Array.from(events.values()).sort(byIdAsc),
			eventCategories: Array.from(eventCategories.values()).sort(byIdAsc),
		};

		console.log(JSON.stringify(output, null, 2));
	} catch (err) {
		console.error('Failed to fetch/process data:', err);
		process.exitCode = 1;
	}
}

void main();