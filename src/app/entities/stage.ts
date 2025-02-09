import { Expose, Type } from 'class-transformer';

import { environment } from '../../environments/environment';
import { CURRENCY_OFFSET, EQUIPMENT_OFFSET } from './deck';
import { CampaignDifficulty, EntryCost, RewardType, Terrain } from './enum';

import type { DataService } from '../services/data.service';

export class Stage {
	@Expose({ name: 'Campaign' })
	@Type(() => Campaign)
	campaign: Campaign[] = [];

	hydrate(_dataService: DataService) {
		for (const campaign of this.campaign) {
			campaign.hydrate();
		}
	}
}

export class Reward {
	@Expose({ name: 'Type' })
	type: string;
	@Expose({ name: 'Id' })
	id: number;
	@Expose({ name: 'Amount' })
	amount: number;
	@Expose({ name: 'Chance' })
	chance: number = 1;
	@Expose({ name: 'RewardType' })
	rewardType: RewardType = RewardType.Default;
}

export class CampaignRewards {
	@Expose({ name: 'Jp' })
	@Type(() => Reward)
	jp: Reward[] = [];
	@Expose({ name: 'Cn' })
	@Type(() => Reward)
	cn: Reward[];
	@Expose({ name: 'Global' })
	@Type(() => Reward)
	global: Reward[];

	private fixReward(rewards: Reward[]) {
		return rewards
			.filter((reward) => reward.type === 'Item' || reward.type === 'Equipment' || reward.type === 'Currency')
			.map((reward) => {
				reward.id = reward.type === 'Currency' ? CURRENCY_OFFSET : reward.type === 'Equipment' ? reward.id + EQUIPMENT_OFFSET : reward.id;
				return reward;
			});
	}

	hydrate() {
		this.jp = this.fixReward(this.jp);
		if (this.cn) this.cn = this.fixReward(this.cn);
		if (this.global) this.global = this.fixReward(this.global);
	}

	forRegion(region: number): Reward[] {
		if (region === 2) {
			return this.cn ?? this.jp;
		}
		if (region === 1) {
			return this.global ?? this.jp;
		}
		return this.jp;
	}
}

export class Campaign {
	@Expose({ name: 'Id' })
	id: number;
	@Expose({ name: 'Difficulty' })
	difficulty: CampaignDifficulty;
	@Expose({ name: 'Area' })
	area: number;
	@Expose({ name: 'Stage' })
	stage: number;
	@Expose({ name: 'Name' })
	name: string;
	@Expose({ name: 'EntryCost' })
	@Type(() => Array)
	entryCost: EntryCost[];
	@Expose({ name: 'Terrain' })
	terrain: Terrain;
	@Expose({ name: 'Level' })
	level: number;
	@Expose({ name: 'Rewards' })
	@Type(() => Reward)
	rewards: Reward[];

	private fixReward(rewards: Reward[]) {
		return rewards
			.filter((reward) => reward.type === 'Item' || reward.type === 'Equipment' || reward.type === 'Currency')
			.map((reward) => {
				reward.id = reward.type === 'Currency' ? CURRENCY_OFFSET : reward.type === 'Equipment' ? reward.id + EQUIPMENT_OFFSET : reward.id;
				return reward;
			});
	}

	hydrate() {
		this.rewards = this.fixReward(this.rewards);
	}

	forRegion(_region: number): Reward[] {
		return this.rewards;
	}

	get iconUrl() {
		return `${environment.CDN_BASE}/images/campaign/Campaign_Image_${this.area.toString().padStart(2, '0')}_${
			this.difficulty == CampaignDifficulty.Hard ? 'Hard' : 'Normal'
		}.png`;
	}
}
