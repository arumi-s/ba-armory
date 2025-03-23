import { hasKeys } from 'prop-change-decorators';
import { Subscription } from 'rxjs';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { StuffCategory } from '../../../entities/enum';
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
	}[] = [];

	private changeSubscription: Subscription;

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
		this.changeSubscription?.unsubscribe();
	}

	handleChangeSquad() {
		this.items = this.dataService.stockables
			.filter((id) => this.dataService.items.get(id)?.category === StuffCategory.Favor)
			.map((id) => {
				const item = this.dataService.items.get(id);
				return {
					id,
					favors: this.getFavoredStudents(this.dataService.deck.selectedSquad.students, item),
				};
			});

		this.changeDetectorRef.markForCheck();
	}

	private getFavoredStudents(studentIds: number[], item: Equipment) {
		const favorStudentIds: [number[], number[], number[]] = [[], [], []];
		const genericTags = this.dataService.config.CommonFavorItemTags;
		const genericTagCount = item.tags.filter((x) => genericTags.includes(x)).length;

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

		return favors;
	}
}
