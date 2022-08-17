import { Type, Expose, Exclude, Transform } from 'class-transformer';
import { Subject, Subscription, debounceTime, filter } from 'rxjs';
import type { DataService } from '../services/data.service';
import { DeckOptions } from './deck-options';
import { DeckStocks, DeckStocksClear, transformStocks, wrapStocks } from './deck-stocks';
import { DeckStudent } from './deck-student';
import { CampaignDifficulty, SkillType, StuffCategory } from './enum';
import { DeckChange } from './types';

export const GACHA_OFFSET = 4000000;
export const CURRENCY_OFFSET = 3000000;
export const EQUIPMENT_OFFSET = 2000000;
export const FURNITURE_OFFSET = 1000000;
export const GOLD_ID = 1;
export const ACTION_POINT_ID = 5;

export class Deck {
	@Expose({ name: 'options' })
	@Type(() => DeckOptions)
	options: DeckOptions;

	@Expose({ name: 'students' })
	@Type(() => DeckStudent)
	students: DeckStudent[] = [];

	@Expose({ name: 'stocks' })
	@Transform(transformStocks, { toClassOnly: true })
	stocks: DeckStocks;

	@Exclude()
	readonly required: DeckStocks = wrapStocks({});

	@Exclude()
	readonly requiredByStudent = new Map<number, Map<number, number>>();

	@Exclude()
	readonly stages: {
		id: number;
		amount: number;
	}[] = [];

	@Exclude()
	readonly change$ = new Subject<DeckChange<Deck>>();

	@Exclude()
	readonly studentAdded$ = new Subject<DeckStudent>();

	@Exclude()
	readonly studentRemoved$ = new Subject<DeckStudent>();

	@Exclude()
	readonly requiredByStudentStaled$ = new Subject<DeckStudent>();

	@Exclude()
	readonly requiredStaled$ = new Subject<void>();

	@Exclude()
	readonly requiredUpdated$ = new Subject<void>();

	hydrate(dataService: DataService) {
		if (this.options == null) {
			this.options = new DeckOptions();
		}

		this.students = (this.students ?? []).filter((deckStudent) => {
			const student = dataService.students.get(deckStudent.id);
			if (student != null) {
				deckStudent.hydrate(dataService, student);
				return true;
			}
			return false;
		});

		if (this.stocks == null) {
			this.stocks = wrapStocks({});
		}

		const changeSubscriptionMap = new Map<number, Subscription>();

		const subscribeDeckStudent = (deckStudent: DeckStudent) => {
			unsubscribeDeckStudent(deckStudent);
			changeSubscriptionMap.set(
				deckStudent.id,
				deckStudent.change$
					.pipe(
						filter(
							(change) =>
								Object.prototype.hasOwnProperty.call(change, 'equipments') ||
								Object.prototype.hasOwnProperty.call(change, 'skills') ||
								//Object.prototype.hasOwnProperty.call(change, 'level') ||
								//Object.prototype.hasOwnProperty.call(change, 'levelTarget') ||
								Object.prototype.hasOwnProperty.call(change, 'star') ||
								Object.prototype.hasOwnProperty.call(change, 'starTarget') ||
								Object.prototype.hasOwnProperty.call(change, 'weapon') ||
								Object.prototype.hasOwnProperty.call(change, 'weaponTarget')
						),
						debounceTime(100)
					)
					.subscribe(() => {
						this.requiredByStudentStaled$.next(deckStudent);
					})
			);
		};
		const unsubscribeDeckStudent = (deckStudent: DeckStudent) => {
			changeSubscriptionMap.get(deckStudent.id)?.unsubscribe();
		};

		this.studentAdded$.subscribe((deckStudent) => {
			subscribeDeckStudent(deckStudent);
			this.requiredByStudentStaled$.next(deckStudent);
		});

		this.studentRemoved$.subscribe((deckStudent) => {
			unsubscribeDeckStudent(deckStudent);
			this.requiredByStudentStaled$.next(deckStudent);
		});

		this.requiredByStudentStaled$.subscribe((deckStudent) => {
			this.updateRequiredItemsByStudent(dataService, deckStudent);
			this.requiredStaled$.next();
		});

		this.requiredStaled$.pipe(debounceTime(200)).subscribe(() => {
			this.updateRequiredItems(dataService);
		});

		for (const deckStudent of this.students) {
			subscribeDeckStudent(deckStudent);
			this.requiredByStudentStaled$.next(deckStudent);
		}
		this.requiredStaled$.next();
	}

	findStudent(studentId: number) {
		return this.students.find((search) => search.id === studentId);
	}

	addStudent(dataService: DataService, studentId: number) {
		const searchDeckStudent = this.findStudent(studentId);
		if (searchDeckStudent) return searchDeckStudent;

		const student = dataService.students.get(studentId);
		if (student == null) return null;

		const deckStudent = DeckStudent.fromStudent(dataService, student);
		this.students.push(deckStudent);
		this.studentAdded$.next(deckStudent);
		return deckStudent;
	}

