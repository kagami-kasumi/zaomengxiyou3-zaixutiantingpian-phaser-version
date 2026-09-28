import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createDefaultPetBehaviorRegistry } from '../src/systems/pet-behaviors/createDefaultPetBehaviorRegistry';
import { PetTurtleAssets } from '../src/assets/PetTurtleAssets';
import { createMonster30, updateMonster30 } from '../src/systems/Monster30System';
import { adaptTestScenePetEnemies } from '../src/scenes/test-scene/TestScenePetEnemyAdapter';
import { createStage1CombatRuntime, resolveStage1EnemyPetAttack } from '../src/systems/Stage1CombatSystem';
import { monster30PetTargetProfile } from '../src/systems/Monster30CollisionSystem';
import { applyMonster30LegacyPetDamage } from '../src/systems/Monster30LegacyPetDamage';
import { createHitRegistry } from '../src/systems/CombatSystem';

const assets = await PetTurtleAssets.decode(p => new Uint8Array(readFileSync(`public${p}`)));
const registry = createDefaultPetBehaviorRegistry(() => assets);
let hits = 0, misses = 0, cases = 0;
for (const slot of ['p1', 'p2'] as const) for (const fps of [20, 24, 30]) {
  for (const seed of createSeedPetRoster().pets) {
    const pet = { ...structuredClone(seed), id: `${slot}-${seed.id}`, isActive: true, hp: 1000, maxHp: 1000,
      def: 2, lifetime: 1000, skills: [] };
    const profile = monster30PetTargetProfile(pet.species, pet.form);
    assert(profile.startsWith('pet-'));
    const roster = { pets: [pet], selectedIndex: 0, message: '' };
    const runtime = new PetCombatRuntime(registry);
    // Fixed source/owner layout. Pet coordinates are produced by its real
    // constructor/ground owner, never overwritten to force collision.
    const frame = { roster, owner: { x: 280, y: 200, facingX: -1 as const }, targets: [],
      random: () => 0.99, deltaMs: 1000 / fps, hostFps: fps,
      groundEnvironment: { ownerRootOffsetY: -50, walls: [{ id: 'floor', left: -1000, right: 2000,
        top: 250.1, bottom: 280, usesWallTolerance: true }] } };
    const supported = runtime.supports(pet);
    if (supported) for (let tick = 0; tick < fps * 4; tick++) runtime.update(frame);
    const legacy = { petId: pet.id, runtimeKey: `${slot}:${pet.id}`, x: 280, y: 200,
      facingX: -1 as const, state: 'follow' as const };
    const monster = createMonster30(300, 200); monster.state = 'hit1'; monster.stateTimerMs = 10000; monster.attackSerial = 1;
    updateMonster30(monster, [], 1000 / fps, () => 1, fps);
    monster.hp = 0; monster.state = 'dead'; monster.activeAttack = undefined;
    const combat = createStage1CombatRuntime(), legacyHits = createHitRegistry();
    let accepted = 0;
    for (let tick = 0; tick < 10; tick++) {
      updateMonster30(monster, [], 1000 / fps, () => 1, fps);
      if (supported) {
        const snapshot = runtime.snapshot(), root = snapshot.runtime!;
        const params = { runtime: combat, enemy: adaptTestScenePetEnemies([monster], () => {})[0]!, timeMs: tick * 1000 / fps,
          target: { runtimeKey: root.runtimeKey, x: root.x, y: root.y, collisionProfile: profile,
            hp: pet.hp, defense: pet.def, protectedFromHits: snapshot.protectedFromHits } };
        const event = resolveStage1EnemyPetAttack(params);
        if (event) {
          accepted++; const animation = runtime.snapshot().animation;
          runtime.applyDamageEvents([event], params.timeMs);
          assert.equal(pet.hp, 987, 'actual roster HP changes in the bullet phase');
          const afterAnimation = runtime.snapshot().animation;
          assert.equal(afterAnimation?.elapsedTicks, afterAnimation?.action === animation?.action ? animation?.elapsedTicks : 0, 'damage selects hurt without a body step');
          assert.deepEqual([runtime.snapshot().runtime!.x, runtime.snapshot().runtime!.y], [root.x, root.y]);
          assert.equal(resolveStage1EnemyPetAttack(params), undefined);
        }
      } else {
        const before = pet.hp;
        applyMonster30LegacyPetDamage(monster, pet, legacy, legacyHits, tick * 1000 / fps);
        if (pet.hp < before) accepted++;
      }
    }
    assert(accepted <= 1, 'independent attack deduplicates the same actual pet');
    assert.equal(pet.hp, accepted ? 987 : 1000);
    if (accepted) hits++; else misses++;
    cases++; runtime.destroy();
  }
}
assert.equal(cases, 210); assert.equal(hits,210); assert.equal(misses,0);
mkdirSync('docs/tasks/evidence/TASK-SLICE-240',{recursive:true});
writeFileSync('docs/tasks/evidence/TASK-SLICE-240/pet-hp.json',JSON.stringify({status:'passed',cases,hits,misses,forms:35,owners:['p1','p2'],fps:[20,24,30],formalForms:16,legacyForms:19},null,2));
console.log(`Monster30 actual pet HP: ${cases} 35-form/P1/P2/FPS fixtures; ${hits} hits, ${misses} honest misses/protected. Full family behavior not claimed.`);
