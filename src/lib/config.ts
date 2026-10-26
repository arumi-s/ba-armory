export const CDN_BASE = 'https://schaledb.com';
export const SCHALEDB_BASE = 'https://schaledb.com';
export const SAVE_API = '/api/save';

export const LANGUAGES = ['cn', 'en', 'jp', 'tw'] as const;
export type LangId = (typeof LANGUAGES)[number];

/** Short paraglide locale → standard BCP-47 value for `<html lang>`. */
export const LANGUAGE_CODES: Record<LangId, string> = {
	cn: 'zh-Hans',
	en: 'en',
	jp: 'ja',
	tw: 'zh-Hant'
};

export const REGIONS = [0, 1, 2] as const;
export type RegionId = (typeof REGIONS)[number];
