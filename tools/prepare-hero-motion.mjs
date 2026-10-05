import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const sourcePath = 'docs/reverse-engineering/reference/hero-gather-motion-contract.json';
const bytes = readFileSync(sourcePath);
const source = JSON.parse(bytes);
assert.equal(source.status, 'verified-bounded-motion-inputs');
const profiles = Object.entries(source.inputs.roles).map(([role, record]) => {
  const ordinary = record.ordinary;
  const speed = ordinary.sword ?? ordinary;
  return { heroId: Number(role.slice(4)), walk: speed.walkPerHostFrame,
    run: speed.runPerHostFrame, gravity: ordinary.gravityPerHostFrame,
    jump: ordinary.jumpPower, initialVy: ordinary.initialSpeed.y };
});
const output = { source: { path: sourcePath, sha256: createHash('sha256').update(bytes).digest('hex') },
  collision: source.inputs.modernMapping.collisionManifest.profile0.bounds, profiles };
const path = 'src/assets/hero-motion-profiles.json';
const text = `${JSON.stringify(output, null, 2)}\n`;
if (process.argv.includes('--check')) assert.equal(readFileSync(path, 'utf8'), text);
else writeFileSync(path, text);
console.log('Hero ordinary motion profiles: source-bound, five default constructors');
