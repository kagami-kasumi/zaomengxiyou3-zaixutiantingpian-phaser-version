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

export const InventoryStackQuantityLimit = 99;

export type InventoryTransactionOperation =
  | Readonly<{ kind: 'add-resource'; fillName: string; quantity: number }>
  | Readonly<{ kind: 'add-instance'; definition: EquipmentDefinition }>
  | Readonly<{ kind: 'add-stack'; definition: EquipmentDefinition; quantity: number }>
  | Readonly<{ kind: 'consume-stack'; fillName: string; quantity: number }>
  | Readonly<{ kind: 'remove-instance'; instanceId: string }>;

export type InventoryTransactionResult = Readonly<{
  ok: boolean;
  message: string;
  createdInstanceIds: readonly string[];
}>;

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

export function applyInventoryTransaction(
  store: InventoryStore,
  registry: Readonly<Record<string, EquipmentDefinition>>,
  operations: readonly InventoryTransactionOperation[],
): InventoryTransactionResult {
  const draft = cloneInventoryStore(store);
  const createdInstanceIds: string[] = [];
  for (const operation of operations) {
    const error = applyInventoryOperation(draft, registry, operation, createdInstanceIds);
    if (error) return { ok: false, message: error, createdInstanceIds: [] };
  }
  store.capacityPerCategory = draft.capacityPerCategory;
  store.nextEquipmentInstanceId = draft.nextEquipmentInstanceId;
  store.equipmentInstanceIdPrefix = draft.equipmentInstanceIdPrefix;
  store.categories = reconcileInventoryDraft(store, draft);
  return { ok: true, message: '背包事务完成', createdInstanceIds };
}

export function addInventoryResource(
  store: InventoryStore,
  registry: Readonly<Record<string, EquipmentDefinition>>,
  fillName: string,
  quantity = 1,
): InventoryTransactionResult {
  return applyInventoryTransaction(store, registry, [
    { kind: 'add-resource', fillName, quantity },
  ]);
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
  addStackByFillName(store, registry, 'wpqhs1', 3);
  addStackByFillName(store, registry, 'wpxyf', 1);
  addStackByFillName(store, registry, 'wpbdf', 1);
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
  const result = applyInventoryTransaction(
    store,
    { [definition.fillName]: definition },
    [{ kind: 'add-instance', definition }],
  );
  if (!result.ok) return undefined;
  return findEquipmentInstance(store, result.createdInstanceIds[0] ?? '');
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
  const result = applyInventoryTransaction(store, registry, [
    { kind: 'add-stack', definition, quantity },
  ]);
  if (!result.ok) return undefined;
  return findInventoryStack(store, fillName);
}

