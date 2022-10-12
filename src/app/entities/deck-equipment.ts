import { Expose, Exclude } from 'class-transformer';
import { Subject } from 'rxjs';
import { Stat, StatTarget } from '../decorators/stat';
import type { DataService } from '../services/data.service';
import { Changes } from './change';

@Exclude()
export class DeckEquipment {
	@Expose({ name: 'studentId' })
	readonly studentId: number = 0;

	@Expose({ name: 'index' })
	readonly index: number = 0;

	@Expose({ name: 'tier' })
	@Stat({ name: 'tier' })
	private __tier__: number = 0;
	public tier: number;
	@Expose({ name: 'tierTarget' })
	@StatTarget({ name: 'tier' })
	private __tierTarget__: number = 0;
	tierTarget: number;
	readonly tierMin: number = 0;
	readonly tierMax: number = 0;

	readonly change$ = new Subject<Changes<DeckEquipment>>();

	hydrate(dataService: DataService) {
		const equipmentCategory = dataService.students.get(this.studentId).equipment[this.index];

		(this as any).tierMax = dataService.equipmentCategoryMaxTier.get(equipmentCategory);

		this.tier = this.tier;

		this.tierTarget = this.tierTarget ?? -1;
	}
}
