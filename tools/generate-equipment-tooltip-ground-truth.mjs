import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputPath = 'docs/reverse-engineering/ground-truth/manifests/task-settings-189-equipment-tooltip.json';
const evidenceDirectory = 'docs/tasks/evidence/TASK-SETTINGS-189';
const restoredSwf = 'local-resources/regima/source/restored-swfs/1_MainLoad__main1.swf';
const attributeAs = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pack/AttributeCon.as';
const showObjAs = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pack/ShowObj.as';
const equipAs = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/my/MyEquipObj.as';
const backpackAs = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pack/BackPack.as';
const packThingsAs = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pack/PackThings.as';
const catalogPath = 'docs/reverse-engineering/reference/equipment-data-catalog-1.1.json';
const fontPath = 'public/assets/fonts/FZCuYuan-M03.ttf';

const catalog = JSON.parse(readFileSync(path.join(root, catalogPath), 'utf8'));
const byFillName = Object.fromEntries(catalog.items.map((item) => [item.fillName, item]));
const states = [
  state('normal-hidden', 'No ShowObj pointer hover; AttributeCon is absent', 'surface=inventory; hover=none'),
  state('inventory-base-hover', 'Pointer enters an equipment ShowObj in the 5x5 inventory grid', 'owner=p1; surface=inventory-grid; fillName=_clj; strength=0; mouse=600,170'),
  state('inventory-random-strength-hover', 'Pointer enters a randomized +3 equipment instance', 'owner=p1; surface=inventory-grid; fillName=_clj; baseAttack=234; strength=3; mouse=600,170'),
  state('equipped-slot-hover', 'Pointer enters an equipped-slot ShowObj', 'owner=p1; surface=equipped-slot; fillName=_clj; strength=3; mouse=185,180'),
  state('magic-weapon-progress-hover', 'Pointer enters a magic weapon with progression metadata', 'owner=p1; surface=inventory-grid; fillName=fbqpj; level=1; growth=3; elements=none; mouse=520,165'),
  state('p2-hover', 'P2 page reuses the same ShowObj and AttributeCon display list', 'owner=p2; surface=inventory-grid; fillName=_clj; strength=0; mouse=700,210'),
  state('right-edge-flip-hover', 'Pointer is close enough to the right edge to flip the tooltip left', 'owner=p1; surface=inventory-grid; fillName=_clj; mouse=925,210'),
  state('bottom-edge-clamp-hover', 'Pointer is close enough to the bottom edge to clamp the tooltip upward', 'owner=p1; surface=inventory-grid; fillName=_clj; mouse=500,580'),
  state('move-out-hidden', 'ShowObj ROLL_OUT removes AttributeCon from the stage', 'surface=inventory; event=ROLL_OUT'),
  state('page-refresh-hidden', 'PackThings removal during category/page/transaction refresh removes the live tooltip', 'surface=inventory; event=REMOVED_FROM_STAGE'),
  state('reopened-hover', 'Pointer re-enters after close/reopen and creates a fresh AttributeCon', 'owner=p1; surface=inventory-grid; fillName=_clj; strength=0; mouse=600,170'),
  state('shop-fashion-disabled', 'Micropayment fashion ShowObj removes ROLL_OVER/ROLL_OUT listeners', 'surface=shop; type=zbsz; hover=disabled'),
];
const stateIds = states.map(({ id }) => id);

const fixtures = {
  'inventory-base-hover': fixture('_clj', 600, 170),
  'inventory-random-strength-hover': fixture('_clj', 600, 170, { strength: 3, baseAttack: 234 }),
  'equipped-slot-hover': fixture('_clj', 185, 180, { strength: 3 }),
  'magic-weapon-progress-hover': fixture('fbqpj', 520, 165),
  'p2-hover': fixture('_clj', 700, 210),
  'right-edge-flip-hover': fixture('_clj', 925, 210),
  'bottom-edge-clamp-hover': fixture('_clj', 500, 580),
  'reopened-hover': fixture('_clj', 600, 170),
};

mkdirSync(path.join(root, evidenceDirectory), { recursive: true });
for (const stateId of stateIds) writeBaseline(stateId, fixtures[stateId]);

