import { hasKeys } from 'prop-change-decorators';
import { Subscription } from 'rxjs';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { environment } from '../../../environments/environment';
import { DataService } from '../../services/data.service';
import { ItemUserComponent } from '../item-user/item-user.component';

@Component({
	selector: 'ba-item-icon',
	templateUrl: './item-icon.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemIconComponent implements OnInit, OnDestroy {
	@Input()
	id: number;

	@Input()
	rate: number;

	@Input()
	hideShadow: boolean = false;

	@Input()
	hideName: boolean = false;

	@HostBinding('class')
	get className() {
		return {
			contents: true,
			[this.deficit ? 'is-deficit' : 'is-surplus']: true,
			'is-required': this.dataService.deck.selectedSquad.required[this.id] > 0,
		};
	}

	@HostBinding('attr.category')
	category: string;

	name: string;
	tier: number;
	dbUrl: string;
	iconUrl: string;

	get deficit() {
		return this.dataService.deck.selectedSquad.required[this.id] > this.dataService.deck.stocks[this.id];
	}

	private changeSubscription: Subscription;
	private squadChangeSubscription: Subscription;

	constructor(
		public readonly dataService: DataService,
		private readonly dialog: MatDialog,
		private readonly changeDetectorRef: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		const item = this.dataService.getStuff(this.id);

		this.name = item.name.replace(/&#x([0-9a-f]{1,4});/gi, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));
		this.category = item.category.toLowerCase();
		this.tier = item.tier;
		this.dbUrl = `${environment.SCHALEDB_BASE}/?item=${encodeURIComponent(this.id)}`;
		this.iconUrl = item.iconUrl;

		this.changeSubscription = this.dataService.deck.change$.subscribe((changes) => {
			if (hasKeys(changes, 'selectedSquadId')) {
				this.handleChangeSquad();
			}
		});
		this.handleChangeSquad();
	}

	ngOnDestroy(): void {
		this.squadChangeSubscription?.unsubscribe();
		this.changeSubscription?.unsubscribe();
	}

	handleChangeSquad() {
		this.squadChangeSubscription?.unsubscribe();
		this.squadChangeSubscription = this.dataService.deck.selectedSquad.requiredUpdated$.subscribe(() => {
			this.changeDetectorRef.markForCheck();
		});
		this.changeDetectorRef.markForCheck();
	}

	handleFocusStock(event: FocusEvent) {
		if (event.target instanceof HTMLInputElement) {
			event.target.select();
		}
	}

	handleClickIcon() {
		const dialogRef = this.dialog.open(ItemUserComponent, {
			data: { id: this.id },
			autoFocus: false,
			restoreFocus: false,
		});

		dialogRef.afterClosed();
	}
}
