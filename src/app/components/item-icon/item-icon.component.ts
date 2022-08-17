import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { EQUIPMENT_OFFSET, FURNITURE_OFFSET } from '../../entities/deck';
import { DataService } from '../../services/data.service';

@Component({
	selector: 'ba-item-icon',
	templateUrl: './item-icon.component.html',
	styleUrls: ['./item-icon.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemIconComponent implements OnInit, OnDestroy {
	@Input()
	id: number;

	@Input()
	rate: number;

	name: string;
	tier: number;
	iconUrl: string;

	get deficit() {
		return this.dataService.deck.required[this.id] > this.dataService.deck.stocks[this.id];
	}

	@HostBinding('class')
	get classes() {
		return this.deficit ? 'deficit' : 'surplus';
	}

	private changeSubscription: Subscription;

	constructor(public readonly dataService: DataService, private readonly changeDetectorRef: ChangeDetectorRef) {}

	ngOnInit(): void {
		this.name = this.id.toString(10);

		if (this.id >= EQUIPMENT_OFFSET) {
			const item = this.dataService.equipments.get(this.id);
			if (item == null) return;

			this.name = item.name;
			this.tier = item.tier;
			this.iconUrl = item.iconUrl;
		} else if (this.id >= FURNITURE_OFFSET) {
		} else {
			const item = this.dataService.items.get(this.id);
			if (item == null) return;

			this.name = item.name;
			this.tier = undefined;
			this.iconUrl = item.iconUrl;
		}

		this.changeSubscription = this.dataService.deck.requiredUpdated$.subscribe(() => {
			this.changeDetectorRef.detectChanges();
		});
	}

	ngOnDestroy(): void {
		this.changeSubscription.unsubscribe();
	}

	handleFocusStock(event: FocusEvent) {
		if (event.target instanceof HTMLInputElement) {
			event.target.select();
		}
	}
}
