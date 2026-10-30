import { CDN_BASE, type LangId, type RegionId } from '../config';
import type {
	CampaignType,
	ConfigType,
	ItemType,
	LocalizationType,
	StudentType,
	EquipmentType
} from './schemas';
import {
	EquipmentCategory,
	FURNITURE_OFFSET,
	EQUIPMENT_OFFSET,
	StuffCategory,
	type ItemCategoryType,
	type TerrainType
} from './enums';
import { EXTRA_ICONS, RAID_ICONS } from './icons';

/** Typed lazy accessor over the loose localization document. */
export interface Localization {
	serverName(region: number): string;
	bulletType(type: string): string;
	armorType(type: string): string;
	squadType(type: string): string;
	adaptationType(type: string): string;
	skillTypeShort(type: string): string;
	stat(key: string): string;
	school(key: string): string;
	ui(key: string): string;
	itemCategory(key: string): string;
	stageType(key: string): string;
	shopCategory(key: string): string;
}

const group = (raw: LocalizationType, name: string): Record<string, unknown> =>
	(raw[name] as Record<string, unknown> | undefined) ?? {};
const text = (value: Record<string, unknown>, key: string): string => {
	const entry = value[key];
	return typeof entry === 'string' ? entry : key;
};

export function makeLocalization(raw: LocalizationType): Localization {
	return {
		serverName: (region) => text(group(raw, 'ServerName'), String(region)),
		bulletType: (type) => text(group(raw, 'BulletType'), type),
		armorType: (type) => text(group(raw, 'ArmorType'), type),
		squadType: (type) => text(group(raw, 'SquadType'), type),
		adaptationType: (type) => text(group(raw, 'AdaptationType'), type),
		skillTypeShort: (type) => text(group(raw, 'SkillTypeShort'), type),
		stat: (key) => text(group(raw, 'Stat'), key),
		school: (key) => text(group(raw, 'School'), key),
		ui: (key) => text(group(raw, 'UI'), key),
		itemCategory: (key) => text(group(raw, 'ItemCategory'), key),
		stageType: (key) => text(group(raw, 'StageType'), key),
		shopCategory: (key) => text(group(raw, 'ShopCategory'), key)
	};
}

export interface GameDataType {
	/** Affects index building; 0 = JP, 1 = Global, 2 = CN. */
	language: LangId;
	studentLevelMax: number;
	weaponLevelMax: number;
	students: ReadonlyMap<number, StudentType>;
	items: ReadonlyMap<number, ItemType>;
	/** Keys already include EQUIPMENT_OFFSET. */
	equipments: ReadonlyMap<number, EquipmentType>;
	stockables: readonly number[];
	equipmentsByCategory: ReadonlyMap<ItemCategoryType, ReadonlyMap<number, number>>;
	equipmentCategoryMaxTier: ReadonlyMap<ItemCategoryType, number>;
	universalBlueprintByCategory: ReadonlyMap<ItemCategoryType, number>;
	blueprintsByCategory: ReadonlyMap<ItemCategoryType, readonly number[]>;
	campaigns: readonly CampaignType[];
	localization: Localization;
	commonFavorItemTags: readonly string[];
	/** Squad icon picker source: raids, extras, student portraits, school badges. */
	icons: readonly string[];
}

/** Parsed language-dependent CDN documents — the fetch layer's output.
 *  Region-independent by design: region only participates in index building,
 *  so the same raw bundle can back any region's GameData. */
export interface RawGameDataType {
	language: LangId;
	config: ConfigType;
	students: StudentType[];
	items: ItemType[];
	equipments: EquipmentType[];
	/** All stages (any category) in document order; campaigns are filtered here. */
	stages: CampaignType[];
	localizationRaw: LocalizationType;
}

