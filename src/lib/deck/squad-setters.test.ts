import { describe, expect, it } from 'vitest';

import {
	setSquadIcon,
	setSquadName,
	setSquadTab,
	setSquadTerrain,
	toggleSquadBounded,
	toggleSquadFolded,
	toggleSquadPinned
} from './mutate';
import { normalizeDeck } from './normalize';
import type { DeckState, DeckSquadState } from './types';
import { buildFixtureGame } from './testing';

const game = buildFixtureGame();
const deck: DeckState = normalizeDeck({}, game, 'Squad');
const squad = deck.squads[0] as DeckSquadState;

describe('squad field setters', () => {
	it('mark the deck dirty (wired to AppState)', () => {
		expect(deck).toBeDefined();
		setSquadName(squad, 'Name');
		expect(squad.name).toBe('Name');
		setSquadIcon(squad, '/icon.png');
		expect(squad.icon).toBe('/icon.png');
		setSquadTerrain(squad, 'Indoor');
		expect(squad.terrain).toBe('Indoor');
		setSquadTab(squad, 3);
		expect(squad.tab).toBe(3);
		toggleSquadPinned(squad);
		expect(squad.pinned).toBe(true);
		toggleSquadBounded(squad);
		expect(squad.bounded).toBe(true);
		toggleSquadFolded(squad);
		expect(squad.folded).toBe(true);
	});
});
