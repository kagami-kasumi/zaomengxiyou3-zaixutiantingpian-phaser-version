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
  magicWeapon?: {
    level: number;
    element: string;
    growthRate?: number;
  };
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

export type MagicWeaponUpgradePanelState = {
  equipped: boolean;
  name: string;
  fillName: string;
  level: number;
  element: string;
  growthRate: number;
  stats: EquipmentStats;
  nextSoulCost: number;
  soul: number;
  canUpgrade: boolean;
  message: string;
};

export type MagicWeaponUpgradeResult = {
  ok: boolean;
  message: string;
  beforeLevel?: number;
  afterLevel?: number;
  soulBefore: number;
  soulAfter: number;
  upgraded?: EquipmentInstance;
};

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

export function getMagicWeaponNextSoulCost(level: number): number {
  return level * level * 1000;
}

export function buildMagicWeaponUpgradePanelState(
  loadout: EquipmentLoadout,
  soul: number,
): MagicWeaponUpgradePanelState {
  const equipped = loadout.magicWeapon;
  const magicWeapon = equipped?.definition.magicWeapon;
  if (!equipped || !magicWeapon) {
    return {
      equipped: false,
      name: '-',
      fillName: '-',
      level: 0,
      element: '-',
      growthRate: 0,
      stats: createEmptyEquipmentStats(),
      nextSoulCost: 0,
      soul,
      canUpgrade: false,
      message: '未装备法宝',
    };
  }

  const { definition } = equipped;
  const level = magicWeapon.level;
  const nextSoulCost = getMagicWeaponNextSoulCost(level);
  return {
    equipped: true,
    name: definition.name,
    fillName: definition.fillName,
    level,
    element: magicWeapon.element,
    growthRate: getMagicWeaponGrowthRate(definition),
    stats: definition.stats,
    nextSoulCost,
    soul,
    canUpgrade: soul >= nextSoulCost && level < 10,
    message: soul >= nextSoulCost ? '可升级' : '灵魂不足',
  };
}