export function buildGameData(raw: RawGameDataType, region: RegionId): GameDataType {
	const regionConfig = raw.config.regions[region];
	const studentLevelMax = regionConfig?.studentMaxLevel ?? 90;
	const weaponLevelMax = regionConfig?.weaponMaxLevel ?? 60;

	const students = new Map(raw.students.map((student) => [student.id, student]));
	const items = new Map(raw.items.map((item) => [item.id, item]));
	const equipments = new Map(raw.equipments.map((equipment) => [equipment.id, equipment]));

	const stockables: number[] = [];
	const equipmentsByCategory = new Map<ItemCategoryType, Map<number, number>>();
	const equipmentCategoryMaxTier = new Map<ItemCategoryType, number>();
	const universalBlueprintByCategory = new Map<ItemCategoryType, number>();
	const blueprintsByCategory = new Map<ItemCategoryType, number[]>();

	const equipmentCategorySet = new Set<string>(Object.keys(EquipmentCategory));

	// Equipments first (release-filtered, per-tier first entry wins, recipe-less are stockable).
	for (const equipment of equipments.values()) {
		if (!equipment.isReleased[region]) continue;
		let categoryMap = equipmentsByCategory.get(equipment.category as ItemCategoryType);
		if (categoryMap == null) {
			categoryMap = new Map<number, number>();
			equipmentsByCategory.set(equipment.category as ItemCategoryType, categoryMap);
		}
		if (!categoryMap.has(equipment.tier)) {
			categoryMap.set(equipment.tier, equipment.id);
		}
		if (equipment.recipe == null && equipmentCategorySet.has(equipment.category)) {
			stockables.push(equipment.id);
			// Universal (tier 0) vs specific (tier ≥ 1) blueprints per category.
			if (equipment.tier === 0) {
				universalBlueprintByCategory.set(equipment.category as ItemCategoryType, equipment.id);
			} else {
				const list = blueprintsByCategory.get(equipment.category as ItemCategoryType);
				if (list) list.push(equipment.id);
				else blueprintsByCategory.set(equipment.category as ItemCategoryType, [equipment.id]);
			}
		}
	}

	for (const [category, categoryMap] of equipmentsByCategory) {
		equipmentCategoryMaxTier.set(category, Math.max(...categoryMap.keys()));
	}

	// Specific blueprints in substitution order: DESC by (tier, id) — the
	// universal pool covers the highest tiers first (T10 → T1).
	for (const list of blueprintsByCategory.values()) {
		list.sort((a, b) => {
			const ea = equipments.get(a)!;
			const eb = equipments.get(b)!;
			return eb.tier - ea.tier || b - a;
		});
	}

	// Then items (materials, elephs, favors).
	for (const item of items.values()) {
		if (
			(item.category === StuffCategory.Material &&
				item.id < 200000 &&
				(item.icon.includes('icon_material') ||
					item.icon.includes('icon_exskill') ||
					item.icon.includes('icon_skillbook'))) ||
			item.category === StuffCategory.SecretStone ||
			item.category === StuffCategory.Favor
		) {
			stockables.push(item.id);
		}
	}

	const campaigns = raw.stages.filter((stage) => stage.category === 'Campaign');

	const localization = makeLocalization(raw.localizationRaw);

	const icons: string[] = [...RAID_ICONS, ...EXTRA_ICONS];
	const schoolIcons: string[] = [];
	for (const student of students.values()) {
		icons.push(studentCollectionTextureUrl(student.id));
		const badge = schoolIconUrl(student.school);
		if (!schoolIcons.includes(badge)) {
			schoolIcons.push(badge);
		}
	}
	icons.push(...schoolIcons);

	return {
		language: raw.language,
		studentLevelMax,
		weaponLevelMax,
		students,
		items,
		equipments,
		stockables,
		equipmentsByCategory,
		equipmentCategoryMaxTier,
		universalBlueprintByCategory,
		blueprintsByCategory,
		campaigns,
		localization,
		commonFavorItemTags: raw.config.commonFavorItemTags as string[],
		icons
	};
}

/* ------------------------------------------------------------------ */
/* Lookups & image URLs                                                */
/* ------------------------------------------------------------------ */

/** Deck student ids may be alt ids; resolve back to the base student. */
export function getStudent(game: GameDataType, id: number): StudentType | undefined {
	return game.students.get(id % 1_000_000);
}

/** id → item / equipment / null (furniture). */
export function getStuff(game: GameDataType, id: number): ItemType | EquipmentType | undefined {
	if (id >= EQUIPMENT_OFFSET) {
		return game.equipments.get(id);
	}
	if (id >= FURNITURE_OFFSET) {
		return undefined;
	}
	return game.items.get(id);
}

export function studentCollectionTextureUrl(id: number): string {
	return `${CDN_BASE}/images/student/collection/${id}.webp`;
}

export function schoolIconUrl(school: string): string {
	return `${CDN_BASE}/images/schoolicon/${school === 'Sakugawa' ? 'ETC' : school}.png`;
}

export function gearIconUrl(student: StudentType): string {
	return `${CDN_BASE}/images/gear/${student.gear?.released?.length ? `icon/${student.id}.webp` : 'empty.png'}`;
}

export function skillIconUrl(icon: string): string {
	return `${CDN_BASE}/images/skill/${icon}.webp`;
}

export function stuffIconUrl(stuff: ItemType | EquipmentType): string {
	const isItem =
		stuff.category === StuffCategory.Material ||
		stuff.category === StuffCategory.SecretStone ||
		stuff.category === StuffCategory.Favor;
	return `${CDN_BASE}/images/${isItem ? 'item' : 'equipment'}/icon/${stuff.icon}.webp`;
}

export function adaptationIconUrl(value: number): string {
	return `${CDN_BASE}/images/ui/Adaptresult${value}.png`;
}

export function campaignIconUrl(campaign: CampaignType): string {
	// SchaleDB moved stage art to per-area/difficulty webp assets
	// (e.g. images/stage/mission_29_0.webp); the suffix is the stage
	// difficulty (0 = Normal, 1 = Hard) as defined in the source data.
	return `${CDN_BASE}/images/stage/mission_${campaign.area}_${campaign.difficulty}.webp`;
}

export function favorTierIconUrl(tier: number): string {
	return `${CDN_BASE}/images/ui/Cafe_Interaction_Gift_0${tier}.png`;
}

/** Terrain battle adaptation of a student (no UE bonus). */
export function getBattleAdaptation(student: StudentType, terrain: TerrainType | string): number {
	switch (terrain) {
		case 'Street':
			return student.streetBattleAdaptation;
		case 'Outdoor':
			return student.outdoorBattleAdaptation;
		case 'Indoor':
			return student.indoorBattleAdaptation;
		default:
			return 0;
	}
}
