import { CDN_BASE } from '#lib/config.ts';
import { test as base, expect } from '@playwright/test';

/**
 * Opening the student selector fires ~230 image requests against
 * `schaledb.com/images/**`. When a page reload cancels that many in-flight
 * cross-origin requests, the Chromium renderer starts failing every subsequent
 * cross-origin fetch with `net::ERR_FAILED` — including the SchaleDB game-data
 * loads the app performs on boot — so every save-and-reload assertion ends up
 * on the network error screen instead of the restored deck.
 *
 * Aborting the icon CDN requests up front keeps the e2e runs against the real
 * SchaleDB data endpoints while staying below whatever trips the renderer bug.
 * The `<img>` elements still exist (selectors such as `button:has(img)` keep
 * working); they simply never load a bitmap.
 */
export const test = base.extend({
	context: async ({ context }, use) => {
		await context.route(`${CDN_BASE}/images/**`, (route) => route.abort());
		await use(context);
	}
});

export { expect };