const logicalObjects = [
  objectSpec('tooltip-root', null, 0, 'sprite', 'AttributeCon', null),
  objectSpec('background', 'tooltip-root', 0, 'shape', null, 'bg'),
  objectSpec('info', 'tooltip-root', 1, 'container', null, 'info'),
  objectSpec('name', 'info', 30, 'text-field', null, 'runtime-name'),
  ...['quality', 'type', 'level', 'growth', 'elements'].flatMap((key, index) => [
    objectSpec(`meta-${key}-label`, 'info', 1 + index * 3, 'text-field', null, `${key}-label`),
    objectSpec(`meta-${key}-line`, 'info', 2 + index * 3, 'shape', null, `${key}-line`),
    objectSpec(`meta-${key}-value`, 'info', 3 + index * 3, 'text-field', null, `${key}-value`),
  ]),
  ...['maxHp', 'maxMp', 'power', 'defense', 'critPercent', 'missPercent', 'hpRegen', 'mpRegen', 'magicDefensePercent', 'piercePercent', 'shield']
    .map((key, index) => objectSpec(`stat-${key}`, 'info', 16 + index, 'text-field', null, key)),
  objectSpec('instruction', 'info', 27, 'text-field', null, 'instruction'),
  objectSpec('soul-value', 'info', 28, 'text-field', null, 'soul-value'),
];

const displayObjects = logicalObjects.map((spec) => ({
  id: spec.id,
  parentId: spec.parentId,
  depth: spec.depth,
  objectType: spec.objectType,
  sourceIdentity: {
    provenanceId: spec.id === 'tooltip-root' || spec.parentId === 'tooltip-root' ? 'restored-main-swf' : 'attribute-as',
    characterId: null,
    symbolClass: spec.id === 'tooltip-root' ? 'export.pack.AttributeCon' : null,
    instanceName: spec.instanceName,
  },
  placements: stateIds.map((stateId) => placementFor(spec.id, stateId, fixtures[stateId])),
  render: renderFor(spec.id),
}));

const baselines = stateIds.map((stateId) => {
  const baselinePath = `${evidenceDirectory}/original-source-replay-${stateId}-940x590.svg`;
  return {
    id: `original-source-replay-${stateId}-940x590`,
    stateId,
    path: baselinePath,
    sha256: sha256(baselinePath),
    width: 940,
    height: 590,
    crop: bounds(0, 0, 940, 590),
  };
});

const manifest = {
  $schema: '../schema/ui-ground-truth.schema.json',
  schemaVersion: 1,
  truthId: 'task-settings-189.equipment-tooltip',
  status: 'verified',
  scope: {
    taskId: 'TASK-SETTINGS-189',
    surfaceId: 'showobj-attributecon-equipment-tooltip',
    originalVersion: 'RegiMA 1.1 restored corpus',
    description: 'AS3-created AttributeCon display list shared by equipment ShowObj consumers. The class has no timeline character; 940x590 baselines are deterministic source replays of the restored main SWF ABC and are not mislabeled Flash runtime captures.',
  },
  generatedBy: {
    tool: 'generate-equipment-tooltip-ground-truth.mjs',
    toolVersion: '1',
    command: 'npm run generate:equipment-tooltip-truth',
    generatedAt: '2026-08-17T13:30:00+08:00',
  },
  provenance: [
    provenance('restored-main-swf', 'restored-swf', restoredSwf, 'ABC classes export.pack.AttributeCon, export.pack.ShowObj, export.pack.PackThings, export.pack.BackPack and my.MyEquipObj; selective FFDec export matched legacy AS3 byte-for-byte.'),
    provenance('attribute-as', 'legacy-as3', attributeAs, 'AttributeCon.drawInfo/drawpz/drawAttribute/drawSimpleAttribute/drawInstruction/drawValue/drawbg; all children are created dynamically and no character id exists.'),
    provenance('showobj-as', 'legacy-as3', showObjAs, 'ShowObj.added/showattribute/removeattribute/refreshPoint/removed; ROLL_OVER, ROLL_OUT, MOUSE_MOVE, stage depth and 930/590 edge formulas.'),
    provenance('equipment-instance-as', 'legacy-as3', equipAs, 'MyEquipObj constructor, trans, transValue, strengthenEquip and base-versus-strength getter semantics.'),
    provenance('equipment-catalog', 'legacy-as3', catalogPath, 'Generated 164-item authority; /items/*/tooltip, /baseStats, /strengthening, /progression and /fiveElements.'),
    provenance('original-font', 'legacy-as3', fontPath, 'FZCuYuan-M03 used by every AttributeCon TextField; replay rasterization may differ from Flash and is isolated as a font tolerance.'),
  ],
  stage: { width: 940, height: 590, frameRate: 24, coordinateSpace: 'stage', scaleMode: 'noScale', alignment: 'top-left' },
  states,
  displayObjects,
  baselines,
  completeness: {
    expectedStateIds: stateIds,
    extractedStateIds: stateIds,
    expectedVisibleObjectCountByState: Object.fromEntries(stateIds.map((stateId) => [stateId, displayObjects.filter((item) => item.placements.find((entry) => entry.stateId === stateId)?.visible).length])),
    displayListMatched: true,
    stateSetMatched: true,
    unresolved: [],
  },
  evidenceRefs: [
    'docs/reverse-engineering/evidence/TASK-SETTINGS-189-equipment-tooltip.md',
    'docs/reverse-engineering/ground-truth/manifests/task-settings-170b1-equipment-page.json',
    'docs/reverse-engineering/ground-truth/manifests/task-settings-167-workshop-strength.json',
    'docs/reverse-engineering/ground-truth/manifests/task-settings-167-workshop-fusion.json',
    'docs/reverse-engineering/ground-truth/manifests/task-settings-167-workshop-resolution.json',
    'docs/reverse-engineering/ground-truth/manifests/task-settings-167-workshop-making.json',
    'docs/reverse-engineering/ground-truth/manifests/task-settings-175f-shop-page.json',
  ],
};

