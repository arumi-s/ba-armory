<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { cn, type WithElementRef } from '#lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import { AppStateContext } from '#lib/app/app.svelte';
	import { ACTION_POINT_ID, RewardType } from '#lib/data/enums';
	import { campaignIconUrl } from '#lib/data/indexes';
	import ItemIcon from '#lib/game/item/item-icon/item-icon.svelte';

	let {
		id,
		amount,
		class: className,
		...restProps
	}: WithElementRef<Omit<HTMLAttributes<HTMLDivElement>, 'id'>> & {
		id: number;
		amount: number;
	} = $props();

	const app = AppStateContext.get();

	const campaign = $derived(app.game?.campaigns.find((entry) => entry.id === id));
	const rewards = $derived(
		campaign
			? campaign.rewards.filter(
					(reward) => reward.rewardType === RewardType.Default && reward.type !== 'Currency'
				)
			: []
	);
	const cost = $derived(
		campaign?.entryCost.find(([itemId]) => itemId === ACTION_POINT_ID)?.[1] ?? 0
	);
</script>

{#if campaign}
	<div
		class={cn('flex items-center rounded-md bg-card shadow shadow-neutral-400', className)}
		{...restProps}
	>
		<div class="flex shrink-0 grow-0 basis-48 flex-col gap-2 self-stretch p-4">
			<img
				class="w-full rounded"
				src={campaignIconUrl(campaign)}
				alt=""
				loading="lazy"
				decoding="async"
				draggable="false"
			/>
			<div class="overflow-hidden text-lg/5 font-semibold whitespace-nowrap">
				{app.game?.localization.stageType('Campaign') ?? ''}
				{campaign.difficulty === 1 ? 'H' : 'N'}{campaign.area}-{campaign.stage}
			</div>
			<div class="text-sm/4 text-neutral-500 italic">{campaign.name}</div>
			<div class="mt-auto flex justify-between pt-2 text-base/5 font-semibold">
				<div class="stat">{m.campaign_amount()}: {amount}</div>
				<div class="stat">{m.campaign_cost()}: {cost}</div>
			</div>
		</div>
		<div class="flex flex-1 gap-2 self-stretch overflow-x-auto px-1">
			{#each rewards as reward, index (index)}
				<ItemIcon id={reward.id} rate={reward.chance} class="w-32 shrink-0" />
			{/each}
		</div>
	</div>
{/if}
