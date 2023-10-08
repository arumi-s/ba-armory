import { Subscription } from 'rxjs';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';

import { DeckStudent } from '../../entities/deck-student';
import { DataService } from '../../services/data.service';

@Component({
	selector: 'ba-gear-card',
	templateUrl: './gear-card.component.html',
	styleUrls: ['./gear-card.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GearCardComponent implements OnInit, OnDestroy {
	@Input()
	id: number;

	model: DeckStudent;

	name: string;

	@Input()
	isTarget: boolean = false;

	iconUrl: string;

	get gear() {
		return this.isTarget ? this.model.gearTarget : this.model.gear;
	}

	set gear(gear: number) {
		if (this.isTarget) {
			this.model.gearTarget = gear;
		} else {
			this.model.gear = gear;
		}
	}

	private changeSubscription: Subscription;

	constructor(private readonly dataService: DataService, private readonly changeDetectorRef: ChangeDetectorRef) {}

	ngOnInit(): void {
		this.model = this.dataService.deck.students.get(this.id);
		const student = this.dataService.getStudent(this.id);

		this.name = student.name;
		this.iconUrl = student.gearIconUrl;

		this.changeSubscription = this.model.change$.subscribe(() => {
			this.changeDetectorRef.markForCheck();
		});
	}

	ngOnDestroy(): void {
		this.changeSubscription?.unsubscribe();
	}

	@HostListener('click', ['$event'])
	handleClick(event: MouseEvent) {
		event.preventDefault();

		if (event.ctrlKey) {
			this.gear = this.gear === this.model.gearMax ? this.model.gearMin : this.model.gearMax;
		} else {
			this.gear = this.gear + 1;
		}
	}

	@HostListener('contextmenu', ['$event'])
	handleContextmenu(event: MouseEvent) {
		event.preventDefault();

		this.gear = this.gear - 1;
	}
}
