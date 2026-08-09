import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRelative =
  'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/my/AllEquipment.as';
const modelRelative =
  'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/my/MyEquipObj.as';
const consumerRelative =
  'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BaseRoleProperies.as';
const backpackRelative =
  'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pack/BackPack.as';
const packThingsRelative =
  'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pack/PackThings.as';
const inventoryRelative =
  'docs/reverse-engineering/reference/inventory-resource-catalog-1.1.json';
const spreadsheetRelative =
  'docs/reverse-engineering/reference/equipment-spreadsheet/equipment-attributes.csv';
const outputRelative =
  'docs/reverse-engineering/reference/equipment-data-catalog-1.1.json';
const schemaRelative =
  'docs/reverse-engineering/reference/equipment-data-catalog.schema.json';

const source = readUtf8(sourceRelative);
const inventory = JSON.parse(readUtf8(inventoryRelative));
const schema = JSON.parse(readUtf8(schemaRelative));
const spreadsheetNames = new Set(
  readUtf8(spreadsheetRelative)
    .split(/\r?\n/)
    .slice(2)
    .filter(Boolean)
    .map(firstCsvField),
);
const definitions = extractDefinitions(source);
const byVariable = new Map(definitions.map((item) => [item.variable, item]));
const inventoryEquipment = inventory.items.filter(
  (item) => item.inventoryCategory === 'equipment',
);

const statFields = [
  ['hp', 7, 'points', 'getehp', 'int'],
  ['mp', 8, 'points', 'getemp', 'int'],
  ['attack', 9, 'points', 'geteatt', 'int'],
  ['defense', 10, 'points', 'getedef', 'int'],
  ['criticalChance', 11, 'ratio', 'getecrit', 'Number'],
  ['evasionChance', 12, 'ratio', 'getemiss', 'Number'],
  ['hpRegen', 13, 'points', 'geteahp', 'int'],
  ['mpRegen', 14, 'points', 'geteamp', 'int'],
  ['lifeSteal', 15, 'ratio', 'geteatblood', 'Number'],
  ['magicDefense', 16, 'ratio', 'getmagicdef', 'Number'],
  ['armorPenetration', 17, 'ratio', 'getdeephit', 'Number'],
  ['haveBlood', 22, 'points', 'gethaveblood', 'Number'],
];

const strengthenKeys = {
  hp: 'hp',
  mp: 'mp',
  attack: 'att',
  defense: 'def',
  criticalChance: 'crit',
  evasionChance: 'miss',
  hpRegen: 'ehp',
  mpRegen: 'emp',
  lifeSteal: 'ebol',
  magicDefense: 'mdef',
  armorPenetration: 'dhit',
  haveBlood: 'haveblood',
};

const items = inventoryEquipment
  .map((catalogItem) => buildItem(catalogItem))
  .sort((left, right) => left.fillName.localeCompare(right.fillName, 'en'));

const unknownFields = [];
for (const [itemIndex, item] of items.entries()) {
  for (const [field, value] of Object.entries(item.baseStats)) {
    if (value.status === 'unknown') {
      unknownFields.push({
        fillName: item.fillName,
        field: `baseStats.${field}`,
        reason: value.unknownReason,
        source: item.source.locator,
        jsonPointer: `/items/${itemIndex}/baseStats/${field}`,
      });
    }
  }
  for (const [field, value] of Object.entries(item.strengthening.perLevel)) {
    if (value.status === 'unknown') {
      unknownFields.push({
        fillName: item.fillName,
        field: `strengthening.perLevel.${field}`,
        reason: value.unknownReason,
        source: item.source.locator,
        jsonPointer: `/items/${itemIndex}/strengthening/perLevel/${field}`,
      });
    }
  }
}

