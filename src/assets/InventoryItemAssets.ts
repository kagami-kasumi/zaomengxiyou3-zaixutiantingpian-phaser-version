import inventoryResourceCatalog from '../../docs/reverse-engineering/reference/inventory-resource-catalog-1.1.json';

export type InventoryItemAssetDefinition = Readonly<{
  key: string;
  path: string;
  status: 'ready';
  source: 'extracted-flash';
  sourcePackage: string;
  sourceSymbol: string;
  sourceCharacterId: number;
}>;

export const inventoryItemAssets = Object.fromEntries(
  inventoryResourceCatalog.items
    .filter((item) => item.icon.status === 'located')
    .map((item) => [item.fillName, {
      key: item.icon.stableKey,
      path: `/assets/ui/inventory/items/${encodeURIComponent(item.fillName)}.png`,
      status: 'ready',
      source: 'extracted-flash',
      sourcePackage: item.icon.sourcePackage!,
      sourceSymbol: item.icon.resolvedSymbol!,
      sourceCharacterId: item.icon.characterId!,
    } satisfies InventoryItemAssetDefinition]),
) as Readonly<Record<string, InventoryItemAssetDefinition>>;

export function getInventoryItemAsset(
  fillName: string,
): InventoryItemAssetDefinition | undefined {
  return inventoryItemAssets[fillName];
}

