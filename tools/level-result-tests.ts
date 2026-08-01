import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const resultAssetDir = path.join(repoRoot, 'public', 'assets', 'ui', 'level-results');

function testNativeResultAssetsMatchTheRecoveredDisplayList(): void {
  const expectedDimensions = new Map<string, readonly [number, number]>([
    ['game-win.png', [940, 590]],
    ['game-fail.png', [940, 590]],
    ['next-up.png', [131, 61]],
    ['next-over.png', [131, 61]],
    ['next-down.png', [131, 61]],
    ['retry-up.png', [160, 61]],
    ['retry-over.png', [160, 61]],
    ['retry-down.png', [160, 61]],
    ['back-up.png', [160, 61]],
    ['back-over.png', [160, 61]],
    ['back-down.png', [160, 61]],
  ]);
  for (const [filename, dimensions] of expectedDimensions) {
    const file = path.join(resultAssetDir, filename);
    assert.equal(existsSync(file), true, `${filename} must be integrated`);
    assert.deepEqual(readPngDimensions(file), dimensions, `${filename} dimensions`);
  }
}

function testAllCompletedLevelsUseOneNativeResultPresenter(): void {
  const consumers = [
    'src/scenes/PlayableLevelRuntime.ts',
    'src/scenes/Stage21Scene.ts',
    'src/scenes/Stage22Scene.ts',
  ].map((file) => readFileSync(path.join(repoRoot, file), 'utf8'));
  assert.equal(
    consumers.reduce((count, source) => count + (source.match(/showLevelResult\(/g) ?? []).length, 0),
    1,
  );
  assert.equal(
    consumers.reduce((count, source) => count + (source.match(/markLevelResultStarted\(/g) ?? []).length, 0),
    1,
  );
  assert.doesNotMatch(consumers.join('\n'), /add\.rectangle\(|createResultButton|关卡胜利|全员战败/);

  for (const stage of ['12', '13', '21', '22']) {
    assert.equal(
      existsSync(path.join(repoRoot, `src/scenes/stage${stage}/Stage${stage}ResultBridge.ts`)),
      false,
      `Stage ${stage} must not restore a private result bridge`,
    );
  }
  for (const stage of ['12', '13', '21', '22']) {
    const scene = readFileSync(path.join(repoRoot, `src/scenes/Stage${stage}Scene.ts`), 'utf8');
    assert.match(scene, /createPlayableLevelRuntime\(/);
    assert.doesNotMatch(scene, /showLevelResult\(|markLevelResultStarted\(/);
  }
  const stage11Scene = readFileSync(path.join(repoRoot, 'src/scenes/TestScene.ts'), 'utf8');
  assert.match(stage11Scene, /createTestSceneStage11Runtime/);
  assert.doesNotMatch(stage11Scene, /showLevelResult\(|markLevelResultStarted\(/);
}

function testPresenterUsesRecoveredRootsStatesAndGeometry(): void {
  const presenter = readFileSync(path.join(repoRoot, 'src/scenes/LevelResultView.ts'), 'utf8');
  const manifest = readFileSync(path.join(repoRoot, 'src/assets/AssetManifest.ts'), 'utf8');
  const bundles = readFileSync(path.join(repoRoot, 'src/assets/SceneAssetBundles.ts'), 'utf8');

  assert.doesNotMatch(presenter, /add\.rectangle\(/);
  assert.match(presenter, /LevelResultAssetKeys\.win/);
  assert.match(presenter, /LevelResultAssetKeys\.fail/);
  assert.match(presenter, /x: 120\.55[\s\S]*y: 384\.1/);
  assert.match(presenter, /x: 305\.95[\s\S]*y: 394/);
  assert.match(presenter, /x: 470\.95[\s\S]*y: 394/);
  assert.match(presenter, /fontFamily: 'FZCuYuan-M03/);
  assert.match(manifest, /GameWin\/base', 320\)/);
  assert.match(manifest, /GameFail\/base', 302\)/);
  assert.match(manifest, /nextStageButton\/up', 329\)/);
  assert.match(manifest, /rePlayButton\/up', 307\)/);
  assert.match(manifest, /backTochooseButton\/up', 312\)/);
  assert.match(bundles, /\.\.\.Object\.values\(levelResultAssets\)\.map\(image\)/);
}

function testResultEvidenceKeepsTheOriginalAndModernExceptionsExplicit(): void {
  const evidence = readFileSync(
    path.join(repoRoot, 'docs/reverse-engineering/level-result-ui-index.md'),
    'utf8',
  );
  assert.match(evidence, /GameWin 330/);
  assert.match(evidence, /GameFail 313/);
  assert.match(evidence, /现代尚无最大连击\/总积分 producer/);
  assert.match(evidence, /禁止差异：全屏黑 Rectangle/);
}

function readPngDimensions(file: string): readonly [number, number] {
  const bytes = readFileSync(file);
  assert.equal(bytes.subarray(1, 4).toString('ascii'), 'PNG');
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

testNativeResultAssetsMatchTheRecoveredDisplayList();
testAllCompletedLevelsUseOneNativeResultPresenter();
testPresenterUsesRecoveredRootsStatesAndGeometry();
testResultEvidenceKeepsTheOriginalAndModernExceptionsExplicit();

console.log('Native shared level result view and architecture tests passed.');
