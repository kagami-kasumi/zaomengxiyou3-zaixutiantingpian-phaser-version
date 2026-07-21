export const STAGE13_WORLD_LEFT = -30;
export const STAGE13_WORLD_WIDTH = 5659.35;
export const STAGE13_WORLD_HEIGHT = 690;

export type Stage13Matrix = Readonly<{
  a: number; b: number; c: number; d: number; tx: number; ty: number;
}>;

export type Stage13WallMarker = Readonly<{
  id: string;
  kind: 'ObsWall' | 'FallDownWhenStandingWall';
  sourceCharacterId: 9 | 10;
  sourceSize: Readonly<{ width: number; height: number }>;
  matrix: Stage13Matrix;
  innerMatrix?: Stage13Matrix;
}>;

export type Stage13StopPoint = Readonly<{
  id: string;
  sourceCharacterId: 7;
  x: number;
  y: number;
  idx: 0 | 1 | 2 | 3 | 4;
  betweenRandL: 940 | 1150;
  isBoss: boolean;
}>;

export type Stage13SpawnPoint = Readonly<{
  id: string;
  sourceCharacterId: 5;
  x: number;
  y: number;
  stopPointIdx: 0 | 1 | 2 | 3 | 4;
  delay: 2 | 5 | 6;
  interval: 1 | 2 | 4;
  enemyType: 3 | 5 | 7 | 8 | 30;
  totalNum: number;
  isRandom: false;
}>;

export const stage13RenderBounds = {
  floor: { left: 0, right: 1440, top: 0, bottom: 690 },
  background: { left: -90, right: 4813.15, top: 0, bottom: 677.85 },
  foreground: { left: -30, right: 5629.35, top: 494, bottom: 589 },
} as const;

const obsSourceSize = { width: 296, height: 66 } as const;
export const STAGE13_GROUND_PLATFORM_ID = 'stage13-obs-1';
export const STAGE13_GROUND_TOP_Y = 501.0003962;

export const stage13WallMarkers = [
  { id: 'stage13-obs-1', kind: 'ObsWall', sourceCharacterId: 10, sourceSize: obsSourceSize,
    matrix: { a: 16.891891, b: 0, c: 0, d: 0.6060486, tx: 2496.35, ty: 521 } },
  { id: 'stage13-obs-2', kind: 'ObsWall', sourceCharacterId: 10, sourceSize: obsSourceSize,
    matrix: { a: 0.3896942, b: 0, c: 0, d: 15.1515045, tx: 4804.65, ty: 77 } },
  { id: 'stage13-obs-3', kind: 'ObsWall', sourceCharacterId: 10, sourceSize: obsSourceSize,
    matrix: { a: 0, b: 2.364746, c: -0.35295105, d: 0, tx: -13.35, ty: 199.4 } },
  { id: 'stage13-fall-1', kind: 'FallDownWhenStandingWall', sourceCharacterId: 9, sourceSize: obsSourceSize,
    matrix: { a: 16.66655, b: 0, c: 0, d: 1, tx: 2496.35, ty: -140.6 },
    innerMatrix: { a: 1.0135193, b: 0, c: 0, d: 0.3030243, tx: 0, ty: 0 } },
] as const satisfies readonly Stage13WallMarker[];

export const stage13StopPoints = [
  { id: '__id68_', sourceCharacterId: 7, x: 1088.1, y: 196.05, idx: 0, betweenRandL: 1150, isBoss: false },
  { id: '__id69_', sourceCharacterId: 7, x: 1834.35, y: 189.35, idx: 1, betweenRandL: 1150, isBoss: false },
  { id: '__id72_', sourceCharacterId: 7, x: 2838.6, y: 170.15, idx: 2, betweenRandL: 1150, isBoss: false },
  { id: '__id70_', sourceCharacterId: 7, x: 3566.75, y: 239.15, idx: 3, betweenRandL: 1150, isBoss: false },
  { id: '__id71_', sourceCharacterId: 7, x: 4310.45, y: 258.7, idx: 4, betweenRandL: 940, isBoss: true },
] as const satisfies readonly Stage13StopPoint[];

const spawn = (
  id: string, x: number, y: number, stopPointIdx: Stage13SpawnPoint['stopPointIdx'],
  delay: Stage13SpawnPoint['delay'], interval: Stage13SpawnPoint['interval'],
  enemyType: Stage13SpawnPoint['enemyType'], totalNum: number,
): Stage13SpawnPoint => ({
  id, sourceCharacterId: 5, x, y, stopPointIdx, delay, interval,
  enemyType, totalNum, isRandom: false,
});

export const stage13SpawnPoints = [
  spawn('__id73_', 172.65, 304, 0, 2, 2, 8, 3),
  spawn('__id74_', 565.2, 286.45, 0, 2, 2, 7, 3),
  spawn('__id75_', 933.75, 318.5, 0, 2, 2, 3, 3),
  spawn('__id76_', 1166.05, 334.5, 1, 2, 1, 3, 5),
  spawn('__id77_', 1734.9, 334.5, 1, 2, 1, 7, 5),
  spawn('__id78_', 1927.25, 334.5, 2, 6, 1, 7, 4),
  spawn('__id79_', 2684.3, 334.5, 2, 6, 1, 7, 4),
  spawn('__id80_', 2295.75, 334.5, 2, 2, 1, 3, 4),
  spawn('__id81_', 2926.75, 334.5, 3, 6, 1, 7, 4),
  spawn('__id82_', 3491.55, 334.5, 3, 6, 1, 3, 5),
  spawn('__id83_', 3227.2, 334.5, 3, 2, 1, 3, 4),
  spawn('__id84_', 4148.65, 340, 4, 2, 1, 5, 1),
  spawn('__id85_', 3842, 334.5, 4, 5, 4, 30, 30),
  spawn('__id86_', 4224.15, 336, 4, 5, 4, 30, 30),
] as const satisfies readonly Stage13SpawnPoint[];

export const stage13TransferDoor = {
  id: 'stage13-transfer-door-1', sourceCharacterId: 40,
  x: 4150.05, y: 453.15, isTransferDoor: true,
  sourceBounds: { left: -90.75, right: 95.05, top: -110.7, bottom: 54.3 },
  rasterPadding: 5,
} as const;

export const stage13HeroSpawns = [
  { slot: 'p1', x: 100, y: STAGE13_GROUND_TOP_Y },
  { slot: 'p2', x: 100, y: STAGE13_GROUND_TOP_Y },
] as const;
