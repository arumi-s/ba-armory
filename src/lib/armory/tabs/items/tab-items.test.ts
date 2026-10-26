import { describe, expect, test } from 'vitest';
import { AppState } from '#lib/app/app.svelte.js';
import { normalizeDeck } from '#lib/deck/normalize';
import { setSkillLevelTarget } from '#lib/deck/mutate';
import { buildFixtureRaw, equipmentRaw, itemRaw, studentRaw } from '#lib/deck/testing';
import { ItemsTabState } from './tab-items.svelte.js';

/* Stockables: Hat T1 equipment (id 2000001), materials 3030/4001/9999,
   SecretStone 3000, Favor 5001. Student 10000 needs 3030×12 (Ex skill
   target) and 4001×1 (normal skill target); stocks hold 4001×5 so 4001 is
   a surplus item with need > 0, everything else has need 0. */
function createApp(): AppState {
	const app = new AppState();
	app.raw = buildFixtureRaw({
		students: [studentRaw(10000)],
		items: [
			itemRaw(3030, 'Material', { Icon: 'icon_material_3030' }),
			itemRaw(4001, 'Material', { Icon: 'icon_material_4001' }),
			itemRaw(9999, 'Material', { Icon: 'icon_material_9999' }),
			itemRaw(3000, 'SecretStone'),
			itemRaw(5001, 'Favor'),
			itemRaw(6001, 'Coin')
		],
		equipments: [equipmentRaw(1, 'Hat', 1)]
	});
	app.deck = normalizeDeck({}, app.game!, 'Squad');
	app.deck.squads[0]!.students.push(10000);
	const d = app.deck.students[10000]!;
	setSkillLevelTarget(d, 0, 2, app.game!.students.get(10000)!); // Ex → 3030×12
	setSkillLevelTarget(d, 1, 2, app.game!.students.get(10000)!); // normal → 4001×1
	app.deck.stocks[4001] = 5;
	return app;
}

describe('ItemsTabState filter chain', () => {
	test('defaults: both surplus switches off hide every surplus item', () => {
		const tab = ItemsTabState.create({ app: createApp() });
		expect(tab.visibleIds).toEqual([3030]); // deficit material only
	});

	test('only showRequiredItems on: surplus with need>0 reappears, need<=0 stays hidden', () => {
		const app = createApp();
		const tab = ItemsTabState.create({ app });
		app.deck!.options.showRequiredItems = true;
		expect(tab.visibleIds).toEqual([4001, 3030]);
	});

	test('only showSurplusItems on: everything except Favor/hidden elephs is visible', () => {
		const app = createApp();
		const tab = ItemsTabState.create({ app });
		app.deck!.options.showSurplusItems = true;
		expect(tab.visibleIds).toEqual([2000001, 9999, 4001, 3030]);
	});

	test('showElephs gates SecretStone independently of the surplus switches', () => {
		const app = createApp();
		const tab = ItemsTabState.create({ app });

		app.deck!.options.showElephs = true; // still surplus → still hidden
		expect(tab.visibleIds).toEqual([3030]);

		app.deck!.options.showRequiredItems = true;
		// 3000 stays hidden: need 0 → surplus with need<=0, showSurplusItems still off
		expect(tab.visibleIds).toEqual([4001, 3030]);

		app.deck!.options.showSurplusItems = true; // now the eleph switch is the only gate
		expect(tab.visibleIds).toContain(3000);
	});

	test('all switches on: Favor is never visible', () => {
		const app = createApp();
		const tab = ItemsTabState.create({ app });
		app.deck!.options.showSurplusItems = true;
		app.deck!.options.showRequiredItems = true;
		app.deck!.options.showElephs = true;
		expect(tab.visibleIds).toEqual([2000001, 3000, 9999, 4001, 3030]);
		expect(tab.visibleIds).not.toContain(5001); // Favor always hidden
	});

	test('sorting: default basic, stock option, and direction flip', () => {
		const app = createApp();
		const tab = ItemsTabState.create({ app });
		app.deck!.options.showSurplusItems = true;
		app.deck!.options.showRequiredItems = true;
		app.deck!.options.showElephs = true;

		expect(tab.sort.sortOptionId).toBe('basic');
		expect(tab.sort.sortDirection).toBe(1);
		expect(tab.visibleIds).toEqual([2000001, 3000, 9999, 4001, 3030]);

		tab.sort.select('stock'); // 4001 has the only stock (5)
		expect(tab.visibleIds).toEqual([4001, 2000001, 9999, 3030, 3000]);

		tab.sort.toggleDirection();
		expect(tab.visibleIds).toEqual([3000, 3030, 9999, 2000001, 4001]);
	});
});
