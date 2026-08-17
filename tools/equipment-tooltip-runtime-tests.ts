import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { AuthoritativeEquipmentCatalog } from '../src/systems/EquipmentCatalog';
import type { EquipmentInstance } from '../src/systems/EquipmentSystem';
import {
  assertVerifiedEquipmentTooltipTruth,
  createEquipmentTooltipPresentation,
  EquipmentTooltipTruthId,
  getEquipmentTooltipFixtureBounds,
  placeEquipmentTooltip,
} from '../src/systems/EquipmentTooltipSystem';
import {
  createEquipmentPageQaStorage,
  readEquipmentPageQaOptions,
} from '../src/systems/EquipmentPageQaFixtureSystem';
import { createFormalInventoryPage } from '../src/systems/FormalInventoryPageSystem';
import { createFormalWorkshopPage, getFormalWorkshopGridPageEntries } from '../src/systems/FormalWorkshopPageSystem';

function fixture(
  fillName: string,
  strengthLevel = 0,
  baseStatsOverride?: EquipmentInstance['baseStatsOverride'],
): EquipmentInstance {
  return {
    kind: 'equipment',
    instanceId: `tooltip-${fillName}-${strengthLevel}`,
    definition: AuthoritativeEquipmentCatalog[fillName]!,
    quantity: 1,
    strengthLevel,
    ...(baseStatsOverride ? { baseStatsOverride } : {}),
  };
}

function testVerifiedTruthAndInstanceProjection(): void {
  assert.doesNotThrow(assertVerifiedEquipmentTooltipTruth);
  assert.equal(EquipmentTooltipTruthId, 'task-settings-189.equipment-tooltip');
  const base = createEquipmentTooltipPresentation(fixture('_clj'));
  assert.equal(base.name, AuthoritativeEquipmentCatalog._clj?.name);
  assert.equal(base.rows[0]?.value, AuthoritativeEquipmentCatalog._clj?.quality);
  assert.ok(base.rows.some((row) => row.id === 'meta-type'));
  assert.ok(base.soulValue.startsWith('价值 : '));

  const strengthened = createEquipmentTooltipPresentation(fixture('_clj', 3, { power: 234 }));
  assert.match(strengthened.name, /\(\+3\)$/);
  const attack = strengthened.rows.find((row) => row.id === 'stat-power');
  assert.ok(attack);
  assert.match(attack.value, /^攻击： 234\(\+/);
  assert.notEqual(strengthened, base);
  const sourceFixture = getEquipmentTooltipFixtureBounds('inventory-random-strength-hover');
  assert.ok(Math.abs(strengthened.width - sourceFixture.width) < 0.0001);
  assert.equal(strengthened.height, sourceFixture.height);
}

function testStagePlacementAndLifecycleWiring(): void {
  const presentation = createEquipmentTooltipPresentation(fixture('_clj'));
  assert.deepEqual(placeEquipmentTooltip(600, 170, presentation), { x: 610, y: 170 });
  assert.ok(placeEquipmentTooltip(925, 210, presentation).x < 925);
  assert.equal(placeEquipmentTooltip(500, 580, presentation).y, 590 - presentation.height);

  const root = process.cwd();
  const page = readFileSync(path.join(root, 'src/scenes/feature-ui/FormalInventoryPageView.ts'), 'utf8');
  const workshop = readFileSync(path.join(root, 'src/scenes/feature-ui/FormalWorkshopPageView.ts'), 'utf8');
  const boot = readFileSync(path.join(root, 'src/scenes/BootScene.ts'), 'utf8');
  const qaScene = readFileSync(path.join(root, 'src/scenes/EquipmentPageQaScene.ts'), 'utf8');
  const grid = readFileSync(path.join(root, 'src/scenes/feature-ui/InventoryGridView.ts'), 'utf8');
  assert.match(page, /createEquipmentTooltipView/);
  assert.match(page, /onEquipmentOver/);
  assert.match(page, /hit\.on\('pointerover'/);
  assert.match(page, /objects\.push\(equipmentTooltip\.root\)/);
  assert.match(grid, /cell\.entry\?\.kind === 'equipment'/);
  assert.match(grid, /pointerout/);
  assert.match(workshop, /model\.tab === 'strength' \|\| model\.tab === 'fusion'/);
  assert.match(workshop, /onEquipmentOver/);
  assert.match(workshop, /FormalWorkshopStrengthTargetHitAreaIndex/);
  assert.match(workshop, /bindEquipmentTooltip\(targetZone, target, equipmentTooltip\)/);
  assert.match(workshop, /getNativeFusionTooltipTargets\(model\)/);
  assert.match(workshop, /workshop-fusion-\$\{target\.id\}/);
  assert.match(workshop, /bindEquipmentTooltip\(zone, target\.instance, equipmentTooltip\)/);
  assert.match(workshop, /objects\.push\(equipmentTooltip\.root\)/);
  assert.match(boot, /qaEquipmentPage.*workshop/);
  assert.match(qaScene, /createFormalWorkshopPageView/);
  assert.match(qaScene, /entry\.kind === 'equipment' && entry\.instanceId === 'qa-_clj'/);
}

function testRandomStrengthQaFixture(): void {
  const options = readEquipmentPageQaOptions(
    '?qaEquipmentRole=2&qaEquipmentOwner=p1&qaEquipmentCase=tooltip-instance',
    true,
  );
  assert.ok(options);
  const model = createFormalInventoryPage(createEquipmentPageQaStorage(options), 'p1');
  assert.ok(model);
  const weapon = model.restored.player1.equipmentLoadout.weapon;
  assert.equal(weapon?.strengthLevel, 3);
  assert.equal(weapon?.baseStatsOverride?.power, 234);
  const presentation = createEquipmentTooltipPresentation(weapon!);
  assert.match(presentation.rows.find((row) => row.id === 'stat-power')?.value ?? '', /^攻击： 234\(\+/);
}

function testFusionTooltipQaFixture(): void {
  const options = readEquipmentPageQaOptions(
    '?qaEquipmentRole=1&qaEquipmentOwner=p1&qaEquipmentCase=fusion-tooltip&qaEquipmentSoul=5000',
    true,
  );
  assert.ok(options);
  const model = createFormalWorkshopPage(createEquipmentPageQaStorage(options), 'p1');
  assert.ok(model);
  assert.deepEqual(
    getFormalWorkshopGridPageEntries(model).slice(0, 3).map((entry) => entry.definition.fillName),
    ['tdlzj', 'mgzh', 'tflj'],
  );
  const first = getFormalWorkshopGridPageEntries(model)[0];
  assert.equal(first?.kind === 'equipment' ? first.strengthLevel : undefined, 3);
  assert.equal(first?.kind === 'equipment' ? first.baseStatsOverride?.power : undefined, 234);
}

testVerifiedTruthAndInstanceProjection();
testStagePlacementAndLifecycleWiring();
testRandomStrengthQaFixture();
testFusionTooltipQaFixture();
console.log('Equipment tooltip truth, instance projection, placement, and formal inventory wiring tests passed.');
