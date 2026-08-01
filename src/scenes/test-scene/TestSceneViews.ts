// boundary: view factories create Phaser display objects only; they do not own
// gameplay state transitions.
import Phaser from 'phaser';
import {
  PickupAssetKeys,
  pickupAssets,
  role1NormalAttackAssets,
  role1SkillVisualAssets,
} from '../../assets/AssetManifest';
import type { WorldDrop } from '../../systems/DropSystem';
import type { ActiveHeroNormalAttack } from '../../systems/HeroNormalAttackSystem';
import type { PlayerSlot } from '../../systems/InputSystem';
import type { Monster30Model } from '../../systems/Monster30System';
import type { PetState } from '../../systems/PetSystem';
import type { ProjectileModel } from '../../systems/ProjectileSystem';
import {
  createStage11MonsterView,
  setStage11MonsterViewVisible,
  type Stage11AttackGeometryRegistry,
  type Stage11MonsterView,
} from '../stage11/Stage11MonsterVisualBridge';

export type MonsterView = Stage11MonsterView;
export type BossView = Stage11MonsterView;

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
  shape: Phaser.GameObjects.Ellipse | Phaser.GameObjects.Image;
  core?: Phaser.GameObjects.Ellipse;
  label?: Phaser.GameObjects.Text;
  frameKeys?: readonly string[];
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
  geometry: Stage11AttackGeometryRegistry,
): MonsterView {
  return createStage11MonsterView(scene, 30, monster.x, monster.y, geometry);
}

export function createBossView(
  scene: Phaser.Scene,
  geometry: Stage11AttackGeometryRegistry,
): BossView {
  const view = createStage11MonsterView(scene, 3, 470, 120, geometry);
  setStage11MonsterViewVisible(view, false);
  return view;
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
  const role1Asset = role1SkillVisualAssets[
    projectile.assetKey as keyof typeof role1SkillVisualAssets
  ];
  if (role1Asset) {
    const shape = scene.add.image(projectile.x, projectile.y, role1Asset.frameKeys[0]!)
      .setFlipX(projectile.facingX > 0)
      .setDepth(48);
    return {
      projectileId: projectile.id,
      shape,
      frameKeys: role1Asset.frameKeys,
    };
  }
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


