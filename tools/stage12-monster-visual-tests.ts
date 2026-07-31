import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  stage12MonsterAtlases,
  stage12MonsterAttackAssets,
  Stage12MonsterAssetKeys,
} from '../src/assets/AssetManifest';
import { sceneAssetBundles } from '../src/assets/SceneAssetBundles';
import {
  chooseStage12MonsterAttack,
  createStage12MonsterVisual,
  getStage12MonsterActionDefinition,
  getStage12MonsterAtlasFrame,
  getStage12MonsterSpriteOrigin,
  Stage12MonsterVisualProvenance,
  Stage12VisualTickMs,
  updateStage12MonsterVisual,
  type Stage12MonsterAction,
  type Stage12MonsterType,
} from '../src/systems/Stage12MonsterVisualSystem';

const repoRoot = process.cwd();
const monsterDirectory = path.join(repoRoot, 'public', 'assets', 'stage1', 'monsters');

function pngDimensions(filePath: string): { width: number; height: number } {
  const bytes = readFileSync(filePath);
  assert.equal(bytes.toString('ascii', 1, 4), 'PNG', `${filePath} must be PNG`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

const expectedAtlasDimensions = {
  monster2: { width: 1140, height: 1140 },
  monster4: { width: 1140, height: 1140 },
  monster7: { width: 900, height: 750 },
  monster8: { width: 900, height: 900 },
} as const;
for (const [name, asset] of Object.entries(stage12MonsterAtlases)) {
  assert.deepEqual(
    pngDimensions(path.join(repoRoot, 'public', asset.path)),
    expectedAtlasDimensions[name as keyof typeof expectedAtlasDimensions],
  );
}
assert.equal(
  Object.values(stage12MonsterAtlases).reduce(
    (sum, asset) => sum + asset.reachableFrameCount,
    0,
  ),
  96,
  'Stage 1-2 must expose all 96 reachable body visuals',
);
assert.equal(
  Object.values(stage12MonsterAttackAssets).reduce(
    (sum, asset) => sum + asset.frameCount,
    0,
  ),
  122,
  'the nine Stage 1-2 attack/effect objects must expose all 122 frames',
);
for (const asset of Object.values(stage12MonsterAttackAssets)) {
  assert.equal(
    readdirSync(path.join(repoRoot, 'public', path.dirname(asset.framePaths[0]!))).length,
    asset.frameCount,
    `${asset.sourceSymbol} must retain every timeline frame`,
  );
  for (const framePath of asset.framePaths) {
    assert.ok(readFileSync(path.join(repoRoot, 'public', framePath), 'utf8').includes('<svg'));
  }
}

const stage12BundleKeys = new Set(
  sceneAssetBundles['stage-1-monsters'].assets.map((asset) => asset.key),
);
for (const key of [
  ...Object.values(stage12MonsterAtlases).map((asset) => asset.key),
  ...Object.values(stage12MonsterAttackAssets).flatMap((asset) => asset.frameKeys),
  Stage12MonsterAssetKeys.attackGeometry,
]) {
  assert.ok(stage12BundleKeys.has(key), `stage-1-monsters bundle must own ${key}`);
}

const actionsByMonster: Readonly<
  Record<Stage12MonsterType, readonly Stage12MonsterAction[]>
> = {
  2: ['wait', 'walk', 'hurt', 'dead', 'hit1', 'hit2'],
  4: ['wait', 'walk', 'hurt', 'dead', 'hit1', 'hit2'],
  7: ['wait', 'walk', 'hurt', 'dead', 'hit1'],
  8: ['wait', 'walk', 'hurt', 'dead', 'hit1', 'hit2'],
};
const expectedActionTicks = {
  2: [15, 16, 15, 17, 35, 20],
  4: [15, 16, 15, 16, 21, 60],
  7: [15, 16, 15, 15, 10],
  8: [15, 16, 15, 15, 13, 8],
} as const;
const expectedReachableFrames = { 2: 25, 4: 26, 7: 20, 8: 25 } as const;
for (const enemyType of [2, 4, 7, 8] as const) {
  const provenance = Stage12MonsterVisualProvenance[enemyType];
  const origin = getStage12MonsterSpriteOrigin(enemyType);
  assert.ok(Math.abs(
    -origin.x * provenance.cellWidth
      - (-provenance.cellWidth / 2 - provenance.offsetX),
  ) < 0.000_001);
  assert.ok(Math.abs(
    -origin.y * provenance.cellHeight
      - (-provenance.cellHeight / 2 + provenance.offsetY),
  ) < 0.000_001);
  const atlasFrames = new Set<number>();
  for (const action of actionsByMonster[enemyType]) {
    const definition = getStage12MonsterActionDefinition(enemyType, action);
    for (let frameIndex = 0; frameIndex < definition.holdTicks.length; frameIndex += 1) {
      const model = createStage12MonsterVisual(enemyType);
      model.action = action;
      model.frameIndex = frameIndex;
      atlasFrames.add(getStage12MonsterAtlasFrame(model));
    }
  }
  assert.equal(atlasFrames.size, expectedReachableFrames[enemyType]);
  assert.deepEqual(
    actionsByMonster[enemyType].map((action) =>
      getStage12MonsterActionDefinition(enemyType, action).holdTicks.reduce(
        (sum, ticks) => sum + ticks,
        0,
      )),
    expectedActionTicks[enemyType],
  );
}

function tickAttack(
  enemyType: Stage12MonsterType,
  attackSerial: number,
  ticks: number,
  facingX: -1 | 1 = -1,
) {
  const model = createStage12MonsterVisual(enemyType);
  return updateStage12MonsterVisual(model, {
    phase: 'windup',
    attackSerial,
    facingX,
    moving: false,
  }, Stage12VisualTickMs * ticks);
}

assert.deepEqual(
  tickAttack(2, 1, 20).map(({ family, offsetX, offsetY }) => ({ family, offsetX, offsetY })),
  [
    { family: 'monster2Hit1Start', offsetX: 75, offsetY: -100 },
    { family: 'monster2Hit1End', offsetX: -90, offsetY: -35 },
  ],
);
assert.deepEqual(tickAttack(2, 2, 7)[0], {
  family: 'monster2Hit2',
  offsetX: -35,
  offsetY: -80,
  facingX: -1,
  disabled: false,
});
assert.deepEqual(
  tickAttack(4, 2, 29).map(({ family, disabled }) => ({ family, disabled })),
  [
    { family: 'monster4Hit2Start', disabled: true },
    { family: 'monster4Hit2End', disabled: false },
  ],
);
assert.equal(chooseStage12MonsterAttack(7, 2), 'hit1', 'Monster7 hit2 stays unreachable');
assert.equal(chooseStage12MonsterAttack(8, 2), 'hit2');
assert.equal(tickAttack(7, 1, 5)[0]?.family, 'monster7Hit1');
assert.equal(tickAttack(8, 1, 9)[0]?.family, 'monster8Hit1');
assert.equal(tickAttack(8, 2, 1)[0]?.family, 'monster8Hit2');

const monster2Dead = createStage12MonsterVisual(2);
updateStage12MonsterVisual(monster2Dead, {
  phase: 'dead',
  attackSerial: 0,
  facingX: -1,
  moving: false,
}, Stage12VisualTickMs * 16);
assert.equal(monster2Dead.completed, false);
updateStage12MonsterVisual(monster2Dead, {
  phase: 'dead',
  attackSerial: 0,
  facingX: -1,
  moving: false,
}, Stage12VisualTickMs);
assert.equal(monster2Dead.completed, true, 'death view persists through the original final tick');

const gameplaySource = readFileSync(
  path.join(repoRoot, 'src', 'scenes', 'stage12', 'Stage12GameplayBridge.ts'),
  'utf8',
);
assert.ok(!gameplaySource.includes('scene.add.circle'));
assert.ok(!gameplaySource.includes('`M${enemy.enemyType}`'));
assert.ok(gameplaySource.includes('defeatReported'));

console.log('Stage 1-2 true monster visuals, nine attack objects, and lifecycle tests passed.');
