import { createCraftingItemDefinitionRegistry } from './CraftingItemDefinitionRegistry';
import {
  createSeedEquipmentRegistry,
  getEquipmentInstanceStats,
  upgradeMagicWeaponInstance,
  type EquipmentDefinition,
  type EquipmentInstance,
  type EquipmentStats,
} from './EquipmentSystem';
import {
  consumeStackByFillName,
  getStackQuantityByFillName,
} from './InventorySystem';
import { loadActiveGame, saveActiveGame } from './SaveSlotSystem';
import {
  createGameSave,
  restoreGameState,
  type GameSaveV4,
  type LoadedGameState,
  type LoadedPlayer1State,
  type SaveStorage,
} from './SaveSystem';

export const MagicWeaponResetElement = '金 木 水 火 土';

export type MagicWeaponUpgradeCost = {
  kind: 'soul' | 'material';
  fillName?: string;
  name: string;
  quantity: number;
};

export type MagicWeaponUpgradeRequirement = {
  available: boolean;
  currentLevel: number;
  nextLevel: number;
  maxLevel: number;
  confirmationRequired: boolean;
  cost?: MagicWeaponUpgradeCost;
  message: string;
};

export type MagicWeaponPendingAction = {
  kind: 'upgrade' | 'reset-element';
  instanceId: string;
  level: number;
  prompt: string;
  cost: MagicWeaponUpgradeCost;
};

export type FormalMagicWeaponPageModel = {
  owner: 'p1';
  sourceSave: GameSaveV4;
  restored: LoadedGameState;
  registry: Record<string, EquipmentDefinition>;
  pending?: MagicWeaponPendingAction;
  message: string;
};

export type FormalMagicWeaponPanelState = {
  equipped: boolean;
  name: string;
  fillName: string;
  level: number;
  growthRate: number;
  element: string;
  stats: EquipmentStats;
  soul: number;
  requirement: MagicWeaponUpgradeRequirement;
  resetMaterialCount: number;
  message: string;
};

export type MagicWeaponActionResult = 'upgraded' | 'pending' | 'cancelled' | 'rejected' | 'reset';

export function createFormalMagicWeaponPage(
  storage: SaveStorage,
): FormalMagicWeaponPageModel | undefined {
  const sourceSave = loadActiveGame(storage);
  if (!sourceSave) return undefined;
  const seedRegistry = createSeedEquipmentRegistry();
  const registry = {
    ...seedRegistry,
    ...createCraftingItemDefinitionRegistry(seedRegistry),
  };
  const restored = restoreGameState(sourceSave, registry);
  return {
    owner: 'p1',
    sourceSave,
    restored,
    registry,
    message: restored.player1.equipmentLoadout.magicWeapon
      ? 'P1 法宝页面已打开；原版没有 P2 法宝面板快捷键'
      : '未装备法宝，无法进入强化与五行重置事务',
  };
}

export function getFormalMagicWeaponPlayer(model: FormalMagicWeaponPageModel): LoadedPlayer1State {
  return model.restored.player1;
}

export function getFormalMagicWeaponPanelState(
  model: FormalMagicWeaponPageModel,
): FormalMagicWeaponPanelState {
  const player = getFormalMagicWeaponPlayer(model);
  const equipped = player.equipmentLoadout.magicWeapon;
  if (!equipped?.definition.magicWeapon) {
    return {
      equipped: false,
      name: '-',
      fillName: '-',
      level: 0,
      growthRate: 0,
      element: '-',
      stats: getEmptyPanelStats(),
      soul: player.skillLearning.soulCount,
      requirement: unavailableRequirement(0, 0, '未装备法宝'),
      resetMaterialCount: getStackQuantityByFillName(player.inventoryStore, 'wpccfq'),
      message: model.message,
    };
  }
  const magic = equipped.definition.magicWeapon;
  return {
    equipped: true,
    name: equipped.definition.name,
    fillName: equipped.definition.fillName,
    level: magic.level,
    growthRate: magic.growthRate ?? 1,
    element: magic.element,
    stats: getEquipmentInstanceStats(equipped),
    soul: player.skillLearning.soulCount,
    requirement: getMagicWeaponUpgradeRequirement(equipped),
    resetMaterialCount: getStackQuantityByFillName(player.inventoryStore, 'wpccfq'),
    message: model.message,
  };
}

