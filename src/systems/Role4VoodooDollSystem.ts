import { clampSkillLevel as clampLevel } from './SkillMathUtils';
import { findJustPressedSkillSlot as findSlot } from './SkillInputUtils';
import { SkillMpByLevel } from './SkillTuning';
import { SkillProjectileEffectKeys } from '../assets/AssetManifest';
import type { HeroCombatModel } from './HeroCombatSystem';
import type { HeroMovementModel } from './HeroMovementSystem';
import type { HeroNormalAttackModel } from './HeroNormalAttackSystem';
import type { HeroSkillCastEvent, HeroSkillModel, SkillBinding } from './HeroSkillSystem';
import type { PlayerInputState } from './InputSystem';
import {
  spawnProjectileFromTuning,
  type ProjectileSpawnPoint,
  type ProjectileSystemModel,
  type ProjectileTuning,
} from './ProjectileSystem';



export const Role4VoodooDollTuning = {
  mpScale: 26483 / 25958,
  mpFactor: 0.55,
  lifetimeMs: 10_000,
  followStopDistance: 100,
  followSpeed: 180,
  levelCurve: 0.28098,
  baseHpRate: 0.7,
  transferBaseRate: 3.5 / 6,
  actionMs: 900,
} as const;

export type Role4VoodooTarget = {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  defense: number;
  magicDefense: number;
  isAlive: boolean;
  applyDamage: (amount: number) => number;
};

export type Role4VoodooDoll = {
  id: string;
  sourceId: string;
  targetId: string;
  level: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  defense: number;
  magicDefense: number;
  remainingMs: number;
  visualProjectileId: number;
};

export type Role4VoodooDollRuntime = {
  dollSerial: number;
  doll?: Role4VoodooDoll;
};

export type Role4VoodooTransferEvent = {
  dollId: string;
  targetId: string;
  incomingDamage: number;
  dollDamage: number;
  transferredDamage: number;
  dollDestroyed: boolean;
  targetKilled: boolean;
};

export function createRole4VoodooDollRuntime(): Role4VoodooDollRuntime {
  return { dollSerial: 0 };
}

export function getRole4WdwwMpCost(binding: SkillBinding): number {
  const index = clampLevel(binding.level) - 1;
  return Math.floor(
    SkillMpByLevel[index] * Role4VoodooDollTuning.mpFactor * Role4VoodooDollTuning.mpScale,
  );
}

export function getRole4VoodooDollMaxHp(targetMaxHp: number, level: number): number {
  const levelIndex = clampLevel(level) - 1;
  const curve = Role4VoodooDollTuning.levelCurve;
  return Math.max(1, targetMaxHp * Role4VoodooDollTuning.baseHpRate /
    (1 + curve * 17) * (1 + curve * levelIndex));
}

export function getRole4VoodooTransferDamage(incomingDamage: number, level: number): number {
  const levelIndex = clampLevel(level) - 1;
  const curve = Role4VoodooDollTuning.levelCurve;
  return Math.max(0, incomingDamage) * Role4VoodooDollTuning.transferBaseRate /
    (1 + curve * 17) * (1 + curve * levelIndex);
}

export function requestRole4WdwwFromInput(params: {
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  projectiles: ProjectileSystemModel;
  targets: readonly Role4VoodooTarget[];
}): HeroSkillCastEvent | undefined {
  if (params.normalAttack.heroId !== 4) return undefined;
  const slotIndex = findSlot(params.input, params.previousInput);
  if (slotIndex === undefined) return undefined;
  const binding = params.skill.loadout.slots[slotIndex];
  if (binding?.skillName !== 'wdww') return undefined;
  if (
    params.combat.state !== 'ready' ||
    params.normalAttack.activeAttack ||
    params.skill.role4Runtime.actionRemainingMs > 0
  ) {
    params.skill.lastResult = 'role4 wdww: attacking';
    return undefined;
  }
  const mpCost = getRole4WdwwMpCost(binding);
  if (params.skill.mp < mpCost) {
    params.skill.lastResult = `wdww mp ${params.skill.mp}/${mpCost}`;
    return undefined;
  }
  const target = selectRole4WdwwTarget(params.targets, params.movement.x, params.movement.facingX);
  if (!target) {
    params.skill.lastResult = 'wdww: no facing target';
    return undefined;
  }
  const mpBefore = params.skill.mp;
  params.skill.mp -= mpCost;
  params.skill.role4Runtime.actionRemainingMs = Role4VoodooDollTuning.actionMs;
  expireRole4VoodooDoll(params.skill.role4VoodooRuntime, params.projectiles);
  const point: ProjectileSpawnPoint = {
    sourceId: params.combat.id,
    x: params.movement.x,
    y: params.movement.y,
    facingX: params.movement.facingX,
  };
  const castVisual = spawnProjectileFromTuning(
    params.projectiles, point, 'role4-wdww-hit5', 'role4-wdww-hit5', castVisualTuning,
  );
  castVisual.visualOnly = true;
  const dollVisual = spawnProjectileFromTuning(
    params.projectiles, point, 'role4-wdww-doll', 'role4-wdww-doll', dollVisualTuning,
  );
  dollVisual.visualOnly = true;
  dollVisual.destroyWhenSourceHurt = false;
  params.projectiles.projectiles.push(castVisual, dollVisual);
  const runtime = params.skill.role4VoodooRuntime;
  runtime.dollSerial += 1;
  const maxHp = getRole4VoodooDollMaxHp(target.maxHp, binding.level);
  const dollY = getRole4VoodooDollInitialY(params.movement.y);
  runtime.doll = {
    id: `${params.combat.id}-role4-doll-${runtime.dollSerial}`,
    sourceId: params.combat.id,
    targetId: target.id,
    level: clampLevel(binding.level),
    x: params.movement.x,
    y: dollY,
    hp: maxHp,
    maxHp,
    defense: target.defense,
    magicDefense: target.magicDefense,
    remainingMs: Role4VoodooDollTuning.lifetimeMs,
    visualProjectileId: dollVisual.id,
  };
  params.skill.lastResult = `wdww ${target.id} mp ${params.skill.mp}`;
  return {
    skillName: 'wdww',
    slotIndex,
    actionName: 'hit5',
    projectile: dollVisual,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: false,
  };
}

