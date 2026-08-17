import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(
  repoRoot,
  'local-resources/regima/task-outputs/task-settings-066-map-services',
);
const outputRoot = path.join(repoRoot, 'public/assets/ui/map-services/tasks');
const rootSource = path.join(
  sourceRoot,
  'svg/shop-task/DefineSprite_85_export.taskInterface.TaskInterface/1.svg',
);

await mkdir(outputRoot, { recursive: true });

const rootSvg = await readFile(rootSource, 'utf8');
const dynamicRootIds = [
  'dailymc', 'activitymc', 'getaward', 'btn_close',
  't1', 't2', 't3', 't4', 't5',
  'txtinstr', 'txtcur',
  'alist1', 'alist2', 'alist3', 'alist4',
  'prepage', 'nextpage', 'txtpage',
];
const dynamicUsePattern = new RegExp(
  `\\s*<use[^>]+id="(?:${dynamicRootIds.join('|')})"[^>]*\\/>`,
  'g',
);
const staticRootSvg = rootSvg.replace(dynamicUsePattern, '');
await writeFile(path.join(outputRoot, 'root-static.svg'), staticRootSvg, 'utf8');

for (const id of dynamicRootIds) {
  if (staticRootSvg.includes(`id="${id}"`)) {
    throw new Error(`Task static root still contains dynamic child ${id}.`);
  }
}

console.log(`Generated native task assets in ${path.relative(repoRoot, outputRoot)}`);
