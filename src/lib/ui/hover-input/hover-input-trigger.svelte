<script lang="ts">
	import { boxWith, mergeProps } from 'svelte-toolbelt';
	import { HoverInputTriggerState } from './hover-input.svelte.js';
	import type { HoverInputTriggerProps } from './hover-input.svelte.js';

	let {
		onNumber = () => {},
		ref = $bindable(null),
		child,
		children,
		...restProps
	}: HoverInputTriggerProps = $props();

	const triggerState = HoverInputTriggerState.create({
		onNumber: boxWith(() => onNumber),
		ref: boxWith(
			() => ref,
			(v) => (ref = v)
		)
	});

	const mergedProps = $derived(mergeProps(restProps, triggerState.props));
</script>

{#if child}
	{@render child({ props: mergedProps, onNumber })}
{:else}
	<div {...mergedProps}>
		{@render children?.({ onNumber })}
	</div>
{/if}
