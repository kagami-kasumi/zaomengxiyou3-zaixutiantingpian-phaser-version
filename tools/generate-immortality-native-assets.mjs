import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(
  repoRoot,
  'local-resources/regima/task-outputs/task-settings-066-map-services',
);
const outputRoot = path.join(repoRoot, 'public/assets/ui/map-services/immortality');

const rootSource = path.join(
  sourceRoot,
  'svg/immortality/DefineSprite_990_export.immortality.ImmortalityInterface/1.svg',
);
const exchangeSource = path.join(
  sourceRoot,
  'deep-immortality/sprites/DefineSprite_1006_export.immortality.ExchangeImmortality/1.svg',
);

await mkdir(outputRoot, { recursive: true });

const rootSvg = await readFile(rootSource, 'utf8');
const staticRootSvg = rootSvg
  .replace(/\s*<use[^>]+id="(?:txtlh|ef[1-5])"[^>]*\/>/g, '')
  .replace(/\s*<use[^>]+id="eatbtn"[^>]*\/>/g, '');
await writeFile(path.join(outputRoot, 'root-static.svg'), staticRootSvg, 'utf8');
await copyFile(exchangeSource, path.join(outputRoot, 'exchange.svg'));

const buttons = {
  eat: 968,
  back: 973,
  compound: 989,
  close: 997,
};
for (const [name, characterId] of Object.entries(buttons)) {
  for (const [frame, state] of [['1', 'up'], ['2', 'over'], ['3', 'down']]) {
    await copyFile(
      path.join(
        sourceRoot,
        `deep-immortality/buttons-png/DefineButton2_${characterId}/${frame}_${state}.png`,
      ),
      path.join(outputRoot, `${name}-${state}.png`),
    );
  }
}

const owners = {
  1: [218, 'WK'],
  2: [223, 'TS'],
  3: [233, 'BJ'],
  4: [228, 'SS'],
  5: [871, 'BL'],
};
for (const [heroId, [characterId, symbol]] of Object.entries(owners)) {
  for (const [frame, state] of [['1', 'normal'], ['2', 'selected']]) {
    await copyFile(
      path.join(
        sourceRoot,
        `deep-immortality/sprites/DefineSprite_${characterId}_export.shop.Select${symbol}/${frame}.svg`,
      ),
      path.join(outputRoot, `owner-${heroId}-${state}.svg`),
    );
  }
}

console.log(`Generated native immortality assets in ${path.relative(repoRoot, outputRoot)}`);
