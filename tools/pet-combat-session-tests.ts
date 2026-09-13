import assert from 'node:assert/strict';
import type {
  PetBehavior, PetBehaviorAction, PetBehaviorContext, PetBehaviorDestroyReason,
  PetCombatAnimationEvent, PetCombatDamageEvent,
} from '../src/systems/PetBehavior';
import { PetBehaviorRegistry } from '../src/systems/PetBehaviorRegistry';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import type { PetCombatFrame, PetCombatSummonHandle } from '../src/systems/PetCombatTypes';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import type { PetState } from '../src/systems/PetTypes';
import { petSessionConsumerViolations } from './pet-session-consumer-guard.mjs';

class Probe implements PetBehavior {
  context!: PetBehaviorContext;
  act = false;
  move = false;
  cast = false;
  damage: number[] = [];
  animation: string[] = [];
  released: PetBehaviorDestroyReason[] = [];
  selectedCooldowns: number[] = [];
  effectTokens: number[] = [];
  enteredOwnerX = 0;
  private readonly failEnter: boolean;

  constructor(private readonly probes: Map<string, Probe>, failEnter = false) { this.failEnter = failEnter; }
  enter(context: PetBehaviorContext): void {
    this.context = context;
    this.enteredOwnerX = context.owner.x;
    this.probes.set(context.runtime.runtimeKey, this);
    if (this.failEnter) {
      context.spawnSummon({ pet: { ...context.pet, species: 'monkey' }, x: 100, y: 270, facingX: 1 });
      throw new Error('fixture enter failure after nested spawn');
    }
  }
  canMove(context: PetBehaviorContext): boolean { this.context = context; return this.move; }
  basicAttackRange(): number { return 150; }
  selectAction(context: PetBehaviorContext): PetBehaviorAction | undefined {
    this.context = context;
    this.selectedCooldowns.push(context.pet.skillState!.monkey1Xj.cooldownMs);
    return this.act ? { type: 'probe-action' } : undefined;
  }
  basicAttack(): undefined { return undefined; }
  executeAction(_action: PetBehaviorAction, context: PetBehaviorContext): void {
    this.context = context;
    if (this.cast) {
      assert.equal(context.castBasicAttack().ok, true, 'the real combat port must run for this entity');
    }
    context.emit({ type: 'executed', payload: context.actionToken });
  }
  updateEffects(context: PetBehaviorContext): void {
    this.effectTokens.push(context.actionToken);
    // Deliberately preserve the previous public effects-context semantics.
  }
  onDamaged(event: PetCombatDamageEvent, context: PetBehaviorContext): void {
    this.context = context;
    this.damage.push(event.amount);
  }
  onAnimationEvent(event: PetCombatAnimationEvent, context: PetBehaviorContext): void {
    this.context = context;
    this.animation.push(event.eventName);
  }
  destroy(reason: PetBehaviorDestroyReason): void { this.released.push(reason); }
}

function rig() {
  const roster = createSeedPetRoster();
  const pet = roster.pets.find(({ isActive }) => isActive)!;
  pet.skills = [];
  pet.skillState!.monkey1Xj.cooldownMs = 500;
  const probes = new Map<string, Probe>();
  const registry = new PetBehaviorRegistry([
    { species: 'monkey', form: 1, create: () => new Probe(probes) },
    { species: 'monkey', form: 2, create: () => new Probe(probes) },
    { species: 'broken', form: 1, create: () => new Probe(probes, true) },
  ]);
  const runtime = new PetCombatRuntime(registry);
  const frame: PetCombatFrame = {
    roster, owner: { x: 200, y: 300, facingX: 1 },
    targets: [
      { id: 'center', x: 200, y: 270, isAlive: true },
      { id: 'east', x: 2000, y: 270, isAlive: true },
      { id: 'west', x: -2000, y: 270, isAlive: true },
    ],
    projectiles: createProjectileSystem(), random: () => 1, deltaMs: 0,
  };
  const initial = runtime.update(frame);
  const key = initial.runtime!.runtimeKey;
  const root = probes.get(key)!;
  const summon = (x: number, source: PetState = pet) => root.context.spawnSummon({
    pet: source, x, y: 270, facingX: 1,
  });
  return { roster, pet, probes, runtime, frame, root, key, summon };
}