export function upgradeEquippedMagicWeapon(params: {
  loadout: EquipmentLoadout;
  soul: number;
}): MagicWeaponUpgradeResult {
  const equipped = params.loadout.magicWeapon;
  if (!equipped?.definition.magicWeapon) {
    return {
      ok: false,
      message: '未装备法宝',
      soulBefore: params.soul,
      soulAfter: params.soul,
    };
  }

  const beforeLevel = equipped.definition.magicWeapon.level;
  if (beforeLevel >= 10) {
    return {
      ok: false,
      message: '当前最小切片只支持 10 级前灵魂升级',
      beforeLevel,
      afterLevel: beforeLevel,
      soulBefore: params.soul,
      soulAfter: params.soul,
    };
  }

  const soulCost = getMagicWeaponNextSoulCost(beforeLevel);
  if (params.soul < soulCost) {
    return {
      ok: false,
      message: '灵魂不足',
      beforeLevel,
      afterLevel: beforeLevel,
      soulBefore: params.soul,
      soulAfter: params.soul,
    };
  }

  const upgraded = upgradeMagicWeaponInstance(equipped);
  params.loadout.magicWeapon = upgraded;
  return {
    ok: true,
    message: `${upgraded.definition.name} 升到 Lv.${beforeLevel + 1}`,
    beforeLevel,
    afterLevel: beforeLevel + 1,
    soulBefore: params.soul,
    soulAfter: params.soul - soulCost,
    upgraded,
  };
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
      showId: 102,
      name: '1级强化石',
      fillName: 'wpqhs1',
      type: 'zbwp',
      user: '',
      quality: '普 通',
      color: '0xFFFFFF',
      stats: createEmptyEquipmentStats(),
      description: '强化石道具，强化系统效果后置',
    },
    {
      showId: 121,
      name: '宠物寿命丹',
      fillName: 'wpcsd',
      type: 'zbwp',
      user: '',
      quality: '普 通',
      color: '0xFFFFFF',
      stats: createEmptyEquipmentStats(),
      description: '当前出战宠物寿命增加20，上限100',
    },
    {
      showId: 122,
      name: '宠物还魂丹',
      fillName: 'wphhd',
      type: 'zbwp',
      user: '',
      quality: '普 通',
      color: '0xFFFFFF',
      stats: createEmptyEquipmentStats(),
      description: '恢复当前出战宠物的基础状态',
    },
    {
      showId: 123,
      name: '宠物经验石',
      fillName: 'djyys',
      type: 'zbwp',
      user: '',
      quality: '普 通',
      color: '0xFFFFFF',
      stats: createEmptyEquipmentStats(),
      description: '当前出战宠物经验增加30000',
    },
    {
      showId: 1,
      name: '枯叶灵',
      fillName: 'kyl',
      type: 'zbfb',
      user: '',
      quality: '优 秀',
      color: '0x00FF00',
      stats: createEmptyEquipmentStats(),
      description: '缓慢回复少许生命',
      magicWeapon: {
        level: 1,
        element: '木',
        growthRate: 1,
      },
    },
    {
      showId: 1,
      name: '宣花葫芦',
      fillName: 'xhhl',
      type: 'zbfb',
      user: '',
      quality: '精 良',
      color: '0x0000FF',
      stats: createEmptyEquipmentStats(),
      description: '有一定概率捕捉宠物',
      magicWeapon: {
        level: 1,
        element: '水',
        growthRate: 1.2,
      },
    },
    {
      showId: 1,
      name: '神叶灵',
      fillName: 'syl',
      type: 'zbfb',
      user: '',
      quality: '魂 器',
      color: '0x66ffff',
      stats: createEmptyEquipmentStats(),
      description: '缓慢回复生命与魔法',
      magicWeapon: {
        level: 1,
        element: '火',
        growthRate: 1.4,
      },
    },
    {
      showId: 1,
      name: '戮仙剑',
      fillName: 'lxj',
      type: 'zbfb',
      user: '',
      quality: '魂 器',
      color: '0x66ffff',
      stats: createEmptyEquipmentStats(),
      description: '释放多支剑，对敌人造成多重伤害',
      magicWeapon: {
        level: 1,
        element: '金',
        growthRate: 1.6,
      },
    },
    {
      showId: 1,
      name: '混元珍珠伞',
      fillName: 'hyzzs',
      type: 'zbfb',
      user: '',
      quality: '精 良',
      color: '0x0000FF',
      stats: createEmptyEquipmentStats({
        defense: 24,
        maxHp: 160,
      }),
      description: '抵挡一定伤害',
      magicWeapon: {
        level: 1,
        element: '木',
        growthRate: 1.6,
      },
    },
    {
      showId: 1,
      name: '紫金铃铛',
      fillName: 'zjld',
      type: 'zbfb',
      user: '',
      quality: '史 诗',
      color: '0x8A2BE2',
      stats: createEmptyEquipmentStats({
        maxHp: 240,
        maxMp: 160,
        defense: 18,
      }),
      description: '提供人物无敌时间以及恢复部分生命值',
      magicWeapon: {
        level: 1,
        element: '木',
        growthRate: 1.8,
      },
    },
    {
      showId: 1,
      name: '烁时金轮',
      fillName: 'zsTimer',
      type: 'zbfb',
      user: '',
      quality: '传 说',
      color: '0xFF9900',
      stats: createEmptyEquipmentStats({
        maxHp: 360,
        maxMp: 360,
        defense: 24,
      }),
      description: '记录当前时刻的位置、生命、魔法，再次使用回溯',
      magicWeapon: {
        level: 1,
        element: '木',
        growthRate: 2.5,
      },
    },
    {
      showId: 1,
      name: '混元无极伞',
      fillName: 'hywjs',
      type: 'zbfb',
      user: '',
      quality: '魂 器',
      color: '0x66ffff',
      stats: createEmptyEquipmentStats({
        defense: 36,
        maxHp: 320,
        magicDefensePercent: 4,
      }),
      description: '抵挡大量伤害以及反弹部分伤害',
      magicWeapon: {
        level: 1,
        element: '火',
        growthRate: 1.8,
      },
    },
    {
      showId: 1,
      name: '青萍剑',
      fillName: 'fbqpj',
      type: 'zbfb',
      user: '',
      quality: '神 器',
      color: '0xFF0000',
      stats: createEmptyEquipmentStats({
        maxHp: 2880,
        maxMp: 2560,
        power: 520,
        defense: 380,
        critPercent: 8,
        missPercent: 5,
        hpRegen: 36,
        mpRegen: 24,
        lifeStealPercent: 3,
        magicDefensePercent: 5,
      }),
      description: '三元归一剑贯魑魅，一点浩气霆击祸祟',
      magicWeapon: {
        level: 1,
        element: '木',
        growthRate: 3,
      },
    },
    {
      showId: 1,
      name: '九佑魂莲',
      fillName: 'jyhl',
      type: 'zbfb',
      user: '',
      quality: '灵 器',
      color: '0xCC66FF',
      stats: createEmptyEquipmentStats({
        power: 140,
        maxHp: 520,
      }),
      description: '玩家增攻，敌方降攻',
      magicWeapon: {
        level: 1,
        element: '木',
        growthRate: 2.5,
      },
    },
    {
      showId: 1,
      name: '摩多魂幡',
      fillName: 'mdhf',
      type: 'zbfb',
      user: '',
      quality: '神 器',
      color: '0xFF0000',
      stats: createEmptyEquipmentStats({
        maxHp: 640,
        defense: 120,
      }),
      description: '召唤恶魂环绕自身',
      magicWeapon: {
        level: 1,
        element: '木',
        growthRate: 3,
      },
    },
    {
      showId: 1,
      name: '血海魔童',
      fillName: 'xhmt',
      type: 'zbfb',
      user: '',
      quality: '史 诗',
      color: '0x8A2BE2',
      stats: createEmptyEquipmentStats({
        maxMp: 220,
        power: 120,
      }),
      description: '多段随机打击，结束后随机效果',
      magicWeapon: {
        level: 3,
        element: '木',
        growthRate: 2,
      },
    },
    {
      showId: 1,
      name: '太极八卦',
      fillName: 'tjbg',
      type: 'zbfb',
      user: '',
      quality: '传 说',
      color: '0xFF9900',
      stats: createEmptyEquipmentStats({
        maxHp: 360,
        maxMp: 360,
        defense: 24,
      }),
      description: '全屏眩晕未死亡怪物',
      magicWeapon: {
        level: 1,
        element: '木',
        growthRate: 3,
      },
    },
    {
      showId: 1,
      name: '震雷天锤',
      fillName: 'zltc',
      type: 'zbfb',
      user: '',
      quality: '神 器',
      color: '0xFF0000',
      stats: createEmptyEquipmentStats({
        maxHp: 2016,
        maxMp: 1792,
        power: 416,
        defense: 304,
        critPercent: 4,
        missPercent: 2,
        hpRegen: 18,
        mpRegen: 12,
        magicDefensePercent: 2,
      }),
      description: '雷锤前方攻击',
      magicWeapon: {
        level: 1,
        element: '木',
        growthRate: 3,
      },
    },
    {
      showId: 1,
      name: '青龙剑',
      fillName: 'qljfb',
      type: 'zbfb',
      user: '',
      quality: '魂 器',
      color: '0x66ffff',
      stats: createEmptyEquipmentStats(),
      description: '御剑飞行',
      magicWeapon: {
        level: 1,
        element: '木',
        growthRate: 2.4,
      },
    },
    {
      showId: 1,
      name: '奢天化雪令',
      fillName: 'stlp',
      type: 'zbfb',
      user: '',
      quality: '神 器',
      color: '0xFF0000',
      stats: createEmptyEquipmentStats({
        maxHp: 784,
        maxMp: 640,
        power: 132,
        defense: 40,
        critPercent: 4,
        missPercent: 3,
      }),
      description: '凛冬将至，大雪纷飞。',
      magicWeapon: {
        level: 1,
        element: '木',
        growthRate: 3,
      },
    },
    {
      showId: 1,
      name: '流邪',
      fillName: 'lxfb',
      type: 'zbfb',
      user: '',
      quality: '邪 灵',
      color: '0x9900CC',
      stats: createEmptyEquipmentStats({
        power: 80,
        critPercent: 3,
      }),
      description: '入魔后攻击暴击小幅提升，持续扣血',
      magicWeapon: {
        level: 1,
        element: '木',
        growthRate: 1.5,
      },
    },
    {
      showId: 1,
      name: '沙邪',
      fillName: 'sxfb',
      type: 'zbfb',
      user: '',
      quality: '邪 灵',
      color: '0x9900CC',
      stats: createEmptyEquipmentStats({
        power: 120,
        critPercent: 4,
      }),
      description: '入魔后攻击暴击中幅提升，持续扣血',
      magicWeapon: {
        level: 1,
        element: '火',
        growthRate: 2,
      },
    },
    {
      showId: 1,
      name: '渊邪',
      fillName: 'yxfb',
      type: 'zbfb',
      user: '',
      quality: '邪 灵',
      color: '0x9900CC',
      stats: createEmptyEquipmentStats({
        power: 180,
        critPercent: 6,
      }),
      description: '扣除一半生命，攻击和暴击大幅提升',
      magicWeapon: {
        level: 1,
        element: '金',
        growthRate: 2.5,
      },
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

  const dropTableDefinitions: EquipmentDefinition[] = [
    ...createPlaceholderDropDefinitions('zbsp', [
      'ptdxzg',
      'ptdxzf',
      'ptddp',
      'ptdcs',
      'ptdyyc',
      'ptdcp',
      'ptdtj',
      'ptdcf',
      'kys',
      'kyp',
      'hylc',
      'hylz',
      'qysz',
      'hylk',
      'chilj',
      'zjbtg',
      'jllm',
      'smz',
      'jxqtj',
      'zjksf',
      'zjqj',
      'zjxmc',
      'jxztp',
      'shsjt',
      'zy',
      'zltc',
      'cs_fj_dz',
      'cs_fj_zt',
      'cs_fj_jt',
      'cs_fj_js',
      'ywyd',
      'xhmt',
      'zsTimer',
      'mdhf',
      'bxg',
    ]),
    ...createPlaceholderDropDefinitions('zbwp', [
      'wptm',
      'wpxt',
      'wpsc',
      'gjs1',
      'fys1',
      'mfs1',
      'mgzhzzs',
      'tfljzzs',
      'tdlzjzzs',
      'wpqhs2',
      'lssp_1',
      'lssp_2',
      'lssp_3',
      'lssp_4',
      'lssp_5',
      'xltzzzs',
      'xleyzzs',
      'xlnyzzs',
      'xltszzs',
      'xlczzzs',
      'xltqzzs',
      'llyzzs',
      'rls',
      'wpqhs4',
      'wplvdyl',
      'wpdd',
      'qljzzs',
      'plpzzs',
      'ylkzzs',
      'jljzzs',
      'clpzzs',
      'wplh',
      'wpxm',
      'wpll',
      'qlgzzs',
      'plzzzs',
      'ylfzzs',
      'jlgzzs',
      'jlczzs',
      '_cljzzs',
      'wpsg',
      'wprs',
      'sxzhs',
      'zsTimerup2',
      'xhb',
      'wpdh',
      'wpbp',
      'wpzty',
      'wpccfq',
      'wpxty',
      'kly3',
      'zhhzzzs',
      'kly4',
      'phhlzzs',
      'bxhyzzs',
      'lssp_6',
      'lssp_7',
      'lssp_8',
      'lssp_9',
      'wpfbyyin',
      'wpfbyyan',
      'wpfbtc',
      'wpst_1',
      'wpsh_1',
      'wpst_2',
      'wpsh_2',
      'wpst_3',
      'wpsh_3',
      'qpjy',
      'wpycjh',
      'lxzhs',
      'bx',
      'zsTimerup1',
      'wpyh',
      'wpkt',
      'wpzh',
      'wpyt',
      'wpjh',
      'wpdt',
      'lwyp',
    ]),
  ];

  const registry: Record<string, EquipmentDefinition> = {};
  for (const definition of definitions) {
    registry[definition.fillName] = definition;
  }
  for (const definition of dropTableDefinitions) {
    registry[definition.fillName] ??= definition;
  }
  return registry;
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

function createPlaceholderDropDefinitions(
  type: EquipmentItemType,
  fillNames: readonly string[],
): EquipmentDefinition[] {
  return fillNames.map((fillName, index) => ({
    showId: 200 + index,
    name: fillName,
    fillName,
    type,
    user: '',
    quality: '未校准',
    color: '0xFFFFFF',
    stats: createEmptyEquipmentStats(),
    description: '首批掉落表占位定义；完整名称、属性、合成和强化关系后置',
  }));
}

function upgradeMagicWeaponInstance(
  equipped: EquipmentInstance,
): EquipmentInstance {
  const { definition } = equipped;
  const magicWeapon = definition.magicWeapon;
  if (!magicWeapon) {
    return equipped;
  }

  const growth = getMagicWeaponGrowth(definition.fillName);
  const growthRate = getMagicWeaponGrowthRate(definition);
  const element = magicWeapon.element;
  const upgradedStats = addEquipmentStats(
    definition.stats,
    createEmptyEquipmentStats({
      maxHp: getGrownStat(growth.maxHp, growthRate, element.includes('火')),
      maxMp: getGrownStat(growth.maxMp, growthRate, element.includes('水')),
      power: getGrownStat(growth.power, growthRate, element.includes('金')),
      defense: getGrownStat(growth.defense, growthRate, element.includes('土')),
    }),
  );

  return {
    ...equipped,
    definition: {
      ...definition,
      stats: upgradedStats,
      magicWeapon: {
        ...magicWeapon,
        level: magicWeapon.level + 1,
        growthRate,
      },
    },
  };
}

function getMagicWeaponGrowthRate(definition: EquipmentDefinition): number {
  return definition.magicWeapon?.growthRate ?? 1;
}

function getGrownStat(
  baseGrowth: number,
  growthRate: number,
  hasElementBonus: boolean,
): number {
  const passiveGrowth = Math.floor(baseGrowth * growthRate);
  return hasElementBonus ? baseGrowth + passiveGrowth : passiveGrowth;
}

function getMagicWeaponGrowth(fillName: string): Pick<
  EquipmentStats,
  'maxHp' | 'maxMp' | 'power' | 'defense'
> {
  switch (fillName) {
    case 'kyl':
      return { defense: 2, maxMp: 20, power: 4, maxHp: 20 };
    case 'xhhl':
      return { defense: 2, maxMp: 30, power: 5, maxHp: 30 };
    case 'hyzzs':
      return { defense: 4, maxMp: 30, power: 5, maxHp: 50 };
    case 'zjld':
      return { defense: 2, maxMp: 30, power: 9, maxHp: 30 };
    case 'syl':
      return { defense: 3, maxMp: 35, power: 6, maxHp: 35 };
    case 'lxj':
      return { defense: 4, maxMp: 60, power: 7, maxHp: 40 };
    case 'hywjs':
      return { defense: 5, maxMp: 35, power: 8, maxHp: 65 };
    case 'xhmt':
      return { defense: 4, maxMp: 40, power: 15, maxHp: 60 };
    case 'zsTimer':
      return { defense: 4, maxMp: 45, power: 15, maxHp: 75 };
    case 'mdhf':
      return { defense: 5, maxMp: 45, power: 14.4, maxHp: 72 };
    case 'jyhl':
      return { defense: 4, maxMp: 39, power: 20, maxHp: 70 };
    case 'qljfb':
      return { defense: 5, maxMp: 60, power: 14, maxHp: 60 };
    case 'yxfb':
      return { defense: 0, maxMp: 40, power: 20, maxHp: 40 };
    case 'sxfb':
      return { defense: 0, maxMp: 20, power: 15, maxHp: 20 };
    case 'tjbg':
    case 'fbqpj':
      return { defense: 35, maxMp: 170, power: 40, maxHp: 285 };
    case 'zltc':
      return { defense: 16.8, maxMp: 71.4, power: 19.2, maxHp: 119.7 };
    case 'lxfb':
      return { defense: 0, maxMp: 10, power: 5, maxHp: 10 };
    case 'stlp':
      return { defense: 4, maxMp: 40.5, power: 16.2, maxHp: 67.5 };
    default:
      return { defense: 0, maxMp: 0, power: 0, maxHp: 0 };
  }
}
