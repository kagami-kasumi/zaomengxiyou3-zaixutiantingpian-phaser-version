import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { writeFileSync } from './write-dragon-evidence';
import { createRequire } from 'node:module';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import type { PetCombatFrame } from '../src/systems/PetCombatTypes';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem, updateProjectiles } from '../src/systems/ProjectileSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { createDragon1CloneState } from '../src/systems/PetDragonCloneState';

const alpha = execFileSync('python', ['-c',
  'from PIL import Image; import sys; sys.stdout.buffer.write(Image.open(sys.argv[1]).convert("RGBA").getchannel("A").tobytes())',
  'public/assets/pets/dragon/effects/PetDragon1Bullet1/1.png']);
const mask = { width: 67, height: 53, alpha };
const traces: unknown[] = [];

function setup(fps: number, skills: string[] = [], random = () => 0.5, owner: 'p1' | 'p2' = 'p1') {
  const roster = createSeedPetRoster();
  const pet = roster.pets.find(p => p.species === 'dragon' && p.form === 1)!;
  roster.pets.forEach(p => p.isActive = p === pet);
  Object.assign(pet, { id: `${owner}-dragon`, hp: 500, maxHp: 1000, mp: 100, maxMp: 100,
    atk: 100, def: 20, level: 1, skills });
  const runtime = new PetCombatRuntime();
  const projectiles = createProjectileSystem();
  const combat = createStage1CombatRuntime();
  const enemy = createStage1CombatEnemy({ id: 'target', enemyType: 2, x: 100, y: -15 });
  enemy.hp = enemy.maxHp = 1_000_000;
  let tick = 0;
  const events: { tick: number; event: any }[] = [];
  const frame: PetCombatFrame = { roster, owner: { x: 0, y: 0, facingX: 1 },
    targets: [{ id: enemy.id, x: enemy.x, y: enemy.y, isAlive: true }], projectiles,
    hostFps: fps, deltaMs: 1000 / fps, random,
    groundEnvironment: { ownerRootOffsetY: 0, walls: [{ id: 'floor', left: -10000, right: 10000,
      top: 0, bottom: 20, usesWallTolerance: true }] },
  };
  runtime.update({ ...frame, deltaMs: 0 });
  function step(extra: Partial<PetCombatFrame> = {}) {
    tick++;
    updateProjectiles(projectiles, [{ id: pet.id, state: 'ready' }], frame.deltaMs);
    const snapshot = runtime.update({ ...frame,
      projectileCombat: createPetProjectileCombatPort({ combat, enemies: [enemy], ownerSlot: owner,
        timeMs: tick * 1000 / fps, random, mask: () => mask }), ...extra });
    events.push(...runtime.events().map(event => ({ tick, event })));
    return snapshot;
  }
  return { pet, roster, runtime, projectiles, combat, enemy, frame, events, step, tick: () => tick };
}

for (const fps of [20, 24, 30]) {
  const s = setup(fps);
  for (let i = 0; i < fps + 19; i++) s.step();
  const action = s.events.find(row => row.event.type === 'action' && row.event.action.type === 'normal')!;
  const emission = s.events.find(row => row.event.behaviorEvent?.type === 'dragon1-normal-emitted')!;
  const heal = s.events.find(row => row.event.behaviorEvent?.type === 'dragon1-hit-heal')!;
  assert.ok(action, 'normal action must occur');
  assert.ok(emission, 'normal action must emit a projectile');
  assert.ok(heal, 'accepted normal hit must invoke the healing callback');
  assert.equal(action.tick, fps + 1, 'search tick cannot attack');
  assert.equal(emission.tick - action.tick, 6, 'enter event is the seventh host tick');
  assert.equal(heal.tick - emission.tick, 1, 'new bullet first steps on the next host tick');
  assert.equal(s.combat.audit.damageEvents[0]!.amount, 97);
  assert.equal(s.pet.hp, 538);
  assert.equal(s.combat.audit.damageEvents[0]!.sourceId, s.pet.id);
  assert.equal(s.projectiles.projectiles.some(p => p.sourceId === s.pet.id && !p.isExpired), false);
  traces.push({ fps, case: 'normal', events: s.events, damage: s.combat.audit.damageEvents });
}

