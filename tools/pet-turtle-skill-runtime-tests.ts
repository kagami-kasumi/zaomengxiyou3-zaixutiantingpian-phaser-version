import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PetTurtleAssets } from '../src/assets/PetTurtleAssets';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import type { PetCombatFrame, PetCombatRuntimeEvent } from '../src/systems/PetCombatTypes';
import { createDefaultPetBehaviorRegistry } from '../src/systems/pet-behaviors/createDefaultPetBehaviorRegistry';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem, updateProjectiles } from '../src/systems/ProjectileSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime, resolveStage1EnemyPetAttack } from '../src/systems/Stage1CombatSystem';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { createHeroCombat } from '../src/systems/HeroCombatSystem';
import { updateHeroTurtleLink } from '../src/systems/PetTurtleLinkSystem';
import { getPetTurtleNoncriticalPower, refreshPetTurtleDamage } from '../src/systems/PetTurtleDamageSystem';
import { calculateDragonMagicDamage, calculateDragonPhysicalDamage } from '../src/systems/PetDragonDamageSystem';
import type { PetBehaviorContext } from '../src/systems/PetBehavior';
import { createMonster30 } from '../src/systems/Monster30System';
import { resolveTestSceneTurtleIncoming } from '../src/scenes/test-scene/TestScenePetEnemyAdapter';
import type { HeroPartyRuntime } from '../src/scenes/HeroPartyRuntimeBridge';

const assets = await PetTurtleAssets.decode(path => new Uint8Array(readFileSync(`public${path}`)));
const registry = createDefaultPetBehaviorRegistry(() => assets);
const native = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SETTINGS-221/source-trace.json', 'utf8'));
for (const source of native.sources) assert.equal(createHash('sha256').update(readFileSync(source.path)).digest('hex'), source.sha256);
const reports: unknown[] = [];
const calls = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SLICE-224B/native-caller-order.json', 'utf8'));
for (const [path, hash] of Object.entries(calls.sourceFiles)) assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'), hash);
function setup(form: 1 | 2 | 3 | 4, owner: 'p1' | 'p2', skills: string[], fps = 24) {
  const roster = createSeedPetRoster(), pet = roster.pets.find(p => p.species === 'turtle' && p.form === form)!;
  roster.pets.forEach(p => { p.isActive = p === pet; });
  Object.assign(pet, { id: `${owner}-turtle${form}`, hp: 10000, maxHp: 20000, mp: 1000, maxMp: 1000,
    atk: 100, def: 20, critBonusRate: 0, skills, warpower: 2, technique: 2 });
  const runtime = new PetCombatRuntime(registry), projectiles = createProjectileSystem(), combat = createStage1CombatRuntime();
  const hero = createHeroCombat(owner);
  const enemy = createStage1CombatEnemy({ id: 'target', enemyType: 2, x: 40, y: -40 });
  enemy.hp = enemy.maxHp = 10000000;
  const frame: PetCombatFrame = { roster, owner: { x: 0, y: 0, facingX: 1 }, ownerCombat: hero,
    targets: [], projectiles, hostFps: fps, deltaMs: 1000 / fps, random: () => 0.5,
    groundEnvironment: { ownerRootOffsetY: 0, walls: [{ id: 'floor', left: -10000, right: 10000,
      top: 0.1, bottom: 20, usesWallTolerance: true }] } };
  runtime.update({ ...frame, deltaMs: 0 });
  let tick = 0;
  const events: { tick: number; event: PetCombatRuntimeEvent }[] = [];
  const step = (extra: Partial<PetCombatFrame> = {}) => {
    tick++; updateHeroTurtleLink(hero, frame.deltaMs); updateProjectiles(projectiles, [], frame.deltaMs);
    const result = runtime.update({ ...frame,
      targets: [{ id: enemy.id, x: enemy.x, y: enemy.y, isAlive: enemy.hp > 0 }],
      projectileCombat: createPetProjectileCombatPort({ combat, enemies: [enemy], ownerSlot: owner,
        timeMs: tick * 1000 / fps, random: () => 0.5,
        mask: () => { throw Error('Turtle requires native bitplanes'); } }), ...extra });
    events.push(...runtime.events().map(event => ({ tick, event }))); return result;
  };
  const named = (name: string) => events.filter(row => row.event.behaviorEvent?.type === name);
  return { pet, roster, runtime, projectiles, combat, enemy, frame, events, step, named, hero, tick: () => tick };
}

