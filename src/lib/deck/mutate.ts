import type { GameDataType } from '#lib/data/indexes';
import { getStudent } from '#lib/data/indexes';
import { ALT_OFFSET } from '#lib/data/enums';
import type { StudentType } from '#lib/data/schemas';
import {
	CURRENT_RANK_MAX,
	CURRENT_RANK_MIN,
	STAR_MAX,
	WEAPON_MAX,
	equipmentTierMaxOf,
	gearMaxOf,
	skillLevelMaxOf,
	type DeckSkillState,
	type DeckSquadState,
	type DeckState,
	type DeckStudentState
} from './types';

/* ------------------------------------------------------------------ */
/* Value normalization                                                 */
/* ------------------------------------------------------------------ */

/** floor, NaN→0, clamp to [min, max]. */
export function clampInt(value: number, min: number, max: number): number {
	let v = Math.floor(Number(value));
	if (!Number.isFinite(v)) v = 0;
	return Math.max(min, Math.min(v, max));
}

/**
 * Dirty flag callback injected by AppState (avoids a circular import).
 * Every mutation below calls it after writing.
 */
let dirtyNotifier: (() => void) | null = null;

export function setDirtyNotifier(fn: (() => void) | null): void {
	dirtyNotifier = fn;
}

function markDirty(): void {
	dirtyNotifier?.();
}

/* ------------------------------------------------------------------ */
/* DeckStudent setters (Clamp / ClampTarget semantics)                 */
/* ------------------------------------------------------------------ */

export function setLevel(d: DeckStudentState, v: number, game: GameDataType): void {
	const value = clampInt(v, 1, game.studentLevelMax);
	d.level = value;
	if (d.levelTarget < value) d.levelTarget = value;
	markDirty();
}

export function setLevelTarget(d: DeckStudentState, v: number, game: GameDataType): void {
	d.levelTarget = clampInt(v, d.level, game.studentLevelMax);
	markDirty();
}

export function setStar(d: DeckStudentState, v: number, student: StudentType): void {
	const value = clampInt(v, student.starGrade, STAR_MAX);
	d.star = value;
	if (d.starTarget < value) d.starTarget = value;
	// star < 5 forces UE back to 0.
	if (d.star < STAR_MAX) d.weapon = 0;
	markDirty();
}

export function setStarTarget(d: DeckStudentState, v: number): void {
	const value = clampInt(v, d.star, STAR_MAX);
	d.starTarget = value;
	if (d.starTarget < STAR_MAX) d.weaponTarget = 0;
	markDirty();
}

export function setWeapon(d: DeckStudentState, v: number): void {
	const value = clampInt(v, 0, WEAPON_MAX);
	d.weapon = value;
	if (d.weaponTarget < value) d.weaponTarget = value;
	markDirty();
}

export function setWeaponTarget(d: DeckStudentState, v: number): void {
	d.weaponTarget = clampInt(v, d.weapon, WEAPON_MAX);
	markDirty();
}

export function setGear(d: DeckStudentState, v: number, student: StudentType): void {
	const value = clampInt(v, 0, gearMaxOf(student));
	d.gear = value;
	if (d.gearTarget < value) d.gearTarget = value;
	markDirty();
}

export function setGearTarget(d: DeckStudentState, v: number, student: StudentType): void {
	d.gearTarget = clampInt(v, d.gear, gearMaxOf(student));
	markDirty();
}

export function setElephCost(d: DeckStudentState, v: number): void {
	d.elephCost = clampInt(v, 1, 5);
	markDirty();
}

export function setElephRemain(d: DeckStudentState, v: number): void {
	d.elephRemain = clampInt(v, 0, 20);
	markDirty();
}

export function setIsTarget(d: DeckStudentState, value: boolean): void {
	d.isTarget = value;
	markDirty();
}

export function setSkillLevel(
	d: DeckStudentState,
	index: number,
	v: number,
	student: StudentType
): void {
	const skill = d.skills[index];
	if (!skill) return;
	const levelMax = skillLevelMaxOf(student, index);
	const value = clampInt(v, 1, levelMax);
	skill.level = value;
	if (skill.levelTarget < value) skill.levelTarget = value;
	markDirty();
}

