import { describe, expect, it } from 'vitest';

import { camelCaseCodec, toCamelCaseKeys } from './camel-case';
import { z } from 'zod';

describe('camel-case', () => {
	it('converts PascalCase keys to camelCase at top level only', () => {
		const convert = toCamelCaseKeys();
		expect(
			convert({
				Id: 1,
				Name: 'x',
				Weapon: { AdaptationType: 'Street' },
				SkillExMaterial: [[1, 2]]
			})
		).toEqual({
			id: 1,
			name: 'x',
			weapon: { AdaptationType: 'Street' },
			skillExMaterial: [[1, 2]]
		});
	});

	it('keeps non-string keys untouched', () => {
		const convert = toCamelCaseKeys();
		expect(convert({ Id: 1 })).toEqual({ id: 1 });
	});

	it('camelCaseCodec decodes PascalCase input', () => {
		const RawSchema = z.looseObject({ Id: z.number(), Name: z.string() });
		const Schema = camelCaseCodec(RawSchema);
		expect(Schema.parse({ Id: 42, Name: 'Aru' })).toMatchObject({ id: 42, name: 'Aru' });
	});

	it('camelCaseCodec applies field-level catch defaults', () => {
		const RawSchema = z.looseObject({ Id: z.number(), Name: z.string().catch('?') });
		const Schema = camelCaseCodec(RawSchema);
		expect(Schema.parse({ Id: 1 })).toMatchObject({ id: 1, name: '?' });
	});
});
