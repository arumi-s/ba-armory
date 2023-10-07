import { firstValueFrom, Subscription } from 'rxjs';
import { SortableOptions } from 'sortablejs';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';

import { Terrain } from '../../entities/enum';
import { StudentSortOption, Tab, TerrainOption } from '../../entities/types';
import { DataService } from '../../services/data.service';
import { IconSelectorComponent } from '../icon-selector/icon-selector.component';
import { SelectorComponent } from '../selector/selector.component';

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
	selectedTab: Tab = Tab.items;
	selectedTerrainOption: TerrainOption = undefined;
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
		this.handleChangeTab(this.dataService.deck.selectedSquad.tab);
		this.handleClickSquadTerrainOption(this.dataService.deck.selectedSquad.terrain);
		this.requiredUpdatedSubscription = this.dataService.deck.selectedSquad.requiredUpdated$.subscribe(() => {
			this.changeDetectorRef.markForCheck();
		});
		this.dataService.deck.selectedSquad.updateRequiredItems(this.dataService);
		this.changeDetectorRef.markForCheck();
	}

	async handleClickIconSelector() {
		const dialogRef = this.dialog.open(IconSelectorComponent, {
			width: '100%',
			height: 'auto',
			maxHeight: 'calc(100% - var(--spacing-xx-large))',
			autoFocus: false,
			restoreFocus: false,
		});

		await firstValueFrom(dialogRef.afterClosed());
		this.changeDetectorRef.markForCheck();
	}

	async handleClickSelector() {
		const dialogRef = this.dialog.open(SelectorComponent, {
			width: '100%',
			height: '100%',
			maxHeight: 'calc(100% - var(--spacing-xx-large))',
			autoFocus: false,
			restoreFocus: false,
		});

		await firstValueFrom(dialogRef.afterClosed());
		this.changeDetectorRef.markForCheck();
	}

	handleChangeTab(tab: number) {
		this.selectedTab = tab;
		this.dataService.deck.selectedSquad.tab = tab;
	}

	handleClickSquadTerrainOption(terrain: Terrain) {
		this.selectedTerrainOption = this.dataService.terrainOptions.find((to) => to.id === terrain);
		this.dataService.deck.selectedSquad.terrain = terrain;
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

	handleClickSquadPin() {
		this.dataService.deck.selectedSquad.pinned = !this.dataService.deck.selectedSquad.pinned;
	}

	handleClickSquadBound() {
		this.dataService.deck.selectedSquad.bounded = !this.dataService.deck.selectedSquad.bounded;
	}

	handleMousedownSquadStopPropagation(event: MouseEvent) {
		event.stopPropagation();
	}

	handleClickSquadMoveLeft() {
		this.dataService.deck.moveSquad(this.dataService, -1);
	}

	handleClickSquadMoveRight() {
		this.dataService.deck.moveSquad(this.dataService, 1);
	}
}
