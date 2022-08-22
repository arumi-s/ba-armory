import { Expose, Exclude } from 'class-transformer';
import { Subject } from 'rxjs';
import type { DataService } from '../services/data.service';
import { SkillType } from './enum';
import { Change, Changes } from './change';

export class DeckSkill {
	@Expose({ name: 'studentId' })
	readonly studentId: number = 0;

	@Expose({ name: 'index' })
	readonly index: number = 0;

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

	@Exclude()
	readonly change$ = new Subject<Changes<DeckSkill>>();

	hydrate(dataService: DataService) {
		const skill = dataService.students.get(this.studentId).skills[this.index];

		(this as any).levelMin = 1;
		(this as any).levelMax = skill?.skillType === SkillType.Ex ? 5 : 10;

		this.level = this.level;

		this.levelTarget = this.levelTarget ?? -1;
	}
}
