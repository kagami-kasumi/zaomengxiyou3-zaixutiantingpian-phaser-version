import { createBossArena, createVerticalClimbState } from '../../systems/LevelSystem';
import { createProjectileSystem } from '../../systems/ProjectileSystem';
import { createDropSystem } from '../../systems/DropSystem';
import { createHitRegistry } from '../../systems/CombatSystem';

/** Called after SHUTDOWN (DisplayList already destroyed its children), before creating new owners. */
export function resetTestSceneEncounter(scene: any, viewportHeight: number): void {
  scene.verticalClimb = createVerticalClimbState(viewportHeight);
  scene.monster30s = [];
  scene.bossArena = createBossArena();
  scene.arenaWasActive = false;
  scene.bossSpawnedOnce = false;
  scene.projectileSystem = createProjectileSystem();
  scene.dropSystem = createDropSystem();
  scene.hitRegistry = createHitRegistry();
  scene.monster30AuraTargets.clear();
  scene.renderedMonsterAttackIds.clear();
  scene.lastInput = undefined;
  scene.lastDamageEvent = undefined;
  scene.lastSkillEvent = undefined;
  scene.petRuntime = undefined;
  scene.p2PetRuntime = undefined;
  scene.petView = undefined;
  scene.p2PetView = undefined;
  scene.capturablePetTargets = [];
  scene.capturablePetTargetViews.clear();
  scene.magicBottleEffectViews.clear();
  scene.magicWeaponPlatformViews.clear();
  scene.attackFlashes = [];
  scene.attackEffectViews = [];
  scene.projectileEffectViews = [];
  scene.cloudSprites = [];
  scene.cloudBaseY = [];
}
