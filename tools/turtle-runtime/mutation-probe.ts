import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { PetTurtleAssets } from '../../src/assets/PetTurtleAssets';
import { renderTurtleState, turtleDrawParts, turtleOwnerOrigins } from '../../src/assets/PetTurtleProjection';

const out = 'docs/tasks/evidence/TASK-SLICE-224A1';
const hash = (data: Uint8Array) => createHash('sha256').update(data).digest('hex');
const assets = await PetTurtleAssets.decode(path => new Uint8Array(readFileSync(`public${path}`)));
const observed = JSON.parse(gunzipSync(readFileSync('docs/tasks/evidence/TASK-SETTINGS-222A/body-native.json.gz')).toString()).clocks[0];
assert.equal(assets.bodyAnimation(1, 'wait').cells[0]!.holdTicks, observed.events[0].count, 'native clock');
const oracle = new Map(JSON.parse(readFileSync(`${out}/visual-oracle.json`, 'utf8')).map((r: { mode: string; nativeId: string; expectedSha256: string }) => [`${r.mode}:${r.nativeId}`, r.expectedSha256]));
for (const [mode, pack] of assets.packages) {
  for (let i = 0; i < pack.states.length; i++) {
    const state = pack.states[i]!;
    if (mode !== 'body' && i % 19 && !state.groups.some(g => g.paintParts.length > 1)) continue;
    assert.equal(hash(renderTurtleState(assets, state)), oracle.get(`${mode}:${state.nativeId}`), `native visual ${state.id}`);
  }
}
const body = assets.body(1, 0, 0, 0, 'P1');
const root = turtleOwnerOrigins(body).get('root')!;
const before = turtleDrawParts(body), after = turtleDrawParts(body, { root: { x: root.x + 9, y: root.y - 5 } });
assert.equal(after[0]!.x - before[0]!.x, 9, 'owner translation');
assert.equal(after[0]!.y - before[0]!.y, -5, 'owner translation');
const rows = readFileSync(`${out}/full-oracle.jsonl`, 'utf8').trim().split('\n').slice(0, 250);
for (const line of rows) {
  const row = JSON.parse(line), actual = assets.collision.sample(row);
  assert.equal(actual.hit, row.actual, `native hit ${row.id}`);
  assert.equal(hash(actual.bits), row.expectedSha256, `native collision ${row.id}`);
}
console.log('Turtle independent mutation probe passed.');