const counts = {
  equipmentItems: items.length,
  inventoryCatalogItems: inventory.items.length,
  uniqueFillNames: new Set(items.map((item) => item.fillName)).size,
  byType: countBy(items, (item) => item.originalType),
  bySlot: countBy(items, (item) => item.slot),
  byUser: countBy(items, (item) => item.user || 'unrestricted'),
  byQuality: countBy(items, (item) => item.quality),
  baseStatFields: statFields.length,
  unknownFields: unknownFields.length,
  matchedByDisplayNameInVersion1_0Reference: items.filter((item) =>
    spreadsheetNames.has(item.displayName),
  ).length,
};
const absentFromVersion1_0Reference = items
  .filter((item) => !spreadsheetNames.has(item.displayName))
  .map((item) => ({ fillName: item.fillName, displayName: item.displayName }));

assertEqual(counts.equipmentItems, 164, 'equipment item count');
assertEqual(counts.inventoryCatalogItems, 431, 'inventory catalog item count');
assertEqual(counts.uniqueFillNames, 164, 'unique equipment fillName count');
assertEqual(counts.baseStatFields, 12, 'base stat field count');
assertEqual(schema.$id, 'equipment-data-catalog.schema.json', 'schema id');
assertEqual(schema.properties.items.minItems, 164, 'schema minimum item count');
assertEqual(schema.properties.items.maxItems, 164, 'schema maximum item count');
assertEqual(
  counts.matchedByDisplayNameInVersion1_0Reference,
  150,
  '1.0 reference display-name matches',
);
assertEqual(absentFromVersion1_0Reference.length, 14, '1.1 names absent from 1.0 reference');
if (unknownFields.length !== 0) {
  const expressions = [...new Set(items.flatMap((item) => [
    ...Object.values(item.baseStats),
    ...Object.values(item.strengthening.perLevel),
  ]).filter((fact) => fact.status === 'unknown').map((fact) => fact.originalExpression))];
  throw new Error(
    `Expected unknown parsed field count 0, got ${unknownFields.length}: ${expressions.join(', ')}`,
  );
}

const output = {
  schemaVersion: 1,
  gameVersion: '1.1',
  scope:
    'The 164 authoritative equipment-category identities selected by AllEquipment.findByName precedence and aligned one-to-one with the 431-item inventory catalog',
  status: 'verified',
  authorities: {
    definitions: evidenceFile(sourceRelative),
    constructorAndStrengthening: evidenceFile(modelRelative),
    attributeConsumer: evidenceFile(consumerRelative),
    equipGateAndSlotConsumer: evidenceFile(backpackRelative),
    roleGateConsumer: evidenceFile(packThingsRelative),
    identityCatalog: evidenceFile(inventoryRelative),
    version1_0AuxiliaryReference: evidenceFile(spreadsheetRelative),
    schema: evidenceFile(schemaRelative),
  },
  fieldContract: {
    identity:
      'fillName is the original stable identity and modern registry key; duplicate definitions are resolved by the inventory catalog using actual AllEquipment.findByName precedence',
    slot:
      'zbwq=weapon, zbfj=armor, zbsp=accessory, zbfb=magicWeapon, zbtx=title',
    user:
      'empty string means unrestricted; otherwise BackPack gates equip by exact original role name',
    baseStats:
      'Twelve constructor fields are preserved as exact values or inclusive random ranges without sampling',
    ratioUnits:
      'criticalChance, evasionChance, lifeSteal, magicDefense and armorPenetration use original 0..1 ratios; BaseRoleProperies multiplies them by 100 for role percentage-point fields',
    strengthening:
      'aStrengthen values are additive increments per strength level; missing keys are confirmed zero except the original dgg hard-coded fallback recorded per item',
    quantity:
      'All 164 records use instance semantics in zblist; strength level and base values are saved per MyEquipObj instance',
    geometry:
      'not-applicable: this catalog freezes non-visual data only; wearable art, registration points and UI display lists belong to TASK-SETTINGS-170B and restored SWF evidence',
  },
  counts,
  coverage: {
    inventoryCatalogExpected: 431,
    equipmentSubsetExpected: 164,
    missingFromInventoryCatalog: [],
    duplicateFillNames: [],
    unknownFields,
    version1_0AuxiliaryComparison: {
      rule:
        'The 1.0 spreadsheet is comparison-only. A matching display name does not override 1.1 AS3 fields; absence records a version/reference delta, not an unknown 1.1 value.',
      matchedByDisplayName: counts.matchedByDisplayNameInVersion1_0Reference,
      absentFromVersion1_0Reference,
    },
  },
  commonEvidenceLevel: 'cross-confirmed',
  commonCounterEvidence:
    'Reopen if the 1.1 AS3 source hash, MyEquipObj constructor order, AllEquipment.findByName precedence, BackPack slot gate, BaseRoleProperies unit conversion, or the 431-item identity catalog changes.',
  items,
};

