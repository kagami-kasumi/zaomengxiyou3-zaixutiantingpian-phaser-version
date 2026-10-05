import Phaser from 'phaser';
import { createPetWorldDisplayBridge } from './PetWorldDisplayBridge';
import { createMonster2RawDisplay, enterMonster2RawDisplay, exitMonster2RawDisplay,
  destroyMonster2RawDisplay, type Monster2RawDisplay } from '../systems/Monster2RawDisplay';
import type { Monster2RawSpawn } from '../systems/Monster2AttackRuntime';
import { projectMonster2Attack } from '../systems/Monster2AttackProjection';

/** Scene-owned naked MovieClips outlive the emitting monster, but never the Scene. */
export function createMonster2RawDisplayBridge(scene: Phaser.Scene) {
  const clock = createPetWorldDisplayBridge(scene);
  const entries: { raw: Monster2RawDisplay; born: number; image: Phaser.GameObjects.Image }[] = [];
  let destroyed = false;
  const paint = (entry: typeof entries[number]) => {
    const pose = projectMonster2Attack({ ...entry.raw, attack: 3 });
    entry.image.setTexture(pose.key).setPosition(pose.x, pose.y).setVisible(!pose.emptyAlpha);
  };
  const enter = () => {
    for (const entry of entries) {
      const elapsed = Math.floor(clock.readTick() - entry.born + 1e-8);
      while (entry.raw.age < elapsed && entry.raw.age < 14) enterMonster2RawDisplay(entry.raw);
      paint(entry);
    }
  };
  const exit = () => {
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i]!;
      exitMonster2RawDisplay(entry.raw);
      if (entry.raw.destroyed) { entry.image.destroy(); entries.splice(i, 1); }
    }
  };
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    for (const entry of entries) { destroyMonster2RawDisplay(entry.raw); entry.image.destroy(); }
    entries.length = 0;
    clock.destroy();
    scene.game.events.off('prestep', enter);
    scene.game.events.off('poststep', exit);
    scene.events.off(Phaser.Scenes.Events.SHUTDOWN, destroy);
  };
  scene.game.events.on('prestep', enter);
  scene.game.events.on('poststep', exit);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, destroy);
  return {
    emit: (spawn: Monster2RawSpawn) => {
      if (destroyed) return;
      const raw = createMonster2RawDisplay(spawn);
      const pose = projectMonster2Attack({ ...raw, attack: 3 });
      const image = scene.add.image(pose.x, pose.y, pose.key).setOrigin(0).setDepth(19).setName('Monster2Bullet2');
      const entry = { raw, born: clock.readTick(), image };
      entries.push(entry); paint(entry);
    },
    snapshot: () => entries.map(entry => ({ ...entry.raw })),
    destroy,
  };
}
