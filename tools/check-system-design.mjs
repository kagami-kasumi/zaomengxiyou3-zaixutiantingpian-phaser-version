import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function absolute(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath, errors) {
  if (!existsSync(absolute(relativePath))) {
    errors.push(`missing required file: ${relativePath}`);
    return '';
  }
  return readFileSync(absolute(relativePath), 'utf8');
}

function requireFiles(relativePaths, errors) {
  for (const relativePath of relativePaths) {
    if (!existsSync(absolute(relativePath))) errors.push(`missing required file: ${relativePath}`);
  }
}

function requireMatches(relativePath, patterns, errors) {
  const source = read(relativePath, errors);
  for (const [label, pattern] of patterns) {
    if (!pattern.test(source)) errors.push(`${relativePath} missing ${label}`);
  }
}

function forbidMatches(relativePath, patterns, errors) {
  const source = read(relativePath, errors);
  for (const [label, pattern] of patterns) {
    if (pattern.test(source)) errors.push(`${relativePath} retains forbidden ${label}`);
  }
}

function walk(relativeDirectory) {
  const directory = absolute(relativeDirectory);
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.posix.join(relativeDirectory.replaceAll('\\', '/'), entry.name);
    return entry.isDirectory() ? walk(relativePath) : [relativePath];
  });
}

function forbidAcross(relativePaths, patterns, errors) {
  for (const relativePath of relativePaths) forbidMatches(relativePath, patterns, errors);
}

function requireTest(testName, tests, errors) {
  const relativePath = `tools/${testName}.ts`;
  if (!existsSync(absolute(relativePath))) {
    errors.push(`missing executable contract test: ${relativePath}`);
    return;
  }
  tests.add(testName);
}

const levelConsumers = [
  'src/scenes/test-scene/TestSceneStage11RuntimeAdapter.ts',
  'src/scenes/Stage12Scene.ts',
  'src/scenes/Stage13Scene.ts',
  'src/scenes/Stage21Scene.ts',
  'src/scenes/Stage22Scene.ts',
];

const levelFlows = [
  'src/systems/Stage11FlowSystem.ts',
  'src/systems/Stage12FlowSystem.ts',
  'src/systems/Stage13FlowSystem.ts',
  'src/systems/Stage21FlowSystem.ts',
  'src/systems/Stage22FlowSystem.ts',
];

const petTestConsumers = [
  'src/scenes/test-scene/TestScenePetMagicBridge.ts',
  'src/scenes/test-scene/TestSceneAdvancedPetSkillBridge.ts',
  'src/scenes/test-scene/TestSceneP2PetBridge.ts',
];

const formalHeroConsumers = [
  'src/scenes/stage12/Stage12GameplayBridge.ts',
  'src/scenes/stage13/Stage13GameplayBridge.ts',
  'src/scenes/stage21/Stage21GameplayBridge.ts',
  'src/scenes/stage22/Stage22GameplayBridge.ts',
  'src/scenes/test-scene/TestSceneHeroPartyRuntimeBridge.ts',
];

