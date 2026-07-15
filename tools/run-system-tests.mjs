import { rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import * as esbuild from 'esbuild';

const repoRoot = path.resolve(import.meta.dirname, '..');
const outDir = path.join(repoRoot, '.tmp', 'system-tests');
const bundledTests = ['system-tests', 'crafting-tests'];

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
