import { rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import * as esbuild from 'esbuild';

const repoRoot = path.resolve(import.meta.dirname, '..');
const outDir = path.join(repoRoot, '.tmp', 'crafting-coverage-audit');
const outFile = path.join(outDir, 'crafting-coverage-audit.js');

rmSync(outDir, { recursive: true, force: true });
await esbuild.build({
  entryPoints: [path.join(repoRoot, 'tools', 'crafting-coverage-audit.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: outFile,
  logLevel: 'silent',
});
await import(pathToFileURL(outFile).href);
