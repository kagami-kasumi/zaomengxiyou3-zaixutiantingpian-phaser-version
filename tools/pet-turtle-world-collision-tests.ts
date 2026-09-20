import assert from 'node:assert/strict';
import { createReadStream, readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { createHash } from 'node:crypto';
import { PetTurtleAssets } from '../src/assets/PetTurtleAssets';
import { samplePetTurtleHit } from '../src/systems/PetTurtleCollisionSystem';

const assets = await PetTurtleAssets.decode(path => new Uint8Array(readFileSync(`public${path}`)));
const targets = assets.collision.data.monsterTargets;
const monsterIds = [105, 107, 95].map(characterId => {
  const symbol = targets.symbols.find(row => row.characterId === characterId)!.symbol;
  return targets.mappings.find(row => row.symbol === symbol)!.monsterId;
});
let cases = 0;
for await (const line of createInterface({ input: createReadStream('docs/tasks/evidence/TASK-SLICE-224A1/dynamic-call-oracle.jsonl'), crlfDelay: Infinity })) {
  const row = JSON.parse(line);
  const parsed = /^(PetTurtle[12]Bullet[12])-(\d+)-s1-d(-?1)$/.exec(row.field);
  if (!parsed) continue;
  const result = samplePetTurtleHit(assets, { symbol: parsed[1]!, nativeTick: Number(parsed[2]),
    root: row.sourceRoot, facingX: -Number(parsed[3]) as -1 | 1 }, {
    monsterId: monsterIds[row.targetIndex]!,
    x: row.targetDraw.x + row.intersection.x, y: row.targetDraw.y + row.intersection.y,
  });
  assert.equal(result.hit, row.actual, row.id);
  assert.equal(createHash('sha256').update(result.bits).digest('hex'), row.expectedSha256, `${row.id} sampled pixels`);
  cases++;
}
assert(cases > 10000);
console.log(`Turtle world placement: ${cases} independent native call-site collisions passed`);
