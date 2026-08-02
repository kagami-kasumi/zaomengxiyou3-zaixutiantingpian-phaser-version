import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];

const legacyScenes = new Set([]);
const legacyWorldBridges = new Set([
  'src/scenes/stage12/Stage12WorldBridge.ts',
  'src/scenes/stage13/Stage13WorldBridge.ts',
  'src/scenes/stage21/Stage21WorldBridge.ts',
  'src/scenes/stage22/Stage22WorldBridge.ts',
]);
const legacyGameplayBridges = new Set([
  'src/scenes/stage12/Stage12GameplayBridge.ts',
  'src/scenes/stage13/Stage13GameplayBridge.ts',
  'src/scenes/stage21/Stage21GameplayBridge.ts',
  'src/scenes/stage22/Stage22GameplayBridge.ts',
]);
const legacyFlowSystems = new Set([
  'src/systems/Stage11FlowSystem.ts',
  'src/systems/Stage12FlowSystem.ts',
  'src/systems/Stage13FlowSystem.ts',
  'src/systems/Stage21FlowSystem.ts',
  'src/systems/Stage22FlowSystem.ts',
]);
const legacyEntityOwnerBudgets = new Map([
  ['src/scenes/stage12/Stage12GameplayBridge.ts', new Map([
    ['type PlayerRuntime', 1], ['type EnemyRuntime', 1], ['new Map<string, EnemyRuntime>', 1],
    ['updateLevelHeroMovementRuntime', 2], ['updateStage1CombatPlayer', 2], ['updateStage1Enemy', 2],
    ['resolveStage1EnemyAttack', 2], ['resolveStage1HeroAttack', 2],
  ])],
  ['src/scenes/stage13/Stage13GameplayBridge.ts', new Map([
    ['type PlayerRuntime', 1], ['type MonsterRuntime', 1], ['new Map<string, MonsterRuntime>', 1],
    ['updateLevelHeroMovementRuntime', 2], ['updateStage1CombatPlayer', 2], ['updateStage1Enemy', 2],
    ['resolveStage1EnemyAttack', 2], ['resolveStage1HeroAttack', 2],
  ])],
  ['src/scenes/stage21/Stage21GameplayBridge.ts', new Map([
    ['type PlayerRuntime', 1], ['type MonsterRuntime', 1], ['new Map<string, MonsterRuntime>', 1],
    ['updateLevelHeroMovementRuntime', 2], ['updateStage1CombatPlayer', 2], ['updateStage1Enemy', 2],
    ['resolveStage1EnemyAttack', 2], ['resolveStage1HeroAttack', 2],
  ])],
  ['src/scenes/stage22/Stage22GameplayBridge.ts', new Map([
    ['type PlayerRuntime', 1], ['type MonsterRuntime', 1], ['new Map<string, MonsterRuntime>', 1],
    ['updateLevelHeroMovementRuntime', 2], ['updateStage1CombatPlayer', 2], ['updateStage1Enemy', 2],
    ['resolveStage1EnemyAttack', 2], ['resolveStage1HeroAttack', 2],
  ])],
  ['src/scenes/stage22/Stage22DevGameplayBridge.ts', new Map([
    ['updateLevelHeroMovementRuntime', 2],
  ])],
  ['src/scenes/TestScene.ts', new Map([
    ['private playerViews:', 1], ['private monster30s:', 1],
  ])],
]);

const entityOwnerTokens = [...new Set(
  [...legacyEntityOwnerBudgets.values()].flatMap((budget) => [...budget.keys()]),
)];

function normalize(file) {
  return file.split(path.sep).join('/');
}

function walk(relativeDir) {
  const absoluteDir = path.join(root, relativeDir);
  if (!existsSync(absoluteDir)) return [];
  return readdirSync(absoluteDir, { withFileTypes: true }).flatMap((entry) => {
    const relative = normalize(path.join(relativeDir, entry.name));
    return entry.isDirectory() ? walk(relative) : [relative];
  });
}

