// boundary: view factories create Phaser display objects only; they do not own
// gameplay state transitions.
import Phaser from 'phaser';
import {
  PickupAssetKeys,
  pickupAssets,
  role1NormalAttackAssets,
  Stage13AssetKeys,
} from '../../assets/AssetManifest';
import type { WorldDrop } from '../../systems/DropSystem';
import type { ActiveHeroNormalAttack } from '../../systems/HeroNormalAttackSystem';
import type { PlayerSlot } from '../../systems/InputSystem';
import type { Monster30Model } from '../../systems/Monster30System';
import type { PetState } from '../../systems/PetSystem';
import type { ProjectileModel } from '../../systems/ProjectileSystem';
import { stage11TransferDoor } from '../../systems/Stage11Layout';

export type MonsterView = {
  root: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Ellipse;
  wingLeft: Phaser.GameObjects.Ellipse;
  wingRight: Phaser.GameObjects.Ellipse;
  eye: Phaser.GameObjects.Ellipse;
  hpTrack: Phaser.GameObjects.Rectangle;
  hpFill: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  stateText: Phaser.GameObjects.Text;
};

export type BossView = {
  body: Phaser.GameObjects.Ellipse;
  crown: Phaser.GameObjects.Ellipse;
  eye: Phaser.GameObjects.Ellipse;
  hpTrack: Phaser.GameObjects.Rectangle;
  hpFill: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  stateText: Phaser.GameObjects.Text;
};

export type TransferDoorView = {
  door: Phaser.GameObjects.Image;
};

export type PetView = {
  root: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Ellipse;
  ear: Phaser.GameObjects.Ellipse;
  eye: Phaser.GameObjects.Ellipse;
  label: Phaser.GameObjects.Text;
};

export type DropView = {
  root: Phaser.GameObjects.Container;
  shadow: Phaser.GameObjects.Ellipse;
  body: Phaser.GameObjects.Ellipse;
  shine: Phaser.GameObjects.Ellipse;
  label: Phaser.GameObjects.Text;
  feedback: Phaser.GameObjects.Text;
  sprite?: Phaser.GameObjects.Image;
};

export type AttackFlash = {
  shape: Phaser.GameObjects.Rectangle;
  expiresAt: number;
};

export type AttackEffectView = {
  slot: PlayerSlot;
  attack: ActiveHeroNormalAttack;
  shape: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Ellipse | Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
  frameKeys?: readonly string[];
};

export type ProjectileEffectView = {
  projectileId: number;
  shape: Phaser.GameObjects.Ellipse;
  core: Phaser.GameObjects.Ellipse;
  label: Phaser.GameObjects.Text;
};

export function drawBossArenaStage(scene: Phaser.Scene): void {
  scene.add.rectangle(470, 200, 760, 8, 0xd4a574);
  scene.add.rectangle(470, 280, 560, 6, 0x888c94);
  scene.add.rectangle(470, 220, 940, 20, 0x101724, 0.3);
  scene.add.text(180, 164, 'BOSS ARENA', {
    color: '#d4a574',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
  });
  scene.add.text(470, 190, '↑ enter to trigger ↑', {
    color: '#8a9bb5',
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
  }).setOrigin(0.5, 0.5);
}

export function createMonsterView(
  scene: Phaser.Scene,
  monster: Monster30Model,
): MonsterView {
  const root = scene.add.container(monster.x, monster.y);
  const wingLeft = scene.add.ellipse(-28, 2, 34, 18, 0x445d7e);
  const wingRight = scene.add.ellipse(28, 2, 34, 18, 0x445d7e);
  const body = scene.add.ellipse(0, 0, 72, 56, 0x7b4e79);
  const eye = scene.add.ellipse(14, -8, 12, 12, 0xf5d27a);
  const hpTrack = scene.add.rectangle(0, -48, 82, 8, 0x182233);
  const hpFill = scene.add.rectangle(-41, -48, 82, 8, 0xe3646d);
  hpFill.setOrigin(0, 0.5);
  const label = scene.add.text(-42, -78, 'Monster30', {
    color: '#f3f6ff',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
  });
  const stateText = scene.add.text(-42, -62, '', {
    color: '#c8d3e2',
    fontFamily: 'Arial, sans-serif',
    fontSize: '13px',
  });

  root.add([wingLeft, wingRight, body, eye, hpTrack, hpFill, label, stateText]);

  return {
    root,
    body,
    wingLeft,
    wingRight,
    eye,
    hpTrack,
    hpFill,
    label,
    stateText,
  };
}

