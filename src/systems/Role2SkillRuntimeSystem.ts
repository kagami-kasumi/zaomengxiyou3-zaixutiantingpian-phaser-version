import type { ProjectileModel } from './ProjectileSystem';

export type Role2ShadowState = {
  id: string;
  projectileId: number;
  x: number;
  y: number;
  facingX: -1 | 1;
  remainingMs: number;
};

export type Role2HealingOverTime = {
  targetId: string;
  remainingMs: number;
  tickCarryMs: number;
  healPerTick: number;
  heal: (amount: number) => void;
};

export type Role2PullEffect = {
  targetId: string;
  elapsedMs: number;
  totalMs: number;
  startX: number;
  startY: number;
  destinationX: number;
  destinationY: number;
  setPosition: (x: number, y: number) => void;
  setSuspended: (suspended: boolean) => void;
};

export type Role2PendingJhsj = {
  sourceId: string;
  x: number;
  y: number;
  facingX: -1 | 1;
  elapsedMs: number;
  skillLevel: number;
  shyLevel: number;
  sourcePower: number;
  damageMultiplier: number;
  spawnedHit9_2: boolean;
  spawnedHit9_1: boolean;
  shadow?: { x: number; y: number; facingX: -1 | 1 };
};

export type Role2SkillRuntimeModel = {
  shadow?: Role2ShadowState;
  healingOverTime: Role2HealingOverTime[];
  pullEffects: Role2PullEffect[];
  pendingJhsj?: Role2PendingJhsj;
  nextDamageMultiplier: number;
  lastModifiedNormalAttackId?: number;
  spawnedProjectiles: ProjectileModel[];
  lastResult: string;
};

export function createRole2SkillRuntime(): Role2SkillRuntimeModel {
  return {
    healingOverTime: [],
    pullEffects: [],
    nextDamageMultiplier: 1,
    spawnedProjectiles: [],
    lastResult: 'ready',
  };
}

export function takeRole2RuntimeProjectiles(runtime: Role2SkillRuntimeModel): ProjectileModel[] {
  return runtime.spawnedProjectiles.splice(0, runtime.spawnedProjectiles.length);
}
