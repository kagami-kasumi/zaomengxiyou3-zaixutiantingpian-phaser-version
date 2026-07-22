import {
  EquipmentSlotLabels,
  equipInstance,
  unequipSlot,
  type EquipmentInstance,
  type EquipmentLoadout,
  type EquipmentSlot,
} from './EquipmentSystem';
import {
  addInventoryEntry,
  addStackByFillName,
  getInventoryCategoryForDefinition,
  removeEquipmentInstance,
  type InventoryEntry,
  type InventoryStore,
} from './InventorySystem';
import type { PlayerSlot } from './InputSystem';

export const EquipmentResolutionSoulCost = 100;
const ResolvableTypes = new Set(['zbwq', 'zbfj', 'zbsp']);
const GemFillNames = ['sms1', 'mfs1', 'gjs1', 'fys1'] as const;

export type EquipmentResolutionSession = {
  owner: PlayerSlot;
  target?: EquipmentInstance;
  targetSource?: 'inventory' | EquipmentSlot;
  results: string[];
  message: string;
};

export type EquipmentResolutionResult = {
  ok: boolean;
  message: string;
  soulBefore: number;
  soulAfter: number;
  productFillNames: string[];
};

export function createEquipmentResolutionSession(owner: PlayerSlot): EquipmentResolutionSession {
  return { owner, results: [], message: '请选择要分解的武器、防具或饰品' };
}

export function canResolveEquipment(instance: EquipmentInstance): true | string {
  return ResolvableTypes.has(instance.definition.type)
    ? true
    : `${instance.definition.name} 不是可分解的武器、防具或饰品`;
}

export function stageEquipmentResolutionTarget(
  session: EquipmentResolutionSession,
  store: InventoryStore,
  loadout: EquipmentLoadout,
  entry: InventoryEntry | undefined,
): boolean {
  if (!entry || entry.kind !== 'equipment') return sessionFailure(session, '请选择装备实例');
  if (session.target) return sessionFailure(session, '分解槽已有装备，请先撤回');
  const admission = canResolveEquipment(entry);
  if (admission !== true) return sessionFailure(session, admission);

  const removed = removeEquipmentInstance(store, entry.instanceId);
  if (removed) {
    session.target = removed;
    session.targetSource = 'inventory';
    session.results = [];
    session.message = `已放入 ${removed.definition.name}`;
    return true;
  }
  const equippedSlot = (Object.entries(loadout) as Array<[EquipmentSlot, EquipmentInstance | null]>)
    .find(([, item]) => item?.instanceId === entry.instanceId)?.[0];
  if (!equippedSlot) return sessionFailure(session, '装备不属于当前玩家');
  session.target = unequipSlot(loadout, equippedSlot);
  session.targetSource = equippedSlot;
  session.results = [];
  session.message = `已从${EquipmentSlotLabels[equippedSlot]}放入 ${entry.definition.name}`;
  return true;
}

export function closeEquipmentResolutionSession(
  session: EquipmentResolutionSession,
  store: InventoryStore,
  loadout: EquipmentLoadout,
): void {
  if (session.target) {
    if (session.targetSource && session.targetSource !== 'inventory' && !loadout[session.targetSource]) {
      equipInstance(loadout, session.target);
    } else {
      addInventoryEntry(store, session.target);
    }
  }
  session.target = undefined;
  session.targetSource = undefined;
  session.results = [];
  session.message = '未提交装备已返还';
}

export function submitEquipmentResolution(params: {
  session: EquipmentResolutionSession;
  store: InventoryStore;
  registry: Record<string, EquipmentInstance['definition']>;
  soul: number;
  random?: () => number;
}): EquipmentResolutionResult {
  const { session } = params;
  const reject = (message: string): EquipmentResolutionResult => {
    session.message = message;
    return {
      ok: false,
      message,
      soulBefore: params.soul,
      soulAfter: params.soul,
      productFillNames: [],
    };
  };
  if (!session.target) return reject('请先放入可分解装备');
  const admission = canResolveEquipment(session.target);
  if (admission !== true) return reject(admission);
  if (params.soul < EquipmentResolutionSoulCost) {
    return reject(`灵魂不足，需要 ${EquipmentResolutionSoulCost}`);
  }

  const productFillNames = resolveEquipmentProducts(session.target, params.random ?? Math.random);
  const missing = productFillNames.find((fillName) => !params.registry[fillName]);
  if (missing) return reject(`分解产物定义缺失：${missing}`);
  if (!hasProductCapacity(params.store, params.registry, productFillNames)) {
    return reject('背包容量不足，分解未提交');
  }

  const counts = countProducts(productFillNames);
  for (const [fillName, quantity] of counts) {
    if (!addStackByFillName(params.store, params.registry, fillName, quantity)) {
      throw new Error(`Equipment resolution capacity preflight diverged for ${fillName}`);
    }
  }
  const targetName = session.target.definition.name;
  session.target = undefined;
  session.targetSource = undefined;
  session.results = [...productFillNames];
  session.message = `已分解 ${targetName}，获得 ${productFillNames.length} 件产物`;
  return {
    ok: true,
    message: session.message,
    soulBefore: params.soul,
    soulAfter: params.soul - EquipmentResolutionSoulCost,
    productFillNames,
  };
}

