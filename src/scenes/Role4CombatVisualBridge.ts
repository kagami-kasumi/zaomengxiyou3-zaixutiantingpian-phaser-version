import Phaser from 'phaser';
import {
  Role4CombatAssetKeys,
  role4SpeedUpAsset,
} from '../assets/AssetManifest';
import type { HeroCombatModel } from '../systems/HeroCombatSystem';
import type { HeroMovementModel } from '../systems/HeroMovementSystem';
import type { HeroNormalAttackModel } from '../systems/HeroNormalAttackSystem';
import type { Role4PoisonSkillRuntime } from '../systems/Role4PoisonSkillSystem';
import type { HeroSkillActionName } from '../systems/HeroSkillSystem';
import {
  getRole4VisualWeaponMode,
  projectRole4SpeedUpFrame,
  readRole4HeldFrame,
  Role4BodyAnimations,
  type Role4BodyAction,
} from '../systems/Role4CombatVisualSystem';
import { projectHeroVisualRootY } from './HeroCombatVisualCoordinates';

export type Role4CombatVisual = {
  anchor: Phaser.GameObjects.Image;
  body: Phaser.GameObjects.Sprite;
  equipment: Phaser.GameObjects.Sprite;
  speedUp: Phaser.GameObjects.Image;
  name: Phaser.GameObjects.Text;
  speedUpStartedAtMs: number;
};

export type Role4CombatVisualInput = Readonly<{
  movement?: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  runtime: Role4PoisonSkillRuntime;
  skillAction?: Readonly<{ actionName: HeroSkillActionName; startedAtMs: number; endsAtMs: number }>;
}>;

export function createRole4CombatVisual(
  scene: Phaser.Scene,
  anchor: Phaser.GameObjects.Image,
  heroId: number | undefined,
): Role4CombatVisual | undefined {
  if (heroId !== 4) return undefined;
  anchor.setVisible(false);
  const rootY = projectHeroVisualRootY(anchor.y);
  const body = scene.add.sprite(anchor.x, rootY, Role4CombatAssetKeys.shovelBody0, 0)
    .setOrigin(0.575, 0.565)
    .setDepth(anchor.depth);
  const equipment = scene.add.sprite(anchor.x, rootY, Role4CombatAssetKeys.shovelEquipment0, 0)
    .setOrigin(0.575, 0.565)
    .setDepth(anchor.depth + 0.01);
  const speedUp = scene.add.image(anchor.x, rootY + 25, role4SpeedUpAsset.frameKeys[0]!)
    .setOrigin(role4SpeedUpAsset.registrationOrigin.x, role4SpeedUpAsset.registrationOrigin.y)
    .setDepth(anchor.depth + 0.02)
    .setVisible(false);
  const name = scene.add.text(anchor.x - 30, rootY - 90, anchor.name || '沙僧', {
    color: '#ff0000',
    fontFamily: '"FZCuYuan-M03", sans-serif',
    fontSize: '16px',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 5,
  }).setOrigin(0.5, 1).setDepth(anchor.depth + 0.03);
  const visual = { anchor, body, equipment, speedUp, name, speedUpStartedAtMs: 0 };
  anchor.setData('role4CombatVisual', visual);
  anchor.once(Phaser.GameObjects.Events.DESTROY, () => {
    body.destroy();
    equipment.destroy();
    speedUp.destroy();
    name.destroy();
  });
  return visual;
}

export function getRole4CombatVisual(anchor: Phaser.GameObjects.Image): Role4CombatVisual | undefined {
  return anchor.getData('role4CombatVisual') as Role4CombatVisual | undefined;
}

export function destroyRole4CombatVisual(anchor: Phaser.GameObjects.Image): void {
  const visual = getRole4CombatVisual(anchor);
  if (!visual) return;
  visual.body.destroy();
  visual.equipment.destroy();
  visual.speedUp.destroy();
  visual.name.destroy();
  anchor.setData('role4CombatVisual', undefined).setVisible(true);
}

export function syncRole4CombatVisual(
  visual: Role4CombatVisual,
  input: Role4CombatVisualInput,
  timeMs: number,
): void {
  const action = resolveRole4BodyAction(input, timeMs);
  const mode = getRole4VisualWeaponMode(input.normalAttack.weaponMode);
  const sequence = Role4BodyAnimations[mode][action] ?? Role4BodyAnimations[mode].wait;
  const startedAtMs = input.skillAction && input.skillAction.actionName === action
    ? input.skillAction.startedAtMs
    : input.normalAttack.activeAttack?.actionName === action
      ? input.normalAttack.activeAttack.startedAtMs
      : 0;
  const frame = readRole4HeldFrame(sequence, timeMs - startedAtMs);
  const facingX = input.movement?.facingX ?? input.normalAttack.activeAttack?.facingX ?? 1;
  const x = input.movement?.x ?? visual.anchor.x;
  const y = projectHeroVisualRootY(input.movement?.y ?? visual.anchor.y);
  const visible = input.combat.state !== 'dead';
  const originX = facingX > 0 ? 0.575 : 0.425;
  visual.body.setTexture(mode === 'arrow' ? Role4CombatAssetKeys.arrowBody0 : Role4CombatAssetKeys.shovelBody0);
  visual.equipment.setTexture(
    mode === 'arrow' ? Role4CombatAssetKeys.arrowEquipment4 : Role4CombatAssetKeys.shovelEquipment0,
  );
  for (const layer of [visual.body, visual.equipment]) {
    layer.setPosition(x, y)
      .setFrame(frame)
      .setFlipX(facingX < 0)
      .setOrigin(originX, 0.565)
      .setVisible(visible)
      .setAlpha(visible ? 1 : 0)
      .clearTint();
  }
  visual.name.setPosition(x - 30, y - 90).setText(visual.anchor.name || '沙僧').setVisible(visible);
  syncSpeedUp(visual, input.runtime, timeMs, x, y, visible);
}

function syncSpeedUp(
  visual: Role4CombatVisual,
  runtime: Role4PoisonSkillRuntime,
  timeMs: number,
  x: number,
  y: number,
  heroVisible: boolean,
): void {
  const visible = heroVisible && runtime.speedEffectRemainingMs > 0;
  if (visible && !visual.speedUp.visible) visual.speedUpStartedAtMs = timeMs;
  const frame = projectRole4SpeedUpFrame(timeMs - visual.speedUpStartedAtMs);
  visual.speedUp.setPosition(x, y + 25)
    .setTexture(role4SpeedUpAsset.frameKeys[frame]!)
    .setVisible(visible);
}

export function resolveRole4BodyAction(
  input: Role4CombatVisualInput,
  timeMs: number,
): Role4BodyAction {
  if (input.combat.state === 'hurt') return 'hurt';
  if (input.skillAction && timeMs < input.skillAction.endsAtMs) return input.skillAction.actionName;
  if (input.normalAttack.activeAttack && timeMs < input.normalAttack.activeAttack.endsAtMs) {
    return input.normalAttack.activeAttack.actionName;
  }
  return input.movement?.state ?? 'wait';
}
