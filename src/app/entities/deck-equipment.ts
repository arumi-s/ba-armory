import { Exclude, Expose } from 'class-transformer';
import { ChangeDispatcher, Clamp, ClampTarget, Dispatcher } from 'prop-change-decorators';

import type { DataService } from '../services/data.service';

@Exclude()
export class DeckEquipment {
	@Expose({ name: 'studentId' })
	readonly studentId: number = 0;

	@Expose({ name: 'index' })
	readonly index: number = 0;

	@Expose({ name: 'tier' })
	@Clamp({ name: 'tier' })
	private __tier__: number = 0;
	public tier: number;
	@Expose({ name: 'tierTarget' })
	@ClampTarget({ name: 'tier' })
	private __tierTarget__: number = 0;
	tierTarget: number;
	readonly tierMin: number = 0;
	readonly tierMax: number = 0;

	@Dispatcher()
	readonly change$: ChangeDispatcher<DeckEquipment>;

	hydrate(dataService: DataService) {
		const equipmentCategory = dataService.getStudent(this.studentId).equipment[this.index];

		(this as { tierMax: number }).tierMax = dataService.equipmentCategoryMaxTier.get(equipmentCategory);

		this.tier = this.tier;

		this.tierTarget = this.tierTarget ?? -1;
	}
}
