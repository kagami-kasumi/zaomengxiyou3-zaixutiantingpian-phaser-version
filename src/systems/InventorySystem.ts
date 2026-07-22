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
  equipmentInstanceIdPrefix: string;
  categories: Record<InventoryCategory, InventoryEntry[]>;
};

export type InventoryTransferResult = {
  ok: boolean;
  message: string;
  equipped?: EquipmentInstance;
  unequipped?: EquipmentInstance;
};

export type InventoryConsumeResult = {
  ok: boolean;
  message: string;
  before: number;
  after: number;
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
  equipmentInstanceIdPrefix = 'eq',
): InventoryStore {
  return {
    capacityPerCategory,
    nextEquipmentInstanceId: 1,
    equipmentInstanceIdPrefix,
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
  equipmentInstanceIdPrefix = 'eq',
): InventoryStore {
  const store = createInventoryStore(125, equipmentInstanceIdPrefix);
  addEquipmentByFillName(store, registry, 'ptdcz');
  addEquipmentByFillName(store, registry, 'ptdjs');
  addEquipmentByFillName(store, registry, 'mysz');
  addEquipmentByFillName(store, registry, 'xhz');
  addEquipmentByFillName(store, registry, 'kyg');
  addEquipmentByFillName(store, registry, 'kyz');
  addEquipmentByFillName(store, registry, 'kys');
  addEquipmentByFillName(store, registry, 'kyl');
  addEquipmentByFillName(store, registry, 'syl');
  addEquipmentByFillName(store, registry, 'lxj');
  addEquipmentByFillName(store, registry, 'hyzzs');
  addEquipmentByFillName(store, registry, 'zjld');
  addEquipmentByFillName(store, registry, 'zsTimer');
  addEquipmentByFillName(store, registry, 'hywjs');
  addEquipmentByFillName(store, registry, 'fbqpj');
  addEquipmentByFillName(store, registry, 'jyhl');
  addEquipmentByFillName(store, registry, 'mdhf');
  addEquipmentByFillName(store, registry, 'xhmt');
  addEquipmentByFillName(store, registry, 'tjbg');
  addEquipmentByFillName(store, registry, 'zltc');
  addEquipmentByFillName(store, registry, 'qljfb');
  addEquipmentByFillName(store, registry, 'stlp');
  addEquipmentByFillName(store, registry, 'lxfb');
  addEquipmentByFillName(store, registry, 'sxfb');
  addEquipmentByFillName(store, registry, 'yxfb');
  addEquipmentByFillName(store, registry, 'ptnmwsz');
  addStackByFillName(store, registry, 'sms1', 8);
  addStackByFillName(store, registry, 'wpcsd', 2);
  addStackByFillName(store, registry, 'wphhd', 1);
  addStackByFillName(store, registry, 'djyys', 1);
  addStackByFillName(store, registry, 'cwjnxld', 1);
  addStackByFillName(store, registry, 'cwzzxld', 1);
  addStackByFillName(store, registry, 'wphtd', 1);
  addStackByFillName(store, registry, 'nianqld', 1);
  addStackByFillName(store, registry, 'nianjhd', 1);
  addStackByFillName(store, registry, 'smbjns2', 2);
  addStackByFillName(store, registry, 'tlzsp', 3);
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

  return addEquipmentDefinition(store, definition);
}

export function addEquipmentDefinition(
  store: InventoryStore,
  definition: EquipmentDefinition,
): EquipmentInstance | undefined {
  const category = getInventoryCategoryForDefinition(definition);
  if (store.categories[category].length >= store.capacityPerCategory) return undefined;
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

export function consumeStackByFillName(
  store: InventoryStore,
  fillName: string,
  quantity = 1,
): InventoryConsumeResult {
  if (quantity <= 0) {
    return { ok: false, message: '消耗数量无效', before: 0, after: 0 };
  }

  for (const category of InventoryCategories) {
    const entries = store.categories[category];
    const index = entries.findIndex((entry): entry is InventoryItemStack =>
      entry.kind === 'stack' && entry.definition.fillName === fillName
    );
    if (index < 0) {
      continue;
    }

    const stack = entries[index] as InventoryItemStack;
    const before = stack.quantity;
    if (before < quantity) {
      return {
        ok: false,
        message: `${stack.definition.name} 数量不足`,
        before,
        after: before,
      };
    }

    stack.quantity -= quantity;
    const after = stack.quantity;
    if (stack.quantity <= 0) {
      entries.splice(index, 1);
    }

    return {
      ok: true,
      message: `消耗 ${stack.definition.name} x${quantity}`,
      before,
      after,
    };
  }

  return { ok: false, message: `${fillName} 不在背包中`, before: 0, after: 0 };
}

export function getStackQuantityByFillName(
  store: InventoryStore,
  fillName: string,
): number {
  for (const category of InventoryCategories) {
    const stack = store.categories[category].find((entry): entry is InventoryItemStack =>
      entry.kind === 'stack' && entry.definition.fillName === fillName
    );
    if (stack) return stack.quantity;
  }
  return 0;
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
    instanceId: `${store.equipmentInstanceIdPrefix}-${store.nextEquipmentInstanceId}`,
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
