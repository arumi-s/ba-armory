import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit, Output } from '@angular/core';

import { environment } from '../../../environments/environment';
import { Terrain } from '../../entities/enum';
import { Student } from '../../entities/student';
import { DataService } from '../../services/data.service';

@Component({
	selector: 'ba-student-icon',
	templateUrl: './student-icon.component.html',
	styleUrls: ['./student-icon.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentIconComponent implements OnInit {
	student: Student | null;

	@Input()
	id: number;

	@Input()
	terrain?: Terrain;

	bulletType: string;
	armorType: string;

	constructor(private readonly dataService: DataService) {}

	ngOnInit(): void {
		this.student = this.dataService.getStudent(this.id) ?? null;

		if (this.student) {
			// i18n
			this.bulletType = this.dataService.localization.BulletType[this.student.bulletType];
			// i18n
			this.armorType = this.dataService.localization.ArmorType[this.student.armorType];
		}
	}

	get adaptationIcon() {
		if (this.terrain == null) return null;

		const adaptation = this.student.getBattleAdaptation(this.terrain);
		return `${environment.CDN_BASE}/images/ui/Ingame_Emo_Adaptresult${this.dataService.adaptaionAmount[adaptation]}.png`;
	}
}
