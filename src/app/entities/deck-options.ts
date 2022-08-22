import { Expose, Exclude } from 'class-transformer';
import { Subject } from 'rxjs';
import { Change, Changes } from './change';

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

	@Expose({ name: 'showSecretStones' })
	private __showSecretStones__: boolean = false;

	get showSecretStones() {
		return this.__showSecretStones__;
	}

	set showSecretStones(showSecretStones: boolean) {
		showSecretStones = !!showSecretStones;
		if (this.__showSecretStones__ !== showSecretStones) {
			const showSecretStonesOld = this.__showSecretStones__;
			this.__showSecretStones__ = showSecretStones;
			this.change$.next({ showSecretStones: new Change(showSecretStonesOld as false, this.__showSecretStones__ as false) });
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

	@Exclude()
	readonly change$ = new Subject<Changes<DeckOptions>>();
}
