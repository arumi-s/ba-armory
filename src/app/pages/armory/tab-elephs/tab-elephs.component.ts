import { hasKeys } from 'prop-change-decorators';
import { Subscription } from 'rxjs';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { ALT_OFFSET } from '../../../entities/deck';
import { ElephSortOption } from '../../../entities/types';
import { DataService } from '../../../services/data.service';

@Component({
	selector: 'ba-tab-elephs',
	templateUrl: './tab-elephs.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabElephsComponent implements OnInit, OnDestroy {
	ids: number[] = [];

	selectedElephSortOption: ElephSortOption = undefined;
	selectedElephSortDirection: -1 | 1 = 1;

	private changeSubscription: Subscription;
	private requiredUpdatedSubscription: Subscription;
	private squadChangeSubscription: Subscription;

	constructor(public readonly dataService: DataService, private readonly changeDetectorRef: ChangeDetectorRef) {}

	ngOnInit(): void {
		this.changeSubscription = this.dataService.deck.change$.subscribe((changes) => {
			if (hasKeys(changes, 'selectedSquadId')) {
				this.handleChangeSquad();
			}
		});
		this.handleChangeSquad();
	}

	ngOnDestroy(): void {
		this.requiredUpdatedSubscription?.unsubscribe();
		this.squadChangeSubscription?.unsubscribe();
		this.changeSubscription?.unsubscribe();
	}

	handleChangeSquad() {
		this.requiredUpdatedSubscription?.unsubscribe();
		this.squadChangeSubscription?.unsubscribe();
		this.requiredUpdatedSubscription = this.dataService.deck.selectedSquad.requiredUpdated$.subscribe(() => {
			this.changeDetectorRef.markForCheck();
		});
		this.squadChangeSubscription = this.dataService.deck.selectedSquad.change$.subscribe((changes) => {
			if (Array.isArray(changes.students)) {
				this.updateStudentIds();
				this.changeDetectorRef.markForCheck();
			}
		});
		this.updateStudentIds();
		this.changeDetectorRef.markForCheck();
	}

	handleClickElephSortOption(sortOptionId: string) {
		this.selectedElephSortOption = this.dataService.elephSortOptions.find((so) => so.id === sortOptionId);

		this.dataService.deck.selectedSquad.sortElephs(this.dataService, this.ids, this.selectedElephSortOption, this.selectedElephSortDirection);
	}

	handleClickElephSortDirection() {
		this.selectedElephSortDirection = this.selectedElephSortDirection === -1 ? 1 : -1;

		this.dataService.deck.selectedSquad.sortElephs(this.dataService, this.ids, this.selectedElephSortOption, this.selectedElephSortDirection);
	}

	updateStudentIds() {
		this.ids = this.dataService.deck.selectedSquad.students.filter((v, i, a) => !(v > ALT_OFFSET) && a.indexOf(v) === i);
		this.handleClickElephSortOption('total');
	}
}
