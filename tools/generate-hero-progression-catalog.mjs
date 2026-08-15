import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRoot =
  'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts';
const roleDefinitions = [
  { heroId: 1, className: 'Role1', displayName: '悟空' },
  { heroId: 2, className: 'Role2', displayName: '唐僧' },
  { heroId: 3, className: 'Role3', displayName: '八戒' },
  { heroId: 4, className: 'Role4', displayName: '沙僧' },
  { heroId: 5, className: 'Role5', displayName: '白龙' },
];
const sourcePaths = {
  constants: `${sourceRoot}/my/AllConsts.as`,
  roleProperties: `${sourceRoot}/base/BaseRoleProperies.as`,
  baseHero: `${sourceRoot}/base/BaseHero.as`,
  baseMonster: `${sourceRoot}/base/BaseMonster.as`,
  user: `${sourceRoot}/user/User.as`,
  backpack: `${sourceRoot}/export/pack/BackPack.as`,
  roleInfo: `${sourceRoot}/export/RoleInfo.as`,
  taskInterface: `${sourceRoot}/export/taskInterface/TaskInterface.as`,
  monster111: `${sourceRoot}/export/monster/Monster111.as`,
};
const outputRelative =
  'docs/reverse-engineering/reference/hero-progression-catalog-1.1.json';
const schemaRelative =
  'docs/reverse-engineering/reference/hero-progression-catalog.schema.json';

const sources = Object.fromEntries(
  Object.entries(sourcePaths).map(([key, relative]) => [key, readUtf8(relative)]),
);
const schema = JSON.parse(readUtf8(schemaRelative));

assertEqual(schema.$id, 'hero-progression-catalog.schema.json', 'schema id');
assertIncludes(
  sources.constants,
  'public static const GAME_ROLE_MAXLEVEL:int = 90;',
  'maximum-level declaration',
);
assertIncludes(
  sources.roleProperties,
  'public function setDefense(param1:int) : void',
  'defense int coercion',
);

const experienceSegments = [
  { minLevel: 1, maxLevel: 6, base: 135, growth: 10, originLevel: 1 },
  { minLevel: 7, maxLevel: 12, base: 625, growth: 50, originLevel: 7 },
  { minLevel: 13, maxLevel: 18, base: 1950, growth: 100, originLevel: 13 },
  { minLevel: 19, maxLevel: 88, base: 5000, growth: 5000, originLevel: 19 },
  { minLevel: 89, maxLevel: 90, sentinel: 999_999_999 },
];
const expectedExperienceFragments = [
  'setexp(135 + 10 * (this.roleProperies.getLevel() - 1))',
  'setexp(625 + 50 * (this.roleProperies.getLevel() - 7))',
  'setexp(1950 + 100 * (this.roleProperies.getLevel() - 13))',
  'setexp(5000 + 5000 * (this.roleProperies.getLevel() - 19))',
  'setexp(999999999)',
];

const roles = roleDefinitions.map((definition) => buildRole(definition));
const experienceLevels = Array.from({ length: 90 }, (_, index) => ({
  level: index + 1,
  expToNext: experienceToNext(index + 1),
}));
const transitionTests = buildTransitionTests();

assertEqual(roles.length, 5, 'role count');
assertEqual(experienceLevels.length, 90, 'experience level count');
assertEqual(roles.flatMap((role) => role.levels).length, 450, 'role-level count');
assertEqual(roles[4].levels[1].defense, 3, 'Role5 level 2 defense int coercion');
assertEqual(roles[4].levels[89].defense, 135, 'Role5 level 90 defense int coercion');
assertEqual(experienceToNext(88), 350_000, 'level 88 experience');
assertEqual(experienceToNext(89), 999_999_999, 'level 89 sentinel');
assertEqual(experienceToNext(90), 999_999_999, 'level 90 sentinel');
for (const test of transitionTests) {
  const actual = simulateSetExper(test.start, test.addedExperience);
  assertEqual(JSON.stringify(actual), JSON.stringify(test.expected), test.id);
}

