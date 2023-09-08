import { Expose, Type } from 'class-transformer';

import { environment } from '../../environments/environment';
import { FavorStatType, SkillType } from './enum';

export class Skill {
	@Expose({ name: 'SkillType' })
	skillType: SkillType;
	@Expose({ name: 'Name' })
	name: string;
	@Expose({ name: 'Desc' })
	desc: string;
	@Expose({ name: 'Parameters' })
	@Type(() => Array)
	parameters: string[][];
	@Expose({ name: 'Cost' })
	@Type(() => Number)
	cost?: number[];
	@Expose({ name: 'Icon' })
	icon: string;
	@Expose({ name: 'Stat' })
	@Type(() => String)
	stat?: FavorStatType[];
	@Expose({ name: 'SummonStat' })
	@Type(() => String)
	summonStat?: FavorStatType[];
	@Expose({ name: 'SummonStatCoefficient' })
	@Type(() => Array)
	summonStatCoefficient?: number[][];

	get iconUrl() {
		return `${environment.CDN_BASE}/images/skill/${this.icon}.webp`;
	}
}
