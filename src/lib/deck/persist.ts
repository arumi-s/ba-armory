import {
	compressToBase64,
	compressToUTF16,
	decompressFromBase64,
	decompressFromUTF16
} from 'lz-string';
import { z } from 'zod';

import { SAVE_API } from '#lib/config';
import { DeckSchema, type DeckType } from './schema';
import type { DeckState } from './types';

const STORAGE_DECK_KEY = 'deck';
const STORAGE_REGION_KEY = 'region';

/* ------------------------------------------------------------------ */
/* Local storage                                                       */
/* ------------------------------------------------------------------ */

export function saveDeckLocal(deck: DeckState): void {
	localStorage.setItem(STORAGE_DECK_KEY, compressToUTF16(JSON.stringify(serializeDeck(deck))));
}

export function loadDeckFromLocalStorage(): unknown {
	const compressed = localStorage.getItem(STORAGE_DECK_KEY) ?? '';
	if (compressed === '') throw new Error('no local deck');
	const json = decompressFromUTF16(compressed) ?? '{}';
	return JSON.parse(json);
}

export function loadRegion(): number | null {
	const saved = localStorage.getItem(STORAGE_REGION_KEY);
	const region = saved == null ? Number.NaN : Number(saved);
	return Number.isInteger(region) && region >= 0 && region <= 2 ? region : null;
}

export function saveRegion(region: number): void {
	localStorage.setItem(STORAGE_REGION_KEY, String(region));
}

/* ------------------------------------------------------------------ */
/* Import / export strings                                             */
/* ------------------------------------------------------------------ */

export function exportDeckString(deck: DeckState): string {
	return compressToBase64(JSON.stringify(serializeDeck(deck)));
}

/**
 * Import a share string. Writes the deck to localStorage and returns the
 * parsed plain JSON for in-memory normalization.
 */
export function importDeckString(input: string): unknown {
	const trimmed = input.trim();
	if (trimmed === '') throw new TypeError('empty input');
	const json = decompressFromBase64(trimmed);
	if (json == null) throw new TypeError('invalid data');
	const plain = JSON.parse(json);
	if (plain == null || typeof plain !== 'object') throw new TypeError('invalid data');
	localStorage.setItem(STORAGE_DECK_KEY, compressToUTF16(json));
	return plain;
}

/* ------------------------------------------------------------------ */
/* Remote save API                                                     */
/* ------------------------------------------------------------------ */

export const SaveResponseSchema = z.object({
	id: z.string(),
	data: z.string(),
	error: z.string().nullable()
});
export type SaveResponseType = z.infer<typeof SaveResponseSchema>;

export async function saveDeckRemote(deck: DeckState): Promise<string> {
	const response = await fetch(SAVE_API, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ data: exportDeckString(deck) })
	});
	const { data: save, success } = SaveResponseSchema.safeParse(await response.json());
	if (!success) throw new Error(response.statusText);
	if (!response.ok) throw new Error(save.error ?? response.statusText);
	return save.id ?? '';
}

export async function loadDeckRemote(id: string): Promise<unknown> {
	const response = await fetch(`${SAVE_API}/${id}`);
	const { data: save, success } = SaveResponseSchema.safeParse(await response.json());
	if (!success) throw new Error(response.statusText);
	if (!response.ok) throw new Error(save.error ?? response.statusText);
	const json = decompressFromBase64(save.data ?? '');
	if (json == null) throw new TypeError('invalid data');
	const plain = JSON.parse(json);
	if (plain == null || typeof plain !== 'object') throw new TypeError('invalid data');
	return plain;
}

/* ------------------------------------------------------------------ */
/* Projection back to the persistence shape                            */
/* ------------------------------------------------------------------ */

/** Project runtime state to the persisted deck JSON (all students included). */
export function serializeDeck(deck: DeckState): DeckType {
	return {
		options: { ...deck.options },
		students: Object.values(deck.students).map((student) => ({
			id: student.id,
			level: student.level,
			levelTarget: student.levelTarget,
			star: student.star,
			starTarget: student.starTarget,
			weapon: student.weapon,
			weaponTarget: student.weaponTarget,
			gear: student.gear,
			gearTarget: student.gearTarget,
			elephCost: student.elephCost,
			elephRemain: student.elephRemain,
			isTarget: student.isTarget,
			skills: student.skills.map((skill) => ({ ...skill })),
			equipments: student.equipments.map((equipment) => ({ ...equipment }))
		})),
		stocks: Object.fromEntries(Object.entries(deck.stocks).map(([id, amount]) => [id, amount])),
		squads: deck.squads.map((squad) => ({
			icon: squad.icon,
			name: squad.name,
			terrain: squad.terrain,
			students: [...squad.students],
			pinned: squad.pinned,
			bounded: squad.bounded,
			folded: squad.folded,
			tab: squad.tab
		})),
		selectedSquadId: deck.selectedSquadId
	};
}

/** Validate a plain deck JSON (used after import / remote load). */
export function validateDeckJson(json: unknown): DeckType {
	return DeckSchema.parse(json);
}
