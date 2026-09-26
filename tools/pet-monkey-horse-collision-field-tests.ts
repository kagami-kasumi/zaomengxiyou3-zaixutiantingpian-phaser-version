import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { decodeMonkeyHorseCollision } from '../src/assets/PetMonkeyHorseCollisionPackage';
import { sampleMonkeyHorseWorldHit } from '../src/systems/PetMonkeyHorseCollisionSystem';

const manifest = JSON.parse(readFileSync('public/assets/pets/monkey-horse/collision-manifest.json', 'utf8'));
const compressed = readFileSync(`public${manifest.path}`), decoded = gunzipSync(compressed);
assert.equal(createHash('sha256').update(compressed).digest('hex'), manifest.compressedSha256);
assert.equal(createHash('sha256').update(decoded).digest('hex'), manifest.decodedSha256);
const assets = await decodeMonkeyHorseCollision(compressed);
const targets = JSON.parse(decoded.toString()).monsterTargets.mappings as {
  symbol: string; runtimeBounds: { left: number; top: number; width: number; height: number }
}[];
await decodeMonkeyHorseCollision(decoded);
const corrupt = Buffer.from(compressed); corrupt[20] ^= 1;
await assert.rejects(decodeMonkeyHorseCollision(corrupt), /integrity mismatch/);
let count = 0;
const reports: { family: string; mode: string; cases: number; oracleSha256: string }[] = [];
const inputs = (['monkey', 'horse'] as const).flatMap(family => (['native', 'formal'] as const).map(mode => {
  const task = family === 'monkey' ? 228 : 229;
  return { family, mode, path: mode === 'native'
    ? `local-resources/regima/task-outputs/TASK-SETTINGS-${task}/natural-collision-air/measurement.json`
    : `local-resources/regima/task-outputs/TASK-SLICE-226/formal-target-collision-${task}/measurement.json` };
}));
for (const mode of ['native', 'formal'] as const) inputs.push({ family: 'horse', mode,
  path: `local-resources/regima/task-outputs/TASK-SLICE-226/horse-aoyi-collision-${mode === 'native' ? 'source' : 'formal'}/measurement.json` });
for (const { family, mode, path } of inputs) {
  const bytes = readFileSync(path);
  const oracle = JSON.parse(bytes.toString()) as {
    cases: { symbol: string; tick: number; direction: -1 | 1; target: string; x: number; y: number;
      intersection: { x: number; y: number; width: number; height: number }; hit: boolean }[];
  };
  for (const [index, row] of oracle.cases.entries()) {
    const shape = mode === 'native' ? { kind: 'native' as const, symbol: row.target }
      : { kind: 'runtime' as const, index: ['ObjectBaseSprite', 'ObjectBaseSprite2', 'ObjectBaseSprite7'].indexOf(row.target) };
    const actual = assets.hit({ family, symbol: row.symbol, nativeTick: row.tick, direction: row.direction,
      sourceRoot: { x: 470, y: 350 },
      targetDraw: { x: Math.trunc((470 + row.x) * 20) / 20 - row.intersection.x,
        y: Math.trunc((350 + row.y) * 20) / 20 - row.intersection.y },
      target: shape, intersection: row.intersection });
    assert.equal(actual, row.hit, `${family} native collision ${index}: ${JSON.stringify(row)}`);
    // Native oracle uses half of the X scale of the formal constructor instances.
    const bounds = targets.find(target => target.symbol === row.target)!.runtimeBounds;
    const scaleX = mode === 'native' ? 0.5 : 1;
    const world = sampleMonkeyHorseWorldHit(assets,
      { family, symbol: row.symbol, nativeTick: row.tick, direction: row.direction, sourceRoot: { x: 470, y: 350 } },
      { x: 470 + row.x, y: 350 + row.y, bounds: { x: bounds.left * scaleX, y: bounds.top,
        width: bounds.width * scaleX, height: bounds.height }, shape });
    assert.equal(world.hit, row.hit, `${family} world collision ${index}: ${JSON.stringify(row)} / ${JSON.stringify(world)}`);
    // Native hitTestObject's coarse precheck can retain negative/tiny rectangles;
    // complexHitTestObject rejects all of them before allocating a bitmap.
    if (row.intersection.width >= 1 && row.intersection.height >= 1)
    for (const key of ['x', 'y', 'width', 'height'] as const) assert.ok(
      Math.abs(world.intersection[key] - row.intersection[key]) < 1e-9,
      `${family} intersection ${index}/${key}: ${JSON.stringify(row)} / ${JSON.stringify(world)}`);
    count++;
  }
  reports.push({ family, mode, cases: oracle.cases.length, oracleSha256: createHash('sha256').update(bytes).digest('hex') });
  console.log(`${family}/${mode}: ${oracle.cases.length} native collision booleans matched`);
}
assert.throws(() => assets.fieldAt('monkey', 'PetMonkey1Bullet1', 10000, 1), /Unknown/);
assert.throws(() => assets.fieldAt('horse', 'PetHorse4Bullet5', 321, 1), /Unknown/);
mkdirSync('docs/tasks/evidence/TASK-SLICE-226', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SLICE-226/collision-fields-ts.json', JSON.stringify({
  status: 'passed-bounded', reports, compressedSha256: manifest.compressedSha256,
  scope: 'TypeScript raster and world placement against native HitTest; production projectile lifecycle not covered.',
}, null, 2));
console.log(`Monkey/horse TypeScript raster projection: ${count} source cases passed; world lifecycle not covered.`);
