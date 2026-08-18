import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { inflateSync } from 'node:zlib';

const root = process.cwd();
const outputPath = path.join(root, 'docs/reverse-engineering/ground-truth/manifests/task-settings-193c-pet-horse-animation.json');
const taskOutput = 'local-resources/regima/task-outputs/task-settings-193c-pet-horse-animation';
const legacyRoot = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts';
const sourcePaths = {
  patchSwf: 'local-resources/regima/source/restored-swfs/assets/20120203.swf',
  baseSwf: 'local-resources/regima/source/restored-swfs/assets/pet1.swf',
  commonSwf: 'local-resources/regima/source/restored-swfs/assets/StageCommon.swf',
  horse1: `${legacyRoot}/export/pet/PetHorse1.as`,
  horse2: `${legacyRoot}/export/pet/PetHorse2.as`,
  horse3: `${legacyRoot}/export/pet/PetHorse3.as`,
  horse4: `${legacyRoot}/export/pet/PetHorse4.as`,
  basePet: `${legacyRoot}/base/BasePet.as`,
  baseObject: `${legacyRoot}/base/BaseObject.as`,
  bitmapClip: `${legacyRoot}/base/BaseBitmapDataClip.as`,
  baseBullet: `${legacyRoot}/base/BaseBullet.as`,
  addEffect: `${legacyRoot}/base/BaseAddEffect.as`,
  enemyMoveBullet: `${legacyRoot}/export/bullet/EnemyMoveBullet.as`,
  followBullet: `${legacyRoot}/export/bullet/FollowBaseObjectBullet.as`,
  aUtils: `${legacyRoot}/AUtils.as`,
  aloader: `${legacyRoot}/loader/Aloader.as`,
  assetsLoader: `${legacyRoot}/loader/AssetsLoader.as`,
  patchDump: `${taskOutput}/20120203.xml`,
  baseDump: `${taskOutput}/pet1.xml`,
  commonDump: `${taskOutput}/stagecommon.xml`,
};
const bytes = Object.fromEntries(Object.entries(sourcePaths).map(([id, relative]) => [id, readFileSync(path.join(root, relative))]));
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const hashPath = (relative) => sha256(readFileSync(path.join(root, relative)));
const text = (id) => bytes[id].toString('utf8');
const requireEvidence = (id, pattern, description) => {
  if (!pattern.test(text(id))) throw new Error(`${id} no longer proves ${description}`);
};