	removeStudent(studentId: number) {
		const index = this.students.findIndex((search) => search.id === studentId);

		if (index === -1) return null;

		const deckStudent = this.students.splice(index, 1);
		this.studentRemoved$.next(deckStudent[0]);
		return deckStudent[0];
	}

	updateRequiredItems(dataService: DataService) {
		this.required[DeckStocksClear]();

		for (const deckStudent of this.students) {
			for (const [id, amount] of this.requiredByStudent.get(deckStudent.id)) {
				this.required[id] += amount;
			}
		}

		this.updateStages(dataService);
		this.requiredUpdated$.next();
	}

	updateRequiredItemsByStudent(dataService: DataService, deckStudent: DeckStudent) {
		const student = dataService.students.get(deckStudent.id);
		const required = new Map<number, number>();

		/* Skills */
		student.skills.forEach((skill, index) => {
			if (
				skill.skillType !== SkillType.Ex &&
				skill.skillType !== SkillType.Normal &&
				skill.skillType !== SkillType.Passive &&
				skill.skillType !== SkillType.Sub
			) {
				return;
			}

			const deckSkill = deckStudent.skills[index];
			const levelMaterialIds = skill.skillType === SkillType.Ex ? student.skillExMaterial : student.skillMaterial;
			const levelAmounts = skill.skillType === SkillType.Ex ? student.skillExMaterialAmount : student.skillMaterialAmount;

			const fromLevel = deckSkill.level;
			const toLevel = deckSkill.levelTarget;

			for (let level = fromLevel; level < toLevel; level++) {
				const materialIds = level === 9 ? [9999] : levelMaterialIds[level - 1];
				const amounts = level === 9 ? [1] : levelAmounts[level - 1];

				for (let index = 0; index < materialIds.length; index++) {
					const materialId = materialIds[index];
					required.set(materialId, (required.get(materialId) ?? 0) + (amounts[index] ?? 0));
				}
			}
		});

		/* Equipments */
		student.equipment.forEach((equipmentCategory, index) => {
			const deckEquipment = deckStudent.equipments[index];
			const fromTier = deckEquipment.tier;
			const toTier = deckEquipment.tierTarget;
			const equipmentsMap = dataService.equipmentsByCategory.get(equipmentCategory);

			for (let tier = fromTier + 1; tier <= toTier; tier++) {
				const requiredEquipment = dataService.equipments.get(equipmentsMap.get(tier));
				if (requiredEquipment.recipe) {
					for (const [id, amount] of requiredEquipment.recipe) {
						required.set(id, (required.get(id) ?? 0) + amount);
					}
				} else {
					required.set(requiredEquipment.id, (required.get(requiredEquipment.id) ?? 0) + 1);
				}
			}
		});

		/* Stars */
		{
			const fromStar = deckStudent.star;
			const toStar = deckStudent.starTarget;

			if (fromStar < toStar) {
				required.set(
					student.id,
					(required.get(student.id) ?? 0) + Math.max(dataService.starSecretStoneAmount[toStar] - dataService.starSecretStoneAmount[fromStar], 0)
				);
			}
		}

		/* Weapons */
		{
			const fromWeapon = deckStudent.star === 5 ? deckStudent.weapon : 0;
			const toWeapon = deckStudent.weaponTarget;

			if (fromWeapon < toWeapon) {
				required.set(
					student.id,
					(required.get(student.id) ?? 0) +
						Math.max(dataService.weaponSecretStoneAmount[toWeapon] - dataService.weaponSecretStoneAmount[fromWeapon], 0)
				);
			}
		}

		this.requiredByStudent.set(deckStudent.id, required);
	}

	updateStages(dataService: DataService) {
		const candidates = dataService.stages.campaign
			//.filter((campaign) => campaign.difficulty === CampaignDifficulty.Normal)
			.filter((campaign) => campaign.entryCost.every(([itemId]) => itemId === ACTION_POINT_ID))
			.map((campaign) => {
				let weight = 0;
				const cost = campaign.entryCost.find(([itemId]) => itemId === ACTION_POINT_ID)?.[1] ?? 0;
				if (cost > 0) {
					for (let [rewardId, rate] of campaign.rewards.default) {
						const required = dataService.deck.required[rewardId];
						if (required > 0) {
							let scale = 1;
							if (campaign.difficulty === CampaignDifficulty.Hard) {
								const reward = rewardId > EQUIPMENT_OFFSET ? dataService.equipments.get(rewardId) : dataService.items.get(rewardId);
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
					const required = dataService.deck.required[rewardId];
					if (required > 0) amount = Math.max(amount, Math.max(0, required - dataService.deck.stocks[rewardId]) / rate);
				}

				return { id: campaign.id, amount: Math.ceil(amount) };
			});

		this.stages.splice(0, this.stages.length, ...candidates);
	}
}
