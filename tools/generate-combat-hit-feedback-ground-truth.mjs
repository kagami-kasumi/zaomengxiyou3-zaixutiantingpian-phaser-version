import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputPath = 'docs/reverse-engineering/ground-truth/manifests/task-settings-211-combat-hit-feedback.json';
const evidenceRoot = 'docs/tasks/evidence/TASK-SETTINGS-211';
const localRoot = 'local-resources/regima/task-outputs/task-settings-211-combat-hit-feedback';
const svgRoot = 'local-resources/regima/task-outputs/task-settings-211-combat-hit-feedback-svg';
const sources = {
  swf: 'local-resources/regima/source/restored-swfs/assets/OtherMat1.swf',
  xml: 'local-resources/regima/task-outputs/task-settings-175c-stage-feature-host/OtherMat1.xml',
  symbols: 'local-resources/regima/task-outputs/task-settings-069d-role4/all-symbols/OtherMat1.swf/symbols.csv',
  baseMonster: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BaseMonster.as',
  baseBullet: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BaseBullet.as',
  baseObject: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BaseObject.as',
  basePet: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BasePet.as',
  addEffect: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BaseAddEffect.as',
  queue: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/my/CureHpQueue.as',
  number: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/my/ANumber.as',
  gameInfo: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/GameInfo.as',
  batter: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/Batter.as',
  user: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/user/User.as',
  gameWin: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/win/GameWin.as',
  magicRing: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/magicWeapon/MagicRing.as',
  settings: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/setmenu/gameSetting.as',
};
const command = 'npm run generate:combat-hit-feedback-truth';
const target = { x: 470, y: 350, height: 120 };
const damageAnchor = { x: target.x - 20, y: target.y - Math.min(300, target.height) / 2 };
const panelAnchor = { x: 694.95, y: 234.95 };

const bytes = (relativePath) => readFileSync(path.join(root, relativePath));
const text = (relativePath) => bytes(relativePath).toString('utf8');
const sha256 = (relativePath) => createHash('sha256').update(bytes(relativePath)).digest('hex');
const hashText = (value) => createHash('sha256').update(value).digest('hex');
const round = (value) => Math.round(value * 1000) / 1000;
const bounds = (left, top, width, height) => ({ left: round(left), top: round(top), width: round(width), height: round(height) });
const matrix = (a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) => ({ a: round(a), b: round(b), c: round(c), d: round(d), tx: round(tx), ty: round(ty) });
const escapeXml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const dataUri = (relativePath, mime) => `data:${mime};base64,${bytes(relativePath).toString('base64')}`;

function requirePattern(relativePath, pattern, description) {
  if (!pattern.test(text(relativePath))) throw new Error(`${relativePath} no longer proves ${description}`);
}

