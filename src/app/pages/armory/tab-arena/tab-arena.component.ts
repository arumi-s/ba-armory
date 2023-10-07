import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { DataService } from '../../../services/data.service';

@Component({
	selector: 'ba-tab-arena',
	templateUrl: './tab-arena.component.html',
	styleUrls: ['./tab-arena.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabArenaComponent implements OnInit, OnDestroy {
	rewardImage: string;

	nextRanks: { rank: number; tierUp?: boolean }[] = [];

	rankRewards: [rank: number, reward: number][] = [
		[1, 45],
		[2, 40],
		[10, 35],
		[100, 30],
		[200, 35],
		[500, 20],
		[1000, 18],
		[2000, 16],
		[4000, 14],
		[8000, 12],
		[15000, 10],
		[Infinity, 0],
	];

	constructor(public readonly dataService: DataService, private readonly changeDetectorRef: ChangeDetectorRef) {}

	ngOnInit(): void {
		this.rewardImage = `${environment.CDN_BASE}/images/items/icon/currency_icon_gem.webp`;

		this.updateRanks();
		this.dataService.deck.options.change$.subscribe((changes) => {
			if (changes.currentRank) this.updateRanks();
		});
	}

	ngOnDestroy(): void {
		return;
	}

	private nextRank(rank: number) {
		return Math.max(Math.min(Math.floor(rank * 0.7), rank - 3), 1);
	}

	private getRankReward(rank: number) {
		return this.rankRewards.find(([lastRank]) => rank <= lastRank)[1];
	}

	private updateRanks() {
		this.nextRanks = [];
		let rank = this.dataService.deck.options.currentRank;
		let reward = this.getRankReward(rank);

		do {
			rank = this.nextRank(rank);
			const newReward = this.getRankReward(rank);
			this.nextRanks.push({ rank: rank, tierUp: newReward > reward });
			reward = newReward;
		} while (rank > 1);

		while (this.nextRanks.length % 5 > 0) {
			this.nextRanks.push({ rank: 0 });
		}

		this.changeDetectorRef.markForCheck();
	}
}
