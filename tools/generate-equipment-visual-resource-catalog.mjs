import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { inflateSync } from 'node:zlib';

const root = process.cwd();
const restoredRoot = path.join(root, 'local-resources', 'regima', 'source', 'restored-swfs');
const equipmentPath = path.join(root, 'docs', 'reverse-engineering', 'reference', 'equipment-data-catalog-1.1.json');
const inventoryPath = path.join(root, 'docs', 'reverse-engineering', 'reference', 'inventory-resource-catalog-1.1.json');
const outputPath = path.join(root, 'docs', 'reverse-engineering', 'reference', 'equipment-visual-resource-catalog-1.1.json');
const annotationPath = path.join(root, 'docs', 'reverse-engineering', 'asset-annotation', 'annotations', 'equipment-preview-resources.csv');
const checkOnly = process.argv.includes('--check');

const equipment = JSON.parse(readFileSync(equipmentPath, 'utf8'));
const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));
const inventoryByFillName = new Map(inventory.items.map((item) => [item.fillName, item]));
const swfs = listSwfs(restoredRoot).map(loadSwf);
const symbolsByName = new Map();
for (const swf of swfs) {
  for (const [symbolClass, characterId] of swf.symbols) {
    const entries = symbolsByName.get(symbolClass) ?? [];
    entries.push({ swf, characterId, symbolClass });
    symbolsByName.set(symbolClass, entries);
  }
}

const roleByUser = new Map([
  ['悟空', 1], ['唐僧', 2], ['八戒', 3], ['沙僧', 4], ['白龙', 5],
]);
const as3Root = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts';
const headSpriteLocator = `${as3Root}/export/pack/HeadSprite.as:32-142`;
const showObjLocator = `${as3Root}/export/pack/ShowObj.as:24-111`;
const roleLocators = {
  1: `${as3Root}/export/hero/Role1.as:236-264`,
  2: `${as3Root}/export/hero/Role2.as:183-211`,
  3: `${as3Root}/export/hero/Role3.as:161-189`,
  4: `${as3Root}/export/hero/Role4.as:247-333`,
  5: `${as3Root}/export/hero/Role5.as:637-667;${as3Root}/export/hero/Role5.as:4760-4792`,
};

const items = equipment.items.map((item) => buildItem(item));
const allPreviewResources = items.flatMap((item) => item.preview.resources);
const allLocatedResources = [
  ...items.map((item) => item.icon),
  ...allPreviewResources,
].filter((item) => item.status !== 'known-original-defect');
const counts = {
  equipmentItems: items.length,
  uniqueFillNames: new Set(items.map((item) => item.fillName)).size,
  slots: countBy(items, (item) => item.slot),
  iconStatus: countBy(items, (item) => item.icon.status),
  previewMode: countBy(items, (item) => item.preview.mode),
  previewResourceStatus: countBy(allPreviewResources, (item) => item.status),
  previewDefects: allPreviewResources.filter((item) => item.status === 'known-original-defect').length,
  locatedResourcesWithoutVisibleBounds: allLocatedResources.filter((item) => !item.visibleBounds).length,
  unresolved: items.filter((item) => item.unresolved.length > 0).length,
  sourcePackages: countBy(
    [
      ...items.map((item) => item.icon).filter((item) => item.sourcePackage),
      ...allPreviewResources.filter((item) => item.sourcePackage),
    ],
    (item) => item.sourcePackage,
  ),
};

assert(counts.equipmentItems === 164, `Expected 164 equipment items, got ${counts.equipmentItems}`);
assert(counts.uniqueFillNames === 164, 'Equipment fillName identities are not unique');
assert((counts.iconStatus.located ?? 0) === 163 && (counts.iconStatus['known-broken-original-lookup'] ?? 0) === 1, `Expected 163 located equipment icons plus the confirmed fmtstx original lookup defect, got ${JSON.stringify(counts.iconStatus)}`);
assert(counts.unresolved === 0, `Found integration-affecting unresolved evidence: ${items.filter((item) => item.unresolved.length > 0).map((item) => `${item.fillName}:${item.preview.resources.filter((resource) => resource.status === 'unresolved').map((resource) => resource.symbolClass).join(',')}`).join('; ')}`);
assert(counts.locatedResourcesWithoutVisibleBounds === 0, 'Located resources must include aggregate visible bounds');

