import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { buildGameData, getStuff, type RawGameDataType } from './indexes';
import {
	ConfigSchema,
	EquipmentsSchema,
	ItemsSchema,
	LocalizationSchema,
	StagesSchema,
	StudentsSchema
} from './schemas';
import { CDN_BASE } from '#lib/config.ts';
import { EquipmentCategory } from './enums';

// Real schaledb documents (en), cached under <repo>/.fixtures/schaledb. Files
// are downloaded on first run. These tests are always skipped on CI (the `CI`
// env var) to avoid depending on the live CDN, and also skip when neither
// cache nor network is available.
const dir = join(process.cwd(), '.fixtures', 'schaledb');

const DOCUMENTS = {
	config: `${CDN_BASE}/data/config.min.json`,
	items: `${CDN_BASE}/data/en/items.min.json`,
	equipment: `${CDN_BASE}/data/en/equipment.min.json`,
	students: `${CDN_BASE}/data/en/students.min.json`,
	stages: `${CDN_BASE}/data/en/stages.min.json`,
	localization: `${CDN_BASE}/data/en/localization.min.json`
} as const;

const fileName = (url: string): string => url.slice(url.lastIndexOf('/') + 1);

async function downloadMissingDocuments(): Promise<boolean> {
	mkdirSync(dir, { recursive: true });
	let allAvailable = true;
	for (const url of Object.values(DOCUMENTS)) {
		const target = join(dir, fileName(url));
		if (existsSync(target)) continue;
		try {
			const response = await fetch(url);
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			writeFileSync(target, await response.text());
		} catch (error) {
			console.warn(`[real.test] failed to fetch ${url}: ${error}`);
			allAvailable = false;
		}
	}
	return allAvailable;
}

const documentsAvailable = !process.env.CI && (await downloadMissingDocuments());
const maybe = documentsAvailable ? it : it.skip;

function loadRealGameData(region: 0 | 1 | 2 = 0) {
	const config = ConfigSchema.parse(JSON.parse(readFileSync(`${dir}/config.min.json`, 'utf8')));
	const items = ItemsSchema.parse(JSON.parse(readFileSync(`${dir}/items.min.json`, 'utf8')));
	const equipments = EquipmentsSchema.parse(
		JSON.parse(readFileSync(`${dir}/equipment.min.json`, 'utf8'))
	);
	const students = StudentsSchema.parse(
		JSON.parse(readFileSync(`${dir}/students.min.json`, 'utf8'))
	);
	const stages = StagesSchema.parse(JSON.parse(readFileSync(`${dir}/stages.min.json`, 'utf8')));
	const localizationRaw = LocalizationSchema.parse(
		JSON.parse(readFileSync(`${dir}/localization.min.json`, 'utf8'))
	);
	const raw: RawGameDataType = {
		language: 'en',
		config,
		students: Object.values(students),
		items: Object.values(items),
		equipments: Object.values(equipments),
		stages: Object.values(stages),
		localizationRaw
	};
	return buildGameData(raw, region);
}

describe('real schaledb data', () => {
	maybe('parses all six documents and builds indexes', () => {
		const game = loadRealGameData();
		expect(game.students.size).toBeGreaterThan(200);
		expect(game.equipments.size).toBeGreaterThan(150);
		expect(game.items.size).toBeGreaterThan(500);
		expect(game.campaigns.length).toBeGreaterThan(100);
		expect(game.studentLevelMax).toBe(90);
		expect(game.weaponLevelMax).toBe(60);
		expect(game.commonFavorItemTags.length).toBeGreaterThan(0);
	});

	maybe('every student has exactly 4 deck skills', () => {
		const game = loadRealGameData();
		for (const student of game.students.values()) {
			expect(student.skills.length, `student ${student.id}`).toBe(4);
		}
	});

	maybe('every equipment category has tiers and a max tier', () => {
		const game = loadRealGameData();
		expect(game.equipmentCategoryMaxTier.get('Hat')).toBe(10);
		const wearables = Object.keys({
			Badge: 1,
			Bag: 1,
			Charm: 1,
			Gloves: 1,
			Hairpin: 1,
			Hat: 1,
			Necklace: 1,
			Shoes: 1,
			Watch: 1
		});
		for (const category of wearables) {
			expect(game.equipmentCategoryMaxTier.get(category as never), category).toBeGreaterThan(0);
		}
	});

	maybe('campaign rewards contain no raw currency ids', () => {
		const game = loadRealGameData();
		for (const campaign of game.campaigns) {
			for (const reward of campaign.rewards) {
				if (reward.type === 'Currency') {
					expect(reward.id).toBe(3_000_000);
				}
			}
		}
	});

	maybe('stockables has equipments first then items', () => {
		const game = loadRealGameData();
		const firstItem = game.stockables.findIndex((id) => id < 2_000_000);
		for (let i = 0; i < firstItem; i++) {
			expect(game.stockables[i]).toBeGreaterThanOrEqual(2_000_000);
		}
		const categories = new Set(game.stockables.map((id) => getStuff(game, id)?.category));
		expect(categories.has('Favor')).toBe(true);
		expect(categories.has('SecretStone')).toBe(true);
		expect(categories.has('Material')).toBe(true);
	});

	maybe('localization lookups return real strings', () => {
		const game = loadRealGameData();
		expect(game.localization.serverName(0)).toBe('JP');
		expect(game.localization.serverName(1)).toBe('Global');
		expect(game.localization.ui('students').length).toBeGreaterThan(0);
		expect(game.localization.stageType('Campaign').length).toBeGreaterThan(0);
	});

	maybe('icons list is large (raids + extras + students + schools)', () => {
		const game = loadRealGameData();
		expect(game.icons.length).toBeGreaterThan(26 + 44 + game.students.size);
	});

	maybe('universal blueprints: exactly 9, one per equipment category, JP released / CN not', () => {
		const game = loadRealGameData();
		expect(game.universalBlueprintByCategory.size).toBe(9);
		expect(new Set(game.universalBlueprintByCategory.keys())).toEqual(
			new Set(Object.keys(EquipmentCategory))
		);
		for (const [category, id] of game.universalBlueprintByCategory) {
			const equipment = game.equipments.get(id)!;
			expect(equipment.tier, category).toBe(0);
			expect(equipment.recipe ?? null, category).toBeNull();
			expect(equipment.icon, category).toContain('useall');
			expect(equipment.isReleased[0], category).toBe(true);
			expect(equipment.isReleased[2], category).toBe(false);
		}
		// CN region: universals are release-filtered out entirely.
		const cn = loadRealGameData(2);
		expect(cn.universalBlueprintByCategory.size).toBe(0);
		// Every category has a non-empty blueprint list in DESC tier order.
		for (const [category, list] of game.blueprintsByCategory) {
			expect(list.length, category).toBeGreaterThan(0);
			for (let i = 1; i < list.length; i++) {
				const prev = game.equipments.get(list[i - 1]!)!;
				const curr = game.equipments.get(list[i]!)!;
				expect(prev.tier, category).toBeGreaterThanOrEqual(curr.tier);
			}
		}
	});
});