function getRole4VoodooDollInitialY(sourceY: number): number {
  return sourceY + dollVisualTuning.offsetY;
}

export function selectRole4WdwwTarget(
  targets: readonly Role4VoodooTarget[],
  sourceX: number,
  facingX: -1 | 1,
): Role4VoodooTarget | undefined {
  return targets
    .filter((target) => target.isAlive && (target.x - sourceX) * facingX > 0)
    .sort((left, right) =>
      Math.abs(left.x - sourceX) - Math.abs(right.x - sourceX))[0];
}

export function updateRole4VoodooDoll(params: {
  runtime: Role4VoodooDollRuntime;
  projectiles: ProjectileSystemModel;
  targets: readonly Role4VoodooTarget[];
  deltaMs: number;
}): void {
  const doll = params.runtime.doll;
  if (!doll) return;
  const target = params.targets.find((candidate) => candidate.id === doll.targetId);
  doll.remainingMs -= Math.max(0, params.deltaMs);
  if (!target?.isAlive || doll.remainingMs <= 0 || doll.hp <= 0) {
    expireRole4VoodooDoll(params.runtime, params.projectiles);
    return;
  }
  const dx = target.x - doll.x;
  const dy = target.y - doll.y;
  const distance = Math.hypot(dx, dy);
  if (distance > Role4VoodooDollTuning.followStopDistance) {
    const travel = Math.min(
      distance - Role4VoodooDollTuning.followStopDistance,
      Role4VoodooDollTuning.followSpeed * Math.max(0, params.deltaMs) / 1000,
    );
    doll.x += dx / distance * travel;
    doll.y += dy / distance * travel;
  }
  const visual = params.projectiles.projectiles.find((item) => item.id === doll.visualProjectileId);
  if (visual) {
    visual.x = doll.x;
    visual.y = doll.y;
    visual.lifetimeMs = Math.max(visual.elapsedMs + doll.remainingMs, visual.elapsedMs);
  }
}

export function damageRole4VoodooDoll(params: {
  runtime: Role4VoodooDollRuntime;
  projectiles: ProjectileSystemModel;
  targets: readonly Role4VoodooTarget[];
  damage: number;
}): Role4VoodooTransferEvent | undefined {
  const doll = params.runtime.doll;
  if (!doll || doll.hp <= 0) return undefined;
  const target = params.targets.find((candidate) => candidate.id === doll.targetId);
  if (!target?.isAlive) {
    expireRole4VoodooDoll(params.runtime, params.projectiles);
    return undefined;
  }
  const incoming = Math.max(0, params.damage);
  const dollDamage = Math.min(doll.hp, incoming);
  doll.hp -= dollDamage;
  const requestedTransfer = getRole4VoodooTransferDamage(incoming, doll.level);
  const transferredDamage = target.applyDamage(requestedTransfer);
  const dollDestroyed = doll.hp <= 0;
  const event: Role4VoodooTransferEvent = {
    dollId: doll.id,
    targetId: target.id,
    incomingDamage: incoming,
    dollDamage,
    transferredDamage,
    dollDestroyed,
    targetKilled: !target.isAlive,
  };
  if (dollDestroyed || !target.isAlive) {
    expireRole4VoodooDoll(params.runtime, params.projectiles);
  }
  return event;
}

export function expireRole4VoodooDoll(
  runtime: Role4VoodooDollRuntime,
  projectiles: ProjectileSystemModel,
): void {
  const doll = runtime.doll;
  if (!doll) return;
  const visual = projectiles.projectiles.find((item) => item.id === doll.visualProjectileId);
  if (visual) visual.isExpired = true;
  runtime.doll = undefined;
}

const castVisualTuning = {
  actionName: 'hit5', assetKey: SkillProjectileEffectKeys.role4WdwwHit5,
  sourceSymbol: 'Role4Bullet5', runtimeName: 'Role4Bullet5', offsetX: 115,
  offsetY: -110, speedX: 0, speedY: 0, distance: undefined, width: 190,
  height: 160, lifetimeMs: 720, damage: 0, attackKind: 'magic', knockbackX: 0,
  knockbackY: 0, hitIntervalFrames: 999, maxHits: 999,
} as const satisfies ProjectileTuning;

const dollVisualTuning = {
  actionName: 'walk', assetKey: SkillProjectileEffectKeys.role4WdwwDoll,
  sourceSymbol: 'Role4Hit5', runtimeName: 'Role4Hit5', offsetX: 0,
  offsetY: -20, speedX: 0, speedY: 0, distance: undefined, width: 76,
  height: 86, lifetimeMs: Role4VoodooDollTuning.lifetimeMs, damage: 0,
  attackKind: 'magic', knockbackX: 0, knockbackY: 0, hitIntervalFrames: 999,
  maxHits: 999,
} as const satisfies ProjectileTuning;





