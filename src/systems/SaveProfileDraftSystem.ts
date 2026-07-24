import type { HeroId } from './HeroNormalAttackSystem';
import { createPartyConfiguration, type PartyConfiguration } from './PartyConfigurationSystem';
import type { SaveSlotId } from './SaveSlotSystem';

export type SaveProfileDraft =
  | {
      slotId: SaveSlotId;
      step: 'player-count';
    }
  | {
      slotId: SaveSlotId;
      step: 'hero';
      playerCount: 1 | 2;
      currentOwner: 'p1';
    }
  | {
      slotId: SaveSlotId;
      step: 'hero';
      playerCount: 2;
      currentOwner: 'p2';
      p1HeroId: HeroId;
    }
  | {
      slotId: SaveSlotId;
      step: 'complete';
      party: PartyConfiguration;
    };

export type ChooseDraftHeroResult =
  | { status: 'awaiting-p2'; draft: SaveProfileDraft }
  | { status: 'complete'; draft: SaveProfileDraft; party: PartyConfiguration }
  | { status: 'rejected'; draft: SaveProfileDraft };

export function createSaveProfileDraft(slotId: SaveSlotId): SaveProfileDraft {
  return { slotId, step: 'player-count' };
}

export function chooseDraftPlayerCount(
  draft: SaveProfileDraft,
  playerCount: 1 | 2,
): SaveProfileDraft {
  if (draft.step !== 'player-count') return draft;
  return {
    slotId: draft.slotId,
    step: 'hero',
    playerCount,
    currentOwner: 'p1',
  };
}

export function chooseDraftHero(
  draft: SaveProfileDraft,
  heroId: HeroId,
): ChooseDraftHeroResult {
  if (draft.step !== 'hero') return { status: 'rejected', draft };
  if (draft.currentOwner === 'p1' && draft.playerCount === 2) {
    return {
      status: 'awaiting-p2',
      draft: {
        slotId: draft.slotId,
        step: 'hero',
        playerCount: 2,
        currentOwner: 'p2',
        p1HeroId: heroId,
      },
    };
  }
  const party = draft.currentOwner === 'p1'
    ? createPartyConfiguration(1, heroId)
    : createPartyConfiguration(2, draft.p1HeroId, heroId);
  if (!party) return { status: 'rejected', draft };
  const completeDraft: SaveProfileDraft = {
    slotId: draft.slotId,
    step: 'complete',
    party,
  };
  return { status: 'complete', draft: completeDraft, party };
}

export function getDraftSelectedHero(draft: SaveProfileDraft): HeroId | undefined {
  return draft.step === 'hero' && draft.currentOwner === 'p2'
    ? draft.p1HeroId
    : draft.step === 'complete'
      ? draft.party.members.p1.heroId
      : undefined;
}