function classify(relativePath, source) {
  const findings = [];
  const name = path.posix.basename(relativePath);
  if (/^Stage\d+Scene\.ts$/.test(name) && !legacyScenes.has(relativePath)) {
    if (!source.includes('PlayableLevelRuntime')) {
      findings.push('new formal level Scene must consume PlayableLevelRuntime');
    }
    for (const forbidden of ['showLevelResult(', 'markLevelResultStarted(', '.setVisible(flow.doorVisible)']) {
      if (source.includes(forbidden)) findings.push(`new formal level Scene contains private runtime owner: ${forbidden}`);
    }
  }
  if (/^Stage\d+WorldBridge\.ts$/.test(name) && !legacyWorldBridges.has(relativePath)) {
    findings.push('new Stage*WorldBridge skeleton is forbidden; implement a narrow LevelWorldAdapter');
  }
  if (/^Stage\d+GameplayBridge\.ts$/.test(name) && !legacyGameplayBridges.has(relativePath)) {
    findings.push('new Stage*GameplayBridge skeleton is forbidden; compose PlayableLevelRuntime adapters');
  }
  if (/^Stage\d+FlowSystem\.ts$/.test(name) && !legacyFlowSystems.has(relativePath)) {
    findings.push('new Stage*FlowSystem skeleton is forbidden; implement LevelEncounter content');
  }
  if (/^Stage\d+ResultBridge\.ts$/.test(name)) {
    findings.push('private Stage*ResultBridge is forbidden; LevelResultView is the sole presenter');
  }
  if (/tryCompleteStage\d+/u.test(source)) {
    findings.push('private tryCompleteStage* lifecycle owner is forbidden');
  }
  const isLevelRuntimeFile = /^src\/scenes\/(?:stage\d+\/|TestScene|test-scene\/TestScene)/u.test(relativePath);
  if (isLevelRuntimeFile) {
    const budget = legacyEntityOwnerBudgets.get(relativePath);
    for (const token of entityOwnerTokens) {
      const count = source.split(token).length - 1;
      const allowed = budget?.get(token) ?? 0;
      if (count > allowed) {
        findings.push(`level adapter exceeds frozen entity-owner budget for ${token}: ${count} > ${allowed}`);
      }
    }
  }
  return findings;
}

function assertSelfTests() {
  const cases = [
    ['src/scenes/Stage23Scene.ts', "import type { PlayableLevelRuntime } from './runtime';", 0],
    ['src/scenes/Stage23Scene.ts', 'showLevelResult(scene, options);', 2],
    ['src/scenes/stage23/Stage23WorldBridge.ts', 'export function createWorld() {}', 1],
    ['src/scenes/stage23/Stage23GameplayBridge.ts', 'export function update() {}', 1],
    ['src/systems/Stage23FlowSystem.ts', 'export class Stage23Flow {}', 1],
    ['src/scenes/stage23/Stage23ResultBridge.ts', 'export function show() {}', 1],
    ['src/scenes/stage23/Stage23EncounterAdapter.ts', 'type PlayerRuntime = {};', 1],
    ['src/scenes/Stage12Scene.ts', "import type { PlayableLevelRuntime } from './PlayableLevelRuntime';", 0],
  ];
  for (const [file, source, expected] of cases) {
    const actual = classify(file, source).length;
    if (actual !== expected) errors.push(`architecture check self-test failed for ${file}: expected ${expected}, got ${actual}`);
  }
}

function assertContractDocument() {
  const relative = 'docs/architecture/playable-level-runtime.md';
  const absolute = path.join(root, relative);
  if (!existsSync(absolute)) {
    errors.push(`missing architecture contract: ${relative}`);
    return;
  }
  const source = readFileSync(absolute, 'utf8');
  const required = [
    'PlayableLevelRuntime',
    'LevelDefinition',
    'LevelWorldAdapter',
    'LevelEncounter',
    'TransferDoorVisualDefinition',
    'HeroPartyRuntime',
    'MonsterRuntimeRegistry',
    'Stage 1-1',
    'Stage 1-2',
    'Stage 1-3',
    'Stage 2-1',
    'Stage 2-2',
    'character 45/41/44',
    '逐状态基线',
    '迁移顺序',
    'V2A 实体运行时消费者矩阵',
    '每批最多一个实体 owner',
  ];
  for (const token of required) {
    if (!source.includes(token)) errors.push(`${relative} missing required contract token: ${token}`);
  }
}

function assertStage11Migration() {
  const scenePath = 'src/scenes/TestScene.ts';
  const sceneSource = readFileSync(path.join(root, scenePath), 'utf8');
  if (!sceneSource.includes('createTestSceneStage11Runtime')) {
    errors.push(`${scenePath} must delegate formal Stage 1-1 lifecycle to PlayableLevelRuntime`);
  }
  for (const forbidden of ['showLevelResult(', 'installFormalFeatureUiEntries(', 'Stage13AssetKeys.transferDoor']) {
    if (sceneSource.includes(forbidden)) errors.push(`${scenePath} retains private/common Stage 1-1 owner: ${forbidden}`);
  }
  const templatePath = 'docs/architecture/playable-level-template.md';
  if (!existsSync(path.join(root, templatePath))) {
    errors.push(`missing future playable-level template: ${templatePath}`);
  }
}

for (const legacy of [...legacyScenes, ...legacyWorldBridges, ...legacyGameplayBridges, ...legacyFlowSystems]) {
  if (!existsSync(path.join(root, legacy))) errors.push(`legacy exception must be removed from the checker after migration: ${legacy}`);
}

assertSelfTests();
assertContractDocument();
assertStage11Migration();

for (const relative of [...walk('src/scenes'), ...walk('src/systems')].filter((file) => file.endsWith('.ts'))) {
  const source = readFileSync(path.join(root, relative), 'utf8');
  for (const finding of classify(relative, source)) errors.push(`${relative}: ${finding}`);
}

if (errors.length > 0) {
  console.error('Playable level architecture check failed:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('Playable level architecture check passed (contract, self-tests, and incremental anti-backfill guard).');
