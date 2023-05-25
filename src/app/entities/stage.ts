import { Exclude, Expose, Type } from 'class-transformer';

import { environment } from '../../environments/environment';
import { CampaignDifficulty, EntryCost, Reward, SchoolDungeonType, Terrain, WeekDungeonType } from './enum';

import type { DataService } from '../services/data.service';
export class Stage {
	@Expose({ name: 'Campaign' })
	@Type(() => Campaign)
	campaign: Campaign[];

	@Expose({ name: 'WeekDungeon' })
	@Type(() => WeekDungeon)
	weekDungeon: WeekDungeon[];

	@Expose({ name: 'SchoolDungeon' })
	@Type(() => SchoolDungeon)
	schoolDungeon: SchoolDungeon[];

	@Expose({ name: 'Conquest' })
	@Type(() => Conquest)
	conquest: Conquest[];

	hydrate(dataService: DataService) {
		if (this.campaign == null) this.campaign = [];
		if (this.weekDungeon == null) this.weekDungeon = [];
		if (this.schoolDungeon == null) this.schoolDungeon = [];
		if (this.conquest == null) this.conquest = [];

		const languageName: 'nameEn' | 'nameJp' | 'nameKr' | 'nameTh' | 'nameTw' | 'nameCn' = ('name' +
			dataService.language.substring(0, 1).toUpperCase() +
			dataService.language.substring(1)) as any;

		for (const campaign of this.campaign) {
			campaign.name = campaign[languageName] ?? campaign.nameJp;
		}
		for (const campaign of this.weekDungeon) {
			campaign.name = '';
		}
		for (const campaign of this.schoolDungeon) {
			campaign.name = '';
		}
		for (const campaign of this.conquest) {
			campaign.name = campaign[languageName] ?? campaign.nameJp;
		}
	}
}

export class Rewards {
	@Expose({ name: 'Default' })
	@Type(() => Array)
	default: Reward[];
	@Expose({ name: 'FirstClear' })
	@Type(() => Array)
	firstClear: Reward[];
	@Expose({ name: 'ThreeStar' })
	@Type(() => Array)
	threeStar: Reward[];
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
	@Exclude()
	name: string;
	@Expose({ name: 'NameEn' })
	nameEn?: string;
	@Expose({ name: 'NameJp' })
	nameJp: string;
	@Expose({ name: 'NameKr' })
	nameKr?: string;
	@Expose({ name: 'NameTh' })
	nameTh?: string;
	@Expose({ name: 'NameTw' })
	nameTw?: string;
	@Expose({ name: 'NameCn' })
	nameCn?: string;
	@Expose({ name: 'EntryCost' })
	@Type(() => Array)
	entryCost: EntryCost[];
	@Expose({ name: 'Terrain' })
	terrain: Terrain;
	@Expose({ name: 'Level' })
	level: number;
	@Expose({ name: 'Rewards' })
	@Type(() => Rewards)
	rewards: Rewards;

	get iconUrl() {
		return `${environment.CDN_BASE}/images/campaign/Campaign_Image_${this.area.toString().padStart(2, '0')}_${
			this.difficulty == CampaignDifficulty.Hard ? 'Hard' : 'Normal'
		}.png`;
	}
}

export class Conquest {
	@Expose({ name: 'Id' })
	id: number;
	@Exclude()
	name: string;
	@Expose({ name: 'NameEn' })
	nameEn?: string;
	@Expose({ name: 'NameJp' })
	nameJp: string;
	@Expose({ name: 'NameKr' })
	nameKr?: string;
	@Expose({ name: 'NameTh' })
	nameTh?: string;
	@Expose({ name: 'NameTw' })
	nameTw?: string;
	@Expose({ name: 'NameCn' })
	nameCn?: string;
	@Expose({ name: 'EventId' })
	eventId: number;
	@Expose({ name: 'Level' })
	level: number;
	@Expose({ name: 'Terrain' })
	terrain: Terrain;
	@Expose({ name: 'EntryCost' })
	@Type(() => Array)
	entryCost: EntryCost[];
	@Expose({ name: 'Rewards' })
	@Type(() => Rewards)
	rewards: Rewards;
}

export class SchoolDungeon {
	@Expose({ name: 'Id' })
	id: number;
	@Expose({ name: 'Type' })
	type: SchoolDungeonType;
	@Expose({ name: 'Stage' })
	stage: number;
	@Exclude()
	name: string;
	@Expose({ name: 'EntryCost' })
	entryCost: EntryCost[];
	@Expose({ name: 'Terrain' })
	terrain: Terrain;
	@Expose({ name: 'Level' })
	level: number;
	@Expose({ name: 'Rewards' })
	@Type(() => Rewards)
	rewards: Rewards;
}

export class WeekDungeon {
	@Expose({ name: 'Id' })
	id: number;
	@Expose({ name: 'Type' })
	type: WeekDungeonType;
	@Expose({ name: 'Stage' })
	stage: number;
	@Exclude()
	name: string;
	@Expose({ name: 'EntryCost' })
	@Type(() => Array)
	entryCost: EntryCost[];
	@Expose({ name: 'Terrain' })
	terrain: Terrain;
	@Expose({ name: 'Level' })
	level: number;
	@Expose({ name: 'Rewards' })
	@Type(() => Rewards)
	rewards: Rewards;
	@Expose({ name: 'RewardsGlobal' })
	@Type(() => Rewards)
	rewardsGlobal?: Rewards;
}
