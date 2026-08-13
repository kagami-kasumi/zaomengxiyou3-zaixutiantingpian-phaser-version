import assert from 'node:assert/strict';

import {
  createEquipmentPageQaStorage,
  getEquipmentPageQaFillNames,
  readEquipmentPageQaOptions,
  type EquipmentPageQaCase,
} from '../src/systems/EquipmentPageQaFixtureSystem';
import { getEquipmentPreviewLayers } from '../src/systems/EquipmentPreviewSystem';
import { createAuthoritativeEquipmentRegistry } from '../src/systems/EquipmentCatalog';
import { createSeedEquipmentRegistry } from '../src/systems/EquipmentSystem';
import { restoreGameState } from '../src/systems/SaveSystem';
import { loadActiveGame } from '../src/systems/SaveSlotSystem';

function options(fixtureCase: EquipmentPageQaCase, roleId = 1, owner: 'p1' | 'p2' = 'p1') {
  return { fixtureCase, roleId, owner } as const;
}

function testQueryGateAndOwnerIsolation(): void {
  assert.equal(readEquipmentPageQaOptions('?qaEquipmentRole=4&qaEquipmentOwner=p2&qaEquipmentCase=role4-arrow', false), undefined);
  assert.deepEqual(
    readEquipmentPageQaOptions('?qaEquipmentRole=4&qaEquipmentOwner=p2&qaEquipmentCase=role4-arrow', true),
    options('role4-arrow', 4, 'p2'),
  );
  assert.equal(readEquipmentPageQaOptions('?qaEquipmentRole=9&qaEquipmentCase=equipped', true), undefined);
  const save = loadActiveGame(createEquipmentPageQaStorage(options('role4-arrow', 4, 'p2')))!;
  assert.equal(save.party.members.p1.heroId, 1);
  assert.equal(save.party.members.p2?.heroId, 4);
  assert.ok(Object.values(save.player2.equipment).every(Boolean), JSON.stringify(save.player2.equipment));
  assert.equal(save.player1.equipment.weapon, null);
  assert.equal(save.player1.equipment.armor, null);
}

function testRepresentativePreviewFixtures(): void {
  for (const fixtureCase of [
    'equipped', 'empty', 'role4-shovel', 'role4-arrow', 'role5-frame',
    'character-520', 'character-521', 'title', 'unchanged', 'fmtstx-defect', 'mksddf-defect',
  ] as const) {
    const roleId = fixtureCase.startsWith('role4') ? 4 : fixtureCase === 'role5-frame' ? 5 : 1;
    const fixture = options(fixtureCase, roleId);
    const save = loadActiveGame(createEquipmentPageQaStorage(fixture))!;
    const restored = restoreGameState(save, createAuthoritativeEquipmentRegistry(createSeedEquipmentRegistry()));
    assert.deepEqual(
      Object.values(save.player1.equipment).flatMap((entry) => entry ? [entry.fillName] : []),
      getEquipmentPageQaFillNames(fixture),
    );
    const layers = getEquipmentPreviewLayers(roleId, restored.player1.equipmentLoadout);
    if (fixtureCase === 'role4-shovel') assert.match(layers[0]!.asset.sourceSymbol, /_SHOVEL_/);
    if (fixtureCase === 'role4-arrow') assert.ok(layers.some((layer) => /_ARROW_/.test(layer.asset.sourceSymbol)));
    if (fixtureCase === 'role5-frame') assert.ok(layers.some((layer) => layer.selectedFrame !== undefined));
    if (fixtureCase === 'mksddf-defect') assert.ok(layers.every((layer) => layer.fillName !== 'mksddf'));
    if (fixtureCase === 'empty') assert.equal(layers.length, 0);
  }
}

testQueryGateAndOwnerIsolation();
testRepresentativePreviewFixtures();
console.log('Equipment page five-role, dual-owner, representative resource QA fixtures passed.');
