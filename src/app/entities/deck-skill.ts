import { Expose, Exclude } from 'class-transformer';
import { Subject } from 'rxjs';
import type { DataService } from '../services/data.service';
import { SkillType } from './enum';
import { Change, Changes } from './change';
import { Stat, StatTarget } from '../decorators/stat';

@Exclude()
export class DeckSkill {
	@Expose({ name: 'studentId' })
	readonly studentId: number = 0;

	@Expose({ name: 'index' })
	readonly index: number = 0;

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

	readonly change$ = new Subject<Changes<DeckSkill>>();

	hydrate(dataService: DataService) {
		const skill = dataService.students.get(this.studentId).skills[this.index];

		(this as any).levelMax = skill?.skillType === SkillType.Ex ? 5 : 10;

		this.level = this.level;

		this.levelTarget = this.levelTarget ?? -1;
	}
}
