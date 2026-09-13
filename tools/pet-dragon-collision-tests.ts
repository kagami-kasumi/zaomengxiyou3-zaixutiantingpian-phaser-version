import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { getDragonBulletCollisionBounds, getDragonTargetCollisionBounds,
  sampleDragonCollision, toDragonSourceCoordinate } from '../src/systems/PetDragonCollisionSystem';

// Expected values are frozen outputs of unchanged HitTest running in bundled AIR.
const measurement = JSON.parse(readFileSync(
  'docs/tasks/evidence/TASK-SETTINGS-218/air-original/measurement.json', 'utf8'));
const alpha = execFileSync('python', ['-c',
  'from PIL import Image; import sys; sys.stdout.buffer.write(Image.open(sys.argv[1]).convert("RGBA").getchannel("A").tobytes())',
  'public/assets/pets/dragon/effects/PetDragon1Bullet1/1.png']);
const mask = { width: 67, height: 53, alpha };
const coordinateProbe = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SLICE-214C4/coordinate-runtime.json', 'utf8'));
assert.ok(coordinateProbe.trace.includes('RUNTIME WIN 51,1,1,5'));
assert.equal(coordinateProbe.cases.length, 15);
for (const row of coordinateProbe.cases) assert.equal(toDragonSourceCoordinate(row.input), row.x);
assert.equal(JSON.parse(readFileSync(
  'docs/tasks/evidence/TASK-SETTINGS-218/air-verification.json', 'utf8')).status, 'passed-finite-source-runtime-scope');
assert.equal(measurement.actual.length, 861);
let pixels = 0;
for (const input of measurement.inputs) {
  const expected = measurement.actual.find((row: { id: string }) => row.id === input.id);
  assert.ok(expected, input.id);
  const facing = input.flip === 1 ? -1 : 1;
  const actual = sampleDragonCollision(expected.target, expected.bullet, facing, mask);
  assert.equal(actual.hit, expected.actual, `${input.id}: accepted collision`);
  assert.equal(actual.pixels, expected.cyanPixels, `${input.id}: opaque overlap pixels`);
  pixels += actual.pixels;
  if (input.frame) {
    const projected = getDragonBulletCollisionBounds(input.frame, input.bx, input.by, facing);
    assert.deepEqual(projected, expected.bullet, `${input.id}: original frame/root placement`);
    assert.deepEqual(sampleDragonCollision(expected.target, projected, facing, mask), actual,
      `${input.id}: projected geometry must drive the same sampler`);
  }
}
for (const [monster, width, height] of [[2, 100, 100], [5, 120, 130], [30, 114, 42]]) {
  assert.deepEqual(getDragonTargetCollisionBounds(monster!, 470, 295),
    { x: 470 - width! / 2, y: 295 - height! / 2, width, height });
}
assert.throws(() => getDragonTargetCollisionBounds(999, 0, 0));
assert.throws(() => getDragonBulletCollisionBounds(12, 0, 0, -1));
const transparent = { ...mask, alpha: new Uint8Array(alpha.length) };
assert.equal(sampleDragonCollision({ x: 0, y: 0, width: 100, height: 100 },
  { x: 0, y: 0, width: 69, height: 56 }, -1, transparent).hit, false);
console.log(`Dragon collision: 861 original AIR cases, ${pixels} opaque pixels, frame and root mapping passed.`);
