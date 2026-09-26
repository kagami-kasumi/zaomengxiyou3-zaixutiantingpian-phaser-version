import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem, updateProjectiles, getProjectileHitbox } from '../src/systems/ProjectileSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import { resolveFormalPetMonkeyProjectileHits } from '../src/systems/PetMonkeyCombatSystem';
import { resolveFormalPetHorseProjectileHits } from '../src/systems/PetHorseCombatSystem';

// Diagnostic capture of the unmodified implementation, NOT a correctness gate.
// Source expected: BaseBullet.checkAttack -> BaseMonster.beMagicAttack requires
// intersection and complexHitTestObject; target identity cannot grant a hit.
const rows: object[] = [];
const skillRows: object[] = [];
const phaseRows: object[] = [];
for (const species of ['monkey', 'horse'] as const) {
  for (const form of [1, 2, 3, 4]) for (const slot of ['p1', 'p2'] as const) {
    const roster = createSeedPetRoster();
    for (const candidate of roster.pets) candidate.isActive = candidate.species === species && candidate.form === form;
    const pet = roster.pets.find(candidate => candidate.isActive)!;
    pet.skills = [];
    for (const state of Object.values(pet.skillState!)) {
      if (state && typeof state === 'object' && 'cooldownMs' in state) state.cooldownMs = 60000;
    }
    const runtime = new PetCombatRuntime();
    const projectiles = createProjectileSystem();
    const owner = { x: 200, y: 300, facingX: 1 as const };
    const initial = runtime.update({ roster, owner, targets: [], projectiles, deltaMs: 0 });
    const target = { id: 'departing-target', x: initial.runtime!.x + 10, y: initial.runtime!.y, isAlive: true };
    runtime.update({ roster, owner, targets: [target], projectiles, random: () => 0.1, deltaMs: 0 });
    assert.equal(projectiles.projectiles.length, 1);
    const projectile = projectiles.projectiles[0]!;
    const sampleMs = species === 'monkey' ? (form === 1 ? 10 : 8) * 1000 / 24 + 1 : (projectile.activeAfterMs ?? 0) + 1;
    updateProjectiles(projectiles, [{ id: pet.id, state: 'ready' }], sampleMs);
    const enemy = createStage1CombatEnemy({ id: target.id, enemyType: 30, x: 100000, y: 100000 });
    const before = enemy.hp;
    const resolve = species === 'monkey' ? resolveFormalPetMonkeyProjectileHits : resolveFormalPetHorseProjectileHits;
    const hits = resolve({ projectiles, combat: createStage1CombatRuntime(), enemies: [enemy], ownerSlotForPet: () => slot, timeMs: sampleMs });
    rows.push({ species, form, slot, sourceExpectedHits: 0, actualHits: hits.length,
      hpBefore: before, hpAfter: enemy.hp, lastHitBy: enemy.lastHitBy,
      sampleMs, projectile: getProjectileHitbox(projectile), enemy: { x: enemy.x, y: enemy.y },
      rejected: hits.length !== 0 });
    runtime.destroy();
  }
}
for (const form of [2, 3, 4]) {
  const roster = createSeedPetRoster();
  for (const candidate of roster.pets) candidate.isActive = candidate.species === 'monkey' && candidate.form === form;
  const pet = roster.pets.find(candidate => candidate.isActive)!;
  pet.skills = [];
  const runtime = new PetCombatRuntime();
  const projectiles = createProjectileSystem();
  const owner = { x: 200, y: 300, facingX: 1 as const };
  const initial = runtime.update({ roster, owner, targets: [], projectiles, deltaMs: 0 });
  const target = { id: 'stationary-target', x: initial.runtime!.x + 10, y: initial.runtime!.y, isAlive: true };
  const actions: string[] = [];
  let failedSkills = 0;
  for (let tick = 0; tick < 49; tick++) {
    runtime.update({ roster, owner, targets: [target], projectiles, random: () => 0.1, deltaMs: 1000 / 24, hostFps: 24 });
    for (const event of runtime.events()) {
      if (event.action) actions.push(event.action.type);
      if (event.behaviorEvent?.type === 'skill-cast' && event.behaviorEvent.payload?.ok === false) failedSkills++;
    }
  }
  skillRows.push({ form, learnedSkills: pet.skills, sourceExpected: 'unlearned skill is ineligible; normal branch remains reachable', actions, failedSkills, normalProjectiles: projectiles.projectiles.filter(p => p.variant.endsWith('-normal')).length });
  runtime.destroy();
}
const output = 'docs/tasks/evidence/TASK-SLICE-226';
for (const species of ['monkey', 'horse'] as const) for (const form of [1, 2, 3, 4]) for (const fps of [20, 24, 30]) {
  const roster = createSeedPetRoster();
  for (const candidate of roster.pets) candidate.isActive = candidate.species === species && candidate.form === form;
  const pet = roster.pets.find(candidate => candidate.isActive)!;
  pet.skills = [];
  for (const state of Object.values(pet.skillState!)) {
    if (state && typeof state === 'object' && 'cooldownMs' in state) state.cooldownMs = 60000;
  }
  const runtime = new PetCombatRuntime();
  const projectiles = createProjectileSystem();
  const owner = { x: 200, y: 300, facingX: 1 as const };
  const normalTicks: number[] = [];
  for (let tick = 0; tick < 56; tick++) {
    const position = runtime.snapshot().runtime;
    const targets = tick < 7 ? [] : [{ id: 'phase-target', x: position!.x + 10, y: position!.y, isAlive: true }];
    runtime.update({ roster, owner, targets, projectiles, random: () => 0.1, deltaMs: 1000 / fps, hostFps: fps });
    if (runtime.events().some(event => event.action?.type === 'basic-attack')) normalTicks.push(tick);
  }
  phaseRows.push({ species, form, fps, normalTicks });
  runtime.destroy();
}
mkdirSync(output, { recursive: true });
writeFileSync(`${output}/preflight-counterexamples.json`, JSON.stringify({ kind: 'old-implementation-diagnostic', rows, skillRows, phaseRows }, null, 2));
console.log(JSON.stringify({ cases: rows.length, rejected: rows.filter(row => (row as { rejected: boolean }).rejected).length, skillCases: skillRows.length, phaseCases: phaseRows.length }));
