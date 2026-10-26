<script lang="ts">
	import * as HoverInput from '#lib/ui/hover-input';
	import TierIcon from './tier-icon.svelte';
	import type { TierIconProps } from './tier-icon.svelte';

	let props: TierIconProps = $props();
</script>

<HoverInput.Provider>
	<TierIcon {...props} />
</HoverInput.Provider>
