import { type ReadableBoxedValues } from 'svelte-toolbelt';

export type RatingUnit = 'selected' | 'preview' | 'inactive' | 'inactive-dim';

export interface StarRatingOpts extends ReadableBoxedValues<{
	value: number;
	max: number;
	disabled: boolean;
}> {
	onValueChange: (v: number) => void;
}

export class StarRatingState {
	static create(opts: StarRatingOpts): StarRatingState {
		return new StarRatingState(opts);
	}

	readonly opts: StarRatingOpts;
	hovered = $state(0);

	constructor(opts: StarRatingOpts) {
		this.opts = opts;
		this.onkeydown = this.onkeydown.bind(this);
	}

	get value() {
		return this.opts.value.current; // live view, never stale
	}

	get max() {
		return this.opts.max.current;
	}

	get disabled() {
		return this.opts.disabled.current;
	}

	readonly units = $derived.by(() =>
		Array.from({ length: this.max }, (_, i): RatingUnit => {
			if (this.hovered > 0) {
				if (i + 1 <= this.hovered) return i + 1 <= this.value ? 'selected' : 'preview';
				return this.value === this.max ? 'inactive-dim' : 'inactive';
			}
			return i + 1 <= this.value
				? 'selected'
				: this.value === this.max
					? 'inactive-dim'
					: 'inactive';
		})
	);

	apply(v: number): void {
		if (this.disabled) return;
		const clamped = Math.max(0, Math.min(Math.floor(Number(v) || 0), this.max));
		this.opts.onValueChange(clamped);
	}

	hover(i: number): void {
		if (this.disabled) return;
		this.hovered = i;
	}

	leave(): void {
		if (this.disabled) return;
		this.hovered = 0;
	}

	onkeydown(event: KeyboardEvent): void {
		if (this.disabled) return;
		if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
			event.preventDefault();
			this.apply(this.value + 1);
		} else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
			event.preventDefault();
			this.apply(this.value - 1);
		} else if (event.key === '0') {
			event.preventDefault();
			this.apply(0);
		}
	}
}
