import { z } from 'zod';

/**
 * Deck persistence JSON schema (camelCase keys, missing fields fall back to
 * defaults via `.catch`).
 */

export const DeckOptionsSchema = z.looseObject({
	showSurplusItems: z.boolean().catch(false),
	showRequiredItems: z.boolean().catch(false),
	showElephs: z.boolean().catch(false),
	showCampaignHard: z.boolean().catch(false),
	showStudentName: z.boolean().catch(false),
	showDuplicatedStudents: z.boolean().catch(false),
	showFutureStudents: z.boolean().catch(false),
	showUnusedFavor: z.boolean().catch(false),
	isAssistStudents: z.boolean().catch(false),
	showSquadTextStar: z.boolean().catch(false),
	showSquadTextLevel: z.boolean().catch(false),
	showSquadTextSkills: z.boolean().catch(false),
	showSquadTextEquipments: z.boolean().catch(false),
	showSquadTextGear: z.boolean().catch(false),
	showSquadTextWeapon: z.boolean().catch(false),
	filterBulletType: z.array(z.string()).catch([]),
	filterArmorType: z.array(z.string()).catch([]),
	filterSquadType: z.array(z.string()).catch([]),
	filterTerrain: z.array(z.string()).catch([]),
	currentRank: z.number().catch(15000)
});
export type DeckOptionsType = z.infer<typeof DeckOptionsSchema>;

export const DeckSkillSchema = z.looseObject({
	studentId: z.number(),
	index: z.number(),
	level: z.number().catch(1),
	levelTarget: z.number().catch(-1)
});
export type DeckSkillType = z.infer<typeof DeckSkillSchema>;

export const DeckEquipmentSchema = z.looseObject({
	studentId: z.number(),
	index: z.number(),
	tier: z.number().catch(0),
	tierTarget: z.number().catch(-1)
});
export type DeckEquipmentType = z.infer<typeof DeckEquipmentSchema>;

export const DeckStudentSchema = z.looseObject({
	id: z.number(),
	level: z.number().catch(1),
	levelTarget: z.number().catch(-1),
	star: z.number().catch(1),
	starTarget: z.number().catch(-1),
	weapon: z.number().catch(0),
	weaponTarget: z.number().catch(-1),
	gear: z.number().catch(0),
	gearTarget: z.number().catch(-1),
	elephCost: z.number().catch(1),
	elephRemain: z.number().catch(20),
	isTarget: z.boolean().catch(false),
	skills: z.array(DeckSkillSchema).catch([]),
	equipments: z.array(DeckEquipmentSchema).catch([])
});
export type DeckStudentType = z.infer<typeof DeckStudentSchema>;

export const DeckSquadSchema = z.looseObject({
	icon: z.string().catch(''),
	name: z.string().catch(''),
	terrain: z.string().catch('Street'),
	students: z.array(z.number()).catch([]),
	pinned: z.boolean().catch(false),
	bounded: z.boolean().catch(false),
	folded: z.boolean().catch(false),
	tab: z.number().catch(0)
});
export type DeckSquadType = z.infer<typeof DeckSquadSchema>;

export const DEFAULT_OPTIONS: DeckOptionsType = {
	showSurplusItems: false,
	showRequiredItems: false,
	showElephs: false,
	showCampaignHard: false,
	showStudentName: false,
	showDuplicatedStudents: false,
	showFutureStudents: false,
	showUnusedFavor: false,
	isAssistStudents: false,
	showSquadTextStar: false,
	showSquadTextLevel: false,
	showSquadTextSkills: false,
	showSquadTextEquipments: false,
	showSquadTextGear: false,
	showSquadTextWeapon: false,
	filterBulletType: [],
	filterArmorType: [],
	filterSquadType: [],
	filterTerrain: [],
	currentRank: 15000
};

export const DeckSchema = z.object({
	options: DeckOptionsSchema.catch(DEFAULT_OPTIONS),
	students: z.array(DeckStudentSchema).catch([]),
	stocks: z.record(z.string(), z.union([z.number(), z.string(), z.null()])).catch({}),
	squads: z.array(DeckSquadSchema).catch([]),
	selectedSquadId: z.number().catch(0)
});
export type DeckType = z.infer<typeof DeckSchema>;
