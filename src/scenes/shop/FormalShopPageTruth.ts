import shopPageTruth from '../../../docs/reverse-engineering/ground-truth/manifests/task-settings-175f-shop-page.json';

export type ShopTruthBounds = Readonly<{
  left: number;
  top: number;
  width: number;
  height: number;
}>;

type ShopTruthObject = (typeof shopPageTruth.displayObjects)[number];

export const ShopPageTruthId = 'task-settings-175f.shop-page' as const;

export const ShopTruthObjectIds = {
  root: 'shop-page-root',
  money: 'shop-page-root.txt_money',
  charge: 'shop-page-root.btn_cz',
  ownerP1: 'shop-page-root.btn_play1',
  ownerP2: 'shop-page-root.btn_play2',
  pagePrev: 'shop-page-root.btn_upPage',
  pageNext: 'shop-page-root.btn_nextPage',
  pageText: 'shop-page-root.txt_page',
  back: 'shop-page-root.btn_back',
  confirm: 'shop-page-root.confirm-dialog',
  confirmText: 'shop-page-root.confirm-dialog.txtfield',
  confirmOk: 'shop-page-root.confirm-dialog.btn_ok',
  confirmCancel: 'shop-page-root.confirm-dialog.btn_change',
  categories: {
    all: 'shop-page-root.btn_buyall',
    gems: 'shop-page-root.btn_buybs',
    items: 'shop-page-root.btn_buydj',
    fashion: 'shop-page-root.btn_buysz',
    pets: 'shop-page-root.btn_buycw',
  },
} as const;

export function assertVerifiedShopPageTruth(): void {
  if (shopPageTruth.truthId !== ShopPageTruthId || shopPageTruth.status !== 'verified') {
    throw new Error(`${shopPageTruth.truthId} is not the verified shop-page truth.`);
  }
  if (shopPageTruth.displayObjects.length !== 132 || shopPageTruth.states.length !== 31) {
    throw new Error(`${ShopPageTruthId} completeness drifted.`);
  }
  if (!shopPageTruth.completeness.displayListMatched
    || !shopPageTruth.completeness.stateSetMatched
    || shopPageTruth.completeness.unresolved.length > 0) {
    throw new Error(`${ShopPageTruthId} contains unresolved or unmatched evidence.`);
  }
}

export function getShopTruthBounds(id: string): ShopTruthBounds {
  return visibleBounds(findObject(id));
}

export function getShopCardTruthBounds(
  cardIndex: number,
  child?: 'icon' | 'name' | 'price' | 'quantity' | 'quantityUp' | 'quantityDown' | 'buy',
): ShopTruthBounds {
  if (!Number.isInteger(cardIndex) || cardIndex < 0 || cardIndex > 8) {
    throw new RangeError(`${ShopPageTruthId} card index must be 0..8.`);
  }
  const rootId = `shop-page-root.st${cardIndex}`;
  const suffix = child ? {
    icon: 'runtime-product-icon',
    name: 'txt_name',
    price: 'txt_price',
    quantity: 'txt_num',
    quantityUp: 'btn_up',
    quantityDown: 'btn_down',
    buy: 'btn_buy',
  }[child] : undefined;
  return getShopTruthBounds(suffix ? `${rootId}.${suffix}` : rootId);
}

export function getShopTruthCharacterId(id: string): number {
  const characterId = findObject(id).sourceIdentity.characterId;
  if (typeof characterId !== 'number') {
    throw new Error(`${ShopPageTruthId} ${id} has no character id.`);
  }
  return characterId;
}

export function getShopTruthStateIds(): readonly string[] {
  assertVerifiedShopPageTruth();
  return shopPageTruth.states.map(({ id }) => id);
}

function findObject(id: string): ShopTruthObject {
  assertVerifiedShopPageTruth();
  const object = shopPageTruth.displayObjects.find((candidate) => candidate.id === id);
  if (!object) throw new Error(`${ShopPageTruthId} is missing ${id}.`);
  return object;
}

function visibleBounds(object: ShopTruthObject): ShopTruthBounds {
  const bounds = object.placements.find(({ visible }) => visible)?.stageBounds;
  if (!bounds) throw new Error(`${ShopPageTruthId} ${object.id} has no visible stage bounds.`);
  return bounds;
}
