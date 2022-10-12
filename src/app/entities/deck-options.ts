import { Expose, Exclude } from 'class-transformer';
import { Subject } from 'rxjs';
import { Change, Changes } from './change';

@Exclude()
export class DeckOptions {
	@Expose({ name: 'showSurplusItems' })
	private __showSurplusItems__: boolean = false;

	get showSurplusItems() {
		return this.__showSurplusItems__;
	}

	set showSurplusItems(showSurplusItems: boolean) {
		showSurplusItems = !!showSurplusItems;
		if (this.__showSurplusItems__ !== showSurplusItems) {
			const showSurplusItemsOld = this.__showSurplusItems__;
			this.__showSurplusItems__ = showSurplusItems;
			this.change$.next({ showSurplusItems: new Change(showSurplusItemsOld as false, this.__showSurplusItems__ as false) });
		}
	}

	@Expose({ name: 'showElephs' })
	private __showElephs__: boolean = false;

	get showElephs() {
		return this.__showElephs__;
	}

	set showElephs(showElephs: boolean) {
		showElephs = !!showElephs;
		if (this.__showElephs__ !== showElephs) {
			const showElephsOld = this.__showElephs__;
			this.__showElephs__ = showElephs;
			this.change$.next({ showElephs: new Change(showElephsOld as false, this.__showElephs__ as false) });
		}
	}

	@Expose({ name: 'showCampaignHard' })
	private __showCampaignHard__: boolean = false;

	get showCampaignHard() {
		return this.__showCampaignHard__;
	}

	set showCampaignHard(showCampaignHard: boolean) {
		showCampaignHard = !!showCampaignHard;
		if (this.__showCampaignHard__ !== showCampaignHard) {
			const showCampaignHardOld = this.__showCampaignHard__;
			this.__showCampaignHard__ = showCampaignHard;
			this.change$.next({ showCampaignHard: new Change(showCampaignHardOld as false, this.__showCampaignHard__ as false) });
		}
	}

	readonly change$ = new Subject<Changes<DeckOptions>>();
}
