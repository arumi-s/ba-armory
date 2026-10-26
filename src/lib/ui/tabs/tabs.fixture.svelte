<script lang="ts">
	import * as Tabs from './index.js';

	let {
		values = ['One', 'Two', 'Three'],
		value = $bindable('One'),
		width = '',
		onValueChange
	}: {
		values?: string[];
		value?: string;
		width?: string;
		onValueChange?: (value: string) => void;
	} = $props();
</script>

<div class={width}>
	<Tabs.Root bind:value {onValueChange}>
		<Tabs.List>
			{#each values as entry (entry)}
				<Tabs.Trigger value={entry}>{entry}</Tabs.Trigger>
			{/each}
		</Tabs.List>
	</Tabs.Root>
</div>
