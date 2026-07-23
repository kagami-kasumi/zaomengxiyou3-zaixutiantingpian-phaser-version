export const STAGE21_WORLD_LEFT = -30;
export const STAGE21_WORLD_WIDTH = 4700;
export const STAGE21_WORLD_HEIGHT = 607.15;

export type Stage21Matrix = Readonly<{
  a: number; b: number; c: number; d: number; tx: number; ty: number;
}>;

export type Stage21WallMarker = Readonly<{
  id: string;
  kind: 'ObsWall' | 'FallDownWhenStandingWall' | 'ThroughWall';
  sourceCharacterId: 9 | 10 | 11;
  sourceSize: Readonly<{ width: number; height: number }>;
  matrix: Stage21Matrix;
}>;

export type Stage21StopPoint = Readonly<{
  id: string;
  sourceCharacterId: 7;
  x: number;
  y: number;
  idx: 0 | 1 | 2 | 3 | 4;
  betweenRandL: 1150;
  isBoss: false;
}>;

export type Stage21SpawnPoint = Readonly<{
  id: string;
  sourceCharacterId: 5;
  x: number;
  y: number;
  stopPointIdx: 0 | 1 | 2 | 3 | 4;
  delay: 2 | 3 | 6;
  interval: 1;
  enemyType: 6 | 9 | 10 | 19;
  totalNum: number;
  isRandom: false;
}>;

export type Stage21IceThorn = Readonly<{
  id: string;
  sourceCharacterId: 16;
  x: number;
  y: number;
  orientation: 'ceiling' | 'floor';
  scaleX: 1 | -1;
  scaleY: 1 | -1;
}>;

export const stage21RenderBounds = {
  floor: { left: 0, right: 631, top: 0, bottom: 549 },
  background: { left: -30, right: 4670, top: 0, bottom: 590 },
  midground: { left: 113.85, right: 2667.45, top: 254.65, bottom: 358.45 },
  foreground: { left: -30, right: 4670, top: 513.15, bottom: 607.15 },
} as const;

const wallSize = { width: 296, height: 66 } as const;
export const STAGE21_GROUND_PLATFORM_ID = 'stage21-obs-1';
export const STAGE21_GROUND_TOP_Y = 519.0501981;

export const stage21WallMarkers = [
  { id: STAGE21_GROUND_PLATFORM_ID, kind: 'ObsWall', sourceCharacterId: 10, sourceSize: wallSize,
    matrix: { a: 16.891891, b: 0, c: 0, d: 0.3030243, tx: 2497, ty: 529.05 } },
  { id: 'stage21-obs-2', kind: 'ObsWall', sourceCharacterId: 10, sourceSize: wallSize,
    matrix: { a: 0.3896942, b: 0, c: 0, d: 15.1515045, tx: 4647.15, ty: 101 } },
  { id: 'stage21-obs-3', kind: 'ObsWall', sourceCharacterId: 10, sourceSize: wallSize,
    matrix: { a: 0, b: 2.364746, c: -0.35295105, d: 0, tx: -12.7, ty: 211.4 } },
  { id: 'stage21-fall-1', kind: 'FallDownWhenStandingWall', sourceCharacterId: 9, sourceSize: wallSize,
    matrix: { a: 16.66655, b: 0, c: 0, d: 1, tx: 2490.9, ty: -129 } },
  { id: 'stage21-through-1', kind: 'ThroughWall', sourceCharacterId: 11, sourceSize: wallSize,
    matrix: { a: 0.6933594, b: 0, c: 0, d: 1, tx: 217.85, ty: 266.65 } },
  { id: 'stage21-through-2', kind: 'ThroughWall', sourceCharacterId: 11, sourceSize: wallSize,
    matrix: { a: 0.6933594, b: 0, c: 0, d: 1, tx: 713.3, ty: 317.45 } },
  { id: 'stage21-through-3', kind: 'ThroughWall', sourceCharacterId: 11, sourceSize: wallSize,
    matrix: { a: 0.6933594, b: 0, c: 0, d: 1, tx: 2079.1, ty: 277.55 } },
  { id: 'stage21-through-4', kind: 'ThroughWall', sourceCharacterId: 11, sourceSize: wallSize,
    matrix: { a: 0.6933594, b: 0, c: 0, d: 1, tx: 2563.45, ty: 281.55 } },
] as const satisfies readonly Stage21WallMarker[];

export const stage21StopPoints = [
  { id: 'stage21-stop-0', sourceCharacterId: 7, x: 1031.4, y: 189.65, idx: 0, betweenRandL: 1150, isBoss: false },
  { id: 'stage21-stop-1', sourceCharacterId: 7, x: 1849.7, y: 182.95, idx: 1, betweenRandL: 1150, isBoss: false },
  { id: 'stage21-stop-2', sourceCharacterId: 7, x: 2717.75, y: 163.75, idx: 2, betweenRandL: 1150, isBoss: false },
  { id: 'stage21-stop-3', sourceCharacterId: 7, x: 3573.85, y: 232.75, idx: 3, betweenRandL: 1150, isBoss: false },
  { id: 'stage21-stop-4', sourceCharacterId: 7, x: 4549.5, y: 252.3, idx: 4, betweenRandL: 1150, isBoss: false },
] as const satisfies readonly Stage21StopPoint[];

