<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { toast } from 'svelte-sonner';

	import { AppStateContext } from '#lib/app/app.svelte';
	import { importDeckString } from '#lib/deck/persist';
	import { Button } from '#lib/ui/button';
	import { Input } from '#lib/ui/input';
	import { Separator } from '#lib/ui/separator';
	import * as Dialog from '#lib/ui/dialog';

	import ArrowRightLeftIcon from '@lucide/svelte/icons/arrow-right-left';
	import FileUpIcon from '@lucide/svelte/icons/file-up';
	import FileDownIcon from '@lucide/svelte/icons/file-down';
	import LinkIcon from '@lucide/svelte/icons/link';
	import { selectOnEvent } from '#lib/ui/behaviors/select-on-event.ts';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const app = AppStateContext.get();

	let data = $state('');
	let link = $state('');
	let error = $state(false);
	let remoteLoading = $state(false);
	let remoteError = $state('');

	function handleClickExport() {
		error = false;
		data = app.exportString();
	}

	function handleClickImport() {
		error = false;
		try {
			const json = importDeckString(data);
			app.applyImportedDeck(json);
			toast.success(m.action_saved(), { duration: 1000 });
		} catch {
			error = true;
		}
	}

	async function handleClickSaveRemote() {
		if (remoteLoading) return;
		remoteLoading = true;
		remoteError = '';
		link = '';
		try {
			link = await app.saveRemote();
		} catch (e: unknown) {
			if (e instanceof Error) remoteError = e.message;
		}
		remoteLoading = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-xl">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2 text-xl/8">
				<ArrowRightLeftIcon />
				{m.action_export()}
			</Dialog.Title>
		</Dialog.Header>

		<div class="flex flex-col gap-3">
			<Input bind:value={data} placeholder={m.action_import()} {@attach selectOnEvent('click')} />
			{#if error}
				<div class="font-medium text-destructive">{m.import_error()}</div>
			{/if}

			<div class="flex flex-wrap items-center gap-2 px-2">
				<div class="mr-auto flex flex-wrap items-center justify-start gap-2">
					<Button variant="outline" onclick={handleClickExport}>
						<FileUpIcon />
						{m.action_export()}
					</Button>
				</div>
				<div class="ml-auto flex flex-wrap items-center justify-end gap-2">
					<Button variant="outline" onclick={handleClickImport}>
						<FileDownIcon />
						{m.action_import()}
					</Button>
				</div>
			</div>

			<Separator />

			<div class="flex flex-wrap items-center gap-2 px-2">
				<Button variant="outline" disabled={remoteLoading} onclick={handleClickSaveRemote}>
					<LinkIcon />
					{m.action_save_remote()}
				</Button>
			</div>
			{#if link}
				<Input bind:value={link} readonly {@attach selectOnEvent('click')} />
			{/if}
			{#if remoteError}
				<div class="px-2 font-medium text-destructive">{remoteError}</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
