import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { inflateSync } from 'node:zlib';

const root = process.cwd();
const check = process.argv.includes('--check');
const corpusPath = 'docs/reverse-engineering/pet-animation-corpus.json';
const bodyAnnotationPath = 'docs/reverse-engineering/asset-annotation/annotations/pet-body-animations.csv';
const skillAnnotationPath = 'docs/reverse-engineering/asset-annotation/annotations/pet-skill-effects.csv';
const restoredPrefix = 'local-resources/regima/source/restored-swfs/';
const sourcePackages = [
  'assets/pet1.swf',
  'assets/20120203.swf',
  'assets/20120808.swf',
  'assets/mouse.swf',
  'assets/StageCommon.swf',
];

const speciesSpecs = [
  { species: 'monkey', forms: [1, 2, 3, 4], bodies: ['PetMonkeyBmd1', 'PetMonkeyBmd2', 'PetMonkeyBmd3', 'PetMonkeyBmd4'], evidenceTask: 'TASK-SETTINGS-193A', implementationTask: 'TASK-SLICE-193B' },
  { species: 'horse', forms: [1, 2, 3, 4], bodies: ['PetHorseBmd1', 'PetHorseBmd2', 'PetHorseBmd3', 'PetHorseBmd4'], evidenceTask: 'TASK-SETTINGS-193C', implementationTask: 'TASK-SLICE-193D' },
  { species: 'ufo', forms: [1, 2, 3], bodies: ['PetKabuBmd1', 'PetKabuBmd2', 'PetKabuBmd3'], evidenceTask: 'TASK-SETTINGS-193E', implementationTask: 'TASK-SLICE-193F' },
  { species: 'tigress', forms: [1, 2, 3, 4], bodies: ['PetTigerBmd1', 'PetTigerBmd2', 'PetTigerBmd3', 'PetTigerBmd4'], evidenceTask: 'TASK-SETTINGS-193G', implementationTask: 'TASK-SLICE-193H' },
  { species: 'turtle', forms: [1, 2, 3, 4], bodies: ['PetTurtleBmd1', 'PetTurtleBmd2', 'PetTurtleBmd3', 'PetTurtleBmd4'], evidenceTask: 'TASK-SETTINGS-193I', implementationTask: 'TASK-SLICE-193J' },
  { species: 'phoenix', forms: [1, 2, 3, 4], bodies: ['PetPhoenixBmd1', 'PetPhoenixBmd2', 'PetPhoenixBmd3', 'PetPhoenixBmd4'], evidenceTask: 'TASK-SETTINGS-193K', implementationTask: 'TASK-SLICE-193L' },
  { species: 'dragon', forms: [1, 2, 3, 4], bodies: ['PetDragonBmd1', 'PetDragonBmd2', 'PetDragonBmd3', 'PetDragonBmd4'], evidenceTask: 'TASK-SETTINGS-193M', implementationTask: 'TASK-SLICE-193N' },
  { species: 'rabbit', forms: [1, 2, 3, 4], bodies: ['PetPetRabbitBmd1', 'PetPetRabbitBmd2', 'PetPetRabbitBmd3', 'PetPetRabbitBmd4'], evidenceTask: 'TASK-SETTINGS-193O', implementationTask: 'TASK-SLICE-193P' },
  { species: 'mouse', forms: [1, 2, 3, 4], bodies: ['PetMouseBmd1', 'PetMouseBmd1', 'PetMouseBmd1', 'PetMouseBmd2'], evidenceTask: 'TASK-SETTINGS-193Q', implementationTask: 'TASK-SLICE-193R', note: 'PetMouse2/3 inherit PetMouse1 without a new body atlas; PetMouse4 alone switches to PetMouseBmd2.' },
];

