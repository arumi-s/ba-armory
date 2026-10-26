import { m } from '#lib/paraglide/messages.js';
import type { AppState } from '#lib/app/app.svelte.js';
import { getStuff } from '#lib/data/indexes';
import { itemSortOptions, sortObjects } from '#lib/deck/sort';
import type { ItemSortOption } from '#lib/deck/sort';
import { TabSortState } from '../tab-sort.svelte.js';

export interface ItemsTabOpts {
	app: AppState;
}

/** Items tab: sort menu state + visible stockables (surplus / eleph filtering). */
export class ItemsTabState {
	static create(opts: ItemsTabOpts): ItemsTabState {
		return new ItemsTabState(opts);
	}

	readonly opts: ItemsTabOpts;
	readonly sort: TabSortState<ItemSortOption>;

	constructor(opts: ItemsTabOpts) {
		this.opts = opts;
		this.sort = TabSortState.create({
			defaultOptionId: 'basic',
			options: () =>
				this.app.game
					? itemSortOptions(this.app.game, () => this.app.squadRequired, this.app.deck!.stocks, {
							basic: m.item_sort_basic(),
							deficit: m.item_sort_deficit(),
							required: m.item_sort_required(),
							stock: m.item_sort_stock()
						})
					: []
		});
	}

	get app() {
		return this.opts.app;
	}

	readonly visibleIds = $derived.by(() => {
		if (!this.app.game || !this.app.deck) return [];
		const { showSurplusItems, showRequiredItems, showElephs } = this.app.deck.options;
		const required = this.app.squadRequired;
		const stocks = this.app.deck.stocks;
		const ids = this.app.game.stockables.filter((id) => {
			const stuff = getStuff(this.app.game!, id);
			if (!stuff) return false;
			if (stuff.category === 'Favor') return false;
			if (!showElephs && stuff.category === 'SecretStone') return false;
			const need = required.get(id) ?? 0;
			const surplus = need <= (stocks[id] ?? 0);
			if (!showSurplusItems && !showRequiredItems && surplus) return false;
			if (!showSurplusItems && surplus && need <= 0) return false;
			return true;
		});
		const sortOption = this.sort.sortOption;
		if (sortOption) {
			const toStuff = (id: number) => getStuff(this.app.game!, id) ?? { id, category: '' };
			ids.sort((a, b) => sortObjects(toStuff(a), toStuff(b), sortOption, this.sort.sortDirection));
		}
		return ids;
	});
}
