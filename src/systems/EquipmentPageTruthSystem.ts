import { EquipmentPageRuntimeTruth } from '../generated/EquipmentPageTruth.generated';

export const EquipmentPageTruthId = 'task-settings-170b1.equipment-page';
export const EquipmentPageTruthDefaultState = 'p1-empty-page-1';

export type EquipmentPageTruthStateId =
  | 'p1-empty-page-1'
  | 'p1-equipped-page-1'
  | 'p2-equipped-page-1'
  | 'p1-equipment-page-2'
  | 'p1-equipment-selected'
  | 'p1-item-selected'
  | 'p1-fashion-hidden'
  | 'p1-fashion-shown'
  | 'page-closing';

type TruthBounds = Readonly<{
  left: number;
  top: number;
  width: number;
  height: number;
}>;

type TruthMatrix = Readonly<{
  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;
}>;

export type EquipmentPageTruthPlacement = Readonly<{
  stateId: EquipmentPageTruthStateId;
  visible: boolean;
  localMatrix: TruthMatrix;
  stageBounds: TruthBounds;
  hitArea?: TruthBounds;
}>;

export type EquipmentPageTruthTextStyle = Readonly<{
  fontFamily?: string;
  fontSizePx?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  leftGutterPx?: number;
  topGutterPx?: number;
  useOutlines?: boolean;
}>;

export type EquipmentPageTruthObject = Readonly<{
  id: string;
  parentId: string | null;
  depth: number;
  objectType: string;
  placements: readonly EquipmentPageTruthPlacement[];
  assetRef?: string;
  textStyle?: EquipmentPageTruthTextStyle;
}>;

type EquipmentPageTruthManifest = Readonly<{
  sourceManifestSha256: string;
  truthId: string;
  status: string;
  stage: Readonly<{ width: number; height: number }>;
  stateIds: readonly EquipmentPageTruthStateId[];
  objects: readonly EquipmentPageTruthObject[];
  displayListMatched: boolean;
  stateSetMatched: boolean;
  unresolvedCount: number;
}>;

type RuntimeTruthObject = Omit<EquipmentPageTruthObject, 'placements'> & Readonly<{
  localMatrix: TruthMatrix;
  stageBounds: TruthBounds;
  hitArea?: TruthBounds;
  visibleStateIds: readonly EquipmentPageTruthStateId[];
}>;

const manifest = EquipmentPageRuntimeTruth as unknown as EquipmentPageTruthManifest;
const runtimeObjects = manifest.objects as unknown as readonly RuntimeTruthObject[];
const objectsById = new Map(runtimeObjects.map((item) => [item.id, item]));

assertVerifiedEquipmentPageTruth();

export function assertVerifiedEquipmentPageTruth(): void {
  if (manifest.truthId !== EquipmentPageTruthId || manifest.status !== 'verified') {
    throw new Error('Formal equipment page requires the verified 170B1 truth manifest.');
  }
  if (manifest.stage.width !== 940 || manifest.stage.height !== 590) {
    throw new Error('Formal equipment page truth must remain on the original 940x590 stage.');
  }
  if (
    runtimeObjects.length !== 63
    || !manifest.displayListMatched
    || !manifest.stateSetMatched
    || manifest.unresolvedCount !== 0
  ) {
    throw new Error('Formal equipment page truth is incomplete or unresolved.');
  }
}

export function getEquipmentPageTruthObjects(): readonly EquipmentPageTruthObject[] {
  return runtimeObjects.map(toPublicObject);
}

export function getEquipmentPageTruthObject(id: string): EquipmentPageTruthObject {
  const item = objectsById.get(id);
  if (!item) throw new Error(`Equipment page truth object is missing: ${id}`);
  return toPublicObject(item);
}

export function getEquipmentPageTruthPlacement(
  id: string,
  stateId: EquipmentPageTruthStateId = EquipmentPageTruthDefaultState,
): EquipmentPageTruthPlacement {
  const item = objectsById.get(id);
  if (!item) throw new Error(`Equipment page truth object is missing: ${id}`);
  return {
    stateId,
    visible: item.visibleStateIds.includes(stateId),
    localMatrix: item.localMatrix,
    stageBounds: item.stageBounds,
    ...(item.hitArea ? { hitArea: item.hitArea } : {}),
  };
}

export function getEquipmentPageTruthChildren(parentId: string): readonly EquipmentPageTruthObject[] {
  return runtimeObjects
    .filter((item) => item.parentId === parentId)
    .sort((left, right) => left.depth - right.depth)
    .map(toPublicObject);
}

export function getEquipmentPageInventorySlotIds(): readonly string[] {
  return runtimeObjects
    .map((item) => item.id)
    .filter((id) => /^inventory-slot-\d{2}$/.test(id))
    .sort();
}

function toPublicObject(item: RuntimeTruthObject): EquipmentPageTruthObject {
  return {
    id: item.id,
    parentId: item.parentId,
    depth: item.depth,
    objectType: item.objectType,
    ...(item.textStyle ? { textStyle: item.textStyle } : {}),
    placements: manifest.stateIds.map((stateId) => ({
      stateId,
      visible: item.visibleStateIds.includes(stateId),
      localMatrix: item.localMatrix,
      stageBounds: item.stageBounds,
      ...(item.hitArea ? { hitArea: item.hitArea } : {}),
    })),
  };
}
