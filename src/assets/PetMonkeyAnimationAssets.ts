import monkeyTruthJson from '../../docs/reverse-engineering/ground-truth/manifests/task-settings-193a-pet-monkey-animation.json';

type Bounds = Readonly<{ left: number; top: number; width: number; height: number }>;
type Placement = Readonly<{
  stateId: string;
  localMatrix: Readonly<{ a: number; tx: number; ty: number }>;
  registrationPoint: Readonly<{ x: number; y: number }>;
  localBounds: Bounds;
}>;
type TruthObject = Readonly<{
  id: string;
  sourceIdentity: Readonly<{ symbolClass: string | null }>;
  placements: readonly Placement[];
}>;
type TruthState = Readonly<{ id: string; entry: string; frame: number }>;
type TruthBaseline = Readonly<{
  stateId: string;
  width: number;
  height: number;
  crop: Bounds;
}>;
type MonkeyTruth = Readonly<{
  truthId: string;
  status: string;
  states: readonly TruthState[];
  displayObjects: readonly TruthObject[];
  baselines: readonly TruthBaseline[];
  completeness: Readonly<{ unresolved: readonly unknown[] }>;
}>;

const monkeyTruth = monkeyTruthJson as MonkeyTruth;
export const PetMonkeyAnimationTruthId = 'task-settings-193a.pet-monkey-animation' as const;

export type PetMonkeyBodyAction = Readonly<{
  id: string;
  row: number;
  cells: readonly number[];
  holds: readonly number[];
  loops: boolean;
}>;

export type PetMonkeyBodyAsset = Readonly<{
  key: string;
  path: string;
  form: 1 | 2 | 3 | 4;
  cellWidth: number;
  cellHeight: number;
  columns: number;
  registrationOrigin: Readonly<{ x: number; y: number }>;
  actions: Readonly<Record<string, PetMonkeyBodyAction>>;
}>;

export type PetMonkeyEffectAsset = Readonly<{
  key: string;
  symbol: string;
  frameKeys: readonly string[];
  framePaths: readonly string[];
}>;

export type PetMonkeyEffectUsage = Readonly<{
  objectId: string;
  asset: PetMonkeyEffectAsset;
  offsetX: number;
  offsetY: number;
  registrationOrigin: Readonly<{ x: number; y: number }>;
  depth: number;
  loopsForFourSeconds: boolean;
}>;

export function assertVerifiedPetMonkeyAnimationTruth(): void {
  if (monkeyTruth.truthId !== PetMonkeyAnimationTruthId || monkeyTruth.status !== 'verified') {
    throw new Error(`${monkeyTruth.truthId} is not the verified monkey animation truth.`);
  }
  if (monkeyTruth.states.length !== 626 || monkeyTruth.displayObjects.length !== 20) {
    throw new Error(`${PetMonkeyAnimationTruthId} completeness drifted.`);
  }
  if (monkeyTruth.completeness.unresolved.length > 0) {
    throw new Error(`${PetMonkeyAnimationTruthId} contains unresolved evidence.`);
  }
}

const bodyFiles = {
  1: ['PetMonkeyBmd1', 70, 70],
  2: ['PetMonkeyBmd2', 100, 100],
  3: ['PetMonkeyBmd3', 150, 150],
  4: ['PetMonkeyBmd4', 200, 200],
} as const;

function buildBodyAsset(form: 1 | 2 | 3 | 4): PetMonkeyBodyAsset {
  assertVerifiedPetMonkeyAnimationTruth();
  const [symbol, cellWidth, cellHeight] = bodyFiles[form];
  const prefix = `body.monkey${form}.`;
  const states = monkeyTruth.states.filter((state) =>
    state.id.startsWith(prefix) && state.id.endsWith('.left'));
  const object = requireObject(`monkey${form}-body`);
  const firstPlacement = requirePlacement(object, states[0]?.id ?? '');
  const firstBaseline = requireBaseline(states[0]?.id ?? '');
  const actions: Record<string, PetMonkeyBodyAction> = {};
  for (const state of states) {
    const action = state.id.slice(prefix.length).replace(/\.seq\d+\.left$/, '');
    const row = Number(requireMatch(state.entry, /row=(\d+)/, state.id));
    const cell = Number(requireMatch(state.entry, /atlasCell=(\d+)/, state.id));
    const hold = Number(requireMatch(state.entry, /hold=(\d+) host ticks/, state.id));
    const current = actions[action] ?? { id: action, row, cells: [], holds: [], loops: /loops to/.test(state.entry) };
    actions[action] = {
      ...current,
      cells: [...current.cells, cell],
      holds: [...current.holds, hold],
    };
  }
  return {
    key: `pet-animation.monkey${form}.body`,
    path: `/assets/pets/monkey/body/${symbol}.png`,
    form,
    cellWidth,
    cellHeight,
    columns: firstBaseline.width / cellWidth,
    registrationOrigin: {
      x: firstPlacement.registrationPoint.x / cellWidth,
      y: firstPlacement.registrationPoint.y / cellHeight,
    },
    actions,
  };
}

export const petMonkeyBodyAssets = {
  1: buildBodyAsset(1),
  2: buildBodyAsset(2),
  3: buildBodyAsset(3),
  4: buildBodyAsset(4),
} as const;

const effectFrameCounts = {
  PetMonkey1Bullet1: 10,
  PetMonkey1Bullet2: 16,
  PetMonkey2Bullet1: 4,
  PetMonkey2Bullet2_1: 4,
  PetMonkey2Bullet2_2: 5,
  PetMonkey3Bullet1: 6,
  PetMonkey3Bullet2: 25,
  PetMonkey3Bullet3_1: 4,
  PetMonkey3Bullet3_2: 6,
} as const;

