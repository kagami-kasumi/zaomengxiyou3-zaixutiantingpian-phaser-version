import assert from 'node:assert/strict';
import { createStage1CombatRuntime, createStage1CombatEnemy, updateStage1Enemy } from '../src/systems/Stage1CombatSystem';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { createMonsterRuntimeRegistryModel, spawnMonsters, updateMonsterRuntimeRegistry,
  getMonsterCombatTargets } from '../src/systems/MonsterRuntimeRegistrySystem';
import { stepMonsterPetTargetEffects, isMonsterPetIceActive } from '../src/systems/MonsterPetTargetEffectSystem';
import type { ProjectileModel } from '../src/systems/ProjectileTypes';

let cases = 0;
for (const fps of [20, 24, 30]) for (const parts of [1, 4]) for (const ownerSlot of ['p1', 'p2'] as const) {
  const registry = createMonsterRuntimeRegistryModel();
  spawnMonsters(registry, [{ encounterId: 'test', spawnId: 'victim', monsterDefinitionId: 5, x: 300, y: 200 }]);
  const enemy = getMonsterCombatTargets(registry)[0]!;
  enemy.hp = enemy.maxHp = 100000;
  const combat = createStage1CombatRuntime();
  const port = createPetProjectileCombatPort({ enemies: [enemy], combat, ownerSlot, timeMs: 0, random: () => 0.75,
    mask: () => { throw new Error('This test starts at the accepted collision boundary'); } });
  const bullet = { id: 1, projectileId: 'effect-1', sourceId: 'monkey', sourceAttackId: 'source-1', hitSerial: 0,
    actionName: 'hit2', attackKind: 'physics', knockbackX: 0, knockbackY: 0,
    petTargetEffects: [{ name: 'petmonkey_fire', time: fps * 3.6, hurt: 25.5 }] } as ProjectileModel;
  const cache = { hurt: 40, attack: 40, critical: false };
  const step = () => {
    const events = [];
    for (let part = 0; part < parts; part++) events.push(...updateMonsterRuntimeRegistry(registry,
      { targets: [], platforms: [], deltaMs: 1000 / fps / parts, hostFps: fps }));
    return events;
  };
  for (let tick = 0; tick < 7; tick++) step();
  enemy.sourceHitProtection = { protected: true, dodgeProbability: 0 };
  assert.equal(port.hit(bullet, enemy.id, cache), false);
  assert.equal(enemy.petTargetEffectState!.effects.snapshot('petmonkey_fire'), undefined);
  enemy.sourceHitProtection = { protected: false, dodgeProbability: 0 };
  assert.equal(port.hit(bullet, enemy.id, cache), true);
  assert.equal(port.hit(bullet, enemy.id, cache), false);
  const afterDirect = enemy.hp;
  bullet.hitSerial = 100;
  enemy.sourceHitProtection = { protected: false, dodgeProbability: 1 };
  assert.equal(port.hit(bullet, enemy.id, cache), false);
  enemy.sourceHitProtection = { protected: false, dodgeProbability: 0 };
  assert.equal(port.hit(bullet, enemy.id, cache), false, 'a dodged attack ID stays consumed');
  assert.equal(enemy.petTargetEffectState!.effects.snapshot('petmonkey_fire')!.startTime, undefined,
    'rejected and duplicate hits must not refresh the effect');
  for (let count = 7; count < fps; count++) step();
  assert.equal(enemy.hp, afterDirect, 'first fire tick follows victim phase, not first-hit time');
  assert.equal(enemy.petTargetEffectState!.effects.snapshot('petmonkey_fire')!.startTime, 7);
  const auditLength = combat.audit.damageEvents.length;
  enemy.lastHitBy = ownerSlot === 'p1' ? 'p2' : 'p1';
  const lastAttacker = enemy.lastHitBy;
  step();
  assert.equal(enemy.hp, afterDirect - 25, 'reduceHp coerces the retained seed to AS3 int');
  assert.equal(enemy.lastHitBy, lastAttacker);
  assert.equal(combat.audit.damageEvents.length, auditLength, 'periodic HP reduction is not another bullet hit');
  bullet.hitSerial++;
  bullet.petTargetEffects = [{ name: 'petmonkey_fire', time: fps * 3.6, hurt: 999 }];
  assert.equal(port.hit(bullet, enemy.id, cache), true);
  assert.equal(enemy.petTargetEffectState!.effects.snapshot('petmonkey_fire')!.hurt, 25.5);
  enemy.lastHitBy = lastAttacker; enemy.hp = 20;
  let defeats = 0;
  for (let tick = 0; tick < fps; tick++) defeats += step().filter(event => event.type === 'defeated').length;
  assert.equal(enemy.hp, 0); assert.equal(enemy.phase, 'dead'); assert.equal(defeats, 1);
  assert.equal(enemy.lastHitBy, lastAttacker, 'fire death retains the latest direct attacker');

  const iced = createStage1CombatEnemy({ id: 'ice', enemyType: 5, x: 0, y: 0 });
  const icePort = createPetProjectileCombatPort({ enemies: [iced], combat: createStage1CombatRuntime(), ownerSlot,
    timeMs: 0, random: () => 0.75, mask: port.mask });
  const iceBullet = { ...bullet, petTargetEffects: [{ name: 'pethorse_ice' as const, time: 2 }] };
  assert.equal(icePort.hit(iceBullet, iced.id, cache), true);
  assert.equal(isMonsterPetIceActive(iced), true);
  const remaining = iced.phaseRemainingMs;
  updateStage1Enemy({ enemy: iced, targets: [], deltaMs: 1000 });
  assert.equal(iced.phaseRemainingMs, remaining);
  for (let tick = 0; tick < 3; tick++) stepMonsterPetTargetEffects(iced, 1000 / fps, fps);
  assert.equal(isMonsterPetIceActive(iced), false);
  assert.equal(iced.petTargetEffectState!.iceVisible, false);
  cases++;
}
console.log(`Target effects: ${cases} formal port/registry victim-clock, refresh, owner/death and ice-AI cases passed; canvas/TestScene excluded.`);
