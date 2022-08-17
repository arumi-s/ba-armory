import { Expose, Exclude } from 'class-transformer';
import { Subject } from 'rxjs';
import type { DataService } from '../services/data.service';
import { DeckChange } from './types';

export class DeckEquipment {
	@Expose({ name: 'studentId' })
	readonly studentId: number = 0;

	@Expose({ name: 'index' })
	readonly index: number = 0;

	@Expose({ name: 'tier' })
	private __tier__: number = 0;

	get tier() {
		return this.__tier__;
	}

	set tier(tier: number) {
		tier = Math.max(Math.min(Math.floor(tier), this.tierMax), this.tierMin);
		if (this.__tier__ !== tier) {
			this.__tier__ = tier;
			if (this.__tierTarget__ < this.__tier__) {
				this.__tierTarget__ = this.__tier__;
				this.change$.next({ tier, tierTarget: this.__tierTarget__ });
			} else {
				this.change$.next({ tier });
			}
		}
	}

	@Expose({ name: 'tierTarget' })
	private __tierTarget__: number = 0;

	get tierTarget() {
		return this.__tierTarget__;
	}

	set tierTarget(tierTarget: number) {
		tierTarget = Math.max(Math.min(Math.floor(tierTarget), this.tierMax), this.tier, this.tierMin);
		if (this.__tierTarget__ !== tierTarget) {
			this.__tierTarget__ = tierTarget;
			this.change$.next({ tierTarget });
		}
	}

	@Exclude()
	readonly tierMin: number = 0;

	@Exclude()
	readonly tierMax: number = 0;

	@Exclude()
	readonly change$ = new Subject<DeckChange<DeckEquipment>>();

	hydrate(dataService: DataService) {
		const equipmentCategory = dataService.students.get(this.studentId).equipment[this.index];

		(this as any).tierMin = 0;
		(this as any).tierMax = dataService.equipmentCategoryMaxTier.get(equipmentCategory);

		this.tier = this.tier;

		this.tierTarget = this.tierTarget ?? -1;
	}
}
