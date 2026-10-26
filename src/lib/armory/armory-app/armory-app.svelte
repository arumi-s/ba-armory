<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { AppStateContext } from '#lib/app/app.svelte';
	import { Button } from '#lib/ui/button';
	import { LoaderCircleIcon } from '@lucide/svelte';

	import SquadTabs from '../squad-tabs/squad-tabs.svelte';
	import Actionbar from '../actionbar/actionbar.svelte';
	import StudentsArea from '../students-area/students-area.svelte';
	import TabItems from '../tabs/items/tab-items.svelte';
	import TabCampaigns from '../tabs/campaigns/tab-campaigns.svelte';
	import TabElephs from '../tabs/elephs/tab-elephs.svelte';
	import TabFavor from '../tabs/favor/tab-favor.svelte';
	import TabGears from '../tabs/gears/tab-gears.svelte';
	import TabArena from '../tabs/arena/tab-arena.svelte';
	import * as Tabs from '#lib/ui/tabs';
	import SelectorDialog from '#lib/armory/selector-dialog/selector-dialog.svelte';
	import SquadTextDialog from '#lib/armory/squad-text-dialog/squad-text-dialog.svelte';
	import { setSquadTab } from '#lib/deck/mutate';
	import type { StudentSortOption } from '#lib/deck/sort';

	const app = AppStateContext.get();

	let isTarget = $state(false);
	let sortOption = $state<StudentSortOption | null>(null);
	let sortDirection = $state<-1 | 1>(1);
	let selectorOpen = $state(false);
	let squadTextOpen = $state(false);

	/** Per-squad UI state resets when the selection changes. */
	const selectedSquadId = $derived(app.deck?.selectedSquadId);
	$effect(() => {
		void selectedSquadId;
		isTarget = false;
		sortOption = null;
		sortDirection = 1;
	});

	const tabs = $derived([
		{ id: 0, label: app.game?.localization.ui('item') ?? '' },
		{ id: 1, label: app.game?.localization.ui('stages') ?? '' },
		{ id: 2, label: app.game?.localization.itemCategory('SecretStone') ?? '' },
		{ id: 3, label: app.game?.localization.itemCategory('Favor') ?? '' },
		{ id: 4, label: app.game?.localization.ui('ex_gear') ?? '' },
		{ id: 5, label: app.game?.localization.shopCategory('Arena') ?? '' }
	]);

	const tab = $derived(app.selectedSquad?.tab ?? 0);

	function setTab(value: number) {
		if (app.selectedSquad) setSquadTab(app.selectedSquad, value);
	}
</script>

{#if app.phase === 'loading'}
	<div class="flex min-h-72 flex-col items-center justify-center gap-4">
		<LoaderCircleIcon class="size-10 animate-spin text-primary" />
		<div class="text-lg font-medium">{m.app_title()}</div>
	</div>
{:else if app.phase === 'error'}
	<div class="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
		<div class="font-medium text-destructive">{app.error}</div>
		<Button variant="outline" onclick={() => location.reload()}>Reload</Button>
	</div>
{:else if app.game && app.deck}
	<SquadTabs />

	<Actionbar
		bind:isTarget
		bind:sortOption
		bind:sortDirection
		onOpenSelector={() => (selectorOpen = true)}
		onOpenSquadText={() => (squadTextOpen = true)}
	/>

	<StudentsArea />

	<Tabs.Root value={String(tab)} onValueChange={(value) => setTab(Number(value))}>
		<Tabs.List>
			{#each tabs as entry (entry.id)}
				<Tabs.Trigger value={String(entry.id)}>{entry.label}</Tabs.Trigger>
			{/each}
		</Tabs.List>

		{#if tab === 0}
			<TabItems />
		{:else if tab === 1}
			<TabCampaigns />
		{:else if tab === 2}
			<TabElephs />
		{:else if tab === 3}
			<TabFavor />
		{:else if tab === 4}
			<TabGears />
		{:else}
			<TabArena />
		{/if}
	</Tabs.Root>

	<SelectorDialog bind:open={selectorOpen} />
	<SquadTextDialog bind:open={squadTextOpen} />
{/if}
