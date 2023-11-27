import { hasKeys } from 'prop-change-decorators';
import { Subscription } from 'rxjs';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { StuffCategory } from '../../../entities/enum';
import { ItemSortOption } from '../../../entities/types';
import { DataService } from '../../../services/data.service';

@Component({
	selector: 'ba-tab-gears',
	templateUrl: './tab-gears.component.html',
	styleUrls: ['./tab-gears.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabGearsComponent implements OnInit, OnDestroy {
	ids: number[] = [];

	selectedGearSortOption: ItemSortOption = undefined;
	selectedGearSortDirection: -1 | 1 = 1;

	private changeSubscription: Subscription;
	private requiredUpdatedSubscription: Subscription;

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
		this.changeSubscription?.unsubscribe();
	}

	handleChangeSquad() {
		this.requiredUpdatedSubscription?.unsubscribe();
		this.requiredUpdatedSubscription = this.dataService.deck.selectedSquad.requiredUpdated$.subscribe(() => {
			this.changeDetectorRef.markForCheck();
		});
		this.ids = this.dataService.stockables.filter((id) => this.dataService.items.get(id)?.category === StuffCategory.Favor);
		this.handleClickGearSortOption('basic');
		this.changeDetectorRef.markForCheck();
	}

	handleClickGearSortOption(sortOptionId: string) {
		this.selectedGearSortOption = this.dataService.itemSortOptions.find((so) => so.id === sortOptionId);

		this.dataService.deck.selectedSquad.sortGears(this.dataService, this.ids, this.selectedGearSortOption, this.selectedGearSortDirection);
	}

	handleClickGearSortDirection() {
		this.selectedGearSortDirection = this.selectedGearSortDirection === -1 ? 1 : -1;

		this.dataService.deck.selectedSquad.sortGears(this.dataService, this.ids, this.selectedGearSortOption, this.selectedGearSortDirection);
	}
}
