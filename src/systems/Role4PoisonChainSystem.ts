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

const consumeMpByLevel = [
  66, 160, 208, 276, 364, 493, 703, 759, 801,
  921, 1085, 1133, 1318, 1771, 1884, 1954, 2320, 2667,
] as const;

export const Role4PoisonChainTuning = {
  mpScale: 26483 / 25958,
  mpFactor: 0.286,
  searchRadius: 500,
  arrivalRadius: 66,
  travelUnitsPerSecond: 500 / 0.96,
  maxHops: 8,
  poisonDurationMs: 7_000,
  stunChance: 0.78,
  stunDurationMs: 420,
  noTargetFadeMs: 1_000,
  actionMs: 900,
} as const;

export type Role4PoisonChainTarget = {
  id: string;
  x: number;
  y: number;
  isAlive: boolean;
  applyPoison: (durationMs: number) => void;
  applyStun: (durationMs: number) => void;
};

export type Role4PoisonChain = {
  id: string;
  projectileId: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  destinationX: number;
  destinationY: number;
  targetId?: string;
  travelTotalMs: number;
  travelRemainingMs: number;
  hopsRemaining: number;
  fadingRemainingMs: number;
};

export type Role4PoisonChainRuntime = {
  chainSerial: number;
  chains: Role4PoisonChain[];
};

export type Role4PoisonChainHitEvent = {
  chainId: string;
  targetId: string;
  hop: number;
  poisoned: true;
  stunned: boolean;
};

export function createRole4PoisonChainRuntime(): Role4PoisonChainRuntime {
  return { chainSerial: 0, chains: [] };
}

export function getRole4MbyjMpCost(binding: SkillBinding): number {
  const index = clampLevel(binding.level) - 1;
  return Math.floor(
    consumeMpByLevel[index] * Role4PoisonChainTuning.mpFactor * Role4PoisonChainTuning.mpScale,
  );
}

export function requestRole4MbyjFromInput(params: {
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  projectiles: ProjectileSystemModel;
  targets: readonly Role4PoisonChainTarget[];
}): HeroSkillCastEvent | undefined {
  if (params.normalAttack.heroId !== 4) return undefined;
  const slotIndex = findSlot(params.input, params.previousInput);
  if (slotIndex === undefined) return undefined;
  const binding = params.skill.loadout.slots[slotIndex];
  if (binding?.skillName !== 'mbyj') return undefined;
  if (
    params.combat.state !== 'ready' ||
    params.normalAttack.activeAttack ||
    params.skill.role4Runtime.actionRemainingMs > 0
  ) {
    params.skill.lastResult = 'role4 mbyj: attacking';
    return undefined;
  }
  const mpCost = getRole4MbyjMpCost(binding);
  if (params.skill.mp < mpCost) {
    params.skill.lastResult = `mbyj mp ${params.skill.mp}/${mpCost}`;
    return undefined;
  }

  const mpBefore = params.skill.mp;
  params.skill.mp -= mpCost;
  params.skill.role4Runtime.actionRemainingMs = Role4PoisonChainTuning.actionMs;
  const spawnPoint: ProjectileSpawnPoint = {
    sourceId: params.combat.id,
    x: params.movement.x,
    y: params.movement.y,
    facingX: params.movement.facingX,
  };
  const projectile = spawnProjectileFromTuning(
    params.projectiles,
    spawnPoint,
    'role4-mbyj-hit6',
    'role4-mbyj-hit6',
    chainProjectileTuning,
  );
  projectile.visualOnly = true;
  projectile.destroyWhenSourceHurt = false;
  params.projectiles.projectiles.push(projectile);

  const runtime = params.skill.role4PoisonChainRuntime;
  runtime.chainSerial += 1;
  const chain: Role4PoisonChain = {
    id: `${params.combat.id}-role4-chain-${runtime.chainSerial}`,
    projectileId: projectile.id,
    x: projectile.x,
    y: projectile.y,
    startX: projectile.x,
    startY: projectile.y,
    destinationX: projectile.x,
    destinationY: projectile.y,
    travelTotalMs: 0,
    travelRemainingMs: 0,
    hopsRemaining: Role4PoisonChainTuning.maxHops,
    fadingRemainingMs: 0,
  };
  const target = selectRole4MbyjFirstTarget(
    params.targets,
    params.movement.x,
    params.movement.y,
    params.movement.facingX,
  );
  if (target) {
    scheduleHop(chain, target);
    params.skill.lastResult = `mbyj ${target.id} mp ${params.skill.mp}`;
  } else {
    chain.fadingRemainingMs = Role4PoisonChainTuning.noTargetFadeMs;
    params.skill.lastResult = `mbyj no target mp ${params.skill.mp}`;
  }
  runtime.chains.push(chain);

  return {
    skillName: 'mbyj',
    slotIndex,
    actionName: 'hit6',
    projectile,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: false,
  };
}

export function selectRole4MbyjFirstTarget(
  targets: readonly Role4PoisonChainTarget[],
  sourceX: number,
  sourceY: number,
  facingX: -1 | 1,
): Role4PoisonChainTarget | undefined {
  return targets.find((target) =>
    target.isAlive &&
    (target.x - sourceX) * facingX > 0 &&
    distance(sourceX, sourceY, target.x, target.y) <= Role4PoisonChainTuning.searchRadius);
}

