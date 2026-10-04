import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createPetRuntime } from '../src/systems/PetRuntimeSystem';
import { attachPetReceptionBody } from '../src/systems/PetReceptionBodyOwner';
import type { PetReceptionBodyEntry } from '../src/systems/PetReceptionBodyClock';
import type { PetState } from '../src/systems/PetTypes';
import type { MonsterDamageRequest } from '../src/systems/MonsterDamageReception';

const truth = JSON.parse(readFileSync('docs/reverse-engineering/ground-truth/manifests/task-settings-254-pet-reception-behavior.json', 'utf8'));
const seed = createSeedPetRoster().pets[0]!;
function setup(form: string, entry?: PetReceptionBodyEntry) {
  const match = /^(\w+)([1-4])$/.exec(form)!;
  const pet = { ...structuredClone(seed), id: form, species: match[1] as PetState['species'],
    form: Number(match[2]), hp: 100, maxHp: 100, lifetime: 5, def: 0, skills: [],
    missRate: 0, magicDefenseRate: 0 };
  const runtime = createPetRuntime(pet, { x: 0, y: 0, facingX: 1 });
  let statics = 0, released = 0, cleanup = 0, counter = 0;
  const ports = { setStatic: () => { statics++; }, release: () => { released++; },
    cleanup: (kind: string) => { if (kind === 'phoenix-aoyi') cleanup++; }, counter: () => { counter++; } };
  const owner = attachPetReceptionBody(pet, runtime, ports, entry);
  return { owner, pet, runtime, ports,
    snap: () => { const s = owner.snapshot(); return { hp: pet.hp, lifetime: pet.lifetime,
      action: s.action, state: s.action, x: s.column, y: s.row, hold: s.remainingHoldCount,
      key: s.keyFrameIndex, protection: s.protectionCount, isProtected: s.protectedFromHits,
      dead: s.phase === 'released', statics, cleanup, counter, released }; } };
}
function request(power: number, fps: number): MonsterDamageRequest {
  return { source: { boss: false, hit: 0, criticalPercent: 0, magicDefenseReduction: 0,
    flower: false, random: () => 0.9 }, sourceId: 'original-reception-fixture', attackId: 'attack',
    actionName: 'hit1', power, attackKind: 'physical', geometryHit: true, bingo: false,
    difficulty: 2, timeMs: 0, hostFps: fps, knockbackX: 0, knockbackY: 0 };
}
let states = 0;
for (const c of truth.receptions) {
  const [form, , , action, rate] = c.id.split(':');
  const fps = Number(rate), s = setup(form);
  s.owner.receive(request(action === 'dead' ? 100 : 1, fps));
  for (const expected of c.states) {
    if (expected.tick === 3 && action === 'hurt') s.owner.receive(request(1, fps));
    if (expected.tick) s.owner.update(1000 / fps, fps);
    const actual = s.snap();
    for (const [key, value] of Object.entries(expected)) {
      if (key === 'tick' || (expected.dead && ['protection', 'isProtected'].includes(key))) continue;
      assert.equal(actual[key as keyof typeof actual], value, `${c.id}/${expected.tick}/${key}`);
    }
    if (expected.dead) {
      assert.equal(actual.protection, -1); assert.equal(actual.isProtected, false);
      assert.equal(actual.released, 1, 'Real owner release clears protection, unlike the source-clock destroy sink');
    }
    states++;
  }
}
for (const c of truth.guards) {
  const [form, , action, rate] = c.id.split(':');
  const s = setup(form, { action: 'hit2', row: c.before.y, column: c.before.x });
  s.owner.receive(request(action === 'dead' ? 300 : 3, Number(rate)));
  const actual = s.snap();
  for (const [key, value] of Object.entries(c.after)) if (key !== 'tick') {
    assert.equal(actual[key as keyof typeof actual], value, `${c.id}/${key}`);
  }
}
for (const c of truth.protection) {
  const s = setup('ufo1'); s.owner.protectFromHits(c.fps * 5);
  for (const expected of c.states) {
    if (expected.tick) s.owner.update(1000 / c.fps, c.fps);
    assert.equal(s.owner.snapshot().protectionCount, expected.count);
    assert.equal(s.owner.snapshot().protectedFromHits, expected.isProtected);
  }
}
// Use different actual owners, deliberately with the same pet id, as in saves.
for (const fps of [20, 24, 30]) {
  const p1 = setup('ufo1'), p2 = setup('ufo1');
  let reads = 0;
  const target = p1.owner.target(() => true, () => { reads++; return undefined; });
  const before = p1.pet.hp;
  target.receive(request(1, fps));
  assert.equal(p1.pet.hp, before - 1); assert.equal(p2.pet.hp, 100);
  p1.owner.release('owner-exit');
  delete p1.pet.missRate;
  target.receive(request(1, fps));
  assert.equal(reads, 1); assert.equal(p1.pet.hp, before - 1);
  assert.equal(p1.snap().released, 1); assert.equal(p2.snap().released, 0);
  const replacement = { ...p2.pet, hp: 80 };
  const stale = p2.owner.target(() => true, () => { throw new Error('Stale target queried counter'); });
  const next = attachPetReceptionBody(replacement, p2.runtime, p2.ports);
  stale.receive(request(1, fps));
  assert.equal(replacement.hp, 80); assert.equal(p2.pet.hp, 100);
  next.target(() => true, () => undefined).receive(request(1, fps));
  assert.equal(replacement.hp, 79);
}
console.log(`Pet reception owner: ${states} native reception states, 24 guards, 3 protection clocks and dual-owner stale-target isolation passed.`);