export function getMagicWeaponUpgradeRequirement(
  equipped: EquipmentInstance,
): MagicWeaponUpgradeRequirement {
  const magic = equipped.definition.magicWeapon;
  if (!magic) return unavailableRequirement(0, 0, '当前装备不是法宝');
  const fillName = equipped.definition.fillName;
  const level = magic.level;
  const maxLevel = getMagicWeaponMaxLevel(fillName);
  if (level >= maxLevel) return unavailableRequirement(level, maxLevel, '已达最高等级');
  const nextLevel = level + 1;

  if (fillName === 'zsTimer') {
    return materialRequirement(level, maxLevel, nextLevel <= 5 ? 'zsTimerup1' : 'zsTimerup2',
      nextLevel <= 5 ? '烛时星魄1' : '烛时星魄2',
      nextLevel <= 5 ? nextLevel - 1 : Math.ceil((nextLevel - 5) * 1.5));
  }
  if (fillName === 'mdhf' || fillName === 'jyhl' || fillName === 'tjbg') {
    const offset = fillName === 'tjbg' ? 1 : 0;
    return materialRequirement(level, maxLevel, nextLevel <= 5 ? 'kly4' : 'kly5',
      nextLevel <= 5 ? '4级昆仑玉' : '5级昆仑玉',
      nextLevel <= 5 ? nextLevel - 1 + offset : Math.ceil((nextLevel - 5 + offset) * 1.5));
  }
  if (fillName === 'fbqpj' && level >= 3) {
    const quantities = [1, 1, 1, 3, 5, 7];
    return materialRequirement(level, maxLevel, 'qpjy', '青萍精元', quantities[nextLevel - 4] ?? 0);
  }
  if (level < 10) {
    const quantity = level * level * 1000;
    return {
      available: true,
      currentLevel: level,
      nextLevel,
      maxLevel,
      confirmationRequired: false,
      cost: { kind: 'soul', name: '灵魂', quantity },
      message: `消耗 ${quantity} 灵魂升级到 Lv.${nextLevel}`,
    };
  }
  const stage = level - 9;
  return materialRequirement(level, maxLevel, 'wplvdyl', '龙女的眼泪', stage * stage * 3);
}

export function requestFormalMagicWeaponUpgrade(
  model: FormalMagicWeaponPageModel,
  storage: SaveStorage,
): MagicWeaponActionResult {
  const equipped = getFormalMagicWeaponPlayer(model).equipmentLoadout.magicWeapon;
  if (!equipped?.definition.magicWeapon) return reject(model, '未装备法宝');
  const requirement = getMagicWeaponUpgradeRequirement(equipped);
  if (!requirement.available || !requirement.cost) return reject(model, requirement.message);
  if (requirement.confirmationRequired) {
    model.pending = {
      kind: 'upgrade',
      instanceId: equipped.instanceId,
      level: requirement.currentLevel,
      prompt: `确认将 ${equipped.definition.name} 升到 Lv.${requirement.nextLevel}？`,
      cost: requirement.cost,
    };
    model.message = `${model.pending.prompt} 消耗 ${formatCost(requirement.cost)}`;
    return 'pending';
  }
  return commitUpgrade(model, storage, requirement.cost);
}