// Expected attack metadata comes from the original constructor, not the implementation.
for (const form of [3, 4] as const) for (const owner of ['p1', 'p2'] as const) for (const fps of [20, 24, 30]) {
  const s = setup(form, owner, ['sybh'], fps);
  s.pet.skillState!.turtle3Sybh.cooldownMs = 0;
  for (let i = 0; i < 25; i++) s.step();
  const releases = s.named('turtle-sybh-released'); assert.equal(releases.length, 1);
  assert.equal(s.pet.mp, 980);
  const created = s.named('turtle-projectile-created').filter(row => (row.event.behaviorEvent!.payload as any).action === 'hit3');
  assert.equal(created.length, 1);
  assert.equal(created[0]!.tick - releases[0]!.tick, 4, 'Native holds 2,2 before cell2/count10');
  const payload = created[0]!.event.behaviorEvent!.payload as any;
  assert.equal(payload.scale, form === 4 ? 2 : 1);
  assert.equal(payload.y - payload.sourceRoot.y, -20); assert.equal(payload.x, payload.sourceRoot.x);
  assert.equal(payload.cache.hurt, 567, '100 * 5.4 * 1.05');
  const steps = s.named('turtle-projectile-step').filter(row => (row.event.behaviorEvent!.payload as any).projectileId === payload.projectileId);
  assert.equal(steps.length, 18, 'Native root last frame still attacks');
  const sourceCalls = calls.calls.filter((row: any) => row.scenario === `sybh-${form}-${owner === 'p1' ? 1 : 2}-7`);
  assert.equal(steps.length, sourceCalls.length);
  steps.forEach((row, i) => assert.equal(assets.effect('PetTurtle3Bullet3', (row.event.behaviorEvent!.payload as any).nativeTick,
    form === 4 ? 2 : 1, -1).meta.tree!.frame, sourceCalls[i].bullet.frame, 'Actual state selector versus original caller'));
  assert.equal((steps.at(-1)!.event.behaviorEvent!.payload as any).nativeTick, 17);
  assert(s.combat.audit.damageEvents.length > 0, 'Native mask must reach actual monster HP');
  const original = native.cases.find((r: any) => r.id === `init-${form}-1`).extra.attacks.hit3;
  const p = s.projectiles.projectiles.find(p => p.projectileId === payload.projectileId);
  if (p) assert.equal(p.petEffectScale, form === 4 ? 2 : 1);
  assert.equal(s.enemy.lastHitBy, owner);
  const ids = s.combat.audit.damageEvents.filter(e => e.actionName === 'hit3').map(e => e.attackId);
  assert.equal(new Set(ids).size, ids.length, 'One target once per attack ID');
  assert.equal(original.attackKind, 'magic');
  const serials = steps.map(row => (row.event.behaviorEvent!.payload as any).hitSerial);
  assert.deepEqual(serials, Array.from({ length: 18 }, (_, t) => Math.floor(t / (form === 4 ? Math.trunc(fps / 4) : 999))));
  reports.push({ form, owner, fps, created: payload, steps: steps.length, ids }); s.runtime.destroy();
}

