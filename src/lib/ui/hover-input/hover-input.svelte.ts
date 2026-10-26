import { attachRef, onDestroyEffect, onMountEffect } from 'svelte-toolbelt';
import type { ReadableBoxedValues, WritableBoxedValues } from 'svelte-toolbelt';
import { Context } from 'runed';
import { on } from 'svelte/events';
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { WithElementRef } from '#lib/utils';

/** Handler invoked with a committed hover number ('0'-'9', or `Number.MAX_SAFE_INTEGER` for 'm'/'M'). */
export type HoverNumberHandler = (value: number) => void;

export type HoverInputProviderProps = {
	children?: Snippet;
};

/** Snippet params handed to the `child`/`children` snippets of `HoverInputTrigger`. */
export type HoverInputTriggerSnippetProps = {
	/**
	 * Dispatch for committed hover numbers; the same handler as the `onNumber` prop.
	 * Handy to wire the behavior into delegated children, e.g. `<TierIcon onSet={onNumber} />`.
	 */
	onNumber: HoverNumberHandler;
};

export type HoverInputTriggerProps = WithElementRef<
	Omit<HTMLAttributes<HTMLDivElement>, 'children'>
> & {
	/** Called when a hover number is committed while the pointer is over the trigger element. */
	onNumber?: HoverNumberHandler;
	child?: Snippet<[HoverInputTriggerSnippetProps & { props: Record<string, unknown> }]>;
	children?: Snippet<[HoverInputTriggerSnippetProps]>;
};

export interface HoverInputTriggerOpts
	extends
		ReadableBoxedValues<{
			/** Handler invoked with committed hover numbers while the element is hovered. */
			onNumber: HoverNumberHandler;
		}>,
		WritableBoxedValues<{
			ref: HTMLElement | null;
		}> {}

const HoverInputContext = new Context<HoverInputProviderState>('HoverInput.Provider');

function isEditableTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	if (target.isContentEditable) return true;
	const tag = target.tagName;
	return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function parseHoverKey(key: string): number | undefined {
	if (key >= '0' && key <= '9') return Number.parseInt(key, 10);
	if (key === 'm' || key === 'M') return Number.MAX_SAFE_INTEGER;
	return undefined;
}

export class HoverInputProviderState {
	static create(): HoverInputProviderState {
		return HoverInputContext.set(new HoverInputProviderState());
	}

	#x = 0;
	#y = 0;
	#targets = new WeakMap<Element, HoverNumberHandler>();

	private constructor() {
		onMountEffect(() => this.#start());
	}

	#start(): () => void {
		const offs = [
			on(window, 'pointermove', this.#onPointerMove, { passive: true }),
			on(window, 'keydown', this.#onKeyDown)
		];
		return () => {
			for (const off of offs) off();
		};
	}

	register(node: Element, handler: HoverNumberHandler): void {
		this.#targets.set(node, handler);
	}

	unregister(node: Element): void {
		this.#targets.delete(node);
	}

	#onPointerMove = (event: PointerEvent): void => {
		this.#x = event.clientX;
		this.#y = event.clientY;
	};

	#onKeyDown = (event: KeyboardEvent): void => {
		if (isEditableTarget(event.target)) return;
		const value = parseHoverKey(event.key);
		if (value === undefined) return;
		const node = this.#targetFromPoint();
		if (node === null) return;
		event.preventDefault();
		this.#targets.get(node)?.(value);
	};

	/** Closest registered ancestor of the element under the pointer. */
	#targetFromPoint(): Element | null {
		let node: Element | null = document.elementFromPoint(this.#x, this.#y);
		while (node !== null && !this.#targets.has(node)) node = node.parentElement;
		return node;
	}
}

export class HoverInputTriggerState {
	static create(opts: HoverInputTriggerOpts): HoverInputTriggerState {
		return new HoverInputTriggerState(opts, HoverInputContext.get());
	}

	readonly opts: HoverInputTriggerOpts;
	readonly root: HoverInputProviderState;
	readonly attachment: ReturnType<typeof attachRef<HTMLElement>>;
	#node: Element | null = null;

	constructor(opts: HoverInputTriggerOpts, root: HoverInputProviderState) {
		this.opts = opts;
		this.root = root;
		this.onNumber = this.onNumber.bind(this);

		this.attachment = attachRef(opts.ref, (node) => {
			if (node === null) {
				if (this.#node !== null) this.root.unregister(this.#node);
				this.#node = null;
			} else {
				this.#node = node;
				this.root.register(node, this.onNumber);
			}
		});

		onDestroyEffect(() => {
			if (this.#node !== null) {
				this.root.unregister(this.#node);
				this.#node = null;
			}
		});
	}

	onNumber(value: number): void {
		this.opts.onNumber.current(value);
	}

	readonly props = $derived.by(() => ({
		...this.attachment
	}));
}
