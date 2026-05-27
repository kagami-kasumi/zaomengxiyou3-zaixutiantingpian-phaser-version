import {
  canEquipInstance,
  equipInstance,
  getEquipmentSlotForType,
  unequipSlot,
  type EquipmentDefinition,
  type EquipmentInstance,
  type EquipmentLoadout,
  type EquipmentSlot,
} from './EquipmentSystem';

export type InventoryCategory = 'equipment' | 'items' | 'fashion' | 'skillBooks';

export type InventoryItemStack = {
  kind: 'stack';
  stackId: string;
  definition: EquipmentDefinition;
  quantity: number;
};

export type InventoryEntry = EquipmentInstance | InventoryItemStack;

export type InventoryStore = {
  capacityPerCategory: number;
  nextEquipmentInstanceId: number;
  categories: Record<InventoryCategory, InventoryEntry[]>;
};

export type InventoryTransferResult = {
  ok: boolean;
  message: string;
  equipped?: EquipmentInstance;
  unequipped?: EquipmentInstance;
};

export const InventoryCategoryLabels: Record<InventoryCategory, string> = {
  equipment: '装备',
  items: '道具',
  fashion: '时装',
  skillBooks: '技能书',
};

export const InventoryCategories: readonly InventoryCategory[] = [
  'equipment',
  'items',
  'fashion',
  'skillBooks',
];

export function createInventoryStore(
  capacityPerCategory = 125,
): InventoryStore {
  return {
    capacityPerCategory,
    nextEquipmentInstanceId: 1,
    categories: {
      equipment: [],
      items: [],
      fashion: [],
      skillBooks: [],
    },
  };
}

export function createSeedInventoryStore(
  registry: Record<string, EquipmentDefinition>,
): InventoryStore {
  const store = createInventoryStore();
  addEquipmentByFillName(store, registry, 'ptdcz');
  addEquipmentByFillName(store, registry, 'ptdjs');
  addEquipmentByFillName(store, registry, 'mysz');
  addEquipmentByFillName(store, registry, 'xhz');
  addEquipmentByFillName(store, registry, 'ptnmwsz');
  addStackByFillName(store, registry, 'sms1', 8);
  addStackByFillName(store, registry, 'smbjns2', 2);
  return store;
}

export function getInventoryCategoryForDefinition(
  definition: EquipmentDefinition,
): InventoryCategory {
  if (definition.fillName.includes('jns')) {
    return 'skillBooks';
  }
  if (definition.type === 'zbsz' || definition.type === 'zbcb') {
    return 'fashion';
  }
  if (getEquipmentSlotForType(definition.type)) {
    return 'equipment';
  }
  return 'items';
}

export function addEquipmentByFillName(
  store: InventoryStore,
  registry: Record<string, EquipmentDefinition>,
  fillName: string,
): EquipmentInstance | undefined {
  const definition = registry[fillName];
  if (!definition) {
    return undefined;
  }

  const category = getInventoryCategoryForDefinition(definition);
  if (store.categories[category].length >= store.capacityPerCategory) {
    return undefined;
  }

  const instance = createEquipmentInstance(store, definition);
  store.categories[category].push(instance);
  return instance;
}

export function addStackByFillName(
  store: InventoryStore,
  registry: Record<string, EquipmentDefinition>,
  fillName: string,
  quantity: number,
): InventoryItemStack | undefined {
  const definition = registry[fillName];
  if (!definition || quantity <= 0) {
    return undefined;
  }

  const category = getInventoryCategoryForDefinition(definition);
  const existing = store.categories[category].find(
    (entry): entry is InventoryItemStack =>
      entry.kind === 'stack' && entry.definition.fillName === fillName,
  );
  if (existing) {
    existing.quantity += quantity;
    return existing;
  }

  if (store.categories[category].length >= store.capacityPerCategory) {
    return undefined;
  }

  const stack: InventoryItemStack = {
    kind: 'stack',
    stackId: `stack-${fillName}`,
    definition,
    quantity,
  };
  store.categories[category].push(stack);
  return stack;
}

export function addInventoryEntry(
  store: InventoryStore,
  entry: InventoryEntry,
): boolean {
  const category = getInventoryCategoryForDefinition(entry.definition);
  if (store.categories[category].length >= store.capacityPerCategory) {
    return false;
  }
  store.categories[category].push(entry);
  return true;
}

export function removeEquipmentInstance(
  store: InventoryStore,
  instanceId: string,
): EquipmentInstance | undefined {
  for (const category of InventoryCategories) {
    const index = store.categories[category].findIndex(
      (entry) => entry.kind === 'equipment' && entry.instanceId === instanceId,
    );
    if (index >= 0) {
      const [removed] = store.categories[category].splice(index, 1);
      return removed.kind === 'equipment' ? removed : undefined;
    }
  }

  return undefined;
}

export function getInventoryEntryId(entry: InventoryEntry): string {
  return entry.kind === 'equipment' ? entry.instanceId : entry.stackId;
}

export function getInventoryEntries(
  store: InventoryStore,
  category: InventoryCategory,
): readonly InventoryEntry[] {
  return store.categories[category];
}

export function equipInventoryItem(
  store: InventoryStore,
  loadout: EquipmentLoadout,
  instanceId: string,
  heroName: string,
): InventoryTransferResult {
  const candidate = findEquipmentInstance(store, instanceId);
  if (!candidate) {
    return { ok: false, message: '请选择可穿戴装备' };
  }

  const check = canEquipInstance(loadout, candidate, heroName);
  if (check !== true) {
    return { ok: false, message: check };
  }

  const removed = removeEquipmentInstance(store, instanceId);
  if (!removed) {
    return { ok: false, message: '装备不在背包中' };
  }

  const replaced = equipInstance(loadout, removed);
  if (replaced) {
    addInventoryEntry(store, replaced);
  }

  return {
    ok: true,
    message: replaced
      ? `穿戴 ${removed.definition.name}，${replaced.definition.name} 已退回背包`
      : `穿戴 ${removed.definition.name}`,
    equipped: removed,
    unequipped: replaced,
  };
}

export function unequipInventorySlot(
  store: InventoryStore,
  loadout: EquipmentLoadout,
  slot: EquipmentSlot,
): InventoryTransferResult {
  const removed = unequipSlot(loadout, slot);
  if (!removed) {
    return { ok: false, message: '该槽位为空' };
  }

  if (!addInventoryEntry(store, removed)) {
    equipInstance(loadout, removed);
    return { ok: false, message: '背包容量不足' };
  }

  return {
    ok: true,
    message: `卸下 ${removed.definition.name}`,
    unequipped: removed,
  };
}

function createEquipmentInstance(
  store: InventoryStore,
  definition: EquipmentDefinition,
): EquipmentInstance {
  const instance: EquipmentInstance = {
    kind: 'equipment',
    instanceId: `eq-${store.nextEquipmentInstanceId}`,
    definition,
    quantity: 1,
  };
  store.nextEquipmentInstanceId += 1;
  return instance;
}

function findEquipmentInstance(
  store: InventoryStore,
  instanceId: string,
): EquipmentInstance | undefined {
  for (const category of InventoryCategories) {
    const found = store.categories[category].find(
      (entry): entry is EquipmentInstance =>
        entry.kind === 'equipment' && entry.instanceId === instanceId,
    );
    if (found) {
      return found;
    }
  }
  return undefined;
}
