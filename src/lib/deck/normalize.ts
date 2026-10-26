import type { GameDataType } from '#lib/data/indexes';
import { ALT_OFFSET, Terrain } from '#lib/data/enums';
import { DeckSchema, type DeckType } from './schema';
import {
	CURRENT_RANK_MAX,
	CURRENT_RANK_MIN,
	STAR_MAX,
	WEAPON_MAX,
	equipmentTierMaxOf,
	gearMaxOf,
	skillLevelMaxOf,
	type DeckSkillState,
	type DeckEquipmentState,
	type DeckSquadState,
	type DeckState,
	type DeckStudentState
} from './types';
import { clampInt } from './mutate';

/** Parse raw persisted JSON (loose) into the validated deck JSON shape. */
export function parseDeckJson(json: unknown): DeckType {
	return DeckSchema.parse(json);
}

function defaultStudent(game: GameDataType, id: number, studentId: number): DeckStudentState {
	const student = game.students.get(studentId);
	return {
		id,
		level: 1,
		levelTarget: 1,
		star: student?.starGrade ?? 1,
		starTarget: student?.starGrade ?? 1,
		weapon: 0,
		weaponTarget: 0,
		gear: 0,
		gearTarget: 0,
		elephCost: 1,
		elephRemain: 20,
		isTarget: false,
		skills: [],
		equipments: []
	};
}

function clampStudent(game: GameDataType, entry: DeckStudentState): void {
	const student = game.students.get(entry.id % ALT_OFFSET);
	const levelMax = game.studentLevelMax;
	const starMin = student?.starGrade ?? 1;
	const gearMax = student ? gearMaxOf(student) : 0;

	// ClampTarget semantics: target = clamp(target, [max(current, min), max]),
	// normalizing -1/null/undefined to the current value.
	entry.level = clampInt(entry.level, 1, levelMax);
	entry.levelTarget = clampInt(entry.levelTarget, entry.level, levelMax);
	entry.star = clampInt(entry.star, starMin, STAR_MAX);
	entry.starTarget = clampInt(entry.starTarget, entry.star, STAR_MAX);
	entry.weapon = clampInt(entry.weapon, 0, WEAPON_MAX);
	entry.weaponTarget = clampInt(entry.weaponTarget, entry.weapon, WEAPON_MAX);
	entry.gear = clampInt(entry.gear, 0, gearMax);
	entry.gearTarget = clampInt(entry.gearTarget, entry.gear, gearMax);
	entry.elephCost = clampInt(entry.elephCost, 1, 5);
	entry.elephRemain = clampInt(entry.elephRemain, 0, 20);

	// NOTE: the star<5 → weapon=0 linkage is intentionally NOT applied here:
	// values loaded from a save keep a weapon even below 5★ (the linkage only
	// fires on runtime star edits — see mutate.setStar), preserving round-trip
	// fidelity of persisted decks.

	if (student) {
		// Skills: keep at most 4 slots, aligned to the student's deck skills.
		const skills: DeckSkillState[] = [];
		for (let index = 0; index < student.skills.length && index < 4; index++) {
			const raw = entry.skills[index];
			const levelMax = skillLevelMaxOf(student, index);
			const level = clampInt(raw?.level ?? 1, 1, levelMax);
			skills.push({
				studentId: entry.id,
				index,
				level,
				levelTarget: clampInt(raw?.levelTarget ?? -1, level, levelMax)
			});
		}
		entry.skills = skills;

		// Equipments: 3 slots aligned to the student's equipment categories.
		const equipments: DeckEquipmentState[] = [];
		for (let index = 0; index < student.equipment.length; index++) {
			const raw = entry.equipments[index];
			const tierMax = equipmentTierMaxOf(game, student, index);
			const tier = clampInt(raw?.tier ?? 0, 0, tierMax);
			equipments.push({
				studentId: entry.id,
				index,
				tier,
				tierTarget: clampInt(raw?.tierTarget ?? -1, tier, tierMax)
			});
		}
		entry.equipments = equipments;
	} else {
		entry.skills = entry.skills.slice(0, 4);
		entry.equipments = entry.equipments.slice(0, 3);
	}
}

/**
 * Turn persisted (possibly dirty/partial) deck JSON into the canonical runtime
 * DeckState (clamps and slot alignment included).
 */
export function normalizeDeck(json: unknown, game: GameDataType, squadName: string): DeckState {
	const parsed = parseDeckJson(json);

	const stocks: Record<number, number> = {};
	for (const [key, value] of Object.entries(parsed.stocks)) {
		const id = Number(key);
		if (!Number.isFinite(id)) continue;
		stocks[id] = Math.max(0, Math.floor(Number(value) || 0));
	}

	// Base entries for every game student; JSON entries override in place;
	// alt entries (> ALT_OFFSET) from the JSON are appended.
	const jsonStudents = new Map(parsed.students.map((entry) => [entry.id, entry]));
	const students: Record<number, DeckStudentState> = {};
	for (const [studentId] of game.students) {
		const entry: DeckStudentState = {
			...defaultStudent(game, studentId, studentId),
			...(jsonStudents.get(studentId) as Partial<DeckStudentState> | undefined),
			id: studentId
		};
		entry.skills = (entry.skills ?? []).map((skill, index) => ({ ...skill, index, studentId }));
		entry.equipments = (entry.equipments ?? []).map((eq, index) => ({ ...eq, index, studentId }));
		clampStudent(game, entry);
		students[studentId] = entry;
	}
	for (const raw of parsed.students) {
		if (raw.id <= ALT_OFFSET) continue;
		const entry: DeckStudentState = {
			...defaultStudent(game, raw.id, raw.id % ALT_OFFSET),
			...(jsonStudents.get(raw.id) as Partial<DeckStudentState> | undefined),
			id: raw.id
		};
		entry.skills = (entry.skills ?? []).map((skill, index) => ({
			...skill,
			index,
			studentId: raw.id
		}));
		entry.equipments = (entry.equipments ?? []).map((eq, index) => ({
			...eq,
			index,
			studentId: raw.id
		}));
		clampStudent(game, entry);
		students[raw.id] = entry;
	}

	// Squads: default naming, terrain validation, student-id filtering.
	const terrainSet = new Set<string>(Object.keys(Terrain));
	let squads: DeckSquadState[] = parsed.squads.map((squad, id) => ({
		icon: squad.icon ?? '',
		name: squad.name || `${squadName} #${id + 1}`,
		terrain: squad.terrain && terrainSet.has(squad.terrain) ? squad.terrain : Terrain.Street,
		students: (squad.students ?? []).filter((studentId) => students[studentId] != null),
		pinned: squad.pinned ?? false,
		bounded: squad.bounded ?? false,
		folded: squad.folded ?? false,
		tab: squad.tab ?? 0
	}));
	if (squads.length === 0) {
		squads = [
			{
				icon: '',
				name: `${squadName} #1`,
				terrain: Terrain.Street,
				students: [],
				pinned: false,
				bounded: false,
				folded: false,
				tab: 0
			}
		];
	}

	const options = { ...parsed.options };
	options.currentRank = clampInt(options.currentRank, CURRENT_RANK_MIN, CURRENT_RANK_MAX);

	return {
		options,
		students,
		stocks,
		squads,
		selectedSquadId: Math.max(Math.min(parsed.selectedSquadId, squads.length - 1), 0)
	};
}
