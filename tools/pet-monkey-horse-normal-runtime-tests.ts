import { bodyGroundFixture } from './pet226-body/ground-fixture';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { decodeMonkeyHorseCollision, monkeyHorseCollisionAsset } from '../src/assets/PetMonkeyHorseCollisionPackage';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem, updateProjectiles } from '../src/systems/ProjectileSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { resolveFormalPetMonkeyProjectileHits } from '../src/systems/PetMonkeyCombatSystem';
import { resolveFormalPetHorseProjectileHits } from '../src/systems/PetHorseCombatSystem';

const assets = await decodeMonkeyHorseCollision(readFileSync(`public${monkeyHorseCollisionAsset.path}`));
type JointBullet = { birthTick: number; dead: boolean; phaseFrames: number[]; x: number; y: number; a: number };
type JointRow = { id: string; tick: number; phase: string; x: number; y: number; bullets: JointBullet[] };
const joint = new Map<string, JointRow[]>();
for (const [family, task] of [['monkey', 228], ['horse', 229]] as const) for (const fps of [20, 24, 30]) {
  const rows = JSON.parse(readFileSync(`local-resources/regima/task-outputs/TASK-SETTINGS-${task}/joint-air/measurement-${fps}.json`, 'utf8')).rows as JointRow[];
  for (const form of [1, 2, 3, 4]) for (const owner of [1, 2]) joint.set(`${family}/${form}/p${owner}/${fps}`,
    rows.filter(row => row.id === `${form}-hit1-P${owner}--1` && row.phase === 'enter' && row.bullets.length > 0));
}
const oracles = Object.fromEntries(([['monkey', 228], ['horse', 229]] as const).map(([family, task]) => [family,
  JSON.parse(readFileSync(`local-resources/regima/task-outputs/TASK-SLICE-226/formal-target-collision-${task}/measurement.json`, 'utf8')).cases as {
    symbol: string; tick: number; target: string; direction: number; hit: boolean; x: number; y: number;
  }[],
]));
let cases = 0;
for (const family of ['monkey', 'horse'] as const) for (const form of [1, 2, 3, 4])
for (const ownerSlot of ['p1', 'p2'] as const) for (const hostFps of [20, 24, 30]) for (const parts of [1, 4]) {
  const roster = createSeedPetRoster();
  roster.pets.forEach(pet => { pet.isActive = pet.species === family && pet.form === form; });
  const pet = roster.pets.find(pet => pet.isActive)!;
  pet.skills = []; pet.moveSpeed = 0; pet.critBonusRate = 0; pet.atk = 100;
  const runtime = new PetCombatRuntime(), projectiles = createProjectileSystem(), combat = createStage1CombatRuntime();
  const original = joint.get(`${family}/${form}/${ownerSlot}/${hostFps}`)!;
  assert.ok(original.length);
  const owner = { x: 300, y: 350, facingX: 1 as const };
    const groundEnvironment = bodyGroundFixture(family, form as 1 | 2 | 3 | 4, owner.y - 100);
  runtime.update({ roster, owner, groundEnvironment, targets: [], projectiles, deltaMs: 0, hostFps });
  const origin = runtime.snapshot().runtime!;
  const locked = createStage1CombatEnemy({ id: 'locked', enemyType: 2, x: origin.x + 40, y: origin.y });
  const other = createStage1CombatEnemy({ id: 'other', enemyType: 5, x: 10000, y: 10000 });
  locked.hp = other.hp = 10000;
  let rolls = 0, tick = 0;
  const frame = () => {
    const enemies = [locked, other];
    const random = () => { rolls++; return 0.1; };
    const port = createPetProjectileCombatPort({ enemies, combat, ownerSlot, timeMs: tick * 1000 / hostFps, random,
      mask: () => { throw new Error('Normal collision must use native fields'); }, monkeyHorseCollision: () => assets });
    for (let part = 0; part < parts; part++) runtime.update({ roster, owner, groundEnvironment, projectiles, hostFps,
      deltaMs: 1000 / hostFps / parts, random, projectileCombat: port,
      targets: enemies.map(e => ({ id: e.id, x: e.x, y: e.y, isAlive: e.hp > 0 })) });
    tick++;
    const p = projectiles.projectiles[0];
    if (p) {
      const expected = original.find(row => row.tick - row.bullets[0]!.birthTick === p.petHostTick)?.bullets[0];
      assert.ok(expected, 'original joint has this effect age');
      assert.equal(p.isExpired, expected.dead, 'actual callback-born lifetime matches native joint');
      assert.equal(-p.facingX, expected.a);
      const phase = assets.fieldAt(family, p.sourceSymbol, p.petHostTick!, -p.facingX as -1 | 1).phaseKey.split('|')[1]!;
      const frames: number[] = [];
      const collect = (node: { frame?: number | null; children?: typeof node[] }) => {
        if (node.frame != null) frames.push(node.frame);
        node.children?.forEach(collect);
      };
      collect(JSON.parse(phase));
      if (!expected.dead) assert.deepEqual(frames, expected.phaseFrames, `${family}${form} native recursive phase age ${p.petHostTick}`);
    }
  };
  while (!projectiles.projectiles.length && tick < 80) frame();
  const p = projectiles.projectiles[0]!;
  assert.ok(p, `${family}${form} emits normal`);
  assert.equal(p.petHostTick, 0, 'birth callback cannot step its new effect');
  assert.equal(p.attackKind, 'physics'); assert.equal(p.remainingHits, 99);
  const bornRolls = rolls;
  assert.equal(locked.hp, 10000, 'no collision on birth tick');
  locked.x = locked.y = 10000;
  frame();
  assert.equal(locked.hp, 10000, 'locked identity cannot bypass geometry');
  assert.equal(rolls, bornRolls, 'no hit does not refresh source damage cache');
  const deadRow = original.find(row => row.bullets[0]!.dead)!;
  const lifetime = deadRow.tick - deadRow.bullets[0]!.birthTick;
  const sample = oracles[family]!.find(row => row.symbol === p.sourceSymbol && row.tick >= 2 && row.tick <= lifetime
    && row.target === 'ObjectBaseSprite2' && row.direction === -p.facingX && row.hit)!;
  assert.ok(sample, `${family}${form} independent native positive phase exists`);
  while (p.petHostTick! + 1 < sample.tick) frame();
  const beforeHitRolls = rolls;
  other.x = p.x + sample.x; other.y = p.y + sample.y;
  frame();
  assert.ok(other.hp < 10000, `${family}${form} untracked collider receives source hit`);
  assert.equal(other.lastHitBy, ownerSlot);
  assert.equal(rolls, beforeHitRolls + 3, 'target dodge read precedes both original critical refresh reads');
  const hp = other.hp;
  const age = p.petHostTick;
  updateProjectiles(projectiles, [{ id: pet.id, state: 'ready' }], 1000);
  assert.equal(p.petHostTick, age, 'render updates cannot double-step the private host projectile');
  const legacy = family === 'monkey' ? resolveFormalPetMonkeyProjectileHits : resolveFormalPetHorseProjectileHits;
  assert.equal(legacy({ projectiles, combat, enemies: [other], ownerSlotForPet: () => ownerSlot, timeMs: tick * 1000 / hostFps }).length, 0,
    'legacy resolver cannot settle the same host-owned projectile');
  while (!p.isExpired && tick < 100) frame();
  assert.equal(other.hp, hp, 'same attack id damages this target once');
  assert.equal(locked.hp, 10000);
  assert.equal(p.petHostTick, lifetime);
  runtime.destroy(); cases++;
}
console.log(`Monkey/horse normal runtime: ${cases} real damage/ownership/dedup/lifetime/partition cases passed.`);
