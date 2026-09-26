/** Actual party entry diagnostic; no native passive oracle or acceptance claim. */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import { createHeroCombat } from '../src/systems/HeroCombatSystem';
import { noTargetBodyFixturePort } from './pet226-body/body-fixture-collision';

const ts = createRequire(import.meta.url)('typescript');
const source = readFileSync('src/scenes/HeroPartyRuntimeBridge.ts', 'utf8').replaceAll('\r\n', '\n');
const start = source.indexOf('  function updatePets(frame:');
const end = source.indexOf('\n}\n\nfunction syncFallbackFeedback', start);
assert(start > 0 && end > start);
const closure = ts.transpileModule(source.slice(start, end),
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const rows: unknown[] = [];
for (const family of ['monkey', 'horse']) for (const form of [1, 2, 3, 4])
for (const fps of [20, 24, 30]) for (const allSkills of [false, true]) {
  const rosters: any = Object.fromEntries(['p1', 'p2'].map(slot => {
    const roster = createSeedPetRoster();
    roster.pets.forEach(p => {
      p.id = `${slot}-${p.id}`; p.isActive = p.species === family && p.form === form;
      if (p.isActive) Object.assign(p, { hp: 500, maxHp: 1000, mp: 1000, maxMp: 1000, moveSpeed: 0,
        skills: allSkills ? ['sxkb', 'fsnl', 'smjc', 'mfjc', 'gjjc', 'fyjc'] : ['sxkb'],
        autoBuffState: { ...Object.fromEntries(['sxkb', 'fsnl', 'smjc', 'mfjc', 'gjjc', 'fyjc']
          .map(skill => [skill, { counterMs: 0 }])), lastResult: 'controlled-ready-input' } });
    });
    return [slot, roster];
  }));
  const runtimes = { p1: new PetCombatRuntime(), p2: new PetCombatRuntime() };
  const snapshots: any = {}, pending = { p1: [], p2: [] }, animations = { p1: [], p2: [] };
  const model = { combat: createStage1CombatRuntime(), members: ['p1', 'p2'].map(slot => ({
    movement: { x: 300, y: 350, facingX: 1 }, combat: { slot, combat: createHeroCombat(slot as 'p1' | 'p2') },
  })) };
  const port = Object.assign(() => noTargetBodyFixturePort, { readyRoster: (r: any) => r });
  const update = new Function('model', 'petRosters', 'petCombatRuntimes', 'petCombatSnapshots',
    'pendingPetDamageEvents', 'pendingPetAnimationEvents', 'scene', 'petProjectileCombat',
    'petDragonPresentation', 'isPetDragonQaEnabled', 'petTurtle', closure + '\nreturn updatePets;')(
    model, rosters, runtimes, snapshots, pending, animations, { game: { loop: { targetFps: fps } } },
    port, { update() {} }, () => false, { readyRoster: (r: any) => r, update() {} });
  const before = structuredClone(rosters);
  update({ targets: [], combatEnemies: [], projectiles: createProjectileSystem(),
    timeMs: 1000 / fps, deltaMs: 1000 / fps, random: () => 0.99 });
  for (const slot of ['p1', 'p2']) {
    const pet = rosters[slot].pets.find((p: any) => p.isActive);
    const prior = before[slot].pets.find((p: any) => p.isActive);
    rows.push({ family, form, fps, slot, allSkills, mpBefore: prior.mp, mpAfter: pet.mp,
      beforeAutoBuff: prior.autoBuffState ?? null, afterAutoBuff: pet.autoBuffState ?? null,
      sourceStaticExpectation: allSkills ? 'six checks may apply in one tick, each cost20' : 'ready learned sxkb applies, cost20',
      runtimeKey: snapshots[slot].runtime.runtimeKey });
  }
  runtimes.p1.destroy(); runtimes.p2.destroy();
}
assert.equal(rows.length, 96);
writeFileSync('docs/tasks/evidence/TASK-SLICE-226/passive-party-preflight.json', JSON.stringify({
  status: 'diagnostic-not-acceptance', scope: 'Actual party closure/Runtime with controlled no-target world; native counter/effect oracle still required.', rows,
}, null, 2) + '\n');
console.log(`${rows.length} actual party passive input observations collected.`, JSON.stringify(rows.slice(0, 2)));