const skillSpecs = [
  ['pet-skill.monkey1.xj', 'monkey', 'PetMonkey1Bullet2', 'monkey1 xj projectile'],
  ['pet-skill.monkey2.lj', 'monkey', 'PetMonkey2Bullet2_1;PetMonkey2Bullet2_2', 'monkey2 lj two-stage effect'],
  ['pet-skill.monkey2.xj', 'monkey', 'PetMonkey1Bullet2', 'monkey2 xj reuses monkey1 projectile'],
  ['pet-skill.monkey3.lyq', 'monkey', 'PetMonkey3Bullet2', 'monkey3 lyq projectile'],
  ['pet-skill.monkey3.xj', 'monkey', 'PetMonkey1Bullet2', 'monkey3 xj reuses monkey1 projectile'],
  ['pet-skill.monkey3.lj', 'monkey', 'PetMonkey3Bullet3_1;PetMonkey3Bullet3_2', 'monkey3 lj prelude and damage stage'],
  ['pet-skill.monkey4.jgaoyi', 'monkey', 'PetMonkeyBmd4', 'monkey4 jgaoyi body hit5 action'],
  ['pet-skill.horse1.sp', 'horse', 'PetHorse1Bullet2', 'horse1 sp projectile'],
  ['pet-skill.horse2.bd', 'horse', 'PetHorse2Bullet2', 'horse2 bd projectile'],
  ['pet-skill.horse3.bz', 'horse', 'PetHorse3Bullet4', 'horse3 bz projectile'],
  ['pet-skill.horse4.tmaoyi', 'horse', 'PetHorse4Bullet5', 'horse4 ultimate falling/tracking stage'],
  ['pet-skill.horse4.tmaoyi.explode', 'horse', 'PetHorse4Bullet5Explode', 'horse4 ultimate explosion stage'],
  ['pet-skill.dragon1.fs', 'dragon', 'PetDragonBmd1', 'dragon1 translucent body clone'],
  ['pet-skill.dragon2.sdcc', 'dragon', 'PetDragon2Bullet2', 'dragon2 sdcc projectile'],
  ['pet-skill.dragon3.ltwj', 'dragon', 'PetDragon3Bullet3', 'dragon3 ltwj projectile'],
  ['pet-skill.dragon4.qlaoyi', 'dragon', 'PetDragonBullet4', 'dragon4 ultimate trigger object'],
  ['pet-skill.turtle1.sld', 'turtle', 'PetTurtle1Bullet2', 'turtle1 sld projectile'],
  ['pet-skill.turtle2.txlj', 'turtle', 'PetTurtle2Buff', 'turtle2 owner/pet link effect'],
  ['pet-skill.turtle3.sybh', 'turtle', 'PetTurtle3Bullet3', 'turtle3 sybh area object'],
  ['pet-skill.turtle4.xwaoyi', 'turtle', 'PetTurtleBmd4;PetTurtle3Bullet3', 'turtle4 body hit5 plus reused area object'],
  ['pet-skill.ufo1.pms', 'ufo', 'PetKabu1Bullet2', 'ufo1 pms projectile'],
  ['pet-skill.ufo2.ss', 'ufo', 'PetKabuBmd2', 'ufo2 teleport and body normal-attack continuation'],
  ['pet-skill.ufo3.kmsk', 'ufo', 'PetKabu3Bullet4', 'ufo3 kmsk area object'],
  ['pet-skill.tigress.hy', 'tigress', 'PetTiger1Bullet2', 'tigress hy projectile'],
  ['pet-skill.tigress.sxhz', 'tigress', 'PetTiger2Bullet3_1;PetTiger2Bullet3_2', 'tigress sxhz two-stage object'],
  ['pet-skill.tigress.hsqj', 'tigress', 'PetTiger3Bullet4_1;PetTiger3Bullet4_2', 'tigress hsqj prelude and damage stage'],
  ['pet-skill.tigress.bhaoyi', 'tigress', 'PetTigerBmd4;PetTiger1Bullet2;PetTiger2Bullet3_1;PetTiger2Bullet3_2;PetTiger3Bullet4_1;PetTiger3Bullet4_2', 'tigress body teleport/combo and reused skills'],
  ['pet-skill.phoenix.np', 'phoenix', 'PetPhoenixBmd1;PetPhoenixBmd2;PetPhoenixBmd3;PetPhoenixBmd4;PetPhoenix1Bullet2_1;PetPhoenix1Bullet2_2', 'phoenix transformation and rebirth feedback'],
  ['pet-skill.phoenix.bshn', 'phoenix', 'PetPhoenix2Bullet3', 'phoenix bshn projectile'],
  ['pet-skill.phoenix.dhly', 'phoenix', 'PetPhoenix3Bullet4', 'phoenix dhly area object'],
  ['pet-skill.phoenix.zqaoyi', 'phoenix', 'PetPhoenixBmd4;PetPhoenix4Bullet3_2;PetPhoenix4Bullet5;PetPhoenix4Bullet6', 'phoenix ultimate body and combo objects'],
  ['pet-skill.rabbit.yg', 'rabbit', 'Monster130Bullet2', 'rabbit moonlight proc object'],
  ['pet-skill.rabbit.jf', 'rabbit', 'PetPetRabbitBulletBuff;PetPetRabbitJFBuff', 'rabbit attack/dodge buff feedback'],
  ['pet-skill.rabbit.bs', 'rabbit', 'PetPetRabbitBullet4', 'rabbit ice projectile'],
  ['pet-skill.rabbit.ysaoyi', 'rabbit', 'PetPetRabbitBmd4;petRabbit4AoyiBuff', 'rabbit ultimate body and moon field'],
  ['pet-skill.mouse.sc', 'mouse', 'PetMouse1Bullet1;PetMouse1Bullet2', 'mouse rush and bite objects'],
  ['pet-skill.mouse.hxfb', 'mouse', 'PetMouse1Bullet3', 'mouse returning-dart object'],
  ['pet-skill.mouse.zsaoyi', 'mouse', 'PetMouseBmd2;PetMouse1Bullet1;PetMouse1Bullet2;PetMouse1Bullet3', 'mouse ultimate body and reused combo objects'],
];

