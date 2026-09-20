import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PetTurtleAssets } from '../src/assets/PetTurtleAssets';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import type { PetCombatFrame, PetCombatRuntimeEvent } from '../src/systems/PetCombatTypes';
import { createDefaultPetBehaviorRegistry } from '../src/systems/pet-behaviors/createDefaultPetBehaviorRegistry';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem, updateProjectiles } from '../src/systems/ProjectileSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { resolveStage1EnemyPetAttack } from '../src/systems/Stage1CombatSystem';

const assets = await PetTurtleAssets.decode(path => new Uint8Array(readFileSync(`public${path}`)));
const registry = createDefaultPetBehaviorRegistry(() => assets);
const traces: unknown[] = [];
const sourceTrace = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SETTINGS-221/source-trace.json', 'utf8'));
for (const source of sourceTrace.sources) {
  assert.equal(createHash('sha256').update(readFileSync(source.path)).digest('hex'), source.sha256, source.path);
}
const sourceCases = sourceTrace.cases;
const nativeCalls = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SLICE-224A2/native-caller-order.json', 'utf8')).calls;
const basePet = readFileSync('local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BasePet.as', 'utf8');
const followRange = Number(basePet.match(/followRange:uint = (\d+)/)![1]);
const warpRange = Number(basePet.match(/GetDisBetweenTwoObj\(this,this.sourceRole\) >= (\d+)/)![1]);
function setup(form: 1 | 2 | 3 | 4, owner: 'p1' | 'p2', skills: string[] = []) {
  const roster = createSeedPetRoster();
  const pet = roster.pets.find(p => p.species === 'turtle' && p.form === form)!;
  assert(pet);
  roster.pets.forEach(p => { p.isActive = p === pet; });
  Object.assign(pet, { id: `${owner}-turtle${form}`, hp: 100, maxHp: 1000, mp: 1000, maxMp: 1000,
    atk: 100, def: 20, critBonusRate: 0, skills });
  const runtime = new PetCombatRuntime(registry), projectiles = createProjectileSystem(), combat = createStage1CombatRuntime();
  const enemy = createStage1CombatEnemy({ id: 'target', enemyType: 2, x: 40, y: -15 });
  enemy.hp = enemy.maxHp = 100000;
  const frame: PetCombatFrame = { roster, owner: { x: 0, y: 0, facingX: 1 }, targets: [], projectiles,
    hostFps: 24, deltaMs: 1000 / 24, random: () => 0.5,
    groundEnvironment: { ownerRootOffsetY: 0, walls: [{ id: 'floor', left: -10000, right: 10000,
      top: 0.1, bottom: 20, usesWallTolerance: true }] } };
  runtime.update({ ...frame, deltaMs: 0 });
  let tick = 0;
  const events: { tick: number; event: PetCombatRuntimeEvent }[] = [];
  const step = (extra: Partial<PetCombatFrame> = {}) => {
    tick++;
    updateProjectiles(projectiles, [], frame.deltaMs);
    const snapshot = runtime.update({ ...frame,
      targets: [{ id: enemy.id, x: enemy.x, y: enemy.y, isAlive: enemy.hp > 0 }],
      projectileCombat: createPetProjectileCombatPort({ combat, enemies: [enemy], ownerSlot: owner,
        timeMs: tick * 1000 / 24, random: () => 0.5,
        mask: () => { throw new Error('Turtle must use its own native collision planes'); } }), ...extra });
    events.push(...runtime.events().map(event => ({ tick, event })));
    return snapshot;
  };
  return { pet, roster, runtime, projectiles, combat, enemy, frame, events, step, tick: () => tick };
}

