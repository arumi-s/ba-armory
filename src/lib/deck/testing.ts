import type { GameDataType, RawGameDataType } from '#lib/data/indexes';
import { buildGameData } from '#lib/data/indexes';
import {
	ConfigSchema,
	EquipmentsSchema,
	ItemsSchema,
	StudentsSchema,
	StagesSchema
} from '#lib/data/schemas';

/** PascalCase raw student fixture (schaledb shape). */
export const studentRaw = (id: number, overrides: Record<string, unknown> = {}) => ({
	Id: id,
	Name: `Student ${id}`,
	School: 'Gehenna',
	PathName: `student-${id}`,
	StarGrade: 3,
	SquadType: 'Main',
	BulletType: 'Explosion',
	ArmorType: 'LightArmor',
	StreetBattleAdaptation: 4,
	OutdoorBattleAdaptation: 2,
	IndoorBattleAdaptation: 0,
	Equipment: ['Hat', 'Hairpin', 'Watch'],
	IsReleased: [true, true, true],
	CollectionBG: 'BG',
	FavorItemTags: ['ak', 'aV'],
	FavorItemUniqueTags: ['BD'],
	Weapon: { Name: 'W', AdaptationType: 'Street', AdaptationValue: 1 },
	Gear: {
		Released: [true, true, true],
		TierUpMaterial: [
			[5017, 150],
			[5018, 100]
		],
		TierUpMaterialAmount: [
			[1, 2],
			[4, 5]
		]
	},
	SkillExMaterial: [
		[3030, 150],
		[3031, 3030]
	],
	SkillExMaterialAmount: [
		[12, 17],
		[13, 18]
	],
	SkillMaterial: [[4001], [4001, 4002], [4002], [4001, 4001], [4002], [4002, 4002], [4001], [4002]],
	SkillMaterialAmount: [[1], [2, 3], [4], [5, 6], [7], [8, 9], [10], [11]],
	Skills: {
		Ex: { Name: 'ex', Icon: 'i-ex' },
		Public: { Name: 'pub', Icon: 'i-pub' },
		Passive: { Name: 'pas', Icon: 'i-pas' },
		ExtraPassive: { Name: 'sub', Icon: 'i-sub' }
	},
	...overrides
});

export const equipmentRaw = (
	id: number,
	category: string,
	tier: number,
	overrides: Record<string, unknown> = {}
) => ({
	Id: id,
	Category: category,
	Rarity: 'N',
	Tier: tier,
	Icon: `icon_${category}_${tier}`,
	Name: `${category} T${tier}`,
	Desc: '',
	IsReleased: [true, true, true],
	StatType: [],
	StatValue: [],
	...overrides
});

export const itemRaw = (id: number, category: string, overrides: Record<string, unknown> = {}) => ({
	Id: id,
	Category: category,
	Rarity: 'N',
	Tier: 0,
	Icon: `item_icon_${id}`,
	Name: `Item ${id}`,
	Desc: '',
	IsReleased: [true, true, true],
	StatType: [],
	StatValue: [],
	...overrides
});

export const stageRaw = (id: number, overrides: Record<string, unknown> = {}) => ({
	Id: id,
	Category: 'Campaign',
	Difficulty: 0,
	Area: 1,
	Stage: 1,
	Name: 'Stage',
	EntryCost: [[5, 10]],
	Terrain: 'Street',
	Level: 1,
	Rewards: [{ Type: 'Item', Id: 4001, Chance: 1 }],
	...overrides
});

export interface FixtureOverrides {
	students?: Record<string, unknown>[];
	equipments?: Record<string, unknown>[];
	items?: Record<string, unknown>[];
	stages?: Record<string, unknown>[];
	region?: 0 | 1 | 2;
}

/** Raw bundle backing an AppState (game derives from it; see app.svelte.ts). */
export function buildFixtureRaw(overrides: FixtureOverrides = {}): RawGameDataType {
	return {
		language: 'en',
		config: ConfigSchema.parse({
			Regions: [
				{ Name: 'Jp', StudentMaxLevel: 90, WeaponMaxLevel: 60 },
				{ Name: 'Global', StudentMaxLevel: 90, WeaponMaxLevel: 60 },
				{ Name: 'CN', StudentMaxLevel: 85, WeaponMaxLevel: 50 }
			],
			CommonFavorItemTags: ['BC']
		}),
		students: Object.values(
			StudentsSchema.parse(
				Object.fromEntries((overrides.students ?? [studentRaw(10000)]).map((raw, i) => [i, raw]))
			)
		),
		items: Object.values(
			ItemsSchema.parse(Object.fromEntries((overrides.items ?? []).map((raw, i) => [i, raw])))
		),
		equipments: Object.values(
			EquipmentsSchema.parse(
				Object.fromEntries((overrides.equipments ?? []).map((raw, i) => [i, raw]))
			)
		),
		stages: Object.values(
			StagesSchema.parse(Object.fromEntries((overrides.stages ?? []).map((raw, i) => [i, raw])))
		),
		localizationRaw: {
			ServerName: { '0': 'JP', '1': 'Global', '2': 'CN' },
			UI: { students: 'Students' }
		}
	};
}

export function buildFixtureGame(overrides: FixtureOverrides = {}): GameDataType {
	return buildGameData(buildFixtureRaw(overrides), overrides.region ?? 0);
}
