import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createValidator, discoverManifests } from './ground-truth-validation.mjs';

// Compatibility entry point: explicit and default inputs dispatch by schema.
// Schema validity does not prove source/runtime parity.
const args = process.argv.slice(2);
const targets = args.filter(arg => arg !== '--local');
const paths = targets.length ? targets : discoverManifests(process.cwd(), args.includes('--local'));
const validate = createValidator();
let failed = 0;
for (const filename of paths) {
  try {
    const manifest = JSON.parse(readFileSync(filename, 'utf8'));
    const result = validate(filename, manifest);
    if (result.errors.length) throw new Error(result.errors.join('\n- '));
    console.log(`${path.relative(process.cwd(), path.resolve(filename))}: ${result.schemaName} valid`);
  } catch (error) {
    failed++;
    console.error(`${filename}: validation failed\n- ${error.message}`);
  }
}
console.log(`Ground truth: ${paths.length - failed}/${paths.length} schema valid (${args.includes('--local') ? 'including local artifacts' : targets.length ? 'explicit targets' : 'tracked manifests only; ignored local artifacts not covered'}).`);
if (failed || paths.length === 0) process.exitCode = 1;
