import assert from 'node:assert/strict';
import {
  createPetPanelSession,
  createPlayerPetRosters,
  getPlayerPetRoster,
  PetUiKeyCodes,
  selectOwnedPet,
  toggleOwnedPetActive,
  togglePetPanelForOwner,
} from '../../src/systems/PetOwnershipSystem';
import {
  getActivePet,
  syncPetRuntimeWithRoster,
  updatePetRuntime,
} from '../../src/systems/PetSystem';

export function runPetOwnershipSystemTests(): void {
  testPlayerRostersAreIndependent();
  testPanelSessionHasOneExplicitOwner();
  testDeployAndRestNeverMutateTheOtherPlayer();
  testBothPlayersCanHaveFollowingPets();
  testOriginalLocalTwoPlayerPetShortcuts();
}

function testOriginalLocalTwoPlayerPetShortcuts(): void {
  assert.deepEqual(PetUiKeyCodes, {
    p1Panel: 66,
    p2Panel: 109,
    p2SkillPanel: 106,
  });
}

function testPlayerRostersAreIndependent(): void {
  const rosters = createPlayerPetRosters({ includeSkillShowcase: true });
  assert.notEqual(rosters.p1, rosters.p2);
  assert.notEqual(rosters.p1.pets[0], rosters.p2.pets[0]);
  assert.equal(rosters.p1.pets[0].id, 'pet-monkey-1');
  assert.equal(rosters.p2.pets[0].id, 'p2-pet-monkey-1');

  selectOwnedPet(rosters, 'p2', 1);
  assert.equal(rosters.p1.selectedIndex, 0);
  assert.equal(rosters.p2.selectedIndex, 1);
}

function testPanelSessionHasOneExplicitOwner(): void {
  const rosters = createPlayerPetRosters({ includeSkillShowcase: true });
  const panel = createPetPanelSession();

  assert.equal(togglePetPanelForOwner(panel, rosters, 'p1'), true);
  assert.equal(panel.owner, 'p1');
  assert.equal(togglePetPanelForOwner(panel, rosters, 'p2'), true);
  assert.equal(panel.owner, 'p2');
  assert.equal(togglePetPanelForOwner(panel, rosters, 'p2'), false);
  assert.equal(panel.owner, undefined);
}

function testDeployAndRestNeverMutateTheOtherPlayer(): void {
  const rosters = createPlayerPetRosters({ includeSkillShowcase: true });
  selectOwnedPet(rosters, 'p2', 1);
  assert.equal(toggleOwnedPetActive(rosters, 'p2'), true);

  assert.equal(getActivePet(rosters.p1)?.id, 'pet-monkey-1');
  assert.equal(getActivePet(rosters.p2)?.id, 'p2-pet-monkey-2');
  assert.equal(toggleOwnedPetActive(rosters, 'p2'), true);
  assert.equal(getActivePet(rosters.p2), undefined);
  assert.equal(getActivePet(rosters.p1)?.id, 'pet-monkey-1');
}

function testBothPlayersCanHaveFollowingPets(): void {
  const rosters = createPlayerPetRosters({ includeSkillShowcase: true });
  const p1Pet = getActivePet(rosters.p1);
  const p2Pet = getActivePet(rosters.p2);
  assert.ok(p1Pet);
  assert.ok(p2Pet);

  const p1Owner = { x: 100, y: 200, facingX: 1 as const };
  const p2Owner = { x: 700, y: 300, facingX: -1 as const };
  const p1Runtime = syncPetRuntimeWithRoster(rosters.p1, undefined, p1Owner);
  const p2Runtime = syncPetRuntimeWithRoster(rosters.p2, undefined, p2Owner);
  assert.ok(p1Runtime);
  assert.ok(p2Runtime);
  assert.notEqual(p1Runtime.petId, p2Runtime.petId);

  updatePetRuntime(p1Runtime, p1Pet, { x: 160, y: 200, facingX: 1 }, 100);
  updatePetRuntime(p2Runtime, p2Pet, { x: 640, y: 300, facingX: -1 }, 100);
  assert.ok(p1Runtime.x < 300);
  assert.ok(p2Runtime.x > 500);
}