export function setSkillLevelTarget(
	d: DeckStudentState,
	index: number,
	v: number,
	student: StudentType
): void {
	const skill = d.skills[index];
	if (!skill) return;
	skill.levelTarget = clampInt(v, skill.level, skillLevelMaxOf(student, index));
	markDirty();
}

export function setEquipmentTier(
	d: DeckStudentState,
	index: number,
	v: number,
	game: GameDataType,
	student: StudentType
): void {
	const equipment = d.equipments[index];
	if (!equipment) return;
	const tierMax = equipmentTierMaxOf(game, student, index);
	const value = clampInt(v, 0, tierMax);
	equipment.tier = value;
	if (equipment.tierTarget < value) equipment.tierTarget = value;
	markDirty();
}

export function setEquipmentTierTarget(
	d: DeckStudentState,
	index: number,
	v: number,
	game: GameDataType,
	student: StudentType
): void {
	const equipment = d.equipments[index];
	if (!equipment) return;
	equipment.tierTarget = clampInt(v, equipment.tier, equipmentTierMaxOf(game, student, index));
	markDirty();
}

/* ------------------------------------------------------------------ */
/* Stocks & filter arrays                                              */
/* ------------------------------------------------------------------ */

export function setStock(stocks: Record<number, number>, itemId: number, v: number): void {
	const value = Math.max(Math.floor(Number(v) || 0), 0);
	if (stocks[itemId] === value) return;
	stocks[itemId] = value;
	markDirty();
}

export function toggleInArray<T>(arr: T[], value: T): void {
	const index = arr.indexOf(value);
	if (index === -1) arr.push(value);
	else arr.splice(index, 1);
	markDirty();
}

export function setCurrentRank(deck: DeckState, v: number): void {
	deck.options.currentRank = clampInt(v, CURRENT_RANK_MIN, CURRENT_RANK_MAX);
	markDirty();
}

/* ------------------------------------------------------------------ */
/* Squad operations                                                    */
/* ------------------------------------------------------------------ */

function newSquad(squadName: string): DeckSquadState {
	return {
		icon: '',
		name: `${squadName} #placeholder`,
		terrain: 'Street',
		students: [],
		pinned: false,
		bounded: false,
		folded: false,
		tab: 0
	};
}

export function addSquad(deck: DeckState, squadName: string): void {
	const squad = newSquad(squadName);
	deck.squads.push(squad);
	squad.name = `${squadName} #${deck.squads.length}`;
	markDirty();
}

export function removeSquad(deck: DeckState): void {
	if (deck.squads.length === 1) return;
	deck.squads.splice(deck.selectedSquadId, 1);
	deck.selectedSquadId = Math.max(Math.min(deck.selectedSquadId, deck.squads.length - 1), 0);
	markDirty();
}

export function moveSquad(deck: DeckState, dir: -1 | 1): void {
	const selected = deck.selectedSquadId;
	const next = Math.max(Math.min(selected + dir, deck.squads.length - 1), 0);
	if (next === selected) return;
	[deck.squads[next], deck.squads[selected]] = [deck.squads[selected], deck.squads[next]];
	deck.selectedSquadId = next;
	markDirty();
}

export function setSelectedSquadId(deck: DeckState, id: number): void {
	deck.selectedSquadId = Math.max(Math.min(id, deck.squads.length - 1), 0);
}

/* Squad field setters routed through markDirty (UI writes). */
export function setSquadName(squad: DeckSquadState, name: string): void {
	squad.name = name;
	markDirty();
}

export function setSquadIcon(squad: DeckSquadState, icon: string): void {
	squad.icon = icon;
	markDirty();
}

export function setSquadTerrain(squad: DeckSquadState, terrain: string): void {
	squad.terrain = terrain;
	markDirty();
}

export function setSquadTab(squad: DeckSquadState, tab: number): void {
	squad.tab = tab;
	markDirty();
}

