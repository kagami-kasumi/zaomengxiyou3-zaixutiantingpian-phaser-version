import {
  EquipmentMakingRecipeRegistry,
  type EquipmentMakingRecipe,
} from './EquipmentMakingRegistry';
import {
  createEmptyEquipmentStats,
  type EquipmentDefinition,
  type EquipmentInstance,
  type EquipmentStats,
} from './EquipmentSystem';
import {
  addEquipmentDefinition,
  addStackByFillName,
  consumeStackByFillName,
  getInventoryCategoryForDefinition,
  getStackQuantityByFillName,
  type InventoryItemStack,
  type InventoryStore,
} from './InventorySystem';
import type { PlayerSlot } from './InputSystem';

type StagedMakingStack = {
  definition: EquipmentDefinition;
};

export type EquipmentMakingSession = {
  owner: PlayerSlot;
  book?: StagedMakingStack;
  gems: StagedMakingStack[];
  lastProduct?: EquipmentInstance;
  message: string;
};

export type EquipmentMakingResult = {
  ok: boolean;
  message: string;
  soulBefore: number;
  soulAfter: number;
  product?: EquipmentInstance;
};

const GemFillNames = new Set([
  'sms1', 'sms2', 'scsms2', 'sms3', 'scsms3',
  'mfs1', 'mfs2', 'scmfs2', 'mfs3', 'scmfs3',
  'gjs1', 'gjs2', 'scgjs2', 'gjs3', 'scgjs3',
  'fys1', 'fys2', 'scfys2', 'fys3', 'scfys3',
  'wptlz', 'wpllz', 'wphlz', 'wpflz', 'wpslz',
]);

export function createEquipmentMakingSession(owner: PlayerSlot): EquipmentMakingSession {
  return { owner, gems: [], message: '请选择制作书，再放入最多三颗可选宝石' };
}

export function getEquipmentMakingRecipe(session: EquipmentMakingSession): EquipmentMakingRecipe | undefined {
  return session.book ? EquipmentMakingRecipeRegistry[session.book.definition.fillName] : undefined;
}

export function getEquipmentMakingSoulCost(quality: string): number {
  return ({ 粗糙: 50, 普通: 100, 优秀: 200, 精良: 400, 史诗: 800, 传说: 1600 } as Record<string, number>)[quality.replaceAll(' ', '')] ?? 0;
}

export function stageEquipmentMakingEntry(
  session: EquipmentMakingSession,
  store: InventoryStore,
  entry: InventoryItemStack | undefined,
): boolean {
  if (!entry || entry.kind !== 'stack') return sessionFailure(session, '请选择制作书或可选宝石');
  const fillName = entry.definition.fillName;
  const recipe = EquipmentMakingRecipeRegistry[fillName];
  if (recipe) {
    const consumed = consumeStackByFillName(store, fillName, 1);
    if (!consumed.ok) return sessionFailure(session, consumed.message);
    if (session.book) returnStack(store, session.book);
    session.book = { definition: entry.definition };
    session.lastProduct = undefined;
    session.message = `已放入 ${entry.definition.name}`;
    return true;
  }
  if (!GemFillNames.has(fillName)) return sessionFailure(session, `${entry.definition.name} 不是制作书或可选宝石`);
  if (!session.book) return sessionFailure(session, '请先放入制作书');
  if (session.gems.length >= 3) return sessionFailure(session, '最多放入三颗可选宝石');
  const consumed = consumeStackByFillName(store, fillName, 1);
  if (!consumed.ok) return sessionFailure(session, consumed.message);
  session.gems.push({ definition: entry.definition });
  session.lastProduct = undefined;
  session.message = `已放入 ${entry.definition.name} (${session.gems.length}/3)`;
  return true;
}

export function closeEquipmentMakingSession(session: EquipmentMakingSession, store: InventoryStore): void {
  if (session.book) returnStack(store, session.book);
  for (const gem of session.gems) returnStack(store, gem);
  const returned = Number(Boolean(session.book)) + session.gems.length;
  session.book = undefined;
  session.gems = [];
  session.lastProduct = undefined;
  session.message = returned > 0 ? `已返还 ${returned} 个未提交物品` : '制作面板已关闭';
}

