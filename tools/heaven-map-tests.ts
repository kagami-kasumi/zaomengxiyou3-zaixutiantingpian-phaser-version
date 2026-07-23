import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { heavenMapAssets } from '../src/assets/AssetManifest';
import {
  createHeavenMapSnapshot,
  findHeavenMapNode,
  HeavenMapNodeDefinitions,
  resolveHeavenMapRuntimeProgress,
} from '../src/systems/HeavenMapSystem';

const repoRoot = process.cwd();

{
  const nodes = createHeavenMapSnapshot({ unlockedStage: 1, unlockedLevel: 1 });
  assert.deepEqual(nodes.map((node) => node.status), ['current', 'locked', 'locked', 'locked']);
  assert.equal(findHeavenMapNode(nodes, '1-1')?.canActivate, true);
  assert.equal(findHeavenMapNode(nodes, '1-2')?.canActivate, false);
}

{
  const nodes = createHeavenMapSnapshot({ unlockedStage: 1, unlockedLevel: 2 });
  assert.deepEqual(nodes.map((node) => node.status), ['completed', 'current', 'locked', 'locked']);
}

{
  const nodes = createHeavenMapSnapshot({ unlockedStage: 1, unlockedLevel: 3 });
  assert.deepEqual(nodes.map((node) => node.status), ['completed', 'completed', 'current', 'locked']);
}

{
  const nodes = createHeavenMapSnapshot({ unlockedStage: 2, unlockedLevel: 1 });
  assert.deepEqual(nodes.map((node) => node.status), ['completed', 'completed', 'completed', 'current']);
  assert.equal(findHeavenMapNode(nodes, '2-1')?.canActivate, true);
  assert.equal(findHeavenMapNode(nodes, '2-1')?.routeKey, 'Stage21Scene');
}

assert.deepEqual(HeavenMapNodeDefinitions.map((node) => node.id), ['1-1', '1-2', '1-3', '2-1']);
assert.deepEqual(HeavenMapNodeDefinitions.map((node) => node.title), ['九重天', '天宫路', '南天门', '南天王殿']);
assert.deepEqual(
  resolveHeavenMapRuntimeProgress({ unlockedStage: 1, unlockedLevel: 1 }, '?qaStage=2-1', true),
  { unlockedStage: 2, unlockedLevel: 1 },
);
assert.deepEqual(
  resolveHeavenMapRuntimeProgress({ unlockedStage: 1, unlockedLevel: 2 }, '?qaStage=2-1', false),
  { unlockedStage: 1, unlockedLevel: 2 },
);
assert.deepEqual(HeavenMapNodeDefinitions.map((node) => node.registration), [
  { x: 703.45, y: 524.95 },
  { x: 596.5, y: 541.95 },
  { x: 525.45, y: 458.45 },
  { x: 507.95, y: 341.5 },
]);
for (const node of HeavenMapNodeDefinitions) {
  assert.ok(node.hitArea.width > 0 && node.hitArea.height > 0);
  assert.ok(node.registration.x >= node.hitArea.x && node.registration.x <= node.hitArea.x + node.hitArea.width);
  assert.ok(node.registration.y >= node.hitArea.y && node.registration.y <= node.hitArea.y + node.hitArea.height);
}

for (const asset of Object.values(heavenMapAssets)) {
  assert.equal(asset.status, 'ready');
  assert.equal(asset.source, 'extracted-flash');
  assert.equal(asset.sourcePackage, 'assets/OtherMat1.swf');
  assert.ok(existsSync(path.join(repoRoot, 'public', asset.path)));
}
const worldSvg = readFileSync(path.join(repoRoot, 'public/assets/ui/heaven-map/world.svg'), 'utf8');
const menuSvg = readFileSync(path.join(repoRoot, 'public/assets/ui/heaven-map/menu.svg'), 'utf8');
assert.match(worldSvg, /width="940px" viewBox="0 0 940 590"/);
assert.match(menuSvg, /width="940px" viewBox="0 0 940 590"/);

const bootSource = readFileSync(path.join(repoRoot, 'src/scenes/BootScene.ts'), 'utf8');
assert.match(bootSource, /Object\.values\(heavenMapAssets\)/);
const mainSource = readFileSync(path.join(repoRoot, 'src/main.ts'), 'utf8');
assert.match(mainSource, /BootScene, SaveSlotScene, HeavenMapScene/);
const mapSource = readFileSync(path.join(repoRoot, 'src/scenes/HeavenMapScene.ts'), 'utf8');
assert.match(mapSource, /loadActiveGame\(this\.storage\)/);
assert.match(mapSource, /this\.chooser = undefined/);
assert.match(mapSource, /openPlayerCountChooser\(node\)/);
assert.match(mapSource, /this\.scene\.start\(node\.routeKey, \{ playerCount \}\)/);
assert.match(mapSource, /内容尚未复现/);

const formalRouteFiles = [
  'src/scenes/SaveSlotScene.ts',
  'src/scenes/Stage12Scene.ts',
  'src/scenes/Stage13Scene.ts',
  'src/scenes/Stage21Scene.ts',
  'src/scenes/Stage51TransitionScene.ts',
  'src/scenes/stage12/Stage12ResultBridge.ts',
  'src/scenes/stage13/Stage13ResultBridge.ts',
  'src/scenes/stage21/Stage21ResultBridge.ts',
  'src/scenes/test-scene/TestSceneStage11FlowBridge.ts',
];
for (const relativePath of formalRouteFiles) {
  const source = readFileSync(path.join(repoRoot, relativePath), 'utf8');
  assert.match(source, /HeavenMapScene/);
  assert.doesNotMatch(source, /scene\.start\('Stage11EntryScene'\)/);
}
const stage11FlowSource = readFileSync(
  path.join(repoRoot, 'src/scenes/test-scene/TestSceneStage11FlowBridge.ts'),
  'utf8',
);
assert.match(stage11FlowSource, /on\('keydown-ESC', returnToMap\)/);
assert.match(stage11FlowSource, /off\('keydown-ESC', returnToMap\)/);

console.log('Heaven map state, resource, and formal route tests passed.');
