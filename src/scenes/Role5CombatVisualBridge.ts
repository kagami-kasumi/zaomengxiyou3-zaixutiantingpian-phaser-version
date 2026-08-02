import Phaser from 'phaser';
import {
  Role5CombatAssetKeys,
  role5SkillVisualAssets,
  role5SpearBodyFamilyAssets,
} from '../assets/AssetManifest';
import type { HeroCombatModel } from '../systems/HeroCombatSystem';
import type { HeroMovementModel } from '../systems/HeroMovementSystem';
import type { HeroNormalAttackModel } from '../systems/HeroNormalAttackSystem';
import type { HeroSkillModel } from '../systems/HeroSkillSystem';
import {
  readRole5HeldIndex,
  Role5SpearBodyAnimations,
  Role5SwordBodyAnimations,
  role5ActionUsesSword,
} from '../systems/Role5CombatVisualSystem';

type SequenceImage = {
  image: Phaser.GameObjects.Image;
  frameKeys: readonly string[];
};

export type Role5CombatVisual = {
  anchor: Phaser.GameObjects.Image;
  body: Phaser.GameObjects.Sprite;
  equipment: Phaser.GameObjects.Sprite;
  name: Phaser.GameObjects.Text;
  yyb: SequenceImage;
  tlj: SequenceImage;
  jrjlStatus: SequenceImage;
  jrjlCast: SequenceImage;
  lyshRelease: SequenceImage;
  lyshArrows: SequenceImage[];
  jrjlArrows: SequenceImage[];
  escapeBefore: SequenceImage;
  escapeAfter: SequenceImage;
  lastTeleportTarget?: string;
  teleportStartedAtMs: number;
};

export type Role5CombatVisualInput = Readonly<{
  movement?: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  skill: HeroSkillModel;
}>;

export function createRole5CombatVisual(
  scene: Phaser.Scene,
  anchor: Phaser.GameObjects.Image,
  heroId: number | undefined,
): Role5CombatVisual | undefined {
  if (heroId !== 5) return undefined;
  anchor.setVisible(false);
  const body = scene.add.sprite(anchor.x, anchor.y, role5SpearBodyFamilyAssets.body0.key, 0)
    .setDepth(anchor.depth);
  const equipment = scene.add.sprite(anchor.x, anchor.y, role5SpearBodyFamilyAssets.equipment0.key, 0)
    .setDepth(anchor.depth + 0.01);
  const name = scene.add.text(anchor.x - 30, anchor.y - 90, anchor.name || '白龙', {
    color: '#ff0000',
    fontFamily: '"FZCuYuan-M03", sans-serif',
    fontSize: '16px',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 5,
  }).setOrigin(0.5, 1).setDepth(anchor.depth + 0.08);
  const sequence = (key: keyof typeof role5SkillVisualAssets, depth: number): SequenceImage => {
    const asset = role5SkillVisualAssets[key];
    return {
      image: scene.add.image(anchor.x, anchor.y, asset.frameKeys[0]!)
        .setOrigin(asset.registrationOrigin.x, asset.registrationOrigin.y)
        .setVisible(false)
        .setDepth(depth),
      frameKeys: asset.frameKeys,
    };
  };
  const yyb = sequence(Role5CombatAssetKeys.yybStatus, anchor.depth + 0.04);
  const tlj = sequence(Role5CombatAssetKeys.tljStatus, anchor.depth + 0.05);
  const jrjlStatus = sequence(Role5CombatAssetKeys.jrjlStatus, anchor.depth + 0.06);
  const jrjlCast = sequence(Role5CombatAssetKeys.jrjlCast, anchor.depth + 0.03);
  const lyshRelease = sequence(Role5CombatAssetKeys.lyshRelease, anchor.depth + 0.03);
  const lyshArrows = Array.from({ length: 4 }, () => sequence(
    SkillKey.role5LyshCompanion,
    anchor.depth - 0.01,
  ));
  const jrjlArrows = Array.from({ length: 3 }, () => sequence(
    SkillKey.role5JrjlCompanion,
    anchor.depth - 0.01,
  ));
  const escapeBefore = sequence(Role5CombatAssetKeys.escapeBefore, anchor.depth + 0.02);
  const escapeAfter = sequence(Role5CombatAssetKeys.escapeAfter, anchor.depth + 0.02);
  const visual: Role5CombatVisual = {
    anchor,
    body,
    equipment,
    name,
    yyb,
    tlj,
    jrjlStatus,
    jrjlCast,
    lyshRelease,
    lyshArrows,
    jrjlArrows,
    escapeBefore,
    escapeAfter,
    teleportStartedAtMs: 0,
  };
  anchor.setData('role5CombatVisual', visual);
  anchor.once(Phaser.GameObjects.Events.DESTROY, () => destroyVisualObjects(visual));
  return visual;
}