for (const owner of ['p1', 'p2'] as const) {
  const s = setup(24, ['fs'], () => 0.9, owner);
  let child = s.runtime.snapshot().summons?.[0];
  while (!child && s.tick() < 130) { child = s.step().summons?.[0]; }
  assert.ok(child, 'real private entity must be generated');
  const cast = s.events.find(row => row.event.behaviorEvent?.type === 'dragon1-fs-cast')!;
  const spawn = s.events.find(row => row.event.behaviorEvent?.type === 'dragon1-clone-spawned')!;
  assert.equal(cast.tick, 61, 'initial fs cooldown expires after 60 source ticks');
  assert.equal(spawn.tick - cast.tick, 16);
  assert.equal(cast.event.behaviorEvent.payload.mpBefore - cast.event.behaviorEvent.payload.mpAfter, 20);
  assert.equal(child.hp, s.pet.hp);
  assert.equal(child.maxHp, s.pet.hp);
  assert.equal(child.mp, s.pet.mp);
  assert.equal(child.maxMp, s.pet.mp);
  assert.equal(s.roster.pets.some(p => p.id === child.petId), false);
  assert.equal(child.parentRuntimeKey, s.runtime.snapshot().runtime!.runtimeKey);
  s.pet.skills = []; // prevent a second cast while observing this child's independent lifetime.
  const spawnedAt = s.tick();
  for (let tick = 1; tick < 240; tick++) s.step({ random: () => 0.5 });
  assert.equal(s.runtime.snapshot().summons!.length, 1);
  s.step({ random: () => 0.5 });
  assert.equal(s.runtime.snapshot().summons!.length, 0);
  const expiry = s.events.find(row => row.event.behaviorEvent?.type === 'dragon1-expiry-heal')!;
  assert.equal(expiry.tick - spawnedAt, 240);
  assert.equal(expiry.event.behaviorEvent.payload.hpAfter - expiry.event.behaviorEvent.payload.hpBefore, 36);
  assert.ok(s.combat.audit.damageEvents.some(event => event.sourceId === child.petId), 'clone must deal its own damage');
  assert.equal(s.enemy.lastHitBy, owner);
  traces.push({ owner, case: 'fs-expiry', events: s.events, damage: s.combat.audit.damageEvents });
}

const death = setup(24, ['fs'], () => 0.9);
while (!death.runtime.snapshot().summons?.length && death.tick() < 130) death.step();
const child = death.runtime.snapshot().summons![0]!;
death.pet.skills = [];
death.step({ damageEvents: [{ runtimeKey: child.runtime.runtimeKey, amount: child.hp }] });
assert.equal(death.runtime.snapshot().summons!.length, 0);
assert.equal(death.events.some(row => row.event.behaviorEvent?.type === 'dragon1-expiry-heal'), false);
death.runtime.destroy();
assert.equal(death.projectiles.projectiles.some(p => !p.isExpired), false);

const facing = setup(24);
for (let i = 0; i < 24; i++) facing.step();
facing.enemy.x = facing.runtime.snapshot().runtime!.x;
facing.frame.targets[0]!.x = facing.enemy.x;
const equalX = facing.step();
assert.equal(equalX.animation!.action, 'normal');
assert.equal(equalX.runtime!.facingX, -1);
assert.equal(equalX.groundMotion!.direction, -1, 'faceToTarget must update persistent movement direction');
facing.runtime.destroy();

// The source explicitly reads these values at doHit2, not at fs selection.
const generation = setup(24, ['fs'], () => 0.9);
while (!generation.events.some(row => row.event.behaviorEvent?.type === 'dragon1-fs-cast')) generation.step();
Object.assign(generation.pet, { hp: 333, mp: 44, atk: 27, def: 11, level: 10, critBonusRate: 0.8 });
while (!generation.runtime.snapshot().summons?.length) generation.step();
const generated = generation.runtime.snapshot().summons![0]!;
assert.equal(generated.hp, generation.pet.hp);
assert.equal(generated.mp, generation.pet.mp);
assert.notEqual(generated.maxHp, 500);
const spawnValues = generation.events.find(row => row.event.behaviorEvent?.type === 'dragon1-clone-spawned')!
  .event.behaviorEvent.payload;
