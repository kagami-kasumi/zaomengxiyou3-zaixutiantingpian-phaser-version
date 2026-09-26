import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import truth from '../src/assets/pet-monkey-horse-damage.json';
import { refreshMonkeyHorseDamage } from '../src/systems/PetMonkeyHorseDamageSystem';

const report = JSON.parse(readFileSync('local-resources/regima/task-outputs/TASK-SLICE-226/damage-air/measurement.json', 'utf8'));
assert.equal(report.status, 'measured');
assert.deepEqual(truth.sources, report.sources);
for (const source of report.sources) assert.equal(createHash('sha256').update(readFileSync(source.path)).digest('hex'), source.sha256);
assert.equal(createHash('sha256').update(readFileSync('local-resources/regima/task-outputs/TASK-SLICE-226/damage-air/DamageProbe.as')).digest('hex'), report.probeSha256);
assert.equal(report.cases.length, 2784);
for (const row of report.cases) {
  let reads = 0;
  const result = refreshMonkeyHorseDamage({ family: row.family, form: row.form, action: row.action,
    attack: row.atk, magic: row.magic, gxp: row.gxp, flower: row.flower, critRate: 0.5 },
  () => { reads++; return row.critical ? 0.25 : 0.75; });
  const { reads: sourceReads, qixue, ...cache } = row.result;
  assert.deepEqual(result, cache, JSON.stringify(row));
  assert.equal(reads, sourceReads); assert.equal(qixue, 0);
}
assert.throws(() => refreshMonkeyHorseDamage({ family: 'monkey', form: 3, action: 'unknown',
  attack: 1, magic: 0, gxp: false, flower: 1, critRate: 0 }, () => 0));
console.log('Monkey/horse damage: 2784 original AIR arithmetic/cache cases passed.');
