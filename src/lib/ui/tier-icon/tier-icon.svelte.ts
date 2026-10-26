import { type ReadableBoxedValues } from 'svelte-toolbelt';

export interface TierIconOpts extends ReadableBoxedValues<{
	iconUrl: string;
	label: string;
	value: number;
	targetValue: number;
	max: number;
	min: number;
	isTarget: boolean;
	vertical: boolean;
	typeText: string;
	typeClass: string;
	displayMax: boolean;
}> {
	onSet: (value: number) => void;
}

export class TierIconState {
	static create(opts: TierIconOpts): TierIconState {
		return new TierIconState(opts);
	}

	readonly opts: TierIconOpts;

	constructor(opts: TierIconOpts) {
		this.opts = opts;
		this.onclick = this.onclick.bind(this);
		this.oncontextmenu = this.oncontextmenu.bind(this);
	}

	get iconUrl() {
		return this.opts.iconUrl.current;
	}

	get label() {
		return this.opts.label.current;
	}

	get value() {
		return this.opts.value.current;
	}

	get targetValue() {
		return this.opts.targetValue.current;
	}

	get max() {
		return this.opts.max.current;
	}

	get min() {
		return this.opts.min.current;
	}

	get isTarget() {
		return this.opts.isTarget.current;
	}

	get vertical() {
		return this.opts.vertical.current;
	}

	get typeText() {
		return this.opts.typeText.current;
	}

	get typeClass() {
		return this.opts.typeClass.current;
	}

	get displayMax() {
		return this.opts.displayMax.current;
	}

	readonly caption = $derived.by(() =>
		this.displayMax ? (this.value === this.max ? 'MAX' : `Lv.${this.value}`) : `T${this.value}`
	);

	readonly reached = $derived(this.value === this.targetValue);

	/** Left click cycles +1; ctrl+click toggles min↔max. */
	onclick(event: MouseEvent): void {
		event.preventDefault();
		if (this.max <= this.min) return;
		this.opts.onSet(
			event.ctrlKey ? (this.value === this.max ? this.min : this.max) : this.value + 1
		);
	}

	/** Right click decrements by one. */
	oncontextmenu(event: MouseEvent): void {
		event.preventDefault();
		this.opts.onSet(this.value - 1);
	}

	/** Hover-number action dispatch ('0'-'9' / 'm' → max). */
	onHoverNumber(value: number): void {
		this.opts.onSet(value);
	}

	/** Managed root attributes: title/data-tier/data-level contract + event handlers. */
	readonly props = $derived.by(() => ({
		title: this.label,
		'data-tier': this.displayMax ? undefined : this.value,
		'data-level': this.displayMax ? this.value : undefined,
		onclick: this.onclick,
		oncontextmenu: this.oncontextmenu
	}));
}