export function requestFormalMagicWeaponElementReset(
  model: FormalMagicWeaponPageModel,
): MagicWeaponActionResult {
  const equipped = getFormalMagicWeaponPlayer(model).equipmentLoadout.magicWeapon;
  if (!equipped?.definition.magicWeapon) return reject(model, '未装备法宝');
  const count = getStackQuantityByFillName(getFormalMagicWeaponPlayer(model).inventoryStore, 'wpccfq');
  const cost: MagicWeaponUpgradeCost = { kind: 'material', fillName: 'wpccfq', name: '传承法器', quantity: 3 };
  model.pending = {
    kind: 'reset-element',
    instanceId: equipped.instanceId,
    level: equipped.definition.magicWeapon.level,
    prompt: `确认使用 3 个传承法器重置五行？当前有 ${count} 个`,
    cost,
  };
  model.message = model.pending.prompt;
  return 'pending';
}

export function confirmFormalMagicWeaponAction(
  model: FormalMagicWeaponPageModel,
  storage: SaveStorage,
): MagicWeaponActionResult {
  const pending = model.pending;
  if (!pending) return reject(model, '当前没有待确认事务');
  model.pending = undefined;
  const equipped = getFormalMagicWeaponPlayer(model).equipmentLoadout.magicWeapon;
  if (!equipped?.definition.magicWeapon || equipped.instanceId !== pending.instanceId || equipped.definition.magicWeapon.level !== pending.level) {
    return reject(model, '法宝状态已变化，请重新提交');
  }
  return pending.kind === 'upgrade'
    ? commitUpgrade(model, storage, pending.cost)
    : commitElementReset(model, storage, pending.cost);
}

export function cancelFormalMagicWeaponAction(
  model: FormalMagicWeaponPageModel,
): MagicWeaponActionResult {
  if (!model.pending) return reject(model, '当前没有待确认事务');
  model.pending = undefined;
  model.message = '已取消，未消耗材料且法宝保持不变';
  return 'cancelled';
}

function commitUpgrade(
  model: FormalMagicWeaponPageModel,
  storage: SaveStorage,
  cost: MagicWeaponUpgradeCost,
): MagicWeaponActionResult {
  const player = getFormalMagicWeaponPlayer(model);
  const equipped = player.equipmentLoadout.magicWeapon;
  if (!equipped?.definition.magicWeapon) return reject(model, '未装备法宝');
  if (!hasCost(player, cost)) return reject(model, `${cost.name}数量不足`);
  const upgraded = makePersistableMagicWeapon(upgradeMagicWeaponInstance(materializeMagicWeapon(equipped)));
  if (upgraded.definition.magicWeapon?.level === equipped.definition.magicWeapon.level) {
    return reject(model, '法宝升级失败，未消耗资源');
  }
  consumeCost(player, cost);
  player.equipmentLoadout.magicWeapon = upgraded;
  persistFormalMagicWeaponPage(model, storage);
  model.message = `${upgraded.definition.name} 已升到 Lv.${upgraded.definition.magicWeapon?.level}；消耗 ${formatCost(cost)}`;
  return 'upgraded';
}

function commitElementReset(
  model: FormalMagicWeaponPageModel,
  storage: SaveStorage,
  cost: MagicWeaponUpgradeCost,
): MagicWeaponActionResult {
  const player = getFormalMagicWeaponPlayer(model);
  const current = player.equipmentLoadout.magicWeapon;
  if (!current?.definition.magicWeapon) return reject(model, '未装备法宝');
  if (!hasCost(player, cost)) return reject(model, '传承法器数量不够');
  const base = model.registry[current.definition.fillName];
  if (!base?.magicWeapon) return reject(model, '当前法宝缺少基础定义');
  const targetLevel = current.definition.magicWeapon.level;
  let rebuilt: EquipmentInstance = {
    ...current,
    baseStatsOverride: undefined,
    definition: {
      ...base,
      magicWeapon: { ...base.magicWeapon, level: 1, element: MagicWeaponResetElement },
    },
  };
  while ((rebuilt.definition.magicWeapon?.level ?? 1) < targetLevel) {
    rebuilt = upgradeMagicWeaponInstance(rebuilt);
  }
  rebuilt = makePersistableMagicWeapon(rebuilt);
  consumeCost(player, cost);
  player.equipmentLoadout.magicWeapon = rebuilt;
  persistFormalMagicWeaponPage(model, storage);
  model.message = `${rebuilt.definition.name} 保留 Lv.${targetLevel} 并重建五行与成长属性`;
  return 'reset';
}

