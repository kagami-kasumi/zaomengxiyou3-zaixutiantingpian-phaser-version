/** TASK-SLICE-249 input preflight. Production observations, not a native oracle. */
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
const outfile = path.join(root, '.tmp/monster3-input-preflight.mjs');
await build({ stdin: { contents: `
export { createMonster3, updateMonster3 } from './src/systems/Monster3System';
export { createStage1CombatEnemy, updateStage1Enemy } from './src/systems/Stage1CombatSystem';
`, resolveDir: root, loader: 'ts' }, bundle: true, platform: 'node', format: 'esm', outfile, logLevel: 'silent' });
const api = await import(pathToFileURL(outfile).href);
const rows = [];
for (const slot of ['p1', 'p2']) {
  for (const [name, x, y] of [['boundary', 200, 0], ['vertical-distance', 150, 150]]) {
    const monster = api.createMonster3(0, 0);
    monster.skill1CooldownMs = 0;
    api.updateMonster3(monster, [{ slot, x, y }], 1000 / 30, () => 1);
    assert.equal(monster.state, 'hit2');
    assert(Math.hypot(x, y) >= 200);
    rows.push({ owner: 'boss', slot, name, x, y, observed: monster.state,
      sourcePredicateStaticOnly: Math.hypot(x, y) < 200 });
  }
  const monster = api.createMonster3(0, 0);
  monster.state = 'hit1'; monster.stateTimerMs = 1000;
  const cooldown = monster.skill1CooldownMs;
  api.updateMonster3(monster, [{ slot, x: 100, y: 0 }], 1000 / 30);
  assert.equal(monster.skill1CooldownMs, cooldown);
  rows.push({ owner: 'boss', slot, name: 'attacking-cooldown', before: cooldown,
    after: monster.skill1CooldownMs, limitation: 'Source countCD runtime phase still needs native evidence.' });
  const enemy = api.createStage1CombatEnemy({ id: `probe-${slot}`, enemyType: 3, x: 0, y: 0 });
  for (let i = 0; i < 2000 && enemy.attackSerial < 2; i++) {
    api.updateStage1Enemy({ enemy, targets: [{ slot, x: 100, alive: true }], deltaMs: 1000 / 30 });
  }
  assert.equal(enemy.attackSerial, 2);
  assert.equal(enemy.activeAttack?.actionName, 'hit1');
  rows.push({ owner: 'stage13', slot, name: 'second-attack', serial: enemy.attackSerial,
    damageAction: enemy.activeAttack.actionName, displayActionStaticMapping: 'hit2' });
}
const capture = readFileSync(path.join(root, 'tools/monster3-source/capture.py'), 'utf8');
assert(capture.includes('curAddEffect=new BaseAddEffect(this);setAction(action);'));
const extracted = capture.match(/names = \[(.*?)\]/s)?.[1];
assert(extracted && !extracted.includes('beforeSkill1Start') && !extracted.includes('releSkill1'));
const view = readFileSync(path.join(root, 'src/scenes/stage13/Stage13MonsterVisualBridge.ts'), 'utf8');
assert(view.includes("combat.attackSerial % 2 === 0 ? 'hit2' : 'hit1'"));
const directory = path.join(root, 'docs/tasks/evidence/TASK-SLICE-249');
mkdirSync(directory, { recursive: true });
writeFileSync(path.join(directory, 'input-preflight.json'), JSON.stringify({
  status: 'natural-selection-input-gap-confirmed-not-game-acceptance', rows,
  limitation: 'Production systems invoked with controlled state. Source distance predicate is static evidence; no native AI/HP or formal Scene acceptance is claimed.',
}, null, 2) + '\n');
console.log(`249 preflight: ${rows.length} production observations; natural decision oracle remains missing.`);
