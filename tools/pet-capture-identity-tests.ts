import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createPlayerPetRosters } from '../src/systems/PetOwnershipSystem';
import { releaseSelectedPet, setSelectedPetActive } from '../src/systems/PetRosterSystem';
import { createMagicBottleCaptureModel, requestMagicBottleCapture, resolveMagicBottleCaptureHit } from '../src/systems/PetMagicBottleSystem';
import { CapturablePetDefinitions } from '../src/systems/PetTuning';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { createIncomingDamageFeedbackModel } from '../src/systems/IncomingDamageFeedbackSystem';
import { createDefaultGameSave, createSaveSlot, loadActiveGame } from '../src/systems/SaveSlotSystem';
import { createPartyConfiguration } from '../src/systems/PartyConfigurationSystem';
import { encodePet, restoreGameState, parseGameSave, serializeGameSave } from '../src/systems/SaveSystem';
import { createFormalPetPage, deployFormalPet, getFormalPetPlayer, releaseFormalPet } from '../src/systems/FormalPetPageSystem';
import { FormalPetsUpdatedEvent, syncFormalPetRuntime } from '../src/scenes/feature-ui/FormalPetRuntimeBridge';
import type { PetRoster } from '../src/systems/PetTypes';
import { noTargetBodyFixturePort } from './pet226-body/body-fixture-collision';
import { bodyGroundFixture } from './pet226-body/ground-fixture';
import { petExperienceClosureFixture } from './pet-experience-closure-fixture';

const slots = ['p1', 'p2'] as const;
const ts = createRequire(import.meta.url)('typescript');
const owner = { x: 300, y: 350, facingX: 1 as const };
const ground = bodyGroundFixture('monkey', 1, owner.y - 100);
const results: string[] = [];
function capture(roster: PetRoster, family: 'monkey' | 'horse' = 'monkey') {
  const definition = Object.values(CapturablePetDefinitions).find(d => d.species === family && d.form === 1)!;
  const model = createMagicBottleCaptureModel();
  assert.ok(requestMagicBottleCapture({ model, owner, inputMagicWeapon: true, previousInputMagicWeapon: false }));
  const effect = model.effect!;
  const target = { monsterId: definition.monsterId, x: effect.x, y: effect.y, width: 30, height: 30, level: 1, removed: false };
  assert.equal(resolveMagicBottleCaptureHit({ model, roster, targets: [target], random: () => 0 }), target);
  assert.equal(target.removed, true);
  const pet = roster.pets.at(-1)!;
  assert.ok(setSelectedPetActive(roster));
  pet.skills = []; pet.moveSpeed = 0;
  return pet;
}

// Exercise the original counterexample without feedback metadata as well as the
// current source-stamped route. No fixture prefixes or projectile fabrication.
for (const family of ['monkey', 'horse'] as const)
for (const stamped of [false, true]) for (const releasedSlot of slots) {
  const rosters = createPlayerPetRosters();
  const pets = slots.map(slot => capture(rosters[slot], family));
  const ground = bodyGroundFixture(family, 1, owner.y - 100);
  assert.notEqual(pets[0].id, pets[1].id);
  const runtimes = { p1: new PetCombatRuntime(), p2: new PetCombatRuntime() };
  const projectiles = createProjectileSystem();
  const feedback = createIncomingDamageFeedbackModel();
  const step = (targets: any[] = []) => slots.forEach(slot => runtimes[slot].update({
    roster: rosters[slot], owner, projectiles, targets, deltaMs: targets.length ? 1000 / 24 : 0,
    hostFps: 24, random: () => 0.1, projectileCombat: noTargetBodyFixturePort,
    groundEnvironment: ground,
    incomingFeedback: stamped ? { model: feedback, ownerSlot: slot, timeMs: 0 } : undefined,
  }));
  step();
  const origin = runtimes.p1.snapshot().runtime!;
  const targets = [{ id: 'target', x: origin.x + 40, y: origin.y, isAlive: true }];
  for (let tick = 0; tick < 100 && projectiles.projectiles.length < 2; tick++) step(targets);
  assert.equal(projectiles.projectiles.length, 2);
  const other = releasedSlot === 'p1' ? 'p2' : 'p1';
  const survivor = projectiles.projectiles.find(p => p.sourceId === rosters[other].pets.at(-1)!.id)!;
  const identity = runtimes[other].snapshot().runtime!.runtimeKey;
  if (stamped) {
    assert.equal(survivor.experienceSource?.ownerSlot, other);
    assert.equal(survivor.experienceSource?.runtimeId, identity);
  }
  runtimes[releasedSlot].destroy();
  assert.deepEqual(projectiles.projectiles, [survivor]);
  step(targets);
  assert.equal(runtimes[other].snapshot().runtime!.runtimeKey, identity);
  assert.equal(runtimes[other].snapshot().destroyed, false);
  runtimes[other].destroy();
  assert.equal(projectiles.projectiles.length, 0);
  results.push(`capture-release:${family}:${stamped}:${releasedSlot}`);
}