function testIndependentStateAndRealCombatPort(): void {
  const r = rig();
  const inactiveBefore = structuredClone(r.roster.pets.filter((pet) => !pet.isActive));
  const members = [...r.roster.pets];
  const aSource = structuredClone(r.pet);
  const bSource = structuredClone(r.pet);
  aSource.skillState!.monkey1Xj.cooldownMs = 200;
  bSource.skillState!.monkey1Xj.cooldownMs = 300;
  const a = r.summon(2000, aSource);
  const b = r.summon(-2000, bSource);
  const pa = r.probes.get(a.runtimeKey)!;
  const pb = r.probes.get(b.runtimeKey)!;
  r.root.act = r.root.cast = true;
  pa.act = pa.cast = true;
  const before = r.runtime.update({ ...r.frame, deltaMs: 10 });
  assert.equal(before.target?.id, 'center');
  assert.deepEqual(before.summons!.map((child) => child.target?.id), ['east', 'west']);
  assert.deepEqual(before.summons!.map((child) => child.actionToken), [1, 0]);
  assert.equal(before.actionToken, 1);
  assert.equal(pa.effectTokens[0], 0, 'effects retain the pre-execute context token');
  assert.equal(pa.selectedCooldowns[0], 200, 'selection reads CD before its frame tick');
  assert.equal(pa.context.pet.skillState!.monkey1Xj.cooldownMs, 190);
  assert.equal(pb.context.pet.skillState!.monkey1Xj.cooldownMs, 290);
  assert.equal(r.pet.skillState!.monkey1Xj.cooldownMs, 490);
  assert.equal(aSource.skillState!.monkey1Xj.cooldownMs, 200, 'summon adoption must isolate nested values');
  assert.deepEqual(r.roster.pets.filter((pet) => !pet.isActive), inactiveBefore);
  r.roster.pets.forEach((pet, i) => assert.strictEqual(pet, members[i]));
  assert.deepEqual(r.frame.projectiles!.projectiles.map((p) => p.sourceId), [r.pet.id, a.petId]);
  assert.ok(r.frame.projectiles!.projectiles.every((p) => p.petActionToken === 1));
  const hp = [r.pet.hp, pa.context.pet.hp, pb.context.pet.hp];
  const next = r.runtime.update({
    ...r.frame, deltaMs: 10,
    damageEvents: [{ runtimeKey: a.runtimeKey, amount: 7 }],
    animationEvents: [
      { runtimeKey: a.runtimeKey, actionToken: 1, eventName: 'hit' },
      { runtimeKey: b.runtimeKey, actionToken: 9, eventName: 'complete' },
    ],
  });
  assert.deepEqual([r.pet.hp, ...next.summons!.map((s) => s.hp)], [hp[0], hp[1]! - 7, hp[2]]);
  assert.deepEqual(pa.damage, [7]);
  assert.deepEqual(pa.animation, ['hit']);
  assert.deepEqual(pb.animation, []);
  assert.deepEqual(r.root.animation, []);
  assert.deepEqual(next.summons!.map((child) => child.actionToken), [2, 0]);
  assert.ok(Object.isFrozen(next.summons));
  assert.ok(next.summons!.every((child) => Object.isFrozen(child) && Object.isFrozen(child.runtime)));
  const sourced = r.runtime.events().filter((event) => event.runtimeKey === a.runtimeKey);
  assert.ok(sourced.length > 0 && sourced.every((event) => (
    event.sourcePetId === r.pet.id && event.parentRuntimeKey === r.key
  )));
  r.root.context.releaseSummon(a);
  assert.ok(r.frame.projectiles!.projectiles.every((p) => p.sourceId !== a.petId));
  assert.ok(r.frame.projectiles!.projectiles.some((p) => p.sourceId === r.pet.id), 'child release cannot clear root projectiles');
  r.runtime.destroy();
}

