import type { AppState } from '#lib/app/app.svelte.ts';
import { arenaForecast } from '#lib/deck/compute';
import { setCurrentRank } from '#lib/deck/mutate';

export interface ArenaTabOpts {
	app: AppState;
}

/** Arena tab: next-rank gem forecast; rank input parsing lives in setRank. */
export class ArenaTabState {
	static create(opts: ArenaTabOpts): ArenaTabState {
		return new ArenaTabState(opts);
	}

	readonly opts: ArenaTabOpts;

	constructor(opts: ArenaTabOpts) {
		this.opts = opts;
	}

	get app() {
		return this.opts.app;
	}

	readonly forecasts = $derived(
		this.app.deck ? arenaForecast(this.app.deck.options.currentRank) : []
	);

	/** NaN → 0, then the mutate layer clamps to CURRENT_RANK_MIN/MAX. */
	setRank(v: number): void {
		if (!this.app.deck) return;
		setCurrentRank(this.app.deck, Number.isFinite(v) ? v : 0);
	}
}