assert.equal(spawnValues.atk, 27);
assert.equal(spawnValues.def, 11);
const raw = createDragon1CloneState(generation.pet);
assert.deepEqual(raw.skills, []);
assert.equal(raw.critBonusRate, 0);
assert.equal(raw.skillDamageBonus, 0);
assert.equal(raw.autoBuffState, undefined);
assert.equal(raw.magicFlowerBuff, undefined);
assert.equal(raw.moveSpeed, 5);
generation.pet.skills = [];
for (let i = 0; i < 25; i++) generation.step();
const childPassive = generation.events.find(row => row.event.petId === generated.petId
  && row.event.behaviorEvent?.type === 'dragon1-passive')!;
assert.ok(childPassive, 'clone must execute its own level passive');
const generationTick = generation.events.find(row => row.event.behaviorEvent?.type === 'dragon1-clone-spawned')!.tick;
assert.equal(childPassive.tick - generationTick, 25);
generation.runtime.destroy();
assert.equal(generation.runtime.snapshot().summons!.length, 0);
assert.equal(generation.events.some(row => row.event.behaviorEvent?.type === 'dragon1-expiry-heal'), false);

for (const mode of ['zero', 'dodge', 'protected'] as const) {
  const s = setup(24);
  s.pet.atk = 3; // int(3*2.8)=8 equals Monster2's defense.
  if (mode !== 'zero') s.enemy.sourceHitProtection = { protected: mode === 'protected', dodgeProbability: mode === 'dodge' ? 1 : 0 };
  for (let tick = 0; tick < 44; tick++) s.step();
  assert.equal(s.enemy.hp, 1_000_000);
  assert.equal(s.pet.hp, mode === 'zero' ? 520 : 500);
  assert.equal(s.combat.audit.damageEvents.length, mode === 'zero' ? 1 : 0);
  traces.push({ case: mode, events: s.events, damage: s.combat.audit.damageEvents });
}

for (const gxp of [false, true]) {
  const s = setup(24);
  const key = s.runtime.snapshot().runtime!.runtimeKey;
  s.pet.skills = ['gxp']; // A learned string alone is not a transient transformation.
  const snapshot = s.step({ damageEvents: [{ runtimeKey: key, amount: 1 }],
    gxpRuntimeKeys: gxp ? [key] : [] });
  assert.equal(snapshot.animation!.action === 'hurt', !gxp);
  s.runtime.destroy();
}

const lastFrame = setup(24);
while (!lastFrame.events.some(row => row.event.behaviorEvent?.type === 'dragon1-normal-emitted')) lastFrame.step();
lastFrame.enemy.x = lastFrame.frame.targets[0]!.x = 2000;
for (let tick = 0; tick < 10; tick++) lastFrame.step();
assert.equal(lastFrame.combat.audit.damageEvents.length, 0);
lastFrame.enemy.x = lastFrame.frame.targets[0]!.x = 300;
lastFrame.step();
assert.equal(lastFrame.combat.audit.damageEvents.length, 1, 'final-frame collision must run before removal');
assert.ok(lastFrame.combat.audit.damageEvents[0]!.attackId.endsWith(':1'), 'eleventh check renews attack ID');
assert.equal(lastFrame.events.find(row => row.event.behaviorEvent?.type === 'dragon1-hit-heal')!
  .event.behaviorEvent.payload.frame, 11);

// Subframes and long render frames must advance the same source host ticks.
const regular = setup(24);
const long = setup(24);
for (let tick = 0; tick < 44; tick++) regular.step();
long.step({ deltaMs: 44 * 1000 / 24 });
assert.equal(long.pet.hp, regular.pet.hp);
assert.equal(long.enemy.hp, regular.enemy.hp);
assert.deepEqual(long.runtime.snapshot().animation, regular.runtime.snapshot().animation);

