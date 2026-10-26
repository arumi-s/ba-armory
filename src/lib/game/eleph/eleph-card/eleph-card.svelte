<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { CDN_BASE, SCHALEDB_BASE } from '#lib/config';
	import { cn, type WithElementRef } from '#lib/utils';
	import { selectOnEvent } from '#lib/ui/behaviors/select-on-event';
	import { boxWith } from 'svelte-toolbelt';
	import type { HTMLAttributes } from 'svelte/elements';
	import { AppStateContext } from '#lib/app/app.svelte';
	import { getStudent } from '#lib/data/indexes';
	import { ELIGMA_ID } from '#lib/data/enums';
	import { setElephCost, setElephRemain } from '#lib/deck/mutate';
	import { ELEPH_COST_MAX } from '#lib/deck/types';
	import StarRatingView from '#lib/ui/star-rating/star-rating.svelte';
	import { StarRatingState } from '#lib/ui/star-rating/star-rating.svelte.js';
	import ItemIcon from '#lib/game/item/item-icon/item-icon.svelte';

	let {
		id,
		class: className,
		...restProps
	}: WithElementRef<Omit<HTMLAttributes<HTMLDivElement>, 'id'>> & { id: number } = $props();

	const app = AppStateContext.get();

	const d = $derived(app.deck!.students[id]!);
	const student = $derived(getStudent(app.game!, id));
	const total = $derived(app.studentRequired.get(id)?.get(ELIGMA_ID) ?? 0);

	const costRating = StarRatingState.create({
		value: boxWith(() => d.elephCost),
		max: boxWith(() => ELEPH_COST_MAX),
		disabled: boxWith(() => false),
		onValueChange: (v) => setElephCost(d, v)
	});

	function handleRemainInput(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const value = Number.parseInt(input.value, 10);
		setElephRemain(d, Number.isFinite(value) ? value : 0);
	}

	const elephIcon = `${CDN_BASE}/images/item/icon/item_icon_secretstone.webp`;
</script>

{#if d && student}
	<div
		class={cn('flex w-60 items-center rounded-md bg-card shadow shadow-neutral-400', className)}
		{...restProps}
	>
		<ItemIcon
			{id}
			hideShadow
			hideName
			class="shrink-0 grow-0 self-stretch border-r border-gray-200"
		/>
		<div class="flex flex-col gap-1 overflow-hidden p-2">
			<div class="flex overflow-hidden border-b border-gray-200 pb-1 whitespace-nowrap">
				<a
					href={`${SCHALEDB_BASE}/?item=${encodeURIComponent(id)}`}
					target="_blank"
					rel="noopener noreferrer"
					tabindex="-1"
				>
					{student.name}
				</a>
			</div>
			<div class="cost flex flex-col items-start gap-1">
				<div class="overflow-hidden whitespace-nowrap">{m.eleph_cost()}:</div>
				<StarRatingView state={costRating} class="text-xl/none">
					{#snippet active()}
						<img src={elephIcon} class="block size-[1.15em] object-cover" alt="" />
					{/snippet}
					{#snippet inactive()}
						<img src={elephIcon} class="block size-[1.15em] object-cover grayscale" alt="" />
					{/snippet}
				</StarRatingView>
			</div>
			<div class="remain flex items-center gap-1">
				<div class="overflow-hidden whitespace-nowrap">{m.eleph_remain()}:</div>
				<input
					class="block w-full rounded border border-gray-200 p-1 leading-none"
					type="number"
					name={'remain-input-' + id}
					min="0"
					max="20"
					step="1"
					value={d.elephRemain}
					{@attach selectOnEvent('focusin')}
					oninput={handleRemainInput}
				/>
			</div>
			<div class="total flex flex-wrap items-center gap-1">
				<div class="overflow-hidden whitespace-nowrap">{m.eleph_total()}:</div>
				<div class="font-bold">{total}</div>
			</div>
		</div>
	</div>
{/if}
