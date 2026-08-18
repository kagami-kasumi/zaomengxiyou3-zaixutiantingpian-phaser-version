import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { inflateSync } from 'node:zlib';

const root = process.cwd();
const outputPath = path.join(root, 'docs/reverse-engineering/ground-truth/manifests/task-settings-193a-pet-monkey-animation.json');
const taskOutput = 'local-resources/regima/task-outputs/task-settings-193a-pet-monkey-animation';
const sourcePaths = {
  patchSwf: 'local-resources/regima/source/restored-swfs/assets/20120203.swf',
  baseSwf: 'local-resources/regima/source/restored-swfs/assets/pet1.swf',
  monkey1: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pet/PetMonkey1.as',
  monkey2: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pet/PetMonkey2.as',
  monkey3: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pet/PetMonkey3.as',
  monkey4: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pet/PetMonkey4.as',
  basePet: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BasePet.as',
  baseObject: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BaseObject.as',
  bitmapClip: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BaseBitmapDataClip.as',
  baseBullet: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BaseBullet.as',
  aUtils: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/AUtils.as',
  aloader: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/loader/Aloader.as',
  assetsLoader: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/loader/AssetsLoader.as',
  patchXml: `${taskOutput}/20120203.xml`,
  baseXml: `${taskOutput}/pet1.xml`,
};
const bytes = Object.fromEntries(Object.entries(sourcePaths).map(([id, relative]) => [id, readFileSync(path.join(root, relative))]));
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const hashPath = (relative) => sha256(readFileSync(path.join(root, relative)));
const text = (id) => bytes[id].toString('utf8');
const requireEvidence = (id, pattern, description) => {
  if (!pattern.test(text(id))) throw new Error(`${id} no longer proves ${description}`);
};

