import { build } from 'esbuild';
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { mutations, mutationPlugin } from './incoming-feedback-runtime-mutations.mjs';

mkdirSync('.tmp/incoming-feedback-runtime-mutations', { recursive: true });
const killed = [];
for (const mutation of mutations) {
  let command;
  if (mutation.browser) {
    command = ['tools/run-incoming-feedback-runtime-browser.mjs', '--mutation', mutation.name];
  } else {
    const outfile = `.tmp/incoming-feedback-runtime-mutations/${mutation.name}.mjs`;
    await build({ entryPoints: ['tools/incoming-feedback-runtime-tests.ts'], bundle: true, platform: 'node', format: 'esm',
      outfile, logLevel: 'silent', plugins: [mutationPlugin(mutation)] });
    command = [outfile];
  }
  const result = spawnSync(process.execPath, command, { encoding: 'utf8', windowsHide: true });
  assert.notEqual(result.status, 0, `escaped mutation: ${mutation.name}`);
  assert.match(result.stderr, /AssertionError/, `not an assertion failure: ${mutation.name}\n${result.stderr}`);
  killed.push(mutation.name);
}
mkdirSync('docs/tasks/evidence/TASK-SLICE-216B', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SLICE-216B/producer-mutations.json', JSON.stringify({
  scope: 'In-memory production settlement and real browser consumer mutations; historical evidence and source files unmodified', killed,
}, null, 2) + '\n');
console.log(`216B: ${killed.length} settlement/owner/consumer mutations killed`);
