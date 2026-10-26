# Blue Archive Armory

[Website](https://ba.arumi.top)

## About this tool

Blue Archive Armory helps "Blue Archive" players manage their students and resources: squad management, farming material calculators, recommended farming stages, Eligma (Eleph) conversion, arena opponent ranking projection, and gift preference matching — with local/cloud saves and import/export sharing.

This tool is for non-commercial use only.

## Tech stack

- [SvelteKit 3](https://svelte.dev/docs/kit) + Svelte 5 (runes mode, no legacy syntax)
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn-svelte](https://www.shadcn-svelte.com) (vega style) + lucide icons
- [zod v4](https://zod.dev) validation for SchaleDB data and saves (plain objects + functional mutations, no entity classes)
- [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) i18n (`cn`/`en`/`jp`/`tw`, URL strategy)
- [sortablejs](https://sortablejs.github.io/Sortable/) for drag-and-drop student card sorting
- Supabase (server-side save API, server only)
- Vercel adapter (hkg1 region) + SvelteKit service worker (PWA)

Game data is loaded at runtime from the [SchaleDB](https://schaledb.com) CDN; app messages are bundled at compile time.

## Development

```sh
pnpm install
pnpm dev         # http://localhost:5173
```

Common scripts:

```sh
pnpm check       # svelte-check
pnpm lint        # prettier + eslint
pnpm format
pnpm test:unit   # vitest (node + browser-playwright projects)
pnpm test:e2e    # playwright e2e (builds then previews)
pnpm test        # unit + e2e
pnpm build       # production build
```

> The unit test `src/lib/data/real.test.ts` parses the full real SchaleDB JSON:
> on first run it downloads 6 documents into `.fixtures/schaledb/` in the repo (gitignored) and caches them;
> subsequent runs read from the cache. The tests are always skipped on CI (when the `CI` env var is set) and also skip locally when no cache exists and the network is unavailable.

## Environment variables

Cloud saves (`/api/save`) require Supabase (table `save`: `id` is an 8-character random id, `data text`). Copy `.env.example` to `.env` and fill in the values.

Variables are declared in `src/env.ts` (`defineEnvVars`) and read on the server via `$app/env/private`.

## Deployment (Vercel)

- Build output: `@sveltejs/adapter-vercel`.
- Configure the two environment variables above in your Vercel project settings.
- `/api/save` (POST) and `/api/save/[id]` (GET) are serverless routes backing 8-character base64url share links (`/{id}`, `/{lang}/{id}`).

## Roadmap

- [ ] User manual
- [ ] Show gacha drop
- [ ] Auto reduce stock
- [ ] More arena tools?
- [x] Sortable student selector
- [x] Export deck as a short link
- [x] Eleph store cost calculator
- [x] Cache game data

## Acknowledgements

This tool is heavily inspired by the famous [蘭德索爾圖書館](https://pcredivewiki.tw/Armory), a tool for PCR players.

All game data are acquired from [SchaleDB](https://github.com/lonqie/SchaleDB).

All game artwork, data and assets used in this tool are property and copyright of NEXON Games and Yostar.
