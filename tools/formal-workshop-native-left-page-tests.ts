import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import fusionTruth from '../docs/reverse-engineering/ground-truth/manifests/task-settings-167-workshop-fusion.json';
import strengthTruth from '../docs/reverse-engineering/ground-truth/manifests/task-settings-167-workshop-strength.json';
import { craftingAssets } from '../src/assets/AssetManifest';

const root = process.cwd();
const nativeView = readFileSync(path.join(
  root,
  'src/scenes/feature-ui/FormalWorkshopNativeOperationView.ts',
), 'utf8');
const workshopView = readFileSync(path.join(
  root,
  'src/scenes/feature-ui/FormalWorkshopPageView.ts',
), 'utf8');
const host = readFileSync(path.join(root, 'src/scenes/FeatureUiScene.ts'), 'utf8');

function testVerifiedTruthIsTheOnlyGeometrySource(): void {
  assert.equal(strengthTruth.status, 'verified');
  assert.equal(fusionTruth.status, 'verified');
  for (const id of ['zbmc', 'qhmc1', 'qhmc2', 'qhmc3', 'baodimc', 'luckmc', 'txt_needlh', 'txt_success', 'qhbtn']) {
    assert.ok(strengthTruth.displayObjects.some((object) => object.id === id), `strength truth must contain ${id}`);
  }
  for (const id of ['material1', 'material2', 'material3', 'preview', 'produce', 'txt_name', 'txt_needlh', 'txt_success', 'rlbtn']) {
    assert.ok(fusionTruth.displayObjects.some((object) => object.id === id), `fusion truth must contain ${id}`);
  }
  assert.match(nativeView, /task-settings-167-workshop-strength\.json/);
  assert.match(nativeView, /task-settings-167-workshop-fusion\.json/);
  assert.match(nativeView, /stageBoundsOf\(truth/);
  assert.doesNotMatch(nativeView, /252\.6|258\.6|428\.25|441\.4|398\.45|375\.45/);
}

function testNativeDynamicChildrenFieldsAndButtons(): void {
  assert.match(nativeView, /createInventoryItemIcon/);
  assert.match(nativeView, /session\.target\?\.definition\.fillName/);
  assert.match(nativeView, /session\.stones\.forEach/);
  assert.match(nativeView, /session\.slots\.forEach/);
  assert.match(nativeView, /preview\.recipe\?\.productFillName/);
  assert.match(nativeView, /session\.lastProductFillName/);
  assert.match(nativeView, /session\.target \? `\$\{Math\.floor\(chance \* 100\)\}%` : ''/);
  assert.match(nativeView, /const hasStagedMaterial = session\.slots\.length > 0/);
  assert.match(nativeView, /fontFamily: 'FZCuYuan-M03/);
  assert.match(nativeView, /pointerover/);
  assert.match(nativeView, /pointerdown/);
  assert.match(nativeView, /pointerup/);
  assert.doesNotMatch(workshopView, /FormalWorkshopCommitHitAreas\.strength/);
  assert.doesNotMatch(workshopView, /FormalWorkshopCommitHitAreas\.fusion/);

  const strengthBranch = workshopView.slice(
    workshopView.indexOf("if (model.tab === 'strength')"),
    workshopView.indexOf("} else if (model.tab === 'resolution')"),
  );
  assert.match(strengthBranch, /createNativeStrengthObjects/);
  assert.match(strengthBranch, /createNativeFusionObjects/);
  assert.doesNotMatch(strengthBranch, /statusText/);
}

function testOriginalButtonAssetsAndGlobalFeedback(): void {
  const assets = [
    craftingAssets.strengthButtonUp,
    craftingAssets.strengthButtonOver,
    craftingAssets.strengthButtonDown,
    craftingAssets.fusionButtonUp,
    craftingAssets.fusionButtonOver,
    craftingAssets.fusionButtonDown,
  ];
  for (const asset of assets) assert.ok(existsSync(path.join(root, 'public', asset.path)), asset.path);
  assert.equal(craftingAssets.strengthButtonUp.sourceCharacterId, 182);
  assert.equal(craftingAssets.strengthButtonOver.sourceCharacterId, 184);
  assert.equal(craftingAssets.fusionButtonUp.sourceCharacterId, 161);
  assert.equal(craftingAssets.fusionButtonOver.sourceCharacterId, 163);
  assert.match(workshopView, /callbacks\.onFeedback\(model\.message\)/);
  assert.match(host, /showWorkshopFeedback/);
  assert.match(host, /workshopGlobalFeedback/);
  assert.match(host, /onFeedback: \(message\) => this\.showWorkshopFeedback\(message\)/);
}

testVerifiedTruthIsTheOnlyGeometrySource();
testNativeDynamicChildrenFieldsAndButtons();
testOriginalButtonAssetsAndGlobalFeedback();
console.log('Verified strength/fusion truth, native dynamic children, button states, and global feedback contracts passed.');
