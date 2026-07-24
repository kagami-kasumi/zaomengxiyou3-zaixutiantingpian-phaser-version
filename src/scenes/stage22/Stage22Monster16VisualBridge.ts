import Phaser from 'phaser';
import {
  stage22Monster16Atlas,
  stage22Monster16AttackAssets,
  Stage22AssetKeys,
} from '../../assets/AssetManifest';
import type { Stage1CombatEnemy } from '../../systems/Stage1CombatSystem';
import {
  createMonster16Visual,
  getMonster16AtlasFrame,
  getMonster16SpriteOrigin,
  Monster16VisualTickMs,
  updateMonster16Visual,
  type Monster16AttackFamily,
  type Monster16VisualModel,
} from '../../systems/Stage22Monster16VisualSystem';

type AttackFrameGeometry = Readonly<{
  minX: number;
  minY: number;
  width: number;
  height: number;
}>;

export type Monster16AttackGeometryRegistry = Readonly<
  Record<Monster16AttackFamily, readonly AttackFrameGeometry[]>
>;

type Monster16AttackView = {
  family: Monster16AttackFamily;
  image: Phaser.GameObjects.Image;
  frameIndex: number;
  elapsedMs: number;
  ageMs: number;
  facingX: -1 | 1;
  followOwner: boolean;
  offsetX: number;
  offsetY: number;
  lifetimeMs?: number;
};

export type Monster16View = {
  sprite: Phaser.GameObjects.Sprite;
  visual: Monster16VisualModel;
  attacks: Monster16AttackView[];
  geometry: Monster16AttackGeometryRegistry;
  lastX: number;
};

const symbolToFamily: Readonly<Record<string, Monster16AttackFamily>> = {
  Monster16Bullet1: 'monster16Hit1',
  Monster16Bullet2_1: 'monster16Hit2Start',
  Monster16Bullet2_2: 'monster16Hit2Followup',
  Monster16Bullet3: 'monster16Hit3',
  Monster16Bullet4_1: 'monster16Hit4Start',
  Monster16Bullet4_2: 'monster16Hit4Followup',
};

export function readMonster16AttackGeometry(
  scene: Phaser.Scene,
): Monster16AttackGeometryRegistry {
  const text = scene.cache.text.get(Stage22AssetKeys.monster16AttackGeometry);
  if (typeof text !== 'string') throw new Error('Stage 2-2 Monster16 attack geometry was not loaded');
  const registry: Record<Monster16AttackFamily, AttackFrameGeometry[]> = {
    monster16Hit1: [],
    monster16Hit2Start: [],
    monster16Hit2Followup: [],
    monster16Hit3: [],
    monster16Hit4Start: [],
    monster16Hit4Followup: [],
  };
  for (const line of text.trim().split(/\r?\n/).slice(1)) {
    const [symbol, , , minX, minY, maxX, maxY, width, height] = line.split(',');
    const family = symbol ? symbolToFamily[symbol] : undefined;
    if (!family) continue;
    registry[family].push({
      minX: Number(minX),
      minY: Number(minY),
      width: Math.ceil(Number(width) || Number(maxX) - Number(minX)),
      height: Math.ceil(Number(height) || Number(maxY) - Number(minY)),
    });
  }
  for (const [family, asset] of Object.entries(stage22Monster16AttackAssets) as [
    Monster16AttackFamily,
    (typeof stage22Monster16AttackAssets)[Monster16AttackFamily],
  ][]) {
    if (registry[family].length !== asset.frameCount) {
      throw new Error(`${family} geometry expected ${asset.frameCount} frames`);
    }
  }
  return registry;
}

export function createMonster16View(
  scene: Phaser.Scene,
  x: number,
  y: number,
  geometry: Monster16AttackGeometryRegistry,
): Monster16View {
  const origin = getMonster16SpriteOrigin();
  const sprite = scene.add.sprite(x, y, stage22Monster16Atlas.key, 0)
    .setName('Monster16')
    .setOrigin(origin.x, origin.y)
    .setDepth(18);
  return {
    sprite,
    visual: createMonster16Visual(),
    attacks: [],
    geometry,
    lastX: x,
  };
}

