import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TierIconFixture from './tier-icon.fixture.svelte';

const baseProps = {
	iconUrl: 'icon.webp',
	label: 'Hat',
	value: 1,
	targetValue: 1,
	max: 3,
	onSet: () => {}
};

describe('TierIcon', () => {
	test('left click increments; ctrl toggles min/max; right click decrements', async () => {
		const sets: number[] = [];
		const screen = await render(TierIconFixture, {
			props: { ...baseProps, onSet: (v: number) => sets.push(v) }
		});
		const button = screen.getByRole('button');
		await button.click();
		expect(sets).toEqual([2]);
		await button.click({ modifiers: ['Control'] });
		expect(sets).toEqual([2, 3]);
		button
			.element()
			.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
		expect(sets).toEqual([2, 3, 0]);
	});

	test('hover number keys deliver through the provider context', async () => {
		const sets: number[] = [];
		const screen = await render(TierIconFixture, {
			props: { ...baseProps, value: 1, onSet: (v: number) => sets.push(v) }
		});
		const button = screen.getByRole('button').element();

		const rect = button.getBoundingClientRect();
		window.dispatchEvent(
			new PointerEvent('pointermove', { clientX: rect.x + 2, clientY: rect.y + 2 })
		);
		document.body.dispatchEvent(
			new KeyboardEvent('keydown', { key: '2', bubbles: true, cancelable: true })
		);
		document.body.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'm', bubbles: true, cancelable: true })
		);
		expect(sets).toEqual([2, Number.MAX_SAFE_INTEGER]);
	});

	test('shows the tier badge only above min', async () => {
		const first = await render(TierIconFixture, { props: { ...baseProps, value: 0 } });
		const button = first.getByRole('button').element();
		expect(button.textContent).not.toContain('T0');
		await first.unmount();

		const second = await render(TierIconFixture, { props: { ...baseProps, value: 2 } });
		await expect.element(second.getByRole('button')).toHaveTextContent('T2');
	});

	test('target ring classes reflect isTarget/reached', async () => {
		const first = await render(TierIconFixture, {
			props: { ...baseProps, value: 1, targetValue: 3, isTarget: true }
		});
		await expect.element(first.getByRole('button')).toHaveClass('ring-red-400');
		await first.unmount();

		const second = await render(TierIconFixture, {
			props: { ...baseProps, value: 1, targetValue: 1, isTarget: true }
		});
		await expect.element(second.getByRole('button')).toHaveClass('ring-yellow-400');
	});

	test('transparency smoke: class fuses, restProps land, managed attrs win, events chain', async () => {
		const clicks: number[] = [];
		const sets: number[] = [];
		const screen = await render(TierIconFixture, {
			props: {
				...baseProps,
				class: 'extra-class',
				'data-foo': 'bar',
				'data-tier': 9,
				onclick: () => clicks.push(1),
				onSet: (v: number) => sets.push(v)
			}
		});
		const button = screen.getByRole('button').element();
		expect(button.classList.contains('extra-class')).toBe(true);
		expect(button.getAttribute('data-foo')).toBe('bar');
		// managed contract (data-tier from value) wins over the consumer's data-tier
		expect(button.getAttribute('data-tier')).toBe('1');
		await screen.getByRole('button').click();
		expect(clicks).toEqual([1]); // consumer handler ran…
		expect(sets).toEqual([2]); // …and the component's own cycle ran too
	});
});
