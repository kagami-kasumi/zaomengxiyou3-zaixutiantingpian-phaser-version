import { bodyGroundFixture } from './pet226-body/ground-fixture';
/** Real party update closure, production family Behaviors/ports and simultaneous owners.
 * Scope: existing ordinary-effect release contract; delayed Horse4 callbacks are separate. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem, updateProjectiles } from '../src/systems/ProjectileSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { createHeroCombat } from '../src/systems/HeroCombatSystem';
import { bodyFixtureCollisionAssets } from './pet226-body/body-fixture-collision';

const ts = createRequire(import.meta.url)('typescript');
const source = readFileSync('src/scenes/HeroPartyRuntimeBridge.ts', 'utf8').replaceAll('\r\n', '\n');
const start = source.indexOf('  function updatePets(frame:');
const end = source.indexOf('\n}\n\nfunction syncFallbackFeedback', start);
assert(start > 0 && end > start);
const closure = ts.transpileModule(source.slice(start, end),
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
let cases = 0;
for (const family of ['monkey', 'horse'] as const) for (const form of [1, 2, 3, 4])
for (const fps of [20, 24, 30]) {
  const rosters: any = Object.fromEntries(['p1', 'p2'].map(slot => {
    const roster = createSeedPetRoster();
    roster.pets.forEach(p => {
      p.id = `${slot}-${p.id}`; p.isActive = p.species === family && p.form === form;
      if (p.isActive) Object.assign(p, { hp: 1000, maxHp: 1000, skills: [], moveSpeed: 0 });
    });
    return [slot, roster];
  }));
  const pets = ['p1', 'p2'].map(slot => rosters[slot].pets.find((p: any) => p.isActive));
  const runtimes = { p1: new PetCombatRuntime(), p2: new PetCombatRuntime() };
  const snapshots: any = {}, pending: any = { p1: [], p2: [] }, animations: any = { p1: [], p2: [] };
  const projectiles = createProjectileSystem(), combat = createStage1CombatRuntime();
  const model = { combat, members: ['p1', 'p2'].map(slot => ({
    movement: { x: 300, y: 350, facingX: 1 }, combat: { slot, combat: createHeroCombat(slot as 'p1' | 'p2') },
  })) };
  const groundEnvironment = bodyGroundFixture(family, form as 1 | 2 | 3 | 4, 250);
  let tick = 0, presented: any;
  const port = Object.assign((input: any) => createPetProjectileCombatPort({ ...input,
    monkeyHorseCollision: () => bodyFixtureCollisionAssets, displayTick: () => tick,
    mask: () => { throw Error('Ordinary family attacks require native collision'); },
  }), { readyRoster: (r: any) => r });
  const update = new Function('model', 'petRosters', 'petCombatRuntimes', 'petCombatSnapshots',
    'pendingPetDamageEvents', 'pendingPetAnimationEvents', 'scene', 'petProjectileCombat',
    'petDragonPresentation', 'isPetDragonQaEnabled', 'petTurtle', closure + '\nreturn updatePets;')(
    model, rosters, runtimes, snapshots, pending, animations, { game: { loop: { targetFps: fps } } },
    port, { update(s: any) { presented = s; } }, () => false, { readyRoster: (r: any) => r, update() {} });
  const enemy = createStage1CombatEnemy({ id: 'target', enemyType: 2, x: 340, y: 350 });
  enemy.hp = 10000000;
  const step = (targets = true) => {
    tick++; updateProjectiles(projectiles, [], 1000 / fps);
    update({ groundEnvironmentFor: () => groundEnvironment, targets: targets ? [{ id: enemy.id, x: enemy.x, y: enemy.y, isAlive: true }] : [],
      combatEnemies: [enemy], projectiles, timeMs: tick * 1000 / fps, deltaMs: 1000 / fps, random: () => 0.1 });
  };
  step(false);
  enemy.x = snapshots.p1.runtime.x + 40; enemy.y = snapshots.p1.runtime.y;
  for (let n = 0; n < 100 && !pets.every(p => projectiles.projectiles.some(b => b.sourceId === p.id)); n++) step();
  assert(pets.every(p => projectiles.projectiles.some(b => b.sourceId === p.id)), `${family}/${form}/${fps}: both real bodies emit`);
  assert.equal(presented[0], snapshots.p1); assert.equal(presented[1], snapshots.p2);
  const oldKey = snapshots.p1.runtime.runtimeKey, p2Key = snapshots.p2.runtime.runtimeKey;
  const p2Bullet = projectiles.projectiles.find(p => p.sourceId === pets[1].id)!;
  const p2Age = p2Bullet.petHostTick!;
  pets[0].isActive = false; step();
  assert.equal(snapshots.p1.runtime, undefined);
  assert.equal(snapshots.p2.runtime.runtimeKey, p2Key);
  assert(!projectiles.projectiles.some(p => p.sourceId === pets[0].id), 'Rest clears only released source objects');
  assert.equal(p2Bullet.petHostTick, p2Age + 1, 'Other slot keeps its original live effect');
  pets[0].isActive = true; step();
  assert.notEqual(snapshots.p1.runtime.runtimeKey, oldKey);
  const replacement = { ...pets[0], id: `${pets[0].id}-replacement` };
  rosters.p1.pets = [replacement];
  pending.p1 = [{ runtimeKey: oldKey, amount: 999999, reactsToHit: true }]; step();
  assert.equal(snapshots.p1.petId, replacement.id); assert.equal(replacement.hp, 1000);
  assert(!projectiles.projectiles.some(p => p.sourceId === pets[0].id));
  const lifetime = pets[1].lifetime;
  pending.p2 = [{ runtimeKey: p2Key, amount: 999999, reactsToHit: true }]; step();
  assert.equal(snapshots.p2.phase, 'dead-playing'); assert.equal(pets[1].lifetime, lifetime - 1);
  assert.equal(snapshots.p1.petId, replacement.id);
  for (let n = 0; n < 100 && snapshots.p2.runtime; n++) step();
  assert.equal(snapshots.p2.runtime, undefined); assert.equal(pets[1].lifetime, lifetime - 1);
  assert(!projectiles.projectiles.some(p => p.sourceId === pets[1].id));
  runtimes.p1.destroy(); runtimes.p2.destroy(); runtimes.p1.destroy();
  assert.equal(projectiles.projectiles.length, 0);
  cases++;
}
assert.equal(cases, 24);
console.log(`${cases} simultaneous P1/P2 production party/family/port cases: ordinary birth, rest, replacement, stale damage, death and destruction passed; delayed aoyi and GPU excluded.`);