export function createBossView(scene: Phaser.Scene): BossView {
  const body = scene.add.ellipse(470, 120, 90, 70, 0x8b2252);
  const crown = scene.add.ellipse(470, 72, 48, 32, 0xd4a574);
  const eye = scene.add.ellipse(482, 108, 14, 14, 0xf5d27a);
  const hpTrack = scene.add.rectangle(470, 48, 96, 8, 0x182233);
  const hpFill = scene.add.rectangle(422, 48, 96, 8, 0xe3646d);
  hpFill.setOrigin(0, 0.5);
  const label = scene.add.text(410, 18, 'Monster3 巫鹰', {
    color: '#f3f6ff',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
  });
  const stateText = scene.add.text(410, 34, '', {
    color: '#c8d3e2',
    fontFamily: 'Arial, sans-serif',
    fontSize: '13px',
  });

  body.setVisible(false);
  crown.setVisible(false);
  eye.setVisible(false);
  hpTrack.setVisible(false);
  hpFill.setVisible(false);
  label.setVisible(false);
  stateText.setVisible(false);

  return { body, crown, eye, hpTrack, hpFill, label, stateText };
}

export function createTransferDoorView(scene: Phaser.Scene): TransferDoorView {
  const { left, right, top, bottom } = stage11TransferDoor.bounds;
  const centerX = (left + right) / 2;
  const centerY = (top + bottom) / 2;
  const width = right - left;
  const height = bottom - top;
  const door = scene.add.image(centerX, centerY, Stage13AssetKeys.transferDoor)
    .setName('stage11-transfer-door')
    .setDisplaySize(width, height)
    .setVisible(false);
  return { door };
}

export function createPetView(
  scene: Phaser.Scene,
  activePet: Pick<PetState, 'displayName'>,
  x: number,
  y: number,
): PetView {
  const root = scene.add.container(x, y);
  const body = scene.add.ellipse(0, 0, 38, 30, 0x7ad7a8, 0.9);
  const ear = scene.add.ellipse(-10, -18, 15, 12, 0xf3f6ff, 0.45);
  const eye = scene.add.ellipse(8, -4, 6, 6, 0x182233, 0.9);
  const label = scene.add.text(-36, -46, `${activePet.displayName} idle`, {
    color: '#dff7ef',
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
  });

  body.setStrokeStyle(2, 0xdff7ef, 0.9);
  root.add([body, ear, eye, label]);
  root.setDepth(42);
  return { root, body, ear, eye, label };
}

export function createDropView(
  scene: Phaser.Scene,
  drop: WorldDrop,
  labelText: string,
): DropView {
  const root = scene.add.container(drop.x, drop.y);
  const color = getDropColor(drop);
  const shadow = scene.add.ellipse(0, 18, 44, 10, 0x000000, 0.22);
  const body = scene.add.ellipse(0, 0, 30, 24, color, 0.88);
  const shine = scene.add.ellipse(-6, -5, 9, 6, 0xf3f6ff, 0.46);
  const pickupTexture = getPickupTexture(drop);
  const sprite = pickupTexture ? scene.add.image(0, 0, pickupTexture) : undefined;
  const label = scene.add.text(-46, -40, labelText, {
    color: '#f3f6ff',
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
  });
  const feedback = scene.add.text(-52, -60, '', {
    color: '#f2c14e',
    fontFamily: 'Arial, sans-serif',
    fontSize: '13px',
  });

  body.setStrokeStyle(2, color, 1);
  if (sprite) {
    body.setVisible(false);
    shine.setVisible(false);
  }
  root.add([shadow, body, shine]);
  if (sprite) root.add(sprite);
  root.add([label, feedback]);
  root.setDepth(44);
  return { root, shadow, body, shine, label, feedback, sprite };
}

export function syncDropView(
  drop: WorldDrop,
  view: DropView,
  alpha: number,
  labelText: string,
): void {
  view.root.setPosition(drop.x, drop.y);
  view.root.setAlpha(alpha);
  view.shadow.setVisible(drop.state === 'idle');
  view.body.setFillStyle(getDropColor(drop), drop.state === 'idle' ? 0.88 : 0.4);
  view.body.setScale(drop.state === 'idle' ? 1 + Math.sin(drop.ageMs * 0.006) * 0.05 : 1);
  view.shine.setVisible(drop.state === 'idle');
  if (view.sprite) {
    const texture = getPickupTexture(drop);
    if (texture && view.sprite.texture.key !== texture) view.sprite.setTexture(texture);
    view.sprite.setVisible(drop.state === 'idle');
    view.body.setVisible(false);
    view.shine.setVisible(false);
  }
  view.label.setText(view.sprite ? '' : labelText);
  view.feedback.setText(drop.state === 'picked' ? drop.feedback : '');
}