function testOldAndCrossPlayerKeys(): void {
  const p1 = rig();
  const p2 = rig();
  assert.equal(p1.pet.id, p2.pet.id, 'fixture deliberately shares the business id');
  assert.notEqual(p1.key, p2.key, 'runtime identity must distinguish even identical P1/P2 rosters');
  const old = p1.summon(2000);
  const staleContext = p1.probes.get(old.runtimeKey)!.context;
  p1.root.context.releaseSummon(old);
  const current = p1.summon(2000);
  const other = p2.summon(2000);
  assert.notEqual(current.runtimeKey, old.runtimeKey);
  const before = p1.pet.hp;
  p1.runtime.update({
    ...p1.frame,
    damageEvents: [
      { runtimeKey: old.runtimeKey, amount: 99 },
      { runtimeKey: p2.key, amount: 99 },
      { runtimeKey: other.runtimeKey, amount: 99 },
    ],
    animationEvents: [{ runtimeKey: old.runtimeKey, actionToken: 0, eventName: 'hit' }],
  });
  assert.equal(p1.pet.hp, before);
  assert.equal(p1.runtime.snapshot().summons![0]!.hp, before);
  assert.deepEqual(p1.probes.get(current.runtimeKey)!.animation, []);
  assert.throws(() => staleContext.relocate(9, 9), /released/u);
  assert.throws(() => staleContext.emit({ type: 'stale' }), /released/u);
  assert.throws(() => staleContext.spawnSummon({ pet: p1.pet, x: 0, y: 0, facingX: 1 }), /released/u);
  assert.throws(() => staleContext.castBasicAttack(), /released/u);
  staleContext.releaseSummon(current);
  p2.root.context.releaseSummon(current);
  assert.equal(p1.runtime.snapshot().summons!.length, 1, 'old/foreign handles cannot clear a live sibling');
  p1.pet.isActive = false;
  p1.runtime.update(p1.frame);
  p1.pet.isActive = true;
  p1.runtime.update(p1.frame);
  assert.notEqual(p1.runtime.snapshot().runtime!.runtimeKey, p1.key);
  p1.runtime.update({ ...p1.frame, damageEvents: [{ runtimeKey: p1.key, amount: 99 }] });
  assert.equal(p1.pet.hp, before, 'rest/reactivation cannot accept an earlier root session event');
  p1.runtime.destroy();
  p2.runtime.destroy();
}

function testDeathAndCascade(): void {
  const r = rig();
  const a = r.summon(2000);
  const b = r.summon(-2000);
  const pa = r.probes.get(a.runtimeKey)!;
  const pb = r.probes.get(b.runtimeKey)!;
  r.runtime.update({
    ...r.frame, deltaMs: 20, damageEvents: [{ runtimeKey: a.runtimeKey, amount: r.pet.hp }],
  });
  const dead = r.runtime.snapshot().summons!.find((s) => s.runtime.runtimeKey === a.runtimeKey)!;
  assert.equal(dead.phase, 'dead-playing');
  assert.equal(pa.context.pet.skillState!.monkey1Xj.cooldownMs, 500);
  assert.equal(pb.context.pet.skillState!.monkey1Xj.cooldownMs, 480);
  assert.equal(r.pet.skillState!.monkey1Xj.cooldownMs, 480);
  assert.deepEqual(pa.released, []);
  r.runtime.update({
    ...r.frame, deltaMs: 20,
    animationEvents: [{ runtimeKey: a.runtimeKey, actionToken: dead.actionToken, eventName: 'dead-complete' }],
  });
  assert.deepEqual(pa.released, ['dead-complete']);
  assert.equal(r.runtime.snapshot().petId, r.pet.id);
  assert.deepEqual(r.runtime.snapshot().summons!.map((s) => s.runtime.runtimeKey), [b.runtimeKey]);
  assert.equal(r.roster.pets.find((pet) => pet.isActive), r.pet);
  r.runtime.destroy();
  assert.deepEqual(pb.released, ['runtime-destroyed']);
  assert.equal(r.runtime.snapshot().summons!.length, 0);
  assert.equal(r.runtime.events().filter((e) => e.type === 'deactivated').length, 2);
  const after = r.runtime.events();
  r.runtime.destroy();
  r.root.context.releaseSummon(b);
  assert.deepEqual(r.runtime.events(), after, 'repeated release/destroy must be idempotent');
}

