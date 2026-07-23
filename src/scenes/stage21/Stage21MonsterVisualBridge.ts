import Phaser from 'phaser';
import {
  stage21AttackAssets,
  stage21MonsterAtlases,
  Stage21MonsterAssetKeys,
} from '../../assets/AssetManifest';
import type { Stage1CombatEnemy } from '../../systems/Stage1CombatSystem';
import {
  createStage21MonsterVisual,
  getStage21MonsterAtlasFrame,
  getStage21MonsterSpriteOrigin,
  Stage21VisualTickMs,
  updateStage21MonsterVisual,
  type Stage21AttackFamily,
  type Stage21MonsterType,
  type Stage21MonsterVisualModel,
} from '../../systems/Stage21MonsterVisualSystem';

type AttackFrameGeometry = Readonly<{
  minX: number;
  minY: number;
  width: number;
  height: number;
}>;

export type AttackGeometryRegistry = Readonly<
  Record<Stage21AttackFamily, readonly AttackFrameGeometry[]>
>;

type AttackView = {
  family: Stage21AttackFamily;
  image: Phaser.GameObjects.Image;
  frameIndex: number;
  elapsedMs: number;
  facingX: -1 | 1;
  geometry: readonly AttackFrameGeometry[];
};

export type Stage21MonsterView = {
  sprite: Phaser.GameObjects.Sprite;
  visual: Stage21MonsterVisualModel;
  attacks: AttackView[];
  geometry: AttackGeometryRegistry;
  lastX: number;
};

const atlasByType = {
  6: stage21MonsterAtlases.monster6,
  9: stage21MonsterAtlases.monster9,
  10: stage21MonsterAtlases.monster10,
  19: stage21MonsterAtlases.monster19,
} as const;

const attackByFamily = stage21AttackAssets;

const symbolToFamily: Readonly<Record<string, Stage21AttackFamily>> = {
  Monster6Bullet1: 'monster6Hit1',
  Monster6Bullet2_1: 'monster6Hit2Start',
  Monster6Bullet2_2: 'monster6Hit2Rain',
  Monster6Bullet3: 'monster6Hit3',
  Monster9Bullet1: 'monster9Hit1',
  Monster10Bullet1: 'monster10Hit1',
  Monster19Bullet1: 'monster19Hit1',
};

export function readStage21AttackGeometry(scene: Phaser.Scene): AttackGeometryRegistry {
  const text = scene.cache.text.get(Stage21MonsterAssetKeys.attackGeometry);
  if (typeof text !== 'string') throw new Error('Stage 2-1 attack geometry was not loaded');
  const registry: Record<Stage21AttackFamily, AttackFrameGeometry[]> = {
    monster6Hit1: [],
    monster6Hit2Start: [],
    monster6Hit2Rain: [],
    monster6Hit3: [],
    monster9Hit1: [],
    monster10Hit1: [],
    monster19Hit1: [],
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
  for (const [family, asset] of Object.entries(attackByFamily) as [
    Stage21AttackFamily,
    (typeof attackByFamily)[Stage21AttackFamily],
  ][]) {
    if (registry[family].length !== asset.frameCount) {
      throw new Error(`${family} geometry expected ${asset.frameCount} frames`);
    }
  }
  return registry;
}

export function createStage21MonsterView(
  scene: Phaser.Scene,
  enemyType: Stage21MonsterType,
  x: number,
  y: number,
  geometry: AttackGeometryRegistry,
): Stage21MonsterView {
  const atlas = atlasByType[enemyType];
  const origin = getStage21MonsterSpriteOrigin(enemyType);
  const visual = createStage21MonsterVisual(enemyType);
  const sprite = scene.add.sprite(x, y, atlas.key, 0)
    .setName(`Monster${enemyType}`)
    .setOrigin(
      origin.x,
      origin.y,
    )
    .setDepth(18);
  return { sprite, visual, attacks: [], geometry, lastX: x };
}

export function updateStage21MonsterView(
  scene: Phaser.Scene,
  view: Stage21MonsterView,
  combat: Stage1CombatEnemy,
  deltaMs: number,
): boolean {
  const moving = combat.phase === 'approach' && Math.abs(combat.x - view.lastX) > 0.001;
  const events = updateStage21MonsterVisual(view.visual, {
    phase: combat.phase,
    attackSerial: combat.attackSerial,
    facingX: combat.facingX,
    moving,
  }, deltaMs);
  view.lastX = combat.x;
  view.sprite
    .setPosition(combat.x, combat.y)
    .setFrame(getStage21MonsterAtlasFrame(view.visual))
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
  return view.visual.completed;
}

export function destroyStage21MonsterView(view: Stage21MonsterView): void {
  view.sprite.destroy();
  for (const attack of view.attacks) attack.image.destroy();
  view.attacks.length = 0;
}

function createAttackView(
  scene: Phaser.Scene,
  family: Stage21AttackFamily,
  x: number,
  y: number,
  facingX: -1 | 1,
  geometry: AttackGeometryRegistry,
): AttackView {
  const frame = geometry[family][0]!;
  const image = scene.add.image(x, y, attackByFamily[family].frameKeys[0])
    .setName(attackByFamily[family].sourceSymbol)
    .setOrigin(-frame.minX / frame.width, -frame.minY / frame.height)
    .setFlipX(facingX === 1)
    .setDepth(19);
  return { family, image, frameIndex: 0, elapsedMs: 0, facingX, geometry: geometry[family] };
}

function updateAttackViews(attacks: AttackView[], deltaMs: number): void {
  for (let index = attacks.length - 1; index >= 0; index -= 1) {
    const attack = attacks[index]!;
    attack.elapsedMs += Math.max(0, deltaMs);
    while (attack.elapsedMs + 0.0001 >= Stage21VisualTickMs) {
      attack.elapsedMs -= Stage21VisualTickMs;
      attack.frameIndex += 1;
      const asset = attackByFamily[attack.family];
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
