import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  changeFormalShopPage,
  changeFormalShopQuantity,
  closeFormalShopConfirmation,
  confirmFormalShopPurchase,
  createFormalShopPage,
  FormalShopItems,
  getFormalShopConfirmationText,
  getFormalShopPageCount,
  getFormalShopPlayer,
  getFormalShopQuantity,
  getFormalShopUnitPrice,
  getFormalShopVisibleItems,
  openFormalShopConfirmation,
  selectFormalShopCategory,
  setFormalShopOwner,
  setFormalShopTypedQuantity,
} from '../src/systems/FormalShopPageSystem';
import { getStackQuantityByFillName } from '../src/systems/InventorySystem';
import { createPartyConfiguration } from '../src/systems/PartyConfigurationSystem';
import {
  createDefaultGameSave,
  createSaveSlot,
  loadActiveGame,
} from '../src/systems/SaveSlotSystem';
import type { SaveStorage } from '../src/systems/SaveSystem';

class MemoryStorage implements SaveStorage {
  private readonly values = new Map<string, string>();

  public getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  public removeItem(key: string): void {
    this.values.delete(key);
  }
}

assert.equal(FormalShopItems.length, 49);
assert.equal(new Set(FormalShopItems.map((item) => item.fillName)).size, 49);
assert.deepEqual(
  FormalShopItems.slice(0, 3).map((item) => item.fillName),
  ['wpqhs1', 'wpqhs2', 'wpqhs3'],
);
assert.deepEqual(
  FormalShopItems.slice(19, 24).map((item) => item.fillName),
  ['wpcsd', 'wphhd', 'cwjnxld', 'cwzzxld', 'djyys'],
);
assert.deepEqual(
  FormalShopItems.slice(-3).map((item) => item.fillName),
  ['ttlpsp1', 'ttlpsp2', 'ttlpsp3'],
);
assert.equal(getFormalShopUnitPrice(FormalShopItems[0]!, 2), 8000);
assert.equal(getFormalShopUnitPrice(FormalShopItems[0]!, 3), 6400);
assert.equal(
  getFormalShopUnitPrice(FormalShopItems.find((item) => item.fillName === 'zylhys')!, 3),
  114514,
);
assert.equal(
  getFormalShopUnitPrice(FormalShopItems.find((item) => item.fillName === 'lzysz')!, 3),
  231110,
);

{
  const storage = new MemoryStorage();
  const save = createDefaultGameSave(
    new Date('2026-07-25T00:00:00.000Z'),
    createPartyConfiguration(2, 1, 2)!,
  );
  save.player1.soulCount = 1_000_000;
  save.player2.soulCount = 1_000_000;
  assert.equal(createSaveSlot(storage, 0, save), true);
  const model = createFormalShopPage(storage)!;
  assert.equal(model.owner, 'p1');
  assert.equal(model.category, 'all');
  assert.equal(model.page, 1);
  assert.equal(getFormalShopPageCount(model), 6);
  assert.equal(getFormalShopVisibleItems(model).length, 9);

  selectFormalShopCategory(model, 'gems');
  assert.equal(getFormalShopPageCount(model), 3);
  changeFormalShopPage(model, -1);
  assert.equal(model.page, 1);
  changeFormalShopPage(model, 1);
  changeFormalShopPage(model, 1);
  changeFormalShopPage(model, 1);
  assert.equal(model.page, 3);
  assert.equal(getFormalShopVisibleItems(model).length, 1);

  selectFormalShopCategory(model, 'items');
  assert.equal(getFormalShopPageCount(model), 2);
  selectFormalShopCategory(model, 'fashion');
  assert.equal(getFormalShopPageCount(model), 1);
  selectFormalShopCategory(model, 'pets');
  assert.equal(getFormalShopPageCount(model), 1);

  changeFormalShopQuantity(model, 'wpqhs1', -1);
  assert.equal(getFormalShopQuantity(model, 'wpqhs1'), 1);
  for (let index = 0; index < 120; index += 1) {
    changeFormalShopQuantity(model, 'wpqhs1', 1);
  }
  assert.equal(getFormalShopQuantity(model, 'wpqhs1'), 100);
  assert.equal(setFormalShopTypedQuantity(model, 'wpqhs1', 99), true);
  assert.equal(setFormalShopTypedQuantity(model, 'wpqhs1', 0), true);
  assert.equal(openFormalShopConfirmation(model, 'wpqhs1'), false);
  assert.equal(setFormalShopTypedQuantity(model, 'wpqhs1', 2), true);
  assert.equal(openFormalShopConfirmation(model, 'wpqhs1'), true);
  assert.match(getFormalShopConfirmationText(model), /2 个1级强化石/);
  assert.match(getFormalShopConfirmationText(model), /16000 灵魂/);
  closeFormalShopConfirmation(model);
  assert.equal(model.pendingFillName, undefined);

  assert.equal(openFormalShopConfirmation(model, 'wpqhs1'), true);
  assert.equal(confirmFormalShopPurchase(model, storage), true);
  let persisted = loadActiveGame(storage)!;
  assert.equal(persisted.player1.soulCount, 984000);
  assert.equal(persisted.player2.soulCount, 1_000_000);
  assert.equal(
    persisted.player1.inventory.categories.items.find(
      (entry) => entry.fillName === 'wpqhs1',
    )?.quantity,
    5,
  );
  assert.equal(getFormalShopQuantity(model, 'wpqhs1'), 1);

  assert.equal(setFormalShopOwner(model, 'p2'), true);
  assert.equal(setFormalShopTypedQuantity(model, 'ptnmwsz', 2), true);
  assert.equal(openFormalShopConfirmation(model, 'ptnmwsz'), true);
  assert.equal(confirmFormalShopPurchase(model, storage), true);
  persisted = loadActiveGame(storage)!;
  assert.equal(persisted.player1.soulCount, 984000);
  assert.equal(persisted.player2.soulCount, 940000);
  assert.equal(
    persisted.player2.inventory.categories.fashion.filter(
      (entry) => entry.fillName === 'ptnmwsz',
    ).length,
    3,
  );
}

