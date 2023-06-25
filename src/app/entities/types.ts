import type { DeckStudent } from './deck-student';
import { Terrain } from './enum';

import type { Equipment } from './equipment';

export interface SortOption<T> {
	id: string;
	label: string;
	key: ((item: T) => number)[];
}

export type StudentSortOption = SortOption<DeckStudent>;
export type ItemSortOption = SortOption<Equipment>;
export type ElephSortOption = SortOption<DeckStudent>;

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
