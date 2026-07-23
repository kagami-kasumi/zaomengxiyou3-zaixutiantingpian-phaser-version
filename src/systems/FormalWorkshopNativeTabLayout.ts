import type { FormalWorkshopTab } from './FormalWorkshopPageSystem';

export type FormalWorkshopNativeTabLayoutEntry = {
  tab: FormalWorkshopTab;
  label: string;
  sourceCharacterId: 95 | 99 | 109 | 113;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type WorkshopHitArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

// character 119 root coordinates; these bounds are the original transparent
// DefineButton2 hit canvases, not modern convenience hit targets.
export const FormalWorkshopNativeTabLayout: readonly FormalWorkshopNativeTabLayoutEntry[] = [
  { tab: 'strength', label: '强化', sourceCharacterId: 95, x: 64.35, y: 552.4, width: 60.95, height: 30 },
  { tab: 'fusion', label: '合成', sourceCharacterId: 99, x: 139.8, y: 552.8, width: 65, height: 31 },
  { tab: 'resolution', label: '分解', sourceCharacterId: 109, x: 217.7, y: 550.95, width: 65, height: 32 },
  { tab: 'making', label: '打造', sourceCharacterId: 113, x: 286.6, y: 546.95, width: 80, height: 33 },
] as const;

// The four operation symbols share the visual center of the original left frame.
export const FormalWorkshopOperationCenter = { x: 316, y: 310 } as const;

export const FormalWorkshopReturnHitArea: WorkshopHitArea = {
  x: 842,
  y: 8,
  width: 76,
  height: 46,
};

export const FormalWorkshopPageHitAreas = {
  previous: { x: 611, y: 465, width: 80, height: 32 },
  next: { x: 728, y: 465, width: 82, height: 32 },
} as const satisfies Record<string, WorkshopHitArea>;

export const FormalWorkshopCommitHitAreas: Readonly<Record<FormalWorkshopTab, WorkshopHitArea>> = {
  strength: { x: 258, y: 432, width: 138, height: 46 },
  fusion: { x: 260, y: 438, width: 138, height: 48 },
  resolution: { x: 264, y: 440, width: 138, height: 46 },
  making: { x: 264, y: 447, width: 138, height: 47 },
};

export const FormalWorkshopStageHitAreas: Readonly<Record<FormalWorkshopTab, readonly WorkshopHitArea[]>> = {
  strength: [
    { x: 184, y: 174, width: 68, height: 68 },
    { x: 282, y: 132, width: 68, height: 68 },
    { x: 282, y: 222, width: 68, height: 68 },
    { x: 374, y: 222, width: 68, height: 68 },
    { x: 184, y: 264, width: 68, height: 68 },
    { x: 282, y: 312, width: 68, height: 68 },
  ],
  fusion: [
    { x: 274, y: 128, width: 66, height: 66 },
    { x: 174, y: 208, width: 70, height: 70 },
    { x: 370, y: 208, width: 70, height: 70 },
  ],
  resolution: [
    { x: 282, y: 124, width: 68, height: 68 },
  ],
  making: [
    { x: 282, y: 116, width: 68, height: 68 },
    { x: 184, y: 196, width: 68, height: 68 },
    { x: 282, y: 266, width: 68, height: 68 },
    { x: 380, y: 266, width: 68, height: 68 },
  ],
};
