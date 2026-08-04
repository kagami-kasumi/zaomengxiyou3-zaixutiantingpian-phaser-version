export type InventoryUiAssetDefinition = Readonly<{
  key: string;
  path: string;
  sourcePackage: 'assets/backpack1.swf';
  sourceCharacterId: number;
  sourceFrame?: number;
  sourceState?: string;
}>;

const nativeAsset = (
  key: string,
  path: string,
  sourceCharacterId: number,
  sourceFrame?: number,
  sourceState?: string,
): InventoryUiAssetDefinition => ({
  key,
  path,
  sourcePackage: 'assets/backpack1.swf',
  sourceCharacterId,
  ...(sourceFrame === undefined ? {} : { sourceFrame }),
  ...(sourceState === undefined ? {} : { sourceState }),
});

const nativeButton = (name: string, characterId: number) => ({
  up: nativeAsset(`inventory-ui.${name}.up`, `/assets/ui/inventory/native/${name}-up.png`, characterId, 1, 'up'),
  over: nativeAsset(`inventory-ui.${name}.over`, `/assets/ui/inventory/native/${name}-over.png`, characterId, 2, 'over'),
  down: nativeAsset(`inventory-ui.${name}.down`, `/assets/ui/inventory/native/${name}-down.png`, characterId, 3, 'down'),
});

const nativeFrame = (
  name: string,
  characterId: number,
  frame: number,
  state: string,
  fileName = name,
) => nativeAsset(
  `inventory-ui.${name}`,
  `/assets/ui/inventory/native/${fileName}.png`,
  characterId,
  frame,
  state,
);

const expFrames = Array.from({ length: 30 }, (_, index) => {
  const frame = index + 1;
  const suffix = frame.toString().padStart(2, '0');
  return nativeFrame(`exp.frame-${suffix}`, 210, frame, `progress-${frame}-of-30`, `exp-frame-${suffix}`);
});

const levelDigitCharacterIds = [11, 10, 12, 8, 7, 6, 5, 4, 3, 2] as const;
const levelDigits = levelDigitCharacterIds.map((characterId, digit) => nativeAsset(
  `inventory-ui.level.digit-${digit}`,
  `/assets/ui/inventory/native/level-digit-${digit}.png`,
  characterId,
  1,
  `digit-${digit}`,
));

export const inventoryUiAssets = {
  slot: nativeAsset('inventory-ui.pack-slot', '/assets/ui/inventory/native/pack-slot.png', 628),
  close: nativeButton('close', 31),
  previous: nativeButton('previous', 78),
  next: nativeButton('next', 83),
  equipment: nativeButton('equipment', 230),
  items: nativeButton('items', 235),
  fashion: nativeButton('fashion', 240),
  skillBooks: nativeButton('skillBooks', 245),
  operationSimple: {
    default: nativeFrame('operation.simple.default', 358, 1, 'default-composite', 'operation-simple-default'),
    background: nativeFrame('operation.simple.background', 342, 1, 'background', 'operation-simple-background'),
    useEnabled: nativeFrame('operation.use.enabled', 347, 1, 'enabled', 'action-use-enabled'),
    useDisabled: nativeFrame('operation.use.disabled', 347, 2, 'disabled', 'action-use-disabled'),
    discardEnabled: nativeFrame('operation.discard.enabled', 352, 1, 'enabled', 'action-discard-enabled'),
    discardDisabled: nativeFrame('operation.discard.disabled', 352, 2, 'disabled', 'action-discard-disabled'),
  },
  operationShared: {
    giveEnabled: nativeFrame('operation.give.enabled', 357, 1, 'enabled', 'action-give-enabled'),
    giveDisabled: nativeFrame('operation.give.disabled', 357, 2, 'disabled', 'action-give-disabled'),
  },
  operationThree: {
    default: nativeFrame('operation.three.default', 610, 1, 'default-composite', 'operation-three-default'),
    background: nativeFrame('operation.three.background', 597, 1, 'background', 'operation-three-background'),
    equipEnabled: nativeFrame('operation.equip.enabled', 604, 1, 'enabled', 'action-equip-enabled'),
    equipDisabled: nativeFrame('operation.equip.disabled', 604, 2, 'disabled-wrong-role', 'action-equip-disabled'),
    equipRenew: nativeFrame('operation.equip.renew', 604, 3, 'renew-expired-fashion', 'action-equip-renew'),
    sellEnabled: nativeFrame('operation.sell.enabled', 609, 1, 'enabled', 'action-sell-enabled'),
    sellDisabled: nativeFrame('operation.sell.disabled', 609, 2, 'disabled', 'action-sell-disabled'),
  },
  level: {
    plate: nativeFrame('level.plate', 219, 1, 'plate', 'level-plate'),
    digits: levelDigits,
  },
  exp: {
    frames: expFrames,
  },
  sellWhite: nativeButton('sell-white', 222),
  fashionToggle: {
    hidden: nativeFrame('fashion-toggle.hidden', 297, 1, 'fashion-hidden', 'fashion-toggle-hidden'),
    shown: nativeFrame('fashion-toggle.shown', 297, 2, 'fashion-shown', 'fashion-toggle-shown'),
  },
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
  ...Object.values(inventoryUiAssets.operationSimple),
  ...Object.values(inventoryUiAssets.operationShared),
  ...Object.values(inventoryUiAssets.operationThree),
  inventoryUiAssets.level.plate,
  ...inventoryUiAssets.level.digits,
  ...inventoryUiAssets.exp.frames,
  ...Object.values(inventoryUiAssets.sellWhite),
  ...Object.values(inventoryUiAssets.fashionToggle),
];