for (const owner of ['p1', 'p2'] as const) for (const fps of [20, 24, 30]) for (let mask = 0; mask < 8; mask++) {
  const skills = ['xwaoyi', ...['sld', 'txlj', 'sybh'].filter((_, i) => mask & (1 << i))];
  const s = setup(4, owner, skills, fps);
  for (const state of [s.pet.skillState!.turtle1Sld, s.pet.skillState!.turtle2Txlj, s.pet.skillState!.turtle3Sybh]) state.cooldownMs = 100000;
  s.pet.skillState!.turtle4Xwaoyi.cooldownMs = 0;
  s.step(); s.step();
  const start = s.runtime.snapshot(); const root = { x: start.runtime!.x, y: start.runtime!.y };
  assert.equal(s.pet.mp, 1000, 'Aoyi gate costs 30 but release does not spend');
  assert.equal(s.named('turtle-aoyi-released').length, 1);
  const oracle = native.cases.find((r: any) => r.id === `aoyi-${mask}`);
  assert.equal(!!s.hero.turtleLink, oracle.heroBuffs.length > 0);
  assert.equal(s.named('turtle-free-sld').length, mask & 1 ? 1 : 0);
  const sybh = s.projectiles.projectiles.find(p => p.sourceSymbol === 'PetTurtle3Bullet3');
  assert.equal(!!sybh, !!(mask & 4));
  if (sybh) { assert.equal(sybh.petEffectScale, 2); assert.equal(sybh.facingX, -1); }
  const key = start.runtime!.runtimeKey;
  const hp = s.pet.hp;
  s.step({ damageEvents: [{ runtimeKey: key, amount: 11, reactsToHit: true, knockback: { x: 17, y: -21 } }] });
  assert.equal(s.pet.hp, hp - 11); assert.notEqual(s.runtime.snapshot().animation?.action, 'hurt');
  assert.equal(s.runtime.snapshot().groundMotion!.velocityY, start.groundMotion!.velocityY, 'Aoyi rejects knockback velocity');
  assert.deepEqual({ x: s.runtime.snapshot().runtime!.x, y: s.runtime.snapshot().runtime!.y }, root);
  for (let elapsed = 2; elapsed <= fps * 5; elapsed++) s.step();
  const free = s.named('turtle-free-sld').map(row => row.tick - 2);
  assert.deepEqual(free, mask & 1 ? [0, fps * 2, fps * 4] : []);
  assert.equal(s.named('turtle-aoyi-ended').length, 1);
  assert.equal(s.pet.mp, 1000);
  if (sybh) {
    assert(sybh.isExpired);
    const checks = s.named('turtle-projectile-step').filter(row => (row.event.behaviorEvent!.payload as any).projectileId === sybh.projectileId);
    assert.equal(checks.length, fps * 5 - 1, 'TTL decrements and destroys before checkAttack');
    if (fps === 24) {
      const sourceCalls = calls.calls.filter((row: any) => row.scenario === `aoyi-4-${owner === 'p1' ? 1 : 2}-${mask}` && row.bullet.symbol === 'PetTurtle3Bullet3');
      assert.equal(checks.length, sourceCalls.length);
      checks.forEach((row, i) => assert.equal(assets.effect('PetTurtle3Bullet3', (row.event.behaviorEvent!.payload as any).nativeTick,
        2, 1).meta.tree!.frame, sourceCalls[i].bullet.frame));
    }
    assert.equal((checks.at(-1)!.event.behaviorEvent!.payload as any).nativeTick, fps * 5 - 2);
    assert(s.combat.audit.damageEvents.some(e => e.actionName === 'hit3'));
  }
  reports.push({ owner, fps, mask, free, mp: s.pet.mp, damage: s.combat.audit.damageEvents });
  s.runtime.destroy(); assert(s.projectiles.projectiles.every(p => p.isExpired));
}

for (const owner of ['p1', 'p2'] as const) {
  const s = setup(4, owner, ['sld', 'txlj', 'sybh', 'xwaoyi']); s.enemy.x = 100;
  for (const state of [s.pet.skillState!.turtle1Sld, s.pet.skillState!.turtle2Txlj,
    s.pet.skillState!.turtle3Sybh, s.pet.skillState!.turtle4Xwaoyi]) state.cooldownMs = 0;
  for (let i = 0; i < 35; i++) s.step();
  assert.deepEqual(s.events.filter(r => !(r.event.behaviorEvent?.payload as any)?.free).map(r => r.event.behaviorEvent?.type).filter(t =>
    ['turtle-sld-released', 'turtle-txlj-released', 'turtle-sybh-released', 'turtle-aoyi-released'].includes(t ?? '')).slice(0, 4),
  ['turtle-sld-released', 'turtle-txlj-released', 'turtle-sybh-released', 'turtle-aoyi-released']);
  s.runtime.destroy();
  const remote = setup(4, owner, ['sybh', 'xwaoyi']);
  remote.pet.skillState!.turtle3Sybh.cooldownMs = remote.pet.skillState!.turtle4Xwaoyi.cooldownMs = 0;
  for (let i = 0; i < 150; i++) remote.step({ isLocalOwner: false });
  assert.equal(remote.projectiles.projectiles.length, 0); assert.equal(remote.pet.mp, 1000); remote.runtime.destroy();
}
{
  const s = setup(4, 'p1', ['xwaoyi']); s.enemy.x = 400;
  for (let i = 0; i < 25; i++) s.step();
  assert.notEqual(s.runtime.snapshot().groundMotion!.velocityX, 0, 'Moving source precondition');
  s.pet.skillState!.turtle4Xwaoyi.cooldownMs = 0;
  const before = s.runtime.snapshot().runtime!; s.step();
  assert.equal(s.runtime.snapshot().runtime!.x, before.x, 'Aoyi suppresses move on release tick');
  s.enemy.x = -400;
  for (let i = 0; i < 60; i++) s.step();
  assert.equal(s.runtime.snapshot().runtime!.x, before.x);
  assert.equal(s.runtime.snapshot().runtime!.facingX, before.facingX, 'Turning suppressed separately from movement');
  s.runtime.destroy();
}

