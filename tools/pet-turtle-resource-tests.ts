import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createReadStream, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { gunzipSync } from 'node:zlib';
import { PetAnimationClock } from '../src/systems/PetAnimationClock';
import { PetTurtleAssets } from '../src/assets/PetTurtleAssets';
import { PetTurtleCollisionAssets } from '../src/assets/PetTurtleCollisionAssets';
import { renderTurtleState, turtleDrawParts, turtleOwnerOrigins } from '../src/assets/PetTurtleProjection';
import { petTurtleBundleAssets, turtleManifest } from '../src/assets/PetTurtleAssetCatalog';
import type { TurtleVisualState, TurtleCollisionSample } from '../src/assets/PetTurtleAssetTypes';
import { sceneAssetBundles, runtimeAssetBundleOwners } from '../src/assets/SceneAssetBundles';

const out = 'docs/tasks/evidence/TASK-SLICE-224A1'; mkdirSync(out, { recursive: true });
const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const load = (name: string) => JSON.parse(readFileSync(`${out}/${name}`, 'utf8'));
const assets = await PetTurtleAssets.decode(path => new Uint8Array(readFileSync(`public${path}`)));
const nativeClocks = JSON.parse(gunzipSync(readFileSync('docs/tasks/evidence/TASK-SETTINGS-222A/body-native.json.gz')).toString()).clocks;
const clocks = new Map<string, PetAnimationClock>();
for (const observation of nativeClocks) {
  const key = `${observation.form}/${observation.row}/${observation.direct}`;
  let clock = clocks.get(key);
  if (!clock) {
    const action = turtleManifest.bodyAnimations[observation.form - 1]!.actions.find(a => a.row === observation.row)!;
    const definition = assets.bodyAnimation(observation.form, action.action);
    clock = new PetAnimationClock({ row: { row: definition.row, holds: definition.cells.map(c => c.holdTicks), loops: true } }, 'row');
    clocks.set(key, clock);
  }
  const entered = clock.snapshot();
  assert.equal(entered.column, observation.events[0].column, key);
  assert.equal(entered.remainingHoldCount, observation.events[0].count, key);
  clock.advance(1000 / 24, 24);
}
assert.equal(nativeClocks.length, 702);
assert.equal(petTurtleBundleAssets.length, 650);
assert.equal(sceneAssetBundles['pet-turtle'].assets, petTurtleBundleAssets);
for (const asset of petTurtleBundleAssets) assert.equal(runtimeAssetBundleOwners.get(asset.key), 'pet-turtle');
const expected: { mode: string; nativeId: string; nativeSha256: string; expectedSha256: string; exceptionPixels: number }[] = load('visual-oracle.json');
assert.equal(expected.length, 11572);
const native = new Map(expected.map(row => [`${row.mode}:${row.nativeId}`, row]));
const actual = [];
for (const [mode, pack] of assets.packages) for (const state of pack.states) {
  const oracle = native.get(`${mode}:${state.nativeId}`); assert(oracle, state.id);
  assert.match(oracle.nativeSha256, /^[a-f0-9]{64}$/);
  if (!oracle.exceptionPixels) assert.equal(oracle.nativeSha256, oracle.expectedSha256, state.id);
  native.delete(`${mode}:${state.nativeId}`);
  const sha256 = hash(renderTurtleState(assets, assets.state(state.id)));
  assert.equal(sha256, oracle.expectedSha256, state.id);
  actual.push({ id: state.id, sha256, nativeSha256: oracle.nativeSha256, differentPixels: oracle.exceptionPixels });
  if (actual.length % 2000 === 0) console.log('TS visual', actual.length);
}
assert.equal(native.size, 0);
assert.equal(actual.filter(r => r.differentPixels).length, 28);
assert.equal(actual.reduce((n, r) => n + r.differentPixels, 0), 308);

const planeOracle = load('plane-oracle.json') as Record<string, { width: number; height: number; sha256: string }>;
assert.deepEqual(Object.keys(assets.collision.data.mapping).sort(), Object.keys(planeOracle).sort());
const planeHashes = new Map<Uint8Array, string>();
for (const [name, oracle] of Object.entries(planeOracle)) {
  const plane = assets.collision.plane(name);
  assert.equal(plane.width, oracle.width, name); assert.equal(plane.height, oracle.height, name);
  if (!planeHashes.has(plane.bits)) planeHashes.set(plane.bits, hash(plane.bits));
  assert.equal(planeHashes.get(plane.bits), oracle.sha256, name);
}
const collisionReports = [];
for (const [mode, count] of [['full', 94656], ['dynamic', 31344], ['dynamic-call', 31704]] as const) {
  let cases = 0, pixels = 0, exceptions = 0, differentCases = 0;
  for await (const line of createInterface({ input: createReadStream(`${out}/${mode}-oracle.jsonl`), crlfDelay: Infinity })) {
    const row = JSON.parse(line) as TurtleCollisionSample & { id: string; actual: boolean; expectedSha256: string; exceptionPixels: number };
    const sample = assets.collision.sample(row);
    assert.equal(sample.hit, row.actual, `${mode}/${row.id} hit`);
    assert.equal(hash(sample.bits), row.expectedSha256, `${mode}/${row.id} pixels`);
    pixels += sample.bits.length; exceptions += row.exceptionPixels; differentCases += Number(row.exceptionPixels > 0); cases++;
    if (cases % 20000 === 0) console.log('TS collision', mode, cases);
  }
  assert.equal(cases, count);
  assert.equal(exceptions, mode === 'full' ? 70 : 0);
  assert.equal(differentCases, mode === 'full' ? 20 : 0);
  collisionReports.push({ mode, cases, pixels, differentCases, differentPixels: exceptions, booleanMismatches: 0 });
}

