import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = path.join(
  root,
  'local-resources',
  'regima',
  'task-outputs',
  'formal-soul-ui-original',
  'workshop',
  'DefineSprite_119_export.strength.StrengthEquipment',
  '1.svg',
);
const outputPath = path.join(
  root,
  'public',
  'assets',
  'ui',
  'crafting',
  'container-native.svg',
);
const digitAtlasPath = path.join(
  root,
  'public',
  'assets',
  'ui',
  'feature',
  'shared',
  'soul-digits.svg',
);

const source = readFileSync(sourcePath, 'utf8');
const cleaned = source.replace(/^\s*<use[^>]*\sid="txtlh"[^>]*\/>\r?\n/m, '');
if (cleaned === source || cleaned.includes('id="txtlh"')) {
  throw new Error('Expected to remove the workshop txtlh instance from character 119.');
}

const digitPaths = Array.from({ length: 10 }, (_, digit) => {
  const glyphId = `font_FZCuYuan-M03_${digit}0`;
  const match = source.match(new RegExp(
    `<g id="${glyphId}">\\s*<path d="([^"]+)"[^>]*/>\\s*</g>`,
  ));
  if (!match?.[1]) throw new Error(`Missing original FZCuYuan digit ${digit}.`);
  return match[1];
});
const digitAtlas = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="31" viewBox="0 0 160 31">',
  '  <g fill="#ffffff" fill-rule="evenodd" stroke="none">',
  ...digitPaths.map((digitPath, digit) =>
    `    <path d="${digitPath}" transform="matrix(0.0244 0 0 0.0244 ${digit * 16} 22)"/>`),
  '  </g>',
  '</svg>',
  '',
].join('\n');

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, cleaned);
mkdirSync(path.dirname(digitAtlasPath), { recursive: true });
writeFileSync(digitAtlasPath, digitAtlas);
console.log('Generated the original workshop root and shared FZCuYuan soul digit atlas.');
