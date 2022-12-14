import { Exclude, Expose, plainToInstance, Type } from 'class-transformer';
import { debounceTime, filter, merge, of, Subject } from 'rxjs';

import { Stat, StatTarget } from '../decorators/stat';
import { Change, Changes } from './change';
import { ELIGMA_ID } from './deck';
import { DeckEquipment } from './deck-equipment';
import { DeckSkill } from './deck-skill';
import { SkillType } from './enum';
import { Student } from './student';

import type { DataService } from '../services/data.service';
@Exclude()
export class DeckStudent {
	@Expose({ name: 'id' })
	readonly id: number = 0;

	@Expose({ name: 'level' })
	@Stat({ name: 'level' })
	private __level__: number = 1;
	public level: number;
	@Expose({ name: 'levelTarget' })
	@StatTarget({ name: 'level' })
	private __levelTarget__: number = 0;
	levelTarget: number;
	readonly levelMin: number = 1;
	readonly levelMax: number = 0;

	@Expose({ name: 'star' })
	@Stat({ name: 'star' })
	private __star__: number = 1;
	public star: number;
	@Expose({ name: 'starTarget' })
	@StatTarget({ name: 'star' })
	private __starTarget__: number = 0;
	starTarget: number;
	readonly starMin: number = 0;
	readonly starMax: number = 5;

	@Expose({ name: 'weapon' })
	@Stat({ name: 'weapon' })
	private __weapon__: number = 1;
	weapon: number;
	@Expose({ name: 'weaponTarget' })
	@StatTarget({ name: 'weapon' })
	private __weaponTarget__: number = 0;
	weaponTarget: number;
	readonly weaponMin: number = 0;
	readonly weaponMax: number = 3;

	@Expose({ name: 'elephCost' })
	@Stat({ name: 'elephCost', target: false })
	private __elephCost__: number = 1;
	elephCost: number;
	readonly elephCostMin: number = 1;
	readonly elephCostMax: number = 5;

	@Expose({ name: 'elephRemain' })
	@Stat({ name: 'elephRemain', target: false })
	private __elephRemain__: number = 20;
	elephRemain: number;
	readonly elephRemainMin: number = 0;
	readonly elephRemainMax: number = 20;

	private __isTarget__: boolean = false;
	get isTarget(): boolean {
		return this.__isTarget__;
	}
	set isTarget(isTarget: boolean) {
		isTarget = !!isTarget;
		if (this.__isTarget__ !== isTarget) {
			const isTargetOld = this.__isTarget__;
			this.__isTarget__ = isTarget;
			this.change$.next({ isTarget: new Change(isTargetOld as false, this.__isTarget__ as false) });
		}
	}

	@Expose({ name: 'skills' })
	@Type(() => DeckSkill)
	readonly skills: DeckSkill[] = [];

	@Expose({ name: 'equipments' })
	@Type(() => DeckEquipment)
	readonly equipments: DeckEquipment[] = [];

	readonly requiredItems = new Map<number, number>();

	readonly change$ = new Subject<Changes<DeckStudent>>();
	readonly requiredUpdated$ = new Subject<void>();

	static fromStudent(dataService: DataService, student: Student) {
		const deckStudent = plainToInstance(
			DeckStudent,
			{
				id: student.id,
				level: 1,
				star: student.starGrade,
				weapon: 0,
				elephCost: 1,
				elephRemain: 20,
				skills: student.skills.map((_, skillIndex) => ({
					studentId: student.id,
					index: skillIndex,
					level: 1,
				})),
				equipments: student.equipment.map((_, equipmentIndex) => ({ studentId: student.id, index: equipmentIndex, tier: 0 })),
			},
			{ excludeExtraneousValues: true, exposeDefaultValues: true }
		);
		deckStudent.hydrate(dataService);
		return deckStudent;
	}

	hydrate(dataService: DataService) {
		const student = dataService.students.get(this.id);

		(this as { levelMax: number }).levelMax = dataService.studentLevelMax;
		(this as { starMin: number }).starMin = student.starGrade;

		this.level = this.level;
		this.star = this.star;
		this.weapon = this.weapon;
		this.elephCost = this.elephCost;
		this.elephRemain = this.elephRemain ?? 20;

		this.levelTarget = this.levelTarget ?? -1;
		this.starTarget = this.starTarget ?? -1;
		this.weaponTarget = this.weaponTarget ?? -1;

		this.hydrateEquipments(dataService, student);
		this.hydrateSkills(dataService, student);

		merge(
			of(null),
			this.change$.pipe(
				filter(
					(changes) =>
						changes.hasOwnProperty('equipments') ||
						changes.hasOwnProperty('skills') ||
						changes.hasOwnProperty('star') ||
						changes.hasOwnProperty('starTarget') ||
						changes.hasOwnProperty('weapon') ||
						changes.hasOwnProperty('weaponTarget') ||
						changes.hasOwnProperty('elephCost') ||
						changes.hasOwnProperty('elephRemain')
				),
				debounceTime(100)
			)
		).subscribe(() => {
			this.updateRequiredItems(dataService);
			this.requiredUpdated$.next();
		});
	}

