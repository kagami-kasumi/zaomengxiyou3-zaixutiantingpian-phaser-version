/** Diagnostic only: use pet-horse-world-pause-tests for the assertion gate. */
import { writeFileSync } from 'node:fs';
import { collectHorseWorldPauseCases } from './pet-horse-world-pause-fixture';
const results = collectHorseWorldPauseCases();
const mismatches = results.filter(r => r.firstMismatch !== undefined || r.firstPhaseMismatch !== undefined);
writeFileSync('docs/tasks/evidence/TASK-SLICE-226/horse-world-pause-preflight.json', JSON.stringify({
  status: 'diagnostic-not-acceptance', cases: results.length, mismatches: mismatches.length, results,
  scope: 'Actual private owner and display port; original removal and recursive collision phase selection. Target damage and canvas excluded.',
}, null, 2)+'\n');
console.log(`Horse world-pause diagnostic: ${mismatches.length}/${results.length} mismatches. Exit 0 means collection succeeded, not acceptance.`);
