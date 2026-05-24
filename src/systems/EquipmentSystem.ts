export type EquipmentItemType =
  | 'zbwq'
  | 'zbfj'
  | 'zbsp'
  | 'zbfb'
  | 'zbsz'
  | 'zbcb'
  | 'zbtx'
  | 'zbwp'
  | 'wpqhs';

export type EquipmentSlot =
  | 'weapon'
  | 'armor'
  | 'accessory'
  | 'fashion'
  | 'magicWeapon'
  | 'title';

export type EquipmentStats = {
  maxHp: number;
  maxMp: number;
  power: number;
  defense: number;
  critPercent: number;
  missPercent: number;
  hpRegen: number;
  mpRegen: number;
  lifeStealPercent: number;
  magicDefensePercent: number;
  piercePercent: number;
  shield: number;
};

export type EquipmentDefinition = {
  showId: number;
  name: string;
  fillName: string;
  type: EquipmentItemType;
  user: string;
  quality: string;
  color: string;
  stats: EquipmentStats;
  description: string;
};

export type EquipmentInstance = {
  kind: 'equipment';
  instanceId: string;
  definition: EquipmentDefinition;
  quantity: 1;
};

export type EquipmentLoadout = Record<EquipmentSlot, EquipmentInstance | null>;

export type HeroBaseStats = {
  maxHp: number;
  maxMp: number;
  power: number;
  defense: number;
};

export type HeroEffectiveStats = HeroBaseStats & EquipmentStats;

export const EquipmentSlotLabels: Record<EquipmentSlot, string> = {
  weapon: '武器',
  armor: '防具',
  accessory: '饰品',
  fashion: '时装',
  magicWeapon: '法宝',
  title: '头衔',
};

export const EquipmentTypeLabels: Record<EquipmentItemType, string> = {
  zbwq: '武器',
  zbfj: '防具',
  zbsp: '饰品',
  zbfb: '法宝',
  zbsz: '时装',
  zbcb: '时装类',
  zbtx: '头衔',
  zbwp: '道具',
  wpqhs: '强化石',
};

export const HeroNamesById: Record<number, string> = {
  1: '悟空',
  2: '唐僧',
  3: '八戒',
  4: '沙僧',
  5: '白龙',
};

export function createEmptyEquipmentStats(
  overrides: Partial<EquipmentStats> = {},
): EquipmentStats {
  return {
    maxHp: 0,
    maxMp: 0,
    power: 0,
    defense: 0,
    critPercent: 0,
    missPercent: 0,
    hpRegen: 0,
    mpRegen: 0,
    lifeStealPercent: 0,
    magicDefensePercent: 0,
    piercePercent: 0,
    shield: 0,
    ...overrides,
  };
}

export function createEmptyEquipmentLoadout(): EquipmentLoadout {
  return {
    weapon: null,
    armor: null,
    accessory: null,
    fashion: null,
    magicWeapon: null,
    title: null,
  };
}

export function getEquipmentSlotForType(
  type: EquipmentItemType,
): EquipmentSlot | undefined {
  switch (type) {
    case 'zbwq':
      return 'weapon';
    case 'zbfj':
      return 'armor';
    case 'zbsp':
      return 'accessory';
    case 'zbsz':
    case 'zbcb':
      return 'fashion';
    case 'zbfb':
      return 'magicWeapon';
    case 'zbtx':
      return 'title';
    case 'zbwp':
    case 'wpqhs':
      return undefined;
  }
}

export function isWearableEquipment(definition: EquipmentDefinition): boolean {
  return getEquipmentSlotForType(definition.type) !== undefined;
}

export function canEquipInstance(
  loadout: EquipmentLoadout,
  instance: EquipmentInstance,
  heroName: string,
): string | true {
  const slot = getEquipmentSlotForType(instance.definition.type);
  if (!slot) {
    return `${instance.definition.name} 不是可穿戴装备`;
  }
  if (instance.definition.type === 'zbcb') {
    return '原版背包禁止直接穿戴 zbcb 时装类';
  }
  if (instance.definition.user && instance.definition.user !== heroName) {
    return `${instance.definition.name} 限定 ${instance.definition.user}`;
  }

  const equipped = loadout[slot];
  if (equipped?.instanceId === instance.instanceId) {
    return `${instance.definition.name} 已在装备槽`;
  }

  return true;
}

export function equipInstance(
  loadout: EquipmentLoadout,
  instance: EquipmentInstance,
): EquipmentInstance | undefined {
  const slot = getEquipmentSlotForType(instance.definition.type);
  if (!slot) {
    return undefined;
  }

  const replaced = loadout[slot] ?? undefined;
  loadout[slot] = instance;
  return replaced;
}

export function unequipSlot(
  loadout: EquipmentLoadout,
  slot: EquipmentSlot,
): EquipmentInstance | undefined {
  const removed = loadout[slot] ?? undefined;
  loadout[slot] = null;
  return removed;
}

export function getEquippedItems(
  loadout: EquipmentLoadout,
): readonly EquipmentInstance[] {
  return Object.values(loadout).filter(
    (item): item is EquipmentInstance => item !== null,
  );
}

export function calculateEquipmentStats(loadout: EquipmentLoadout): EquipmentStats {
  return getEquippedItems(loadout).reduce(
    (total, item) => addEquipmentStats(total, item.definition.stats),
    createEmptyEquipmentStats(),
  );
}

