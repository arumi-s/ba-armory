export type IsReleased = [japan: boolean, international: boolean];

export type EquipmentStatValue = [base: number, grow: number];

export type EquipmentRecipe = [id: number, amount: number];

export type EntryCost = [id: number, amount: number];

export enum EquipmentRarity {
	N = 'N',
}

export enum EquipmentStatType {
	AttackPower_Base = 'AttackPower_Base',
	AttackPower_Coefficient = 'AttackPower_Coefficient',
	CriticalDamageRate_Base = 'CriticalDamageRate_Base',
	CriticalPoint_Base = 'CriticalPoint_Base',
	AccuracyPoint_Base = 'AccuracyPoint_Base',
	MaxHP_Coefficient = 'MaxHP_Coefficient',
	MaxHP_Base = 'MaxHP_Base',
	DefensePower_Base = 'DefensePower_Base',
	HealEffectivenessRate_Base = 'HealEffectivenessRate_Base',
	DodgePoint_Base = 'DodgePoint_Base',
	OppressionResist_Coefficient = 'OppressionResist_Coefficient',
	CriticalChanceResistPoint_Base = 'CriticalChanceResistPoint_Base',
	CriticalDamageResistRate_Base = 'CriticalDamageResistRate_Base',
	HealPower_Coefficient = 'HealPower_Coefficient',
	OppressionPower_Coefficient = 'OppressionPower_Coefficient',
}

export enum EquipmentCategory {
	Badge = 'Badge',
	Bag = 'Bag',
	Charm = 'Charm',
	Gloves = 'Gloves',
	Hairpin = 'Hairpin',
	Hat = 'Hat',
	Necklace = 'Necklace',
	Shoes = 'Shoes',
	Watch = 'Watch',
}

export enum StuffCategory {
	Background = 'Background',
	Bed = 'Bed',
	Box = 'Box',
	Chair = 'Chair',
	CharacterExpGrowth = 'CharacterExpGrowth',
	Closet = 'Closet',
	Coin = 'Coin',
	Collectible = 'Collectible',
	Consumable = 'Consumable',
	Currency = 'Currency',
	Decorations = 'Decorations',
	Equipment = 'Equipment',
	Exp = 'Exp',
	Favor = 'Favor',
	Floor = 'Floor',
	FloorDecoration = 'FloorDecoration',
	FurnitureEtc = 'FurnitureEtc',
	Furnitures = 'Furnitures',
	HomeAppliance = 'HomeAppliance',
	Interiors = 'Interiors',
	Material = 'Material',
	Prop = 'Prop',
	SecretStone = 'SecretStone',
	Table = 'Table',
	WallDecoration = 'WallDecoration',
	Wallpaper = 'Wallpaper',
	WeaponExpGrowthA = 'WeaponExpGrowthA',
	WeaponExpGrowthB = 'WeaponExpGrowthB',
	WeaponExpGrowthC = 'WeaponExpGrowthC',
	WeaponExpGrowthZ = 'WeaponExpGrowthZ',
}

export const ItemCategory = Object.assign({}, StuffCategory, EquipmentCategory);
export type ItemCategory = EquipmentCategory | StuffCategory;

export enum ArmorType {
	LightArmor = 'LightArmor',
	HeavyArmor = 'HeavyArmor',
	Unarmed = 'Unarmed',
	Structure = 'Structure',
	ElasticArmor = 'ElasticArmor',
	Normal = 'Normal',
}

export enum BulletType {
	Normal = 'Normal',
	Pierce = 'Pierce',
	Explosion = 'Explosion',
	Mystic = 'Mystic',
	Sonic = 'Sonic',
}

export enum FavorStatType {
	AccuracyPoint = 'AccuracyPoint',
	AmmoCount = 'AmmoCount',
	AttackPower = 'AttackPower',
	AttackSpeed = 'AttackSpeed',
	BlockRate = 'BlockRate',
	CriticalDamageRate = 'CriticalDamageRate',
	CriticalPoint = 'CriticalPoint',
	DefensePenetration = 'DefensePenetration',
	DefensePower = 'DefensePower',
	DodgePoint = 'DodgePoint',
	HealEffectivenessRate = 'HealEffectivenessRate',
	HealPower = 'HealPower',
	MaxHP = 'MaxHP',
	MoveSpeed = 'MoveSpeed',
	OppressionPower = 'OppressionPower',
	StabilityPoint = 'StabilityPoint',
}

export enum Position {
	Back = 'Back',
	Front = 'Front',
	Middle = 'Middle',
}

export enum SkillType {
	Ex = 'Ex',
	Gearnormal = 'GearPublic',
	Normal = 'Public',
	Passive = 'Passive',
	Sub = 'ExtraPassive',
	Weaponpassive = 'WeaponPassive',
}

export enum SquadType {
	Main = 'Main',
	Support = 'Support',
}

export enum TacticRole {
	DamageDealer = 'DamageDealer',
	Healer = 'Healer',
	Supporter = 'Supporter',
	Tanker = 'Tanker',
	Vehicle = 'Vehicle',
}

export enum AdaptationType {
	Indoor = 'Indoor',
	Outdoor = 'Outdoor',
	Street = 'Street',
}

export enum StatLevelUpType {
	LateBloom = 'LateBloom',
	Premature = 'Premature',
	Standard = 'Standard',
}

export enum WeaponType {
	Ar = 'AR',
	Gl = 'GL',
	Hg = 'HG',
	MT = 'MT',
	Mg = 'MG',
	Rg = 'RG',
	Rl = 'RL',
	Sg = 'SG',
	Smg = 'SMG',
	Sr = 'SR',
}

export enum CampaignDifficulty {
	Normal = 0,
	Hard = 1,
}

export enum Terrain {
	Indoor = 'Indoor',
	Outdoor = 'Outdoor',
	Street = 'Street',
}

export enum RewardType {
	Default = 'Default',
	FirstClear = 'FirstClear',
	ThreeStar = 'ThreeStar',
}