for (const form of [1, 2, 3, 4] as const) for (const owner of ['p1', 'p2'] as const) {
  const s = setup(form, owner);
  assert.equal(s.pet.skillState!.turtle1Sld.cooldownMs, 3000);
  const init = sourceCases.find((row: any) => row.id === `init-${form}-${owner === 'p1' ? 1 : 2}`);
  assert.deepEqual([s.pet.skillState!.turtle1Sld, s.pet.skillState!.turtle2Txlj,
    s.pet.skillState!.turtle3Sybh, s.pet.skillState!.turtle4Xwaoyi].map(state => state.cooldownMs * 24 / 1000), init.cd);
  for (let i = 0; i < 75; i++) s.step();
  const created = s.events.find(row => row.event.behaviorEvent?.type === 'turtle-projectile-created')!;
  assert(created, `${form}/${owner} no actual normal projectile`);
  const firstNativeCall = nativeCalls.find((row: any) => row.scenario === `normal-${form}-${owner === 'p1' ? 1 : 2}-7`);
  assert.equal(created.tick, s.frame.hostFps! + firstNativeCall.tick - 1, 'One source AI second beat before the native callback');
  const sourceNormal = sourceCases.find((row: any) => row.id === `normal-hit-${form}-${owner === 'p1' ? 1 : 2}`).bullets[0];
  const creation = created.event.behaviorEvent!.payload as any;
  assert.equal(creation.symbol, sourceNormal.name);
  assert.equal(creation.x - creation.sourceRoot.x, sourceNormal.x - 300);
  assert.equal(creation.y - creation.sourceRoot.y, sourceNormal.y - 400);
  const firstStep = s.events.find(row => row.event.behaviorEvent?.type === 'turtle-projectile-step')!;
  assert.equal(firstStep.tick, created.tick + 1);
  assert.equal((firstStep.event.behaviorEvent!.payload as any).nativeTick, 0);
  assert(s.combat.audit.damageEvents.length > 0, `${form}/${owner} native normal missed all targets`);
  assert(s.combat.audit.damageEvents.every(event => event.sourceId === s.pet.id));
  assert.equal(s.enemy.lastHitBy, owner, 'Actual settlement preserves the player owner');
  assert.equal(s.enemy.hp, s.enemy.maxHp - s.combat.audit.damageEvents.reduce((sum, event) => sum + event.amount, 0));
  assert.equal(new Set(s.combat.audit.damageEvents.map(event => event.attackId)).size,
    s.combat.audit.damageEvents.length, 'Same normal attack cannot settle twice on one target');
  assert.equal(s.pet.hp, 100, 'Normal never borrows dragon hit-healing');
  traces.push({ form, owner, normalHits: s.combat.audit.damageEvents.length, born: created.tick, firstCheck: firstStep.tick });
  s.runtime.destroy();
  assert(s.projectiles.projectiles.every(p => p.isExpired));

  const shield = setup(form, owner, ['sld']);
  shield.enemy.x = 100;
  shield.pet.skillState!.turtle1Sld.cooldownMs = 0;
  for (let i = 0; i < 12; i++) shield.step();
  const release = shield.events.find(row => row.event.behaviorEvent?.type === 'turtle-sld-released');
  const emission = shield.events.find(row => row.event.behaviorEvent?.type === 'turtle-projectile-created');
  assert(release && emission);
  assert.equal(shield.pet.mp, 980);
  assert.equal(shield.pet.hp, 205, 'SLD creation uses noncritical source power, independent of collision');
  const p = shield.projectiles.projectiles[0]!;
  assert.equal(p.actionName, 'hit2');
  assert.equal(p.attackKind, form === 4 ? 'physics' : 'magic');
  const tickBefore = p.petHostTick!;
  shield.step({ damageEvents: [{ runtimeKey: shield.runtime.snapshot().runtime!.runtimeKey, amount: 1 }] });
  assert.equal(shield.runtime.snapshot().animation?.action, 'hurt');
  assert.equal(p.petHostTick, tickBefore + 1);
  assert.equal(p.isExpired, false);
  traces.push({ form, owner, sldCreated: emission.event.behaviorEvent!.payload,
    hurtAction: shield.runtime.snapshot().animation!.action, continuedTick: p.petHostTick,
    actualDamage: shield.combat.audit.damageEvents });
  shield.runtime.destroy();
}

