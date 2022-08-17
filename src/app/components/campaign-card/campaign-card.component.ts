import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ACTION_POINT_ID, CURRENCY_OFFSET } from '../../entities/deck';
import { CampaignDifficulty, Reward } from '../../entities/enum';
import { DataService } from '../../services/data.service';

@Component({
	selector: 'ba-campaign-card',
	templateUrl: './campaign-card.component.html',
	styleUrls: ['./campaign-card.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignCardComponent implements OnInit, OnDestroy {
	@Input()
	id: number;

	@Input()
	amount: number;

	type: string = '';
	difficulty: string = '';
	area: number = 0;
	stage: number = 0;
	name: string = '';
	iconUrl: string = '';
	rewards: Reward[];
	cost: number = 0;

	private requiredUpdatedSubscription: Subscription;

	constructor(private readonly dataService: DataService, private readonly changeDetectorRef: ChangeDetectorRef) {}

	ngOnInit(): void {
		const campaign = this.dataService.stages.campaign.find((campaign) => campaign.id === this.id);

		this.type = this.dataService.localization.StageType['Campaign'];
		this.difficulty = campaign.difficulty === CampaignDifficulty.Hard ? 'H' : 'N';
		this.area = campaign.area;
		this.stage = campaign.stage;
		this.name = campaign.name;
		this.iconUrl = campaign.iconUrl;
		this.rewards = campaign.rewards?.default.filter((reward) => reward[0] < CURRENCY_OFFSET) ?? [];
		this.cost = campaign.entryCost.find(([itemId]) => itemId === ACTION_POINT_ID)?.[1] ?? 0;

		this.requiredUpdatedSubscription = this.dataService.deck.requiredUpdated$.subscribe(() => {
			this.changeDetectorRef.detectChanges();
		});
	}

	ngOnDestroy(): void {
		this.requiredUpdatedSubscription.unsubscribe();
	}
}