type EffectSymbol = keyof typeof effectFrameCounts;
const effectCharacterIds: Readonly<Record<EffectSymbol, number>> = {
  PetMonkey1Bullet1: 241,
  PetMonkey1Bullet2: 229,
  PetMonkey2Bullet1: 212,
  PetMonkey2Bullet2_1: 207,
  PetMonkey2Bullet2_2: 208,
  PetMonkey3Bullet1: 200,
  PetMonkey3Bullet2: 192,
  PetMonkey3Bullet3_1: 136,
  PetMonkey3Bullet3_2: 137,
};

function buildEffectAsset(symbol: EffectSymbol): PetMonkeyEffectAsset {
  const frameCount = effectFrameCounts[symbol];
  const directory = `DefineSprite_${effectCharacterIds[symbol]}_${symbol}`;
  const key = `pet-animation.monkey.effect.${symbol}`;
  return {
    key,
    symbol,
    frameKeys: Array.from({ length: frameCount }, (_, index) => `${key}.frame-${index + 1}`),
    framePaths: Array.from(
      { length: frameCount },
      (_, index) => `/assets/pets/monkey/effects/${directory}/${index + 1}.png`,
    ),
  };
}

export const petMonkeyEffectAssets = Object.fromEntries(
  (Object.keys(effectFrameCounts) as EffectSymbol[]).map((symbol) => [symbol, buildEffectAsset(symbol)]),
) as Readonly<Record<EffectSymbol, PetMonkeyEffectAsset>>;

const projectileObjectIds: Readonly<Record<string, readonly string[]>> = {
  'pet-skill.monkey1.xj': ['monkey1-xj'],
  'pet-skill.monkey2.lj': ['monkey2-lj-prelude', 'monkey2-lj-damage'],
  'pet-skill.monkey2.xj': ['monkey2-xj'],
  'pet-skill.monkey3.lyq': ['monkey3-lyq'],
  'pet-skill.monkey3.xj': ['monkey3-xj'],
  'pet-skill.monkey3.lj': ['monkey3-lj-prelude', 'monkey3-lj-damage'],
};

export function isPetMonkeyProjectileAsset(assetKey: string): boolean {
  return assetKey.startsWith('pet-skill.monkey');
}

export function getPetMonkeyEffectUsages(assetKey: string): readonly PetMonkeyEffectUsage[] {
  assertVerifiedPetMonkeyAnimationTruth();
  return (projectileObjectIds[assetKey] ?? []).map((objectId) => {
    const object = requireObject(objectId);
    const symbol = object.sourceIdentity.symbolClass as EffectSymbol;
    const left = object.placements.find((placement) => placement.stateId.endsWith('.left'));
    const baseline = left ? requireBaseline(left.stateId) : undefined;
    if (!left || !baseline || !(symbol in petMonkeyEffectAssets)) {
      throw new Error(`${PetMonkeyAnimationTruthId} is missing effect geometry for ${objectId}.`);
    }
    return {
      objectId,
      asset: petMonkeyEffectAssets[symbol],
      offsetX: Math.abs(left.localMatrix.tx) - left.registrationPoint.x,
      offsetY: left.localMatrix.ty + left.registrationPoint.y,
      registrationOrigin: {
        x: left.registrationPoint.x / baseline.width,
        y: left.registrationPoint.y / baseline.height,
      },
      depth: objectId.endsWith('prelude') ? 41 : 47,
      loopsForFourSeconds: symbol === 'PetMonkey1Bullet2',
    };
  });
}

export function getPetMonkeyBodyActionForProjectile(
  form: number,
  assetKey: string,
): string | undefined {
  return ({
    '1:pet-skill.monkey1.xj': 'hit2-xj',
    '2:pet-skill.monkey2.lj': 'hit2-lj',
    '2:pet-skill.monkey2.xj': 'hit3-xj',
    '3:pet-skill.monkey3.lyq': 'hit2-lyq',
    '3:pet-skill.monkey3.xj': 'hit3-xj',
    '3:pet-skill.monkey3.lj': 'hit4-lj',
    '4:pet-skill.monkey4.jgaoyi': 'hit5-jgaoyi',
  } as Readonly<Record<string, string>>)[`${form}:${assetKey}`];
}

function requireObject(id: string): TruthObject {
  const object = monkeyTruth.displayObjects.find((candidate) => candidate.id === id);
  if (!object) throw new Error(`${PetMonkeyAnimationTruthId} is missing object ${id}.`);
  return object;
}

function requirePlacement(object: TruthObject, stateId: string): Placement {
  const placement = object.placements.find((candidate) => candidate.stateId === stateId);
  if (!placement) throw new Error(`${PetMonkeyAnimationTruthId} is missing placement ${stateId}.`);
  return placement;
}

function requireBaseline(stateId: string): TruthBaseline {
  const baseline = monkeyTruth.baselines.find((candidate) => candidate.stateId === stateId);
  if (!baseline) throw new Error(`${PetMonkeyAnimationTruthId} is missing baseline ${stateId}.`);
  return baseline;
}

function requireMatch(value: string, pattern: RegExp, stateId: string): string {
  const match = value.match(pattern)?.[1];
  if (!match) throw new Error(`${PetMonkeyAnimationTruthId} cannot parse ${stateId}.`);
  return match;
}
