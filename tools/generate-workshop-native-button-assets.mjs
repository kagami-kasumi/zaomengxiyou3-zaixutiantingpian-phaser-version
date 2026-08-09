import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = path.join(
  root,
  'local-resources/regima/task-outputs/task-settings-167-workshop-left-pages/sprites-svg',
);
const outputRoot = path.join(root, 'public/assets/ui/crafting/buttons');

const pages = [
  { id: 'strength', source: 'DefineSprite_198_export.strength.Strength/1.svg', up: 'shape2', over: 'shape3' },
  { id: 'fusion', source: 'DefineSprite_169_export.strength.Fusion/1.svg', up: 'shape2', over: 'shape3' },
  { id: 'resolution', source: 'DefineSprite_177_export.strength.Resolution/1.svg', up: 'shape2', over: 'shape3' },
  { id: 'making', source: 'DefineSprite_152_export.strength.Making/1.svg', up: 'shape3', over: 'shape4' },
];

mkdirSync(outputRoot, { recursive: true });
for (const page of pages) {
  const source = readFileSync(path.join(sourceRoot, page.source), 'utf8');
  const definitions = source.match(/<defs>[\s\S]*<\/defs>/)?.[0];
  if (!definitions) throw new Error(`Missing SVG definitions for ${page.id}.`);
  for (const [state, shape, y] of [
    ['up', page.up, 0],
    ['over', page.over, 0],
    ['down', page.over, 2],
  ]) {
    const output = `<?xml version="1.0" encoding="UTF-8"?>\n`
      + `<svg xmlns="http://www.w3.org/2000/svg" xmlns:ffdec="https://www.free-decompiler.com/flash" xmlns:xlink="http://www.w3.org/1999/xlink" width="139" height="49" viewBox="0 0 139 49">\n`
      + `  <use xlink:href="#${shape}" transform="translate(0 ${y})"/>\n`
      + `  ${definitions}\n`
      + `</svg>\n`;
    writeFileSync(path.join(outputRoot, `${page.id}-${state}.svg`), output);
  }
}

console.log('Generated native workshop button up, over, and down assets.');
