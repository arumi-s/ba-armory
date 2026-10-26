<script lang="ts">
	import { cn } from '#lib/utils';
	import { AppStateContext } from '#lib/app/app.svelte';
	import { setSquadOrder } from '#lib/deck/mutate';
	import { sortable } from '#lib/ui/behaviors/sortable';
	import StudentCard from '#lib/game/student/student-card/student-card.svelte';

	const app = AppStateContext.get();

	const squad = $derived(app.selectedSquad);

	const keyedStudents = $derived.by(() => {
		const occurrences = new Map<number, number>();
		return (squad?.students ?? []).map((id) => {
			const occurrence = occurrences.get(id) ?? 0;
			occurrences.set(id, occurrence + 1);
			return { id, key: occurrence === 0 ? String(id) : `${id}-${occurrence}` };
		});
	});
</script>

<div
	class={cn(
		'my-3 flex flex-wrap justify-center gap-4',
		squad && squad.students.length === 0 && 'min-h-72',
		squad?.bounded && 'mx-auto max-w-bounded'
	)}
	{@attach sortable({
		handle: 'img.cursor-grab',
		onUpdate: (from, to) => squad && setSquadOrder(squad, from, to)
	})}
>
	{#each keyedStudents as entry (entry.key)}
		<StudentCard id={entry.id} terrain={squad?.terrain} folded={squad?.folded ?? false} />
	{/each}
</div>