const monkeyTruth = {
  truthId: 'task-settings-193a.pet-monkey-animation',
  evidencePath: 'docs/reverse-engineering/evidence/TASK-SETTINGS-193A-pet-monkey-animation.md',
  implementationTask: 'TASK-SLICE-193B',
};

const monkeySkillAnnotations = new Map([
  ['pet-skill.monkey1.xj', ['monkey1 xj 16-frame looping projectile', 'TASK-SETTINGS-193A verified patch owner registration emit matrix and four-second lifecycle; pair implementation is TASK-SLICE-193B.']],
  ['pet-skill.monkey2.lj', ['monkey2 lj two-stage 4+5 frame effect', 'TASK-SETTINGS-193A requires both prelude and damage objects; pair implementation is TASK-SLICE-193B.']],
  ['pet-skill.monkey2.xj', ['monkey2 xj reuses monkey1 16-frame projectile', 'TASK-SETTINGS-193A disproves the modern PetMonkey2Bullet3 source name; pair implementation must reuse PetMonkey1Bullet2.']],
  ['pet-skill.monkey3.lyq', ['monkey3 and monkey4 lyq 25-frame projectile', 'TASK-SETTINGS-193A verified patch owner registration emit matrix and last-frame destruction.']],
  ['pet-skill.monkey3.xj', ['monkey3 and monkey4 xj reuse monkey1 projectile', 'TASK-SETTINGS-193A verifies shared visual owner with form-specific emit offsets.']],
  ['pet-skill.monkey3.lj', ['monkey3 and monkey4 lj prelude plus damage stage', 'TASK-SETTINGS-193A requires disabled behind-pet prelude and visible damage stage; modern single-stage projection is incomplete.']],
  ['pet-skill.monkey4.jgaoyi', ['monkey4 jgaoyi body hit5 row8', 'TASK-SETTINGS-193A confirms no independent projectile visual; TASK-SLICE-193B must consume the body action.']],
]);

