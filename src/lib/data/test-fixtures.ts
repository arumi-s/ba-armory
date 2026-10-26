import { buildGameData, type RawGameDataType } from './indexes';
import {
	CampaignSchema,
	ConfigSchema,
	EquipmentSchema,
	ItemSchema,
	StudentsSchema
} from './schemas';

/* Minimal fixtures mirroring the schaledb document shapes (PascalCase).
   Shared by indexes.test.ts, real.test.ts setup and component state tests. */

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
	IsReleased: [true, true, false],
	CollectionBG: 'BG',
	FavorItemTags: ['ak', 'aV'],
	FavorItemUniqueTags: ['BD'],
	Weapon: { Name: 'W', AdaptationType: 'Street', AdaptationValue: 1 },
	Gear: {
		Released: [true, true, true],
		TierUpMaterial: [
			[5017, 150, 151],
			[5018, 100]
		],
		TierUpMaterialAmount: [
			[1, 2, 3],
			[4, 5]
		]
	},
	SkillExMaterial: [[3030, 150]],
	SkillExMaterialAmount: [[12, 17]],
	SkillMaterial: [[1]],
	SkillMaterialAmount: [[2]],
	Skills: {
		Ex: { Name: 'ex', Icon: 'i-ex' },
		Public: { Name: 'pub', Icon: 'i-pub' },
		Passive: { Name: 'pas', Icon: 'i-pas' },
		ExtraPassive: { Name: 'sub', Icon: 'i-sub' },
		WeaponPassive: { Name: 'wp', Icon: 'i-wp' },
		GearPublic: { Name: 'gp', Icon: 'i-gp' }
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
	Rewards: [
		{ Type: 'Item', Id: 101, Chance: 0.5 },
		{ Type: 'Currency', Id: 1, Amount: 100 },
		{ Type: 'Equipment', Id: 3, Amount: 1 },
		{ Type: 'Furniture', Id: 900 },
		{ Type: 'Item', Id: 102, RewardType: 'FirstClear' }
	],
	...overrides
});

export function buildRaw(overrides: Partial<RawGameDataType> = {}): RawGameDataType {
	return {
		language: 'en',
		config: ConfigSchema.parse({
			Regions: [{ Name: 'Jp', StudentMaxLevel: 90, WeaponMaxLevel: 60 }],
			CommonFavorItemTags: ['BC']
		}),
		students: Object.values(StudentsSchema.parse({ a: studentRaw(10000), b: studentRaw(10099) })),
		items: [
			ItemSchema.parse(itemRaw(101, 'Material', { Icon: 'item_icon_material_x' })),
			ItemSchema.parse(itemRaw(200001, 'Material', { Icon: 'item_icon_material_x' })),
			ItemSchema.parse(itemRaw(301, 'SecretStone')),
			ItemSchema.parse(itemRaw(5001, 'Favor', { ExpValue: 20, Tags: ['K', 'BC'] })),
			ItemSchema.parse(itemRaw(50, 'Coin'))
		],
		equipments: [
			EquipmentSchema.parse(equipmentRaw(1, 'Hat', 1)),
			EquipmentSchema.parse(equipmentRaw(2, 'Hat', 2, { Recipe: [[1, 15]], RecipeCost: 100 })),
			EquipmentSchema.parse(equipmentRaw(3, 'Shoes', 1, { IsReleased: [false, true, true] }))
		],
		stages: [
			CampaignSchema.parse(stageRaw(1011101)),
			CampaignSchema.parse(stageRaw(31101, { Category: 'Bounty' }))
		],
		localizationRaw: { ServerName: { '0': 'JP', '1': 'Global' }, UI: { students: 'Students' } },
		...overrides
	};
}

export { buildGameData };
