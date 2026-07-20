import type { MovementPlatform } from './HeroMovementSystem';

// StageListener11 tweens gameSence.y to 2370 for the boss phase. The +2379.4
// seen in FFDec's frame SVG only normalizes the export crop and is not runtime
// scene state.
export const STAGE11_SCENE_OFFSET_Y = 2370;
export const STAGE11_WORLD_WIDTH = 940;
export const STAGE11_WORLD_HEIGHT = 2970.45;

export type Stage11WallKind =
  | 'ObsWall'
  | 'ThroughWall'
  | 'ThroughUpButDownWall'
  | 'FallDownWhenStandingWall';

export type Stage11Matrix = Readonly<{
  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;
}>;

export type Stage11WallMarker = Readonly<{
  id: string;
  kind: Stage11WallKind;
  sourceCharacterId: 3 | 5 | 6 | 7;
  sourceSize: Readonly<{ width: number; height: number }>;
  matrix: Stage11Matrix;
}>;

export type Stage11Bounds = Readonly<{
  left: number;
  right: number;
  top: number;
  bottom: number;
}>;

export const stage11RenderBounds = {
  floor: { left: 0, right: 1440, top: 0, bottom: 690 },
  background: { left: -79, right: 1053, top: 0, bottom: 3051 },
  foreground: { left: -200, right: 1097.2, top: 205.5, bottom: 2961.05 },
} as const satisfies Record<'floor' | 'background' | 'foreground', Stage11Bounds>;

const marker = (
  id: string,
  kind: Stage11WallKind,
  sourceCharacterId: Stage11WallMarker['sourceCharacterId'],
  sourceSize: Stage11WallMarker['sourceSize'],
  matrix: Stage11Matrix,
): Stage11WallMarker => ({ id, kind, sourceCharacterId, sourceSize, matrix });

const obsSize = { width: 296, height: 66 } as const;
const throughSize = { width: 300, height: 19.9 } as const;

// Exact root placements from export.gameSence.sl11 (character 46), frame 1.
// These are runtime layout data; the invisible AS3 marker sprites are not baked
// into the foreground texture.
export const stage11WallMarkers = [
  marker('stage11-obs-1', 'ObsWall', 7, obsSize, { a: 3.7162, b: 0, c: 0, d: 0.303, tx: 493.45, ty: 508.55 }),
  marker('stage11-obs-2', 'ObsWall', 7, obsSize, { a: 0, b: 9.7972, c: -0.7574, d: 0, tx: -53.9, ty: -929.45 }),
  marker('stage11-obs-3', 'ObsWall', 7, obsSize, { a: 0, b: 9.7973, c: -0.353, d: 0, tx: 1043.45, ty: -915.55 }),
  marker('stage11-through-1', 'ThroughWall', 6, throughSize, { a: 1, b: 0, c: 0, d: 1, tx: 51.45, ty: 278 }),
  marker('stage11-through-2', 'ThroughWall', 6, throughSize, { a: 0.8, b: 0, c: 0, d: 1, tx: 788.15, ty: 331.95 }),
  marker('stage11-through-3', 'ThroughWall', 6, throughSize, { a: 0.8, b: 0, c: 0, d: 1, tx: 431.9, ty: 175.2 }),
  marker('stage11-through-4', 'ThroughWall', 6, throughSize, { a: 1.5167, b: 0, c: 0, d: 1, tx: 669.9, ty: 9.05 }),
  marker('stage11-through-5', 'ThroughWall', 6, throughSize, { a: 1.5167, b: 0, c: 0, d: 1, tx: 183.6, ty: -219.85 }),
  marker('stage11-through-6', 'ThroughWall', 6, throughSize, { a: 1.5167, b: 0, c: 0, d: 1, tx: 845.1, ty: -917.1 }),
  marker('stage11-through-7', 'ThroughWall', 6, throughSize, { a: 1.5167, b: 0, c: 0, d: 1, tx: 150.25, ty: -1244.8 }),
  marker('stage11-through-8', 'ThroughWall', 6, throughSize, { a: 1.5167, b: 0, c: 0, d: 1, tx: 850.2, ty: -1465.3 }),
  marker('stage11-through-9', 'ThroughWall', 6, throughSize, { a: 0.8, b: 0, c: 0, d: 1, tx: 431.9, ty: -436.15 }),
  marker('stage11-through-10', 'ThroughWall', 6, throughSize, { a: 0.8, b: 0, c: 0, d: 1, tx: 889.1, ty: -555.5 }),
  marker('stage11-through-11', 'ThroughWall', 6, throughSize, { a: 0.8, b: 0, c: 0, d: 1, tx: 174.5, ty: -636.8 }),
  marker('stage11-through-12', 'ThroughWall', 6, throughSize, { a: 0.8, b: 0, c: 0, d: 1, tx: 356.9, ty: -815.85 }),
  marker('stage11-through-13', 'ThroughWall', 6, throughSize, { a: 0.8, b: 0, c: 0, d: 1, tx: 531.1, ty: -1109.7 }),
  marker('stage11-through-14', 'ThroughWall', 6, throughSize, { a: 0.8, b: 0, c: 0, d: 1, tx: 301.75, ty: -1430.75 }),
  marker('stage11-through-15', 'ThroughWall', 6, throughSize, { a: 0.8, b: 0, c: 0, d: 1, tx: 566.85, ty: -1648.3 }),
  marker('stage11-through-up-down-1', 'ThroughUpButDownWall', 5, throughSize, { a: 3.6667, b: 0, c: 0, d: 1, tx: 496.35, ty: -1862.45 }),
  marker('stage11-fall-1', 'FallDownWhenStandingWall', 3, throughSize, { a: 3.6667, b: 0, c: 0, d: 1, tx: 505.45, ty: -2369.35 }),
] as const satisfies readonly Stage11WallMarker[];

