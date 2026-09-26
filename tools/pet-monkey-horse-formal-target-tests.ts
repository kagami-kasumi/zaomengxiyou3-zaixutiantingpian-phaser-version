/** Actual scene projection expressions and native ordered-first/dead-first contract. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createMonsterRuntimeRegistryModel, spawnMonsters, getMonsterCombatTargets, removeMonster } from '../src/systems/MonsterRuntimeRegistrySystem';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { bodyGroundFixture } from './pet226-body/ground-fixture';
const ts = createRequire(import.meta.url)('typescript');
function expression(file: string, property: string, contains: string): string {
  const text = readFileSync(file, 'utf8'), tree = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const found: string[] = [];
  const visit = (n: any) => {
    if (ts.isPropertyAssignment(n) && n.name.getText(tree) === property && n.initializer.getText(tree).includes(contains)) found.push(n.initializer.getText(tree));
    ts.forEachChild(n, visit);
  }; visit(tree); assert.equal(found.length, 1, `${file}/${property} unique real consumer`); return found[0]!;
}
function compile(args: string[], body: string): (...args: any[]) => any {
  return new Function(...args, ts.transpileModule(body, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText) as any;
}
const partyProjection = compile(['frame'], 'return ' + expression('src/scenes/HeroPartyRuntimeBridge.ts', 'targets', 'frame.monsterTargets'));
const levelProjection = Object.fromEntries([12, 13, 21, 22].map(level => [level, compile(['monsters'], 'return ' +
  expression(`src/scenes/stage${level}/Stage${level}GameplayBridge.ts`, 'monsterTargets', 'monsters'))]));
const viewFile = 'src/scenes/test-scene/TestScenePetViewBridge.ts';
const viewText = readFileSync(viewFile, 'utf8'), viewTree = ts.createSourceFile(viewFile, viewText, ts.ScriptTarget.Latest, true);
const targetFunction = viewTree.statements.find((n: any) => ts.isFunctionDeclaration(n) && n.name.text === 'createPetSkillTargets');
assert(targetFunction);
const sandboxProjection = compile([], targetFunction.getText(viewTree).replace('export ', '') + '; return createPetSkillTargets;')();
const original = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SETTINGS-227/source-trace.json', 'utf8'));
let cases = 0;
for (const level of [11, 12, 13, 21, 22, 'sandbox'] as const)
for (const family of ['monkey', 'horse'] as const) for (const form of [1, 2, 3, 4] as const) for (const fps of [20, 24, 30]) {
  const model = createMonsterRuntimeRegistryModel();
  // Deliberately non-distance and non-lexical creation order. This tests the
  // adapter's preservation of a source creation stream, not level spawn timings.
  const commands = ['z-first', 'a-nearest', 'm-last'].map((id, i) => ({
    encounterId: 'source-array', spawnId: id, monsterDefinitionId: 5 as const, x: 300 + [100, 10, 200][i]!, y: 250 }));
  spawnMonsters(model, commands);
  const enemies = getMonsterCombatTargets(model);
  enemies[0]!.phase = 'dead'; enemies[0]!.hp = 0;
  const project = () => {
    if (level === 11 || level === 'sandbox') return sandboxProjection.call({ monster30s: getMonsterCombatTargets(model).map(e => ({ ...e, state: e.phase })) });
    const container = level === 12 ? { combatTargets: () => getMonsterCombatTargets(model) }
      : new Map([...model.monsters].map(([id, value]) => [id, { combat: value.combat }]));
    return partyProjection({ monsterTargets: levelProjection[level]!(container) });
  };
  assert.deepEqual(project().map((t: any) => t.id), commands.map(c => c.spawnId));
  assert.equal(project()[0].isAlive, false, 'dead entries remain available to original search');
  const roster = createSeedPetRoster(); roster.pets.forEach(p => { p.isActive = p.species === family && p.form === form; if (p.isActive) p.skills = []; });
  const runtime = new PetCombatRuntime();
  const frame = { roster, owner: { x: 300, y: 350, facingX: 1 as const },
    groundEnvironment: bodyGroundFixture(family, form, 250), hostFps: fps, random: () => 1 };
  runtime.update({ ...frame, targets: [], deltaMs: 0 });
  runtime.update({ ...frame, targets: project(), deltaMs: 1000 / fps });
  const acquire = original.cases.find((c: any) => c.id === `${family}${form}:acquire-dead-first`);
  assert.equal(runtime.snapshot().target?.id, 'z-first');
  assert.equal(runtime.snapshot().target!.x - 300, acquire.target.x);
  runtime.update({ ...frame, targets: project(), deltaMs: 1000 / fps });
  assert.equal(runtime.snapshot().target, undefined, 'clear without same-step reacquisition');
  removeMonster(model, 'z-first');
  spawnMonsters(model, [{ ...commands[0]!, spawnId: 'b-new' }]);
  assert.deepEqual(project().map((t: any) => t.id), ['a-nearest', 'm-last', 'b-new']);
  runtime.update({ ...frame, targets: project(), deltaMs: 1000 / fps });
  assert.equal(runtime.snapshot().target?.id, 'a-nearest');
  runtime.destroy(); cases++;
}
assert.equal(cases, 144);
console.log(`${cases} five-stage/sandbox actual target projections preserve creation/removal order and original dead-first/next-step-clear through real family Runtime; level spawn schedules excluded.`);
