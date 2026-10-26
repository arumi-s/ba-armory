<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { useResizeObserver } from 'runed';
	import { m } from '#lib/paraglide/messages.js';
	import { cn } from '#lib/utils.js';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import TabsPaginator from './tabs-paginator.svelte';

	let { ref = $bindable(null), class: className, ...restProps }: TabsPrimitive.ListProps = $props();

	let viewport: HTMLElement | null = $state(null);
	let scrollLeft = $state(0);
	let viewportWidth = $state(0);
	let listWidth = $state(0);

	const overflow = $derived(listWidth > viewportWidth + 1);
	const beforeDisabled = $derived(scrollLeft <= 1);
	const afterDisabled = $derived(scrollLeft >= listWidth - viewportWidth - 1);

	function update() {
		if (!viewport || !ref) return;
		scrollLeft = viewport.scrollLeft;
		viewportWidth = viewport.clientWidth;
		listWidth = ref.scrollWidth;
	}

	function paginate(direction: -1 | 1) {
		if (!viewport) return;
		viewport.scrollBy({ left: direction * viewport.clientWidth * 0.8, behavior: 'smooth' });
	}

	useResizeObserver(() => [viewport, ref].filter((el): el is HTMLElement => el != null), update);
</script>

<div
	class={cn('flex items-stretch overflow-hidden border-y border-gray-200 select-none', className)}
>
	{#if overflow}
		<TabsPaginator
			aria-label={m.action_scroll_back()}
			disabled={beforeDisabled}
			onclick={() => paginate(-1)}
		>
			<ChevronLeft />
		</TabsPaginator>
	{/if}
	<div
		bind:this={viewport}
		onscroll={update}
		class="min-w-0 flex-1 scrollbar-none overflow-x-auto [&::-webkit-scrollbar]:hidden"
	>
		<TabsPrimitive.List
			bind:ref
			data-slot="tabs-list"
			class="flex h-12 w-max items-stretch"
			{...restProps}
		/>
	</div>
	{#if overflow}
		<TabsPaginator
			aria-label={m.action_scroll_forward()}
			disabled={afterDisabled}
			onclick={() => paginate(1)}
		>
			<ChevronRight />
		</TabsPaginator>
	{/if}
</div>