const serialized = `${JSON.stringify(output, null, 2)}\n`;
const outputPath = absolute(outputRelative);
if (process.argv.includes('--check')) {
  const current = readFileSync(outputPath, 'utf8');
  if (current !== serialized) {
    throw new Error(
      `${outputRelative} is stale; run npm run generate:equipment-data-catalog`,
    );
  }
  console.log(
    `Equipment data catalog verified: ${counts.equipmentItems} items, ${counts.baseStatFields} stats, ${unknownFields.length} unknown fields.`,
  );
} else {
  writeFileSync(outputPath, serialized, 'utf8');
  console.log(JSON.stringify(counts, null, 2));
}

function buildItem(catalogItem) {
  const variable = catalogItem.sourceDefinition.variable;
  const definition = byVariable.get(variable);
  if (!definition) {
    throw new Error(`Missing parsed MyEquipObj definition for ${variable}`);
  }
  assertEqual(
    decodeString(definition.args[2]),
    catalogItem.fillName,
    `${variable} fillName`,
  );

  const strengthenObject = parseObject(definition.args[18] ?? 'null');
  const levelObject = parseObject(definition.args[20] ?? 'null');
  const fiveElementObject = parseObject(definition.args[21] ?? 'null');
  const baseStats = Object.fromEntries(
    statFields.map(([field, argumentIndex, unit, getter, coercion]) => [
      field,
      numericFact(definition.args[argumentIndex] ?? '0', unit, getter, coercion),
    ]),
  );
  const perLevel = Object.fromEntries(
    statFields.map(([field, , unit]) => {
      const originalKey = strengthenKeys[field];
      const special = catalogItem.fillName === 'dgg'
        ? dggFallback(field)
        : null;
      return [
        field,
        numericFact(
          strengthenObject[originalKey] ?? special ?? '0',
          unit,
          `aStrengthen.${originalKey}`,
        ),
      ];
    }),
  );

  return {
    fillName: catalogItem.fillName,
    displayName: catalogItem.displayName,
    showId: numericFact(definition.args[0], 'identifier', 'showid', 'uint'),
    originalType: catalogItem.originalType,
    slot: slotFor(catalogItem.originalType),
    user: catalogItem.user,
    quality: catalogItem.quality,
    color: catalogItem.color,
    baseStats,
    strengthening: {
      model: 'additive-per-strength-level',
      perLevel,
      hardCodedFallback:
        catalogItem.fillName === 'dgg'
          ? 'MyEquipObj.strengthenEquip assigns dgg fallback increments when aStrengthen keys are absent'
          : null,
    },
    progression: {
      equipmentLevel: numericFact(
        levelObject.elevel ?? '0',
        'level',
        'param21.elevel',
      ),
      upgradeRatio: numericFact(
        levelObject.eupdata ?? '0',
        'ratio',
        'param21.eupdata',
      ),
    },
    fiveElements: {
      metal: booleanFact(fiveElementObject.jin),
      wood: booleanFact(fiveElementObject.mu),
      water: booleanFact(fiveElementObject.shui),
      fire: booleanFact(fiveElementObject.huo),
      earth: booleanFact(fiveElementObject.tu),
    },
    quantityModel: catalogItem.quantityModel,
    originalList: catalogItem.originalList,
    source: {
      variable,
      locator: `${sourceRelative}:${definition.sourceLine}`,
      inventoryCatalogLocator: catalogItem.sourceDefinition.source,
      constructorArgumentCount: definition.args.length,
    },
    evidenceLevel: 'cross-confirmed',
    counterEvidence:
      'Reopen this record if its authoritative source variable, constructor expression, findByName precedence, or consumer unit mapping changes.',
  };
}

