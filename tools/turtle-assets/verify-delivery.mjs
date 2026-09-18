/** Standalone delivery check: consumes only versioned public assets and dist. */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const publicRoot = resolve(root, 'public');
const directory = resolve(publicRoot, 'assets/pets/turtle');
const hash = (data) => createHash('sha256').update(data).digest('hex');
const manifest = JSON.parse(readFileSync(resolve(directory, 'manifest.json')));
const asset = (url) => resolve(publicRoot, `.${url}`);
const ids = new Set();
for (const [name, record] of Object.entries(manifest.packages)) {
  const bytes = readFileSync(asset(record.path));
  assert.equal(hash(bytes), record.sha256);
  const decoded = JSON.parse(gunzipSync(bytes));
  if (['body', 'effects', 'dynamic', 'buff'].includes(name)) {
    assert.equal(decoded.states.length, record.states);
    for (const state of decoded.states) {
      assert(!ids.has(state.id));
      ids.add(state.id);
      for (const group of state.groups) {
        for (const part of [...group.paintParts, ...group.components]) {
          assert(manifest.images[part.image]);
        }
      }
    }
  } else if (name === 'collision') {
    assert.equal(decoded.fields.length, 464);
    for (const plane of Object.values(decoded.planes)) {
      assert.equal(Buffer.from(plane.bits, 'base64').length, Math.ceil(plane.width * plane.height / 8));
    }
    for (const id of Object.values(decoded.mapping)) assert(decoded.planes[id]);
  }
}
assert.equal(ids.size, 11572);
assert.equal(new Set(manifest.contracts.map((c) => c.contractId)).size, 32);
for (const record of Object.values(manifest.images)) {
  const bytes = readFileSync(asset(record.path));
  assert.equal(hash(bytes), record.sha256);
  assert.equal(bytes.readUInt32BE(16), record.width);
  assert.equal(bytes.readUInt32BE(20), record.height);
}
const files = readdirSync(directory, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => resolve(entry.parentPath, entry.name));
for (const file of files) {
  const built = resolve(root, 'dist', relative(publicRoot, file));
  assert.equal(hash(readFileSync(file)), hash(readFileSync(built)));
}
const report = { status: 'passed', files: files.length, states: ids.size, localEvidenceRequired: false };
mkdirSync(resolve(root, 'docs/tasks/evidence/TASK-SLICE-223'), { recursive: true });
writeFileSync(resolve(root, 'docs/tasks/evidence/TASK-SLICE-223/delivery-verification.json'), JSON.stringify(report) + '\n');
console.log(report);
