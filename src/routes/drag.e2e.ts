import type { Page } from '@playwright/test';
import { expect, test } from './e2e-fixtures';

async function addStudents(page: Page, count: number) {
	const addButton = page.getByRole('button', { name: /student/i });
	const dialogButton = page.locator('[role="dialog"] button:has(img)').first();
	for (let i = 0; i < count; i++) {
		await addButton.click();
		await dialogButton.waitFor({ timeout: 15000 });
		await dialogButton.click();
		await page.keyboard.press('Escape');
		await page.waitForTimeout(250);
	}
}

async function cardNames(page: Page): Promise<string[]> {
	return page
		.locator('main .w-60')
		.evaluateAll((cards: Element[]) =>
			cards.map((card) => card.querySelector('a')?.textContent ?? '')
		);
}

/**
 * Drag the card at index `from` onto slot `to`. The final pointer position
 * lands inside the target slot's card (sortablejs' swap check requires the
 * pointer to be within the target's rect — `swapThreshold: 1`), biased toward
 * the travel direction like a real drop. Note: the handle is the avatar at the
 * card's left edge, so positions are computed from the card rect, not the
 * handle rect.
 */
async function dragCard(page: Page, from: number, to: number, settleMs = 500) {
	const cards = page.locator('main .w-60');
	const source = cards.nth(from).locator('img.cursor-grab');
	const sb = (await source.boundingBox())!;
	const tb = (await cards.nth(to).boundingBox())!;
	const dir = to > from ? 1 : -1;
	const endX = tb.x + tb.width / 2 + dir * 30;
	await page.mouse.move(sb.x + 25, sb.y + 25);
	await page.mouse.down();
	const steps = 20;
	for (let i = 1; i <= steps; i++) {
		await page.mouse.move(sb.x + 25 + (endX - (sb.x + 25)) * (i / steps), sb.y + 25);
		await page.waitForTimeout(15);
	}
	await page.waitForTimeout(150);
	await page.mouse.up();
	await page.waitForTimeout(settleMs);
}

async function save(page: Page) {
	await page.locator('header button').nth(2).click();
	await page.waitForTimeout(300);
}

test('drag & drop reorders squad students', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('button', { name: /student/i })).toBeVisible({ timeout: 30000 });

	// add two students through the selector (already-added students are filtered out)
	await addStudents(page, 2);

	const cards = page.locator('main .w-60');
	await expect(cards.nth(1)).toBeVisible();
	const firstName = await cards.nth(0).locator('a').first().textContent();
	const secondName = await cards.nth(1).locator('a').first().textContent();
	expect(firstName).not.toBe(secondName);

	await dragCard(page, 1, 0);

	// the dragged student should now be first
	await expect(page.locator('main .w-60').nth(0).locator('a').first()).toHaveText(secondName!);

	// order persists through save + reload
	await save(page);
	await page.reload();
	await expect(page.locator('main .w-60').first()).toBeVisible({ timeout: 30000 });
	await expect(page.locator('main .w-60').nth(0).locator('a').first()).toHaveText(secondName!);
});

test('drag & drop lands correctly for end-of-list moves and chains', async ({ page }) => {
	await page.setViewportSize({ width: 1600, height: 900 });
	await page.goto('/');
	await expect(page.getByRole('button', { name: /student/i })).toBeVisible({ timeout: 30000 });

	await addStudents(page, 4);
	await expect(page.locator('main .w-60')).toHaveCount(4);
	const [a, b, c, d] = await cardNames(page);
	expect(new Set([a, b, c, d]).size).toBe(4);

	// last → first
	await dragCard(page, 3, 0);
	expect(await cardNames(page)).toEqual([d, a, b, c]);

	// first → last (undoes the move above)
	await dragCard(page, 0, 3);
	expect(await cardNames(page)).toEqual([a, b, c, d]);

	// middle → middle
	await dragCard(page, 1, 2);
	expect(await cardNames(page)).toEqual([a, c, b, d]);

	// last → middle
	await dragCard(page, 3, 1);
	expect(await cardNames(page)).toEqual([a, d, c, b]);

	// first → middle
	await dragCard(page, 0, 2);
	expect(await cardNames(page)).toEqual([d, c, a, b]);

	// the displayed order matches the persisted state after save + reload
	await save(page);
	await page.reload();
	await expect(page.locator('main .w-60').first()).toBeVisible({ timeout: 30000 });
	expect(await cardNames(page)).toEqual([d, c, a, b]);
});

test('drag & drop survives rapid consecutive drags', async ({ page }) => {
	await page.setViewportSize({ width: 1600, height: 900 });
	await page.goto('/');
	await expect(page.getByRole('button', { name: /student/i })).toBeVisible({ timeout: 30000 });

	await addStudents(page, 4);
	const [a, b, c, d] = await cardNames(page);

	// back-to-back drags with only minimal settle time between them
	await dragCard(page, 0, 3, 200); // a → end
	expect(await cardNames(page)).toEqual([b, c, d, a]);
	await dragCard(page, 3, 0, 200); // a → front
	expect(await cardNames(page)).toEqual([a, b, c, d]);
	await dragCard(page, 2, 0, 200); // c → front
	expect(await cardNames(page)).toEqual([c, a, b, d]);

	await save(page);
	await page.reload();
	await expect(page.locator('main .w-60').first()).toBeVisible({ timeout: 30000 });
	expect(await cardNames(page)).toEqual([c, a, b, d]);
});
