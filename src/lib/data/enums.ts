/**
 * ID spaces and enum-like constants for the deck persistence format.
 * Key order matters wherever `Object.keys(...).indexOf(...)` is used for sorting.
 */

export const ALT_OFFSET = 1_000_000; // deck alt (assist) student id = student id + ALT_OFFSET
export const FURNITURE_OFFSET = 1_000_000; // [FURNITURE_OFFSET, EQUIPMENT_OFFSET) → furniture, getStuff → null
export const EQUIPMENT_OFFSET = 2_000_000; // global equipment id = source id + EQUIPMENT_OFFSET
export const CURRENCY_OFFSET = 3_000_000; // campaign Currency rewards are remapped to this constant id
export const GACHA_OFFSET = 4_000_000;
export const GOLD_ID = 1;
export const ACTION_POINT_ID = 5; // AP stamina
export const ELIGMA_ID = 23; // Eligma (universal material)

export const SkillType = {
	Ex: 'Ex',
	GearPublic: 'GearPublic',
	Normal: 'Public',
	Passive: 'Passive',
	Sub: 'ExtraPassive',
	WeaponPassive: 'WeaponPassive'
} as const;
export type SkillTypeType = (typeof SkillType)[keyof typeof SkillType];

/** Skill types usable as the 4 deck skill slots, in slot order. */
export const DECK_SKILL_TYPES: readonly string[] = [
	SkillType.Ex,
	SkillType.Normal,
	SkillType.Passive,
	SkillType.Sub
];

export const EquipmentCategory = {
	Badge: 'Badge',
	Bag: 'Bag',
	Charm: 'Charm',
	Gloves: 'Gloves',
	Hairpin: 'Hairpin',
	Hat: 'Hat',
	Necklace: 'Necklace',
	Shoes: 'Shoes',
	Watch: 'Watch'
} as const;
export type EquipmentCategoryType = (typeof EquipmentCategory)[keyof typeof EquipmentCategory];

export const StuffCategory = {
	Background: 'Background',
	Bed: 'Bed',
	Box: 'Box',
	Chair: 'Chair',
	CharacterExpGrowth: 'CharacterExpGrowth',
	Closet: 'Closet',
	Coin: 'Coin',
	Collectible: 'Collectible',
	Consumable: 'Consumable',
	Currency: 'Currency',
	Decorations: 'Decorations',
	Equipment: 'Equipment',
	Exp: 'Exp',
	Favor: 'Favor',
	Floor: 'Floor',
	FloorDecoration: 'FloorDecoration',
	FurnitureEtc: 'FurnitureEtc',
	Furnitures: 'Furnitures',
	HomeAppliance: 'HomeAppliance',
	Interiors: 'Interiors',
	Material: 'Material',
	Prop: 'Prop',
	SecretStone: 'SecretStone',
	Table: 'Table',
	WallDecoration: 'WallDecoration',
	Wallpaper: 'Wallpaper',
	WeaponExpGrowthA: 'WeaponExpGrowthA',
	WeaponExpGrowthB: 'WeaponExpGrowthB',
	WeaponExpGrowthC: 'WeaponExpGrowthC',
	WeaponExpGrowthZ: 'WeaponExpGrowthZ'
} as const;
export type StuffCategoryType = (typeof StuffCategory)[keyof typeof StuffCategory];

export type ItemCategoryType = EquipmentCategoryType | StuffCategoryType;

export const ItemCategoryKeys: readonly string[] = [
	...Object.keys(StuffCategory),
	...Object.keys(EquipmentCategory)
];

export const Terrain = {
	Indoor: 'Indoor',
	Outdoor: 'Outdoor',
	Street: 'Street'
} as const;
export type TerrainType = (typeof Terrain)[keyof typeof Terrain];

export const CampaignDifficulty = {
	Normal: 0,
	Hard: 1
} as const;
export type CampaignDifficultyType = (typeof CampaignDifficulty)[keyof typeof CampaignDifficulty];

export const RewardType = {
	Default: 'Default',
	FirstClear: 'FirstClear',
	ThreeStar: 'ThreeStar'
} as const;
export type RewardTypeType = (typeof RewardType)[keyof typeof RewardType];

export const BulletType = {
	Normal: 'Normal',
	Pierce: 'Pierce',
	Explosion: 'Explosion',
	Mystic: 'Mystic',
	Sonic: 'Sonic'
} as const;
export type BulletTypeType = (typeof BulletType)[keyof typeof BulletType];

export const ArmorType = {
	LightArmor: 'LightArmor',
	HeavyArmor: 'HeavyArmor',
	CompositeArmor: 'CompositeArmor',
	Unarmed: 'Unarmed',
	Structure: 'Structure',
	ElasticArmor: 'ElasticArmor',
	Normal: 'Normal'
} as const;
export type ArmorTypeType = (typeof ArmorType)[keyof typeof ArmorType];

export const SquadType = {
	Main: 'Main',
	Support: 'Support'
} as const;
export type SquadTypeType = (typeof SquadType)[keyof typeof SquadType];

/* ------------------------------------------------------------------ */
/* Game numeric constants                                              */
/* ------------------------------------------------------------------ */

/** Cumulative eleph cost to reach star index (own-character SecretStone). */
export const starSecretStoneAmount = [0, 0, 30, 110, 210, 330];
/** Cumulative eleph cost per UE (weapon) breakthrough. */
export const weaponSecretStoneAmount = [0, 0, 120, 300, 500];
export const skillUpgradeCredits = [
	0, 0, 5000, 12500, 72500, 162500, 462500, 912500, 2412500, 4812500, 8812500
];
export const skillExUpgradeCredits = [0, 0, 80000, 580000, 3580000, 13580000];
export const weaponUpgradeCredits = [0, 0, 500000];

/** [minRank inclusive, gems per hour] tiers, descending reward brackets. */
export const arenaRankRewards: [minRank: number, gemsPerHour: number][] = [
	[1, 45],
	[2, 40],
	[10, 35],
	[100, 30],
	[200, 35],
	[500, 20],
	[1000, 18],
	[2000, 16],
	[4000, 14],
	[8000, 12],
	[15000, 10],
	[Infinity, 0]
];