// The same living instance must not leave delayed casts after replacement/death/exit.
for (const reason of ['inactive', 'replace', 'death', 'destroy'] as const) {
  const s = setup(4, 'p1', ['sld', 'xwaoyi']);
  s.pet.skillState!.turtle1Sld.cooldownMs = 100000; s.pet.skillState!.turtle4Xwaoyi.cooldownMs = 0;
  s.step(); s.step(); const key = s.runtime.snapshot().runtime!.runtimeKey;
  if (reason === 'inactive') s.pet.isActive = false;
  if (reason === 'replace') s.pet.id = 'replacement';
  if (reason === 'destroy') s.runtime.destroy();
  s.step(reason === 'death' ? { damageEvents: [{ runtimeKey: key, amount: 999999 }] } : {});
  for (let i = 0; i < 150; i++) s.step();
  assert.equal(s.named('turtle-free-sld').length, 1, reason);
  s.runtime.destroy(); assert(s.projectiles.projectiles.every(p => p.isExpired));
}

// Source damage inputs are captured at creation, refreshed only after acceptance.
for (const reject of ['none', 'dodge', 'protected'] as const) {
  const s = setup(4, 'p1', ['sybh']); s.pet.skillState!.turtle3Sybh.cooldownMs = 0;
  for (let i = 0; i < 6; i++) s.step();
  const p = s.projectiles.projectiles.find(p => p.actionName === 'hit3')!; assert(p);
  assert.equal(p.damage, 567); s.pet.atk = 200;
  if (reject !== 'none') s.enemy.sourceHitProtection = { protected: reject === 'protected', dodgeProbability: reject === 'dodge' ? 1 : 0 };
  for (let i = 0; i < 18; i++) s.step();
  const hits = s.combat.audit.damageEvents.filter(e => e.actionName === 'hit3');
  if (reject === 'none') {
    assert(hits.length > 1); assert(hits[1]!.amount > hits[0]!.amount, 'Later accepted attack uses refreshed power');
  } else { assert.equal(hits.length, 0); assert.equal(p.damage, 567, 'Rejected attacks cannot refresh captured damage'); }
  s.runtime.destroy();
}
for (const form of [1, 2, 3, 4] as const) {
  const s = setup(form, 'p1', []);
  Object.assign(s.pet, { atk: 101, critBonusRate: 1,
    autoBuffState: { fsnl: { active: { bonusSkillDamage: 7.9 } }, sxkb: {} }, magicFlowerBuff: { attackMultiplier: 1.5 } });
  const context = { pet: s.pet, isGxp: true, random: () => 0.5 } as unknown as PetBehaviorContext;
  for (const action of ['hit1', 'hit2', 'hit3'] as const) {
    const power = (101 * (action === 'hit1' ? 1 : action === 'hit2' ? 1.05 : 5.4 * 1.05) + 7) * 1.2 * (form === 4 ? 1.5 : 1);
    assert(Math.abs(getPetTurtleNoncriticalPower(context, action) - power) < 1e-8);
    const cache = refreshPetTurtleDamage(context, action);
    assert.equal(cache.hurt, Math.trunc(power * 2)); assert.equal(cache.attack, 282); assert(cache.critical);
    for (const defense of [-100, 0, 282, 500]) assert.equal(calculateDragonPhysicalDamage(cache, defense),
      defense > 282 ? 1 : Math.trunc(cache.hurt * Math.min(1.1, (282 - defense) / 282)));
    for (const defense of [-0.5, 0, 0.2, 1, 1.2]) assert.equal(calculateDragonMagicDamage(cache, defense),
      defense > 1 ? 1 : Math.trunc(cache.hurt * Math.min(1.1, 1 - defense)));
  }
  s.runtime.destroy();
}

