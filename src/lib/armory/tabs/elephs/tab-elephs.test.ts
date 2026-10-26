import { describe, expect, test } from 'vitest';
import { AppState } from '#lib/app/app.svelte.js';
import { normalizeDeck } from '#lib/deck/normalize';
import { setStarTarget } from '#lib/deck/mutate';
import { buildFixtureRaw, studentRaw } from '#lib/deck/testing';
import { ElephsTabState } from './tab-elephs.svelte.js';

/* Squad order is [10001, 10000] to prove sorting reorders the eleph list. */
function createApp(): AppState {
	const app = new AppState();
	app.raw = buildFixtureRaw({ students: [studentRaw(10000), studentRaw(10001)] });
	app.deck = normalizeDeck({}, app.game!, 'Squad');
	app.deck.squads[0]!.students.push(10001, 10000);
	return app;
}

describe('ElephsTabState', () => {
	test('defaults: option total, direction 1; ties break by id descending', () => {
		const tab = ElephsTabState.create({ app: createApp() });
		expect(tab.sort.sortOptionId).toBe('total');
		expect(tab.sort.sortDirection).toBe(1);
		expect(tab.visibleIds).toEqual([10001, 10000]); // equal totals → -id key
	});

	test('total sort orders by eligma need: 220→900 ahead of 100→300', () => {
		const app = createApp();
		const tab = ElephsTabState.create({ app });
		setStarTarget(app.deck!.students[10000]!, 5); // 330-110 = 220 → 900 eligma
		setStarTarget(app.deck!.students[10001]!, 4); // 210-110 = 100 → 300 eligma

		expect(tab.visibleIds).toEqual([10000, 10001]); // total descending

		tab.sort.select('basic');
		expect(tab.visibleIds).toEqual([10001, 10000]); // id descending

		tab.sort.select('total');
		tab.sort.toggleDirection();
		expect(tab.visibleIds).toEqual([10001, 10000]); // total ascending
	});

	test('no matching sort option falls back to squadElephIds order', () => {
		const tab = ElephsTabState.create({ app: createApp() });
		tab.sort.select('missing');
		expect(tab.sort.sortOption).toBeNull();
		expect(tab.visibleIds).toEqual([10001, 10000]); // squad order preserved
	});

	test('empty squad yields an empty list', () => {
		const app = createApp();
		app.deck!.squads[0]!.students = [];
		const tab = ElephsTabState.create({ app });
		expect(tab.visibleIds).toEqual([]);
	});
});
