import { Exclude, Expose, Type } from 'class-transformer';
import { Terrain, SchoolDungeonType, WeekDungeonType, EntryCost, Reward, CampaignDifficulty } from './enum';
import type { DataService } from '../services/data.service';

//function getStageIcon(stage, type) {
//	switch (type) {
//			case "Event":
//					return `Campaign_Event_${stage.EventId > 10000 ? stage.EventId - 10000 : stage.EventId}_${stage.Difficulty == 1 ? 'Normal' : 'Hard'}`
//			case "Campaign":
//					return `Campaign_Image_${stage.Area.toString().padStart(2,'0')}_${stage.Difficulty == 1 ? 'Hard' : 'Normal'}`
//			case "WeekDungeon":
//					return `WeekDungeon_Image_${stage.Type}`
//			case "SchoolDungeon":
//					return `SchoolDungeon_Image_${stage.Type}`
//	}
//}

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

		for (const campaign of this.campaign) {
			campaign.name = campaign.nameCn ?? campaign.nameJp;
		}
		for (const campaign of this.weekDungeon) {
			campaign.name = '';
		}
		for (const campaign of this.schoolDungeon) {
			campaign.name = '';
		}
		for (const campaign of this.conquest) {
			campaign.name = campaign.nameCn ?? campaign.nameJp;
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
		return `https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/campaign/Campaign_Image_${this.area.toString().padStart(2, '0')}_${
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