function testReplacementRestAndNestedCleanup(): void {
  for (const reason of ['replaced', 'inactive', 'runtime-destroyed'] as const) {
    const r = rig();
    const a = r.summon(2000);
    const b = r.summon(-2000);
    const pa = r.probes.get(a.runtimeKey)!;
    const nested = pa.context.spawnSummon({ pet: r.pet, x: 2200, y: 270, facingX: 1 });
    const handles: PetCombatSummonHandle[] = [a, b, nested];
    const rosterBefore = structuredClone(r.roster);
    if (reason === 'replaced') {
      r.pet.isActive = false;
      r.roster.pets.find((pet) => pet.species === 'monkey' && pet.form === 2)!.isActive = true;
      r.runtime.update(r.frame);
    } else if (reason === 'inactive') {
      r.pet.isActive = false;
      r.runtime.update(r.frame);
    } else r.runtime.destroy();
    assert.equal(r.runtime.snapshot().summons!.length, 0);
    for (const handle of handles) {
      assert.deepEqual(r.probes.get(handle.runtimeKey)!.released, [reason]);
      assert.equal(r.runtime.events().filter((event) => (
        event.type === 'deactivated' && event.runtimeKey === handle.runtimeKey
      )).length, 1);
    }
    assert.equal(r.roster.pets.length, rosterBefore.pets.length);
    for (let i = 0; i < r.roster.pets.length; i++) {
      assert.deepEqual({ ...r.roster.pets[i], isActive: false }, { ...rosterBefore.pets[i], isActive: false });
    }
    r.runtime.destroy();
    handles.forEach((handle) => assert.deepEqual(r.probes.get(handle.runtimeKey)!.released, [reason]));
  }
}

function testSameMovementTargetingAndCurrentOwner(): void {
  const r = rig();
  const a = r.summon(2000);
  const pa = r.probes.get(a.runtimeKey)!;
  r.root.move = pa.move = true;
  const shifted = {
    ...r.frame, deltaMs: 10, owner: { ...r.frame.owner, x: 800 },
    targets: [
      { id: 'root-far', x: 650, y: 270, isAlive: true },
      { id: 'child-far', x: 2400, y: 270, isAlive: true },
    ],
  };
  r.runtime.update(shifted);
  r.runtime.update(shifted);
  assert.equal(r.runtime.snapshot().runtime!.state, 'follow');
  assert.equal(r.runtime.snapshot().summons![0]!.runtime.state, 'follow');
  assert.ok(r.runtime.snapshot().summons![0]!.runtime.x > 2000);
  const later = r.root.context.spawnSummon({ pet: r.pet, x: 100, y: 270, facingX: 1 });
  assert.equal(r.probes.get(later.runtimeKey)!.enteredOwnerX, 800, 'summon enter must use the current frame owner');
  assert.throws(() => r.root.context.spawnSummon({
    pet: { ...r.pet, species: 'missing' }, x: 0, y: 0, facingX: 1,
  }), /Missing pet behavior/u);
  assert.equal(r.runtime.snapshot().summons!.length, 2, 'failed resolution must not leave partial children');
  const countBeforeEnterFailure = r.probes.size;
  assert.throws(() => r.root.context.spawnSummon({
    pet: { ...r.pet, species: 'broken' }, x: 0, y: 0, facingX: 1,
  }), /fixture enter failure/u);
  assert.equal(r.runtime.snapshot().summons!.length, 2, 'failed enter must roll back its entire private subtree');
  for (const probe of [...r.probes.values()].slice(countBeforeEnterFailure)) {
    assert.deepEqual(probe.released, ['dismissed']);
  }
  r.runtime.destroy();
}

