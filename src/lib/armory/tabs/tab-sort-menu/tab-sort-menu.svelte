<script lang="ts">
	import { AppStateContext } from '#lib/app/app.svelte';
	import { Button } from '#lib/ui/button';
	import * as DropdownMenu from '#lib/ui/dropdown-menu';
	import { cn, type WithElementRef } from '#lib/utils';
	import type { TabSortView } from '../tab-sort.svelte.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';

	type SortMenuProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		sort: TabSortView;
	};

	let { sort, class: className, ...restProps }: SortMenuProps = $props();

	const app = AppStateContext.get();
</script>

<!-- Presentational shared renderer: restProps spread last so consumers can override. -->
<div class={cn('flex flex-wrap items-center gap-2', className)} {...restProps}>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="outline">
					<ArrowUpDown />
					{app.game?.localization.ui('sortby') ?? ''}
					{sort.sortLabel}
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			{#each sort.options as option (option.id)}
				<DropdownMenu.Item onclick={() => sort.select(option.id)}>{option.label}</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>

	<Button variant="outline" size="icon" onclick={() => sort.toggleDirection()}>
		{#if sort.sortDirection === -1}
			<ArrowUp />
		{:else}
			<ArrowDown />
		{/if}
	</Button>
</div>
