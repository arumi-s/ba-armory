import { Expose, Exclude } from 'class-transformer';
import { Subject } from 'rxjs';
import type { DataService } from '../services/data.service';
import { Change, Changes } from './change';

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
		if (isNaN(tier)) tier = 0;
		tier = Math.max(Math.min(Math.floor(tier), this.tierMax), this.tierMin);
		if (this.__tier__ !== tier) {
			const tierOld = this.__tier__;
			this.__tier__ = tier;
			if (this.__tierTarget__ < this.__tier__) {
				const tierTargetOld = this.__tierTarget__;
				this.__tierTarget__ = this.__tier__;
				this.change$.next({ tier: new Change(tierOld, this.__tier__), tierTarget: new Change(tierTargetOld, this.__tierTarget__) });
			} else {
				this.change$.next({ tier: new Change(tierOld, this.__tier__) });
			}
		}
	}

	@Expose({ name: 'tierTarget' })
	private __tierTarget__: number = 0;

	get tierTarget() {
		return this.__tierTarget__;
	}

	set tierTarget(tierTarget: number) {
		if (isNaN(tierTarget)) tierTarget = 0;
		tierTarget = Math.max(Math.min(Math.floor(tierTarget), this.tierMax), this.tier, this.tierMin);
		if (this.__tierTarget__ !== tierTarget) {
			const tierTargetOld = this.__tierTarget__;
			this.__tierTarget__ = tierTarget;
			this.change$.next({ tierTarget: new Change(tierTargetOld, this.__tierTarget__) });
		}
	}

	@Exclude()
	readonly tierMin: number = 0;

	@Exclude()
	readonly tierMax: number = 0;

	@Exclude()
	readonly change$ = new Subject<Changes<DeckEquipment>>();

	hydrate(dataService: DataService) {
		const equipmentCategory = dataService.students.get(this.studentId).equipment[this.index];

		(this as any).tierMin = 0;
		(this as any).tierMax = dataService.equipmentCategoryMaxTier.get(equipmentCategory);

		this.tier = this.tier;

		this.tierTarget = this.tierTarget ?? -1;
	}
}