export function consumeStackByFillName(
  store: InventoryStore,
  fillName: string,
  quantity = 1,
): InventoryConsumeResult {
  if (quantity <= 0) {
    return { ok: false, message: '消耗数量无效', before: 0, after: 0 };
  }
  const stack = findInventoryStack(store, fillName);
  if (!stack) return { ok: false, message: `${fillName} 不在背包中`, before: 0, after: 0 };
  const before = stack.quantity;
  const result = applyInventoryTransaction(
    store,
    { [fillName]: stack.definition },
    [{ kind: 'consume-stack', fillName, quantity }],
  );
  if (!result.ok) return { ok: false, message: result.message, before, after: before };
  return {
    ok: true,
    message: `消耗 ${stack.definition.name} x${quantity}`,
    before,
    after: getStackQuantityByFillName(store, fillName),
  };
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

function findInventoryStack(
  store: InventoryStore,
  fillName: string,
): InventoryItemStack | undefined {
  for (const category of InventoryCategories) {
    const stack = store.categories[category].find(
      (entry): entry is InventoryItemStack =>
        entry.kind === 'stack' && entry.definition.fillName === fillName,
    );
    if (stack) return stack;
  }
  return undefined;
}

function cloneInventoryStore(store: InventoryStore): InventoryStore {
  return {
    capacityPerCategory: store.capacityPerCategory,
    nextEquipmentInstanceId: store.nextEquipmentInstanceId,
    equipmentInstanceIdPrefix: store.equipmentInstanceIdPrefix,
    categories: Object.fromEntries(InventoryCategories.map((category) => [
      category,
      store.categories[category].map((entry) => entry.kind === 'stack' ? { ...entry } : entry),
    ])) as InventoryStore['categories'],
  };
}

function reconcileInventoryDraft(
  original: InventoryStore,
  draft: InventoryStore,
): InventoryStore['categories'] {
  return Object.fromEntries(InventoryCategories.map((category) => [
    category,
    draft.categories[category].map((entry) => {
      if (entry.kind === 'equipment') return entry;
      const existing = original.categories[category].find(
        (candidate): candidate is InventoryItemStack =>
          candidate.kind === 'stack' && candidate.stackId === entry.stackId,
      );
      if (!existing) return entry;
      existing.quantity = entry.quantity;
      return existing;
    }),
  ])) as InventoryStore['categories'];
}

function applyInventoryOperation(
  store: InventoryStore,
  registry: Readonly<Record<string, EquipmentDefinition>>,
  operation: InventoryTransactionOperation,
  createdInstanceIds: string[],
): string | undefined {
  if (operation.kind === 'add-resource') {
    if (!Number.isInteger(operation.quantity) || operation.quantity <= 0) return '增加数量无效';
    const definition = registry[operation.fillName];
    if (!definition) return `${operation.fillName} 不在权威物品目录中`;
    const category = getInventoryCategoryForDefinition(definition);
    const isStack = category === 'items' || category === 'skillBooks';
    return applyInventoryOperation(
      store,
      registry,
      isStack
        ? { kind: 'add-stack', definition, quantity: operation.quantity }
        : { kind: 'add-instance', definition },
      createdInstanceIds,
    ) ?? (
      !isStack && operation.quantity > 1
        ? addRemainingInstances(store, registry, definition, operation.quantity - 1, createdInstanceIds)
        : undefined
    );
  }
  if (operation.kind === 'add-instance') {
    const category = getInventoryCategoryForDefinition(operation.definition);
    if (store.categories[category].length >= store.capacityPerCategory) {
      return `${InventoryCategoryLabels[category]}容量不足`;
    }
    const instance = createEquipmentInstance(store, operation.definition);
    store.categories[category].push(instance);
    createdInstanceIds.push(instance.instanceId);
    return undefined;
  }
  if (operation.kind === 'add-stack') {
    if (!Number.isInteger(operation.quantity) || operation.quantity <= 0) return '增加数量无效';
    const category = getInventoryCategoryForDefinition(operation.definition);
    const existing = findInventoryStack(store, operation.definition.fillName);
    if (existing) {
      if (existing.quantity + operation.quantity > InventoryStackQuantityLimit) {
        return `${operation.definition.name} 已达到堆叠上限`;
      }
      existing.quantity += operation.quantity;
      return undefined;
    }
    if (store.categories[category].length >= store.capacityPerCategory) {
      return `${InventoryCategoryLabels[category]}容量不足`;
    }
    if (operation.quantity > InventoryStackQuantityLimit) {
      return `${operation.definition.name} 超过堆叠上限`;
    }
    store.categories[category].push({
      kind: 'stack',
      stackId: `stack-${operation.definition.fillName}`,
      definition: operation.definition,
      quantity: operation.quantity,
    });
    return undefined;
  }
  if (operation.kind === 'consume-stack') {
    if (!Number.isInteger(operation.quantity) || operation.quantity <= 0) return '消耗数量无效';
    const stack = findInventoryStack(store, operation.fillName);
    if (!stack) return `${operation.fillName} 不在背包中`;
    if (stack.quantity < operation.quantity) return `${stack.definition.name} 数量不足`;
    stack.quantity -= operation.quantity;
    if (stack.quantity === 0) {
      const category = getInventoryCategoryForDefinition(stack.definition);
      store.categories[category] = store.categories[category].filter((entry) => entry !== stack);
    }
    return undefined;
  }
  for (const category of InventoryCategories) {
    const index = store.categories[category].findIndex(
      (entry) => entry.kind === 'equipment' && entry.instanceId === operation.instanceId,
    );
    if (index >= 0) {
      store.categories[category].splice(index, 1);
      return undefined;
    }
  }
  return `装备实例 ${operation.instanceId} 不在背包中`;
}

function addRemainingInstances(
  store: InventoryStore,
  registry: Readonly<Record<string, EquipmentDefinition>>,
  definition: EquipmentDefinition,
  quantity: number,
  createdInstanceIds: string[],
): string | undefined {
  for (let index = 0; index < quantity; index += 1) {
    const error = applyInventoryOperation(
      store,
      registry,
      { kind: 'add-instance', definition },
      createdInstanceIds,
    );
    if (error) return error;
  }
  return undefined;
}
