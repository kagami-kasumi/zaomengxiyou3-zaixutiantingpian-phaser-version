import type { EquipmentDefinition } from './EquipmentSystem';
import {
  addEquipmentByFillName,
  addStackByFillName,
  type InventoryStore,
} from './InventorySystem';

export type DropBigType = 'zb' | 'dj';

export type DropTableEntry = {
  fillName: string;
  bigType: DropBigType;
  quantity?: number;
};

export type MonsterDropId =
  | 'Monster1'
  | 'Monster2'
  | 'Monster3'
  | 'Monster7'
  | 'Monster8'
  | 'Monster9'
  | 'Monster10'
  | 'Monster11'
  | 'Monster12'
  | 'Monster13'
  | 'Monster14'
  | 'Monster15'
  | 'Monster16'
  | 'Monster17'
  | 'Monster18'
  | 'Monster19'
  | 'Monster20'
  | 'Monster21'
  | 'Monster22'
  | 'Monster23'
  | 'Monster24'
  | 'Monster25'
  | 'Monster26'
  | 'Monster27'
  | 'Monster28'
  | 'Monster29'
  | 'Monster30'
  | 'Monster31'
  | 'Monster32'
  | 'Monster33'
  | 'Monster34'
  | 'Monster35'
  | 'Monster36'
  | 'Monster37'
  | 'Monster38'
  | 'Monster39'
  | 'Monster40'
  | 'Monster41'
  | 'Monster42'
  | 'Monster43'
  | 'Monster44'
  | 'Monster45'
  | 'Monster46'
  | 'Monster47'
  | 'Monster53'
  | 'Monster54'
  | 'Monster55'
  | 'Monster56'
  | 'Monster57'
  | 'Monster58'
  | 'Monster59'
  | 'Monster60'
  | 'Monster61'
  | 'Monster62'
  | 'Monster63'
  | 'Monster64'
  | 'Monster65'
  | 'Monster70'
  | 'Monster71'
  | 'Monster72'
  | 'Monster73'
  | 'Monster74'
  | 'Monster75'
  | 'Monster76'
  | 'Monster77'
  | 'Monster78'
  | 'Monster100'
  | 'Monster101'
  | 'Monster102'
  | 'Monster110'
  | 'Monster111'
  | 'Monster112'
  | 'Monster113'
  | 'Monster115'
  | 'Monster116'
  | 'Monster117'
  | 'Monster118'
  | 'Monster119'
  | 'Monster120'
  | 'Monster125'
  | 'Monster126'
  | 'Monster127'
  | 'Monster128'
  | 'Monster129'
  | 'Monster130'
  | 'Monster131'
  | 'Monster132'
  | 'Monster133'
  | 'Monster134'
  | 'Monster135'
  | 'Monster136'
  | 'Monster137'
  | 'Monster139'
  | 'Monster171'
  | 'Monster172'
  | 'Monster181'
  | 'Monster186'
  | 'Monster187'
  | 'Monster189'
  | 'Monster203'
  | 'Monster205'
  | 'Monster206'
  | 'Monster207'
  | 'Monster208'
  | 'Monster209'
  | 'Monster210'
  | 'Monster211'
  | 'Monster212'
  | 'Monster213'
  | 'Monster261'
  | 'Monster262'
  | 'Monster263'
  | 'Monster264'
  | 'Monster601'
  | 'Monster602'
  | 'Monster603'
  | 'Monster604'
  | 'Monster999'
  | 'Monster1000'
  | 'Monster1001'
  | 'Monster1002'
  | 'Monster1003'
  | 'Monster1004'
  | 'Monster1005'
  | 'Monster1006'
  | 'Monster1007'
  | 'Monster1008'
  | 'Monster1111'
  | 'Monster2001'
  | 'Monster6001'
  | 'Monster6002'
  | 'Monster6003'
  | 'Monster6004'
  | 'Monster6005'
  | 'Monster6006'
  | 'Monster6007'
  | 'Monster6008'
  | 'Monster6009'
  | 'Monster6010'
  | 'Monster6011'
  | 'Monster6012'
  | 'Monster11111';

export type MonsterDropContext = {
  curStage: number;
  curLevel: number;
  averageLevel?: number;
  fashionBonus?: number;
  isLwyp?: boolean;
};

export type MonsterDropCondition = {
  curStage?: number;
  curStageNot?: number;
  curLevel?: number;
  averageLevelMin?: number;
  default?: boolean;
};

export type MonsterDropBranchConfig = {
  branchId: string;
  condition: MonsterDropCondition;
  isBoss: boolean;
  baseProbability: number;
  entries: readonly DropTableEntry[];
  note?: string;
};

export type MonsterDropTableConfig = {
  monsterId: MonsterDropId;
  branches: readonly MonsterDropBranchConfig[];
};

export type ResolvedMonsterDropTable = MonsterDropBranchConfig & {
  monsterId: MonsterDropId;
  effectiveProbability: number;
};

export type MedicineDropType = 'SmallHP' | 'BigHP' | 'SmallMP';
export type AuraDropType = 'red' | 'white';

export type MedicineDropDefinition = {
  type: MedicineDropType;
  cname: 'SHp' | 'BHp' | 'SMp';
  label: string;
  restoreTarget: 'hp' | 'mp';
  restoreRatio: number;
  color: number;
};

export type WorldDropState = 'idle' | 'picked';
export type AuraDropPhase = 'wait' | 'rise' | 'seek';

