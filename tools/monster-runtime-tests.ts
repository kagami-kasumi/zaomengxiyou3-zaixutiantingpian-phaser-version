import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createDropSystem } from '../src/systems/DropSystem';
import type { MovementPlatform } from '../src/systems/HeroMovementSystem';
import {
  createMonsterDefeatRewardRuntime,
  getMonsterRewardConfig,
  settleMonsterDefeatRewards,
} from '../src/systems/MonsterDefeatRewardSystem';
import {
  createMonsterPhysics,
  updateMonsterPhysics,
} from '../src/systems/MonsterPhysicsSystem';

const ground: MovementPlatform = {
  id: 'test-ground',
  kind: 'solid',
  left: 0,
  right: 1_000,
  top: 500,
};

function testGroundedIsDefaultAndFlyingIsExplicit(): void {
  const grounded = createMonsterPhysics({ y: 350, height: 70 });
  for (let i = 0; i < 120; i += 1) {
    updateMonsterPhysics(grounded, 750, [ground], 1000 / 60);
  }
  assert.equal(grounded.motionMode, 'grounded');
  assert.equal(grounded.grounded, true);
  assert.equal(grounded.currentPlatformId, ground.id);
  assert.ok(Math.abs(grounded.y - 465) < 0.001, 'monster center must rest on platform top');

  const flying = createMonsterPhysics({ y: 240, height: 30, motionMode: 'flying' });
  updateMonsterPhysics(flying, 500, [ground], 5_000);
  assert.equal(flying.y, 240);
  assert.equal(flying.velocityY, 0);
}

function testSharedDefeatRewardAndIdempotence(): void {
  const runtime = createMonsterDefeatRewardRuntime();
  const dropSystem = createDropSystem();
  const result = settleMonsterDefeatRewards({
    runtime,
    dropSystem,
    defeatId: 'stage13-enemy-1',
    enemyType: 30,
    owner: 'p2',
    x: 300,
    y: 420,
    settleY: 484,
    random: () => 0.99,
  });
  assert.ok(result);
  assert.equal(result.experience.owner, 'p2');
  assert.equal(result.experience.amount, 4);
  assert.equal(result.medicine, undefined);
  assert.equal(result.souls.length, 4, 'primary soul count follows original 2..4 rule');
  assert.ok(result.souls.every((pickup) => pickup.targetId === 'p2'));
  assert.ok(result.souls.every((pickup) => pickup.power === 2));
  assert.equal(dropSystem.drops.length, 4);
  assert.equal(settleMonsterDefeatRewards({
    runtime,
    dropSystem,
    defeatId: 'stage13-enemy-1',
    enemyType: 30,
    owner: 'p2',
    x: 300,
    y: 420,
    settleY: 484,
  }), undefined, 'one monster death must settle only once');
}

function testRewardRegistry(): void {
  assert.deepEqual(getMonsterRewardConfig(2), { experience: 20, soulPower: 10 });
  assert.deepEqual(getMonsterRewardConfig(3), { experience: 7, soulPower: 4 });
  assert.deepEqual(getMonsterRewardConfig(4), { experience: 20, soulPower: 10 });
  assert.deepEqual(getMonsterRewardConfig(5), { experience: 35, soulPower: 15 });
  assert.deepEqual(getMonsterRewardConfig(7), { experience: 6, soulPower: 2 });
  assert.deepEqual(getMonsterRewardConfig(8), { experience: 5, soulPower: 3 });
  assert.deepEqual(getMonsterRewardConfig(30), { experience: 4, soulPower: 1 });
}

function testAllStage1ConsumersUseSharedOwners(): void {
  const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');
  const stage11Boss = read('src/scenes/test-scene/TestSceneBossArena.ts');
  const stage11World = read('src/scenes/test-scene/TestSceneWorldBridge.ts');
  const stage12 = read('src/scenes/stage12/Stage12GameplayBridge.ts');
  const stage13 = read('src/scenes/stage13/Stage13GameplayBridge.ts');
  assert.ok(stage11Boss.includes('updateMonsterPhysics('));
  assert.ok(stage11Boss.includes('settleMonsterDefeatRewards('));
  assert.ok(stage11World.includes('settleMonsterDefeatRewards('));
  assert.ok(stage12.includes('createStage1RewardBridge('));
  assert.ok(stage12.includes('rewards.onMonsterDefeated('));
  assert.ok(stage13.includes('createStage1RewardBridge('));
  assert.ok(stage13.includes('rewards.onMonsterDefeated('));
  assert.equal(stage12.includes('maybeSpawnMedicineDrop('), false);
  assert.equal(stage13.includes('maybeSpawnMedicineDrop('), false);
}

function testIntegratedPickupAssetsExist(): void {
  const paths = [
    'public/assets/combat/pickups/health-small.png',
    'public/assets/combat/pickups/health-big.png',
    'public/assets/combat/pickups/mana-small.png',
    'public/assets/combat/pickups/soul-primary/1.png',
    'public/assets/combat/pickups/soul-bonus/1.png',
  ];
  for (const path of paths) assert.equal(existsSync(resolve(process.cwd(), path)), true, path);
}

testGroundedIsDefaultAndFlyingIsExplicit();
testSharedDefeatRewardAndIdempotence();
testRewardRegistry();
testAllStage1ConsumersUseSharedOwners();
testIntegratedPickupAssetsExist();
console.log('Monster default gravity, flying exception, and shared defeat reward tests passed.');
