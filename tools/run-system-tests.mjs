import { rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import * as esbuild from 'esbuild';

const repoRoot = path.resolve(import.meta.dirname, '..');
const outDir = path.join(repoRoot, '.tmp', 'system-tests');
const requestedTests = process.argv.slice(2);
const bundledTests = requestedTests.length > 0
  ? requestedTests
  : [
      'system-tests',
      'crafting-tests',
      'stage11-resource-tests',
      'stage11-flow-tests',
      'stage12-resource-tests',
      'stage12-flow-tests',
      'stage12-traversal-tests',
      'stage12-fb-enter-tests',
      'stage13-resource-tests',
      'stage13-flow-tests',
      'stage13-traversal-tests',
      'stage1-combat-tests',
      'monster-runtime-tests',
    ];

rmSync(outDir, { recursive: true, force: true });
await esbuild.build({
  entryPoints: bundledTests.map((name) => path.join(repoRoot, 'tools', `${name}.ts`)),
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: outDir,
  logLevel: 'silent',
});

for (const name of bundledTests) {
  await import(pathToFileURL(path.join(outDir, `${name}.js`)).href);
}