export function updateRole4PoisonChains(params: {
  runtime: Role4PoisonChainRuntime;
  projectiles: ProjectileSystemModel;
  targets: readonly Role4PoisonChainTarget[];
  deltaMs: number;
  random?: () => number;
}): Role4PoisonChainHitEvent[] {
  const targetsById = new Map(params.targets.map((target) => [target.id, target]));
  const random = params.random ?? Math.random;
  const events: Role4PoisonChainHitEvent[] = [];
  for (const chain of params.runtime.chains) {
    let remainingDelta = Math.max(0, params.deltaMs);
    while (remainingDelta > 0 && !isChainFinished(chain)) {
      if (!chain.targetId) {
        const elapsed = Math.min(remainingDelta, chain.fadingRemainingMs);
        chain.fadingRemainingMs -= elapsed;
        remainingDelta -= elapsed;
        break;
      }
      const elapsed = Math.min(remainingDelta, chain.travelRemainingMs);
      chain.travelRemainingMs -= elapsed;
      remainingDelta -= elapsed;
      updateChainPosition(chain);
      if (chain.travelRemainingMs > 0) break;

      const target = targetsById.get(chain.targetId);
      if (!target?.isAlive || distance(chain.x, chain.y, target.x, target.y) >
        Role4PoisonChainTuning.arrivalRadius) {
        chain.targetId = undefined;
        chain.fadingRemainingMs = 0;
        break;
      }
      chain.x = target.x;
      chain.y = target.y;
      target.applyPoison(Role4PoisonChainTuning.poisonDurationMs);
      const stunned = random() <= Role4PoisonChainTuning.stunChance;
      if (stunned) target.applyStun(Role4PoisonChainTuning.stunDurationMs);
      events.push({
        chainId: chain.id,
        targetId: target.id,
        hop: Role4PoisonChainTuning.maxHops - chain.hopsRemaining,
        poisoned: true,
        stunned,
      });

      const nextTarget = chain.hopsRemaining > 0
        ? params.targets.find((candidate) =>
          candidate.id !== target.id && candidate.isAlive &&
          distance(target.x, target.y, candidate.x, candidate.y) <=
            Role4PoisonChainTuning.searchRadius)
        : undefined;
      if (nextTarget) scheduleHop(chain, nextTarget);
      else chain.targetId = undefined;
    }
    syncProjectile(chain, params.projectiles);
  }
  for (const chain of params.runtime.chains) {
    if (isChainFinished(chain)) expireProjectile(chain, params.projectiles);
  }
  params.runtime.chains = params.runtime.chains.filter((chain) => !isChainFinished(chain));
  return events;
}

function scheduleHop(chain: Role4PoisonChain, target: Role4PoisonChainTarget): void {
  chain.startX = chain.x;
  chain.startY = chain.y;
  chain.destinationX = target.x;
  chain.destinationY = target.y;
  chain.targetId = target.id;
  chain.hopsRemaining -= 1;
  chain.travelTotalMs = distance(chain.x, chain.y, target.x, target.y) /
    Role4PoisonChainTuning.travelUnitsPerSecond * 1_000;
  chain.travelRemainingMs = chain.travelTotalMs;
}

function updateChainPosition(chain: Role4PoisonChain): void {
  if (chain.travelTotalMs <= 0) {
    chain.x = chain.destinationX;
    chain.y = chain.destinationY;
    return;
  }
  const progress = 1 - chain.travelRemainingMs / chain.travelTotalMs;
  chain.x = chain.startX + (chain.destinationX - chain.startX) * progress;
  chain.y = chain.startY + (chain.destinationY - chain.startY) * progress;
}

function syncProjectile(chain: Role4PoisonChain, system: ProjectileSystemModel): void {
  const projectile = system.projectiles.find((item) => item.id === chain.projectileId);
  if (!projectile) return;
  projectile.x = chain.x;
  projectile.y = chain.y;
}

function expireProjectile(chain: Role4PoisonChain, system: ProjectileSystemModel): void {
  const projectile = system.projectiles.find((item) => item.id === chain.projectileId);
  if (projectile) projectile.isExpired = true;
}

function isChainFinished(chain: Role4PoisonChain): boolean {
  return !chain.targetId && chain.fadingRemainingMs <= 0;
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

function findSlot(input: PlayerInputState, previous: PlayerInputState | undefined): number | undefined {
  const index = input.skillSlots.findIndex((pressed, slot) =>
    pressed && !(previous?.skillSlots[slot] ?? false));
  return index >= 0 ? index : undefined;
}

function clampLevel(level: number): number {
  return Math.min(Math.max(Math.floor(level), 1), consumeMpByLevel.length);
}

const chainProjectileTuning = {
  actionName: 'hit6', assetKey: SkillProjectileEffectKeys.role4MbyjHit6,
  sourceSymbol: 'Role4Bullet6', runtimeName: 'Role4Bullet6', offsetX: 25,
  offsetY: -30, speedX: 0, speedY: 0, distance: undefined, width: 66,
  height: 66, lifetimeMs: 60_000, damage: 0, attackKind: 'magic', knockbackX: 0,
  knockbackY: 0, hitIntervalFrames: 999, maxHits: 1,
} as const satisfies ProjectileTuning;
