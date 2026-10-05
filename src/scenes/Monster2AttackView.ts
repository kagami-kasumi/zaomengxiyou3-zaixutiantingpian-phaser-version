import type Phaser from 'phaser';
import { projectMonster2Attack } from '../systems/Monster2AttackProjection';
import type { Monster2Attack } from '../systems/Monster2AttackRuntime';

export type Monster2AttackViews = Map<string, Phaser.GameObjects.Image>;
export function syncMonster2AttackViews(scene: Phaser.Scene, views: Monster2AttackViews,
  attacks: readonly Monster2Attack[]): void {
  const alive = new Set(attacks.map(a => a.id));
  for (const [id, view] of views) if (!alive.has(id)) { view.destroy(); views.delete(id); }
  for (const attack of attacks) {
    const pose = projectMonster2Attack(attack);
    let view = views.get(attack.id);
    if (!view) {
      view = scene.add.image(pose.x, pose.y, pose.key).setOrigin(0).setDepth(19)
        .setName(`Monster2Bullet1_${attack.attack}`);
      views.set(attack.id, view);
    }
    view.setTexture(pose.key).setPosition(pose.x, pose.y).setVisible(!pose.emptyAlpha);
  }
}
export function destroyMonster2AttackViews(views: Monster2AttackViews): void {
  for (const view of views.values()) view.destroy();
  views.clear();
}
