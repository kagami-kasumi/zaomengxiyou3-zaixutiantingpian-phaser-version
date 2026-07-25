export type InventoryUiAssetDefinition = Readonly<{
  key: string;
  path: string;
  sourcePackage: 'assets/backpack1.swf';
  sourceCharacterId: number;
}>;

const nativeAsset = (
  key: string,
  path: string,
  sourceCharacterId: number,
): InventoryUiAssetDefinition => ({
  key,
  path,
  sourcePackage: 'assets/backpack1.swf',
  sourceCharacterId,
});

const nativeButton = (name: string, characterId: number) => ({
  up: nativeAsset(`inventory-ui.${name}.up`, `/assets/ui/inventory/native/${name}-up.png`, characterId),
  over: nativeAsset(`inventory-ui.${name}.over`, `/assets/ui/inventory/native/${name}-over.png`, characterId),
  down: nativeAsset(`inventory-ui.${name}.down`, `/assets/ui/inventory/native/${name}-down.png`, characterId),
});

export const inventoryUiAssets = {
  slot: nativeAsset('inventory-ui.pack-slot', '/assets/ui/inventory/native/pack-slot.png', 628),
  close: nativeButton('close', 31),
  previous: nativeButton('previous', 78),
  next: nativeButton('next', 83),
  equipment: nativeButton('equipment', 230),
  items: nativeButton('items', 235),
  fashion: nativeButton('fashion', 240),
  skillBooks: nativeButton('skillBooks', 245),
} as const;

export const inventoryUiAssetList: readonly InventoryUiAssetDefinition[] = [
  inventoryUiAssets.slot,
  ...Object.values(inventoryUiAssets.close),
  ...Object.values(inventoryUiAssets.previous),
  ...Object.values(inventoryUiAssets.next),
  ...Object.values(inventoryUiAssets.equipment),
  ...Object.values(inventoryUiAssets.items),
  ...Object.values(inventoryUiAssets.fashion),
  ...Object.values(inventoryUiAssets.skillBooks),
];
