import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import fusionTruth from '../docs/reverse-engineering/ground-truth/manifests/task-settings-167-workshop-fusion.json';
import makingTruth from '../docs/reverse-engineering/ground-truth/manifests/task-settings-167-workshop-making.json';
import resolutionTruth from '../docs/reverse-engineering/ground-truth/manifests/task-settings-167-workshop-resolution.json';
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
const inventoryGridView = readFileSync(path.join(
  root,
  'src/scenes/feature-ui/InventoryGridView.ts',
), 'utf8');
const inventorySystem = readFileSync(path.join(root, 'src/systems/InventorySystem.ts'), 'utf8');

function testVerifiedTruthIsTheOnlyGeometrySource(): void {
  assert.equal(strengthTruth.status, 'verified');
  assert.equal(fusionTruth.status, 'verified');
  assert.equal(resolutionTruth.status, 'verified');
  assert.equal(makingTruth.status, 'verified');
  for (const id of ['zbmc', 'qhmc1', 'qhmc2', 'qhmc3', 'baodimc', 'luckmc', 'txt_needlh', 'txt_success', 'qhbtn']) {
    assert.ok(strengthTruth.displayObjects.some((object) => object.id === id), `strength truth must contain ${id}`);
  }
  for (const id of ['material1', 'material2', 'material3', 'preview', 'produce', 'txt_name', 'txt_needlh', 'txt_success', 'rlbtn']) {
    assert.ok(fusionTruth.displayObjects.some((object) => object.id === id), `fusion truth must contain ${id}`);
  }
  for (const id of ['material', 'resu1', 'resu2', 'resu3', 'resu4', 'resu5', 'resu6', 'txt_needlh', 'fjbtn']) {
    assert.ok(resolutionTruth.displayObjects.some((object) => object.id === id), `resolution truth must contain ${id}`);
  }
  for (const id of ['makingbook', 'needmaterial1', 'needmaterial2', 'material1', 'material2', 'material3', 'makeObj', 'txthas1', 'txtneed1', 'txthas2', 'txtneed2', 'txt_needlh', 'txt_name', 'dzbtn']) {
    assert.ok(makingTruth.displayObjects.some((object) => object.id === id), `making truth must contain ${id}`);
  }
  assert.match(nativeView, /task-settings-167-workshop-strength\.json/);
  assert.match(nativeView, /task-settings-167-workshop-fusion\.json/);
  assert.match(nativeView, /task-settings-167-workshop-resolution\.json/);
  assert.match(nativeView, /task-settings-167-workshop-making\.json/);
  assert.match(nativeView, /stageBoundsOf\(truth/);
  assert.doesNotMatch(nativeView, /252\.6|258\.6|428\.25|441\.4|398\.45|375\.45/);
}

function testNativeDynamicChildrenFieldsAndButtons(): void {
  assert.match(nativeView, /createWorkshopSlotItemIcon/);
  assert.match(nativeView, /session\.target\?\.definition\.fillName/);
  assert.match(nativeView, /session\.stones\.forEach/);
  assert.match(nativeView, /session\.slots\.forEach/);
  assert.match(nativeView, /preview\.recipe\?\.productFillName/);
  assert.match(nativeView, /session\.lastProduct\?\.definition\.fillName/);
  assert.match(nativeView, /createCraftingPreviewEquipmentInstance/);
  assert.match(nativeView, /getNativeFusionTooltipTargets/);
  assert.match(nativeView, /session\.results\.slice\(0, 6\)/);
  assert.match(nativeView, /getNativeResolutionTooltipTarget/);
  assert.match(nativeView, /hitAreaOf\(resolutionTruth, 'material'\)/);
  assert.match(nativeView, /getNativeMakingTooltipTarget/);
  assert.match(nativeView, /hitAreaOf\(makingTruth, 'makeObj'\)/);
  assert.match(nativeView, /session\.book\?\.definition\.fillName/);
  assert.match(nativeView, /recipe\?\.requiredMaterials\.slice\(0, 2\)/);
  assert.match(nativeView, /session\.gems\.slice\(0, 3\)/);
  assert.match(nativeView, /session\.lastProduct\?\.definition\.fillName/);
  assert.match(nativeView, /session\.target \? `\$\{Math\.floor\(chance \* 100\)\}%` : ''/);
  assert.match(nativeView, /const hasStagedMaterial = session\.slots\.length > 0/);
  assert.match(nativeView, /fontFamily: 'FZCuYuan-M03/);
  assert.match(nativeView, /pointerover/);
  assert.match(nativeView, /pointerdown/);
  assert.match(nativeView, /pointerup/);
  assert.doesNotMatch(workshopView, /FormalWorkshopCommitHitAreas\.strength/);
  assert.doesNotMatch(workshopView, /FormalWorkshopCommitHitAreas\.fusion/);
  assert.doesNotMatch(workshopView, /FormalWorkshopCommitHitAreas\.resolution/);
  assert.doesNotMatch(workshopView, /FormalWorkshopCommitHitAreas\.making/);
  assert.doesNotMatch(workshopView, /statusText/);
  assert.doesNotMatch(workshopView, /fontFamily: 'Arial'/);
  assert.match(workshopView, /String\(model\.inventoryPage \+ 1\)/);
  assert.match(workshopView, /getNativeResolutionTooltipTarget\(model\)/);
  assert.match(workshopView, /workshop-resolution-material/);
  assert.doesNotMatch(workshopView, /workshop-resolution-resu/);
  assert.match(workshopView, /getNativeMakingTooltipTarget\(model\)/);
  assert.match(workshopView, /originalHoverZone\(scene, product\.bounds/);
  assert.match(workshopView, /workshop-making-product/);
  assert.doesNotMatch(workshopView, /workshop-making-(?:book|needmaterial|material)/);
  assert.doesNotMatch(workshopView, /inventoryPage \+ 1\}\/\$\{FormalWorkshopPageCount/);
  assert.match(inventoryGridView, /createWorkshopSlotItemIcon/);
  assert.match(inventoryGridView, /const WorkshopSlotContentWidth = 63/);
  assert.match(inventoryGridView, /const WorkshopSlotContentHeight = 62/);
  assert.match(inventoryGridView, /const WorkshopSlotVisibleOffsetX = -7/);
  assert.match(inventoryGridView, /const WorkshopSlotVisibleOffsetY = -7/);
  assert.match(inventoryGridView, /\.setPosition\(x \+ WorkshopSlotVisibleOffsetX, y \+ WorkshopSlotVisibleOffsetY\)/);
  assert.match(inventoryGridView, /\.setScale\(WorkshopSlotContentWidth \/ cropWidth, WorkshopSlotContentHeight \/ cropHeight\)/);

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
    craftingAssets.resolutionButtonUp,
    craftingAssets.resolutionButtonOver,
    craftingAssets.resolutionButtonDown,
    craftingAssets.makingButtonUp,
    craftingAssets.makingButtonOver,
    craftingAssets.makingButtonDown,
  ];
  for (const asset of assets) assert.ok(existsSync(path.join(root, 'public', asset.path)), asset.path);
  assert.equal(craftingAssets.strengthButtonUp.sourceCharacterId, 182);
  assert.equal(craftingAssets.strengthButtonOver.sourceCharacterId, 184);
  assert.equal(craftingAssets.fusionButtonUp.sourceCharacterId, 161);
  assert.equal(craftingAssets.fusionButtonOver.sourceCharacterId, 163);
  assert.equal(craftingAssets.resolutionButtonUp.sourceCharacterId, 173);
  assert.equal(craftingAssets.resolutionButtonOver.sourceCharacterId, 175);
  assert.equal(craftingAssets.makingButtonUp.sourceCharacterId, 136);
  assert.equal(craftingAssets.makingButtonOver.sourceCharacterId, 138);
  assert.match(workshopView, /callbacks\.onFeedback\(model\.message\)/);
  assert.match(workshopView, /toggleWorkshopStageSlot/);
  assert.match(workshopView, /withdrawFormalWorkshopStrengtheningSlot/);
  assert.match(workshopView, /withdrawFormalWorkshopFusion\(model, index\)/);
  assert.match(workshopView, /withdrawFormalWorkshopMakingSlot/);
  assert.match(host, /showWorkshopFeedback/);
  assert.match(host, /workshopGlobalFeedback/);
  assert.match(host, /onFeedback: \(message\) => this\.showWorkshopFeedback\(message\)/);
  assert.match(inventorySystem, /addStackByFillName\(store, registry, 'whgzzs', 1\)/);
}

testVerifiedTruthIsTheOnlyGeometrySource();
testNativeDynamicChildrenFieldsAndButtons();
testOriginalButtonAssetsAndGlobalFeedback();
console.log('Verified strength/fusion truth, native dynamic children, button states, and global feedback contracts passed.');
