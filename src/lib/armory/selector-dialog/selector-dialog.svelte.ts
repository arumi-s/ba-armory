import type { AppState } from '#lib/app/app.svelte.ts';
import { getBattleAdaptation } from '#lib/data/indexes';
import { ALT_OFFSET } from '#lib/data/enums';
import { addStudentToSquad } from '#lib/deck/mutate';

export interface SelectorOpts {
	app: AppState;
}

/** Student picker filter chain + squad-add behavior (tested at node level). */
export class SelectorState {
	static create(opts: SelectorOpts): SelectorState {
		return new SelectorState(opts);
	}

	readonly opts: SelectorOpts;

	constructor(opts: SelectorOpts) {
		this.opts = opts;
	}

	get app() {
		return this.opts.app;
	}

	/** Students not yet in the squad, passing release/duplicate/type/terrain filters. */
	readonly missingStudents = $derived.by(() => {
		if (!this.app.game || !this.app.deck || !this.app.selectedSquad) return [];
		const region = this.app.region;
		const options = this.app.deck.options;
		const squadStudents = this.app.selectedSquad.students;
		const result: number[] = [];
		for (const student of this.app.game.students.values()) {
			if (!(options.showFutureStudents || student.isReleased[region])) continue;
			const inSquad =
				squadStudents.includes(student.id) || squadStudents.includes(student.id + ALT_OFFSET);
			if (!(options.showDuplicatedStudents || !inSquad)) continue;
			if (
				options.filterBulletType.length > 0 &&
				!options.filterBulletType.includes(student.bulletType)
			)
				continue;
			if (
				options.filterArmorType.length > 0 &&
				!options.filterArmorType.includes(student.armorType)
			)
				continue;
			if (
				options.filterSquadType.length > 0 &&
				!options.filterSquadType.includes(student.squadType)
			)
				continue;
			if (
				options.filterTerrain.length > 0 &&
				!options.filterTerrain.some((terrain) => getBattleAdaptation(student, terrain) > 2)
			)
				continue;
			result.push(student.id);
		}
		return result;
	});

	/** Add a student to the selected squad, honoring assist & duplicate options. */
	addStudent(id: number): void {
		if (!this.app.deck || !this.app.game) return;
		const targetId = this.app.deck.options.isAssistStudents ? id + ALT_OFFSET : id;
		if (
			this.app.deck.options.showDuplicatedStudents ||
			!this.app.selectedSquad?.students.includes(targetId)
		) {
			addStudentToSquad(this.app.deck, this.app.game, targetId);
		}
	}
}