export function resolveEquipmentProducts(
  target: EquipmentInstance,
  random: () => number = Math.random,
): string[] {
  const quality = target.definition.quality.replaceAll(' ', '');
  const products: string[] = [];
  let baseMaterialCount = 0;
  let gemAttempts = 0;
  if (quality === '普通') baseMaterialCount = 1;
  else if (quality === '优秀') { baseMaterialCount = 2; gemAttempts = 1; }
  else if (quality === '精良') { baseMaterialCount = 3; gemAttempts = 2; }
  else if (quality === '史诗' || quality === '邪灵') { baseMaterialCount = 4; gemAttempts = 2; }
  else if (quality === '传说') {
    baseMaterialCount = 1;
    gemAttempts = 2;
    if (target.definition.type === 'zbwq') products.push('tss', 'tss', 'tss');
    else if (target.definition.type === 'zbfj') products.push('yhs', 'yhs', 'yhs');
    else { baseMaterialCount = 0; gemAttempts = 6; }
  } else if (quality === '神器') {
    baseMaterialCount = 1;
    gemAttempts = 2;
    if (target.definition.type === 'zbwq' && target.definition.fillName.includes('sq')) {
      products.push('wpycjh');
      if (random() < 0.208) products.push('wpxty');
    } else if (target.definition.type === 'zbfj' && target.definition.fillName.includes('sq')) {
      products.push('wpycjh');
      if (random() < 0.204) products.push('wpzty');
    } else {
      baseMaterialCount = 0;
      gemAttempts = 6;
    }
  }

  for (let index = 0; index < baseMaterialCount; index += 1) {
    const material = resolveBaseMaterial(target, random);
    if (material) products.push(material);
  }
  for (let remaining = gemAttempts - 1; remaining >= 0; remaining -= 1) {
    if (random() < 0.3 * remaining) products.push(randomGem(random));
  }
  return products;
}

function resolveBaseMaterial(target: EquipmentInstance, random: () => number): string | undefined {
  const { type, user } = target.definition;
  if (type === 'zbwq' || type === 'zbsp') return random() >= 0.5 ? 'wpxt' : 'wptm';
  if (user === '悟空' || user === '白龙') return random() >= 0.5 ? 'wpxt' : 'wpsc';
  if (user === '唐僧' || user === '沙僧') return 'wpsc';
  if (user === '八戒') return 'wpxt';
  return undefined;
}

function randomGem(random: () => number): string {
  const index = Math.min(3, Math.max(0, Math.round(random() * 3)));
  return GemFillNames[index];
}

function countProducts(fillNames: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const fillName of fillNames) counts.set(fillName, (counts.get(fillName) ?? 0) + 1);
  return counts;
}

function hasProductCapacity(
  store: InventoryStore,
  registry: Record<string, EquipmentInstance['definition']>,
  fillNames: readonly string[],
): boolean {
  const missingSlots = new Map<keyof InventoryStore['categories'], Set<string>>();
  for (const fillName of new Set(fillNames)) {
    const definition = registry[fillName];
    if (!definition) return false;
    const category = getInventoryCategoryForDefinition(definition);
    const exists = store.categories[category].some(
      (entry) => entry.kind === 'stack' && entry.definition.fillName === fillName,
    );
    if (!exists) {
      const set = missingSlots.get(category) ?? new Set<string>();
      set.add(fillName);
      missingSlots.set(category, set);
    }
  }
  return [...missingSlots].every(([category, fillNamesForCategory]) =>
    store.categories[category].length + fillNamesForCategory.size <= store.capacityPerCategory
  );
}

function sessionFailure(session: EquipmentResolutionSession, message: string): false {
  session.message = message;
  return false;
}
