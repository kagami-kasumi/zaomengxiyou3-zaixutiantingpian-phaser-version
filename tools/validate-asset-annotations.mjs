import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const annotationDir = path.join(root, 'docs/reverse-engineering/asset-annotation/annotations');
const batchDir = path.join(root, 'docs/reverse-engineering/asset-annotation/batches');
const manifestPath = path.join(root, 'src/assets/AssetManifest.ts');
const errors = [];

const requiredHeaders = [
  'stableKey',
  'as3Name',
  'sourceKind',
  'sourcePath',
  'sourcePackage',
  'symbolId',
  'scope',
  'usage',
  'status',
  'confidence',
  'nextAction',
  'note',
];

const allowed = {
  sourceKind: new Set(['script-reference', 'symbol-class', 'image', 'svg-shape', 'frame-capture', 'manual', 'restored-swf']),
  scope: new Set(['hero', 'monster', 'projectile', 'effect', 'ui', 'scene', 'audio']),
  status: new Set([
    'ready',
    'source-corpus-ready',
    'export-ready',
    'derived-ready',
    'placeholder',
    'missing-original',
    'needs-annotation',
    'needs-splitting',
    'rejected',
  ]),
  confidence: new Set(['confirmed', 'probable', 'unknown']),
  nextAction: new Set([
    'locate-symbol',
    'export-selectively',
    'integrate',
    'use-placeholder',
    'request-source',
    'review-candidate',
    'evaluate-splitting',
    'none',
  ]),
};

const requiredBatches = [
  'role1-normal-attack.md',
  'hero-normal-attacks.md',
  'hero-skill-effects.md',
  'magic-weapon-effects.md',
  'pet-skill-effects.md',
  'monster30.md',
  'stage11.md',
  'modern-ui-assets.md',
];

const additionalScopeKeys = [
  'hero-animation.hero1.body-family',
  'hero-animation.hero2.body-family',
  'hero-animation.hero3.body-family',
  'hero-animation.hero4.shovel-body-family',
  'hero-animation.hero4.arrow-body-family',
  ...['spear', 'sword'].flatMap((mode) =>
    ['attack1', 'attack2', 'attack3', 'attack4', 'jumpattack', 'runattack']
      .map((action) => `hero-animation.hero5.${mode}.${action}`),
  ),
  'monster.monster30.body',
  'normal-attack-effect.monster30.hit1',
  'stage.stage1-1.layout',
  'stage.stage1-1.background',
  'stage.stage1.floor',
  'stage.stage1-1.listener',
];

function parseCsv(text, file) {
  const records = [];
  let record = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      record.push(field);
      field = '';
    } else if (char === '\n') {
      record.push(field.replace(/\r$/, ''));
      if (record.some((value) => value.length > 0)) records.push(record);
      record = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (quoted) errors.push(`${file}: unterminated quoted field`);
  if (field.length > 0 || record.length > 0) {
    record.push(field.replace(/\r$/, ''));
    records.push(record);
  }
  return records;
}

