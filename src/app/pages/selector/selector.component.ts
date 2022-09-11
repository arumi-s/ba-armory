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

	private changeSubscription: Subscription;

	constructor(private readonly dataService: DataService) {}

	ngOnInit(): void {
		// i18n
		this.title = this.dataService.localization.ui['navbar_students'];

		this.dataService.deck.change$.subscribe((changes) => {
			if (changes.hasOwnProperty('selectedSquadId')) {
				this.handleChangeSquad();
			}
		});
		this.handleChangeSquad();
	}

	ngOnDestroy(): void {
		this.changeSubscription?.unsubscribe();
	}

	handleChangeSquad() {
		this.changeSubscription?.unsubscribe();
		this.changeSubscription = this.dataService.deck.selectedSquad.change$.subscribe((changes) => {
			if (Array.isArray(changes.students)) {
				this.updateMissingStudents();
			}
		});
		this.updateMissingStudents();
	}

	handleClickStudent(id: number) {
		this.dataService.deck.selectedSquad.addStudent(this.dataService, id);
	}

	updateMissingStudents() {
		this.missingStudents = [];

		for (const [, student] of this.dataService.students) {
			if (!this.dataService.deck.selectedSquad.hasStudent(student.id)) this.missingStudents.push(student.id);
		}
	}
}
