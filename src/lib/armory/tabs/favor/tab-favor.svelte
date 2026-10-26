<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { AppStateContext } from '#lib/app/app.svelte';
	import { CheckboxField } from '#lib/ui/checkbox';
	import { Button } from '#lib/ui/button';
	import ItemIcon from '#lib/game/item/item-icon/item-icon.svelte';
	import StudentIcon from '#lib/game/student/student-icon/student-icon.svelte';
	import { FavorTabState } from './tab-favor.svelte.js';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Eraser from '@lucide/svelte/icons/eraser';

	const app = AppStateContext.get();

	const favorTab = FavorTabState.create({ app });
</script>

<div class="my-3 flex flex-wrap items-center gap-2 px-2">
	<CheckboxField
		id="favor-show-unused"
		label={m.favor_show_unused_favor()}
		bind:checked={app.deck!.options.showUnusedFavor}
	/>

	<Button
		variant="outline"
		disabled={favorTab.selectedStudentIds.length === 0}
		onclick={() => (favorTab.selectedStudentIds = [])}
	>
		<Eraser />
		{app.game?.localization.ui('selection_clear') ?? ''}
	</Button>
</div>

<div class="flex flex-col items-stretch gap-3 p-2">
	{#each favorTab.rows as row (row.id)}
		{#if row.visible}
			<div class="favor flex items-center rounded-md bg-card shadow shadow-neutral-400">
				<ItemIcon id={row.id} hideAmount hideShadow hideName class="shrink-0 grow-0" />
				<div class="flex flex-1 flex-wrap items-center gap-2 px-1 py-2">
					{#each row.tiers as tier, tierIndex (tierIndex)}
						<div class="flex items-center gap-2">
							{#if tierIndex > 0}
								<ChevronRight class="size-8 shrink-0 text-neutral-500" />
							{/if}
							<div class="flex w-8 flex-col items-center gap-1 pt-6">
								<img
									class="w-full"
									src={tier.icon}
									alt=""
									loading="lazy"
									decoding="async"
									draggable="false"
								/>
								<div class="text-center text-sm">{tier.amount}</div>
							</div>
						</div>
						{#each tier.studentIds as studentId, si (studentId + '-' + si)}
							<StudentIcon
								id={studentId}
								small
								hideType
								hideName={false}
								class="aria-selected:*:[span]:ring-4 aria-selected:*:[span]:ring-yellow-500"
								onclick={() => favorTab.toggleStudent(studentId)}
								aria-selected={favorTab.isSelected(studentId)}
							/>
						{/each}
					{/each}
				</div>
			</div>
		{/if}
	{/each}
</div>