const output = {
  $schema: './equipment-visual-resource-catalog.schema.json',
  schemaVersion: 1,
  gameVersion: '1.1',
  status: 'verified',
  scope: 'One-to-one icon and applicable HeadSprite equipment-preview provenance for all 164 original 1.1 equipment fillName identities.',
  generatedBy: {
    tool: 'tools/generate-equipment-visual-resource-catalog.mjs',
    command: 'npm run generate:equipment-visual-catalog',
  },
  authorities: {
    equipmentData: relative(equipmentPath),
    inventoryIcons: relative(inventoryPath),
    restoredSwfs: 'local-resources/regima/source/restored-swfs/',
    iconConsumer: showObjLocator,
    previewConsumer: headSpriteLocator,
    roleConsumers: roleLocators,
    runtimeLoadOrder: `${as3Root}/loader/Aloader.as:30-65;${as3Root}/loader/AssetsLoader.as:260-325`,
  },
  contracts: {
    icon: 'ShowObj requests the inventory catalog symbol/alias. Character id, defining tag, timeline, registration origin and aggregate visible bounds are read from the selected restored SWF.',
    weaponArmorPreview: 'Role1-3 compose ROLEn_<clothId> with ROLEn_EQUIP_<weaponId>; Role4 chooses shovel/arrow body by weapon id and composes ROLE4_EQUIP_; Role5 selects fashion_yf/fashion_wq frames inside idle_sword.',
    titlePreview: 'HeadSprite requests role_title_<fillName> at (-38,-66), independently of role body/weapon composition.',
    noPreviewChange: 'Accessory and magic-weapon slots do not participate in HeadSprite body/equipment/title composition.',
    registrationAndBounds: 'registrationPoint is the original display-object origin (0,0). visibleBounds is an aggregate union across the symbol timeline in local pixels; null is only allowed for a documented original defect.',
  },
  counts,
  knownOriginalDefects: buildDefectSummary(items),
  items,
};

const serialized = `${JSON.stringify(output, null, 2)}\n`;
const annotationCsv = buildAnnotationCsv(items);
if (checkOnly) {
  assert(existsSync(outputPath), `Missing generated catalog ${relative(outputPath)}`);
  assert(readFileSync(outputPath, 'utf8') === serialized, `${relative(outputPath)} is stale; run npm run generate:equipment-visual-catalog`);
  assert(existsSync(annotationPath), `Missing generated annotation ${relative(annotationPath)}`);
  assert(readFileSync(annotationPath, 'utf8') === annotationCsv, `${relative(annotationPath)} is stale; run npm run generate:equipment-visual-catalog`);
  console.log(JSON.stringify(counts, null, 2));
} else {
  writeFileSync(outputPath, serialized, 'utf8');
  writeFileSync(annotationPath, annotationCsv, 'utf8');
  console.log(JSON.stringify(counts, null, 2));
}

