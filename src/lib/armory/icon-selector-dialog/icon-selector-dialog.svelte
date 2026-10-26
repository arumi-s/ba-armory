<script lang="ts">
	import { AppStateContext } from '#lib/app/app.svelte';
	import * as Dialog from '#lib/ui/dialog';

	let {
		open = $bindable(false),
		onSelect
	}: {
		open?: boolean;
		onSelect: (icon: string) => void;
	} = $props();

	const app = AppStateContext.get();

	function handleClickIcon(icon: string) {
		onSelect(icon);
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="max-h-[calc(100vh-2.25rem)] w-[80vw] max-w-[calc(100vw-1rem)] overflow-y-auto rounded-lg sm:max-w-[80vw]"
	>
		<Dialog.Header>
			<Dialog.Title class="sr-only">Icons</Dialog.Title>
		</Dialog.Header>
		<div class="my-3 flex flex-wrap items-center justify-center gap-1">
			{#each app.game?.icons ?? [] as icon (icon)}
				<button type="button" class="m-1" title={icon} onclick={() => handleClickIcon(icon)}>
					<img
						class="size-8 rounded-full bg-slate-500 object-cover shadow shadow-neutral-400"
						src={icon}
						alt=""
						loading="lazy"
						decoding="async"
						draggable="false"
					/>
				</button>
			{/each}
		</div>
	</Dialog.Content>
</Dialog.Root>
