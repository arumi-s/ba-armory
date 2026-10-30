import { describe, expect, it, vi, beforeAll } from 'vitest';

import { ALT_OFFSET } from '#lib/data/enums';
import {
	addSquad,
	addStudentToSquad,
	clampInt,
	maximizeStudent,
	moveSquad,
	removeSquad,
	removeStudentFromSquad,
	reverseSquadStudents,
	setElephCost,
	setElephRemain,
	setEquipmentTier,
	setGear,
	setIsTarget,
	setLevel,
	setLevelTarget,
	setSelectedSquadId,
	setDirtyNotifier,
	setSkillLevel,
	setSquadOrder,
	sortSquadStudents,
	setStar,
	setStarTarget,
	setStock,
	setWeapon,
	toggleInArray,
	upgradeStudentEquipments
} from './mutate';
import { normalizeDeck } from './normalize';
import { exportDeckString, importDeckString, serializeDeck } from './persist';
import type { DeckState, DeckStudentState } from './types';
import { buildFixtureGame, equipmentRaw, studentRaw } from './testing';

beforeAll(() => {
	// Node test environment: provide a minimal localStorage for persist.ts
	const store = new Map<string, string>();
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => void store.set(key, value),
		removeItem: (key: string) => void store.delete(key)
	});
});

const game = buildFixtureGame({
	students: [studentRaw(10000, { StarGrade: 2 }), studentRaw(10001, { StarGrade: 3 })],
	equipments: [
		equipmentRaw(1, 'Hat', 1),
		equipmentRaw(2, 'Hat', 2, { Recipe: [[1, 15]] }),
		equipmentRaw(3, 'Hat', 3, { Recipe: [[2, 15]] }),
		equipmentRaw(11, 'Hairpin', 1),
		equipmentRaw(12, 'Hairpin', 2, { Recipe: [[11, 15]] }),
		equipmentRaw(13, 'Hairpin', 3, { Recipe: [[12, 15]] }),
		equipmentRaw(21, 'Watch', 1),
		equipmentRaw(22, 'Watch', 2, { Recipe: [[21, 15]] }),
		equipmentRaw(23, 'Watch', 3, { Recipe: [[22, 15]] })
	]
});
const student = game.students.get(10000)!;

function freshDeck(): DeckState {
	return normalizeDeck({}, game, 'Squad');
}

function freshStudent(id = 10000): DeckStudentState {
	return normalizeDeck({}, game, 'Squad').students[id];
}

describe('mutate clamps', () => {
	it('clampInt floors, NaN→0 and clamps', () => {
		expect(clampInt(3.7, 1, 5)).toBe(3);
		expect(clampInt(Number.NaN, 1, 5)).toBe(1);
		expect(clampInt(-3, 1, 5)).toBe(1);
		expect(clampInt(99, 1, 5)).toBe(5);
		expect(clampInt('4' as unknown as number, 1, 5)).toBe(4);
	});

	it('setLevel raises target alongside current', () => {
		const d = freshStudent();
		setLevel(d, 50, game);
		expect(d.level).toBe(50);
		expect(d.levelTarget).toBe(50);
		setLevelTarget(d, 30, game);
		expect(d.levelTarget).toBe(50); // target cannot go below current
	});

	it('setStar clamps to starGrade..5 and forces weapon to 0 below 5★', () => {
		const d = freshStudent();
		setWeapon(d, 2);
		setStar(d, 4, student);
		expect(d.star).toBe(4);
		expect(d.weapon).toBe(0);
		setStarTarget(d, 4);
		expect(d.weaponTarget).toBe(0);
		setStarTarget(d, 5);
		expect(d.starTarget).toBe(5);
	});

	it('setGear clamps to gearMax', () => {
		const d = freshStudent();
		setGear(d, 5, student);
		expect(d.gear).toBe(3); // gearMax = tierUpMaterial.length + 1 = 3
	});

	it('setSkillLevel clamps Ex to 5 and others to 10', () => {
		const d = freshStudent();
		setSkillLevel(d, 0, 9, student);
		expect(d.skills[0]?.level).toBe(5); // Ex
		setSkillLevel(d, 1, 11, student);
		expect(d.skills[1]?.level).toBe(10);
		expect(d.skills[1]?.levelTarget).toBe(10);
	});

	it('setEquipmentTier clamps to category max tier', () => {
		const d = freshStudent();
		setEquipmentTier(d, 0, 9, game, student);
		expect(d.equipments[0]?.tier).toBe(3);
	});

	it('eleph setters clamp', () => {
		const d = freshStudent();
		setElephCost(d, 9);
		expect(d.elephCost).toBe(5);
		setElephRemain(d, -4);
		expect(d.elephRemain).toBe(0);
	});

	it('setStock floors at 0 and skips redundant writes', () => {
		const stocks: Record<number, number> = {};
		setStock(stocks, 5, 3.9);
		expect(stocks[5]).toBe(3);
		setStock(stocks, 5, -10);
		expect(stocks[5]).toBe(0);
	});

	it('toggleInArray adds then removes', () => {
		const arr: string[] = [];
		toggleInArray(arr, 'a');
		expect(arr).toEqual(['a']);
		toggleInArray(arr, 'a');
		expect(arr).toEqual([]);
	});

	it('notifies the dirty callback', () => {
		const spy = vi.fn();
		setDirtyNotifier(spy);
		const d = freshStudent();
		setIsTarget(d, true);
		expect(spy).toHaveBeenCalled();
		setDirtyNotifier(null);
	});
});

