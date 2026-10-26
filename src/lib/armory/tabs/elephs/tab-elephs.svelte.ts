import { m } from '#lib/paraglide/messages.js';
import type { AppState } from '#lib/app/app.svelte.js';
import { elephSortOptions, sortObjects } from '#lib/deck/sort';
import type { ElephSortOption } from '#lib/deck/sort';
import type { DeckStudentState } from '#lib/deck/types';
import { TabSortState } from '../tab-sort.svelte.js';

export interface ElephsTabOpts {
	app: AppState;
}

/** Elephs tab: squad elephs ordered by the selected sort option (default 'total'). */
export class ElephsTabState {
	static create(opts: ElephsTabOpts): ElephsTabState {
		return new ElephsTabState(opts);
	}

	readonly opts: ElephsTabOpts;
	readonly sort: TabSortState<ElephSortOption>;

	constructor(opts: ElephsTabOpts) {
		this.opts = opts;
		this.sort = TabSortState.create({
			defaultOptionId: 'total',
			options: () =>
				this.app.game && this.app.deck
					? elephSortOptions(
							this.app.game,
							(d: DeckStudentState) =>
								this.app.studentRequired.get(d.id) ?? new Map<number, number>(),
							() => this.app.squadRequired,
							this.app.deck.stocks,
							{
								basic: m.eleph_sort_basic(),
								total: m.eleph_sort_total(),
								deficit: m.eleph_sort_deficit(),
								required: m.eleph_sort_required(),
								stock: m.eleph_sort_stock()
							}
						)
					: []
		});
	}

	get app() {
		return this.opts.app;
	}

	readonly visibleIds = $derived.by(() => {
		if (!this.app.deck || !this.sort.sortOption) return this.app.squadElephIds;
		const sortOption = this.sort.sortOption;
		const sortDirection = this.sort.sortDirection;
		const ids = [...this.app.squadElephIds];
		ids.sort((a, b) => {
			const entryA = this.app.deck!.students[a] as DeckStudentState;
			const entryB = this.app.deck!.students[b] as DeckStudentState;
			if (!entryA || !entryB) return 0;
			return sortObjects<DeckStudentState>(entryA, entryB, sortOption, sortDirection);
		});
		return ids;
	});
}
