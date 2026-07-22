// Shared Phaser adapter for Stage 1 death rewards. It owns views and collection
// plumbing, but reward probability, quantities, ownership, and seeking live in systems.
import Phaser from 'phaser';
import { PickupAssetKeys, pickupAssets } from '../../assets/AssetManifest';
import {
  DropTuning,
  createDropSystem,
  getDropPickupAlpha,
  pickupMedicineDrop,
  updateWorldDrops,
  type AuraWorldDrop,
  type MedicineWorldDrop,
  type WorldDrop,
} from '../../systems/DropSystem';
import type { MovementPlatform } from '../../systems/HeroMovementSystem';
import {
  createMonsterDefeatRewardRuntime,
  settleMonsterDefeatRewards,
} from '../../systems/MonsterDefeatRewardSystem';
import type { Stage1CombatEnemy, Stage1CombatPlayer } from '../../systems/Stage1CombatSystem';

export type Stage1RewardPlayer = Readonly<{
  view: Phaser.GameObjects.Image;
  combat: Stage1CombatPlayer;
}>;

export type Stage1RewardBridge = Readonly<{
  onMonsterDefeated: (enemy: Stage1CombatEnemy) => void;
  update: (deltaMs: number) => void;
  destroy: () => void;
  getSummary: () => string;
}>;

export function createStage1RewardBridge(
  scene: Phaser.Scene,
  players: readonly Stage1RewardPlayer[],
  platforms: readonly MovementPlatform[],
): Stage1RewardBridge {
  const dropSystem = createDropSystem();
  const rewardRuntime = createMonsterDefeatRewardRuntime();
  const views = new Map<string, Phaser.GameObjects.Image>();
  const creditedSoulIds = new Set<string>();

  const onMonsterDefeated = (enemy: Stage1CombatEnemy): void => {
    const owner = enemy.lastHitBy ?? players.find((player) => player.combat.combat.state !== 'dead')?.combat.slot;
    if (!owner) return;
    const spawnY = enemy.y + DropTuning.spawnOffsetY;
    const result = settleMonsterDefeatRewards({
      runtime: rewardRuntime,
      dropSystem,
      defeatId: enemy.id,
      enemyType: enemy.enemyType,
      owner,
      x: enemy.x,
      y: enemy.y,
      settleY: findSettleY(enemy.x, spawnY, platforms),
    });
    if (!result) return;
    const target = players.find((player) => player.combat.slot === result.experience.owner);
    if (target) target.combat.experience += result.experience.amount;
  };

  const update = (deltaMs: number): void => {
    updateWorldDrops(dropSystem, deltaMs, players
      .filter((player) => player.combat.combat.state !== 'dead')
      .map((player) => ({ id: player.combat.slot, x: player.view.x, y: player.view.y - 52 })));
    collectMedicine(players, dropSystem);
    creditCollectedSouls(players, dropSystem.drops, creditedSoulIds);
    syncViews(scene, dropSystem.drops, views);
  };

  return {
    onMonsterDefeated,
    update,
    destroy: () => {
      for (const view of views.values()) view.destroy();
      views.clear();
      dropSystem.drops = [];
    },
    getSummary: () => players
      .map((player) => `${player.combat.slot.toUpperCase()} 灵魂 ${player.combat.soul} 经验 ${player.combat.experience}`)
      .join(' · '),
  };
}

function collectMedicine(
  players: readonly Stage1RewardPlayer[],
  model: ReturnType<typeof createDropSystem>,
): void {
  for (const drop of model.drops) {
    if (drop.kind !== 'medicine' || drop.state !== 'idle') continue;
    const player = players.find((candidate) =>
      candidate.combat.combat.state !== 'dead' &&
      Math.abs(candidate.view.x - drop.x) <= 42 &&
      Math.abs((candidate.view.y - 42) - drop.y) <= 64,
    );
    if (!player) continue;
    const result = pickupMedicineDrop({
      model,
      drop,
      currentHp: player.combat.combat.hp,
      maxHp: player.combat.combat.maxHp,
      currentMp: player.combat.mp,
      maxMp: player.combat.maxMp,
    });
    if (result.target === 'hp') player.combat.combat.hp = result.after;
    else player.combat.mp = result.after;
  }
}

function creditCollectedSouls(
  players: readonly Stage1RewardPlayer[],
  drops: readonly WorldDrop[],
  creditedIds: Set<string>,
): void {
  for (const drop of drops) {
    if (drop.kind !== 'aura' || drop.state !== 'picked' || creditedIds.has(drop.id)) continue;
    creditedIds.add(drop.id);
    const player = players.find((candidate) => candidate.combat.slot === drop.targetId);
    if (!player) continue;
    if (drop.auraType === 'red') player.combat.soul += drop.power;
    else player.combat.warriorEnergy = Math.min(100, player.combat.warriorEnergy + drop.power);
  }
}

function syncViews(
  scene: Phaser.Scene,
  drops: readonly WorldDrop[],
  views: Map<string, Phaser.GameObjects.Image>,
): void {
  const activeIds = new Set(drops.map((drop) => drop.id));
  for (const drop of drops) {
    const texture = getPickupTexture(drop);
    let view = views.get(drop.id);
    if (!view) {
      view = scene.add.image(drop.x, drop.y, texture).setDepth(45);
      views.set(drop.id, view);
    }
    if (view.texture.key !== texture) view.setTexture(texture);
    view.setPosition(drop.x, drop.y).setAlpha(getDropPickupAlpha(drop));
  }
  for (const [id, view] of views) {
    if (activeIds.has(id)) continue;
    view.destroy();
    views.delete(id);
  }
}

function getPickupTexture(drop: WorldDrop): string {
  if (drop.kind === 'medicine') return getMedicineTexture(drop);
  if (drop.kind === 'aura') return getSoulTexture(drop);
  return PickupAssetKeys.soulBonus;
}

function getMedicineTexture(drop: MedicineWorldDrop): string {
  if (drop.fillName === 'BigHP') return PickupAssetKeys.healthBig;
  if (drop.fillName === 'SmallMP') return PickupAssetKeys.manaSmall;
  return PickupAssetKeys.healthSmall;
}

function getSoulTexture(drop: AuraWorldDrop): string {
  const asset = drop.auraType === 'red' ? pickupAssets.soulPrimary : pickupAssets.soulBonus;
  const frame = Math.floor(drop.ageMs / 50) % asset.frameKeys.length;
  return asset.frameKeys[frame];
}

function findSettleY(
  x: number,
  spawnY: number,
  platforms: readonly MovementPlatform[],
): number {
  const surface = platforms
    .filter((platform) => x >= platform.left && x <= platform.right && platform.top >= spawnY)
    .sort((left, right) => left.top - right.top)[0];
  return surface ? surface.top - 16 : spawnY;
}
