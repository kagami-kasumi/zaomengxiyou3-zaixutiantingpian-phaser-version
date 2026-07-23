import {
  sanitizeLevelUnlockProgress,
  type LevelUnlockProgress,
} from './Stage11FlowSystem';

export type HeavenMapNodeId = '1-1' | '1-2' | '1-3' | '2-1';
export type HeavenMapNodeStatus = 'locked' | 'current' | 'completed' | 'unavailable';
export type HeavenMapRouteKey = 'TestScene' | 'Stage12Scene' | 'Stage13Scene' | 'Stage21Scene';

export type HeavenMapHitArea = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type HeavenMapNodeDefinition = Readonly<{
  id: HeavenMapNodeId;
  title: string;
  registration: Readonly<{ x: number; y: number }>;
  hitArea: HeavenMapHitArea;
  routeKey?: HeavenMapRouteKey;
}>;

export type HeavenMapNodeSnapshot = HeavenMapNodeDefinition & Readonly<{
  status: HeavenMapNodeStatus;
  canActivate: boolean;
}>;

export const HeavenMapNodeDefinitions: readonly HeavenMapNodeDefinition[] = [
  {
    id: '1-1',
    title: '九重天',
    registration: { x: 703.45, y: 524.95 },
    hitArea: { x: 628.7, y: 414.9, width: 151, height: 167 },
    routeKey: 'TestScene',
  },
  {
    id: '1-2',
    title: '天宫路',
    registration: { x: 596.5, y: 541.95 },
    hitArea: { x: 521, y: 499.4, width: 164, height: 80 },
    routeKey: 'Stage12Scene',
  },
  {
    id: '1-3',
    title: '南天门',
    registration: { x: 525.45, y: 458.45 },
    hitArea: { x: 456.95, y: 400.4, width: 137, height: 85 },
    routeKey: 'Stage13Scene',
  },
  {
    id: '2-1',
    title: '南天王殿',
    registration: { x: 507.95, y: 341.5 },
    hitArea: { x: 443.95, y: 279.95, width: 139, height: 132 },
    routeKey: 'Stage21Scene',
  },
] as const;

export function createHeavenMapSnapshot(
  progress: LevelUnlockProgress,
): readonly HeavenMapNodeSnapshot[] {
  const unlockedIndex = getUnlockedNodeIndex(sanitizeLevelUnlockProgress(progress));
  return HeavenMapNodeDefinitions.map((definition, index) => {
    const status = getNodeStatus(index, unlockedIndex);
    return {
      ...definition,
      status,
      canActivate: Boolean(definition.routeKey) && (status === 'current' || status === 'completed'),
    };
  });
}

export function findHeavenMapNode(
  nodes: readonly HeavenMapNodeSnapshot[],
  nodeId: HeavenMapNodeId,
): HeavenMapNodeSnapshot | undefined {
  return nodes.find((node) => node.id === nodeId);
}

export function resolveHeavenMapRuntimeProgress(
  progress: LevelUnlockProgress,
  search: string,
  isDevelopment: boolean,
): LevelUnlockProgress {
  if (!isDevelopment) return sanitizeLevelUnlockProgress(progress);
  const qaStage = new URLSearchParams(search).get('qaStage');
  return qaStage === '2-1'
    ? { unlockedStage: 2, unlockedLevel: 1 }
    : sanitizeLevelUnlockProgress(progress);
}

function getUnlockedNodeIndex(progress: LevelUnlockProgress): number {
  return progress.unlockedStage === 2 ? 3 : progress.unlockedLevel - 1;
}

function getNodeStatus(index: number, unlockedIndex: number): HeavenMapNodeStatus {
  if (index > unlockedIndex) return 'locked';
  if (index === unlockedIndex) return 'current';
  return 'completed';
}
