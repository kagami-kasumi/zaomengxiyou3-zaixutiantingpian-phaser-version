import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const truth = JSON.parse(readFileSync(path.join(root, 'docs/reverse-engineering/ground-truth/manifests/behavior/task-settings-230-monster-knockback.json'), 'utf8'));
// This is deliberately separate from check:all: original AIR/source data is
// not a clean-checkout dependency. Never turn missing evidence into a pass.
const prerequisites = [...new Set([
  truth.directionObservations.path,
  ...truth.sources.map(row => row.path), ...truth.methods.map(row => row.path),
  ...truth.monsterProfiles.map(row => row.path),
  'local-resources/regima/source/unpacked',
  'D:/AIRsdkmanager/sdk/AIRSDK_51.3.4/bin/adl.exe',
  'D:/AIRsdkmanager/sdk/AIRSDK_51.3.4/lib/mxmlc-cli.jar',
])];
const missing = prerequisites.filter(file => !existsSync(path.resolve(root, file)));
for (const [command, args] of [['python', ['-c', 'import jsonschema']], ['java', ['-version']]]) {
  const result = spawnSync(command, args, { cwd: root, windowsHide: true, encoding: 'utf8' });
  if (result.error || result.status !== 0) missing.push(`${command} (${args.join(' ')})`);
}
if (missing.length) {
  console.error(`LOCAL_INPUT_MISSING: knockback source verification not covered. See tools/local-validation.md\n${missing.join('\n')}`);
  process.exit(2);
}
for (const args of [
  ['tools/monster-knockback-source/verify.py', '--mutations'],
  ['tools/monster-knockback-source/generate.py', '--check'],
]) {
  const result = spawnSync('python', args, { cwd: root, stdio: 'inherit', windowsHide: true });
  if (result.error || result.status !== 0) {
    console.error(`SOURCE_CHECK_FAILED: python ${args.join(' ')}`, result.error?.message ?? '');
    process.exit(result.status || 1);
  }
}
