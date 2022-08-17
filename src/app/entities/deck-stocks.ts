export const DeckStocksInternal = Symbol('DeckStocksInternal');
export const DeckStocksClear = Symbol('DeckStocksClear');

export interface ProxyMethods {
	[DeckStocksInternal]: () => Record<number, number>;
	[DeckStocksClear]: () => void;
}

export type DeckStocks = Record<number, number> & ProxyMethods;

export const wrapStocks = (value: Record<number, number>): DeckStocks => {
	let stock = value == null ? {} : Object.fromEntries(Object.entries(value).map(([k, v]) => [k, Number(v) || 0]));

	return new Proxy(stock, {
		get: (target, prop) => {
			if (prop === DeckStocksInternal) {
				return () => target;
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
			value = Math.max(Math.floor(Number(value) || 0), 0);
			return Reflect.set(target, prop, value);
		},
	}) as any;
};

export const transformStocks = ({ value }: { value: Record<number, number> }): DeckStocks => wrapStocks(value);
