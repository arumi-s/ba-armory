import { hasKeys } from 'prop-change-decorators';
import { Subscription } from 'rxjs';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';

import { ACTION_POINT_ID } from '../../entities/deck';
import { CampaignDifficulty, RewardType } from '../../entities/enum';
import { Reward } from '../../entities/stage';
import { DataService } from '../../services/data.service';

@Component({
	selector: 'ba-campaign-card',
	templateUrl: './campaign-card.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignCardComponent implements OnInit, OnDestroy {
	@Input()
	id: number;

	@Input()
	amount: number;

	@HostBinding('class')
	readonly className = 'contents';

	campaign_amount: string = '';
	campaign_cost: string = '';
	type: string = '';
	difficulty: string = '';
	area: number = 0;
	stage: number = 0;
	name: string = '';
	iconUrl: string = '';
	rewards: Reward[];
	cost: number = 0;

	private changeSubscription: Subscription;
	private requiredUpdatedSubscription: Subscription;

	constructor(private readonly dataService: DataService, private readonly changeDetectorRef: ChangeDetectorRef) {}

	ngOnInit(): void {
		const campaign = this.dataService.stages.campaign.find((campaign) => campaign.id === this.id);

		// i18n
		this.campaign_amount = this.dataService.i18n.campaign_amount;
		this.campaign_cost = this.dataService.i18n.campaign_cost;

		this.type = this.dataService.localization.StageType['Campaign'];
		this.difficulty = campaign.difficulty === CampaignDifficulty.Hard ? 'H' : 'N';
		this.area = campaign.area;
		this.stage = campaign.stage;
		this.name = campaign.name;
		this.iconUrl = campaign.iconUrl;
		this.rewards =
			campaign
				.forRegion(this.dataService.region)
				.filter((reward) => reward.rewardType === RewardType.Default)
				.filter((reward) => reward.type !== 'Currency') ?? [];
		this.cost = campaign.entryCost.find(([itemId]) => itemId === ACTION_POINT_ID)?.[1] ?? 0;

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
}