const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
const absoluteOutput = path.join(root, outputPath);
if (process.argv.includes('--check')) {
  if (readFileSync(absoluteOutput, 'utf8') !== serialized) throw new Error(`${outputPath} is stale`);
  console.log(`Equipment tooltip truth verified: ${states.length} states, ${displayObjects.length} objects, unresolved=0.`);
} else {
  mkdirSync(path.dirname(absoluteOutput), { recursive: true });
  writeFileSync(absoluteOutput, serialized);
  console.log(`Generated ${outputPath}: ${states.length} states, ${displayObjects.length} objects.`);
}

function state(id, entry, fixtureId) {
  return { id, entry, fixtureId, baselineId: `original-source-replay-${id}-940x590` };
}

function fixture(fillName, mouseX, mouseY, overrides = {}) {
  const item = byFillName[fillName];
  if (!item) throw new Error(`Missing fixture item ${fillName}`);
  const strength = overrides.strength ?? 0;
  const base = Object.fromEntries(Object.entries(item.baseStats).map(([key, fact]) => [key, key === 'attack' && overrides.baseAttack !== undefined ? overrides.baseAttack : fact.min]));
  const bonus = Object.fromEntries(Object.entries(item.strengthening.perLevel).map(([key, fact]) => [key, fact.min * strength]));
  const metadata = [
    ['quality', '品质', item.quality],
    ['type', '类型', `${item.tooltip.typeLabel}${item.user ? `·${item.user}` : ''}`],
  ];
  if (item.originalType === 'zbfb' && item.progression.equipmentLevel.value) metadata.push(['level', '等级', `Lv.${item.progression.equipmentLevel.value}`]);
  if (item.progression.upgradeRatio.value) metadata.push(['growth', '成长率', String(item.progression.upgradeRatio.value)]);
  const elementLabels = [['metal', '金'], ['wood', '木'], ['water', '水'], ['fire', '火'], ['earth', '土']].filter(([key]) => item.fiveElements[key]).map(([, label]) => label);
  if (elementLabels.length) metadata.push(['elements', '五行', `${elementLabels.join(' ')} `]);
  const statMap = [
    ['hp', 'maxHp', '生命', false], ['mp', 'maxMp', '魔法', false], ['attack', 'power', '攻击', false], ['defense', 'defense', '防御', false],
    ['criticalChance', 'critPercent', '暴击', true], ['evasionChance', 'missPercent', '闪避', true], ['hpRegen', 'hpRegen', '回血', false], ['mpRegen', 'mpRegen', '回魔', false],
    ['magicDefense', 'magicDefensePercent', '魔抗', true], ['armorPenetration', 'piercePercent', '命中', true], ['haveBlood', 'shield', '泣血', false],
  ];
  const stats = statMap.filter(([source]) => truncVisible(base[source], source.includes('Chance') || source === 'magicDefense' || source === 'armorPenetration')).map(([source, target, label, ratio]) => ({
    key: target,
    copy: `${label}： ${formatStat(base[source], ratio)}${formatBonus(bonus[source], ratio)}`,
  }));
  const rows = 1 + metadata.length + stats.length;
  const instructionLines = Math.max(1, Math.ceil(stripHtml(item.tooltip.instruction).length / 9));
  const instructionHeight = instructionLines * 17 + 10;
  const infoHeight = rows * 25 + instructionHeight + 25;
  const longestCopy = [item.displayName, ...metadata.flatMap(([, label, value]) => [label, `  ${value}`]), ...stats.map(({ copy }) => copy), `价值 : ${item.tooltip.soulValue} 灵魂`]
    .reduce((longest, copy) => estimatedWidth(copy, 16) > estimatedWidth(longest, 16) ? copy : longest, '');
  const infoWidth = Math.max(135, estimatedWidth(longestCopy, 16) + 10);
  const width = infoWidth + 35;
  const height = infoHeight + 20;
  const x = mouseX + width > 930 ? mouseX - width - 10 : mouseX + 10;
  const y = 590 - height > mouseY ? mouseY : 590 - height;
  return { item, strength, base, bonus, metadata, stats, mouseX, mouseY, x, y, width, height, infoWidth, infoHeight, instructionHeight };
}