// Execute the production P1/P2 forwarding closure with real dragon runtimes,
// shared projectile storage, real enemy models and the production combat port.
const bridge = readFileSync('src/scenes/HeroPartyRuntimeBridge.ts', 'utf8').replaceAll('\r\n', '\n');
const start = bridge.indexOf('  function updatePets(frame:');
const end = bridge.indexOf('\n}\n\nfunction syncFallbackFeedback', start);
assert.ok(start > 0 && end > start);
const ts = createRequire(import.meta.url)('typescript') as typeof import('typescript');
const closure = ts.transpileModule(bridge.slice(start, end), {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText;
const party = [setup(24, [], () => 0.5, 'p1'), setup(24, [], () => 0.5, 'p2')];
const sharedCombat = createStage1CombatRuntime();
const sharedProjectiles = createProjectileSystem();
const snapshots: Record<string, ReturnType<PetCombatRuntime['snapshot']>> = {};
const updateParty = new Function('model', 'petRosters', 'petCombatRuntimes', 'petCombatSnapshots',
  'pendingPetDamageEvents', 'pendingPetAnimationEvents', 'scene', 'petProjectileCombat', 'petDragonPresentation', 'isPetDragonQaEnabled',
  `${closure}\nreturn updatePets;`)(
  { combat: sharedCombat, members: party.map((p, index) => ({ movement: p.frame.owner,
    combat: { slot: index === 0 ? 'p1' : 'p2', combat: { state: 'ready' } } })) },
  { p1: party[0]!.roster, p2: party[1]!.roster },
  { p1: party[0]!.runtime, p2: party[1]!.runtime }, snapshots,
  { p1: [], p2: [] }, { p1: [], p2: [] }, { game: { loop: { targetFps: 24 } } },
  (input: Omit<Parameters<typeof createPetProjectileCombatPort>[0], 'mask'>) =>
    createPetProjectileCombatPort({ ...input, mask: () => mask }),
  { update() {} },
  () => false,
) as (frame: unknown) => void;
for (let tick = 1; tick <= 44; tick++) {
  updateProjectiles(sharedProjectiles, party.map(p => ({ id: p.pet.id, state: 'ready' as const })), 1000 / 24);
  updateParty({ targets: party[0]!.frame.targets, combatEnemies: [party[0]!.enemy],
    projectiles: sharedProjectiles, timeMs: tick * 1000 / 24, deltaMs: 1000 / 24,
    random: () => 0.5, groundEnvironmentFor: () => party[0]!.frame.groundEnvironment });
}
assert.equal(sharedCombat.audit.damageEvents.length, 2);
assert.deepEqual(sharedCombat.audit.damageEvents.map(event => event.sourceId).sort(), ['p1-dragon', 'p2-dragon']);
assert.equal(party[0]!.enemy.hp, 1_000_000 - 194);
assert.equal(party[0]!.enemy.lastHitBy, 'p2');
assert.deepEqual(party.map(p => p.pet.hp), [538, 538]);
assert.notEqual(snapshots.p1!.runtime!.runtimeKey, snapshots.p2!.runtime!.runtimeKey);
traces.push({ case: 'production-updatePets-shared-p1-p2', damage: sharedCombat.audit.damageEvents,
  hp: party.map(p => p.pet.hp), snapshots });
party.forEach(p => p.runtime.destroy());

traces.push({ case: 'generation-time-stats-passive', events: generation.events });
traces.push({ case: 'last-frame-contact', events: lastFrame.events, damage: lastFrame.combat.audit.damageEvents });
mkdirSync('docs/tasks/evidence/TASK-SLICE-214C4', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SLICE-214C4/runtime-traces.json', JSON.stringify({
  status: 'verified-c4-runtime-scope',
  scope: ['normal-20-24-30fps', 'fs-p1-p2', 'expiry', 'early-death', 'generation-stats-passive',
    'zero-dodge-protection', 'gxp-hurt', 'last-frame-contact', 'render-host-clock', 'production-updatePets-p1-p2'],
  excludes: ['C5-visuals', 'TestScene-enemy-adapter', 'full-scene-lifecycle', 'P1GC'], traces,
}, null, 2) + '\n');
console.log('Dragon1 real Runtime: normal, private clone damage, expiry and early death passed.');
