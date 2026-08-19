import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = path.join(root, 'local-resources/regima/task-outputs/task-settings-193c-pet-horse-animation');
const targetRoot = path.join(root, 'public/assets/pets/horse');

const bodyCopies = [
  ['20120203-body/17_PetHorseBmd1.png', 'body/PetHorseBmd1.png'],
  ['20120203-body/15_PetHorseBmd2.png', 'body/PetHorseBmd2.png'],
  ['20120203-body/12_PetHorseBmd3.png', 'body/PetHorseBmd3.png'],
  ['pet1-body/19_PetHorseBmd4.png', 'body/PetHorseBmd4.png'],
];
const effectDirectories = [
  ['20120203-sprites', '20120203', 'DefineSprite_101_PetHorse2Bullet2'],
  ['20120203-sprites', '20120203', 'DefineSprite_118_PetHorse2Bullet1'],
  ['20120203-sprites', '20120203', 'DefineSprite_124_PetHorse1Bullet2'],
  ['20120203-sprites', '20120203', 'DefineSprite_129_PetHorse1Bullet1'],
  ['20120203-sprites', '20120203', 'DefineSprite_82_PetHorse3Bullet4'],
  ['20120203-sprites', '20120203', 'DefineSprite_88_PetHorse3Bullet3'],
  ['20120203-sprites', '20120203', 'DefineSprite_93_PetHorse3Bullet2'],
  ['20120203-sprites', '20120203', 'DefineSprite_97_PetHorse3Bullet1'],
  ['pet1-sprites', 'pet1', 'DefineSprite_695_PetHorse4Bullet5Explode'],
  ['pet1-sprites-sublength8', 'pet1-sublength8', 'DefineSprite_699_PetHorse4Bullet5/1'],
  ['stagecommon-sprites', 'stagecommon', 'DefineSprite_40_PetHorseIceEffect'],
];

for (const [source, target] of bodyCopies) {
  const targetPath = path.join(targetRoot, target);
  mkdirSync(path.dirname(targetPath), { recursive: true });
  copyFileSync(path.join(sourceRoot, source), targetPath);
}
let frameCount = 0;
for (const [sourceParent, owner, directory] of effectDirectories) {
  const sourceDirectory = path.join(sourceRoot, sourceParent, directory);
  const targetDirectory = path.join(targetRoot, 'effects', owner, directory);
  mkdirSync(targetDirectory, { recursive: true });
  for (const file of readdirSync(sourceDirectory)) {
    copyFileSync(path.join(sourceDirectory, file), path.join(targetDirectory, file));
    frameCount += 1;
  }
}

console.log(`Integrated four horse body atlases and ${frameCount} effect frames.`);