type BaseWorldDrop = {
  id: string;
  serial: number;
  x: number;
  y: number;
  spawnY: number;
  settleY: number;
  state: WorldDropState;
  ageMs: number;
  pickupElapsedMs: number;
  pickupStartY: number;
  feedback: string;
};

export type ItemWorldDrop = BaseWorldDrop & {
  kind: 'item';
  fillName: string;
  bigType: DropBigType;
  quantity: number;
};

export type MedicineWorldDrop = BaseWorldDrop & {
  kind: 'medicine';
  fillName: MedicineDropType;
  bigType: 'medicine';
  quantity: 1;
  medicine: MedicineDropDefinition;
};

export type AuraWorldDrop = BaseWorldDrop & {
  kind: 'aura';
  fillName: 'auraRed' | 'auraWhile';
  bigType: 'aura';
  quantity: 1;
  auraType: AuraDropType;
  targetId: string;
  power: number;
  phase: AuraDropPhase;
  phaseElapsedMs: number;
  startY: number;
  riseDistance: number;
  speedPerFrame: number;
};

export type WorldDrop = ItemWorldDrop | MedicineWorldDrop | AuraWorldDrop;

export type DropSystemModel = {
  drops: WorldDrop[];
  nextDropSerial: number;
  lastMessage: string;
  auraRedGxp: number;
  auraWhitePower: number;
  lastAuraMessage: string;
};

export type DropPickupResult = {
  ok: boolean;
  message: string;
  drop: ItemWorldDrop;
};

export type MedicinePickupResult = {
  ok: boolean;
  message: string;
  drop: MedicineWorldDrop;
  target: 'hp' | 'mp';
  before: number;
  after: number;
  amount: number;
};

export type AuraPickupResult = {
  ok: boolean;
  message: string;
  drop: AuraWorldDrop;
};

export type AuraTargetSnapshot = {
  id: string;
  x: number;
  y: number;
};

export const DropTuning = {
  spawnOffsetY: -100,
  fallSpeed: 360,
  pickupFadeMs: 650,
  pickupFloatY: 58,
  pickupWidth: 76,
  pickupHeight: 92,
  medicineLifetimeMs: 60_000,
  auraWaitMs: 667,
  auraRiseMs: 1_000,
  auraLifetimeMs: 15_000,
  auraCollectDistance: 10,
  auraMinRiseY: 30,
  auraMaxRiseY: 50,
  auraMinSpeedPerFrame: 4,
  auraInitialMaxSpeedPerFrame: 6,
  auraAccelerationPerFrame: 2,
  auraMaxSpeedPerFrame: 20,
} as const;

export const Monster30DropEntries: readonly DropTableEntry[] = [
  { fillName: 'ptdcz', bigType: 'zb' },
  { fillName: 'sms1', bigType: 'dj', quantity: 1 },
];

export const StrengthStoneDropEntry: DropTableEntry = {
  fillName: 'wpqhs1',
  bigType: 'dj',
  quantity: 1,
};

const earlyMaterialEntries = entries('dj', 'wptm', 'wpxt', 'wpsc');
const earlyEquipmentEntries = entries(
  'zb',
  'ptdxzg',
  'ptdxzf',
  'ptdcz',
  'ptdjs',
  'ptddp',
  'ptdcs',
  'ptdyyc',
  'ptdcp',
);
const monster3BossEntries = entries(
  'zb',
  'ptdxzg',
  'ptdxzf',
  'ptdcz',
  'ptdjs',
  'ptddp',
  'ptdcs',
  'ptdyyc',
  'ptdcp',
  'ptdtj',
  'ptdcf',
);
const stage9StoneEntries = entries('dj', 'wpqhs1', 'gjs1', 'fys1', 'mfs1', 'sms1');
const xhbEntry = entries('dj', 'xhb');

