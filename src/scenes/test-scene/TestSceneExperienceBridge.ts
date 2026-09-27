import { addHeroExperience } from '../../systems/ProgressionSystem';
import type { PlayerSlot } from '../../systems/InputSystem';
import type Phaser from 'phaser';
import { readHeroPartyExperience } from '../HeroPartyRuntimeBridge';
import { acceptMonsterAttackTarget, type MonsterAttackTarget, type MonsterExperienceHost } from '../../systems/MonsterExperienceSystem';

export function bindTestSceneMonsterExperience(scene: Phaser.Scene, monster: MonsterExperienceHost,
  experience: number): void {
  readHeroPartyExperience(scene)?.bind(monster, experience);
}

export function acceptTestSceneMonsterAttacker(scene: Phaser.Scene, monster: MonsterExperienceHost,
  experience: number, sourceId: string, captured?: MonsterAttackTarget): void {
  bindTestSceneMonsterExperience(scene, monster, experience);
  acceptMonsterAttackTarget(monster, captured ?? monster.experienceBinding?.heroes().find(hero => hero.ownerSlot === sourceId));
}

export function awardTestSceneHeroExperience(scene: any, slot: PlayerSlot, amount: number): void {
  const player = scene.getPlayer(slot);
  if (!player) return;
  const result = addHeroExperience(player.progression, amount);
  if (result.levelsGained > 0) {
    player.baseStats = result.baseStatsAfter;
    scene.syncPlayerEffectiveStats(player, { refill: true });
  }
}