export function calculateEffectiveStats(
  baseStats: HeroBaseStats,
  loadout: EquipmentLoadout,
): HeroEffectiveStats {
  const equipmentStats = calculateEquipmentStats(loadout);
  return {
    ...equipmentStats,
    maxHp: baseStats.maxHp + equipmentStats.maxHp,
    maxMp: baseStats.maxMp + equipmentStats.maxMp,
    power: baseStats.power + equipmentStats.power,
    defense: baseStats.defense + equipmentStats.defense,
  };
}

export function calculatePreviewStats(
  baseStats: HeroBaseStats,
  loadout: EquipmentLoadout,
  previewItem: EquipmentInstance | undefined,
): HeroEffectiveStats {
  if (!previewItem || !isWearableEquipment(previewItem.definition)) {
    return calculateEffectiveStats(baseStats, loadout);
  }

  const previewLoadout = { ...loadout };
  const slot = getEquipmentSlotForType(previewItem.definition.type);
  if (slot) {
    previewLoadout[slot] = previewItem;
  }
  return calculateEffectiveStats(baseStats, previewLoadout);
}

export function addEquipmentStats(
  left: EquipmentStats,
  right: EquipmentStats,
): EquipmentStats {
  return {
    maxHp: left.maxHp + right.maxHp,
    maxMp: left.maxMp + right.maxMp,
    power: left.power + right.power,
    defense: left.defense + right.defense,
    critPercent: left.critPercent + right.critPercent,
    missPercent: left.missPercent + right.missPercent,
    hpRegen: left.hpRegen + right.hpRegen,
    mpRegen: left.mpRegen + right.mpRegen,
    lifeStealPercent: left.lifeStealPercent + right.lifeStealPercent,
    magicDefensePercent: left.magicDefensePercent + right.magicDefensePercent,
    piercePercent: left.piercePercent + right.piercePercent,
    shield: left.shield + right.shield,
  };
}

export function formatEquipmentStats(stats: EquipmentStats): string[] {
  const lines: string[] = [];
  pushStat(lines, 'HP', stats.maxHp);
  pushStat(lines, 'MP', stats.maxMp);
  pushStat(lines, 'ATK', stats.power);
  pushStat(lines, 'DEF', stats.defense);
  pushStat(lines, 'CRIT', stats.critPercent, '%');
  pushStat(lines, 'DODGE', stats.missPercent, '%');
  pushStat(lines, 'HP+', stats.hpRegen);
  pushStat(lines, 'MP+', stats.mpRegen);
  pushStat(lines, 'LIFE', stats.lifeStealPercent, '%');
  pushStat(lines, 'MDEF', stats.magicDefensePercent, '%');
  pushStat(lines, 'PIERCE', stats.piercePercent, '%');
  pushStat(lines, 'SHIELD', stats.shield);
  return lines.length > 0 ? lines : ['no stats'];
}

export function createSeedEquipmentRegistry(): Record<string, EquipmentDefinition> {
  const definitions: EquipmentDefinition[] = [
    {
      showId: 1,
      name: '普通的袈裟',
      fillName: 'ptdjs',
      type: 'zbfj',
      user: '唐僧',
      quality: '普 通',
      color: '0xFFFFFF',
      stats: createEmptyEquipmentStats({
        maxHp: 22,
        maxMp: 47,
        defense: 4,
        magicDefensePercent: 2,
      }),
      description: '唐僧的首批普通防具',
    },
    {
      showId: 1,
      name: '普通的禅杖',
      fillName: 'ptdcz',
      type: 'zbwq',
      user: '唐僧',
      quality: '普 通',
      color: '0xFFFFFF',
      stats: createEmptyEquipmentStats({ power: 5 }),
      description: '唐僧的首批普通武器',
    },
    {
      showId: 1,
      name: '秘银手镯',
      fillName: 'mysz',
      type: 'zbsp',
      user: '',
      quality: '优 秀',
      color: '0x00FF00',
      stats: createEmptyEquipmentStats({
        maxHp: 100,
        maxMp: 100,
        power: 5,
        defense: 5,
      }),
      description: '通用饰品种子装备',
    },
    {
      showId: 2,
      name: '宣花坠',
      fillName: 'xhz',
      type: 'zbsp',
      user: '',
      quality: '优 秀',
      color: '0x00FF00',
      stats: createEmptyEquipmentStats({
        power: 16,
        defense: 10,
      }),
      description: '用于验证饰品替换会退回旧装备',
    },
    {
      showId: 6,
      name: '牛魔王装',
      fillName: 'ptnmwsz',
      type: 'zbsz',
      user: '',
      quality: '普 通',
      color: '0xFFFFFF',
      stats: createEmptyEquipmentStats({
        maxHp: 12,
        hpRegen: 2,
      }),
      description: '时装槽种子物品，完整时装效果后置',
    },
    {
      showId: 101,
      name: '1级生命石',
      fillName: 'sms1',
      type: 'zbwp',
      user: '',
      quality: '普 通',
      color: '0xFFFFFF',
      stats: createEmptyEquipmentStats(),
      description: '可堆叠道具，只显示数量',
    },
    {
      showId: 1,
      name: '水魔爆技能书',
      fillName: 'smbjns2',
      type: 'zbwp',
      user: '',
      quality: '普 通',
      color: '0xFFFFFF',
      stats: createEmptyEquipmentStats(),
      description: '技能书分类种子物品，首切片不实现使用效果',
    },
  ];

  return Object.fromEntries(
    definitions.map((definition) => [definition.fillName, definition]),
  );
}

function pushStat(
  lines: string[],
  label: string,
  value: number,
  suffix = '',
): void {
  if (value === 0) {
    return;
  }

  lines.push(`${label}+${formatNumber(value)}${suffix}`);
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
