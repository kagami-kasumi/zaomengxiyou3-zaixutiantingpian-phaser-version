import {
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { inflateSync } from "node:zlib";

const repoRoot = process.cwd();
const as3RootRelative =
  "local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts";
const as3Root = path.join(repoRoot, ...as3RootRelative.split("/"));
const allEquipmentRelative = `${as3RootRelative}/my/AllEquipment.as`;
const allEquipmentPath = path.join(repoRoot, ...allEquipmentRelative.split("/"));
const showObjRelative = `${as3RootRelative}/export/pack/ShowObj.as`;
const showObjPath = path.join(repoRoot, ...showObjRelative.split("/"));
const restoredRoot = path.join(
  repoRoot,
  "local-resources",
  "regima",
  "source",
  "restored-swfs",
);
const craftingItemPath = path.join(
  repoRoot,
  "docs",
  "reverse-engineering",
  "reference",
  "crafting-item-catalog-1.1.json",
);
const craftingIconPath = path.join(
  repoRoot,
  "docs",
  "reverse-engineering",
  "reference",
  "crafting-icon-catalog-1.1.json",
);
const outputPath = path.join(
  repoRoot,
  "docs",
  "reverse-engineering",
  "reference",
  "inventory-resource-catalog-1.1.json",
);

const allEquipmentSource = readFileSync(allEquipmentPath, "utf8");
const showObjSource = readFileSync(showObjPath, "utf8");
const craftingItems = JSON.parse(readFileSync(craftingItemPath, "utf8"));
const craftingIcons = JSON.parse(readFileSync(craftingIconPath, "utf8"));
const craftingItemByFillName = new Map(
  craftingItems.items.map((item) => [item.fillName, item]),
);
const craftingIconByFillName = new Map(
  craftingIcons.items.map((item) => [item.fillName, item]),
);
const showObjAliases = extractShowObjAliases(showObjSource);
const symbolIndex = scanSymbolClasses(restoredRoot);
const sourceFiles = loadAs3StringReferenceIndex(as3Root);

const occurrences = [
  ...extractRegisteredDirectDefinitions(allEquipmentSource),
  ...buildDynamicPills(),
];
const grouped = groupBy(occurrences, (item) => item.fillName);
const items = [...grouped.entries()]
  .map(([fillName, candidates]) => buildCatalogItem(fillName, candidates))
  .sort((left, right) => left.fillName.localeCompare(right.fillName, "en"));

const counts = {
  registeredOccurrences: occurrences.length,
  uniqueFillNames: items.length,
  shadowedDefinitions: items.reduce(
    (sum, item) => sum + item.shadowedDefinitions.length,
    0,
  ),
  inventoryCategory: countBy(items, (item) => item.inventoryCategory),
  quantityModel: countBy(items, (item) => item.quantityModel),
  iconStatus: countBy(items, (item) => item.icon.status),
  iconSourcePackage: countBy(
    items.filter((item) => item.icon.sourcePackage),
    (item) => item.icon.sourcePackage,
  ),
  craftingMembership: items.filter((item) => item.crafting.roles.length > 0)
    .length,
  catalogOnlyNoExternalProducer: items.filter(
    (item) => item.reachability === "catalog-only-no-external-producer",
  ).length,
  duplicateStableKeys:
    items.length -
    new Set(items.map((item) => item.icon.stableKey)).size,
  unresolvedInventoryCategories: items.filter(
    (item) => item.inventoryCategory === "unresolved",
  ).length,
};

if (counts.registeredOccurrences !== 433) {
  throw new Error(
    `Expected 433 registered occurrences, got ${counts.registeredOccurrences}`,
  );
}
if (counts.uniqueFillNames !== 431) {
  throw new Error(`Expected 431 unique fillName values, got ${counts.uniqueFillNames}`);
}
if (counts.unresolvedInventoryCategories !== 0) {
  throw new Error("Inventory category mapping contains unresolved entries");
}
if (counts.duplicateStableKeys !== 0) {
  throw new Error("Inventory icon stable keys are not unique");
}
const unexpectedIconGaps = items.filter(
  (item) =>
    item.icon.status !== "located" &&
    !["fmtstx", "scwpqhs5", "wc"].includes(item.fillName),
);
if (unexpectedIconGaps.length > 0) {
  throw new Error(
    `Unexpected icon gaps: ${unexpectedIconGaps
      .map((item) => item.fillName)
      .join(", ")}`,
  );
}

const output = {
  schemaVersion: 1,
  gameVersion: "1.1",
  scope:
    "All unique fillName identities accepted by AllEquipment.findByName and therefore valid for the four original backpack save lists",
  authorities: {
    definitions: allEquipmentRelative,
    iconLookup: `${showObjRelative}:24-111`,
    iconSymbols:
      "local-resources/regima/source/restored-swfs/ exact SymbolClass scan; EIcon1 preferred when duplicate names exist",
    backpackLists: `${as3RootRelative}/user/User.as:628-865`,
    categoryRouting: `${as3RootRelative}/export/pack/BackPackElement.as:96-175;${as3RootRelative}/config/Config.as:1221-1253`,
    saveEncoding: `${as3RootRelative}/user/User.as:628-865`,
    craftingItems:
      "docs/reverse-engineering/reference/crafting-item-catalog-1.1.json",
    craftingIcons:
      "docs/reverse-engineering/reference/crafting-icon-catalog-1.1.json",
  },
  fieldContract: {
    fillName: "stable original identity and modern registry key",
    inventoryCategory:
      "equipment | items | fashion | skillBooks, mapped to zblist/djlist/szlist/jnslist",
    quantityModel: "instance | stack",
    visibleCapacity:
      "125 entries per category (5 pages x 25); original code has no hard insertion limit",
    icon:
      "stableKey, original requested symbol, resolved symbol, source package, character id and evidence",
    save:
      "original field and MyEquipObj pipe-record encoding; the current schema stores category/fillName/instance-or-stack identity/quantity",
    reachability:
      "external-reference-observed | catalog-only-no-external-producer; the latter is not promoted to playable original content",
  },
  counts,
  knownOriginalDefects: [
    {
      fillName: "wc",
      classification: "catalog-only-no-external-producer",
      evidence: [
        `${allEquipmentRelative}:2660`,
        `${allEquipmentRelative}:2665`,
        `${allEquipmentRelative}:2670`,
      ],
      conclusion:
        "Three definitions share one fillName; reverse wpEquipment search makes wpEquip123 (3级昆仑玉, zbwp) authoritative. No external AS3 string producer and no exact restored SymbolClass exist.",
    },
    {
      fillName: "fmtstx",
      classification: "catalog-only-no-external-producer",
      evidence: [
        `${allEquipmentRelative}:1627`,
        `${showObjRelative}:108-110`,
        "local-resources/regima/source/restored-swfs/assets/EIcon1.swf character 424 role_title_fmtstx",
      ],
      conclusion:
        "The title bitmap exists, but ShowObj requests fmtstx without the role_title_ prefix and would fail exact lookup. No external AS3 string producer was found.",
    },
    {
      fillName: "scwpqhs5",
      classification: "catalog-only-no-external-producer",
      evidence: [
        `${allEquipmentRelative}:2080`,
        `${showObjRelative}:108-110`,
        "local-resources/regima/source/restored-swfs/assets/EIcon1.swf character 576 wpqhs5",
      ],
      conclusion:
        "The fifth-level strengthening-stone bitmap exists without the sc prefix, but ShowObj requests scwpqhs5 and has no alias. No external AS3 string producer was found.",
    },
  ],
  items,
};

writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify(counts, null, 2));

