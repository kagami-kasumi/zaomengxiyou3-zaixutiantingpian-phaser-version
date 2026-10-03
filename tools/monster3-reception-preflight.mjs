/** 249 bounded production diagnostic; not an original-game HP oracle. */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
const outfile = path.join(root, '.tmp/monster3-reception-preflight.mjs');
await build({ stdin: { contents: `
export { createStage1CombatEnemy, createStage1CombatPlayer, createStage1CombatRuntime,
  resolveStage1EnemyAttack } from './src/systems/Stage1CombatSystem';
`, resolveDir: root, loader: 'ts' }, bundle: true, platform: 'node', format: 'esm', outfile, logLevel: 'silent' });
const api = await import(pathToFileURL(outfile).href);
const rows = [];
function fixture(slot, action = 'hit1') {
  const player = api.createStage1CombatPlayer(slot);
  const enemy = api.createStage1CombatEnemy({ id: 'reception-probe', enemyType: 3, x: 0, y: 0 });
  enemy.phase = 'active';
  enemy.activeAttack = { attackId: `reception-${slot}-${action}`, actionName: action,
    attackKind: action === 'hit1' ? 'physics' : 'magic', damage: action === 'hit1' ? 40 : 18, attackRange: 150 };
  return { enemy, player, runtime: api.createStage1CombatRuntime() };
}
function receive(f, timeMs) {
  return api.resolveStage1EnemyAttack({ runtime: f.runtime, enemy: f.enemy,
    players: [{ player: f.player, x: 0, y: 0 }], timeMs });
}
for (const slot of ['p1', 'p2']) {
  for (const [name, field, action, value] of [
    ['evasion-input', 'missPercent', 'hit1', 1],
    ['magic-defense-input', 'magicDefensePercent', 'hit2', 0.75],
  ]) {
    const normal = fixture(slot, action), changed = fixture(slot, action);
    changed.player.effectiveStats[field] = value;
    const originalRandom = Math.random;
    let randomCalls = 0;
    Math.random = () => { randomCalls++; return 0; };
    try { receive(normal, 0); receive(changed, 0); } finally { Math.random = originalRandom; }
    assert.equal(changed.player.combat.hp, normal.player.combat.hp);
    assert.equal(randomCalls, 0);
    rows.push({ slot, name, field, value, normalHp: normal.player.combat.hp,
      changedHp: changed.player.combat.hp, randomCalls });
  }
  const f = fixture(slot);
  const initialHp = f.player.combat.hp;
  f.player.combat.invulnerableUntilMs = 10;
  assert.equal(receive(f, 0).length, 0);
  assert.equal(f.runtime.hitRegistry.resolvedHitIds.size, 1);
  assert.equal(receive(f, 11).length, 0);
  assert.equal(f.player.combat.hp, initialHp);
  f.enemy.activeAttack = { ...f.enemy.activeAttack, attackId: 'fresh-after-protection' };
  assert.equal(receive(f, 11).length, 1);
  assert(f.player.combat.hp < initialHp);
  rows.push({ slot, name: 'rejected-hit-registered', initialHp, sameAttackRetryHp: initialHp,
    freshAttackHp: f.player.combat.hp, rejectedAttemptRegistered: true });
}
const out = path.join(root, 'docs/tasks/evidence/TASK-SLICE-249');
mkdirSync(out, { recursive: true });
writeFileSync(path.join(out, 'reception-preflight.json'), JSON.stringify({
  status: 'production-reception-gap-confirmed', rows,
  limitations: ['Controlled existing Stage1CombatSystem inputs, not natural selection or a Scene journey.',
    'No original HP expected generated here. Source reception must be verified separately.',
    'TestScene and pet paths are static call-chain findings, not dynamic observations in this probe.'],
}, null, 2) + '\n');
console.log(`249 reception preflight: ${rows.length} controlled production observations; no native/Scene acceptance claimed.`);
