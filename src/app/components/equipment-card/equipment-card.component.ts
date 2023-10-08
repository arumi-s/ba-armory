import { Subscription } from 'rxjs';

import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	HostListener,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	SimpleChanges,
} from '@angular/core';

import { DeckEquipment } from '../../entities/deck-equipment';
import { EquipmentCategory } from '../../entities/enum';
import { DataService } from '../../services/data.service';

@Component({
	selector: 'ba-equipment-card',
	templateUrl: './equipment-card.component.html',
	styleUrls: ['./equipment-card.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EquipmentCardComponent implements OnInit, OnChanges, OnDestroy {
	@Input()
	model: DeckEquipment;

	@Input()
	isTarget: boolean = false;

	id: number;

	name: string;
	iconUrl: string;
	category: EquipmentCategory;
	equipmentMap: Map<number, number>;

	get tier() {
		return this.isTarget ? this.model.tierTarget : this.model.tier;
	}

	set tier(tier: number) {
		if (this.isTarget) {
			this.model.tierTarget = tier;
		} else {
			this.model.tier = tier;
		}
	}

	private changeSubscription: Subscription;

	constructor(private readonly dataService: DataService, private readonly changeDetectorRef: ChangeDetectorRef) {}

	ngOnInit(): void {
		const student = this.dataService.getStudent(this.model.studentId);
		this.category = student.equipment[this.model.index];

		this.equipmentMap = this.dataService.equipmentsByCategory.get(this.category) ?? new Map();
		this.handleTierChange();

		this.changeSubscription = this.model.change$.subscribe((changes) => {
			if (changes.hasOwnProperty(this.isTarget ? 'tierTarget' : 'tier')) {
				this.handleTierChange();
			}
			this.changeDetectorRef.markForCheck();
		});
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.hasOwnProperty('isTarget') && !changes['isTarget'].firstChange) {
			this.handleTierChange();
		}
	}

	ngOnDestroy(): void {
		this.changeSubscription?.unsubscribe();
	}

	@HostListener('click', ['$event'])
	handleClick(event: MouseEvent) {
		event.preventDefault();

		if (event.ctrlKey) {
			this.tier = this.tier === this.model.tierMax ? this.model.tierMin : this.model.tierMax;
		} else {
			this.tier = this.tier + 1;
		}
	}

	@HostListener('contextmenu', ['$event'])
	handleContextmenu(event: MouseEvent) {
		event.preventDefault();

		this.tier = this.tier - 1;
	}

	private handleTierChange() {
		this.id = this.equipmentMap.get(Math.max(1, this.tier));
		const equipment = this.dataService.equipments.get(this.id);

		this.name = equipment.name;
		this.iconUrl = equipment.iconUrl;
	}
}
