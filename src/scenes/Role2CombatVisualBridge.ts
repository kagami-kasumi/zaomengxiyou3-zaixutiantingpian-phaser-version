import Phaser from 'phaser';
import { Role2CombatAssetKeys } from '../assets/AssetManifest';
import type { HeroCombatModel } from '../systems/HeroCombatSystem';
import type { HeroMovementModel } from '../systems/HeroMovementSystem';
import type { HeroNormalAttackModel } from '../systems/HeroNormalAttackSystem';
import type { HeroSkillActionName } from '../systems/HeroSkillSystem';
import {
  projectRole2ChargeBarState,
  readRole2HeldFrame,
  Role2BodyAnimations,
  type Role2BodyAction,
} from '../systems/Role2CombatVisualSystem';

export type Role2CombatVisual = Readonly<{
  anchor: Phaser.GameObjects.Image;
  body: Phaser.GameObjects.Sprite;
  equipment: Phaser.GameObjects.Sprite;
  chargeFrame: Phaser.GameObjects.Rectangle;
  chargeFill: Phaser.GameObjects.Rectangle;
  name: Phaser.GameObjects.Text;
}>;

export type Role2CombatVisualInput = Readonly<{
  movement?: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  skillAction?: Readonly<{ actionName: HeroSkillActionName; startedAtMs: number; endsAtMs: number }>;
}>;

export function createRole2CombatVisual(
  scene: Phaser.Scene,
  anchor: Phaser.GameObjects.Image,
  heroId: number | undefined,
): Role2CombatVisual | undefined {
  if (heroId !== 2) return undefined;
  anchor.setVisible(false);
  const body = scene.add.sprite(anchor.x + 15, anchor.y, Role2CombatAssetKeys.body, 0)
    .setOrigin(0.425, 0.5)
    .setDepth(anchor.depth);
  const equipment = scene.add.sprite(anchor.x + 15, anchor.y, Role2CombatAssetKeys.equipment, 0)
    .setOrigin(0.425, 0.5)
    .setDepth(anchor.depth + 0.01);
  const chargeFrame = scene.add.rectangle(anchor.x, anchor.y - 70, 50, 9, 0x000000, 0)
    .setStrokeStyle(1, 0xff0000)
    .setDepth(anchor.depth + 0.02)
    .setVisible(false);
  const chargeFill = scene.add.rectangle(anchor.x - 24, anchor.y - 70, 48, 7, 0x00ff00)
    .setOrigin(0, 0.5)
    .setDepth(anchor.depth + 0.021)
    .setVisible(false);
  const name = scene.add.text(anchor.x, anchor.y - 90, '唐僧', {
    color: '#ff0000',
    fontFamily: '"FZCuYuan-M03", sans-serif',
    fontSize: '16px',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 5,
  }).setOrigin(0.5, 1).setDepth(anchor.depth + 0.03);
  const visual = { anchor, body, equipment, chargeFrame, chargeFill, name };
  anchor.setData('role2CombatVisual', visual);
  anchor.once(Phaser.GameObjects.Events.DESTROY, () => {
    body.destroy();
    equipment.destroy();
    chargeFrame.destroy();
    chargeFill.destroy();
    name.destroy();
  });
  return visual;
}

export function getRole2CombatVisual(
  anchor: Phaser.GameObjects.Image,
): Role2CombatVisual | undefined {
  return anchor.getData('role2CombatVisual') as Role2CombatVisual | undefined;
}

export function destroyRole2CombatVisual(anchor: Phaser.GameObjects.Image): void {
  const visual = getRole2CombatVisual(anchor);
  if (!visual) return;
  visual.body.destroy();
  visual.equipment.destroy();
  visual.chargeFrame.destroy();
  visual.chargeFill.destroy();
  visual.name.destroy();
  anchor.setData('role2CombatVisual', undefined).setVisible(true);
}

export function syncRole2CombatVisual(
  visual: Role2CombatVisual,
  input: Role2CombatVisualInput,
  timeMs: number,
): void {
  const action = resolveRole2BodyAction(input, timeMs);
  const sequence = Role2BodyAnimations[action] ?? Role2BodyAnimations.wait!;
  const startedAtMs = input.skillAction && input.skillAction.actionName === action
    ? input.skillAction.startedAtMs
    : input.normalAttack.activeAttack?.actionName === action
      ? input.normalAttack.activeAttack.startedAtMs
      : 0;
  const frame = readRole2HeldFrame(sequence, Math.max(0, timeMs - startedAtMs));
  const facingX = input.movement?.facingX ?? input.normalAttack.activeAttack?.facingX ?? 1;
  const originX = facingX < 0 ? 0.575 : 0.425;
  const x = (input.movement?.x ?? visual.anchor.x) + 15;
  const y = input.movement?.y ?? visual.anchor.y;
  const visible = input.combat.state !== 'dead';
  for (const layer of [visual.body, visual.equipment]) {
    layer.setPosition(x, y)
      .setFrame(frame)
      .setFlipX(facingX > 0)
      .setOrigin(originX, 0.5)
      .setVisible(visible)
      .setAlpha(visible ? 1 : 0)
      .clearTint();
  }
  visual.name.setPosition(x - 15, y - 90).setVisible(visible);
  syncRole2ChargeBar(visual, input.normalAttack, timeMs, x - 15, y, visible);
}

function syncRole2ChargeBar(
  visual: Role2CombatVisual,
  normalAttack: HeroNormalAttackModel,
  timeMs: number,
  x: number,
  y: number,
  heroVisible: boolean,
): void {
  const state = projectRole2ChargeBarState(normalAttack.activeAttack, timeMs, heroVisible);
  visual.chargeFrame.setPosition(x, y - 70).setVisible(state.visible);
  visual.chargeFill.setPosition(x - 24, y - 70)
    .setDisplaySize(48 * state.progress, 7)
    .setFillStyle(state.fillColor)
    .setVisible(state.visible);
}

export function resolveRole2BodyAction(
  input: Role2CombatVisualInput,
  timeMs: number,
): Role2BodyAction {
  if (input.combat.state === 'hurt') return 'hurt';
  if (input.skillAction && timeMs < input.skillAction.endsAtMs) return input.skillAction.actionName;
  if (input.normalAttack.activeAttack && timeMs < input.normalAttack.activeAttack.endsAtMs) {
    return input.normalAttack.activeAttack.actionName;
  }
  return input.movement?.state ?? 'wait';
}
