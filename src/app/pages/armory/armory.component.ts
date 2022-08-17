import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SortableOptions } from 'sortablejs';
import { DeckStudent } from '../../entities/deck-student';
import { DataService, StudentSortOption } from '../../services/data.service';

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

	currentSortOption: StudentSortOption;

	private requiredUpdatedSubscription: Subscription;

	constructor(public readonly dataService: DataService, private readonly changeDetectorRef: ChangeDetectorRef) {}

	ngOnInit(): void {
		console.log(this.dataService.deck);

		this.requiredUpdatedSubscription = this.dataService.deck.requiredUpdated$.subscribe(() => {
			this.changeDetectorRef.detectChanges();
		});
	}

	ngOnDestroy(): void {
		this.requiredUpdatedSubscription.unsubscribe();
	}

	handleClickSortOption(sortOptionId: string) {
		this.currentSortOption = this.dataService.studentSortOptions.find((so) => so.id === sortOptionId);

		{
			const random = new WeakMap<DeckStudent, number>();
			this.dataService.deck.students.forEach((deckStudent) => random.set(deckStudent, Math.random()));
			this.dataService.deck.students.sort((a, b) => random.get(a) - random.get(b));
		}

		const option = this.currentSortOption;

		this.dataService.deck.students.sort((a, b) => {
			for (const key of option.key) {
				const aValue = key(a);
				const bValue = key(b);
				const diff = compare(aValue, bValue);
				if (diff !== 0) return diff;
			}
			return 0;
		});
	}
}

const compare = (a: string | number, b: string | number) => {
	return typeof a === 'string' && typeof b === 'string' ? a.localeCompare(b) : +a - +b;
};
