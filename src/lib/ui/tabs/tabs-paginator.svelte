<script lang="ts">
	import { cn } from '#lib/utils';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let { class: className, children, ...props }: HTMLButtonAttributes = $props();
</script>

<button
	type="button"
	tabindex="-1"
	class={cn(
		"z-10 flex w-8 shrink-0 items-center justify-center bg-background shadow-black/20 transition-shadow duration-200 enabled:cursor-pointer enabled:shadow-tab-ends [&_svg:not([class*='size-'])]:size-6",
		className
	)}
	{...props}
>
	{@render children?.()}
</button>
