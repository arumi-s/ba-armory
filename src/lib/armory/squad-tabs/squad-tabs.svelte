<script lang="ts">
	import { AppStateContext } from '#lib/app/app.svelte';
	import {
		addSquad,
		moveSquad,
		setSquadIcon,
		setSquadName,
		setSelectedSquadId
	} from '#lib/deck/mutate';
	import { m } from '#lib/paraglide/messages.js';
	import IconSelectorDialog from '#lib/armory/icon-selector-dialog/icon-selector-dialog.svelte';
	import * as Tabs from '#lib/ui/tabs';
	import { Button } from '#lib/ui/button';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import CirclePlus from '@lucide/svelte/icons/circle-plus';
	import { CDN_BASE } from '#lib/config.ts';

	let { onSelectSquad }: { onSelectSquad?: () => void } = $props();

	const app = AppStateContext.get();

	let iconSelectorIndex = $state(-1);
	let iconSelectorOpen = $state(false);

	const DEFAULT_ICON = '/assets/icons/icon-32x32.png';

	function autoIcon(students: number[]): string {
		if (students.length === 0 || !app.game) return DEFAULT_ICON;
		const first = app.deck?.students[students[0]];
		if (!first) return DEFAULT_ICON;
		return `${CDN_BASE}/images/student/collection/${first.id % 1_000_000}.webp`;
	}

	function handleNameInput(event: Event, squadIndex: number) {
		const input = event.currentTarget as HTMLInputElement;
		if (!app.deck) return;
		setSquadName(app.deck.squads[squadIndex]!, input.value);
	}

	function selectSquad(index: number) {
		if (!app.deck) return;
		setSelectedSquadId(app.deck, index);
		onSelectSquad?.();
	}

	function openIconSelector(index: number) {
		iconSelectorIndex = index;
		iconSelectorOpen = true;
	}
</script>

{#if app.deck}
	<Tabs.Root
		value={String(app.deck.selectedSquadId)}
		onValueChange={(value) => selectSquad(Number(value))}
	>
		<Tabs.List>
			{#each app.deck.squads as squad, index (index)}
				{@const active = index === app.deck.selectedSquadId}
				{@const editable = active && !squad.pinned}
				<Tabs.Trigger
					value={String(index)}
					class="group px-0 aria-selected:font-normal data-pinned:-ml-px data-pinned:border-x data-pinned:border-x-gray-300 data-pinned:px-2"
				>
					{#snippet child({ props })}
						{@const tabProps = { ...props, type: undefined }}
						<div
							{...tabProps}
							data-pinned={squad.pinned ? true : undefined}
							data-editable={editable ? true : undefined}
						>
							{#if !squad.pinned}
								<button
									type="button"
									class="invisible flex size-6 shrink-0 items-center justify-center group-data-editable:visible"
									tabindex="-1"
									aria-label={m.squad_action_move_left()}
									onmousedown={(event) => event.stopPropagation()}
									onclick={(event) => {
										event.stopPropagation();
										moveSquad(app.deck!, -1);
									}}
								>
									<ChevronLeft class="size-6" />
								</button>
							{/if}
							<button
								type="button"
								tabindex="-1"
								title={squad.name}
								class="shrink-0 rounded-full not-group-data-editable:pointer-events-none group-data-editable:cursor-pointer"
								onmousedown={(event) => event.stopPropagation()}
								onclick={(event) => {
									event.stopPropagation();
									if (editable) openIconSelector(index);
								}}
							>
								<img
									class="pointer-events-none size-8 rounded-full bg-slate-500 object-cover"
									src={squad.icon === '' ? autoIcon(squad.students) : squad.icon}
									alt={squad.name}
									loading="lazy"
									decoding="async"
									draggable="false"
								/>
							</button>
							{#if !squad.pinned || active}
								<span class="ml-1 grid items-center justify-items-stretch font-medium">
									{#if !squad.pinned}
										<input
											class="invisible col-start-1 row-start-1 field-sizing-content w-auto min-w-0 rounded-sm bg-white px-1 py-0.5 text-center text-sm ring-1 ring-gray-200 select-text group-data-editable:visible focus:outline-none"
											type="text"
											size="1"
											name="squad-name-{index}"
											value={squad.name}
											tabindex={editable ? 0 : -1}
											onmousedown={(event) => event.stopPropagation()}
											onkeydown={(event) => event.stopPropagation()}
											oninput={(event) => handleNameInput(event, index)}
										/>
									{/if}
									<span
										class="visible col-start-1 row-start-1 px-1 py-0.5 text-center whitespace-pre group-data-editable:invisible"
									>
										{squad.name}
									</span>
								</span>
							{/if}
							{#if !squad.pinned}
								<button
									type="button"
									class="invisible flex size-6 shrink-0 items-center justify-center group-data-editable:visible"
									tabindex="-1"
									aria-label={m.squad_action_move_right()}
									onmousedown={(event) => event.stopPropagation()}
									onclick={(event) => {
										event.stopPropagation();
										moveSquad(app.deck!, 1);
									}}
								>
									<ChevronRight class="size-6" />
								</button>
							{/if}
						</div>
					{/snippet}
				</Tabs.Trigger>
			{/each}
			<Button
				variant="ghost"
				skew={false}
				class="size-12 shrink-0 text-primary hover:bg-primary/10"
				title={m.squad_name()}
				onclick={() => addSquad(app.deck!, m.squad_name())}
			>
				<CirclePlus class="size-6" />
			</Button>
		</Tabs.List>
	</Tabs.Root>
{/if}

<IconSelectorDialog
	bind:open={iconSelectorOpen}
	onSelect={(icon) => {
		const squad = app.deck?.squads[iconSelectorIndex];
		if (squad) setSquadIcon(squad, icon);
		iconSelectorOpen = false;
	}}
/>