const output = {
  schemaVersion: 1,
  gameVersion: '1.1',
  scope:
    'Original five-hero level 1..90 base stats, shared experience thresholds, level-up sequencing, ordinary monster ownership, and original/current-save handoff boundaries',
  status: 'verified',
  authorities: {
    constants: evidenceFile(sourcePaths.constants, ['GAME_ROLE_MAXLEVEL:14']),
    roleProperties: evidenceFile(sourcePaths.roleProperties, [
      'judgeUpGrade:530-545',
      'setDefense:674-682',
      'setExper:790-809',
      'setinitExper:882-885',
      'addEquip/removeEquip/addAllEquip:889-993',
      'removeAllEquipAndPassive/initAll:1098-1114',
    ]),
    baseHero: evidenceFile(sourcePaths.baseHero, [
      'initPopertits:318-333',
      'upGrade:1756-1762',
    ]),
    baseMonster: evidenceFile(sourcePaths.baseMonster, [
      'difficulty experience multipliers:217-242',
      'reduceHp ordinary experience owner:1433-1467',
      'addExper helper:1642-1646',
    ]),
    user: evidenceFile(sourcePaths.user, [
      'getSaveObj:628-656',
      'setSaveObj progression restore:658-703',
    ]),
    backpack: evidenceFile(sourcePaths.backpack, ['level/experience display:135-161']),
    roleInfo: evidenceFile(sourcePaths.roleInfo, ['level/experience display:271-281']),
    taskInterface: evidenceFile(sourcePaths.taskInterface, ['direct User.curExp reward bypass:328-353']),
    monster111: evidenceFile(sourcePaths.monster111, ['special shared experience override:337-361']),
    schema: evidenceFile(schemaRelative, ['$id and structural constraints']),
  },
  fieldContract: {
    geometry:
      'not-applicable: this catalog freezes numeric and sequencing behavior only; it does not change HUD/UI geometry, upgrade effects, buttons, or visible resources',
    baseStats:
      'Each role upGrade method writes SHHP, SMMP, basePower, and defense from current level; all setters accept int, so positive fractional inputs truncate toward zero before storage',
    experience:
      'exp is the current-level threshold and exper is current-level remainder; levels 89 and 90 both use the 999999999 sentinel',
    levelUp:
      'setExper stores the proposed total, judgeUpGrade raises exactly one level, rebuilds stats, then recursively calls setExper with proposedTotal-oldThreshold',
    derivedStats:
      'On a real level-up, removeAllBuff runs first; pill/equipment/passive contributions are removed, base stats are rebuilt and initially refilled, then passive/equipment/pill contributions are re-added in that order; addAllEquip refills final HP/MP',
    owner:
      'Ordinary monster experience follows curAttackTarget: a BaseHero writes that exact hero player owner, a BasePet writes that pet; no ordinary P1/P2 sharing path exists',
    save:
      'Original User saves curLevel/curExp per player. The modern current schema already stores level/currentExp per player; the implementation task must consume this catalog without creating a second progression or save owner',
    numericCoercion:
      'AS3 int parameters truncate positive fractions: Role5 defense and monster/difficulty/pet-share experience reach integer consumers through int coercion',
  },
  counts: {
    roles: roles.length,
    levelsPerRole: 90,
    roleLevelRecords: roles.flatMap((role) => role.levels).length,
    experienceLevelRecords: experienceLevels.length,
    unknownFields: 0,
  },
  coverage: {
    coveredLevels: { min: 1, max: 90 },
    requiredBoundaryLevels: [1, 6, 7, 12, 13, 18, 19, 88, 89, 90],
    unknownFields: [],
    explicitExclusions: [
      'TaskInterface direct User.curExp rewards',
      'pet progression formulas and pet task rewards',
      'Monster111 special shared experience override',
      'EndlessModeCreate wave scaling',
      'RoleLevelUpMc visual/timeline evidence',
      'HUD, backpack, and RoleInfo display geometry',
    ],
  },
  experienceCurve: {
    maxLevel: 90,
    sentinelExpToNext: 999_999_999,
    segments: experienceSegments,
    levels: experienceLevels,
    sourceLocators: roles.map((role) => `${role.source.path}:${role.source.upGradeLocator}`),
    evidenceLevel: 'cross-confirmed',
    counterEvidence:
      'Reopen if any Role1..Role5 upGrade branch or AllConsts.GAME_ROLE_MAXLEVEL changes.',
  },
  roles,
  levelUpSequence: {
    orderedSteps: [
      'setExper receives an int proposed total and stores it when below the current threshold',
      'when proposed total reaches the threshold and level is below 90, store it and call judgeUpGrade',
      'judgeUpGrade snapshots the old threshold, increments level, and synchronizes that level to the same User owner',
      'who.upGrade(false) removes buffs, then pill/equipment/passive contributions, writes base stats and provisional full HP/MP, assigns the new threshold, and re-adds passive/equipment/pill contributions',
      'addAllEquip refills HP/MP to the final derived maxima',
      'setExper recursively receives stored proposed total minus the old threshold; recursion repeats for every crossed level',
      'RoleLevelUpMc is added after recursive leveling returns, so multi-level gains add one visual per crossed level in reverse unwind order',
    ],
    level90Boundary:
      'At level 90, totals below 999999999 are stored; a proposed total at or above the sentinel is ignored because neither setExper branch writes it.',
    initialRestore:
      'BaseHero.initPopertits clears runtime stats, sets level, writes saved experience with setinitExper (no leveling), then calls upGrade() to rebuild current-level derived stats.',
    evidenceLevel: 'cross-confirmed',
    counterEvidence:
      'Reopen if BaseRoleProperies.setExper/judgeUpGrade, BaseHero.initPopertits/upGrade, or role upGrade ordering changes.',
  },
  ordinaryMonsterExperience: {
    difficultyMultipliers: {
      normal: 1,
      hard: 1.6,
      hell: 0.01,
    },
    heroWithoutPet: 'targetHero.exper + int(monsterExp)',
    heroWithPet:
      'targetHero.exper + int(monsterExp*0.6), targetHero.currentPet.exper + pet consumer coercion of monsterExp*0.6',
    petTarget: 'targetPet.exper + pet consumer coercion of monsterExp',
    owner: 'curAttackTarget player/pet only',
    evidenceLevel: 'confirmed',
    counterEvidence:
      'Monster111 and TaskInterface are explicit bypasses and cannot be generalized into the ordinary rule.',
  },
  transitionTests,
  commonEvidenceLevel: 'cross-confirmed',
  commonCounterEvidence:
    'Reopen if any recorded source hash, role formula, setter type, upgrade order, ordinary monster owner path, original save locator, or current schema boundary changes.',
};

