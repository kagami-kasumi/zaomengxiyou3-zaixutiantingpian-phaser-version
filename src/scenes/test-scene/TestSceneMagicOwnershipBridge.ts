// boundary: magic ownership bridge routes P1/P2 runtime state into shared
// magic-weapon and magic-bottle rules without owning those rules.
import {
  calculateEffectiveStats,
  isHeroCombatDead,
  requestMagicBottleCapture,
  requestMagicWeaponTrigger,
  resolveMagicBottleCaptureHit,
  syncMagicWeaponFromLoadout,
  updateMagicBottleCapture as updateMagicBottleCaptureModel,
  updateMagicWeapon as updateMagicWeaponModel,
  type InputState,
  type PlayerSlot,
} from './TestSceneSystems';

export function updateMagicWeapon(this: any, input: InputState, delta: number): void {
  const runtime = this.playerInventoryRuntimes.p1;
  const owner = this.getInventoryPlayer();
  syncMagicWeaponFromLoadout(runtime.magicWeapon, runtime.loadout);
  if (!owner || isHeroCombatDead(owner.combat)) {
    updateMagicWeaponModel(
      runtime.magicWeapon,
      owner ? createTarget(owner, runtime.loadout) : this.createFallbackMagicWeaponTarget(),
      delta,
      this.projectileSystem,
      [],
      undefined,
      [],
    );
    this.syncMagicWeaponPlatformViews();
    return;
  }

  const source = owner.movement ? {
    sourceId: owner.slot,
    x: owner.movement.x,
    y: owner.movement.y,
    facingX: owner.movement.facingX,
    cameraX: this.cameras.main.scrollX,
    cameraY: this.cameras.main.scrollY,
  } : undefined;
  requestMagicWeaponTrigger({
    model: runtime.magicWeapon,
    target: createTarget(owner, runtime.loadout),
    source,
    input: input.p1,
    previousInput: this.lastInput?.p1,
    friendlyPets: this.getActiveMagicWeaponPets(),
    enemyTargets: this.createMagicWeaponEnemyTargets(),
  });
  updateMagicWeaponModel(
    runtime.magicWeapon,
    createTarget(owner, runtime.loadout),
    delta,
    this.projectileSystem,
    this.createMagicWeaponEnemyTargets(),
    source,
    this.getActiveMagicWeaponPets(),
  );
  this.syncMagicWeaponPlatformViews();
}

export function updateMagicBottleCapture(this: any, input: InputState, delta: number): void {
  updateOwnedMagicBottleCapture(this, input, delta, 'p1');
  updateOwnedMagicBottleCapture(this, input, delta, 'p2');
}

function updateOwnedMagicBottleCapture(
  scene: any,
  input: InputState,
  delta: number,
  ownerSlot: PlayerSlot,
): void {
  const runtime = scene.playerInventoryRuntimes[ownerSlot];
  const owner = scene.getPlayers().find((player: any) => player.slot === ownerSlot);
  syncMagicWeaponFromLoadout(runtime.magicWeapon, runtime.loadout);
  if (!owner?.movement || isHeroCombatDead(owner.combat)) return;
  if (runtime.magicWeapon.current?.fillName !== 'xhhl') {
    runtime.magicBottle.effect = undefined;
    if (runtime.magicBottle.lastResult.startsWith('宣花葫芦')) {
      runtime.magicBottle.lastResult = '宣花葫芦未装备';
    }
    return;
  }

  requestMagicBottleCapture({
    model: runtime.magicBottle,
    owner: { x: owner.movement.x, y: owner.movement.y, facingX: owner.movement.facingX },
    inputMagicWeapon: input[ownerSlot].magicWeapon,
    previousInputMagicWeapon: scene.lastInput?.[ownerSlot].magicWeapon ?? false,
  });
  resolveMagicBottleCaptureHit({
    model: runtime.magicBottle,
    roster: scene.playerPetRosters[ownerSlot],
    targets: scene.capturablePetTargets,
  });
  updateMagicBottleCaptureModel(runtime.magicBottle, delta);
}

function createTarget(owner: any, loadout: any): any {
  return {
    combat: owner.combat,
    skill: owner.skill,
    effectiveStats: calculateEffectiveStats(owner.baseStats, loadout),
    movement: owner.movement,
  };
}
