<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { Path } from '$app/types';
	import { resolve } from '$app/paths';
	import { locales, localizeHref } from '#lib/paraglide/runtime.js';
	import { m } from '#lib/paraglide/messages.js';
	import { toast } from 'svelte-sonner';

	import { AppState, AppStateContext } from '#lib/app/app.svelte';
	import * as HoverInput from '#lib/ui/hover-input';
	import { Toaster } from '#lib/ui/sonner';
	import { Button } from '#lib/ui/button';
	import * as Tooltip from '#lib/ui/tooltip';
	import ExportDialog from '#lib/app/export-dialog/export-dialog.svelte';
	import SettingsDialog from '#lib/app/settings-dialog/settings-dialog.svelte';

	import ImportExportIcon from '@lucide/svelte/icons/arrow-right-left';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import SaveIcon from '@lucide/svelte/icons/save';

	let { children } = $props();

	const app = AppStateContext.set(new AppState());

	let exportOpen = $state(false);
	let settingOpen = $state(false);

	const alternates = $derived(
		locales.map((locale) => ({
			locale,
			href: resolve(localizeHref(page.url.pathname, { locale }) as Path)
		}))
	);

	onMount(() => {
		void app.init();
	});

	function handleClickSave() {
		app.save();
		toast.success(m.action_saved(), { duration: 1000 });
	}
</script>

<svelte:head>
	<title>{m.app_title()}</title>
	<meta name="description" content={m.app_desc()} />
</svelte:head>

{#key app.language}
	<div class="flex min-h-screen flex-col">
		<HoverInput.Provider>
			<header
				class="sticky top-0 z-20 bg-primary text-primary-foreground shadow-md shadow-neutral-400"
			>
				<div class="mx-4 my-0 flex items-center gap-2 py-2 text-lg/none font-medium">
					<img src="/assets/icons/icon-32x32.png" width="32" height="32" alt={m.app_title()} />
					<div class="text-lg/none">{m.app_title()}</div>
					<div class="ml-auto"></div>
					<Tooltip.Provider delayDuration={300}>
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props })}
									<Button
										{...props}
										variant="ghost"
										size="icon"
										class="text-primary-foreground hover:bg-primary/80"
										onclick={() => (exportOpen = true)}
									>
										<ImportExportIcon />
									</Button>
								{/snippet}
							</Tooltip.Trigger>
							<Tooltip.Content>{m.action_export()}</Tooltip.Content>
						</Tooltip.Root>
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props })}
									<Button
										{...props}
										variant="ghost"
										size="icon"
										class="text-primary-foreground hover:bg-primary/80"
										onclick={() => (settingOpen = true)}
									>
										<SettingsIcon />
									</Button>
								{/snippet}
							</Tooltip.Trigger>
							<Tooltip.Content>{m.action_setting()}</Tooltip.Content>
						</Tooltip.Root>
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props })}
									<Button
										{...props}
										variant="ghost"
										size="icon"
										class="relative text-primary-foreground hover:bg-primary/80"
										onclick={handleClickSave}
									>
										<SaveIcon />
										{#if app.dirty}
											<span
												class="absolute top-0 left-full size-2 -translate-1/2 rounded-full bg-accent"
												aria-hidden="true"
											></span>
										{/if}
									</Button>
								{/snippet}
							</Tooltip.Trigger>
							<Tooltip.Content>{m.action_save()}</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				</div>
			</header>

			<main class="relative m-4">
				{@render children()}
			</main>

			<footer class="mt-auto flex items-end gap-4 bg-neutral-200 px-8 py-6 text-neutral-500">
				<ul class="space-y-1">
					<li>{m.app_desc()}</li>
					<li>
						{m.footer_1_start()}<a
							class="font-bold"
							href="https://pcredivewiki.tw/Armory"
							target="_blank"
							rel="noopener noreferrer">蘭德索爾圖書館</a
						>{m.footer_1_end()}
					</li>
					<li>
						{m.footer_2_start()}<a
							class="font-bold"
							href="https://github.com/lonqie/SchaleDB"
							target="_blank"
							rel="noopener noreferrer">SchaleDB</a
						>{m.footer_2_end()}
					</li>
					<li>{m.footer_3_start()}{m.footer_3_end()}</li>
				</ul>
				<div class="ml-auto">
					<a
						class="font-bold"
						href="https://github.com/arumi-s/ba-armory"
						target="_blank"
						rel="noopener noreferrer">GitHub</a
					>
				</div>
			</footer>
		</HoverInput.Provider>
	</div>
{/key}

<ExportDialog bind:open={exportOpen} />
<SettingsDialog bind:open={settingOpen} />

<Toaster position="top-center" duration={1000} />

<!-- block context menus in production (right-click is a decrement gesture) -->
<svelte:document
	oncontextmenu={(event) => {
		if (import.meta.env.PROD) event.preventDefault();
	}}
/>

<div style="display:none">
	{#each alternates as alternate (alternate.locale)}
		<a href={alternate.href}>{alternate.locale}</a>
	{/each}
</div>
