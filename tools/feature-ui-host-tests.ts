import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  closeFeatureUi,
  createFeatureUiHostModel,
  getFeatureUiPageLabel,
  openFeatureUi,
  switchFeatureUi,
} from '../src/systems/FeatureUiHostSystem';

const root = process.cwd();

function source(path: string): string {
  return readFileSync(resolve(root, path), 'utf8');
}

function testSessionOwnerAndMutualExclusion(): void {
  const model = createFeatureUiHostModel();
  const opened = openFeatureUi(model, {
    page: 'backpack', owner: 'p1', originSceneKey: 'Stage12Scene',
    originKind: 'combat', playerCount: 2,
  });
  assert.equal(opened.status, 'opened');
  assert.equal(model.active?.owner, 'p1');
  assert.equal(model.active?.originSceneKey, 'Stage12Scene');

  const busy = openFeatureUi(model, {
    page: 'pets', owner: 'p2', originSceneKey: 'Stage12Scene',
    originKind: 'combat', playerCount: 2,
  });
  assert.equal(busy.status, 'busy');
  assert.equal(model.active?.page, 'backpack');

  const switched = switchFeatureUi(model, 'pets', 'p2');
  assert.equal(switched?.page, 'pets');
  assert.equal(switched?.owner, 'p2');
  assert.equal(closeFeatureUi(model)?.originKind, 'combat');
  assert.equal(model.active, undefined);
}

function testUnavailableP2IsRejected(): void {
  const model = createFeatureUiHostModel();
  const result = openFeatureUi(model, {
    page: 'skills', owner: 'p2', originSceneKey: 'HeavenMapScene',
    originKind: 'map', playerCount: 1,
  });
  assert.equal(result.status, 'invalid-owner');
  assert.equal(model.active, undefined);
  assert.ok(model.lastFeedback.includes('第二位玩家'));
  assert.equal(getFeatureUiPageLabel('magic-weapon'), '法宝强化');
}

function testBridgeAndOverlayContracts(): void {
  const bridge = source('src/scenes/feature-ui/FormalFeatureUiEntryBridge.ts');
  assert.ok(bridge.includes('KeyCodes.C'));
  assert.ok(bridge.includes('KeyCodes.V'));
  assert.ok(bridge.includes('KeyCodes.B'));
  assert.ok(bridge.includes('KeyCodes.N'));
  assert.ok(bridge.includes('P2_BACKPACK_KEY_CODE = 111'));
  assert.ok(bridge.includes('P2_SKILLS_KEY_CODE = 106'));
  assert.ok(bridge.includes('KeyCodes.NUMPAD_SUBTRACT'));
  assert.ok(bridge.includes("scene.scene.launch('FeatureUiScene'"));
  assert.ok(bridge.includes('scene.scene.pause(scene.scene.key)'));

  const overlay = source('src/scenes/FeatureUiScene.ts');
  assert.ok(overlay.includes('关卡已暂停'));
  assert.ok(overlay.includes('不会把占位内容标记为完成'));
  assert.ok(overlay.includes('this.scene.resume(session.originSceneKey)'));
  assert.ok(overlay.includes('closeFeatureUi(formalFeatureUiHost)'));
}

function testAllFormalOriginsUseTheSharedBridge(): void {
  for (const path of [
    'src/scenes/HeavenMapScene.ts',
    'src/scenes/Stage12Scene.ts',
    'src/scenes/Stage13Scene.ts',
    'src/scenes/test-scene/TestSceneStage11FlowBridge.ts',
  ]) {
    assert.ok(source(path).includes('installFormalFeatureUiEntries'), path);
  }
  const map = source('src/scenes/HeavenMapScene.ts');
  assert.ok(map.includes("this, 'workshop', 'p1'"));
  assert.ok(map.includes("this, 'skills', 'p1'"));
  assert.ok(source('src/main.ts').includes('FeatureUiScene'));
}

testSessionOwnerAndMutualExclusion();
testUnavailableP2IsRejected();
testBridgeAndOverlayContracts();
testAllFormalOriginsUseTheSharedBridge();

console.log('Formal feature UI host, owner, pause, and route tests passed.');
