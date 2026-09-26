import assert from 'node:assert/strict';
import { collectHorseWorldPauseCases } from './pet-horse-world-pause-fixture';
const rows = collectHorseWorldPauseCases();
assert.equal(rows.length, 624);
assert.deepEqual(rows.filter(r => r.firstMismatch !== undefined || r.firstPhaseMismatch !== undefined), []);
console.log('624 actual horse private owner/world display cases match native ordinary-pause cleanup and recursive collision phase selection; target damage and canvas excluded.');
