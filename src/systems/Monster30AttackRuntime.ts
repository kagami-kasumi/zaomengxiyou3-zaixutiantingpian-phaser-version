import { createStage11MonsterVisual, Stage11VisualTickMs, updateStage11MonsterVisual,
  type Stage11MonsterVisualModel, type Stage11MonsterVisualSnapshot } from './Stage11MonsterVisualSystem';
import { getMonsterDefinition } from './MonsterDefinitionCatalog';
import { sampleMonster30Collision } from './Monster30CollisionSystem';

export type Monster30Attack = Readonly<{
  attackId: string; sourceId: string; x: number; y: number; facingX: -1 | 1;
  frame: number; age: number; damage: number; attackKind: 'physics'; actionName: 'hit1';
  knockbackX: number; knockbackY: number;
}>;

export type Monster30AttackRuntime = {
  body: Stage11MonsterVisualModel;
  attacks: Monster30Attack[];
  detections: Monster30Attack[];
  destroyed: boolean;
};

export type Monster30AttackHost = {
  id: string; x: number; y: number; facingX: -1 | 1; attackSerial: number;
  state?: string; phase?: string; activeAttack?: Readonly<{ damage: number }>;
  attackRuntime?: Monster30AttackRuntime;
};

export function createMonster30AttackRuntime(): Monster30AttackRuntime {
  return { body: createStage11MonsterVisual(30), attacks: [], detections: [], destroyed: false };
}

function snapshot(host: Monster30AttackHost): Stage11MonsterVisualSnapshot {
  const state = host.state ?? (host.phase === 'dead' ? 'dead' : host.phase === 'hurt' ? 'hurt'
    : host.phase === 'windup' || host.phase === 'active' ? 'hit1'
      : host.phase === 'approach' ? 'walk' : 'wait');
  return { state: state as Stage11MonsterVisualSnapshot['state'],
    attackSerial: host.attackSerial, facingX: host.facingX };
}

export function beginMonster30AttackStep(host: Monster30AttackHost): void {
  const runtime = host.attackRuntime ??= createMonster30AttackRuntime();
  runtime.detections = [];
}

/** One original world tick: existing bullets first, body callback before target effects. */
export function stepMonster30Attack(host: Monster30AttackHost, bodyStopped: boolean): void {
  const runtime = host.attackRuntime ??= createMonster30AttackRuntime();
  if (runtime.destroyed) return;
  const survivors: Monster30Attack[] = [];
  for (const old of runtime.attacks) {
    const attack = { ...old, age: old.age + 1, frame: old.age + 1 };
    runtime.detections.push(attack);
    // The final frame still detects; only its display/lifetime ends now.
    if (attack.frame < 10) survivors.push(attack);
  }
  runtime.attacks = survivors;
  const events = updateStage11MonsterVisual(runtime.body, snapshot(host), bodyStopped ? 0 : Stage11VisualTickMs);
  for (const event of events) {
    if (event.family !== 'monster30Hit1') continue;
    runtime.attacks.push({ attackId: `${host.id}-hit1-${host.attackSerial}`, sourceId: host.id,
      x: sourceCoordinate(host.x), y: sourceCoordinate(host.y), facingX: event.facingX,
      frame: 1, age: 0, damage: host.activeAttack?.damage ?? getMonsterDefinition(30).attackDamage,
      actionName: 'hit1', attackKind: 'physics', knockbackX: 6, knockbackY: -5 });
  }
}

/** State changes in effects/AI select a frame without replaying the body callback. */
export function syncMonster30BodyState(host: Monster30AttackHost): void {
  if (host.attackRuntime && !host.attackRuntime.destroyed) {
    updateStage11MonsterVisual(host.attackRuntime.body, snapshot(host), 0);
  }
}

export function destroyMonster30Attacks(host: Monster30AttackHost): void {
  const runtime = host.attackRuntime;
  if (!runtime) return;
  runtime.destroyed = true; runtime.attacks = []; runtime.detections = [];
}

function sourceCoordinate(value: number): number {
  return Math.trunc(value * 20 + Math.sign(value) * 1e-9) / 20;
}

export function monster30AttackHits(attack: Monster30Attack, profile: string, x: number, y: number): boolean {
  // BaseBullet.setDirect: direct=movement facing, AUtils.flipHorizontal(-direct).
  return sampleMonster30Collision(attack.frame, attack.facingX === -1 ? 1 : -1, attack,
    profile, { x: sourceCoordinate(x), y: sourceCoordinate(y) });
}

/** MovieClip has entered the upcoming frame when the world pause event arrives.
 * Keep bullet age/detections untouched: resume detects this same frame first. */
export function pauseMonster30AttackDisplay(host: Monster30AttackHost): void {
  const runtime = host.attackRuntime;
  if (!runtime || runtime.destroyed) return;
  runtime.attacks = runtime.attacks.map(attack => ({ ...attack, frame: Math.min(10, attack.age + 1) }));
}
