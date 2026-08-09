import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { equipmentPreviewAssets } from '../src/assets/EquipmentPreviewAssets';
import { AuthoritativeEquipmentCatalog } from '../src/systems/EquipmentCatalog';
import {
  EquipmentVisualCatalog,
  equipmentPreviewPreservesOriginalDefect,
  getEquipmentPreviewAssetsForItems,
  getEquipmentPreviewLayers,
} from '../src/systems/EquipmentPreviewSystem';
import { createEmptyEquipmentLoadout, type EquipmentInstance } from '../src/systems/EquipmentSystem';

const root = process.cwd();
const instance = (fillName: string): EquipmentInstance => ({
  kind: 'equipment', instanceId: `test-${fillName}`,
  definition: AuthoritativeEquipmentCatalog[fillName]!, quantity: 1,
});

function testVisualCatalogCoverageAndBundle(): void {
  assert.equal(Object.keys(EquipmentVisualCatalog).length, 164);
  assert.equal(equipmentPreviewAssets.length, 111);
  assert.equal(readdirSync(path.join(root, 'public/assets/ui/inventory/equipment-preview')).length, 111);
  assert.equal(new Set(equipmentPreviewAssets.map((asset) => asset.key)).size, 111);
  for (const asset of equipmentPreviewAssets) {
    assert.ok(existsSync(path.join(root, 'public', asset.path)), asset.path);
  }
  assert.equal(getEquipmentPreviewAssetsForItems(5, ['_clj']).length, 1);
  assert.equal(Object.values(EquipmentVisualCatalog).filter(
    (item) => item.preview.mode === 'no-head-preview-change',
  ).length, 37);
}

function testRole4BranchRole5FrameTitlesAndDefects(): void {
  const role4Armor = Object.values(EquipmentVisualCatalog).find(
    (item) => item.preview.mode === 'role4-dual-body-branch',
  )!;
  const loadout = createEmptyEquipmentLoadout();
  loadout.armor = instance(role4Armor.fillName);
  assert.match(getEquipmentPreviewLayers(4, loadout)[0]!.asset.sourceSymbol, /_SHOVEL_/);
  const arrowWeapon = Object.values(EquipmentVisualCatalog).find(
    (item) => item.preview.role === 4 && item.slot === 'weapon'
      && [4, 5, 9, 998].includes(AuthoritativeEquipmentCatalog[item.fillName]!.showId),
  )!;
  loadout.weapon = instance(arrowWeapon.fillName);
  assert.match(getEquipmentPreviewLayers(4, loadout)[0]!.asset.sourceSymbol, /_ARROW_/);

  const role5Weapon = Object.values(EquipmentVisualCatalog).find(
    (item) => item.preview.mode === 'role5-dynamic-fashion-layers' && item.slot === 'weapon',
  )!;
  const role5 = createEmptyEquipmentLoadout();
  role5.weapon = instance(role5Weapon.fillName);
  assert.equal(getEquipmentPreviewLayers(5, role5)[0]!.selectedFrame, role5Weapon.preview.selectedFrame);

  const title = Object.values(EquipmentVisualCatalog).find(
    (item) => item.preview.mode === 'title-overlay' && item.fillName !== 'mksddf',
  )!;
  const titled = createEmptyEquipmentLoadout();
  titled.title = instance(title.fillName);
  assert.deepEqual(getEquipmentPreviewLayers(1, titled)[0]!.offset, { x: -38, y: -66 });
  assert.equal(equipmentPreviewPreservesOriginalDefect('fmtstx'), true);
  assert.equal(equipmentPreviewPreservesOriginalDefect('mksddf'), true);
  const broken = createEmptyEquipmentLoadout();
  broken.title = instance('mksddf');
  assert.equal(getEquipmentPreviewLayers(1, broken).length, 0);
}

testVisualCatalogCoverageAndBundle();
testRole4BranchRole5FrameTitlesAndDefects();
console.log('Equipment visual catalog, 111-character bundle, preview modes, and defect tests passed.');
