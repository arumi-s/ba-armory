import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { Subject } from 'rxjs';

import { Change, Changes } from './change';
import { DeckOptions } from './deck-options';
import { DeckSquad } from './deck-squad';
import { DeckStocks, transformStocks, wrapStocks } from './deck-stocks';
import { DeckStudent } from './deck-student';

import type { DataService } from '../services/data.service';
export const GACHA_OFFSET = 4000000;
export const CURRENCY_OFFSET = 3000000;
export const EQUIPMENT_OFFSET = 2000000;
export const FURNITURE_OFFSET = 1000000;
export const GOLD_ID = 1;
export const ACTION_POINT_ID = 5;
export const ELIGMA_ID = 23;

@Exclude()
export class Deck {
	@Expose({ name: 'options' })
	@Type(() => DeckOptions)
	options: DeckOptions;

	@Expose({ name: 'students' })
	@Type(() => DeckStudent)
	@Transform(({ value }: { value: DeckStudent[] }) => new Map((value ?? []).map((item: any) => [item.id, item])), { toClassOnly: true })
	@Transform(({ value }: { value: Map<number, DeckStudent> }) => Array.from(value.values()), { toPlainOnly: true })
	students: Map<number, DeckStudent> = new Map<number, DeckStudent>();

	@Expose({ name: 'stocks' })
	@Transform(transformStocks, { toClassOnly: true })
	stocks: DeckStocks;

	@Expose({ name: 'squads' })
	@Type(() => DeckSquad)
	squads: DeckSquad[] = [];

	@Expose({ name: 'selectedSquadId' })
	private __selectedSquadId__: number = undefined;

	get selectedSquadId() {
		return this.__selectedSquadId__;
	}

	set selectedSquadId(selectedSquadId: number) {
		selectedSquadId = Math.max(Math.min(selectedSquadId, this.squads.length - 1), 0);

		if (this.selectedSquad?.id !== selectedSquadId) {
			const selectedSquadIdOld = this.__selectedSquadId__;
			this.__selectedSquadId__ = selectedSquadId;

			this.selectedSquad = this.squads[selectedSquadId];
			this.change$.next({ selectedSquadId: new Change(selectedSquadIdOld, this.__selectedSquadId__) });
		}
	}

	selectedSquad: DeckSquad = undefined;

	readonly change$ = new Subject<Changes<Deck>>();

	hydrate(dataService: DataService) {
		if (this.options == null) {
			this.options = new DeckOptions();
		}

		if (this.students == null) {
			this.students = new Map();
		}
		for (const [, deckStudent] of this.students) {
			deckStudent.hydrate(dataService);
		}

		for (const [studentId, student] of dataService.students) {
			if (!this.students.has(studentId)) {
				const deckStudent = DeckStudent.fromStudent(dataService, student);
				this.students.set(studentId, deckStudent);
			}
		}

		if (this.stocks == null) {
			this.stocks = wrapStocks({});
		}

		if (this.squads == null) {
			this.squads = [];
		}
		if (this.squads.length === 0) {
			const deckSquad = new DeckSquad();
			this.squads.push(deckSquad);
		}

		for (const deckSquad of this.squads) {
			deckSquad.hydrate(dataService);
		}

		this.selectedSquadId = this.selectedSquadId ?? 0;
	}

	addSquad(dataService: DataService) {
		const deckSquad = new DeckSquad();
		this.squads.push(deckSquad);
		deckSquad.hydrate(dataService);
	}

	removeSquad(dataService: DataService) {
		if (this.squads.length === 1) return;
		const selectedSquad = this.selectedSquad;
		const selectedSquadId = selectedSquad.id;
		this.squads.splice(selectedSquadId, 1);

		for (let id = 0; id < this.squads.length; id++) {
			this.squads[id].id = id;
		}

		this.selectedSquadId = selectedSquadId;
	}

	moveSquad(dataService: DataService, dir: -1 | 1) {
		const selectedSquad = this.selectedSquad;
		const selectedSquadId = selectedSquad.id;
		const newSquadId = Math.max(Math.min(selectedSquadId + dir, this.squads.length - 1), 0);

		if (newSquadId !== selectedSquadId) {
			[this.squads[newSquadId], this.squads[selectedSquadId]] = [this.squads[selectedSquadId], this.squads[newSquadId]];
			this.squads[newSquadId].id = newSquadId;
			this.squads[selectedSquadId].id = selectedSquadId;
			this.selectedSquadId = newSquadId;
		}
	}
}