function numericFact(expression, unit, consumer, runtimeCoercion = 'Number') {
  const originalExpression = expression.trim();
  const interval = numericInterval(originalExpression);
  if (!interval) {
    return {
      status: 'unknown',
      originalExpression,
      unit,
      consumer,
      runtimeCoercion,
      value: null,
      min: null,
      max: null,
      maxInclusive: null,
      distribution: null,
      unknownReason: 'Expression is outside the verified numeric grammar',
    };
  }
  const coerced = coerceInterval(interval, runtimeCoercion);
  const exact = coerced.min === coerced.max;
  return {
    status: 'confirmed',
    originalExpression,
    unit,
    consumer,
    runtimeCoercion,
    value: exact ? coerced.min : null,
    min: coerced.min,
    max: coerced.max,
    maxInclusive: coerced.maxInclusive,
    distribution: exact ? 'exact' : coerced.distribution,
    unknownReason: null,
  };
}

function numericInterval(expression) {
  let randomKind = null;
  let normalized = expression.replace(
    /Math\.round\(Math\.random\(\)\s*\*\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\)/g,
    (_, spread) => {
      randomKind = 'rounded';
      return `RANGE(${spread})`;
    },
  );
  normalized = normalized.replace(
    /Math\.random\(\)\s*\*\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))/g,
    (_, spread) => {
      randomKind = 'continuous';
      return `RANGE(${spread})`;
    },
  );
  try {
    const min = parseArithmetic(normalized.replace(/RANGE\(([^)]+)\)/g, '0'));
    const max = parseArithmetic(
      normalized.replace(/RANGE\(([^)]+)\)/g, '($1)'),
    );
    if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
    return {
      min: cleanNumber(Math.min(min, max)),
      max: cleanNumber(Math.max(min, max)),
      randomKind,
      maxInclusive: randomKind !== 'continuous',
    };
  } catch {
    return null;
  }
}

function coerceInterval(interval, runtimeCoercion) {
  if (runtimeCoercion === 'int' || runtimeCoercion === 'uint') {
    const min = Math.trunc(interval.min);
    const max = interval.maxInclusive
      ? Math.trunc(interval.max)
      : Math.ceil(interval.max) - 1;
    return {
      min: runtimeCoercion === 'uint' ? Math.max(0, min) : min,
      max: runtimeCoercion === 'uint' ? Math.max(0, max) : max,
      maxInclusive: true,
      distribution:
        interval.randomKind === 'rounded'
          ? 'rounded random range, inclusive after AS3 integer coercion'
          : 'continuous random expression truncated by AS3 integer coercion, inclusive integer range',
    };
  }
  return {
    min: interval.min,
    max: interval.max,
    maxInclusive: interval.maxInclusive,
    distribution:
      interval.randomKind === 'rounded'
        ? 'Math.round(Math.random()) range, inclusive'
        : 'Math.random() continuous range, upper bound exclusive',
  };
}

function parseArithmetic(expression) {
  const tokens = expression.match(/(?:\d+(?:\.\d+)?|\.\d+)|[()+\-*/]/g) ?? [];
  if (tokens.join('') !== expression.replace(/\s+/g, '')) {
    throw new Error('Unsupported arithmetic token');
  }
  let index = 0;
  function primary() {
    const token = tokens[index++];
    if (token === '(') {
      const value = addSubtract();
      if (tokens[index++] !== ')') throw new Error('Missing closing parenthesis');
      return value;
    }
    if (token === '+') return primary();
    if (token === '-') return -primary();
    const value = Number(token);
    if (!Number.isFinite(value)) throw new Error('Expected number');
    return value;
  }
  function multiplyDivide() {
    let value = primary();
    while (tokens[index] === '*' || tokens[index] === '/') {
      const operator = tokens[index++];
      const right = primary();
      value = operator === '*' ? value * right : value / right;
    }
    return value;
  }
  function addSubtract() {
    let value = multiplyDivide();
    while (tokens[index] === '+' || tokens[index] === '-') {
      const operator = tokens[index++];
      const right = multiplyDivide();
      value = operator === '+' ? value + right : value - right;
    }
    return value;
  }
  const value = addSubtract();
  if (index !== tokens.length) throw new Error('Trailing arithmetic token');
  return value;
}

