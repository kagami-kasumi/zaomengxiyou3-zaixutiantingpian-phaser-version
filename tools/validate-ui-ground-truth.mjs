import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const schemaPath = path.join(root, 'docs/reverse-engineering/ground-truth/schema/ui-ground-truth.schema.json');
const manifestDirectory = path.join(root, 'docs/reverse-engineering/ground-truth/manifests');
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const targets = process.argv.slice(2);
const manifestPaths = (targets.length ? targets : readdirSync(manifestDirectory)
  .filter((name) => name.endsWith('.json'))
  .map((name) => path.join(manifestDirectory, name)))
  .map((target) => path.isAbsolute(target) ? target : path.join(root, target));

function resolveRef(ref) {
  if (!ref.startsWith('#/')) throw new Error(`Only local schema refs are supported: ${ref}`);
  return ref.slice(2).split('/').reduce((value, key) => value[key.replaceAll('~1', '/').replaceAll('~0', '~')], schema);
}

function typeMatches(value, expected) {
  if (expected === 'null') return value === null;
  if (expected === 'array') return Array.isArray(value);
  if (expected === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  if (expected === 'integer') return Number.isInteger(value);
  if (expected === 'number') return typeof value === 'number' && Number.isFinite(value);
  return typeof value === expected;
}

function validate(value, rule, location, errors, probe = false) {
  const localErrors = probe ? [] : errors;
  if (rule.$ref) return validate(value, resolveRef(rule.$ref), location, localErrors, probe);
  if (rule.allOf) for (const child of rule.allOf) validate(value, child, location, localErrors, probe);
  if (rule.if) {
    const conditionErrors = [];
    validate(value, rule.if, location, conditionErrors, true);
    validate(value, conditionErrors.length === 0 ? rule.then ?? {} : rule.else ?? {}, location, localErrors, probe);
  }
  if (rule.const !== undefined && JSON.stringify(value) !== JSON.stringify(rule.const)) localErrors.push(`${location}: expected const ${JSON.stringify(rule.const)}`);
  if (rule.enum && !rule.enum.some((candidate) => JSON.stringify(candidate) === JSON.stringify(value))) localErrors.push(`${location}: value is not in enum`);
  if (rule.type) {
    const expectedTypes = Array.isArray(rule.type) ? rule.type : [rule.type];
    if (!expectedTypes.some((expected) => typeMatches(value, expected))) {
      localErrors.push(`${location}: expected ${expectedTypes.join('|')}`);
      return localErrors;
    }
  }
  if (typeof value === 'string') {
    if (rule.minLength !== undefined && value.length < rule.minLength) localErrors.push(`${location}: shorter than minLength`);
    if (rule.pattern && !(new RegExp(rule.pattern).test(value))) localErrors.push(`${location}: does not match ${rule.pattern}`);
    if (rule.format === 'date-time' && Number.isNaN(Date.parse(value))) localErrors.push(`${location}: invalid date-time`);
  }
  if (typeof value === 'number') {
    if (rule.minimum !== undefined && value < rule.minimum) localErrors.push(`${location}: below minimum`);
    if (rule.exclusiveMinimum !== undefined && value <= rule.exclusiveMinimum) localErrors.push(`${location}: below exclusiveMinimum`);
  }
  if (Array.isArray(value)) {
    if (rule.minItems !== undefined && value.length < rule.minItems) localErrors.push(`${location}: fewer than minItems`);
    if (rule.maxItems !== undefined && value.length > rule.maxItems) localErrors.push(`${location}: more than maxItems`);
    if (rule.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) localErrors.push(`${location}: items are not unique`);
    if (rule.items) value.forEach((item, index) => validate(item, rule.items, `${location}[${index}]`, localErrors, probe));
  }
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of rule.required ?? []) if (!(key in value)) localErrors.push(`${location}: missing required ${key}`);
    if (rule.minProperties !== undefined && Object.keys(value).length < rule.minProperties) localErrors.push(`${location}: fewer than minProperties`);
    for (const [key, child] of Object.entries(rule.properties ?? {})) if (key in value) validate(value[key], child, `${location}.${key}`, localErrors, probe);
    const known = new Set(Object.keys(rule.properties ?? {}));
    for (const [key, childValue] of Object.entries(value)) {
      if (known.has(key)) continue;
      if (rule.additionalProperties === false) localErrors.push(`${location}: unexpected property ${key}`);
      else if (rule.additionalProperties && typeof rule.additionalProperties === 'object') validate(childValue, rule.additionalProperties, `${location}.${key}`, localErrors, probe);
    }
  }
  return localErrors;
}

let failed = false;
for (const manifestPath of manifestPaths) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const errors = validate(manifest, schema, '$', []);
  if (errors.length) {
    failed = true;
    console.error(`${path.relative(root, manifestPath)} failed UI ground-truth schema validation:`);
    errors.forEach((error) => console.error(`- ${error}`));
  } else {
    console.log(`${path.relative(root, manifestPath)}: schema valid`);
  }
}
if (failed) process.exit(1);
