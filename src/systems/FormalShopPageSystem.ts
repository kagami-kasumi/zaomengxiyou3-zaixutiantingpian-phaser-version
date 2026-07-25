import { createSeedEquipmentRegistry, type EquipmentDefinition } from './EquipmentSystem';
import { createInventoryItemDefinitionRegistry } from './InventoryResourceCatalog';
import { addInventoryResource } from './InventorySystem';
import { getPartyHeroId, getPartyPlayerSlots } from './PartyConfigurationSystem';
import { spendPlayerSouls } from './PlayerSoulSystem';
import { loadActiveGame, saveActiveGame } from './SaveSlotSystem';
import {
  createGameSave,
  restoreGameState,
  type GameSaveV6,
  type LoadedGameState,
  type LoadedPlayer1State,
  type SaveStorage,
} from './SaveSystem';

export const FormalShopCategories = ['all', 'gems', 'items', 'fashion', 'pets'] as const;
export type FormalShopCategory = typeof FormalShopCategories[number];
export type FormalShopOwner = (ReturnType<typeof getPartyPlayerSlots>)[number];

export type FormalShopItem = Readonly<{
  fillName: string;
  name: string;
  category: Exclude<FormalShopCategory, 'all'>;
  basePrice: number;
}>;

export const FormalShopItems: readonly FormalShopItem[] = [
  ...shopItems('gems', [
    ['wpqhs1', '1级强化石', 8000], ['wpqhs2', '2级强化石', 20000],
    ['wpqhs3', '3级强化石', 52000], ['wpqhs4', '4级强化石', 135000],
    ['sms2', '2级生命石', 14000], ['sms3', '3级生命石', 35000],
    ['mfs2', '2级魔法石', 14000], ['mfs3', '3级魔法石', 35000],
    ['gjs2', '2级攻击石', 14000], ['gjs3', '3级攻击石', 35000],
    ['fys2', '2级防御石', 14000], ['fys3', '3级防御石', 35000],
    ['wphlz', '火灵珠', 35000], ['wpslz', '水灵珠', 35000],
    ['wptlz', '土灵珠', 35000], ['wpllz', '雷灵珠', 35000],
    ['wpflz', '风灵珠', 35000], ['wpxyf', '幸运符', 35000],
    ['wpbdf', '神恩符', 30000],
  ]),
  ...shopItems('pets', [
    ['wpcsd', '长生丹', 35000], ['wphhd', '还魂丹', 35000],
    ['cwjnxld', '宠物技能洗练丹', 50000], ['cwzzxld', '宠物属性洗练丹', 50000],
    ['djyys', '宠物大经验药水', 50000],
  ]),
  ...shopItems('fashion', [
    ['ptnmwsz', '牛魔王装', 30000], ['ptzlwsz', '转轮王装', 30000],
    ['ptsmsrsz', '神秘商人装', 20000], ['ptttzssz', '天庭战神装', 80000],
    ['lzysz', '武状元装', 288888], ['hzysz', '文状元装', 288888],
    ['mrsz', '鸣人时装', 288888], ['bssz', '八神时装', 288888],
  ]),
  ...shopItems('items', [
    ['jtl', '究天链', 250000], ['zylhys', '灵魂药水', 114514],
    ['mpyj', '孟婆药剂', 15000], ['css6', '6层传送石', 12000],
    ['css12', '12层传送石', 21000], ['css18', '18层传送石', 30000],
    ['css24', '24层传送石', 40000], ['css_2', '地下2层传送石', 70000],
    ['css_3', '地下3层传送石', 100000], ['css_4', '地下4层传送石', 110000],
    ['wwdgl', '狗粮', 10000], ['yll', '阎罗令', 40000],
    ['wplwl', '龙王令', 40000], ['wpbsz', '避水珠', 40000],
    ['ttlpsp1', '通天令牌碎片一', 100000],
    ['ttlpsp2', '通天令牌碎片二', 100000],
    ['ttlpsp3', '通天令牌碎片三', 100000],
  ]),
];

export type FormalShopPageModel = {
  owner: FormalShopOwner;
  category: FormalShopCategory;
  page: number;
  quantities: Record<string, number>;
  pendingFillName?: string;
  message: string;
  currentBigStage: number;
  sourceSave: GameSaveV6;
  restored: LoadedGameState;
  registry: Record<string, EquipmentDefinition>;
};

export function createFormalShopPage(storage: SaveStorage): FormalShopPageModel | undefined {
  const sourceSave = loadActiveGame(storage);
  if (!sourceSave) return undefined;
  const registry = createInventoryItemDefinitionRegistry(createSeedEquipmentRegistry());
  return {
    owner: 'p1',
    category: 'all',
    page: 1,
    quantities: Object.fromEntries(FormalShopItems.map((item) => [item.fillName, 1])),
    message: '',
    currentBigStage: sourceSave.levelUnlockProgress.unlockedStage,
    sourceSave,
    restored: restoreGameState(sourceSave, registry),
    registry,
  };
}

export function getFormalShopOwners(model: FormalShopPageModel): readonly FormalShopOwner[] {
  return getPartyPlayerSlots(model.sourceSave.party);
}

export function setFormalShopOwner(model: FormalShopPageModel, owner: FormalShopOwner): boolean {
  if (getPartyHeroId(model.sourceSave.party, owner) === undefined) return false;
  model.owner = owner;
  model.pendingFillName = undefined;
  model.message = '';
  return true;
}

export function getFormalShopPlayer(model: FormalShopPageModel): LoadedPlayer1State {
  return model.owner === 'p1' ? model.restored.player1 : model.restored.player2;
}