// Release a middle record, recapture at the same roster length, and release the
// last record repeatedly. Existing records and departed object IDs stay distinct.
for (const slot of slots) {
  const roster = createPlayerPetRosters()[slot];
  const first = capture(roster), second = capture(roster);
  roster.selectedIndex = 1;
  assert.equal(releaseSelectedPet(roster), first);
  const third = capture(roster);
  assert.notEqual(third.id, second.id);
  assert.notEqual(third.id, first.id);
  const runtime = new PetCombatRuntime();
  const frame = { roster, owner, targets: [], projectiles: createProjectileSystem(),
    deltaMs: 0, hostFps: 24, groundEnvironment: ground };
  const oldKey = runtime.update(frame).runtime!.runtimeKey;
  releaseSelectedPet(roster);
  const replacement = capture(roster);
  assert.notEqual(runtime.update(frame).runtime!.runtimeKey, oldKey,
    'release and recapture between world updates creates a new session');
  assert.equal(runtime.currentAttackTarget(slot)!.petId, replacement.id);
  assert.equal(third.id === replacement.id, false);
  runtime.destroy();
  const seen = new Set(roster.pets.map(p => p.id)); seen.add(first.id);
  for (let i = 0; i < 20; i++) {
    releaseSelectedPet(roster);
    const next = capture(roster);
    assert.ok(!seen.has(next.id)); seen.add(next.id);
  }
  assert.equal(roster.pets[1], second);
  results.push(`recapture:${slot}`);
}

// Save IDs persist verbatim for new captures; historical unprefixed P2 IDs gain
// exactly one existing decoder prefix. No record or stats are discarded.
const save = createDefaultGameSave();
const captured = createPlayerPetRosters();
for (const slot of slots) capture(captured[slot]);
save.player1.pets = captured.p1.pets.map(encodePet);
save.player2.pets = captured.p2.pets.map(encodePet);
let restored = restoreGameState(save, {});
for (let i = 0; i < 3; i++) {
  for (const [slot, player] of [['p1', 'player1'], ['p2', 'player2']] as const) {
    assert.equal(restored[player].petRoster.ownerSlot, slot);
    assert.deepEqual(restored[player].petRoster.pets.map(p => p.id), captured[slot].pets.map(p => p.id));
    save[player].pets = restored[player].petRoster.pets.map(encodePet);
  }
  restored = restoreGameState(parseGameSave(serializeGameSave(save))!, {});
}
save.player1.pets[1].id = 'pet-monkey1-2';
save.player2.pets[1].id = 'pet-monkey1-2';
restored = restoreGameState(save, {});
assert.equal(restored.player1.petRoster.pets[1].id, 'pet-monkey1-2');
assert.equal(restored.player2.petRoster.pets[1].id, 'p2-pet-monkey1-2');
for (const player of ['player1', 'player2'] as const) {
  assert.equal(restored[player].petRoster.pets.length, save[player].pets.length);
  assert.equal(restored[player].petRoster.pets[1].hp, save[player].pets[1].hp);
  const fresh = capture(restored[player].petRoster);
  assert.ok(!save[player].pets.some(p => p.id === fresh.id));
}
results.push('save-roundtrip-and-legacy');

