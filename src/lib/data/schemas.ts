import { z } from 'zod';

import { camelCaseCodec, toCamelCaseKeysDeep } from './camel-case';
import { CURRENCY_OFFSET, EQUIPMENT_OFFSET, DECK_SKILL_TYPES, RewardType } from './enums';

/* ------------------------------------------------------------------ */
/* Skills / Weapon / Gear                                              */
/* ------------------------------------------------------------------ */

// Flat entities go through the bidirectional codec.

const SkillRawSchema = z.looseObject({
	SkillType: z.string().catch(''),
	Name: z.string().catch(''),
	Icon: z.string().catch('')
});
export const SkillSchema = camelCaseCodec(SkillRawSchema);
export type SkillType = z.infer<typeof SkillSchema>;

const WeaponRawSchema = z.looseObject({
	Name: z.string().catch(''),
	AdaptationType: z.string().catch(''),
	AdaptationValue: z.number().catch(0)
});
export const WeaponSchema = camelCaseCodec(WeaponRawSchema);
export type WeaponType = z.infer<typeof WeaponSchema>;

const GearRawSchema = z.looseObject({
	Released: z.array(z.boolean()).optional(),
	TierUpMaterial: z.array(z.array(z.number())).catch([]),
	TierUpMaterialAmount: z.array(z.array(z.number())).catch([])
});
export const GearSchema = camelCaseCodec(GearRawSchema);
export type GearType = z.infer<typeof GearSchema>;

/* ------------------------------------------------------------------ */
/* Students                                                            */
/* ------------------------------------------------------------------ */

const StudentRawSchema = z.looseObject({
	Id: z.number(),
	Name: z.string(),
	School: z.string(),
	PathName: z.string(),
	StarGrade: z.number(),
	SquadType: z.string().catch(''),
	BulletType: z.string().catch(''),
	ArmorType: z.string().catch(''),
	StreetBattleAdaptation: z.number().catch(0),
	OutdoorBattleAdaptation: z.number().catch(0),
	IndoorBattleAdaptation: z.number().catch(0),
	Equipment: z.array(z.string()).catch([]),
	IsReleased: z.array(z.boolean()).catch([]),
	CollectionBG: z.string().nullable().catch(''),
	FavorItemTags: z.array(z.string()).catch([]),
	FavorItemUniqueTags: z.array(z.string()).catch([]),
	Weapon: WeaponRawSchema,
	Gear: GearRawSchema,
	SkillExMaterial: z.array(z.array(z.number())).catch([]),
	SkillExMaterialAmount: z.array(z.array(z.number())).catch([]),
	SkillMaterial: z.array(z.array(z.number())).catch([]),
	SkillMaterialAmount: z.array(z.array(z.number())).catch([]),
	Skills: z.record(z.string(), z.unknown()).catch({})
});

export interface StudentSkillType extends SkillType {
	skillType: string;
}

export interface StudentWeaponType {
	name: string;
	adaptationType: string;
	adaptationValue: number;
}

export interface StudentGearType {
	released?: boolean[];
	tierUpMaterial: number[][];
	tierUpMaterialAmount: number[][];
}

export interface StudentType {
	id: number;
	name: string;
	school: string;
	pathName: string;
	starGrade: number;
	squadType: string;
	bulletType: string;
	armorType: string;
	streetBattleAdaptation: number;
	outdoorBattleAdaptation: number;
	indoorBattleAdaptation: number;
	equipment: string[];
	isReleased: boolean[];
	collectionBG: string | null;
	favorItemTags: string[];
	favorItemUniqueTags: string[];
	weapon: StudentWeaponType;
	gear: StudentGearType;
	skillExMaterial: number[][];
	skillExMaterialAmount: number[][];
	skillMaterial: number[][];
	skillMaterialAmount: number[][];
	skills: StudentSkillType[];
	[key: string]: unknown;
}

// Nested objects (Weapon/Gear/Skills values) keep PascalCase keys through the
// codec decode step, so students use the deep single-way transform instead.
// The explicit output interface documents the post-transform shape (the deep
// mapped type confuses svelte-check's language service).
export const StudentSchema: z.ZodType<StudentType> = StudentRawSchema.transform(
	toCamelCaseKeysDeep()
).transform((student) => ({
	...student,
	// Skills object → array, each entry tagged with its (Pascal-cased) key,
	// filtered to the four usable deck slots (Ex / Public / Passive / ExtraPassive).
	skills: Object.entries((student as { skills: Record<string, unknown> }).skills)
		.map(([key, value]) => {
			const skillType = key.charAt(0).toUpperCase() + key.slice(1);
			return { ...(value as object), skillType } as StudentSkillType;
		})
		.filter((skill) => DECK_SKILL_TYPES.includes(skill.skillType))
}));

/* ------------------------------------------------------------------ */
/* Items & Equipment (schaledb shares one shape for both)               */
/* ------------------------------------------------------------------ */

