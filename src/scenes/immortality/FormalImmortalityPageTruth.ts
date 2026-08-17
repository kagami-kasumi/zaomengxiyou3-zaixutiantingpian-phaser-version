import immortalityPageTruth from '../../../docs/reverse-engineering/ground-truth/manifests/task-settings-175e-immortality-page.json';

export type ImmortalityTruthBounds = Readonly<{
  left: number;
  top: number;
  width: number;
  height: number;
}>;

type ImmortalityTruthObject = (typeof immortalityPageTruth.displayObjects)[number];

export const ImmortalityPageTruthId = 'task-settings-175e.immortality-page' as const;

export const ImmortalityTruthObjectIds = {
  root: 'immortality-page-root',
  soul: 'immortality-page-root.txtlh',
  back: 'immortality-page-root.btnback',
  effects: [
    'immortality-page-root.ef1',
    'immortality-page-root.ef2',
    'immortality-page-root.ef3',
    'immortality-page-root.ef4',
    'immortality-page-root.ef5',
  ],
  make: [
    'immortality-page-root.make1',
    'immortality-page-root.make2',
    'immortality-page-root.make3',
    'immortality-page-root.make4',
    'immortality-page-root.make5',
  ],
  dialog: 'immortality-page-root.craft-dialog',
  dialogClose: 'immortality-page-root.craft-dialog.x_btn',
  compound: [
    'immortality-page-root.craft-dialog.compound1',
    'immortality-page-root.craft-dialog.compound2',
    'immortality-page-root.craft-dialog.compound3',
    'immortality-page-root.craft-dialog.compound4',
    'immortality-page-root.craft-dialog.compound5',
  ],
} as const;

const OwnerTruthIds = {
  1: 'immortality-page-root.owner-selector-p1-wk',
  2: 'immortality-page-root.owner-selector-p1-ts',
  3: 'immortality-page-root.owner-selector-p1-bj',
  4: 'immortality-page-root.owner-selector-p1-ss',
  5: 'immortality-page-root.owner-selector-p1-bl',
} as const;

export function assertVerifiedImmortalityPageTruth(): void {
  if (immortalityPageTruth.truthId !== ImmortalityPageTruthId
    || immortalityPageTruth.status !== 'verified') {
    throw new Error(`${immortalityPageTruth.truthId} is not the verified immortality-page truth.`);
  }
  if (immortalityPageTruth.displayObjects.length !== 132
    || immortalityPageTruth.states.length !== 26) {
    throw new Error(`${ImmortalityPageTruthId} completeness drifted.`);
  }
  if (!immortalityPageTruth.completeness.displayListMatched
    || !immortalityPageTruth.completeness.stateSetMatched
    || immortalityPageTruth.completeness.unresolved.length > 0) {
    throw new Error(`${ImmortalityPageTruthId} contains unresolved or unmatched evidence.`);
  }
}

export function getImmortalityTruthBounds(id: string): ImmortalityTruthBounds {
  const placement = findObject(id).placements.find(({ stageBounds }) => stageBounds);
  if (!placement?.stageBounds) {
    throw new Error(`${ImmortalityPageTruthId} ${id} has no stage bounds.`);
  }
  return placement.stageBounds;
}

export function getImmortalityCellTruthBounds(
  typeIndex: number,
  gradeIndex: number,
  child?: 'eat' | 'consumed',
): ImmortalityTruthBounds {
  assertGridIndex(typeIndex, 'type');
  assertGridIndex(gradeIndex, 'grade');
  const rootId = `immortality-page-root.im${typeIndex + 1}_${gradeIndex + 1}`;
  const suffix = child === 'eat'
    ? '.eatbtn'
    : child === 'consumed'
      ? '.consumed-pill-icon'
      : '';
  return getImmortalityTruthBounds(`${rootId}${suffix}`);
}

export function getImmortalityOwnerTruthBounds(
  heroId: 1 | 2 | 3 | 4 | 5,
  owner: 'p1' | 'p2',
): ImmortalityTruthBounds {
  const heroBounds = getImmortalityTruthBounds(OwnerTruthIds[heroId]);
  if (owner === 'p1') return heroBounds;
  const p1Anchor = getImmortalityTruthBounds(OwnerTruthIds[1]);
  const p2Anchor = getImmortalityTruthBounds('immortality-page-root.owner-selector-p2-wk');
  return {
    ...heroBounds,
    left: roundTruthCoordinate(heroBounds.left + p2Anchor.left - p1Anchor.left),
    top: roundTruthCoordinate(heroBounds.top + p2Anchor.top - p1Anchor.top),
  };
}

export function getImmortalityTruthCharacterId(id: string): number {
  const characterId = findObject(id).sourceIdentity.characterId;
  if (typeof characterId !== 'number') {
    throw new Error(`${ImmortalityPageTruthId} ${id} has no character id.`);
  }
  return characterId;
}

export function getImmortalityTruthStateIds(): readonly string[] {
  assertVerifiedImmortalityPageTruth();
  return immortalityPageTruth.states.map(({ id }) => id);
}

function findObject(id: string): ImmortalityTruthObject {
  assertVerifiedImmortalityPageTruth();
  const object = immortalityPageTruth.displayObjects.find((candidate) => candidate.id === id);
  if (!object) throw new Error(`${ImmortalityPageTruthId} is missing ${id}.`);
  return object;
}

function assertGridIndex(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 4) {
    throw new RangeError(`${ImmortalityPageTruthId} ${label} index must be 0..4.`);
  }
}

function roundTruthCoordinate(value: number): number {
  return Math.round(value * 1_000) / 1_000;
}
