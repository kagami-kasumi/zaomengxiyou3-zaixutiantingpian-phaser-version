import assert from 'node:assert/strict';
import { createMonster30, updateMonster30, Monster30Tuning } from '../src/systems/Monster30System';
import { adaptTestScenePetEnemies } from '../src/scenes/test-scene/TestScenePetEnemyAdapter';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import type { ProjectileModel } from '../src/systems/ProjectileTypes';

let cases = 0;
for (const fps of [20, 24, 30]) for (const parts of [1, 4]) for (const ownerSlot of ['p1', 'p2'] as const) {
  const monster = createMonster30(300, 200); monster.hp = monster.maxHp = 10000;
  const owners: string[] = [];
  const adapter = () => adaptTestScenePetEnemies([monster], (_monster, slot) => owners.push(slot))[0]!;
  const step = () => {
    for (let part = 0; part < parts; part++) updateMonster30(monster, [], 1000 / fps / parts, () => 0.99, fps);
  };
  for (let tick = 0; tick < 7; tick++) step();
  const first = adapter();
  const port = createPetProjectileCombatPort({ enemies: [first], combat: createStage1CombatRuntime(), ownerSlot,
    timeMs: 0, random: () => 0.75, mask: () => { throw new Error('Controlled collision boundary'); } });
  const bullet = { projectileId: 'fire', sourceAttackId: 'fire-action', sourceId: 'monkey', hitSerial: 0,
    actionName: 'hit2', attackKind: 'physics', knockbackX: 0, knockbackY: 0,
    petTargetEffects: [{ name: 'petmonkey_fire', time: fps * 3.6, hurt: 25.5 }] } as ProjectileModel;
  assert.equal(port.hit(bullet, first.id, { hurt: 40, attack: 40, critical: false }), true);
  assert.equal(first.petTargetEffectState, monster.petTargetEffectState);
  assert.equal(adapter().petTargetEffectState, first.petTargetEffectState, 'fresh wrappers retain victim effects');
  const hp = monster.hp;
  for (let count = 7; count < fps; count++) { adapter(); step(); }
  assert.equal(monster.hp, hp);
  monster.state = 'hit1'; monster.stateTimerMs = 10000;
  const ownerNotifications = owners.length;
  step();
  assert.equal(monster.hp, hp - 25);
  assert.equal(monster.state, 'hit1', 'fire must not call the normal adapter hurt setter');
  assert.ok(monster.stateTimerMs < 10000 && monster.stateTimerMs > 9000);
  assert.equal(owners.length, ownerNotifications, 'periodic ticks do not publish a new direct attacker');
  monster.hp = 20;
  for (let tick = 0; tick < fps; tick++) step();
  assert.equal(monster.hp, 0); assert.equal(monster.state, 'dead');
  assert.ok(monster.stateTimerMs <= Monster30Tuning.deadDurationMs && monster.stateTimerMs > 0);
  assert.equal(owners.length, ownerNotifications);
  const iced = createMonster30(300, 200);
  const iceEnemy = adaptTestScenePetEnemies([iced], () => {})[0]!;
  const icePort = createPetProjectileCombatPort({ enemies: [iceEnemy], combat: createStage1CombatRuntime(), ownerSlot,
    timeMs: 0, random: () => 0.75, mask: port.mask });
  assert.equal(icePort.hit({ ...bullet, petTargetEffects: [{ name: 'pethorse_ice', time: 2 }] }, iceEnemy.id,
    { hurt: 40, attack: 40, critical: false }), true);
  for (let tick = 0; tick < 2; tick++) {
    for (let part = 0; part < parts; part++) updateMonster30(iced, [], 1000 / fps / parts, () => 0.99, fps);
    assert.ok(iced.petTargetEffectState!.effects.snapshot('pethorse_ice'));
    assert.equal(adaptTestScenePetEnemies([iced], () => {})[0]!.petTargetEffectState, iced.petTargetEffectState);
  }
  for (let part = 0; part < parts; part++) updateMonster30(iced, [], 1000 / fps / parts, () => 0.99, fps);
  assert.equal(iced.petTargetEffectState!.effects.snapshot('pethorse_ice'), undefined);
  assert.equal(iced.petTargetEffectState!.iceVisible, false);
  cases++;
}
console.log(`TestScene target effects: ${cases} actual adapter/Monster30 persistence, phase, non-hurt fire and death cases passed; XP routing/canvas excluded.`);
