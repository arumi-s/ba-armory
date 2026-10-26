<script lang="ts">
	import { HoverInputProvider, HoverInputTrigger } from './index.js';

	// Arrays are passed in by reference; handlers push committed numbers into them.
	let {
		plain = [],
		delegated = [],
		nested = []
	}: {
		plain?: number[];
		delegated?: number[];
		nested?: number[];
	} = $props();

	// Fixed positions keep elementFromPoint targets deterministic across runs.
	let showRemovable = $state(true);
</script>

<HoverInputProvider>
	<!-- default branch: the component's own div is the hover target -->
	<HoverInputTrigger
		onNumber={(v) => plain.push(v)}
		data-testid="hover-plain"
		style="position: fixed; top: 0; left: 0; width: 120px; height: 40px"
	>
		{#snippet children({ onNumber })}
			<span
				data-testid="hover-plain-inner"
				style="position: absolute; top: 0; left: 0; width: 20px; height: 20px"
			></span>
			<button data-testid="hover-plain-emit" onclick={() => onNumber(9)}>emit</button>
		{/snippet}
	</HoverInputTrigger>

	<!-- child branch: props delegated onto consumer markup -->
	<HoverInputTrigger onNumber={(v) => delegated.push(v)}>
		{#snippet child({ props, onNumber })}
			<button
				{...props}
				data-testid="hover-delegated"
				style="position: fixed; top: 50px; left: 0; width: 120px; height: 30px"
				onclick={() => onNumber(9)}
			>
				delegated
			</button>
		{/snippet}
	</HoverInputTrigger>

	{#if showRemovable}
		<HoverInputTrigger
			onNumber={(v) => plain.push(v)}
			data-testid="hover-removable"
			style="position: fixed; top: 90px; left: 0; width: 120px; height: 30px"
		>
			removable
		</HoverInputTrigger>
	{/if}
	<button
		data-testid="hover-toggle"
		style="position: fixed; top: 130px; left: 0"
		onclick={() => (showRemovable = !showRemovable)}
	>
		toggle
	</button>

	<input
		data-testid="hover-editable"
		style="position: fixed; top: 170px; left: 0; width: 120px; height: 24px"
	/>

	<!-- independent second instance -->
	<HoverInputProvider>
		<HoverInputTrigger
			onNumber={(v) => nested.push(v)}
			data-testid="hover-nested"
			style="position: fixed; top: 210px; left: 0; width: 120px; height: 30px"
		>
			nested
		</HoverInputTrigger>
	</HoverInputProvider>
</HoverInputProvider>
