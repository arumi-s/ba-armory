import { describe, expect, it } from 'vitest';

import { ELIGMA_ID, EQUIPMENT_OFFSET } from '#lib/data/enums';
import {
	studentRequiredItems,
	arenaForecast,
	favorTiers,
	recommendStages,
	squadRequired
} from './compute';
import type { DeckState, DeckStudentState } from './types';
import {
	buildFixtureGame,
	equipmentRaw,
	itemRaw,
	stageRaw,
	studentRaw,
	type FixtureOverrides
} from './testing';

function deckStudent(overrides: Partial<DeckStudentState> = {}): DeckStudentState {
	return {
		id: 10000,
		level: 1,
		levelTarget: 1,
		star: 3,
		starTarget: 3,
		weapon: 0,
		weaponTarget: 0,
		gear: 0,
		gearTarget: 0,
		elephCost: 1,
		elephRemain: 20,
		isTarget: false,
		skills: [0, 1, 2, 3].map((index) => ({
			studentId: 10000,
			index,
			level: 1,
			levelTarget: 1
		})),
		equipments: [0, 1, 2].map((index) => ({
			studentId: 10000,
			index,
			tier: 0,
			tierTarget: 0
		})),
		...overrides
	};
}

describe('studentRequiredItems', () => {
	it('aggregates Ex skill materials across levels', () => {
		const game = buildFixtureGame();
		const d = deckStudent({
			skills: [
				{ studentId: 10000, index: 0, level: 1, levelTarget: 3 },
				{ studentId: 10000, index: 1, level: 1, levelTarget: 1 },
				{ studentId: 10000, index: 2, level: 1, levelTarget: 1 },
				{ studentId: 10000, index: 3, level: 1, levelTarget: 1 }
			]
		});
		const required = studentRequiredItems(d, game, {});
		// Ex 1→2: 3030×12 + 150×17; 2→3: 3031×13 + 3030×18
		expect(required.get(3030)).toBe(12 + 18);
		expect(required.get(150)).toBe(17);
		expect(required.get(3031)).toBe(13);
	});

	it('uses pseudo id 9999 for the 9→10 skill report', () => {
		const game = buildFixtureGame();
		const d = deckStudent({
			skills: [
				{ studentId: 10000, index: 0, level: 1, levelTarget: 1 },
				{ studentId: 10000, index: 1, level: 9, levelTarget: 10 },
				{ studentId: 10000, index: 2, level: 1, levelTarget: 1 },
				{ studentId: 10000, index: 3, level: 1, levelTarget: 1 }
			]
		});
		const required = studentRequiredItems(d, game, {});
		expect(required.get(9999)).toBe(1);
		expect(required.get(4002)).toBeUndefined();
	});

	it('sums normal skill materials per level', () => {
		const game = buildFixtureGame();
		const d = deckStudent({
			skills: [
				{ studentId: 10000, index: 0, level: 1, levelTarget: 1 },
				{ studentId: 10000, index: 1, level: 1, levelTarget: 3 },
				{ studentId: 10000, index: 2, level: 1, levelTarget: 1 },
				{ studentId: 10000, index: 3, level: 1, levelTarget: 1 }
			]
		});
		const required = studentRequiredItems(d, game, {});
		// Public 1→2: 4001×1; 2→3: 4001×2 + 4002×3
		expect(required.get(4001)).toBe(3);
		expect(required.get(4002)).toBe(3);
	});

	it('adds recipe ingredients for crafted equipment tiers', () => {
		const game = buildFixtureGame({
			equipments: [equipmentRaw(1, 'Hat', 1), equipmentRaw(2, 'Hat', 2, { Recipe: [[1, 15]] })]
		});
		const d = deckStudent({
			equipments: [
				{ studentId: 10000, index: 0, tier: 1, tierTarget: 2 },
				{ studentId: 10000, index: 1, tier: 0, tierTarget: 0 },
				{ studentId: 10000, index: 2, tier: 0, tierTarget: 0 }
			]
		});
		const required = studentRequiredItems(d, game, {});
		expect(required.get(1 + EQUIPMENT_OFFSET)).toBe(15);
	});

	it('adds +1 equipment itself when it has no recipe', () => {
		const game = buildFixtureGame({
			equipments: [equipmentRaw(1, 'Hat', 1)]
		});
		const d = deckStudent({
			equipments: [
				{ studentId: 10000, index: 0, tier: 0, tierTarget: 1 },
				{ studentId: 10000, index: 1, tier: 0, tierTarget: 0 },
				{ studentId: 10000, index: 2, tier: 0, tierTarget: 0 }
			]
		});
		const required = studentRequiredItems(d, game, {});
		expect(required.get(1 + EQUIPMENT_OFFSET)).toBe(1);
	});

	it('accumulates own eleph for star and UE upgrades', () => {
		const game = buildFixtureGame();
		const d = deckStudent({
			star: 3,
			starTarget: 5,
			weapon: 0,
			weaponTarget: 2,
			elephCost: 1,
			elephRemain: 20
		});
		const required = studentRequiredItems(d, game, {});
		// star 3→5: 330-110=220; UE 0→2 (unlocked at 5★): 120-0=120 → 340 total
		expect(required.get(10000)).toBe(340);
	});

	it('ignores UE when star target below 5 (from = 0 but star != 5)', () => {
		const game = buildFixtureGame();
		const d = deckStudent({
			star: 3,
			starTarget: 3,
			weaponTarget: 3,
			// from = star===5 ? weapon : 0 → 0; to = 3 → 300
			weapon: 0
		});
		const required = studentRequiredItems(d, game, {});
		// from=0 < to=3 still counts (fromWeapon = star===5 ? weapon : 0)
		expect(required.get(10000)).toBe(300);
	});

	it('counts gear tier-up materials from max(gear, 1) to gearTarget', () => {
		const game = buildFixtureGame();
		const d = deckStudent({ gear: 0, gearTarget: 3 });
		const required = studentRequiredItems(d, game, {});
		// from = max(0,1)=1 → levels 1,2 → [5017×1+150×2] + [5018×4+100×5]
		expect(required.get(5017)).toBe(1);
		expect(required.get(150)).toBe(2);
		expect(required.get(5018)).toBe(4);
		expect(required.get(100)).toBe(5);
	});

	it('converts missing own-eleph into Eligma with the price ladder', () => {
		const game = buildFixtureGame();
		const d = deckStudent({
			star: 3,
			starTarget: 5, // needs 220 own eleph
			elephCost: 1,
			elephRemain: 10
		});
		const required = studentRequiredItems(d, game, { [10000]: 200 });
		// missing 20: 10 × cost1 + 10 × cost2 = 30
		expect(required.get(ELIGMA_ID)).toBe(30);
	});

	it('uses Infinity remain at cost bracket 5', () => {
		const game = buildFixtureGame();
		const d = deckStudent({
			star: 3,
			starTarget: 5, // 220
			elephCost: 5,
			elephRemain: 0
		});
		const required = studentRequiredItems(d, game, {});
		expect(required.get(ELIGMA_ID)).toBe(220 * 5);
	});

	it('skips Eligma when stock covers the requirement', () => {
		const game = buildFixtureGame();
		const d = deckStudent({ star: 3, starTarget: 5 });
		const required = studentRequiredItems(d, game, { [10000]: 500 });
		expect(required.has(ELIGMA_ID)).toBe(false);
	});
});

