import type { Subject } from 'rxjs';

export type DeckChange<T> = T extends Subject<any>
	? T
	: T extends object
	? {
			[P in keyof T]?: DeckChange<T[P]>;
	  }
	: T;
