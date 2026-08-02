import Phaser from 'phaser';
import { Role1CombatAssetKeys } from '../assets/AssetManifest';
import type { HeroCombatModel } from '../systems/HeroCombatSystem';
import type { HeroMovementModel, HeroMovementState } from '../systems/HeroMovementSystem';
import type { HeroNormalAttackModel } from '../systems/HeroNormalAttackSystem';
import type { HeroSkillActionName } from '../systems/HeroSkillSystem';
import { projectHeroVisualRootY } from './HeroCombatVisualCoordinates';

type Role1BodyAction = HeroMovementState | 'hurt' | HeroSkillActionName | string;

type ActionFrames = Readonly<{
  frames: readonly number[];
  holds: readonly number[];
  loop: boolean;
}>;

export type Role1CombatVisual = Readonly<{
  anchor: Phaser.GameObjects.Image;
  body: Phaser.GameObjects.Sprite;
  equipment: Phaser.GameObjects.Sprite;
}>;

export type Role1CombatVisualInput = Readonly<{
  movement?: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  skillAction?: Readonly<{ actionName: HeroSkillActionName; startedAtMs: number; endsAtMs: number }>;
}>;

const row = (index: number, columns: readonly number[]): number[] =>
  columns.map((column) => index * 6 + column);

export const Role1BodyAnimations: Readonly<Record<string, ActionFrames>> = {
  wait: { frames: row(0, [0, 1, 2, 3, 4, 5]), holds: [2, 2, 2, 3, 2, 4], loop: true },
  walk: { frames: row(2, [0, 1, 2, 3]), holds: [4, 4, 4, 4], loop: true },
  run: { frames: row(3, [0, 1, 2, 3]), holds: [2, 2, 2, 2], loop: true },
  jump1: { frames: row(4, [0]), holds: [1], loop: false },
  jump2: { frames: row(5, [0, 1, 2, 3, 4]), holds: [2, 2, 2, 2, 2], loop: false },
  jump3: { frames: row(4, [1]), holds: [1], loop: false },
  hit1: { frames: row(6, [0, 1, 2]), holds: [3, 3, 3], loop: false },
  hit2: { frames: row(6, [3, 4, 5]), holds: [3, 3, 3], loop: false },
  hit3: { frames: row(7, [0, 1, 2]), holds: [3, 3, 3], loop: false },
  hit4: { frames: row(8, [0, 1, 2]), holds: [3, 3, 3], loop: false },
  hit5: { frames: row(9, [0, 1, 2]), holds: [3, 4, 4], loop: false },
  hit6: { frames: row(9, [3, 4, 5]), holds: [3, 4, 4], loop: false },
  hit7: { frames: row(12, [3]), holds: [15], loop: false },
  hit8: { frames: row(11, [0, 1, 2]), holds: [3, 3, 4], loop: false },
  hit9: { frames: row(4, [2]), holds: [13], loop: false },
  hit10: { frames: row(4, [3]), holds: [100], loop: false },
  hit11_1: { frames: row(4, [4]), holds: [35], loop: false },
  hit11_2: { frames: row(4, [5]), holds: [35], loop: false },
  hit12: { frames: row(12, [0]), holds: [17], loop: false },
  hurt: { frames: row(12, [4]), holds: [15], loop: false },
  hit13: { frames: row(12, [5]), holds: [10], loop: false },
  hit14: { frames: row(13, [0, 1, 2]), holds: [2, 12, 16], loop: false },
};

export function createRole1CombatVisual(
  scene: Phaser.Scene,
  anchor: Phaser.GameObjects.Image,
  heroId: number | undefined,
): Role1CombatVisual | undefined {
  if (heroId !== 1) return undefined;
  anchor.setVisible(false);
  const rootY = projectHeroVisualRootY(anchor.y);
  const body = scene.add.sprite(anchor.x + 5, rootY - 15, Role1CombatAssetKeys.body, 0)
    .setOrigin(0.5, 0.575)
    .setDepth(anchor.depth);
  const equipment = scene.add.sprite(anchor.x + 5, rootY - 15, Role1CombatAssetKeys.equipment, 0)
    .setOrigin(0.5, 0.575)
    .setDepth(anchor.depth + 0.01);
  const visual = { anchor, body, equipment };
  anchor.setData('role1CombatVisual', visual);
  anchor.once(Phaser.GameObjects.Events.DESTROY, () => {
    body.destroy();
    equipment.destroy();
  });
  return visual;
}

export function getRole1CombatVisual(
  anchor: Phaser.GameObjects.Image,
): Role1CombatVisual | undefined {
  return anchor.getData('role1CombatVisual') as Role1CombatVisual | undefined;
}

export function destroyRole1CombatVisual(anchor: Phaser.GameObjects.Image): void {
  const visual = getRole1CombatVisual(anchor);
  if (!visual) return;
  visual.body.destroy();
  visual.equipment.destroy();
  anchor.setData('role1CombatVisual', undefined).setVisible(true);
}

export function syncRole1CombatVisual(
  visual: Role1CombatVisual,
  input: Role1CombatVisualInput,
  timeMs: number,
): void {
  const action = resolveRole1BodyAction(input, timeMs);
  const sequence = Role1BodyAnimations[action] ?? Role1BodyAnimations.wait!;
  const startedAtMs = input.skillAction && input.skillAction.actionName === action
    ? input.skillAction.startedAtMs
    : input.normalAttack.activeAttack?.actionName === action
      ? input.normalAttack.activeAttack.startedAtMs
      : 0;
  const frame = readHeldFrame(sequence, Math.max(0, timeMs - startedAtMs));
  const facingX = input.movement?.facingX ?? input.normalAttack.activeAttack?.facingX ?? 1;
  const originX = facingX < 0 ? 0.525 : 0.475;
  const originY = action === 'hit14' ? 0.65 : 0.575;
  const x = (input.movement?.x ?? visual.anchor.x) + 5;
  const y = projectHeroVisualRootY(input.movement?.y ?? visual.anchor.y)
    + (action === 'hit14' ? -30 : -15);
  const visible = input.combat.state !== 'dead';
  for (const layer of [visual.body, visual.equipment]) {
    layer.setPosition(x, y).setFrame(frame).setFlipX(facingX > 0).setOrigin(originX, originY);
    layer.setVisible(visible).setAlpha(visible ? 1 : 0);
    if (input.combat.state === 'hurt') layer.setTint(0xffb5b5);
    else layer.clearTint();
  }
}

export function resolveRole1BodyAction(
  input: Role1CombatVisualInput,
  timeMs: number,
): Role1BodyAction {
  if (input.combat.state === 'hurt') return 'hurt';
  if (input.skillAction && timeMs < input.skillAction.endsAtMs) return input.skillAction.actionName;
  if (input.normalAttack.activeAttack && timeMs < input.normalAttack.activeAttack.endsAtMs) {
    return input.normalAttack.activeAttack.actionName;
  }
  return input.movement?.state ?? 'wait';
}

export function readHeldFrame(sequence: ActionFrames, elapsedMs: number): number {
  const ticks = Math.floor(elapsedMs / (1000 / 30));
  const totalTicks = sequence.holds.reduce((sum, hold) => sum + hold, 0);
  const cursor = sequence.loop && totalTicks > 0 ? ticks % totalTicks : Math.min(ticks, totalTicks - 1);
  let end = 0;
  for (let index = 0; index < sequence.frames.length; index += 1) {
    end += sequence.holds[index] ?? 1;
    if (cursor < end) return sequence.frames[index]!;
  }
  return sequence.frames.at(-1) ?? 0;
}
