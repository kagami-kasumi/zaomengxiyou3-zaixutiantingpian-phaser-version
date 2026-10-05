import { createStage12MonsterVisual, updateStage12MonsterVisual, Stage12VisualTickMs,
  type Stage12MonsterAction, type Stage12MonsterVisualModel } from './Stage12MonsterVisualSystem';
import { createMonsterAttackReception, checkMonsterAttackReception,
  type MonsterAttackReception, type MonsterReceptionTarget } from './MonsterAttackReception';
import type { MonsterDamageRequest, MonsterDamageSource } from './MonsterDamageReception';
import { sampleMonster2Collision } from './Monster2CollisionSystem';

export type Monster2Attack = {
  id: string; sourceId: string; attack: 1 | 2; x: number; y: number; facingX: -1 | 1;
  frame: number; age: number; source?: MonsterDamageSource; parentId?: string;
  reception: MonsterAttackReception;
  hurtCanCutDownEffect?: boolean;
};
export type Monster2ReceptionPair = Readonly<{ hero: MonsterReceptionTarget; pet?: MonsterReceptionTarget }>;
export type Monster2AttackHost = Readonly<{
  id: string; parentId: string; x: number; y: number; facingX: -1 | 1;
  attackSerial: number; state: Stage12MonsterAction;
}>;
export type Monster2RawSpawn = Readonly<{
  id: string; parentId: string; x: number; y: number; facingX: -1 | 1;
}>;
export type Monster2AttackRuntime = {
  body: Stage12MonsterVisualModel; attacks: Monster2Attack[]; destroyed: boolean;
};
export function createMonster2AttackRuntime(): Monster2AttackRuntime {
  return { body: createStage12MonsterVisual(2), attacks: [], destroyed: false };
}

export function monster2AttackRequest(attack: Monster2Attack, timeMs: number, hostFps: number,
  difficulty: number): MonsterDamageRequest {
  if (!attack.source) throw new Error('Destroyed Monster2 attack has no source');
  return { source: attack.source, sourceId: attack.sourceId, attackId: '', actionName: 'hit1',
    attackKind: 'physics', power: 29, geometryHit: false, bingo: false, difficulty, timeMs, hostFps,
    knockbackX: attack.facingX * 6, knockbackY: -5 };
}

/** Existing registered bullets run before BBDC. An invisible frame remains a detection step. */
export function stepMonster2ExistingAttacks(runtime: Monster2AttackRuntime, timeMs: number,
  hostFps: number, difficulty: number, targets: (attack: Monster2Attack) => readonly Monster2ReceptionPair[],
  sourceHurt = false): void {
  if (runtime.destroyed) return;
  const survivors: Monster2Attack[] = [];
  for (const attack of runtime.attacks) {
    attack.frame = ++attack.age;
    checkMonsterAttackReception(attack.reception, monster2AttackRequest(attack, timeMs, hostFps, difficulty), targets(attack));
    if (attack.frame < (attack.attack === 1 ? 14 : 20) && attack.reception.remaining > 0
      && !(sourceHurt && attack.hurtCanCutDownEffect)) survivors.push(attack);
    else releaseAttack(attack);
  }
  runtime.attacks = survivors;
}

export function stepMonster2AttackBody(runtime: Monster2AttackRuntime, host: Monster2AttackHost,
  stopped: boolean, source: MonsterDamageSource, timeMs: number, hostFps: number, difficulty: number,
  emitRaw: (spawn: Monster2RawSpawn) => void, gather: (point: Readonly<{ x: number; y: number }>) => void): void {
  if (runtime.destroyed) return;
  const events = updateStage12MonsterVisual(runtime.body, snapshot(host), stopped ? 0 : Stage12VisualTickMs);
  for (const event of events) {
    const root = { x: sourceCoordinate(host.x + event.offsetX), y: sourceCoordinate(host.y + event.offsetY) };
    if (event.family === 'monster2Hit2') {
      // Original naked MC is not enrolled in BaseBullet or source destruction.
      emitRaw({ id: `${host.id}:${host.attackSerial}:raw`, parentId: host.parentId, ...root, facingX: event.facingX });
      gather({ x: host.x, y: host.y - 50 });
      continue;
    }
    if (event.family !== 'monster2Hit1Start' && event.family !== 'monster2Hit1End') throw new Error('Wrong Monster2 body');
    const kind = event.family === 'monster2Hit1Start' ? 1 : 2;
    const id = `${host.id}:${host.attackSerial}:${kind}`;
    const attack: Monster2Attack = { id, sourceId: host.id, attack: kind, ...root, facingX: event.facingX,
      frame: 1, age: 0, source, parentId: host.parentId,
      reception: { prefix: `${id}:`, serial: 1, count: 0, interval: 999, remaining: 99 } };
    attack.reception = createMonsterAttackReception(`${id}:`, 999,
      monster2AttackRequest(attack, timeMs, hostFps, difficulty), 99);
    runtime.attacks.push(attack);
  }
  // Monster2.scriptFrameOverFunc destroys the source at the end of dead,
  // which also clears any registered attacks still alive at that instant.
  if (runtime.body.action === 'dead' && runtime.body.completed) destroyMonster2Attacks(runtime);
}

export function syncMonster2BodyState(runtime: Monster2AttackRuntime, host: Monster2AttackHost): void {
  if (!runtime.destroyed) updateStage12MonsterVisual(runtime.body, snapshot(host), 0);
}
export function enterMonster2AttackDisplay(runtime: Monster2AttackRuntime): void {
  for (const attack of runtime.attacks) attack.frame = Math.min(attack.attack === 1 ? 14 : 20, attack.age + 1);
}
export function destroyMonster2Attacks(runtime: Monster2AttackRuntime): void {
  for (const attack of runtime.attacks) releaseAttack(attack);
  runtime.attacks = [];
  runtime.destroyed = true;
}
export function monster2AttackHits(attack: Monster2Attack, profile: string, x: number, y: number): boolean {
  return sampleMonster2Collision(attack.attack, attack.frame, attack.facingX === -1 ? 1 : -1,
    attack, profile, { x: sourceCoordinate(x), y: sourceCoordinate(y) });
}
function snapshot(host: Monster2AttackHost) {
  return { phase: host.state === 'dead' ? 'dead' as const : host.state === 'hurt' ? 'hurt' as const : 'approach' as const,
    action: host.state, attackSerial: host.attackSerial, facingX: host.facingX, moving: host.state === 'walk' };
}
function releaseAttack(attack: Monster2Attack): void {
  attack.frame = 0; attack.source = undefined; attack.parentId = undefined;
}
function sourceCoordinate(value: number): number { return Math.trunc(value * 20 + Math.sign(value) * 1e-9) / 20; }
