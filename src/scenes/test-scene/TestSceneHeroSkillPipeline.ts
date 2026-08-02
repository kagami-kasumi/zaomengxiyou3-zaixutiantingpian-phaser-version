import type { InputState } from '../../systems/InputSystem';
import { createProjectileEffectView } from './TestSceneViews';
import { updateRole1SkillBridge } from './TestSceneRole1SkillBridge';
import { updateRole2SkillBridge } from './TestSceneRole2SkillBridge';
import { updateRole3SkillBridge } from './TestSceneRole3SkillBridge';
import { updateRole4SkillBridge } from './TestSceneRole4SkillBridge';
import { updateRole5SkillBridge } from './TestSceneRole5SkillBridge';
import { syncRole1ShadowVisuals } from './TestSceneRole1ShadowVisualBridge';
import { Role2BodyAnimations } from '../../systems/Role2CombatVisualSystem';
import { getRole3BodyActionDurationMs } from '../../systems/Role3CombatVisualSystem';
import { getRole4BodyActionDurationMs } from '../../systems/Role4CombatVisualSystem';
import { role4MdsBombAsset } from '../../assets/AssetManifest';

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
    targets: [
      ...this.monster30s
        .filter((monster: any) => monster.state !== 'dead' && monster.state !== 'removed')
        .map((monster: any) => ({
          id: monster.id,
          x: monster.x,
          y: monster.y,
          isBoss: false,
          isAlive: true,
        })),
      ...(this.bossArena.boss && this.bossArena.boss.state !== 'dead' && this.bossArena.boss.state !== 'removed'
        ? [{
          id: 'Monster3',
          x: this.bossArena.boss.x,
          y: this.bossArena.boss.y,
          isBoss: true,
          isAlive: true,
        }]
        : []),
    ],
    skillLearning,
    deltaMs: delta,
    timeMs: time,
  });
  for (const event of role1Events) {
    const sourceId = event.projectile.sourceId;
    const player = this.playerViews.find((candidate: any) => candidate.slot === sourceId);
    if (!player) continue;
    const remainingMs = Math.max(
      player.skill.role1Runtime.actionRemainingMs,
      player.skill.role1ShadowRuntime.actionRemainingMs,
      player.skill.role1FinisherRuntime.actionRemainingMs,
    );
    player.role1VisualAction = {
      actionName: event.actionName,
      startedAtMs: time,
      endsAtMs: time + remainingMs,
    };
  }
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
  for (const event of role2Result.castEvents) {
    const player = this.playerViews.find((candidate: any) => candidate.slot === event.projectile.sourceId);
    const sequence = Role2BodyAnimations[event.actionName];
    if (!player || !sequence) continue;
    const durationMs = sequence.holds.reduce((sum, hold) => sum + hold, 0) * (1000 / 30);
    player.role2VisualAction = {
      actionName: event.actionName,
      startedAtMs: time,
      endsAtMs: time + durationMs,
    };
  }
  const role3Events = updateRole3SkillBridge({
    players: this.playerViews,
    input,
    previousInput: this.lastInput,
    projectiles: this.projectileSystem,
    monsters: this.monster30s,
    skillLearning,
    deltaMs: delta,
  });
  for (const event of role3Events) {
    const player = this.playerViews.find((candidate: any) => candidate.slot === event.projectile.sourceId);
    const durationMs = getRole3BodyActionDurationMs(event.actionName);
    if (!player || durationMs <= 0) continue;
    player.role3VisualAction = {
      actionName: event.actionName,
      startedAtMs: time,
      endsAtMs: time + durationMs,
    };
  }
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
  for (const event of role4Result.castEvents) {
    const player = this.playerViews.find((candidate: any) => candidate.slot === event.projectile.sourceId);
    if (!player) continue;
    const durationMs = getRole4BodyActionDurationMs(event.actionName, player.normalAttack.weaponMode);
    if (durationMs <= 0) continue;
    player.role4VisualAction = {
      actionName: event.actionName,
      startedAtMs: time,
      endsAtMs: time + durationMs,
    };
  }
  for (const event of role4Result.poisonDamageEvents) {
    if (event.source !== 'poison-bomb') continue;
    const target = this.monster30s.find((monster: any) => monster.id === event.targetId);
    if (!target) continue;
    const view = this.add.image(
      target.x,
      target.y,
      role4MdsBombAsset.frameKeys[0],
    ).setOrigin(
      role4MdsBombAsset.registrationOrigin.x,
      role4MdsBombAsset.registrationOrigin.y,
    ).setDepth(49);
    let frame = 0;
    this.time.addEvent({
      delay: 1000 / 24,
      repeat: role4MdsBombAsset.frameKeys.length - 2,
      callback: () => {
        frame += 1;
        if (!view.active || target.state === 'dead' || target.state === 'removed') {
          view.destroy();
          return;
        }
        view.setPosition(target.x, target.y)
          .setTexture(role4MdsBombAsset.frameKeys[frame]!);
        if (frame === role4MdsBombAsset.frameKeys.length - 1) view.destroy();
      },
    });
  }
  const role5Result = updateRole5SkillBridge({
    players: this.playerViews,
    input,
    previousInput: this.lastInput,
    projectiles: this.projectileSystem,
    monsters: this.monster30s,
    deltaMs: delta,
    timeMs: time,
  });
  const projectiles = [
    ...role1Events.flatMap((event) => event.spawnedProjectiles ?? [event.projectile]),
    ...role2Result.castEvents.map((event) => event.projectile),
    ...role3Events.map((event) => event.projectile),
    ...role4Result.spawnedProjectiles,
    ...role5Result.spawnedProjectiles,
    ...role2Result.spawnedProjectiles,
  ];
  this.lastSkillEvent = role5Result.castEvents.at(-1)
    ?? role4Result.castEvents.at(-1)
    ?? role3Events.at(-1)
    ?? role2Result.castEvents.at(-1)
    ?? role1Events.at(-1)
    ?? this.lastSkillEvent;
  for (const projectile of projectiles) {
    if (!this.projectileEffectViews.some((view: any) => view.projectileId === projectile.id)) {
      const view = createProjectileEffectView(this, projectile);
      if (view) this.projectileEffectViews.push(view);
    }
  }
  syncRole1ShadowVisuals(this);
}