// Execute the production party's actual event registration and updatePets
// closures. Rendering/readiness are sinks; capture, save, notification,
// Runtime/Session and projectile lifecycle are the real implementations.
const source = readFileSync('src/scenes/HeroPartyRuntimeBridge.ts', 'utf8').replaceAll('\r\n', '\n');
const syncStart = source.indexOf('  const syncPets =');
const syncEnd = source.indexOf('\n\n  const snapshots', syncStart);
const updateStart = source.indexOf('  function updatePets(frame:');
const updateEnd = source.indexOf('\n}\n\nfunction syncFallbackFeedback', updateStart);
assert.ok(syncStart > 0 && syncEnd > syncStart && updateStart > 0 && updateEnd > updateStart);
const production = ts.transpileModule(source.slice(syncStart, syncEnd) + '\n' + source.slice(updateStart, updateEnd),
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const values = new Map<string, string>();
const storage = { getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
assert.ok(createSaveSlot(storage, 0, createDefaultGameSave(undefined, createPartyConfiguration(2, 1, 2)!)));
const scene = { events: new EventEmitter(), game: { loop: { targetFps: 24 } } };
const rosters: Record<string, PetRoster> = {};
const runtimes = { p1: new PetCombatRuntime(), p2: new PetCombatRuntime() };
const snapshots: any = {};
const projectiles = createProjectileSystem();
const combat = createStage1CombatRuntime();
const enemy = createStage1CombatEnemy({ id: 'target', enemyType: 2, x: 0, y: 0 });
enemy.hp = enemy.maxHp = 10000;
enemy.experienceBinding = { settled: false, experience: 100, heroes: () => [], persist() {} };
let settleHits = false;
const dependencies = { ...petExperienceClosureFixture, scene, petRosters: rosters, petCombatRuntimes: runtimes,
  petCombatSnapshots: snapshots, pendingPetDamageEvents: {}, pendingPetAnimationEvents: {},
  model: { combat, incoming: createIncomingDamageFeedbackModel(),
    members: slots.map(slot => ({ movement: owner, combat: { slot, combat: { state: 'ready' } } })) },
  petProjectileCombat: Object.assign((input: any) => settleHits ? createPetProjectileCombatPort({
    ...input, enemies: [enemy], mask: noTargetBodyFixturePort.mask,
    monkeyHorseCollision: noTargetBodyFixturePort.monkeyHorseCollision,
  }) : noTargetBodyFixturePort, { readyRoster: (roster: PetRoster) => roster }),
  petTurtle: { readyRoster: (roster: PetRoster) => roster, update() {} }, petDragonPresentation: { update() {} },
  isPetDragonQaEnabled: () => false, FormalPetsUpdatedEvent, FormalSkillsUpdatedEvent: 'unused-skills', syncSkills() {},
};
const update = new Function('d', `const {${Object.keys(dependencies).join(',')}} = d;\n${production}\nreturn updatePets;`)(dependencies);
for (const slot of slots) {
  const page = createFormalPetPage(storage, slot)!;
  const pet = capture(getFormalPetPlayer(page).petRoster);
  deployFormalPet(page, storage);
  syncFormalPetRuntime(scene as any, page);
  assert.equal(rosters[slot].pets.at(-1), pet);
}
const step = (targets: any[] = []) => update({ targets, projectiles, timeMs: 1000,
  deltaMs: targets.length ? 1000 / 24 : 0, random: () => 0.1, groundEnvironmentFor: () => ground });
step();
const origin = snapshots.p1.runtime;
const targets = [{ id: 'target', x: origin.x + 40, y: origin.y, isAlive: true }];
enemy.x = targets[0].x; enemy.y = targets[0].y;
for (let tick = 0; tick < 100 && projectiles.projectiles.length < 2; tick++) step(targets);
assert.equal(projectiles.projectiles.length, 2);
const p2 = projectiles.projectiles.find(p => p.experienceSource?.ownerSlot === 'p2')!;
assert.ok(p2);
const p2Runtime = snapshots.p2.runtime.runtimeKey;
// Same-ID reloaded roster notifications keep the active object's session.
const p2Page = createFormalPetPage(storage, 'p2')!;
syncFormalPetRuntime(scene as any, p2Page); step(targets);
assert.equal(snapshots.p2.runtime.runtimeKey, p2Runtime);
assert.equal(p2.experienceSource?.petId, rosters.p2.pets.at(-1)!.id);
const p1Page = createFormalPetPage(storage, 'p1')!;
releaseFormalPet(p1Page, storage); releaseFormalPet(p1Page, storage);
syncFormalPetRuntime(scene as any, p1Page); step(targets);
assert.equal(snapshots.p1.runtime, undefined);
assert.deepEqual(projectiles.projectiles, [p2]);
assert.equal(snapshots.p2.runtime.runtimeKey, p2Runtime);
assert.equal(loadActiveGame(storage)!.player2.pets.at(-1)!.id, p2.sourceId);
settleHits = true;
for (let tick = 0; tick < 24 && enemy.hp === enemy.maxHp; tick++) step(targets);
assert.ok(enemy.hp < enemy.maxHp, 'surviving P2 projectile still deals actual collision damage');
assert.equal(enemy.lastHitBy, 'p2');
assert.equal(enemy.experienceBinding.target, p2.experienceSource);
assert.equal(combat.audit.damageEvents.at(-1)!.sourceId, p2.sourceId);
runtimes.p1.destroy();
runtimes.p2.destroy();
assert.equal(projectiles.projectiles.length, 0);
results.push('formal-save-notify-party-release');

mkdirSync('docs/tasks/evidence/TASK-SLICE-234', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SLICE-234/identity-tests.json', JSON.stringify({ status: 'passed', results }, null, 2));
console.log(`Pet capture identity: ${results.length} groups passed.`);
