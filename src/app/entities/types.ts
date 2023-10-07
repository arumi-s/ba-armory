import type { DeckStudent } from './deck-student';
import { ArmorType, BulletType, SquadType, Terrain } from './enum';

import type { Equipment } from './equipment';

export enum Tab {
	items = 0,
	campaigns = 1,
	elephs = 2,
	gears = 3,
}

export interface SortOption<T> {
	id: string;
	label: string;
	key: ((item: T) => number)[];
}

export type StudentSortOption = SortOption<DeckStudent>;
export type ItemSortOption = SortOption<Equipment>;
export type ElephSortOption = SortOption<DeckStudent>;

export interface BulletTypeOption {
	id: BulletType;
	label: string;
}

export interface ArmorTypeOption {
	id: ArmorType;
	label: string;
}

export interface SquadTypeOption {
	id: SquadType;
	label: string;
}

export interface TypeOption {
	id: Terrain;
	label: string;
}

export interface TerrainOption {
	id: Terrain;
	label: string;
}

export interface LanguageOption {
	id: string;
	label: string;
	code: string;
}

export interface RegionOption {
	id: number;
	label: string;
}
