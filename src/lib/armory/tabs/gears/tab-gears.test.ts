import { describe, expect, test } from 'vitest';
import { AppState } from '#lib/app/app.svelte.js';
import { normalizeDeck } from '#lib/deck/normalize';
import { buildFixtureRaw, equipmentRaw, itemRaw, studentRaw } from '#lib/deck/testing';
import { GearsTabState } from './tab-gears.svelte.js';

/* Favor items are never part of student requirements (need 0 → always
   surplus), which is exactly what the gears surplus switches act on. */
function createApp(): AppState {
	const app = new AppState();
	app.raw = buildFixtureRaw({
		students: [studentRaw(10000)],
		items: [
			itemRaw(5001, 'Favor'),
			itemRaw(5002, 'Favor'),
			itemRaw(4001, 'Material', { Icon: 'icon_material_4001' }),
			itemRaw(3000, 'SecretStone'),
			itemRaw(6001, 'Coin')
		],
		equipments: [equipmentRaw(1, 'Hat', 1)]
	});
	app.deck = normalizeDeck({}, app.game!, 'Squad');
	app.deck.squads[0]!.students.push(10000);
	return app;
}

describe('GearsTabState (Favor-only)', () => {
	test('defaults: surplus switches off hide every Favor item', () => {
		const tab = GearsTabState.create({ app: createApp() });
		expect(tab.visibleIds).toEqual([]);
	});

	test('showRequiredItems alone keeps need<=0 surplus hidden', () => {
		const app = createApp();
		const tab = GearsTabState.create({ app });
		app.deck!.options.showRequiredItems = true;
		expect(tab.visibleIds).toEqual([]);
	});

	test('showSurplusItems shows Favor items only — no eleph switch in gears', () => {
		const app = createApp();
		const tab = GearsTabState.create({ app });
		app.deck!.options.showSurplusItems = true;
		expect(tab.visibleIds).toEqual([5002, 5001]); // basic: id descending

		app.deck!.options.showElephs = true; // must not leak SecretStone here
		expect(tab.visibleIds).toEqual([5002, 5001]);
		expect(tab.visibleIds).not.toContain(3000); // SecretStone
		expect(tab.visibleIds).not.toContain(4001); // Material
		expect(tab.visibleIds).not.toContain(2000001); // equipment
	});

	test('sorting: stock option uses deck stocks', () => {
		const app = createApp();
		const tab = GearsTabState.create({ app });
		app.deck!.options.showSurplusItems = true;
		app.deck!.stocks[5001] = 3;

		expect(tab.sort.sortOptionId).toBe('basic');
		tab.sort.select('stock');
		expect(tab.visibleIds).toEqual([5001, 5002]);

		tab.sort.toggleDirection();
		expect(tab.visibleIds).toEqual([5002, 5001]);
	});
});