{
  const storage = new MemoryStorage();
  const save = createDefaultGameSave();
  save.player1.soulCount = 100;
  assert.equal(createSaveSlot(storage, 0, save), true);
  const model = createFormalShopPage(storage)!;
  assert.equal(openFormalShopConfirmation(model, 'wpqhs1'), true);
  assert.equal(confirmFormalShopPurchase(model, storage), false);
  assert.equal(model.message, '灵魂不足！');
  assert.equal(getFormalShopPlayer(model).soulCount, 100);
  assert.equal(loadActiveGame(storage)!.player1.soulCount, 100);
}

{
  const storage = new MemoryStorage();
  const save = createDefaultGameSave();
  save.player1.soulCount = 1_000_000;
  const stack = save.player1.inventory.categories.items.find(
    (entry) => entry.fillName === 'wpqhs1',
  )!;
  stack.quantity = 99;
  assert.equal(createSaveSlot(storage, 0, save), true);
  const model = createFormalShopPage(storage)!;
  assert.equal(openFormalShopConfirmation(model, 'wpqhs1'), true);
  assert.equal(confirmFormalShopPurchase(model, storage), false);
  assert.match(model.message, /堆叠上限/);
  assert.equal(getFormalShopPlayer(model).soulCount, 1_000_000);
  assert.equal(
    getStackQuantityByFillName(getFormalShopPlayer(model).inventoryStore, 'wpqhs1'),
    99,
  );
}

const repoRoot = process.cwd();
for (const relativePath of [
  'public/assets/ui/map-services/shop/root-static.svg',
  'public/assets/ui/map-services/shop/card-static.svg',
  'public/assets/ui/map-services/shop/confirm-static.svg',
  'public/assets/ui/map-services/shop/category-all-down.png',
  'public/assets/ui/map-services/shop/buy-down.png',
  'public/assets/ui/map-services/shop/confirm-ok-over.png',
  'public/assets/ui/feature/shared/soul-badge.png',
]) {
  assert.equal(existsSync(path.join(repoRoot, relativePath)), true, `${relativePath} should exist`);
}
const rootStatic = readFileSync(
  path.join(repoRoot, 'public/assets/ui/map-services/shop/root-static.svg'),
  'utf8',
);
assert.doesNotMatch(rootStatic, /id="btn_buyall"|id="st0"|id="txt_money"|id="btn_back"/);
const cardStatic = readFileSync(
  path.join(repoRoot, 'public/assets/ui/map-services/shop/card-static.svg'),
  'utf8',
);
assert.doesNotMatch(cardStatic, /id="txt_name"|id="txt_num"|id="btn_buy"/);
const shopSource = readFileSync(path.join(repoRoot, 'src/scenes/ShopScene.ts'), 'utf8');
assert.doesNotMatch(shopSource, /fetch\(|XMLHttpRequest|WebSocket|PayMoneyVar/);
assert.match(shopSource, /createFormalSoulBalanceView/);
assert.match(shopSource, /getFormalShopPlayer\(this\.model\)\.soulCount,\s*'standalone'/);
const soulBalanceSource = readFileSync(
  path.join(repoRoot, 'src/scenes/feature-ui/FormalSoulBalanceView.ts'),
  'utf8',
);
assert.match(soulBalanceSource, /standalone:/);
assert.match(soulBalanceSource, /fullFeatureUiAssets\.soulBadge\.key/);
assert.match(soulBalanceSource, /badge: \{ x: 732, y: 504\.95 \}/);
const soulBadge = readFileSync(
  path.join(repoRoot, 'public/assets/ui/feature/shared/soul-badge.png'),
);
assert.equal(soulBadge.readUInt32BE(16), 82);
assert.equal(soulBadge.readUInt32BE(20), 82);
assert.equal(soulBadge[25], 6, 'soul badge must remain an RGBA PNG, not an opaque screenshot crop');
const mapSource = readFileSync(path.join(repoRoot, 'src/scenes/HeavenMapScene.ts'), 'utf8');
assert.match(mapSource, /ShopScene/);

console.log('formal shop catalog, transaction, persistence, and native asset tests passed');
