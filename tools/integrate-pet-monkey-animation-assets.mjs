import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = path.join(
  root,
  'local-resources/regima/task-outputs/task-settings-193a-pet-monkey-animation',
);
const targetRoot = path.join(root, 'public/assets/pets/monkey');

const copies = [
  ['20120203-body/7_PetMonkeyBmd1.png', 'body/PetMonkeyBmd1.png'],
  ['20120203-body/14_PetMonkeyBmd2.png', 'body/PetMonkeyBmd2.png'],
  ['20120203-body/11_PetMonkeyBmd3.png', 'body/PetMonkeyBmd3.png'],
  ['pet1-body/20_PetMonkeyBmd4.png', 'body/PetMonkeyBmd4.png'],
];

const effectDirectories = [
  'DefineSprite_136_PetMonkey3Bullet3_1',
  'DefineSprite_137_PetMonkey3Bullet3_2',
  'DefineSprite_192_PetMonkey3Bullet2',
  'DefineSprite_200_PetMonkey3Bullet1',
  'DefineSprite_207_PetMonkey2Bullet2_1',
  'DefineSprite_208_PetMonkey2Bullet2_2',
  'DefineSprite_212_PetMonkey2Bullet1',
  'DefineSprite_229_PetMonkey1Bullet2',
  'DefineSprite_241_PetMonkey1Bullet1',
];

for (const [source, target] of copies) {
  const targetPath = path.join(targetRoot, target);
  mkdirSync(path.dirname(targetPath), { recursive: true });
  copyFileSync(path.join(sourceRoot, source), targetPath);
}
for (const directory of effectDirectories) {
  const sourceDirectory = path.join(sourceRoot, '20120203-sprites', directory);
  const targetDirectory = path.join(targetRoot, 'effects', directory);
  mkdirSync(targetDirectory, { recursive: true });
  for (const file of readdirSync(sourceDirectory)) {
    copyFileSync(path.join(sourceDirectory, file), path.join(targetDirectory, file));
  }
}

console.log(`Integrated monkey body atlases and ${effectDirectories.length} effect sequences.`);
