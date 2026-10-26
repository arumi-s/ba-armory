<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { LANGUAGES, REGIONS, type LangId, type RegionId } from '#lib/config';

	import { AppStateContext } from '#lib/app/app.svelte';
	import { Button } from '#lib/ui/button';
	import * as Dialog from '#lib/ui/dialog';
	import * as DropdownMenu from '#lib/ui/dropdown-menu';
	import { LANGUAGE_CODES } from '#lib/config';

	import SettingsIcon from '@lucide/svelte/icons/settings';
	import SaveIcon from '@lucide/svelte/icons/save';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const app = AppStateContext.get();

	const languageLabels: Record<LangId, string> = {
		cn: '简体中文',
		en: 'English',
		jp: '日本語',
		tw: '繁體中文'
	};

	let selectedLanguage = $state<LangId>('en');
	let selectedRegion = $state<RegionId>(0);

	$effect(() => {
		if (open) {
			selectedLanguage = app.language;
			selectedRegion = app.region;
		}
	});

	async function handleClickSave() {
		if (selectedLanguage !== app.language) {
			await app.switchLanguage(selectedLanguage);
		}
		if (selectedRegion !== app.region) {
			app.switchRegion(selectedRegion);
		}
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2 text-xl/8">
				<SettingsIcon />
				{m.action_setting()}
			</Dialog.Title>
		</Dialog.Header>

		<div class="flex flex-col gap-3">
			<div class="flex items-center gap-3">
				<div class="w-56">{app.game?.localization.ui('settings_language') ?? 'Language'}</div>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outline">
								<span lang={LANGUAGE_CODES[selectedLanguage]}
									>{languageLabels[selectedLanguage]}</span
								>
								<ChevronDownIcon />
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						{#each LANGUAGES as language (language)}
							<DropdownMenu.Item
								onclick={() => (selectedLanguage = language)}
								lang={LANGUAGE_CODES[language]}
							>
								{languageLabels[language]}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>

			<div class="flex items-center gap-3">
				<div class="w-56">{app.game?.localization.ui('settings_server') ?? 'Server'}</div>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outline">
								{app.game?.localization.serverName(selectedRegion) ?? String(selectedRegion)}
								<ChevronDownIcon />
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						{#each REGIONS as region (region)}
							<DropdownMenu.Item onclick={() => (selectedRegion = region)}>
								{app.game?.localization.serverName(region) ?? String(region)}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>

			<div class="flex items-center justify-end gap-3">
				<Button onclick={handleClickSave}>
					<SaveIcon />
					{m.setting_save()}
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
