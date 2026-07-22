import {
  EquipmentSlotLabels,
  equipInstance,
  getEquipmentInstanceStats,
  unequipSlot,
  type EquipmentInstance,
  type EquipmentLoadout,
  type EquipmentSlot,
} from './EquipmentSystem';
import {
  addInventoryEntry,
  addStackByFillName,
  consumeStackByFillName,
  getInventoryCategoryForDefinition,
  removeEquipmentInstance,
  type InventoryEntry,
  type InventoryItemStack,
  type InventoryStore,
} from './InventorySystem';
import type { PlayerSlot } from './InputSystem';

export const EquipmentStrengtheningTuning = {
  maxLevel: 7,
  maxStones: 3,
  luckyMultiplier: 1.25,
  soulCosts: [200, 500, 1_000, 4_000, 8_000, 13_000, 20_000] as const,
  stoneChances: [
    [0.375, 0.0937, 0.0234, 0.0058, 0, 0, 0],
    [1, 0.375, 0.0937, 0.0234, 0.0058, 0, 0],
    [1, 1, 0.375, 0.0937, 0.0234, 0.0058, 0],
    [1, 1, 1, 0.375, 0.1, 0.04, 0.01],
    [1, 1, 1, 1, 0.375, 0.15, 0.05],
  ] as const,
} as const;

const StrengthenableTypes = new Set(['zbwq', 'zbfj', 'zbsp', 'zbsz', '']);
const StrengthenableArtifactFillNames = new Set([
  'sqmdcqg', 'zxstg', 'zxstj', 'zxptz', 'zxpty', 'zxztk',
  'zxztp', 'zxqtc', 'zxqts', 'zxztj', 'zxttp',
]);

type StagedStack = {
  definition: InventoryItemStack['definition'];
  level?: number;
};

export type EquipmentStrengtheningSession = {
  owner: PlayerSlot;
  target?: EquipmentInstance;
  targetSource?: 'inventory' | EquipmentSlot;
  stones: StagedStack[];
  luckyCharm?: StagedStack;
  safeguardCharm?: StagedStack;
  message: string;
};

export type EquipmentStrengtheningResult = {
  ok: boolean;
  outcome: 'rejected' | 'success' | 'failure' | 'protected-failure';
  message: string;
  soulBefore: number;
  soulAfter: number;
  chance: number;
  levelBefore?: number;
  levelAfter?: number;
};

export function createEquipmentStrengtheningSession(owner: PlayerSlot): EquipmentStrengtheningSession {
  return { owner, stones: [], message: '请选择装备与至少一颗强化石' };
}

export function getEquipmentStrengthLevel(instance: EquipmentInstance): number {
  return Math.min(EquipmentStrengtheningTuning.maxLevel, Math.max(0, Math.trunc(instance.strengthLevel ?? 0)));
}

export function getStrengtheningSoulCost(level: number): number {
  return EquipmentStrengtheningTuning.soulCosts[Math.min(6, Math.max(0, Math.trunc(level)))] ?? 0;
}

export function getStrengthStoneLevel(fillName: string): number | undefined {
  const match = /^wpqhs([1-5])$/.exec(fillName);
  if (!match) return undefined;
  return Number(match[1]);
}

export function getStrengtheningChance(
  targetLevel: number,
  stoneLevels: readonly number[],
  hasLuckyCharm = false,
): number {
  const column = Math.min(6, Math.max(0, Math.trunc(targetLevel)));
  const base = stoneLevels.reduce((sum, stoneLevel) => {
    const row = EquipmentStrengtheningTuning.stoneChances[Math.trunc(stoneLevel) - 1];
    return sum + (row?.[column] ?? 0);
  }, 0);
  return Math.min(1, base * (hasLuckyCharm ? EquipmentStrengtheningTuning.luckyMultiplier : 1));
}

