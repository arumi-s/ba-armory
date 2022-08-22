import { Type, Expose, Exclude } from 'class-transformer';
import { Subject, Subscription, debounceTime, filter } from 'rxjs';
import type { DataService } from '../services/data.service';
import { DeckStocks, DeckStocksClear, wrapStocks } from './deck-stocks';
import { DeckStudent } from './deck-student';
import { CampaignDifficulty, StuffCategory } from './enum';
import { ItemSortOption, StudentSortOption } from './types';
import { Change, Changes } from './change';
import { ACTION_POINT_ID } from './deck';

export class DeckSquad {
	@Exclude()
	id: number = 0;

	@Expose({ name: 'name' })
	name: string = '';

	@Expose({ name: 'students' })
	@Type(() => Number)
	students: number[] = [];

	@Exclude()
	readonly required: DeckStocks = wrapStocks({});

	@Exclude()
	readonly stages: {
		id: number;
		amount: number;
	}[] = [];

	@Exclude()
	readonly change$ = new Subject<Changes<DeckSquad>>();

	@Exclude()
	readonly requiredStaled$ = new Subject<void>();

	@Exclude()
	readonly requiredUpdated$ = new Subject<void>();

	hydrate(dataService: DataService) {
		this.id = dataService.deck.squads.indexOf(this);

		// i18n
		if (this.name == null || this.name === '') {
			this.name = `队伍 #${this.id + 1}`;
		}

		this.students = (this.students ?? []).filter((studentId) => dataService.students.has(studentId));

		const changeSubscriptionMap = new Map<number, Subscription>();

		const subscribeDeckStudent = (deckStudent: DeckStudent) => {
			unsubscribeDeckStudent(deckStudent);
			changeSubscriptionMap.set(
				deckStudent.id,
				deckStudent.requiredUpdated$.subscribe(() => {
					this.requiredStaled$.next();
				})
			);
		};
		const unsubscribeDeckStudent = (deckStudent: DeckStudent) => {
			changeSubscriptionMap.get(deckStudent.id)?.unsubscribe();
		};

		this.change$.subscribe((changes) => {
			if (Array.isArray(changes.students)) {
				for (const studentChange of changes.students) {
					if (studentChange.previousValue) {
						const deckStudent = dataService.deck.students.get(studentChange.previousValue);
						unsubscribeDeckStudent(dataService.deck.students.get(studentChange.previousValue));
						this.requiredStaled$.next();
					}

					if (studentChange.currentValue) {
						const deckStudent = dataService.deck.students.get(studentChange.currentValue);
						subscribeDeckStudent(deckStudent);
						this.requiredStaled$.next();
					}
				}
			}
		});

		dataService.deck.options.change$.subscribe((changes) => {
			if (changes.showCampaignHard) {
				this.requiredStaled$.next();
			}
		});

		this.requiredStaled$
			.pipe(
				filter(() => dataService.deck.selectedSquadId === this.id),
				debounceTime(200)
			)
			.subscribe(() => {
				this.updateRequiredItems(dataService);
			});

		for (const studentId of this.students) {
			const deckStudent = dataService.deck.students.get(studentId);
			subscribeDeckStudent(deckStudent);
		}
	}

	hasStudent(studentId: number) {
		return this.students.includes(studentId);
	}

	addStudent(dataService: DataService, studentId: number) {
		if (this.hasStudent(studentId)) return true;

		if (!dataService.students.has(studentId)) return false;

		this.students.push(studentId);
		this.change$.next({ students: [new Change(undefined, studentId)] });
		return true;
	}

	removeStudent(studentId: number) {
		const index = this.students.indexOf(studentId);
		if (index === -1) return false;

		const deckStudent = this.students.splice(index, 1);
		this.change$.next({ students: [new Change(deckStudent[0], undefined)] });
		return true;
	}

	updateRequiredItems(dataService: DataService) {
		this.required[DeckStocksClear]();

		for (const studentId of this.students) {
			const deckStudent = dataService.deck.students.get(studentId);
			for (const [id, amount] of deckStudent.requiredItems) {
				this.required[id] += amount;
			}
		}

		this.updateStages(dataService);
		this.requiredUpdated$.next();
	}

	updateStages(dataService: DataService) {
		const candidates = dataService.stages.campaign
			.filter((campaign) => dataService.deck.options.showCampaignHard || campaign.difficulty !== CampaignDifficulty.Hard)
			.filter((campaign) => campaign.entryCost.every(([itemId]) => itemId === ACTION_POINT_ID))
			.map((campaign) => {
				let weight = 0;
				const cost = campaign.entryCost.find(([itemId]) => itemId === ACTION_POINT_ID)?.[1] ?? 0;
				if (cost > 0) {
					for (let [rewardId, rate] of campaign.rewards.default) {
						const required = this.required[rewardId];
						if (required > 0) {
							let scale = 1;
							if (campaign.difficulty === CampaignDifficulty.Hard) {
								const reward = dataService.getStuff(rewardId);
								if (reward == null) {
									scale = 0;
								} else if (reward.category !== StuffCategory.SecretStone) {
									scale = 0.5;
								}
							}
							weight += Math.max(0, required - dataService.deck.stocks[rewardId]) * rate * scale;
						}
					}
				}

				return {
					weight: cost > 0 ? weight / cost : 0,
					campaign,
				};
			})
			.filter(({ weight }) => weight > 0)
			.sort((a, b) => b.weight - a.weight)
			.slice(0, 20)
			.map(({ campaign }) => {
				let amount = 0;
				for (let [rewardId, rate] of campaign.rewards.default) {
					const required = this.required[rewardId];
					if (required > 0) amount = Math.max(amount, Math.max(0, required - dataService.deck.stocks[rewardId]) / rate);
				}

				return { id: campaign.id, amount: Math.ceil(amount) };
			});

		this.stages.splice(0, this.stages.length, ...candidates);
	}

	sortStudents(dataService: DataService, option: StudentSortOption, direction: -1 | 1) {
		if (option == null) {
			this.students.reverse();
			return;
		}
		const compare = (a: string | number, b: string | number) => {
			return typeof a === 'string' && typeof b === 'string' ? a.localeCompare(b) : +a - +b;
		};

		this.students.sort((aId, bId) => {
			const a = dataService.deck.students.get(aId);
			const b = dataService.deck.students.get(bId);

			for (const key of option.key) {
				const aValue = key(a);
				const bValue = key(b);
				const diff = compare(aValue, bValue);
				if (diff !== 0) return direction * diff;
			}
			return 0;
		});
	}

	sortItems(dataService: DataService, option: ItemSortOption, direction: -1 | 1) {
		if (option == null) {
			dataService.stockables.reverse();
			return;
		}
		const compare = (a: string | number, b: string | number) => {
			return typeof a === 'string' && typeof b === 'string' ? a.localeCompare(b) : +a - +b;
		};

		dataService.stockables.sort((aId, bId) => {
			const a = dataService.getStuff(aId);
			const b = dataService.getStuff(bId);

			for (const key of option.key) {
				const aValue = key(a);
				const bValue = key(b);
				const diff = compare(aValue, bValue);
				if (diff !== 0) return direction * diff;
			}
			return 0;
		});
	}
}
