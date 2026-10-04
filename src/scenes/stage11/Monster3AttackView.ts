import type Phaser from 'phaser';
import type { Monster3AttackRuntime } from '../../systems/Monster3AttackRuntime';
import { projectMonster3Attack } from '../../systems/Monster3AttackProjection';

export type Monster3AttackViews = Map<string, Phaser.GameObjects.Image>;

/** Pure projection of the already stepped attacks; repeated paint never emits or advances. */
export function syncMonster3AttackViews(scene: Phaser.Scene, views: Monster3AttackViews,
  runtime: Readonly<Monster3AttackRuntime>): void {
  const live = new Set(runtime.attacks.map(a => a.id));
  for (const [id, view] of views) if (!live.has(id)) { view.destroy(); views.delete(id); }
  for (const attack of runtime.attacks) {
    const pose = projectMonster3Attack(attack);
    let view = views.get(attack.id);
    if (!view) {
      view = scene.add.image(pose.x, pose.y, pose.key).setName(`Monster3Bullet${attack.action === 'hit1' ? 1 : 2}`)
        .setOrigin(0, 0).setDepth(19);
      views.set(attack.id, view);
    }
    view.setTexture(pose.key).setPosition(pose.x, pose.y).setFlipX(false).setAlpha(1);
  }
}

export function destroyMonster3AttackViews(views: Monster3AttackViews): void {
  for (const view of views.values()) view.destroy();
  views.clear();
}
