import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { build } from 'esbuild';

const root = process.cwd();
const outputDir = path.resolve(root, '.tmp/pet-capture-identity');
assert.ok(outputDir.startsWith(path.resolve(root, '.tmp') + path.sep));
mkdirSync(outputDir, { recursive: true });
const mutations = [
  ['roster-length-id', 'PetRosterSystem.ts',
    'id: `${ownerPrefix}pet-${definition.petName}-${serial}`,',
    'id: `pet-${definition.petName}-${roster.pets.length + 1}`,'],
  ['missing-capture-prefix', 'PetRosterSystem.ts',
    "const ownerPrefix = roster.ownerSlot === 'p2' ? 'p2-' : '';", "const ownerPrefix = '';"],
  ['lost-restored-owner', 'SaveSystem.ts', '    ownerSlot,\n', ''],
];
const rows = [];
try {
  for (const [name, file, before, after] of mutations) {
    let applied = false;
    const outfile = path.join(outputDir, `${name}.mjs`);
    await build({ entryPoints: ['tools/pet-capture-identity-tests.ts'], outfile,
      bundle: true, platform: 'node', format: 'esm', logLevel: 'silent',
      plugins: [{ name: 'in-memory-mutation', setup(builder) {
        builder.onLoad({ filter: /src[\\/]systems[\\/].*\.ts$/ }, args => {
          if (path.basename(args.path) !== file) return;
          const original = readFileSync(args.path, 'utf8').replaceAll('\r\n', '\n');
          assert.equal(original.split(before).length - 1, 1, `${name}: unique replacement`);
          applied = true;
          return { contents: original.replace(before, after), loader: 'ts' };
        });
      } }],
    });
    assert.ok(applied);
    const result = spawnSync(process.execPath, [outfile], { encoding: 'utf8', cwd: root });
    assert.notEqual(result.status, 0, `${name}: mutant must fail`);
    assert.match(result.stderr, /AssertionError/, `${name}: semantic assertion, not infrastructure failure`);
    rows.push({ name, status: 'rejected', exitCode: result.status });
  }
} finally {
  rmSync(outputDir, { recursive: true, force: true });
}
mkdirSync('docs/tasks/evidence/TASK-SLICE-234', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SLICE-234/mutations.json', JSON.stringify(rows, null, 2));
console.log(`Pet capture identity: ${rows.length} production mutations rejected.`);
