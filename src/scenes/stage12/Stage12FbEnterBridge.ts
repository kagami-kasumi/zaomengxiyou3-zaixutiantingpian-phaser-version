import Phaser from 'phaser';
import { stage12Assets } from '../../assets/AssetManifest';
import type { PlayerInputState } from '../../systems/InputSystem';
import {
  createStage12FbEnter,
  registerStage12FbEnterHit,
  Stage12FbEnterStayFrames,
  updateStage12FbEnter,
  type Stage12FbEnterModel,
} from '../../systems/Stage12FbEnterSystem';
import { stage12FbEnter } from '../../systems/Stage12Layout';

export type Stage12FbEnterHandle = Readonly<{
  model: Stage12FbEnterModel;
  update: (
    deltaMs: number,
    inputs: readonly PlayerInputState[],
    activePlayers: readonly boolean[],
  ) => boolean;
  destroy: () => void;
}>;

const collisionWorldX = stage12FbEnter.x + stage12FbEnter.collision.x;
const playerStayRange = 105;
const projectileSpeed = 560;
const projectileMaxTravel = 650;

type FbProjectile = {
  view: Phaser.GameObjects.Arc;
  originX: number;
  direction: -1 | 1;
  crossedEntrance: boolean;
};

export function createStage12FbEnterBridge(
  scene: Phaser.Scene,
  image: Phaser.GameObjects.Image,
  playerViews: readonly Phaser.GameObjects.Image[],
): Stage12FbEnterHandle {
  const model = createStage12FbEnter();
  const status = scene.add.text(18, 86, '', {
    color: '#f6d890', fontFamily: 'Arial, sans-serif', fontSize: '14px',
    backgroundColor: '#101724cc', padding: { x: 8, y: 5 },
  }).setScrollFactor(0).setDepth(100);
  const projectiles: FbProjectile[] = [];
  const previousMagicWeapon = playerViews.map(() => false);
  let lastFrameIndex = -1;

  const update = (
    deltaMs: number,
    inputs: readonly PlayerInputState[],
    activePlayers: readonly boolean[],
  ): boolean => {
    if (model.phase === 'sealed') {
      playerViews.forEach((player, index) => {
        const pressed = inputs[index]?.magicWeapon === true;
        if (activePlayers[index] && pressed && !previousMagicWeapon[index]) {
          projectiles.push(createProjectile(scene, player.x, player.y));
        }
        previousMagicWeapon[index] = pressed;
      });
    }
    updateProjectiles(projectiles, model, image, deltaMs);

    const insidePlayerCount = playerViews.filter(
      (player, index) => activePlayers[index]
        && Math.abs(player.x - collisionWorldX) <= playerStayRange,
    ).length;
    const transitioned = updateStage12FbEnter(model, deltaMs, insidePlayerCount);
    updateFrame(image, model);
    if (model.hitCooldownRemainingMs === 0) image.clearTint();
    updateStatus(status, model);
    return transitioned;
  };

  function updateFrame(target: Phaser.GameObjects.Image, state: Stage12FbEnterModel): void {
    if (state.frameIndex === lastFrameIndex) return;
    lastFrameIndex = state.frameIndex;
    target.setTexture(stage12Assets.fbEnter.frameKeys[state.frameIndex]);
  }

  updateStatus(status, model);
  updateFrame(image, model);
  return {
    model,
    update,
    destroy: () => {
      status.destroy();
      for (const projectile of projectiles) projectile.view.destroy();
      projectiles.length = 0;
    },
  };
}

function createProjectile(scene: Phaser.Scene, x: number, y: number): FbProjectile {
  const direction: -1 | 1 = x <= collisionWorldX ? 1 : -1;
  const view = scene.add.circle(x + direction * 34, y - 8, 9, 0xffdc73)
    .setStrokeStyle(2, 0xffffff)
    .setDepth(24);
  return { view, originX: view.x, direction, crossedEntrance: false };
}

function updateProjectiles(
  projectiles: FbProjectile[],
  model: Stage12FbEnterModel,
  entrance: Phaser.GameObjects.Image,
  deltaMs: number,
): void {
  for (let index = projectiles.length - 1; index >= 0; index -= 1) {
    const projectile = projectiles[index];
    const previousX = projectile.view.x;
    projectile.view.x += projectile.direction * projectileSpeed * Math.max(0, deltaMs) / 1_000;
    const atEntrance = Math.min(previousX, projectile.view.x) <= collisionWorldX + 18
      && Math.max(previousX, projectile.view.x) >= collisionWorldX - 18;
    if (atEntrance && !projectile.crossedEntrance) {
      projectile.crossedEntrance = true;
      if (registerStage12FbEnterHit(model)) entrance.setTint(0xffe596);
    }
    const passedEntrance = projectile.direction > 0
      ? projectile.view.x > collisionWorldX + 60
      : projectile.view.x < collisionWorldX - 60;
    const expired = Math.abs(projectile.view.x - projectile.originX) >= projectileMaxTravel;
    if (!passedEntrance && !expired) continue;
    projectile.view.destroy();
    projectiles.splice(index, 1);
  }
}

function updateStatus(status: Phaser.GameObjects.Text, model: Stage12FbEnterModel): void {
  if (model.phase === 'sealed') {
    status.setText(`特殊入口：靠近后按 H / 小键盘7 发射弹体 · 剩余 ${model.remainingHits}/5`);
  } else if (model.phase === 'opening') {
    status.setText(`特殊入口开启中 · ${model.frameIndex + 1}/30 帧`);
  } else if (model.phase === 'open') {
    status.setText(`特殊入口已开放 · 连续驻留 ${Stage12FbEnterStayFrames - model.stayFramesRemaining}/72 帧`);
  } else {
    status.setText('特殊入口传送至 Stage 5-1');
  }
}
