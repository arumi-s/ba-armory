import { getLocale, localizeUrl, setLocale } from '#lib/paraglide/runtime.js';
import { m } from '#lib/paraglide/messages.js';
import { Context } from 'runed';
import { LANGUAGE_CODES, SAVE_API, type LangId, type RegionId } from '#lib/config';
import { DataLoadError, fetchRawGameData } from '#lib/data/load';
import { buildGameData, type GameDataType, type RawGameDataType } from '#lib/data/indexes';
import { ALT_OFFSET } from '#lib/data/enums';
import {
	applyUniversalBlueprints,
	squadRequired as computeSquadRequired,
	studentRequiredItems
} from '#lib/deck/compute';
import { setDirtyNotifier } from '#lib/deck/mutate';
import { normalizeDeck } from '#lib/deck/normalize';
import {
	exportDeckString,
	loadDeckFromLocalStorage,
	loadDeckRemote,
	loadRegion,
	saveDeckLocal,
	saveRegion,
	serializeDeck,
	saveDeckRemote
} from '#lib/deck/persist';
import type { DeckState } from '#lib/deck/types';

export type AppPhase = 'loading' | 'ready' | 'error';

/** Typed context key (runed) — descriptive error if a consumer renders without a provider. */
export const AppStateContext = new Context<AppState>('AppState');

/** Maps a BCP-47-ish navigator language to our short locale, or null. */
function mapNavigatorLanguage(code: string): LangId | null {
	const lower = code.toLowerCase();
	if (['cn', 'en', 'jp', 'tw'].includes(lower)) return lower as LangId;
	switch (lower.split('-')[0]) {
		case 'ja':
			return 'jp';
		case 'zh':
			return lower.startsWith('zh-cn') ? 'cn' : 'tw';
		case 'en':
			return 'en';
		default:
			return null;
	}
}

function updateHtmlLang(language: LangId): void {
	document.documentElement.lang = LANGUAGE_CODES[language];
}

export class AppState {
	phase = $state<AppPhase>('loading');
	error = $state<string | null>(null);
	language = $state<LangId>('en');
	region = $state<RegionId>(0);
	/** Parsed language-dependent documents; replaced wholesale on language switch. */
	raw = $state<RawGameDataType | null>(null);
	deck = $state<DeckState | null>(null);
	/** Set by mutations, cleared by save/load. */
	dirty = $state(false);
	/** Cloud share link after a successful remote save. */
	savedLink = $state('');

	/** Immutable derived index — rebuilt in-memory whenever raw or region change. */
	readonly game = $derived<GameDataType | null>(
		this.raw ? buildGameData(this.raw, this.region) : null
	);

	constructor() {
		setDirtyNotifier(() => this.markDirty());
	}

	markDirty(): void {
		this.dirty = true;
	}

	readonly selectedSquad = $derived(this.deck?.squads[this.deck.selectedSquadId]);

	/** Aggregated requirements of the selected squad (alt & duplicate ids skipped).
	 *  With the universal-blueprints option on, deficits are substituted per
	 *  category before downstream consumers see them. */
	readonly squadRequired = $derived.by(() => {
		if (!this.deck || !this.game || !this.selectedSquad) return new Map<number, number>();
		const raw = computeSquadRequired(this.selectedSquad, this.deck, this.game);
		return this.deck.options.useUniversalBlueprints
			? applyUniversalBlueprints(raw, this.deck.stocks, this.game)
			: raw;
	});

	/** Per-student requirements for the selected squad (alt entries included). */
	readonly studentRequired = $derived.by(() => {
		const result = new Map<number, Map<number, number>>();
		if (!this.deck || !this.game || !this.selectedSquad) return result;
		for (const studentId of this.selectedSquad.students) {
			if (result.has(studentId)) continue;
			const entry = this.deck.students[studentId];
			if (entry == null) continue;
			result.set(studentId, studentRequiredItems(entry, this.game, this.deck.stocks));
		}
		return result;
	});