export const stage11TransferDoor = {
  id: 'stage11-transfer-door-1',
  sourceCharacterId: 45,
  matrix: { a: 1, b: 0, c: 0, d: 1, tx: 807.6, ty: -1926.75 },
  // Character 41 is placed at (-0.25, 54.3); its main door shape is
  // x [-83.5, 83.5], y [-163.45, 0].
  bounds: { left: 723.85, right: 890.85, top: 334.1, bottom: 497.55 },
} as const;

export function getStage11MarkerBounds(markerData: Stage11WallMarker): Stage11Bounds {
  const { a, b, c, d, tx, ty } = markerData.matrix;
  const { width, height } = markerData.sourceSize;
  const transformedWidth = Math.abs(a) * width + Math.abs(c) * height;
  const transformedHeight = Math.abs(b) * width + Math.abs(d) * height;
  const centerY = ty + STAGE11_SCENE_OFFSET_Y;
  return {
    left: tx - transformedWidth / 2,
    right: tx + transformedWidth / 2,
    top: centerY - transformedHeight / 2,
    bottom: centerY + transformedHeight / 2,
  };
}

export const STAGE11_GROUND_PLATFORM_ID = stage11WallMarkers[0].id;
export const STAGE11_GROUND_TOP_Y = getStage11MarkerBounds(stage11WallMarkers[0]).top;

export function createStage11MovementPlatforms(): MovementPlatform[] {
  return stage11WallMarkers.flatMap((markerData) => {
    const { a, b, c, d } = markerData.matrix;
    const horizontal = Math.abs(a) >= Math.abs(c) && Math.abs(d) >= Math.abs(b);
    if (!horizontal) {
      return [];
    }
    const bounds = getStage11MarkerBounds(markerData);
    return [{
      id: markerData.id,
      kind: markerData.kind === 'ObsWall' ? 'solid' : 'through',
      left: bounds.left,
      right: bounds.right,
      top: bounds.top,
    }];
  });
}
