import Phaser from 'phaser';
import {
  stage13Monster5Atlas,
  stage13Monster5AttackAssets,
  Stage13MonsterAssetKeys,
} from '../../assets/AssetManifest';
import type { Stage1CombatEnemy } from '../../systems/Stage1CombatSystem';
import {
  createStage13Monster5Visual,
  getStage13Monster5AtlasFrame,
  getStage13Monster5SpriteOrigin,
  Stage13Monster5VisualTickMs,
  updateStage13Monster5Visual,
  type Stage13Monster5AttackFamily,
  type Stage13Monster5VisualModel,
} from '../../systems/Stage13Monster5VisualSystem';

type AttackFrameGeometry = Readonly<{
  minX: number;
  minY: number;
  width: number;
  height: number;
}>;

export type Stage13Monster5AttackGeometry = Readonly<
  Record<Stage13Monster5AttackFamily, readonly AttackFrameGeometry[]>
>;

type AttackView = {
  family: Stage13Monster5AttackFamily;
  image: Phaser.GameObjects.Image;
  frameIndex: number;
  elapsedMs: number;
  facingX: -1 | 1;
  geometry: readonly AttackFrameGeometry[];
};

export type Stage13Monster5View = {
  sprite: Phaser.GameObjects.Sprite;
  visual: Stage13Monster5VisualModel;
  attacks: AttackView[];
  geometry: Stage13Monster5AttackGeometry;
};

const symbolToFamily: Readonly<Record<string, Stage13Monster5AttackFamily>> = {
  Monster5Bullet1: 'monster5Hit1',
  Monster5Bullet2_1: 'monster5Hit2Start',
  Monster5Bullet2_2: 'monster5Hit2End',
  Monster5Bullet3: 'monster5Hit3',
};

export function readStage13Monster5AttackGeometry(
  scene: Phaser.Scene,
): Stage13Monster5AttackGeometry {
  const text = scene.cache.text.get(Stage13MonsterAssetKeys.attackGeometry);
  if (typeof text !== 'string') throw new Error('Stage 1-3 Monster5 geometry was not loaded');
  const registry: Record<Stage13Monster5AttackFamily, AttackFrameGeometry[]> = {
    monster5Hit1: [],
    monster5Hit2Start: [],
    monster5Hit2End: [],
    monster5Hit3: [],
  };
  for (const line of text.trim().split(/\r?\n/).slice(1)) {
    const [symbol, , , minX, minY, , , width, height] = line.split(',');
    const family = symbol ? symbolToFamily[symbol] : undefined;
    if (!family) continue;
    registry[family].push({
      minX: Number(minX),
      minY: Number(minY),
      width: Math.ceil(Number(width)),
      height: Math.ceil(Number(height)),
    });
  }
  for (const [family, asset] of Object.entries(stage13Monster5AttackAssets) as [
    Stage13Monster5AttackFamily,
    (typeof stage13Monster5AttackAssets)[Stage13Monster5AttackFamily],
  ][]) {
    if (registry[family].length !== asset.frameCount) {
      throw new Error(`${family} geometry expected ${asset.frameCount} frames`);
    }
  }
  return registry;
}

export function createStage13Monster5View(
  scene: Phaser.Scene,
  x: number,
  y: number,
  geometry: Stage13Monster5AttackGeometry,
): Stage13Monster5View {
  const origin = getStage13Monster5SpriteOrigin();
  const sprite = scene.add.sprite(x, y, stage13Monster5Atlas.key, 0)
    .setName('Monster5')
    .setOrigin(origin.x, origin.y)
    .setDepth(18);
  return { sprite, visual: createStage13Monster5Visual(), attacks: [], geometry };
}

export function updateStage13Monster5View(
  scene: Phaser.Scene,
  view: Stage13Monster5View,
  combat: Stage1CombatEnemy,
  deltaMs: number,
): boolean {
  const events = updateStage13Monster5Visual(view.visual, {
    phase: combat.phase,
    attackSerial: combat.attackSerial,
    facingX: combat.facingX,
    moving: combat.phase === 'approach',
  }, deltaMs);
  view.sprite
    .setPosition(combat.x, combat.y)
    .setFrame(getStage13Monster5AtlasFrame(view.visual))
    .setFlipX(combat.facingX === 1);
  for (const event of events) {
    view.attacks.push(createAttackView(
      scene,
      event.family,
      combat.x + event.offsetX,
      combat.y + event.offsetY,
      event.facingX,
      view.geometry,
    ));
  }
  updateAttackViews(view.attacks, deltaMs);
  return view.visual.completed && view.attacks.length === 0;
}

export function destroyStage13Monster5View(view: Stage13Monster5View): void {
  view.sprite.destroy();
  for (const attack of view.attacks) attack.image.destroy();
  view.attacks.length = 0;
}

function createAttackView(
  scene: Phaser.Scene,
  family: Stage13Monster5AttackFamily,
  x: number,
  y: number,
  facingX: -1 | 1,
  geometry: Stage13Monster5AttackGeometry,
): AttackView {
  const frame = geometry[family][0]!;
  const asset = stage13Monster5AttackAssets[family];
  const image = scene.add.image(x, y, asset.frameKeys[0])
    .setName(asset.sourceSymbol)
    .setOrigin(-frame.minX / frame.width, -frame.minY / frame.height)
    .setFlipX(facingX === 1)
    .setDepth(19);
  return { family, image, frameIndex: 0, elapsedMs: 0, facingX, geometry: geometry[family] };
}

function updateAttackViews(attacks: AttackView[], deltaMs: number): void {
  for (let index = attacks.length - 1; index >= 0; index -= 1) {
    const attack = attacks[index]!;
    attack.elapsedMs += Math.max(0, deltaMs);
    while (attack.elapsedMs + 0.0001 >= Stage13Monster5VisualTickMs) {
      attack.elapsedMs -= Stage13Monster5VisualTickMs;
      attack.frameIndex += 1;
      const asset = stage13Monster5AttackAssets[attack.family];
      if (attack.frameIndex >= asset.frameCount) {
        attack.image.destroy();
        attacks.splice(index, 1);
        break;
      }
      const frame = attack.geometry[attack.frameIndex];
      if (frame) {
        attack.image
          .setTexture(asset.frameKeys[attack.frameIndex])
          .setOrigin(-frame.minX / frame.width, -frame.minY / frame.height)
          .setFlipX(attack.facingX === 1);
      }
    }
  }
}
