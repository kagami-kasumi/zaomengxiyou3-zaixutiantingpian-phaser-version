import inventoryResourceCatalog from '../../docs/reverse-engineering/reference/inventory-resource-catalog-1.1.json';

import {
  createEmptyEquipmentStats,
  createSeedEquipmentRegistry,
  type EquipmentDefinition,
  type EquipmentItemType,
} from './EquipmentSystem';
import type { InventoryCategory } from './InventorySystem';

export type InventoryQuantityModel = 'instance' | 'stack';
export type InventoryIconStatus =
  | 'located'
  | 'known-broken-original-lookup'
  | 'missing-original';

export type InventoryResourceDefinition = Readonly<{
  fillName: string;
  displayName: string;
  showId: number;
  originalType: EquipmentItemType;
  user: string;
  quality: string;
  color: string;
  inventoryCategory: InventoryCategory;
  quantityModel: InventoryQuantityModel;
  reachability: 'external-reference-observed' | 'catalog-only-no-external-producer';
  icon: Readonly<{
    stableKey: string;
    status: InventoryIconStatus;
    resolvedSymbol: string | null;
    sourcePackage: string | null;
    characterId: number | null;
    modernEligibility: string;
  }>;
  itemSpecificUseEffect: string;
}>;

const SUPPORTED_ITEM_TYPES = new Set<EquipmentItemType>([
  'zbwq', 'zbfj', 'zbsp', 'zbfb', 'zbsz', 'zbcb', 'zbtx', 'zbwp', 'wpqhs',
]);

export const InventoryResourceDefinitions: readonly InventoryResourceDefinition[] =
  inventoryResourceCatalog.items.map((item) => {
    if (!SUPPORTED_ITEM_TYPES.has(item.originalType as EquipmentItemType)) {
      throw new Error(`Unsupported inventory item type ${item.originalType} for ${item.fillName}`);
    }
    return {
      fillName: item.fillName,
      displayName: item.displayName,
      showId: item.showId,
      originalType: item.originalType as EquipmentItemType,
      user: item.user,
      quality: item.quality,
      color: item.color,
      inventoryCategory: item.inventoryCategory as InventoryCategory,
      quantityModel: item.quantityModel as InventoryQuantityModel,
      reachability: item.reachability as InventoryResourceDefinition['reachability'],
      icon: {
        stableKey: item.icon.stableKey,
        status: item.icon.status as InventoryIconStatus,
        resolvedSymbol: item.icon.resolvedSymbol ?? null,
        sourcePackage: item.icon.sourcePackage ?? null,
        characterId: item.icon.characterId ?? null,
        modernEligibility: item.icon.modernEligibility,
      },
      itemSpecificUseEffect: item.implementation.itemSpecificUseEffect,
    };
  });

export const InventoryResourceCatalog = Object.fromEntries(
  InventoryResourceDefinitions.map((definition) => [definition.fillName, definition]),
) as Readonly<Record<string, InventoryResourceDefinition>>;

export const InventoryResourceFillNames = new Set(
  InventoryResourceDefinitions.map((definition) => definition.fillName),
);

export const LegacyInventoryCompatibilityFillNames = new Set([
  'wphtd',
  'nianqld',
  'nianjhd',
]);

export const LoadableInventoryResourceDefinitions = InventoryResourceDefinitions.filter(
  (definition) => definition.icon.status === 'located',
);

export const ExcludedInventoryResourceDefinitions = InventoryResourceDefinitions.filter(
  (definition) => definition.icon.status !== 'located',
);

export function getInventoryResourceDefinition(
  fillName: string,
): InventoryResourceDefinition | undefined {
  return InventoryResourceCatalog[fillName];
}

export function isKnownInventoryResource(fillName: string): boolean {
  return InventoryResourceFillNames.has(fillName) ||
    LegacyInventoryCompatibilityFillNames.has(fillName);
}

export function createInventoryItemDefinitionRegistry(
  existing: Readonly<Record<string, EquipmentDefinition>> = createSeedEquipmentRegistry(),
): Record<string, EquipmentDefinition> {
  return {
    ...existing,
    ...Object.fromEntries(InventoryResourceDefinitions.map((item) => {
    const previous = existing[item.fillName];
    return [item.fillName, {
      showId: item.showId,
      name: item.displayName,
      fillName: item.fillName,
      type: item.originalType,
      user: item.user,
      quality: item.quality,
      color: item.color,
      stats: previous?.stats ?? createEmptyEquipmentStats(),
      description: previous?.description ??
        '原版 1.1 权威背包身份；专属用途与数值效果尚未接入',
      ...(previous?.strengthGrowth ? { strengthGrowth: previous.strengthGrowth } : {}),
      ...(previous?.magicWeapon ? { magicWeapon: previous.magicWeapon } : {}),
    } satisfies EquipmentDefinition];
    })),
  };
}
