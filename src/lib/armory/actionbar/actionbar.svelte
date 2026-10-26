<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { AppStateContext } from '#lib/app/app.svelte';
	import {
		removeSquad,
		reverseSquadStudents,
		setIsTarget,
		setSquadTerrain,
		sortSquadStudents,
		toggleSquadBounded,
		toggleSquadFolded,
		toggleSquadPinned
	} from '#lib/deck/mutate';
	import { studentSortOptions, sortObjects } from '#lib/deck/sort';
	import type { StudentSortOption } from '#lib/deck/sort';
	import type { DeckStudentState } from '#lib/deck/types';
	import BaIcons from '#lib/game/ba-icons/ba-icons.svelte';
	import { Button } from '#lib/ui/button';
	import * as DropdownMenu from '#lib/ui/dropdown-menu';
	import * as Tooltip from '#lib/ui/tooltip';

	import Ban from '@lucide/svelte/icons/ban';
	import LocateFixed from '@lucide/svelte/icons/locate-fixed';
	import UserPlus from '@lucide/svelte/icons/user-plus';
	import Pin from '@lucide/svelte/icons/pin';
	import FoldHorizontal from '@lucide/svelte/icons/fold-horizontal';
	import UnfoldHorizontal from '@lucide/svelte/icons/unfold-horizontal';
	import ChevronsDownUp from '@lucide/svelte/icons/chevrons-down-up';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import Star from '@lucide/svelte/icons/star';

	let {
		isTarget = $bindable(false),
		sortOption = $bindable(null),
		sortDirection = $bindable(1),
		onOpenSelector,
		onOpenSquadText
	}: {
		isTarget?: boolean;
		sortOption?: StudentSortOption | null;
		sortDirection?: -1 | 1;
		onOpenSelector: () => void;
		onOpenSquadText: () => void;
	} = $props();

	const app = AppStateContext.get();

	const squad = $derived(app.selectedSquad);
	const options = $derived(app.game ? studentSortOptions(app.game) : []);
	const terrainOptions = $derived(
		app.game
			? (['Street', 'Outdoor', 'Indoor'] as const).map((terrain) => ({
					id: terrain,
					label: app.game!.localization.adaptationType(terrain)
				}))
			: []
	);

	function applySort(option: StudentSortOption | null, direction: -1 | 1) {
		if (!app.deck || !squad) return;
		if (option == null) {
			reverseSquadStudents(squad);
			return;
		}
		sortSquadStudents(squad, (aId, bId) => {
			const a = app.deck!.students[aId] as DeckStudentState;
			const b = app.deck!.students[bId] as DeckStudentState;
			if (!a || !b) return 0;
			return sortObjects<DeckStudentState>(a, b, option, direction);
		});
	}

	function toggleTarget() {
		if (!app.deck || !squad) return;
		const next = !isTarget;
		for (const studentId of squad.students) {
			const entry = app.deck.students[studentId];
			if (entry) setIsTarget(entry, next);
		}
		isTarget = next;
	}
</script>

<div class="my-3 flex flex-wrap items-center gap-2 px-2">
	<div class="mr-auto flex flex-wrap items-center justify-start gap-2">
		<Button
			variant="warn"
			disabled={app.deck ? app.deck.squads.length === 1 : true}
			onclick={() => app.deck && removeSquad(app.deck)}
		>
			<Ban />
			{m.squad_action_remove()}
		</Button>

		<Button variant={isTarget ? 'accent' : 'outline'} onclick={toggleTarget}>
			<LocateFixed />
			{m.student_action_target()}
		</Button>

		<Button variant="primary" onclick={onOpenSelector}>
			<UserPlus />
			{app.game?.localization.ui('student') ?? ''}
		</Button>
	</div>

	<div class="ml-auto flex flex-wrap items-center justify-end gap-2">
		<Tooltip.Provider delayDuration={300}>
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant={squad?.pinned ? 'accent' : 'outline'}
							size="icon"
							onclick={() => squad && toggleSquadPinned(squad)}
						>
							<Pin />
						</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content>{m.squad_action_pin()}</Tooltip.Content>
			</Tooltip.Root>
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant={squad?.bounded ? 'accent' : 'outline'}
							size="icon"
							onclick={() => squad && toggleSquadBounded(squad)}
						>
							{#if squad?.bounded}
								<FoldHorizontal />
							{:else}
								<UnfoldHorizontal />
							{/if}
						</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content>{m.squad_action_bound()}</Tooltip.Content>
			</Tooltip.Root>
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="outline"
							size="icon"
							onclick={() => squad && toggleSquadFolded(squad)}
						>
							{#if squad?.folded}
								<ChevronsDownUp />
							{:else}
								<ChevronsUpDown />
							{/if}
						</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content>{m.squad_action_fold()}</Tooltip.Content>
			</Tooltip.Root>
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="icon" onclick={onOpenSquadText}>
							<ClipboardList />
						</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content>{m.squad_action_text()}</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline" class="flex items-center">
						<BaIcons name={`terrain_${squad?.terrain ?? 'Street'}`} class="size-5" />
						{terrainOptions.find((option) => option.id === squad?.terrain)?.label ?? ''}
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				{#each terrainOptions as option (option.id)}
					<DropdownMenu.Item
						class="flex items-center gap-2"
						onclick={() => squad && setSquadTerrain(squad, option.id)}
					>
						<BaIcons name={`terrain_${option.id}`} class="size-5" />
						{option.label}
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline">
						<ArrowUpDown />
						{app.game?.localization.ui('sortby') ?? ''}
						{#if sortOption?.label === 'star'}
							<Star class="size-4 align-sub" />
						{:else if sortOption}
							{sortOption.label}
						{/if}
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				{#each options as option (option.id)}
					<DropdownMenu.Item
						class="flex items-center gap-2"
						onclick={() => {
							sortOption = option;
							applySort(option, sortDirection);
						}}
					>
						{#if option.label === 'star'}
							<Star class="size-4" />
						{/if}
						{option.label}
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>

		<Button
			variant="outline"
			size="icon"
			onclick={() => {
				sortDirection = sortDirection === -1 ? 1 : -1;
				applySort(sortOption, sortDirection);
			}}
		>
			{#if sortDirection === -1}
				<ArrowUp />
			{:else}
				<ArrowDown />
			{/if}
		</Button>
	</div>
</div>
