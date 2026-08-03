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

export const StageFeatureEntryPointerPositions = [
  { entry: 'settings', x: 63.65, y: 563.15 },
  { entry: 'backpack', x: 32.9, y: 540.5 },
  { entry: 'skills', x: 28.5, y: 504.85 },
  { entry: 'magic-weapon', x: 55.15, y: 475.4 },
  { entry: 'pets', x: 91.35, y: 472.65 },
] as const satisfies readonly Readonly<{
  entry: StageFeatureEntry;
  x: number;
  y: number;
}>[];

export type StageFeaturePointerTarget = Readonly<{
  entry: StageFeatureEntry;
  owner: FeatureUiOwner;
}>;

export function findStageFeaturePointerTarget(
  point: Readonly<{ x: number; y: number }>,
  playerCount: 1 | 2,
): StageFeaturePointerTarget | undefined {
  const owners: readonly FeatureUiOwner[] = playerCount === 2 ? ['p1', 'p2'] : ['p1'];
  for (const owner of owners) {
    for (const position of StageFeatureEntryPointerPositions) {
      const x = owner === 'p1' ? position.x : 920 - position.x;
      if (Math.abs(point.x - x) <= 15.5 && Math.abs(point.y - position.y) <= 17.5) {
        return { entry: position.entry, owner };
      }
    }
  }
  return undefined;
}

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
