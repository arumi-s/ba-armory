import { type ReadableBoxedValues } from 'svelte-toolbelt';
import type { AppState } from '#lib/app/app.svelte.ts';
import { getStuff } from '#lib/data/indexes';
import { setStock } from '#lib/deck/mutate';

/** Decode `&#x1F600;`-style hex entities schaledb leaves in item names. */
function decodeEntities(input: string): string {
	return input.replace(/&#x([0-9a-f]{1,4});/gi, (_, hex: string) =>
		String.fromCharCode(Number.parseInt(hex, 16))
	);
}

/**
 * Percentage with up to 3 fraction digits and no trailing zeros
 * (e.g. 0.06746 → "6.746%", 0.05 → "5%").
 */
export function formatRate(rate: number): string {
	return `${Number((rate * 100).toFixed(3))}%`;
}

export interface ItemIconOpts extends ReadableBoxedValues<{ id: number }> {
	app: AppState;
}

export class ItemIconState {
	static create(opts: ItemIconOpts): ItemIconState {
		return new ItemIconState(opts);
	}

	readonly opts: ItemIconOpts;
	/** Item-usage dialog visibility (transient UI state, owned here). */
	userOpen = $state(false);

	constructor(opts: ItemIconOpts) {
		this.opts = opts;
	}

	get id() {
		return this.opts.id.current;
	}

	get app() {
		return this.opts.app;
	}

	readonly stuff = $derived(getStuff(this.app.game!, this.id));
	readonly name = $derived.by(() => decodeEntities(this.stuff?.name ?? ''));
	readonly required = $derived(this.app.squadRequired.get(this.id) ?? 0);
	readonly stock = $derived(this.app.deck?.stocks[this.id] ?? 0);
	readonly deficit = $derived(this.required > this.stock);
	readonly amount = $derived(
		this.deficit ? this.required - this.stock : this.stock - this.required
	);

	onStockInput(event: Event): void {
		const input = event.currentTarget as HTMLInputElement;
		if (!this.app.deck) return;
		const value = Number.parseInt(input.value, 10);
		setStock(this.app.deck.stocks, this.id, Number.isFinite(value) ? value : 0);
	}
}