export function canStrengthenEquipment(instance: EquipmentInstance): true | string {
  const { definition } = instance;
  if (getEquipmentStrengthLevel(instance) >= EquipmentStrengtheningTuning.maxLevel) return '装备已强化至 +7';
  if (definition.type === 'zbtx') return '头衔不能强化';
  const isArtifact = definition.quality.replaceAll(' ', '') === '神器'
    || definition.fillName.startsWith('hy')
    || definition.fillName.startsWith('_dzj')
    || definition.fillName.startsWith('dzjj');
  if (isArtifact && !StrengthenableArtifactFillNames.has(definition.fillName)) return '该神器不在可强化白名单';
  if (!StrengthenableTypes.has(definition.type)) return `${definition.name} 不是可强化装备`;
  return true;
}

export function stageEquipmentStrengtheningEntry(
  session: EquipmentStrengtheningSession,
  store: InventoryStore,
  loadout: EquipmentLoadout,
  entry: InventoryEntry,
): boolean {
  if (entry.kind === 'equipment') return stageTarget(session, store, loadout, entry);
  return stageMaterial(session, store, entry);
}

export function closeEquipmentStrengtheningSession(
  session: EquipmentStrengtheningSession,
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
  for (const material of [...session.stones, session.luckyCharm, session.safeguardCharm]) {
    if (material) addStackByFillName(store, { [material.definition.fillName]: material.definition }, material.definition.fillName, 1);
  }
  session.target = undefined;
  session.targetSource = undefined;
  session.stones = [];
  session.luckyCharm = undefined;
  session.safeguardCharm = undefined;
  session.message = '未提交材料已返还';
}

export function submitEquipmentStrengthening(params: {
  session: EquipmentStrengtheningSession;
  store: InventoryStore;
  loadout: EquipmentLoadout;
  soul: number;
  random?: () => number;
}): EquipmentStrengtheningResult {
  const { session } = params;
  const target = session.target;
  const levelBefore = target ? getEquipmentStrengthLevel(target) : undefined;
  const chance = target
    ? getStrengtheningChance(levelBefore ?? 0, session.stones.map((stone) => stone.level ?? 0), Boolean(session.luckyCharm))
    : 0;
  const reject = (message: string): EquipmentStrengtheningResult => {
    session.message = message;
    return { ok: false, outcome: 'rejected', message, soulBefore: params.soul, soulAfter: params.soul, chance, levelBefore, levelAfter: levelBefore };
  };
  if (!target) return reject('请先放入可强化装备');
  const admission = canStrengthenEquipment(target);
  if (admission !== true) return reject(admission);
  if (session.stones.length === 0) return reject('至少需要一颗强化石');
  const soulCost = getStrengtheningSoulCost(levelBefore ?? 0);
  if (params.soul < soulCost) return reject(`灵魂不足，需要 ${soulCost}`);
  const targetCategory = getInventoryCategoryForDefinition(target.definition);
  if (session.targetSource !== 'inventory'
    && params.store.categories[targetCategory].length >= params.store.capacityPerCategory) {
    return reject('背包容量不足，无法接收强化后的装备');
  }

  const succeeded = (params.random ?? Math.random)() < chance;
  let outcome: EquipmentStrengtheningResult['outcome'];
  let levelAfter = levelBefore ?? 0;
  if (succeeded) {
    levelAfter += 1;
    outcome = 'success';
  } else if (levelAfter >= 3 && session.safeguardCharm) {
    outcome = 'protected-failure';
  } else {
    if (levelAfter >= 3) levelAfter -= 1;
    outcome = 'failure';
  }
  target.strengthLevel = levelAfter;
  if (!addInventoryEntry(params.store, target)) return reject('背包容量不足，强化未提交');
  session.target = undefined;
  session.targetSource = undefined;
  session.stones = [];
  session.luckyCharm = undefined;
  session.safeguardCharm = undefined;
  const message = outcome === 'success'
    ? `${target.definition.name} 强化成功：+${levelBefore} → +${levelAfter}`
    : outcome === 'protected-failure'
      ? `${target.definition.name} 强化失败，神恩符保护为 +${levelAfter}`
      : `${target.definition.name} 强化失败：+${levelBefore} → +${levelAfter}`;
  session.message = message;
  return {
    ok: true,
    outcome,
    message,
    soulBefore: params.soul,
    soulAfter: params.soul - soulCost,
    chance,
    levelBefore,
    levelAfter,
  };
}