requireEvidence('aloader', /"20120203\.swf"[\s\S]*"StageCommon\.swf"[\s\S]*new LoaderContext\(false,ApplicationDomain\.currentDomain\)/, 'patch and StageCommon sequential load into the current ApplicationDomain');
requireEvidence('assetsLoader', /_loc1_\.push\("pet1","mouse"\)/, 'pet1 is added only by the later stage resource list');
requireEvidence('bitmapClip', /curFrameStopCount = this\.frameStopCount[\s\S]*--this\.curFrameStopCount/, 'body frame holds use host ticks');
requireEvidence('basePet', /GetDisBetweenTwoObj\(this,this\.sourceRole\) >= 1000[\s\S]*this\.x = this\.sourceRole\.x/, 'warp is a root position snap');
requireEvidence('basePet', /this\._petInfo\.getHp\(\) <= 0[\s\S]*this\.setAction\("dead"\)/, 'zero HP selects dead');
requireEvidence('baseBullet', /currentFrame == this\.imgMc\.totalFrames[\s\S]*this\.destroy\(\)/, 'ordinary MovieClips destroy at their last frame');
requireEvidence('addEffect', /getNewObj\("PetHorseIceEffect"\)[\s\S]*width = this\.sourceRole\.colipse\.width[\s\S]*stopFrame\(\)[\s\S]*hide_pethorse_ice[\s\S]*continueFrame\(\)/, 'ice effect scales to the collision owner and pauses/resumes its body clip');
requireEvidence('horse4', /new EnemyMoveBullet\("PetHorse4Bullet5"\)[\s\S]*setDestroyInCount\(gc\.frameClips \* 10\)[\s\S]*new SpecialEffectBullet\("PetHorse4Bullet5Explode"\)/, 'ultimate falling and explosion stages');
requireEvidence('horse1', /BaseBitmapDataClip\(\[_loc1_\],80,80[\s\S]*setOffsetXY\(1,-10\)[\s\S]*setFrameCount\(\[6,1,6,5,4\]\)/, 'horse1 body rows');
requireEvidence('horse2', /BaseBitmapDataClip\(\[_loc1_\],100,100[\s\S]*setOffsetXY\(1,-3\)[\s\S]*setFrameCount\(\[6,4,1,4,3,1,5\]\)/, 'horse2 body rows');
requireEvidence('horse3', /BaseBitmapDataClip\(\[_loc1_\],150,150[\s\S]*setOffsetXY\(1,-10\)[\s\S]*setFrameCount\(\[6,4,1,4,3,1,5,3\]\)/, 'horse3 body rows');
requireEvidence('horse4', /BaseBitmapDataClip\(\[_loc1_\],200,200[\s\S]*setOffsetXY\(1,-25\)[\s\S]*setFrameCount\(\[6,4,1,5,3,1,5,3,3\]\)/, 'horse4 body rows');

const fixtureRoot = { x: 470, y: 350 };
const bodyForms = [
  { form: 1, sourceKey: 'patchSwf', provenanceId: 'patch-swf', characterId: 17, symbol: 'PetHorseBmd1', atlas: `${taskOutput}/20120203-body/17_PetHorseBmd1.png`, cellWidth: 80, cellHeight: 80, offsetX: 1, offsetY: -10,
    actions: [['wait', 0, [2, 2, 2, 3, 2, 4], 6, 'loop'], ['walk', 0, [2, 2, 2, 3, 2, 4], 6, 'shares wait row and loops'], ['hurt', 1, [8], 1, 'setStatic then wait'], ['dead', 2, [2, 2, 2, 2, 1, 2], 6, 'destroy'], ['hit1-normal', 3, [2, 2, 1, 1, 8], 5, 'wait'], ['hit2-sp', 4, [2, 2, 2, 8], 4, 'wait']] },
  { form: 2, sourceKey: 'patchSwf', provenanceId: 'patch-swf', characterId: 15, symbol: 'PetHorseBmd2', atlas: `${taskOutput}/20120203-body/15_PetHorseBmd2.png`, cellWidth: 100, cellHeight: 100, offsetX: 1, offsetY: -3,
    actions: [['wait', 0, [2, 2, 2, 3, 2, 4], 6, 'loop'], ['walk', 1, [4, 4, 4, 4], 4, 'loop'], ['hurt', 2, [8], 1, 'setStatic then wait'], ['dead', 3, [2, 2, 2, 2, 10], 4, 'destroy before unused fifth atlas cell'], ['hit1-normal', 4, [2, 4, 20], 3, 'wait'], ['hit2-bd', 5, [15], 1, 'wait'], ['hit3-sp', 6, [2, 2, 1, 1, 8], 5, 'wait']] },
  { form: 3, sourceKey: 'patchSwf', provenanceId: 'patch-swf', characterId: 12, symbol: 'PetHorseBmd3', atlas: `${taskOutput}/20120203-body/12_PetHorseBmd3.png`, cellWidth: 150, cellHeight: 150, offsetX: 1, offsetY: -10,
    actions: [['wait', 0, [2, 2, 2, 3, 2, 4], 6, 'loop'], ['walk', 1, [4, 4, 4, 4], 4, 'loop'], ['hurt', 2, [8], 1, 'setStatic then wait'], ['dead', 3, [2, 2, 2, 2, 10], 4, 'destroy before unused fifth atlas cell'], ['hit1-normal', 4, [2, 2, 20], 3, 'wait'], ['hit2-bd', 5, [15], 1, 'wait'], ['hit3-sp', 6, [2, 2, 1, 1, 10], 5, 'wait'], ['hit4-bz', 7, [2, 2, 20], 3, 'wait']] },
  { form: 4, sourceKey: 'baseSwf', provenanceId: 'base-swf', characterId: 19, symbol: 'PetHorseBmd4', atlas: `${taskOutput}/pet1-body/19_PetHorseBmd4.png`, cellWidth: 200, cellHeight: 200, offsetX: 1, offsetY: -25,
    actions: [['wait', 0, [2, 2, 2, 3, 2, 4], 6, 'loop'], ['walk', 1, [4, 4, 4, 4], 4, 'loop'], ['hurt', 2, [8], 1, 'setStatic then wait'], ['dead', 3, [2, 2, 2, 2, 10], 5, 'destroy'], ['hit1-normal', 4, [2, 2, 20], 3, 'wait'], ['hit2-bd', 5, [15], 1, 'wait'], ['hit3-sp', 6, [2, 2, 1, 1, 10], 5, 'wait'], ['hit4-bz', 7, [2, 2, 20], 3, 'wait'], ['hit5-tmaoyi', 8, [2, 2, 10], 3, 'wait']] },
];

function decodePng(relative) {
  const data = readFileSync(path.join(root, relative));
  if (data.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`${relative} is not PNG`);
  let offset = 8; let width; let height; let bitDepth; let colorType; const idat = [];
  while (offset < data.length) {
    const length = data.readUInt32BE(offset); const type = data.subarray(offset + 4, offset + 8).toString('ascii'); const chunk = data.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') { width = chunk.readUInt32BE(0); height = chunk.readUInt32BE(4); bitDepth = chunk[8]; colorType = chunk[9]; } else if (type === 'IDAT') idat.push(chunk);
    offset += 12 + length;
  }
  if (bitDepth !== 8 || ![4, 6].includes(colorType)) throw new Error(`${relative} needs 8-bit alpha PNG, got ${bitDepth}/${colorType}`);
  const bpp = colorType === 6 ? 4 : 2; const stride = width * bpp; const raw = inflateSync(Buffer.concat(idat)); const pixels = Buffer.alloc(height * stride);
  const paeth = (a, b, c) => { const p = a + b - c; const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; };
  let sourceOffset = 0;
  for (let y = 0; y < height; y += 1) { const filter = raw[sourceOffset++]; for (let x = 0; x < stride; x += 1) { const rawValue = raw[sourceOffset++]; const left = x >= bpp ? pixels[y * stride + x - bpp] : 0; const up = y > 0 ? pixels[(y - 1) * stride + x] : 0; const upLeft = y > 0 && x >= bpp ? pixels[(y - 1) * stride + x - bpp] : 0; const value = filter === 0 ? rawValue : filter === 1 ? rawValue + left : filter === 2 ? rawValue + up : filter === 3 ? rawValue + Math.floor((left + up) / 2) : filter === 4 ? rawValue + paeth(left, up, upLeft) : Number.NaN; if (!Number.isFinite(value)) throw new Error(`${relative} uses unknown PNG filter ${filter}`); pixels[y * stride + x] = value & 0xff; } }
  return { width, height, bpp, alphaIndex: bpp - 1, stride, pixels };
}

function alphaBounds(png, crop) {
  let minX = crop.width; let minY = crop.height; let maxX = -1; let maxY = -1;
  for (let y = 0; y < crop.height; y += 1) for (let x = 0; x < crop.width; x += 1) { const alpha = png.pixels[(crop.top + y) * png.stride + (crop.left + x) * png.bpp + png.alphaIndex]; if (alpha > 0) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); } }
  return maxX < minX ? { left: 0, top: 0, width: 0, height: 0 } : { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function parseSvg(relative) {
  const value = readFileSync(path.join(root, relative), 'utf8'); const rootTag = value.match(/<svg\b[^>]*>/)?.[0]; const transform = value.match(/<g transform="matrix\(([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+)\)"/)?.slice(1).map(Number); const width = Number(rootTag?.match(/width="([\d.]+)px"/)?.[1]); const height = Number(rootTag?.match(/height="([\d.]+)px"/)?.[1]);
  if (!rootTag || !transform || !Number.isFinite(width) || !Number.isFinite(height)) throw new Error(`Cannot parse FFDec SVG geometry: ${relative}`);
  return { width, height, registrationX: transform[4], registrationY: transform[5] };
}

const directions = [{ id: 'left', direct: 0, scaleX: 1 }, { id: 'right', direct: 1, scaleX: -1 }];
const states = []; const baselines = []; const displayObjects = [];

for (const form of bodyForms) {
  const png = decodePng(form.atlas); const placements = []; const leftX = -form.cellWidth / 2 - form.offsetX; const rightX = -form.cellWidth / 2 + form.offsetX; const top = -form.cellHeight / 2 + form.offsetY;
  for (const [action, row, holds, frameCount, transition] of form.actions) {
    const cycleTicks = Array.from({ length: frameCount }, (_, sequence) => holds[sequence % holds.length]).reduce((sum, hold) => sum + hold, 0);
    for (let sequence = 0; sequence < frameCount; sequence += 1) {
      const cell = sequence % holds.length; const hold = holds[cell]; const crop = { left: cell * form.cellWidth, top: row * form.cellHeight, width: form.cellWidth, height: form.cellHeight }; const visible = alphaBounds(png, crop);
      for (const direction of directions) {
        const id = `body.horse${form.form}.${action}.seq${String(sequence + 1).padStart(2, '0')}.${direction.id}`; const baselineId = `original-${id}`; const clipX = direction.id === 'left' ? leftX : rightX; const localLeft = direction.id === 'left' ? clipX + visible.left : clipX + form.cellWidth - visible.left - visible.width; const localTop = top + visible.top;
        states.push({ id, entry: `${action}; row=${row}; sequence=${sequence + 1}/${frameCount}; atlasCell=${cell}; hold=${hold} host ticks; actionCycle=${cycleTicks} host ticks; ${transition}`, frame: sequence, fixtureId: `petRoot=(470,350); direct=${direction.direct}; hostClock=stage EnterFrame; quality=20|24|30`, baselineId });
        placements.push({ stateId: id, visible: visible.width > 0 && visible.height > 0, localMatrix: { a: direction.scaleX, b: 0, c: 0, d: 1, tx: direction.id === 'left' ? clipX : clipX + form.cellWidth, ty: top }, registrationPoint: { x: direction.id === 'left' ? -clipX : clipX + form.cellWidth, y: -top }, localBounds: { left: localLeft, top: localTop, width: visible.width, height: visible.height }, stageBounds: { left: fixtureRoot.x + localLeft, top: fixtureRoot.y + localTop, width: visible.width, height: visible.height }, derivation: 'calculated', derivationMethod: `BaseBitmapDataClip ${form.cellWidth}x${form.cellHeight}; setOffsetXY(${form.offsetX},${form.offsetY}); selected-owner atlas alpha bounds; right direction mirrors the cell`, evidenceRefs: [form.provenanceId, `pet-horse${form.form}-as`, 'base-bitmap-data-clip-as'] });
        baselines.push({ id: baselineId, stateId: id, path: form.atlas, sha256: hashPath(form.atlas), width: png.width, height: png.height, crop });
      }
    }
  }
  displayObjects.push({ id: `horse${form.form}-body`, parentId: null, depth: 0, objectType: 'bitmap', sourceIdentity: { provenanceId: form.provenanceId, characterId: form.characterId, symbolClass: form.symbol, instanceName: null, frame: null }, placements, render: { assetRef: form.atlas, blendMode: 'normal', filters: [], maskId: null } });
}

const spriteDefinitions = {
  PetHorse1Bullet1: ['patch-swf', 129, 5, '20120203'], PetHorse1Bullet2: ['patch-swf', 124, 8, '20120203'], PetHorse2Bullet1: ['patch-swf', 118, 14, '20120203'], PetHorse2Bullet2: ['patch-swf', 101, 45, '20120203'], PetHorse3Bullet1: ['patch-swf', 97, 20, '20120203'], PetHorse3Bullet2: ['patch-swf', 93, 15, '20120203'], PetHorse3Bullet3: ['patch-swf', 88, 8, '20120203'], PetHorse3Bullet4: ['patch-swf', 82, 31, '20120203'],
};
const spriteUsages = [
  ['horse1-normal', 1, 'normal', 'PetHorse1Bullet1', 45, -25, 'default last-frame destroy'], ['horse1-sp', 1, 'sp', 'PetHorse1Bullet2', 40, -15, 'follows horse1 root; default last-frame destroy; hit applies ice for frameClips*2'],
  ['horse2-normal', 2, 'normal', 'PetHorse2Bullet1', 70, -90, 'default last-frame destroy'], ['horse2-bd', 2, 'bd', 'PetHorse2Bullet2', 85, -95, 'follows horse2 root; default last-frame destroy; hit applies ice for frameClips*2'], ['horse2-sp', 2, 'sp', 'PetHorse1Bullet2', 60, -25, 'reuses visual as SpecialEffectBullet; default last-frame destroy'],
  ['horse3-normal', 3, 'normal', 'PetHorse3Bullet1', 150, -140, 'default last-frame destroy'], ['horse3-bd', 3, 'bd', 'PetHorse3Bullet2', 70, -85, 'follows horse3 root; default last-frame destroy; hit applies ice for frameClips*2'], ['horse3-sp', 3, 'sp', 'PetHorse3Bullet3', 80, -45, 'default last-frame destroy'], ['horse3-bz', 3, 'bz', 'PetHorse3Bullet4', 55, -50, 'default last-frame destroy'],
  ['horse4-normal', 4, 'normal', 'PetHorse3Bullet1', 150, -140, 'default last-frame destroy'], ['horse4-bd', 4, 'bd', 'PetHorse3Bullet2', 70, -85, 'follows horse4 root; default last-frame destroy; hit applies ice for frameClips*2'], ['horse4-sp', 4, 'sp', 'PetHorse3Bullet3', 80, -45, 'default last-frame destroy'], ['horse4-bz', 4, 'bz', 'PetHorse3Bullet4', 55, -50, 'default last-frame destroy'],
];

function addSpriteUsage({ usageId, form, action, symbol, offsetX, offsetY, lifecycle, directory, pngDirectory, provenanceId, characterId, totalFrames, directionsUsed = directions, fixtureRootOverride = fixtureRoot }) {
  const actualFrames = readdirSync(path.join(root, directory)).filter((name) => name.endsWith('.svg')).length; if (actualFrames !== totalFrames) throw new Error(`${symbol} expected ${totalFrames} frames, found ${actualFrames}`); const placements = [];
  for (let frame = 1; frame <= totalFrames; frame += 1) {
    const svgPath = `${directory}/${frame}.svg`; const pngPath = `${pngDirectory}/${frame}.png`; const geometry = parseSvg(svgPath); const baselinePng = decodePng(pngPath);
    for (const direction of directionsUsed) {
      const signedOffsetX = direction.id === 'left' ? -offsetX : offsetX; const mirrored = direction.scaleX === -1; const localLeft = mirrored ? signedOffsetX + geometry.registrationX - geometry.width : signedOffsetX - geometry.registrationX; const localTop = offsetY - geometry.registrationY; const id = `object.${usageId}.frame${String(frame).padStart(2, '0')}.${direction.id}`; const baselineId = `original-${id}`;
      states.push({ id, entry: `${action}; ${symbol} visual frame ${frame}/${totalFrames}; one host stage frame; ${lifecycle}`, frame: frame - 1, fixtureId: `root=(${fixtureRootOverride.x},${fixtureRootOverride.y}); emitOffset=(${signedOffsetX},${offsetY}); direct=${direction.direct}; hostClock=stage frameRate 20|24|30`, baselineId });
      placements.push({ stateId: id, visible: geometry.width > 0 && geometry.height > 0, localMatrix: { a: direction.scaleX, b: 0, c: 0, d: 1, tx: mirrored ? signedOffsetX + geometry.registrationX : signedOffsetX - geometry.registrationX, ty: localTop }, registrationPoint: { x: geometry.registrationX, y: geometry.registrationY }, localBounds: { left: localLeft, top: localTop, width: geometry.width, height: geometry.height }, stageBounds: { left: fixtureRootOverride.x + localLeft, top: fixtureRootOverride.y + localTop, width: geometry.width, height: geometry.height }, derivation: 'calculated', derivationMethod: 'FFDec SVG root bounds/registration plus AS3 emit point; BaseBullet.setDirect mirrors right-facing roots', evidenceRefs: [provenanceId, `pet-horse${form}-as`, 'base-bullet-as', 'a-utils-as'] });
      baselines.push({ id: baselineId, stateId: id, path: pngPath, sha256: hashPath(pngPath), width: baselinePng.width, height: baselinePng.height, crop: { left: 0, top: 0, width: baselinePng.width, height: baselinePng.height } });
    }
  }
  displayObjects.push({ id: usageId, parentId: null, depth: 1, objectType: 'movie-clip', sourceIdentity: { provenanceId, characterId, symbolClass: symbol, instanceName: null, frame: null }, placements, render: { assetRef: directory, blendMode: 'normal', filters: [], maskId: null } });
}

for (const [usageId, form, action, symbol, offsetX, offsetY, lifecycle] of spriteUsages) { const [provenanceId, characterId, totalFrames, ownerDir] = spriteDefinitions[symbol]; addSpriteUsage({ usageId, form, action, symbol, offsetX, offsetY, lifecycle, directory: `${taskOutput}/${ownerDir}-svg/DefineSprite_${characterId}_${symbol}`, pngDirectory: `${taskOutput}/${ownerDir}-sprites/DefineSprite_${characterId}_${symbol}`, provenanceId, characterId, totalFrames }); }

addSpriteUsage({ usageId: 'horse4-tmaoyi-falling', form: 4, action: 'tmaoyi-falling', symbol: 'PetHorse4Bullet5', offsetX: 0, offsetY: 0, lifecycle: 'one projectile per monster; spawn x=horse.x+(monsterCount/2-index)*90, y=50; nested 8-frame loop; 2000 distance or frameClips*10 timeout; optional homing when sp learned', directory: `${taskOutput}/pet1-svg-sublength8/DefineSprite_699_PetHorse4Bullet5/1`, pngDirectory: `${taskOutput}/pet1-sprites-sublength8/DefineSprite_699_PetHorse4Bullet5/1`, provenanceId: 'base-swf', characterId: 699, totalFrames: 8, directionsUsed: [{ id: 'fixed', direct: 0, scaleX: 1 }], fixtureRootOverride: { x: 605, y: 50 } });
addSpriteUsage({ usageId: 'horse4-tmaoyi-explode', form: 4, action: 'tmaoyi-explode', symbol: 'PetHorse4Bullet5Explode', offsetX: 0, offsetY: 0, lifecycle: 'spawn at falling projectile impact only when bz learned; delayed one second when bd is also learned; default last-frame destroy', directory: `${taskOutput}/pet1-svg/DefineSprite_695_PetHorse4Bullet5Explode`, pngDirectory: `${taskOutput}/pet1-sprites/DefineSprite_695_PetHorse4Bullet5Explode`, provenanceId: 'base-swf', characterId: 695, totalFrames: 30, directionsUsed: [{ id: 'fixed', direct: 0, scaleX: 1 }], fixtureRootOverride: { x: 605, y: 350 } });

const iceDirectory = `${taskOutput}/stagecommon-svg/DefineSprite_40_PetHorseIceEffect`; const icePngDirectory = `${taskOutput}/stagecommon-sprites/DefineSprite_40_PetHorseIceEffect`; const iceGeometry = parseSvg(`${iceDirectory}/1.svg`); const icePng = decodePng(`${icePngDirectory}/1.png`); const iceStates = [{ id: 'object.shared-ice.active', visible: true, width: 60, height: 80 }, { id: 'object.shared-ice.removed', visible: false, width: 0, height: 0 }]; const icePlacements = [];
for (const spec of iceStates) { const baselineId = `original-${spec.id}`; states.push({ id: spec.id, entry: spec.visible ? 'PETHORSE_ICE active; add once by child name; scale width/height to target colipse; stop target BBDC' : 'effect duration elapsed; remove child; continue target BBDC', frame: spec.visible ? 0 : 1, fixtureId: 'targetRoot=(605,350); targetColipse=60x80; duration=frameClips*2 or tmaoyi frameClips*2.4', baselineId }); const scaleX = spec.visible ? spec.width / iceGeometry.width : 0; const scaleY = spec.visible ? spec.height / iceGeometry.height : 0; const localLeft = -iceGeometry.registrationX * scaleX; const localTop = -iceGeometry.registrationY * scaleY; icePlacements.push({ stateId: spec.id, visible: spec.visible, localMatrix: { a: scaleX, b: 0, c: 0, d: scaleY, tx: localLeft, ty: localTop }, registrationPoint: { x: iceGeometry.registrationX, y: iceGeometry.registrationY }, localBounds: { left: localLeft, top: localTop, width: spec.width, height: spec.height }, stageBounds: { left: 605 + localLeft, top: 350 + localTop, width: spec.width, height: spec.height }, derivation: 'calculated', derivationMethod: 'StageCommon character 40 root geometry scaled by BaseAddEffect.show_pethorse_ice to the fixed target colipse fixture', evidenceRefs: ['common-swf', 'base-add-effect-as'] }); baselines.push({ id: baselineId, stateId: spec.id, path: `${icePngDirectory}/1.png`, sha256: hashPath(`${icePngDirectory}/1.png`), width: icePng.width, height: icePng.height, crop: { left: 0, top: 0, width: icePng.width, height: icePng.height } }); }
displayObjects.push({ id: 'shared-horse-ice-effect', parentId: null, depth: 2, objectType: 'movie-clip', sourceIdentity: { provenanceId: 'common-swf', characterId: 40, symbolClass: 'PetHorseIceEffect', instanceName: 'PetHorseIceEffect', frame: 1 }, placements: icePlacements, render: { assetRef: iceDirectory, blendMode: 'normal', filters: [], maskId: null } });

const provenanceSpecs = [
  ['patch-swf', 'restored-swf', 'patchSwf', 'assets/20120203.swf; selected owner for PetHorseBmd1/2/3 and PetHorse1..3 Bullet1..4 collision set'], ['base-swf', 'restored-swf', 'baseSwf', 'assets/pet1.swf; sole owner for PetHorseBmd4 and tmaoyi falling/explosion'], ['common-swf', 'restored-swf', 'commonSwf', 'assets/StageCommon.swf; Aloader owner for PetHorseIceEffect before later stage pet1'],
  ...[1, 2, 3, 4].map((form) => [`pet-horse${form}-as`, 'legacy-as3', `horse${form}`, 'body rows, action transitions, emit points, object classes and skill lifecycle']), ['base-pet-as', 'legacy-as3', 'basePet', 'follow/wait, >=1000 warp snap, hurt and zero-HP dead'], ['base-object-as', 'legacy-as3', 'baseObject', 'one BBDC step per host runtime step'], ['base-bitmap-data-clip-as', 'legacy-as3', 'bitmapClip', 'frame holds, row frame counts and left/right matrix'], ['base-bullet-as', 'legacy-as3', 'baseBullet', 'MovieClip clock, last-frame and explicit-count destruction'], ['base-add-effect-as', 'legacy-as3', 'addEffect', 'PETHORSE_ICE add/scale/pause/remove/resume'], ['enemy-move-bullet-as', 'legacy-as3', 'enemyMoveBullet', 'tmaoyi homing/gravity/distance movement'], ['follow-bullet-as', 'legacy-as3', 'followBullet', 'bd and horse1 sp follow their source body root'], ['a-utils-as', 'legacy-as3', 'aUtils', 'horizontal mirror matrix'], ['aloader-as', 'legacy-as3', 'aloader', '20120203 then StageCommon startup load into current ApplicationDomain'], ['assets-loader-as', 'legacy-as3', 'assetsLoader', 'pet1 stage load occurs later in current ApplicationDomain'], ['patch-ffdec-dump', 'ffdec-dump', 'patchDump', 'selected patch SymbolClass and DefineSprite timelines'], ['base-ffdec-dump', 'ffdec-dump', 'baseDump', 'PetHorseBmd4, nested tmaoyi and explosion timelines'], ['common-ffdec-dump', 'ffdec-dump', 'commonDump', 'StageCommon character 40 ice effect display list'],
];
const provenance = provenanceSpecs.map(([id, sourceType, key, locator]) => ({ id, sourceType: sourceType === 'ffdec-dump' ? 'ffdec-xml' : sourceType, sourcePath: sourcePaths[key], sha256: sha256(bytes[key]), locator }));
const manifest = { $schema: '../schema/ui-ground-truth.schema.json', schemaVersion: 1, truthId: 'task-settings-193c.pet-horse-animation', status: 'verified', scope: { taskId: 'TASK-SETTINGS-193C', surfaceId: 'pet-horse1-4-body-effects-and-ice', originalVersion: 'RegiMA 1.1 restored corpus', description: 'Horse1..4 body rows and host-tick holds, normal/sp/bd/bz objects, shared scaled ice effect, tmaoyi nested falling loop and explosion, owner precedence, registration, bounds, clocks and destruction fixtures. Warp remains a BasePet position snap without a dedicated row.' }, generatedBy: { tool: 'generate-pet-horse-animation-ground-truth.mjs', toolVersion: '1', command: 'npm run generate:pet-horse-animation-truth', generatedAt: '2026-08-18T22:30:00+08:00' }, provenance, stage: { width: 940, height: 590, frameRate: 30, coordinateSpace: 'stage', scaleMode: 'noScale', alignment: 'top-left' }, states, displayObjects, baselines, completeness: { expectedStateIds: states.map((state) => state.id), extractedStateIds: states.map((state) => state.id), expectedVisibleObjectCountByState: Object.fromEntries(states.map((state) => [state.id, state.id === 'object.shared-ice.removed' ? 0 : 1])), displayListMatched: true, stateSetMatched: true, unresolved: [] }, evidenceRefs: ['docs/reverse-engineering/evidence/TASK-SETTINGS-193C-pet-horse-animation.md', 'docs/reverse-engineering/pet-animation-corpus.md#task-settings-193c-马系逐帧真值', 'docs/reverse-engineering/pets-index.md#task-settings-193c-马系动画合同'] };
const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
if (process.argv.includes('--check')) { if (readFileSync(outputPath, 'utf8') !== serialized) throw new Error('Pet horse animation ground truth is stale'); console.log(`Pet horse animation ground truth is current (${states.length} states, ${displayObjects.length} objects)`); } else { writeFileSync(outputPath, serialized); console.log(`wrote ${path.relative(root, outputPath)} (${states.length} states, ${displayObjects.length} objects)`); }