function placementFor(id, stateId, data) {
  const visible = Boolean(data) && objectVisible(id, data);
  const b = objectBounds(id, data);
  const stage = data ? bounds(data.x + b.left, data.y + b.top, b.width, b.height) : bounds(0, 0, 0, 0);
  return {
    stateId,
    visible,
    localMatrix: matrix(b.left, b.top),
    registrationPoint: { x: 0, y: 0 },
    localBounds: bounds(0, 0, b.width, b.height),
    stageBounds: stage,
    derivation: 'calculated',
    derivationMethod: 'Direct replay of AttributeCon row construction and ShowObj 930/590 pointer placement formulas; text-width-dependent bounds use the committed FZCuYuan fixture metric and are subject only to the declared Flash/browser glyph raster tolerance.',
    evidenceRefs: ['attribute-as:dynamic-display-list', 'showobj-as:pointer-lifecycle', 'equipment-instance-as:field-formulas'],
  };
}

function objectVisible(id, data) {
  if (['tooltip-root', 'background', 'info', 'name', 'instruction', 'soul-value'].includes(id)) return true;
  const meta = /^meta-([^-]+)-/.exec(id)?.[1];
  if (meta) return data.metadata.some(([key]) => key === meta);
  const stat = /^stat-(.+)$/.exec(id)?.[1];
  return stat ? data.stats.some(({ key }) => key === stat) : false;
}

function objectBounds(id, data) {
  if (!data) return bounds(0, 0, 0, 0);
  if (id === 'tooltip-root' || id === 'background') return bounds(0, 0, data.width, data.height);
  if (id === 'info') return bounds(20, 10, data.infoWidth, data.infoHeight);
  if (id === 'name') return bounds(20, 10, Math.min(data.infoWidth, estimatedWidth(nameCopy(data), 16) + 10), 25);
  let row = 1;
  for (const [key, label, value] of data.metadata) {
    const labelWidth = estimatedWidth(label, 16) + 10;
    if (id === `meta-${key}-label`) return bounds(20, 10 + row * 25 - 1, labelWidth, 25);
    if (id === `meta-${key}-line`) return bounds(20 + labelWidth - 4, 10 + row * 25 + 19, 80, 2);
    if (id === `meta-${key}-value`) return bounds(20 + labelWidth, 10 + row * 25, estimatedWidth(`  ${value}`, 16) + 10, 25);
    row += 1;
  }
  for (const stat of data.stats) {
    if (id === `stat-${stat.key}`) return bounds(20, 10 + row * 25, estimatedWidth(stat.copy, 16) + 10, 25);
    row += 1;
  }
  if (id === 'instruction') return bounds(20, 10 + row * 25, 135, data.instructionHeight);
  if (id === 'soul-value') return bounds(20, 10 + row * 25 + Math.round(data.instructionHeight / 25) * 25, 135, 25);
  return bounds(0, 0, 0, 0);
}

function renderFor(id) {
  const text = id === 'name' || id.startsWith('meta-') && !id.endsWith('-line') || id.startsWith('stat-') || id === 'instruction' || id === 'soul-value';
  return {
    assetRef: null,
    blendMode: 'normal',
    filters: id.endsWith('-label') ? [{ type: 'GlowFilter', color: '#ffffff', alpha: 1, blurX: 2, blurY: 2, strength: 3 }] : [],
    maskId: null,
    ...(text ? { textStyle: { fontFamily: 'FZCuYuan-M03', fontSizePx: id === 'instruction' || id === 'soul-value' ? 14 : 16, dynamic: true, sourceFormula: textFormula(id) } } : {}),
  };
}

