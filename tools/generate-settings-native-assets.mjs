import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(
  repoRoot,
  'local-resources/regima/task-outputs/task-settings-066-map-services',
);
const outputRoot = path.join(repoRoot, 'public/assets/ui/map-services/settings');
const rootSource = path.join(
  sourceRoot,
  'svg/settings/DefineSprite_148_export.setmenu.gameSetting/1.svg',
);
const closeSource = path.join(
  sourceRoot,
  'deep-settings/buttons/DefineButton2_144/combined.svg',
);

await mkdir(outputRoot, { recursive: true });

const rootSvg = await readFile(rootSource, 'utf8');
const staticRootSvg = rootSvg
  .replace(/\s*<use[^>]+id="xClick"[^>]*\/>/g, '')
  .replace(/\s*<use[^>]+id="(?:difficulty|bgmStay|skillStay|quality|defaultVol)"[^>]*\/>/g, '');
await writeFile(path.join(outputRoot, 'root-static.svg'), staticRootSvg, 'utf8');

const closeSvg = await readFile(closeSource, 'utf8');
for (const state of ['up', 'over', 'down']) {
  const lockedState = `
    .button-frame { opacity: 0 !important; }
    .button-frame-${state} { opacity: 1 !important; }
`;
  await writeFile(
    path.join(outputRoot, `close-${state}.svg`),
    closeSvg.replace(']]></style>', `${lockedState}]]></style>`),
    'utf8',
  );
}

console.log(`Generated native settings assets in ${path.relative(repoRoot, outputRoot)}`);
