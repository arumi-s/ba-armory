import { Exclude, Expose } from 'class-transformer';
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

	@Expose({ name: 'showRequiredItems' })
	private __showRequiredItems__: boolean = false;

	get showRequiredItems() {
		return this.__showRequiredItems__;
	}

	set showRequiredItems(showRequiredItems: boolean) {
		showRequiredItems = !!showRequiredItems;
		if (this.__showRequiredItems__ !== showRequiredItems) {
			const showRequiredItemsOld = this.__showRequiredItems__;
			this.__showRequiredItems__ = showRequiredItems;
			this.change$.next({ showRequiredItems: new Change(showRequiredItemsOld as false, this.__showRequiredItems__ as false) });
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

	@Expose({ name: 'showDuplicatedStudents' })
	private __showDuplicatedStudents__: boolean = false;

	get showDuplicatedStudents() {
		return this.__showDuplicatedStudents__;
	}

	set showDuplicatedStudents(showDuplicatedStudents: boolean) {
		showDuplicatedStudents = !!showDuplicatedStudents;
		if (this.__showDuplicatedStudents__ !== showDuplicatedStudents) {
			const showDuplicatedStudentsOld = this.__showDuplicatedStudents__;
			this.__showDuplicatedStudents__ = showDuplicatedStudents;
			this.change$.next({ showDuplicatedStudents: new Change(showDuplicatedStudentsOld as false, this.__showDuplicatedStudents__ as false) });
		}
	}

	readonly change$ = new Subject<Changes<DeckOptions>>();
}