export const MonsterDropTables: Record<MonsterDropId, MonsterDropTableConfig> = {
  Monster1: simpleDropTable('Monster1', 0.18, earlyMaterialEntries),
  Monster2: {
    monsterId: 'Monster2',
    branches: [
      {
        branchId: 'stage-3-3-ordinary',
        condition: { curStage: 3, curLevel: 3 },
        isBoss: false,
        baseProbability: 0.8,
        entries: entries('zb', 'kys', 'xhz', 'kyp'),
      },
      {
        branchId: 'stage-8-ordinary',
        condition: { curStage: 8 },
        isBoss: false,
        baseProbability: 0.8,
        entries: entries('zb', 'kys', 'xhz', 'kyp'),
      },
      {
        branchId: 'boss',
        condition: { default: true },
        isBoss: true,
        baseProbability: 0.8,
        entries: entries('zb', 'kys', 'xhz', 'kyp'),
      },
    ],
  },
  Monster3: {
    monsterId: 'Monster3',
    branches: [
      {
        branchId: 'stage-1-1-boss',
        condition: { curStage: 1, curLevel: 1 },
        isBoss: true,
        baseProbability: 1,
        entries: monster3BossEntries,
        note: 'AS3 Monster3 boss branch in curStage=1 curLevel=1.',
      },
      {
        branchId: 'normal',
        condition: { default: true },
        isBoss: false,
        baseProbability: 0.15,
        entries: earlyMaterialEntries,
      },
    ],
  },
  Monster7: simpleDropTable('Monster7', 0.15, [...earlyMaterialEntries, ...earlyEquipmentEntries]),
  Monster8: simpleDropTable('Monster8', 0.15, [...earlyMaterialEntries, ...earlyEquipmentEntries]),
  Monster9: stage9OnlyDropTable('Monster9'),
  Monster10: stage9OnlyDropTable('Monster10'),
  Monster11: simpleDropTable('Monster11', 0.12, earlyMaterialEntries),
  Monster12: simpleDropTable('Monster12', 0.12, earlyMaterialEntries),
  Monster13: simpleDropTable('Monster13', 0.12, earlyMaterialEntries),
  Monster14: simpleDropTable('Monster14', 0.12, earlyMaterialEntries),
  Monster15: simpleDropTable('Monster15', 0.5, entries('zb', 'hylc', 'hylz'), true),
  Monster16: simpleDropTable('Monster16', 0.55, entries('zb', 'qysz', 'hylk', 'chilj'), true),
  Monster17: stage9OnlyDropTable('Monster17'),
  Monster18: stage9OnlyDropTable('Monster18'),
  Monster19: stage9OnlyDropTable('Monster19'),
  Monster20: simpleDropTable('Monster20', 0.5, entries('zb', 'zjbtg', 'jllm', 'smz', 'jxqtj'), true),
  Monster21: simpleDropTable('Monster21', 0.5, entries('zb', 'zjksf', 'zjqj', 'zjxmc', 'jxztp'), true),
  Monster22: simpleDropTable('Monster22', 0.45, entries('zb', 'shsjt'), true),
  Monster23: simpleDropTable('Monster23', 0, []),
  Monster24: simpleDropTable('Monster24', 0.4, entries('dj', 'mgzhzzs'), true),
  Monster25: simpleDropTable('Monster25', 0.42, entries('dj', 'tfljzzs'), true),
  Monster26: simpleDropTable('Monster26', 0.25, entries('dj', 'tdlzjzzs'), true),
  Monster27: simpleDropTable('Monster27', 0.05, earlyMaterialEntries),
  Monster28: simpleDropTable('Monster28', 0.05, earlyMaterialEntries),
  Monster29: simpleDropTable('Monster29', 0.02, entries('dj', 'wpqhs1')),
  Monster30: simpleDropTable('Monster30', 0, []),
  Monster31: simpleDropTable('Monster31', 0.3, entries('dj', 'wpqhs2', 'lssp_1', 'lssp_2', 'lssp_3', 'lssp_4', 'lssp_5'), true),
  Monster32: simpleDropTable('Monster32', 0.4, entries('dj', 'sms1', 'fys1', 'gjs1', 'mfs1', 'lssp_1', 'lssp_2', 'lssp_3'), true),
  Monster33: simpleDropTable('Monster33', 0.3, entries('dj', 'wpqhs1', 'wpqhs2', 'lssp_1', 'lssp_2', 'lssp_3', 'lssp_4'), true),
  Monster34: simpleDropTable('Monster34', 0.2, entries('dj', 'wpqhs2', 'lssp_1', 'lssp_2', 'lssp_3', 'lssp_4', 'lssp_5'), true),
  Monster35: simpleDropTable('Monster35', 0.4, entries('dj', 'xltzzzs', 'xleyzzs', 'xlnyzzs'), true),
  Monster36: simpleDropTable('Monster36', 0.4, entries('dj', 'xltszzs', 'xlczzzs', 'xltqzzs'), true),
  Monster37: simpleDropTable('Monster37', 0.4, entries('dj', 'llyzzs'), true),
  Monster38: simpleDropTable('Monster38', 0.6, entries('dj', 'rls'), true),
  Monster39: simpleDropTable('Monster39', 0.7, earlyMaterialEntries),
  Monster40: simpleDropTable('Monster40', 0.7, earlyMaterialEntries),
  Monster41: simpleDropTable('Monster41', 0.7, earlyMaterialEntries),
  Monster42: simpleDropTable('Monster42', 0.4, entries('dj', 'wpqhs4'), true),
  Monster43: simpleDropTable('Monster43', 0.6, entries('dj', 'wplvdyl'), true),
  Monster44: simpleDropTable('Monster44', 0, []),
  Monster45: simpleDropTable('Monster45', 0, []),
  Monster46: simpleDropTable('Monster46', 0, []),
  Monster47: simpleDropTable('Monster47', 0, [], true),
  Monster53: simpleDropTable('Monster53', 0.4, entries('dj', 'wpdd'), true),
  Monster54: simpleDropTable('Monster54', 0.4, entries('dj', 'qljzzs', 'plpzzs', 'ylkzzs', 'jljzzs', 'clpzzs'), true),
  Monster55: simpleDropTable('Monster55', 0.3, entries('dj', 'wplh')),
  Monster56: simpleDropTable('Monster56', 0.3, entries('dj', 'wpxm')),
  Monster57: simpleDropTable('Monster57', 0.3, entries('dj', 'wpll')),
  Monster58: simpleDropTable('Monster58', 0.45, entries('dj', 'qlgzzs', 'plzzzs', 'ylfzzs', 'jlgzzs', 'jlczzs', '_cljzzs'), true),
  Monster59: simpleDropTable('Monster59', 0.3, entries('dj', 'wpsg')),
  Monster60: simpleDropTable('Monster60', 0.05, [], true),
  Monster61: simpleDropTable('Monster61', 0.05, []),
  Monster62: simpleDropTable('Monster62', 0.3, entries('dj', 'wprs')),
  Monster63: simpleDropTable('Monster63', 0.05, []),
  Monster64: simpleDropTable('Monster64', 0.6, entries('dj', 'sxzhs'), true),
  Monster65: simpleDropTable('Monster65', 0.15, entries('zb', 'zy'), true),
  Monster70: defaultDropTable('Monster70', []),
  Monster71: defaultDropTable('Monster71', []),
  Monster72: defaultDropTable('Monster72', []),
  Monster73: defaultDropTable('Monster73', []),
  Monster74: defaultDropTable('Monster74', []),
  Monster75: defaultDropTable('Monster75', []),
  Monster76: defaultDropTable('Monster76', []),
  Monster77: defaultDropTable('Monster77', []),
  Monster78: defaultDropTable('Monster78', []),
  Monster100: simpleDropTable('Monster100', 0.25, entries('dj', 'zsTimerup2'), true),
  Monster101: simpleDropTable('Monster101', 0.25, entries('dj', 'zsTimerup2'), true),
  Monster102: simpleDropTable('Monster102', 0.25, entries('dj', 'zsTimerup2'), true),
  Monster110: simpleDropTable('Monster110', 0.8, [...earlyMaterialEntries, ...xhbEntry]),
  Monster111: simpleDropTable('Monster111', 0.4, entries('dj', 'wpdh'), true),
  Monster112: defaultDropTable('Monster112', []),
  Monster113: defaultDropTable('Monster113', []),
  Monster115: defaultDropTable('Monster115', [], true),
  Monster116: simpleDropTable('Monster116', 0.8, [...earlyMaterialEntries, ...xhbEntry]),
  Monster117: simpleDropTable('Monster117', 0.8, [...earlyMaterialEntries, ...xhbEntry]),
  Monster118: simpleDropTable('Monster118', 0, [], true),
  Monster119: simpleDropTable('Monster119', 0.8, [...earlyMaterialEntries, ...xhbEntry]),
  Monster120: simpleDropTable('Monster120', 0.27, entries('zb', 'zltc'), true),
  Monster125: simpleDropTable('Monster125', 0.4, entries('dj', 'wpbp'), true),
  Monster126: simpleDropTable('Monster126', 0.8, [...earlyMaterialEntries, ...xhbEntry]),
  Monster127: simpleDropTable('Monster127', 0.36, entries('dj', 'wpzty'), true),
  Monster128: {
    monsterId: 'Monster128',
    branches: [
      {
        branchId: 'average-level-over-20',
        condition: { averageLevelMin: 21 },
        isBoss: true,
        baseProbability: 0.3,
        entries: entries('dj', 'rls', 'wpccfq'),
      },
      {
        branchId: 'average-level-20-or-less',
        condition: { default: true },
        isBoss: true,
        baseProbability: 0.3,
        entries: [],
      },
    ],
  },
  Monster129: simpleDropTable('Monster129', 0.3, entries('dj', 'wpxty'), true),
  Monster130: defaultDropTable('Monster130', [], true),
  Monster131: simpleDropTable('Monster131', 0.4, entries('dj', 'kly3', 'zhhzzzs'), true),
  Monster132: simpleDropTable('Monster132', 0, []),
  Monster133: simpleDropTable('Monster133', 0.8, [...earlyMaterialEntries, ...xhbEntry]),
  Monster134: simpleDropTable('Monster134', 0.3, entries('dj', 'wpccfq'), true),
  Monster135: simpleDropTable('Monster135', 0.4, entries('dj', 'kly3', 'kly4', 'phhlzzs'), true),
  Monster136: simpleDropTable('Monster136', 0.1, xhbEntry),
  Monster137: simpleDropTable('Monster137', 0.3, entries('dj', 'wpccfq'), true),
  Monster139: simpleDropTable('Monster139', 0.2, entries('dj', 'kly3', 'bxhyzzs'), true),
  Monster171: defaultDropTable('Monster171', []),
  Monster172: {
    monsterId: 'Monster172',
    branches: [
      {
        branchId: 'stage-4',
        condition: { curStage: 4 },
        isBoss: true,
        baseProbability: 0.1,
        entries: entries('dj', 'lssp_6', 'lssp_7', 'lssp_8', 'lssp_9'),
      },
      {
        branchId: 'not-stage-4-average-level-50-plus',
        condition: { curStageNot: 4, averageLevelMin: 50 },
        isBoss: true,
        baseProbability: 1,
        entries: xhbEntry,
      },
      {
        branchId: 'not-stage-4-average-level-under-50',
        condition: { curStageNot: 4 },
        isBoss: true,
        baseProbability: 1,
        entries: [],
      },
    ],
  },
  Monster181: defaultDropTable('Monster181', []),
  Monster186: simpleDropTable('Monster186', 0.3, entries('dj', 'wpfbyyin'), true),
  Monster187: simpleDropTable('Monster187', 0, []),
  Monster189: simpleDropTable('Monster189', 0.28, entries('dj', 'wpfbyyan'), true),
  Monster203: simpleDropTable('Monster203', 0.26, entries('dj', 'wpfbtc'), true),
  Monster205: defaultDropTable('Monster205', [], true),
  Monster206: defaultDropTable('Monster206', []),
  Monster207: defaultDropTable('Monster207', entries('zb', 'cs_fj_dz', 'cs_fj_zt', 'cs_fj_jt', 'cs_fj_js'), true),
  Monster208: defaultDropTable('Monster208', [], true),
  Monster209: defaultDropTable('Monster209', entries('dj', 'wpst_1', 'wpsh_1', 'wpst_2', 'wpsh_2'), true),
  Monster210: defaultDropTable('Monster210', entries('dj', 'wpst_3', 'wpsh_3'), true),
  Monster211: defaultDropTable('Monster211', []),
  Monster212: defaultDropTable('Monster212', [], true),
  Monster213: defaultDropTable('Monster213', entries('dj', 'wpxt')),
  Monster261: simpleDropTable('Monster261', 0, []),
  Monster262: simpleDropTable('Monster262', 0, []),
  Monster263: simpleDropTable('Monster263', 0, []),
  Monster264: simpleDropTable('Monster264', 0.1, entries('dj', 'qpjy'), true),
  Monster601: simpleDropTable('Monster601', 0, entries('dj', 'wpycjh'), true),
  Monster602: simpleDropTable('Monster602', 0, entries('dj', 'wpycjh'), true),
  Monster603: simpleDropTable('Monster603', 0, entries('dj', 'wpycjh'), true),
  Monster604: simpleDropTable('Monster604', 0.36, entries('dj', 'wpycjh'), true),
  Monster999: simpleDropTable('Monster999', 0, [], true),
  Monster1000: simpleDropTable('Monster1000', 0.5, entries('zb', 'ywyd'), true),
  Monster1001: simpleDropTable('Monster1001', 0.6, [...entries('zb', 'xhmt'), ...entries('dj', 'lxzhs')], true),
  Monster1002: simpleDropTable('Monster1002', 0.65, entries('dj', 'bx'), true),
  Monster1003: defaultDropTable('Monster1003', [], true),
  Monster1004: defaultDropTable('Monster1004', [], true),
  Monster1005: simpleDropTable('Monster1005', 1, entries('zb', 'zsTimer'), true),
  Monster1006: simpleDropTable('Monster1006', 0, []),
  Monster1007: simpleDropTable('Monster1007', 0.9, entries('dj', 'zsTimerup1'), true),
  Monster1008: simpleDropTable('Monster1008', 1, entries('zb', 'mdhf'), true),
  Monster1111: simpleDropTable('Monster1111', 0.55, entries('zb', 'bxg'), true),
  Monster2001: unsupportedDropTable('Monster2001', 'AS3 drops cwzb:p_cykljl; modern drop pipeline only supports dj/zb.'),
  Monster6001: simpleDropTable('Monster6001', 0, entries('dj', 'wpxt'), true),
  Monster6002: simpleDropTable('Monster6002', 0.12, entries('dj', 'wpyh'), true),
  Monster6003: simpleDropTable('Monster6003', 0.12, entries('dj', 'wpkt'), true),
  Monster6004: simpleDropTable('Monster6004', 0, entries('dj', 'wpxt'), true),
  Monster6005: simpleDropTable('Monster6005', 0.12, entries('dj', 'wpzh'), true),
  Monster6006: simpleDropTable('Monster6006', 0.12, entries('dj', 'wpyt'), true),
  Monster6007: simpleDropTable('Monster6007', 0, entries('dj', 'wpxt')),
  Monster6008: simpleDropTable('Monster6008', 0, entries('dj', 'wpxt'), true),
  Monster6009: simpleDropTable('Monster6009', 0.12, entries('dj', 'wpjh'), true),
  Monster6010: simpleDropTable('Monster6010', 0.12, entries('dj', 'wpdt'), true),
  Monster6011: simpleDropTable('Monster6011', 0, entries('dj', 'wpxt')),
  Monster6012: simpleDropTable('Monster6012', 1, entries('dj', 'lwyp'), true),
  Monster11111: simpleDropTable('Monster11111', 0, [], true),
};