requirePattern(sources.baseMonster, /\+\+User\.batterNum[\s\S]*this\.addMonHurtMc\(_loc15_,this\.isCrit\)[\s\S]*this\.reduceHp\(_loc15_/, 'successful monster hit order');
requirePattern(sources.baseMonster, /addMonsterHurt\(param1,x\s*-\s*20,_loc4_\)[\s\S]*addMonsterCritHurt\(param1,x\s*-\s*20,_loc4_\)/, 'normal and critical number routing');
requirePattern(sources.baseMonster, /this\.y\s*-\s*Math\.min\(300,this\.height\)\s*\/\s*2/, 'monster-relative number anchor');
requirePattern(sources.baseMonster, /this\.addMissMc\(\);[\s\S]*return false;/, 'miss rejection before visible-hit production');
requirePattern(sources.baseBullet, /beAttackIdArray\.indexOf\(this\.getAttackId\(\)\)\s*==\s*-1[\s\S]*beMagicAttack\(this,this\.sourceRole\)/, 'attack-id duplicate rejection');
requirePattern(sources.basePet, /_loc1_\.setRole\(this\)/, 'pet bullets retain the pet as sourceRole');
requirePattern(sources.magicRing, /bb\.setRole\(this\.sourceRole\)/, 'magic-weapon bullets retain their owning hero as sourceRole');
requirePattern(sources.addEffect, /sourceRole\.reduceHp\(_loc4_,false\)[\s\S]*BaseMonster\(this\.sourceRole\)\.addMonHurtMc\(_loc4_,false\)/, 'effect ticks can show ordinary monster damage without BaseMonster hit entry');
requirePattern(sources.queue, /queue\.length\s*<=\s*10[\s\S]*resName\s*=\s*"hurtnum"/, 'normal queue cap and resource family');
requirePattern(sources.queue, /queue\.length\s*<=\s*10[\s\S]*resName\s*=\s*"bnum"/, 'critical queue cap and resource family');
requirePattern(sources.queue, /queue\.length\s*>\s*5[\s\S]*showSingleCure\(-20,-20\)[\s\S]*showSingleCure\(20,-20\)/, 'five-number burst fan-out');
requirePattern(sources.queue, /showIntervalCount\s*=\s*2[\s\S]*showInterval\s*=\s*this\.showIntervalCount[\s\S]*--this\.showInterval/, 'two-tick damage queue cadence');
requirePattern(sources.number, /_loc7_\.x\s*=\s*_loc8_\s*\*\s*param5/, 'caller-selected digit stride');
requirePattern(sources.queue, /aNumImage\(_loc3_\.resName,_loc3_\.value,_loc3_\.posX\s*\+\s*param1,_loc3_\.posY\s*\+\s*param2,20\)/, '20px damage digit stride');
requirePattern(sources.number, /TweenMax\.to\(this,1,[\s\S]*"y":this\.y\s*-\s*100[\s\S]*"alpha":0[\s\S]*"delay":0\.25/, 'damage rise and fade tween');
requirePattern(sources.number, /this\.scaleY\s*=\s*4[\s\S]*this\.scaleX\s*=\s*4[\s\S]*TweenMax\.to\(this,0\.2/, 'damage pop scale tween');
requirePattern(sources.gameInfo, /User\.batterNum\s*>=\s*2[\s\S]*new Batter\(\)[\s\S]*x\s*=\s*694\.95[\s\S]*y\s*=\s*234\.95/, 'combo threshold and fixed HUD anchor');
requirePattern(sources.gameInfo, /TweenMax\.to\(this\.bpanel,2,[\s\S]*"alpha":0/, 'combo panel two-second fade');
requirePattern(sources.gameInfo, /batterSi\)\s*%\s*40\s*==\s*0[\s\S]*preBatterNum\s*==\s*User\.batterNum[\s\S]*User\.batterNum\s*=\s*0/, 'forty-tick unchanged-count reset');
requirePattern(sources.batter, /param1\s*<\s*10[\s\S]*_loc2_\s*=\s*4[\s\S]*param1\s*<\s*100[\s\S]*_loc2_\s*=\s*-44\.6[\s\S]*_loc2_\s*=\s*-95\.6/, 'combo digit-group anchors');
requirePattern(sources.batter, /aNumMC\("num",param1,_loc2_,_loc3_,50\)/, 'combo digit stride');
requirePattern(sources.gameWin, /txt_hight\.text\s*=\s*User\.biggestbatterNum/, 'result-page maximum combo consumer');
requirePattern(sources.settings, /frameClips\s*=\s*24[\s\S]*frameClips\s*=\s*20[\s\S]*frameClips\s*=\s*30/, '20/24/30 host tick settings');

const normalIds = [117, 114, 110, 107, 105, 103, 97, 95, 93, 91];
const criticalIds = [35, 34, 33, 32, 31, 30, 28, 27, 26, 23];
const comboIds = [296, 292, 288, 284, 280, 276, 271, 267, 263, 259];
const symbols = new Map([...text(sources.symbols).matchAll(/^(\d+);"([^"]+)"$/gm)].map((match) => [match[2], Number(match[1])]));
for (let digit = 0; digit <= 9; digit += 1) {
  for (const [prefix, ids] of [['hurtnum', normalIds], ['bnum', criticalIds], ['num', comboIds]]) {
    if (symbols.get(`${prefix}${digit}`) !== ids[digit]) throw new Error(`${prefix}${digit} SymbolClass mapping changed`);
  }
}
if (symbols.get('export.Batter') !== 299) throw new Error('export.Batter SymbolClass mapping changed');

const xml = text(sources.xml);
if (!/<swf[^>]*frameRate="24\.0"/.test(xml)) throw new Error('OtherMat1 FFDec XML frame rate changed');
if (!/<item type="DefineSpriteTag"[^>]*frameCount="1"[^>]*spriteId="299">[\s\S]*?characterId="298"[\s\S]*?<item type="ShowFrameTag"/.test(xml)) {
  throw new Error('Batter display list changed');
}
for (const id of comboIds) {
  const marker = new RegExp(`<item type="DefineSpriteTag"[^>]*frameCount="5"[^>]*spriteId="${id}">`);
  if (!marker.test(xml)) throw new Error(`combo digit ${id} timeline changed`);
}
const expectedComboFrames = [
  { scale: 2.5, tx: 0, ty: 0, blur: 70 },
  { scale: 2.1249847, tx: 0.35, ty: 0.1, blur: 52.5 },
  { scale: 1.75, tx: 0.7, ty: 0.2, blur: 35 },
  { scale: 1.3749695, tx: 1.05, ty: 0.25, blur: 17.5 },
  { scale: 1, tx: 1.4, ty: 0.35, blur: 0 },
];
const expectedComboMatrices = [
  'matrix(2.5, 0.0, 0.0, 2.5, 0.0, 0.0)',
  'matrix(2.125, 0.0, 0.0, 2.125, 0.35, 0.1)',
  'matrix(1.75, 0.0, 0.0, 1.75, 0.7, 0.2)',
  'matrix(1.375, 0.0, 0.0, 1.375, 1.05, 0.25)',
  'matrix(1.0, 0.0, 0.0, 1.0, 1.4, 0.35)',
];
for (let frame = 1; frame <= 5; frame += 1) {
  const svgPath = `${svgRoot}/sprites/DefineSprite_296_num0/${frame}.svg`;
  const svg = text(svgPath);
  const expected = expectedComboFrames[frame - 1];
  if (!svg.includes(expectedComboMatrices[frame - 1])) {
    throw new Error(`combo digit frame ${frame} matrix changed`);
  }
  if (expected.blur > 0 && !svg.includes('<feGaussianBlur')) throw new Error(`combo digit frame ${frame} blur disappeared`);
}

const damageImagePath = (kind, digit) => {
  const id = kind === 'normal' ? normalIds[digit] : criticalIds[digit];
  return `${localRoot}/images/${id}_${kind === 'normal' ? 'hurtnum' : 'bnum'}${digit}.png`;
};
const comboSvgPath = (digit, frame) => `${svgRoot}/sprites/DefineSprite_${comboIds[digit]}_num${digit}/${frame}.svg`;
const batterPngPath = `${localRoot}/sprites/DefineSprite_299_export.Batter/1.png`;
for (let digit = 0; digit <= 9; digit += 1) {
  bytes(damageImagePath('normal', digit));
  bytes(damageImagePath('critical', digit));
  for (let frame = 1; frame <= 5; frame += 1) bytes(comboSvgPath(digit, frame));
}
bytes(batterPngPath);

const states = [];
const displayObjects = [];
const baselineSpecs = new Map();
const addState = (id, entry, fixtureId, frame = 0) => {
  states.push({ id, entry, frame, fixtureId, baselineId: `original-${id}-940x590` });
  baselineSpecs.set(id, []);
};
const addPlacementObject = ({ id, parentId = null, depth, objectType, provenanceId, characterId, symbolClass, frame = null, stateId, localMatrix, localBounds, stageBounds, assetRef, alpha = 1, visible = true, filters = [] }) => {
  displayObjects.push({
    id, parentId, depth, objectType,
    sourceIdentity: { provenanceId, characterId, symbolClass, instanceName: null, frame },
    placements: [{
      stateId, visible, localMatrix, registrationPoint: { x: 0, y: 0 }, localBounds, stageBounds,
      alpha, derivation: 'calculated',
      derivationMethod: 'AS3 constructor/addChild coordinates composed with the fixed 940x590 fixture and restored-resource bounds.',
      evidenceRefs: ['base-monster-as', 'cure-hp-queue-as', 'a-number-as', 'game-info-as', 'batter-as', 'othermat1-swf'],
    }],
    render: { assetRef, blendMode: 'normal', filters, maskId: null },
  });
};

function addDamageNumber(stateId, { kind, value, x = damageAnchor.x, y = damageAnchor.y, scale = 1, alpha = 1, visible = true, serial = 0 }) {
  const size = kind === 'normal' ? 30 : 42;
  const family = kind === 'normal' ? 'hurtnum' : 'bnum';
  [...String(value)].forEach((token, index) => {
    const digit = Number(token);
    const assetRef = damageImagePath(kind, digit);
    const left = x + index * 20 * scale;
    const top = y;
    addPlacementObject({
      id: `${stateId}.${family}-${serial}-${index}-${digit}`,
      depth: index,
      objectType: 'bitmap',
      provenanceId: 'othermat1-swf',
      characterId: kind === 'normal' ? normalIds[digit] : criticalIds[digit],
      symbolClass: `${family}${digit}`,
      stateId,
      localMatrix: matrix(scale, 0, 0, scale, left, top),
      localBounds: bounds(0, 0, size, size),
      stageBounds: bounds(left, top, size * scale, size * scale),
      assetRef,
      alpha,
      visible,
    });
    if (visible && alpha > 0) baselineSpecs.get(stateId).push({ type: 'image', href: dataUri(assetRef, 'image/png'), x: left, y: top, width: size * scale, height: size * scale, opacity: alpha });
  });
}

function comboStart(value) {
  if (value < 10) return 4;
  if (value < 100) return -44.6;
  return -95.6;
}

function addCombo(stateId, value, frame) {
  addPlacementObject({
    id: `${stateId}.batter-root`, depth: 0, objectType: 'movie-clip', provenanceId: 'othermat1-swf', characterId: 299,
    symbolClass: 'export.Batter', stateId, localMatrix: matrix(1, 0, 0, 1, panelAnchor.x, panelAnchor.y),
    localBounds: bounds(0, 0, 190, 60), stageBounds: bounds(panelAnchor.x, panelAnchor.y, 190, 60), assetRef: batterPngPath,
  });
  baselineSpecs.get(stateId).push({ type: 'image', href: dataUri(batterPngPath, 'image/png'), x: panelAnchor.x, y: panelAnchor.y, width: 190, height: 60, opacity: 1 });
  [...String(value)].forEach((token, index) => {
    const digit = Number(token);
    const x = panelAnchor.x + comboStart(value) + index * 50;
    const y = panelAnchor.y + 28.3;
    const assetRef = comboSvgPath(digit, frame);
    addPlacementObject({
      id: `${stateId}.combo-digit-${index}-${digit}-frame-${frame}`,
      parentId: `${stateId}.batter-root`, depth: index + 1, objectType: 'movie-clip', provenanceId: 'othermat1-swf',
      characterId: comboIds[digit], symbolClass: `num${digit}`, frame, stateId,
      localMatrix: matrix(1, 0, 0, 1, comboStart(value) + index * 50, 28.3),
      localBounds: bounds(-87.5, -87.5, 175, 175), stageBounds: bounds(x - 87.5, y - 87.5, 175, 175), assetRef,
      filters: expectedComboFrames[frame - 1].blur > 0 ? [{ type: 'blur', blurX: expectedComboFrames[frame - 1].blur, blurY: expectedComboFrames[frame - 1].blur, passes: 1 }] : [],
    });
    baselineSpecs.get(stateId).push({ type: 'image', href: dataUri(assetRef, 'image/svg+xml'), x: x - 87.5, y: y - 87.5, width: 175, height: 175, opacity: 1 });
  });
}

addState('normal-role-p1-t0', 'Successful P1 Role hit; ordinary 42 appears at pop start.', 'source=role;p1;target=(470,350);height=120;damage=42;t=0ms');
addDamageNumber('normal-role-p1-t0', { kind: 'normal', value: 42, scale: 4 });
addState('normal-role-p1-t200', 'Same ordinary hit after the 0.2s pop settles.', 'source=role;p1;target=(470,350);height=120;damage=42;t=200ms');
addDamageNumber('normal-role-p1-t200', { kind: 'normal', value: 42 });
addState('normal-pet-p1-t250', 'Successful P1 pet hit at rise/fade delay boundary; source does not change glyphs.', 'source=pet;p1;target=(470,350);height=120;damage=73;t=250ms');
addDamageNumber('normal-pet-p1-t250', { kind: 'normal', value: 73 });
addState('critical-magic-p1-t250', 'Successful magic-weapon/hero-owned critical hit uses bnum glyphs.', 'source=magic-weapon;p1;target=(470,350);height=120;damage=73;critical=true;t=250ms');
addDamageNumber('critical-magic-p1-t250', { kind: 'critical', value: 73 });
addState('normal-pet-p2-t750', 'P2 pet hit shares the target-relative world anchor; halfway through rise/fade.', 'source=pet;p2;target=(470,350);height=120;damage=73;t=750ms');
addDamageNumber('normal-pet-p2-t750', { kind: 'normal', value: 73, y: damageAnchor.y - 50, alpha: 0.5 });
addState('critical-role-p2-t1250', 'At tween completion the number is transparent and destroyed.', 'source=role;p2;target=(470,350);height=120;damage=73;critical=true;t=1250ms');
addDamageNumber('critical-role-p2-t1250', { kind: 'critical', value: 73, y: damageAnchor.y - 100, alpha: 0, visible: false });
addState('rapid-six-hit-p1-t0', 'Six queued successful hits cause the first five to fan out in one tick; one remains queued.', 'source=mixed;p1;target=(470,350);height=120;values=11..16;queueLength=6;t=0');
[[11, -20, -20], [12, -10, -10], [13, 0, 0], [14, 10, -10], [15, 20, -20]].forEach(([value, dx, dy], serial) => {
  addDamageNumber('rapid-six-hit-p1-t0', { kind: 'normal', value, x: damageAnchor.x + dx, y: damageAnchor.y + dy, scale: 4, serial });
});
addState('lethal-critical-p2-t200', 'A successful lethal hit still renders its final clamped damage before dead visual cleanup.', 'source=role;p2;targetHpBefore=999;damage=999;critical=true;t=200ms');
addDamageNumber('lethal-critical-p2-t200', { kind: 'critical', value: 999 });
addState('miss-p1', 'Dodge/miss returns before combo increment and damage-number enqueue.', 'source=role;p1;outcome=miss');
addState('duplicate-attack-id-p1', 'An already resolved attackId is rejected before BaseMonster.beMagicAttack.', 'source=pet;p1;outcome=duplicate-attack-id');
addState('zero-damage-original-p1', 'Original accepts and displays computed 0 after a successful hit; TASK-SLICE-212 intentionally tightens this to actual HP decrease only.', 'source=role;p1;computedDamage=0;originalOutcome=visible;modernException=suppress');
addDamageNumber('zero-damage-original-p1', { kind: 'normal', value: 0 });
addState('effect-tick-no-combo-p1', 'A direct BaseAddEffect tick can reduce monster HP and show an ordinary number without incrementing User.batterNum.', 'source=role-effect;p1;damage=55;comboDelta=0');
addDamageNumber('effect-tick-no-combo-p1', { kind: 'normal', value: 55 });

for (let frame = 1; frame <= 5; frame += 1) {
  const id = `combo-2-p1-frame-${frame}`;
  addState(id, `Combo panel at value 2, digit timeline frame ${frame}/5.`, `p1;combo=2;digitFrame=${frame};panelAgeTicks=${frame - 1}`, frame);
  addCombo(id, 2, frame);
}
for (const value of [9, 10, 99, 100]) {
  const id = `combo-${value}-p1-frame-5`;
  addState(id, `Combo panel value ${value}; stable fifth digit frame before the five-frame MovieClip loops.`, `p1;combo=${value};digitFrame=5`, 5);
  addCombo(id, value, 5);
}
addState('combo-10-p2-frame-5', 'P2 successful hits feed the same single global HUD panel; geometry is not mirrored.', 'p2;combo=10;digitFrame=5', 5);
addCombo('combo-10-p2-frame-5', 10, 5);
addState('combo-timeout-reset', 'At a 40-tick checkpoint with no growth since the previous checkpoint, combo resets to 0 and no panel is created.', 'comboUnchangedAcrossTwoCheckpoints=true;panelPreviouslyFadedOrRemoved=true');

mkdirSync(path.join(root, evidenceRoot), { recursive: true });
const baselines = [];
for (const state of states) {
  const body = baselineSpecs.get(state.id).map((item) => `<image href="${escapeXml(item.href)}" x="${item.x}" y="${item.y}" width="${item.width}" height="${item.height}" opacity="${item.opacity}"/>`).join('\n  ');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="940" height="590" viewBox="0 0 940 590">\n  ${body}\n</svg>\n`;
  const relativePath = `${evidenceRoot}/original-${state.id}-940x590.svg`;
  const absolutePath = path.join(root, relativePath);
  if (process.argv.includes('--check')) {
    if (readFileSync(absolutePath, 'utf8') !== svg) throw new Error(`${relativePath} is stale; run ${command}`);
  } else {
    writeFileSync(absolutePath, svg);
  }
  baselines.push({ id: state.baselineId, stateId: state.id, path: relativePath, sha256: hashText(svg), width: 940, height: 590, crop: bounds(0, 0, 940, 590) });
}

const provenance = [
  ['othermat1-swf', 'restored-swf', 'swf', 'SymbolClass export.Batter=299; num0..9=296..259; hurtnum0..9=117..91; bnum0..9=35..23.'],
  ['othermat1-ffdec-xml', 'ffdec-xml', 'xml', 'FFDec 26 XML: character 299 -> shape 298; num0..9 five-frame matrices and blur filters; asset frameRate=24.'],
  ['base-monster-as', 'legacy-as3', 'baseMonster', 'beMagicAttack success/miss/crit/damage/reduceHp/event order; addMonHurtMc target anchor and resource routing.'],
  ['base-bullet-as', 'legacy-as3', 'baseBullet', 'checkAttack attackId/target deduplication before beMagicAttack and sourceRole forwarding.'],
  ['base-object-as', 'legacy-as3', 'baseObject', 'step drives CureHpQueue once per host tick.'],
  ['base-pet-as', 'legacy-as3', 'basePet', 'Pet basic attack creates a bullet whose sourceRole is the BasePet instance.'],
  ['base-add-effect-as', 'legacy-as3', 'addEffect', 'Direct effect ticks reduce monster HP and call addMonHurtMc without the direct-hit combo increment.'],
  ['cure-hp-queue-as', 'legacy-as3', 'queue', 'queue caps, five-item fan-out, two-tick damage cadence and ANumber creation in gameSence.'],
  ['a-number-as', 'legacy-as3', 'number', '20px damage stride, 4x->1x 0.2s pop, 0.25s delay, 100px/1s rise+fade+destroy; 50px combo stride.'],
  ['game-info-as', 'legacy-as3', 'gameInfo', 'MonsterIsBeat consumer, combo>=2 panel, fixed anchor, 2s fade, 40-tick unchanged reset and maximum update.'],
  ['batter-as', 'legacy-as3', 'batter', '1/2/3+ digit x anchors and num MovieClip layout.'],
  ['user-as', 'legacy-as3', 'user', 'Static current and biggest combo owners.'],
  ['game-win-as', 'legacy-as3', 'gameWin', 'Result page txt_hight consumes User.biggestbatterNum.'],
  ['magic-ring-as', 'legacy-as3', 'magicRing', 'Representative magic-weapon bullet sets its sourceRole to the owning hero before shared monster hit resolution.'],
  ['game-setting-as', 'legacy-as3', 'settings', 'Host frameClips/stage.frameRate choices 20, 24 and 30.'],
].map(([id, sourceType, sourceKey, locator]) => ({ id, sourceType, sourcePath: sources[sourceKey], sha256: sha256(sources[sourceKey]), locator }));

const visibleCount = (stateId) => displayObjects.filter((object) => object.placements.some((placement) => placement.stateId === stateId && placement.visible)).length;
const manifest = {
  $schema: '../schema/ui-ground-truth.schema.json',
  schemaVersion: 1,
  truthId: 'task-settings-211.combat-hit-feedback',
  status: 'verified',
  scope: {
    taskId: 'TASK-SETTINGS-211',
    surfaceId: 'monster-target-hit-numbers-and-global-combo-panel',
    originalVersion: 'RegiMA 1.1 restored corpus',
    description: 'Monster-target ordinary/critical number glyphs, target-relative anchor, queue fan-out/cadence, TweenMax visual key points, global combo threshold/placement, 2/9/10/99/100 layouts, five-frame combo digit pulse, unchanged-count reset and P1/P2 source invariance. Player/pet incoming, heal and MP numbers are excluded.',
  },
  generatedBy: { tool: 'generate-combat-hit-feedback-ground-truth.mjs', toolVersion: '1', command, generatedAt: '2026-09-02T12:00:00+08:00' },
  provenance,
  stage: { width: 940, height: 590, frameRate: 30, coordinateSpace: 'stage', scaleMode: 'noScale', alignment: 'top-left' },
  states,
  displayObjects,
  baselines,
  completeness: {
    expectedStateIds: states.map((state) => state.id),
    extractedStateIds: states.map((state) => state.id),
    expectedVisibleObjectCountByState: Object.fromEntries(states.map((state) => [state.id, visibleCount(state.id)])),
    displayListMatched: true,
    stateSetMatched: true,
    unresolved: [],
  },
  evidenceRefs: ['docs/reverse-engineering/combat-hit-feedback-index.md', 'docs/tasks/task-history.md'],
};

function validateSemanticHandoff(candidate) {
  const errors = [];
  const stateIds = new Set(candidate.states.map((state) => state.id));
  for (const id of ['rapid-six-hit-p1-t0', 'lethal-critical-p2-t200', 'effect-tick-no-combo-p1', 'combo-100-p1-frame-5', 'combo-10-p2-frame-5', 'combo-timeout-reset']) {
    if (!stateIds.has(id)) errors.push(`missing state ${id}`);
  }
  const findObject = (suffix) => candidate.displayObjects.find((object) => object.id.endsWith(suffix));
  const normalZero = findObject('hurtnum-0-0-0');
  if (!normalZero || normalZero.sourceIdentity.characterId !== 117) errors.push('hurtnum0 character mapping changed');
  const criticalNine = candidate.displayObjects.find((object) => object.sourceIdentity.symbolClass === 'bnum9');
  if (!criticalNine || criticalNine.sourceIdentity.characterId !== 23) errors.push('bnum9 character mapping changed');
  const comboPanel = candidate.displayObjects.find((object) => object.sourceIdentity.symbolClass === 'export.Batter');
  if (!comboPanel || comboPanel.placements[0].localMatrix.tx !== 694.95 || comboPanel.placements[0].localMatrix.ty !== 234.95) errors.push('Batter anchor changed');
  const rapidObjects = candidate.displayObjects.filter((object) => object.id.startsWith('rapid-six-hit-p1-t0.'));
  if (rapidObjects.length !== 10) errors.push('six-hit first-tick five-number fan-out changed');
  const comboFrames = new Set(candidate.displayObjects
    .filter((object) => object.id.startsWith('combo-2-p1-frame-'))
    .map((object) => object.sourceIdentity.frame));
  if ([1, 2, 3, 4, 5].some((frame) => !comboFrames.has(frame))) errors.push('combo five-frame timeline incomplete');
  if (candidate.completeness.unresolved.length !== 0) errors.push('verified handoff has unresolved entries');
  return errors;
}

const semanticErrors = validateSemanticHandoff(manifest);
if (semanticErrors.length) throw new Error(`combat feedback handoff invalid: ${semanticErrors.join('; ')}`);
if (process.argv.includes('--self-test')) {
  const mutations = [
    (candidate) => { candidate.states = candidate.states.filter((state) => state.id !== 'combo-100-p1-frame-5'); },
    (candidate) => { candidate.displayObjects.find((object) => object.sourceIdentity.symbolClass === 'hurtnum0').sourceIdentity.characterId = 999; },
    (candidate) => { candidate.displayObjects.find((object) => object.sourceIdentity.symbolClass === 'export.Batter').placements[0].localMatrix.tx = 700; },
    (candidate) => { candidate.displayObjects = candidate.displayObjects.filter((object) => !object.id.startsWith('rapid-six-hit-p1-t0.') || object.depth !== 1); },
    (candidate) => { candidate.completeness.unresolved.push({ id: 'mutation', description: 'mutation', impact: 'implementation', nextEvidence: 'mutation' }); },
  ];
  for (const mutate of mutations) {
    const candidate = structuredClone(manifest);
    mutate(candidate);
    if (validateSemanticHandoff(candidate).length === 0) throw new Error('semantic mutation was not rejected');
  }
  console.log(`Rejected ${mutations.length} combat-feedback semantic mutations.`);
}

const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
if (process.argv.includes('--check')) {
  if (readFileSync(path.join(root, outputPath), 'utf8') !== serialized) throw new Error(`${outputPath} is stale; run ${command}`);
  console.log(`Verified ${outputPath}: ${states.length} states, ${displayObjects.length} display objects.`);
} else {
  writeFileSync(path.join(root, outputPath), serialized);
  console.log(`Generated ${outputPath}: ${states.length} states, ${displayObjects.length} display objects.`);
}