function buildCatalogItem(fillName, candidates) {
  const ordered = [...candidates].sort(
    (left, right) => precedence(right) - precedence(left),
  );
  const authority = ordered[0];
  const category = inventoryCategory(fillName, authority.type);
  const externalReferences = findExternalReferences(fillName);
  const alias = showObjAliases.get(fillName);
  const craftingIcon = craftingIconByFillName.get(fillName);
  const craftingLocated = craftingIcon?.requiredSymbols?.find(
    (entry) => entry.status === "located",
  );
  const requestedSymbol = alias?.symbol ?? fillName;
  const exactCandidates = symbolIndex.get(requestedSymbol) ?? [];
  const chosenSymbol =
    exactCandidates.length > 0
      ? choosePreferredSymbol(exactCandidates)
      : craftingLocated
        ? {
            symbol: craftingLocated.symbol,
            sourcePackage: craftingLocated.sourcePackage,
            characterId: craftingLocated.characterId,
            evidencePath: craftingLocated.evidencePath,
          }
        : null;
  const knownBrokenResource =
    fillName === "fmtstx"
      ? choosePreferredSymbol(symbolIndex.get("role_title_fmtstx") ?? [])
      : fillName === "scwpqhs5"
        ? choosePreferredSymbol(symbolIndex.get("wpqhs5") ?? [])
      : null;
  const craftingItem = craftingItemByFillName.get(fillName);
  const sourceDefinition = definitionEvidence(authority);
  const sourceFilesForFillName = externalReferences.map(
    (reference) => reference.source,
  );

  return {
    fillName,
    displayName: authority.name,
    showId:
      /^\d+$/.test(authority.showIdExpression)
        ? Number(authority.showIdExpression)
        : null,
    originalType: authority.type,
    user: authority.user,
    quality: authority.quality,
    color: authority.color,
    inventoryCategory: category,
    originalList: categoryContract(category).originalList,
    quantityModel: categoryContract(category).quantityModel,
    capacity: {
      visibleSlots: 125,
      pages: 5,
      slotsPerPage: 25,
      unit:
        categoryContract(category).quantityModel === "stack"
          ? "one slot per fillName stack"
          : "one slot per instance",
      originalHardInsertionLimit: false,
    },
    save: categoryContract(category).save,
    sourceDefinition,
    shadowedDefinitions: ordered
      .slice(1)
      .map((candidate) => definitionEvidence(candidate)),
    reachability:
      externalReferences.length > 0 || craftingItem || authority.dynamic
        ? "external-reference-observed"
        : "catalog-only-no-external-producer",
    knownProducersAndConsumers: {
      tags: referenceTags(
        sourceFilesForFillName,
        craftingItem,
        authority.dynamic,
      ),
      externalAs3References: externalReferences.slice(0, 12),
      genericConsumers: [
        `${allEquipmentRelative}:3357-3400 AllEquipment.findByName`,
        `${as3RootRelative}/user/User.as:706-865 save loader`,
        `${showObjRelative}:24-111 backpack icon renderer`,
      ],
    },
    crafting: {
      roles: craftingItem?.roles ?? [],
      authorityStatus: craftingItem?.authorityStatus ?? "not-in-crafting-catalog",
      iconStatus: craftingIcon?.status ?? "not-in-crafting-catalog",
    },
    icon: {
      stableKey: `inventory-item.${fillName}`,
      originalRequestedSymbol: requestedSymbol,
      aliasEvidence: alias
        ? `${showObjRelative}:${alias.sourceLine}`
        : null,
      status: chosenSymbol
        ? "located"
        : knownBrokenResource
          ? "known-broken-original-lookup"
          : "missing-original",
      resolvedSymbol:
        chosenSymbol?.symbol ?? knownBrokenResource?.symbol ?? null,
      sourcePackage:
        chosenSymbol?.sourcePackage ??
        knownBrokenResource?.sourcePackage ??
        null,
      characterId:
        chosenSymbol?.characterId ??
        knownBrokenResource?.characterId ??
        null,
      evidencePath:
        chosenSymbol?.evidencePath ??
        knownBrokenResource?.evidencePath ??
        "exact SymbolClass scan of local-resources/regima/source/restored-swfs/",
      candidateCount: exactCandidates.length,
      modernEligibility:
        chosenSymbol && fillName !== "wc"
          ? "eligible"
          : "exclude-unless-user-approves-original-defect-repair",
    },
    implementation: {
      definition: "implemented-authoritative-registry",
      icon: chosenSymbol && fillName !== "wc"
        ? "implemented-inventory-bundle"
        : "excluded-confirmed-original-defect",
      itemSpecificUseEffect:
        category === "equipment" || category === "fashion"
          ? "pending-special-effects; generic equip flow exists"
          : "pending unless covered by an existing dedicated system",
    },
    evidenceLevel:
      chosenSymbol && ordered.length === 1
        ? "cross-confirmed"
        : "confirmed-with-recorded-original-defect",
  };
}