const packagePriority = new Map([
  ['assets/20120808.swf', 0],
  ['assets/20120203.swf', 1],
  ['assets/StageCommon.swf', 2],
  ['assets/mouse.swf', 3],
  ['assets/pet1.swf', 4],
]);

const packageRecords = sourcePackages.map((sourcePackage) => {
  const sourcePath = `${restoredPrefix}${sourcePackage}`;
  const absolute = path.join(root, sourcePath);
  if (!existsSync(absolute)) throw new Error(`Missing restored source package: ${sourcePath}`);
  const symbols = readSymbolClassTag(absolute);
  return { sourcePackage, sourcePath, sha256: sha256(absolute), symbols };
});

const symbolIndex = new Map();
for (const source of packageRecords) {
  for (const symbol of source.symbols) {
    const candidates = symbolIndex.get(symbol.symbol) ?? [];
    candidates.push({ sourcePackage: source.sourcePackage, sourcePath: source.sourcePath, characterId: symbol.characterId, sha256: source.sha256 });
    symbolIndex.set(symbol.symbol, candidates);
  }
}

function resolveSymbol(name) {
  const candidates = [...(symbolIndex.get(name) ?? [])].sort((a, b) =>
    (packagePriority.get(a.sourcePackage) ?? 99) - (packagePriority.get(b.sourcePackage) ?? 99)
      || a.characterId - b.characterId,
  );
  return {
    symbol: name,
    status: candidates.length > 0 ? 'located' : 'unlocated',
    selectedOwner: candidates[0] ?? null,
    candidates,
    ownerRule: candidates.length > 1
      ? 'Prefer the later Aloader patch package over the pet1 base package; the family evidence task must verify ApplicationDomain/load precedence before deriving frames.'
      : 'Only exact restored SymbolClass candidate in the audited package set.',
  };
}

function resolveFamilySymbol(name, speciesName) {
  const resolved = resolveSymbol(name);
  if (speciesName === 'monkey' && resolved.candidates.length > 1) {
    return {
      ...resolved,
      ownerRule: `Verified by ${monkeyTruth.truthId}: Aloader loads 20120203.swf before stage AssetsLoader adds pet1.swf to the same ApplicationDomain; selected patch owner is authoritative for TASK-SLICE-193B.`,
    };
  }
  return resolved;
}

const species = speciesSpecs.map((spec) => {
  const skills = skillSpecs.filter((entry) => entry[1] === spec.species).map(([stableKey, , names, usage]) => ({
    stableKey,
    usage,
    symbols: names.split(';').map((name) => resolveFamilySymbol(name, spec.species)),
    modernStatus: 'placeholder-or-unrendered',
  }));
  const forms = spec.forms.map((form, index) => ({ form, bodySymbol: spec.bodies[index], body: resolveFamilySymbol(spec.bodies[index], spec.species) }));
  return {
    species: spec.species,
    forms,
    requiredBodyActionClasses: ['wait/follow', 'walk/warp', 'normal-attack', 'species-skill-actions', 'hurt', 'death-or-zero-hp lifecycle'],
    exactBodyActionRows: spec.species === 'monkey'
      ? `verified by ${monkeyTruth.truthId}; 626 states / 20 objects / unresolved=[]; ${monkeyTruth.evidencePath}`
      : 'unresolved-by-design; owned by the generated evidence task and must be serialized as verified machine truth before implementation',
    skills,
    modernBody: { status: 'placeholder', locator: 'src/scenes/test-scene/TestScenePetViewBridge.ts:createPetView geometric body/ear/label projection' },
    evidenceTask: spec.evidenceTask,
    implementationTask: spec.implementationTask,
    note: spec.note ?? null,
  };
});

