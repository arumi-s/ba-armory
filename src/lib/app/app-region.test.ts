import { beforeAll, describe, expect, test, vi } from 'vitest';
import { AppState } from './app.svelte';
import type { RegionId } from '#lib/config';
import { normalizeDeck } from '#lib/deck/normalize';
import { setEquipmentTier, setLevel, setSkillLevel } from '#lib/deck/mutate';
import { serializeDeck } from '#lib/deck/persist';
import { ConfigSchema, EquipmentSchema, StudentsSchema } from '#lib/data/schemas';
import type { RawGameDataType } from '#lib/data/indexes';
import { buildRaw, equipmentRaw, studentRaw } from '#lib/data/test-fixtures';
import { EQUIPMENT_OFFSET } from '#lib/data/enums';

/* Region 0 (JP): level cap 90, Hat tiers 1+2 released.
   Region 1 (Global): level cap 85, Hat tier 2 unreleased (max tier 1). */
function twoRegionRaw(): RawGameDataType {
	return buildRaw({
		config: ConfigSchema.parse({
			Regions: [
				{ Name: 'Jp', StudentMaxLevel: 90, WeaponMaxLevel: 60 },
				{ Name: 'Global', StudentMaxLevel: 85, WeaponMaxLevel: 50 }
			],
			CommonFavorItemTags: ['BC']
		}),
		students: Object.values(StudentsSchema.parse({ a: studentRaw(10000) })),
		equipments: [
			EquipmentSchema.parse(equipmentRaw(1, 'Hat', 1)),
			EquipmentSchema.parse(equipmentRaw(2, 'Hat', 2, { IsReleased: [true, false, true] }))
		]
	});
}

const STUDENT_ID = 10000;

function createApp(raw: RawGameDataType, region: RegionId = 0, json: unknown = {}): AppState {
	const app = new AppState();
	app.raw = raw;
	app.region = region;
	app.deck = normalizeDeck(json, app.game!, 'Squad');
	return app;
}

const storage = new Map<string, string>();
const fetchMock = vi.fn();

describe('AppState.switchRegion (option A: pure state flip + re-normalize)', () => {
	beforeAll(() => {
		vi.stubGlobal('localStorage', {
			getItem: (key: string) => storage.get(key) ?? null,
			setItem: (key: string, value: string) => storage.set(key, String(value)),
			removeItem: (key: string) => storage.delete(key)
		});
		vi.stubGlobal('fetch', fetchMock);
	});

	test('derived indexes rebuild for the new region from the same raw bundle', () => {
		const raw = twoRegionRaw();
		const app = createApp(raw, 0);

		expect(app.game!.studentLevelMax).toBe(90);
		expect(app.game!.equipmentsByCategory.get('Hat')?.get(2)).toBe(2 + EQUIPMENT_OFFSET);
		expect(app.game!.stockables).toContain(2 + EQUIPMENT_OFFSET);

		app.switchRegion(1);

		expect(app.game!.studentLevelMax).toBe(85);
		expect(app.game!.equipmentsByCategory.get('Hat')?.get(2)).toBeUndefined();
		expect(app.game!.equipmentCategoryMaxTier.get('Hat')).toBe(1);
		expect(app.game!.stockables).not.toContain(2 + EQUIPMENT_OFFSET);
	});

	test('out-of-range values clamp to the new caps (level 90→85, tier 2→1)', () => {
		const raw = twoRegionRaw();
		const app = createApp(raw, 0);
		const d = app.deck!.students[STUDENT_ID]!;
		setLevel(d, 90, app.game!);
		setEquipmentTier(d, 0, 2, app.game!, app.game!.students.get(STUDENT_ID)!);
		expect(d.level).toBe(90);
		expect(d.equipments[0]!.tier).toBe(2);

		app.switchRegion(1);

		// deck entry replaced wholesale by the re-normalized one
		const clamped = app.deck!.students[STUDENT_ID]!;
		expect(clamped.level).toBe(85);
		expect(clamped.levelTarget).toBe(85);
		expect(clamped.equipments[0]!.tier).toBe(1);
		expect(clamped.equipments[0]!.tierTarget).toBe(1);
	});

	test('non-out-of-range unsaved edits survive; dirty flag untouched', () => {
		const raw = twoRegionRaw();
		const app = createApp(raw, 0);
		const d = app.deck!.students[STUDENT_ID]!;
		setSkillLevel(d, 1, 7, app.game!.students.get(STUDENT_ID)!);
		app.dirty = true;

		app.switchRegion(1);

		const kept = app.deck!.students[STUDENT_ID]!;
		expect(kept.skills[1]!.level).toBe(7);
		expect(app.dirty).toBe(true);
	});

	test('no network: fetcher never called, raw bundle identity preserved', () => {
		fetchMock.mockClear();
		const raw = twoRegionRaw();
		const app = createApp(raw, 0);
		app.switchRegion(1);
		app.switchRegion(2); // no config for region 2 → index build falls back to defaults
		expect(fetchMock).not.toHaveBeenCalled();
		expect(app.raw).toBe(raw); // same reference — no refetch, no reload
	});

	test('A→B equals a fresh boot in region B with the same deck data', () => {
		const raw = twoRegionRaw();
		// Boot in A with values that are legal in A and out-of-range in B.
		const bootA = createApp(raw, 0);
		const dA = bootA.deck!.students[STUDENT_ID]!;
		setLevel(dA, 90, bootA.game!);
		setEquipmentTier(dA, 0, 2, bootA.game!, bootA.game!.students.get(STUDENT_ID)!);
		const json = serializeDeck(bootA.deck!);

		const switched = createApp(raw, 0, json);
		switched.switchRegion(1);
		const rebootedInB = createApp(raw, 1, json);

		expect(serializeDeck(switched.deck!)).toEqual(serializeDeck(rebootedInB.deck!));
		expect(switched.game!.studentLevelMax).toBe(rebootedInB.game!.studentLevelMax);
	});

	test('A→B→A keeps clamped values (option A is irreversible)', () => {
		const raw = twoRegionRaw();
		const app = createApp(raw, 0);
		const d = app.deck!.students[STUDENT_ID]!;
		setLevel(d, 90, app.game!);

		app.switchRegion(1);
		app.switchRegion(0);

		const restored = app.deck!.students[STUDENT_ID]!;
		expect(restored.level).toBe(85); // not restored to 90
		expect(app.game!.studentLevelMax).toBe(90); // indexes fully back on A
	});

	test('same-region switch is a no-op (deck identity preserved)', () => {
		const raw = twoRegionRaw();
		const app = createApp(raw, 1);
		const before = app.deck;
		app.switchRegion(1);
		expect(app.deck).toBe(before);
	});
});