function extractRegisteredDirectDefinitions(text) {
  const results = [];
  const pattern =
    /this\.(\w+)\s*=\s*new\s+MyEquipObj\(\s*([^,]+),\s*"((?:\\.|[^"\\])*)"\s*,\s*"((?:\\.|[^"\\])*)"\s*,\s*"((?:\\.|[^"\\])*)"\s*,\s*"((?:\\.|[^"\\])*)"\s*,\s*"((?:\\.|[^"\\])*)"\s*,\s*"((?:\\.|[^"\\])*)"/g;
  for (const match of text.matchAll(pattern)) {
    const variable = match[1];
    const family = registeredFamily(variable);
    if (!family) continue;
    results.push({
      variable,
      family: family.name,
      familyOrder: family.order,
      itemOrder: family.itemOrder,
      showIdExpression: match[2].trim(),
      name: decodeString(match[3]),
      fillName: decodeString(match[4]),
      type: decodeString(match[5]),
      user: decodeString(match[6]),
      quality: decodeString(match[7]),
      color: decodeString(match[8]),
      sourceLine: text.slice(0, match.index).split(/\r?\n/).length,
      dynamic: false,
    });
  }
  return results;
}

function registeredFamily(variable) {
  const normalOrder = [
    "normalClothes",
    "normalStick",
    "normalCassock",
    "normalStaff",
    "normalStoneAX",
    "normalCymbidium",
    "normalYueyaChan",
    "normalRobe",
    "normalSilkClothes",
    "normalIronSpear",
    "normalnewSp",
  ];
  const normalIndex = normalOrder.indexOf(variable);
  if (normalIndex >= 0) {
    return { name: "normalEquipment", order: 5, itemOrder: normalIndex + 1 };
  }
  for (const [pattern, name, order, max] of [
    [/^otherEquip(\d+)$/, "otherEquipment", 4, 133],
    [/^wpEquip(\d+)$/, "wpEquipment", 3, 224],
    [/^fashionEquip(\d+)$/, "sellEquipment", 2, 20],
  ]) {
    const match = pattern.exec(variable);
    if (match && Number(match[1]) <= max) {
      return { name, order, itemOrder: Number(match[1]) };
    }
  }
  const sutra = /^sutra(\d+)$/.exec(variable);
  const sutraOrder = sutra ? Number(sutra[1]) : 0;
  if (
    sutra &&
    ([...Array(17)].map((_, index) => index + 1).includes(sutraOrder) ||
      [19, 20, 1000].includes(sutraOrder))
  ) {
    return { name: "sutraEquipment", order: 1, itemOrder: sutraOrder };
  }
  return null;
}

function buildDynamicPills() {
  const results = [];
  const grades = ["一", "二", "三", "四", "五"];
  const types = [
    ["smd", "热血丹"],
    ["mfd", "魔泉丹"],
    ["bjd", "狂暴丹"],
    ["hxd", "永恒丹"],
    ["hld", "辉煌丹"],
  ];
  for (let grade = 1; grade <= 5; grade += 1) {
    for (let typeIndex = 0; typeIndex < types.length; typeIndex += 1) {
      const [prefix, name] = types[typeIndex];
      results.push({
        variable: `pillEquip${grade}_${typeIndex + 1}`,
        family: "wpEquipment",
        familyOrder: 3,
        itemOrder: 224 + (grade - 1) * 5 + typeIndex + 1,
        showIdExpression: "1",
        name: `${grades[grade - 1]}品${name}`,
        fillName: `wp${prefix}${grade}`,
        type: "zbwp",
        user: "",
        quality: "普 通",
        color: "0xFFFFFF",
        sourceLine: 3194,
        dynamic: true,
      });
    }
  }
  return results;
}

function extractShowObjAliases(text) {
  const aliases = new Map();
  const pattern =
    /getFillName\(\)\s*==\s*"([^"]+)"\)[\s\S]*?getImageObj\("([^"]+)"\)/g;
  for (const match of text.matchAll(pattern)) {
    aliases.set(match[1], {
      symbol: match[2],
      sourceLine: text.slice(0, match.index).split(/\r?\n/).length,
    });
  }
  return aliases;
}

function scanSymbolClasses(root) {
  const byName = new Map();
  for (const absolutePath of listSwfs(root)) {
    const relativePackage = path
      .relative(root, absolutePath)
      .replaceAll("\\", "/");
    for (const symbol of readSymbolClassTag(absolutePath)) {
      const entries = byName.get(symbol.symbol) ?? [];
      entries.push({
        ...symbol,
        sourcePackage: relativePackage,
        evidencePath: `local-resources/regima/source/restored-swfs/${relativePackage}`,
      });
      byName.set(symbol.symbol, entries);
    }
  }
  return byName;
}

function loadAs3StringReferenceIndex(root) {
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".as"))
    .map((entry) => {
      const absolutePath = path.join(entry.parentPath, entry.name);
      return {
        absolutePath,
        relativePath: path.relative(repoRoot, absolutePath).replaceAll("\\", "/"),
        text: readFileSync(absolutePath, "utf8"),
      };
    })
    .filter((file) => file.relativePath !== allEquipmentRelative);
}

