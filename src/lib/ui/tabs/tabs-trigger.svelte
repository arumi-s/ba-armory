<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: TabsPrimitive.TriggerProps = $props();
</script>

<TabsPrimitive.Trigger
	bind:ref
	data-slot="tabs-trigger"
	class={cn(
		'relative flex min-w-min shrink-0 cursor-pointer items-center border-b-2 border-transparent px-6 whitespace-nowrap text-black/60 not-aria-selected:hover:text-black/80 aria-selected:border-b-primary aria-selected:font-medium aria-selected:text-primary',
		className
	)}
	{...restProps}
/>
