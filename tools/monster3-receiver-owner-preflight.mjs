/** Bounded production-owner diagnostic, not a Scene or full receiver acceptance. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
const referencePath = path.join(root, 'docs/reverse-engineering/reference/monster3-reception-contract.json');
const bytes = readFileSync(referencePath);
const reference = JSON.parse(bytes);
assert.equal(reference.status, 'verified-bounded-behavior');
const outfile = path.join(root, '.tmp/monster3-receiver-owner-preflight.mjs');
await build({ stdin: { contents: `
export { createHeroCombat, applyHeroDamage } from './src/systems/HeroCombatSystem';
export { createDamageEvent } from './src/systems/CombatSystem';
`, resolveDir: root, loader: 'ts' }, bundle: true, platform: 'node', format: 'esm', outfile, logLevel: 'silent' });
const api = await import(pathToFileURL(outfile).href);
const unpack = (fields, row) => Object.fromEntries(fields.map((key, i) => [key, row[i]]));
const observations = [];
for (const owner of ['p1', 'p2']) for (const name of ['Role1', 'Role5']) {
  const id = `${name}-${owner}-0-1-hero-action`;
  const index = reference.inputs.rows.findIndex(row => row[0] === id);
  assert(index >= 0);
  const input = unpack(reference.inputs.fields, reference.inputs.rows[index]);
  const expected = unpack(reference.expected.fields, reference.expected.rows[index]);
  assert.equal(expected.id, id);
  // These source fixtures have fixed physical 40, no armor, critical, shield or link.
  // Isolate the HP owner after reception; do not manufacture a receiver implementation.
  assert.equal(input.action, 'hit10_1');
  assert.equal(input.defense, 0); assert.equal(input.critical, 0);
  assert.equal(input.shield, 0); assert.equal(input.link, false);
  const hero = api.createHeroCombat(owner);
  hero.hp = input.hp; hero.maxHp = input.hp;
  const accepted = api.applyHeroDamage(hero, api.createDamageEvent({
    sourceId: 'monster3', targetId: owner, attackId: id, actionName: 'hit1',
    amount: 40, attackKind: 'physics', knockbackX: 6, knockbackY: -5, occurredAtMs: 1000,
  }), 1000);
  assert.equal(accepted, expected.accepted);
  if (name === 'Role1') assert.equal(hero.hp, expected.hp);
  else assert.notEqual(hero.hp, expected.hp);
  observations.push({ id, actionInput: input.action, expectedHp: expected.hp,
    actualHp: hero.hp, accepted, roleActionInputAvailableOnHpOwner: false });
}
const output = path.join(root, 'docs/tasks/evidence/TASK-SLICE-249');
mkdirSync(output, { recursive: true });
writeFileSync(path.join(output, 'receiver-owner-preflight.json'), JSON.stringify({
  status: 'shared-receiver-owner-gap-confirmed',
  referenceSha256: createHash('sha256').update(bytes).digest('hex'), observations,
  limitations: ['Direct existing HP-owner boundary, not natural skills, geometry or a Scene journey.',
    'Role/action is deliberately reported as unavailable; no invented field is supplied.',
    'Initial HP is fixture setup; the production applyHeroDamage call performs the observed HP change.',
    'Pet synchronous acceptance is a static interface finding, not dynamically verified here.'],
}, null, 2) + '\n');
console.log(`249 receiver owner: ${observations.length} observations; Role1 controls agree, Role5 action HP differs for both owners.`);
