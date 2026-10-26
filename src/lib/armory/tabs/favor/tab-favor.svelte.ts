import { watch } from 'runed';
import type { AppState } from '#lib/app/app.svelte.ts';
import { favorTiers } from '#lib/deck/compute';

export interface FavorTabOpts {
	app: AppState;
}

/** Favor tab rows derivation + student-selection pruning. */
export class FavorTabState {
	static create(opts: FavorTabOpts): FavorTabState {
		return new FavorTabState(opts);
	}

	readonly opts: FavorTabOpts;
	/** Students the user filtered the rows by (transient UI state). */
	selectedStudentIds = $state<number[]>([]);

	constructor(opts: FavorTabOpts) {
		this.opts = opts;

		// Prune stale selections when the squad roster changes (side effect,
		// declared explicitly instead of a $effect writing state).
		watch(
			() => [...(this.app.selectedSquad?.students ?? [])],
			(students) => {
				if (this.selectedStudentIds.some((id) => !students.includes(id))) {
					this.selectedStudentIds = this.selectedStudentIds.filter((id) => students.includes(id));
				}
			}
		);
	}

	get app() {
		return this.opts.app;
	}

	readonly rows = $derived.by(() => {
		if (!this.app.game || !this.app.deck) return [];
		const squadStudents = this.app.selectedSquad?.students ?? [];
		return this.app.game.stockables
			.filter((id) => this.app.game!.items.get(id)?.category === 'Favor')
			.map((id) => {
				const item = this.app.game!.items.get(id)!;
				const result = favorTiers(item, squadStudents, this.app.game!);
				return { id, ...result };
			})
			.sort((a, b) => a.order - b.order)
			.map((row) => ({
				...row,
				visible:
					(this.app.deck!.options.showUnusedFavor || !row.unused) &&
					(this.selectedStudentIds.length === 0 ||
						row.tiers.some((tier) =>
							tier.studentIds.some((sid) => this.selectedStudentIds.includes(sid))
						))
			}));
	});

	isSelected(studentId: number): boolean {
		return this.selectedStudentIds.includes(studentId);
	}

	toggleStudent(studentId: number): void {
		if (this.selectedStudentIds.includes(studentId)) {
			this.selectedStudentIds = this.selectedStudentIds.filter((id) => id !== studentId);
		} else {
			this.selectedStudentIds = [...this.selectedStudentIds, studentId];
		}
	}
}