export function toggleSquadPinned(squad: DeckSquadState): void {
	squad.pinned = !squad.pinned;
	markDirty();
}

export function toggleSquadBounded(squad: DeckSquadState): void {
	squad.bounded = !squad.bounded;
	markDirty();
}

export function toggleSquadFolded(squad: DeckSquadState): void {
	squad.folded = !squad.folded;
	markDirty();
}

export function addStudentToSquad(deck: DeckState, game: GameDataType, studentId: number): boolean {
	if (studentId > ALT_OFFSET) {
		if (deck.students[studentId] == null) {
			const student = getStudent(game, studentId);
			if (student == null) return false;
			const entry = defaultDeckStudent(student);
			entry.id = studentId;
			entry.skills.forEach((skill) => (skill.studentId = studentId));
			entry.equipments.forEach((equipment) => (equipment.studentId = studentId));
			deck.students[studentId] = entry;
		}
	} else if (!game.students.has(studentId)) {
		return false;
	}
	deck.squads[deck.selectedSquadId]?.students.push(studentId);
	markDirty();
	return true;
}

export function removeStudentFromSquad(squad: DeckSquadState, studentId: number): boolean {
	const index = squad.students.indexOf(studentId);
	if (index === -1) return false;
	squad.students.splice(index, 1);
	markDirty();
	return true;
}

/** Drag & drop reorder — splice move, mirroring the sortablejs indices. */
export function setSquadOrder(squad: DeckSquadState, from: number, to: number): void {
	if (
		from === to ||
		from < 0 ||
		to < 0 ||
		from >= squad.students.length ||
		to >= squad.students.length
	)
		return;
	const [moved] = squad.students.splice(from, 1);
	squad.students.splice(to, 0, moved);
	markDirty();
}

/** In-place sort of squad student ids (used by the sort menu / reverse button). */
export function sortSquadStudents(
	squad: DeckSquadState,
	compare: (a: number, b: number) => number
): void {
	squad.students.sort(compare);
	markDirty();
}

/** Reverse squad student order (sort direction button with no active option). */
export function reverseSquadStudents(squad: DeckSquadState): void {
	squad.students.reverse();
	markDirty();
}

/* ------------------------------------------------------------------ */
/* Bulk actions                                                        */
/* ------------------------------------------------------------------ */

function defaultDeckStudent(student: StudentType): DeckStudentState {
	return {
		id: student.id,
		level: 1,
		levelTarget: 1,
		star: student.starGrade,
		starTarget: student.starGrade,
		weapon: 0,
		weaponTarget: 0,
		gear: 0,
		gearTarget: 0,
		elephCost: 1,
		elephRemain: 20,
		isTarget: false,
		skills: student.skills.slice(0, 4).map((_, index): DeckSkillState => ({
			studentId: student.id,
			index,
			level: 1,
			levelTarget: 1
		})),
		equipments: student.equipment.map((_, index) => ({
			studentId: student.id,
			index,
			tier: 0,
			tierTarget: 0
		}))
	};
}

/** Set every "current" value to its maximum. */
export function maximizeStudent(
	d: DeckStudentState,
	game: GameDataType,
	student: StudentType
): void {
	setLevel(d, game.studentLevelMax, game);
	setStar(d, STAR_MAX, student);
	setWeapon(d, WEAPON_MAX);
	setGear(d, gearMaxOf(student), student);
	for (const skill of d.skills)
		setSkillLevel(d, skill.index, skillLevelMaxOf(student, skill.index), student);
	for (const equipment of d.equipments)
		setEquipmentTier(
			d,
			equipment.index,
			equipmentTierMaxOf(game, student, equipment.index),
			game,
			student
		);
	markDirty();
}

/** Set every equipment target to its maximum tier. */
export function upgradeStudentEquipments(
	d: DeckStudentState,
	game: GameDataType,
	student: StudentType
): void {
	for (const equipment of d.equipments)
		setEquipmentTierTarget(
			d,
			equipment.index,
			equipmentTierMaxOf(game, student, equipment.index),
			game,
			student
		);
	markDirty();
}
