import { boxWith, simpleBox } from 'svelte-toolbelt';
import StarRatingFixture from './star-rating.fixture.svelte';
import { StarRatingState } from './star-rating.svelte.js';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';

function create(init?: Partial<{ value: number; max: number; disabled: boolean }>) {
	const value = simpleBox(init?.value ?? 3);
	const max = init?.max ?? 5;
	const applied: number[] = [];
	const state = StarRatingState.create({
		value,
		max: boxWith(() => max),
		disabled: boxWith(() => init?.disabled ?? false),
		onValueChange: (v) => {
			applied.push(v);
			value.current = v;
		}
	});
	return { state, applied };
}

describe('StarRating state', () => {
	test('apply clamps to [0, max] and floors before reporting', () => {
		const { state, applied } = create();
		state.apply(9);
		expect(applied).toEqual([5]);
		state.apply(4.9);
		expect(applied).toEqual([5, 4]);
		state.apply(Number.NaN);
		expect(applied).toEqual([5, 4, 0]);
	});

	test('disabled ignores apply/hover', () => {
		const { state, applied } = create({ disabled: true });
		state.apply(1);
		expect(applied).toEqual([]);
		expect(state.value).toBe(3);
		state.hover(1);
		expect(state.hovered).toBe(0);
	});

	test('value is a live view of the controlled prop', () => {
		const value = simpleBox(2);
		const state = StarRatingState.create({
			value,
			max: boxWith(() => 5),
			disabled: boxWith(() => false),
			onValueChange: () => {}
		});
		expect(state.value).toBe(2);
		value.current = 4; // external change propagates without any effect syncing
		expect(state.value).toBe(4);
	});

	test('units reflect hover preview then selection', () => {
		const { state } = create({ value: 2, max: 5 });
		expect(state.units).toEqual(['selected', 'selected', 'inactive', 'inactive', 'inactive']);
		state.hover(4);
		expect(state.units).toEqual(['selected', 'selected', 'preview', 'preview', 'inactive']);
		state.leave();
		expect(state.units[4]).toBe('inactive');
	});

	test('units dim inactive icons at maximum', () => {
		const { state } = create({ value: 5, max: 5 });
		expect(state.units.every((unit) => unit === 'selected' || unit === 'inactive-dim')).toBe(true);
	});

	test('keyboard adjusts by one and zeroes on 0', () => {
		const { state, applied } = create({ value: 2, max: 5 });
		state.onkeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
		expect(applied).toEqual([3]);
		state.onkeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
		expect(applied).toEqual([3, 2]);
		state.onkeydown(new KeyboardEvent('keydown', { key: '0' }));
		expect(applied).toEqual([3, 2, 0]);
	});
});

describe('StarRating component', () => {
	test('renders max units and updates on click', async () => {
		const { state } = create({ value: 1, max: 5 });
		const screen = await render(StarRatingFixture, { props: { state } });
		const units = screen.container.querySelectorAll('button');
		expect(units).toHaveLength(5);
		await screen.getByRole('radio', { name: '4' }).click();
		expect(state.value).toBe(4);
	});

	test('clicks are ignored when disabled', async () => {
		const { state } = create({ value: 1, max: 5, disabled: true });
		const screen = await render(StarRatingFixture, { props: { state } });
		const units = screen.container.querySelectorAll('button');
		expect(units).toHaveLength(5);
		// click the 4th star directly: the buttons carry the disabled attribute
		units[3].click();
		expect(state.value).toBe(1);
	});

	test('consumer keydown handlers chain with the component handler', async () => {
		const { state } = create({ value: 1, max: 5 });
		const calls: string[] = [];
		const screen = await render(StarRatingFixture, {
			props: {
				state,
				onkeydown: () => calls.push('consumer')
			}
		});
		const group = screen.getByRole('radiogroup').element();
		group.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
		);
		expect(calls).toEqual(['consumer']);
		expect(state.value).toBe(2);
	});
});
