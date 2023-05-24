import { Exclude, Expose } from 'class-transformer';
import { ChangeDispatcher, Clamp, ClampTarget, Dispatcher } from 'prop-change-decorators';

import { SkillType } from './enum';

import type { DataService } from '../services/data.service';

@Exclude()
export class DeckSkill {
	@Expose({ name: 'studentId' })
	readonly studentId: number = 0;

	@Expose({ name: 'index' })
	readonly index: number = 0;

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

	@Dispatcher()
	readonly change$: ChangeDispatcher<DeckSkill>;

	hydrate(dataService: DataService) {
		const skill = dataService.students.get(this.studentId).skills[this.index];

		(this as { levelMax: number }).levelMax = skill?.skillType === SkillType.Ex ? 5 : 10;

		this.level = this.level;

		this.levelTarget = this.levelTarget ?? -1;
	}
}
