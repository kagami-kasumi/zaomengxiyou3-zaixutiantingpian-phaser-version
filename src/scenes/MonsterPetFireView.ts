import type Phaser from 'phaser';
import fire from '../assets/pet-monkey-target-fire.json';
import type { MonsterPetTargetEffectState } from '../systems/MonsterPetTargetEffectSystem';

type View = { sprite: Phaser.GameObjects.Sprite; ice?: Phaser.GameObjects.Image };
type Target = { x: number; y: number; petTargetEffectState?: MonsterPetTargetEffectState };
type Attachment = { image: Phaser.GameObjects.Image; state: MonsterPetTargetEffectState; id: number;
  follow: (target: Target) => void; dispose: () => void };
const attachments = new WeakMap<View, Attachment>();

/** Native MovieClip playback continues during ordinary Scene pause. Damage does not. */
export function syncMonsterPetFireView(scene: Phaser.Scene, view: View, target: Target): void {
  if (!target.petTargetEffectState?.fireVisible) {
    destroyMonsterPetFireView(view);
    return;
  }
  let current = attachments.get(view);
  if (current && (current.state !== target.petTargetEffectState || current.id !== target.petTargetEffectState.fireDisplayId)) {
    destroyMonsterPetFireView(view);
    current = undefined;
  }
  if (current) {
    current.follow(target);
    current.image.setPosition(target.x, target.y).setVisible(view.sprite.visible);
    return;
  }
  for (const frame of fire.frames) {
    if (!scene.textures.exists(frame.key)) throw new Error(`Missing native FireBuff texture: ${frame.key}`);
  }
  const first = fire.frames[0]!;
  const image = scene.add.image(target.x, target.y, first.key)
    .setName(fire.symbol).setOrigin(-first.crop.left / first.width, -first.crop.top / first.height)
    .setDepth(view.sprite.depth).setVisible(view.sprite.visible);
  scene.children.moveAbove(image, view.ice ?? view.sprite);
  let lastTime = scene.game.loop.time;
  let followedTarget = target;
  const state = target.petTargetEffectState;
  const id = state.fireDisplayId;
  let ticks = 0;
  const onFrame = (time: number): void => {
    if (!followedTarget.petTargetEffectState?.fireVisible) {
      destroyMonsterPetFireView(view);
      return;
    }
    if (followedTarget.petTargetEffectState !== state || state.fireDisplayId !== id) {
      destroyMonsterPetFireView(view);
      syncMonsterPetFireView(scene, view, followedTarget);
      return;
    }
    ticks += Math.max(0, time - lastTime) * scene.game.loop.targetFps / 1000;
    lastTime = time;
    const frame = fire.frames[Math.floor(ticks + 1e-9) % fire.frames.length]!;
    image.setTexture(frame.key).setOrigin(-frame.crop.left / frame.width, -frame.crop.top / frame.height)
      .setPosition(followedTarget.x, followedTarget.y).setVisible(view.sprite.visible);
  };
  const onShutdown = (): void => destroyMonsterPetFireView(view);
  attachments.set(view, { image, state, id, follow: next => { followedTarget = next; }, dispose: () => {
    scene.game.events.off('poststep', onFrame);
    scene.events.off('shutdown', onShutdown);
    image.destroy();
  } });
  scene.game.events.on('poststep', onFrame);
  scene.events.once('shutdown', onShutdown);
  syncMonsterPetEffectOrder(scene, view, target);
}

/** Source addChild puts the latest created attachment above older attachments. */
export function syncMonsterPetEffectOrder(scene: Phaser.Scene, view: View, target: Target): void {
  const image = attachments.get(view)?.image;
  const state = target.petTargetEffectState;
  if (!image || !view.ice || !state) return;
  if (state.fireDisplayId > state.iceDisplayId) scene.children.moveAbove(image, view.ice);
  else scene.children.moveAbove(view.ice, image);
}

export function destroyMonsterPetFireView(view: View): void {
  const attachment = attachments.get(view);
  if (!attachment) return;
  attachments.delete(view);
  attachment.dispose();
}
