import { destroyMonster30Attacks } from '../../systems/Monster30AttackRuntime';
import { destroyMonster3Attacks } from '../../systems/Monster3AttackRuntime';
import { createBossArena, createVerticalClimbState } from '../../systems/LevelSystem';
import { createProjectileSystem } from '../../systems/ProjectileSystem';
import { createDropSystem } from '../../systems/DropSystem';
import { createHitRegistry } from '../../systems/CombatSystem';
import { disposeMonsterKnockback } from '../../systems/MonsterKnockbackBinding';
import { clearRosterPetRabbitJifeng } from '../../systems/PetRosterSystem';

/** Called after SHUTDOWN (DisplayList already destroyed its children), before creating new owners. */
export function resetTestSceneEncounter(scene: any, viewportHeight: number): void {
  scene.verticalClimb = createVerticalClimbState(viewportHeight);
  for (const monster of scene.monster30s ?? []) { destroyMonster30Attacks(monster); disposeMonsterKnockback(monster.petKnockback); }
  disposeMonsterKnockback(scene.bossArena?.boss?.petKnockback);
  if (scene.bossArena?.boss?.monster3AttackRuntime) destroyMonster3Attacks(scene.bossArena.boss.monster3AttackRuntime);
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
  clearRosterPetRabbitJifeng(scene.petRoster);
  clearRosterPetRabbitJifeng(scene.p2PetRoster);
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
