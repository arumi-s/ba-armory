import { describe, expect, it } from 'vitest';

import { formatRate } from './item-icon.svelte.js';

describe('formatRate', () => {
	it('keeps up to 3 fraction digits', () => {
		expect(formatRate(0.06746)).toBe('6.746%');
	});

	it('trims trailing zeros', () => {
		expect(formatRate(0.05)).toBe('5%');
		expect(formatRate(0.1234)).toBe('12.34%');
	});

	it('formats whole percentages without decimals', () => {
		expect(formatRate(0.4)).toBe('40%');
		expect(formatRate(1)).toBe('100%');
	});
});
