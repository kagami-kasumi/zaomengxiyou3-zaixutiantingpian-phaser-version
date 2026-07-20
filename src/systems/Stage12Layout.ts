export const STAGE12_WORLD_LEFT = -200;
export const STAGE12_WORLD_WIDTH = 5377.75;
export const STAGE12_WORLD_HEIGHT = 690;

export type Stage12Matrix = Readonly<{
  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;
}>;

export type Stage12WallMarker = Readonly<{
  id: string;
  kind: 'ObsWall' | 'FallDownWhenStandingWall';
  sourceCharacterId: 9 | 10;
  sourceSize: Readonly<{ width: number; height: number }>;
  matrix: Stage12Matrix;
  innerMatrix?: Stage12Matrix;
}>;

export type Stage12StopPoint = Readonly<{
  id: string;
  sourceCharacterId: 7;
  x: number;
  y: number;
  idx: 0 | 1 | 2 | 3 | 4;
  betweenRandL: 1150;
  isBoss: boolean;
}>;

export type Stage12SpawnPoint = Readonly<{
  id: string;
  sourceCharacterId: 5;
  x: number;
  y: number;
  stopPointIdx: 0 | 1 | 2 | 3 | 4;
  delay: 2 | 6;
  interval: 1;
  enemyType: 2 | 4 | 7 | 8;
  totalNum: number;
  isRandom: false;
}>;

export const stage12RenderBounds = {
  floor: { left: 0, right: 1440, top: 0, bottom: 690 },
  background: { left: -9.25, right: 4880.4, top: 11, bottom: 606.8 },
  foreground: { left: -200, right: 5177.75, top: 494, bottom: 589.4 },
} as const;

const obsSourceSize = { width: 296, height: 66 } as const;

export const stage12WallMarkers = [
  {
    id: 'stage12-obs-1', kind: 'ObsWall', sourceCharacterId: 10,
    sourceSize: obsSourceSize,
    matrix: { a: 17.567429, b: 0, c: 0, d: 0.3030243, tx: 2419.35, ty: 511.05 },
  },
  {
    id: 'stage12-obs-2', kind: 'ObsWall', sourceCharacterId: 10,
    sourceSize: obsSourceSize,
    matrix: { a: 0.3896942, b: 0, c: 0, d: 15.1515045, tx: 4917.55, ty: 89 },
  },
  {
    id: 'stage12-obs-3', kind: 'ObsWall', sourceCharacterId: 10,
    sourceSize: obsSourceSize,
    matrix: { a: 0, b: 2.364746, c: -0.35295105, d: 0, tx: -184.35, ty: 211.4 },
  },
  {
    id: 'stage12-fall-1', kind: 'FallDownWhenStandingWall', sourceCharacterId: 9,
    sourceSize: obsSourceSize,
    matrix: { a: 17.333298, b: 0, c: 0, d: 1, tx: 2415.35, ty: -128.5 },
    innerMatrix: { a: 1.0135193, b: 0, c: 0, d: 0.3030243, tx: 0, ty: 0 },
  },
] as const satisfies readonly Stage12WallMarker[];

export const stage12StopPoints = [
  { id: '__id46_', sourceCharacterId: 7, x: 1147.4, y: 215.25, idx: 0, betweenRandL: 1150, isBoss: false },
  { id: '__id47_', sourceCharacterId: 7, x: 1809.7, y: 208.55, idx: 1, betweenRandL: 1150, isBoss: false },
  { id: '__id50_', sourceCharacterId: 7, x: 2813.95, y: 189.35, idx: 2, betweenRandL: 1150, isBoss: false },
  { id: '__id48_', sourceCharacterId: 7, x: 3790.2, y: 258.35, idx: 3, betweenRandL: 1150, isBoss: false },
  { id: '__id49_', sourceCharacterId: 7, x: 4661.55, y: 240.7, idx: 4, betweenRandL: 1150, isBoss: true },
] as const satisfies readonly Stage12StopPoint[];

const spawn = (
  id: string,
  x: number,
  y: number,
  stopPointIdx: Stage12SpawnPoint['stopPointIdx'],
  delay: Stage12SpawnPoint['delay'],
  enemyType: Stage12SpawnPoint['enemyType'],
  totalNum: number,
): Stage12SpawnPoint => ({
  id, sourceCharacterId: 5, x, y, stopPointIdx, delay,
  interval: 1, enemyType, totalNum, isRandom: false,
});

export const stage12SpawnPoints = [
  spawn('__id52_', 347.6, 328.85, 0, 2, 8, 4),
  spawn('__id59_', 967.55, 323.2, 0, 2, 8, 4),
  spawn('__id53_', 1266.7, 328.85, 1, 6, 7, 3),
  spawn('__id54_', 1521.4, 396, 1, 2, 8, 5),
  spawn('__id60_', 1783.5, 333, 1, 6, 7, 3),
  spawn('__id55_', 1948.8, 343.2, 2, 2, 7, 6),
  spawn('__id61_', 2661.45, 343.2, 2, 2, 7, 6),
  spawn('__id56_', 2945.25, 387.2, 3, 2, 7, 3),
  spawn('__id57_', 2888.95, 387.2, 3, 6, 8, 3),
  spawn('__id58_', 3559.3, 388, 3, 2, 7, 4),
  spawn('__id62_', 3635.4, 388, 3, 6, 8, 3),
  spawn('__id51_', 4009.8, 343.2, 4, 2, 4, 1),
  spawn('__id63_', 4606.85, 351.2, 4, 2, 2, 1),
] as const satisfies readonly Stage12SpawnPoint[];

export const stage12TransferDoor = {
  id: 'stage12-transfer-door-1',
  sourceCharacterId: 52,
  x: 4611.65,
  y: 452.35,
  isTransferDoor: true,
  sourceBounds: { left: -90.75, right: 95.05, top: -110.7, bottom: 54.3 },
} as const;

export const stage12FbEnter = {
  id: 'stage12-fb-enter-1',
  sourceCharacterId: 22,
  x: 1760,
  y: 334.65,
  frameCount: 30,
  sourceBounds: { left: -397.95, right: 1138.85, top: 0, bottom: 184 },
  collision: { sourceCharacterId: 21, name: 'colipse', x: 339.55, y: 95.95 },
} as const;

export const stage12HeroSpawns = [
  { slot: 'p1', x: 100, y: 350 },
  { slot: 'p2', x: 100, y: 350 },
] as const;