const SkillKey = {
  role5LyshCompanion: 'skill-effect.role5.lysh.companion',
  role5JrjlCompanion: 'skill-effect.role5.jrjl.companion',
} as const;

export function getRole5CombatVisual(anchor: Phaser.GameObjects.Image): Role5CombatVisual | undefined {
  return anchor.getData('role5CombatVisual') as Role5CombatVisual | undefined;
}

export function syncRole5CombatVisual(
  visual: Role5CombatVisual,
  input: Role5CombatVisualInput,
  timeMs: number,
): void {
  const action = resolveRole5BodyAction(input, timeMs);
  const elapsedMs = resolveActionElapsed(input, action, timeMs);
  const usesSword = role5ActionUsesSword(action, input.normalAttack.weaponMode);
  const facingX = input.movement?.facingX ?? input.normalAttack.activeAttack?.facingX ?? 1;
  const x = input.movement?.x ?? visual.anchor.x;
  const y = input.movement?.y ?? visual.anchor.y;
  const visible = input.combat.state !== 'dead';
  if (usesSword) {
    const sequence = Role5SwordBodyAnimations[action] ?? Role5SwordBodyAnimations.wait!;
    const index = readRole5HeldIndex(sequence.holds, elapsedMs, sequence.loop);
    visual.body.setTexture(sequence.frameKeys[index] ?? sequence.frameKeys.at(-1)!);
    visual.body.setOrigin(facingX > 0 ? 158 / 290 : 132 / 290, 142 / 290);
  } else {
    const sequence = Role5SpearBodyAnimations[action] ?? Role5SpearBodyAnimations.wait!;
    const index = readRole5HeldIndex(sequence.holds, elapsedMs, sequence.loop);
    visual.body.setTexture(role5SpearBodyFamilyAssets.body0.key).setFrame(sequence.frames[index] ?? 0);
    visual.equipment.setFrame(sequence.frames[index] ?? 0);
    const sourceOriginX = facingX > 0 ? 159 / 350 : 191 / 350;
    visual.body.setOrigin(sourceOriginX, 142 / 350);
    visual.equipment.setOrigin(sourceOriginX, 142 / 350);
  }
  visual.body.setPosition(x, y).setFlipX(facingX < 0).setVisible(visible).clearTint().setAlpha(1);
  visual.equipment.setPosition(x, y).setFlipX(facingX < 0).setVisible(visible && !usesSword).clearTint().setAlpha(1);
  visual.name.setPosition(x - 30, y - 90).setText(visual.anchor.name || '白龙').setVisible(visible);
  syncStatusLayers(visual, input, timeMs, x, y, facingX, visible);
  syncTeleportLayers(visual, input.normalAttack, timeMs, facingX, visible);
}

function resolveRole5BodyAction(input: Role5CombatVisualInput, timeMs: number): string {
  if (input.combat.state === 'hurt') return 'hurt';
  const activeSkill = input.skill.role5Runtime.active;
  if (activeSkill && input.skill.activeAction) return input.skill.activeAction.actionName;
  if (input.normalAttack.activeAttack && timeMs < input.normalAttack.activeAttack.endsAtMs) {
    return input.normalAttack.activeAttack.actionName;
  }
  return input.movement?.state ?? 'wait';
}

