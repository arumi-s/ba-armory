import { Expose, Type } from 'class-transformer';
import { CDN_BASE } from './constant';
import { SkillType, FavorStatType } from './enum';

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
		return `${CDN_BASE}/images/skill/${this.icon}.png`;
	}
}
