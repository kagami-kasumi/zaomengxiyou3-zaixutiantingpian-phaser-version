/** Explicit original Aoyi entrance, production body/ground/private owner and real damage port. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { PetBehaviorRegistry } from '../src/systems/PetBehaviorRegistry';
import { MonkeyPetBehavior } from '../src/systems/pet-behaviors/MonkeyPetBehavior';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { bodyFixtureCollisionAssets } from './pet226-body/body-fixture-collision';
import { bodyGroundFixture } from './pet226-body/ground-fixture';
import { PetTuning } from '../src/systems/PetTuning';
import type { ProjectileModel } from '../src/systems/ProjectileTypes';
const native = JSON.parse(readFileSync('local-resources/regima/task-outputs/TASK-SLICE-226/aoyi-ground-air/measurement.json', 'utf8'));
const collision = JSON.parse(readFileSync('local-resources/regima/task-outputs/TASK-SLICE-226/formal-target-collision-228/measurement.json', 'utf8')).cases;
let cases = 0, accepted = 0;
for (const sample of native.cases.filter((c: any) => ['static', 'counter'].includes(c.mode)
  && c.skills === 7 && c.choose === 0 && c.side === .5 - 1e-10)) for (const parts of [1, 4]) {
  const roster = createSeedPetRoster();
  roster.pets.forEach(p => { p.isActive = p.species === 'monkey' && p.form === 4; });
  const pet = roster.pets.find(p => p.isActive)!;
  pet.id = `p${sample.owner}-${pet.id}`; pet.skills = ['jgaoyi', 'lyq', 'xj', 'lj'];
  if (sample.mode === 'counter') pet.skills.push('qlfj');
  Object.assign(pet, { hp: 100, maxHp: 100, mp: 1000, atk: 17, warpower: 1, critBonusRate: 0 });
  const behavior = new MonkeyPetBehavior(4);
  let release = false;
  // Match the source's explicit entrance: exclude unrelated later AI casts, but
  // retain original body callbacks and onDamaged/QLFJ dispatch in the real Session.
  behavior.selectAction = () => { if (release) { release = false; return { type: 'monkey4-jgaoyi' }; } return undefined; };
  behavior.basicAttack = () => undefined;
  const runtime = new PetCombatRuntime(new PetBehaviorRegistry([{ species: 'monkey', form: 4, create: () => behavior }]));
  const projectiles = createProjectileSystem(), combat = createStage1CombatRuntime();
  const candidates = native.inputs.targets.map((t: any) => ({ ...t, isAlive: true,
    colliderLeft: Math.min(...t.localBounds.map((e: number) => Math.round(e * 20) / 20 * t.scaleX + t.x)) }));
  const victims = new Map<string, ReturnType<typeof createStage1CombatEnemy>>();
  const active = new Map<string, ProjectileModel>();
  const born: { tick: number; x: number; y: number; symbol: string }[] = [];
  let calls = 0, counterRoll = false;
  const random = () => { const value = calls++ % 2 === 0 ? sample.choose : sample.side;
    if (counterRoll) { counterRoll = false; return 0; } return value; };
  const ownerSlot = sample.owner === 1 ? 'p1' as const : 'p2' as const;
  const base = { roster, owner: { x: 300, y: 350, facingX: 1 as const }, projectiles,
    hostFps: sample.fps, groundEnvironment: bodyGroundFixture('monkey', 4, 350), random };
  const step = (tick: number, damaging: boolean) => {
    for (const [id, p] of active) {
      const victim = victims.get(id)!; victim.x = victim.y = 10000;
      if (p.isExpired || combat.audit.damageEvents.some(e => e.attackId.startsWith(`${p.projectileId}:${p.sourceAttackId}:`))) continue;
      const positive = collision.find((c: any) => c.symbol === p.sourceSymbol && c.target === 'ObjectBaseSprite2'
        && c.direction === (p.petRenderDirection ?? -p.facingX) && c.hit && c.tick === p.petHostTick! + 1);
      if (positive) { victim.x = p.x + positive.x; victim.y = p.y + positive.y; }
    }
    const port = createPetProjectileCombatPort({ enemies: [...victims.values()], combat, ownerSlot,
      timeMs: tick * 1000 / sample.fps, random: () => .75,
      mask: () => { throw Error('Native collision required'); }, monkeyHorseCollision: () => bodyFixtureCollisionAssets });
    // Source body candidate geometry and independently positioned damage victims
    // are separate controlled inputs; the hit method and target lookup stay real.
    port.monstersInParentSpace = () => candidates;
    const prior = new Set(projectiles.projectiles.map(p => p.id));
    counterRoll = damaging;
    for (let part = 0; part < parts; part++) runtime.update({ ...base, projectileCombat: port,
      targets: [...candidates, ...[...victims.values()].map(v => ({ id: v.id, x: v.x, y: v.y, isAlive: true }))],
      deltaMs: 1000 / sample.fps / parts,
      damageEvents: damaging && part === 0 ? [{ runtimeKey: runtime.snapshot().runtime!.runtimeKey, amount: 1, reactsToHit: true }] : [] });
    for (const p of projectiles.projectiles.filter(p => !prior.has(p.id))) {
      born.push({ tick, x: p.x, y: p.y, symbol: p.sourceSymbol });
      assert.equal(p.sourceId, pet.id); assert.equal(p.petHostTick, 0);
      if (p.visualOnly) continue;
      active.set(p.id, p);
      const victim = createStage1CombatEnemy({ id: `victim-${p.id}`, enemyType: 5, x: 10000, y: 10000 });
      victim.hp = 1000000; victims.set(p.id, victim);
    }
  };
  runtime.update({ ...base, targets: candidates, deltaMs: 0 });
  for (let n = 0; n < sample.settled.ticks; n++) step(-sample.settled.ticks + n, false);
  release = true;
  const end = sample.rows.find((r: any) => r.action === 'wait').tick;
  for (let tick = 1; tick <= end; tick++) step(tick, sample.mode === 'counter' && tick === 9);
  const expected = sample.rows.filter((r: any) => r.tick <= end).flatMap((r: any) =>
    r.events.filter((e: any) => e.kind === 'emit').map((e: any) => ({ tick: r.tick, x: e.x, y: e.y })));
  assert.deepEqual(born.map(({ tick, x, y }) => ({ tick, x, y })), expected, 'complete chain births follow independent original body/ground trace');
  assert.equal(pet.mp, 1000 - PetTuning.monkey4JgaoyiMpCost);
  assert.equal(pet.hp, sample.mode === 'counter' ? 99 : 100);
  for (let tick = end + 1; tick <= end + 180 && projectiles.projectiles.some(p => !p.isExpired); tick++) step(tick, false);
  for (const [id, p] of active) {
    const victim = victims.get(id)!;
    const events = combat.audit.damageEvents.filter(e => e.attackId.startsWith(`${p.projectileId}:${p.sourceAttackId}:`));
    assert(events.length > 0, `${sample.mode}/${sample.fps}/${ownerSlot}/${p.sourceSymbol}: every damaging callback reaches real HP settlement`);
    assert(victim.hp < 1000000); assert.equal(victim.lastHitBy, ownerSlot);
    assert.equal(new Set(events.map(e => `${e.attackId}/${e.targetId}`)).size, events.length, 'no repeated target/attack settlement');
    accepted += events.length;
  }
  assert(projectiles.projectiles.every(p => p.isExpired), 'all chain effects finish');
  runtime.destroy(); assert.equal(projectiles.projectiles.length, 0); cases++;
}
assert.equal(cases, 24);
console.log(`Monkey4 complete chains: ${cases} real-port cases/${accepted} damage events, native births, QLFJ insertion, MP, owner and cleanup passed.`);
