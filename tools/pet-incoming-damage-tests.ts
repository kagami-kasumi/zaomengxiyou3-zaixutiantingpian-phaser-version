import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import {
  createStage1CombatEnemy,
  createStage1CombatRuntime,
  resolveStage1EnemyPetAttack,
} from '../src/systems/Stage1CombatSystem';

const roster = createSeedPetRoster();
const pet = roster.pets[0]!;
const runtime = new PetCombatRuntime();
const snapshot = runtime.update({
  roster,
  owner: { x: 200, y: 300, facingX: 1 },
  targets: [],
  deltaMs: 0,
});
const enemy = createStage1CombatEnemy({ id: 'monster', enemyType: 30, x: 200, y: 300 });
enemy.phase = 'active';
enemy.activeAttack = {
  attackId: 'monster-hit1-1',
  actionName: 'hit1',
  attackKind: 'physics',
  damage: 15,
  attackRange: 120,
};
const combat = createStage1CombatRuntime();
const event = resolveStage1EnemyPetAttack({
  runtime: combat,
  enemy,
  target: {
    runtimeKey: snapshot.runtime!.runtimeKey,
    x: snapshot.runtime!.x,
    defense: pet.def,
    hp: pet.hp,
  },
});
assert.ok(event);
const hpBefore = pet.hp;
runtime.update({
  roster,
  owner: { x: 200, y: 300, facingX: 1 },
  targets: [],
  damageEvents: [event],
  deltaMs: 0,
});
assert.equal(pet.hp, hpBefore - event.amount);
assert.ok(runtime.events().some(({ behaviorEvent }) => behaviorEvent?.type === 'damaged'));
assert.equal(resolveStage1EnemyPetAttack({
  runtime: combat,
  enemy,
  target: { runtimeKey: snapshot.runtime!.runtimeKey, x: snapshot.runtime!.x, defense: pet.def, hp: pet.hp },
}), undefined, 'the same attack id must not hit the same pet twice');
assert.equal(resolveStage1EnemyPetAttack({
  runtime: createStage1CombatRuntime(),
  enemy,
  target: { runtimeKey: 'far-pet', x: 1_000, defense: 0, hp: 10 },
}), undefined, 'out-of-range pets must not be hit');

const bridge = readFileSync('src/scenes/HeroPartyRuntimeBridge.ts', 'utf8');
assert.match(bridge, /resolveStage1EnemyPetAttack/u);
assert.match(bridge, /damageEvents:\s*pendingPetDamageEvents\[slot\]/u);

console.log('Pet incoming monster damage, range, dedup, runtime, and formal bridge tests passed.');