// The independent 221 PetInfo fixture fixes getCurPetState()=4 and warpower=1.7.
for (const form of [4] as const) for (const offset of [0, 1e-12]) {
  const s = setup(form, 'p1', ['qlfj']); s.pet.warpower = 1.7; s.step();
  const threshold = native.cases.find((r: any) => r.id === `init-${form}-1`).extra.sourceHarm.at(-1).first;
  s.step({ damageEvents: [{ runtimeKey: s.runtime.snapshot().runtime!.runtimeKey, amount: 1, reactsToHit: true }],
    random: () => threshold + offset });
  assert.equal(s.named('turtle-counter').length, offset === 0 ? 1 : 0, 'Original QLFJ inclusive probability boundary');
  s.runtime.destroy();
}
for (const form of [1, 2, 3, 4] as const) for (const owner of ['p1', 'p2'] as const) {
  const s = setup(form, owner, ['qlfj']); s.step();
  const key = s.runtime.snapshot().runtime!.runtimeKey;
  s.step({ damageEvents: [{ runtimeKey: key, amount: 1, reactsToHit: true }], random: () => 0 });
  assert.equal(s.named('turtle-counter').length, 1);
  assert.equal(s.runtime.snapshot().animation?.action, 'hit1');
  s.step({ damageEvents: [{ runtimeKey: key, amount: 1, reactsToHit: false }], random: () => 0 });
  s.step({ damageEvents: [{ runtimeKey: key, amount: 1 }], random: () => 0 });
  s.step({ damageEvents: [{ runtimeKey: key, amount: 1, producerKind: 'turtle-transfer' }], random: () => 0 });
  s.step({ damageEvents: [{ runtimeKey: 'other-owner', amount: 1 }], random: () => 0 });
  s.step({ damageEvents: [{ runtimeKey: key, amount: 1 }], gxpRuntimeKeys: [key], random: () => 0 });
  assert.equal(s.named('turtle-counter').length, 1, 'HP-only, wrong owner, GXP must not counter');
  s.step({ damageEvents: [{ runtimeKey: key, amount: 1, reactsToHit: true }], random: () => 0.99 });
  assert.equal(s.runtime.snapshot().animation?.action, 'hurt');
  s.pet.lifetime = 1;
  s.step({ damageEvents: [{ runtimeKey: key, amount: 999999, reactsToHit: true }], random: () => 0 });
  assert.equal(s.pet.lifetime, 0); assert.equal(s.runtime.snapshot().phase, 'dead-playing');
  assert.equal(s.named('turtle-counter').length, 1);
  s.step({ damageEvents: [{ runtimeKey: key, amount: 999999 }] });
  assert.equal(s.pet.lifetime, 0); assert.equal(s.runtime.snapshot().phase, 'dead-playing');
  for (let i = 0; i < 40; i++) s.step();
  assert.equal(s.runtime.snapshot().runtime, undefined);
  s.runtime.destroy();
}

