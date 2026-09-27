/** 239 actual candidate-producer audit. No repaired AI/XP acceptance claim. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHeroPartyRuntimeModel, snapshotHeroParty, destroyHeroPartyRuntime } from '../src/systems/HeroPartyRuntimeSystem';
import { isHeroCombatDead } from '../src/systems/HeroCombatSystem';
const ts = createRequire(import.meta.url)('typescript');
const sources: { path: string; sha256: string; locator: string }[] = [];
function parse(path: string) {
  const text = readFileSync(path, 'utf8');
  return { tree: ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true), text };
}
function expression(path: string) {
  const { tree, text } = parse(path), found: string[] = [];
  function visit(n: any) {
    if (ts.isPropertyAssignment(n) && n.name.getText(tree) === 'targets'
        && n.initializer.getText(tree) === 'heroes.snapshots()') found.push(n.initializer.getText(tree));
    ts.forEachChild(n, visit);
  }
  visit(tree); assert.equal(found.length, 1, path);
  sources.push({ path, sha256: createHash('sha256').update(text).digest('hex'), locator: 'targets: heroes.snapshots()' });
  return new Function('heroes', `return ${found[0]};`) as (heroes: any) => any;
}
const formal = Object.fromEntries([
  [12, 'src/scenes/MonsterRuntimeRegistryBridge.ts'],
  [13, 'src/scenes/stage13/Stage13GameplayBridge.ts'],
  [21, 'src/scenes/stage21/Stage21GameplayBridge.ts'],
  [22, 'src/scenes/stage22/Stage22GameplayBridge.ts'],
].map(([level, path]) => [level, expression(path as string)]));
const sandboxPath = 'src/scenes/TestScene.ts';
const { tree, text } = parse(sandboxPath); let method: any;
function find(n: any) {
  if (ts.isMethodDeclaration(n) && n.name.getText(tree) === 'getMonsterTargets') method = n;
  ts.forEachChild(n, find);
}
find(tree); assert(method);
const sandbox = new Function('isHeroCombatDead', ts.transpileModule('return function() '+method.body.getText(tree),
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText)(isHeroCombatDead);
sources.push({ path: sandboxPath, sha256: createHash('sha256').update(text).digest('hex'), locator: 'getMonsterTargets' });
const rows: any[] = [];
for (const level of [11, 12, 13, 21, 22, 'sandbox'] as const)
for (const heroId of [1, 2, 3, 4, 5] as const)
for (const reversed of [false, true])
for (const deadSlot of ['none', 'p1', 'p2', 'both']) {
  const definitions = [{ slot: 'p1' as const, heroId, x: 20, y: 150, width: 48 },
    { slot: 'p2' as const, heroId, x: 100, y: 50, width: 48 }];
  if (reversed) definitions.reverse();
  const party = createHeroPartyRuntimeModel(definitions);
  for (const member of party.members) if (deadSlot === 'both' || member.combat.slot === deadSlot) {
    member.combat.combat.hp = 0; member.combat.combat.state = 'dead';
  }
  const heroes = { snapshots: () => snapshotHeroParty(party) };
  const playerViews = party.members.map(member => ({ slot: member.combat.slot, movement: member.movement,
    combat: member.combat.combat, sprite: { x: member.movement.x, y: member.movement.y } }));
  const result = level === 11 || level === 'sandbox' ? sandbox.call({ playerViews }) : formal[level]!(heroes);
  const expected = definitions.filter(d => level !== 11 && level !== 'sandbox' || (deadSlot !== d.slot && deadSlot !== 'both'));
  assert.deepEqual(result.map((r: any) => r.slot), expected.map(d => d.slot));
  for (const r of result) {
    const d = definitions.find(d => d.slot === r.slot)!;
    assert.equal(r.x, d.x); assert.equal(r.y, d.y, 'current output y is foot, not original hero root');
    if (level !== 11 && level !== 'sandbox') assert.equal(r.alive, deadSlot !== r.slot && deadSlot !== 'both');
  }
  // Actual snapshots retain caller member order; the future adapter must explicitly
  // use P1/P2 original Config order, never assume arbitrary member order is native.
  rows.push({ level, heroId, reversed, deadSlot, outputs: result.map((r: any) => ({ slot:r.slot,x:r.x,y:r.y,alive:r.alive })) });
  destroyHeroPartyRuntime(party); assert.deepEqual(snapshotHeroParty(party), []);
}
mkdirSync('docs/tasks/evidence/TASK-SETTINGS-239', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SETTINGS-239/consumer-inputs.json', JSON.stringify({
  status: 'passed-input-audit-not-modern-acceptance', cases: rows.length, sources, rows,
  findings: ['Four formal adapters forward actual HeroParty snapshots including dead entries and foot y.',
    'TestScene method filters dead but reads marker foot coordinates; canonical movement is available on the same player member.',
    'All input order follows member/view order; native adapter must choose hero1 then hero2 by slot.',
    'Root conversion must use existing ObjectBaseSprite height100 / BaseObject.getBottom; exclude BBDC visual offsets.',
    'This executes production expressions/method with actual HeroParty models, not full Phaser scene playback or XP settlement.'],
}, null, 2)+'\n');
console.log(`239 candidate producer audit: ${rows.length} actual model/projection cases`);