const contracts = {
  level: {
    L1(errors, tests) {
      const runtime = 'src/scenes/PlayableLevelRuntime.ts';
      requireMatches(runtime, [
        ['exported PlayableLevelRuntime class', /export\s+class\s+PlayableLevelRuntime\b/u],
        ['static create entry', /static\s+create\s*\(/u],
        ['create method', /\bcreate\s*\(/u],
        ['update method', /\bupdate\s*\(/u],
        ['destroy method', /\bdestroy\s*\(/u],
      ], errors);
      forbidMatches(runtime, [
        ['legacy createPlayableLevelRuntime function', /export\s+function\s+createPlayableLevelRuntime\b/u],
      ], errors);
      for (const consumer of levelConsumers) {
        requireMatches(consumer, [['PlayableLevelRuntime.create call', /PlayableLevelRuntime\.create\s*\(/u]], errors);
        forbidMatches(consumer, [['legacy createPlayableLevelRuntime call', /createPlayableLevelRuntime\s*\(/u]], errors);
      }
      requireTest('playable-level-class-design-tests', tests, errors);
    },
    L2(errors, tests) {
      for (const flow of levelFlows) {
        requireMatches(flow, [['LevelLifecycle inheritance', /extends\s+LevelLifecycle\b/u]], errors);
      }
      forbidAcross(
        [...walk('src/scenes'), ...walk('src/systems')].filter((file) => file.endsWith('.ts')),
        [['universal BaseLevel class', /class\s+BaseLevel(?:Scene)?\b/u]],
        errors,
      );
      forbidAcross(levelConsumers, [
        ['direct result presenter', /showLevelResult\s*\(/u],
        ['direct unlock write', /advanceLevelUnlockProgress\s*\(/u],
      ], errors);
      requireTest('playable-level-class-design-tests', tests, errors);
      requireTest('level-lifecycle-tests', tests, errors);
      requireTest('level-result-tests', tests, errors);
    },
  },
  pet: {
    P1(errors, tests) {
      const required = [
        'src/systems/PetCombatRuntime.ts',
        'src/systems/PetBehavior.ts',
        'src/systems/PetBehaviorRegistry.ts',
        'src/systems/PetCombatTargeting.ts',
      ];
      requireFiles(required, errors);
      requireMatches(required[0], [['exported PetCombatRuntime class', /export\s+class\s+PetCombatRuntime\b/u]], errors);
      requireMatches(required[0], [
        ['alive/dead-playing session phase', /['"]dead-playing['"]/u],
        ['animation completion input', /animation(?:Event|Events|Finished)/u],
        ['active-pet-only skill clock', /tickActivePetSkillState\s*\(/u],
        ['action selection before skill clock tick', /selectAction\s*\([\s\S]*tickActivePetSkillState\s*\(/u],
      ], errors);
      forbidMatches(required[0], [
        ['nearest target selection', /nearestTarget\s*\(/u],
        ['whole-roster skill clock', /updatePetSkillState\s*\(\s*frame\.roster/u],
        ['HP-zero active-session rejection', /pet\.isActive\s*&&[\s\S]{0,100}pet\.hp\s*>\s*0/u],
      ], errors);
      requireMatches(required[1], [
        ['PetBehavior contract', /export\s+(?:type|interface)\s+PetBehavior\b/u],
        ['movement permission hook', /canMove\s*\(/u],
        ['basic attack fallback hook', /basicAttack\s*\(/u],
        ['damage reaction hook', /onDamaged\s*\(/u],
        ['animation event hook', /onAnimationEvent\s*\(/u],
      ], errors);
      requireMatches(required[2], [['exported PetBehaviorRegistry class', /export\s+class\s+PetBehaviorRegistry\b/u]], errors);
      requireMatches(required[3], [['ordered-first target selection', /orderedFirstTarget\s*\(/u]], errors);
      forbidMatches(required[3], [['nearest target API', /nearestTarget\s*\(/u]], errors);
      requireMatches('src/systems/PetTuning.ts', [['original search range', /searchRange\s*:\s*1200\b/u]], errors);
      forbidAcross(required, [['Phaser dependency', /from\s+['"]phaser['"]|Phaser\./u]], errors);
      requireTest('pet-combat-runtime-design-tests', tests, errors);
    },
    P1B(errors, tests) {
      const runtime = 'src/systems/PetCombatRuntime.ts';
      const monkey = 'src/systems/pet-behaviors/MonkeyPetBehavior.ts';
      const horse = 'src/systems/pet-behaviors/HorsePetBehavior.ts';
      const registry = 'src/systems/pet-behaviors/createDefaultPetBehaviorRegistry.ts';
      requireFiles([runtime, monkey, horse, registry], errors);
      requireMatches(runtime, [
        ['active-pet-only skill clock', /tickActivePetSkillState\s*\(/u],
        ['skill execution port', /castSkill\s*:/u],
      ], errors);
      for (const [file, label] of [[monkey, 'MonkeyPetBehavior'], [horse, 'HorsePetBehavior']]) {
        requireMatches(file, [
          [`${label} strategy`, new RegExp(`export\\s+class\\s+${label}\\b`, 'u')],
          ['movement permission hook', /canMove\s*\(/u],
          ['basic attack fallback hook', /basicAttack\s*\(/u],
          ['damage reaction hook', /onDamaged\s*\(/u],
          ['animation event hook', /onAnimationEvent\s*\(/u],
        ], errors);
      }
      requireMatches(registry, [
        ['default registry factory', /export\s+function\s+createDefaultPetBehaviorRegistry\b/u],
        ['monkey registrations', /monkeyForms\.map/u],
        ['horse registrations', /horseForms\.map/u],
      ], errors);
      forbidAcross([runtime, monkey, horse, registry], [['Phaser dependency', /from\s+['"]phaser['"]|Phaser\./u]], errors);
      requireTest('pet-combat-runtime-design-tests', tests, errors);
    },
    P1R(errors, tests) {
      const runtime = 'src/systems/PetCombatRuntime.ts';
      const monkey = 'src/systems/pet-behaviors/MonkeyPetBehavior.ts';
      const combat = 'src/systems/PetMonkeyCombatSystem.ts';
      const formal = 'src/scenes/HeroPartyRuntimeBridge.ts';
      const body = 'src/scenes/FormalPetMonkeyBodyBridge.ts';
      const testScene = 'src/scenes/test-scene/TestSceneHeroPartyRuntimeBridge.ts';
      requireFiles([runtime, monkey, combat, formal, body, testScene], errors);
      requireMatches(runtime, [
        ['true monkey basic attack port', /requestPetMonkeyBasicAttack\s*\(/u],
        ['animation completion input', /animationEvents/u],
      ], errors);
      requireMatches(monkey, [
        ['two-roll normal branch', /random\(\)\s*<=\s*0\.7[\s\S]*random\(\)\s*<\s*0\.3/u],
        ['form4 inherited action priority', /case\s+4:[\s\S]*monkey3-lyq[\s\S]*monkey3-xj[\s\S]*monkey3-lj[\s\S]*monkey4-jgaoyi/u],
        ['form4 hurt release', /this\.form\s*===\s*4[\s\S]*monkey3Lj\.releaseReady\s*=\s*true/u],
      ], errors);
      requireMatches(combat, [
        ['verified collision dimensions', /31\.05[\s\S]*35[\s\S]*49\.95/u],
        ['attack-id deduplicated formal damage', /getProjectileAttackId[\s\S]*resolveStage1PetHit/u],
        ['P1/P2 damage ownership port', /ownerSlotForPet/u],
      ], errors);
      requireMatches(formal, [
        ['dual public pet runtimes', /p1:\s*new PetCombatRuntime\(\)[\s\S]*p2:\s*new PetCombatRuntime\(\)/u],
        ['formal monkey hit resolution', /resolveFormalPetMonkeyProjectileHits\s*\(/u],
        ['formal animation feedback queue', /pendingPetAnimationEvents/u],
      ], errors);
      requireMatches(testScene, [['shared TestScene updatePets entry', /runtime\.updatePets\s*\(/u]], errors);
      forbidMatches(body, [['legacy PetRuntimeSystem dependency', /PetRuntimeSystem/u]], errors);
      requireTest('pet-combat-runtime-design-tests', tests, errors);
      requireTest('pet-monkey-family-runtime-tests', tests, errors);
      requireTest('pet-monkey-behavior-contract-runtime-tests', tests, errors);
      requireTest('pet-monkey-animation-runtime-tests', tests, errors);
      requireTest('formal-pet-tests', tests, errors);
      requireTest('formal-pet-journey-tests', tests, errors);
    },
    P1C(errors, tests) {
      const behaviors = ['Dragon', 'Turtle', 'Ufo'].map((name) => (
        `src/systems/pet-behaviors/${name}PetBehavior.ts`
      ));
      requireFiles(behaviors, errors);
      behaviors.forEach((file) => requireMatches(file, [
        ['movement permission hook', /canMove\s*\(/u],
        ['basic attack fallback hook', /basicAttack\s*\(/u],
        ['damage reaction hook', /onDamaged\s*\(/u],
        ['animation event hook', /onAnimationEvent\s*\(/u],
      ], errors));
      requireMatches('src/systems/pet-behaviors/createDefaultPetBehaviorRegistry.ts', [
        ['dragon registrations', /dragonForms\.map/u],
        ['turtle registrations', /turtleForms\.map/u],
        ['ufo registrations', /ufoForms\.map/u],
      ], errors);
      requireTest('pet-combat-runtime-design-tests', tests, errors);
    },
    P1D(errors, tests) {
      const behaviors = ['Tiger', 'Phoenix', 'Rabbit', 'Mouse'].map((name) => (
        `src/systems/pet-behaviors/${name}PetBehavior.ts`
      ));
      requireFiles(behaviors, errors);
      behaviors.forEach((file) => requireMatches(file, [
        ['movement permission hook', /canMove\s*\(/u],
        ['basic attack fallback hook', /basicAttack\s*\(/u],
        ['damage reaction hook', /onDamaged\s*\(/u],
        ['animation event hook', /onAnimationEvent\s*\(/u],
      ], errors));
      requireMatches('src/systems/pet-behaviors/createDefaultPetBehaviorRegistry.ts', [
        ['35-form registry declaration', /EXPECTED_PET_BEHAVIOR_KEYS|expectedPetBehaviorKeys/u],
        ['tiger registrations', /tigerForms\.map/u],
        ['phoenix registrations', /phoenixForms\.map/u],
        ['rabbit registrations', /rabbitForms\.map/u],
        ['mouse registrations', /mouseForms\.map/u],
      ], errors);
      requireTest('pet-combat-runtime-design-tests', tests, errors);
    },
    P2(errors, tests) {
      for (const consumer of petTestConsumers) {
        requireMatches(consumer, [['PetCombatRuntime entry', /PetCombatRuntime\b/u]], errors);
        forbidMatches(consumer, [
          ['direct concrete pet skill request', /requestPet[A-Z][A-Za-z0-9]*Skill\b/u],
          ['species/form dispatch', /(?:species|form)\s*(?:===|switch\s*\()/u],
        ], errors);
      }
      requireTest('pet-combat-runtime-design-tests', tests, errors);
    },
    P3(errors, tests) {
      requireMatches(
        'src/scenes/HeroPartyRuntimeBridge.ts',
        [['formal PetCombatRuntime integration', /PetCombatRuntime\b/u]],
        errors,
      );
      forbidAcross([
        'src/scenes/FormalPetMonkeyBodyBridge.ts',
        'src/scenes/FormalPetHorseBodyBridge.ts',
      ], [['legacy PetRuntimeSystem dependency', /PetRuntimeSystem/u]], errors);
      requireTest('pet-combat-runtime-design-tests', tests, errors);
      requireTest('formal-pet-tests', tests, errors);
      requireTest('formal-pet-journey-tests', tests, errors);
    },
    P4(errors, tests) {
      forbidAcross(
        walk('src/scenes').filter((file) => file.endsWith('.ts')),
        [['Scene direct concrete pet skill request', /requestPet[A-Z][A-Za-z0-9]*Skill\b/u]],
        errors,
      );
      forbidMatches(
        'src/systems/PetSystem.ts',
        [['barrel concrete pet skill export', /export[^\n]*requestPet[A-Z][A-Za-z0-9]*Skill/u]],
        errors,
      );
      if (existsSync(absolute('src/systems/PetRuntimeSystem.ts'))) {
        errors.push('legacy runtime file must be removed after migration: src/systems/PetRuntimeSystem.ts');
      }
      requireTest('pet-combat-runtime-design-tests', tests, errors);
    },
  },
  hero: {
    H1(errors, tests) {
      const base = 'src/systems/hero-runtime/HeroRuntime.ts';
      const factory = 'src/systems/hero-runtime/HeroRuntimeFactory.ts';
      const concrete = [1, 2, 3, 4, 5].map((id) => `src/systems/hero-runtime/Hero${id}Runtime.ts`);
      requireFiles([base, factory, ...concrete], errors);
      requireMatches(base, [['exported abstract HeroRuntime class', /export\s+abstract\s+class\s+HeroRuntime\b/u]], errors);
      requireMatches(factory, [['exported HeroRuntimeFactory class', /export\s+class\s+HeroRuntimeFactory\b/u]], errors);
      concrete.forEach((file, index) => requireMatches(
        file,
        [[`Hero${index + 1}Runtime inheritance`, new RegExp(`export\\s+class\\s+Hero${index + 1}Runtime\\s+extends\\s+HeroRuntime\\b`, 'u')]],
        errors,
      ));
      forbidAcross([base, factory, ...concrete], [['Phaser dependency', /from\s+['"]phaser['"]|Phaser\./u]], errors);
      requireTest('hero-runtime-design-tests', tests, errors);
    },
    H2(errors, tests) {
      const party = 'src/systems/HeroPartyRuntimeSystem.ts';
      requireMatches(party, [
        ['HeroRuntimeFactory dependency', /HeroRuntimeFactory\b/u],
        ['HeroRuntime dependency', /HeroRuntime\b/u],
      ], errors);
      forbidMatches(party, [
        ['Hero1 concrete skill dependency', /Role1ShadowFormalRuntimeSystem|updateFormalRole1ShadowRuntime/u],
        ['Hero5 concrete attack dependency', /Role5NormalAttackProjectileSystem|Role5LoongSword/u],
      ], errors);
      requireTest('hero-runtime-design-tests', tests, errors);
    },
    H3(errors, tests) {
      requireMatches(
        'src/systems/HeroPartyRuntimeSystem.ts',
        [['HeroRuntime member collection', /(?:members\s*:\s*(?:Array<)?HeroRuntime|HeroRuntime\[\])/u]],
        errors,
      );
      forbidAcross(formalHeroConsumers, [
        ['formal consumer concrete hero-system dependency', /from\s+['"][^'"]*Role[1-5][^'"]*System['"]/u],
      ], errors);
      requireTest('hero-runtime-design-tests', tests, errors);
      requireTest('hero-party-runtime-tests', tests, errors);
    },
    H4(errors, tests) {
      const pipeline = 'src/scenes/test-scene/TestSceneHeroSkillPipeline.ts';
      if (existsSync(absolute(pipeline))) {
        forbidMatches(pipeline, [
          ['five-way role skill pipeline', /updateRole[1-5]SkillBridge\b/u],
        ], errors);
      }
      forbidAcross(
        walk('src/scenes').filter((file) => file.endsWith('.ts')),
        [['Scene concrete role skill update', /updateRole[1-5]SkillBridge\b/u]],
        errors,
      );
      forbidMatches('src/systems/HeroSkillSystem.ts', [['roleRuntimes compatibility bundle', /\broleRuntimes\b/u]], errors);
      if (existsSync(absolute('src/systems/HeroSkillRuntimeAccessors.ts'))) {
        errors.push('legacy accessor file must be removed after migration: src/systems/HeroSkillRuntimeAccessors.ts');
      }
      requireTest('hero-runtime-design-tests', tests, errors);
      requireTest('hero-party-runtime-tests', tests, errors);
    },
  },
};

function selfTest() {
  const errors = [];
  const source = 'export class Sample { static create() {} }';
  if (!/export\s+class\s+Sample/u.test(source)) errors.push('positive pattern did not match');
  if (/export\s+function\s+Sample/u.test(source)) errors.push('negative pattern produced a false positive');
  const duplicate = new Set(['one', 'one', 'two']);
  if (duplicate.size !== 2) errors.push('test de-duplication failed');
  if (errors.length > 0) {
    console.error('System design gate self-test failed:');
    errors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
  }
  console.log('System design gate self-test passed.');
}

const [system, requestedGate = 'all'] = process.argv.slice(2);

if (system === '--self-test') {
  selfTest();
  process.exit(0);
}

if (!system || !contracts[system]) {
  console.error('Usage: node tools/check-system-design.mjs <level|pet|hero> <gate|all>');
  process.exit(2);
}

const availableGates = Object.keys(contracts[system]);
const selectedGates = requestedGate === 'all' ? availableGates : [requestedGate];
if (selectedGates.some((gate) => !contracts[system][gate])) {
  console.error(`Unknown ${system} gate: ${requestedGate}. Available: ${availableGates.join(', ')}, all`);
  process.exit(2);
}

const errors = [];
const tests = new Set();
for (const gate of selectedGates) contracts[system][gate](errors, tests);

const uniqueErrors = [...new Set(errors)];
if (uniqueErrors.length > 0) {
  console.error(`System design check failed for ${system}/${requestedGate}:`);
  for (const error of uniqueErrors) console.error(`  - ${error}`);
  process.exit(1);
}

if (tests.size > 0) {
  try {
    execFileSync(process.execPath, ['tools/run-system-tests.mjs', ...tests], {
      cwd: root,
      stdio: 'inherit',
    });
  } catch {
    console.error(`System design behavior tests failed for ${system}/${requestedGate}.`);
    process.exit(1);
  }
}

console.log(`System design check passed for ${system}/${requestedGate}: ${selectedGates.join(', ')}.`);
