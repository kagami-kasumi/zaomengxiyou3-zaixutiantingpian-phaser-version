import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

import catalog from '../docs/reverse-engineering/reference/equipment-visual-resource-catalog-1.1.json' with { type: 'json' };

const root = path.resolve(import.meta.dirname, '..');
const ffdec = 'C:/Program Files (x86)/FFDec/ffdec-cli.exe';
const outputRoot = path.join(root, 'public/assets/ui/inventory/equipment-preview');
const tempRoot = path.join(root, '.tmp/equipment-preview-export');
const stableFileName = (resource) => `${resource.sourcePackage.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase()}-${resource.characterId}.png`;

const resources = new Map();
for (const item of catalog.items) {
  for (const resource of item.preview.resources ?? []) {
    if (resource.status !== 'located') continue;
    const key = `${resource.sourcePackage}|${resource.characterId}`;
    resources.set(key, resource);
  }
}

function walkFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const target = path.join(directory, name);
    return statSync(target).isDirectory() ? walkFiles(target) : [target];
  });
}

rmSync(tempRoot, { recursive: true, force: true });
rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });

const groups = new Map();
for (const resource of resources.values()) {
  const itemType = resource.definitionTag === 'DefineSprite' ? 'sprite' : 'image';
  const groupKey = `${resource.sourcePackage}|${itemType}`;
  const group = groups.get(groupKey) ?? [];
  group.push(resource);
  groups.set(groupKey, group);
}

for (const [groupKey, group] of groups) {
  const first = group[0];
  const source = path.join(root, 'local-resources/regima/source/restored-swfs', first.sourcePackage);
  const temp = path.join(tempRoot, groupKey.replace(/[^a-zA-Z0-9]+/g, '-'));
  mkdirSync(temp, { recursive: true });
  const itemType = first.definitionTag === 'DefineSprite' ? 'sprite' : 'image';
  const format = itemType === 'sprite' ? 'sprite:png' : 'image:png';
  const ids = group.map((resource) => resource.characterId).join(',');
  const selections = group.map((resource) => `${resource.characterId}:1`).join(',');
  const args = [
    '-onerror', 'abort', '-ignorebackground',
    '-selectid', ids, '-select', selections,
    '-format', format, '-export', itemType, temp, source,
  ];
  const result = spawnSync(ffdec, args, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`FFDec failed for ${groupKey}\n${result.stdout}\n${result.stderr}`);
  }
  const candidates = walkFiles(temp).filter((file) => /\.(png|jpg|jpeg)$/i.test(file));
  for (const resource of group) {
    const chosen = candidates.find((file) =>
      path.basename(file).startsWith(`${resource.characterId}_`)
      || file.replaceAll('\\', '/').includes(`_${resource.characterId}_`)
    );
    if (!chosen) {
      throw new Error(`No raster export for ${resource.sourcePackage}#${resource.characterId}`);
    }
    copyFileSync(chosen, path.join(outputRoot, stableFileName(resource)));
  }
  rmSync(temp, { recursive: true, force: true });
}

console.log(`Integrated ${resources.size} unique equipment preview characters.`);