describe('squad operations', () => {
	it('addSquad names sequentially; removeSquad renumbers and clamps selection', () => {
		const deck = freshDeck();
		expect(deck.squads).toHaveLength(1);
		addSquad(deck, 'Squad');
		expect(deck.squads[1]?.name).toBe('Squad #2');
		setSelectedSquadId(deck, 1);
		removeSquad(deck);
		expect(deck.squads).toHaveLength(1);
		expect(deck.selectedSquadId).toBe(0);
		removeSquad(deck);
		expect(deck.squads).toHaveLength(1); // cannot remove the last squad
	});

	it('moveSquad swaps neighbors and follows selection', () => {
		const deck = freshDeck();
		addSquad(deck, 'Squad');
		addSquad(deck, 'Squad');
		setSelectedSquadId(deck, 1);
		const second = deck.squads[1];
		moveSquad(deck, -1);
		expect(deck.squads[0]).toBe(second);
		expect(deck.selectedSquadId).toBe(0);
	});

	it('addStudentToSquad clones alt entries on first add', () => {
		const deck = freshDeck();
		expect(addStudentToSquad(deck, game, 10001)).toBe(true);
		const altId = 10001 + ALT_OFFSET;
		expect(addStudentToSquad(deck, game, altId)).toBe(true);
		expect(deck.students[altId]).toBeDefined();
		expect(deck.students[altId]?.skills[0]?.studentId).toBe(altId);
		expect(deck.squads[0]?.students).toEqual([10001, altId]);
		expect(addStudentToSquad(deck, game, 999999)).toBe(false);
	});

	it('removeStudentFromSquad splices and reports', () => {
		const deck = freshDeck();
		addStudentToSquad(deck, game, 10000);
		expect(removeStudentFromSquad(deck.squads[0], 10000)).toBe(true);
		expect(removeStudentFromSquad(deck.squads[0], 10000)).toBe(false);
	});

	it('setSquadOrder moves entries', () => {
		const deck = freshDeck();
		addStudentToSquad(deck, game, 10000);
		addStudentToSquad(deck, game, 10001);
		addStudentToSquad(deck, game, 10000 + ALT_OFFSET);
		setSquadOrder(deck.squads[0], 2, 0);
		expect(deck.squads[0]?.students).toEqual([10000 + ALT_OFFSET, 10000, 10001]);
	});

	it('sortSquadStudents sorts in place and notifies the dirty callback', () => {
		const deck = freshDeck();
		addStudentToSquad(deck, game, 10001);
		addStudentToSquad(deck, game, 10000);
		const spy = vi.fn();
		setDirtyNotifier(spy);
		sortSquadStudents(deck.squads[0], (a, b) => a - b);
		expect(deck.squads[0]?.students).toEqual([10000, 10001]);
		expect(spy).toHaveBeenCalledTimes(1);
		setDirtyNotifier(null);
	});

	it('reverseSquadStudents reverses in place and notifies the dirty callback', () => {
		const deck = freshDeck();
		addStudentToSquad(deck, game, 10000);
		addStudentToSquad(deck, game, 10001);
		addStudentToSquad(deck, game, 10000 + ALT_OFFSET);
		const spy = vi.fn();
		setDirtyNotifier(spy);
		reverseSquadStudents(deck.squads[0]);
		expect(deck.squads[0]?.students).toEqual([10000 + ALT_OFFSET, 10001, 10000]);
		expect(spy).toHaveBeenCalledTimes(1);
		setDirtyNotifier(null);
	});
});

describe('bulk actions', () => {
	it('maximizeStudent sets everything to max', () => {
		const d = freshStudent();
		maximizeStudent(d, game, student);
		expect(d.level).toBe(90);
		expect(d.star).toBe(5);
		expect(d.weapon).toBe(4);
		expect(d.gear).toBe(3);
		expect(d.skills.map((skill) => skill.level)).toEqual([5, 10, 10, 10]);
		expect(d.equipments.map((equipment) => equipment.tier)).toEqual([3, 3, 3]);
	});

	it('upgradeStudentEquipments raises only targets', () => {
		const d = freshStudent();
		upgradeStudentEquipments(d, game, student);
		expect(d.equipments.map((equipment) => equipment.tier)).toEqual([0, 0, 0]);
		expect(d.equipments.map((equipment) => equipment.tierTarget)).toEqual([3, 3, 3]);
	});
});

