import { describe, expect, test } from 'vitest';
import { boxWith } from 'svelte-toolbelt';
import { AppState } from '#lib/app/app.svelte.js';
import { normalizeDeck } from '#lib/deck/normalize';
import { setIsTarget, setStar, setWeapon } from '#lib/deck/mutate';
import { STAR_MAX, WEAPON_MAX } from '#lib/deck/types';
import { buildRaw } from '#lib/data/test-fixtures';
import { StudentCardState } from './student-card.svelte.js';

const STUDENT_ID = 10000;

function createApp(): AppState {
	const app = new AppState();
	app.raw = buildRaw();
	app.deck = normalizeDeck({}, app.game!, 'Squad');
	return app;
}

function createState(app: AppState, terrain?: string): StudentCardState {
	return StudentCardState.create({
		id: boxWith(() => STUDENT_ID),
		terrain: boxWith(() => terrain),
		folded: boxWith(() => false),
		app
	});
}

describe('StudentCardState ratings (controlled assembly)', () => {
	test('star rating is a live view of star/starTarget and follows isTarget instantly', () => {
		const app = createApp();
		const state = createState(app, 'Street');
		const d = app.deck!.students[STUDENT_ID]!;

		expect(d.star).toBe(3); // normalize seeds starGrade
		expect(state.starRating.value).toBe(3);

		setIsTarget(d, true);
		expect(state.starRating.value).toBe(d.starTarget);

		setStar(d, 5, state.student!);
		expect(state.starRating.value).toBe(d.starTarget); // still target view
		setIsTarget(d, false);
		expect(state.starRating.value).toBe(5); // flips back without a frame of staleness
	});

	test('weapon rating is disabled unless star is maxed', () => {
		const app = createApp();
		const state = createState(app);
		const d = app.deck!.students[STUDENT_ID]!;

		expect(state.weaponRating.disabled).toBe(true);
		setStar(d, STAR_MAX, state.student!);
		expect(state.weaponRating.disabled).toBe(false);
		setWeapon(d, WEAPON_MAX);
		expect(state.weaponRating.value).toBe(WEAPON_MAX);
	});

	test('writes route through mutations (target/current switch inside onValueChange)', () => {
		const app = createApp();
		const state = createState(app);
		const d = app.deck!.students[STUDENT_ID]!;

		setStar(d, STAR_MAX, state.student!);
		state.weaponRating.apply(2);
		expect(d.weapon).toBe(2);

		setIsTarget(d, true);
		state.weaponRating.apply(3);
		expect(d.weapon).toBe(2); // current untouched by target-mode write
		expect(d.weaponTarget).toBe(3);
	});
});

describe('StudentCardState derivations', () => {
	test('adaptation applies the UE bonus only at max weapon level', () => {
		const app = createApp();
		const state = createState(app, 'Street'); // fixture: Street 4, UE +1 Street
		const d = app.deck!.students[STUDENT_ID]!;

		expect(state.adaptation).toBe(4);
		setStar(d, STAR_MAX, state.student!);
		setWeapon(d, WEAPON_MAX);
		expect(state.adaptation).toBe(5);
		expect(createState(app).adaptation).toBe(null); // no terrain → null
	});

	test('skills join deck levels with static metadata; Ex caps at 5, others at 10', () => {
		const app = createApp();
		const state = createState(app);
		const d = app.deck!.students[STUDENT_ID]!;

		expect(state.skills.map((skill) => skill.key)).toEqual([
			'Ex',
			'Public',
			'Passive',
			'ExtraPassive'
		]);
		expect(state.skills.map((skill) => skill.max)).toEqual([5, 10, 10, 10]);
		expect(state.skills.every((skill) => skill.value === 1)).toBe(true);

		setIsTarget(d, true);
		expect(state.skills.every((skill) => skill.value === skill.targetValue)).toBe(true);
	});

	test('equipments resolve through equipmentsByCategory with display tier', () => {
		const app = createApp();
		const state = createState(app);

		// fixture student: Hat / Hairpin / Watch; only Hat released (max tier 2)
		expect(state.equipments.map((slot) => slot.category)).toEqual(['Hat', 'Hairpin', 'Watch']);
		expect(state.equipments[0]?.max).toBe(2);
		expect(state.equipments[1]?.max).toBe(0); // Hairpin unreleased
		expect(state.equipments[0]?.iconUrl).toContain('/images/equipment/icon/icon_Hat_1.webp');
		expect(state.equipments[0]?.value).toBe(0);
	});

	test('isUpgraded requires every equipment target at its tier max', () => {
		const app = createApp();
		const state = createState(app);
		const d = app.deck!.students[STUDENT_ID]!;

		expect(state.isUpgraded).toBe(false);
		d.equipments[0]!.tierTarget = 2; // the only released slot
		expect(state.isUpgraded).toBe(true);
		d.equipments[0]!.tierTarget = 1;
		expect(state.isUpgraded).toBe(false);
	});

	test('gear view resolves from static student data', () => {
		const app = createApp();
		const state = createState(app);
		const d = app.deck!.students[STUDENT_ID]!;

		expect(state.gear?.max).toBe(3); // TierUpMaterial.length + 1
		expect(state.gear?.value).toBe(0);
		d.gear = 2;
		expect(state.gear?.value).toBe(2);
	});
});

describe('StudentCardState input handling', () => {
	test('level input parses and routes to level/levelTarget', () => {
		const app = createApp();
		const state = createState(app);
		const d = app.deck!.students[STUDENT_ID]!;

		const input = { value: '42' } as HTMLInputElement;
		state.onLevelInput({ currentTarget: input } as unknown as Event);
		expect(d.level).toBe(42);

		setIsTarget(d, true);
		const targetInput = { value: '90' } as HTMLInputElement;
		state.onLevelInput({ currentTarget: targetInput } as unknown as Event);
		expect(d.levelTarget).toBe(90);
		expect(d.level).toBe(42);

		const nanInput = { value: '' } as HTMLInputElement;
		state.onLevelInput({ currentTarget: nanInput } as unknown as Event);
		// non-numeric input normalizes to 0, but target floors at current (§5.4)
		expect(d.levelTarget).toBe(42);
	});

	test('alt students derive isAlt from the id offset', async () => {
		const app = createApp();
		const state = StudentCardState.create({
			id: boxWith(() => STUDENT_ID + 1_000_000),
			terrain: boxWith(() => undefined),
			folded: boxWith(() => false),
			app
		});
		expect(state.isAlt).toBe(true);
		expect(state.student?.id).toBe(STUDENT_ID); // alt resolves to base student
	});
});