function findExternalReferences(fillName) {
  const literal = `"${fillName}"`;
  const results = [];
  for (const file of sourceFiles) {
    let from = 0;
    while (results.length < 50) {
      const index = file.text.indexOf(literal, from);
      if (index < 0) break;
      const line = file.text.slice(0, index).split(/\r?\n/).length;
      results.push({ source: `${file.relativePath}:${line}` });
      from = index + literal.length;
    }
  }
  return results;
}

function referenceTags(sources, craftingItem, dynamicPill) {
  const tags = new Set();
  if (dynamicPill) tags.add("immortality");
  if (craftingItem?.roles.includes("material")) tags.add("crafting-material");
  if (craftingItem?.roles.includes("product")) tags.add("crafting-product");
  for (const source of sources) {
    if (source.includes("/export/monster/") || source.includes("/my/FallEquipObj")) {
      tags.add("drop-or-monster");
    }
    if (source.includes("/task")) tags.add("task");
    if (source.includes("/microshop/")) tags.add("shop");
    if (source.includes("/strength/")) tags.add("workshop");
    if (source.includes("/immortality/")) tags.add("immortality");
    if (source.includes("/pack/")) tags.add("backpack-action");
    if (source.includes("/storage/") || source.includes("/user/")) tags.add("save");
    if (source.includes("/huodong/")) tags.add("legacy-online-activity");
  }
  if (tags.size === 0) tags.add("no-known-specialized-producer");
  return [...tags];
}