export function updateMonster16View(
  scene: Phaser.Scene,
  view: Monster16View,
  combat: Stage1CombatEnemy,
  deltaMs: number,
): boolean {
  const moving = combat.phase === 'approach' && Math.abs(combat.x - view.lastX) > 0.001;
  const events = updateMonster16Visual(view.visual, {
    phase: combat.phase,
    attackSerial: combat.attackSerial,
    attackAction: combat.activeAttack?.actionName,
    facingX: combat.facingX,
    moving,
  }, deltaMs);
  view.lastX = combat.x;
  view.sprite
    .setPosition(combat.x, combat.y)
    .setFrame(getMonster16AtlasFrame(view.visual))
    .setFlipX(combat.facingX === 1);
  for (const event of events) {
    view.attacks.push(createAttackView(
      scene,
      event.family,
      combat.x + event.offsetX,
      combat.y + event.offsetY,
      event.offsetX,
      event.offsetY,
      event.facingX,
      event.followOwner,
      event.lifetimeMs,
      view.geometry,
    ));
  }
  updateAttackViews(view, combat, deltaMs);
  return view.visual.completed;
}

export function destroyMonster16View(view: Monster16View): void {
  view.sprite.destroy();
  for (const attack of view.attacks) attack.image.destroy();
  view.attacks.length = 0;
}

function createAttackView(
  scene: Phaser.Scene,
  family: Monster16AttackFamily,
  x: number,
  y: number,
  offsetX: number,
  offsetY: number,
  facingX: -1 | 1,
  followOwner: boolean,
  lifetimeMs: number | undefined,
  geometry: Monster16AttackGeometryRegistry,
): Monster16AttackView {
  const frame = geometry[family][0]!;
  const asset = stage22Monster16AttackAssets[family];
  const image = scene.add.image(x, y, asset.frameKeys[0])
    .setName(asset.sourceSymbol)
    .setOrigin(-frame.minX / frame.width, -frame.minY / frame.height)
    .setFlipX(facingX === 1)
    .setDepth(19);
  return {
    family,
    image,
    frameIndex: 0,
    elapsedMs: 0,
    ageMs: 0,
    facingX,
    followOwner,
    offsetX,
    offsetY,
    lifetimeMs,
  };
}

function updateAttackViews(
  view: Monster16View,
  combat: Stage1CombatEnemy,
  deltaMs: number,
): void {
  for (let index = view.attacks.length - 1; index >= 0; index -= 1) {
    const attack = view.attacks[index]!;
    attack.ageMs += Math.max(0, deltaMs);
    attack.elapsedMs += Math.max(0, deltaMs);
    if (attack.followOwner) {
      attack.image.setPosition(combat.x + attack.offsetX, combat.y + attack.offsetY);
    }
    const asset = stage22Monster16AttackAssets[attack.family];
    while (attack.elapsedMs + 0.0001 >= Monster16VisualTickMs) {
      attack.elapsedMs -= Monster16VisualTickMs;
      attack.frameIndex += 1;
      if (attack.frameIndex >= asset.frameCount) {
        if (attack.lifetimeMs !== undefined && attack.ageMs < attack.lifetimeMs) attack.frameIndex = 0;
        else {
          attack.image.destroy();
          view.attacks.splice(index, 1);
          break;
        }
      }
      const frame = view.geometry[attack.family][attack.frameIndex];
      const texture = asset.frameKeys[attack.frameIndex];
      if (frame && texture && attack.image.active) {
        attack.image
          .setTexture(texture)
          .setOrigin(-frame.minX / frame.width, -frame.minY / frame.height)
          .setFlipX(attack.facingX === 1);
      }
    }
    if (attack.lifetimeMs !== undefined && attack.ageMs >= attack.lifetimeMs && attack.image.active) {
      attack.image.destroy();
      view.attacks.splice(index, 1);
    }
  }
}
