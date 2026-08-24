import headTruthJson from '../../docs/reverse-engineering/ground-truth/manifests/task-settings-201-pet-combat-hud-head.json';

type Point = Readonly<{ x: number; y: number }>;
type Bounds = Readonly<{ left: number; top: number; width: number; height: number }>;
type Matrix = Readonly<{ a: number; b: number; c: number; d: number; tx: number; ty: number }>;
type Placement = Readonly<{
  stateId: string;
  localMatrix: Matrix;
  registrationPoint: Point;
  localBounds: Bounds;
  visibleBounds: Bounds;
}>;
type TruthState = Readonly<{ id: string; frame: number; fixtureId: string; baselineId: string }>;
type TruthObject = Readonly<{
  id: string;
  parentId: string | null;
  sourceIdentity: Readonly<{ characterId: number | null; frame: number | null }>;
  placements: readonly Placement[];
  render: Readonly<{ assetRef: string | null }>;
}>;
type TruthBaseline = Readonly<{
  id: string;
  stateId: string;
  path: string;
  width: number;
  height: number;
  crop: Bounds;
}>;
type HeadTruth = Readonly<{
  truthId: string;
  status: string;
  states: readonly TruthState[];
  displayObjects: readonly TruthObject[];
  baselines: readonly TruthBaseline[];
  completeness: Readonly<{ unresolved: readonly unknown[] }>;
}>;

export const PetCombatHudHeadTruthId = 'task-settings-201.pet-combat-hud-head' as const;

export type PetCombatHudHeadAsset = Readonly<{
  key: string;
  path: string;
  status: 'ready';
  source: 'extracted-flash';
  sourcePackage: 'assets/pet1.swf';
  sourceSymbol: string;
  sourceCharacterId: number;
}>;

export type PetCombatHudHeadProjection = Readonly<{
  petName: string;
  truthId: typeof PetCombatHudHeadTruthId;
  frame: number;
  childCharacterId: number;
  childMatrix: Matrix;
  registrationPoint: Point;
  visibleBounds: Bounds;
  baselineCrop: Bounds;
  asset: PetCombatHudHeadAsset;
  x: number;
  y: number;
  originX: number;
  originY: number;
}>;

const headTruth = headTruthJson as HeadTruth;

export function buildPetCombatHudHeadProjections(
  truth: HeadTruth = headTruth,
): Readonly<Record<string, PetCombatHudHeadProjection>> {
  assertVerifiedTruth(truth);
  const headObject = requireObject(truth, 'pet-combat-hud-head.character-657');
  const projections: Record<string, PetCombatHudHeadProjection> = {};
  for (const state of truth.states.filter((candidate) =>
    candidate.frame > 0 && candidate.id.endsWith('-p1'))) {
    const petName = state.id.slice(0, -3);
    const headPlacement = requirePlacement(headObject, state.id);
    const child = truth.displayObjects.find((candidate) =>
      candidate.parentId === headObject.id
      && candidate.placements.some((placement) => placement.stateId === state.id));
    const childPlacement = child ? requirePlacement(child, state.id) : undefined;
    const baseline = truth.baselines.find((candidate) => candidate.id === state.baselineId);
    const childCharacterId = child?.sourceIdentity.characterId;
    if (!child || !childPlacement || !baseline || childCharacterId === null || childCharacterId === undefined) {
      throw new Error(`${PetCombatHudHeadTruthId} is missing the recursive child for ${state.id}.`);
    }
    if (child.sourceIdentity.frame !== state.frame || child.render.assetRef !== baseline.path) {
      throw new Error(`${PetCombatHudHeadTruthId} frame/baseline drifted for ${state.id}.`);
    }
    const asset = createHeadAsset(childCharacterId, state.frame);
    projections[petName] = {
      petName,
      truthId: PetCombatHudHeadTruthId,
      frame: state.frame,
      childCharacterId,
      childMatrix: childPlacement.localMatrix,
      registrationPoint: childPlacement.registrationPoint,
      visibleBounds: childPlacement.visibleBounds,
      baselineCrop: baseline.crop,
      asset,
      x: headPlacement.localMatrix.tx,
      y: headPlacement.localMatrix.ty,
      originX: childPlacement.registrationPoint.x / baseline.width,
      originY: childPlacement.registrationPoint.y / baseline.height,
    };
  }
  if (Object.keys(projections).length !== 35) {
    throw new Error(`${PetCombatHudHeadTruthId} must project all 35 pet fixtures.`);
  }
  return projections;
}

export const petCombatHudHeadProjections = buildPetCombatHudHeadProjections();

export const petCombatHudHeadAssets = Object.fromEntries(
  [...new Map(Object.values(petCombatHudHeadProjections)
    .map((projection) => [projection.childCharacterId, projection.asset])).entries()]
    .map(([characterId, asset]) => [characterId, asset]),
) as Readonly<Record<number, PetCombatHudHeadAsset>>;

export function getPetCombatHudHeadProjection(
  petName: string,
): PetCombatHudHeadProjection | undefined {
  return petCombatHudHeadProjections[petName];
}

function assertVerifiedTruth(truth: HeadTruth): void {
  if (truth.truthId !== PetCombatHudHeadTruthId || truth.status !== 'verified') {
    throw new Error(`${truth.truthId} is not the verified pet combat HUD head truth.`);
  }
  if (truth.states.length !== 74 || truth.displayObjects.length !== 37) {
    throw new Error(`${PetCombatHudHeadTruthId} completeness drifted.`);
  }
  if (truth.completeness.unresolved.length > 0) {
    throw new Error(`${PetCombatHudHeadTruthId} contains unresolved evidence.`);
  }
}

function createHeadAsset(characterId: number, frame: number): PetCombatHudHeadAsset {
  return {
    key: `combat-hud.pet.head.character-${characterId}`,
    path: `/assets/ui/combat-hud/pet/heads/${characterId}.png`,
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/pet1.swf',
    sourceSymbol: `character 657 frame ${frame} child ${characterId}`,
    sourceCharacterId: characterId,
  };
}

function requireObject(truth: HeadTruth, id: string): TruthObject {
  const object = truth.displayObjects.find((candidate) => candidate.id === id);
  if (!object) throw new Error(`${PetCombatHudHeadTruthId} is missing object ${id}.`);
  return object;
}

function requirePlacement(object: TruthObject, stateId: string): Placement {
  const placement = object.placements.find((candidate) => candidate.stateId === stateId);
  if (!placement) throw new Error(`${PetCombatHudHeadTruthId} is missing placement ${stateId}.`);
  return placement;
}
