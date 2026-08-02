import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const sourceRoot = path.resolve(
  'local-resources/regima/task-outputs/task-settings-069e-role5',
);
const outputRoot = path.resolve('public/assets/combat/role5');

const spearBodySource = path.join(sourceRoot, 'spear-body-images');
const spearEffectsSource = path.join(sourceRoot, 'spear-effects-svg');
const swordSource = path.join(sourceRoot, 'sword-sprites-svg');
const swordExtraSource = path.join(sourceRoot, 'sword-body-extra');

const spearEffects = [
  'DefineSprite_36_Role5Skill4Effect',
  'DefineSprite_76_Role5Bullet1',
  'DefineSprite_87_Role5Bullet2',
  'DefineSprite_96_Role5Bullet3',
  'DefineSprite_113_Role5Bullet4',
  'DefineSprite_166_Role5Bullet9',
  'DefineSprite_175_Role5Bullet5',
  'DefineSprite_263_Role5cloneEf2',
  'DefineSprite_271_Role5escapeEffect',
];

const swordBodySprites = [
  'DefineSprite_296_jidle',
  'DefineSprite_318_jwalk',
  'DefineSprite_289_jrunNormal',
  'DefineSprite_287_jjumpNormal',
  'DefineSprite_285_jjumpTwo',
  'DefineSprite_283_jjumpDown',
  'DefineSprite_316_jattack1',
  'DefineSprite_312_jattack2',
  'DefineSprite_308_jattack3',
  'DefineSprite_304_jattack4',
  'DefineSprite_281_jjumpattack',
  'DefineSprite_270_jrunattack',
  'DefineSprite_300_jhurtStand',
  'DefineSprite_294_jskill1',
  'DefineSprite_321_jskill2',
  'DefineSprite_275_jskill4',
  'DefineSprite_266_jskill5_1',
  'DefineSprite_264_jskill5_2',
  'DefineSprite_336_jtlj',
];

const swordEffects = [
  'DefineSprite_41_sword_jrjljq',
  'DefineSprite_359_sword_lxuanj1',
  'DefineSprite_360_sword_lxuanj2',
  'DefineSprite_369_swordhit5_1',
  'DefineSprite_378_swordhit6_1',
  'DefineSprite_398_swordhit4_1',
  'DefineSprite_421_swordhit3_1',
  'DefineSprite_444_swordhit2_1',
  'DefineSprite_467_swordhit1_1',
  'DefineSprite_480_swordskill4',
  'DefineSprite_493_swordskill5_3',
  'DefineSprite_504_swordskill5_1',
  'DefineSprite_511_swordskill5_2',
  'DefineSprite_544_sword_xlc',
  'DefineSprite_556_swordhit5',
  'DefineSprite_563_swordhit6',
  'DefineSprite_589_sword_jrjlsf',
  'DefineSprite_602_sword_jrjlsxj',
  'DefineSprite_621_jrjlbuff',
  'DefineSprite_648_sword_mlsz5',
  'DefineSprite_661_sword_mlsz4',
  'DefineSprite_672_sword_mlsz3',
  'DefineSprite_685_sword_mlsz2',
  'DefineSprite_698_sword_mlsz1',
  'DefineSprite_777_sword_xkjz',
  'DefineSprite_786_swordhit4',
  'DefineSprite_793_swordhit3',
  'DefineSprite_802_swordhit2',
  'DefineSprite_807_swordhit1',
  'DefineSprite_819_sword_mlsz5_1',
  'DefineSprite_821_sword_mlsz4_1',
  'DefineSprite_823_sword_mlsz3_1',
  'DefineSprite_825_sword_mlsz2_1',
  'DefineSprite_827_sword_mlsz1_1',
  'DefineSprite_835_swordqhskill2_1',
  'DefineSprite_846_swordskill2_3',
  'DefineSprite_853_swordskill2_2',
  'DefineSprite_854_swordskill2_1',
  'DefineSprite_871_sword_tlj2',
  'DefineSprite_888_sword_tlj1',
];

await mkdir(outputRoot, { recursive: true });
await cp(spearBodySource, path.join(outputRoot, 'body', 'spear'), { recursive: true });

for (const directory of spearEffects) {
  await cp(
    path.join(spearEffectsSource, directory),
    path.join(outputRoot, 'effects', 'spear', directory),
    { recursive: true },
  );
}

for (const directory of swordEffects) {
  await cp(
    path.join(swordSource, directory),
    path.join(outputRoot, 'effects', 'sword', directory),
    { recursive: true },
  );
}

for (const directory of swordBodySprites) {
  await normalizeBodyDirectory(
    path.join(swordSource, directory),
    path.join(outputRoot, 'body', 'sword', directory),
  );
}
await normalizeBodyDirectory(
  path.join(swordExtraSource, 'DefineSprite_273'),
  path.join(outputRoot, 'body', 'sword', 'DefineSprite_273'),
);

async function normalizeBodyDirectory(source, target) {
  await mkdir(target, { recursive: true });
  const files = (await readdir(source)).filter((file) => file.endsWith('.svg'));
  for (const file of files) {
    const svg = await readFile(path.join(source, file), 'utf8');
    const normalized = svg
      .replace(/height="[^"]+" width="[^"]+"/, 'height="290px" width="290px" viewBox="0 0 290 290"')
      .replace(
        /(<g transform="matrix\([^,]+,\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*)[-\d.Ee]+,\s*[-\d.Ee]+(\)">)/,
        '$1158, 142$2',
      );
    await writeFile(path.join(target, file), normalized, 'utf8');
  }
}

console.log('Role5 combat assets integrated');