for (const form of [1, 2, 3, 4] as const) for (const owner of ['p1', 'p2'] as const) {
  for (const distance of [49, 50, 200, 201]) {
    const s = setup(form, owner, ['sld']);
    for (let i = 0; i < 24; i++) s.step({ targets: [] });
    const root = s.runtime.snapshot().runtime!;
    s.enemy.x = root.x + distance; s.enemy.y = root.y;
    s.pet.skillState!.turtle1Sld.cooldownMs = 0;
    s.step(); s.step();
    const expected = sourceCases.find((row: any) => row.id === `gate-${form}-${owner === 'p1' ? 1 : 2}-${distance}`).extra.gate;
    assert.equal(s.events.some(row => row.event.behaviorEvent?.type === 'turtle-sld-released'), expected,
      `${form}/${owner} SLD distance ${distance}`);
    assert.equal(s.pet.mp, expected ? 980 : 1000);
    s.runtime.destroy();
  }
  for (const delta of [0, 0.05]) {
    const s = setup(form, owner);
    for (let i = 0; i < 24; i++) s.step({ targets: [] });
    const root = s.runtime.snapshot().runtime!;
    const range = sourceCases.find((row: any) => row.id === `init-${form}-${owner === 'p1' ? 1 : 2}`).extra.range;
    s.enemy.x = root.x + range + delta; s.enemy.y = root.y;
    for (let i = 0; i < 25; i++) s.step();
    assert.equal(s.events.some(row => row.event.action?.type === 'hit1'), delta === 0, `${form}/${owner} normal range ${range + delta}`);
    if (delta > 0) assert(s.runtime.snapshot().runtime!.x > root.x, 'Outside range pursues target');
    s.runtime.destroy();
  }
  const remote = setup(form, owner, ['sld']);
  for (let i = 0; i < 100; i++) remote.step({ isLocalOwner: false });
  assert.equal(remote.runtime.snapshot().target, undefined);
  assert.equal(remote.projectiles.projectiles.length, 0, 'Remote owner cannot autonomously emit');
  assert.equal(remote.pet.mp, 1000);
  assert.equal(remote.pet.skillState!.turtle1Sld.cooldownMs, 0, 'Remote host clock still counts down; AI never resets it');
  remote.runtime.destroy();
  const priority = setup(form, owner, ['sld', 'txlj', 'sybh', 'xwaoyi']);
  priority.enemy.x = 100;
  for (const state of [priority.pet.skillState!.turtle1Sld, priority.pet.skillState!.turtle2Txlj,
    priority.pet.skillState!.turtle3Sybh, priority.pet.skillState!.turtle4Xwaoyi]) state.cooldownMs = 0;
  priority.step(); priority.step();
  assert.equal(priority.runtime.snapshot().animation!.action,
    sourceCases.find((row: any) => row.id === `priority-${form}-${owner === 'p1' ? 1 : 2}`).action);
  assert.equal(priority.pet.mp, 980, 'SLD wins over every later learned branch');
  priority.runtime.destroy();
  const sourceCost = 1000 - sourceCases.find((row: any) => row.id === `priority-${form}-${owner === 'p1' ? 1 : 2}`).mp;
  for (const mp of [sourceCost - 1, sourceCost]) {
    const low = setup(form, owner, ['sld']); low.enemy.x = 100;
    low.pet.mp = mp; low.pet.skillState!.turtle1Sld.cooldownMs = 0;
    low.step(); low.step();
    assert.equal(low.events.some(row => row.event.behaviorEvent?.type === 'turtle-sld-released'), mp === sourceCost);
    assert.equal(low.pet.mp, mp === sourceCost ? 0 : mp);
    low.runtime.destroy();
  }
  for (const distance of [followRange, followRange + 0.05, warpRange]) {
    const follower = setup(form, owner);
    for (let tick = 0; tick < 24; tick++) follower.step({ targets: [] });
    const start = follower.runtime.snapshot().runtime!;
    const snapshot = follower.step({ targets: [], owner: { x: start.x + distance, y: start.y, facingX: 1 } });
    if (distance === warpRange) assert(snapshot.runtime!.x >= start.x + distance, 'Original warp threshold');
    else assert.equal(snapshot.groundMotion!.direction, distance > followRange ? 1 : 0, `${form}/${owner} follow boundary`);
    follower.runtime.destroy();
  }
}

