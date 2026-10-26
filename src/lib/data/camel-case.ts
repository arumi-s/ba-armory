import { z } from 'zod';
import type { $ZodShape, $ZodType } from 'zod/v4/core';

/** PascalCase → camelCase: lowercase the first character. */
export type CamelCase<S extends string> = S extends `${infer First}${infer Rest}`
	? `${Lowercase<First>}${Rest}`
	: S;

/** Map an object type's string keys to their camelCase form (top level only). */
export type CamelCaseKeys<T> = {
	[K in keyof T as K extends string ? CamelCase<K> : K]: T[K];
};

/** Recursively map an object type's string keys to camelCase. */
export type CamelCaseKeysDeep<T> =
	T extends Map<infer K, infer V>
		? Map<K, V>
		: T extends Set<infer V>
			? Set<V>
			: T extends Date
				? Date
				: T extends (infer U)[]
					? CamelCaseKeysDeep<U>[]
					: T extends object
						? { [K in keyof T as K extends string ? CamelCase<K> : K]: CamelCaseKeysDeep<T[K]> }
						: T;

const toCamelCase = <S extends string>(text: S): CamelCase<S> =>
	(text.charAt(0).toLowerCase() + text.slice(1)) as CamelCase<S>;

const toPascalCase = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Transform function factory: rename top-level keys to camelCase. */
export function toCamelCaseKeys() {
	return <T extends Record<string, unknown>>(value: T): CamelCaseKeys<T> => {
		const result: Record<string, unknown> = {};
		for (const [key, entry] of Object.entries(value)) {
			result[toCamelCase(key)] = entry;
		}
		return result as CamelCaseKeys<T>;
	};
}

/**
 * Transform function factory: recursively rename keys of plain objects
 * (arrays included) to camelCase. Primitives, Dates, Maps and Sets pass through.
 */
export function toCamelCaseKeysDeep() {
	const convert = (value: unknown): unknown => {
		if (value == null || typeof value !== 'object') return value;
		if (value instanceof Date || value instanceof Map || value instanceof Set) return value;
		if (Array.isArray(value)) return value.map(convert);
		const result: Record<string, unknown> = {};
		for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
			result[toCamelCase(key)] = convert(entry);
		}
		return result;
	};
	return <T>(value: T): CamelCaseKeysDeep<T> => convert(value) as CamelCaseKeysDeep<T>;
}

/** Transform function factory: rename top-level keys to PascalCase (inverse of the above). */
export function toPascalCaseKeys() {
	return <T extends Record<string, unknown>>(value: T): Record<string, unknown> => {
		const result: Record<string, unknown> = {};
		for (const [key, entry] of Object.entries(value)) {
			result[toPascalCase(key)] = entry;
		}
		return result;
	};
}

/** Output shape of a raw schema with keys mapped to camelCase (field schemas are reused). */
type CamelShape<S> = {
	[K in keyof S as K extends string ? CamelCase<K> : K]: S[K];
};

/**
 * Derive a bidirectional PascalCase↔camelCase schema from a raw schema written
 * with the source (schaledb) PascalCase keys. Output keys are camelCase.
 *
 * Note: the decode step only renames top-level keys, so this is only suitable
 * for flat schemas (fields with primitive / primitive-array values). Entities
 * with nested objects use `.transform(toCamelCaseKeysDeep())` instead.
 */
export function camelCaseCodec<S extends $ZodShape>(raw: z.ZodObject<S> | { shape: S }) {
	const camelShape = {} as CamelShape<S>;
	for (const [key, field] of Object.entries<$ZodType>(raw.shape)) {
		(camelShape as Record<string, $ZodType>)[toCamelCase(key)] = field;
	}
	const camel = z.looseObject(camelShape);
	const rawSchema = raw as z.ZodObject<S>;
	// The generic CamelCaseKeys mapped type is structurally identical to the
	// remapped output shape, but TypeScript cannot prove it generically — hence
	// the single controlled cast on each direction.
	return z.codec(rawSchema, camel, {
		decode: toCamelCaseKeys() as unknown as (
			value: z.output<typeof rawSchema>
		) => z.input<typeof camel>,
		encode: toPascalCaseKeys() as unknown as (
			value: z.input<typeof camel>
		) => z.output<typeof rawSchema>
	});
}
