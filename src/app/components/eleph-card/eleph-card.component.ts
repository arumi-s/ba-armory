import { hasKeys } from 'prop-change-decorators';
import { Subscription } from 'rxjs';

import { ChangeDetectorRef, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';

import { environment } from '../../../environments/environment';
import { ELIGMA_ID } from '../../entities/deck';
import { DeckStudent } from '../../entities/deck-student';
import { DataService } from '../../services/data.service';

@Component({
	selector: 'ba-eleph-card',
	templateUrl: './eleph-card.component.html',
})
export class ElephCardComponent implements OnInit, OnDestroy {
	@Input()
	id: number;

	@HostBinding('class')
	readonly className = 'contents';

	model: DeckStudent;

	name: string;
	dbUrl: string;

	readonly eligmaId = ELIGMA_ID;

	private changeSubscription: Subscription;
	private requiredUpdatedSubscription: Subscription;

	constructor(public readonly dataService: DataService, private readonly changeDetectorRef: ChangeDetectorRef) {}

	ngOnInit(): void {
		this.model = this.dataService.deck.students.get(this.id);
		const student = this.dataService.getStudent(this.id);

		this.name = student.name;
		this.dbUrl = `${environment.SCHALEDB_BASE}/?item=${encodeURIComponent(this.id)}`;

		this.changeSubscription = this.dataService.deck.change$.subscribe((changes) => {
			if (hasKeys(changes, 'selectedSquadId')) {
				this.handleChangeSquad();
			}
		});
		this.handleChangeSquad();
	}

	ngOnDestroy(): void {
		this.requiredUpdatedSubscription?.unsubscribe();
		this.changeSubscription?.unsubscribe();
	}

	handleChangeSquad() {
		this.requiredUpdatedSubscription?.unsubscribe();
		this.requiredUpdatedSubscription = this.dataService.deck.selectedSquad.requiredUpdated$.subscribe(() => {
			this.changeDetectorRef.markForCheck();
		});
		this.changeDetectorRef.markForCheck();
	}

	handleFocusStock(event: FocusEvent) {
		if (event.target instanceof HTMLInputElement) {
			event.target.select();
		}
	}
}
