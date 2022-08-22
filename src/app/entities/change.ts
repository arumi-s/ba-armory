import type { Subject } from 'rxjs';

export class Change<T = any> {
	constructor(public previousValue: T, public currentValue: T) {}
}

export type Changes<T> = T extends (infer I)[]
	? Change<I>[] | { [index: number]: Changes<I> }
	: T extends object
	? {
			[P in keyof T as T[P] extends Subject<any> ? never : P]?: Changes<T[P]>;
	  }
	: Change<T>;
