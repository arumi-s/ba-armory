import { describe, expect, test } from 'vitest';
import { TabSortState } from './tab-sort.svelte.js';

interface TestOption {
	id: string;
	label: string;
}

const options = (): TestOption[] => [
	{ id: 'basic', label: 'Basic' },
	{ id: 'total', label: 'Total' }
];

describe('TabSortState', () => {
	test('construction takes the default option id and direction 1', () => {
		const sort = TabSortState.create({ defaultOptionId: 'total', options });
		expect(sort.sortOptionId).toBe('total');
		expect(sort.sortDirection).toBe(1);
		expect(sort.sortOption?.id).toBe('total');
		expect(sort.sortLabel).toBe('Total');
	});

	test('select switches the option and the label follows', () => {
		const sort = TabSortState.create({ defaultOptionId: 'basic', options });
		sort.select('total');
		expect(sort.sortOptionId).toBe('total');
		expect(sort.sortOption?.id).toBe('total');
		expect(sort.sortLabel).toBe('Total');
	});

	test('sortOption/sortLabel fall back when no option matches the id', () => {
		const sort = TabSortState.create({ defaultOptionId: 'basic', options });
		sort.select('missing');
		expect(sort.sortOption).toBeNull();
		expect(sort.sortLabel).toBe('');
	});

	test('toggleDirection flips between -1 and 1', () => {
		const sort = TabSortState.create({ defaultOptionId: 'basic', options });
		expect(sort.sortDirection).toBe(1);
		sort.toggleDirection();
		expect(sort.sortDirection).toBe(-1);
		sort.toggleDirection();
		expect(sort.sortDirection).toBe(1);
	});

	test('options are read live through the callback (no caching)', () => {
		let current: readonly TestOption[] = [{ id: 'basic', label: 'Basic' }];
		const sort = TabSortState.create({ defaultOptionId: 'basic', options: () => current });
		expect(sort.options).toHaveLength(1);

		current = [
			{ id: 'basic', label: 'Basic' },
			{ id: 'total', label: 'Total' }
		];
		expect(sort.options).toHaveLength(2);

		current = [];
		expect(sort.options).toHaveLength(0);
		expect(sort.sortOption).toBeNull(); // default no longer resolves
	});
});
