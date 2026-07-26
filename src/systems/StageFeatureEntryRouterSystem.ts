import type { FeatureUiOwner, FeatureUiPage } from './FeatureUiHostSystem';

export const StageFeatureEntries = [
  'settings',
  'backpack',
  'skills',
  'magic-weapon',
  'pets',
] as const;

export type StageFeatureEntry = typeof StageFeatureEntries[number];
export type StageFeatureEntrySource = 'keyboard' | 'pointer';

export type StageFeatureEntryRequest = Readonly<{
  entry: StageFeatureEntry;
  owner: FeatureUiOwner;
  source: StageFeatureEntrySource;
}>;

export type StageFeatureEntryGateSnapshot = Readonly<{
  playerCount: 1 | 2;
  ownerAlive: boolean;
  magicWeaponEquipped: boolean;
  blocksInventoryPages?: boolean;
  blocksPetPage?: boolean;
}>;

export type StageFeatureEntryRoute =
  | Readonly<{
      status: 'open-page';
      page: FeatureUiPage;
      owner: FeatureUiOwner;
      request: StageFeatureEntryRequest;
    }>
  | Readonly<{
      status: 'settings-pending';
      owner: 'p1';
      request: StageFeatureEntryRequest;
    }>
  | Readonly<{
      status: 'blocked';
      reason:
        | 'owner-unavailable'
        | 'owner-dead'
        | 'stage-restricted'
        | 'magic-weapon-not-equipped';
      request: StageFeatureEntryRequest;
    }>;

const PageByEntry: Readonly<Partial<Record<StageFeatureEntry, FeatureUiPage>>> = {
  backpack: 'backpack',
  skills: 'skills',
  'magic-weapon': 'magic-weapon',
  pets: 'pets',
};

export function routeStageFeatureEntry(
  request: StageFeatureEntryRequest,
  gates: StageFeatureEntryGateSnapshot,
): StageFeatureEntryRoute {
  if (request.owner === 'p2' && gates.playerCount !== 2) {
    return { status: 'blocked', reason: 'owner-unavailable', request };
  }
  if (request.entry === 'settings') {
    return { status: 'settings-pending', owner: 'p1', request };
  }
  if (request.entry === 'skills') {
    if (gates.blocksInventoryPages) {
      return { status: 'blocked', reason: 'stage-restricted', request };
    }
    // Original BuySkill always selects P1 first, including P2 num-*.
    return { status: 'open-page', page: 'skills', owner: 'p1', request };
  }
  if (request.entry === 'pets') {
    if (gates.blocksPetPage) {
      return { status: 'blocked', reason: 'stage-restricted', request };
    }
    return { status: 'open-page', page: 'pets', owner: request.owner, request };
  }
  if (gates.blocksInventoryPages) {
    return { status: 'blocked', reason: 'stage-restricted', request };
  }
  if (!gates.ownerAlive) {
    return { status: 'blocked', reason: 'owner-dead', request };
  }
  if (request.entry === 'magic-weapon' && !gates.magicWeaponEquipped) {
    return { status: 'blocked', reason: 'magic-weapon-not-equipped', request };
  }
  return {
    status: 'open-page',
    page: PageByEntry[request.entry]!,
    owner: request.owner,
    request,
  };
}

