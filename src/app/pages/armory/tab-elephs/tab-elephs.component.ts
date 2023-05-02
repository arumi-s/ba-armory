import { Subscription } from 'rxjs';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { ElephSortOption } from '../../../entities/types';
import { DataService } from '../../../services/data.service';

@Component({
	selector: 'ba-tab-elephs',
	templateUrl: './tab-elephs.component.html',
	styleUrls: ['./tab-elephs.component.less'],
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
			if (changes.hasOwnProperty('selectedSquadId')) {
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
				this.ids = this.dataService.deck.selectedSquad.students.slice();
				this.handleClickElephSortOption('total');
			}
		});
		this.ids = this.dataService.deck.selectedSquad.students.slice();
		this.handleClickElephSortOption('total');
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
}
