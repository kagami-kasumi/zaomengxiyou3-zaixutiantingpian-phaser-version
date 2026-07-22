import assert from 'node:assert/strict';
import { createHeroMovement } from '../src/systems/HeroMovementSystem';
import type { PlayerInputState } from '../src/systems/InputSystem';
import {
  calculateStage1HeroDamage,
  calculateStage1IncomingDamage,
  createStage1CombatEnemy,
  createStage1CombatPlayer,
  createStage1CombatRuntime,
  getStage1EnemyConfig,
  resolveStage1EnemyAttack,
  resolveStage1HeroAttack,
  updateStage1CombatPlayer,
  updateStage1Enemy,
  Stage1CombatTuning,
} from '../src/systems/Stage1CombatSystem';

const idleInput = (slot: 'p1' | 'p2', attack = false): PlayerInputState => ({
  slot,
  moveX: 0,
  down: false,
  up: false,
  attack,
  jump: false,
  skillSlots: [false, false, false, false, false],
  special: false,
  magicWeapon: false,
});

function armEnemy(enemyType: 2 | 3 | 4 | 5 | 7 | 8 | 30, id: string) {
  const enemy = createStage1CombatEnemy({ id, enemyType, x: 40, y: 0 });
  const targets = [{ slot: 'p1' as const, x: 0, alive: true }];
  updateStage1Enemy({ enemy, targets, deltaMs: 0 });
  assert.equal(enemy.phase, 'windup', 'body proximity alone must only begin a warning');
  updateStage1Enemy({ enemy, targets, deltaMs: getStage1EnemyConfig(enemyType).windupMs });
  assert.equal(enemy.phase, 'active');
  return enemy;
}

function testRegistryIsSingleCombatOwner(): void {
  assert.equal(Stage1CombatTuning.defaultHeroId, 1, 'Stage 1 default player is Role1');
  assert.equal(Stage1CombatTuning.playerProtectionMs, 3_000);
  assert.equal(getStage1EnemyConfig(2).maxHp, 1_500);
  assert.equal(getStage1EnemyConfig(3).maxHp, 926);
  assert.equal(getStage1EnemyConfig(4).attackDamage, 49);
  assert.equal(getStage1EnemyConfig(5).maxHp, 2_788);
  assert.equal(getStage1EnemyConfig(7).maxHp, 200);
  assert.equal(getStage1EnemyConfig(8).maxHp, 300);
  assert.equal(getStage1EnemyConfig(30).attackDamage, 15);
  assert.equal(getStage1EnemyConfig(30).windupMs, 420, 'Monster30 exposes a readable modern warning window');
  assert.equal(calculateStage1IncomingDamage('physics', 15, 2), 13);
  assert.equal(calculateStage1IncomingDamage('magic', 15, 99), 15);
  assert.equal(calculateStage1HeroDamage(30, 'physics', 30), 27);
}

function testSixSourcesCannotBurstInOneFrame(): void {
  const runtime = createStage1CombatRuntime();
  const player = createStage1CombatPlayer('p1');
  const enemies = Array.from({ length: 6 }, (_, index) => armEnemy(30, `m30-${index}`));
  const events = enemies.flatMap((enemy) => resolveStage1EnemyAttack({
    runtime,
    enemy,
    players: [{ player, x: 0 }],
    timeMs: 1_000,
  }));
  assert.equal(events.length, 1, 'player-level protection rejects remaining same-frame sources');
  assert.equal(player.combat.hp, 67, 'Monster30 physical 15 is reduced by Role1 defense 2');
  assert.equal(runtime.audit.maxSourcesInSameFrame, 1);
  assert.notEqual(player.deathReason, 'burst-same-frame');
  assert.ok(events[0]?.attackId.includes('hit1'));
}

function testAttackIdentityProtectionAndExpiry(): void {
  const runtime = createStage1CombatRuntime();
  const player = createStage1CombatPlayer('p1');
  const first = armEnemy(7, 'm7-a');
  const second = armEnemy(7, 'm7-b');
  const third = armEnemy(7, 'm7-c');
  assert.equal(resolveStage1EnemyAttack({ runtime, enemy: first, players: [{ player, x: 0 }], timeMs: 1_000 }).length, 1);
  assert.equal(resolveStage1EnemyAttack({ runtime, enemy: first, players: [{ player, x: 0 }], timeMs: 1_000 }).length, 0, 'attack id resolves once');
  assert.equal(resolveStage1EnemyAttack({ runtime, enemy: second, players: [{ player, x: 0 }], timeMs: 1_100 }).length, 0, 'independent attack is blocked during protection');
  assert.equal(resolveStage1EnemyAttack({ runtime, enemy: third, players: [{ player, x: 0 }], timeMs: 4_001 }).length, 1, 'next independent attack resolves after protection');
  assert.equal(player.damageLog.length, 2);
}

function testHeroAttackUsesSharedNormalAttackWindow(): void {
  const runtime = createStage1CombatRuntime();
  const player = createStage1CombatPlayer('p1');
  const movement = createHeroMovement(0, 0);
  const enemy = createStage1CombatEnemy({ id: 'm30-target', enemyType: 30, x: 80, y: 0 });
  updateStage1CombatPlayer({
    player,
    input: idleInput('p1', true),
    movement,
    bounds: { left: -500, right: 500 },
    timeMs: 0,
    deltaMs: 0,
  });
  assert.equal(resolveStage1HeroAttack({ runtime, player, movement, enemies: [enemy], timeMs: 20 }).length, 0, 'hero windup is non-damaging');
  const events = resolveStage1HeroAttack({ runtime, player, movement, enemies: [enemy], timeMs: 50 });
  assert.equal(events.length, 1);
  assert.equal(events[0]?.sourceId, 'p1');
  assert.equal(events[0]?.actionName, 'hit1');
  assert.equal(enemy.hp, 123, 'Role1 hit1 consumes the shared defense calculation');
  assert.equal(resolveStage1HeroAttack({ runtime, player, movement, enemies: [enemy], timeMs: 60 }).length, 0, 'same attack-target pair is idempotent');
}

function testBossDeathClassification(): void {
  const runtime = createStage1CombatRuntime();
  const player = createStage1CombatPlayer('p1');
  player.combat.hp = 20;
  const boss = armEnemy(3, 'monster3-boss');
  const events = resolveStage1EnemyAttack({ runtime, enemy: boss, players: [{ player, x: 0 }], timeMs: 2_000 });
  assert.equal(events.length, 1);
  assert.equal(player.combat.state, 'dead');
  assert.equal(player.deathReason, 'boss-physical');
  assert.deepEqual(player.damageLog.map((event) => [event.sourceId, event.actionName, event.attackId]), [
    ['monster3-boss', 'hit1', 'monster3-boss-hit1-1'],
  ]);
}

testRegistryIsSingleCombatOwner();
testSixSourcesCannotBurstInOneFrame();
testAttackIdentityProtectionAndExpiry();
testHeroAttackUsesSharedNormalAttackWindow();
testBossDeathClassification();

console.log('Stage 1 shared combat owner, windows, protection, trace, and death audit tests passed.');
