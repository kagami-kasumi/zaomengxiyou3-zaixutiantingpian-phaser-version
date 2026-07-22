import {
  DropTuning,
  maybeSpawnMedicineDrop,
  spawnAuraDrops,
  spawnConfiguredMonsterDrop,
  type AuraWorldDrop,
  type DropSystemModel,
  type ItemWorldDrop,
  type MedicineWorldDrop,
  type MonsterDropContext,
  type MonsterDropId,
} from './DropSystem';
import type { PlayerSlot } from './InputSystem';
import type { Stage1EnemyType } from './Stage1CombatSystem';

export type HealthPickup = MedicineWorldDrop & {
  medicine: MedicineWorldDrop['medicine'] & { restoreTarget: 'hp' };
};
export type ManaPickup = MedicineWorldDrop & {
  medicine: MedicineWorldDrop['medicine'] & { restoreTarget: 'mp' };
};
export type SoulPickup = AuraWorldDrop;

export type ExperienceReward = Readonly<{
  owner: PlayerSlot;
  amount: number;
}>;

export type MonsterDefeatRewardRuntime = {
  settledDefeatIds: Set<string>;
};

export type MonsterRewardConfig = Readonly<{
  experience: number;
  soulPower: number;
}>;

export type MonsterDefeatRewardResult = Readonly<{
  medicine?: HealthPickup | ManaPickup;
  souls: readonly SoulPickup[];
  item?: ItemWorldDrop;
  experience: ExperienceReward;
}>;

const rewardConfigs: Record<Stage1EnemyType, MonsterRewardConfig> = {
  2: { experience: 20, soulPower: 10 },
  3: { experience: 7, soulPower: 4 },
  4: { experience: 20, soulPower: 10 },
  5: { experience: 35, soulPower: 15 },
  7: { experience: 6, soulPower: 2 },
  8: { experience: 5, soulPower: 3 },
  30: { experience: 4, soulPower: 1 },
};

export function createMonsterDefeatRewardRuntime(): MonsterDefeatRewardRuntime {
  return { settledDefeatIds: new Set() };
}

export function getMonsterRewardConfig(enemyType: Stage1EnemyType): MonsterRewardConfig {
  return rewardConfigs[enemyType];
}

export function settleMonsterDefeatRewards(params: {
  runtime: MonsterDefeatRewardRuntime;
  dropSystem: DropSystemModel;
  defeatId: string;
  enemyType: Stage1EnemyType;
  owner: PlayerSlot;
  x: number;
  y: number;
  settleY: number;
  random?: () => number;
  configuredItem?: Readonly<{
    monsterId: MonsterDropId;
    context: MonsterDropContext;
  }>;
}): MonsterDefeatRewardResult | undefined {
  if (params.runtime.settledDefeatIds.has(params.defeatId)) return undefined;
  params.runtime.settledDefeatIds.add(params.defeatId);

  const random = params.random ?? Math.random;
  const config = getMonsterRewardConfig(params.enemyType);
  const medicine = maybeSpawnMedicineDrop(
    params.dropSystem,
    params.x,
    params.y,
    params.settleY,
    random,
  ) as HealthPickup | ManaPickup | undefined;
  const souls = spawnAuraDrops({
    model: params.dropSystem,
    monsterX: params.x,
    monsterY: params.y,
    targetId: params.owner,
    gxp: config.soulPower,
    random,
  });
  const item = params.configuredItem
    ? spawnConfiguredMonsterDrop({
      model: params.dropSystem,
      monsterId: params.configuredItem.monsterId,
      context: params.configuredItem.context,
      x: params.x,
      monsterY: params.y,
      settleY: params.settleY,
      random,
    })
    : undefined;

  return {
    medicine,
    souls,
    item,
    experience: { owner: params.owner, amount: config.experience },
  };
}

export function getPickupSpawnY(monsterY: number): number {
  return monsterY + DropTuning.spawnOffsetY;
}