// Input faults must fail loudly, not select a neighboring frame or transparent shape.
assert.throws(() => assets.state('body:missing'));
assert.throws(() => assets.body(1, 0, 999, 0, 'P1'));
assert.throws(() => assets.bodyAnimation(0, 'wait'));
assert.throws(() => assets.collision.plane('fields/missing-0'));
for (const profile of assets.collision.data.profiles) {
  for (const tick of Object.keys(profile.fixture.phaseMap[profile.symbol]!)) {
    for (const scale of profile.scales) for (const sign of [-1, 1] as const) assets.collision.fieldAt(profile.symbol, Number(tick), scale as 1 | 2, sign);
  }
}
assert.throws(() => assets.collision.fieldAt('PetTurtle1Bullet1', 10000, 1, 1));
for (let form = 1; form <= 4; form++) for (const action of turtleManifest.bodyAnimations[form - 1]!.actions) {
  const definition = assets.bodyAnimation(form, action.action);
  assert.equal(definition.cells.reduce((n, c) => n + c.holdTicks, 0), definition.totalHostTicks);
  for (const cell of definition.cells) for (const owner of ['P1', 'P2'] as const) for (const direct of [0, 1] as const) {
    assets.body(form, definition.row, cell.column, direct, owner);
  }
}
const body = assets.body(1, 0, 0, 0, 'P1');
const original = turtleDrawParts(body)[0]!;
const moved = turtleDrawParts(body, { root: { x: 317, y: 341 } })[0]!;
assert.equal(moved.x - original.x, 17); assert.equal(moved.y - original.y, -9);
assert.equal(hash(renderTurtleState(assets, body, { root: { x: 1300, y: 550 } }, 940, 590, { x: 1000, y: 200 })),
  hash(renderTurtleState(assets, body)), 'world outside initial canvas follows explicit camera viewport');
assert.throws(() => turtleDrawParts(body, { wrongOwner: { x: 0, y: 0 } }));
assert.throws(() => turtleDrawParts(body, { root: { x: 300.1, y: 350 } }));
const buff = [...assets.states.values()].find(s => s.id.startsWith('buff:') && s.groups.length > 1 && s.groups.some(g => g.components.length))!;
const origins = turtleOwnerOrigins(buff); const owner = buff.groups[1]!.ownerPath, origin = origins.get(owner)!;
const before = turtleDrawParts(buff), after = turtleDrawParts(buff, { [owner]: { x: origin.x + 23, y: origin.y } });
assert(before.some(p => p.ownerPath !== owner));
for (let i = 0; i < before.length; i++) assert.equal(after[i]!.x - before[i]!.x, before[i]!.ownerPath === owner ? 23 : 0);

// Observable projection mutations: oracle is native and never recomputed from these candidates.
const rejected: string[] = [];
const rejectVisual = (name: string, source: TurtleVisualState, candidate: TurtleVisualState) => {
  assert.notEqual(hash(renderTurtleState(assets, candidate)), hash(renderTurtleState(assets, source)), name);
  rejected.push(name);
};
rejectVisual('wrong-direction', body, assets.body(1, 0, 0, 1, 'P1'));
rejectVisual('registration', body, { ...body, groups: body.groups.map(g => ({ ...g,
  paintParts: g.paintParts.map(p => ({ ...p, origin: { x: p.origin.x + 1, y: p.origin.y } })) })) });
rejectVisual('duplicate-components', buff, { ...buff, groups: buff.groups.map(g => ({ ...g, paintParts: [...g.paintParts, ...g.components] })) });
const layered = [...assets.states.values()].find(s => s.groups.some(g => g.paintParts.length > 1)
  && hash(renderTurtleState(assets, { ...s, groups: s.groups.map(g => ({ ...g, paintParts: [...g.paintParts].reverse() })) })) !== hash(renderTurtleState(assets, s)))!;
assert(layered, 'need observable depth fixture');
rejectVisual('paint-depth', layered, { ...layered, groups: layered.groups.map(g => ({ ...g, paintParts: [...g.paintParts].reverse() })) });
const missingPhase = structuredClone(assets.collision.data);
delete (missingPhase.mapping as Record<string, string>)[Object.keys(missingPhase.mapping).find(k => k.startsWith('tiles/'))!];
assert.throws(() => new PetTurtleCollisionAssets(missingPhase)); rejected.push('missing-tile-phase');
const missingTarget = structuredClone(assets.collision.data);
delete (missingTarget.mapping as Record<string, string>)[Object.keys(missingTarget.mapping).find(k => k.startsWith('targets/'))!];
assert.throws(() => new PetTurtleCollisionAssets(missingTarget)); rejected.push('missing-target-phase');
const imageId = body.groups[0]!.paintParts[0]!.image, image = assets.images.get(imageId)!;
const correctPixels = image.rgba.slice();
for (let i = 3; i < image.rgba.length; i += 4) image.rgba[i] = Math.floor(image.rgba[i]! / 2);
assert.notEqual(hash(renderTurtleState(assets, body)), actual.find(r => r.id === body.id)!.sha256); rejected.push('duplicate-alpha');
image.rgba.set(correctPixels);

writeFileSync(`${out}/production-verification.json`, JSON.stringify({ status: 'passed', visual: actual,
  visualStates: actual.length, visualDifferentStates: 28, visualDifferentPixels: 308,
  nativeBodyClockSteps: nativeClocks.length,
  planes: Object.keys(planeOracle).length, collision: collisionReports, rejected,
  manifestSha256: hash(readFileSync('public/assets/pets/turtle/manifest.json')) }));
console.log('Turtle production resources: 11572 states / 61424 phases / 157704 native cases passed.');
