import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { build } from 'esbuild';

const output = 'docs/tasks/evidence/TASK-SLICE-260B/mutations';
mkdirSync(output, { recursive: true });

const suites = {
  phase: 'monster2-attack-phase-tests',
  selection: 'monster2-selection-tests',
  world: 'monster2-combat-world-tests',
  body: 'monster2-body-contract-tests',
  roster: 'monster2-gather-roster-tests',
  collision: 'monster2-collision-tests',
  reception: 'monster2-reception-contract-tests',
  partyReception: 'monster2-party-reception-tests',
};
const mutations = [
  {
    name: 'hit1-first-emission-5-to-6', suite: 'phase', file: 'src/systems/Stage12MonsterVisualSystem.ts',
    replacements: [[
      "model.enemyType === 2 && model.action === 'hit1' && model.actionTick === 5",
      "model.enemyType === 2 && model.action === 'hit1' && model.actionTick === 6",
    ]],
  },
  {
    name: 'omit-hit1-second-bullet', suite: 'phase', file: 'src/systems/Stage12MonsterVisualSystem.ts',
    replacements: [[
      "return [event('monster2Hit1End', side(90), -35, model.facingX)];",
      "return []; // mutant: omit Monster2 second bullet",
    ]],
  },
  {
    name: 'hit1-second-bullet-release-at-6', suite: 'phase', file: 'src/systems/Monster2AttackRuntime.ts',
    replacements: [[
      'attack.attack === 1 ? 14 : 20',
      'attack.attack === 1 ? 14 : 6',
    ]],
  },
  {
    name: 'gather-y-minus-40', suite: 'phase', file: 'src/systems/Monster2AttackRuntime.ts',
    replacements: [['gather({ x: host.x, y: host.y - 50 });', 'gather({ x: host.x, y: host.y - 40 });']],
  },
  {
    name: 'raw-exit-no-release', suite: 'phase', file: 'src/systems/Monster2RawDisplay.ts',
    replacements: [['if (raw.frame === 14) destroyMonster2RawDisplay(raw);', 'if (false) destroyMonster2RawDisplay(raw);']],
  },
  {
    name: 'monster2-reset-cd-5-to-4', suite: 'selection', file: 'src/systems/Monster2Selection.ts',
    replacements: [['resetCooldown: 5', 'resetCooldown: 4']],
  },
  {
    name: 'body-after-effects', suite: 'phase', file: 'src/systems/Monster2WorldStep.ts',
    replacements: [[
      `    const previousAction = runtime.body.action;
    stepMonster2AttackBody(runtime, host, stopped, source, tickTime, selection.hostFps, params.difficulty, params.emitRaw, params.gather);
    if (host.state === previousAction && (previousAction === 'hit1' || previousAction === 'hit2' || previousAction === 'hurt')
      && runtime.body.action === 'wait') host.state = 'wait';`,
      '',
    ], [
      '    stepMonster2Selection(selection, host, params.readDecisionTarget(),',
      `    const previousAction = runtime.body.action;
    stepMonster2AttackBody(runtime, host, false, source, tickTime, selection.hostFps, params.difficulty, params.emitRaw, params.gather);
    if (host.state === previousAction && (previousAction === 'hit1' || previousAction === 'hit2' || previousAction === 'hurt')
      && runtime.body.action === 'wait') host.state = 'wait';
    stepMonster2Selection(selection, host, params.readDecisionTarget(),`,
    ]],
  },
  {
    name: 'hit2-emits-hit1-damage-object', suite: 'body', file: 'src/systems/Stage12MonsterVisualSystem.ts',
    replacements: [[
      "return [event('monster2Hit2', side(35), -80, model.facingX)];",
      "return [event('monster2Hit1Start', side(35), -80, model.facingX)];",
    ]],
  },
  {
    name: 'collision-pixel-query-always-true', suite: 'collision', file: 'src/systems/Monster2CollisionSystem.ts',
    replacements: [['return query.sample(`a${attack}-f${frame}-s${scaleSign}`, sourceRoot, profileId, targetRoot, inspectPixel);', 'return true;']],
  },
  {
    name: 'ignore-hurt-cut-effect', suite: 'body', file: 'src/systems/Monster2AttackRuntime.ts',
    replacements: [['&& !(sourceHurt && attack.hurtCanCutDownEffect)', '&& true']],
  },
  {
    name: 'death-retains-monster-hit-history', suite: 'reception', file: 'src/systems/HeroCombatSystem.ts',
    replacements: [['    if (hero.monsterHitIds) hero.monsterHitIds.length = 0;\n    hero.clearPetBuffs?.();', '    hero.clearPetBuffs?.();']],
  },
  {
    name: 'door-ignores-is-boss', suite: 'roster', file: 'src/systems/Stage12FlowSystem.ts',
    replacements: [['if (isBoss && !monsters.some(enemy => enemy.enemyType === 4 && enemy.hp > 0)) {', 'if (!monsters.some(enemy => enemy.enemyType === 4 && enemy.hp > 0)) {']],
  },
  {
    name: 'door-ignores-living-monster4', suite: 'roster', file: 'src/systems/Stage12FlowSystem.ts',
    replacements: [['if (isBoss && !monsters.some(enemy => enemy.enemyType === 4 && enemy.hp > 0)) {', 'if (isBoss) {']],
  },
  {
    name: 'late-death-waits-for-attacks', suite: 'world', file: 'src/systems/Monster2AttackRuntime.ts',
    replacements: [['if (runtime.body.action === \'dead\' && runtime.body.completed)', 'if (runtime.body.action === \'dead\' && runtime.body.completed && runtime.attacks.length === 0)']],
  },
  {
    name: 'party-old-owner-continues-reception', suite: 'partyReception', file: 'src/scenes/HeroPartyMonsterReception.ts',
    replacements: [['const valid = !destroyed() && readPet(slot) === pet && (sessionTarget\n            ? current?.runtimeKey === key : current === compatibility);', 'const valid = !destroyed();']],
  },
];

