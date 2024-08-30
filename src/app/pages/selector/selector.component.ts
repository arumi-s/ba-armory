import { hasKeys } from 'prop-change-decorators';
import { Subscription } from 'rxjs';

import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';

import { ALT_OFFSET } from '../../entities/deck';
import { ArmorType, BulletType, SquadType, Terrain } from '../../entities/enum';
import { DataService } from '../../services/data.service';

@Component({
	selector: 'ba-selector',
	templateUrl: './selector.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectorComponent implements OnInit, OnDestroy {
	title = '';

	missingStudents: number[] = [];

	private changeSubscription: Subscription;

	selectedBulletTypeOptions: Set<BulletType>;
	selectedArmorTypeOptions: Set<ArmorType>;
	selectedSquadTypeOptions: Set<SquadType>;
	selectedTerrainOptions: Set<Terrain>;

	constructor(public readonly dataService: DataService) {}

	ngOnInit(): void {
		// i18n
		this.title = this.dataService.localization.UI['students'];

		this.selectedBulletTypeOptions = new Set<BulletType>(this.dataService.deck.options.filterBulletType);
		this.selectedArmorTypeOptions = new Set<ArmorType>(this.dataService.deck.options.filterArmorType);
		this.selectedSquadTypeOptions = new Set<SquadType>(this.dataService.deck.options.filterSquadType);
		this.selectedTerrainOptions = new Set<Terrain>(this.dataService.deck.options.filterTerrain);

		this.dataService.deck.change$.subscribe((changes) => {
			if (hasKeys(changes, 'selectedSquadId')) {
				this.handleChangeSquad();
			}
		});

		this.dataService.deck.options.change$.subscribe((changes) => {
			if (changes.showDuplicatedStudents || changes.showFutureStudents) {
				this.updateMissingStudents();
			}
		});

		this.handleChangeSquad();
	}

	ngOnDestroy(): void {
		this.changeSubscription?.unsubscribe();
	}

	handleClickFilterBulletTypeOption(bulletType: BulletType) {
		if (this.selectedBulletTypeOptions.has(bulletType)) {
			this.selectedBulletTypeOptions.delete(bulletType);
		} else {
			this.selectedBulletTypeOptions.add(bulletType);
		}
		this.dataService.deck.options.filterBulletType = [...this.selectedBulletTypeOptions.keys()];
		this.updateMissingStudents();
	}

	handleClickFilterArmorTypeOption(armorType: ArmorType) {
		if (this.selectedArmorTypeOptions.has(armorType)) {
			this.selectedArmorTypeOptions.delete(armorType);
		} else {
			this.selectedArmorTypeOptions.add(armorType);
		}
		this.dataService.deck.options.filterArmorType = [...this.selectedArmorTypeOptions.keys()];
		this.updateMissingStudents();
	}

	handleClickFilterSquadTypeOption(squadType: SquadType) {
		if (this.selectedSquadTypeOptions.has(squadType)) {
			this.selectedSquadTypeOptions.delete(squadType);
		} else {
			this.selectedSquadTypeOptions.add(squadType);
		}
		this.dataService.deck.options.filterSquadType = [...this.selectedSquadTypeOptions.keys()];
		this.updateMissingStudents();
	}

	handleClickFilterTerrainOption(terrain: Terrain) {
		if (this.selectedTerrainOptions.has(terrain)) {
			this.selectedTerrainOptions.delete(terrain);
		} else {
			this.selectedTerrainOptions.add(terrain);
		}
		this.dataService.deck.options.filterTerrain = [...this.selectedTerrainOptions.keys()];
		this.updateMissingStudents();
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
		if (this.dataService.deck.options.isAssistStudents) {
			id += ALT_OFFSET;
		}

		if (this.dataService.deck.options.showDuplicatedStudents || !this.dataService.deck.selectedSquad.hasStudent(id)) {
			this.dataService.deck.selectedSquad.addStudent(this.dataService, id);
		}
	}

	updateMissingStudents() {
		this.missingStudents = [];
		const region = this.dataService.region;
		const terrains = [...this.selectedTerrainOptions.keys()];

		for (const [, student] of this.dataService.students) {
			if (
				(this.dataService.deck.options.showFutureStudents || student.isReleased[region]) &&
				(this.dataService.deck.options.showDuplicatedStudents ||
					(!this.dataService.deck.selectedSquad.hasStudent(student.id) &&
						!this.dataService.deck.selectedSquad.hasStudent(student.id + ALT_OFFSET))) &&
				(this.selectedBulletTypeOptions.size === 0 || this.selectedBulletTypeOptions.has(student.bulletType)) &&
				(this.selectedArmorTypeOptions.size === 0 || this.selectedArmorTypeOptions.has(student.armorType)) &&
				(this.selectedSquadTypeOptions.size === 0 || this.selectedSquadTypeOptions.has(student.squadType)) &&
				(this.selectedTerrainOptions.size === 0 || terrains.some((terrain) => student.getBattleAdaptation(terrain) > 2))
			) {
				this.missingStudents.push(student.id);
			}
		}
	}
}