function inventoryCategory(fillName, type) {
  if (fillName.includes("jns")) return "skillBooks";
  if (type === "zbsz" || type === "zbcb") return "fashion";
  if (type === "wpqhs" || type === "zbwp") return "items";
  if (["zbwq", "zbfj", "zbsp", "zbfb", "zbtx", ""].includes(type)) {
    return "equipment";
  }
  return "unresolved";
}

function categoryContract(category) {
  const contracts = {
    equipment: {
      originalList: "zblist",
      quantityModel: "instance",
      save: {
        originalField: "bagSaveString",
        record: "MyEquipObj pipe record, records separated by }",
      },
    },
    items: {
      originalList: "djlist",
      quantityModel: "stack",
      save: {
        originalField: "bagdjSaveString",
        record: "MyEquipObj pipe record including num, records separated by }",
      },
    },
    fashion: {
      originalList: "szlist",
      quantityModel: "instance",
      save: {
        originalField: "bagszSaveString",
        record:
          "MyEquipObj pipe record including fashionTime, records separated by }",
      },
    },
    skillBooks: {
      originalList: "jnslist",
      quantityModel: "stack",
      save: {
        originalField: "bagjnsSaveString",
        record: "MyEquipObj pipe record including num, records separated by }",
      },
    },
  };
  return contracts[category];
}

