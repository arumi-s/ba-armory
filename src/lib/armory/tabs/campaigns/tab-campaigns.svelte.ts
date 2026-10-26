import type { AppState } from '#lib/app/app.svelte.ts';
import { recommendStages } from '#lib/deck/compute';

export interface CampaignsTabOpts {
	app: AppState;
}

/** Campaigns tab: recommended stages for the current squad (Hard toggle via deck options). */
export class CampaignsTabState {
	static create(opts: CampaignsTabOpts): CampaignsTabState {
		return new CampaignsTabState(opts);
	}

	readonly opts: CampaignsTabOpts;

	constructor(opts: CampaignsTabOpts) {
		this.opts = opts;
	}

	get app() {
		return this.opts.app;
	}

	readonly stages = $derived.by(() => {
		if (!this.app.game || !this.app.deck) return [];
		return recommendStages(
			this.app.squadRequired,
			this.app.deck.stocks,
			this.app.game,
			this.app.deck.options.showCampaignHard
		);
	});
}
