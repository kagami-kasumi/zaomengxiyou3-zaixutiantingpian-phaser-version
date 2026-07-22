import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { combatHudAssets } from '../src/assets/AssetManifest';
import {
  clearCombatHudBossRuntime,
  createCombatHudBossRuntime,
  createCombatHudPlayerSnapshot,
  createStage1CombatEnemyHudSnapshot,
  createStage1CombatPlayerHudSnapshot,
  updateCombatHudBossRuntime,
} from '../src/systems/Stage1CombatHudSystem';
import {
  createStage1CombatEnemy,
  createStage1CombatPlayer,
  awardStage1CombatPlayerExperience,
} from '../src/systems/Stage1CombatSystem';
import { ProgressionTuning } from '../src/systems/ProgressionSystem';

const repoRoot = process.cwd();

for (const asset of Object.values(combatHudAssets)) {
  assert.equal(asset.status, 'ready');
  assert.equal(asset.source, 'extracted-flash');
  assert.match(asset.sourcePackage, /\.swf$/);
  const svg = readFileSync(path.join(repoRoot, 'public', asset.path), 'utf8');
  assert.match(svg, /<svg\b/);
}

for (const relativePath of [
  'src/scenes/stage12/Stage12GameplayBridge.ts',
  'src/scenes/stage13/Stage13GameplayBridge.ts',
]) {
  const source = readFileSync(path.join(repoRoot, relativePath), 'utf8');
  assert.match(source, /createStage1CombatHudBridge\(/);
  assert.match(source, /hud\.update\(deltaMs\)/);
  assert.match(source, /hud\.destroy\(\)/);
}
const stage11Source = readFileSync(path.join(repoRoot, 'src/scenes/TestScene.ts'), 'utf8');
assert.match(stage11Source, /createTestSceneStage1HudBridge\(this\)/);
assert.match(stage11Source, /stage1CombatHud\?\.update\(delta\)/);
assert.match(stage11Source, /stage1CombatHud\?\.destroy\(\)/);

{
  const snapshot = createCombatHudPlayerSnapshot({
    slot: 'p1', hp: 40, maxHp: 80, mp: 0, maxMp: 0,
    level: 1, currentExp: 20, expToNext: 135, isMaxLevel: false,
    skillBindings: [
      { skillName: 'slot-y', level: 1 },
      { skillName: 'slot-l', level: 1 },
      { skillName: 'slot-u', level: 1 },
      null,
      { skillName: 'slot-o', level: 1 },
    ],
  });
  assert.equal(snapshot.hpRatio, 0.5);
  assert.equal(snapshot.mpRatio, 0);
  assert.deepEqual(snapshot.skillSlots.map((slot) => slot.displayKey), ['Y', 'U', 'I', 'O', 'L']);
  assert.deepEqual(snapshot.skillSlots.map((slot) => slot.binding?.skillName ?? null),
    ['slot-y', 'slot-u', null, 'slot-o', 'slot-l']);
}

{
  const p1 = createStage1CombatPlayer('p1');
  const p2 = createStage1CombatPlayer('p2');
  p2.combat.hp = 71;
  p1.combat.hp = 1;
  p1.mp = 1;
  const levelResult = awardStage1CombatPlayerExperience(p1, 140);
  p1.skill.loadout.slots[0] = { skillName: 'slz', level: 1 };
  p1.skill.activeAction = {
    skillName: 'slz', slotIndex: 0, actionName: 'hit3', projectileId: 1,
  };
  const p1Snapshot = createStage1CombatPlayerHudSnapshot(p1);
  const p2Snapshot = createStage1CombatPlayerHudSnapshot(p2);
  assert.equal(p1Snapshot.hp, 130);
  assert.equal(p2Snapshot.hp, 71);
  assert.equal(p1Snapshot.level, 2);
  assert.equal(levelResult.levelsGained, 1);
  assert.equal(p1.combat.hp, 130);
  assert.equal(p1.mp, 70);
  assert.equal(p2Snapshot.level, 1);
  assert.equal(p1Snapshot.skillSlots[0]?.binding?.skillName, 'slz');
  assert.equal(p1Snapshot.skillSlots[0]?.binding?.usableState, 'active');
  assert.equal(p2Snapshot.skillSlots[0]?.binding, null);
  assert.deepEqual(p2Snapshot.skillSlots.map((slot) => slot.displayKey), ['8', '4', '5', '6', '3']);
}

{
  const max = createCombatHudPlayerSnapshot({
    slot: 'p1', hp: 1, maxHp: 1, mp: 1, maxMp: 1,
    level: ProgressionTuning.maxLevel, currentExp: 10, expToNext: 20, isMaxLevel: true,
    skillBindings: [],
  });
  assert.equal(max.expText, 'MAX');
  assert.equal(max.expRatio, 1);
}

{
  const runtime = createCombatHudBossRuntime();
  const first = createStage1CombatEnemy({ id: 'same-a', enemyType: 2, x: 0, y: 0 });
  const second = createStage1CombatEnemy({ id: 'same-b', enemyType: 2, x: 0, y: 0 });
  let bars = updateCombatHudBossRuntime(runtime, [
    createStage1CombatEnemyHudSnapshot(second, 1),
    createStage1CombatEnemyHudSnapshot(first, 0),
  ], 0);
  assert.deepEqual(bars.map((bar) => bar.enemyId), ['same-a', 'same-b']);
  assert.equal(bars[0]?.displayName, bars[1]?.displayName);
  first.hp = 0;
  bars = updateCombatHudBossRuntime(runtime, [
    createStage1CombatEnemyHudSnapshot(first, 0),
    createStage1CombatEnemyHudSnapshot(second, 1),
  ], 400);
  assert.equal(bars[0]?.hpRatio, 0);
  assert.equal(bars[0]?.trailingRatio, 0.5);
  bars = updateCombatHudBossRuntime(runtime, [
    createStage1CombatEnemyHudSnapshot(first, 0),
    createStage1CombatEnemyHudSnapshot(second, 1),
  ], 400);
  assert.equal(bars[0]?.trailingRatio, 0);
  assert.equal(bars[1]?.trailingRatio, 1);
  clearCombatHudBossRuntime(runtime);
  assert.equal(runtime.bars.size, 0);
}

console.log('stage1-hud-tests: ok');