function extractDefinitions(text) {
  const definitions = [];
  const pattern = /this\.(\w+)\s*=\s*new\s+MyEquipObj\s*\(/g;
  for (const match of text.matchAll(pattern)) {
    const openIndex = match.index + match[0].lastIndexOf('(');
    const closeIndex = findMatching(text, openIndex, '(', ')');
    definitions.push({
      variable: match[1],
      args: splitTopLevel(text.slice(openIndex + 1, closeIndex)),
      sourceLine: lineAt(text, match.index),
    });
  }
  return definitions;
}

function parseObject(expression) {
  const trimmed = expression.trim();
  if (!trimmed || trimmed === 'null' || trimmed === '{}') return {};
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return {};
  const result = {};
  for (const entry of splitTopLevel(trimmed.slice(1, -1))) {
    const colon = findTopLevelColon(entry);
    if (colon < 0) continue;
    const key = decodeString(entry.slice(0, colon).trim());
    result[key] = entry.slice(colon + 1).trim();
  }
  return result;
}

function splitTopLevel(text) {
  const parts = [];
  let start = 0;
  let quote = null;
  let escaped = false;
  let round = 0;
  let curly = 0;
  let square = 0;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === '(') round += 1;
    else if (char === ')') round -= 1;
    else if (char === '{') curly += 1;
    else if (char === '}') curly -= 1;
    else if (char === '[') square += 1;
    else if (char === ']') square -= 1;
    else if (char === ',' && round === 0 && curly === 0 && square === 0) {
      parts.push(text.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts;
}

function findMatching(text, openIndex, open, close) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = openIndex; index < text.length; index += 1) {
    const char = text[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === open) depth += 1;
    else if (char === close && --depth === 0) return index;
  }
  throw new Error(`Unclosed ${open} at ${openIndex}`);
}

function findTopLevelColon(text) {
  let quote = null;
  let escaped = false;
  let depth = 0;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if ('({['.includes(char)) depth += 1;
    else if (')}]'.includes(char)) depth -= 1;
    else if (char === ':' && depth === 0) return index;
  }
  return -1;
}

function decodeString(expression) {
  const trimmed = expression.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed
      .slice(1, -1)
      .replace(/\\([\\"'])/g, '$1')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r');
  }
  return trimmed;
}

function booleanFact(expression) {
  if (expression === undefined) return false;
  return expression.trim() === 'true';
}

function dggFallback(field) {
  return {
    attack: '111',
    defense: '111',
    hp: '1111',
    mp: '1111',
    hpRegen: '11',
    mpRegen: '11',
    magicDefense: '0.01',
  }[field] ?? '0';
}

function slotFor(type) {
  const slots = {
    zbwq: 'weapon',
    zbfj: 'armor',
    zbsp: 'accessory',
    zbfb: 'magicWeapon',
    zbtx: 'title',
  };
  const slot = slots[type];
  if (!slot) throw new Error(`Unmapped equipment type ${type}`);
  return slot;
}

function evidenceFile(relativePath) {
  const bytes = readFileSync(absolute(relativePath));
  return {
    path: relativePath,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
}

function countBy(values, selector) {
  const result = {};
  for (const value of values) {
    const key = selector(value);
    result[key] = (result[key] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b, 'en')));
}

function lineAt(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function cleanNumber(value) {
  return Number(value.toFixed(12));
}

function readUtf8(relativePath) {
  return readFileSync(absolute(relativePath), 'utf8');
}

function absolute(relativePath) {
  return path.join(root, ...relativePath.split('/'));
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`Expected ${label} ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function firstCsvField(line) {
  if (!line.startsWith('"')) return line.slice(0, line.indexOf(','));
  let result = '';
  for (let index = 1; index < line.length; index += 1) {
    if (line[index] === '"' && line[index + 1] === '"') {
      result += '"';
      index += 1;
    } else if (line[index] === '"') {
      return result;
    } else {
      result += line[index];
    }
  }
  throw new Error('Unclosed quoted CSV field');
}