export const MedicineDropDefinitions: Record<MedicineDropType, MedicineDropDefinition> = {
  SmallHP: {
    type: 'SmallHP',
    cname: 'SHp',
    label: 'Small HP',
    restoreTarget: 'hp',
    restoreRatio: 0.25,
    color: 0xe3646d,
  },
  BigHP: {
    type: 'BigHP',
    cname: 'BHp',
    label: 'Big HP',
    restoreTarget: 'hp',
    restoreRatio: 0.5,
    color: 0xf0898e,
  },
  SmallMP: {
    type: 'SmallMP',
    cname: 'SMp',
    label: 'Small MP',
    restoreTarget: 'mp',
    restoreRatio: 0.25,
    color: 0x74c0fc,
  },
};

export function createDropSystem(): DropSystemModel {
  return {
    drops: [],
    nextDropSerial: 1,
    lastMessage: 'drop: none',
    auraRedGxp: 0,
    auraWhitePower: 0,
    lastAuraMessage: 'aura: none',
  };
}

export function spawnWorldDrop(
  model: DropSystemModel,
  entry: DropTableEntry,
  x: number,
  monsterY: number,
  settleY: number,
): WorldDrop {
  const spawnY = monsterY + DropTuning.spawnOffsetY;
  const drop: WorldDrop = {
    id: `drop-${model.nextDropSerial}`,
    serial: model.nextDropSerial,
    kind: 'item',
    fillName: entry.fillName,
    bigType: entry.bigType,
    quantity: entry.quantity ?? 1,
    x,
    y: spawnY,
    spawnY,
    settleY: Math.max(spawnY, settleY),
    state: 'idle',
    ageMs: 0,
    pickupElapsedMs: 0,
    pickupStartY: spawnY,
    feedback: '',
  };
  model.nextDropSerial += 1;
  model.drops.push(drop);
  model.lastMessage = `掉落 ${drop.fillName}`;
  return drop;
}