const missing = species.flatMap((item) => [
  ...item.forms.filter((form) => form.body.status === 'unlocated').map((form) => `${item.species}:body:${form.bodySymbol}`),
  ...item.skills.flatMap((skill) => skill.symbols.filter((symbol) => symbol.status === 'unlocated').map((symbol) => `${item.species}:${skill.stableKey}:${symbol.symbol}`)),
]);
if (missing.length > 0) throw new Error(`Unlocated expected pet symbols:\n${missing.join('\n')}`);

const corpus = {
  schemaVersion: 1,
  corpusId: 'task-settings-193.pet-animation-corpus',
  status: 'partitioned-not-visually-verified',
  scope: 'Nine currently supported modern pet species, their actual forms, body atlas SymbolClasses, skill objects, restored source owners, and placeholder/unrendered modern mappings.',
  exclusions: ['No frame derivation', 'No atlas generation', 'No src integration', 'No claim that any species visual is closed'],
  sourcePackages: packageRecords.map(({ symbols, ...source }) => ({ ...source, matchingSymbolCount: symbols.filter((item) => /^Pet|^Monster130Bullet2$|^petRabbit4AoyiBuff$/.test(item.symbol)).length })),
  sourcePrecedenceEvidence: {
    locator: 'local-resources/regima/task-outputs/task-settings-189-equipment-tooltip/restored-main-script/scripts/loader/Aloader.as: constructor urls and sequential next()',
    rule: '20120203.swf loads before 20120808.swf and StageCommon.swf; duplicate candidates are frozen to the later listed patch for child-task investigation, while pet1/mouse-only symbols keep their sole owner.',
    counterEvidence: 'TASK-SETTINGS-193A resolved monkey1..3 and all monkey effect collisions to 20120203.swf by real load timing; other families must still reopen their selected owner if family evidence contradicts the frozen precedence.',
  },
  species,
  completeness: { expectedSpecies: 9, extractedSpecies: species.length, unlocated: missing, noUnpartitionedFamily: species.every((item) => item.evidenceTask && item.implementationTask) },
};

const corpusText = `${JSON.stringify(corpus, null, 2)}\n`;
const header = ['stableKey', 'as3Name', 'sourceKind', 'sourcePath', 'sourcePackage', 'symbolId', 'scope', 'usage', 'status', 'confidence', 'nextAction', 'note'];

const bodyRows = species.map((item) => {
  const unique = [...new Map(item.forms.map((form) => [form.bodySymbol, form.body])).values()];
  const monkeyReady = item.species === 'monkey';
  return row([
    `pet-animation.${item.species}.body-family`,
    unique.map((entry) => entry.symbol).join(';'),
    'restored-swf',
    unique.flatMap((entry) => entry.candidates.map((candidate) => candidate.sourcePath)).filter(uniqueValue).join(';'),
    unique.map((entry) => entry.selectedOwner.sourcePackage).filter(uniqueValue).join(';'),
    unique.map((entry) => entry.selectedOwner.characterId).join(';'),
    'effect',
    monkeyReady ? 'monkey actual-form body atlases with verified action rows and owner precedence' : `${item.species} actual-form body atlases; exact action rows remain for ${item.evidenceTask}`,
    monkeyReady ? 'ready' : 'export-ready',
    'confirmed',
    monkeyReady ? 'none' : 'export-selectively',
    monkeyReady
      ? 'TASK-SLICE-193B directly consumes TASK-SETTINGS-193A truth for host-tick holds, registration, visible bounds and patch owner in P1/P2 combat runtime.'
      : `Source owner partitioned by TASK-SETTINGS-193; derive nothing before ${item.evidenceTask} verifies action rows, registration points, frame timing and load precedence.`,
  ]);
});

