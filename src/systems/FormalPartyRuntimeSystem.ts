import type { HeroId } from './HeroNormalAttackSystem';
import type { PlayerSlot } from './InputSystem';
import {
  createPartyConfiguration,
  getPartyHeroId,
  getPartyPlayerSlots,
  parsePartyConfiguration,
  type PartyConfiguration,
} from './PartyConfigurationSystem';
import { loadActiveGame } from './SaveSlotSystem';
import type { SaveStorage } from './SaveSystem';

export type FormalPartySceneData = {
  devParty?: PartyConfiguration;
};

export type FormalPartyRuntime = Readonly<{
  party: PartyConfiguration;
  playerCount: 1 | 2;
  members: ReadonlyArray<Readonly<{ slot: PlayerSlot; heroId: HeroId }>>;
  source: 'active-save' | 'dev-override';
}>;

export function resolveFormalPartyRuntime(
  storage: SaveStorage | undefined,
  data: FormalPartySceneData | undefined,
  allowDevOverride: boolean,
): FormalPartyRuntime | undefined {
  if (allowDevOverride && data?.devParty) {
    const devParty = parsePartyConfiguration(data.devParty);
    if (devParty) return createFormalPartyRuntime(devParty, 'dev-override');
  }
  const party = storage ? loadActiveGame(storage)?.party : undefined;
  return party ? createFormalPartyRuntime(party, 'active-save') : undefined;
}

export function createFormalPartyRuntime(
  party: PartyConfiguration,
  source: FormalPartyRuntime['source'] = 'active-save',
): FormalPartyRuntime {
  const snapshot = parsePartyConfiguration(party);
  if (!snapshot) throw new RangeError('Formal party runtime requires a valid PartyConfiguration.');
  return {
    party: snapshot,
    playerCount: snapshot.playerCount,
    members: getPartyPlayerSlots(snapshot).map((slot) => ({
      slot,
      heroId: getPartyHeroId(snapshot, slot)!,
    })),
    source,
  };
}

export function createFormalDevParty(
  playerCount: 1 | 2,
  p1HeroId: HeroId = 1,
  p2HeroId: HeroId = 2,
): PartyConfiguration {
  const party = createPartyConfiguration(playerCount, p1HeroId, p2HeroId);
  if (!party) throw new RangeError('DEV party must satisfy the formal party contract.');
  return party;
}

export function createFormalPartyRetryData(
  runtime: FormalPartyRuntime | undefined,
): FormalPartySceneData | undefined {
  return runtime?.source === 'dev-override' ? { devParty: runtime.party } : undefined;
}
