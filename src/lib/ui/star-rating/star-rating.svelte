<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn, type WithElementRef } from '#lib/utils';
	import { mergeProps } from 'svelte-toolbelt';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { StarRatingState } from './star-rating.svelte.js';

	let {
		state,
		active,
		inactive,
		class: className,
		...restProps
	}: {
		state: StarRatingState;
		active: Snippet;
		inactive: Snippet;
	} & WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	// Interactive root: managed attributes (data-value/role/tabindex) win,
	// consumer event handlers chain with the component's own onkeydown.
	const mergedProps = $derived(
		mergeProps(restProps, {
			'data-value': state.value,
			role: 'radiogroup',
			tabindex: state.disabled ? -1 : 0,
			'aria-disabled': state.disabled,
			onkeydown: state.onkeydown
		})
	);
</script>

<div
	{...mergedProps}
	class={cn(
		'flex select-none aria-disabled:pointer-events-none aria-disabled:brightness-150 aria-disabled:grayscale',
		className
	)}
	role="radiogroup"
>
	{#each state.units as unit, i (i)}
		<button
			type="button"
			role="radio"
			aria-checked={unit === 'selected'}
			aria-label={String(i + 1)}
			onmouseenter={() => state.hover(i + 1)}
			onfocus={() => state.hover(i + 1)}
			onmouseleave={() => state.leave()}
			onblur={() => state.leave()}
			onclick={(event) => {
				event.preventDefault();
				state.apply(i + 1);
			}}
			oncontextmenu={(event) => {
				event.preventDefault();
				state.apply(i);
			}}
			disabled={state.disabled}
		>
			{#if unit === 'inactive' || unit === 'inactive-dim'}
				<span class={cn('block', unit === 'inactive-dim' && 'opacity-50')}>
					{@render inactive()}
				</span>
			{:else}
				<span class={cn('block', unit === 'preview' && 'opacity-50')}>
					{@render active()}
				</span>
			{/if}
		</button>
	{/each}
</div>