function hasCost(player: LoadedPlayer1State, cost: MagicWeaponUpgradeCost): boolean {
  return cost.kind === 'soul'
    ? player.skillLearning.soulCount >= cost.quantity
    : getStackQuantityByFillName(player.inventoryStore, cost.fillName ?? '') >= cost.quantity;
}

function consumeCost(player: LoadedPlayer1State, cost: MagicWeaponUpgradeCost): void {
  if (cost.kind === 'soul') {
    player.skillLearning.soulCount -= cost.quantity;
    return;
  }
  consumeStackByFillName(player.inventoryStore, cost.fillName ?? '', cost.quantity);
}

function materializeMagicWeapon(instance: EquipmentInstance): EquipmentInstance {
  return {
    ...instance,
    definition: { ...instance.definition, stats: getEquipmentInstanceStats(instance) },
  };
}

function makePersistableMagicWeapon(instance: EquipmentInstance): EquipmentInstance {
  return { ...instance, baseStatsOverride: { ...instance.definition.stats } };
}

function getMagicWeaponMaxLevel(fillName: string): number {
  if (fillName === 'tjbg' || fillName === 'fbqpj') return 9;
  if (fillName === 'zsTimer' || fillName === 'mdhf' || fillName === 'jyhl' || fillName === 'stlp' || fillName === 'xhmt') return 10;
  return 15;
}

function materialRequirement(
  currentLevel: number,
  maxLevel: number,
  fillName: string,
  name: string,
  quantity: number,
): MagicWeaponUpgradeRequirement {
  return {
    available: true,
    currentLevel,
    nextLevel: currentLevel + 1,
    maxLevel,
    confirmationRequired: true,
    cost: { kind: 'material', fillName, name, quantity },
    message: `消耗 ${quantity} 个${name}升级到 Lv.${currentLevel + 1}`,
  };
}

function unavailableRequirement(currentLevel: number, maxLevel: number, message: string): MagicWeaponUpgradeRequirement {
  return { available: false, currentLevel, nextLevel: currentLevel, maxLevel, confirmationRequired: false, message };
}

function reject(model: FormalMagicWeaponPageModel, message: string): 'rejected' {
  model.message = message;
  return 'rejected';
}

function formatCost(cost: MagicWeaponUpgradeCost): string {
  return `${cost.quantity} ${cost.name}`;
}

function getEmptyPanelStats(): EquipmentStats {
  return {
    maxHp: 0, maxMp: 0, power: 0, defense: 0, critPercent: 0, missPercent: 0,
    hpRegen: 0, mpRegen: 0, lifeStealPercent: 0, magicDefensePercent: 0, piercePercent: 0, shield: 0,
  };
}

function persistFormalMagicWeaponPage(model: FormalMagicWeaponPageModel, storage: SaveStorage): void {
  const { player1, player2 } = model.restored;
  const save = createGameSave({
    progression: player1.progression,
    skillLoadout: player1.skillLoadout,
    skillLearning: player1.skillLearning,
    inventoryStore: player1.inventoryStore,
    equipmentLoadout: player1.equipmentLoadout,
    petRoster: player1.petRoster,
    player2Progression: player2.progression,
    player2SkillLoadout: player2.skillLoadout,
    player2SkillLearning: player2.skillLearning,
    player2InventoryStore: player2.inventoryStore,
    player2EquipmentLoadout: player2.equipmentLoadout,
    player2PetRoster: player2.petRoster,
    levelUnlockProgress: model.sourceSave.levelUnlockProgress,
  });
  saveActiveGame(storage, save);
  model.sourceSave = save;
}