describe('squadRequired', () => {
	const game = buildFixtureGame({
		students: [studentRaw(10000), studentRaw(10001)]
	});

	function makeDeck(students: DeckStudentState[]): DeckState {
		return {
			options: {} as DeckState['options'],
			students: Object.fromEntries(students.map((s) => [s.id, s])),
			stocks: {},
			squads: [],
			selectedSquadId: 0
		};
	}

	it('sums students and skips alts plus duplicate ids', () => {
		const a = deckStudent({ star: 3, starTarget: 5 }); // 330-110 = 220
		const deck = makeDeck([a, deckStudent({ id: 10001, star: 3, starTarget: 4 })]); // 210-110 = 100
		const squad = {
			students: [10000, 10000 + 1_000_000, 10001, 10000],
			icon: '',
			name: '',
			terrain: 'Street',
			pinned: false,
			bounded: false,
			folded: false,
			tab: 0
		};
		const required = squadRequired(squad, deck, game);
		expect(required.get(10000)).toBe(220);
		expect(required.get(10001)).toBe(100);
		// ladders: 220 → 900; 100 → 20×(1+2+3+4)+20×5 = 300 → 1200
		expect(required.get(ELIGMA_ID)).toBe(1200);
	});
});

describe('recommendStages', () => {
	function game(overrides: FixtureOverrides = {}) {
		return buildFixtureGame({
			items: [
				itemRaw(4001, 'Material', { Icon: 'item_icon_material_4001' }),
				itemRaw(9999, 'Material', { Icon: 'item_icon_material_9999' })
			],
			...overrides
		});
	}

	it('recommends AP-entry campaigns by deficit-per-AP weight', () => {
		const g = game({
			stages: [
				stageRaw(1, { EntryCost: [[5, 10]], Rewards: [{ Type: 'Item', Id: 4001, Chance: 1 }] }),
				stageRaw(2, { EntryCost: [[5, 20]], Rewards: [{ Type: 'Item', Id: 4001, Chance: 1 }] })
			]
		});
		const required = new Map([[4001, 30]]);
		const result = recommendStages(required, {}, g, false);
		expect(result.map((r) => r.id)).toEqual([1, 2]);
		expect(result[0]?.amount).toBe(30);
		expect(result[1]?.amount).toBe(30);
	});

	it('excludes hard stages unless enabled, halves non-eleph weight on hard', () => {
		const stages = [
			stageRaw(1, { EntryCost: [[5, 10]], Rewards: [{ Type: 'Item', Id: 4001, Chance: 1 }] }),
			stageRaw(2, {
				Difficulty: 1,
				EntryCost: [[5, 10]],
				Rewards: [{ Type: 'Item', Id: 4001, Chance: 1 }]
			})
		];
		const g = game({ stages });
		const required = new Map([[4001, 30]]);
		expect(recommendStages(required, {}, g, false).map((r) => r.id)).toEqual([1]);
		const withHard = recommendStages(required, {}, g, true);
		// normal weight 30/10 = 3; hard weight 30*0.5/10 = 1.5 → normal first
		expect(withHard.map((r) => r.id)).toEqual([1, 2]);
	});

	it('drops non-AP entry cost campaigns and weights scale=0 drops for furniture/coins on hard', () => {
		const g = game({
			stages: [
				stageRaw(3, {
					EntryCost: [
						[5, 10],
						[22, 1]
					],
					Rewards: [{ Type: 'Item', Id: 4001, Chance: 1 }]
				}),
				stageRaw(4, {
					Difficulty: 1,
					EntryCost: [[5, 10]],
					Rewards: [
						{ Type: 'Currency', Id: 1, Chance: 1 },
						{ Type: 'Item', Id: 4001, Chance: 1 }
					]
				})
			]
		});
		const required = new Map([
			[4001, 10],
			[3_000_000, 10]
		]);
		// Stage 3 excluded (ticket entry); stage 4: currency → scale 0, item → 0.5
		const result = recommendStages(required, {}, g, true);
		expect(result.map((r) => r.id)).toEqual([4]);
		expect(result[0]?.amount).toBe(10);
	});

	it('subtracts stocks from weights and ceil()s runs per reward', () => {
		const g = game({
			stages: [
				stageRaw(1, { EntryCost: [[5, 10]], Rewards: [{ Type: 'Item', Id: 4001, Chance: 0.5 }] })
			]
		});
		const required = new Map([[4001, 10]]);
		const result = recommendStages(required, { [4001]: 1 }, g, false);
		// deficit 9, chance 0.5 → 18 runs
		expect(result[0]?.amount).toBe(18);
	});

	it('keeps only top 20', () => {
		const g = game({
			stages: Array.from({ length: 30 }, (_, i) =>
				stageRaw(i + 1, { EntryCost: [[5, 10]], Rewards: [{ Type: 'Item', Id: 4001, Chance: 1 }] })
			)
		});
		const required = new Map([[4001, 100]]);
		expect(recommendStages(required, {}, g, false).length).toBe(20);
	});
});