for (const kind of ['sybh', 'xwaoyi']) for (const mp of [19, 20, 29, 30]) {
  const s = setup(4, 'p1', [kind]); s.pet.mp = mp;
  s.pet.skillState![kind === 'sybh' ? 'turtle3Sybh' : 'turtle4Xwaoyi'].cooldownMs = 0;
  s.step(); s.step();
  assert.equal(s.named(kind === 'sybh' ? 'turtle-sybh-released' : 'turtle-aoyi-released').length, mp >= (kind === 'sybh' ? 20 : 30) ? 1 : 0);
  s.runtime.destroy();
}
// Real incoming resolver preserves attack-ID dedup and owner key.
{
  const s = setup(4, 'p2', ['qlfj']); s.step(); const key = s.runtime.snapshot().runtime!.runtimeKey;
  s.enemy.phase = 'active'; s.enemy.activeAttack = { attackId: 'enemy-hit', actionName: 'hit1', attackRange: 1000, damage: 100, attackKind: 'physics' } as any;
  const event = resolveStage1EnemyPetAttack({ runtime: s.combat, enemy: s.enemy, target: { runtimeKey: key, x: 0, hp: s.pet.hp, defense: 20 } });
  assert(event?.reactsToHit); s.step({ damageEvents: [event], random: () => 0 });
  assert.equal(s.named('turtle-counter').length, 1);
  assert.equal(resolveStage1EnemyPetAttack({ runtime: s.combat, enemy: s.enemy, target: { runtimeKey: key, x: 0, hp: s.pet.hp, defense: 20 } }), undefined);
  s.runtime.destroy();
}
// The actual sandbox attack rectangle must admit the pet, never a distant/other-family snapshot.
for (const owner of ['p1', 'p2'] as const) {
  const s = setup(4, owner, ['qlfj']); s.step();
  const key = s.runtime.snapshot().runtime!.runtimeKey;
  s.step({ targets: [{ id: s.enemy.id, x: 40, y: 0, isAlive: true },
    { id: 'attacker', x: -40, y: 0, isAlive: true }],
  damageEvents: [{ runtimeKey: key, amount: 1, sourceId: 'attacker', reactsToHit: true, knockback: { x: 6, y: -5 } }],
  random: () => 0 });
  assert.equal(s.runtime.snapshot().target?.id, 'attacker');
  assert.equal(s.runtime.snapshot().runtime!.facingX, -1);
  assert.equal(s.runtime.snapshot().groundMotion!.direction, -1);
  s.runtime.destroy();
}
for (const owner of ['p1', 'p2'] as const) {
  const s = setup(4, owner, ['qlfj']); s.step();
  const snapshot = s.runtime.snapshot(), root = snapshot.runtime!;
  const monster = createMonster30(root.x + 120, root.y - 28);
  monster.state = 'hit1';
  monster.activeAttack = { attackId: `sandbox-${owner}`, actionName: 'hit1', facingX: -1,
    elapsedMs: 100, hitboxActiveFromMs: 50, hitboxActiveUntilMs: 150,
    damage: 100, attackKind: 'physics', knockbackX: 6, knockbackY: -5 } as any;
  let accepted = 0;
  const party = { resolvePetEnemyAttack(enemy, _time, accepts) {
    assert(accepts!(snapshot));
    assert(!accepts!({ ...snapshot, species: 'horse' }));
    assert(!accepts!({ ...snapshot, runtime: { ...root, y: root.y + 1000 } }));
    const event = resolveStage1EnemyPetAttack({ runtime: s.combat, enemy,
      target: { runtimeKey: root.runtimeKey, x: root.x, hp: s.pet.hp, defense: 20 } });
    if (event) { accepted++; assert.deepEqual(event.knockback, { x: -6, y: -5 });
      s.step({ damageEvents: [event], random: () => 0 }); }
  } } as HeroPartyRuntime;
  resolveTestSceneTurtleIncoming(party, [monster], assets, 100);
  resolveTestSceneTurtleIncoming(party, [monster], assets, 101);
  assert.equal(accepted, 1); assert.equal(s.named('turtle-counter').length, 1);
  assert.equal(s.runtime.snapshot().groundMotion?.direction, 1, 'Counter faces its target after applying incoming recoil');
  monster.activeAttack!.elapsedMs = 151;
  resolveTestSceneTurtleIncoming(party, [monster], assets, 151);
  assert.equal(accepted, 1); s.runtime.destroy();
}
if (!process.env.TURTLE_COMBAT_MUTATION) {
  const out = 'docs/tasks/evidence/TASK-SLICE-224B'; mkdirSync(out, { recursive: true });
  writeFileSync(`${out}/skill-runtime-trace.json`, JSON.stringify({ status: 'passed', reports }) + '\n');
}
console.log(`Turtle B runtime: ${reports.length} SYBH/Aoyi scenarios, eight owner/form hurt/death cases and gates passed`);