const serialized = `${JSON.stringify(output, null, 2)}\n`;
const outputPath = absolute(outputRelative);
if (process.argv.includes('--check')) {
  const current = readFileSync(outputPath, 'utf8');
  if (current !== serialized) {
    throw new Error(
      `${outputRelative} is stale; run npm run generate:hero-progression-catalog`,
    );
  }
  console.log(
    `Hero progression catalog verified: ${output.counts.roles} roles, ${output.counts.roleLevelRecords} role-level records, ${output.counts.unknownFields} unknown fields, ${transitionTests.length} transition tests.`,
  );
} else {
  writeFileSync(outputPath, serialized, 'utf8');
  console.log(JSON.stringify(output.counts, null, 2));
}

function buildRole(definition) {
  const relative = `${sourceRoot}/export/hero/${definition.className}.as`;
  const source = readUtf8(relative);
  const body = extractFunctionBody(
    source,
    'override public function upGrade(param1:Boolean = true) : *',
  );
  for (const fragment of expectedExperienceFragments) {
    assertIncludes(body, fragment, `${definition.className} shared experience fragment`);
  }
  assertIncludes(body, 'super.upGrade();', `${definition.className} removes buffs`);
  assertIncludes(
    body,
    'this.roleProperies.removeAllEquipAndPassive();',
    `${definition.className} removes derived contributions`,
  );
  assertIncludes(body, 'this.roleProperies.initAll();', `${definition.className} restores derived contributions`);

  const formulas = {
    maxHp: parseLinearSetter(body, 'setSHHP'),
    maxMp: parseLinearSetter(body, 'setSMMP'),
    power: parseLinearSetter(body, 'setBasePower'),
    defense: parseDefenseSetter(body),
  };
  const upGradeLine = lineNumber(
    source,
    'override public function upGrade(param1:Boolean = true) : *',
  );
  return {
    heroId: definition.heroId,
    originalClass: definition.className,
    displayName: definition.displayName,
    source: {
      ...evidenceFile(relative, [`upGrade:${upGradeLine}-${upGradeLine + 42}`]),
      upGradeLocator: `upGrade:${upGradeLine}-${upGradeLine + 42}`,
    },
    formulas,
    levels: Array.from({ length: 90 }, (_, index) => {
      const level = index + 1;
      return {
        level,
        maxHp: evaluateFormula(formulas.maxHp, level),
        maxMp: evaluateFormula(formulas.maxMp, level),
        power: evaluateFormula(formulas.power, level),
        defense: evaluateFormula(formulas.defense, level),
        expToNext: experienceToNext(level),
      };
    }),
    evidenceLevel: 'cross-confirmed',
    counterEvidence:
      'Reopen if the role upGrade body, BaseRoleProperies setter signatures, or shared experience branches change.',
  };
}

function parseLinearSetter(body, setter) {
  const pattern = new RegExp(
    `this\\.roleProperies\\.${setter}\\((\\d+(?:\\.\\d+)?) \\+ (\\d+(?:\\.\\d+)?) \\* \\(this\\.roleProperies\\.getLevel\\(\\) - 1\\)\\);`,
  );
  const match = body.match(pattern);
  if (!match) throw new Error(`Unable to parse ${setter} formula`);
  return {
    originalExpression: match[0].slice(match[0].indexOf('(') + 1, -2),
    base: Number(match[1]),
    perLevel: Number(match[2]),
    runtimeCoercion: 'int-truncate-toward-zero',
    unit: 'points',
  };
}