const skillRows = skillSpecs.map(([stableKey, speciesName, names, usage]) => {
  const resolved = names.split(';').map(resolveSymbol);
  const monkeyReady = monkeySkillAnnotations.get(stableKey);
  return row([
    stableKey,
    names,
    'restored-swf',
    resolved.flatMap((entry) => entry.candidates.map((candidate) => candidate.sourcePath)).filter(uniqueValue).join(';'),
    resolved.map((entry) => entry.selectedOwner.sourcePackage).filter(uniqueValue).join(';'),
    resolved.map((entry) => entry.selectedOwner.characterId).join(';'),
    'effect',
    monkeyReady?.[0] ?? usage,
    monkeyReady ? 'ready' : 'export-ready',
    'confirmed',
    monkeyReady ? 'none' : 'export-selectively',
    monkeyReady
      ? `${monkeyReady[1]} TASK-SLICE-193B now consumes this verified visual in the shared monkey runtime.`
      : `${speciesName} family is partitioned to ${speciesSpecs.find((item) => item.species === speciesName).evidenceTask}; modern visibility remains placeholder or absent until its paired implementation task.`,
  ]);
});

const bodyCsv = `${header.join(',')}\n${bodyRows.join('\n')}\n`;
const skillCsv = `${header.join(',')}\n${skillRows.join('\n')}\n`;

emit(corpusPath, corpusText);
emit(bodyAnnotationPath, bodyCsv);
emit(skillAnnotationPath, skillCsv);
console.log(`Pet animation corpus ${check ? 'check' : 'generation'} passed: 9 species, ${species.reduce((sum, item) => sum + item.forms.length, 0)} forms, ${skillSpecs.length} skill mappings, 0 unlocated symbols.`);

function emit(relativePath, content) {
  const absolute = path.join(root, relativePath);
  if (check) {
    if (!existsSync(absolute) || readFileSync(absolute, 'utf8') !== content) throw new Error(`Generated file is stale: ${relativePath}`);
  } else {
    writeFileSync(absolute, content);
  }
}

function row(values) {
  return values.map((value) => csv(value)).join(',');
}

function csv(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function uniqueValue(value, index, values) {
  return values.indexOf(value) === index;
}

function sha256(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex').toUpperCase();
}

function readSymbolClassTag(filePath) {
  const raw = readFileSync(filePath);
  const signature = raw.subarray(0, 3).toString('ascii');
  if (signature === 'ZWS') return [];
  const body = signature === 'CWS' ? inflateSync(raw.subarray(8)) : raw.subarray(8);
  const swf = signature === 'CWS' ? Buffer.concat([Buffer.from('FWS'), raw.subarray(3, 8), body]) : raw;
  if (swf.subarray(0, 3).toString('ascii') !== 'FWS') return [];
  const rectBits = 5 + (swf[8] >> 3) * 4;
  let offset = 8 + Math.ceil(rectBits / 8) + 4;
  const symbols = [];
  while (offset + 2 <= swf.length) {
    const tagHeader = swf.readUInt16LE(offset); offset += 2;
    const tagCode = tagHeader >> 6;
    let tagLength = tagHeader & 0x3f;
    if (tagLength === 0x3f) { if (offset + 4 > swf.length) break; tagLength = swf.readUInt32LE(offset); offset += 4; }
    const end = offset + tagLength;
    if (end > swf.length) break;
    if (tagCode === 76 && tagLength >= 2) {
      let cursor = offset;
      const count = swf.readUInt16LE(cursor); cursor += 2;
      for (let index = 0; index < count && cursor + 2 <= end; index += 1) {
        const characterId = swf.readUInt16LE(cursor); cursor += 2;
        const zero = swf.indexOf(0, cursor);
        if (zero < 0 || zero > end) break;
        symbols.push({ characterId, symbol: swf.subarray(cursor, zero).toString('utf8') });
        cursor = zero + 1;
      }
    }
    offset = end;
    if (tagCode === 0) break;
  }
  return symbols;
}
