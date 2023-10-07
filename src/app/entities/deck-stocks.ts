import { Observable, Subject } from 'rxjs';

export const DeckStocksInternal = Symbol('DeckStocksInternal');
export const DeckStocksChange = Symbol('DeckStocksChange');
export const DeckStocksClear = Symbol('DeckStocksClear');

export interface ProxyMethods {
	[DeckStocksInternal]: () => Record<number, number>;
	[DeckStocksClear]: () => void;
	[DeckStocksChange]: () => Observable<[number, number]>;
}

export type DeckStocks = Record<number, number> & ProxyMethods;

export const wrapStocks = (value: Record<number, number>): DeckStocks => {
	let stock = value == null ? {} : Object.fromEntries(Object.entries(value).map(([k, v]) => [k, Number(v) || 0]));
	const changeSubject = new Subject<[number, number]>();

	return new Proxy(stock, {
		get: (target, prop) => {
			if (prop === DeckStocksInternal) {
				return () => target;
			}
			if (prop === DeckStocksChange) {
				return () => changeSubject.asObservable();
			}
			if (prop === DeckStocksClear) {
				return () => {
					for (const key of Object.getOwnPropertyNames.call(Object, target)) {
						Reflect.deleteProperty(target, key);
					}
				};
			}
			return Reflect.get(target, prop) ?? 0;
		},
		set: (target, prop, value) => {
			const oldValue = Reflect.get(target, prop);
			value = Math.max(Math.floor(Number(value) || 0), 0);

			if (oldValue === value) {
				return true;
			}
			const ret = Reflect.set(target, prop, value);
			if (typeof prop !== 'symbol') changeSubject.next([Number(prop) || 0, oldValue]);
			return ret;
		},
	}) as any;
};

export const transformStocks = ({ value }: { value: Record<number, number> }): DeckStocks => wrapStocks(value);
