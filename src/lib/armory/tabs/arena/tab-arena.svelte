<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { AppStateContext } from '#lib/app/app.svelte';
	import { selectOnEvent } from '#lib/ui/behaviors/select-on-event';
	import { CDN_BASE } from '#lib/config';
	import { ArenaTabState } from './tab-arena.svelte.js';

	const app = AppStateContext.get();

	const arenaTab = ArenaTabState.create({ app });

	const GEM_IMAGE = `${CDN_BASE}/images/item/icon/currency_icon_gem.webp`;
</script>

<div class="my-3 flex flex-wrap items-center gap-2 px-2"></div>

<div class="mx-auto w-fit space-y-3">
	<div class="flex items-center justify-between gap-4">
		<div class="rank-label">{m.arena_current_rank()}</div>
		<input
			type="number"
			id="rank-input"
			name="rank-input"
			class="block w-24 rounded border border-gray-200 bg-card px-3 py-2"
			min="1"
			max="15000"
			step="1"
			value={app.deck?.options.currentRank ?? 15000}
			{@attach selectOnEvent('focusin')}
			oninput={(event) => arenaTab.setRank(Number.parseInt(event.currentTarget.value, 10))}
		/>
	</div>
	<div>
		<div class="my-2">{m.arena_next_rank()}</div>
		<div class="grid grid-cols-5 gap-2">
			{#each arenaTab.forecasts as forecast, index (index)}
				<div class="flex w-24 justify-end rounded border border-gray-200 object-cover px-3 py-2">
					{#if forecast.tierUp}
						<img
							class="mr-auto size-5"
							src={GEM_IMAGE}
							alt=""
							loading="lazy"
							decoding="async"
							draggable="false"
						/>
					{/if}
					{forecast.rank === 0 ? '' : forecast.rank}
				</div>
			{/each}
		</div>
	</div>
</div>
