import type Phaser from 'phaser';
import { getPetGroundEnvironment } from '../assets/PetGroundEnvironmentAssets';
import { STAGE11_SCENE_OFFSET_Y } from '../systems/Stage11Layout';
import { bindMonsterKnockback, disposeMonsterKnockback, type MonsterKnockbackBinding } from '../systems/MonsterKnockbackBinding';
import { getMonsterKnockbackProfile } from '../systems/MonsterKnockbackSystem';
import { createStage1CombatEnemy } from '../systems/Stage1CombatSystem';

export function createSceneMonsterKnockback(scene: Phaser.Scene, level: 11 | 12 | 13 | 21 | 22,
  monsterId: number, position: Readonly<{ x: number; y: number }>): MonsterKnockbackBinding {
  const sourceOffsetY = level === 11 ? STAGE11_SCENE_OFFSET_Y : 0;
  const walls = getPetGroundEnvironment(level).walls.map(wall => ({ ...wall,
    top: wall.top - sourceOffsetY, bottom: wall.bottom - sourceOffsetY }));
  const binding = bindMonsterKnockback(getMonsterKnockbackProfile(monsterId, Math.floor(level / 10), level % 10),
    position, walls, () => {
      const camera = scene.cameras.main;
      return { x: camera.x - camera.scrollX, y: camera.y - camera.scrollY + sourceOffsetY };
    }, sourceOffsetY);
  const shutdown = () => disposeMonsterKnockback(binding);
  scene.events.once('shutdown', shutdown);
  binding.onDispose = () => scene.events.off('shutdown', shutdown);
  return binding;
}

export function createSceneMonsterCombat(scene: Phaser.Scene, level: 11 | 12 | 13 | 21 | 22,
  params: Parameters<typeof createStage1CombatEnemy>[0]) {
  const enemy = createStage1CombatEnemy(params);
  enemy.petKnockback = createSceneMonsterKnockback(scene, level, enemy.enemyType, enemy);
  return enemy;
}
