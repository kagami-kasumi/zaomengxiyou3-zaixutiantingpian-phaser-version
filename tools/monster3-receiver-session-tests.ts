import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createDefaultPetBehaviorRegistry } from '../src/systems/pet-behaviors/createDefaultPetBehaviorRegistry';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { PetTurtleAssets } from '../src/assets/PetTurtleAssets';
import type { MonsterDamageRequest } from '../src/systems/MonsterDamageReception';

const reference = JSON.parse(readFileSync('docs/reverse-engineering/reference/monster3-reception-contract.json', 'utf8'));
const assets = await PetTurtleAssets.decode(path => new Uint8Array(readFileSync(`public${path}`)));
const registry = createDefaultPetBehaviorRegistry(() => assets);
const seeds = createSeedPetRoster().pets.filter(pet => registry.has(pet.species, pet.form));
const rows: unknown[] = [];
for (const slot of ['p1', 'p2'] as const) for (const seed of seeds) {
  for (const attack of [1, 2] as const) for (const scenario of ['normal', 'dodge', 'geometry-miss', 'magic-full', 'critical', 'fatal', 'difficulty2-bingo', 'qlfj-equal', 'qlfj-below']) {
    const name = `Pet${seed.species[0]!.toUpperCase()}${seed.species.slice(1)}${seed.form}`;
    const id = `${name}-${slot}-0-${attack}-${scenario}`;
    const index = reference.inputs.rows.findIndex((row: unknown[]) => row[0] === id);
    assert(index >= 0, id);
    const fixture = Object.fromEntries(reference.inputs.fields.map((key: string, column: number) => [key, reference.inputs.rows[index][column]]));
    const expected = Object.fromEntries(reference.expected.fields.map((key: string, column: number) => [key, reference.expected.rows[index][column]]));
    const pet = { ...structuredClone(seed), id, hp: fixture.hp, maxHp: 1000, def: fixture.defense,
      isActive: true, lifetime: 10, skills: fixture.qlfj === null ? [] : ['qlfj'] };
    const runtime = new PetCombatRuntime(registry);
    const frame = { roster: { pets: [pet], selectedIndex: 0, message: '' },
      owner: { x: 280, y: 200, facingX: -1 as const }, targets: [], random: () => 0.99,
      deltaMs: 1000 / 30, hostFps: 30,
      groundEnvironment: { ownerRootOffsetY: -50, walls: [{ id: 'floor', left: -1000, right: 2000,
        top: 250.1, bottom: 280, usesWallTolerance: true }] } };
    for (let tick = 0; tick < 120; tick++) runtime.update(frame);
    const before = runtime.snapshot();
    const priorEventSequence = runtime.events().at(-1)?.sequence ?? 0;
    assert(before.runtime && !before.protectedFromHits, id);
    const draws: number[] = [];
    const rolls = fixture.rolls ?? Array(10).fill(fixture.roll);
    const request: MonsterDamageRequest = { source: { boss: false, hit: fixture.sourceHit,
      criticalPercent: fixture.critical, flower: fixture.flower, magicDefenseReduction: fixture.reduceMagic,
      random: () => { const value = rolls[draws.length] ?? fixture.roll; draws.push(value); return value; } },
      sourceId: 'monster3', attackId: 'attack-1', actionName: `hit${attack}`,
      power: attack === 1 ? 40 : 18, attackKind: attack === 1 ? 'physics' : 'magic',
      geometryHit: fixture.geometry, bingo: fixture.bingo, difficulty: fixture.difficulty,
      timeMs: 1000, hostFps: 30, knockbackX: 6, knockbackY: -5 };
    const result = runtime.receiveMonsterDamage(before.runtime.runtimeKey, {
      missRate: fixture.petMiss, magicDefenseRate: fixture.petMagicDefense,
      rabbitDodgeActive: false, counterChance: fixture.qlfj ?? undefined,
    }, request);
    assert(result, id);
    assert.equal(result.accepted, expected.accepted, id);
    assert.equal(result.missed, expected.missed, id);
    assert.equal(pet.hp, expected.hp, id);
    assert.deepEqual(draws, expected.random, id);
    assert.equal(pet.lifetime, expected.lifetime, id);
    const after = runtime.snapshot();
    const receptionEvents = runtime.events().filter(event => event.sequence > priorEventSequence);
    const damaged = receptionEvents.filter(event => event.type === 'behavior' && event.behaviorEvent?.type === 'damaged');
    if (pet.species === 'monkey' || pet.species === 'horse') {
      assert.equal(damaged.length, result.missed || (!result.accepted && !result.returnVoid) ? 0 : 1, `${id}: onDamaged exactly once`);
    }
    assert.equal(receptionEvents.filter(event => event.type === 'action' && event.action?.type === 'dead').length,
      expected.hp === 0 ? 1 : 0, `${id}: single death transition`);
    const action = after.animation?.action;
    if (!result.missed && (result.accepted || result.returnVoid)) assert.equal(action === 'normal' || action === 'basic-attack' ? 'hit1' : action, expected.action, id);
    else assert.deepEqual(after.animation, before.animation, id);
    assert.equal(!!pet.skillState?.monkey1Xj.releaseReady || !!pet.skillState?.horse2Bd.releaseReady, expected.skill1, id);
    assert.equal(!!pet.skillState?.monkey2Xj.releaseReady, expected.skill2, id);
    assert.equal(!!pet.skillState?.monkey3Lj.releaseReady, expected.skill3, id);
    // 251 stubs normalHit to select an action. The actual Monkey4 override
    // additionally protects for 12 host ticks (PetMonkey4.as:614..621).
    const actualMonkey4Counter = pet.species === 'monkey' && pet.form === 4 && result.action === 'hit1' && !result.missed;
    assert.equal(after.protectedFromHits, expected.father >= 0 || actualMonkey4Counter, id);
    if (scenario === 'fatal') {
      const retry = runtime.receiveMonsterDamage(before.runtime.runtimeKey, {
        missRate: 0, magicDefenseRate: 0, rabbitDodgeActive: false, counterChance: undefined,
      }, request);
      assert.equal(retry?.accepted, false);
      assert.equal(pet.lifetime, expected.lifetime, 'dead retry cannot consume a second life');
    }
    rows.push({ id, hp: pet.hp, action, draws, phase: after.phase });
    runtime.destroy();
    assert.equal(runtime.receiveMonsterDamage(before.runtime.runtimeKey, {
      missRate: 0, magicDefenseRate: 0, rabbitDodgeActive: false, counterChance: undefined,
    }, request), undefined);
  }
}
mkdirSync('docs/tasks/evidence/TASK-SLICE-249A', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SLICE-249A/session-verification.json', JSON.stringify({ cases: rows.length, rows }, null, 2));
console.log(`Monster3 reception actual PetCombatRuntime: ${rows.length} source-expected cases, 16 forms, both owners.`);
