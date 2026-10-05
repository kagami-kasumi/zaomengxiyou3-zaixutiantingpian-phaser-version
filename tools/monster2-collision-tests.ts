import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

import { sampleMonster2Collision } from '../src/systems/Monster2CollisionSystem';

type Attack = 1 | 2;

const root = 'docs/tasks/evidence/TASK-SETTINGS-257A';
const approval = JSON.parse(readFileSync(`${root}/approved-pixel-differences.json`, 'utf8')) as {
  status: string;
  candidates: Record<string, string>;
};
assert.equal(approval.status, 'user-approved', '257A approval sidecar');
const reference = JSON.parse(
  readFileSync('docs/reverse-engineering/reference/monster2-attack-space-contract.json', 'utf8'),
) as {
  status: string;
  approval: { status: string; candidates: Record<string, string> };
  attacks: Array<{ attack: Attack; oracle: { sha256: string; caseCount: number } }>;
};
assert.equal(reference.status, 'verified', 'Monster2 attack-space reference');
assert.equal(reference.approval.status, approval.status, 'approval status vs formal reference');
assert.deepEqual(reference.approval.candidates, approval.candidates, 'approval candidates vs formal reference');

let cases = 0;
let pixels = 0;
let booleanMismatches = 0;
let residuals = 0;

for (const attack of [1, 2] as const) {
  const directory = `${root}/attack${attack}`;
  const nativeBytes = readFileSync(`${directory}/native.json`);
  const nativeHash = createHash('sha256').update(nativeBytes).digest('hex');
  const native = JSON.parse(nativeBytes.toString('utf8')) as {
    cases: Array<Record<string, any>>;
  };
  const oracle = reference.attacks.find((entry) => entry.attack === attack);
  assert.ok(oracle, `attack${attack} formal reference oracle`);
  const candidatePath = `${directory}/candidate-pixel-differences.json`;
  const candidateBytes = readFileSync(candidatePath);
  const candidateHash = createHash('sha256').update(candidateBytes).digest('hex');
  assert.equal(candidateHash, approval.candidates[String(attack)], `attack${attack} candidate hash`);
  const approved = JSON.parse(candidateBytes.toString('utf8')) as {
    attack: Attack;
    nativeSha256: string;
    pixels: number;
    differences: Array<Record<string, any>>;
  };
  assert.equal(approved.attack, attack, `attack${attack} candidate attack`);
  assert.equal(approved.nativeSha256, nativeHash, `attack${attack} native hash`);
  assert.equal(nativeHash, oracle.oracle.sha256, `attack${attack} native hash vs formal reference`);
  assert.equal(native.cases.length, oracle.oracle.caseCount, `attack${attack} case count vs formal reference`);

  const buffer = inflateSync(
    readFileSync(`local-resources/regima/task-outputs/TASK-SETTINGS-257A/attack${attack}/air/buffers.deflate`),
  );
  const differences: Array<Record<string, any>> = [];
  let attackPixels = 0;
  let attackBooleanMismatches = 0;

  for (const row of native.cases) {
    const points: Array<{ x: number; y: number; native: boolean; candidate: boolean }> = [];
    let visited = 0;
    const width = Math.max(0, Math.trunc(row.intersection.width));
    const height = Math.max(0, Math.trunc(row.intersection.height));
    const actual = sampleMonster2Collision(
      attack,
      row.frame,
      row.sign,
      row.sourceRoot,
      row.profile,
      row.targetRoot,
      (x: number, y: number, candidate: boolean) => {
        const offset = y * width + x;
        const nativePixel = !!(buffer[row.bufferOffset + (offset >> 3)]! & (1 << (offset & 7)));
        if (nativePixel !== candidate) points.push({ x, y, native: nativePixel, candidate });
        pixels++;
        attackPixels++;
        visited++;
      },
    );
    assert.equal(visited, width * height, `${row.id} ROI`);
    if (actual !== row.hit) {
      booleanMismatches++;
      attackBooleanMismatches++;
    }
    if (points.length) {
      differences.push({
        ...Object.fromEntries(
          ['id', 'frame', 'sign', 'profile', 'sourceRoot', 'targetRoot', 'intersection'].map((key) => [key, row[key]]),
        ),
        points,
      });
      residuals += points.length;
    }
    cases++;
  }

  assert.equal(attackBooleanMismatches, 0, `attack${attack} Boolean collision differences`);
  assert.equal(attackPixels, approved.pixels, `attack${attack} compared pixels`);
  assert.deepEqual(differences, approved.differences, `attack${attack} approved pixel tuples`);
}

assert.equal(cases, 392768, '257A total cases');
assert.equal(pixels, 34556398, '257A total compared pixels');
assert.equal(booleanMismatches, 0, '257A total Boolean collision differences');
assert.equal(residuals, 234, '257A approved residual pixels');

console.log(`monster2 collision verified: ${cases} cases, ${pixels} pixels, ${residuals} approved residual pixels`);