const spawn = (
  id: string, x: number, y: number, stopPointIdx: Stage21SpawnPoint['stopPointIdx'],
  delay: Stage21SpawnPoint['delay'], enemyType: Stage21SpawnPoint['enemyType'], totalNum: number,
): Stage21SpawnPoint => ({
  id, sourceCharacterId: 5, x, y, stopPointIdx, delay, interval: 1,
  enemyType, totalNum, isRandom: false,
});

export const stage21SpawnPoints = [
  spawn('__id100_', 230.3, 414.05, 0, 6, 9, 3),
  spawn('__id101_', 788.45, 414.05, 0, 6, 9, 3),
  spawn('__id102_', 509.8, 414.05, 0, 2, 9, 2),
  spawn('__id103_', 174.9, 176.45, 0, 6, 9, 1),
  spawn('__id104_', 733.05, 214.05, 0, 6, 9, 1),
  spawn('__id105_', 1117.85, 280.55, 1, 6, 9, 3),
  spawn('__id106_', 1634.3, 280.55, 1, 6, 9, 3),
  spawn('__id107_', 1062.45, 422.15, 1, 2, 10, 2),
  spawn('__id108_', 1390.5, 422.15, 1, 2, 10, 2),
  spawn('__id109_', 1710.6, 422.15, 1, 2, 10, 2),
  spawn('__id110_', 1858.7, 414.05, 2, 2, 10, 2),
  spawn('__id111_', 2786.85, 414.05, 2, 2, 10, 2),
  spawn('__id112_', 2154.75, 414.05, 2, 2, 9, 2),
  spawn('__id113_', 2522.8, 414.05, 2, 2, 9, 2),
  spawn('__id114_', 2082.7, 156.15, 2, 6, 10, 1),
  spawn('__id115_', 2522.8, 188.15, 2, 6, 10, 1),
  spawn('__id116_', 2006.7, 187.2, 2, 6, 19, 2),
  spawn('__id117_', 2635.45, 211.2, 2, 6, 19, 2),
  spawn('__id118_', 2962.35, 270.05, 3, 6, 19, 4),
  spawn('__id119_', 3491.4, 286.05, 3, 6, 19, 4),
  spawn('__id120_', 2899, 398.1, 3, 2, 10, 2),
  spawn('__id121_', 3615.1, 450.1, 3, 2, 10, 2),
  spawn('__id122_', 3127.75, 398.1, 3, 2, 9, 2),
  spawn('__id123_', 3383.05, 402.1, 3, 2, 9, 2),
  spawn('__id124_', 4470, 354.05, 4, 3, 6, 1),
] as const satisfies readonly Stage21SpawnPoint[];

const ceilingCoordinates = [
  [364.95, 16.55], [413.8, 16.55], [460.25, 16.55], [507.7, 16.55],
  [1336.25, 14.7], [1382.7, 14.7], [1430.15, 14.7],
  [2862.4, 22.55], [2902.1, 22.55], [2942.8, 22.55],
  [3093.9, 22.55], [3133.6, 22.55], [3174.3, 22.55],
  [3341.35, 22.55], [3381.05, 22.55], [3421.75, 22.55],
  [3602.75, 22.55], [3642.45, 22.55], [3683.15, 22.55],
] as const;
const floorCoordinates = [
  [1155.7, 509.65], [1195.2, 510.15], [1234.7, 510.65],
  [1508.75, 512.5], [1548.25, 513], [1587.75, 513.5],
  [1923.1, 513], [1962.6, 513.5], [2002.1, 514],
  [2308.55, 512], [2348.05, 512.5], [2387.55, 513], [2427.05, 513.5],
  [2640.65, 512], [2680.15, 512.5], [2719.65, 513],
  [3222.35, 510.15], [3261.85, 510.65], [3301.35, 511.15],
] as const;

export const stage21IceThorns: readonly Stage21IceThorn[] = [
  ...ceilingCoordinates.map(([x, y], index) => ({
    id: `stage21-ice-ceiling-${index + 1}`, sourceCharacterId: 16 as const,
    x, y, orientation: 'ceiling' as const, scaleX: 1 as const, scaleY: 1 as const,
  })),
  ...floorCoordinates.map(([x, y], index) => ({
    id: `stage21-ice-floor-${index + 1}`, sourceCharacterId: 16 as const,
    x, y, orientation: 'floor' as const, scaleX: -1 as const, scaleY: -1 as const,
  })),
];

export const stage21TransferDoor = {
  id: 'stage21-transfer-door-1', sourceCharacterId: 48,
  x: 4387.85, y: 467.6, isTransferDoor: true,
  sourceBounds: { left: -83.75, right: 83.25, top: -109.15, bottom: 54.3 },
  rasterPadding: 5,
} as const;

export const stage21HeroSpawns = [
  { slot: 'p1', x: 100, y: STAGE21_GROUND_TOP_Y },
  { slot: 'p2', x: 100, y: STAGE21_GROUND_TOP_Y },
] as const;