export function spawnMedicineDrop(
  model: DropSystemModel,
  type: MedicineDropType,
  x: number,
  monsterY: number,
  settleY: number,
): MedicineWorldDrop {
  const spawnY = monsterY + DropTuning.spawnOffsetY;
  const medicine = MedicineDropDefinitions[type];
  const drop: MedicineWorldDrop = {
    id: `drop-${model.nextDropSerial}`,
    serial: model.nextDropSerial,
    kind: 'medicine',
    fillName: type,
    bigType: 'medicine',
    quantity: 1,
    medicine,
    x,
    y: spawnY,
    spawnY,
    settleY: Math.max(spawnY, settleY),
    state: 'idle',
    ageMs: 0,
    pickupElapsedMs: 0,
    pickupStartY: spawnY,
    feedback: '',
  };
  model.nextDropSerial += 1;
  model.drops.push(drop);
  model.lastMessage = `掉落 ${medicine.label}`;
  return drop;
}

export function spawnStrengthStoneDrop(
  model: DropSystemModel,
  x: number,
  monsterY: number,
  settleY: number,
): ItemWorldDrop {
  return spawnWorldDrop(model, StrengthStoneDropEntry, x, monsterY, settleY) as ItemWorldDrop;
}

export function resolveMonsterDropTable(
  monsterId: MonsterDropId,
  context: MonsterDropContext,
): ResolvedMonsterDropTable {
  const table = MonsterDropTables[monsterId];
  const branch = table.branches.find((candidate) =>
    matchesMonsterDropCondition(candidate.condition, context),
  ) ?? table.branches.find((candidate) => candidate.condition.default) ?? table.branches[0];
  const bossMultiplier = branch.isBoss ? 1.5 : 1;
  const fashionMultiplier = 1 + (context.fashionBonus ?? 0);
  const lwypBossProbability = context.isLwyp && branch.isBoss ? 1 : branch.baseProbability;
  const effectiveProbability = lwypBossProbability * bossMultiplier * fashionMultiplier;

  return {
    ...branch,
    monsterId,
    effectiveProbability,
  };
}

