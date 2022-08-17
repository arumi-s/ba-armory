import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DeckStudent } from '../../entities/deck-student';
import { Student } from '../../entities/student';
import { DataService } from '../../services/data.service';

@Component({
	selector: 'ba-student-card',
	templateUrl: './student-card.component.html',
	styleUrls: ['./student-card.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentCardComponent implements OnInit, OnDestroy {
	student: Student;

	@Input()
	model: DeckStudent;

	school: string;
	bulletType: string;
	armorType: string;
	squadType: string;
	position: string;

	@HostBinding('class.is_target')
	isTarget = false;

	private changeSubscription: Subscription;

	constructor(
		private readonly dataService: DataService,
		private readonly dialog: MatDialog,
		private readonly changeDetectorRef: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.student = this.dataService.students.get(this.model.id) ?? new Student();

		this.school = this.dataService.localization.School[this.student.school];
		this.bulletType = this.dataService.localization.BulletType[this.student.bulletType];
		this.armorType = this.dataService.localization.ArmorType[this.student.armorType];
		this.squadType = this.dataService.localization.SquadType[this.student.squadType];
		this.position = this.student.position.toUpperCase();

		this.changeSubscription = this.model.change$.subscribe(() => {
			this.changeDetectorRef.detectChanges();
		});
	}

	ngOnDestroy(): void {
		this.changeSubscription.unsubscribe();
	}

	handleClickDelete() {
		this.dataService.deck.removeStudent(this.model.id);
	}

	handleClickTarget() {
		this.isTarget = !this.isTarget;
	}

	handleFocusLevel(event: FocusEvent) {
		if (event.target instanceof HTMLInputElement) {
			event.target.select();
		}
	}

	handleWheelLevel(event: WheelEvent) {
		if (event.target instanceof HTMLInputElement) {
			event.preventDefault();
			event.stopPropagation();

			const delta = event.ctrlKey ? 1000 : 1;
			if (event.deltaY > 0) {
				this.model.level = this.model.level - delta;
			} else {
				this.model.level = this.model.level + delta;
			}
		}
	}
}
