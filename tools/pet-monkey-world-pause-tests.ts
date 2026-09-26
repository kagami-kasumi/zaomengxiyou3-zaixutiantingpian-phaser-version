import assert from 'node:assert/strict';
import { collectMonkeyWorldPauseCases } from './pet-monkey-world-pause-fixture';
const cases = collectMonkeyWorldPauseCases();
assert.equal(cases.length, 384);
assert.deepEqual(cases.filter(c => c.firstMismatch !== undefined || c.firstPhaseMismatch !== undefined), []);
console.log('384 monkey private-effect ordinary pause/natural cases matched native cleanup, motion and recursive collision phases; actual damage/canvas excluded.');
