import { writeFileSync } from 'node:fs';
import { collectMonkeyWorldPauseCases } from './pet-monkey-world-pause-fixture';
const cases = collectMonkeyWorldPauseCases();
const failures = cases.filter(c => c.firstMismatch !== undefined || c.firstPhaseMismatch !== undefined);
writeFileSync('docs/tasks/evidence/TASK-SLICE-226/monkey-world-pause-preflight.json', JSON.stringify({ status: 'diagnostic-only', cases, failures }, null, 2) + '\n');
console.log(`${cases.length} monkey private effect cases, ${failures.length} mismatches; diagnostic completion is not acceptance.`);
console.log(failures.slice(0, 5));
