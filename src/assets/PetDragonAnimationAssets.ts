import truth from '../../docs/reverse-engineering/ground-truth/manifests/task-settings-213-pet-dragon-family.json';
import catalog from './PetDragonAssetFiles.json';

export const PetDragonAnimationTruthId = 'task-settings-213.pet-dragon-family';
export type PetDragonDirection = 'left' | 'right';
type Point = Readonly<{ x: number; y: number }>;

export function assertVerifiedPetDragonAnimationTruth(): void {
  if (truth.truthId !== PetDragonAnimationTruthId || catalog.truthId !== truth.truthId
    || truth.status !== 'verified' || truth.completeness.unresolved.length
    || truth.visualTruth.unresolved.length || truth.visualTruth.displayObjects.length !== 11
    || truth.visualTruth.bodyTimelines.length !== 4) {
    throw new Error('Incomplete or unverified dragon animation truth');
  }
  const expectedFiles = truth.visualTruth.displayObjects.reduce((count, object) =>
    count + (object.objectType === 'body-atlas' ? 1 : object.frameCount), 0);
  if (catalog.files.length !== expectedFiles
    || new Set(catalog.files.map((file) => file.key)).size !== expectedFiles
    || new Set(catalog.files.map((file) => file.path)).size !== expectedFiles) {
    throw new Error('Dragon resource file coverage or ownership drift');
  }
}

function requireFile(objectId: string, frame: number) {
  const file = catalog.files.find((file) => file.objectId === objectId && file.frame === frame);
  if (!file) throw new Error(`Missing dragon resource ${objectId}/${frame}`);
  return file;
}

export function getPetDragonBodyAsset(form: number) {
  assertVerifiedPetDragonAnimationTruth();
  const object = truth.visualTruth.displayObjects.find((object) => object.id === `dragon${form}-body`);
  const timeline = truth.visualTruth.bodyTimelines.find((timeline) => timeline.form === form);
  if (!object || !('cell' in object) || !object.cell || !object.offset || !timeline) {
    throw new Error(`Missing dragon body ${form}`);
  }
  const file = requireFile(object.id, 0);
  if (file.width % object.cell.width || file.height % object.cell.height
    || file.height / object.cell.height !== timeline.rowCount) {
    throw new Error(`Invalid dragon atlas dimensions ${form}`);
  }
  return { ...file, form, cellWidth: object.cell.width, cellHeight: object.cell.height,
    columns: file.width / object.cell.width, offset: object.offset, timeline, clock: truth.visualTruth.bodyClock };
}

export function getPetDragonBodyAction(form: number, action: string) {
  const asset = getPetDragonBodyAsset(form);
  const timeline = asset.timeline.actions.find((candidate) => candidate.id === action || candidate.sourceAction === action);
  if (!timeline) throw new Error(`Unknown dragon action ${form}/${action}`);
  return timeline;
}

/** Zero-based elapsed ticks from a fresh action entry; same-row entry retains its prior cursor. */
export function getPetDragonBodyFrame(form: number, action: string, elapsedTicks: number) {
  if (!Number.isFinite(elapsedTicks) || elapsedTicks < 0) throw new Error('Invalid dragon animation clock');
  const asset = getPetDragonBodyAsset(form);
  const timeline = getPetDragonBodyAction(form, action);
  const elapsed = Math.floor(elapsedTicks);
  const tick = (timeline.loops ? elapsed % timeline.totalHostTicks
    : Math.min(elapsed, timeline.totalHostTicks - 1)) + 1;
  const cell = timeline.cells.find((cell) => tick <= cell.lastHostTick)!;
  return { ...cell, row: timeline.row, frame: timeline.row * asset.columns + cell.column,
    remainingHoldCount: cell.lastHostTick - tick + 1,
    complete: !timeline.loops && elapsed >= timeline.totalHostTicks };
}

export function getPetDragonBodyPlacement(form: number, direction: PetDragonDirection, root: Point) {
  const asset = getPetDragonBodyAsset(form);
  return { x: root.x - asset.cellWidth / 2 + (direction === 'right' ? asset.offset.x : -asset.offset.x),
    y: root.y - asset.cellHeight / 2 + asset.offset.y, flipX: direction === 'right' };
}

export function getPetDragonEffectFrame(symbol: string, frame: number) {
  assertVerifiedPetDragonAnimationTruth();
  const object = truth.visualTruth.displayObjects.find((object) => object.id === symbol);
  if (!object || !('frames' in object) || !object.frames) throw new Error(`Unknown dragon effect ${symbol}`);
  const geometry = object.frames.find((candidate) => candidate.frame === frame);
  if (!geometry) throw new Error(`Unknown dragon effect frame ${symbol}/${frame}`);
  return { ...requireFile(symbol, frame), geometry, depth: object.depth, frameCount: object.frameCount };
}

export function getPetDragonEffectPlacement(symbol: string, frame: number, direction: PetDragonDirection,
  root: Point, offset: Point = { x: 0, y: 0 }) {
  const file = getPetDragonEffectFrame(symbol, frame);
  const registration = { x: file.geometry.registrationPoint.x - file.cropX,
    y: file.geometry.registrationPoint.y - file.cropY };
  const right = direction === 'right';
  return { x: root.x + (right ? offset.x : -offset.x) + (right ? registration.x - file.width : -registration.x),
    y: root.y + offset.y - registration.y, flipX: right };
}

export function getPetDragonCollision(form: number) {
  const family = truth.forms.find((candidate) => candidate.id === `dragon${form}`);
  if (!family) throw new Error(`Unknown dragon collision form ${form}`);
  const profile = truth.collisionProfiles.find((profile) => profile.class === family.collision);
  if (!profile) throw new Error(`Missing dragon collision ${family.collision}`);
  return profile;
}

export const petDragonBodyAssets = [1, 2, 3, 4].map(getPetDragonBodyAsset);
export const petDragonEffectFrames = truth.visualTruth.displayObjects
  .filter((object) => object.objectType === 'movie-clip')
  .flatMap((object) => Array.from({ length: object.frameCount }, (_, i) => getPetDragonEffectFrame(object.id, i + 1)));

export const petDragonBundleAssets = [
  ...petDragonBodyAssets.map((asset) => ({ kind: 'spritesheet' as const, key: asset.key, path: asset.path,
    frameWidth: asset.cellWidth, frameHeight: asset.cellHeight })),
  ...petDragonEffectFrames.map((asset) => ({ kind: 'image' as const, key: asset.key, path: asset.path })),
];
