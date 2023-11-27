import { hasKeys } from 'prop-change-decorators';
import { Subscription } from 'rxjs';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { ItemSortOption } from '../../../entities/types';
import { DataService } from '../../../services/data.service';

@Component({
	selector: 'ba-tab-items',
	templateUrl: './tab-items.component.html',
	styleUrls: ['./tab-items.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabItemsComponent implements OnInit, OnDestroy {
	selectedItemSortOption: ItemSortOption = undefined;
	selectedItemSortDirection: -1 | 1 = 1;

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
		this.selectedItemSortOption = undefined;
		this.requiredUpdatedSubscription?.unsubscribe();
		this.requiredUpdatedSubscription = this.dataService.deck.selectedSquad.requiredUpdated$.subscribe(() => {
			this.changeDetectorRef.markForCheck();
		});
		this.handleClickItemSortOption('basic');
		this.changeDetectorRef.markForCheck();
	}

	handleClickItemSortOption(sortOptionId: string) {
		this.selectedItemSortOption = this.dataService.itemSortOptions.find((so) => so.id === sortOptionId);

		this.dataService.deck.selectedSquad.sortItems(this.dataService, this.selectedItemSortOption, this.selectedItemSortDirection);
	}

	handleClickItemSortDirection() {
		this.selectedItemSortDirection = this.selectedItemSortDirection === -1 ? 1 : -1;

		this.dataService.deck.selectedSquad.sortItems(this.dataService, this.selectedItemSortOption, this.selectedItemSortDirection);
	}
}
