import assert from 'node:assert/strict';

import { heroPartyMonster2Targets } from '../src/scenes/HeroPartyMonster2Reception';
import { createHeroPartyGatherControl } from '../src/systems/HeroGatherCoordinateSystem';
import { createHeroPartyRuntimeModel, destroyHeroPartyRuntime } from '../src/systems/HeroPartyRuntimeSystem';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createStage1CombatEnemy, createStage1CombatRuntime, resolveStage1HeroHit } from '../src/systems/Stage1CombatSystem';
import { destroyMonster2Attacks, type Monster2Attack } from '../src/systems/Monster2AttackRuntime';
import { updateMonster2CombatWorld } from '../src/systems/Monster2CombatWorld';

for (const fps of [20, 24, 30]) for (const owner of ['p1', 'p2', 'both'] as const) {
  const ownerSlots = owner === 'both' ? ['p1', 'p2'] : [owner];
  const party = createHeroPartyRuntimeModel([
    { slot: 'p1', heroId: 1, x: 400, y: 250, width: 40 },
    { slot: 'p2', heroId: 1, x: 440, y: 250, width: 40 },
  ].filter(member => ownerSlots.includes(member.slot)) as Parameters<typeof createHeroPartyRuntimeModel>[0]);
  for (const member of party.members) {
    member.combat.combat.hp = member.combat.combat.maxHp = 10000;
    member.combat.effectiveStats.defense = 0;
    member.combat.effectiveStats.missPercent = 0;
  }
  const pets = { p1: new PetCombatRuntime(), p2: new PetCombatRuntime() };
  const gather = createHeroPartyGatherControl(party);
  const enemy = createStage1CombatEnemy({ id: `monster2-${owner}`, enemyType: 2, x: 200, y: 200 });
  const heroes = () => party.members.filter(member => ownerSlots.includes(member.combat.slot)).map(member => ({
    kind: 'hero' as const,
    ownerSlot: member.combat.slot,
    runtimeId: member.combat.slot,
    position: () => ({ x: member.movement.x, y: member.movement.y - 50 }),
    isDead: () => member.combat.combat.hp <= 0,
    isReadyToDestroy: () => false,
    addExperience: () => undefined,
  }));
  enemy.experienceBinding = { settled: false, experience: 7, persist() {}, heroes };
  const seen = new Set<Monster2Attack>();
  const actions = new Set<number>();
  const rawSpawns: unknown[] = [];
  const gatherPoints: { x: number; y: number }[] = [];

  for (let tick = 1; tick <= fps * 8; tick++) {
    // This test intentionally has no hero input/environment physics. Gather
    // owns the requested root tween; the full scene supplies movement physics.
    gather.advance(tick / fps);
    updateMonster2CombatWorld(enemy, {
      parentId: 'stage12', timeMs: tick * 1000 / fps, deltaMs: 1000 / fps,
      hostFps: fps, difficulty: 0, boss: false, flower: false, random: () => 0.2,
      targets: attack => heroPartyMonster2Targets(party, pets, () => undefined, () => false, attack),
      emitRaw: spawn => rawSpawns.push(spawn),
      gather: point => { gatherPoints.push({ x: point.x, y: point.y }); gather.request(point); },
    });
    for (const attack of enemy.monster2AttackRuntime!.attacks) {
      if (!seen.has(attack)) {
        seen.add(attack);
        actions.add(attack.attack);
      }
    }
    assert.equal(enemy.activeAttack, undefined, `${fps}/${owner} legacy activeAttack producer`);
  }

  assert(actions.has(1), `${fps}/${owner} natural hit1 attack`);
  assert(actions.has(2), `${fps}/${owner} natural second hit1 bullet`);
  assert(rawSpawns.length > 0, `${fps}/${owner} naked raw attack`);
  assert(gatherPoints.length > 0, `${fps}/${owner} gather request`);
  assert(party.members.every(member => member.combat.combat.hp < 10000), `${fps}/${owner} real hero HP reduction`);

  // Run the retention boundary on a fresh combat model so the eight-second
  // natural sample can finish without forcing an action or serial.
  destroyMonster2Attacks(enemy.monster2AttackRuntime!);
  assert([...seen].every(attack => attack.source === undefined && attack.parentId === undefined));
  const boundary = createStage1CombatEnemy({ id: `monster2-boundary-${owner}`, enemyType: 2, x: 200, y: 200 });
  boundary.experienceBinding = { ...enemy.experienceBinding, target: undefined };
  let boundaryAttack: Monster2Attack | undefined;
  for (let tick = 1; tick <= fps * 3 && !boundaryAttack; tick++) {
    updateMonster2CombatWorld(boundary, {
      parentId: 'stage12', timeMs: tick * 1000 / fps, deltaMs: 1000 / fps,
      hostFps: fps, difficulty: 0, boss: false, flower: false, random: () => 0.2,
      targets: attack => heroPartyMonster2Targets(party, pets, () => undefined, () => false, attack),
      emitRaw: () => undefined, gather: () => undefined,
    });
    boundaryAttack = boundary.monster2AttackRuntime!.attacks.find(attack => attack.parentId !== undefined);
  }
  assert(boundaryAttack, `${fps}/${owner} live attack for hurt boundary`);
  const beforeAge = boundaryAttack.age;
  const beforeSource = boundaryAttack.source;
  const beforeParent = boundaryAttack.parentId;
  assert(resolveStage1HeroHit({ runtime: createStage1CombatRuntime(), enemy: boundary,
    sourceId: 'p1', attackId: 'hurt-boundary', actionName: 'hit1', attackKind: 'physical',
    damage: 1, knockbackX: 0, knockbackY: 0, timeMs: fps * 8000 / fps }));
  assert.equal(boundary.phase, 'hurt', `${fps}/${owner} hurt phase`);
  updateMonster2CombatWorld(boundary, {
    parentId: 'stage12', timeMs: 8001, deltaMs: 1000 / fps, hostFps: fps,
    difficulty: 0, boss: false, flower: false, random: () => 0.2,
    targets: attack => attack === boundaryAttack ? [] : heroPartyMonster2Targets(party, pets, () => undefined, () => false, attack),
    emitRaw: () => undefined, gather: () => undefined,
  });
  assert.equal(boundaryAttack.age, beforeAge + 1, `${fps}/${owner} hurt retains bullet`);
  assert.equal(boundaryAttack.source, beforeSource, `${fps}/${owner} hurt retains source`);
  assert.equal(boundaryAttack.parentId, beforeParent, `${fps}/${owner} hurt retains parent`);

  const ageAfterHurt = boundaryAttack.age;
  boundary.hp = 0; boundary.phase = 'dead';
  updateMonster2CombatWorld(boundary, {
    parentId: 'stage12', timeMs: 8050, deltaMs: 1000 / fps, hostFps: fps,
    difficulty: 0, boss: false, flower: false, random: () => 0.2,
    targets: attack => attack === boundaryAttack ? [] : heroPartyMonster2Targets(party, pets, () => undefined, () => false, attack),
    emitRaw: () => undefined, gather: () => undefined,
  });
  assert.equal(boundaryAttack.age, ageAfterHurt + 1, `${fps}/${owner} death retains bullet`);
  destroyMonster2Attacks(boundary.monster2AttackRuntime!);
  assert.equal(boundaryAttack.source, undefined, `${fps}/${owner} destroy releases source`);
  assert.equal(boundaryAttack.parentId, undefined, `${fps}/${owner} destroy releases parent`);
  // Source dead-body completion (17 host steps) can precede attack2's final
  // detection. Do not delay Monster2.destroy until that longer bullet expires.
  const late = createStage1CombatEnemy({ id: `monster2-late-${owner}`, enemyType: 2, x: 200, y: 200 });
  late.experienceBinding = { ...enemy.experienceBinding, target: undefined };
  let lateTick = 0;
  const stepLate = () => updateMonster2CombatWorld(late, {
    parentId: 'stage12', timeMs: ++lateTick * 1000 / fps, deltaMs: 1000 / fps,
    hostFps: fps, difficulty: 0, boss: false, flower: false, random: () => 0.2,
    targets: () => [], emitRaw: () => undefined, gather: () => undefined,
  });
  let second: Monster2Attack | undefined;
  while (lateTick < fps * 10 && !second) {
    stepLate(); second = late.monster2AttackRuntime!.attacks.find(attack => attack.attack === 2);
  }
  assert(second?.source, 'naturally emitted second bullet must be alive before source death');
  resolveStage1HeroHit({ runtime: createStage1CombatRuntime(), enemy: late,
    sourceId: 'p1', attackId: 'late-death', actionName: 'hit1', attackKind: 'physical',
    damage: late.hp + 1000, knockbackX: 0, knockbackY: 0, timeMs: lateTick * 1000 / fps });
  for (let deadTick = 1; deadTick <= 17; deadTick++) {
    stepLate();
    assert.equal(late.monster2AttackRuntime!.destroyed, deadTick === 17, 'source dead-body completion');
    assert.equal(!!second.source, deadTick < 17, 'dead body clears still-live second bullet only on completion');
  }
  assert(second.age < 20, 'cleanup was source destruction, not natural bullet expiry');
  assert.equal(second.parentId, undefined);
  pets.p1.destroy(); pets.p2.destroy(); gather.destroy(); destroyHeroPartyRuntime(party);
}

console.log('Monster2 combat world: natural hit1/hit2, raw/gather, party HP, hurt/death retention and explicit destroy at 20/24/30fps.');
