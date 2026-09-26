import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

export const manifestDirectory = 'docs/reverse-engineering/ground-truth/manifests';
const schemaDirectory = 'docs/reverse-engineering/ground-truth/schema';
// Older generators predate $schema. Explicit routing ensures malformed or new
// manifests cannot silently fall out of validation.
const legacySchemas = {
  'task-settings-207-pet-monkey-family.json': 'pet-family-ground-truth',
  'task-settings-209-pet-horse-family.json': 'pet-family-ground-truth',
  'task-settings-213-pet-dragon-family.json': 'pet-family-ground-truth',
  'task-settings-222-pet-turtle-family.json': 'pet-family-ground-truth',
  'task-settings-215-player-pet-incoming-damage-feedback.json': 'incoming-number-ground-truth',
  'task-settings-228-pet-monkey-collision-phase.json': 'pet-collision-phase',
  'task-settings-229-pet-horse-collision-phase.json': 'pet-collision-phase',
  'task-settings-230-monster-knockback.json': 'monster-knockback',
};
for (const name of [
  'task-settings-217-pet-ground-environment', 'task-settings-218-dragon1-target-collision',
  'task-settings-219-dragon23-effect-collision', 'task-settings-220-dragon4-trigger-collision',
  'task-settings-222a-pet-turtle-visual', 'task-settings-225-turtle-resource-projection',
  'task-slice-226-horse-pause-display', 'task-slice-226-horse-sp-pause-display',
  'task-slice-226-monkey-horse-ground-colliders', 'task-slice-226-monkey-pause-display',
]) legacySchemas[`${name}.json`] = 'ui-ground-truth';

export function createValidator(root = process.cwd()) {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  for (const name of readdirSync(path.join(root, schemaDirectory)).filter(n => n.endsWith('.schema.json'))) {
    ajv.addSchema(JSON.parse(readFileSync(path.join(root, schemaDirectory, name), 'utf8')), name);
  }
  return (filename, manifest) => {
    const declared = manifest.$schema;
    const legacy = legacySchemas[path.basename(filename)];
    if (declared !== undefined && typeof declared !== 'string') throw new Error('$schema must be a string');
    const schemaName = declared ? path.posix.basename(declared) : `${legacySchemas[path.basename(filename)]}.schema.json`;
    if (legacy && schemaName !== `${legacy}.schema.json`) throw new Error(`Schema declaration conflicts with registered ${legacy} schema`);
    const validate = ajv.getSchema(schemaName);
    if (!validate) throw new Error(`No registered schema for ${filename}; declare a supported $schema`);
    return { schemaName, errors: validate(manifest) ? [] : validate.errors.map(error => `${error.instancePath || '/'}: ${error.message} ${JSON.stringify(error.params)}`) };
  };
}

export function discoverManifests(root = process.cwd(), includeLocal = false) {
  // Stable across clean checkouts and machines with ignored reverse artifacts.
  if (!includeLocal) return execFileSync('git', ['ls-files', '-z', '--', manifestDirectory], { cwd: root, encoding: 'utf8' })
    .split('\0').filter(name => name.endsWith('.json')).sort();
  return readdirSync(path.join(root, manifestDirectory), { recursive: true })
    .filter(name => name.endsWith('.json')).map(name => `${manifestDirectory}/${name.replaceAll('\\', '/')}`).sort();
}