export function canMonsterDropItems(table: ResolvedMonsterDropTable): boolean {
  return table.effectiveProbability > 0 && table.entries.length > 0;
}

export function rollMonsterDropEntry(
  table: ResolvedMonsterDropTable,
  random: () => number = Math.random,
): DropTableEntry | undefined {
  if (!canMonsterDropItems(table)) {
    return undefined;
  }

  if (random() > table.effectiveProbability) {
    return undefined;
  }

  return selectMonsterDropEntry(table, random);
}

export function selectMonsterDropEntry(
  table: ResolvedMonsterDropTable,
  random: () => number = Math.random,
): DropTableEntry | undefined {
  if (table.entries.length === 0) {
    return undefined;
  }

  const index = Math.min(Math.floor(random() * table.entries.length), table.entries.length - 1);
  return table.entries[index];
}

export function spawnConfiguredMonsterDrop(params: {
  model: DropSystemModel;
  monsterId: MonsterDropId;
  context: MonsterDropContext;
  x: number;
  monsterY: number;
  settleY: number;
  random?: () => number;
  forceDrop?: boolean;
  entryIndex?: number;
}): ItemWorldDrop | undefined {
  const random = params.random ?? Math.random;
  const table = resolveMonsterDropTable(params.monsterId, params.context);
  const entry = params.forceDrop
    ? table.entries[params.entryIndex ?? Math.floor(random() * table.entries.length)]
    : rollMonsterDropEntry(table, random);

  if (!entry) {
    params.model.lastMessage = `${params.monsterId}/${table.branchId} 未产生装备/道具掉落`;
    return undefined;
  }

  const drop = spawnWorldDrop(
    params.model,
    entry,
    params.x,
    params.monsterY,
    params.settleY,
  ) as ItemWorldDrop;
  params.model.lastMessage = `${params.monsterId}/${table.branchId} 掉落 ${drop.fillName}`;
  return drop;
}

export function spawnAuraDrops(params: {
  model: DropSystemModel;
  monsterX: number;
  monsterY: number;
  targetId: string;
  gxp: number;
  random?: () => number;
}): readonly AuraWorldDrop[] {
  const random = params.random ?? Math.random;
  const drops: AuraWorldDrop[] = [];
  const redCount = 2 + Math.floor(random() * 3);

  for (let i = 0; i < redCount; i += 1) {
    drops.push(spawnAuraDrop({
      model: params.model,
      auraType: 'red',
      x: params.monsterX + (random() - 0.5) * 10,
      y: params.monsterY + (random() - 0.5) * 10,
      targetId: params.targetId,
      power: params.gxp * 2,
      random,
    }));
  }

  const whiteRoll = random();
  const whiteCount = whiteRoll < 0.04 ? 3 : whiteRoll < 0.08 ? 2 : whiteRoll < 0.12 ? 1 : 0;
  for (let i = 0; i < whiteCount; i += 1) {
    drops.push(spawnAuraDrop({
      model: params.model,
      auraType: 'white',
      x: params.monsterX + (random() - 0.5) * 40,
      y: params.monsterY + (random() - 0.5) * 40,
      targetId: params.targetId,
      power: 5,
      random,
    }));
  }

  params.model.lastMessage = `灵魂 ${redCount} · 战意 ${whiteCount}`;
  return drops;
}

