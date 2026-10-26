<script lang="ts" module>
	import { type WithElementRef } from '#lib/utils';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export type TierIconProps = WithElementRef<HTMLButtonAttributes> & {
		iconUrl: string;
		label: string;
		value: number;
		targetValue: number;
		max: number;
		min?: number;
		isTarget?: boolean;
		vertical?: boolean;
		typeText?: string;
		typeClass?: string;
		displayMax?: boolean;
		onSet: (value: number) => void;
	};
</script>

<script lang="ts">
	import { cn } from '#lib/utils';
	import { boxWith, mergeProps } from 'svelte-toolbelt';
	import * as HoverInput from '#lib/ui/hover-input';
	import { TierIconState } from './tier-icon.svelte.js';

	let {
		iconUrl,
		label,
		value,
		targetValue,
		max,
		min = 0,
		isTarget = false,
		vertical = false,
		typeText = '',
		typeClass = '',
		displayMax = false,
		onSet,
		class: className,
		...restProps
	}: TierIconProps = $props();

	const state = TierIconState.create({
		iconUrl: boxWith(() => iconUrl),
		label: boxWith(() => label),
		value: boxWith(() => value),
		targetValue: boxWith(() => targetValue),
		max: boxWith(() => max),
		min: boxWith(() => min),
		isTarget: boxWith(() => isTarget),
		vertical: boxWith(() => vertical),
		typeText: boxWith(() => typeText),
		typeClass: boxWith(() => typeClass),
		displayMax: boxWith(() => displayMax),
		onSet: (v) => onSet(v)
	});
</script>

<HoverInput.Trigger onNumber={(v) => state.onHoverNumber(v)}>
	{#snippet child({ props })}
		<button
			type="button"
			{...mergeProps(props, restProps, state.props)}
			class={cn(
				'relative cursor-pointer shadow shadow-neutral-400 select-none',
				state.vertical ? 'h-22.5 w-12.5' : 'h-10 w-12.5',
				state.isTarget && (state.reached ? 'ring-2 ring-yellow-400' : 'ring-2 ring-red-400'),
				className
			)}
		>
			{#if state.vertical}
				<div class="overflow-hidden text-center text-2xs/loose whitespace-nowrap italic">
					{state.typeText}
				</div>
				<img
					class={cn('aspect-square w-full object-contain', state.typeClass)}
					src={state.iconUrl}
					alt=""
					loading="lazy"
					decoding="async"
					draggable="false"
				/>
				<div class="text-center font-bold">{state.caption}</div>
			{:else}
				<img
					class={cn('w-full object-cover', state.value === state.min && 'opacity-50')}
					src={state.iconUrl}
					alt=""
					loading="lazy"
					decoding="async"
					draggable="false"
				/>
				{#if state.value !== state.min}
					<div
						class="absolute bottom-0 left-0 m-0.5 -skew-x-10 rounded-md border border-current bg-white px-1 py-px text-xs/none font-bold text-sky-600"
					>
						{state.caption}
					</div>
				{/if}
			{/if}
		</button>
	{/snippet}
</HoverInput.Trigger>