function buildAnnotationCsv(entries) {
  const header = ['stableKey', 'as3Name', 'sourceKind', 'sourcePath', 'sourcePackage', 'symbolId', 'scope', 'usage', 'status', 'confidence', 'nextAction', 'note'];
  const rows = entries
    .filter((item) => item.preview.mode !== 'no-head-preview-change')
    .map((item) => {
      const located = item.preview.resources.filter((resource) => resource.status === 'located');
      const defects = item.preview.resources.filter((resource) => resource.status === 'known-original-defect');
      return [
        `equipment-preview.${item.fillName}`,
        item.preview.resources.map((resource) => resource.symbolClass).join(';'),
        'restored-swf',
        [...new Set(located.map((resource) => resource.sourcePath).filter(Boolean))].join(';') || relative(outputPath),
        [...new Set(located.map((resource) => resource.sourcePackage).filter(Boolean))].join(';'),
        located.map((resource) => resource.characterId).join(';'),
        'ui',
        `${item.displayName} ${item.user || '通用'} ${item.slot} HeadSprite preview`,
        defects.length > 0 ? 'rejected' : 'export-ready',
        'confirmed',
        defects.length > 0 ? 'none' : 'export-selectively',
        defects.length > 0
          ? `${defects.map((resource) => resource.defect.classification).join(';')}；原缺陷不生成替代层`
          : `${item.preview.mode}；showId=${item.showId}`,
      ];
    });
  return `${[header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')}\n`;
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function buildItem(item) {
  const inventoryItem = inventoryByFillName.get(item.fillName);
  assert(inventoryItem, `Missing inventory record for ${item.fillName}`);
  const icon = buildSymbolEvidence({
    symbolClass: inventoryItem.icon.resolvedSymbol,
    selectedPackage: inventoryItem.icon.sourcePackage,
    selectedCharacterId: inventoryItem.icon.characterId,
    consumerLocator: showObjLocator,
    status: inventoryItem.icon.status,
  });
  const preview = buildPreview(item);
  const unresolved = [];
  if (!['located', 'known-broken-original-lookup'].includes(icon.status)) unresolved.push('icon');
  if (preview.resources.some((resource) => resource.status === 'unresolved')) unresolved.push('preview-resource');
  return {
    fillName: item.fillName,
    displayName: item.displayName,
    slot: item.slot,
    originalType: item.originalType,
    user: item.user,
    showId: item.showId.value,
    icon,
    preview,
    evidenceLevel: unresolved.length === 0 ? 'cross-confirmed' : 'unknown',
    unresolved,
    counterEvidence: 'Reopen if the 1.1 definition/showId, ShowObj/HeadSprite lookup, role consumer, runtime SWF load order, selected SymbolClass, character id, timeline or source hash changes.',
  };
}

function buildPreview(item) {
  if (item.slot === 'accessory' || item.slot === 'magicWeapon') {
    return {
      mode: 'no-head-preview-change',
      resources: [],
      consumerLocator: headSpriteLocator,
      evidenceLevel: 'confirmed',
      conclusion: `${item.slot} is not passed into HeadSprite.refreshEquip(clothId, weaponId, titleName).`,
    };
  }
  if (item.slot === 'title') {
    const requested = `role_title_${item.fillName}`;
    return {
      mode: 'title-overlay',
      resources: [buildExactPreviewResource(requested, headSpriteLocator, { kind: 'title', requestedFillName: item.fillName })],
      consumerLocator: headSpriteLocator,
      placement: { x: -38, y: -66, coordinateSpace: 'HeadSprite-local' },
      evidenceLevel: 'cross-confirmed',
    };
  }
  const role = roleByUser.get(item.user);
  assert(role, `Unexpected role user for ${item.fillName}: ${item.user}`);
  if (role === 5) return buildRole5Preview(item);
  const showId = item.showId.value;
  if (item.slot === 'weapon') {
    return {
      mode: 'layered-role-resource',
      role,
      resources: [buildExactPreviewResource(`ROLE${role}_EQUIP_${showId}`, roleLocators[role], { kind: 'weapon', showId })],
      consumerLocator: `${headSpriteLocator};${roleLocators[role]}`,
      evidenceLevel: 'cross-confirmed',
    };
  }
  const names = role === 4
    ? [`ROLE4_SHOVEL_${showId}`, `ROLE4_ARROW_${showId}`]
    : [`ROLE${role}_${showId}`];
  return {
    mode: role === 4 ? 'role4-dual-body-branch' : 'layered-role-resource',
    role,
    resources: names.map((name) => buildExactPreviewResource(name, roleLocators[role], { kind: 'armor-body', showId })),
    consumerLocator: `${headSpriteLocator};${roleLocators[role]}`,
    ...(role === 4 ? { branch: { arrowWeaponIds: [4, 5, 9, 998], otherwise: 'shovel' } } : {}),
    evidenceLevel: 'cross-confirmed',
  };
}

function buildRole5Preview(item) {
  const originalShowId = item.showId.value;
  const mappedShowId = item.slot === 'armor'
    ? ({ 115: 18, 112: 19, 113: 20, 114: 21 }[originalShowId] ?? originalShowId)
    : originalShowId;
  const resource = buildExactPreviewResource('idle_sword', roleLocators[5], {
    kind: item.slot === 'weapon' ? 'dynamic-fashion_wq-frame' : 'dynamic-fashion_yf-frame',
    showId: originalShowId,
    selectedFrame: mappedShowId,
  });
  return {
    mode: 'role5-dynamic-fashion-layers',
    role: 5,
    resources: [resource],
    consumerLocator: `${headSpriteLocator};${roleLocators[5]}`,
    dynamicLayer: item.slot === 'weapon' ? 'fashion_wq' : 'fashion_yf',
    originalShowId,
    selectedFrame: mappedShowId,
    fallback: item.slot === 'weapon' ? 'showId 0 is incremented to frame 1' : 'showId 0 is incremented to frame 1; armor 112-115 remaps to 19-21/18',
    evidenceLevel: 'cross-confirmed',
  };
}

function buildExactPreviewResource(symbolClass, consumerLocator, details) {
  const candidates = symbolsByName.get(symbolClass) ?? [];
  if (candidates.length === 0) {
    const known = knownPreviewDefect(symbolClass, details);
    return {
      symbolClass,
      status: known ? 'known-original-defect' : 'unresolved',
      sourcePackage: null,
      sourcePath: null,
      sourceSha256: null,
      characterId: null,
      definitionTag: null,
      timeline: null,
      registrationPoint: null,
      visibleBounds: null,
      locator: `${consumerLocator}; restored corpus exact SymbolClass scan: 0 candidates`,
      evidenceLevel: known ? 'cross-confirmed' : 'unknown',
      defect: known,
      details,
    };
  }
  const chosen = chooseCandidate(candidates, symbolClass, details);
  return {
    ...symbolEvidence(chosen),
    status: 'located',
    locator: `${consumerLocator}; ${chosen.swf.relativePath} SymbolClass ${symbolClass} -> character ${chosen.characterId}`,
    evidenceLevel: 'cross-confirmed',
    candidateCount: candidates.length,
    candidatePackages: candidates.map((candidate) => candidate.swf.relativePackage),
    details,
  };
}

function buildSymbolEvidence({ symbolClass, selectedPackage, selectedCharacterId, consumerLocator, status }) {
  const candidates = symbolsByName.get(symbolClass) ?? [];
  const selected = candidates.find((candidate) =>
    candidate.swf.relativePackage === selectedPackage && candidate.characterId === selectedCharacterId,
  );
  assert(selected, `Inventory-selected symbol missing from restored scan: ${selectedPackage} ${selectedCharacterId} ${symbolClass}`);
  return {
    ...symbolEvidence(selected),
    status,
    locator: `${consumerLocator}; ${selected.swf.relativePath} SymbolClass ${symbolClass} -> character ${selectedCharacterId}`,
    evidenceLevel: 'cross-confirmed',
    candidateCount: candidates.length,
    candidatePackages: candidates.map((candidate) => candidate.swf.relativePackage),
  };
}

function symbolEvidence(candidate) {
  const definition = candidate.swf.definitions.get(candidate.characterId) ?? null;
  const extractedBounds = definition ? resolveBounds(candidate.swf, candidate.characterId) : null;
  const fallbackBounds = knownFfdecBitmapBounds(candidate);
  const visibleBounds = extractedBounds ?? fallbackBounds?.bounds ?? null;
  return {
    symbolClass: candidate.symbolClass,
    sourcePackage: candidate.swf.relativePackage,
    sourcePath: candidate.swf.relativePath,
    sourceSha256: candidate.swf.sha256,
    characterId: candidate.characterId,
    definitionTag: definition?.tag ?? null,
    timeline: definition?.tag === 'DefineSprite' ? { frameCount: definition.frameCount } : { frameCount: 1 },
    registrationPoint: { x: 0, y: 0, coordinateSpace: 'symbol-local-pixels' },
    visibleBounds,
    visibleBoundsEvidence: extractedBounds
      ? 'source-tag-and-timeline-parser'
      : fallbackBounds?.evidence ?? null,
  };
}

function knownFfdecBitmapBounds(candidate) {
  if (candidate.swf.relativePackage === 'assets/TangSeng1.swf' && [351, 352].includes(candidate.characterId)) {
    return {
      bounds: { left: 0, top: 0, width: 1200, height: 2600 },
      evidence: `FFDec 26 selective image export from restored TangSeng1.swf character ${candidate.characterId}; local audit output local-resources/regima/task-outputs/task-settings-170b2/tangseng1-222-images/`,
    };
  }
  return null;
}

function knownPreviewDefect(symbolClass, details) {
  if (symbolClass === 'role_title_mksddf') {
    return {
      classification: 'missing-title-overlay-symbol',
      conclusion: 'HeadSprite requests role_title_mksddf, while ShowObj only aliases the inventory icon mksddf to lly. The complete restored SymbolClass corpus has no role_title_mksddf, so the original try/catch leaves this title overlay invisible.',
      counterEvidence: 'Reopen only if a restored/runtime package defines exact SymbolClass role_title_mksddf or a HeadSprite title alias is found.',
    };
  }
  if ([520, 521].includes(details.showId)) {
    return {
      classification: 'invalid-showId-no-runtime-symbol',
      conclusion: `AllEquipment assigns showId ${details.showId}, but the exact HeadSprite lookup ${symbolClass} is absent from the complete restored SymbolClass corpus. The icon remains valid; equipping the item cannot supply this preview layer in the original lookup path.`,
      counterEvidence: `Reopen only if a restored/runtime package defines exact SymbolClass ${symbolClass} or an AS3 alias/remap is found.`,
    };
  }
  return null;
}

function chooseCandidate(candidates, symbolClass, details) {
  const role = /^ROLE([1-4])_/.exec(symbolClass)?.[1];
  const preferred = role
    ? { 1: 'assets/WuKong.swf', 2: 'assets/TangSeng.swf', 3: 'assets/BaJie.swf', 4: 'assets/ShaShen.swf' }[role]
    : symbolClass === 'idle_sword' ? 'assets/bailongSword.swf' : null;
  return [...candidates].sort((left, right) => {
    const leftPreferred = left.swf.relativePackage === preferred ? 0 : 1;
    const rightPreferred = right.swf.relativePackage === preferred ? 0 : 1;
    return leftPreferred - rightPreferred
      || loadOrderRank(left.swf.relativePackage) - loadOrderRank(right.swf.relativePackage)
      || left.swf.relativePackage.localeCompare(right.swf.relativePackage, 'en')
      || left.characterId - right.characterId;
  })[0];
}

function loadOrderRank(sourcePackage) {
  const names = ['assets/bailongSword.swf', 'assets/bailong.swf', 'assets/TangSeng1.swf', 'assets/ShaShen.swf', 'assets/EIcon1.swf', 'assets/MagicWeapon.swf', 'assets/MagicWeapon2.swf', 'assets/20120117.swf', 'assets/20120119.swf', 'assets/20120203.swf', 'assets/20120808.swf'];
  const index = names.indexOf(sourcePackage);
  return index < 0 ? names.length : index;
}

function buildDefectSummary(entries) {
  const defects = [];
  for (const item of entries) {
    for (const resource of item.preview.resources) {
      if (resource.defect) defects.push({ fillName: item.fillName, slot: item.slot, user: item.user, showId: item.showId, requestedSymbol: resource.symbolClass, ...resource.defect });
    }
  }
  return defects;
}

function loadSwf(absolutePath) {
  const raw = readFileSync(absolutePath);
  const signature = raw.subarray(0, 3).toString('ascii');
  if (signature === 'ZWS') return emptySwf(absolutePath, raw, signature);
  const body = signature === 'CWS' ? inflateSync(raw.subarray(8)) : raw.subarray(8);
  const swf = signature === 'CWS' ? Buffer.concat([Buffer.from('FWS'), raw.subarray(3, 8), body]) : raw;
  if (swf.subarray(0, 3).toString('ascii') !== 'FWS') return emptySwf(absolutePath, raw, signature);
  const headerRect = readRect(swf, 8);
  const tagStart = headerRect.nextOffset + 4;
  const definitions = new Map();
  const symbols = new Map();
  parseTopLevelTags(swf, tagStart, swf.length, definitions, symbols);
  const relativePackage = path.relative(restoredRoot, absolutePath).replaceAll('\\', '/');
  return {
    absolutePath,
    relativePackage,
    relativePath: `local-resources/regima/source/restored-swfs/${relativePackage}`,
    sha256: createHash('sha256').update(raw).digest('hex'),
    signature,
    definitions,
    symbols,
    boundsCache: new Map(),
  };
}

function emptySwf(absolutePath, raw, signature) {
  const relativePackage = path.relative(restoredRoot, absolutePath).replaceAll('\\', '/');
  return { absolutePath, relativePackage, relativePath: `local-resources/regima/source/restored-swfs/${relativePackage}`, sha256: createHash('sha256').update(raw).digest('hex'), signature, definitions: new Map(), symbols: new Map(), boundsCache: new Map() };
}

function parseTopLevelTags(buffer, start, end, definitions, symbols) {
  for (const tag of iterateTags(buffer, start, end)) {
    const offset = tag.offset;
    if ([2, 22, 32, 83].includes(tag.code) && tag.length >= 3) {
      const characterId = buffer.readUInt16LE(offset);
      const rect = readRect(buffer, offset + 2).rect;
      definitions.set(characterId, { tag: 'DefineShape', bounds: rect });
    } else if ([11, 33, 37].includes(tag.code) && tag.length >= 3) {
      const characterId = buffer.readUInt16LE(offset);
      const rect = readRect(buffer, offset + 2).rect;
      definitions.set(characterId, { tag: 'DefineText', bounds: rect });
    } else if ([20, 36].includes(tag.code) && tag.length >= 7) {
      const characterId = buffer.readUInt16LE(offset);
      const width = buffer.readUInt16LE(offset + 3);
      const height = buffer.readUInt16LE(offset + 5);
      definitions.set(characterId, { tag: 'DefineBitsLossless', bounds: { left: 0, top: 0, width, height } });
    } else if ([6, 21, 35, 90].includes(tag.code) && tag.length >= 4) {
      const characterId = buffer.readUInt16LE(offset);
      const imageOffset = tag.code === 90 ? offset + 8 : tag.code === 35 ? offset + 6 : offset + 2;
      const dimensions = readJpegDimensions(buffer, imageOffset, tag.end);
      definitions.set(characterId, {
        tag: tag.code === 35 || tag.code === 90 ? 'DefineBitsJPEGWithAlpha' : 'DefineBitsJPEG',
        bounds: dimensions ? { left: 0, top: 0, width: dimensions.width, height: dimensions.height } : null,
      });
    } else if (tag.code === 39 && tag.length >= 4) {
      const characterId = buffer.readUInt16LE(offset);
      const frameCount = buffer.readUInt16LE(offset + 2);
      definitions.set(characterId, { tag: 'DefineSprite', frameCount, placements: parseSpritePlacements(buffer, offset + 4, tag.end) });
    } else if (tag.code === 46 || tag.code === 84) {
      const characterId = buffer.readUInt16LE(offset);
      const rect = readRect(buffer, offset + 2).rect;
      definitions.set(characterId, { tag: 'DefineMorphShape', bounds: rect });
    } else if (tag.code === 76 && tag.length >= 2) {
      let cursor = offset;
      const count = buffer.readUInt16LE(cursor); cursor += 2;
      for (let index = 0; index < count && cursor + 2 <= tag.end; index += 1) {
        const characterId = buffer.readUInt16LE(cursor); cursor += 2;
        const decoded = readCString(buffer, cursor, tag.end); cursor = decoded.nextOffset;
        symbols.set(decoded.value, characterId);
      }
    }
  }
}

function parseSpritePlacements(buffer, start, end) {
  const placements = [];
  for (const tag of iterateTags(buffer, start, end)) {
    if (tag.code === 4 && tag.length >= 4) {
      const characterId = buffer.readUInt16LE(tag.offset);
      const parsed = readMatrix(buffer, tag.offset + 4);
      placements.push({ characterId, matrix: parsed.matrix, instanceName: null });
    } else if (tag.code === 26 && tag.length >= 3) {
      const flags = buffer[tag.offset];
      let cursor = tag.offset + 3;
      let characterId = null;
      if (flags & 0x02) { characterId = buffer.readUInt16LE(cursor); cursor += 2; }
      let matrix = identityMatrix();
      if (flags & 0x04) { const parsed = readMatrix(buffer, cursor); matrix = parsed.matrix; cursor = parsed.nextOffset; }
      if (flags & 0x08) cursor = skipCxform(buffer, cursor, false);
      if (flags & 0x10) cursor += 2;
      let instanceName = null;
      if (flags & 0x20) { const decoded = readCString(buffer, cursor, tag.end); instanceName = decoded.value; }
      if (characterId !== null) placements.push({ characterId, matrix, instanceName });
    } else if (tag.code === 70 && tag.length >= 4) {
      const flags1 = buffer[tag.offset];
      const flags2 = buffer[tag.offset + 1];
      let cursor = tag.offset + 4;
      if ((flags2 & 0x08) || ((flags2 & 0x10) && (flags1 & 0x02))) cursor = readCString(buffer, cursor, tag.end).nextOffset;
      let characterId = null;
      if (flags1 & 0x02) { characterId = buffer.readUInt16LE(cursor); cursor += 2; }
      let matrix = identityMatrix();
      if (flags1 & 0x04) { const parsed = readMatrix(buffer, cursor); matrix = parsed.matrix; cursor = parsed.nextOffset; }
      if (flags1 & 0x08) cursor = skipCxform(buffer, cursor, true);
      if (flags1 & 0x10) cursor += 2;
      let instanceName = null;
      if (flags1 & 0x20) { const decoded = readCString(buffer, cursor, tag.end); instanceName = decoded.value; }
      if (characterId !== null) placements.push({ characterId, matrix, instanceName });
    }
  }
  return placements;
}

function resolveBounds(swf, characterId, stack = new Set()) {
  if (swf.boundsCache.has(characterId)) return swf.boundsCache.get(characterId);
  if (stack.has(characterId)) return null;
  const definition = swf.definitions.get(characterId);
  if (!definition) return null;
  if (definition.bounds) {
    const rounded = roundBounds(definition.bounds);
    swf.boundsCache.set(characterId, rounded);
    return rounded;
  }
  stack.add(characterId);
  let aggregate = null;
  for (const placement of definition.placements ?? []) {
    const childBounds = resolveBounds(swf, placement.characterId, stack);
    if (!childBounds) continue;
    aggregate = unionBounds(aggregate, transformBounds(childBounds, placement.matrix));
  }
  stack.delete(characterId);
  const rounded = aggregate ? roundBounds(aggregate) : null;
  swf.boundsCache.set(characterId, rounded);
  return rounded;
}

function iterateTags(buffer, start, end) {
  const result = [];
  let cursor = start;
  while (cursor + 2 <= end) {
    const header = buffer.readUInt16LE(cursor); cursor += 2;
    const code = header >> 6;
    let length = header & 0x3f;
    if (length === 0x3f) { if (cursor + 4 > end) break; length = buffer.readUInt32LE(cursor); cursor += 4; }
    const tagEnd = cursor + length;
    if (tagEnd > end) break;
    result.push({ code, offset: cursor, length, end: tagEnd });
    cursor = tagEnd;
    if (code === 0) break;
  }
  return result;
}

function readRect(buffer, offset) {
  const bits = new BitReader(buffer, offset);
  const count = bits.readUnsigned(5);
  const xmin = bits.readSigned(count) / 20;
  const xmax = bits.readSigned(count) / 20;
  const ymin = bits.readSigned(count) / 20;
  const ymax = bits.readSigned(count) / 20;
  bits.align();
  return { rect: { left: xmin, top: ymin, width: xmax - xmin, height: ymax - ymin }, nextOffset: bits.byteOffset };
}

function readMatrix(buffer, offset) {
  const bits = new BitReader(buffer, offset);
  let a = 1; let d = 1; let b = 0; let c = 0;
  if (bits.readUnsigned(1)) { const count = bits.readUnsigned(5); a = bits.readSigned(count) / 65536; d = bits.readSigned(count) / 65536; }
  if (bits.readUnsigned(1)) { const count = bits.readUnsigned(5); b = bits.readSigned(count) / 65536; c = bits.readSigned(count) / 65536; }
  const translateBits = bits.readUnsigned(5);
  const tx = bits.readSigned(translateBits) / 20;
  const ty = bits.readSigned(translateBits) / 20;
  bits.align();
  return { matrix: { a, b, c, d, tx, ty }, nextOffset: bits.byteOffset };
}

function skipCxform(buffer, offset, withAlpha) {
  const bits = new BitReader(buffer, offset);
  const hasAdd = bits.readUnsigned(1);
  const hasMult = bits.readUnsigned(1);
  const count = bits.readUnsigned(4);
  const channels = withAlpha ? 4 : 3;
  if (hasMult) for (let index = 0; index < channels; index += 1) bits.readSigned(count);
  if (hasAdd) for (let index = 0; index < channels; index += 1) bits.readSigned(count);
  bits.align();
  return bits.byteOffset;
}

function BitReader(buffer, byteOffset) {
  this.buffer = buffer;
  this.byteOffset = byteOffset;
  this.bitOffset = 0;
  this.readUnsigned = (count) => {
    let value = 0;
    for (let index = 0; index < count; index += 1) {
      value = value * 2 + ((this.buffer[this.byteOffset] >> (7 - this.bitOffset)) & 1);
      this.bitOffset += 1;
      if (this.bitOffset === 8) { this.bitOffset = 0; this.byteOffset += 1; }
    }
    return value;
  };
  this.readSigned = (count) => {
    if (count === 0) return 0;
    const value = this.readUnsigned(count);
    const sign = 2 ** (count - 1);
    return value >= sign ? value - 2 ** count : value;
  };
  this.align = () => {
    if (this.bitOffset !== 0) { this.bitOffset = 0; this.byteOffset += 1; }
  };
}

function transformBounds(bounds, matrix) {
  const corners = [
    [bounds.left, bounds.top],
    [bounds.left + bounds.width, bounds.top],
    [bounds.left, bounds.top + bounds.height],
    [bounds.left + bounds.width, bounds.top + bounds.height],
  ].map(([x, y]) => ({ x: matrix.a * x + matrix.c * y + matrix.tx, y: matrix.b * x + matrix.d * y + matrix.ty }));
  const xs = corners.map((point) => point.x); const ys = corners.map((point) => point.y);
  return { left: Math.min(...xs), top: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
}

function unionBounds(left, right) {
  if (!left) return right;
  const minX = Math.min(left.left, right.left); const minY = Math.min(left.top, right.top);
  const maxX = Math.max(left.left + left.width, right.left + right.width); const maxY = Math.max(left.top + left.height, right.top + right.height);
  return { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
}

function roundBounds(bounds) { return Object.fromEntries(Object.entries(bounds).map(([key, value]) => [key, Math.round(value * 1000) / 1000])); }
function identityMatrix() { return { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }; }
function readCString(buffer, offset, end) { const zero = buffer.indexOf(0, offset); const safeEnd = zero < 0 || zero > end ? end : zero; return { value: buffer.subarray(offset, safeEnd).toString('utf8'), nextOffset: Math.min(safeEnd + 1, end) }; }
function readJpegDimensions(buffer, offset, end) {
  let cursor = offset;
  while (cursor + 9 < end) {
    if (buffer[cursor] !== 0xff) { cursor += 1; continue; }
    while (cursor < end && buffer[cursor] === 0xff) cursor += 1;
    const marker = buffer[cursor]; cursor += 1;
    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (cursor + 2 > end) break;
    const length = buffer.readUInt16BE(cursor);
    if (length < 2 || cursor + length > end) break;
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker) && length >= 7) {
      return { height: buffer.readUInt16BE(cursor + 3), width: buffer.readUInt16BE(cursor + 5) };
    }
    cursor += length;
  }
  return null;
}
function listSwfs(directory) { return readdirSync(directory, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.swf')).map((entry) => path.join(entry.parentPath, entry.name)); }
function relative(absolutePath) { return path.relative(root, absolutePath).replaceAll('\\', '/'); }
function countBy(values, keyOf) { const result = {}; for (const value of values) { const key = keyOf(value); result[key] = (result[key] ?? 0) + 1; } return result; }
function assert(condition, message) { if (!condition) throw new Error(message); }
