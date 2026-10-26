<script lang="ts">
	import { Checkbox } from '#lib/ui/checkbox';

	let {
		checked = $bindable(false),
		id,
		label,
		disabled = false,
		onCheckedChange
	}: {
		checked?: boolean;
		id?: string;
		label: string;
		disabled?: boolean;
		onCheckedChange?: (checked: boolean) => void;
	} = $props();
</script>

<!--
	Checkbox field in the app's badge visual language: skewed outlined
	container, upright content. The checkbox's ::after overlay stretches over
	the whole field so a click anywhere toggles it without extra handlers.
-->
<label
	class="relative flex h-8 w-fit -skew-x-10 cursor-pointer items-center rounded-lg border border-black/12 pr-4 pl-2 select-none aria-disabled:cursor-default aria-disabled:opacity-50"
	aria-disabled={disabled}
>
	<span class="flex skew-x-10 items-center gap-2">
		<Checkbox {id} bind:checked {disabled} {onCheckedChange} class="after:absolute after:inset-0" />
		<span class="text-sm/none">{label}</span>
	</span>
</label>
