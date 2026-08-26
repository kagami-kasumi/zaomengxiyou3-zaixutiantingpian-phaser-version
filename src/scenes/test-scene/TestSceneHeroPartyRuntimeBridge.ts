// boundary: Stage 1-1 compatibility code reaches hero models only through this
// bridge; HeroPartyRuntime remains their lifecycle and visual owner.
import Phaser from 'phaser';
import type { HeroCombatModel } from '../../systems/HeroCombatSystem';
import type { HeroMovementBounds, HeroMovementModel, MovementPlatform } from '../../systems/HeroMovementSystem';
import type { HeroNormalAttackModel } from '../../systems/HeroNormalAttackSystem';
import type { HeroBaseStats } from '../../systems/EquipmentSystem';
import type { HeroProgressionModel } from '../../systems/ProgressionSystem';
import type { HeroSkillLoadout, HeroSkillModel } from '../../systems/HeroSkillSystem';
import type { InputState, PlayerSlot } from '../../systems/InputSystem';
import {
  getHeroBaseStats,
  getTestHeroSkillLoadoutPreset,
  isHeroCombatDead,
  takeRole2NormalAttackExtraMultiplier,
  updateHeroNormalAttack,
  updateRole5NormalAttackState,
  type HeroId,
} from './TestSceneSystems';
import { createHeroPartyRuntime, type HeroPartyRuntime } from '../HeroPartyRuntimeBridge';
import { createPlayerMarkerViews } from './TestSceneSetup';
import { STAGE11_GROUND_PLATFORM_ID, STAGE11_GROUND_TOP_Y } from '../../systems/Stage11Layout';
import { isRole3SspComboRequested } from '../../systems/Role3ImpactSkillSystem';
import { consumeRole3NextDamageMultiplier } from '../../systems/Role3ControlSkillSystem';
import { isRole1HytjRunAttackRequested, isRole1SlzComboRequested } from '../../systems/Role1BasicSkillSystem';
import { isRole5YybComboRequested, triggerRole5JrjlArrow } from '../../systems/Role5SkillSystem';
import { createAttackEffectView } from '../HeroNormalAttackVisualBridge';
import type { AttackEffectView } from '../HeroNormalAttackVisualBridge';
import { createAttackFlash, type AttackFlash } from './TestSceneViews';
import { toPhaserRect } from './TestSceneGeometry';
import type { ProjectileSystemModel } from '../../systems/ProjectileSystem';
import { isRole1ShadowQaEnabled } from './TestSceneConfig';
import {
  isRole5LoongSwordProjectileAttack,
  spawnRole5LoongSwordProjectile,
} from '../../systems/Role5NormalAttackProjectileSystem';

export type TestScenePlayerView = {
  slot: PlayerSlot;
  sprite: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  skill: HeroSkillModel;
  baseStats: HeroBaseStats;
  progression: HeroProgressionModel;
};

export type TestSceneHeroPartyRuntime = Readonly<{
  players: () => TestScenePlayerView[];
  updateMovement: (
    input: InputState,
    timeMs: number,
    deltaMs: number,
    platforms: readonly MovementPlatform[],
    bounds: HeroMovementBounds,
  ) => void;
  updateCombatStates: (
    timeMs: number,
    deltaMs: number,
    platforms: readonly MovementPlatform[],
    bounds: HeroMovementBounds,
  ) => void;
  updateNormalAttacks: (
    input: InputState,
    previousInput: InputState | undefined,
    timeMs: number,
    compatibility: Readonly<{
      attackEffectViews: AttackEffectView[];
      attackFlashes: AttackFlash[];
      projectileSystem: ProjectileSystemModel;
      applyHeroAttackHit: (player: TestScenePlayerView, timeMs: number) => void;
    }>,
  ) => void;
  syncVisuals: (timeMs: number) => void;
  destroy: () => void;
}>;

