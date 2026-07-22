import craftingItemCatalog from '../../docs/reverse-engineering/reference/crafting-item-catalog-1.1.json';

import {
  createEmptyEquipmentStats,
  type EquipmentDefinition,
  type EquipmentItemType,
} from './EquipmentSystem';
import {
  addEquipmentDefinition,
  addStackByFillName,
  createSeedInventoryStore,
  getInventoryCategoryForDefinition,
  type InventoryEntry,
  type InventoryStore,
} from './InventorySystem';

const CRAFTING_ITEM_TYPES = new Set<EquipmentItemType>([
  'zbwq', 'zbfj', 'zbsp', 'zbfb', 'zbsz', 'zbcb', 'zbtx', 'zbwp', 'wpqhs',
]);

export const CraftingItemCatalogFillNames = craftingItemCatalog.items.map((item) => item.fillName);
export const CraftingMaterialFillNames = new Set(
  craftingItemCatalog.items.filter((item) => item.roles.includes('material')).map((item) => item.fillName),
);

export function createCraftingItemDefinitionRegistry(
  existing: Readonly<Record<string, EquipmentDefinition>> = {},
): Record<string, EquipmentDefinition> {
  return Object.fromEntries(craftingItemCatalog.items.map((item) => {
    if (item.authorityStatus !== 'confirmed' || !item.name || !item.originalType) {
      throw new Error(`Unresolved crafting item authority: ${item.fillName}`);
    }
    const type = asEquipmentItemType(item.originalType, item.fillName);
    const previous = existing[item.fillName];
    const definition: EquipmentDefinition = {
      showId: item.showId ?? previous?.showId ?? 1,
      name: item.name,
      fillName: item.fillName,
      type,
      user: item.user ?? previous?.user ?? '',
      quality: item.quality ?? previous?.quality ?? '未校准',
      color: item.color ?? previous?.color ?? '0xFFFFFF',
      stats: previous?.stats ?? createEmptyEquipmentStats(),
      description: isProvisionalDefinition(previous)
        ? '1.1 AllEquipment.as 权威身份/类别；数值属性待后续内容校准'
        : previous?.description ?? '1.1 AllEquipment.as 权威身份/类别',
      ...(previous?.magicWeapon ? { magicWeapon: previous.magicWeapon } : {}),
      ...(previous?.strengthGrowth ? { strengthGrowth: previous.strengthGrowth } : {}),
    };
    return [item.fillName, definition];
  }));
}

export function createCraftingAcceptanceInventoryStore(
  registry: Record<string, EquipmentDefinition>,
  equipmentInstanceIdPrefix = 'crafting-acceptance',
): InventoryStore {
  const store = createSeedInventoryStore(registry, equipmentInstanceIdPrefix);
  store.capacityPerCategory = 300;

  for (const fillName of CraftingItemCatalogFillNames) {
    const definition = registry[fillName];
    if (!definition) throw new Error(`Crafting definition is missing: ${fillName}`);
    const targetQuantity = CraftingMaterialFillNames.has(fillName) ? 3 : 1;
    const currentQuantity = countInventoryFillName(store, fillName);
    const missingQuantity = targetQuantity - currentQuantity;
    if (missingQuantity <= 0) continue;

    const category = getInventoryCategoryForDefinition(definition);
    if (category === 'items' || category === 'skillBooks') {
      if (!addStackByFillName(store, registry, fillName, missingQuantity)) {
        throw new Error(`Unable to add crafting acceptance stack: ${fillName}`);
      }
      continue;
    }
    for (let index = 0; index < missingQuantity; index += 1) {
      if (!addEquipmentDefinition(store, definition)) {
        throw new Error(`Unable to add crafting acceptance equipment: ${fillName}`);
      }
    }
  }
  return store;
}

function isProvisionalDefinition(definition: EquipmentDefinition | undefined): boolean {
  return !definition ||
    definition.name === definition.fillName ||
    definition.description.includes('占位') ||
    definition.description.includes('配方测试材料') ||
    definition.description === '1.1 合成注册表物品';
}

function asEquipmentItemType(value: string, fillName: string): EquipmentItemType {
  if (!CRAFTING_ITEM_TYPES.has(value as EquipmentItemType)) {
    throw new Error(`Unsupported crafting item type ${value} for ${fillName}`);
  }
  return value as EquipmentItemType;
}

function countInventoryFillName(store: InventoryStore, fillName: string): number {
  return Object.values(store.categories).flat().reduce(
    (total, entry: InventoryEntry) => total + (
      entry.definition.fillName === fillName ? entry.quantity : 0
    ),
    0,
  );
}
