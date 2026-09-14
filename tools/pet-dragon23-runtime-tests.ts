import assert from 'node:assert/strict';
import { mkdirSync, readFileSync } from 'node:fs';
import { writeFileSync } from './write-dragon-evidence';
import { createHash } from 'node:crypto';
import source from '../docs/tasks/evidence/TASK-SLICE-214D/source-contracts.json';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import type { PetCombatFrame } from '../src/systems/PetCombatTypes';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem, updateProjectiles } from '../src/systems/ProjectileSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { createPetDragonAnimationClock } from '../src/systems/PetDragonAnimationClock';
import { calculateDragonMagicDamage } from '../src/systems/PetDragonDamageSystem';

const traces: unknown[] = [];
for (const ref of Object.values(source.sourceRefs)) {
  assert.equal(createHash('sha256').update(readFileSync(ref.path)).digest('hex'), ref.sha256);
}
function setup(form: 2 | 3, fps: number, skills: string[] = [], owner: 'p1' | 'p2' = 'p1') {
  const roster = createSeedPetRoster();
  const pet = roster.pets.find(p => p.species === 'dragon' && p.form === form)!;
  roster.pets.forEach(p => p.isActive = p === pet);
  Object.assign(pet, { id: `${owner}-dragon${form}`, hp: 200, maxHp: 1000, mp: 1000, maxMp: 1000,
    atk: 100, def: 20, level: 1, skills });
  const runtime = new PetCombatRuntime(), projectiles = createProjectileSystem(), combat = createStage1CombatRuntime();
  const enemy = createStage1CombatEnemy({ id: 'target', enemyType: 2, x: 100, y: -15 });
  enemy.hp = enemy.maxHp = 1_000_000;
  const frame: PetCombatFrame = { roster, owner: { x: 0, y: 0, facingX: 1 },
    targets: [{ id: enemy.id, x: enemy.x, y: enemy.y, isAlive: true }], projectiles,
    hostFps: fps, deltaMs: 1000 / fps, random: () => 0.5,
    groundEnvironment: { ownerRootOffsetY: 0, walls: [{ id: 'floor', left: -10000, right: 10000,
      top: 0.1, bottom: 20, usesWallTolerance: true }] } };
  runtime.update({ ...frame, deltaMs: 0 });
  let tick = 0;
  const events: any[] = [];
  const step = (extra: Partial<PetCombatFrame> = {}) => {
    tick++;
    updateProjectiles(projectiles, [], frame.deltaMs);
    const snapshot = runtime.update({ ...frame, projectileCombat: createPetProjectileCombatPort({
      combat, enemies: [enemy], ownerSlot: owner, timeMs: tick * 1000 / fps, random: () => 0.5,
      mask: () => { throw new Error('Later dragon forms must never use the initial form mask'); },
    }), ...extra });
    events.push(...runtime.events().map(event => ({ tick, event })));
    return snapshot;
  };
  const until = (predicate: () => boolean, limit = 500) => {
    for (let i = 0; !predicate() && i < limit; i++) step();
    assert.ok(predicate(), `timeout dragon${form} ${skills}`);
  };
  return { pet, roster, runtime, projectiles, combat, enemy, frame, events, step, until, tick: () => tick };
}

for (const form of [2, 3] as const) for (const fps of [20, 24, 30]) {
  const anchors = source.clock[form === 2 ? 'dragon2' : 'dragon3'];
  for (const [action, [total, hit]] of Object.entries(anchors)) {
    const clock = createPetDragonAnimationClock(form); clock.select(action, 7);
    const events = clock.advance(total * 1000 / fps, fps);
    assert.deepEqual(events.filter(e => e.eventName === 'hit').map(e => e.elapsedHostTick), [hit]);
    assert.deepEqual(events.filter(e => e.eventName === 'complete').map(e => e.elapsedHostTick), [total]);
    assert.equal(clock.snapshot().action, 'wait');
  }
  const s = setup(form, fps);
  for (let i = 0; i < fps + 32; i++) s.step();
  const emission = s.events.find(e => e.event.behaviorEvent?.type === `dragon${form}-normal-emitted`);
  assert.equal(emission.tick, fps + (form === 2 ? 7 : 5));
  assert.ok(s.combat.audit.damageEvents.length >= 1);
  assert.equal(s.combat.audit.damageEvents[0]!.amount, 97);
  assert.ok(s.pet.hp > 200);
  traces.push({ form, fps, case: 'normal', events: s.events, damage: s.combat.audit.damageEvents });
  s.runtime.destroy();
}

for (const form of [2, 3] as const) for (const owner of ['p1', 'p2'] as const) {
  const s = setup(form, 24, ['fs'], owner);
  s.until(() => !!s.runtime.snapshot().summons?.length);
  const child = s.runtime.snapshot().summons![0]!;
  assert.equal(child.form, form);
  assert.equal(child.maxHp, s.pet.hp);
  s.pet.skills = [];
  for (let i = 0; i < 239; i++) s.step();
  assert.equal(s.runtime.snapshot().summons!.length, 1);
  s.step(); assert.equal(s.runtime.snapshot().summons!.length, 0);
  assert.ok(s.combat.audit.damageEvents.some(e => e.sourceId === child.petId));
  assert.equal(s.enemy.lastHitBy, owner);
  assert.equal(s.events.filter(e => e.event.behaviorEvent?.type === 'dragon1-expiry-heal').length, 1);
  traces.push({ form, owner, case: 'fs', events: s.events, damage: s.combat.audit.damageEvents });
  s.runtime.destroy();
}

