import { Expose, Type } from 'class-transformer';

import { CDN_BASE } from './constant';
import {
	AdaptationType,
	ArmorType,
	BulletType,
	EquipmentCategory,
	FavorStatType,
	IsReleased,
	Position,
	SquadType,
	StatLevelUpType,
	TacticRole,
	WeaponType,
} from './enum';
import { Skill } from './skill';

export class Gear {
	@Expose({ name: 'Released' })
	@Type(() => Boolean)
	released?: boolean[];
	@Expose({ name: 'StatType' })
	@Type(() => String)
	statType?: string[];
	@Expose({ name: 'StatValue' })
	@Type(() => Array)
	statValue?: Array<number[]>;
	@Expose({ name: 'Name' })
	name?: string;
	@Expose({ name: 'Desc' })
	desc?: string;
	@Expose({ name: 'Icon' })
	icon?: string;
	@Expose({ name: 'TierUpMaterial' })
	@Type(() => Array)
	tierUpMaterial?: Array<number[]>;
	@Expose({ name: 'TierUpMaterialAmount' })
	@Type(() => Array)
	tierUpMaterialAmount?: Array<number[]>;
}

export class Weapon {
	@Expose({ name: 'Name' })
	name: string;
	@Expose({ name: 'Desc' })
	desc: string;
	@Expose({ name: 'AdaptationType' })
	adaptationType: AdaptationType;
	@Expose({ name: 'AdaptationValue' })
	adaptationValue: number;
	@Expose({ name: 'AttackPower1' })
	attackPower1: number;
	@Expose({ name: 'AttackPower100' })
	attackPower100: number;
	@Expose({ name: 'MaxHP1' })
	maxHP1: number;
	@Expose({ name: 'MaxHP100' })
	maxHP100: number;
	@Expose({ name: 'HealPower1' })
	healPower1: number;
	@Expose({ name: 'HealPower100' })
	healPower100: number;
	@Expose({ name: 'StatLevelUpType' })
	statLevelUpType: StatLevelUpType;
}