describe('arenaForecast', () => {
	it('iterates the 0.7 rule down to rank 1 and pads to a multiple of 5', () => {
		const result = arenaForecast(100);
		expect(result.length % 5).toBe(0);
		expect(result[0]?.rank).toBe(70); // max(min(70, 97), 1)
		// ranks strictly decreasing (ignoring pads)
		const ranks = result.filter((entry) => entry.rank > 0).map((entry) => entry.rank);
		for (let i = 1; i < ranks.length; i++) expect(ranks[i]).toBeLessThan(ranks[i - 1]);
		expect(ranks[ranks.length - 1]).toBe(1);
	});

	it('handles currentRank 1', () => {
		const result = arenaForecast(1);
		expect(result[0]?.rank).toBe(1);
		expect(result.every((entry) => entry.rank === 0 || entry.rank === 1)).toBe(true);
	});

	it('marks tierUp when gems per hour increase', () => {
		const result = arenaForecast(2);
		// rank 2 → next 1: reward 40 → 45 → tierUp
		expect(result[0]).toMatchObject({ rank: 1, reward: 45, tierUp: true });
	});
});

describe('favorTiers', () => {
	it('buckets students by matching tag count, capped at 3', () => {
		const game = buildFixtureGame({
			students: [
				studentRaw(10000, { FavorItemTags: ['K'], FavorItemUniqueTags: [] }),
				studentRaw(10001, { FavorItemTags: ['K', 'V'], FavorItemUniqueTags: [] }),
				studentRaw(10002, { FavorItemTags: ['K', 'V', 'W', 'X'], FavorItemUniqueTags: [] })
			],
			items: [itemRaw(5001, 'Favor', { ExpValue: 20, Tags: ['K', 'V', 'W'] })]
		});
		const item = game.items.get(5001)!;
		const result = favorTiers(item, [10000, 10001, 10002], game);
		expect(result.tiers).toHaveLength(4); // grade 3, grade 2, grade 1, baseline
		const grade2 = result.tiers.find((tier) => tier.studentIds.includes(10001));
		expect(grade2?.amount).toBe(60); // 20 × (2+1)
		const grade1 = result.tiers.find((tier) => tier.studentIds.includes(10000));
		expect(grade1?.amount).toBe(40);
		// 10002 matches K,V,W → 3 tags → top bucket 20×4=80
		const grade3 = result.tiers.find((tier) => tier.studentIds.includes(10002));
		expect(grade3?.amount).toBe(80);
		expect(result.tiers[result.tiers.length - 1]?.studentIds).toEqual([]); // baseline
		expect(result.unused).toBe(false);
	});

	it('skips buckets achievable via generic tags alone', () => {
		const game = buildFixtureGame({
			students: [studentRaw(10000, { FavorItemTags: ['BC'], FavorItemUniqueTags: [] })],
			items: [itemRaw(5001, 'Favor', { ExpValue: 20, Tags: ['BC'] })]
		});
		// item with 1 generic tag: genericTagCount = 1 → grade 1 skipped
		const result = favorTiers(game.items.get(5001)!, [10000], game);
		// only the baseline tier (amount 20×2=40) remains
		expect(result.tiers).toEqual([
			{ amount: 40, icon: expect.stringContaining('Cafe_Interaction_Gift_02'), studentIds: [] }
		]);
		expect(result.unused).toBe(true);
	});

	it('order: generic first, then rarity weight', () => {
		const game = buildFixtureGame({
			items: [
				itemRaw(5001, 'Favor', { Tags: ['BC'] }),
				itemRaw(5002, 'Favor', { Rarity: 'SSR', Tags: ['K'] })
			]
		});
		const n = favorTiers(game.items.get(5001)!, [], game);
		const ssr = favorTiers(game.items.get(5002)!, [], game);
		expect(n.isGeneric).toBe(true);
		expect(ssr.isGeneric).toBe(false);
		expect(ssr.order).toBeLessThan(n.order);
	});
});