function manifestKeys() {
  const text = readFileSync(manifestPath, 'utf8');
  const names = [
    'HeroNormalAttackEffectKeys',
    'SkillProjectileEffectKeys',
    'MagicWeaponEffectKeys',
    'PetSkillEffectKeys',
  ];
  const keys = [];
  for (const name of names) {
    const match = text.match(new RegExp(`export const ${name} = \\{([\\s\\S]*?)\\n\\} as const;`));
    if (!match) {
      errors.push(`AssetManifest.ts: cannot find ${name}`);
      continue;
    }
    keys.push(...[...match[1].matchAll(/^\s+\w+:\s+'([^']+)'/gm)].map((entry) => entry[1]));
  }
  return keys;
}

if (!existsSync(annotationDir)) errors.push('Missing annotation directory');
if (!existsSync(batchDir)) errors.push('Missing batch directory');
if (!existsSync(manifestPath)) errors.push('Missing src/assets/AssetManifest.ts');

const rows = [];
if (existsSync(annotationDir)) {
  const files = readdirSync(annotationDir).filter((file) => file.endsWith('.csv')).sort();
  for (const file of files) {
    const records = parseCsv(readFileSync(path.join(annotationDir, file), 'utf8'), file);
    if (records.length < 2) {
      errors.push(`${file}: must contain a header and at least one annotation`);
      continue;
    }
    const headers = records[0];
    if (headers.join('|') !== requiredHeaders.join('|')) {
      errors.push(`${file}: header does not match annotation-schema.md`);
      continue;
    }
    for (let index = 1; index < records.length; index += 1) {
      const values = records[index];
      if (values.length !== headers.length) {
        errors.push(`${file}:${index + 1}: expected ${headers.length} fields but found ${values.length}`);
        continue;
      }
      rows.push({ file, line: index + 1, ...Object.fromEntries(headers.map((header, column) => [header, values[column]])) });
    }
  }
}

const keyOwners = new Map();
for (const item of rows) {
  const label = `${item.file}:${item.line}`;
  for (const field of ['stableKey', 'sourceKind', 'scope', 'usage', 'status', 'confidence', 'nextAction']) {
    if (!item[field]) errors.push(`${label}: ${field} is required`);
  }
  for (const field of Object.keys(allowed)) {
    if (item[field] && !allowed[field].has(item[field])) errors.push(`${label}: invalid ${field} ${item[field]}`);
  }
  if (keyOwners.has(item.stableKey)) {
    errors.push(`${label}: duplicate stableKey ${item.stableKey}; first seen at ${keyOwners.get(item.stableKey)}`);
  } else {
    keyOwners.set(item.stableKey, label);
  }
  if (['confirmed', 'probable'].includes(item.confidence) && !item.sourcePath) {
    errors.push(`${label}: ${item.confidence} annotation requires sourcePath`);
  }
  if (item.confidence === 'confirmed' && !item.as3Name) {
    errors.push(`${label}: confirmed annotation requires as3Name`);
  }
  for (const source of item.sourcePath.split(';').filter(Boolean)) {
    if (!source.startsWith('human:') && !existsSync(path.join(root, source))) {
      errors.push(`${label}: sourcePath does not exist: ${source}`);
    }
  }
  if (item.status === 'missing-original' && item.nextAction !== 'request-source') {
    errors.push(`${label}: missing-original must use request-source`);
  }
  if (item.status === 'source-corpus-ready' && item.nextAction !== 'locate-symbol') {
    errors.push(`${label}: source-corpus-ready must use locate-symbol`);
  }
  if (item.status === 'export-ready') {
    if (item.nextAction !== 'export-selectively') {
      errors.push(`${label}: export-ready must use export-selectively`);
    }
    if (!item.sourcePackage) {
      errors.push(`${label}: export-ready requires sourcePackage`);
    }
  }
  if (item.status === 'derived-ready' && item.nextAction !== 'integrate') {
    errors.push(`${label}: derived-ready must use integrate`);
  }
  if (item.status === 'needs-splitting' && item.nextAction !== 'evaluate-splitting') {
    errors.push(`${label}: needs-splitting must use evaluate-splitting`);
  }
  if (item.status === 'rejected' && item.nextAction !== 'none') {
    errors.push(`${label}: rejected must use none`);
  }
}

const requiredKeys = [...manifestKeys(), ...additionalScopeKeys];
for (const key of requiredKeys) {
  if (!keyOwners.has(key)) errors.push(`Missing required annotation: ${key}`);
}

for (const batch of requiredBatches) {
  if (!existsSync(path.join(batchDir, batch))) errors.push(`Missing required batch record: ${batch}`);
}
const projectStatusPath = path.join(root, 'docs/reverse-engineering/asset-annotation/project-status.md');
if (!existsSync(projectStatusPath)) {
  errors.push('Missing asset annotation project status');
} else if (!readFileSync(projectStatusPath, 'utf8').includes(`总计 ${rows.length} 条标注`)) {
  errors.push(`project-status.md does not report the current total of ${rows.length} annotations`);
}
if (!existsSync(path.join(root, 'docs/reverse-engineering/asset-annotation/implementation-findings.md'))) {
  errors.push('Missing asset annotation implementation findings');
}

if (errors.length > 0) {
  console.error('Asset annotation validation failed:');
  for (const message of errors) console.error(`- ${message}`);
  process.exit(1);
}

const countBy = (field) => Object.fromEntries(
  [...new Set(rows.map((item) => item[field]))].sort().map((value) => [value, rows.filter((item) => item[field] === value).length]),
);
console.log('Asset annotation validation passed.');
console.log(`- annotations: ${rows.length}`);
console.log(`- manifest keys covered: ${manifestKeys().length}`);
console.log(`- status: ${JSON.stringify(countBy('status'))}`);
console.log(`- confidence: ${JSON.stringify(countBy('confidence'))}`);
