import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';

import { environment } from '../../../environments/environment';
import { Terrain } from '../../entities/enum';
import { Student } from '../../entities/student';
import { DataService } from '../../services/data.service';

@Component({
	selector: 'ba-student-icon',
	templateUrl: './student-icon.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentIconComponent implements OnInit {
	student: Student | null;

	@Input()
	id: number;

	@Input()
	terrain?: Terrain;

	@HostBinding('class')
	readonly className = 'contents';

	constructor(private readonly dataService: DataService) {}

	ngOnInit(): void {
		this.student = this.dataService.getStudent(this.id) ?? null;
	}

	get adaptationIcon() {
		if (this.terrain == null) return null;

		const adaptation = this.student.getBattleAdaptation(this.terrain);
		return `${environment.CDN_BASE}/images/ui/Adaptresult${adaptation}.png`;
	}
}
