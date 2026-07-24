import {
  sanitizeLevelUnlockProgress,
  type LevelUnlockProgress,
} from './Stage11FlowSystem';

export type HeavenMapNodeId = '1-1' | '1-2' | '1-3' | '2-1' | '2-2';
export type HeavenMapNodeStatus = 'locked' | 'current' | 'completed' | 'unavailable';
export type HeavenMapRouteKey =
  | 'TestScene'
  | 'Stage12Scene'
  | 'Stage13Scene'
  | 'Stage21Scene'
  | 'Stage22Scene';

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

export const HeavenMapStage22NodeDefinition: HeavenMapNodeDefinition = {
  id: '2-2',
  title: 'Stage 2-2',
  // The current reconstruction has one authoritative Stage 2 map registration.
  // Reuse it for the current sub-level instead of inventing a second visible map marker.
  registration: { x: 507.95, y: 341.5 },
  hitArea: { x: 443.95, y: 279.95, width: 139, height: 132 },
  routeKey: 'Stage22Scene',
};

export function createHeavenMapSnapshot(
  progress: LevelUnlockProgress,
): readonly HeavenMapNodeSnapshot[] {
  const sanitized = sanitizeLevelUnlockProgress(progress);
  const definitions = sanitized.unlockedStage === 2 && sanitized.unlockedLevel >= 2
    ? [...HeavenMapNodeDefinitions.slice(0, 3), HeavenMapStage22NodeDefinition]
    : HeavenMapNodeDefinitions;
  const unlockedIndex = getUnlockedNodeIndex(sanitized);
  return definitions.map((definition, index) => {
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
  if (qaStage === '2-2') return { unlockedStage: 2, unlockedLevel: 2 };
  if (qaStage === '2-1') return { unlockedStage: 2, unlockedLevel: 1 };
  return sanitizeLevelUnlockProgress(progress);
}

function getUnlockedNodeIndex(progress: LevelUnlockProgress): number {
  return progress.unlockedStage === 2 ? 3 : progress.unlockedLevel - 1;
}

function getNodeStatus(index: number, unlockedIndex: number): HeavenMapNodeStatus {
  if (index > unlockedIndex) return 'locked';
  if (index === unlockedIndex) return 'current';
  return 'completed';
}
