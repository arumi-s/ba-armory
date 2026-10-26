import type { GameDataType } from '#lib/data/indexes';
import { getStudent } from '#lib/data/indexes';
import { ArmorType, BulletType, ELIGMA_ID, StuffCategory } from '#lib/data/enums';
import type { DeckStudentState } from './types';
import { studentRequiredItems } from './compute';

export interface SortOption<T> {
	id: string;
	label: string;
	keys: ((item: T) => string | number)[];
}

export type StudentSortOption = SortOption<DeckStudentState>;
export type ItemSortOption = SortOption<{ id: number; category: string }>;
export type ElephSortOption = SortOption<DeckStudentState>;

const compare = (a: string | number, b: string | number): number =>
	typeof a === 'string' && typeof b === 'string'
		? a.localeCompare(b)
		: +(a as number) - +(b as number);

/** Multi-key comparison; direction -1 or 1. */
export function sortObjects<T>(a: T, b: T, option: SortOption<T>, direction: -1 | 1): number {
	for (const key of option.keys) {
		const diff = compare(key(a), key(b));
		if (diff !== 0) return direction * diff;
	}
	return 0;
}

const stuffCategoryOrder = Object.keys(StuffCategory);
const bulletTypeOrder = Object.keys(BulletType);
const armorTypeOrder = Object.keys(ArmorType);

/** 7 options for the squad student sort menu. */
export function studentSortOptions(game: GameDataType): StudentSortOption[] {
	const terrainKey = (deckStudent: DeckStudentState, terrain: 'street' | 'outdoor' | 'indoor') => {
		const student = getStudent(game, deckStudent.id);
		return -(student ? student[`${terrain}BattleAdaptation`] : 0);
	};
	return [
		{
			id: 'level',
			label: game.localization.stat('Level'),
			keys: [(d) => -d.level, (d) => -d.star, (d) => d.id]
		},
		{
			id: 'star',
			label: 'star',
			keys: [(d) => -d.star, (d) => -d.level, (d) => d.id]
		},
		{
			id: 'streetBattleAdaptation',
			label: game.localization.adaptationType('Street'),
			keys: [(d) => terrainKey(d, 'street'), (d) => -d.star, (d) => -d.level, (d) => d.id]
		},
		{
			id: 'outdoorBattleAdaptation',
			label: game.localization.adaptationType('Outdoor'),
			keys: [(d) => terrainKey(d, 'outdoor'), (d) => -d.star, (d) => -d.level, (d) => d.id]
		},
		{
			id: 'indoorBattleAdaptation',
			label: game.localization.adaptationType('Indoor'),
			keys: [(d) => terrainKey(d, 'indoor'), (d) => -d.star, (d) => -d.level, (d) => d.id]
		},
		{
			id: 'bulletType',
			label: game.localization.ui('attacktype'),
			keys: [
				(d) => {
					const student = getStudent(game, d.id);
					return -(student ? bulletTypeOrder.indexOf(student.bulletType) : 0);
				},
				(d) => -d.star,
				(d) => -d.level,
				(d) => d.id
			]
		},
		{
			id: 'armorType',
			label: game.localization.ui('defensetype'),
			keys: [
				(d) => {
					const student = getStudent(game, d.id);
					return -(student ? armorTypeOrder.indexOf(student.armorType) : 0);
				},
				(d) => -d.star,
				(d) => -d.level,
				(d) => d.id
			]
		}
	];
}

/** 4 options for the items / gears sort menus (deficit aware). */
export function itemSortOptions(
	game: GameDataType,
	required: () => ReadonlyMap<number, number>,
	stocks: Record<number, number>,
	labels: { basic: string; deficit: string; required: string; stock: string }
): ItemSortOption[] {
	return [
		{
			id: 'basic',
			label: labels.basic,
			keys: [
				(item) =>
					stuffCategoryOrder.includes(item.category)
						? -stuffCategoryOrder.indexOf(item.category)
						: -1000,
				(item) => -item.id
			]
		},
		{
			id: 'deficit',
			label: labels.deficit,
			keys: [(item) => (stocks[item.id] ?? 0) - (required().get(item.id) ?? 0), (item) => -item.id]
		},
		{
			id: 'required',
			label: labels.required,
			keys: [(item) => -(required().get(item.id) ?? 0), (item) => -item.id]
		},
		{
			id: 'stock',
			label: labels.stock,
			keys: [(item) => -(stocks[item.id] ?? 0), (item) => -item.id]
		}
	];
}

/** 5 options for the eleph sort menu. */
export function elephSortOptions(
	game: GameDataType,
	perStudentRequired: (d: DeckStudentState) => ReadonlyMap<number, number>,
	squadRequired: () => ReadonlyMap<number, number>,
	stocks: Record<number, number>,
	labels: { basic: string; total: string; deficit: string; required: string; stock: string }
): ElephSortOption[] {
	return [
		{ id: 'basic', label: labels.basic, keys: [(d) => -d.id] },
		{
			id: 'total',
			label: labels.total,
			keys: [(d) => -(perStudentRequired(d).get(ELIGMA_ID) ?? 0), (d) => -d.id]
		},
		{
			id: 'deficit',
			label: labels.deficit,
			keys: [(d) => (stocks[d.id] ?? 0) - (squadRequired().get(d.id) ?? 0), (d) => -d.id]
		},
		{
			id: 'required',
			label: labels.required,
			keys: [(d) => -(squadRequired().get(d.id) ?? 0), (d) => -d.id]
		},
		{ id: 'stock', label: labels.stock, keys: [(d) => -(stocks[d.id] ?? 0), (d) => -d.id] }
	];
}

/** Per-student required items bound to a fixed game/stocks (for eleph totals). */
export function makePerStudentRequired(game: GameDataType, stocks: Record<number, number>) {
	return (d: DeckStudentState) => studentRequiredItems(d, game, stocks);
}