export function spawnAuraDrop(params: {
  model: DropSystemModel;
  auraType: AuraDropType;
  x: number;
  y: number;
  targetId: string;
  power: number;
  random?: () => number;
}): AuraWorldDrop {
  const random = params.random ?? Math.random;
  const drop: AuraWorldDrop = {
    id: `drop-${params.model.nextDropSerial}`,
    serial: params.model.nextDropSerial,
    kind: 'aura',
    fillName: params.auraType === 'red' ? 'auraRed' : 'auraWhile',
    bigType: 'aura',
    quantity: 1,
    auraType: params.auraType,
    targetId: params.targetId,
    power: params.power,
    x: params.x,
    y: params.y,
    spawnY: params.y,
    settleY: params.y,
    state: 'idle',
    ageMs: 0,
    pickupElapsedMs: 0,
    pickupStartY: params.y,
    feedback: '',
    phase: 'wait',
    phaseElapsedMs: 0,
    startY: params.y,
    riseDistance: DropTuning.auraMinRiseY +
      random() * (DropTuning.auraMaxRiseY - DropTuning.auraMinRiseY),
    speedPerFrame: DropTuning.auraMinSpeedPerFrame +
      random() * (DropTuning.auraInitialMaxSpeedPerFrame - DropTuning.auraMinSpeedPerFrame),
  };
  params.model.nextDropSerial += 1;
  params.model.drops.push(drop);
  return drop;
}

export function maybeSpawnMedicineDrop(
  model: DropSystemModel,
  x: number,
  monsterY: number,
  settleY: number,
  random: () => number = Math.random,
): MedicineWorldDrop | undefined {
  const type = rollMedicineDropType(random);
  if (!type) {
    return undefined;
  }

  return spawnMedicineDrop(model, type, x, monsterY, settleY);
}

export function rollMedicineDropType(
  random: () => number = Math.random,
): MedicineDropType | undefined {
  if (random() >= 0.5) {
    const hpRoll = random();
    if (hpRoll <= 0.2) {
      if (hpRoll <= 0.1) {
        return random() >= 0.55 ? 'SmallHP' : 'BigHP';
      }
      return 'SmallHP';
    }
  } else if (random() <= 0.25) {
    return 'SmallMP';
  }

  return undefined;
}

export function updateWorldDrops(
  model: DropSystemModel,
  deltaMs: number,
  auraTargets: readonly AuraTargetSnapshot[] = [],
): void {
  for (const drop of model.drops) {
    drop.ageMs += deltaMs;
    if (drop.state !== 'idle') {
      drop.pickupElapsedMs += deltaMs;
      const progress = Math.min(drop.pickupElapsedMs / DropTuning.pickupFadeMs, 1);
      drop.y = drop.pickupStartY - DropTuning.pickupFloatY * progress;
    } else if (drop.kind === 'aura') {
      updateAuraDrop(model, drop, deltaMs, auraTargets);
    } else {
      drop.y = Math.min(drop.settleY, drop.y + DropTuning.fallSpeed * (deltaMs / 1000));
    }
  }

  model.drops = model.drops.filter(
    (drop) =>
      (drop.state === 'idle' &&
        (drop.kind === 'item' ||
          (drop.kind === 'medicine' && drop.ageMs < DropTuning.medicineLifetimeMs) ||
          (drop.kind === 'aura' && drop.ageMs < DropTuning.auraLifetimeMs))) ||
      (drop.state !== 'idle' && drop.pickupElapsedMs < DropTuning.pickupFadeMs),
  );
}

export function pickupWorldDrop(
  model: DropSystemModel,
  drop: ItemWorldDrop,
  store: InventoryStore,
  registry: Record<string, EquipmentDefinition>,
): DropPickupResult {
  if (drop.state !== 'idle') {
    return { ok: false, message: '掉落已经拾取中', drop };
  }

  const definition = registry[drop.fillName];
  if (!definition) {
    const message = `缺少掉落定义 ${drop.fillName}`;
    model.lastMessage = message;
    return { ok: false, message, drop };
  }

  if (drop.bigType === 'zb') {
    const instance = addEquipmentByFillName(store, registry, drop.fillName);
    if (!instance) {
      const message = `装备背包已满，无法拾取 ${definition.name}`;
      model.lastMessage = message;
      return { ok: false, message, drop };
    }
  } else {
    const stack = addStackByFillName(store, registry, drop.fillName, drop.quantity);
    if (!stack) {
      const message = `道具背包已满，无法拾取 ${definition.name}`;
      model.lastMessage = message;
      return { ok: false, message, drop };
    }
  }

  const message = drop.quantity > 1
    ? `拾取 ${definition.name} x${drop.quantity}`
    : `拾取 ${definition.name}`;
  markDropPicked(drop, message);
  model.lastMessage = message;
  return { ok: true, message, drop };
}

export function pickupMedicineDrop(params: {
  model: DropSystemModel;
  drop: MedicineWorldDrop;
  currentHp: number;
  maxHp: number;
  currentMp: number;
  maxMp: number;
}): MedicinePickupResult {
  const { drop } = params;
  if (drop.state !== 'idle') {
    return {
      ok: false,
      message: '药品已经拾取中',
      drop,
      target: drop.medicine.restoreTarget,
      before: 0,
      after: 0,
      amount: 0,
    };
  }

  const target = drop.medicine.restoreTarget;
  const maxValue = target === 'hp' ? params.maxHp : params.maxMp;
  const before = target === 'hp' ? params.currentHp : params.currentMp;
  const amount = Math.floor(maxValue * drop.medicine.restoreRatio);
  const after = Math.min(maxValue, before + amount);
  const message = `${drop.medicine.label} ${target.toUpperCase()} ${before}->${after}`;

  markDropPicked(drop, message);
  params.model.lastMessage = message;
  return {
    ok: true,
    message,
    drop,
    target,
    before,
    after,
    amount: after - before,
  };
}