describe('normalize + serialize round-trip', () => {
	it('fills defaults for a partial deck with missing fields', () => {
		const partialJson = {
			options: { showSurplusItems: true, currentRank: 99999 },
			students: [
				{
					id: 10000,
					level: 40,
					star: 4,
					weapon: 2,
					elephCost: 3,
					elephRemain: 7,
					skills: [{ studentId: 10000, index: 0, level: 3 }],
					equipments: [{ studentId: 10000, index: 0, tier: 1 }]
				},
				{ id: 10000 + ALT_OFFSET, level: 20, star: 5, weapon: 1 }
			],
			stocks: { 4001: '12', 4002: -3, 4003: 4.7 },
			squads: [
				{
					icon: '',
					name: '',
					terrain: 'Space',
					students: [10000, 10000 + ALT_OFFSET, 424242],
					tab: 5
				}
			],
			selectedSquadId: 9
		};
		const deck = normalizeDeck(partialJson, game, 'Squad');
		// options catch + clamp
		expect(deck.options.showSurplusItems).toBe(true);
		expect(deck.options.showRequiredItems).toBe(false);
		expect(deck.options.useUniversalBlueprints).toBe(false);
		expect(deck.options.currentRank).toBe(15000);
		// students merged onto defaults for every game student + alt kept
		expect(Object.keys(deck.students).length).toBe(3);
		const merged = deck.students[10000]!;
		expect(merged.level).toBe(40);
		expect(merged.star).toBe(4);
		expect(merged.weapon).toBe(2);
		expect(merged.starTarget).toBe(4);
		expect(merged.skills[0]?.level).toBe(3);
		expect(merged.skills[1]?.level).toBe(1);
		expect(merged.equipments[0]?.tier).toBe(1);
		expect(merged.equipments[1]?.tier).toBe(0);
		const alt = deck.students[10000 + ALT_OFFSET]!;
		expect(alt.star).toBe(5);
		expect(alt.weapon).toBe(1);
		// stocks normalized
		expect(deck.stocks[4001]).toBe(12);
		expect(deck.stocks[4002]).toBe(0);
		expect(deck.stocks[4003]).toBe(4);
		// squads cleaned
		const squad = deck.squads[0]!;
		expect(squad.name).toBe('Squad #1');
		expect(squad.terrain).toBe('Street');
		expect(squad.students).toEqual([10000, 10000 + ALT_OFFSET]);
		expect(squad.tab).toBe(5);
		expect(deck.selectedSquadId).toBe(0);

		const roundTripped = JSON.parse(JSON.stringify(serializeDeck(deck)));
		expect(roundTripped.options.currentRank).toBe(15000);
		expect(roundTripped.options.useUniversalBlueprints).toBe(false);
		expect(roundTripped.students.find((s: { id: number }) => s.id === 10000)).toMatchObject({
			level: 40,
			star: 4,
			weapon: 2,
			elephCost: 3,
			elephRemain: 7
		});
		expect(roundTripped.stocks).toEqual({ '4001': 12, '4002': 0, '4003': 4 });
		expect(roundTripped.squads[0]).toMatchObject({ terrain: 'Street', tab: 5 });
		// normalize(serialize(x)) is stable
		const again = normalizeDeck(roundTripped, game, 'Squad');
		expect(serializeDeck(again)).toEqual(JSON.parse(JSON.stringify(roundTripped)));
	});

	it('useUniversalBlueprints defaults false and survives the serialize round-trip', () => {
		const deck = normalizeDeck({}, game, 'Squad');
		expect(deck.options.useUniversalBlueprints).toBe(false); // legacy saves without the key
		deck.options.useUniversalBlueprints = true;
		const roundTripped = JSON.parse(JSON.stringify(serializeDeck(deck)));
		expect(roundTripped.options.useUniversalBlueprints).toBe(true);
		const again = normalizeDeck(roundTripped, game, 'Squad');
		expect(again.options.useUniversalBlueprints).toBe(true);
	});

	it('empty deck gets one default squad', () => {
		const deck = normalizeDeck({}, game, 'Squad');
		expect(deck.squads).toEqual([
			{
				icon: '',
				name: 'Squad #1',
				terrain: 'Street',
				students: [],
				pinned: false,
				bounded: false,
				folded: false,
				tab: 0
			}
		]);
	});
});

describe('import/export strings', () => {
	it('export → import round-trips through lz-string base64', () => {
		const deck = freshDeck();
		deck.stocks[4001] = 5;
		deck.options.showElephs = true;
		const text = exportDeckString(deck);
		expect(typeof text).toBe('string');
		const imported = importDeckString(text) as ReturnType<typeof serializeDeck>;
		expect(imported.options.showElephs).toBe(true);
		expect(imported.stocks['4001']).toBe(5);
	});

	it('import rejects junk', () => {
		expect(() => importDeckString('')).toThrow();
		expect(() => importDeckString('not-a-deck-string!!')).toThrow();
	});
});
