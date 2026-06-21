import type { InputState } from '../../systems/InputSystem';

export type TestSceneUpdatePipeline = {
  run(time: number, delta: number, input: InputState, previousCameraY: number): void;
};

export type TestSceneUpdateHooks = {
  updateHeroDebugSelection(): void;
  updateHeroMovement(input: InputState, time: number, delta: number): void;
  updateHeroCombatStates(time: number, delta: number): void;
  updateHeroNormalAttacks(input: InputState, time: number): void;
  updatePetSystem(delta: number): void;
  updateMagicWeapon(input: InputState, delta: number): void;
  updateMagicBottleCapture(input: InputState, delta: number): void;
  updateBossHitByPlayers(time: number): void;
  updateHeroSkillProjectiles(input: InputState, time: number, delta: number): void;
  updateProjectileSystem(time: number, delta: number): void;
  updateMonster30s(delta: number): void;
  handleMedicineDebugKeys(): void;
  handleAuraDebugKeys(): void;
  handleStoneDebugKey(): void;
  handleConfiguredDropDebugKeys(): void;
  updateWorldDrops(delta: number): void;
  handleDropPickup(): void;
  applyAllMonster30Attacks(time: number): void;
  updateAllMonsterViews(): void;
  updateCapturablePetTargetViews(): void;
  updateMagicBottleEffectView(): void;
  updateDropViews(): void;
  updateVerticalClimbLogic(input: InputState, time: number, delta: number, previousCameraY: number): void;
  finalizeCameraPosition(): void;
  updateAttackEffectViews(time: number): void;
  updateAttackFlashes(time: number): void;
  handleInventoryUIKeys(): void;
  handlePetUIKeys(): void;
  canHandleSkillUI(): boolean;
  handleSkillUIKeys(): void;
  updateSkillBars(): void;
  updateSkillPanels(): void;
  updateBossArena(input: InputState, time: number, delta: number): void;
  updateBossArenaVisuals(): void;
  updateCloudVisuals(): void;
  updateInventoryPanel(): void;
  updatePetPanel(): void;
  updateSaveSystem(delta: number): void;
  updateStatusText(input: InputState): void;
  rememberInput(input: InputState): void;
};

export function createTestSceneUpdatePipeline(
  hooks: TestSceneUpdateHooks,
): TestSceneUpdatePipeline {
  return {
    run(time, delta, input, previousCameraY) {
      hooks.updateHeroDebugSelection();
      hooks.updateHeroMovement(input, time, delta);
      hooks.updateHeroCombatStates(time, delta);
      hooks.updateHeroNormalAttacks(input, time);
      hooks.updatePetSystem(delta);
      hooks.updateMagicWeapon(input, delta);
      hooks.updateMagicBottleCapture(input, delta);
      hooks.updateBossHitByPlayers(time);
      hooks.updateHeroSkillProjectiles(input, time, delta);
      hooks.updateProjectileSystem(time, delta);

      hooks.updateMonster30s(delta);
      hooks.handleMedicineDebugKeys();
      hooks.handleAuraDebugKeys();
      hooks.handleStoneDebugKey();
      hooks.handleConfiguredDropDebugKeys();
      hooks.updateWorldDrops(delta);
      hooks.handleDropPickup();
      hooks.applyAllMonster30Attacks(time);
      hooks.updateAllMonsterViews();
      hooks.updateCapturablePetTargetViews();
      hooks.updateMagicBottleEffectView();
      hooks.updateDropViews();
      hooks.updateVerticalClimbLogic(input, time, delta, previousCameraY);
      hooks.finalizeCameraPosition();

      hooks.updateAttackEffectViews(time);
      hooks.updateAttackFlashes(time);
      hooks.handleInventoryUIKeys();
      hooks.handlePetUIKeys();
      if (hooks.canHandleSkillUI()) {
        hooks.handleSkillUIKeys();
      }
      hooks.updateSkillBars();
      hooks.updateSkillPanels();
      hooks.updateBossArena(input, time, delta);
      hooks.updateBossArenaVisuals();
      hooks.updateCloudVisuals();
      hooks.updateInventoryPanel();
      hooks.updatePetPanel();
      hooks.updateSaveSystem(delta);
      hooks.updateStatusText(input);
      hooks.rememberInput(input);
    },
  };
}