const StuffRawSchema = z.looseObject({
	Id: z.number(),
	Category: z.string().catch(''),
	Rarity: z.string().catch('N'),
	Tier: z.number().catch(0),
	Icon: z.string().catch(''),
	Name: z.string().catch(''),
	Desc: z.string().catch(''),
	IsReleased: z.array(z.boolean()).catch([]),
	StatType: z.array(z.string()).catch([]),
	StatValue: z.array(z.array(z.number())).catch([]),
	Recipe: z.array(z.tuple([z.number(), z.number()])).nullish(),
	RecipeCost: z.number().nullish(),
	ExpValue: z.number().nullish(),
	Tags: z.array(z.string()).nullish()
});

/** Items keep their original ids. */
export const ItemSchema = camelCaseCodec(StuffRawSchema);
export type ItemType = z.infer<typeof ItemSchema>;

/** Equipment ids (and recipe ingredient ids) are shifted into the global space. */
export const EquipmentSchema = camelCaseCodec(StuffRawSchema).transform((equipment) => ({
	...equipment,
	id: equipment.id + EQUIPMENT_OFFSET,
	recipe: equipment.recipe?.map(
		([id, amount]) => [id + EQUIPMENT_OFFSET, amount] as [number, number]
	)
}));
export type EquipmentType = z.infer<typeof EquipmentSchema>;

/* ------------------------------------------------------------------ */
/* Stages / Campaigns                                                  */
/* ------------------------------------------------------------------ */

const KEEP_REWARD_TYPES = ['Item', 'Equipment', 'Currency'];

export interface RewardCoreType {
	type: string;
	id: number;
	amount?: number | null;
	chance: number;
	rewardType: string;
}

const RewardRawSchema = z.looseObject({
	Type: z.string().catch(''),
	Id: z.number().catch(0),
	Amount: z.number().nullish(),
	Chance: z.number().catch(1),
	RewardType: z.string().catch(RewardType.Default)
});

function fixRewardId<T extends { type: string; id: number }>(reward: T): T {
	return {
		...reward,
		id:
			reward.type === 'Currency'
				? CURRENCY_OFFSET
				: reward.type === 'Equipment'
					? reward.id + EQUIPMENT_OFFSET
					: reward.id
	};
}

export const RewardSchema = camelCaseCodec(RewardRawSchema).transform(fixRewardId);
export type RewardTypeType = z.infer<typeof RewardSchema>;

export interface CampaignType {
	id: number;
	category: string;
	difficulty: number;
	area: number;
	stage: number;
	name: string;
	entryCost: number[][];
	terrain: string;
	level: number;
	rewards: RewardCoreType[];
	[key: string]: unknown;
}

const CampaignRawSchema = z.looseObject({
	Id: z.number(),
	Category: z.string().catch(''),
	Difficulty: z.number().catch(0),
	Area: z.number().catch(0),
	Stage: z.number().catch(0),
	Name: z.string().catch(''),
	EntryCost: z.array(z.tuple([z.number(), z.number()])).catch([]),
	Terrain: z.string().catch('Street'),
	Level: z.number().catch(0),
	Rewards: z.array(RewardRawSchema).catch([])
});

// Nested reward objects require the deep transform (see StudentSchema note).
export const CampaignSchema: z.ZodType<CampaignType> = CampaignRawSchema.transform(
	toCamelCaseKeysDeep()
).transform((campaign) => ({
	...campaign,
	// fixReward: keep item/equipment/currency drops only, remap ids (§3.3).
	rewards: (campaign as { rewards: RewardCoreType[] }).rewards
		.filter((reward) => KEEP_REWARD_TYPES.includes(reward.type))
		.map((reward) => fixRewardId(reward))
}));

export const StagesSchema = z.record(z.string(), CampaignSchema);
export type StagesType = z.infer<typeof StagesSchema>;

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

export interface ConfigRegionType {
	name: string;
	studentMaxLevel: number;
	weaponMaxLevel: number;
}

export interface ConfigType {
	regions: ConfigRegionType[];
	commonFavorItemTags: string[];
	[key: string]: unknown;
}

const RegionRawSchema = z.looseObject({
	Name: z.string().catch(''),
	StudentMaxLevel: z.number().catch(0),
	WeaponMaxLevel: z.number().catch(0)
});

const ConfigRawSchema = z.looseObject({
	Regions: z.array(RegionRawSchema).catch([]),
	CommonFavorItemTags: z.array(z.string()).catch([])
});

// Nested region objects require the deep transform (see StudentSchema note).
export const ConfigSchema: z.ZodType<ConfigType> = ConfigRawSchema.transform(toCamelCaseKeysDeep());

/* ------------------------------------------------------------------ */
/* Localization (runtime data, intentionally loose)                    */
/* ------------------------------------------------------------------ */

export const LocalizationSchema = z.record(z.string(), z.unknown());
export type LocalizationType = z.infer<typeof LocalizationSchema>;

/* ------------------------------------------------------------------ */
/* Container schemas for the 6 CDN documents                           */
/* ------------------------------------------------------------------ */

export const StudentsSchema = z.record(z.string(), StudentSchema);
export const ItemsSchema = z.record(z.string(), ItemSchema);
export const EquipmentsSchema = z.record(z.string(), EquipmentSchema);
