import { hasKeys } from 'prop-change-decorators';
import { filter, merge, Subscription } from 'rxjs';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { EquipmentRarity, StuffCategory } from '../../../entities/enum';
import { Equipment } from '../../../entities/equipment';
import { DataService } from '../../../services/data.service';

interface Favor {
	amount: number;
	icon: string;
	studentIds: number[];
}

@Component({
	selector: 'ba-tab-favor',
	templateUrl: './tab-favor.component.html',
	styleUrls: ['./tab-favor.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabFavorComponent implements OnInit, OnDestroy {
	items: {
		id: number;
		favors: Favor[];
		unused: boolean;
	}[] = [];
	selectedStudentIds: number[] = [];

	private changeSubscription: Subscription;
	private studentUpdatedSubscription: Subscription;

	constructor(public readonly dataService: DataService, private readonly changeDetectorRef: ChangeDetectorRef) {}

	ngOnInit(): void {
		this.changeSubscription = this.dataService.deck.change$.subscribe((changes) => {
			if (hasKeys(changes, 'selectedSquadId')) {
				this.handleChangeSquad();
			}
		});
		this.handleChangeSquad();
	}

	ngOnDestroy(): void {
		this.studentUpdatedSubscription?.unsubscribe();
		this.changeSubscription?.unsubscribe();
	}

	handleChangeSquad() {
		this.studentUpdatedSubscription?.unsubscribe();
		this.studentUpdatedSubscription = merge(
			this.dataService.deck.selectedSquad.change$.pipe(filter((changes) => Array.isArray(changes.students))),
			this.dataService.deck.selectedSquad.orderUpdated$
		).subscribe(() => {
			this.selectedStudentIds = this.selectedStudentIds.filter((studentId) =>
				this.dataService.deck.selectedSquad.students.includes(studentId)
			);
			this.updateFavors();
		});

		this.selectedStudentIds = [];
		this.updateFavors();
	}

	handleClickStudent(studentId: number) {
		if (this.selectedStudentIds.includes(studentId)) {
			this.selectedStudentIds = this.selectedStudentIds.filter((id) => id !== studentId);
		} else {
			this.selectedStudentIds = [...this.selectedStudentIds, studentId];
		}
	}

	handleClickClearStudent() {
		this.selectedStudentIds = [];
	}

	private updateFavors() {
		const rarities = Object.values(EquipmentRarity);
		this.items = this.dataService.stockables
			.filter((id) => this.dataService.items.get(id)?.category === StuffCategory.Favor)
			.map((id) => {
				const item = this.dataService.items.get(id);
				const { favors, isGeneric } = this.getFavoredStudents(this.dataService.deck.selectedSquad.students, item);
				return {
					id,
					favors: favors,
					unused: favors.every(({ studentIds }) => studentIds.length === 0),
					order: (isGeneric ? 0 : rarities.indexOf(item.rarity) * -100000) + item.id,
				};
			})
			.sort((a, b) => a.order - b.order);

		this.changeDetectorRef.markForCheck();
	}

	private getFavoredStudents(studentIds: number[], item: Equipment) {
		const favorStudentIds: [number[], number[], number[]] = [[], [], []];
		const genericTags = this.dataService.config.CommonFavorItemTags;
		const genericTagCount = item.tags.filter((x) => genericTags.includes(x)).length;
		const isGeneric = item.tags.length === genericTagCount;

		for (const id of studentIds) {
			const student = this.dataService.students.get(id);

			const allTags = [...student.favorItemTags, ...student.favorItemUniqueTags, ...genericTags];
			const commonTags = item.tags.filter((x) => allTags.includes(x));
			const favorGrade = Math.min(commonTags.length, 3);

			if (favorGrade > 0) {
				favorStudentIds[favorGrade - 1].push(student.id);
			}
		}

		const favors: Favor[] = [];
		for (let matchingTags = favorStudentIds.length; matchingTags > 0; matchingTags--) {
			if (matchingTags - genericTagCount == 0) continue;
			const studentIds = favorStudentIds[matchingTags - 1];
			if (studentIds.length > 0) {
				favors.push({
					amount: (item.expValue ?? 0) * (matchingTags + 1),
					icon: `${environment.CDN_BASE}/images/ui/Cafe_Interaction_Gift_0${matchingTags + 1}.png`,
					studentIds: studentIds,
				});
			}
		}

		favors.push({
			amount: (item.expValue ?? 0) * (genericTagCount + 1),
			icon: `${environment.CDN_BASE}/images/ui/Cafe_Interaction_Gift_0${genericTagCount + 1}.png`,
			studentIds: [],
		});

		return { favors, isGeneric };
	}
}
