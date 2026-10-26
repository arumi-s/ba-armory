/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { assets, immutable } from '$app/manifest';

/**
 * BA Armory service worker.
 * - precaches the app shell + build outputs (via $app/manifest)
 * - CacheFirst for schaledb.com images (no expiry)
 * - cache-first with revalidation for schaledb.com data: fresh cache → cache,
 *   otherwise network (5s timeout) → cache + LRU trim; network failure falls
 *   back to an expired entry (maxAge 3d, maxSize 10, timeout 5s)
 * - network-first navigation with offline fallback to the app shell
 */

const sw = self as unknown as ServiceWorkerGlobalScope;

const PRECACHE = 'armory-precache-v1';
const IMAGE_CACHE = 'schale-images';
const DATA_CACHE = 'schale-data';

const DATA_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;
const DATA_MAX_ENTRIES = 10;
const DATA_TIMEOUT_MS = 5000;

const precacheUrls = [
	...assets.map((asset) => asset.path),
	...immutable.map((entry) => entry.path)
];

sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(PRECACHE)
			.then((cache) => cache.addAll(precacheUrls))
			.then(() => sw.skipWaiting())
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const keys = await caches.keys();
			await Promise.all(
				keys
					.filter((key) => key !== PRECACHE && key !== IMAGE_CACHE && key !== DATA_CACHE)
					.map((key) => caches.delete(key))
			);
			// Drop precache entries from older deployments (hashed filenames change per build).
			const allowed = new Set(precacheUrls.map((url) => new URL(url, sw.location.origin).pathname));
			const precache = await caches.open(PRECACHE);
			const stale = (await precache.keys()).filter(
				(request) => !allowed.has(new URL(request.url).pathname)
			);
			await Promise.all(stale.map((request) => precache.delete(request)));
			await sw.clients.claim();
		})()
	);
});

async function cacheFirst(request: Request, cacheName: string): Promise<Response> {
	const cache = await caches.open(cacheName);
	const cached = await cache.match(request);
	if (cached) return cached;
	const response = await fetch(request);
	if (response.ok || response.type === 'opaque') {
		cache.put(request, response.clone());
	}
	return response;
}

/** Network fetch that rejects after `timeoutMs` without leaving an unhandled rejection. */
function fetchWithTimeout(request: Request, timeoutMs: number): Promise<Response> {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error('timeout')), timeoutMs);
		fetch(request).then(
			(response) => {
				clearTimeout(timer);
				resolve(response);
			},
			(error) => {
				clearTimeout(timer);
				reject(error);
			}
		);
	});
}

/** Best-effort LRU trim: CacheStorage keys keep insertion order in mainstream browsers. */
async function trimCache(cache: Cache, maxEntries: number): Promise<void> {
	const keys = await cache.keys();
	if (keys.length > maxEntries) {
		await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)));
	}
}

/**
 * schaledb data documents. Entry age comes from the response `Date` header;
 * when it is missing the entry is treated as fresh (never expires).
 */
async function dataCacheFirst(request: Request): Promise<Response> {
	const cache = await caches.open(DATA_CACHE);
	const cached = await cache.match(request);
	const cachedAt = cached ? Date.parse(cached.headers.get('date') ?? '') : NaN;
	const fresh = !!cached && Number.isFinite(cachedAt) && Date.now() - cachedAt < DATA_MAX_AGE_MS;
	if (cached && fresh) return cached;
	try {
		const response = await fetchWithTimeout(request, DATA_TIMEOUT_MS);
		if (response.ok || response.type === 'opaque') {
			await cache.put(request, response.clone());
			await trimCache(cache, DATA_MAX_ENTRIES);
		}
		return response;
	} catch {
		// Network failed or timed out: an expired entry beats no data at all.
		if (cached) return cached;
		throw new Error('offline and no cached data');
	}
}

sw.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;

	const url = new URL(request.url);

	if (url.origin === 'https://schaledb.com') {
		if (url.pathname.startsWith('/images/')) {
			event.respondWith(cacheFirst(request, IMAGE_CACHE));
		} else if (url.pathname.startsWith('/data/')) {
			event.respondWith(dataCacheFirst(request));
		}
		return;
	}

	if (url.origin !== sw.location.origin) return;

	if (request.mode === 'navigate') {
		event.respondWith(
			fetch(request).catch(() =>
				caches.match('/').then((response) => response ?? new Response('Offline', { status: 503 }))
			)
		);
		return;
	}

	if (precacheUrls.includes(url.pathname)) {
		event.respondWith(cacheFirst(request, PRECACHE));
	}
});
