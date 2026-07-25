import type { PlayerSlot } from './InputSystem';
import {
  applyInventoryTransaction,
  getStackQuantityByFillName,
  type InventoryStore,
} from './InventorySystem';
import type { EquipmentDefinition } from './EquipmentSystem';

export const ImmortalityTypeCount = 5;
export const ImmortalityGradeCount = 5;
export const ImmortalitySoulCost = 1_000;

export type ImmortalityFlags = [
  [number, number, number, number, number],
  [number, number, number, number, number],
  [number, number, number, number, number],
  [number, number, number, number, number],
  [number, number, number, number, number],
];

export type ImmortalityRecipe = Readonly<{
  grade: number;
  firstMaterial: Readonly<{ fillName: string; quantity: number }>;
  secondMaterial: Readonly<{ fillName: string; quantity: number }>;
}>;

export type ImmortalityPlayerState = {
  owner: PlayerSlot;
  soulCount: number;
  inventoryStore: InventoryStore;
  flags: ImmortalityFlags;
};

export type ImmortalityTransactionResult = Readonly<{
  ok: boolean;
  message: string;
}>;

export const ImmortalityFillNamePrefixes = [
  'wpsmd',
  'wpmfd',
  'wpbjd',
  'wphxd',
  'wphld',
] as const;

export const ImmortalityEffectValues = [
  [200, 250, 400, 700, 1_000],
  [200, 300, 400, 600, 800],
  [1, 2, 3, 4, 5],
  [6, 10, 12, 14, 18],
  [1, 3, 5, 7, 8],
] as const;

export const ImmortalityRecipes: readonly ImmortalityRecipe[] = [
  { grade: 0, firstMaterial: { fillName: 'wplh', quantity: 40 }, secondMaterial: { fillName: 'wpll', quantity: 40 } },
  { grade: 1, firstMaterial: { fillName: 'wplh', quantity: 15 }, secondMaterial: { fillName: 'wpxm', quantity: 40 } },
  { grade: 2, firstMaterial: { fillName: 'wpdd', quantity: 1 }, secondMaterial: { fillName: 'wplh', quantity: 20 } },
  { grade: 3, firstMaterial: { fillName: 'wpdd', quantity: 1 }, secondMaterial: { fillName: 'wpsg', quantity: 15 } },
  { grade: 4, firstMaterial: { fillName: 'wpdd', quantity: 1 }, secondMaterial: { fillName: 'wprs', quantity: 10 } },
];

export function createEmptyImmortalityFlags(): ImmortalityFlags {
  return Array.from(
    { length: ImmortalityTypeCount },
    () => Array(ImmortalityGradeCount).fill(0),
  ) as ImmortalityFlags;
}

export function sanitizeImmortalityFlags(value: unknown): ImmortalityFlags {
  if (!Array.isArray(value) || value.length !== ImmortalityTypeCount) {
    return createEmptyImmortalityFlags();
  }
  const rows = value.map((row) => {
    if (!Array.isArray(row) || row.length !== ImmortalityGradeCount) {
      return Array(ImmortalityGradeCount).fill(0);
    }
    return row.map((flag) => flag === 1 ? 1 : 0);
  });
  return rows as ImmortalityFlags;
}

export function cloneImmortalityFlags(flags: ImmortalityFlags): ImmortalityFlags {
  return flags.map((row) => [...row]) as ImmortalityFlags;
}

export function getImmortalityFillName(typeIndex: number, gradeIndex: number): string {
  return `${ImmortalityFillNamePrefixes[typeIndex]}${gradeIndex + 1}`;
}

export function getImmortalityEffectTotals(flags: ImmortalityFlags): number[] {
  return flags.map((row, typeIndex) => row.reduce(
    (total, flag, gradeIndex) => total + (flag ? ImmortalityEffectValues[typeIndex]![gradeIndex]! : 0),
    0,
  ));
}

export function canEatImmortality(
  player: ImmortalityPlayerState,
  typeIndex: number,
  gradeIndex: number,
): boolean {
  if (!isValidCell(typeIndex, gradeIndex) || player.flags[typeIndex]![gradeIndex] === 1) return false;
  if (player.flags[typeIndex]!.slice(0, gradeIndex).some((flag) => flag !== 1)) return false;
  return getStackQuantityByFillName(
    player.inventoryStore,
    getImmortalityFillName(typeIndex, gradeIndex),
  ) > 0;
}

export function eatImmortality(
  player: ImmortalityPlayerState,
  registry: Readonly<Record<string, EquipmentDefinition>>,
  typeIndex: number,
  gradeIndex: number,
): ImmortalityTransactionResult {
  if (!canEatImmortality(player, typeIndex, gradeIndex)) {
    return { ok: false, message: '当前丹药尚未解锁或不在背包中' };
  }
  if (player.soulCount < ImmortalitySoulCost) {
    return { ok: false, message: '灵魂不足1000！' };
  }
  const fillName = getImmortalityFillName(typeIndex, gradeIndex);
  const inventory = applyInventoryTransaction(player.inventoryStore, registry, [
    { kind: 'consume-stack', fillName, quantity: 1 },
  ]);
  if (!inventory.ok) return { ok: false, message: inventory.message };
  player.soulCount -= ImmortalitySoulCost;
  player.flags[typeIndex]![gradeIndex] = 1;
  return { ok: true, message: '服用成功' };
}

export function craftImmortality(
  player: ImmortalityPlayerState,
  registry: Readonly<Record<string, EquipmentDefinition>>,
  typeIndex: number,
  gradeIndex: number,
  random: () => number = Math.random,
): ImmortalityTransactionResult {
  if (!isValidCell(typeIndex, gradeIndex)) return { ok: false, message: '无效丹药配方' };
  if (player.inventoryStore.categories.items.length >= player.inventoryStore.capacityPerCategory) {
    return { ok: false, message: '背包空间不足' };
  }
  const recipe = ImmortalityRecipes[gradeIndex]!;
  if (
    getStackQuantityByFillName(player.inventoryStore, recipe.firstMaterial.fillName) < recipe.firstMaterial.quantity
    || getStackQuantityByFillName(player.inventoryStore, recipe.secondMaterial.fillName) < recipe.secondMaterial.quantity
  ) {
    return { ok: false, message: '道具不足' };
  }
  const result = applyInventoryTransaction(player.inventoryStore, registry, [
    { kind: 'consume-stack', ...recipe.firstMaterial },
    { kind: 'consume-stack', ...recipe.secondMaterial },
    { kind: 'add-resource', fillName: getImmortalityFillName(typeIndex, gradeIndex), quantity: 1 },
  ]);
  if (!result.ok) return { ok: false, message: result.message };
  return random() < 0.05
    ? { ok: true, message: '走火了，丹药可能变质了！' }
    : { ok: true, message: '炼制成功' };
}

function isValidCell(typeIndex: number, gradeIndex: number): boolean {
  return Number.isInteger(typeIndex)
    && Number.isInteger(gradeIndex)
    && typeIndex >= 0
    && typeIndex < ImmortalityTypeCount
    && gradeIndex >= 0
    && gradeIndex < ImmortalityGradeCount;
}
