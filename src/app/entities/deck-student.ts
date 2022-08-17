import { Type, Expose, plainToInstance, Exclude } from 'class-transformer';
import { Subject } from 'rxjs';
import type { DataService } from '../services/data.service';
import { DeckEquipment } from './deck-equipment';
import { DeckSkill } from './deck-skill';
import { Student } from './student';
import { DeckChange } from './types';

export class DeckStudent {
	@Expose({ name: 'id' })
	readonly id: number = 0;

	@Expose({ name: 'level' })
	private __level__: number = 1;

	get level() {
		return this.__level__;
	}

	set level(level: number) {
		level = Math.max(Math.min(Math.floor(level), this.levelMax), this.levelMin);
		if (this.__level__ !== level) {
			this.__level__ = level;
			if (this.__levelTarget__ < this.__level__) {
				this.__levelTarget__ = this.__level__;
				this.change$.next({ level, levelTarget: this.__levelTarget__ });
			} else {
				this.change$.next({ level });
			}
		}
	}

	@Expose({ name: 'levelTarget' })
	private __levelTarget__: number = 0;

	get levelTarget() {
		return this.__levelTarget__;
	}

	set levelTarget(levelTarget: number) {
		levelTarget = Math.max(Math.min(Math.floor(levelTarget), this.levelMax), this.level, this.levelMin);
		if (this.__levelTarget__ !== levelTarget) {
			this.__levelTarget__ = levelTarget;
			this.change$.next({ levelTarget });
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
		star = Math.max(Math.min(Math.floor(star), this.starMax), this.starMin);
		if (this.__star__ !== star) {
			this.__star__ = star;
			if (this.__starTarget__ < this.__star__) {
				this.__starTarget__ = this.__star__;
				this.change$.next({ star, starTarget: this.__starTarget__ });
			} else {
				this.change$.next({ star });
			}
		}
	}

	@Expose({ name: 'starTarget' })
	private __starTarget__: number = 0;

	get starTarget() {
		return this.__starTarget__;
	}

	set starTarget(starTarget: number) {
		starTarget = Math.max(Math.min(Math.floor(starTarget), this.starMax), this.star, this.starMin);
		if (this.__starTarget__ !== starTarget) {
			this.__starTarget__ = starTarget;
			this.change$.next({ starTarget });
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
		weapon = Math.max(Math.min(Math.floor(weapon), this.weaponMax), this.weaponMin);
		if (this.__weapon__ !== weapon) {
			this.__weapon__ = weapon;
			if (this.__weaponTarget__ < this.__weapon__) {
				this.__weaponTarget__ = this.__weapon__;
				this.change$.next({ weapon, weaponTarget: this.__weaponTarget__ });
			} else {
				this.change$.next({ weapon });
			}
		}
	}

	@Expose({ name: 'weaponTarget' })
	private __weaponTarget__: number = 0;

	get weaponTarget() {
		return this.__weaponTarget__;
	}

	set weaponTarget(weaponTarget: number) {
		weaponTarget = Math.max(Math.min(Math.floor(weaponTarget), this.weaponMax), this.weapon, this.weaponMin);
		if (this.__weaponTarget__ !== weaponTarget) {
			this.__weaponTarget__ = weaponTarget;
			this.change$.next({ weaponTarget });
		}
	}

	@Exclude()
	readonly weaponMin: number = 0;

	@Exclude()
	readonly weaponMax: number = 0;

	@Expose({ name: 'skills' })
	@Type(() => DeckSkill)
	readonly skills: DeckSkill[] = [];

	@Expose({ name: 'equipments' })
	@Type(() => DeckEquipment)
	readonly equipments: DeckEquipment[] = [];

	@Exclude()
	readonly change$ = new Subject<DeckChange<DeckStudent>>();

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
		deckStudent.hydrate(dataService, student);
		return deckStudent;
	}

	hydrate(dataService: DataService, student: Student) {
		(this as any).levelMin = 1;
		(this as any).levelMax = 75;
		(this as any).starMin = student.starGrade;
		(this as any).starMax = 5;
		(this as any).weaponMin = 0;
		(this as any).weaponMax = 3;

		this.levelTarget = this.levelTarget ?? -1;
		this.starTarget = this.starTarget ?? -1;
		this.weaponTarget = this.weaponTarget ?? -1;

		this.hydrateEquipments(dataService, student);
		this.hydrateSkills(dataService, student);
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
			this.change$.next({ skills: this.skills });
		}

		for (const deckSkill of this.skills) {
			deckSkill.hydrate(dataService);
			deckSkill.change$.subscribe((change) => {
				this.change$.next({ skills: [change] });
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
			this.change$.next({ equipments: this.equipments });
		}

		for (const deckEquipment of this.equipments) {
			deckEquipment.hydrate(dataService);
			deckEquipment.change$.subscribe((change) => {
				this.change$.next({ equipments: [change] });
			});
		}
	}
}
