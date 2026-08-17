import Phaser from 'phaser';
import {
  monsterFamily2478Atlases,
  monsterFamily2478AttackAssets,
  MonsterFamily2478AssetKeys,
} from '../../assets/MonsterAssetCatalog';
import type { Stage1CombatEnemy } from '../../systems/Stage1CombatSystem';
import {
  createStage12MonsterVisual,
  getStage12MonsterAtlasFrame,
  getStage12MonsterSpriteOrigin,
  Stage12VisualTickMs,
  updateStage12MonsterVisual,
  type Stage12AttackFamily,
  type Stage12MonsterType,
  type Stage12MonsterVisualModel,
} from '../../systems/Stage12MonsterVisualSystem';

type AttackFrameGeometry = Readonly<{
  minX: number;
  minY: number;
  width: number;
  height: number;
}>;

export type Stage12AttackGeometryRegistry = Readonly<
  Record<Stage12AttackFamily, readonly AttackFrameGeometry[]>
>;

type AttackView = {
  family: Stage12AttackFamily;
  image: Phaser.GameObjects.Image;
  frameIndex: number;
  elapsedMs: number;
  facingX: -1 | 1;
  geometry: readonly AttackFrameGeometry[];
};

export type Stage12MonsterView = {
  sprite: Phaser.GameObjects.Sprite;
  visual: Stage12MonsterVisualModel;
  attacks: AttackView[];
  geometry: Stage12AttackGeometryRegistry;
};

const atlasByType = {
  2: monsterFamily2478Atlases.monster2,
  4: monsterFamily2478Atlases.monster4,
  7: monsterFamily2478Atlases.monster7,
  8: monsterFamily2478Atlases.monster8,
} as const;

const symbolToFamily: Readonly<Record<string, Stage12AttackFamily>> = {
  Monster2Bullet1_1: 'monster2Hit1Start',
  Monster2Bullet1_2: 'monster2Hit1End',
  Monster2Bullet2: 'monster2Hit2',
  Monster4Bullet1: 'monster4Hit1',
  Monster4Bullet2_1: 'monster4Hit2Start',
  Monster4Bullet2_2: 'monster4Hit2End',
  Monster7Bullet1: 'monster7Hit1',
  Monster8Bullet1: 'monster8Hit1',
  Monster8Bullet2: 'monster8Hit2',
};

export function readStage12AttackGeometry(
  scene: Phaser.Scene,
): Stage12AttackGeometryRegistry {
  const text = scene.cache.text.get(MonsterFamily2478AssetKeys.attackGeometry);
  if (typeof text !== 'string') throw new Error('Stage 1-2 attack geometry was not loaded');
  const registry: Record<Stage12AttackFamily, AttackFrameGeometry[]> = {
    monster2Hit1Start: [],
    monster2Hit1End: [],
    monster2Hit2: [],
    monster4Hit1: [],
    monster4Hit2Start: [],
    monster4Hit2End: [],
    monster7Hit1: [],
    monster8Hit1: [],
    monster8Hit2: [],
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
  for (const [family, asset] of Object.entries(monsterFamily2478AttackAssets) as [
    Stage12AttackFamily,
    (typeof monsterFamily2478AttackAssets)[Stage12AttackFamily],
  ][]) {
    if (registry[family].length !== asset.frameCount) {
      throw new Error(`${family} geometry expected ${asset.frameCount} frames`);
    }
  }
  return registry;
}

export function createStage12MonsterView(
  scene: Phaser.Scene,
  enemyType: Stage12MonsterType,
  x: number,
  y: number,
  geometry: Stage12AttackGeometryRegistry,
): Stage12MonsterView {
  const atlas = atlasByType[enemyType];
  const origin = getStage12MonsterSpriteOrigin(enemyType);
  const sprite = scene.add.sprite(x, y, atlas.key, 0)
    .setName(`Monster${enemyType}`)
    .setOrigin(origin.x, origin.y)
    .setDepth(18);
  return {
    sprite,
    visual: createStage12MonsterVisual(enemyType),
    attacks: [],
    geometry,
  };
}

export function updateStage12MonsterView(
  scene: Phaser.Scene,
  view: Stage12MonsterView,
  combat: Stage1CombatEnemy,
  deltaMs: number,
): boolean {
  const events = updateStage12MonsterVisual(view.visual, {
    phase: combat.phase,
    attackSerial: combat.attackSerial,
    facingX: combat.facingX,
    moving: combat.phase === 'approach',
  }, deltaMs);
  view.sprite
    .setPosition(combat.x, combat.y)
    .setFrame(getStage12MonsterAtlasFrame(view.visual))
    .setFlipX(combat.facingX === 1);
  for (const event of events) {
    const attack = createAttackView(
      scene,
      event.family,
      combat.x + event.offsetX,
      combat.y + event.offsetY,
      event.facingX,
      view.geometry,
    );
    attack.image.setData('disabled', event.disabled);
    view.attacks.push(attack);
  }
  updateAttackViews(view.attacks, deltaMs);
  return view.visual.completed && view.attacks.length === 0;
}

export function destroyStage12MonsterView(view: Stage12MonsterView): void {
  view.sprite.destroy();
  for (const attack of view.attacks) attack.image.destroy();
  view.attacks.length = 0;
}

function createAttackView(
  scene: Phaser.Scene,
  family: Stage12AttackFamily,
  x: number,
  y: number,
  facingX: -1 | 1,
  geometry: Stage12AttackGeometryRegistry,
): AttackView {
  const frame = geometry[family][0]!;
  const asset = monsterFamily2478AttackAssets[family];
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
    while (attack.elapsedMs + 0.0001 >= Stage12VisualTickMs) {
      attack.elapsedMs -= Stage12VisualTickMs;
      attack.frameIndex += 1;
      const asset = monsterFamily2478AttackAssets[attack.family];
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