	private hydrateSkills(dataService: DataService, student: Student) {
		if (this.skills == null || (Array.isArray(this.skills) && this.skills.length === 0)) {
			(this as { skills: DeckSkill[] }).skills = plainToInstance(
				DeckSkill,
				student.skills.map(
					(_, skillIndex): Partial<DeckSkill> => ({
						studentId: student.id,
						index: skillIndex,
						level: 1,
					})
				),
				{ excludeExtraneousValues: true, exposeDefaultValues: true }
			);
			this.change$.next({ skills: this.skills.map((skill) => new Change(undefined, skill)) });
		}

		for (const deckSkill of this.skills) {
			deckSkill.hydrate(dataService);
			deckSkill.change$.subscribe((changes) => {
				this.change$.next({ skills: { [deckSkill.index]: changes } });
			});
		}
	}

	private hydrateEquipments(dataService: DataService, student: Student) {
		if (this.equipments == null || (Array.isArray(this.equipments) && this.equipments.length === 0)) {
			(this as { equipments: DeckEquipment[] }).equipments = plainToInstance(
				DeckEquipment,
				student.equipment.map((_, equipmentIndex): Partial<DeckEquipment> => ({ studentId: student.id, index: equipmentIndex, tier: 0 })),
				{ excludeExtraneousValues: true, exposeDefaultValues: true }
			);
			this.change$.next({ equipments: this.equipments.map((equipment) => new Change(undefined, equipment)) });
		}

		for (const deckEquipment of this.equipments) {
			deckEquipment.hydrate(dataService);
			deckEquipment.change$.subscribe((changes) => {
				this.change$.next({ equipments: { [deckEquipment.index]: changes } });
			});
		}
	}

	private updateRequiredItems(dataService: DataService) {
		const student = dataService.students.get(this.id);
		this.requiredItems.clear();

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

			const deckSkill = this.skills[index];
			const levelMaterialIds = skill.skillType === SkillType.Ex ? student.skillExMaterial : student.skillMaterial;
			const levelAmounts = skill.skillType === SkillType.Ex ? student.skillExMaterialAmount : student.skillMaterialAmount;

			const fromLevel = deckSkill.level;
			const toLevel = deckSkill.levelTarget;

			for (let level = fromLevel; level < toLevel; level++) {
				const materialIds = level === 9 ? [9999] : levelMaterialIds[level - 1];
				const amounts = level === 9 ? [1] : levelAmounts[level - 1];

				for (let index = 0; index < materialIds.length; index++) {
					const materialId = materialIds[index];
					this.requiredItems.set(materialId, (this.requiredItems.get(materialId) ?? 0) + (amounts[index] ?? 0));
				}
			}
		});

		/* Equipments */
		student.equipment.forEach((equipmentCategory, index) => {
			const deckEquipment = this.equipments[index];
			const fromTier = deckEquipment.tier;
			const toTier = deckEquipment.tierTarget;
			const equipmentsMap = dataService.equipmentsByCategory.get(equipmentCategory);

			for (let tier = fromTier + 1; tier <= toTier; tier++) {
				const requiredEquipment = dataService.equipments.get(equipmentsMap.get(tier));
				if (requiredEquipment.recipe) {
					for (const [id, amount] of requiredEquipment.recipe) {
						this.requiredItems.set(id, (this.requiredItems.get(id) ?? 0) + amount);
					}
				} else {
					this.requiredItems.set(requiredEquipment.id, (this.requiredItems.get(requiredEquipment.id) ?? 0) + 1);
				}
			}
		});

		/* Stars */
		{
			const fromStar = this.star;
			const toStar = this.starTarget;

			if (fromStar < toStar) {
				this.requiredItems.set(
					student.id,
					(this.requiredItems.get(student.id) ?? 0) +
						Math.max(dataService.starSecretStoneAmount[toStar] - dataService.starSecretStoneAmount[fromStar], 0)
				);
			}
		}

		/* Weapons */
		{
			const fromWeapon = this.star === 5 ? this.weapon : 0;
			const toWeapon = this.weaponTarget;

			if (fromWeapon < toWeapon) {
				this.requiredItems.set(
					student.id,
					(this.requiredItems.get(student.id) ?? 0) +
						Math.max(dataService.weaponSecretStoneAmount[toWeapon] - dataService.weaponSecretStoneAmount[fromWeapon], 0)
				);
			}
		}

		/* Eleph */
		{
			const stock = dataService.deck.stocks[student.id];
			const required = this.requiredItems.get(student.id) ?? 0;
			let amount = Math.max(0, required - stock);

			if (amount > 0) {
				const costMax = this.elephCostMax;
				let cost = this.elephCost;
				let remain = cost === costMax ? Infinity : this.elephRemain;
				let total = 0;

				while (cost <= costMax) {
					const buy = Math.min(amount, remain);
					amount -= buy;
					total += buy * cost;
					cost++;
					remain = cost === costMax ? Infinity : 20;
				}

				this.requiredItems.set(ELIGMA_ID, total);
			}
		}
	}
}
