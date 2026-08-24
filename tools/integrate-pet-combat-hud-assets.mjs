import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const ffdec = 'C:/Program Files (x86)/FFDec/ffdec-cli.exe';
const source = path.join(root, 'local-resources/regima/source/restored-swfs/assets/pet1.swf');
const outputRoot = path.join(root, 'public/assets/ui/combat-hud/pet');
const tempRoot = path.join(root, '.tmp/pet-combat-hud-assets');

if (!existsSync(ffdec)) throw new Error(`FFDec CLI is unavailable at ${ffdec}`);
rmSync(tempRoot, { recursive: true, force: true });
mkdirSync(tempRoot, { recursive: true });
mkdirSync(path.join(outputRoot, 'hp'), { recursive: true });
mkdirSync(path.join(outputRoot, 'mp'), { recursive: true });
mkdirSync(path.join(outputRoot, 'heads'), { recursive: true });

function run(args) {
  const result = spawnSync(ffdec, ['-onerror', 'abort', '-ignorebackground', ...args], {
    cwd: root,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`FFDec failed.\n${result.stdout}\n${result.stderr}`);
  }
}

function files(directory) {
  return readdirSync(directory).flatMap((name) => {
    const target = path.join(directory, name);
    return statSync(target).isDirectory() ? files(target) : [target];
  });
}

const shellTemp = path.join(tempRoot, 'shell');
mkdirSync(shellTemp, { recursive: true });
run(['-selectid', '605', '-format', 'shape:png', '-export', 'shape', shellTemp, source]);
copyFileSync(path.join(shellTemp, '605.png'), path.join(outputRoot, 'shell.png'));

const barsTemp = path.join(tempRoot, 'bars');
mkdirSync(barsTemp, { recursive: true });
run(['-selectid', '610,614', '-format', 'sprite:png', '-export', 'sprite', barsTemp, source]);
const exported = files(barsTemp).filter((file) => file.endsWith('.png'));
for (const [characterId, directory] of [[610, 'hp'], [614, 'mp']]) {
  for (let frame = 1; frame <= 25; frame += 1) {
    const sourceFrame = exported.find((file) =>
      file.replaceAll('\\', '/').includes(`DefineSprite_${characterId}_`)
      && path.basename(file) === `${frame}.png`);
    if (!sourceFrame) throw new Error(`Missing character ${characterId} frame ${frame}.`);
    copyFileSync(sourceFrame, path.join(outputRoot, directory, `${frame}.png`));
  }
}

const headTruth = JSON.parse(readFileSync(path.join(
  root,
  'docs/reverse-engineering/ground-truth/manifests/task-settings-201-pet-combat-hud-head.json',
), 'utf8'));
if (headTruth.truthId !== 'task-settings-201.pet-combat-hud-head'
  || headTruth.status !== 'verified'
  || headTruth.completeness.unresolved.length > 0) {
  throw new Error('The verified TASK-SETTINGS-201 head truth is unavailable.');
}
const copiedHeadCharacters = new Set();
for (const object of headTruth.displayObjects.filter((candidate) =>
  candidate.parentId === 'pet-combat-hud-head.character-657')) {
  const characterId = object.sourceIdentity.characterId;
  if (copiedHeadCharacters.has(characterId)) continue;
  const sourcePath = object.render.assetRef;
  if (!sourcePath) throw new Error(`Missing head baseline for character ${characterId}.`);
  copyFileSync(path.join(root, sourcePath), path.join(outputRoot, 'heads', `${characterId}.png`));
  copiedHeadCharacters.add(characterId);
}

rmSync(tempRoot, { recursive: true, force: true });
console.log(`Integrated character 662 shell, 25 HP/MP frames, and ${copiedHeadCharacters.size} verified head children.`);
