<script lang="ts">
	import { HoverInputProviderState } from './hover-input.svelte.js';
	import type { HoverInputProviderProps } from './hover-input.svelte.js';

	let { children }: HoverInputProviderProps = $props();

	HoverInputProviderState.create();
</script>

{@render children?.()}
