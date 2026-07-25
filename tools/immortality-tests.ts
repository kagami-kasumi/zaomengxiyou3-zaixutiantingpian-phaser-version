import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createSeedEquipmentRegistry } from '../src/systems/EquipmentSystem';
import {
  craftFormalImmortality,
  createFormalImmortalityPage,
  eatFormalImmortality,
  openFormalImmortalityExchange,
  setFormalImmortalityOwner,
} from '../src/systems/FormalImmortalityPageSystem';
import {
  craftImmortality,
  createEmptyImmortalityFlags,
  eatImmortality,
  getImmortalityEffectTotals,
} from '../src/systems/ImmortalitySystem';
import { createInventoryItemDefinitionRegistry } from '../src/systems/InventoryResourceCatalog';
import {
  addStackByFillName,
  createInventoryStore,
  getStackQuantityByFillName,
} from '../src/systems/InventorySystem';
import { createPartyConfiguration } from '../src/systems/PartyConfigurationSystem';
import {
  createDefaultGameSave,
  createSaveSlot,
  loadActiveGame,
} from '../src/systems/SaveSlotSystem';
import { parseGameSave, serializeGameSave, type SaveStorage } from '../src/systems/SaveSystem';

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

const registry = createInventoryItemDefinitionRegistry(createSeedEquipmentRegistry());

{
  const store = createInventoryStore(125, 'pill');
  addStackByFillName(store, registry, 'wpsmd1', 1);
  const state = {
    owner: 'p1' as const,
    soulCount: 2_000,
    inventoryStore: store,
    flags: createEmptyImmortalityFlags(),
  };
  assert.equal(eatImmortality(state, registry, 0, 0).ok, true);
  assert.equal(state.soulCount, 1_000);
  assert.equal(state.flags[0][0], 1);
  assert.equal(getStackQuantityByFillName(store, 'wpsmd1'), 0);
  assert.deepEqual(getImmortalityEffectTotals(state.flags), [200, 0, 0, 0, 0]);

  addStackByFillName(store, registry, 'wpsmd2', 1);
  state.soulCount = 999;
  const before = JSON.stringify(store);
  assert.deepEqual(eatImmortality(state, registry, 0, 1), {
    ok: false,
    message: '灵魂不足1000！',
  });
  assert.equal(JSON.stringify(store), before);
  assert.equal(state.flags[0][1], 0);
}

{
  const store = createInventoryStore(125, 'craft');
  addStackByFillName(store, registry, 'wplh', 40);
  addStackByFillName(store, registry, 'wpll', 40);
  const state = {
    owner: 'p1' as const,
    soulCount: 0,
    inventoryStore: store,
    flags: createEmptyImmortalityFlags(),
  };
  assert.deepEqual(craftImmortality(state, registry, 0, 0, () => 0.04), {
    ok: true,
    message: '走火了，丹药可能变质了！',
  });
  assert.equal(getStackQuantityByFillName(store, 'wplh'), 0);
  assert.equal(getStackQuantityByFillName(store, 'wpll'), 0);
  assert.equal(getStackQuantityByFillName(store, 'wpsmd1'), 1);

  const before = JSON.stringify(store);
  assert.deepEqual(craftImmortality(state, registry, 0, 0), {
    ok: false,
    message: '道具不足',
  });
  assert.equal(JSON.stringify(store), before);
}

{
  const store = createInventoryStore(1, 'full');
  addStackByFillName(store, registry, 'wplh', 40);
  // Capacity is checked before consuming ingredients, matching the original.
  const state = {
    owner: 'p1' as const,
    soulCount: 0,
    inventoryStore: store,
    flags: createEmptyImmortalityFlags(),
  };
  assert.deepEqual(craftImmortality(state, registry, 0, 0), {
    ok: false,
    message: '背包空间不足',
  });
}

{
  const legacyV6 = createDefaultGameSave();
  const raw = JSON.parse(serializeGameSave(legacyV6));
  delete raw.player1.immortalityFlags;
  delete raw.player2.immortalityFlags;
  const migrated = parseGameSave(JSON.stringify(raw));
  assert.deepEqual(migrated?.player1.immortalityFlags, createEmptyImmortalityFlags());
  assert.deepEqual(migrated?.player2.immortalityFlags, createEmptyImmortalityFlags());
}

{
  const storage = new MemoryStorage();
  const save = createDefaultGameSave(
    new Date('2026-07-25T00:00:00.000Z'),
    createPartyConfiguration(2, 1, 2)!,
  );
  save.player1.soulCount = 2_000;
  save.player1.inventory.categories.items.push({
    kind: 'stack',
    fillName: 'wpsmd1',
    stackId: 'stack-wpsmd1',
    quantity: 1,
  });
  save.player2.inventory.categories.items.push(
    { kind: 'stack', fillName: 'wplh', stackId: 'stack-wplh', quantity: 40 },
    { kind: 'stack', fillName: 'wpll', stackId: 'stack-wpll', quantity: 40 },
  );
  assert.equal(createSaveSlot(storage, 0, save), true);
  const model = createFormalImmortalityPage(storage)!;
  assert.equal(model.owner, 'p2', 'two-player page must default to P2 like the original');
  assert.equal(setFormalImmortalityOwner(model, 'p1'), true);
  assert.equal(eatFormalImmortality(model, storage, 0, 0), true);
  assert.equal(loadActiveGame(storage)?.player1.soulCount, 1_000);
  assert.equal(loadActiveGame(storage)?.player1.immortalityFlags[0][0], 1);
  assert.deepEqual(loadActiveGame(storage)?.player2.immortalityFlags, createEmptyImmortalityFlags());

  assert.equal(setFormalImmortalityOwner(model, 'p2'), true);
  openFormalImmortalityExchange(model, 1);
  assert.equal(craftFormalImmortality(model, storage, 0, () => 0.5), true);
  const persisted = loadActiveGame(storage)!;
  const p2Product = persisted.player2.inventory.categories.items.find(
    (entry) => entry.fillName === 'wpmfd1',
  );
  assert.equal(p2Product?.quantity, 1);
  assert.equal(persisted.player1.inventory.categories.items.some(
    (entry) => entry.fillName === 'wpmfd1',
  ), false);
}

const repoRoot = process.cwd();
for (const relativePath of [
  'public/assets/ui/map-services/immortality/root-static.svg',
  'public/assets/ui/map-services/immortality/exchange.svg',
  'public/assets/ui/map-services/immortality/eat-over.png',
  'public/assets/ui/map-services/immortality/owner-5-selected.svg',
]) {
  assert.equal(existsSync(path.join(repoRoot, relativePath)), true, `${relativePath} should exist`);
}
const rootStatic = readFileSync(
  path.join(repoRoot, 'public/assets/ui/map-services/immortality/root-static.svg'),
  'utf8',
);
assert.doesNotMatch(rootStatic, /id="eatbtn"/);
assert.doesNotMatch(rootStatic, /id="txtlh"/);
const mapSource = readFileSync(path.join(repoRoot, 'src/scenes/HeavenMapScene.ts'), 'utf8');
assert.match(mapSource, /ImmortalityScene/);

console.log('immortality system tests passed');