export function describeEquipmentStrengtheningSession(session: EquipmentStrengtheningSession): string[] {
  const target = session.target;
  const level = target ? getEquipmentStrengthLevel(target) : 0;
  const chance = getStrengtheningChance(level, session.stones.map((stone) => stone.level ?? 0), Boolean(session.luckyCharm));
  const stats = target ? getEquipmentInstanceStats(target) : undefined;
  return [
    `目标：${target ? `${target.definition.name} +${level}` : '空'}`,
    `来源：${session.targetSource === 'inventory' || !session.targetSource ? '背包' : EquipmentSlotLabels[session.targetSource]}`,
    `强化石：${session.stones.map((stone) => `Lv.${stone.level}`).join(' / ') || '空'}`,
    `幸运符：${session.luckyCharm ? '有' : '无'}　神恩符：${session.safeguardCharm ? '有' : '无'}`,
    `成功率：${Math.floor(chance * 100)}%　灵魂：${target ? getStrengtheningSoulCost(level) : 0}`,
    stats ? `ATK ${stats.power} / DEF ${stats.defense} / HP ${stats.maxHp} / MP ${stats.maxMp}` : '',
  ].filter(Boolean);
}

function stageTarget(
  session: EquipmentStrengtheningSession,
  store: InventoryStore,
  loadout: EquipmentLoadout,
  target: EquipmentInstance,
): boolean {
  if (session.target) {
    session.message = '强化槽已有装备，请先撤回';
    return false;
  }
  const admission = canStrengthenEquipment(target);
  if (admission !== true) {
    session.message = admission;
    return false;
  }
  const removed = removeEquipmentInstance(store, target.instanceId);
  if (removed) {
    session.target = removed;
    session.targetSource = 'inventory';
    session.message = `已放入 ${removed.definition.name}`;
    return true;
  }
  const equippedSlot = (Object.entries(loadout) as Array<[EquipmentSlot, EquipmentInstance | null]>)
    .find(([, item]) => item?.instanceId === target.instanceId)?.[0];
  if (!equippedSlot) {
    session.message = '装备不属于当前玩家';
    return false;
  }
  session.target = unequipSlot(loadout, equippedSlot);
  session.targetSource = equippedSlot;
  session.message = `已从${EquipmentSlotLabels[equippedSlot]}放入 ${target.definition.name}`;
  return true;
}

function stageMaterial(
  session: EquipmentStrengtheningSession,
  store: InventoryStore,
  entry: InventoryItemStack,
): boolean {
  const fillName = entry.definition.fillName;
  const stoneLevel = getStrengthStoneLevel(fillName);
  if (stoneLevel !== undefined && session.stones.length >= EquipmentStrengtheningTuning.maxStones) {
    session.message = '最多放入三颗强化石';
    return false;
  }
  if (fillName === 'wpxyf' && session.luckyCharm) {
    session.message = '幸运符槽已有材料';
    return false;
  }
  if (fillName === 'wpbdf' && session.safeguardCharm) {
    session.message = '神恩符槽已有材料';
    return false;
  }
  if (stoneLevel === undefined && fillName !== 'wpxyf' && fillName !== 'wpbdf') {
    session.message = `${entry.definition.name} 不是强化材料`;
    return false;
  }
  const consumed = consumeStackByFillName(store, fillName, 1);
  if (!consumed.ok) {
    session.message = consumed.message;
    return false;
  }
  const staged = { definition: entry.definition, level: stoneLevel };
  if (stoneLevel !== undefined) session.stones.push(staged);
  else if (fillName === 'wpxyf') session.luckyCharm = staged;
  else session.safeguardCharm = staged;
  session.message = `已放入 ${entry.definition.name}`;
  return true;
}