export function createTestSceneHeroPartyRuntime(
  scene: Phaser.Scene & any,
  playerCount: 1 | 2,
  heroIds: readonly HeroId[],
  restoreActiveSave = true,
): TestSceneHeroPartyRuntime {
  const role1ShadowQa = isRole1ShadowQaEnabled();
  const markers = createPlayerMarkerViews.call(scene, playerCount, heroIds);
  const runtime: HeroPartyRuntime = createHeroPartyRuntime(
    scene,
    markers.map((marker) => marker.sprite),
    {
      groundY: STAGE11_GROUND_TOP_Y,
      groundPlatformId: STAGE11_GROUND_PLATFORM_ID,
      memberWidth: 48,
      skillLoadoutFor: (heroId) => role1ShadowQa && heroId === 1
        ? createRole1ShadowQaLoadout()
        : getTestHeroSkillLoadoutPreset(heroId as HeroId, 0),
      restoreActiveSave,
    },
  );
  const players = runtime.compatibilityMembers().map((member, index): TestScenePlayerView => {
    const marker = markers[index]!;
    const progression = member.combat.progression;
    return {
      slot: member.combat.slot,
      sprite: marker.sprite,
      label: marker.label,
      movement: member.movement,
      combat: member.combat.combat,
      normalAttack: member.combat.normalAttack,
      skill: member.combat.skill,
      baseStats: getHeroBaseStats(member.combat.normalAttack.heroId, progression.level),
      progression,
    };
  });
  if (role1ShadowQa) {
    for (const player of players) {
      if (player.normalAttack.heroId !== 1) continue;
      player.combat.invulnerableUntilMs = Number.POSITIVE_INFINITY;
      player.skill.maxMp = 2_000;
      player.skill.mp = 2_000;
    }
  }

  return {
    players: () => players,
    updateMovement: (input, timeMs, deltaMs, platforms, bounds) => {
      runtime.updateMovement({
        inputs: [input.p1, input.p2],
        timeMs,
        deltaMs,
        environmentFor: () => ({ platforms, bounds }),
      });
    },
    updateCombatStates: (timeMs, deltaMs, platforms, bounds) => {
      runtime.updateCombatStates({
        timeMs,
        deltaMs,
        environmentFor: () => ({ platforms, bounds }),
      });
    },
    updateNormalAttacks: (input, previousInput, timeMs, compatibility) => {
      runtime.updatePets({
        targets: scene.createPetSkillTargets(),
        projectiles: compatibility.projectileSystem,
        timeMs,
        deltaMs: scene.game.loop.delta,
      });
      for (const player of players) {
        if (isHeroCombatDead(player.combat)) continue;
        if (isRole3SspComboRequested({
          heroId: player.normalAttack.heroId,
          skill: player.skill,
          input: input[player.slot],
          previousInput: previousInput?.[player.slot],
        })) continue;
        if (isRole1SlzComboRequested({
          heroId: player.normalAttack.heroId,
          skill: player.skill,
          input: input[player.slot],
          previousInput: previousInput?.[player.slot],
        })) continue;
        if (isRole1HytjRunAttackRequested({
          heroId: player.normalAttack.heroId,
          skill: player.skill,
          input: input[player.slot],
          previousInput: previousInput?.[player.slot],
          movement: player.movement,
        })) continue;
        if (isRole5YybComboRequested({
          heroId: player.normalAttack.heroId,
          skill: player.skill,
          input: input[player.slot],
          previousInput: previousInput?.[player.slot],
        })) continue;

        const attackEvent = updateHeroNormalAttack(
          player.normalAttack,
          input[player.slot],
          previousInput?.[player.slot],
          player.movement,
          timeMs,
          player.normalAttack.heroId === 2 ? {
            ...player.skill.learnedRole2Skills,
            sourcePower: player.baseStats.power,
            resource: player.skill,
            extraDamageMultiplier: () => takeRole2NormalAttackExtraMultiplier(player.skill),
          } : undefined,
          player.normalAttack.heroId === 3
            ? () => consumeRole3NextDamageMultiplier(player.skill.role3Runtime)
            : undefined,
        );

        if (attackEvent) {
          const enhanced = player.normalAttack.heroId === 5
            && player.skill.role5Runtime.loongSwordRemainingMs > 0;
          const loongSwordProjectile = spawnRole5LoongSwordProjectile(
            compatibility.projectileSystem,
            {
              sourceId: player.combat.id,
              x: player.movement.x,
              y: player.movement.y,
              facingX: player.movement.facingX,
            },
            attackEvent.attack,
            enhanced,
          );
          if (!loongSwordProjectile) {
            compatibility.attackEffectViews.push(createAttackEffectView(
              scene,
              { slot: player.slot, x: player.sprite.x, y: player.sprite.y },
              attackEvent.attack,
              getHeroTint(attackEvent.attack.heroId),
              enhanced,
            ));
            compatibility.attackFlashes.push(createAttackFlash(scene, toPhaserRect(attackEvent.hitbox), timeMs));
          }
          if (player.normalAttack.heroId === 5) {
            triggerRole5JrjlArrow({
              runtime: player.skill.role5Runtime,
              projectiles: compatibility.projectileSystem,
              point: {
                sourceId: player.combat.id,
                x: player.movement.x,
                y: player.movement.y,
                facingX: player.movement.facingX,
              },
              sourcePower: player.baseStats.power,
            });
          }
        }
        updateRole5NormalAttackState(player.normalAttack, scene.game.loop.delta);
        const activeAttack = player.normalAttack.activeAttack;
        const enhanced = player.skill.role5Runtime.loongSwordRemainingMs > 0;
        if (!activeAttack || !isRole5LoongSwordProjectileAttack(activeAttack, enhanced)) {
          compatibility.applyHeroAttackHit(player, timeMs);
        }
      }
      runtime.syncVisuals(timeMs);
    },
    syncVisuals: runtime.syncVisuals,
    destroy: () => {
      runtime.destroy();
      for (const marker of markers) marker.label.destroy();
      players.length = 0;
    },
  };
}

function createRole1ShadowQaLoadout(): HeroSkillLoadout {
  return {
    slots: [
      { skillName: 'qsez', level: 1 },
      { skillName: 'lyfb', level: 1 },
      { skillName: 'zz', level: 1 },
      null,
      null,
    ],
  };
}

function getHeroTint(heroId: HeroId): number {
  switch (heroId) {
    case 1:
      return 0xf4d35e;
    case 2:
      return 0xf3f6ff;
    case 3:
      return 0xee8f55;
    case 4:
      return 0x74c0fc;
    case 5:
      return 0x91f5d6;
  }
}
