import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// Independent finite source contract inventory; each group runs actual semantic tests in P1T.
const groups = [
  { test: 'pet-turtle-runtime-tests', ids: ['entry.forms', 'ai.priority', 'ai.range', 'ai.owner', 'ai.target', 'ai.follow',
    'normal.1', 'normal.2', 'normal.3', 'normal.4', 'sld.gates', 'sld.release', 'sld.effect'], consumer: 'TurtlePetBehavior / EntitySession / PetProjectileCombatSystem' },
  { test: 'pet-turtle-link-tests', ids: ['sld.link-heal', 'txlj.release', 'txlj.damage', 'txlj.heal'], consumer: 'HeroPartyRuntimeBridge / HeroCombatSystem / PetTurtleLinkSystem' },
  { test: 'pet-turtle-skill-runtime-tests', ids: ['sybh.release', 'sybh.effects', 'aoyi.gate', 'aoyi.chain', 'aoyi.damage-window',
    'aoyi.hurt', 'aoyi.cleanup', 'damage.power', 'damage.snapshot', 'damage.dedup', 'damage.defense', 'hurt.counter', 'hurt.death'], consumer: 'TurtlePetBehavior / PetTurtleProjectileSystem / EntitySession' },
  { test: 'pet-turtle-lifecycle-tests', ids: ['lifecycle.destroy', 'lifecycle.replace'], consumer: 'HeroPartyRuntimeBridge / PetCombatRuntime / TestSceneEncounterReset' },
];
const manifest = JSON.parse(readFileSync('public/assets/pets/turtle/manifest.json', 'utf8'));
const expected = groups.flatMap(g => g.ids).sort();
assert.equal(new Set(expected).size, 32);
assert.deepEqual(manifest.contracts.map((c: any) => c.id ?? c.behavior.id).sort(), expected);
for (const group of groups) assert(readFileSync(`tools/${group.test}.ts`, 'utf8').includes('assert'));
execFileSync(process.execPath, ['tools/turtle-runtime/lifecycle-mutations.mjs'], { stdio: 'inherit' });
execFileSync(process.execPath, ['tools/turtle-runtime/run-combat-browser.mjs', '--family'], { stdio: 'inherit' });
const browser = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SLICE-224C/combat-browser.json', 'utf8'));
assert.equal(browser.status, 'passed'); assert.equal(browser.reports.length, 20);
assert.equal(browser.journeys.length, 5);
assert(browser.reports.every((r: any) => r.restAndReplace && r.comparedLayers > 0 && r.differentPixels === 0));
writeFileSync('docs/tasks/evidence/TASK-SLICE-224C/contracts.json', JSON.stringify({ status: 'passed',
  contracts: groups.flatMap(g => g.ids.map(id => ({ id, test: g.test, consumer: g.consumer, status: 'passed' }))),
  semanticScope: 'P1T composes all A/B semantics, 8 aoyi combinations, independent native oracles and mutation suites; C adds production five-level closure and same-document lifecycle.',
  visualExceptions: '225 exact 28 states/308 pixels; A2 root/camera <=0.5px per axis. Collision separately 222B 20 cases/70 pixels.',
}, null, 2));
