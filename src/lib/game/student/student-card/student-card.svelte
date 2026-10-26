<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { cn, type WithElementRef } from '#lib/utils';
	import { selectOnEvent } from '#lib/ui/behaviors/select-on-event';
	import { boxWith } from 'svelte-toolbelt';
	import type { HTMLAttributes } from 'svelte/elements';
	import { AppStateContext } from '#lib/app/app.svelte';
	import { adaptationIconUrl, schoolIconUrl, studentCollectionTextureUrl } from '#lib/data/indexes';
	import StarRatingView from '#lib/ui/star-rating/star-rating.svelte';
	import TierIcon from '#lib/ui/tier-icon/tier-icon.svelte';
	import BaIcons from '#lib/game/ba-icons/ba-icons.svelte';
	import { StudentCardState } from './student-card.svelte.js';
	import * as Tooltip from '#lib/ui/tooltip';
	import { Button } from '#lib/ui/button';
	import Star from '@lucide/svelte/icons/star';
	import Ban from '@lucide/svelte/icons/ban';
	import ChevronsUp from '@lucide/svelte/icons/chevrons-up';
	import LocateFixed from '@lucide/svelte/icons/locate-fixed';
	import LifeBuoy from '@lucide/svelte/icons/life-buoy';
	import { SCHALEDB_BASE } from '#lib/config.js';

	type StudentCardProps = WithElementRef<Omit<HTMLAttributes<HTMLDivElement>, 'id'>> & {
		id: number;
		terrain?: string;
		folded?: boolean;
	};

	let { id, terrain, folded = false, class: className, ...restProps }: StudentCardProps = $props();

	const state = StudentCardState.create({
		id: boxWith(() => id),
		terrain: boxWith(() => terrain),
		folded: boxWith(() => folded),
		app: AppStateContext.get()
	});
</script>

