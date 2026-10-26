<script lang="ts">
	import { AppStateContext } from '#lib/app/app.svelte';
	import ElephCard from '#lib/game/eleph/eleph-card/eleph-card.svelte';
	import SortMenu from '../tab-sort-menu/tab-sort-menu.svelte';
	import { ElephsTabState } from './tab-elephs.svelte.js';

	const app = AppStateContext.get();

	const elephsTab = ElephsTabState.create({ app });
</script>

<div class="my-3 flex flex-wrap items-center gap-2 px-2">
	<SortMenu sort={elephsTab.sort} class="ml-auto justify-end" />
</div>

<div class="my-3 flex flex-wrap items-stretch justify-center gap-4">
	{#each elephsTab.visibleIds as id (id)}
		<ElephCard {id} />
	{/each}
</div>