// Ordered selection, one-frame sticky invalidation, and a deferred winning branch.
{
  const s = setup(4, 'p2', ['sybh', 'xwaoyi']);
  const far = { id: 'far', x: 1000, y: -30, isAlive: true }, near = { id: 'near', x: 100, y: -30, isAlive: true };
  assert.equal(s.step({ targets: [far, near] }).target?.id, 'far');
  assert.equal(s.step({ targets: [{ ...far, isAlive: false }, near] }).target, undefined);
  assert.equal(s.step({ targets: [near] }).target?.id, 'near');
  s.pet.skillState!.turtle2Txlj.cooldownMs = 0;
  s.pet.skillState!.turtle3Sybh.cooldownMs = 0;
  s.pet.skillState!.turtle4Xwaoyi.cooldownMs = 0;
  const token = s.runtime.snapshot().actionToken;
  s.step({ targets: [near] });
  const event = s.runtime.events().find(row => row.behaviorEvent?.type === 'pet-action-deferred');
  assert.deepEqual(event?.behaviorEvent?.payload, { action: 'sybh' });
  assert.equal(s.runtime.snapshot().actionToken, token);
  assert.equal(s.pet.mp, 1000);
  assert.equal(s.pet.skillState!.turtle2Txlj.cooldownMs, 0);
  assert.equal(s.projectiles.projectiles.length, 0);
  s.runtime.destroy();
}

// Geometry misses must neither call settlement nor gate the creation-time heal.
{
  const s = setup(1, 'p1', ['sld']); s.enemy.x = 100;
  s.pet.skillState!.turtle1Sld.cooldownMs = 0;
  for (let i = 0; i < 40; i++) s.step({ projectileCombat: {
    mask: () => { throw Error('Legacy mask requested'); },
    target: () => ({ monsterId: 2, x: 5000, y: 5000, alive: true }),
    hit: () => assert.fail('A native geometry miss reached settlement'),
  } });
  assert.equal(s.pet.hp, 205);
  assert.equal(s.combat.audit.damageEvents.length, 0);
  s.runtime.destroy();
}

// Protection rejects at the producer before hit-id consumption; settled reduceHp events remain direct.
{
  const s = setup(1, 'p1', ['sld']); s.enemy.x = 100; s.pet.skillState!.turtle1Sld.cooldownMs = 0;
  s.step(); s.step();
  assert.equal(s.runtime.snapshot().protectedFromHits, true);
  s.enemy.phase = 'active';
  s.enemy.activeAttack = { attackId: 'protection-probe', attackRange: 500, attackKind: 'physics', damage: 100 } as any;
  const attempt = () => resolveStage1EnemyPetAttack({ runtime: s.combat, enemy: s.enemy,
    target: { runtimeKey: s.runtime.snapshot().runtime!.runtimeKey, x: 0, defense: 0, hp: 100,
      protectedFromHits: s.runtime.snapshot().protectedFromHits } });
  assert.equal(attempt(), undefined);
  for (let i = 0; i < 9; i++) s.step({ targets: [] });
  assert.equal(s.runtime.snapshot().protectedFromHits, true);
  s.step({ targets: [] });
  assert.equal(s.runtime.snapshot().protectedFromHits, false);
  assert(attempt(), 'Protected attempt must not consume the attack id');
  s.runtime.destroy();
}
mkdirSync('docs/tasks/evidence/TASK-SLICE-224A2', { recursive: true });
if (!process.env.TURTLE_COMBAT_MUTATION) {
  writeFileSync('docs/tasks/evidence/TASK-SLICE-224A2/runtime-trace.json', JSON.stringify({ status: 'passed', traces }));
}
console.log('Turtle runtime normal/SLD, four forms x P1/P2: passed');
