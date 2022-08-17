import { Expose, Exclude } from 'class-transformer';
import { Subject } from 'rxjs';
import { DeckChange } from './types';

export class DeckOptions {
	@Expose({ name: 'showSurplusItems' })
	showSurplusItems: boolean = false;

	@Exclude()
	readonly change$ = new Subject<DeckChange<DeckOptions>>();
}