export function submitEquipmentMaking(params: {
  session: EquipmentMakingSession;
  store: InventoryStore;
  registry: Record<string, EquipmentDefinition>;
  soul: number;
  random?: () => number;
}): EquipmentMakingResult {
  const { session } = params;
  const reject = (message: string): EquipmentMakingResult => {
    session.message = message;
    return { ok: false, message, soulBefore: params.soul, soulAfter: params.soul };
  };
  const recipe = getEquipmentMakingRecipe(session);
  if (!recipe || !session.book) return reject('请先放入可达制作书');
  const productDefinition = params.registry[recipe.productFillName];
  if (!productDefinition) return reject(`制作产物定义缺失：${recipe.productFillName}`);
  const soulCost = getEquipmentMakingSoulCost(session.book.definition.quality);
  if (params.soul < soulCost) return reject(`灵魂不足，需要 ${soulCost}`);
  for (const material of recipe.requiredMaterials) {
    if (getStackQuantityByFillName(params.store, material.fillName) < material.quantity) {
      return reject(`${params.registry[material.fillName]?.name ?? material.fillName} 数量不足，需要 ${material.quantity}`);
    }
  }
  const category = getInventoryCategoryForDefinition(productDefinition);
  if (params.store.categories[category].length >= params.store.capacityPerCategory) {
    return reject('背包容量不足，制作未提交');
  }

  for (const material of recipe.requiredMaterials) {
    const consumed = consumeStackByFillName(params.store, material.fillName, material.quantity);
    if (!consumed.ok) throw new Error(`Equipment making preflight diverged for ${material.fillName}`);
  }
  const product = addEquipmentDefinition(params.store, productDefinition);
  if (!product) throw new Error(`Equipment making capacity preflight diverged for ${recipe.productFillName}`);
  product.baseStatsOverride = createEquipmentMakingStatsOverride(
    productDefinition,
    session.gems.map((gem) => gem.definition.fillName),
    params.random ?? Math.random,
  );
  session.book = undefined;
  session.gems = [];
  session.lastProduct = product;
  session.message = `制作成功：${productDefinition.name}`;
  return {
    ok: true,
    message: session.message,
    soulBefore: params.soul,
    soulAfter: params.soul - soulCost,
    product,
  };
}

export function createEquipmentMakingStatsOverride(
  definition: EquipmentDefinition,
  gemFillNames: readonly string[],
  random: () => number = Math.random,
): Partial<EquipmentStats> {
  const stats = createEmptyEquipmentStats(definition.stats);
  for (const fillName of gemFillNames) applyGemBonus(stats, fillName, random);
  return stats;
}

export function rollEquipmentMakingGemBonus(fillName: string, random: () => number = Math.random): number {
  if (fillName === 'wpflz') return 0.01;
  const u = random();
  if (fillName === 'sms1') return Math.round(20 + u * 15);
  if (fillName === 'sms2' || fillName === 'scsms2') return Math.round(145 + u * 15);
  if (fillName === 'sms3' || fillName === 'scsms3') return Math.round(245 + u * 15);
  if (fillName === 'mfs1') return Math.round(15 + u * 5);
  if (fillName === 'mfs2' || fillName === 'scmfs2') return Math.round(105 + u * 5);
  if (fillName === 'mfs3' || fillName === 'scmfs3') return Math.round(195 + u * 5);
  if (fillName === 'gjs1') return Math.round(9 + u);
  if (fillName === 'gjs2' || fillName === 'scgjs2') return Math.round(15 + u * 5);
  if (fillName === 'gjs3' || fillName === 'scgjs3') return Math.round(35 + u * 5);
  if (fillName === 'fys1') return Math.round(14 + u);
  if (fillName === 'fys2' || fillName === 'scfys2') return Math.round(49 + u);
  if (fillName === 'fys3' || fillName === 'scfys3') return Math.round(89 + u);
  if (fillName === 'wptlz' || fillName === 'wpllz') return 0.01 + u * 0.01;
  if (fillName === 'wphlz') return 8 + Math.round(u);
  if (fillName === 'wpslz') return 4 + Math.round(u);
  return 0;
}

function applyGemBonus(stats: EquipmentStats, fillName: string, random: () => number): void {
  const bonus = rollEquipmentMakingGemBonus(fillName, random);
  if (fillName.startsWith('sms') || fillName.startsWith('scsms')) stats.maxHp += bonus;
  else if (fillName.startsWith('mfs') || fillName.startsWith('scmfs')) stats.maxMp += bonus;
  else if (fillName.startsWith('gjs') || fillName.startsWith('scgjs')) stats.power += bonus;
  else if (fillName.startsWith('fys') || fillName.startsWith('scfys')) stats.defense += bonus;
  else if (fillName === 'wptlz') stats.magicDefensePercent += bonus;
  else if (fillName === 'wpllz') stats.critPercent += bonus;
  else if (fillName === 'wphlz') stats.hpRegen += bonus;
  else if (fillName === 'wpflz') stats.missPercent += bonus;
  else if (fillName === 'wpslz') stats.mpRegen += bonus;
}

function returnStack(store: InventoryStore, staged: StagedMakingStack): void {
  if (!addStackByFillName(store, { [staged.definition.fillName]: staged.definition }, staged.definition.fillName, 1)) {
    throw new Error(`Unable to return staged making item ${staged.definition.fillName}`);
  }
}

function sessionFailure(session: EquipmentMakingSession, message: string): false {
  session.message = message;
  return false;
}
