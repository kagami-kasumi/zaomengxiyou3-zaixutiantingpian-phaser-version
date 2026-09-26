// boundary: TestScene ice presentation only. Monkey/horse bodies and projectile
// visuals use the same formal bridge as every playable level.
import Phaser from 'phaser';
import { getPetHorseIceEffectAsset } from '../../assets/PetHorseAnimationAssets';
import type { Monster30Model } from '../../systems/Monster30System';
import type { ProjectileModel } from '../../systems/ProjectileSystem';
import type { PetView } from './TestSceneViews';

const iceViewsByScene = new WeakMap<Phaser.Scene, Map<string, Phaser.GameObjects.Image>>();

export function syncPetProjectileVisuals(
  scene: Phaser.Scene,
  _projectiles: readonly ProjectileModel[],
  _petViews: readonly (PetView | undefined)[],
  monsters: readonly Monster30Model[],
): void {
  syncHorseIceViews(scene, monsters);
}

export function destroyPetProjectileVisuals(scene: Phaser.Scene): void {
  const views = iceViewsByScene.get(scene);
  if (!views) return;
  for (const view of views.values()) view.destroy();
  views.clear();
  iceViewsByScene.delete(scene);
}

function syncHorseIceViews(scene: Phaser.Scene, monsters: readonly Monster30Model[]): void {
  let views = iceViewsByScene.get(scene);
  if (!views) {
    views = new Map();
    iceViewsByScene.set(scene, views);
  }
  const activeIds = new Set(monsters.filter((monster) => Boolean(monster.magicSnowIce)).map((monster) => monster.id));
  const asset = getPetHorseIceEffectAsset();
  const frame = asset.frames[0]!;
  for (const monster of monsters) {
    if (!monster.magicSnowIce) continue;
    let view = views.get(monster.id);
    if (!view) {
      view = scene.add.image(monster.x, monster.y, frame.key)
        .setOrigin(frame.registrationOrigin.x, frame.registrationOrigin.y)
        .setDisplaySize(60, 80)
        .setDepth(46)
        .setName('PetHorseIceEffect')
        .setData('petHorseTruthState', 'object.shared-ice.active');
      views.set(monster.id, view);
    }
    view.setPosition(monster.x, monster.y);
  }
  for (const [id, view] of views) {
    if (activeIds.has(id)) continue;
    view.destroy();
    views.delete(id);
  }
}