	/** Eleph ids of the selected squad (base ids only, deduplicated). */
	readonly squadElephIds = $derived.by(() => {
		if (!this.selectedSquad) return [];
		return this.selectedSquad.students.filter(
			(id, index, all) => id <= ALT_OFFSET && all.indexOf(id) === index
		);
	});

	/* ---------------------------------------------------------------- */
	/* Boot                                                             */
	/* ---------------------------------------------------------------- */

	async init(): Promise<void> {
		this.language = getLocale() as LangId;

		if (location.pathname === '/') {
			const saved = localStorage.getItem('language');
			const preferred =
				saved != null && ['cn', 'en', 'jp', 'tw'].includes(saved)
					? (saved as LangId)
					: (mapNavigatorLanguage(navigator.language) ?? 'en');
			if (preferred !== 'en') {
				const url = localizeUrl(location.href, { locale: preferred });
				history.replaceState(null, '', url instanceof URL ? url.href : url);
				this.language = preferred;
			}
		}

		this.region = (loadRegion() ?? 0) as RegionId;
		updateHtmlLang(this.language);

		try {
			await this.loadRaw(this.language);
		} catch (error) {
			this.phase = 'error';
			this.error = error instanceof DataLoadError ? error.message : String(error);
			return;
		}

		await this.loadDeckFromStorageOrUrl();
		this.phase = 'ready';
	}

	private async loadRaw(language: LangId): Promise<void> {
		this.raw = await fetchRawGameData(language);
	}

	private async loadDeckFromStorageOrUrl(): Promise<void> {
		if (!this.game) return;
		const deckId = location.pathname.split('/').pop() ?? '';
		let json: unknown = null;
		if (deckId.length === 8) {
			try {
				json = await loadDeckRemote(deckId);
			} catch {
				json = null;
			}
		}
		if (json == null) {
			try {
				json = loadDeckFromLocalStorage();
			} catch {
				json = {};
			}
		}
		this.deck = normalizeDeck(json, this.game, m.squad_name());
		this.dirty = false;
	}

	/** Re-normalize an imported deck without a page reload. */
	applyImportedDeck(json: unknown): void {
		if (!this.game) return;
		this.deck = normalizeDeck(json, this.game, m.squad_name());
		this.dirty = false;
	}

	/* ---------------------------------------------------------------- */
	/* Switching                                                        */
	/* ---------------------------------------------------------------- */

	/** Hot language switch: no reload, deck untouched, data re-fetched. */
	async switchLanguage(language: LangId): Promise<void> {
		if (language === this.language) return;
		setLocale(language, { reload: false });
		localStorage.setItem('language', language);
		const url = localizeUrl(location.href, { locale: language });
		history.replaceState(null, '', url instanceof URL ? url.href : url);
		this.language = language;
		updateHtmlLang(language);
		this.phase = 'loading';
		try {
			await this.loadRaw(language);
		} catch (error) {
			this.phase = 'error';
			this.error = error instanceof DataLoadError ? error.message : String(error);
			return;
		}
		this.phase = 'ready';
	}

	/**
	 * Region switch: pure state flip — the derived index rebuilds in-memory and the
	 * deck is re-normalized so out-of-range values clamp to the new caps (option A,
	 * matching boot behavior; irreversible). No reload, no network, and unsaved
	 * (non-out-of-range) edits survive.
	 */
	switchRegion(region: RegionId): void {
		if (region === this.region || !this.deck) return;
		saveRegion(region);
		this.region = region;
		this.deck = normalizeDeck(serializeDeck(this.deck), this.game!, m.squad_name());
	}

	/* ---------------------------------------------------------------- */
	/* Saving                                                           */
	/* ---------------------------------------------------------------- */

	save(): void {
		if (!this.deck) return;
		saveDeckLocal(this.deck);
		this.dirty = false;
	}

	exportString(): string {
		if (!this.deck) return '';
		return exportDeckString(this.deck);
	}

	async saveRemote(): Promise<string> {
		if (!this.deck) throw new Error('no deck');
		const id = await saveDeckRemote(this.deck);
		this.savedLink = `${location.origin}/${id}`;
		return this.savedLink;
	}

	get saveApiBase(): string {
		return SAVE_API;
	}
}