function getPickupTexture(drop: WorldDrop): string | undefined {
  if (drop.kind === 'medicine') {
    if (drop.fillName === 'BigHP') return PickupAssetKeys.healthBig;
    return drop.fillName === 'SmallMP' ? PickupAssetKeys.manaSmall : PickupAssetKeys.healthSmall;
  }
  if (drop.kind !== 'aura') return undefined;
  const asset = drop.auraType === 'red' ? pickupAssets.soulPrimary : pickupAssets.soulBonus;
  return asset.frameKeys[Math.floor(drop.ageMs / 50) % asset.frameKeys.length];
}

export function destroyDropView(view: DropView): void {
  view.root.destroy(true);
}

export function getDropColor(drop: WorldDrop): number {
  if (drop.kind === 'medicine') {
    return drop.medicine.color;
  }

  if (drop.kind === 'aura') {
    return drop.auraType === 'red' ? 0xff4f5f : 0xf3f6ff;
  }

  if (drop.fillName === 'wpqhs1') {
    return 0xb69cff;
  }

  return drop.bigType === 'zb' ? 0xf2c14e : 0x72d2b1;
}

export function createAttackEffectView(
  scene: Phaser.Scene,
  player: {
    slot: PlayerSlot;
    x: number;
    y: number;
  },
  attack: ActiveHeroNormalAttack,
  effectColor: number,
): AttackEffectView {
  const frameAsset = role1NormalAttackAssets[attack.effectKey as keyof typeof role1NormalAttackAssets];
  const shape = frameAsset
    ? scene.add.image(
      player.x + attack.facingX * 82,
      player.y - 80,
      frameAsset.frameKeys[0],
    ).setFlipX(attack.facingX < 0)
    : attack.followsHero
    ? scene.add.ellipse(player.x + attack.facingX * 82, player.y - 80, 86, 36, effectColor, 0.35)
    : scene.add.rectangle(player.x + attack.facingX * 105, player.y - 82, 102, 42, effectColor, 0.28);
  const label = scene.add.text(player.x + attack.facingX * 54, player.y - 128, attack.actionName, {
    color: '#f3f6ff',
    fontFamily: 'Arial, sans-serif',
    fontSize: '13px',
  });

  if ('setStrokeStyle' in shape) {
    shape.setStrokeStyle(2, effectColor, 0.9);
  }

  return {
    slot: player.slot,
    attack,
    shape,
    label,
    frameKeys: frameAsset?.frameKeys,
  };
}

export function syncAttackEffectFrame(effectView: AttackEffectView, time: number): void {
  if (!effectView.frameKeys || !(effectView.shape instanceof Phaser.GameObjects.Image)) {
    return;
  }

  const duration = effectView.attack.endsAtMs - effectView.attack.startedAtMs;
  const progress = Math.min(Math.max((time - effectView.attack.startedAtMs) / duration, 0), 0.999);
  const frameIndex = Math.floor(progress * effectView.frameKeys.length);
  effectView.shape.setTexture(effectView.frameKeys[frameIndex]);
}

export function createProjectileEffectView(
  scene: Phaser.Scene,
  projectile: ProjectileModel,
): ProjectileEffectView {
  const isMovingProjectile = projectile.velocityX !== 0 || projectile.velocityY !== 0;
  const isSnow = projectile.variant === 'magic-weapon-snow';
  const color = isSnow ? 0xdff7ff : isMovingProjectile ? 0xf2c14e : 0x7ee7ff;
  const shape = scene.add.ellipse(
    projectile.x,
    projectile.y,
    projectile.width,
    projectile.height,
    color,
    0.18,
  );
  const core = scene.add.ellipse(
    projectile.x,
    projectile.y,
    projectile.width * (isSnow ? 0.32 : 0.48),
    projectile.height * (isSnow ? 0.32 : 0.34),
    0xf3f6ff,
    isSnow ? 0.52 : 0.28,
  );
  const label = scene.add.text(
    projectile.x - 46,
    projectile.y - projectile.height / 2 - 18,
    `${projectile.runtimeName} ${projectile.actionName}`,
    {
      color: '#f3f6ff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
    },
  );

  shape.setStrokeStyle(2, color, 0.9);
  core.setStrokeStyle(1, 0xf3f6ff, 0.9);
  label.setVisible(!isSnow);
  return {
    projectileId: projectile.id,
    shape,
    core,
    label,
  };
}

export function createAttackFlash(
  scene: Phaser.Scene,
  bounds: Phaser.Geom.Rectangle,
  time: number,
  color = 0xf2c14e,
): AttackFlash {
  const shape = scene.add.rectangle(
    bounds.centerX,
    bounds.centerY,
    bounds.width,
    bounds.height,
    color,
    0.16,
  );
  shape.setStrokeStyle(2, color, 0.85);
  return { shape, expiresAt: time + 120 };
}