for (const form of [2, 3] as const) {
  const s = setup(form, 24, ['sdcc']);
  s.until(() => s.runtime.snapshot().animation?.action === 'sdcc');
  const castTick = s.tick();
  assert.equal(s.pet.mp, 980);
  const x = s.runtime.snapshot().runtime!.x;
  const direction = s.runtime.snapshot().runtime!.facingX;
  for (let i = 0; i < 6; i++) s.step();
  assert.equal(s.runtime.snapshot().runtime!.x - x, direction * 60);
  const emitted = s.events.find(e => e.event.behaviorEvent?.type === `dragon${form}-sdcc-emitted`)!;
  assert.equal(emitted.tick - castTick, 6);
  const bullet = s.projectiles.projectiles.find(p => !p.isExpired && p.sourceSymbol === 'PetDragon2Bullet2')!;
  const rootX = bullet.x;
  s.step(); assert.equal(bullet.x - rootX, direction * 10, 'follow after the first collision step');
  s.step({ damageEvents: [{ runtimeKey: s.runtime.snapshot().runtime!.runtimeKey, amount: 1 }] });
  assert.equal(bullet.isExpired, true, 'hurt cuts off follow effect');
  assert.ok(s.combat.audit.damageEvents.some(e => e.actionName === 'hit2' && e.amount === 336));
  traces.push({ form, case: 'sdcc-hurt', events: s.events, damage: s.combat.audit.damageEvents });
  s.runtime.destroy();
}

for (const fps of [20, 24, 30]) {
  const s = setup(3, fps, ['ltwj']);
  s.until(() => s.events.some(e => e.event.behaviorEvent?.type === 'dragon3-ltwj-emitted'));
  const start = s.tick();
  assert.equal(s.pet.mp, 980);
  for (let i = 0; i < Math.ceil(fps * 0.8) + 11; i++) s.step();
  const emitted = s.events.filter(e => e.event.behaviorEvent?.type === 'dragon3-ltwj-emitted');
  assert.equal(emitted.length, 9);
  assert.deepEqual(emitted.map(e => e.tick - start), [0, ...[0.2, 0.4, 0.6, 0.8].flatMap(delay =>
    [Math.ceil(delay * fps - 1e-9), Math.ceil(delay * fps - 1e-9)])]);
  const first = emitted[0].event.behaviorEvent.payload;
  const offsets = source.ltwj.worldOffsets;
  assert.deepEqual(emitted.map(e => [e.event.behaviorEvent.payload.x, e.event.behaviorEvent.payload.y]),
    offsets.map(([x, y]) => [Math.trunc((first.sourcePoint.x + x) * 20) / 20,
      Math.trunc((first.sourcePoint.y + y) * 20) / 20]));
  const hits = s.combat.audit.damageEvents.filter(e => e.actionName === 'hit3');
  assert.ok(hits.length > 0);
  assert.ok(hits.every(e => e.attackKind === 'magic'));
  assert.ok(hits.every(e => e.amount === 624), 'int(781 * (1 - 0.2)) through real monster damage');
  assert.ok(s.projectiles.projectiles.filter(p => p.sourceSymbol === 'PetDragon3Bullet3').every(p => p.isExpired));
  traces.push({ fps, case: 'ltwj-nine', emitted, damage: hits });
  s.runtime.destroy();
}

for (const defense of [-1, 0, 0.2, 1, 2]) assert.equal(calculateDragonMagicDamage({ hurt: 100, attack: 280, critical: false }, defense),
  defense === -1 ? 110 : defense === 0 ? 100 : defense === 0.2 ? 80 : defense === 1 ? 0 : 1);
for (const reason of ['release', 'death'] as const) {
  const s = setup(3, 24, ['ltwj']);
  s.until(() => s.events.some(e => e.event.behaviorEvent?.type === 'dragon3-ltwj-emitted'));
  if (reason === 'release') s.runtime.destroy();
  else s.step({ damageEvents: [{ runtimeKey: s.runtime.snapshot().runtime!.runtimeKey, amount: s.pet.hp }] });
  if (reason === 'death') for (let i = 0; i < 40; i++) s.step();
  assert.equal(s.events.filter(e => e.event.behaviorEvent?.type === 'dragon3-ltwj-emitted').length, 1);
  assert.ok(s.projectiles.projectiles.every(p => p.isExpired));
}
mkdirSync('docs/tasks/evidence/TASK-SLICE-214D', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SLICE-214D/runtime-traces.json', JSON.stringify({ status: 'passed', traces }, null, 2) + '\n');
console.log('Dragon23 Runtime: source clocks, real damage/heal, clones, dash and nine-wave cleanup passed');
