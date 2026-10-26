export interface TabSortOpts<T extends { id: string; label: string }> {
	defaultOptionId: string;
	/** Provided by each tab: reads app + m.* to build options (keys included, for sortObjects). */
	options: () => readonly T[];
}

/**
 * Structural (duck-typed) view of `TabSortState<T>` for shared renderers —
 * sidesteps class generic invariance when handing the state to SortMenu.
 */
export interface TabSortView {
	options: readonly { id: string; label: string }[];
	sortLabel: string;
	sortDirection: -1 | 1;
	select(id: string): void;
	toggleDirection(): void;
}

/** Shared sort-menu state, composed into the items / gears / elephs tabs. */
export class TabSortState<T extends { id: string; label: string }> {
	static create<T extends { id: string; label: string }>(opts: TabSortOpts<T>): TabSortState<T> {
		return new TabSortState(opts);
	}

	readonly opts: TabSortOpts<T>;
	sortOptionId = $state('');
	sortDirection = $state<-1 | 1>(1);

	constructor(opts: TabSortOpts<T>) {
		this.opts = opts;
		this.sortOptionId = opts.defaultOptionId;
	}

	readonly options = $derived.by(() => this.opts.options());
	readonly sortOption = $derived(
		this.options.find((option) => option.id === this.sortOptionId) ?? null
	);
	readonly sortLabel = $derived(this.sortOption?.label ?? '');

	select(id: string): void {
		this.sortOptionId = id;
	}

	toggleDirection(): void {
		this.sortDirection = this.sortDirection === -1 ? 1 : -1;
	}
}