function testParentDeathStillRoutesChildCompletion(): void {
  const r = rig();
  const a = r.summon(2000);
  const b = r.summon(-2000);
  r.runtime.update({ ...r.frame, damageEvents: [{ runtimeKey: a.runtimeKey, amount: r.pet.hp }] });
  const deadChild = r.runtime.snapshot().summons![0]!;
  r.runtime.update({
    ...r.frame, deltaMs: 20, damageEvents: [{ runtimeKey: r.key, amount: r.pet.hp }],
    animationEvents: [{ runtimeKey: a.runtimeKey, actionToken: deadChild.actionToken, eventName: 'dead-complete' }],
  });
  assert.deepEqual(r.probes.get(a.runtimeKey)!.released, ['dead-complete']);
  assert.deepEqual(r.runtime.snapshot().summons!.map((s) => s.runtime.runtimeKey), [b.runtimeKey]);
  assert.equal(r.probes.get(b.runtimeKey)!.context.pet.skillState!.monkey1Xj.cooldownMs, 500,
    'living descendants cannot keep running AI/CD while the owner is dead-playing');
  assert.equal(r.runtime.snapshot().phase, 'dead-playing');
  r.runtime.update({
    ...r.frame, animationEvents: [{ runtimeKey: r.key, actionToken: r.runtime.snapshot().actionToken!, eventName: 'dead-complete' }],
  });
  assert.deepEqual(r.probes.get(b.runtimeKey)!.released, ['dead-complete']);
  assert.equal(r.runtime.snapshot().petId, undefined);
  assert.equal(r.runtime.snapshot().summons!.length, 0);
  r.runtime.destroy();
}

function testConsumerGuardRejectsCopiedSteps(): void {
  for (const file of ['src/scenes/ExamplePetBridge.ts', 'src/systems/pet-behaviors/ExamplePetBehavior.ts']) {
    for (const snippet of [
      'updatePetRuntime(runtime, pet, owner, deltaMs)',
      'tickActivePetSkillState(pet, deltaMs)',
      'targeting.orderedFirstTarget(position, targets, 1200)',
      'chasePetRuntimeTarget(runtime, pet, target, 150, deltaMs)',
      "this.session.phase = 'dead-playing'",
      'new PetCombatEntitySession()',
    ]) assert.ok(petSessionConsumerViolations(file, snippet).length > 0, `${file} must reject ${snippet}`);
    assert.deepEqual(petSessionConsumerViolations(file, "if (snapshot.phase === 'dead-playing') showDead();"), []);
  }
  const legacy = 'src/scenes/test-scene/TestScenePetMagicBridge.ts';
  assert.deepEqual(petSessionConsumerViolations(legacy, 'updatePetRuntime(runtime, pet, owner, deltaMs)'), []);
  assert.ok(petSessionConsumerViolations(legacy, 'updatePetRuntime(); updatePetRuntime();').length > 0);
}

function testReleaseCallbackFailureStillCleansEveryEntity(): void {
  const r = rig();
  const released: string[] = [];
  r.root.context.spawnSummon({ pet: r.pet, x: 0, y: 270, facingX: 1,
    onReleased: () => { released.push('first'); throw new Error('intentional release callback failure'); } });
  r.root.context.spawnSummon({ pet: r.pet, x: 100, y: 270, facingX: 1,
    onReleased: () => released.push('second') });
  assert.throws(() => r.runtime.destroy(), /release callbacks failed after cleanup/);
  assert.deepEqual(released, ['first', 'second']);
  assert.equal(r.runtime.snapshot().destroyed, true);
  assert.equal(r.runtime.snapshot().petId, undefined);
  assert.equal(r.runtime.snapshot().summons!.length, 0);
  assert.doesNotThrow(() => r.runtime.destroy());
}

testReleaseCallbackFailureStillCleansEveryEntity();
testIndependentStateAndRealCombatPort();
testOldAndCrossPlayerKeys();
testDeathAndCascade();
testReplacementRestAndNestedCleanup();
testSameMovementTargetingAndCurrentOwner();
testParentDeathStillRoutesChildCompletion();
testConsumerGuardRejectsCopiedSteps();
console.log('Pet private entity sessions passed: shared step, real port, source isolation, stale keys, death and cascade.');