export function getWorldDrops(model: DropSystemModel): readonly WorldDrop[] {
  return model.drops;
}

export function getDropPickupAlpha(drop: WorldDrop): number {
  if (drop.state === 'idle') {
    return 1;
  }

  return Math.max(0, 1 - drop.pickupElapsedMs / DropTuning.pickupFadeMs);
}

function markDropPicked(drop: WorldDrop, message: string): void {
  drop.state = 'picked';
  drop.pickupElapsedMs = 0;
  drop.pickupStartY = drop.y;
  drop.feedback = message;
}

function updateAuraDrop(
  model: DropSystemModel,
  drop: AuraWorldDrop,
  deltaMs: number,
  auraTargets: readonly AuraTargetSnapshot[],
): void {
  drop.phaseElapsedMs += deltaMs;

  if (drop.phase === 'wait') {
    if (drop.phaseElapsedMs >= DropTuning.auraWaitMs) {
      drop.phase = 'rise';
      drop.phaseElapsedMs = 0;
      drop.startY = drop.y;
    }
    return;
  }

  if (drop.phase === 'rise') {
    const progress = Math.min(drop.phaseElapsedMs / DropTuning.auraRiseMs, 1);
    drop.y = drop.startY - drop.riseDistance * easeOutQuad(progress);
    if (progress >= 1) {
      drop.phase = 'seek';
      drop.phaseElapsedMs = 0;
    }
    return;
  }

  const target = auraTargets.find((candidate) => candidate.id === drop.targetId) ??
    auraTargets[0];
  if (!target) {
    return;
  }
  drop.targetId = target.id;

  const dx = target.x - drop.x;
  const dy = target.y - drop.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= DropTuning.auraCollectDistance) {
    collectAuraDrop(model, drop);
    return;
  }

  const frameScale = deltaMs / (1000 / 60);
  const step = Math.min(distance, drop.speedPerFrame * frameScale);
  drop.x += (dx / distance) * step;
  drop.y += (dy / distance) * step;
  drop.speedPerFrame = Math.min(
    DropTuning.auraMaxSpeedPerFrame,
    drop.speedPerFrame + DropTuning.auraAccelerationPerFrame * frameScale,
  );
}

function collectAuraDrop(model: DropSystemModel, drop: AuraWorldDrop): AuraPickupResult {
  const message = drop.auraType === 'red'
    ? `灵魂 +${drop.power}`
    : `战意 +${drop.power}`;

  if (drop.auraType === 'red') {
    model.auraRedGxp += drop.power;
  } else {
    model.auraWhitePower += drop.power;
  }

  markDropPicked(drop, message);
  model.lastAuraMessage = message;
  model.lastMessage = message;
  return { ok: true, message, drop };
}

function easeOutQuad(value: number): number {
  return 1 - (1 - value) * (1 - value);
}

function entries(bigType: DropBigType, ...fillNames: readonly string[]): readonly DropTableEntry[] {
  return fillNames.map((fillName) => ({ fillName, bigType }));
}

function simpleDropTable(
  monsterId: MonsterDropId,
  baseProbability: number,
  dropEntries: readonly DropTableEntry[],
  isBoss = false,
): MonsterDropTableConfig {
  return {
    monsterId,
    branches: [
      {
        branchId: isBoss ? 'boss' : 'normal',
        condition: { default: true },
        isBoss,
        baseProbability,
        entries: dropEntries,
      },
    ],
  };
}

function defaultDropTable(
  monsterId: MonsterDropId,
  dropEntries: readonly DropTableEntry[],
  isBoss = false,
): MonsterDropTableConfig {
  return simpleDropTable(monsterId, 0.15, dropEntries, isBoss);
}

function unsupportedDropTable(monsterId: MonsterDropId, note: string): MonsterDropTableConfig {
  return {
    monsterId,
    branches: [
      {
        branchId: 'unsupported',
        condition: { default: true },
        isBoss: true,
        baseProbability: 0.15,
        entries: [],
        note,
      },
    ],
  };
}

function stage9OnlyDropTable(monsterId: MonsterDropId): MonsterDropTableConfig {
  return {
    monsterId,
    branches: [
      {
        branchId: 'stage-9',
        condition: { curStage: 9 },
        isBoss: false,
        baseProbability: 0.05,
        entries: stage9StoneEntries,
      },
      {
        branchId: 'not-stage-9',
        condition: { default: true },
        isBoss: false,
        baseProbability: -1,
        entries: stage9StoneEntries,
        note: 'AS3 keeps fallList but sets probability=-1 outside curStage=9.',
      },
    ],
  };
}

function matchesMonsterDropCondition(
  condition: MonsterDropCondition,
  context: MonsterDropContext,
): boolean {
  if (condition.default) {
    return false;
  }

  if (condition.curStage !== undefined && condition.curStage !== context.curStage) {
    return false;
  }

  if (condition.curStageNot !== undefined && condition.curStageNot === context.curStage) {
    return false;
  }

  if (condition.curLevel !== undefined && condition.curLevel !== context.curLevel) {
    return false;
  }

  if (
    condition.averageLevelMin !== undefined &&
    (context.averageLevel === undefined || context.averageLevel < condition.averageLevelMin)
  ) {
    return false;
  }

  return true;
}