function runNode(file, logPath) {
  const run = spawnSync(process.execPath, [file], { encoding: 'utf8', timeout: 120000 });
  writeFileSync(logPath, `${run.stdout ?? ''}${run.stderr ?? ''}`);
  return run;
}

async function bundle(name, entry, mutate) {
  const outfile = path.resolve('.tmp', `monster2-production-${name}.mjs`);
  const plugin = {
    name: `monster2-isolated-${name}`,
    setup(api) {
      api.onLoad({ filter: /\.ts$/ }, args => {
        if (!mutate || path.resolve(args.path) !== path.resolve(mutate.file)) return;
        let source = readFileSync(args.path, 'utf8').replaceAll('\r\n', '\n');
        for (const [before, after] of mutate.replacements) {
          assert(source.includes(before), `${name}: mutation target absent`);
          source = source.replace(before, after);
        }
        return { contents: source, loader: 'ts' };
      });
    },
  };
  await build({ entryPoints: [`tools/${entry}.ts`], bundle: true, platform: 'node', format: 'esm', outfile,
    logLevel: 'silent', plugins: mutate ? [plugin] : [] });
  return outfile;
}

const baseline = [];
for (const [name, entry] of Object.entries(suites)) {
  const outfile = await bundle(`baseline-${name}`, entry, undefined);
  const run = runNode(outfile, `${output}/baseline-${name}.log`);
  assert.equal(run.status, 0, `baseline ${name} must pass`);
  baseline.push({ name, suite: entry, status: 'passed' });
}

const results = [];
for (const mutation of mutations) {
  const outfile = await bundle(mutation.name, suites[mutation.suite], mutation);
  const run = runNode(outfile, `${output}/${mutation.name}.log`);
  assert.notEqual(run.status, 0, `${mutation.name}: mutant survived`);
  const behavioralRejection = /AssertionError/.test(run.stderr ?? '')
    || /Monster2 reception contract mismatches:/.test(run.stderr ?? '');
  assert(behavioralRejection, `${mutation.name}: rejection must be a recognized contract failure`);
  results.push({ name: mutation.name, suite: mutation.suite, status: 'rejected', semantic: true });
}

writeFileSync(`${output}/report.json`, JSON.stringify({
  status: 'passed', baseline, results,
  note: 'Compiler failures are not semantic rejection; every listed mutant compiled and was rejected by a recognized behavioral contract failure (AssertionError or the reception contract mismatch error).',
}, null, 2) + '\n');
console.log(`Monster2 production mutations: ${baseline.length} baselines passed; ${results.length} compiled mutants rejected.`);
