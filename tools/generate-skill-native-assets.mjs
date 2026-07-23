import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = path.join(
  root,
  'local-resources',
  'regima',
  'task-outputs',
  'task-settings-061-skill-native',
);
const outputRoot = path.join(root, 'public', 'assets', 'ui', 'feature', 'skills', 'native');

mkdirSync(outputRoot, { recursive: true });

function stripDynamicFields(source, ids) {
  return ids.reduce(
    (result, id) => result.replace(
      new RegExp(`<use[^>]*\\sid="${id}"[^>]*/>`, 'g'),
      '',
    ),
    source,
  );
}

const baseOutput = path.join(outputRoot, 'base');
mkdirSync(baseOutput, { recursive: true });
const existingSkillAssets = path.join(root, 'public', 'assets', 'ui', 'feature', 'skills');
writeFileSync(
  path.join(baseOutput, 'skill-hub.svg'),
  stripDynamicFields(
    readFileSync(path.join(existingSkillAssets, 'skill-hub.svg'), 'utf8'),
    ['txtlh'],
  ),
);
writeFileSync(
  path.join(baseOutput, 'skill-active.svg'),
  stripDynamicFields(
    readFileSync(path.join(existingSkillAssets, 'skill-active.svg'), 'utf8'),
    ['leveltxt1', 'lhtxt1', 'leveltxt2', 'lhtxt2'],
  ),
);
writeFileSync(
  path.join(baseOutput, 'skill-passive.svg'),
  stripDynamicFields(
    readFileSync(path.join(existingSkillAssets, 'skill-passive.svg'), 'utf8'),
    ['wantlh', 'curslevel', 'attvalue', 'lastvalue'],
  ),
);

const spriteSource = path.join(sourceRoot, 'sprites');
for (const directory of readdirSync(spriteSource, { withFileTypes: true })) {
  if (!directory.isDirectory()) continue;
  const characterMatch = /^DefineSprite_(\d+)/.exec(directory.name);
  if (!characterMatch) continue;
  const targetDirectory = path.join(outputRoot, 'sprites', characterMatch[1]);
  mkdirSync(targetDirectory, { recursive: true });
  for (const frame of readdirSync(path.join(spriteSource, directory.name))) {
    if (!frame.endsWith('.svg')) continue;
    const sourcePath = path.join(spriteSource, directory.name, frame);
    const targetPath = path.join(targetDirectory, frame);
    if (characterMatch[1] === '212') {
      writeFileSync(
        targetPath,
        stripDynamicFields(
          readFileSync(sourcePath, 'utf8'),
          ['wantlh', 'curslevel', 'attvalue', 'lastvalue'],
        ),
      );
    } else {
      copyFileSync(sourcePath, targetPath);
    }
  }
}

const buttonSource = path.join(sourceRoot, 'buttons');
for (const directory of readdirSync(buttonSource, { withFileTypes: true })) {
  if (!directory.isDirectory()) continue;
  const characterMatch = /^DefineButton2_(\d+)/.exec(directory.name);
  if (!characterMatch) continue;
  const source = readFileSync(path.join(buttonSource, directory.name, 'combined.svg'), 'utf8');
  const targetDirectory = path.join(outputRoot, 'buttons', characterMatch[1]);
  mkdirSync(targetDirectory, { recursive: true });
  for (const state of ['up', 'over', 'down']) {
    const forcedStateCss = `
    .button .button-frame-up,
    .button .button-frame-over,
    .button .button-frame-down { opacity: 0 !important; }
    .button .button-frame-${state} { opacity: 1 !important; }
    .button .button-frame-hittest { opacity: 0 !important; }
`;
    writeFileSync(
      path.join(targetDirectory, `${state}.svg`),
      source.replace('  ]]></style>', `${forcedStateCss}  ]]></style>`),
    );
  }
}

console.log('Generated native skill UI sprite and button state assets.');
