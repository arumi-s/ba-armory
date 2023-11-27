import { Exclude, Expose, plainToInstance, Type } from 'class-transformer';
import { Change, ChangeDispatcher, Clamp, ClampTarget, dispatchChanges, Dispatcher, hasKeys, WatchBoolean } from 'prop-change-decorators';
import { debounceTime, filter, merge, of, Subject, tap } from 'rxjs';

import { ALT_OFFSET, ELIGMA_ID } from './deck';
import { DeckEquipment } from './deck-equipment';
import { DeckSkill } from './deck-skill';
import { SkillType, Terrain } from './enum';
import { Student } from './student';

import type { DataService } from '../services/data.service';

@Exclude()
export class DeckStudent {
	@Expose({ name: 'id' })
	readonly id: number = 0;

	@Expose({ name: 'level' })
	@Clamp({ name: 'level' })
	private __level__: number = 1;
	public level: number;
	@Expose({ name: 'levelTarget' })
	@ClampTarget({ name: 'level' })
	private __levelTarget__: number = 0;
	levelTarget: number;
	readonly levelMin: number = 1;
	readonly levelMax: number = 0;

	@Expose({ name: 'star' })
	@Clamp({ name: 'star' })
	private __star__: number = 1;
	public star: number;
	@Expose({ name: 'starTarget' })
	@ClampTarget({ name: 'star' })
	private __starTarget__: number = 0;
	starTarget: number;
	readonly starMin: number = 0;
	readonly starMax: number = 5;

	@Expose({ name: 'weapon' })
	@Clamp({ name: 'weapon' })
	private __weapon__: number = 1;
	weapon: number;
	@Expose({ name: 'weaponTarget' })
	@ClampTarget({ name: 'weapon' })
	private __weaponTarget__: number = 0;
	weaponTarget: number;
	readonly weaponMin: number = 0;
	readonly weaponMax: number = 3;

	@Expose({ name: 'gear' })
	@Clamp({ name: 'gear' })
	private __gear__: number = 0;
	gear: number;
	@Expose({ name: 'gearTarget' })
	@ClampTarget({ name: 'gear' })
	private __gearTarget__: number = 0;
	gearTarget: number;
	readonly gearMin: number = 0;
	readonly gearMax: number = 2;

	@Expose({ name: 'elephCost' })
	@Clamp({ name: 'elephCost', target: '' })
	private __elephCost__: number = 1;
	elephCost: number;
	readonly elephCostMin: number = 1;
	readonly elephCostMax: number = 5;

	@Expose({ name: 'elephRemain' })
	@Clamp({ name: 'elephRemain', target: '' })
	private __elephRemain__: number = 20;
	elephRemain: number;
	readonly elephRemainMin: number = 0;
	readonly elephRemainMax: number = 20;

	@WatchBoolean({ name: 'isTarget' })
	private __isTarget__: boolean = false;
	isTarget: boolean;

	@Expose({ name: 'skills' })
	@Type(() => DeckSkill)
	readonly skills: DeckSkill[] = [];

	@Expose({ name: 'equipments' })
	@Type(() => DeckEquipment)
	readonly equipments: DeckEquipment[] = [];

	readonly requiredItems = new Map<number, number>();

	@Dispatcher()
	readonly change$: ChangeDispatcher<DeckStudent>;
	readonly requiredUpdated$ = new Subject<void>();

