<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { AppStateContext } from '#lib/app/app.svelte';
	import { CheckboxField } from '#lib/ui/checkbox';
	import ItemIcon from '#lib/game/item/item-icon/item-icon.svelte';
	import SortMenu from '../tab-sort-menu/tab-sort-menu.svelte';
	import { ItemsTabState } from './tab-items.svelte.js';

	const app = AppStateContext.get();

	const itemsTab = ItemsTabState.create({ app });
</script>

<div class="my-3 flex flex-wrap items-center gap-2 px-2">
	<div class="mr-auto flex flex-wrap items-center justify-start gap-2">
		<CheckboxField
			id="item-show-surplus"
			label={m.item_show_surplus_items()}
			bind:checked={app.deck!.options.showSurplusItems}
		/>
		<CheckboxField
			id="item-show-required"
			label={m.item_show_required_items()}
			bind:checked={app.deck!.options.showRequiredItems}
		/>
		<CheckboxField
			id="item-show-elephs"
			label={m.item_show_elephs()}
			bind:checked={app.deck!.options.showElephs}
		/>
	</div>

	<SortMenu sort={itemsTab.sort} class="ml-auto justify-end" />
</div>

<div class="my-3 flex flex-wrap items-stretch justify-center gap-2">
	{#each itemsTab.visibleIds as id (id)}
		<ItemIcon {id} />
	{/each}
</div>
