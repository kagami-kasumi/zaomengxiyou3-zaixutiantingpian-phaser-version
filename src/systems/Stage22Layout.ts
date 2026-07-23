export const STAGE22_WORLD_LEFT = -45;
export const STAGE22_WORLD_RIGHT = 4692.55;
export const STAGE22_WORLD_WIDTH = STAGE22_WORLD_RIGHT - STAGE22_WORLD_LEFT;
export const STAGE22_WORLD_HEIGHT = 590;
export const STAGE22_TRAVEL_LEFT = 6.6;
export const STAGE22_TRAVEL_RIGHT = 4692.55;

export type Stage22Matrix = Readonly<{
  a: number; b: number; c: number; d: number; tx: number; ty: number;
}>;

export type Stage22WallMarker = Readonly<{
  id: string;
  kind: 'ObsWall' | 'FallDownWhenStandingWall' | 'ThroughWall';
  sourceCharacterId: 9 | 10 | 11;
  sourceSize: Readonly<{ width: number; height: number }>;
  matrix: Stage22Matrix;
}>;

export type Stage22StopPoint = Readonly<{
  id: string;
  sourceCharacterId: 7;
  x: number;
  y: number;
  idx: 0 | 1 | 2 | 3 | 4;
  betweenRandL: 1150;
  isBoss: boolean;
}>;

export type Stage22FireThorn = Readonly<{
  id: string;
  sourceCharacterId: 31;
  x: number;
  y: number;
  scaleX: 0.74472046;
}>;

export const stage22RenderBounds = {
  floor: { left: 0, right: 631, top: 0, bottom: 549 },
  background: { left: -45, right: 4655, top: 0, bottom: 590 },
  midground: { left: 230.7, right: 1975.8, top: 286.85, bottom: 339.3 },
  foreground: { left: -7.15, right: 4693.85, top: 496, bottom: 590 },
} as const;

const wallSize = { width: 296, height: 66 } as const;
export const STAGE22_GROUND_PLATFORM_ID = 'stage22-obs-1';
export const STAGE22_GROUND_TOP_Y = 501.0501981;

export const stage22WallMarkers = [
  {
    id: STAGE22_GROUND_PLATFORM_ID,
    kind: 'ObsWall',
    sourceCharacterId: 11,
    sourceSize: wallSize,
    matrix: { a: 16.891891, b: 0, c: 0, d: 0.3030243, tx: 2508.3, ty: 511.05 },
  },
  {
    id: 'stage22-obs-2',
    kind: 'ObsWall',
    sourceCharacterId: 11,
    sourceSize: wallSize,
    matrix: { a: 0.3896942, b: 0, c: 0, d: 15.1515045, tx: 4692.55, ty: 75 },
  },
  {
    id: 'stage22-obs-3',
    kind: 'ObsWall',
    sourceCharacterId: 11,
    sourceSize: wallSize,
    matrix: { a: 0, b: 2.364746, c: -0.35295105, d: 0, tx: 6.6, ty: 197.4 },
  },
  {
    id: 'stage22-fall-1',
    kind: 'FallDownWhenStandingWall',
    sourceCharacterId: 9,
    sourceSize: wallSize,
    matrix: { a: 16.66655, b: 0, c: 0, d: 1, tx: 2508.3, ty: -142.6 },
  },
  {
    id: 'stage22-through-1',
    kind: 'ThroughWall',
    sourceCharacterId: 10,
    sourceSize: wallSize,
    matrix: { a: 0.80682373, b: 0, c: 0, d: 1, tx: 347.7, ty: 304.9 },
  },
  {
    id: 'stage22-through-2',
    kind: 'ThroughWall',
    sourceCharacterId: 10,
    sourceSize: wallSize,
    matrix: { a: 0.80682373, b: 0, c: 0, d: 1, tx: 1404.35, ty: 304.85 },
  },
  {
    id: 'stage22-through-3',
    kind: 'ThroughWall',
    sourceCharacterId: 10,
    sourceSize: wallSize,
    matrix: { a: 0.80682373, b: 0, c: 0, d: 1, tx: 1856.8, ty: 303.3 },
  },
] as const satisfies readonly Stage22WallMarker[];

export const stage22StopPoints = [
  { id: 'stage22-stop-0', sourceCharacterId: 7, x: 1267.3, y: 189.65, idx: 0, betweenRandL: 1150, isBoss: false },
  { id: 'stage22-stop-1', sourceCharacterId: 7, x: 2147.55, y: 182.95, idx: 1, betweenRandL: 1150, isBoss: false },
  { id: 'stage22-stop-2', sourceCharacterId: 7, x: 3017.8, y: 163.75, idx: 2, betweenRandL: 1150, isBoss: false },
  { id: 'stage22-stop-3', sourceCharacterId: 7, x: 3769.95, y: 189.65, idx: 3, betweenRandL: 1150, isBoss: false },
  { id: 'stage22-stop-4', sourceCharacterId: 7, x: 4581.7, y: 252.3, idx: 4, betweenRandL: 1150, isBoss: true },
] as const satisfies readonly Stage22StopPoint[];

const fireCoordinates = [
  [450.75, 491.05],
  [1310.6, 491.8],
  [1655.55, 491.35],
  [2241.65, 489.55],
  [2468.3, 491.35],
  [2693.85, 493.55],
  [2900.85, 495.05],
  [3127.55, 490.9],
  [3367.85, 492.7],
] as const;

export const stage22FireThorns: readonly Stage22FireThorn[] = fireCoordinates.map(
  ([x, y], index) => ({
    id: `stage22-fire-${index + 1}`,
    sourceCharacterId: 31,
    x,
    y,
    scaleX: 0.74472046,
  }),
);

export const stage22TransferDoor = {
  id: 'stage22-transfer-door-1',
  sourceCharacterId: 63,
  x: 4316.75,
  y: 450.75,
  isTransferDoor: true,
  sourceBounds: { left: -90.75, right: 95.05, top: -110.7, bottom: 54.3 },
} as const;

export const stage22HeroSpawns = [
  { slot: 'p1', x: 100, y: STAGE22_GROUND_TOP_Y },
  { slot: 'p2', x: 100, y: STAGE22_GROUND_TOP_Y },
] as const;