function resolveActionElapsed(input: Role5CombatVisualInput, action: string, timeMs: number): number {
  if (input.skill.role5Runtime.active && input.skill.activeAction?.actionName === action) {
    return input.skill.role5Runtime.active.elapsedMs;
  }
  if (input.normalAttack.activeAttack?.actionName === action) {
    return timeMs - input.normalAttack.activeAttack.startedAtMs;
  }
  return timeMs;
}

function syncStatusLayers(
  visual: Role5CombatVisual,
  input: Role5CombatVisualInput,
  timeMs: number,
  x: number,
  y: number,
  facingX: number,
  heroVisible: boolean,
): void {
  const runtime = input.skill.role5Runtime;
  syncSequence(visual.yyb, timeMs, x, y + 50, facingX, heroVisible && runtime.yybRemainingMs > 0);
  syncSequence(visual.tlj, timeMs, x + facingX * 9, y + 20, facingX, heroVisible && runtime.tljRemainingMs > 0);
  syncSequence(visual.jrjlStatus, timeMs, x + facingX * 10, y + 20, facingX, heroVisible && runtime.jrjlArrows.created);
  syncSequence(visual.jrjlCast, timeMs, x, y, facingX, heroVisible && runtime.active?.skillName === 'jrjl');
  syncSequence(visual.lyshRelease, timeMs, x, y, facingX, heroVisible && input.skill.activeAction?.actionName === 'hit27_2');
  const lyshOffsets = [[-95, -43, 1], [-48, -77, 0.95], [0, -77, 0.9], [45, -54, 0.9]] as const;
  visual.lyshArrows.forEach((arrow, index) => {
    const offset = lyshOffsets[index]!;
    arrow.image.setScale(offset[2]);
    syncSequence(arrow, timeMs, x + facingX * offset[0], y + offset[1], facingX,
      heroVisible && runtime.lyshArrows.created && index >= runtime.lyshArrows.charged);
  });
  const jrjlOffsets = [[96, 17, 1], [66, -6, 0.95], [112, 45, 0.9]] as const;
  visual.jrjlArrows.forEach((arrow, index) => {
    const offset = jrjlOffsets[index]!;
    arrow.image.setScale(offset[2]);
    syncSequence(arrow, timeMs, x + facingX * offset[0], y + offset[1], facingX,
      heroVisible && runtime.jrjlArrows.created && index >= runtime.jrjlArrows.charged);
  });
}

function syncTeleportLayers(
  visual: Role5CombatVisual,
  normalAttack: HeroNormalAttackModel,
  timeMs: number,
  facingX: number,
  heroVisible: boolean,
): void {
  const teleport = normalAttack.role5LastTeleport;
  if (teleport && teleport.targetId !== visual.lastTeleportTarget) {
    visual.lastTeleportTarget = teleport.targetId;
    visual.teleportStartedAtMs = timeMs;
  }
  const elapsed = timeMs - visual.teleportStartedAtMs;
  const active = Boolean(teleport) && elapsed < 500;
  syncSequence(visual.escapeBefore, elapsed, teleport?.fromX ?? 0, (teleport?.fromY ?? 0) + 58, facingX, heroVisible && active);
  syncSequence(visual.escapeAfter, elapsed, teleport?.x ?? 0, teleport?.y ?? 0, facingX, heroVisible && active);
}

function syncSequence(
  sequence: SequenceImage,
  elapsedMs: number,
  x: number,
  y: number,
  facingX: number,
  visible: boolean,
): void {
  const frame = Math.floor(Math.max(0, elapsedMs) / (1000 / 24)) % sequence.frameKeys.length;
  sequence.image.setPosition(x, y).setTexture(sequence.frameKeys[frame]!)
    .setFlipX(facingX < 0).setVisible(visible);
}

function destroyVisualObjects(visual: Role5CombatVisual): void {
  visual.body.destroy();
  visual.equipment.destroy();
  visual.name.destroy();
  for (const sequence of [
    visual.yyb,
    visual.tlj,
    visual.jrjlStatus,
    visual.jrjlCast,
    visual.lyshRelease,
    ...visual.lyshArrows,
    ...visual.jrjlArrows,
    visual.escapeBefore,
    visual.escapeAfter,
  ]) sequence.image.destroy();
}
