<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { SCHALEDB_BASE } from '#lib/config';
	import { cn, type WithElementRef } from '#lib/utils';
	import { selectOnEvent } from '#lib/ui/behaviors/select-on-event';
	import { boxWith } from 'svelte-toolbelt';
	import type { HTMLAttributes } from 'svelte/elements';
	import { AppStateContext } from '#lib/app/app.svelte';
	import { stuffIconUrl } from '#lib/data/indexes';
	import { ItemIconState, formatRate } from './item-icon.svelte.js';
	import ItemUserDialog from '#lib/game/item/item-user-dialog/item-user-dialog.svelte';

	type ItemIconProps = WithElementRef<Omit<HTMLAttributes<HTMLDivElement>, 'id'>> & {
		id: number;
		rate?: number;
		hideShadow?: boolean;
		hideName?: boolean;
		hideAmount?: boolean;
	};

	let {
		id,
		rate,
		hideShadow = false,
		hideName = false,
		hideAmount = false,
		class: className,
		...restProps
	}: ItemIconProps = $props();

	const app = AppStateContext.get();

	const state = ItemIconState.create({
		id: boxWith(() => id),
		app
	});
</script>

{#if state.stuff}
	<!-- Presentational root: managed data-category first, restProps last (consumer may override). -->
	<div
		class={cn(
			'flex h-auto w-28 flex-col items-center gap-1 p-2 shadow-neutral-400',
			!hideShadow && 'shadow-sm',
			className
		)}
		data-category={state.stuff.category.toLowerCase()}
		{...restProps}
	>
		<button
			type="button"
			class="relative w-24 select-none"
			tabindex="-1"
			data-tier={state.stuff.tier || undefined}
			onclick={() => (state.userOpen = true)}
		>
			<img
				src={stuffIconUrl(state.stuff)}
				alt={state.name}
				class={cn('w-full rounded-lg', `bg-item-${state.stuff.rarity.toLowerCase()}`)}
				loading="lazy"
				decoding="async"
				draggable="false"
			/>
			{#if state.stuff.tier != null && state.stuff.tier > 0}
				<div
					class="absolute bottom-0 left-0 m-0.5 -skew-x-10 rounded-md border border-current bg-white px-1 py-px text-xs/none font-bold text-sky-600"
				>
					T{state.stuff.tier}
				</div>
			{/if}
			{#if rate != null}
				<div class="absolute right-0 bottom-0 m-0.5 text-xs/none">
					{formatRate(rate)}
				</div>
			{/if}
		</button>
		{#if !hideName}
			<div class="-mx-1 grow text-center text-sm">
				<a
					href={`${SCHALEDB_BASE}/?item=${encodeURIComponent(state.id)}`}
					target="_blank"
					rel="noopener noreferrer"
					tabindex="-1"
				>
					{state.name}
				</a>
			</div>
		{/if}
		{#if !hideAmount}
			<div>
				<div class="required flex items-center justify-center gap-1">
					<div class="whitespace-nowrap">{m.item_required()}:</div>
					<div>{state.required}</div>
				</div>
				<div class="flex items-center justify-center gap-1">
					<div class="whitespace-nowrap">
						{state.deficit ? m.item_deficit() : m.item_surplus()}:
					</div>
					<div class={cn('font-bold', state.deficit ? 'text-red-500' : 'text-lime-500')}>
						{state.amount}
					</div>
				</div>
			</div>
			<input
				class="block w-full border border-gray-200 p-1"
				type="number"
				name={'stock-input-' + state.id}
				min="0"
				step="1"
				value={state.stock}
				{@attach selectOnEvent('focusin')}
				oninput={(event) => state.onStockInput(event)}
			/>
		{/if}
	</div>

	<ItemUserDialog bind:open={state.userOpen} id={state.id} />
{/if}
