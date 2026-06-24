import type { InputState } from '../../systems/InputSystem';
import { createProjectileEffectView } from './TestSceneViews';
import { updateRole1SkillBridge } from './TestSceneRole1SkillBridge';
import { updateRole2SkillBridge } from './TestSceneRole2SkillBridge';
import { updateRole3SkillBridge } from './TestSceneRole3SkillBridge';
import { updateRole4SkillBridge } from './TestSceneRole4SkillBridge';

export function updateHeroSkillProjectiles(
  this: any,
  input: InputState,
  time: number,
  delta: number,
): void {
  const skillLearning = { p1: this.p1SkillLearning, p2: this.p2SkillLearning };
  const role1Events = updateRole1SkillBridge({
    players: this.playerViews,
    input,
    previousInput: this.lastInput,
    projectiles: this.projectileSystem,
    skillLearning,
    deltaMs: delta,
  });
  const role2Result = updateRole2SkillBridge({
    players: this.playerViews,
    input,
    previousInput: this.lastInput,
    projectiles: this.projectileSystem,
    monsters: this.monster30s,
    petRosters: this.playerPetRosters,
    petRuntimes: { p1: this.petRuntime, p2: this.p2PetRuntime },
    skillLearning,
    deltaMs: delta,
    timeMs: time,
  });
  const role3Events = updateRole3SkillBridge({
    players: this.playerViews,
    input,
    previousInput: this.lastInput,
    projectiles: this.projectileSystem,
    monsters: this.monster30s,
    skillLearning,
    deltaMs: delta,
  });
  const role4Result = updateRole4SkillBridge({
    players: this.playerViews,
    input,
    previousInput: this.lastInput,
    projectiles: this.projectileSystem,
    monsters: this.monster30s,
    skillLearning,
    deltaMs: delta,
    timeMs: time,
  });
  const projectiles = [
    ...role1Events.map((event) => event.projectile),
    ...role2Result.castEvents.map((event) => event.projectile),
    ...role3Events.map((event) => event.projectile),
    ...role4Result.spawnedProjectiles,
    ...role2Result.spawnedProjectiles,
  ];
  this.lastSkillEvent = role4Result.castEvents.at(-1)
    ?? role3Events.at(-1)
    ?? role2Result.castEvents.at(-1)
    ?? role1Events.at(-1)
    ?? this.lastSkillEvent;
  for (const projectile of projectiles) {
    if (!this.projectileEffectViews.some((view: any) => view.projectileId === projectile.id)) {
      this.projectileEffectViews.push(createProjectileEffectView(this, projectile));
    }
  }
}
