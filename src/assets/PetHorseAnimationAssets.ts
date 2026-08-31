import horseTruthJson from '../../docs/reverse-engineering/ground-truth/manifests/task-settings-193c-pet-horse-animation.json';

type Bounds = Readonly<{ left: number; top: number; width: number; height: number }>;
type Placement = Readonly<{
  stateId: string;
  localMatrix: Readonly<{ a: number; d: number; tx: number; ty: number }>;
  registrationPoint: Readonly<{ x: number; y: number }>;
  localBounds: Bounds;
}>;
type TruthObject = Readonly<{
  id: string;
  sourceIdentity: Readonly<{ symbolClass: string | null }>;
  placements: readonly Placement[];
}>;
type TruthState = Readonly<{ id: string; entry: string; frame: number }>;
type TruthBaseline = Readonly<{ stateId: string; width: number; height: number; crop: Bounds }>;
type HorseTruth = Readonly<{
  truthId: string;
  status: string;
  states: readonly TruthState[];
  displayObjects: readonly TruthObject[];
  baselines: readonly TruthBaseline[];
  completeness: Readonly<{ unresolved: readonly unknown[] }>;
}>;

const horseTruth = horseTruthJson as HorseTruth;
export const PetHorseAnimationTruthId = 'task-settings-193c.pet-horse-animation' as const;

export type PetHorseBodyAction = Readonly<{
  id: string;
  row: number;
  cells: readonly number[];
  holds: readonly number[];
  loops: boolean;
}>;

export type PetHorseBodyAsset = Readonly<{
  key: string;
  path: string;
  form: 1 | 2 | 3 | 4;
  cellWidth: number;
  cellHeight: number;
  columns: number;
  registrationOrigin: Readonly<{ x: number; y: number }>;
  actions: Readonly<Record<string, PetHorseBodyAction>>;
}>;

export type PetHorseEffectFrame = Readonly<{
  key: string;
  path: string;
  registrationOrigin: Readonly<{ x: number; y: number }>;
}>;

export type PetHorseEffectAsset = Readonly<{
  key: string;
  symbol: string;
  frames: readonly PetHorseEffectFrame[];
}>;

export type PetHorseEffectUsage = Readonly<{
  objectId: string;
  asset: PetHorseEffectAsset;
  offsetX: number;
  offsetY: number;
  depth: number;
  followsPet: boolean;
  fixedDirection: boolean;
}>;

export function assertVerifiedPetHorseAnimationTruth(): void {
  if (horseTruth.truthId !== PetHorseAnimationTruthId || horseTruth.status !== 'verified') {
    throw new Error(`${horseTruth.truthId} is not the verified horse animation truth.`);
  }
  if (horseTruth.states.length !== 716 || horseTruth.displayObjects.length !== 20) {
    throw new Error(`${PetHorseAnimationTruthId} completeness drifted.`);
  }
  if (horseTruth.completeness.unresolved.length > 0) {
    throw new Error(`${PetHorseAnimationTruthId} contains unresolved evidence.`);
  }
}

const bodyFiles = {
  1: ['PetHorseBmd1', 80, 80],
  2: ['PetHorseBmd2', 100, 100],
  3: ['PetHorseBmd3', 150, 150],
  4: ['PetHorseBmd4', 200, 200],
} as const;

