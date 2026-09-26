import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { PetTurtleAssets } from '../src/assets/PetTurtleAssets';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createDefaultPetBehaviorRegistry } from '../src/systems/pet-behaviors/createDefaultPetBehaviorRegistry';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem, updateProjectiles } from '../src/systems/ProjectileSystem';
import { createStage1CombatRuntime, createStage1CombatEnemy } from '../src/systems/Stage1CombatSystem';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { getPetGroundEnvironment } from '../src/assets/PetGroundEnvironmentAssets';
import { createHeroCombat } from '../src/systems/HeroCombatSystem';
import { updateHeroTurtleLink, applyHeroHealing } from '../src/systems/PetTurtleLinkSystem';
import { createMonster30 } from '../src/systems/Monster30System';
import { adaptTestScenePetEnemies } from '../src/scenes/test-scene/TestScenePetEnemyAdapter';
import { resetTestSceneEncounter } from '../src/scenes/test-scene/TestSceneEncounterReset';
import { createVerticalClimbState } from '../src/systems/LevelSystem';

const assets = await PetTurtleAssets.decode(p => new Uint8Array(readFileSync(`public${p}`)));
const registry = createDefaultPetBehaviorRegistry(() => assets);
const ts = createRequire(import.meta.url)('typescript');
const source = readFileSync('src/scenes/HeroPartyRuntimeBridge.ts', 'utf8').replaceAll('\r\n', '\n');
const start = source.indexOf('  function updatePets(frame:');
assert(start > 0);
const closure = ts.transpileModule(source.slice(start, source.indexOf('\n}\n\nfunction syncFallbackFeedback', start)),
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const reports: any[] = [];
for (const level of [11, 12, 13, 21, 22] as const) for (const form of [1, 2, 3, 4] as const) {
  const environment = getPetGroundEnvironment(level);
  const wall = environment.walls.find(w => !w.throughDown && w.right - w.left > 800)!;
  assert(wall);
  const x = wall.left + 300, y = wall.top - 0.1 - assets.bodyCollision(form).height / 2;
  const rosters = Object.fromEntries(['p1', 'p2'].map(slot => {
    const roster = createSeedPetRoster();
    roster.pets.forEach(p => { p.id = `${slot}-${p.id}`; p.isActive = p.species === 'turtle' && p.form === form;
      if (p.isActive) Object.assign(p, { hp: 1000, maxHp: 2000, atk: 100, mp: 1000, maxMp: 1000,
        skills: form === 1 ? ['sld'] : ['sld', 'txlj', ...(form >= 3 ? ['sybh'] : []), ...(form === 4 ? ['xwaoyi'] : [])] }); });
    return [slot, roster];
  }));
  const runtimes = { p1: new PetCombatRuntime(registry), p2: new PetCombatRuntime(registry) };
  const snapshots: any = {}, pending: any = { p1: [], p2: [] }, animations: any = { p1: [], p2: [] };
  const combat = createStage1CombatRuntime(), projectiles = createProjectileSystem();
  const model = { combat, members: (['p1', 'p2'] as const).map(slot => ({
    movement: { x, y: y - environment.ownerRootOffsetY, facingX: 1 }, combat: { slot, combat: createHeroCombat(slot) },
  })) };
  const monster = createMonster30(x + 100, y - 10); monster.hp = monster.maxHp = 10000000;
  const formal = createStage1CombatEnemy({ id: monster.id, enemyType: 30, x: monster.x, y: monster.y });
  formal.hp = formal.maxHp = monster.maxHp;
  const enemies = level === 11 ? adaptTestScenePetEnemies([monster], () => {}) : [formal];
  let presented: any;
  const update = new Function('model', 'petRosters', 'petCombatRuntimes', 'petCombatSnapshots', 'pendingPetDamageEvents',
    'pendingPetAnimationEvents', 'scene', 'petProjectileCombat', 'petDragonPresentation', 'isPetDragonQaEnabled', 'petTurtle',
    closure + '\nreturn updatePets;')(model, rosters, runtimes, snapshots, pending, animations,
    { game: { loop: { targetFps: 24 } } }, Object.assign((input: any) => {
      const port = createPetProjectileCombatPort(input);
      return { ...port, hit: (p: any, id: string, cache: any) => {
        assert(p.sourceId.startsWith(`${input.ownerSlot}-`), 'Production hit owner must match the source pet');
        return port.hit(p, id, cache);
      } };
    }, { readyRoster: (r: any) => r }), { update() {} }, () => false,
    { readyRoster: (r: any) => r, update: (s: any) => { presented = s; } });
  let tick = 0;
  const step = () => {
    tick++; updateProjectiles(projectiles, [], 1000 / 24);
    model.members.forEach(m => updateHeroTurtleLink(m.combat.combat, 1000 / 24));
    update({ targets: [{ id: monster.id, x: monster.x, y: monster.y, isAlive: true }], combatEnemies: enemies,
      projectiles, timeMs: tick * 1000 / 24, deltaMs: 1000 / 24, random: () => 0.5, groundEnvironmentFor: () => environment });
  };
  step();
  const pets = (['p1', 'p2'] as const).map(slot => rosters[slot]!.pets.find(p => p.isActive)!);
  if (form >= 2) { pets.forEach(p => { p.skillState!.turtle2Txlj.cooldownMs = 0; }); step(); }
  pets.forEach(p => { p.skillState!.turtle1Sld.cooldownMs = 0; });
  for (let i = 0; i < 55; i++) step();
  assert(enemies[0]!.hp < enemies[0]!.maxHp, `${level}/${form} actual enemy HP`);
  for (const slot of ['p1', 'p2']) assert(combat.audit.damageEvents.some(e => e.sourceId.startsWith(slot)), `${level}/${form}/${slot} source`);
  assert.equal(presented.p1, snapshots.p1, 'Production presentation consumes the actual snapshots');
  assert(pets.every(p => p.hp > 1000), 'Creation healing reaches both real roster owners');
  if (form === 4) {
    pets.forEach(p => { for (const key of ['turtle1Sld', 'turtle2Txlj', 'turtle3Sybh'] as const) p.skillState![key].cooldownMs = 100000;
      p.skillState!.turtle4Xwaoyi.cooldownMs = 0; });
    for (let i = 0; i < 30 && !projectiles.projectiles.some(p => p.sourceSymbol === 'AoyiBuff'); i++) step();
    assert(projectiles.projectiles.some(p => p.sourceSymbol === 'AoyiBuff'), `${level}/aoyi starts before cleanup`);
  } else { pets.forEach(p => { p.skillState!.turtle1Sld.cooldownMs = 0; }); for (let i = 0; i < 7; i++) step(); }
  const old = snapshots.p1.runtime.runtimeKey, p2 = snapshots.p2.runtime.runtimeKey;
  const oldLink = model.members[0]!.combat.combat.turtleLink;
  pets[0]!.isActive = false; step();
  assert.equal(snapshots.p1.runtime, undefined); assert.equal(snapshots.p2.runtime.runtimeKey, p2);
  assert(!projectiles.projectiles.some(p => p.sourceId === pets[0]!.id), 'Rest removes even expired source objects immediately');
  if (oldLink) {
    assert.equal(oldLink.peer, undefined, 'Released owner cannot retain a session closure');
    assert.equal(oldLink.reduceHp, undefined); assert.equal(oldLink.pet, undefined);
    assert(oldLink.active, 'Source hero buff keeps its display lifetime');
    const hp = pets[0]!.hp; applyHeroHealing(model.members[0]!.combat.combat, 100); assert.equal(pets[0]!.hp, hp);
  }
  pets[0]!.isActive = true; step(); assert.notEqual(snapshots.p1.runtime.runtimeKey, old);
  if (form >= 2) {
    pets[0]!.skillState!.turtle2Txlj.cooldownMs = 0; step();
    const rebound = model.members[0]!.combat.combat.turtleLink!;
    assert.equal(rebound.runtimeKey, snapshots.p1.runtime.runtimeKey, 'Retained hero display rebinds only to the new session');
    assert.equal(rebound.pet, pets[0]); assert.equal(rebound.peer?.()?.runtimeKey, rebound.runtimeKey);
    assert.equal(rebound.value, oldLink!.value, 'Source same-name refresh retains the display value');
  }
  animations.p1 = [{ runtimeKey: old, actionToken: 1, action: 'hit2', eventName: 'hit' }];
  const replacement = { ...pets[0]!, id: `${pets[0]!.id}-new`, skills: [] };
  rosters.p1!.pets = [replacement]; step(); assert.equal(snapshots.p1.petId, replacement.id);
  assert(!projectiles.projectiles.some(p => p.sourceId === pets[0]!.id));
  pending.p1 = [{ runtimeKey: old, amount: 999999, reactsToHit: true }]; step(); assert(replacement.hp > 0, 'stale owner event');
  const life = pets[1]!.lifetime;
  pending.p2 = [{ runtimeKey: p2, amount: 999999, reactsToHit: true }]; step();
  assert.equal(snapshots.p2.phase, 'dead-playing'); assert.equal(pets[1]!.lifetime, life - 1);
  for (let i = 0; i < 80; i++) step();
  assert.equal(snapshots.p2.runtime, undefined); assert.equal(pets[1]!.lifetime, life - 1);
  runtimes.p1.destroy(); runtimes.p2.destroy(); runtimes.p1.destroy();
  assert.equal(projectiles.projectiles.length, 0, 'No next update needed after destroy');
  reports.push({ level, form, owners: ['p1', 'p2'], damage: combat.audit.damageEvents.length,
    rest: true, replace: true, staleEvents: true, death: true, destroy: true, remainingProjectiles: 0 });
}
const sandbox: any = { monster30AuraTargets: new Map([['old', 'p1']]), renderedMonsterAttackIds: new Set(['old']),
  capturablePetTargetViews: new Map(), magicBottleEffectViews: new Map(), magicWeaponPlatformViews: new Map(),
  verticalClimb: { cameraY: -123, spawnTimerMs: 999 }, monster30s: [{ id: 'old' }], projectileSystem: { projectiles: [{}] } };
resetTestSceneEncounter(sandbox, 590);
assert.deepEqual(sandbox.verticalClimb, createVerticalClimbState(590));
assert.deepEqual(sandbox.monster30s, []); assert.deepEqual(sandbox.projectileSystem.projectiles, []);
assert.equal(sandbox.monster30AuraTargets.size, 0); assert.equal(sandbox.renderedMonsterAttackIds.size, 0);
const out = 'docs/tasks/evidence/TASK-SLICE-224C'; mkdirSync(out, { recursive: true });
if (!process.env.TURTLE_COMBAT_MUTATION) writeFileSync(`${out}/lifecycle-trace.json`, JSON.stringify({ status: 'passed', reports }, null, 2));
console.log(`Turtle production closure: ${reports.length} five-level/form cases, both owners and lifecycle passed`);

