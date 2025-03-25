import { hasKeys } from 'prop-change-decorators';
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
import { SquadTextComponent } from '../squad-text/squad-text.component';

@Component({
	selector: 'ba-armory',
	templateUrl: './armory.component.html',
	styleUrls: ['./armory.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArmoryComponent implements OnInit, OnDestroy {
	readonly sortableOptions: SortableOptions = {
		handle: 'img.cursor-grab',
		animation: 0,
		swapThreshold: 1,
		onUpdate: () => {
			this.dataService.deck.selectedSquad.orderUpdated$.next();
		},
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
			if (hasKeys(changes, 'selectedSquadId')) {
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
			width: 'calc(100% - 1rem)',
			height: 'auto',
			maxHeight: 'calc(100vh - 2.25rem)',
			autoFocus: false,
			restoreFocus: false,
		});

		await firstValueFrom(dialogRef.afterClosed());
		this.changeDetectorRef.markForCheck();
	}

	async handleClickSelector() {
		const dialogRef = this.dialog.open(SelectorComponent, {
			width: 'calc(100% - 1rem)',
			height: '100%',
			maxHeight: 'calc(100vh - 2.25rem)',
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

	handleClickSquadFold() {
		this.dataService.deck.selectedSquad.folded = !this.dataService.deck.selectedSquad.folded;
	}

	async handleClickSquadText() {
		const dialogRef = this.dialog.open(SquadTextComponent, {
			height: 'auto',
			maxHeight: 'calc(100vh - 2.25rem)',
			autoFocus: false,
			restoreFocus: false,
		});

		await firstValueFrom(dialogRef.afterClosed());
		this.changeDetectorRef.markForCheck();
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