export function selectFormalShopCategory(
  model: FormalShopPageModel,
  category: FormalShopCategory,
): void {
  model.category = category;
  model.page = 1;
  model.pendingFillName = undefined;
  model.message = '';
}

export function getFormalShopPageCount(model: FormalShopPageModel): number {
  return Math.max(1, Math.ceil(getCategoryItems(model.category).length / 9));
}

export function changeFormalShopPage(model: FormalShopPageModel, delta: number): void {
  model.page = Math.min(
    getFormalShopPageCount(model),
    Math.max(1, model.page + Math.sign(delta)),
  );
  model.pendingFillName = undefined;
  model.message = '';
}

export function getFormalShopVisibleItems(
  model: FormalShopPageModel,
): readonly FormalShopItem[] {
  const start = (model.page - 1) * 9;
  return getCategoryItems(model.category).slice(start, start + 9);
}

export function getFormalShopUnitPrice(
  item: FormalShopItem,
  currentBigStage: number,
): number {
  return currentBigStage > 2 && item.fillName !== 'zylhys'
    ? Math.trunc(item.basePrice * 0.8)
    : item.basePrice;
}

export function getFormalShopQuantity(
  model: FormalShopPageModel,
  fillName: string,
): number {
  return model.quantities[fillName] ?? 1;
}

export function changeFormalShopQuantity(
  model: FormalShopPageModel,
  fillName: string,
  delta: number,
): void {
  const current = getFormalShopQuantity(model, fillName);
  model.quantities[fillName] = Math.min(100, Math.max(1, current + Math.sign(delta)));
}

export function setFormalShopTypedQuantity(
  model: FormalShopPageModel,
  fillName: string,
  value: number,
): boolean {
  if (!Number.isInteger(value) || value < 0 || value > 99) return false;
  model.quantities[fillName] = value;
  return true;
}

export function openFormalShopConfirmation(
  model: FormalShopPageModel,
  fillName: string,
): boolean {
  if (getFormalShopQuantity(model, fillName) <= 0 || !findFormalShopItem(fillName)) return false;
  model.pendingFillName = fillName;
  model.message = '';
  return true;
}

export function closeFormalShopConfirmation(model: FormalShopPageModel): void {
  model.pendingFillName = undefined;
  model.message = '';
}

export function getFormalShopConfirmationText(model: FormalShopPageModel): string {
  const item = model.pendingFillName ? findFormalShopItem(model.pendingFillName) : undefined;
  if (!item) return '';
  const quantity = getFormalShopQuantity(model, item.fillName);
  const total = getFormalShopUnitPrice(item, model.currentBigStage) * quantity;
  return `你确定要购买 ${quantity} 个${item.name}\n总共花费 ${total} 灵魂`;
}

export function confirmFormalShopPurchase(
  model: FormalShopPageModel,
  storage: SaveStorage,
): boolean {
  const item = model.pendingFillName ? findFormalShopItem(model.pendingFillName) : undefined;
  if (!item) return false;
  const quantity = getFormalShopQuantity(model, item.fillName);
  const total = getFormalShopUnitPrice(item, model.currentBigStage) * quantity;
  const player = getFormalShopPlayer(model);
  if (player.soulCount < total) {
    model.pendingFillName = undefined;
    model.message = '灵魂不足！';
    return false;
  }
  const inventory = addInventoryResource(player.inventoryStore, model.registry, item.fillName, quantity);
  if (!inventory.ok) {
    model.pendingFillName = undefined;
    model.message = inventory.message;
    return false;
  }
  spendPlayerSouls(player, total);
  model.quantities[item.fillName] = 1;
  model.pendingFillName = undefined;
  model.message = '购买成功！';
  persistFormalShopPage(model, storage);
  return true;
}

export function showFormalShopOfflineChargeMessage(model: FormalShopPageModel): void {
  model.message = '单机版请用灵魂购买~';
}

function getCategoryItems(category: FormalShopCategory): readonly FormalShopItem[] {
  return category === 'all'
    ? FormalShopItems
    : FormalShopItems.filter((item) => item.category === category);
}

function findFormalShopItem(fillName: string): FormalShopItem | undefined {
  return FormalShopItems.find((item) => item.fillName === fillName);
}

function shopItems(
  category: Exclude<FormalShopCategory, 'all'>,
  items: readonly (readonly [string, string, number])[],
): FormalShopItem[] {
  return items.map(([fillName, name, basePrice]) => ({ fillName, name, category, basePrice }));
}

function persistFormalShopPage(model: FormalShopPageModel, storage: SaveStorage): void {
  const { player1, player2 } = model.restored;
  const save = createGameSave({
    party: model.sourceSave.party,
    progression: player1.progression,
    soulCount: player1.soulCount,
    skillLoadout: player1.skillLoadout,
    skillLearning: player1.skillLearning,
    inventoryStore: player1.inventoryStore,
    immortalityFlags: player1.immortalityFlags,
    equipmentLoadout: player1.equipmentLoadout,
    petRoster: player1.petRoster,
    player2Progression: player2.progression,
    player2SoulCount: player2.soulCount,
    player2SkillLoadout: player2.skillLoadout,
    player2SkillLearning: player2.skillLearning,
    player2InventoryStore: player2.inventoryStore,
    player2ImmortalityFlags: player2.immortalityFlags,
    player2EquipmentLoadout: player2.equipmentLoadout,
    player2PetRoster: player2.petRoster,
    levelUnlockProgress: model.sourceSave.levelUnlockProgress,
  });
  saveActiveGame(storage, save);
  model.sourceSave = save;
}
