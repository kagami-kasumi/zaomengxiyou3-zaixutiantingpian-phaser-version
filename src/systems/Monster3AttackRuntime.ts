import { createStage11MonsterVisual, Stage11VisualTickMs, updateStage11MonsterVisual,
  type Stage11MonsterVisualModel, type Stage11MonsterVisualSnapshot } from './Stage11MonsterVisualSystem';
import { createMonsterAttackReception, checkMonsterAttackReception,
  type MonsterAttackReception, type MonsterReceptionTarget } from './MonsterAttackReception';
import type { MonsterDamageSource, MonsterDamageRequest } from './MonsterDamageReception';
import { sampleMonster3Collision } from './Monster3CollisionSystem';

export type Monster3Attack = {
  id: string; action: 'hit1' | 'hit2'; x: number; y: number; facingX: -1 | 1;
  frame: number; age: number; source?: MonsterDamageSource; parentId?: string;
  reception: MonsterAttackReception;
};
export type Monster3AttackRuntime = {
  body: Stage11MonsterVisualModel;
  attacks: Monster3Attack[];
  destroyed: boolean;
};
export type Monster3AttackHost = Readonly<{
  id: string; parentId: string; x: number; y: number; facingX: -1 | 1;
  attackSerial: number; state: Stage11MonsterVisualSnapshot['state'];
}>;
export type Monster3ReceptionPair = Readonly<{ hero: MonsterReceptionTarget; pet?: MonsterReceptionTarget }>;

export function createMonster3AttackRuntime(): Monster3AttackRuntime {
  return { body: createStage11MonsterVisual(3), attacks: [], destroyed: false };
}

export function monster3AttackRequest(attack: Monster3Attack, timeMs: number, hostFps: number,
  difficulty: number): MonsterDamageRequest {
  if (!attack.source) throw new Error('Destroyed Monster3 attack has no source');
  const hit1 = attack.action === 'hit1';
  return { source: attack.source, sourceId: attack.id.slice(0, attack.id.lastIndexOf(':')),
    attackId: '', actionName: attack.action, attackKind: hit1 ? 'physics' : 'magic',
    power: hit1 ? 40 : 18, geometryHit: false, bingo: false, difficulty, timeMs, hostFps,
    knockbackX: attack.facingX * (hit1 ? 6 : -5), knockbackY: hit1 ? -5 : 0 };
}

/** Existing bullets are received synchronously before the body/effect phases.
 * The last frame still calls the receiver before parent/source are released. */
export function stepMonster3ExistingAttacks(runtime: Monster3AttackRuntime,
  timeMs: number, hostFps: number, difficulty: number,
  targets: (attack: Monster3Attack) => readonly Monster3ReceptionPair[]): void {
  if (runtime.destroyed) return;
  const survivors: Monster3Attack[] = [];
  for (const attack of runtime.attacks) {
    attack.age++;
    attack.frame = attack.age;
    checkMonsterAttackReception(attack.reception, monster3AttackRequest(attack, timeMs, hostFps, difficulty), targets(attack));
    if (attack.frame < (attack.action === 'hit1' ? 5 : 10) && attack.reception.remaining > 0) survivors.push(attack);
    else releaseAttack(attack);
  }
  runtime.attacks = survivors;
}

/** Exactly one source body step, before effects; views never call this. */
export function stepMonster3AttackBody(runtime: Monster3AttackRuntime, host: Monster3AttackHost,
  bodyStopped: boolean, source: MonsterDamageSource, timeMs: number, hostFps: number, difficulty: number): void {
  if (runtime.destroyed) return;
  const events = updateStage11MonsterVisual(runtime.body, host, bodyStopped ? 0 : Stage11VisualTickMs);
  for (const event of events) {
    if (event.family === 'monster30Hit1') throw new Error('Wrong Monster3 body');
    const action = event.family === 'monster3Hit1' ? 'hit1' : 'hit2';
    const id = `${host.id}:${host.attackSerial}`;
    const attack: Monster3Attack = { id, action, x: sourceCoordinate(host.x + event.offsetX),
      y: sourceCoordinate(host.y + event.offsetY), facingX: event.facingX,
      frame: 1, age: 0, source, parentId: host.parentId,
      reception: { prefix: `${id}:`, serial: 1, count: 0, interval: action === 'hit1' ? 999 : 4, remaining: 99 } };
    attack.reception = createMonsterAttackReception(`${id}:`, attack.reception.interval,
      monster3AttackRequest(attack, timeMs, hostFps, difficulty), 99);
    runtime.attacks.push(attack);
  }
}

/** State selection is a read-only refresh with respect to emission/attack age. */
export function syncMonster3BodyState(runtime: Monster3AttackRuntime, host: Monster3AttackHost): void {
  if (!runtime.destroyed) updateStage11MonsterVisual(runtime.body, host, 0);
}

export function pauseMonster3AttackDisplay(runtime: Monster3AttackRuntime): void {
  for (const attack of runtime.attacks) attack.frame = Math.min(attack.action === 'hit1' ? 5 : 10, attack.age + 1);
}

export function destroyMonster3Attacks(runtime: Monster3AttackRuntime): void {
  for (const attack of runtime.attacks) releaseAttack(attack);
  runtime.attacks = [];
  runtime.destroyed = true;
}

function releaseAttack(attack: Monster3Attack): void {
  attack.frame = 0;
  attack.source = undefined;
  attack.parentId = undefined;
}
function sourceCoordinate(value: number): number {
  return Math.trunc(value * 20 + Math.sign(value) * 1e-9) / 20;
}
export function monster3AttackHits(attack: Monster3Attack, profile: string, x: number, y: number): boolean {
  return sampleMonster3Collision(attack.action === 'hit1' ? 1 : 2, attack.frame,
    attack.facingX === -1 ? 1 : -1, attack, profile, { x: sourceCoordinate(x), y: sourceCoordinate(y) });
}
