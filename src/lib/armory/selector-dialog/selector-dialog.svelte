<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { cn } from '#lib/utils';
	import { AppStateContext } from '#lib/app/app.svelte';
	import { toggleInArray } from '#lib/deck/mutate';
	import { CheckboxField } from '#lib/ui/checkbox';
	import * as Dialog from '#lib/ui/dialog';
	import { Separator } from '#lib/ui/separator';
	import StudentIcon from '#lib/game/student/student-icon/student-icon.svelte';
	import BaIcons from '#lib/game/ba-icons/ba-icons.svelte';
	import { SelectorState } from './selector-dialog.svelte.js';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const app = AppStateContext.get();

	const selector = SelectorState.create({ app });

	const filterGroups = $derived([
		{
			key: 'filterBulletType',
			options: ['Explosion', 'Pierce', 'Mystic', 'Sonic'].map((id) => ({
				id,
				label: app.game?.localization.bulletType(id) ?? id
			})),
			selected: app.deck?.options.filterBulletType ?? [],
			toggle: (id: string) => app.deck && toggleInArray(app.deck.options.filterBulletType, id)
		},
		{
			key: 'filterArmorType',
			options: ['LightArmor', 'HeavyArmor', 'CompositeArmor', 'Unarmed', 'ElasticArmor'].map(
				(id) => ({
					id,
					label: app.game?.localization.armorType(id) ?? id
				})
			),
			selected: app.deck?.options.filterArmorType ?? [],
			toggle: (id: string) => app.deck && toggleInArray(app.deck.options.filterArmorType, id)
		},
		{
			key: 'filterSquadType',
			options: ['Main', 'Support'].map((id) => ({
				id,
				label: app.game?.localization.squadType(id) ?? id
			})),
			selected: app.deck?.options.filterSquadType ?? [],
			toggle: (id: string) => app.deck && toggleInArray(app.deck.options.filterSquadType, id)
		},
		{
			key: 'filterTerrain',
			options: (['Street', 'Outdoor', 'Indoor'] as const).map((id) => ({
				id,
				label: app.game?.localization.adaptationType(id) ?? id
			})),
			selected: app.deck?.options.filterTerrain ?? [],
			toggle: (id: string) => app.deck && toggleInArray(app.deck.options.filterTerrain, id)
		}
	]);

	function handleClickStudent(id: number) {
		selector.addStudent(id);
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="flex h-[calc(100vh-2.25rem)] w-[80vw] max-w-[calc(100vw-1rem)] flex-col rounded-lg sm:max-w-[80vw]"
	>
		<Dialog.Header>
			<Dialog.Title class="text-xl/8">{app.game?.localization.ui('students') ?? ''}</Dialog.Title>
		</Dialog.Header>

		<div class="my-1 flex flex-wrap items-center gap-2 px-2">
			<div class="mr-auto flex flex-wrap items-center justify-start gap-2">
				<CheckboxField
					id="selector-assist"
					label={m.selector_is_assist_students()}
					bind:checked={app.deck!.options.isAssistStudents}
				/>
			</div>
			<div class="ml-auto flex flex-wrap items-center justify-end gap-2">
				<CheckboxField
					id="selector-show-name"
					label={m.selector_show_student_name()}
					bind:checked={app.deck!.options.showStudentName}
				/>
				<CheckboxField
					id="selector-show-duplicated"
					label={m.selector_show_duplicated_students()}
					bind:checked={app.deck!.options.showDuplicatedStudents}
				/>
				<CheckboxField
					id="selector-show-future"
					label={m.selector_show_future_students()}
					bind:checked={app.deck!.options.showFutureStudents}
				/>
			</div>
		</div>

		<div class="my-1 flex flex-wrap items-center gap-2 px-2">
			{#each filterGroups as group (group.key)}
				<div class="flex -space-x-px">
					{#each group.options as option (option.id)}
						{@const selected = group.selected.includes(option.id)}
						{@const colorId = (group.key === 'filterTerrain' ? 'Terrain' : option.id).toLowerCase()}
						<button
							type="button"
							aria-pressed={selected}
							class={cn(
								'-skew-x-10 cursor-pointer rounded-none border px-4 py-2 text-sm/5 select-none first:rounded-l last:rounded-r',
								selected
									? `bg-${colorId} border-r-white border-l-white text-white`
									: `border-${colorId} bg-background text-${colorId} hover:bg-muted`
							)}
							onclick={() => group.toggle(option.id)}
						>
							<span class="flex skew-x-10 items-center gap-2">
								{#if group.key === 'filterTerrain'}
									<BaIcons name={`terrain_${option.id}`} class="size-5" />
								{/if}
								{option.label}
							</span>
						</button>
					{/each}
				</div>
			{/each}
		</div>

		<Separator />

		<div class="flex-1 overflow-y-auto">
			<div class="my-3 flex flex-wrap items-center justify-center gap-2">
				{#each selector.missingStudents as id (id)}
					<StudentIcon
						{id}
						terrain={app.selectedSquad?.terrain}
						hideName={!app.deck?.options.showStudentName}
						onclick={() => handleClickStudent(id)}
					/>
				{/each}
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
