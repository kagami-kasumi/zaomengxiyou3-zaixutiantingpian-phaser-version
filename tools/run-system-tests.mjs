import { rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import * as esbuild from 'esbuild';

const repoRoot = path.resolve(import.meta.dirname, '..');
const outDir = path.join(repoRoot, '.tmp', 'system-tests');
const bundledTest = path.join(outDir, 'system-tests.mjs');

rmSync(outDir, { recursive: true, force: true });
await esbuild.build({
  entryPoints: [path.join(repoRoot, 'tools', 'system-tests.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: bundledTest,
  logLevel: 'silent',
});

await import(pathToFileURL(bundledTest).href);
