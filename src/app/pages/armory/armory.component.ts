import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Subscription } from 'rxjs';
import { SortableOptions } from 'sortablejs';
import { SelectorComponent } from '../selector/selector.component';
import { StudentSortOption } from '../../entities/types';
import { DataService } from '../../services/data.service';

@Component({
	selector: 'ba-armory',
	templateUrl: './armory.component.html',
	styleUrls: ['./armory.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArmoryComponent implements OnInit, OnDestroy {
	readonly sortableOptions: SortableOptions = {
		handle: '.mat-card-avatar',
		animation: 0,
		swapThreshold: 1,
	};

	isTarget: boolean = false;
	selectedStudentSortOption: StudentSortOption = undefined;
	selectedStudentSortDirection: -1 | 1 = 1;

	private changeSubscription: Subscription;
	private requiredUpdatedSubscription: Subscription;

	constructor(
		public readonly dataService: DataService,
		private readonly dialog: MatDialog,
		private readonly changeDetectorRef: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.changeSubscription = this.dataService.deck.change$.subscribe((changes) => {
			if (changes.hasOwnProperty('selectedSquadId')) {
				this.handleChangeSquad();
			}
		});
		this.handleChangeSquad();
	}

	ngOnDestroy(): void {
		this.requiredUpdatedSubscription?.unsubscribe();
		this.changeSubscription?.unsubscribe();
	}

	handleChangeSquad() {
		this.isTarget = false;
		this.selectedStudentSortOption = undefined;
		this.requiredUpdatedSubscription?.unsubscribe();
		this.requiredUpdatedSubscription = this.dataService.deck.selectedSquad.requiredUpdated$.subscribe(() => {
			this.changeDetectorRef.markForCheck();
		});
		this.dataService.deck.selectedSquad.updateRequiredItems(this.dataService);
		this.changeDetectorRef.markForCheck();
	}

	handleClickSelector() {
		const dialogRef = this.dialog.open(SelectorComponent, {
			width: '100%',
			height: 'auto',
			maxHeight: 'calc(100% - var(--spacing-xx-large))',
			autoFocus: false,
			restoreFocus: false,
		});

		dialogRef.afterClosed();
	}

	handleClickStudentSortOption(sortOptionId: string) {
		this.selectedStudentSortOption = this.dataService.studentSortOptions.find((so) => so.id === sortOptionId);

		this.dataService.deck.selectedSquad.sortStudents(this.dataService, this.selectedStudentSortOption, this.selectedStudentSortDirection);
	}

	handleClickStudentSortDirection() {
		this.selectedStudentSortDirection = this.selectedStudentSortDirection === -1 ? 1 : -1;

		this.dataService.deck.selectedSquad.sortStudents(this.dataService, this.selectedStudentSortOption, this.selectedStudentSortDirection);
	}

	handleClickTarget() {
		this.isTarget = !this.isTarget;

		for (const studentId of this.dataService.deck.selectedSquad.students) {
			const student = this.dataService.deck.students.get(studentId);
			student.isTarget = this.isTarget;
		}
	}

	handleTabChangeSquad(event: MatTabChangeEvent) {
		this.dataService.deck.selectedSquadId = event.index;
	}

	handleClickSquadAdd() {
		this.dataService.deck.addSquad(this.dataService);
	}

	handleClickSquadRemove() {
		this.dataService.deck.removeSquad(this.dataService);
	}

	handleMousedownSquadMove(event: MouseEvent) {
		event.stopPropagation();
	}

	handleClickSquadMoveLeft() {
		this.dataService.deck.moveSquad(this.dataService, -1);
	}

	handleClickSquadMoveRight() {
		this.dataService.deck.moveSquad(this.dataService, 1);
	}
}
