import type Phaser from 'phaser';
import { ProgressionTuning } from '../../systems/ProgressionSystem';
import {
  createCombatHudPlayerSnapshot,
  createCombatHudSkillBindings,
} from '../../systems/Stage1CombatHudSystem';
import {
  createStage1CombatHudBridge,
  type Stage1CombatHudBridge,
} from '../stage1/Stage1CombatHudBridge';

export function createTestSceneStage1HudBridge(scene: Phaser.Scene & any): Stage1CombatHudBridge {
  return createStage1CombatHudBridge(
    scene,
    () => scene.getPlayers().map((player: any) => createCombatHudPlayerSnapshot({
      slot: player.slot,
      hp: player.combat.hp,
      maxHp: player.combat.maxHp,
      mp: player.skill.mp,
      maxMp: player.skill.maxMp,
      level: player.progression.level,
      currentExp: player.progression.currentExp,
      expToNext: player.progression.expToNext,
      isMaxLevel: player.progression.level >= ProgressionTuning.maxLevel,
      skillBindings: createCombatHudSkillBindings(player.skill),
      magicWeaponAvailable: true,
      petAvailable: true,
    })),
    () => {
      const boss = scene.bossArena?.boss;
      if (!boss || scene.bossArena.state === 'inactive' || boss.state === 'removed') return [];
      return [{
        enemyId: 'stage11-monster3-boss',
        displayName: '巫鹰',
        hp: boss.hp,
        maxHp: boss.maxHp,
        spawnOrder: 0,
        isBoss: true,
      }];
    },
  );
}
