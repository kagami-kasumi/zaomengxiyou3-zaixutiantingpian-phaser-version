import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import truth from '../docs/reverse-engineering/ground-truth/manifests/task-settings-213-pet-dragon-family.json';
import { chasePetRuntimeTarget } from '../src/systems/PetRuntimeSystem';
import type { PetRuntimeModel, PetState } from '../src/systems/PetTypes';

// Diagnostic only: a grounded, walking, unimpeded host tick. This is not a
// full AS3 physics emulator, visual baseline, or dragon-family acceptance gate.
const sourceRoot = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/';
const dragon = readFileSync(`${sourceRoot}export/pet/PetDragon1.as`, 'utf8');
const object = readFileSync(`${sourceRoot}base/BaseObject.as`, 'utf8');
assert.match(dragon, /horizenSpeed\s*=\s*5\s*;/);
assert.match(object, /this\.speed\.x\s*=\s*this\.horizenSpeed\s*;/);
assert.match(object, /this\.x\s*\+=\s*this\.speed\.x\s*;/);
const frozen = truth.forms.find(({ id }) => id === 'dragon1')!;
const cases = [20, 24, 30].map((hostFps) => {
  const runtime: PetRuntimeModel = {
    petId: 'preflight-dragon1', runtimeKey: 'preflight-dragon1',
    x: 0, y: 0, facingX: 1, state: 'idle',
  };
  chasePetRuntimeTarget(runtime, { moveSpeed: frozen.speed } as PetState,
    { id: 'in-front', x: 300, y: 0, isAlive: true }, frozen.attackRange, 1000 / hostFps, hostFps);
  return { hostFps, expectedGroundedDeltaX: frozen.speed, actualDeltaX: runtime.x,
    actualDeltaY: runtime.y, matches: Math.abs(runtime.x - frozen.speed) < 1e-9 };
});
const report = {
  status: cases.every(({ matches }) => matches) ? 'matched' : 'mismatch',
  scope: 'Existing shared chase helper versus one grounded AS3 walking host tick only',
  source: ['PetDragon1.as:25', 'BaseObject.as:284-313', 'BaseObject.as:601-610'],
  assumptions: ['walking, not running or hurt', 'grounded with no wall or enforced velocity',
    'target to the right, beyond attack range', 'one original host tick'],
  cases,
};
const output = 'docs/tasks/evidence/TASK-SLICE-214C2';
mkdirSync(output, { recursive: true });
writeFileSync(`${output}/movement-preflight.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
assert.equal(report.status, 'matched', 'Existing shared chase does not preserve dragon1 horizontal speed per host tick');
