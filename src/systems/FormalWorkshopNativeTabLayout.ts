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

// character 119 root coordinates; these bounds are the original transparent
// DefineButton2 hit canvases, not modern convenience hit targets.
export const FormalWorkshopNativeTabLayout: readonly FormalWorkshopNativeTabLayoutEntry[] = [
  { tab: 'strength', label: '强化', sourceCharacterId: 95, x: 64.35, y: 552.4, width: 60.95, height: 30 },
  { tab: 'fusion', label: '合成', sourceCharacterId: 99, x: 139.8, y: 552.8, width: 65, height: 31 },
  { tab: 'resolution', label: '分解', sourceCharacterId: 109, x: 217.7, y: 550.95, width: 65, height: 32 },
  { tab: 'making', label: '打造', sourceCharacterId: 113, x: 286.6, y: 546.95, width: 80, height: 33 },
] as const;
