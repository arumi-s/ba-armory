import { Exclude, Expose } from 'class-transformer';
import { ChangeDispatcher, Clamp, Dispatcher, WatchBoolean } from 'prop-change-decorators';

import { ArmorType, BulletType, SquadType, Terrain } from './enum';

@Exclude()
export class DeckOptions {
	@Expose({ name: 'showSurplusItems' })
	@WatchBoolean({ name: 'showSurplusItems' })
	private __showSurplusItems__: boolean = false;
	showSurplusItems: boolean;

	@Expose({ name: 'showRequiredItems' })
	@WatchBoolean({ name: 'showRequiredItems' })
	private __showRequiredItems__: boolean = false;
	showRequiredItems: boolean;

	@Expose({ name: 'showElephs' })
	@WatchBoolean({ name: 'showElephs' })
	private __showElephs__: boolean = false;
	showElephs: boolean;

	@Expose({ name: 'showCampaignHard' })
	@WatchBoolean({ name: 'showCampaignHard' })
	private __showCampaignHard__: boolean = false;
	showCampaignHard: boolean;

	@Expose({ name: 'showDuplicatedStudents' })
	@WatchBoolean({ name: 'showDuplicatedStudents' })
	private __showDuplicatedStudents__: boolean = false;
	showDuplicatedStudents: boolean;

	@Expose({ name: 'showFutureStudents' })
	@WatchBoolean({ name: 'showFutureStudents' })
	private __showFutureStudents__: boolean = false;
	showFutureStudents: boolean;

	@Expose({ name: 'filterBulletType' })
	filterBulletType: BulletType[] = [];

	@Expose({ name: 'filterArmorType' })
	filterArmorType: ArmorType[] = [];

	@Expose({ name: 'filterSquadType' })
	filterSquadType: SquadType[] = [];

	@Expose({ name: 'filterTerrain' })
	filterTerrain: Terrain[] = [];

	@Expose({ name: 'currentRank' })
	@Clamp({ name: 'currentRank', target: '' })
	private __currentRank__: number = 15000;
	currentRank: number;
	readonly currentRankMin: number = 1;
	readonly currentRankMax: number = 15000;

	@Dispatcher()
	readonly change$: ChangeDispatcher<DeckOptions>;
}
