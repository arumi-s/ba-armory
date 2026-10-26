import type { DeckOptionsType } from './schema';
import type { GameDataType } from '#lib/data/indexes';
import type { StudentType } from '#lib/data/schemas';

/** Runtime deck state — a `$state` deep proxy of plain objects. */
export interface DeckState {
	options: DeckOptionsType;
	/** Keyed by student id (base or alt). Every game student has an entry. */
	students: Record<number, DeckStudentState>;
	/** itemId → owned amount; missing keys read as 0. */
	stocks: Record<number, number>;
	squads: DeckSquadState[];
	selectedSquadId: number;
}

export interface DeckStudentState {
	id: number;
	level: number;
	levelTarget: number;
	star: number;
	starTarget: number;
	weapon: number;
	weaponTarget: number;
	gear: number;
	gearTarget: number;
	/** Eligma unit-price bracket, 1..5. */
	elephCost: number;
	/** Purchases left in the current bracket, 0..20. */
	elephRemain: number;
	isTarget: boolean;
	skills: DeckSkillState[];
	equipments: DeckEquipmentState[];
}

export interface DeckSkillState {
	studentId: number;
	index: number;
	level: number;
	levelTarget: number;
}

export interface DeckEquipmentState {
	studentId: number;
	index: number;
	tier: number;
	tierTarget: number;
}

export interface DeckSquadState {
	icon: string;
	name: string;
	terrain: string;
	students: number[];
	pinned: boolean;
	bounded: boolean;
	folded: boolean;
	/** 0=items 1=campaigns 2=elephs 3=favor 4=gears 5=arena. */
	tab: number;
}

/* ------------------------------------------------------------------ */
/* Derived bounds (hydrate-time constants)                              */
/* ------------------------------------------------------------------ */

export const STUDENT_LEVEL_MAX_DEFAULT = 90;
export const STAR_MAX = 5;
export const WEAPON_MIN = 0;
export const WEAPON_MAX = 4;
export const ELEPH_COST_MIN = 1;
export const ELEPH_COST_MAX = 5;
export const ELEPH_REMAIN_MIN = 0;
export const ELEPH_REMAIN_MAX = 20;
export const CURRENT_RANK_MIN = 1;
export const CURRENT_RANK_MAX = 15000;

export function gearMaxOf(student: StudentType): number {
	return student.gear?.tierUpMaterial?.length ? student.gear.tierUpMaterial.length + 1 : 0;
}

export function skillLevelMaxOf(student: StudentType, index: number): number {
	return student.skills[index]?.skillType === 'Ex' ? 5 : 10;
}

export function equipmentTierMaxOf(
	game: GameDataType,
	student: StudentType,
	index: number
): number {
	const category = student.equipment[index];
	return (category != null ? game.equipmentCategoryMaxTier.get(category as never) : undefined) ?? 0;
}
