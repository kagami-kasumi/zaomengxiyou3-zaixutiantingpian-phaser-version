import equipmentDataCatalog from '../../docs/reverse-engineering/reference/equipment-data-catalog-1.1.json';

import {
  createEmptyEquipmentStats,
  type EquipmentDefinition,
  type EquipmentItemType,
  type EquipmentStatRange,
  type EquipmentStats,
} from './EquipmentSystem';

type SourceNumber = Readonly<{
  originalExpression: string;
  unit: 'points' | 'ratio' | 'identifier' | 'level';
  runtimeCoercion: 'int' | 'uint' | 'Number';
  value: number | null;
  min: number;
  max: number;
  maxInclusive: boolean;
}>;

type SourceEquipment = Readonly<{
  fillName: string;
  displayName: string;
  showId: SourceNumber;
  originalType: EquipmentItemType;
  user: string;
  quality: string;
  color: string;
  baseStats: Readonly<Record<string, SourceNumber>>;
  strengthening: Readonly<{ perLevel: Readonly<Record<string, SourceNumber>> }>;
  progression: Readonly<{
    equipmentLevel: SourceNumber;
    upgradeRatio: SourceNumber;
  }>;
  fiveElements: Readonly<Record<'metal' | 'wood' | 'water' | 'fire' | 'earth', boolean>>;
  tooltip: Readonly<{
    instruction: string;
    typeLabel: string;
    soulValue: number;
  }>;
}>;

export type EquipmentTooltipCatalogEntry = Readonly<{
  instruction: string;
  typeLabel: string;
  soulValue: number;
  equipmentLevel: number;
  upgradeRatio: number;
  fiveElements: readonly string[];
}>;

const STAT_FIELDS = {
  hp: 'maxHp',
  mp: 'maxMp',
  attack: 'power',
  defense: 'defense',
  criticalChance: 'critPercent',
  evasionChance: 'missPercent',
  hpRegen: 'hpRegen',
  mpRegen: 'mpRegen',
  lifeSteal: 'lifeStealPercent',
  magicDefense: 'magicDefensePercent',
  armorPenetration: 'piercePercent',
  haveBlood: 'shield',
} as const satisfies Readonly<Record<string, keyof EquipmentStats>>;

const sourceItems = equipmentDataCatalog.items as readonly unknown[] as readonly SourceEquipment[];

function mapStats(fields: Readonly<Record<string, SourceNumber>>): EquipmentStats {
  const result = createEmptyEquipmentStats();
  for (const [sourceName, targetName] of Object.entries(STAT_FIELDS)) {
    const source = fields[sourceName]!;
    result[targetName] = source.unit === 'ratio'
      ? as3FractionToPercentPoints(source.min)
      : source.min;
  }
  return result;
}

function as3FractionToPercentPoints(value: number): number {
  return Number((value * 100).toFixed(10));
}

function mapRanges(
  fields: Readonly<Record<string, SourceNumber>>,
): Readonly<Record<keyof EquipmentStats, EquipmentStatRange>> {
  return Object.fromEntries(Object.entries(STAT_FIELDS).map(([sourceName, targetName]) => {
    const field = fields[sourceName]!;
    return [targetName, {
      min: field.min,
      max: field.max,
      maxInclusive: field.maxInclusive,
      unit: field.unit as 'points' | 'ratio',
      runtimeCoercion: field.runtimeCoercion,
      originalExpression: field.originalExpression,
    } satisfies EquipmentStatRange];
  })) as Record<keyof EquipmentStats, EquipmentStatRange>;
}

export const AuthoritativeEquipmentDefinitions: readonly EquipmentDefinition[] = sourceItems.map(
  (item) => ({
    showId: item.showId.value ?? item.showId.min,
    name: item.displayName,
    fillName: item.fillName,
    type: item.originalType,
    user: item.user,
    quality: item.quality,
    color: item.color,
    stats: mapStats(item.baseStats),
    baseStatRanges: mapRanges(item.baseStats),
    strengthGrowth: mapStats(item.strengthening.perLevel),
    description: '原版 1.1 权威装备数据',
  }),
);

export const AuthoritativeEquipmentCatalog = Object.fromEntries(
  AuthoritativeEquipmentDefinitions.map((definition) => [definition.fillName, definition]),
) as Readonly<Record<string, EquipmentDefinition>>;

const ElementLabels = [
  ['metal', '金'], ['wood', '木'], ['water', '水'], ['fire', '火'], ['earth', '土'],
] as const;

export const AuthoritativeEquipmentTooltipCatalog = Object.fromEntries(sourceItems.map((item) => [
  item.fillName,
  {
    ...item.tooltip,
    equipmentLevel: item.progression.equipmentLevel.value ?? 0,
    upgradeRatio: item.progression.upgradeRatio.value ?? 0,
    fiveElements: ElementLabels.filter(([key]) => item.fiveElements[key]).map(([, label]) => label),
  } satisfies EquipmentTooltipCatalogEntry,
])) as Readonly<Record<string, EquipmentTooltipCatalogEntry>>;

export function getEquipmentTooltipCatalogEntry(fillName: string): EquipmentTooltipCatalogEntry {
  const entry = AuthoritativeEquipmentTooltipCatalog[fillName];
  if (!entry) throw new Error(`Equipment tooltip catalog entry is missing: ${fillName}`);
  return entry;
}

/** Applies the 164-item authority while retaining existing non-data behavior metadata. */
export function createAuthoritativeEquipmentRegistry(
  existing: Readonly<Record<string, EquipmentDefinition>> = {},
): Record<string, EquipmentDefinition> {
  return {
    ...existing,
    ...Object.fromEntries(AuthoritativeEquipmentDefinitions.map((definition) => {
      const previous = existing[definition.fillName];
      return [definition.fillName, {
        ...definition,
        description: previous?.description ?? definition.description,
        ...(previous?.magicWeapon ? { magicWeapon: previous.magicWeapon } : {}),
      } satisfies EquipmentDefinition];
    })),
  };
}
