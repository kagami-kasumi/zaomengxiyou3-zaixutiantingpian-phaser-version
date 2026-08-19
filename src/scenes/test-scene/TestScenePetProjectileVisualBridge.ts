// boundary: verified pet projectile presentation is independent of projectile
// collision/damage state; this bridge never mutates ProjectileModel.
import Phaser from 'phaser';
import {
  getPetMonkeyEffectUsages,
  isPetMonkeyProjectileAsset,
  type PetMonkeyEffectUsage,
} from '../../assets/PetMonkeyAnimationAssets';
import {
  getPetHorseEffectUsage,
  getPetHorseIceEffectAsset,
  isPetHorseProjectileAsset,
  type PetHorseEffectUsage,
} from '../../assets/PetHorseAnimationAssets';
import type { Monster30Model } from '../../systems/Monster30System';
import type { ProjectileModel } from '../../systems/ProjectileSystem';
import type { PetView } from './TestSceneViews';

type PetProjectileFrameView = Readonly<{
  image: Phaser.GameObjects.Image;
  usage: PetMonkeyEffectUsage | PetHorseEffectUsage;
}>;

type PetProjectileVisual = {
  projectileId: number;
  sourceId: string;
  facingX: -1 | 1;
  startedAt: number;
  expiresAt: number;
  baseX: number;
  baseY: number;
  horse: boolean;
  frames: readonly PetProjectileFrameView[];
};

const viewsByScene = new WeakMap<Phaser.Scene, Map<number, PetProjectileVisual>>();
const iceViewsByScene = new WeakMap<Phaser.Scene, Map<string, Phaser.GameObjects.Image>>();

export function syncPetProjectileVisuals(
  scene: Phaser.Scene,
  projectiles: readonly ProjectileModel[],
  petViews: readonly (PetView | undefined)[],
  monsters: readonly Monster30Model[],
): void {
  const views = getViews(scene);
  const now = scene.time.now;
  for (const projectile of projectiles) {
    const horse = isPetHorseProjectileAsset(projectile.assetKey);
    if ((!isPetMonkeyProjectileAsset(projectile.assetKey) && !horse) || views.has(projectile.id)) continue;
    const usages = horse
      ? [getPetHorseEffectUsage(projectile.assetKey)].filter((usage): usage is PetHorseEffectUsage => Boolean(usage))
      : getPetMonkeyEffectUsages(projectile.assetKey);
    if (usages.length === 0) continue;
    const durationMs = Math.max(...usages.map((usage) =>
      'loopsForFourSeconds' in usage && usage.loopsForFourSeconds
        ? 4_000
        : horse && usage.objectId === 'horse4-tmaoyi-falling'
          ? projectile.lifetimeMs
          : getFrameCount(usage) * (1000 / normalizeHostFps(scene.game.loop.targetFps))));
    const frames = usages.map((usage) => ({
      usage,
      image: createEffectImage(scene, usage),
    }));
    const source = petViews.find((view) =>
      view && view.kind !== 'placeholder' && view.petId === projectile.sourceId);
    views.set(projectile.id, {
      projectileId: projectile.id,
      sourceId: projectile.sourceId,
      facingX: projectile.facingX,
      startedAt: now,
      expiresAt: now + durationMs,
      baseX: horse && usages[0]?.objectId.startsWith('horse4-tmaoyi')
        ? projectile.x
        : source?.root.x ?? projectile.x,
      baseY: horse && usages[0]?.objectId === 'horse4-tmaoyi-falling'
        ? 50
        : horse && usages[0]?.objectId === 'horse4-tmaoyi-explode'
          ? projectile.y
          : source?.root.y ?? projectile.y,
      horse,
      frames,
    });
  }

  for (const [id, visual] of views) {
    if (now >= visual.expiresAt) {
      destroyVisual(visual);
      views.delete(id);
      continue;
    }
    const source = petViews.find((view) =>
      view && view.kind !== 'placeholder' && view.petId === visual.sourceId);
    const elapsed = now - visual.startedAt;
    for (const frameView of visual.frames) {
      const { usage, image } = frameView;
      const tickMs = 1000 / normalizeHostFps(scene.game.loop.targetFps);
      const frame = Math.floor(elapsed / tickMs) % getFrameCount(usage);
      const frameKey = getFrameKey(usage, frame);
      const origin = getFrameOrigin(usage, frame);
      const followsPet = 'followsPet' in usage && usage.followsPet;
      image.setTexture(frameKey)
        .setOrigin(origin.x, origin.y)
        .setPosition(
          (followsPet ? source?.root.x ?? visual.baseX : visual.baseX) + usage.offsetX * visual.facingX,
          (followsPet ? source?.root.y ?? visual.baseY : visual.baseY) + usage.offsetY,
        )
        .setFlipX('fixedDirection' in usage ? !usage.fixedDirection && visual.facingX > 0 : visual.facingX > 0)
        .setVisible(visual.horse || Boolean(source));
    }
  }
  syncHorseIceViews(scene, monsters);
}

export function destroyPetProjectileVisuals(scene: Phaser.Scene): void {
  const views = viewsByScene.get(scene);
  if (!views) return;
  for (const visual of views.values()) destroyVisual(visual);
  views.clear();
  viewsByScene.delete(scene);
  const iceViews = iceViewsByScene.get(scene);
  if (iceViews) {
    for (const view of iceViews.values()) view.destroy();
    iceViews.clear();
    iceViewsByScene.delete(scene);
  }
}

function getViews(scene: Phaser.Scene): Map<number, PetProjectileVisual> {
  let views = viewsByScene.get(scene);
  if (!views) {
    views = new Map();
    viewsByScene.set(scene, views);
  }
  return views;
}

function destroyVisual(visual: PetProjectileVisual): void {
  for (const frame of visual.frames) frame.image.destroy();
}

function createEffectImage(
  scene: Phaser.Scene,
  usage: PetMonkeyEffectUsage | PetHorseEffectUsage,
): Phaser.GameObjects.Image {
  const key = getFrameKey(usage, 0);
  const origin = getFrameOrigin(usage, 0);
  return scene.add.image(0, 0, key).setOrigin(origin.x, origin.y).setDepth(usage.depth);
}

function getFrameCount(usage: PetMonkeyEffectUsage | PetHorseEffectUsage): number {
  return 'frames' in usage.asset ? usage.asset.frames.length : usage.asset.frameKeys.length;
}

function getFrameKey(usage: PetMonkeyEffectUsage | PetHorseEffectUsage, index: number): string {
  return 'frames' in usage.asset ? usage.asset.frames[index]!.key : usage.asset.frameKeys[index]!;
}

function getFrameOrigin(
  usage: PetMonkeyEffectUsage | PetHorseEffectUsage,
  index: number,
): Readonly<{ x: number; y: number }> {
  return 'frames' in usage.asset
    ? usage.asset.frames[index]!.registrationOrigin
    : 'registrationOrigin' in usage ? usage.registrationOrigin : { x: 0.5, y: 0.5 };
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

function normalizeHostFps(value: number): number {
  if (value <= 22) return 20;
  if (value <= 27) return 24;
  return 30;
}
