<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { AppStateContext } from '#lib/app/app.svelte';
	import { CheckboxField } from '#lib/ui/checkbox';
	import ItemIcon from '#lib/game/item/item-icon/item-icon.svelte';
	import SortMenu from '../tab-sort-menu/tab-sort-menu.svelte';
	import { GearsTabState } from './tab-gears.svelte.js';

	const app = AppStateContext.get();

	const gearsTab = GearsTabState.create({ app });
</script>

<div class="my-3 flex flex-wrap items-center gap-2 px-2">
	<div class="mr-auto flex flex-wrap items-center justify-start gap-2">
		<CheckboxField
			id="gear-show-surplus"
			label={m.item_show_surplus_items()}
			bind:checked={app.deck!.options.showSurplusItems}
		/>
		<CheckboxField
			id="gear-show-required"
			label={m.item_show_required_items()}
			bind:checked={app.deck!.options.showRequiredItems}
		/>
	</div>

	<SortMenu sort={gearsTab.sort} class="ml-auto justify-end" />
</div>

<div class="my-3 flex flex-wrap items-stretch justify-center gap-2">
	{#each gearsTab.visibleIds as id (id)}
		<ItemIcon {id} />
	{/each}
</div>
