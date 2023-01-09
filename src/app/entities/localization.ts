import { AdaptationType, ArmorType, BulletType, ItemCategory, SquadType, TacticRole } from './enum';

export interface Localization {
	SquadType: { [key in SquadType]: string };
	BulletType: { [key in BulletType]: string };
	ArmorType: { [key in ArmorType]: string };
	TacticRole: { [key in TacticRole]: string };
	School: { [key: string]: string };
	AdaptationType: { [key in AdaptationType]: string };
	SchoolLong: { [key: string]: string };
	Club: { [key: string]: string };
	BossFaction: { [key: string]: string };
	Stat: { [key: string]: string };
	IsLimited: { [key: string]: string };
	furniture_set: { [key: string]: string };
	ItemCategory: { [key in ItemCategory]: string };
	EnemyTags: { [key: string]: string };
	EventName: { [key: string]: string };
	StageType: { [key: string]: string };
	ConquestMap: { [key: string]: string };
	StageTitle: { [key: string]: string };
	EnemyRank: { [key: string]: string };
	NodeQuality: { [key: string]: string };
	NodeTier: { [key: string]: string };
	WeaponPartExpBonus: { [key: string]: string };
	BuffType: { [key: string]: string };
	BuffName: { [key: string]: string };
	BuffNameLong: { [key: string]: string };
	BuffTooltip: { [key: string]: string };
	ui: { [key: string]: string };
}
