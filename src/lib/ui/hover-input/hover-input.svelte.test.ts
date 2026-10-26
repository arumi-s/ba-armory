import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import HoverInputFixture from './hover-input.fixture.svelte';

function pressKey(key: string, target: EventTarget = document.body): KeyboardEvent {
	const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
	target.dispatchEvent(event);
	return event;
}

function pointerOver(element: Element): void {
	const rect = element.getBoundingClientRect();
	window.dispatchEvent(
		new PointerEvent('pointermove', {
			clientX: rect.x + rect.width / 2,
			clientY: rect.y + rect.height / 2
		})
	);
}

async function setup() {
	const plain: number[] = [];
	const delegated: number[] = [];
	const nested: number[] = [];
	const screen = await render(HoverInputFixture, {
		props: { plain, delegated, nested }
	});
	return { screen, plain, delegated, nested };
}

describe('HoverInput', () => {
	test('digits and m deliver to the hovered default-branch target', async () => {
		const { screen, plain } = await setup();
		pointerOver(screen.getByTestId('hover-plain').element());
		pressKey('2');
		pressKey('0');
		pressKey('m');
		expect(plain).toEqual([2, 0, Number.MAX_SAFE_INTEGER]);
	});

	test('delivery resolves the closest registered ancestor and prevents default', async () => {
		const { screen, plain } = await setup();
		pointerOver(screen.getByTestId('hover-plain-inner').element());
		const event = pressKey('3');
		expect(plain).toEqual([3]);
		expect(event.defaultPrevented).toBe(true);
	});

	test('child-delegated target receives numbers; snippet onNumber aliases the prop', async () => {
		const { screen, delegated } = await setup();
		pointerOver(screen.getByTestId('hover-delegated').element());
		pressKey('5');
		expect(delegated).toEqual([5]);
		await screen.getByTestId('hover-delegated').click();
		expect(delegated).toEqual([5, 9]);
	});

	test('keys over non-targets deliver nothing and are not prevented', async () => {
		const { screen, plain, delegated, nested } = await setup();
		pointerOver(screen.getByTestId('hover-toggle').element());
		const event = pressKey('4');
		expect(plain).toEqual([]);
		expect(delegated).toEqual([]);
		expect(nested).toEqual([]);
		expect(event.defaultPrevented).toBe(false);
	});

	test('keydown on editable targets is ignored', async () => {
		const { screen, plain } = await setup();
		pointerOver(screen.getByTestId('hover-plain').element());
		const event = pressKey('2', screen.getByTestId('hover-editable').element());
		expect(plain).toEqual([]);
		expect(event.defaultPrevented).toBe(false);
	});

	test('provider instances track their own targets independently', async () => {
		const { screen, plain, nested } = await setup();
		pointerOver(screen.getByTestId('hover-nested').element());
		pressKey('7');
		expect(nested).toEqual([7]);
		expect(plain).toEqual([]);
	});

	test('unmounting a trigger unregisters it', async () => {
		const { screen, plain } = await setup();
		pointerOver(screen.getByTestId('hover-removable').element());
		pressKey('1');
		expect(plain).toEqual([1]);
		await screen.getByTestId('hover-toggle').click();
		// pointer stays where the removed trigger used to be
		pressKey('1');
		expect(plain).toEqual([1]);
	});

	test('unmounting the provider stops the window listeners', async () => {
		const { screen, plain } = await setup();
		pointerOver(screen.getByTestId('hover-plain').element());
		pressKey('2');
		expect(plain).toEqual([2]);
		await screen.unmount();
		pressKey('2');
		expect(plain).toEqual([2]);
	});
});
