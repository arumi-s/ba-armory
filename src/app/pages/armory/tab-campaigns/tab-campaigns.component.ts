import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from '../../../services/data.service';

@Component({
	selector: 'ba-tab-campaigns',
	templateUrl: './tab-campaigns.component.html',
	styleUrls: ['./tab-campaigns.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabCampaignsComponent implements OnInit, OnDestroy {
	private changeSubscription: Subscription;
	private requiredUpdatedSubscription: Subscription;

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
		this.changeSubscription?.unsubscribe();
	}

	handleChangeSquad() {
		this.requiredUpdatedSubscription?.unsubscribe();
		this.requiredUpdatedSubscription = this.dataService.deck.selectedSquad.requiredUpdated$.subscribe(() => {
			this.changeDetectorRef.markForCheck();
		});
		this.changeDetectorRef.markForCheck();
	}
}
