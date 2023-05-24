import { Exclude, Expose } from 'class-transformer';
import { ChangeDispatcher, Dispatcher, WatchBoolean } from 'prop-change-decorators';

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

	@Dispatcher()
	readonly change$: ChangeDispatcher<DeckOptions>;
}
