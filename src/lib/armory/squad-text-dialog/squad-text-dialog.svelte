<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { AppStateContext } from '#lib/app/app.svelte';
	import { squadText } from '#lib/deck/compute';
	import type { SquadTextStudentView } from '#lib/deck/compute';
	import { getStudent } from '#lib/data/indexes';
	import { skillLevelMaxOf } from '#lib/deck/types';
	import { CheckboxField } from '#lib/ui/checkbox';
	import * as Dialog from '#lib/ui/dialog';
	import { Separator } from '#lib/ui/separator';
	import { Textarea } from '#lib/ui/textarea';
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
	import { selectOnEvent } from '#lib/ui/behaviors/select-on-event.ts';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const app = AppStateContext.get();

	const students = $derived.by(() => {
		if (!app.deck || !app.game || !app.selectedSquad) return [];
		const views: SquadTextStudentView[] = [];
		for (const studentId of app.selectedSquad.students) {
			const entry = app.deck.students[studentId];
			const student = getStudent(app.game, studentId);
			if (!entry || !student) continue;
			views.push({
				name: student.name,
				isAlt: entry.id > 1_000_000,
				star: entry.star,
				level: entry.level,
				skillLevels: entry.skills.map((skill) => skill.level),
				skillLevelsMax: entry.skills.map((_, index) => skillLevelMaxOf(student, index)),
				equipmentTiers: entry.equipments.map((equipment) => equipment.tier),
				weapon: entry.weapon,
				gear: entry.gear,
				starMax: 5
			});
		}
		return views;
	});

	const text = $derived.by(() => {
		if (!app.deck || !app.game) return '';
		return squadText(
			students,
			{
				showStar: app.deck.options.showSquadTextStar,
				showLevel: app.deck.options.showSquadTextLevel,
				showSkills: app.deck.options.showSquadTextSkills,
				showEquipments: app.deck.options.showSquadTextEquipments,
				showWeapon: app.deck.options.showSquadTextWeapon,
				showGear: app.deck.options.showSquadTextGear
			},
			{
				assist: m.student_action_assist(),
				weapon: app.game.localization.ui('ex_weapon'),
				gear: app.game.localization.ui('ex_gear')
			}
		);
	});

	const labels = $derived([
		{ key: 'showSquadTextStar', label: '★' },
		{ key: 'showSquadTextLevel', label: 'Lv.' },
		{ key: 'showSquadTextSkills', label: app.game?.localization.ui('skills') ?? '' },
		{
			key: 'showSquadTextEquipments',
			label: app.game?.localization.ui('student_gear_short') ?? ''
		},
		{ key: 'showSquadTextWeapon', label: app.game?.localization.ui('ex_weapon') ?? '' },
		{ key: 'showSquadTextGear', label: app.game?.localization.ui('ex_gear') ?? '' }
	] as const);
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="w-fit max-w-[80vw] min-w-md rounded-lg sm:max-w-[80vw]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2 text-xl/8">
				<ClipboardList />
				{m.squad_action_text()}
			</Dialog.Title>
		</Dialog.Header>

		<div class="flex flex-wrap items-center gap-2 px-2">
			{#each labels as option (option.key)}
				<CheckboxField
					id={`squad-text-${option.key}`}
					label={option.label}
					bind:checked={app.deck!.options[option.key]}
				/>
			{/each}
		</div>

		<Separator />

		<Textarea
			class="field-sizing-content resize-none font-mono"
			name="text-input_text"
			readonly
			rows={students.length + 1}
			value={text}
			{@attach selectOnEvent('click')}
		/>
	</Dialog.Content>
</Dialog.Root>
