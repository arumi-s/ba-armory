import type { DeckStudent } from './deck-student';
import type { Equipment } from './equipment';

export interface SortOption<T> {
	id: string;
	label: string;
	key: ((item: T) => number)[];
}

export type StudentSortOption = SortOption<DeckStudent>;
export type ItemSortOption = SortOption<Equipment>;
