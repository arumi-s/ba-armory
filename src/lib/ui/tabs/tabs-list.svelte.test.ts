import { describe, expect, test, vi } from 'vitest';
import type { Locator } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import '../../../routes/layout.css';
import TabsFixture from './tabs.fixture.svelte';

const LONG_VALUES = Array.from({ length: 12 }, (_, i) => `Tab ${i + 1}`);

function keydown(key: string, target: EventTarget) {
	target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

/** Element handle narrowed to HTMLElement (locators may also match SVG elements). */
function html(locator: Locator): HTMLElement {
	return locator.element() as HTMLElement;
}

/** The scroll viewport is the tablist's parent node inside the tab bar wrapper. */
function viewportOf(tablist: HTMLElement): HTMLElement {
	expect(tablist.parentElement?.className).toContain('overflow-x-auto');
	return tablist.parentElement!;
}

describe('Tabs', () => {
	test('activates a tab on click and reports through onValueChange', async () => {
		const changes: string[] = [];
		const screen = await render(TabsFixture, {
			props: { values: ['a', 'b', 'c'], value: 'a', onValueChange: (v) => changes.push(v) }
		});
		const tabs = screen.getByRole('tab').all();
		expect(tabs[0].element().getAttribute('aria-selected')).toBe('true');

		await tabs[1].click();
		expect(changes).toEqual(['b']);
		expect(tabs[1].element().getAttribute('aria-selected')).toBe('true');
		expect(tabs[0].element().getAttribute('aria-selected')).toBe('false');
	});

	test('arrow keys move focus and activate the next tab (roving tabindex)', async () => {
		const screen = await render(TabsFixture, { props: { values: ['a', 'b', 'c'], value: 'a' } });
		const first = screen.getByRole('tab').nth(0).element();
		const second = screen.getByRole('tab').nth(1).element();

		expect(first.tabIndex).toBe(0);
		expect(second.tabIndex).toBe(-1);

		first.focus();
		keydown('ArrowRight', first);
		expect(document.activeElement).toBe(second);
		await vi.waitFor(() => {
			expect(second.getAttribute('aria-selected')).toBe('true');
		});
		expect(first.getAttribute('aria-selected')).toBe('false');

		keydown('ArrowLeft', second);
		expect(document.activeElement).toBe(first);
		await vi.waitFor(() => {
			expect(first.getAttribute('aria-selected')).toBe('true');
		});
	});

	test('shows paginators on overflow and paginates by 80% of the viewport', async () => {
		const screen = await render(TabsFixture, {
			props: { values: LONG_VALUES, value: 'Tab 1', width: 'w-80' }
		});
		const back = screen.getByRole('button', { name: 'Scroll back' });
		const forward = screen.getByRole('button', { name: 'Scroll forward' });
		const viewport = viewportOf(html(screen.getByRole('tablist')));

		// Paginators mount once the resize observer reports the overflow.
		await vi.waitFor(() => {
			expect(html(forward).hasAttribute('disabled')).toBe(false);
		});
		expect(html(back).hasAttribute('disabled')).toBe(true);

		await forward.click();
		await vi.waitFor(() => {
			expect(viewport.scrollLeft).toBeGreaterThan(0);
		});
		expect(html(back).hasAttribute('disabled')).toBe(false);
	});

	test('hides paginators when every tab fits', async () => {
		const screen = await render(TabsFixture, { props: { values: ['a', 'b'], value: 'a' } });
		await expect.element(screen.getByRole('tablist')).toBeInTheDocument();
		expect(screen.container.querySelector('button[aria-label="Scroll back"]')).toBeNull();
		expect(screen.container.querySelector('button[aria-label="Scroll forward"]')).toBeNull();
	});
});
