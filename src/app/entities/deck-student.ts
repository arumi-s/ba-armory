import { Type, Expose, plainToInstance, Exclude } from 'class-transformer';
import { debounceTime, filter, of, merge, Subject } from 'rxjs';
import type { DataService } from '../services/data.service';
import { DeckEquipment } from './deck-equipment';
import { DeckSkill } from './deck-skill';
import { Student } from './student';
import { Change, Changes } from './change';
import { SkillType } from './enum';

export class DeckStudent {
	@Expose({ name: 'id' })
	readonly id: number = 0;

	@Expose({ name: 'level' })
	private __level__: number = 1;

	get level() {
		return this.__level__;
	}

	set level(level: number) {
		if (isNaN(level)) level = 0;
		level = Math.max(Math.min(Math.floor(level), this.levelMax), this.levelMin);
		if (this.__level__ !== level) {
			const levelOld = this.__level__;
			this.__level__ = level;
			if (this.__levelTarget__ < this.__level__) {
				const levelTargetOld = this.__levelTarget__;
				this.__levelTarget__ = this.__level__;
				this.change$.next({
					level: new Change(levelOld, this.__level__),
					levelTarget: new Change(levelTargetOld, this.__levelTarget__),
				});
			} else {
				this.change$.next({ level: new Change(levelOld, this.__level__) });
			}
		}
	}

	@Expose({ name: 'levelTarget' })
	private __levelTarget__: number = 0;

	get levelTarget() {
		return this.__levelTarget__;
	}

	set levelTarget(levelTarget: number) {
		if (isNaN(levelTarget)) levelTarget = 0;
		levelTarget = Math.max(Math.min(Math.floor(levelTarget), this.levelMax), this.level, this.levelMin);
		if (this.__levelTarget__ !== levelTarget) {
			const levelTargetOld = this.__levelTarget__;
			this.__levelTarget__ = levelTarget;
			this.change$.next({ levelTarget: new Change(levelTargetOld, this.__levelTarget__) });
		}
	}

	@Exclude()
	readonly levelMin: number = 0;

	@Exclude()
	readonly levelMax: number = 0;

	@Expose({ name: 'star' })
	private __star__: number = 1;

	get star() {
		return this.__star__;
	}

	set star(star: number) {
		if (isNaN(star)) star = 0;
		star = Math.max(Math.min(Math.floor(star), this.starMax), this.starMin);
		if (this.__star__ !== star) {
			const starOld = this.__star__;
			this.__star__ = star;
			if (this.__starTarget__ < this.__star__) {
				const starTargetOld = this.__starTarget__;
				this.__starTarget__ = this.__star__;
				this.change$.next({
					star: new Change(starOld, this.__star__),
					starTarget: new Change(starTargetOld, this.__starTarget__),
				});
			} else {
				this.change$.next({ star: new Change(starOld, this.__star__) });
			}
		}
	}

	@Expose({ name: 'starTarget' })
	private __starTarget__: number = 0;

	get starTarget() {
		return this.__starTarget__;
	}

	set starTarget(starTarget: number) {
		if (isNaN(starTarget)) starTarget = 0;
		starTarget = Math.max(Math.min(Math.floor(starTarget), this.starMax), this.star, this.starMin);
		if (this.__starTarget__ !== starTarget) {
			const starTargetOld = this.__starTarget__;
			this.__starTarget__ = starTarget;
			this.change$.next({ starTarget: new Change(starTargetOld, this.__starTarget__) });
		}
	}

	@Exclude()
	readonly starMin: number = 0;

	@Exclude()
	readonly starMax: number = 0;

	@Expose({ name: 'weapon' })
	private __weapon__: number = 1;

	get weapon() {
		return this.__weapon__;
	}

	set weapon(weapon: number) {
		if (isNaN(weapon)) weapon = 0;
		weapon = Math.max(Math.min(Math.floor(weapon), this.weaponMax), this.weaponMin);
		if (this.__weapon__ !== weapon) {
			const weaponOld = this.__weapon__;
			this.__weapon__ = weapon;
			if (this.__weaponTarget__ < this.__weapon__) {
				const weaponTargetOld = this.__weaponTarget__;
				this.__weaponTarget__ = this.__weapon__;
				this.change$.next({
					weapon: new Change(weaponOld, this.__weapon__),
					weaponTarget: new Change(weaponTargetOld, this.__weaponTarget__),
				});
			} else {
				this.change$.next({ weapon: new Change(weaponOld, this.__weapon__) });
			}
		}
	}

	@Expose({ name: 'weaponTarget' })
	private __weaponTarget__: number = 0;

	get weaponTarget() {
		return this.__weaponTarget__;
	}

	set weaponTarget(weaponTarget: number) {
		if (isNaN(weaponTarget)) weaponTarget = 0;
		weaponTarget = Math.max(Math.min(Math.floor(weaponTarget), this.weaponMax), this.weapon, this.weaponMin);
		if (this.__weaponTarget__ !== weaponTarget) {
			const weaponTargetOld = this.__weaponTarget__;
			this.__weaponTarget__ = weaponTarget;
			this.change$.next({ weaponTarget: new Change(weaponTargetOld, this.__weaponTarget__) });
		}
	}

	@Exclude()
	readonly weaponMin: number = 0;

	@Exclude()
	readonly weaponMax: number = 0;

	@Expose({ name: 'isTarget' })
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

	@Exclude()
	readonly requiredItems = new Map<number, number>();

	@Exclude()
	readonly change$ = new Subject<Changes<DeckStudent>>();

	@Exclude()
	readonly requiredUpdated$ = new Subject<void>();

	static fromStudent(dataService: DataService, student: Student) {
		const deckStudent = plainToInstance(
			DeckStudent,
			{
				id: student.id,
				level: 1,
				star: student.starGrade,
				weapon: 0,
				skills: student.skills.map((_, skillIndex) => ({
					studentId: student.id,
					index: skillIndex,
					level: 1,
				})),
				equipments: student.equipment.map((_, equipmentIndex) => ({ studentId: student.id, index: equipmentIndex, tier: 0 })),
			},
			{ excludeExtraneousValues: true }
		);
		deckStudent.hydrate(dataService);
		return deckStudent;
	}

	hydrate(dataService: DataService) {
		const student = dataService.students.get(this.id);

		(this as any).levelMin = 1;
		(this as any).levelMax = 75;
		(this as any).starMin = student.starGrade;
		(this as any).starMax = 5;
		(this as any).weaponMin = 0;
		(this as any).weaponMax = 3;

		this.level = this.level;
		this.star = this.star;
		this.weapon = this.weapon;

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
						changes.hasOwnProperty('weaponTarget')
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
			(this as any).skills = plainToInstance(
				DeckSkill,
				student.skills.map(
					(_, skillIndex): Partial<DeckSkill> => ({
						studentId: student.id,
						index: skillIndex,
						level: 1,
					})
				),
				{ excludeExtraneousValues: true }
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
			(this as any).equipments = plainToInstance(
				DeckEquipment,
				student.equipment.map((_, equipmentIndex): Partial<DeckEquipment> => ({ studentId: student.id, index: equipmentIndex, tier: 0 })),
				{ excludeExtraneousValues: true }
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
	}
}
