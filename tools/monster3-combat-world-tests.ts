import assert from 'node:assert/strict';
import { updateMonster3CombatWorld } from '../src/systems/Monster3CombatWorld';
import { createStage1CombatEnemy, createStage1CombatRuntime, resolveStage1HeroHit } from '../src/systems/Stage1CombatSystem';
import { createHeroPartyRuntimeModel, destroyHeroPartyRuntime } from '../src/systems/HeroPartyRuntimeSystem';
import { heroPartyMonster3Targets } from '../src/scenes/HeroPartyMonster3Reception';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { destroyMonster3Attacks, type Monster3Attack } from '../src/systems/Monster3AttackRuntime';
import { applyMonster3Hit, createMonster3 } from '../src/systems/Monster3System';
import { adaptMonster3BossCombat } from '../src/systems/Monster3BossCombatAdapter';
import { addMonsterPetTargetEffects } from '../src/systems/MonsterPetTargetEffectSystem';

for (const fps of [20, 24, 30]) for (const boss of [false, true]) {
  const party = createHeroPartyRuntimeModel(['p1', 'p2'].map(slot => ({
    slot: slot as 'p1' | 'p2', heroId: 1, x: 300, y: 200, width: 40,
  })));
  for (const member of party.members) {
    member.combat.combat.hp = member.combat.combat.maxHp = 10000;
    member.combat.effectiveStats.defense = 0;
    member.combat.effectiveStats.missPercent = 0;
  }
  const pets = { p1: new PetCombatRuntime(), p2: new PetCombatRuntime() };
  const bossModel = boss ? createMonster3(200, 200) : undefined;
  const enemy = bossModel ? adaptMonster3BossCombat(bossModel)
    : createStage1CombatEnemy({ id: 'natural', enemyType: 3, x: 200, y: 200 });
  enemy.experienceBinding = { settled: false, experience: 7, persist() {},
    heroes: () => party.members.map(member => ({ kind: 'hero', ownerSlot: member.combat.slot,
      runtimeId: member.combat.slot, position: () => member.movement,
      isDead: () => member.combat.combat.hp <= 0, isReadyToDestroy: () => false, addExperience() {},
    })),
  };
  const selections = new Map<number, number>();
  const seen = new Set<Monster3Attack>();
  const actions = new Set<string>();
  let oldSerial = 0;
  for (let tick = 1; tick <= fps * 8; tick++) {
    updateMonster3CombatWorld(enemy, { parentId: 'stage13', timeMs: tick * 1000 / fps,
      deltaMs: 1000 / fps, hostFps: fps, difficulty: 0, boss, flower: false,
      random: () => 0.2,
      targets: attack => heroPartyMonster3Targets(party, pets, () => undefined, () => false, attack),
    });
    if (enemy.attackSerial !== oldSerial) selections.set(enemy.attackSerial, tick);
    oldSerial = enemy.attackSerial;
    for (const attack of enemy.monster3AttackRuntime!.attacks) if (!seen.has(attack)) {
      assert.equal(tick - selections.get(Number(attack.id.split(':').at(-1)))!, attack.action === 'hit1' ? 7 : 6);
      seen.add(attack); actions.add(attack.action);
    }
    assert.equal(enemy.activeAttack, undefined, 'old rectangle attack must not be another producer');
  }
  assert.deepEqual([...actions].sort(), ['hit1', 'hit2'], `${fps}fps natural actions`);
  assert(party.members.every(m => m.combat.combat.hp < 10000), 'both real heroes receive attacks');
  assert(party.members.every(m => m.combat.combat.monsterHitIds!.length > 0));
  let tick = fps * 8;
  while (!enemy.monster3AttackRuntime!.attacks.length && tick < fps * 16) {
    tick++;
    updateMonster3CombatWorld(enemy, { parentId: 'stage13', timeMs: tick * 1000 / fps,
      deltaMs: 1000 / fps, hostFps: fps, difficulty: 0, boss, flower: false,
      random: () => 0.2, targets: () => [] });
  }
  const retained = enemy.monster3AttackRuntime!.attacks[0];
  assert(retained, 'natural live attack available for death boundary');
  const beforeHurt = retained.age;
  const retainedSource = retained.source;
  const retainedParent = retained.parentId;
  const hpBeforeHurt = enemy.hp;
  if (bossModel) assert(applyMonster3Hit(bossModel, 1));
  else assert(resolveStage1HeroHit({ runtime: createStage1CombatRuntime(), enemy,
    sourceId: 'p1', attackId: 'default-hurt', actionName: 'hit1', attackKind: 'physical',
    damage: 1, knockbackX: 0, knockbackY: 0, timeMs: tick * 1000 / fps }));
  assert(enemy.hp < hpBeforeHurt && enemy.hp > 0);
  assert.equal(enemy.phase, 'hurt');
  let detectedAfterHurt = false;
  updateMonster3CombatWorld(enemy, { parentId: 'stage13', timeMs: ++tick * 1000 / fps,
    deltaMs: 1000 / fps, hostFps: fps, difficulty: 0, boss, flower: false,
    targets: attack => { if (attack === retained) detectedAfterHurt = true; return []; } });
  assert(detectedAfterHurt, 'default hurt must not suppress existing bullet reception');
  assert.equal(retained.age, beforeHurt + 1);
  assert.equal(retained.source, retainedSource);
  assert.equal(retained.parentId, retainedParent);
  assert.equal(enemy.monster3AttackRuntime!.body.action, 'hurt');
  const age = retained.age;
  enemy.hp = 0; enemy.phase = 'dead';
  let detectedAfterDeath = false;
  updateMonster3CombatWorld(enemy, { parentId: 'stage13', timeMs: ++tick * 1000 / fps,
    deltaMs: 1000 / fps, hostFps: fps, difficulty: 0, boss, flower: false,
    targets: attack => { if (attack === retained) detectedAfterDeath = true; return []; } });
  assert(detectedAfterDeath, 'source death must not suppress existing bullet reception');
  assert.equal(retained.age, age + 1);
  destroyMonster3Attacks(enemy.monster3AttackRuntime!);
  assert.equal(retained.source, undefined); assert.equal(retained.parentId, undefined);
  assert([...seen].every(a => !a.source && !a.parentId));
  const lethal = boss ? adaptMonster3BossCombat(createMonster3(200, 200))
    : createStage1CombatEnemy({ id: 'fire-boundary', enemyType: 3, x: 200, y: 200 });
  lethal.experienceBinding = { ...enemy.experienceBinding, settled: false };
  addMonsterPetTargetEffects(lethal, [{ name: 'petmonkey_fire', time: fps + 1, hurt: lethal.maxHp }]);
  updateMonster3CombatWorld(lethal, { parentId: 'world', timeMs: 1000 / fps,
    deltaMs: 1000 / fps, hostFps: fps, difficulty: 0, boss, flower: false,
    random: () => { throw new Error('Lethal first effect must prevent AI random consumption'); }, targets: () => [],
  });
  assert.equal(lethal.hp, 0, 'effect writes the actual model HP');
  assert.equal(lethal.phase, 'dead');
  assert.equal(lethal.monster3AttackRuntime!.body.action, 'dead');
  assert.equal(lethal.attackSerial, 0);
  destroyMonster3Attacks(lethal.monster3AttackRuntime!);
  pets.p1.destroy(); pets.p2.destroy(); destroyHeroPartyRuntime(party);
}
console.log('Monster3 Stage1-model world: natural hit1/hit2 birth timing and real P1/P2 HP at 20/24/30fps; old timed attack absent and refs released.');