{#if state.d && state.student}
	{@const d = state.d}
	{@const student = state.student}
	<div
		class={cn('block w-60 overflow-hidden rounded-md bg-card shadow shadow-neutral-400', className)}
		{...restProps}
	>
		<div
			class={cn('relative flex flex-row gap-2 p-2', state.isAlt ? 'bg-yellow-100' : 'bg-sky-100')}
		>
			<img
				class="size-12.5 shrink-0 cursor-grab rounded-full object-cover"
				src={studentCollectionTextureUrl(student.id)}
				alt={student.name}
				loading="lazy"
				decoding="async"
				draggable="false"
			/>
			<div class="z-10 flex flex-1 flex-col justify-between overflow-hidden">
				<div class="flex items-center gap-1">
					<a
						class="block overflow-hidden text-lg/6 font-semibold text-ellipsis whitespace-nowrap"
						href={`${SCHALEDB_BASE}/student/${encodeURIComponent(student.pathName)}`}
						target="_blank"
						rel="noopener noreferrer"
						tabindex="-1"
					>
						{student.name}
					</a>
					<div class="ml-auto {state.folded ? '' : 'hidden'}">
						<Tooltip.Provider>
							<Tooltip.Root>
								<Tooltip.Trigger>
									{#snippet child({ props })}
										<Button
											{...props}
											variant="destructive"
											size="icon-xs"
											onclick={() => state.removeFromSquad()}
										>
											<Ban />
										</Button>
									{/snippet}
								</Tooltip.Trigger>
								<Tooltip.Content>{m.student_action_remove()}</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
					</div>
				</div>
				<div class="flex items-center gap-1 select-none">
					<div
						class={cn('rounded p-1 text-white', `bg-${student.bulletType.toLowerCase()}`)}
						title={state.game?.localization.bulletType(student.bulletType)}
					>
						<BaIcons name="bullet_type" class="size-4" />
					</div>
					<div
						class={cn('rounded p-1 text-white', `bg-${student.armorType.toLowerCase()}`)}
						title={state.game?.localization.armorType(student.armorType)}
					>
						<BaIcons name="armor_type" class="size-4" />
					</div>
					<div
						class={cn(
							'rounded px-2 py-1 text-xs/4 text-white',
							`bg-${student.squadType.toLowerCase()}`
						)}
					>
						{state.game?.localization.squadType(student.squadType)}
					</div>
					{#if state.adaptation !== null}
						<img
							class="ml-auto h-6"
							src={adaptationIconUrl(state.adaptation)}
							alt=""
							loading="lazy"
							decoding="async"
							draggable="false"
						/>
					{/if}
				</div>
			</div>
			<img
				class="pointer-events-none absolute top-0 right-0 h-full opacity-15 invert"
				src={schoolIconUrl(student.school)}
				alt=""
				loading="lazy"
				decoding="async"
				draggable="false"
			/>
		</div>

		{#if !state.folded}
			<div class="grid gap-2 p-2">
				<div class="grid grid-cols-[1fr_auto_auto] items-center gap-2">
					<div class="flex items-baseline">
						<div class="text-sm/4">Lv.</div>
						<input
							class="block w-6 grow [appearance:textfield] text-base/5 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
							type="number"
							name="stats-level-{state.id}"
							min="1"
							max={state.game?.studentLevelMax}
							step="1"
							value={state.levelValue}
							{@attach selectOnEvent('focusin')}
							oninput={(event) => state.onLevelInput(event)}
						/>
					</div>
					<StarRatingView
						state={state.starRating}
						class={state.isTarget
							? state.starReached
								? 'ring-2 ring-yellow-400'
								: 'ring-2 ring-red-400'
							: ''}
					>
						{#snippet active()}
							<Star class="block size-4.5 text-yellow-500" fill="currentColor" />
						{/snippet}
						{#snippet inactive()}
							<Star class="block size-4.5 text-zinc-400" />
						{/snippet}
					</StarRatingView>
					<StarRatingView
						state={state.weaponRating}
						class={state.isTarget
							? state.weaponReached
								? 'ring-2 ring-yellow-400'
								: 'ring-2 ring-red-400'
							: ''}
					>
						{#snippet active()}
							<Star class="block size-4.5 text-sky-400" fill="currentColor" />
						{/snippet}
						{#snippet inactive()}
							<Star class="block size-4.5 text-zinc-400" />
						{/snippet}
					</StarRatingView>
				</div>
				<div class="grid grid-cols-4 gap-2">
					{#each state.skills as skill, index (skill.key)}
						<TierIcon
							iconUrl={skill.iconUrl}
							label={skill.label}
							value={skill.value}
							targetValue={skill.targetValue}
							max={skill.max}
							min={1}
							isTarget={state.isTarget}
							vertical={true}
							displayMax={true}
							typeText={skill.typeText}
							typeClass={skill.typeClass}
							onSet={(v) => state.setSkillLevel(index, v)}
						/>
					{/each}
				</div>
				<div class="grid grid-cols-4 gap-2">
					{#each state.equipments as equipment, index (index)}
						<TierIcon
							iconUrl={equipment.iconUrl}
							label={equipment.label}
							value={equipment.value}
							targetValue={equipment.targetValue}
							max={equipment.max}
							isTarget={state.isTarget}
							onSet={(v) => state.setEquipmentTierAt(index, v)}
						/>
					{/each}
					{#if state.gear}
						<TierIcon
							iconUrl={state.gear.iconUrl}
							label={state.gear.label}
							value={state.gear.value}
							targetValue={state.gear.targetValue}
							max={state.gear.max}
							isTarget={state.isTarget}
							onSet={(v) => state.setGearLevel(v)}
						/>
					{/if}
				</div>
			</div>
		{/if}

		{#if !state.folded}
			<div class="flex gap-2 p-2">
				<Button
					variant="destructive"
					size="xs"
					class="mr-auto min-w-min"
					onclick={() => state.removeFromSquad()}
				>
					<Ban />
					{m.student_action_remove()}
				</Button>
				{#if state.isAlt}
					<Button variant="ghost" size="xs" class="min-w-min" onclick={() => state.maximize()}>
						<ChevronsUp />
						{m.student_action_maximize()}
					</Button>
					<Button variant="accent-text" size="xs" class="pointer-events-none min-w-min">
						<LifeBuoy />
						{m.student_action_assist()}
					</Button>
				{:else}
					<Button
						variant="ghost"
						size="xs"
						class="min-w-min"
						disabled={state.isUpgraded}
						onclick={() => state.upgradeEquipments()}
					>
						<ChevronsUp />
						{m.student_action_upgrade()}
					</Button>
					<Button
						variant={d.isTarget ? 'accent-flat' : 'ghost'}
						size="xs"
						class="min-w-min"
						onclick={() => state.toggleTarget()}
					>
						<LocateFixed />
						{m.student_action_target()}
					</Button>
				{/if}
			</div>
		{/if}
	</div>
{/if}
