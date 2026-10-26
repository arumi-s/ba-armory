<script lang="ts" module>
	export type BaIconName =
		'bullet_type' | 'armor_type' | 'terrain_Street' | 'terrain_Indoor' | 'terrain_Outdoor';
</script>

<script lang="ts">
	import { cn } from '#lib/utils';

	let { name, class: className }: { name: BaIconName | (string & {}); class?: string } = $props();

	const svgClass = $derived(cn('block', className));
</script>

{#snippet bulletType(cls: string)}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 36 36"
		fill="currentColor"
		aria-hidden="true"
		class={cls}
	>
		<path d="m5 17 18 15-2 2L3 19l2-2z" />
		<path d="m4 30 6 5 5-7-5-4-6 6zM12 19l7 6 15-14-2-11-10 1-10 18z" />
	</svg>
{/snippet}

{#snippet armorType(cls: string)}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 36 36"
		fill="currentColor"
		aria-hidden="true"
		class={cls}
	>
		<path
			d="M33 7c0 24-6 26-15 29C9 33 3 29 3 7c6 0 15.19-7 15.19-7S27 7 33 7Zm-23 4.9V21c2 5 5 6 8 7.11C21 27 24 26 26 21v-9c-4 0-6-1-8-3.29C16 11 14 12 10 11.9Z"
		/>
	</svg>
{/snippet}

{#snippet terrainStreet(cls: string)}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 56 56"
		fill="currentColor"
		aria-hidden="true"
		class={cls}
	>
		<path d="M16 20V8h24v22h14v16H2V20Zm0 4H6v18h10Zm20-12H20v30h16Zm14 22H40v8h10Z" />
		<path d="M23.5 16h3v6h-3zM29.5 16h3v6h-3zM23.5 26h3v6h-3zM29.5 26h3v6h-3zM9.5 26h3v6h-3z" />
	</svg>
{/snippet}

{#snippet terrainIndoor(cls: string)}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 56 56"
		fill="currentColor"
		aria-hidden="true"
		class={cls}
	>
		<path d="m28 7 24 20-3 3-21-17L7 30l-3-3L28 7z" />
		<path d="M12 22v24h32V22h-4v20H16V22h-4z" />
		<path d="M24 24h8v4h-8zM18 34h20v3h-3v5h-3v-5h-8v5h-3v-5h-3v-3z" />
	</svg>
{/snippet}

{#snippet terrainOutdoor(cls: string)}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 56 56"
		fill="currentColor"
		aria-hidden="true"
		class={cls}
	>
		<path d="M2 46h52L40 24 28 42h4l8-12 8 12H8l14-22 12 16 2-4-14-18L2 46z" />
		<path
			d="M16 26h8v3h-8zM10 34h8v3h-8zM40 14a6 6 0 1 1-6-6 6 6 0 0 1 6 6Zm-6-3a3 3 0 1 0 3 3 3 3 0 0 0-3-3Z"
		/>
	</svg>
{/snippet}

{#if name === 'bullet_type'}
	{@render bulletType(svgClass)}
{:else if name === 'armor_type'}
	{@render armorType(svgClass)}
{:else if name === 'terrain_Street'}
	{@render terrainStreet(svgClass)}
{:else if name === 'terrain_Indoor'}
	{@render terrainIndoor(svgClass)}
{:else}
	{@render terrainOutdoor(svgClass)}
{/if}
