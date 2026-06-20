import assert from 'node:assert/strict';
import { createSeedEquipmentRegistry } from '../../src/systems/EquipmentSystem';
import { getInventoryEntries } from '../../src/systems/InventorySystem';
import {
  createPlayerInventoryRuntimes,
  InventoryOwnerKeyCodes,
  toggleInventoryForOwner,
  useOwnedPetConsumable,
} from '../../src/systems/PlayerInventoryOwnershipSystem';
import { createPlayerPetRosters } from '../../src/systems/PetOwnershipSystem';
import {
  requestMagicBottleCapture,
  resolveMagicBottleCaptureHit,
} from '../../src/systems/PetMagicBottleSystem';
import { PetTuning } from '../../src/systems/PetTuning';
import type { CapturablePetTarget } from '../../src/systems/PetTypes';

const PetConsumables = [
  'wpcsd', 'wphhd', 'djyys', 'cwjnxld',
  'cwzzxld', 'wphtd', 'nianqld', 'nianjhd',
] as const;

export function runPetItemOwnershipTests(): void {
  testIndependentRuntimeAndOwnerKeys();
  testEveryP2PetConsumableIsOwnerIsolated();
  testEveryPetConsumableRefusesWithoutP2ActivePet();
  testP2MagicBottleCaptureOutcomesStayOwnerIsolated();
}

function testIndependentRuntimeAndOwnerKeys(): void {
  const runtimes = createPlayerInventoryRuntimes(createSeedEquipmentRegistry());
  assert.notStrictEqual(runtimes.p1.store, runtimes.p2.store);
  assert.notStrictEqual(runtimes.p1.loadout, runtimes.p2.loadout);
  assert.notStrictEqual(runtimes.p1.magicBottle, runtimes.p2.magicBottle);
  assert.notEqual(
    runtimes.p1.loadout.magicWeapon?.instanceId,
    runtimes.p2.loadout.magicWeapon?.instanceId,
  );
  assert.deepEqual(InventoryOwnerKeyCodes, {
    p1Panel: 67,
    p2Panel: 111,
    p1MagicWeapon: 72,
    p2MagicWeapon: 103,
  });

  assert.deepEqual(toggleInventoryForOwner(runtimes, 'p1', 'p2'), {
    ownerSlot: 'p2', isOpen: true,
  });
  assert.equal(runtimes.p1.ui.isOpen, false);
  assert.equal(runtimes.p2.ui.isOpen, true);
  assert.equal(toggleInventoryForOwner(runtimes, 'p2', 'p2').isOpen, false);
}

function testEveryP2PetConsumableIsOwnerIsolated(): void {
  for (const fillName of PetConsumables) {
    const runtimes = createPlayerInventoryRuntimes(createSeedEquipmentRegistry());
    const rosters = createPlayerPetRosters();
    selectItem(runtimes.p2, fillName);
    const p1StoreBefore = JSON.stringify(runtimes.p1.store);
    const p1RosterBefore = JSON.stringify(rosters.p1);
    const quantityBefore = itemQuantity(runtimes.p2, fillName);

    const result = useOwnedPetConsumable({
      runtime: runtimes.p2,
      roster: rosters.p2,
      random: () => 0,
    });
    assert.equal(result.handled, true, `${fillName} should be handled`);
    const expectedConsumed = fillName !== 'nianqld';
    assert.equal(
      itemQuantity(runtimes.p2, fillName),
      quantityBefore - (expectedConsumed ? 1 : 0),
      `${fillName} consume decision`,
    );
    assert.equal(JSON.stringify(runtimes.p1.store), p1StoreBefore, `${fillName} P1 store`);
    assert.equal(JSON.stringify(rosters.p1), p1RosterBefore, `${fillName} P1 roster`);
  }
}

function testEveryPetConsumableRefusesWithoutP2ActivePet(): void {
  for (const fillName of PetConsumables) {
    const runtimes = createPlayerInventoryRuntimes(createSeedEquipmentRegistry());
    const rosters = createPlayerPetRosters();
    rosters.p2.pets.forEach((pet) => { pet.isActive = false; });
    selectItem(runtimes.p2, fillName);
    const quantityBefore = itemQuantity(runtimes.p2, fillName);
    const result = useOwnedPetConsumable({ runtime: runtimes.p2, roster: rosters.p2 });
    assert.equal(result.handled, true);
    assert.equal(itemQuantity(runtimes.p2, fillName), quantityBefore, `${fillName} refused consume`);
  }
}

function testP2MagicBottleCaptureOutcomesStayOwnerIsolated(): void {
  testCaptureOutcome('success');
  testCaptureOutcome('failure');
  testCaptureOutcome('low-soul');
  testCaptureOutcome('full');
}

function testCaptureOutcome(outcome: 'success' | 'failure' | 'low-soul' | 'full'): void {
  const runtimes = createPlayerInventoryRuntimes(createSeedEquipmentRegistry());
  const rosters = createPlayerPetRosters();
  const p1RosterBefore = JSON.stringify(rosters.p1);
  const p1SoulBefore = runtimes.p1.magicBottle.soul;
  if (outcome === 'low-soul') runtimes.p2.magicBottle.soul = PetTuning.magicBottleSoulCost - 1;
  if (outcome === 'full') {
    while (rosters.p2.pets.length < PetTuning.maxSeats) {
      const clone = structuredClone(rosters.p2.pets[0]);
      clone.id = `p2-full-${rosters.p2.pets.length}`;
      clone.isActive = false;
      rosters.p2.pets.push(clone);
    }
  }
  const target = createCaptureTarget();
  const requested = requestMagicBottleCapture({
    model: runtimes.p2.magicBottle,
    owner: { x: 0, y: 0, facingX: 1 },
    inputMagicWeapon: true,
    previousInputMagicWeapon: false,
  });

  if (outcome === 'low-soul') {
    assert.equal(requested, false);
    assert.equal(target.removed, false);
  } else {
    assert.equal(requested, true);
    resolveMagicBottleCaptureHit({
      model: runtimes.p2.magicBottle,
      roster: rosters.p2,
      targets: [target],
      random: () => outcome === 'failure' ? 1 : 0,
    });
    assert.equal(target.removed, outcome === 'success');
    assert.equal(
      runtimes.p2.magicBottle.soul,
      8_000 - PetTuning.magicBottleSoulCost,
    );
  }
  assert.equal(JSON.stringify(rosters.p1), p1RosterBefore);
  assert.equal(runtimes.p1.magicBottle.soul, p1SoulBefore);
}

function selectItem(runtime: ReturnType<typeof createPlayerInventoryRuntimes>['p2'], fillName: string): void {
  runtime.ui.activeCategory = 'items';
  runtime.ui.focus = 'inventory';
  runtime.ui.selectedIndex = getInventoryEntries(runtime.store, 'items').findIndex(
    (entry) => entry.definition.fillName === fillName,
  );
  assert.notEqual(runtime.ui.selectedIndex, -1, `${fillName} seeded`);
}

function itemQuantity(
  runtime: ReturnType<typeof createPlayerInventoryRuntimes>['p2'],
  fillName: string,
): number {
  const entry = getInventoryEntries(runtime.store, 'items').find(
    (candidate) => candidate.definition.fillName === fillName,
  );
  return entry?.kind === 'stack' ? entry.quantity : 0;
}

function createCaptureTarget(): CapturablePetTarget {
  return {
    id: 'p2-capture-target', monsterId: 'Monster72', level: 1,
    x: 70, y: -54, width: 40, height: 40, removed: false, feedback: '',
  };
}