function parseDefenseSetter(body) {
  const line = body.match(/this\.roleProperies\.setDefense\(([^;]+)\);/)?.[0];
  if (!line) throw new Error('Unable to parse defense formula');
  const expression = line.slice(line.indexOf('(') + 1, -2);
  const linear = expression.match(
    /^(\d+(?:\.\d+)?) \+ (\d+(?:\.\d+)?) \* \(this\.roleProperies\.getLevel\(\) - 1\)$/,
  );
  const baseOffset = expression.match(
    /^(\d+(?:\.\d+)?) \+ \(this\.roleProperies\.getLevel\(\) - 1\)$/,
  );
  const offsetOnly = expression === 'this.roleProperies.getLevel() - 1';
  if (!linear && !baseOffset && !offsetOnly) {
    throw new Error(`Unsupported defense expression: ${expression}`);
  }
  return {
    originalExpression: expression,
    base: linear ? Number(linear[1]) : baseOffset ? Number(baseOffset[1]) : 0,
    perLevel: linear ? Number(linear[2]) : 1,
    runtimeCoercion: 'int-truncate-toward-zero',
    unit: 'points',
  };
}

function evaluateFormula(formula, level) {
  return Math.trunc(formula.base + formula.perLevel * (level - 1));
}

function experienceToNext(level) {
  const segment = experienceSegments.find(
    (candidate) => level >= candidate.minLevel && level <= candidate.maxLevel,
  );
  if (!segment) throw new RangeError(`Unsupported level ${level}`);
  return segment.sentinel ?? segment.base + segment.growth * (level - segment.originLevel);
}

function buildTransitionTests() {
  return [
    transitionTest('below-threshold', { level: 1, currentExp: 10 }, 124, { level: 1, currentExp: 134 }),
    transitionTest('exact-single-level', { level: 1, currentExp: 0 }, 135, { level: 2, currentExp: 0 }),
    transitionTest('multi-level-recursion', { level: 1, currentExp: 130 }, 160, { level: 3, currentExp: 10 }),
    transitionTest('level-88-to-89', { level: 88, currentExp: 349_999 }, 1, { level: 89, currentExp: 0 }),
    transitionTest('sentinel-level-89-to-90', { level: 89, currentExp: 999_999_998 }, 1, { level: 90, currentExp: 0 }),
    transitionTest('level-90-stores-below-sentinel', { level: 90, currentExp: 0 }, 4, { level: 90, currentExp: 4 }),
    transitionTest('level-90-ignores-sentinel-total', { level: 90, currentExp: 999_999_998 }, 1, { level: 90, currentExp: 999_999_998 }),
  ];
}

function transitionTest(id, start, addedExperience, expected) {
  return { id, start, addedExperience, expected };
}

function simulateSetExper(start, addedExperience) {
  const state = { ...start };
  setExper(state, state.currentExp + Math.trunc(addedExperience));
  return state;
}

function setExper(state, proposedTotal) {
  const threshold = experienceToNext(state.level);
  if (proposedTotal < threshold) {
    state.currentExp = Math.trunc(proposedTotal);
  } else if (state.level < 90) {
    state.currentExp = Math.trunc(proposedTotal);
    state.level += 1;
    setExper(state, state.currentExp - threshold);
  }
}

function extractFunctionBody(source, signature) {
  const signatureIndex = source.indexOf(signature);
  if (signatureIndex < 0) throw new Error(`Missing function signature: ${signature}`);
  const open = source.indexOf('{', signatureIndex);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(open + 1, index);
  }
  throw new Error(`Unbalanced function body: ${signature}`);
}

function evidenceFile(relative, locators) {
  const content = readUtf8(relative);
  return {
    path: relative,
    sha256: createHash('sha256').update(content).digest('hex'),
    locators,
  };
}

function lineNumber(source, needle) {
  const index = source.indexOf(needle);
  if (index < 0) throw new Error(`Missing locator text: ${needle}`);
  return source.slice(0, index).split(/\r?\n/).length;
}

function assertIncludes(source, fragment, label) {
  if (!source.includes(fragment)) throw new Error(`Missing ${label}: ${fragment}`);
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function readUtf8(relative) {
  return readFileSync(absolute(relative), 'utf8');
}

function absolute(relative) {
  return path.join(root, ...relative.split('/'));
}
