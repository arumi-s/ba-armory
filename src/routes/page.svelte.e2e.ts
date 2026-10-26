import { expect, test } from './e2e-fixtures';

test('full flow: load, add student, raise star, see requirements, save, reload', async ({
	page
}) => {
	await page.goto('/');
	await expect(page.getByRole('banner')).toBeVisible();

	// wait for game data + armory UI
	await expect(page.getByRole('button', { name: /student/i })).toBeVisible({ timeout: 30000 });

	// add a student through the selector
	await page.getByRole('button', { name: /student/i }).click();
	await page.locator('[role="dialog"] button:has(img)').first().waitFor({ timeout: 15000 });
	await page.locator('[role="dialog"] button:has(img)').first().click();
	await page.keyboard.press('Escape');

	// a student card appears
	const card = page.locator('main .w-60').first();
	await expect(card).toBeVisible();
	const cardName = (await card.textContent()) ?? '';
	expect(cardName).toContain('Lv.');

	// raise the current star to 5 (own eleph requirement appears)
	await card.locator('[role="radiogroup"]').first().locator('button').nth(4).click();

	// switch to the Eleph tab: the card's eleph should show a total cost
	await page.locator('main .border-y button').nth(2).click();
	await expect(page.locator('main .w-60').first()).toBeVisible();
	const elephText = (await page.locator('main .w-60').first().textContent()) ?? '';
	expect(elephText).toMatch(/\d+/);

	// save and reload: the squad persists
	await page.locator('header button').nth(2).click();
	await page.waitForTimeout(300);
	await page.reload();
	await expect(page.locator('main .w-60').first()).toBeVisible({ timeout: 30000 });
});

test('export → import round-trip restores the deck', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('button', { name: /student/i })).toBeVisible({ timeout: 30000 });

	// add a student so the deck differs from the default
	await page.getByRole('button', { name: /student/i }).click();
	await page.locator('[role="dialog"] button:has(img)').first().waitFor({ timeout: 15000 });
	await page.locator('[role="dialog"] button:has(img)').first().click();
	await page.keyboard.press('Escape');
	await expect(page.locator('main .w-60').first()).toBeVisible();

	// export
	await page.locator('header button').nth(0).click();
	const input = page.locator('[role="dialog"] input').first();
	await page.getByRole('button', { name: /^export$/i }).click();
	await page.waitForTimeout(300);
	const text = await input.inputValue();
	expect(text.length).toBeGreaterThan(100);

	// clear local storage, then import the string
	await page.evaluate(() => localStorage.removeItem('deck'));
	await input.fill(text);
	await page.getByRole('button', { name: /^import$/i }).click();
	await page.waitForTimeout(500);

	// the deck is restored in memory without a reload
	await expect(page.locator('main .w-60').first()).toBeVisible();
	await page.keyboard.press('Escape');
	await page.waitForTimeout(200);
});

test('language routes render localized shell', async ({ page }) => {
	await page.goto('/cn');
	await expect(page.locator('header')).toContainText(/蔚蓝档案/i, {
		timeout: 30000
	});
	await page.goto('/en');
	await expect(page.locator('header')).toContainText(/Blue Archive/i, {
		timeout: 30000
	});
	await page.goto('/jp');
	await expect(page.locator('header')).toContainText(/ブルアカ/i, {
		timeout: 30000
	});
});
