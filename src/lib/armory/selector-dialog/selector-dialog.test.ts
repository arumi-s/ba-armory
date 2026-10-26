import { describe, expect, test } from 'vitest';
import { AppState } from '#lib/app/app.svelte.js';
import type { RegionId } from '#lib/config';
import { normalizeDeck } from '#lib/deck/normalize';
import { ConfigSchema, StudentsSchema } from '#lib/data/schemas';
import { buildRaw, studentRaw } from '#lib/data/test-fixtures';
import { SelectorState } from './selector-dialog.svelte.js';

/* Two students: 10000 released everywhere, 10099 future-only on region 1+.
   10000: Explosion/LightArmor/Main, Street 4 / Outdoor 2 / Indoor 0. */
function raw() {
	return buildRaw({
		config: ConfigSchema.parse({
			Regions: [{ Name: 'Jp', StudentMaxLevel: 90, WeaponMaxLevel: 60 }],
			CommonFavorItemTags: ['BC']
		}),
		students: Object.values(
			StudentsSchema.parse({
				a: studentRaw(10000),
				b: studentRaw(10099, { IsReleased: [false, true, false] })
			})
		)
	});
}

function createApp(region: RegionId = 0): AppState {
	const app = new AppState();
	app.raw = raw();
	app.region = region;
	app.deck = normalizeDeck({}, app.game!, 'Squad');
	return app;
}

function createSelector(app: AppState): SelectorState {
	return SelectorState.create({ app });
}

describe('SelectorState filter chain', () => {
	test('shows released students; hides future ones unless opted in', () => {
		const app = createApp();
		const selector = createSelector(app);
		expect(selector.missingStudents).toEqual([10000]);

		app.deck!.options.showFutureStudents = true;
		expect(selector.missingStudents).toEqual([10000, 10099]);
	});

	test('region participates in release filtering', () => {
		const app = createApp(1);
		expect(createSelector(app).missingStudents).toEqual([10000, 10099]);
	});

	test('hides students already in the squad (base or alt id) unless duplicates allowed', () => {
		const app = createApp();
		const selector = createSelector(app);
		app.deck!.squads[0]!.students.push(10000);
		expect(selector.missingStudents).toEqual([]);

		app.deck!.squads[0]!.students = []; // alt entry also counts as "in squad"
		app.deck!.squads[0]!.students.push(10000 + 1_000_000);
		expect(selector.missingStudents).toEqual([]);

		app.deck!.options.showDuplicatedStudents = true;
		expect(selector.missingStudents).toEqual([10000]);
	});

	test('type filters are exclusive when non-empty', () => {
		const app = createApp();
		const selector = createSelector(app);
		app.deck!.options.filterBulletType = ['Pierce'];
		expect(selector.missingStudents).toEqual([]);
		app.deck!.options.filterBulletType = ['Explosion'];
		expect(selector.missingStudents).toEqual([10000]);

		app.deck!.options.filterSquadType = ['Support'];
		expect(selector.missingStudents).toEqual([]);
		app.deck!.options.filterSquadType = ['Main'];
		expect(selector.missingStudents).toEqual([10000]);
	});

	test('terrain filter keeps only students with adaptation > 2', () => {
		const app = createApp();
		const selector = createSelector(app);
		// fixture adaptations: Street 4, Outdoor 2, Indoor 0
		app.deck!.options.filterTerrain = ['Street'];
		expect(selector.missingStudents).toEqual([10000]);
		app.deck!.options.filterTerrain = ['Indoor'];
		expect(selector.missingStudents).toEqual([]);
		app.deck!.options.filterTerrain = ['Street', 'Indoor'];
		expect(selector.missingStudents).toEqual([10000]); // some() semantics
	});

	test('addStudent routes through mutate honoring assist and duplicate options', () => {
		const app = createApp();
		const selector = createSelector(app);
		selector.addStudent(10000);
		expect(app.deck!.squads[0]!.students).toEqual([10000]);

		selector.addStudent(10000); // duplicate blocked
		expect(app.deck!.squads[0]!.students).toEqual([10000]);

		app.deck!.options.isAssistStudents = true;
		selector.addStudent(10000); // assist mode adds the alt id
		expect(app.deck!.squads[0]!.students).toEqual([10000, 10000 + 1_000_000]);

		app.deck!.options.showDuplicatedStudents = true;
		app.deck!.options.isAssistStudents = false;
		selector.addStudent(10000);
		expect(app.deck!.squads[0]!.students.filter((id) => id === 10000)).toHaveLength(2);
	});
});