export class Student {
	@Expose({ name: 'Id' })
	id: number;
	@Expose({ name: 'IsReleased' })
	@Type(() => Boolean)
	isReleased: IsReleased;
	@Expose({ name: 'DefaultOrder' })
	defaultOrder: number;
	@Expose({ name: 'DevName' })
	devName: string;
	@Expose({ name: 'Name' })
	name: string;
	@Expose({ name: 'School' })
	school: string;
	@Expose({ name: 'Club' })
	club: string;
	@Expose({ name: 'StarGrade' })
	starGrade: number;
	@Expose({ name: 'SquadType' })
	squadType: SquadType;
	@Expose({ name: 'TacticRole' })
	tacticRole: TacticRole;
	@Expose({ name: 'SummonIds' })
	@Type(() => Number)
	summonIds: number[];
	@Expose({ name: 'Position' })
	position: Position;
	@Expose({ name: 'BulletType' })
	bulletType: BulletType;
	@Expose({ name: 'ArmorType' })
	armorType: ArmorType;
	@Expose({ name: 'StreetBattleAdaptation' })
	streetBattleAdaptation: number;
	@Expose({ name: 'OutdoorBattleAdaptation' })
	outdoorBattleAdaptation: number;
	@Expose({ name: 'IndoorBattleAdaptation' })
	indoorBattleAdaptation: number;
	@Expose({ name: 'WeaponType' })
	weaponType: WeaponType;
	@Expose({ name: 'WeaponImg' })
	weaponImg: string;
	@Expose({ name: 'Cover' })
	cover: boolean;
	@Expose({ name: 'Equipment' })
	@Type(() => String)
	equipment: EquipmentCategory[];
	@Expose({ name: 'CollectionBG' })
	collectionBG: string;
	@Expose({ name: 'CollectionTexture' })
	collectionTexture: string;
	@Expose({ name: 'FamilyName' })
	familyName: string;
	@Expose({ name: 'FamilyNameRuby' })
	familyNameRuby: null | string;
	@Expose({ name: 'PersonalName' })
	personalName: string;
	@Expose({ name: 'SchoolYear' })
	schoolYear: string | null;
	@Expose({ name: 'CharacterAge' })
	characterAge: string;
	@Expose({ name: 'Birthday' })
	birthday: string;
	@Expose({ name: 'CharacterSSRNew' })
	characterSSRNew: null | string;
	@Expose({ name: 'ProfileIntroduction' })
	profileIntroduction: string;
	@Expose({ name: 'Hobby' })
	hobby: string;
	@Expose({ name: 'CharacterVoice' })
	characterVoice: string;
	@Expose({ name: 'BirthDay' })
	birthDay: string;
	@Expose({ name: 'ArtistName' })
	artistName: string;
	@Expose({ name: 'CharHeightMetric' })
	charHeightMetric: string;
	@Expose({ name: 'CharHeightImperial' })
	charHeightImperial: null | string;
	@Expose({ name: 'StabilityPoint' })
	stabilityPoint: number;
	@Expose({ name: 'AttackPower1' })
	attackPower1: number;
	@Expose({ name: 'AttackPower100' })
	attackPower100: number;
	@Expose({ name: 'MaxHP1' })
	maxHP1: number;
	@Expose({ name: 'MaxHP100' })
	maxHP100: number;
	@Expose({ name: 'DefensePower1' })
	defensePower1: number;
	@Expose({ name: 'DefensePower100' })
	defensePower100: number;
	@Expose({ name: 'HealPower1' })
	healPower1: number;
	@Expose({ name: 'HealPower100' })
	healPower100: number;
	@Expose({ name: 'DodgePoint' })
	dodgePoint: number;
	@Expose({ name: 'AccuracyPoint' })
	accuracyPoint: number;
	@Expose({ name: 'CriticalPoint' })
	criticalPoint: number;
	@Expose({ name: 'CriticalDamageRate' })
	criticalDamageRate: number;
	@Expose({ name: 'AmmoCount' })
	ammoCount: number;
	@Expose({ name: 'AmmoCost' })
	ammoCost: number;
	@Expose({ name: 'Range' })
	range: number;
	@Expose({ name: 'RegenCost' })
	regenCost: number;
	@Expose({ name: 'Skills' })
	@Type(() => Skill)
	skills: Skill[];
	@Expose({ name: 'FavorStatType' })
	@Type(() => String)
	favorStatType: FavorStatType[];
	@Expose({ name: 'FavorStatValue' })
	favorStatValue: Array<number[]>;
	@Expose({ name: 'FavorAlts' })
	@Type(() => Number)
	favorAlts: number[];
	@Expose({ name: 'MemoryLobby' })
	memoryLobby?: number;
	@Expose({ name: 'FurnitureInteraction' })
	@Type(() => Number)
	furnitureInteraction: number[];
	@Expose({ name: 'FavorItemTags' })
	@Type(() => String)
	favorItemTags: string[];
	@Expose({ name: 'FavorItemUniqueTags' })
	@Type(() => String)
	favorItemUniqueTags: string[];
	@Expose({ name: 'IsLimited' })
	isLimited: number;
	@Expose({ name: 'Weapon' })
	@Type(() => Weapon)
	weapon: Weapon;
	@Expose({ name: 'Gear' })
	@Type(() => Gear)
	gear: Gear;
	@Expose({ name: 'SkillExMaterial' })
	@Type(() => Array)
	skillExMaterial: Array<number[]>;
	@Expose({ name: 'SkillExMaterialAmount' })
	@Type(() => Array)
	skillExMaterialAmount: Array<number[]>;
	@Expose({ name: 'SkillMaterial' })
	@Type(() => Array)
	skillMaterial: Array<number[]>;
	@Expose({ name: 'SkillMaterialAmount' })
	@Type(() => Array)
	skillMaterialAmount: Array<number[]>;

	get collectionTextureUrl() {
		return `${CDN_BASE}/images/student/icon/${this.collectionTexture}.png`;
	}

	get collectionBGUrl() {
		return `${CDN_BASE}/images/background/${this.collectionBG}.jpg`;
	}

	get schoolIconUrl() {
		return `${CDN_BASE}/images/schoolicon/School_Icon_${this.school.toUpperCase()}_W.png`;
	}
}
