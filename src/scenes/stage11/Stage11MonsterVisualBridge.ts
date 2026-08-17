import Phaser from 'phaser';
import {
  monsterFamily330Atlases,
  monsterFamily330AttackAssets,
  MonsterFamily330AssetKeys,
} from '../../assets/MonsterAssetCatalog';
import type { Monster3Model } from '../../systems/Monster3System';
import type { Monster30Model } from '../../systems/Monster30System';
import {
  createStage11MonsterVisual,
  getStage11MonsterAtlasFrame,
  getStage11MonsterSpriteOrigin,
  Stage11VisualTickMs,
  updateStage11MonsterVisual,
  type Stage11AttackFamily,
  type Stage11MonsterType,
  type Stage11MonsterVisualModel,
} from '../../systems/Stage11MonsterVisualSystem';

type AttackFrameGeometry = Readonly<{
  minX: number;
  minY: number;
  width: number;
  height: number;
}>;

export type Stage11AttackGeometryRegistry = Readonly<
  Record<Stage11AttackFamily, readonly AttackFrameGeometry[]>
>;

type AttackView = {
  family: Stage11AttackFamily;
  image: Phaser.GameObjects.Image;
  frameIndex: number;
  elapsedMs: number;
  facingX: -1 | 1;
  geometry: readonly AttackFrameGeometry[];
};

export type Stage11MonsterView = {
  sprite: Phaser.GameObjects.Sprite;
  visual: Stage11MonsterVisualModel;
  attacks: AttackView[];
  geometry: Stage11AttackGeometryRegistry;
};

type Stage11MonsterCombat = Pick<
  Monster3Model | Monster30Model,
  'x' | 'y' | 'state' | 'facingX' | 'attackSerial'
>;

const atlasByType = {
  3: monsterFamily330Atlases.monster3,
  30: monsterFamily330Atlases.monster30,
} as const;

const attackByFamily = monsterFamily330AttackAssets;

const symbolToFamily: Readonly<Record<string, Stage11AttackFamily>> = {
  Monster30Bullet1: 'monster30Hit1',
  Monster3Bullet1: 'monster3Hit1',
  Monster3Bullet2: 'monster3Hit2',
};

export function readStage11AttackGeometry(
  scene: Phaser.Scene,
): Stage11AttackGeometryRegistry {
  const text = scene.cache.text.get(MonsterFamily330AssetKeys.attackGeometry);
  if (typeof text !== 'string') throw new Error('Stage 1-1 attack geometry was not loaded');
  const registry: Record<Stage11AttackFamily, AttackFrameGeometry[]> = {
    monster30Hit1: [],
    monster3Hit1: [],
    monster3Hit2: [],
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
    Stage11AttackFamily,
    (typeof attackByFamily)[Stage11AttackFamily],
  ][]) {
    if (registry[family].length !== asset.frameCount) {
      throw new Error(`${family} geometry expected ${asset.frameCount} frames`);
    }
  }
  return registry;
}

export function createStage11MonsterView(
  scene: Phaser.Scene,
  enemyType: Stage11MonsterType,
  x: number,
  y: number,
  geometry: Stage11AttackGeometryRegistry,
): Stage11MonsterView {
  const atlas = atlasByType[enemyType];
  const origin = getStage11MonsterSpriteOrigin(enemyType);
  const sprite = scene.add.sprite(x, y, atlas.key, 0)
    .setName(`Monster${enemyType}`)
    .setOrigin(origin.x, origin.y)
    .setDepth(18);
  return {
    sprite,
    visual: createStage11MonsterVisual(enemyType),
    attacks: [],
    geometry,
  };
}

export function updateStage11MonsterView(
  scene: Phaser.Scene,
  view: Stage11MonsterView,
  combat: Stage11MonsterCombat,
  deltaMs: number,
): boolean {
  const events = updateStage11MonsterVisual(view.visual, {
    state: combat.state,
    attackSerial: combat.attackSerial,
    facingX: combat.facingX,
  }, deltaMs);
  view.sprite
    .setPosition(combat.x, combat.y)
    .setFrame(getStage11MonsterAtlasFrame(view.visual))
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

export function setStage11MonsterViewVisible(
  view: Stage11MonsterView,
  visible: boolean,
): void {
  view.sprite.setVisible(visible);
  for (const attack of view.attacks) attack.image.setVisible(visible);
}

export function destroyStage11MonsterView(view: Stage11MonsterView): void {
  view.sprite.destroy();
  for (const attack of view.attacks) attack.image.destroy();
  view.attacks.length = 0;
}

function createAttackView(
  scene: Phaser.Scene,
  family: Stage11AttackFamily,
  x: number,
  y: number,
  facingX: -1 | 1,
  geometry: Stage11AttackGeometryRegistry,
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
    while (attack.elapsedMs + 0.0001 >= Stage11VisualTickMs) {
      attack.elapsedMs -= Stage11VisualTickMs;
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
