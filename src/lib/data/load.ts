import { CDN_BASE, type LangId } from '../config';
import {
	ConfigSchema,
	EquipmentsSchema,
	ItemsSchema,
	LocalizationSchema,
	StagesSchema,
	StudentsSchema
} from './schemas';
import type { RawGameDataType } from './indexes';

export class DataLoadError extends Error {
	constructor(
		message: string,
		readonly source: string,
		readonly cause?: unknown
	) {
		super(message);
		this.name = 'DataLoadError';
	}
}

type Fetcher = typeof fetch;

async function fetchJson(url: string, fetcher: Fetcher): Promise<unknown> {
	let response: Response;
	try {
		response = await fetcher(url);
	} catch (error) {
		throw new DataLoadError(`Network error while loading ${url}`, url, error);
	}
	if (!response.ok) {
		throw new DataLoadError(`HTTP ${response.status} while loading ${url}`, url);
	}
	try {
		return await response.json();
	} catch (error) {
		throw new DataLoadError(`Invalid JSON from ${url}`, url, error);
	}
}

function parseOrThrow<T>(schema: { parse: (data: unknown) => T }, data: unknown, url: string): T {
	try {
		return schema.parse(data);
	} catch (error) {
		throw new DataLoadError(`Schema validation failed for ${url}`, url, error);
	}
}

/**
 * Fetch and parse the 6 schaledb documents for a language. Region-independent:
 * index building (which region participates in) happens in `buildGameData`,
 * so the same raw bundle can back any region. All requests run in parallel;
 * any failure throws DataLoadError.
 */
export async function fetchRawGameData(
	language: LangId,
	fetcher: Fetcher = fetch
): Promise<RawGameDataType> {
	const configUrl = `${CDN_BASE}/data/config.min.json`;
	const languageUrls = {
		items: `${CDN_BASE}/data/${language}/items.min.json`,
		equipment: `${CDN_BASE}/data/${language}/equipment.min.json`,
		students: `${CDN_BASE}/data/${language}/students.min.json`,
		stages: `${CDN_BASE}/data/${language}/stages.min.json`,
		localization: `${CDN_BASE}/data/${language}/localization.min.json`
	} as const;

	const [configJson, itemsJson, equipmentsJson, studentsJson, stagesJson, localizationJson] =
		await Promise.all([
			fetchJson(configUrl, fetcher),
			fetchJson(languageUrls.items, fetcher),
			fetchJson(languageUrls.equipment, fetcher),
			fetchJson(languageUrls.students, fetcher),
			fetchJson(languageUrls.stages, fetcher),
			fetchJson(languageUrls.localization, fetcher)
		]);

	const config = parseOrThrow(ConfigSchema, configJson, configUrl);
	const items = parseOrThrow(ItemsSchema, itemsJson, languageUrls.items);
	const equipments = parseOrThrow(EquipmentsSchema, equipmentsJson, languageUrls.equipment);
	const students = parseOrThrow(StudentsSchema, studentsJson, languageUrls.students);
	const stages = parseOrThrow(StagesSchema, stagesJson, languageUrls.stages);
	const localizationRaw = parseOrThrow(
		LocalizationSchema,
		localizationJson,
		languageUrls.localization
	);

	return {
		language,
		config,
		students: Object.values(students),
		items: Object.values(items),
		equipments: Object.values(equipments),
		stages: Object.values(stages),
		localizationRaw
	};
}