	static fromStudent(dataService: DataService, student: Student) {
		const deckStudent = plainToInstance(
			DeckStudent,
			{
				id: student.id,
				level: 1,
				star: student.starGrade,
				weapon: 0,
				gear: 0,
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
		const student = dataService.getStudent(this.id);

		(this as { levelMax: number }).levelMax = dataService.studentLevelMax;
		(this as { starMin: number }).starMin = student.starGrade;
		(this as { gearMax: number }).gearMax = student.gear?.tierUpMaterial?.length ? student.gear.tierUpMaterial.length + 1 : 0;

		this.level = this.level;
		this.star = this.star;
		this.weapon = this.weapon;
		this.gear = this.gear;
		this.elephCost = this.elephCost;
		this.elephRemain = this.elephRemain ?? 20;

		this.levelTarget = this.levelTarget ?? -1;
		this.starTarget = this.starTarget ?? -1;
		this.weaponTarget = this.weaponTarget ?? -1;
		this.gearTarget = this.gearTarget ?? -1;

		this.hydrateEquipments(dataService, student);
		this.hydrateSkills(dataService, student);

		this.change$.subscribe((changes) => {
			if (hasKeys(changes, 'star')) {
				if (changes.star.currentValue < this.starMax && this.weapon > this.weaponMin) {
					this.weapon = this.weaponMin;
				}
			}
			if (hasKeys(changes, 'starTarget')) {
				if (changes.starTarget.currentValue < this.starMax && this.weaponTarget > this.weaponMin) {
					this.weaponTarget = this.weaponMin;
				}
			}
		});

		merge(
			of(null),
			this.change$.pipe(
				filter((changes) =>
					hasKeys(
						changes,
						'equipments',
						'skills',
						'star',
						'starTarget',
						'weapon',
						'weaponTarget',
						'gear',
						'gearTarget',
						'elephCost',
						'elephRemain'
					)
				),
				debounceTime(100)
			)
		).subscribe(() => {
			this.updateRequiredItems(dataService);
			this.requiredUpdated$.next();
		});
	}

	isAlt() {
		return this.id > ALT_OFFSET;
	}

	getAdaptations(dataService: DataService): Record<Terrain, number> {
		const student = dataService.getStudent(this.id);

		const adaptations = {
			[Terrain.Indoor]: student.indoorBattleAdaptation,
			[Terrain.Outdoor]: student.outdoorBattleAdaptation,
			[Terrain.Street]: student.streetBattleAdaptation,
		};

		if (this.weapon === this.weaponMax) {
			adaptations[student.weapon.adaptationType] += student.weapon.adaptationValue;
		}

		return adaptations;
	}

	private hydrateSkills(this: DeckStudent, dataService: DataService, student: Student) {
		if (Array.isArray(this.skills)) {
			this.skills.splice(4, this.skills.length);
		}

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
			dispatchChanges(this, { skills: this.skills.map((skill) => new Change(undefined, skill)) });
		}

		for (const deckSkill of this.skills) {
			deckSkill.hydrate(dataService);
			deckSkill.change$.subscribe((changes) => {
				dispatchChanges(this, { skills: { [deckSkill.index]: changes } });
			});
		}
	}

	private hydrateEquipments(this: DeckStudent, dataService: DataService, student: Student) {
		if (this.equipments == null || (Array.isArray(this.equipments) && this.equipments.length === 0)) {
			(this as { equipments: DeckEquipment[] }).equipments = plainToInstance(
				DeckEquipment,
				student.equipment.map((_, equipmentIndex): Partial<DeckEquipment> => ({ studentId: student.id, index: equipmentIndex, tier: 0 })),
				{ excludeExtraneousValues: true, exposeDefaultValues: true }
			);
			dispatchChanges(this, { equipments: this.equipments.map((equipment) => new Change(undefined, equipment)) });
		}

		for (const deckEquipment of this.equipments) {
			deckEquipment.hydrate(dataService);
			deckEquipment.change$.subscribe((changes) => {
				dispatchChanges(this, { equipments: { [deckEquipment.index]: changes } });
			});
		}
	}

	private updateRequiredItems(dataService: DataService) {
		const student = dataService.getStudent(this.id);
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

		/* Gear */
		{
			const fromGear = Math.max(this.gear, 1);
			const toGear = this.gearTarget;

			if (fromGear < toGear) {
				const gear = student.gear;

				const tierMaterialIds = gear.tierUpMaterial;
				const tierAmounts = gear.tierUpMaterialAmount;

				for (let level = fromGear; level < toGear; level++) {
					const materialIds = tierMaterialIds[level - 1];
					const amounts = tierAmounts[level - 1];

					for (let index = 0; index < materialIds.length; index++) {
						const materialId = materialIds[index];
						this.requiredItems.set(materialId, (this.requiredItems.get(materialId) ?? 0) + (amounts[index] ?? 0));
					}
				}
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
