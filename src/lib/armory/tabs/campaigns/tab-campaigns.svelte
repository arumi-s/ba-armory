<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { AppStateContext } from '#lib/app/app.svelte';
	import { CheckboxField } from '#lib/ui/checkbox';
	import CampaignCard from '#lib/game/campaign/campaign-card/campaign-card.svelte';
	import { CampaignsTabState } from './tab-campaigns.svelte.js';

	const app = AppStateContext.get();

	const campaignsTab = CampaignsTabState.create({ app });
</script>

<div class="my-3 flex flex-wrap items-center gap-2 px-2">
	<div class="mr-auto flex flex-wrap items-center justify-start gap-2">
		<CheckboxField
			id="campaign-show-hard"
			label={m.campaign_show_campaign_hard()}
			bind:checked={app.deck!.options.showCampaignHard}
		/>
	</div>
</div>

<div class="my-3 flex flex-col gap-4">
	{#each campaignsTab.stages as stage (stage.id)}
		<CampaignCard id={stage.id} amount={stage.amount} />
	{/each}
</div>