function definitionEvidence(item) {
  return {
    variable: item.variable,
    family: item.family,
    displayName: item.name,
    originalType: item.type,
    source: `${allEquipmentRelative}:${item.sourceLine}`,
    dynamic: item.dynamic,
  };
}

function precedence(item) {
  return item.familyOrder * 10000 + item.itemOrder;
}

function choosePreferredSymbol(candidates) {
  const priority = [
    "assets/EIcon1.swf",
    "assets/EIcon2.swf",
    "1_MainLoad__main1.swf",
    "assets/MagicWeapon2.swf",
  ];
  return [...candidates].sort((left, right) => {
    const leftRank = priority.indexOf(left.sourcePackage);
    const rightRank = priority.indexOf(right.sourcePackage);
    return (
      (leftRank < 0 ? priority.length : leftRank) -
        (rightRank < 0 ? priority.length : rightRank) ||
      left.sourcePackage.localeCompare(right.sourcePackage, "en") ||
      left.characterId - right.characterId
    );
  })[0];
}

function listSwfs(root) {
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter(
      (entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".swf"),
    )
    .map((entry) => path.join(entry.parentPath, entry.name));
}

function readSymbolClassTag(filePath) {
  const raw = readFileSync(filePath);
  const signature = raw.subarray(0, 3).toString("ascii");
  if (signature === "ZWS") return [];
  const body = signature === "CWS" ? inflateSync(raw.subarray(8)) : raw.subarray(8);
  const swf =
    signature === "CWS"
      ? Buffer.concat([Buffer.from("FWS"), raw.subarray(3, 8), body])
      : raw;
  if (swf.subarray(0, 3).toString("ascii") !== "FWS") return [];

  const rectBits = 5 + (swf[8] >> 3) * 4;
  let offset = 8 + Math.ceil(rectBits / 8) + 4;
  const symbols = [];
  while (offset + 2 <= swf.length) {
    const tagHeader = swf.readUInt16LE(offset);
    offset += 2;
    const tagCode = tagHeader >> 6;
    let tagLength = tagHeader & 0x3f;
    if (tagLength === 0x3f) {
      if (offset + 4 > swf.length) break;
      tagLength = swf.readUInt32LE(offset);
      offset += 4;
    }
    const end = offset + tagLength;
    if (end > swf.length) break;
    if (tagCode === 76 && tagLength >= 2) {
      let cursor = offset;
      const count = swf.readUInt16LE(cursor);
      cursor += 2;
      for (let index = 0; index < count && cursor + 2 <= end; index += 1) {
        const characterId = swf.readUInt16LE(cursor);
        cursor += 2;
        const zero = swf.indexOf(0, cursor);
        if (zero < 0 || zero > end) break;
        symbols.push({
          characterId,
          symbol: swf.subarray(cursor, zero).toString("utf8"),
        });
        cursor = zero + 1;
      }
    }
    offset = end;
    if (tagCode === 0) break;
  }
  return symbols;
}

function decodeString(value) {
  return value.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}

function groupBy(items, keyOf) {
  const result = new Map();
  for (const item of items) {
    const key = keyOf(item);
    const values = result.get(key) ?? [];
    values.push(item);
    result.set(key, values);
  }
  return result;
}

function countBy(items, keyOf) {
  const result = {};
  for (const item of items) {
    const key = keyOf(item);
    result[key] = (result[key] ?? 0) + 1;
  }
  return result;
}
