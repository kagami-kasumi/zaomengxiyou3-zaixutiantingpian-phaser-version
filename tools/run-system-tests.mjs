import { existsSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import * as esbuild from 'esbuild';
import { turtleLocalInputs } from './turtle-test-registry.mjs';
import { selectSystemTests } from './system-test-suites.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');
const outDir = path.join(repoRoot, '.tmp', 'system-tests');
let selection;
try {
  selection = selectSystemTests(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exit(2);
}
const bundledTests = selection.tests;
console.log(`System tests: ${selection.scope}; ${bundledTests.length} unique groups.`);
if (selection.scope === 'core') console.log('Core regression only; affected specialized tests must be added explicitly. Full acceptance is not implied.');
if (selection.listOnly) {
  console.log(bundledTests.join('\n'));
  process.exit(0);
}

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
  // Check immediately before each test: earlier tests may generate its inputs.
  const missingInputs = turtleLocalInputs([name]).filter(p => !existsSync(path.join(repoRoot, p)));
  if (missingInputs.length) {
    console.error(`LOCAL_INPUT_MISSING: ${name} not covered. See tools/local-validation.md\n${missingInputs.join('\n')}`);
    process.exit(2);
  }
  try {
    await import(pathToFileURL(path.join(outDir, `${name}.js`)).href);
  } catch (error) {
    const missingPath = String(error.path ?? '').replaceAll('\\', '/');
    if (error.code === 'ENOENT' && /(?:docs\/tasks\/evidence\/|local-resources\/)/.test(missingPath)) {
      console.error(`LOCAL_INPUT_MISSING: ${name} not covered: ${missingPath}. See tools/local-validation.md`);
      process.exit(2);
    }
    throw error;
  }
}
