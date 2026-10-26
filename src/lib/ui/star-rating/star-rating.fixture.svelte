<script lang="ts">
	import StarRatingView from './star-rating.svelte';
	import type { StarRatingState } from './star-rating.svelte.js';
	import Star from '@lucide/svelte/icons/star';

	let { state, onkeydown }: { state: StarRatingState; onkeydown?: (event: KeyboardEvent) => void } =
		$props();
</script>

<StarRatingView {state} {onkeydown}>
	{#snippet active()}
		<Star class="block size-[1em] text-yellow-500" fill="currentColor" />
	{/snippet}
	{#snippet inactive()}
		<Star class="block size-[1em] text-zinc-400" />
	{/snippet}
</StarRatingView>
