import partyCreationTruthJson from '../../../docs/reverse-engineering/ground-truth/manifests/task-settings-175i-party-creation.json';
import type { HeroId } from '../../systems/HeroNormalAttackSystem';

export type PartyCreationTruthBounds = Readonly<{
  left: number;
  top: number;
  width: number;
  height: number;
}>;

export type PartyCreationButtonState = 'up' | 'over' | 'down';

type PartyCreationTruthPlacement = Readonly<{
  stateId: string;
  visible: boolean;
  stageBounds: PartyCreationTruthBounds | null;
  hitArea?: PartyCreationTruthBounds;
}>;

type PartyCreationTruthObject = Readonly<{
  id: string;
  sourceIdentity: Readonly<{ characterId: number | null }>;
  placements: readonly PartyCreationTruthPlacement[];
  render: Readonly<{
    assetRef: string;
    buttonStateAssets?: Readonly<Record<PartyCreationButtonState | 'hit', string>>;
  }>;
}>;

type PartyCreationTruthManifest = Readonly<{
  truthId: string;
  status: string;
  stage: Readonly<{ width: number; height: number }>;
  states: readonly Readonly<{ id: string }>[];
  displayObjects: readonly PartyCreationTruthObject[];
  completeness: Readonly<{
    displayListMatched: boolean;
    stateSetMatched: boolean;
    unresolved: readonly unknown[];
  }>;
}>;

const partyCreationTruth = partyCreationTruthJson as PartyCreationTruthManifest;

export const PartyCreationTruthId = 'task-settings-175i.party-creation' as const;

export const PartyCreationTruthObjectIds = {
  numberRoot: 'number-root',
  numberOne: 'number-root.simpleGame',
  numberTwo: 'number-root.doubleGame',
  numberBack: 'number-root.backbtn',
  roleRoot: 'role-root',
  ownerMarker: 'role-root.owner-marker',
} as const;

export function assertVerifiedPartyCreationTruth(): void {
  if (partyCreationTruth.truthId !== PartyCreationTruthId || partyCreationTruth.status !== 'verified') {
    throw new Error(`${partyCreationTruth.truthId} is not the verified party-creation truth.`);
  }
  if (partyCreationTruth.displayObjects.length !== 20 || partyCreationTruth.states.length !== 30) {
    throw new Error(`${PartyCreationTruthId} completeness drifted.`);
  }
  if (partyCreationTruth.stage.width !== 940 || partyCreationTruth.stage.height !== 590) {
    throw new Error(`${PartyCreationTruthId} stage must remain 940x590.`);
  }
  if (!partyCreationTruth.completeness.displayListMatched
    || !partyCreationTruth.completeness.stateSetMatched
    || partyCreationTruth.completeness.unresolved.length > 0) {
    throw new Error(`${PartyCreationTruthId} contains unresolved or unmatched evidence.`);
  }
}

export function getPartyCreationTruthStage(): Readonly<{ width: number; height: number }> {
  assertVerifiedPartyCreationTruth();
  return {
    width: partyCreationTruth.stage.width,
    height: partyCreationTruth.stage.height,
  };
}

export function getPartyCreationTruthStateIds(): readonly string[] {
  assertVerifiedPartyCreationTruth();
  return partyCreationTruth.states.map(({ id }) => id);
}

export function getPartyCreationTruthCharacterId(id: string): number {
  const characterId = findObject(id).sourceIdentity.characterId;
  if (typeof characterId !== 'number') {
    throw new Error(`${PartyCreationTruthId} ${id} has no character id.`);
  }
  return characterId;
}

export function getPartyCreationTruthBounds(id: string, stateId: string): PartyCreationTruthBounds {
  const placement = findPlacement(id, stateId);
  if (!placement.visible || !placement.stageBounds) {
    throw new Error(`${PartyCreationTruthId} ${id} is not visible in ${stateId}.`);
  }
  return placement.stageBounds;
}

export function getPartyCreationTruthHitArea(id: string, stateId: string): PartyCreationTruthBounds {
  const placement = findPlacement(id, stateId);
  if (!placement.visible || !placement.hitArea) {
    throw new Error(`${PartyCreationTruthId} ${id} has no visible hit area in ${stateId}.`);
  }
  return placement.hitArea;
}

export function getPartyCreationTruthAssetRef(
  id: string,
  state: PartyCreationButtonState = 'up',
): string {
  const object = findObject(id);
  if (state === 'up') return object.render.buttonStateAssets?.up ?? object.render.assetRef;
  const assetRef = object.render.buttonStateAssets?.[state];
  if (!assetRef) throw new Error(`${PartyCreationTruthId} ${id} has no ${state} asset.`);
  return assetRef;
}

export function getPartyCreationRoleObjectId(heroId: HeroId): string {
  assertHeroId(heroId);
  return `role-root.btn${heroId}`;
}

export function getPartyCreationRoleStateId(
  heroId: HeroId,
  state: 'hover' | 'pressed' | 'selected',
): string {
  assertHeroId(heroId);
  return `role${heroId}-${state}-p1`;
}

export function getPartyCreationMarkerBounds(heroId: HeroId): PartyCreationTruthBounds {
  return getPartyCreationTruthBounds(
    PartyCreationTruthObjectIds.ownerMarker,
    getPartyCreationRoleStateId(heroId, 'hover'),
  );
}

function findObject(id: string): PartyCreationTruthObject {
  assertVerifiedPartyCreationTruth();
  const object = partyCreationTruth.displayObjects.find((candidate) => candidate.id === id);
  if (!object) throw new Error(`${PartyCreationTruthId} is missing ${id}.`);
  return object;
}

function findPlacement(id: string, stateId: string): PartyCreationTruthPlacement {
  const placement = findObject(id).placements.find((candidate) => candidate.stateId === stateId);
  if (!placement) throw new Error(`${PartyCreationTruthId} ${id} has no placement for ${stateId}.`);
  return placement;
}

function assertHeroId(heroId: number): asserts heroId is HeroId {
  if (!Number.isInteger(heroId) || heroId < 1 || heroId > 5) {
    throw new RangeError(`${PartyCreationTruthId} hero id must be 1..5.`);
  }
}
