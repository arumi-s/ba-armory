import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
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

	bulletType: string;
	armorType: string;

	constructor(private readonly dataService: DataService) {}

	ngOnInit(): void {
		this.student = this.dataService.students.get(this.id) ?? null;

		if (this.student) {
			this.bulletType = this.dataService.localization.BulletType[this.student.bulletType];
			this.armorType = this.dataService.localization.ArmorType[this.student.armorType];
		}
	}
}
