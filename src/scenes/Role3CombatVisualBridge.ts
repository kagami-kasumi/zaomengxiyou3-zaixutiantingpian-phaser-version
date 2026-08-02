import Phaser from 'phaser';
import {
  Role3CombatAssetKeys,
  role3ShieldBuffAsset,
} from '../assets/AssetManifest';
import type { HeroCombatModel } from '../systems/HeroCombatSystem';
import type { HeroMovementModel } from '../systems/HeroMovementSystem';
import type { HeroNormalAttackModel } from '../systems/HeroNormalAttackSystem';
import type { Role3SkillRuntimeModel } from '../systems/Role3DefenseSkillSystem';
import type { HeroSkillActionName } from '../systems/HeroSkillSystem';
import { isRole3XgqHidden } from '../systems/Role3MobilitySkillSystem';
import {
  projectRole3ShieldFrame,
  readRole3HeldFrame,
  Role3BodyAnimations,
  type Role3BodyAction,
} from '../systems/Role3CombatVisualSystem';
import { projectHeroVisualRootY } from './HeroCombatVisualCoordinates';

export type Role3CombatVisual = {
  anchor: Phaser.GameObjects.Image;
  body: Phaser.GameObjects.Sprite;
  equipment: Phaser.GameObjects.Sprite;
  shieldBuff: Phaser.GameObjects.Image;
  name: Phaser.GameObjects.Text;
  shieldStartedAtMs: number;
};

export type Role3CombatVisualInput = Readonly<{
  movement?: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  runtime: Role3SkillRuntimeModel;
  skillAction?: Readonly<{ actionName: HeroSkillActionName; startedAtMs: number; endsAtMs: number }>;
}>;

export function createRole3CombatVisual(
  scene: Phaser.Scene,
  anchor: Phaser.GameObjects.Image,
  heroId: number | undefined,
): Role3CombatVisual | undefined {
  if (heroId !== 3) return undefined;
  anchor.setVisible(false);
  const rootY = projectHeroVisualRootY(anchor.y);
  const body = scene.add.sprite(anchor.x, rootY, Role3CombatAssetKeys.body, 0)
    .setOrigin(0.55, 0.5)
    .setDepth(anchor.depth);
  const equipment = scene.add.sprite(anchor.x, rootY, Role3CombatAssetKeys.equipment, 0)
    .setOrigin(0.55, 0.5)
    .setDepth(anchor.depth + 0.01);
  const shieldBuff = scene.add.image(
    anchor.x - 20,
    rootY - 80,
    role3ShieldBuffAsset.frameKeys[0]!,
  ).setOrigin(
    role3ShieldBuffAsset.registrationOrigin.x,
    role3ShieldBuffAsset.registrationOrigin.y,
  ).setDepth(anchor.depth + 0.02).setVisible(false);
  const name = scene.add.text(anchor.x - 30, rootY - 90, anchor.name || '八戒', {
    color: '#ff0000',
    fontFamily: '"FZCuYuan-M03", sans-serif',
    fontSize: '16px',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 5,
  }).setOrigin(0.5, 1).setDepth(anchor.depth + 0.03);
  const visual = { anchor, body, equipment, shieldBuff, name, shieldStartedAtMs: 0 };
  anchor.setData('role3CombatVisual', visual);
  anchor.once(Phaser.GameObjects.Events.DESTROY, () => {
    body.destroy();
    equipment.destroy();
    shieldBuff.destroy();
    name.destroy();
  });
  return visual;
}

export function getRole3CombatVisual(
  anchor: Phaser.GameObjects.Image,
): Role3CombatVisual | undefined {
  return anchor.getData('role3CombatVisual') as Role3CombatVisual | undefined;
}

export function destroyRole3CombatVisual(anchor: Phaser.GameObjects.Image): void {
  const visual = getRole3CombatVisual(anchor);
  if (!visual) return;
  visual.body.destroy();
  visual.equipment.destroy();
  visual.shieldBuff.destroy();
  visual.name.destroy();
  anchor.setData('role3CombatVisual', undefined).setVisible(true);
}

export function syncRole3CombatVisual(
  visual: Role3CombatVisual,
  input: Role3CombatVisualInput,
  timeMs: number,
): void {
  const action = resolveRole3BodyAction(input, timeMs);
  const sequence = Role3BodyAnimations[action] ?? Role3BodyAnimations.wait!;
  const startedAtMs = input.skillAction && input.skillAction.actionName === action
    ? input.skillAction.startedAtMs
    : input.normalAttack.activeAttack?.actionName === action
      ? input.normalAttack.activeAttack.startedAtMs
      : 0;
  const frame = readRole3HeldFrame(sequence, Math.max(0, timeMs - startedAtMs));
  const facingX = input.movement?.facingX ?? input.normalAttack.activeAttack?.facingX ?? 1;
  const x = input.movement?.x ?? visual.anchor.x;
  const y = projectHeroVisualRootY(input.movement?.y ?? visual.anchor.y);
  const hidden = isRole3XgqHidden(input.runtime) || input.runtime.ultimate?.stage === 'released';
  const visible = input.combat.state !== 'dead' && !hidden;
  const originX = facingX > 0 ? 0.55 : 0.45;
  for (const layer of [visual.body, visual.equipment]) {
    layer.setPosition(x, y)
      .setFrame(frame)
      .setFlipX(facingX > 0)
      .setOrigin(originX, 0.5)
      .setVisible(visible)
      .setAlpha(visible ? 1 : 0)
      .clearTint();
  }
  visual.name.setPosition(x - 30, y - 90)
    .setText(visual.anchor.name || '八戒')
    .setVisible(visible);
  syncRole3ShieldBuff(visual, input.runtime, timeMs, x, y, visible);
}

function syncRole3ShieldBuff(
  visual: Role3CombatVisual,
  runtime: Role3SkillRuntimeModel,
  timeMs: number,
  x: number,
  y: number,
  heroVisible: boolean,
): void {
  const visible = heroVisible && runtime.shieldTier > 0 && runtime.shieldRemainingMs > 0;
  if (visible && !visual.shieldBuff.visible) visual.shieldStartedAtMs = timeMs;
  const frame = projectRole3ShieldFrame(timeMs - visual.shieldStartedAtMs);
  visual.shieldBuff.setPosition(x - 20, y - 80)
    .setTexture(role3ShieldBuffAsset.frameKeys[frame]!)
    .setVisible(visible);
}

export function resolveRole3BodyAction(
  input: Role3CombatVisualInput,
  timeMs: number,
): Role3BodyAction {
  if (input.combat.state === 'hurt') return 'hurt';
  if (input.skillAction && timeMs < input.skillAction.endsAtMs) return input.skillAction.actionName;
  if (input.normalAttack.activeAttack && timeMs < input.normalAttack.activeAttack.endsAtMs) {
    return input.normalAttack.activeAttack.actionName;
  }
  return input.movement?.state ?? 'wait';
}
