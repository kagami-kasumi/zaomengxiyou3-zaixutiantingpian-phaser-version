import { applyMonsterKnockback, createMonsterKnockbackMotion, stepMonsterKnockback,
  type MonsterKnockbackMotion, type MonsterKnockbackProfile } from './MonsterKnockbackSystem';
import type { PetGroundWall } from './PetGroundMovementSystem';

type Hit = Readonly<{ x: number; y: number; timeMs: number }>;
/** Attached to the existing entity owner. No registry, global timer, or event replay. */
export type MonsterKnockbackBinding = {
  readonly profile: MonsterKnockbackProfile;
  readonly walls: readonly PetGroundWall[];
  readonly worldOffset: () => Readonly<{ x: number; y: number }>;
  readonly sourceOffsetY: number;
  motion: MonsterKnockbackMotion;
  active: boolean;
  disposed: boolean;
  pendingMs: number;
  pendingHits: Hit[];
  beforeEarlyHit?: Readonly<{ action: string; frozen: boolean }>;
  onDispose?: () => void;
};

export function bindMonsterKnockback(profile: MonsterKnockbackProfile, position: Readonly<{ x: number; y: number }>,
  walls: readonly PetGroundWall[], worldOffset: MonsterKnockbackBinding['worldOffset'], sourceOffsetY = 0): MonsterKnockbackBinding {
  return { profile, walls, worldOffset, sourceOffsetY,
    motion: createMonsterKnockbackMotion(profile, position.x, position.y - sourceOffsetY),
    active: false, disposed: false, pendingMs: 0, pendingHits: [] };
}

export function acceptMonsterKnockback(binding: MonsterKnockbackBinding | undefined, hit: Hit,
  state: Readonly<{ x: number; y: number; action: string; frozen: boolean }>, phase: 'early' | 'late'): void {
  if (!binding || binding.disposed) return;
  if (!binding.active) {
    binding.motion.x = state.x; binding.motion.y = state.y - binding.sourceOffsetY;
    binding.motion.action = state.action;
  }
  if (phase === 'early') {
    binding.beforeEarlyHit ??= { action: state.action, frozen: state.frozen };
    binding.pendingHits.push(hit);
  } else apply(binding, hit);
}

/** Returns false while unhit, preserving the existing ordinary movement path. */
export function advanceMonsterKnockback(binding: MonsterKnockbackBinding | undefined,
  owner: { x: number; y: number }, input: Readonly<{ deltaMs: number; timeMs: number; hostFps: number; action: string; frozen: boolean }>): boolean {
  if (!binding || binding.disposed) return false;
  if (!(input.hostFps > 0)) throw new Error('Monster movement requires a positive host FPS');
  const handled = binding.active;
  const stepMs = 1000 / input.hostFps;
  const delta = Math.max(0, input.deltaMs);
  const start = input.timeMs - delta - binding.pendingMs;
  binding.pendingMs += delta;
  let tick = 0;
  const current = binding.beforeEarlyHit ?? input;
  while (binding.pendingMs + 1e-8 >= stepMs) {
    if (binding.active) {
      binding.motion.action = current.action;
      const offset = binding.worldOffset();
      stepMonsterKnockback(binding.motion, binding.profile, { timeMs: start + tick * stepMs,
        walls: binding.walls, worldX: offset.x, worldY: offset.y, frozen: current.frozen });
    }
    binding.pendingMs = Math.max(0, binding.pendingMs - stepMs);
    tick++;
  }
  if (handled) { owner.x = binding.motion.x; owner.y = binding.motion.y + binding.sourceOffsetY; }
  else { binding.motion.x = owner.x; binding.motion.y = owner.y - binding.sourceOffsetY; }
  for (const hit of binding.pendingHits) apply(binding, hit);
  binding.pendingHits.length = 0;
  binding.beforeEarlyHit = undefined;
  return handled;
}

export function disposeMonsterKnockback(binding: MonsterKnockbackBinding | undefined): void {
  if (!binding || binding.disposed) return;
  binding.disposed = true; binding.active = false; binding.pendingMs = 0;
  binding.pendingHits.length = 0; binding.beforeEarlyHit = undefined; binding.motion.tween = undefined;
  binding.onDispose?.(); binding.onDispose = undefined;
}

function apply(binding: MonsterKnockbackBinding, hit: Hit): void {
  applyMonsterKnockback(binding.motion, hit.x, hit.y, hit.timeMs, binding.motion.x + binding.worldOffset().x);
  binding.active = true;
}