requireEvidence('aloader', /"20120203\.swf"[\s\S]*new LoaderContext\(false,ApplicationDomain\.currentDomain\)/, 'patch load into the current ApplicationDomain');
requireEvidence('assetsLoader', /_loc1_\.push\("pet1","mouse"\)/, 'pet1 is added by the stage resource list');
requireEvidence('assetsLoader', /new LoaderContext\(false,ApplicationDomain\.currentDomain\)/, 'stage resources load into the current ApplicationDomain');
requireEvidence('bitmapClip', /curFrameStopCount = this\.frameStopCount[\s\S]*if\(this\.curFrameStopCount > 1\)[\s\S]*--this\.curFrameStopCount/, 'host-tick bitmap frame holds');
requireEvidence('basePet', /AUtils\.GetDisBetweenTwoObj\(this,this\.sourceRole\) >= 1000[\s\S]*this\.x = this\.sourceRole\.x/, 'warp is a position snap without a dedicated action row');
requireEvidence('basePet', /this\._petInfo\.getHp\(\) <= 0[\s\S]*this\.setAction\("dead"\)/, 'zero HP enters the dead row');
requireEvidence('baseBullet', /currentFrame == this\.imgMc\.totalFrames[\s\S]*this\.destroy\(\)/, 'default MovieClip last-frame destruction');
requireEvidence('aUtils', /_loc3_\.a = param2 == 1 \? Math\.abs\(_loc4_\) : -Math\.abs\(_loc4_\)/, 'horizontal mirroring changes matrix a around the object root');
requireEvidence('monkey1', /BaseBitmapDataClip\(\[_loc1_\],70,70[\s\S]*setOffsetXY\(-8,-10\)[\s\S]*setFrameCount\(\[4,1,6,4,4\]\)/, 'monkey1 body canvas, offset and rows');
requireEvidence('monkey2', /BaseBitmapDataClip\(\[_loc1_\],100,100[\s\S]*setOffsetXY\(-8,0\)[\s\S]*setFrameCount\(\[6,4,1,5,3,12,1\]\)/, 'monkey2 body canvas, offset and rows');
requireEvidence('monkey3', /BaseBitmapDataClip\(\[_loc1_\],150,150[\s\S]*setOffsetXY\(-8,5\)[\s\S]*setFrameCount\(\[6,4,1,5,3,3,1,20\]\)/, 'monkey3 body canvas, offset and rows');
requireEvidence('monkey4', /BaseBitmapDataClip\(\[_loc1_\],200,200[\s\S]*setOffsetXY\(-8,-5\)[\s\S]*setFrameCount\(\[6,4,1,5,3,3,1,20,3\]\)/, 'monkey4 body canvas, offset and rows');

const fixtureRoot = { x: 470, y: 350 };
const bodyForms = [
  {
    form: 1, sourceKey: 'patchSwf', provenanceId: 'patch-swf', characterId: 7, symbol: 'PetMonkeyBmd1',
    atlas: `${taskOutput}/20120203-body/7_PetMonkeyBmd1.png`, cellWidth: 70, cellHeight: 70, offsetX: -8, offsetY: -10,
    actions: [
      ['wait', 0, [2, 2, 2, 2], 4, 'loops to wait frame 0'],
      ['walk', 0, [2, 2, 2, 2], 4, 'shares the wait row and loops to frame 0'],
      ['hurt', 1, [8], 1, 'setStatic then wait'],
      ['dead', 2, [2, 2, 2, 2, 1, 1], 6, 'destroy after the row'],
      ['hit1-normal', 3, [2, 2, 2, 10], 4, 'wait after the row'],
      ['hit2-xj', 4, [1, 1, 1, 12], 4, 'wait after the row'],
    ],
  },
  {
    form: 2, sourceKey: 'patchSwf', provenanceId: 'patch-swf', characterId: 14, symbol: 'PetMonkeyBmd2',
    atlas: `${taskOutput}/20120203-body/14_PetMonkeyBmd2.png`, cellWidth: 100, cellHeight: 100, offsetX: -8, offsetY: 0,
    actions: [
      ['wait', 0, [2, 2, 2, 3, 2, 4], 6, 'loops to wait frame 0'],
      ['walk', 1, [4, 4, 4, 4], 4, 'loops to walk frame 0'],
      ['hurt', 2, [8], 1, 'setStatic then wait'],
      ['dead', 3, [2, 2, 2, 2, 10], 5, 'destroy after the row'],
      ['hit1-normal', 4, [2, 2, 8], 3, 'wait after the row'],
      ['hit2-lj', 5, [1, 1], 12, 'six two-cell loops, then wait'],
      ['hit3-xj', 6, [10], 1, 'wait after the row'],
    ],
  },
  {
    form: 3, sourceKey: 'patchSwf', provenanceId: 'patch-swf', characterId: 11, symbol: 'PetMonkeyBmd3',
    atlas: `${taskOutput}/20120203-body/11_PetMonkeyBmd3.png`, cellWidth: 150, cellHeight: 150, offsetX: -8, offsetY: 5,
    actions: [
      ['wait', 0, [2, 2, 2, 3, 2, 4], 6, 'loops to wait frame 0'],
      ['walk', 1, [4, 4, 4, 4], 4, 'loops to walk frame 0'],
      ['hurt', 2, [8], 1, 'setStatic then wait'],
      ['dead', 3, [2, 2, 2, 2, 10], 5, 'destroy after the row'],
      ['hit1-normal', 4, [2, 2, 8], 3, 'wait after the row'],
      ['hit2-lyq', 5, [2, 9, 15], 3, 'wait after the row'],
      ['hit3-xj', 6, [10], 1, 'wait after the row'],
      ['hit4-lj', 7, [1, 1], 20, 'ten two-cell loops, then wait'],
    ],
  },
  {
    form: 4, sourceKey: 'baseSwf', provenanceId: 'base-swf', characterId: 20, symbol: 'PetMonkeyBmd4',
    atlas: `${taskOutput}/pet1-body/20_PetMonkeyBmd4.png`, cellWidth: 200, cellHeight: 200, offsetX: -8, offsetY: -5,
    actions: [
      ['wait', 0, [2, 2, 2, 3, 2, 4], 6, 'loops to wait frame 0'],
      ['walk', 1, [4, 4, 4, 4], 4, 'loops to walk frame 0'],
      ['hurt', 2, [8], 1, 'clears jgaoyi chaining, setStatic, then wait'],
      ['dead', 3, [2, 2, 2, 2, 10], 5, 'destroy after the row'],
      ['hit1-normal', 4, [2, 2, 8], 3, 'wait or chain to hit5 while jgaoyi has remaining targets'],
      ['hit2-lyq', 5, [2, 9, 15], 3, 'wait or chain to hit5 while jgaoyi has remaining targets'],
      ['hit3-xj', 6, [10], 1, 'wait after the row'],
      ['hit4-lj', 7, [1, 1], 20, 'wait or chain to hit5 while jgaoyi has remaining targets'],
      ['hit5-jgaoyi', 8, [2, 2, 2], 3, 'retarget and chain learned skills until hit5Times reaches zero, then return to owner and wait'],
    ],
  },
];

function decodePng(relative) {
  const data = readFileSync(path.join(root, relative));
  if (data.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`${relative} is not PNG`);
  let offset = 8;
  let width;
  let height;
  let bitDepth;
  let colorType;
  const idat = [];
  while (offset < data.length) {
    const length = data.readUInt32BE(offset);
    const type = data.subarray(offset + 4, offset + 8).toString('ascii');
    const chunk = data.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = chunk.readUInt32BE(0); height = chunk.readUInt32BE(4); bitDepth = chunk[8]; colorType = chunk[9];
    } else if (type === 'IDAT') idat.push(chunk);
    offset += 12 + length;
  }
  if (bitDepth !== 8 || ![4, 6].includes(colorType)) throw new Error(`${relative} needs 8-bit gray/RGBA alpha PNG, got ${bitDepth}/${colorType}`);
  const bpp = colorType === 6 ? 4 : 2;
  const stride = width * bpp;
  const raw = inflateSync(Buffer.concat(idat));
  const pixels = Buffer.alloc(height * stride);
  const paeth = (a, b, c) => {
    const p = a + b - c; const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };
  let sourceOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[sourceOffset++];
    for (let x = 0; x < stride; x += 1) {
      const rawValue = raw[sourceOffset++];
      const left = x >= bpp ? pixels[y * stride + x - bpp] : 0;
      const up = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const upLeft = y > 0 && x >= bpp ? pixels[(y - 1) * stride + x - bpp] : 0;
      const value = filter === 0 ? rawValue
        : filter === 1 ? rawValue + left
          : filter === 2 ? rawValue + up
            : filter === 3 ? rawValue + Math.floor((left + up) / 2)
              : filter === 4 ? rawValue + paeth(left, up, upLeft)
                : Number.NaN;
      if (!Number.isFinite(value)) throw new Error(`${relative} uses unknown PNG filter ${filter}`);
      pixels[y * stride + x] = value & 0xff;
    }
  }
  return { width, height, bpp, alphaIndex: bpp - 1, stride, pixels };
}

function alphaBounds(png, crop) {
  let minX = crop.width; let minY = crop.height; let maxX = -1; let maxY = -1;
  for (let y = 0; y < crop.height; y += 1) {
    for (let x = 0; x < crop.width; x += 1) {
      const sourceX = crop.left + x; const sourceY = crop.top + y;
      const alpha = png.pixels[sourceY * png.stride + sourceX * png.bpp + png.alphaIndex];
      if (alpha > 0) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
    }
  }
  if (maxX < minX) return { left: 0, top: 0, width: 0, height: 0 };
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function parseSvg(relative) {
  const value = readFileSync(path.join(root, relative), 'utf8');
  const rootTag = value.match(/<svg\b[^>]*>/)?.[0];
  const transform = value.match(/<g transform="matrix\(([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+)\)"/)?.slice(1).map(Number);
  const width = Number(rootTag?.match(/width="([\d.]+)px"/)?.[1]);
  const height = Number(rootTag?.match(/height="([\d.]+)px"/)?.[1]);
  if (!rootTag || !transform || !Number.isFinite(width) || !Number.isFinite(height)) throw new Error(`Cannot parse FFDec SVG geometry: ${relative}`);
  if (transform[0] !== 1 || transform[1] !== 0 || transform[2] !== 0 || transform[3] !== 1) throw new Error(`Unexpected root transform: ${relative}`);
  return { width, height, registrationX: transform[4], registrationY: transform[5] };
}

const directions = [
  { id: 'left', direct: 0, scaleX: 1 },
  { id: 'right', direct: 1, scaleX: -1 },
];
const states = [];
const baselines = [];
const displayObjects = [];

for (const form of bodyForms) {
  const png = decodePng(form.atlas);
  const placements = [];
  const bbdcLeft = -form.cellWidth / 2 - form.offsetX;
  const bbdcRight = -form.cellWidth / 2 + form.offsetX;
  const bbdcTop = -form.cellHeight / 2 + form.offsetY;
  for (const [action, row, holds, frameCount, transition] of form.actions) {
    const cycleTicks = Array.from({ length: frameCount }, (_, sequence) => holds[sequence % holds.length]).reduce((sum, hold) => sum + hold, 0);
    for (let sequence = 0; sequence < frameCount; sequence += 1) {
      const cell = sequence % holds.length;
      const hold = holds[cell];
      const crop = { left: cell * form.cellWidth, top: row * form.cellHeight, width: form.cellWidth, height: form.cellHeight };
      const visible = alphaBounds(png, crop);
      for (const direction of directions) {
        const id = `body.monkey${form.form}.${action}.seq${String(sequence + 1).padStart(2, '0')}.${direction.id}`;
        const baselineId = `original-${id}`;
        const bbdcX = direction.id === 'left' ? bbdcLeft : bbdcRight;
        const localLeft = direction.id === 'left'
          ? bbdcX + visible.left
          : bbdcX + form.cellWidth - visible.left - visible.width;
        const localTop = bbdcTop + visible.top;
        states.push({
          id,
          entry: `${action}; row=${row}; sequence=${sequence + 1}/${frameCount}; atlasCell=${cell}; hold=${hold} host ticks; actionCycle=${cycleTicks} host ticks; ${transition}`,
          frame: sequence,
          fixtureId: `petRoot=(470,350); direct=${direction.direct}; hostClock=stage EnterFrame; quality stage/frameClips=20|24|30`,
          baselineId,
        });
        placements.push({
          stateId: id,
          visible: visible.width > 0 && visible.height > 0,
          localMatrix: { a: direction.scaleX, b: 0, c: 0, d: 1, tx: direction.id === 'left' ? bbdcX : bbdcX + form.cellWidth, ty: bbdcTop },
          registrationPoint: { x: direction.id === 'left' ? -bbdcX : bbdcX + form.cellWidth, y: -bbdcTop },
          localBounds: { left: localLeft, top: localTop, width: visible.width, height: visible.height },
          stageBounds: { left: fixtureRoot.x + localLeft, top: fixtureRoot.y + localTop, width: visible.width, height: visible.height },
          derivation: 'calculated',
          derivationMethod: `BaseBitmapDataClip ${form.cellWidth}x${form.cellHeight}; setOffsetXY(${form.offsetX},${form.offsetY}); alpha bounds scanned from selected owner atlas; right direction mirrors the cell around the BBDC canvas`,
          evidenceRefs: [form.provenanceId, `pet-monkey${form.form}-as`, 'base-bitmap-data-clip-as'],
        });
        baselines.push({ id: baselineId, stateId: id, path: form.atlas, sha256: hashPath(form.atlas), width: png.width, height: png.height, crop });
      }
    }
  }
  displayObjects.push({
    id: `monkey${form.form}-body`, parentId: null, depth: 0, objectType: 'bitmap',
    sourceIdentity: { provenanceId: form.provenanceId, characterId: form.characterId, symbolClass: form.symbol, instanceName: null, frame: null },
    placements,
    render: { assetRef: form.atlas, blendMode: 'normal', filters: [], maskId: null },
  });
}

const spriteDefinitions = {
  PetMonkey1Bullet1: [241, 10], PetMonkey1Bullet2: [229, 16], PetMonkey2Bullet1: [212, 4],
  PetMonkey2Bullet2_1: [207, 4], PetMonkey2Bullet2_2: [208, 5], PetMonkey3Bullet1: [200, 6],
  PetMonkey3Bullet2: [192, 25], PetMonkey3Bullet3_1: [136, 4], PetMonkey3Bullet3_2: [137, 6],
};
const spriteUsages = [
  ['monkey1-normal', 1, 'normal', 'PetMonkey1Bullet1', 45, -25, 'default last-frame destroy'],
  ['monkey1-xj', 1, 'xj', 'PetMonkey1Bullet2', 45, -80, 'follow pet; loop; destroy after frameClips*4 ticks'],
  ['monkey2-normal', 2, 'normal', 'PetMonkey2Bullet1', 65, -30, 'default last-frame destroy'],
  ['monkey2-lj-prelude', 2, 'lj-prelude', 'PetMonkey2Bullet2_1', 15, -15, 'disabled collision; default last-frame destroy'],
  ['monkey2-lj-damage', 2, 'lj-damage', 'PetMonkey2Bullet2_2', 0, 0, 'default last-frame destroy'],
  ['monkey2-xj', 2, 'xj', 'PetMonkey1Bullet2', 45, -70, 'follow pet; loop; destroy after frameClips*4 ticks'],
  ['monkey3-normal', 3, 'normal', 'PetMonkey3Bullet1', 100, -40, 'default last-frame destroy'],
  ['monkey3-lyq', 3, 'lyq', 'PetMonkey3Bullet2', 35, -60, 'default last-frame destroy'],
  ['monkey3-xj', 3, 'xj', 'PetMonkey1Bullet2', 45, -50, 'follow pet; loop; destroy after frameClips*4 ticks'],
  ['monkey3-lj-prelude', 3, 'lj-prelude', 'PetMonkey3Bullet3_1', 0, -15, 'disabled collision; inserted behind pet; default last-frame destroy'],
  ['monkey3-lj-damage', 3, 'lj-damage', 'PetMonkey3Bullet3_2', 10, -15, 'default last-frame destroy'],
  ['monkey4-normal', 4, 'normal', 'PetMonkey3Bullet1', 100, -40, 'default last-frame destroy'],
  ['monkey4-lyq', 4, 'lyq', 'PetMonkey3Bullet2', 35, -60, 'default last-frame destroy'],
  ['monkey4-xj', 4, 'xj', 'PetMonkey1Bullet2', 45, -50, 'follow pet; loop; destroy after frameClips*4 ticks'],
  ['monkey4-lj-prelude', 4, 'lj-prelude', 'PetMonkey3Bullet3_1', 0, -15, 'disabled collision; inserted behind pet; default last-frame destroy'],
  ['monkey4-lj-damage', 4, 'lj-damage', 'PetMonkey3Bullet3_2', 10, -15, 'default last-frame destroy'],
];

for (const [usageId, form, action, symbol, offsetX, offsetY, lifecycle] of spriteUsages) {
  const [characterId, totalFrames] = spriteDefinitions[symbol];
  const directory = `${taskOutput}/20120203-svg/DefineSprite_${characterId}_${symbol}`;
  const actualFrames = readdirSync(path.join(root, directory)).filter((name) => name.endsWith('.svg')).length;
  if (actualFrames !== totalFrames) throw new Error(`${symbol} expected ${totalFrames} SVG frames, found ${actualFrames}`);
  const placements = [];
  for (let frame = 1; frame <= totalFrames; frame += 1) {
      const svgPath = `${directory}/${frame}.svg`;
      const pngPath = svgPath.replace('/20120203-svg/', '/20120203-sprites/').replace(/\.svg$/, '.png');
      const geometry = parseSvg(svgPath);
      const baselinePng = decodePng(pngPath);
    for (const direction of directions) {
      const signedOffsetX = direction.id === 'left' ? -offsetX : offsetX;
      const emitX = signedOffsetX;
      const emitY = offsetY;
      const localLeft = direction.id === 'left' ? emitX - geometry.registrationX : emitX + geometry.registrationX - geometry.width;
      const localTop = emitY - geometry.registrationY;
      const id = `object.${usageId}.frame${String(frame).padStart(2, '0')}.${direction.id}`;
      const baselineId = `original-${id}`;
      states.push({
        id,
        entry: `${action}; ${symbol} root frame ${frame}/${totalFrames}; one host stage frame; ${lifecycle}`,
        frame: frame - 1,
        fixtureId: `petRoot=(470,350); emitOffset=(${signedOffsetX},${emitY}); direct=${direction.direct}; hostClock=stage frameRate 20|24|30`,
        baselineId,
      });
      placements.push({
        stateId: id,
        visible: geometry.width > 0 && geometry.height > 0,
        localMatrix: { a: direction.scaleX, b: 0, c: 0, d: 1, tx: direction.id === 'left' ? emitX - geometry.registrationX : emitX + geometry.registrationX, ty: localTop },
        registrationPoint: { x: geometry.registrationX, y: geometry.registrationY },
        localBounds: { left: localLeft, top: localTop, width: geometry.width, height: geometry.height },
        stageBounds: { left: fixtureRoot.x + localLeft, top: fixtureRoot.y + localTop, width: geometry.width, height: geometry.height },
        derivation: 'calculated',
        derivationMethod: 'FFDec sprite SVG root bounds and root registration translation; BaseBullet.setDirect mirrors right-facing objects around their runtime root; AS3 enterFrameFunc supplies the emit offset',
        evidenceRefs: ['patch-swf', `pet-monkey${form}-as`, 'base-bullet-as', 'a-utils-as', 'patch-ffdec-xml'],
      });
      baselines.push({ id: baselineId, stateId: id, path: pngPath, sha256: hashPath(pngPath), width: baselinePng.width, height: baselinePng.height, crop: { left: 0, top: 0, width: baselinePng.width, height: baselinePng.height } });
    }
  }
  displayObjects.push({
    id: usageId, parentId: null, depth: action.endsWith('prelude') ? -1 : 1, objectType: 'movie-clip',
    sourceIdentity: { provenanceId: 'patch-swf', characterId, symbolClass: symbol, instanceName: null, frame: null },
    placements,
    render: { assetRef: directory, blendMode: 'normal', filters: [], maskId: null },
  });
}

const provenance = [
  ['patch-swf', 'restored-swf', 'patchSwf', 'assets/20120203.swf; selected owner for PetMonkeyBmd1/2/3 and all nine monkey effect MovieClips; loaded by Aloader before stage pet1 assets'],
  ['base-swf', 'restored-swf', 'baseSwf', 'assets/pet1.swf; sole audited owner for PetMonkeyBmd4 character 20'],
  ['pet-monkey1-as', 'legacy-as3', 'monkey1', 'initBBDC, setAction, frame-over transitions, hit1/xj emit frames and offsets'],
  ['pet-monkey2-as', 'legacy-as3', 'monkey2', 'initBBDC, setAction, frame-over transitions, normal/lj/xj two-stage emit frames and offsets'],
  ['pet-monkey3-as', 'legacy-as3', 'monkey3', 'initBBDC, setAction, frame-over transitions, normal/lyq/xj/lj emit frames and offsets'],
  ['pet-monkey4-as', 'legacy-as3', 'monkey4', 'initBBDC, setAction, hit5 chaining, inherited normal/lyq/xj/lj emit frames and offsets'],
  ['base-pet-as', 'legacy-as3', 'basePet', 'step/myIntelligence/followSource/reduceHp: host step clock, follow/wait, >=1000 snap, hurt and zero-HP dead lifecycle'],
  ['base-object-as', 'legacy-as3', 'baseObject', 'BaseObject.step calls bbdc.step once per runtime step; setAction dead resumes a stopped clip'],
  ['base-bitmap-data-clip-as', 'legacy-as3', 'bitmapClip', 'frameShow/step/setXYByDirect: frameStopCount host ticks, frameCount loop count, left/right registration matrix'],
  ['base-bullet-as', 'legacy-as3', 'baseBullet', 'MovieClip child playback, last-frame destroy, looping xj lifetime and setDirect mirroring'],
  ['a-utils-as', 'legacy-as3', 'aUtils', 'flipHorizontal changes matrix a only, so right-facing bullets mirror around their runtime root'],
  ['aloader-as', 'legacy-as3', 'aloader', 'constructor URL order includes 20120203 before later patches; sequential next(); current ApplicationDomain'],
  ['assets-loader-as', 'legacy-as3', 'assetsLoader', 'pet1 is added only by stage getRolesAndPetsAssets and loaded into current ApplicationDomain'],
  ['patch-ffdec-xml', 'ffdec-xml', 'patchXml', 'FFDec 26 dumpSWF tag list: patch character tags and DefineSprite timeline structure used by the selected SymbolClass exports'],
  ['base-ffdec-xml', 'ffdec-xml', 'baseXml', 'FFDec 26 dumpSWF tag list: PetMonkeyBmd4 character 20 and base-package collision candidate character tags'],
].map(([id, sourceType, key, locator]) => ({ id, sourceType, sourcePath: sourcePaths[key], sha256: sha256(bytes[key]), locator }));

const manifest = {
  $schema: '../schema/ui-ground-truth.schema.json',
  schemaVersion: 1,
  truthId: 'task-settings-193a.pet-monkey-animation',
  status: 'verified',
  scope: {
    taskId: 'TASK-SETTINGS-193A',
    surfaceId: 'pet-monkey1-4-body-and-effects',
    originalVersion: 'RegiMA 1.1 restored corpus',
    description: 'Monkey1..4 body rows, exact host-tick holds, left/right registration and visible bounds, normal attack objects, xj/lj/lyq objects, monkey4 jgaoyi body row, emit matrices, MovieClip clock and destruction fixtures. Warp has no dedicated original clip: BasePet performs a position snap while preserving the current non-attack action.',
  },
  generatedBy: {
    tool: 'generate-pet-monkey-animation-ground-truth.mjs', toolVersion: '1',
    command: 'npm run generate:pet-monkey-animation-truth', generatedAt: '2026-08-18T18:00:00+08:00',
  },
  provenance,
  stage: { width: 940, height: 590, frameRate: 30, coordinateSpace: 'stage', scaleMode: 'noScale', alignment: 'top-left' },
  states,
  displayObjects,
  baselines,
  completeness: {
    expectedStateIds: states.map((state) => state.id), extractedStateIds: states.map((state) => state.id),
    expectedVisibleObjectCountByState: Object.fromEntries(states.map((state) => [state.id, 1])),
    displayListMatched: true, stateSetMatched: true, unresolved: [],
  },
  evidenceRefs: [
    'docs/reverse-engineering/evidence/TASK-SETTINGS-193A-pet-monkey-animation.md',
    'docs/reverse-engineering/pet-animation-corpus.md#task-settings-193a-猴系逐帧真值',
    'docs/reverse-engineering/pets-index.md#task-settings-193a-猴系动画合同',
  ],
};

const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
if (process.argv.includes('--check')) {
  if (readFileSync(outputPath, 'utf8') !== serialized) throw new Error('Pet monkey animation ground truth is stale');
  console.log(`Pet monkey animation ground truth is current (${states.length} states, ${displayObjects.length} objects)`);
} else {
  writeFileSync(outputPath, serialized);
  console.log(`wrote ${path.relative(root, outputPath)} (${states.length} states, ${displayObjects.length} objects)`);
}
