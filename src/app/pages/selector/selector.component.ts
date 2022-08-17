import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/data.service';

@Component({
	selector: 'ba-selector',
	templateUrl: './selector.component.html',
	styleUrls: ['./selector.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectorComponent implements OnInit, OnDestroy {
	title = '';
	missingStudents: number[] = [];

	private studentAddedSubscription: Subscription;
	private studentRemovedSubscription: Subscription;

	constructor(private readonly dataService: DataService) {}

	ngOnInit(): void {
		this.title = this.dataService.localization.ui['navbar_students'];

		this.studentAddedSubscription = this.dataService.deck.studentAdded$.subscribe(() => {
			this.updateMissingStudents();
		});
		this.studentRemovedSubscription = this.dataService.deck.studentRemoved$.subscribe(() => {
			this.updateMissingStudents();
		});

		this.updateMissingStudents();
	}

	ngOnDestroy(): void {
		this.studentAddedSubscription.unsubscribe();
		this.studentRemovedSubscription.unsubscribe();
	}

	handleClickStudent(id: number) {
		this.dataService.deck.addStudent(this.dataService, id);
	}

	updateMissingStudents() {
		this.missingStudents = [];

		for (const [, student] of this.dataService.students) {
			if (!this.dataService.deck.findStudent(student.id)) this.missingStudents.push(student.id);
		}
	}
}
