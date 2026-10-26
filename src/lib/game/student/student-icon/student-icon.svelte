<script lang="ts">
	import { cn, type WithElementRef } from '#lib/utils';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { AppStateContext } from '#lib/app/app.svelte';
	import {
		adaptationIconUrl,
		getBattleAdaptation,
		getStudent,
		studentCollectionTextureUrl
	} from '#lib/data/indexes';
	import BaIcons from '#lib/game/ba-icons/ba-icons.svelte';

	let {
		id,
		terrain,
		small = false,
		hideType = false,
		hideName = true,
		class: className,
		...restProps
	}: WithElementRef<Omit<HTMLButtonAttributes, 'id'>> & {
		id: number;
		terrain?: string;
		small?: boolean;
		hideType?: boolean;
		hideName?: boolean;
	} = $props();

	const app = AppStateContext.get();

	const student = $derived(getStudent(app.game!, id));
	const adaptation = $derived(terrain ? getBattleAdaptation(student!, terrain) : null);
</script>

{#if student}
	<!-- The interactive element IS the root: consumer class/onclick/ring land here. -->
	<button
		type="button"
		title={student.name}
		class={cn(
			'flex cursor-pointer flex-col items-center gap-2 select-none',
			small ? 'w-18' : 'w-25',
			className
		)}
		{...restProps}
	>
		<span
			class={cn(
				'relative block rounded-full shadow shadow-neutral-400 transition-shadow duration-75 active:shadow-none',
				small ? 'size-18' : 'size-25'
			)}
		>
			<img
				class="size-full rounded-full bg-slate-500 object-cover"
				src={studentCollectionTextureUrl(student.id)}
				alt={student.name}
				loading="lazy"
				decoding="async"
				draggable="false"
			/>
			{#if !hideType}
				<div
					class={cn(
						'absolute -top-0.5 -left-0.5 rounded-full p-1.5 leading-none text-white',
						`bg-${student.bulletType.toLowerCase()}`
					)}
				>
					<BaIcons name="bullet_type" class="size-4" />
				</div>
				<div
					class={cn(
						'absolute -right-0.5 -bottom-0.5 rounded-full p-1.5 leading-none text-white',
						`bg-${student.armorType.toLowerCase()}`
					)}
				>
					<BaIcons name="armor_type" class="size-4" />
				</div>
			{/if}
			{#if adaptation !== null}
				<img
					class="absolute -top-0.5 -right-0.5 size-7.5"
					src={adaptationIconUrl(adaptation)}
					alt=""
					loading="lazy"
					decoding="async"
					draggable="false"
					tabindex="-1"
				/>
			{/if}
		</span>
		{#if !hideName}
			<div
				class={cn(
					'w-full overflow-hidden text-center whitespace-nowrap text-neutral-500',
					small ? 'text-xs/none' : 'text-sm/none'
				)}
			>
				{student.name}
			</div>
		{/if}
	</button>
{/if}