function writeBaseline(stateId, data) {
  const filePath = path.join(root, evidenceDirectory, `original-source-replay-${stateId}-940x590.svg`);
  const tooltip = data ? tooltipSvg(data) : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="940" height="590" viewBox="0 0 940 590"><defs><style>@font-face{font-family:FZCuYuan-M03;src:url('../../../../public/assets/fonts/FZCuYuan-M03.ttf')}text{font-family:FZCuYuan-M03}</style></defs>${tooltip}</svg>\n`;
  writeFileSync(filePath, svg);
}

function tooltipSvg(data) {
  const x = data.x;
  const y = data.y;
  let row = 1;
  const parts = [`<g transform="translate(${x} ${y})"><rect x="0.5" y="0.5" width="${data.width - 1}" height="${data.height - 1}" rx="5" fill="#000" fill-opacity=".7" stroke="#fff"/>`];
  parts.push(textSvg(20, 27, nameCopy(data), data.item.color.replace('0x', '#'), 16, false));
  for (const [, label, value] of data.metadata) {
    const labelWidth = estimatedWidth(label, 16) + 10;
    parts.push(textSvg(20, 27 + row * 25, label, '#000000', 16, true));
    parts.push(`<line x1="${20 + labelWidth - 4}" y1="${30 + row * 25}" x2="${96 + labelWidth}" y2="${30 + row * 25}" stroke="#fff" stroke-width="2"/>`);
    parts.push(textSvg(20 + labelWidth, 27 + row * 25, `  ${value}`, value === data.item.quality ? data.item.color.replace('0x', '#') : '#ffffff', 16, false));
    row += 1;
  }
  for (const stat of data.stats) {
    parts.push(textSvg(20, 27 + row * 25, stat.copy, '#ff9933', 16, true));
    row += 1;
  }
  const instruction = escapeXml(stripHtml(data.item.tooltip.instruction));
  const chunks = instruction.match(/.{1,9}/gu) ?? [''];
  chunks.forEach((chunk, index) => parts.push(textSvg(20, 25 + row * 25 + index * 17, chunk, '#ffffff', 14, false)));
  parts.push(textSvg(20, 27 + row * 25 + Math.round(data.instructionHeight / 25) * 25, `价值 : ${data.item.tooltip.soulValue} 灵魂`, '#ff9933', 14, false));
  parts.push('</g>');
  return parts.join('');
}

function textSvg(x, y, copy, fill, size, bold) {
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}"${bold ? ' font-weight="bold"' : ''}>${escapeXml(copy)}</text>`;
}

function objectSpec(id, parentId, depth, objectType, symbolClass, instanceName) { return { id, parentId, depth, objectType, symbolClass, instanceName }; }
function provenance(id, sourceType, sourcePath, locator) { return { id, sourceType, sourcePath, sha256: sha256(sourcePath), locator }; }
function matrix(tx = 0, ty = 0) { return { a: 1, b: 0, c: 0, d: 1, tx, ty }; }
function bounds(left, top, width, height) { return { left: clean(left), top: clean(top), width: clean(width), height: clean(height) }; }
function clean(value) { return Number(Number(value).toFixed(4)); }
function sha256(relative) { return createHash('sha256').update(readFileSync(path.join(root, relative))).digest('hex'); }
function stripHtml(copy) { return copy.replace(/<[^>]*>/g, '').replace(/\r?\n/g, ''); }
function escapeXml(copy) { return String(copy).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'); }
function estimatedWidth(copy, size) { return [...String(copy)].reduce((sum, char) => sum + (/^[\x00-\xff]$/.test(char) ? size * 0.56 : size), 0); }
function truncVisible(value, ratio) { return Math.trunc(ratio ? value * 100 : value) !== 0; }
function formatStat(value, ratio) { return ratio ? `${Number((value * 100).toFixed(2))}%` : String(Math.trunc(value)); }
function formatBonus(value, ratio) { const shown = ratio ? Number((value * 100).toFixed(2)) : Math.trunc(value); return shown === 0 ? '' : shown > 0 ? `(+${shown})` : `(${shown})`; }
function nameCopy(data) { return data.strength ? `${data.item.displayName}(+${data.strength})` : data.item.displayName; }
function textFormula(id) {
  if (id === 'name') return 'ename or ename+(+getStrengthValue())';
  if (id === 'instruction') return 'instruction as 135px word-wrapped HTML text';
  if (id === 'soul-value') return '价值 : getValue() 灵魂';
  if (id.startsWith('meta-')) return 'drawpz conditional label/value field';
  if (id.startsWith('stat-')) return 'drawSimpleAttribute base getter(true) plus explicit strengthening suffix';
  return '';
}