describe('squadText', () => {
	it('aligns columns with CJK-aware widths and trims line ends', async () => {
		const { squadText } = await import('./compute');
		const text = squadText(
			[
				{
					name: 'アル',
					isAlt: false,
					star: 5,
					level: 90,
					skillLevels: [5, 10, 10, 10],
					skillLevelsMax: [5, 10, 10, 10],
					equipmentTiers: [1, 2, 3],
					weapon: 2,
					gear: 0,
					starMax: 5
				},
				{
					name: 'Hoshino',
					isAlt: true,
					star: 3,
					level: 50,
					skillLevels: [1, 4, 1, 1],
					skillLevelsMax: [5, 10, 10, 10],
					equipmentTiers: [1, 1, 1],
					weapon: 0,
					gear: 1,
					starMax: 5
				}
			],
			{
				showStar: true,
				showLevel: true,
				showSkills: true,
				showEquipments: true,
				showWeapon: true,
				showGear: true
			},
			{ assist: 'Assist', weapon: 'UE', gear: 'GE' }
		);
		const lines = text.split('\n');
		expect(lines).toHaveLength(2);
		expect(lines[0]).toContain('M');
		expect(lines[0]).toContain('★5');
		expect(lines[0]).toContain('Lv.90');
		expect(lines[0]).toContain('UE2');
		expect(lines[0]).not.toContain('GE'); // gear 0 hidden
		expect(lines[1]).toContain('(Assist)');
		expect(lines[1]).toContain('GE1');
		expect(lines[1]).not.toContain('UE'); // star != 5
		// column alignment: star column starts at same visual column (CJK aware)
		const stringWidth = (await import('string-width')).default;
		const starCol = (line: string) => stringWidth(line.slice(0, line.indexOf('★')));
		expect(starCol(lines[0])).toBe(starCol(lines[1]));
		expect(lines.every((line) => line === line.trimEnd())).toBe(true);
	});
});