function buildBodyAsset(form: 1 | 2 | 3 | 4): PetHorseBodyAsset {
  assertVerifiedPetHorseAnimationTruth();
  const [symbol, cellWidth, cellHeight] = bodyFiles[form];
  const prefix = `body.horse${form}.`;
  const states = horseTruth.states.filter((state) =>
    state.id.startsWith(prefix) && state.id.endsWith('.left'));
  const object = requireObject(`horse${form}-body`);
  const firstPlacement = requirePlacement(object, states[0]?.id ?? '');
  const firstBaseline = requireBaseline(states[0]?.id ?? '');
  const actions: Record<string, PetHorseBodyAction> = {};
  for (const state of states) {
    const action = state.id.slice(prefix.length).replace(/\.seq\d+\.left$/, '');
    const row = Number(requireMatch(state.entry, /row=(\d+)/, state.id));
    const cell = Number(requireMatch(state.entry, /atlasCell=(\d+)/, state.id));
    const hold = Number(requireMatch(state.entry, /hold=(\d+) host ticks/, state.id));
    const current = actions[action] ?? {
      id: action,
      row,
      cells: [],
      holds: [],
      loops: action === 'wait' || action === 'walk',
    };
    actions[action] = { ...current, cells: [...current.cells, cell], holds: [...current.holds, hold] };
  }
  return {
    key: `pet-animation.horse${form}.body`,
    path: `/assets/pets/horse/body/${symbol}.png`,
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

export const petHorseBodyAssets = {
  1: buildBodyAsset(1),
  2: buildBodyAsset(2),
  3: buildBodyAsset(3),
  4: buildBodyAsset(4),
} as const;

const effectDefinitions = {
  PetHorse1Bullet1: ['20120203', 129, 5],
  PetHorse1Bullet2: ['20120203', 124, 8],
  PetHorse2Bullet1: ['20120203', 118, 14],
  PetHorse2Bullet2: ['20120203', 101, 45],
  PetHorse3Bullet1: ['20120203', 97, 20],
  PetHorse3Bullet2: ['20120203', 93, 15],
  PetHorse3Bullet3: ['20120203', 88, 8],
  PetHorse3Bullet4: ['20120203', 82, 31],
  PetHorse4Bullet5: ['pet1-sublength8', 699, 8],
  PetHorse4Bullet5Explode: ['pet1', 695, 30],
  PetHorseIceEffect: ['stagecommon', 40, 1],
} as const;
type EffectSymbol = keyof typeof effectDefinitions;

const objectIdBySymbol: Readonly<Record<EffectSymbol, string>> = {
  PetHorse1Bullet1: 'horse1-normal',
  PetHorse1Bullet2: 'horse1-sp',
  PetHorse2Bullet1: 'horse2-normal',
  PetHorse2Bullet2: 'horse2-bd',
  PetHorse3Bullet1: 'horse3-normal',
  PetHorse3Bullet2: 'horse3-bd',
  PetHorse3Bullet3: 'horse3-sp',
  PetHorse3Bullet4: 'horse3-bz',
  PetHorse4Bullet5: 'horse4-tmaoyi-falling',
  PetHorse4Bullet5Explode: 'horse4-tmaoyi-explode',
  PetHorseIceEffect: 'shared-horse-ice-effect',
};

function buildEffectAsset(symbol: EffectSymbol): PetHorseEffectAsset {
  assertVerifiedPetHorseAnimationTruth();
  const [owner, characterId, frameCount] = effectDefinitions[symbol];
  const directory = `DefineSprite_${characterId}_${symbol}`;
  const key = `pet-animation.horse.effect.${symbol}`;
  const object = requireObject(objectIdBySymbol[symbol]);
  const direction = symbol === 'PetHorse4Bullet5' || symbol === 'PetHorse4Bullet5Explode'
    ? 'fixed'
    : symbol === 'PetHorseIceEffect' ? undefined : 'left';
  return {
    key,
    symbol,
    frames: Array.from({ length: frameCount }, (_, index) => {
      const frame = index + 1;
      const stateId = symbol === 'PetHorseIceEffect'
        ? 'object.shared-ice.active'
        : `object.${object.id}.frame${String(frame).padStart(2, '0')}.${direction}`;
      const placement = requirePlacement(object, stateId);
      const baseline = requireBaseline(stateId);
      const subdirectory = owner === 'pet1-sublength8' ? `${directory}/1` : directory;
      return {
        key: `${key}.frame-${frame}`,
        path: `/assets/pets/horse/effects/${owner}/${subdirectory}/${frame}.png`,
        registrationOrigin: {
          x: placement.registrationPoint.x / baseline.width,
          y: placement.registrationPoint.y / baseline.height,
        },
      };
    }),
  };
}

export const petHorseEffectAssets = Object.fromEntries(
  (Object.keys(effectDefinitions) as EffectSymbol[]).map((symbol) => [symbol, buildEffectAsset(symbol)]),
) as Readonly<Record<EffectSymbol, PetHorseEffectAsset>>;

const projectileObjectIds: Readonly<Record<string, string>> = {
  'pet-skill.horse1.normal': 'horse1-normal',
  'pet-skill.horse1.sp': 'horse1-sp',
  'pet-skill.horse2.normal': 'horse2-normal',
  'pet-skill.horse2.bd': 'horse2-bd',
  'pet-skill.horse2.sp': 'horse1-sp',
  'pet-skill.horse3.normal': 'horse3-normal',
  'pet-skill.horse3.bd': 'horse3-bd',
  'pet-skill.horse3.sp': 'horse3-sp',
  'pet-skill.horse3.bz': 'horse3-bz',
  'pet-skill.horse4.normal': 'horse3-normal',
  'pet-skill.horse4.bd': 'horse3-bd',
  'pet-skill.horse4.sp': 'horse3-sp',
  'pet-skill.horse4.bz': 'horse3-bz',
  'pet-skill.horse4.tmaoyi': 'horse4-tmaoyi-falling',
  'pet-skill.horse4.tmaoyi.explode': 'horse4-tmaoyi-explode',
};

export function isPetHorseProjectileAsset(assetKey: string): boolean {
  return assetKey.startsWith('pet-skill.horse');
}

export function getPetHorseEffectUsage(assetKey: string): PetHorseEffectUsage | undefined {
  const objectId = projectileObjectIds[assetKey];
  if (!objectId) return undefined;
  const object = requireObject(objectId);
  const symbol = object.sourceIdentity.symbolClass as EffectSymbol;
  const fixedDirection = objectId.startsWith('horse4-tmaoyi');
  const placement = object.placements.find((candidate) =>
    candidate.stateId.endsWith(fixedDirection ? '.fixed' : '.left'));
  if (!placement || !(symbol in petHorseEffectAssets)) {
    throw new Error(`${PetHorseAnimationTruthId} is missing effect geometry for ${objectId}.`);
  }
  return {
    objectId,
    asset: petHorseEffectAssets[symbol],
    offsetX: fixedDirection ? 0 : Math.abs(placement.localMatrix.tx) - placement.registrationPoint.x,
    offsetY: fixedDirection ? 0 : placement.localMatrix.ty + placement.registrationPoint.y,
    depth: objectId.endsWith('explode') ? 48 : 47,
    followsPet: /follows horse/.test(horseTruth.states.find((state) => state.id === placement.stateId)?.entry ?? ''),
    fixedDirection,
  };
}

export function getPetHorseIceEffectAsset(): PetHorseEffectAsset {
  return petHorseEffectAssets.PetHorseIceEffect;
}

export function getPetHorseBodyActionForProjectile(form: number, assetKey: string): string | undefined {
  return ({
    '1:pet-skill.horse1.normal': 'hit1-normal',
    '1:pet-skill.horse1.sp': 'hit2-sp',
    '2:pet-skill.horse2.normal': 'hit1-normal',
    '2:pet-skill.horse2.bd': 'hit2-bd',
    '2:pet-skill.horse2.sp': 'hit3-sp',
    '3:pet-skill.horse3.normal': 'hit1-normal',
    '3:pet-skill.horse3.bd': 'hit2-bd',
    '3:pet-skill.horse3.sp': 'hit3-sp',
    '3:pet-skill.horse3.bz': 'hit4-bz',
    '4:pet-skill.horse4.normal': 'hit1-normal',
    '4:pet-skill.horse4.bd': 'hit2-bd',
    '4:pet-skill.horse4.sp': 'hit3-sp',
    '4:pet-skill.horse4.bz': 'hit4-bz',
    '4:pet-skill.horse4.tmaoyi': 'hit5-tmaoyi',
  } as Readonly<Record<string, string>>)[`${form}:${assetKey}`];
}

function requireObject(id: string): TruthObject {
  const object = horseTruth.displayObjects.find((candidate) => candidate.id === id);
  if (!object) throw new Error(`${PetHorseAnimationTruthId} is missing object ${id}.`);
  return object;
}

function requirePlacement(object: TruthObject, stateId: string): Placement {
  const placement = object.placements.find((candidate) => candidate.stateId === stateId);
  if (!placement) throw new Error(`${PetHorseAnimationTruthId} is missing placement ${stateId}.`);
  return placement;
}

function requireBaseline(stateId: string): TruthBaseline {
  const baseline = horseTruth.baselines.find((candidate) => candidate.stateId === stateId);
  if (!baseline) throw new Error(`${PetHorseAnimationTruthId} is missing baseline ${stateId}.`);
  return baseline;
}

function requireMatch(value: string, pattern: RegExp, stateId: string): string {
  const match = value.match(pattern)?.[1];
  if (!match) throw new Error(`${PetHorseAnimationTruthId} cannot parse ${stateId}.`);
  return match;
}
