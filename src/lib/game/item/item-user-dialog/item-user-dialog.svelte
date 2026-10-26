<script lang="ts">
	import { AppStateContext } from '#lib/app/app.svelte';
	import ItemIcon from '#lib/game/item/item-icon/item-icon.svelte';
	import StudentIcon from '#lib/game/student/student-icon/student-icon.svelte';
	import * as Dialog from '#lib/ui/dialog';

	let { open = $bindable(false), id }: { open?: boolean; id: number } = $props();

	const app = AppStateContext.get();

	const users = $derived.by(() => {
		const result: { id: number; amount: number }[] = [];
		if (!app.selectedSquad) return result;
		const counted = new Set<number>();
		for (const studentId of app.selectedSquad.students) {
			if (counted.has(studentId)) continue;
			const amount = app.studentRequired.get(studentId)?.get(id) ?? 0;
			if (amount > 0) result.push({ id: studentId, amount });
			counted.add(studentId);
		}
		return result;
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-2xl">
		<Dialog.Header>
			<Dialog.Title class="sr-only">Item usage</Dialog.Title>
		</Dialog.Header>
		<div class="-mx-3 flex items-stretch">
			<div class="flex items-center [&_button]:pointer-events-none">
				<ItemIcon {id} hideShadow hideAmount class="w-32" />
			</div>
			{#if users.length}
				<div
					class="mr-3 ml-2 flex flex-wrap items-center justify-center gap-2 border-l border-gray-200 pl-4"
				>
					{#each users as user (user.id)}
						<div class="flex flex-col gap-2">
							<StudentIcon id={user.id} class="pointer-events-none" />
							<div class="text-center text-base">{user.amount}</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
