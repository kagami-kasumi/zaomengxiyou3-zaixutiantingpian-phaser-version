/** Production input reachability only; this does not generate native expected values. */
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const outfile = path.join(root, '.tmp/pet-passive-input-preflight.mjs');
await build({ stdin: { contents: `
export { catchNewPet } from './src/systems/PetRosterSystem';
export { returnPetToChild, rerollPetGrowthAttributes } from './src/systems/PetGrowthSystem';
`, resolveDir: root, loader: 'ts' }, bundle: true, platform: 'node', format: 'esm', outfile, logLevel: 'silent' });
const api = await import(pathToFileURL(outfile).href);
const rows = [];
for (const ownerSlot of ['p1', 'p2']) {
  const roster = { pets: [], selectedIndex: 0, message: '', ownerSlot };
  const pet = api.catchNewPet(roster, 'monkey1', 10);
  assert(pet);
  const record = operation => rows.push({ ownerSlot, operation, technique: pet.technique, warpower: pet.warpower });
  record('capture');
  assert.equal(pet.technique, 1); assert.equal(pet.warpower, 1);
  api.rerollPetGrowthAttributes(pet, () => 0);
  record('quality2-reroll-minimum');
  assert.equal(pet.technique, 0); assert.equal(pet.warpower, 0);
  for (const random of [0, 1]) {
    assert(api.returnPetToChild(pet, () => random));
    record(`return-child-${random}`);
    assert.equal(pet.technique, random ? 8 : 4); assert.equal(pet.warpower, random ? 8 : 4);
  }
}
const truth = JSON.parse(readFileSync(path.join(root, 'docs/reverse-engineering/reference/pet-passive-auto-buff-contract.json'), 'utf8'));
assert.equal(truth.expectedCases.length, 720);
const shell = readFileSync(path.join(root, 'tools/pet-passive-source/capture.py'), 'utf8');
assert(shell.includes('technique:int=3,power:int=1'));
const probe = readFileSync(path.join(root, 'tools/pet-passive-source/Probe.as'), 'utf8');
assert(!/_petInfo\.(technique|power)\s*=/.test(probe));
assert(rows.every(row => row.technique !== 3 || row.warpower !== 1));
const report = { status: 'input-boundary-gap-confirmed-not-game-acceptance', nativeCases: 720,
  nativeInput: { technique: 3, warpower: 1 }, rows,
  limitation: 'Actual production capture/growth calls only; no native zero-duration or alternative aptitude expected generated.' };
const directory = path.join(root, 'docs/tasks/evidence/TASK-SLICE-242B');
mkdirSync(directory, { recursive: true });
writeFileSync(path.join(directory, 'input-preflight.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`242B: ${rows.length} production inputs outside the 235 native fixture; includes warpower=0.`);
