import { EquipmentTooltipRuntimeTruth } from '../generated/EquipmentTooltipTruth.generated';
import { getEquipmentTooltipCatalogEntry } from './EquipmentCatalog';
import {
  createEmptyEquipmentStats,
  type EquipmentInstance,
  type EquipmentStats,
} from './EquipmentSystem';

export const EquipmentTooltipTruthId = 'task-settings-189.equipment-tooltip';

type TooltipRow = Readonly<{
  id: string;
  kind: 'metadata' | 'stat';
  label?: string;
  value: string;
  color: string;
  bold: boolean;
}>;

export type EquipmentTooltipPresentation = Readonly<{
  name: string;
  nameColor: string;
  rows: readonly TooltipRow[];
  instructionLines: readonly string[];
  soulValue: string;
  width: number;
  height: number;
  infoWidth: number;
}>;

const StatRows = [
  ['maxHp', '生命', false], ['maxMp', '魔法', false], ['power', '攻击', false],
  ['defense', '防御', false], ['critPercent', '暴击', true], ['missPercent', '闪避', true],
  ['hpRegen', '回血', false], ['mpRegen', '回魔', false],
  ['magicDefensePercent', '魔抗', true], ['piercePercent', '命中', true], ['shield', '泣血', false],
] as const satisfies readonly (readonly [keyof EquipmentStats, string, boolean])[];

assertVerifiedEquipmentTooltipTruth();

export function assertVerifiedEquipmentTooltipTruth(): void {
  const truth = EquipmentTooltipRuntimeTruth;
  if (truth.truthId !== EquipmentTooltipTruthId || truth.status !== 'verified') {
    throw new Error('Equipment tooltip requires the verified 189 truth manifest.');
  }
  if (truth.stage.width !== 940 || truth.stage.height !== 590) {
    throw new Error('Equipment tooltip truth must remain on the original 940x590 stage.');
  }
  if (
    truth.objects.length !== 32
    || truth.stateIds.length !== 12
    || !truth.displayListMatched
    || !truth.stateSetMatched
    || truth.unresolvedCount !== 0
  ) throw new Error('Equipment tooltip truth is incomplete or unresolved.');
}

export function createEquipmentTooltipPresentation(
  instance: EquipmentInstance,
): EquipmentTooltipPresentation {
  const definition = instance.definition;
  const catalog = getEquipmentTooltipCatalogEntry(definition.fillName);
  const strength = Math.min(7, Math.max(0, Math.trunc(instance.strengthLevel ?? 0)));
  const base = createEmptyEquipmentStats({ ...definition.stats, ...instance.baseStatsOverride });
  const growth = createEmptyEquipmentStats(definition.strengthGrowth);
  const bonus = Object.fromEntries(StatRows.map(([key]) => [key, growth[key] * strength])) as Pick<
    EquipmentStats,
    typeof StatRows[number][0]
  >;
  const rows: TooltipRow[] = [
    metadata('quality', '品质', definition.quality, normalizeColor(definition.color)),
    metadata('type', '类型', `${catalog.typeLabel}${definition.user ? `·${definition.user}` : ''}`, '#ffffff'),
  ];
  if (definition.type === 'zbfb' && catalog.equipmentLevel !== 0) {
    rows.push(metadata('level', '等级', `Lv.${catalog.equipmentLevel}`, '#ffffff'));
  }
  if (catalog.upgradeRatio !== 0) {
    rows.push(metadata('growth', '成长率', String(catalog.upgradeRatio), '#ffffff'));
  }
  if (catalog.fiveElements.length > 0) {
    rows.push(metadata('elements', '五行', `${catalog.fiveElements.join(' ')} `, '#ffffff'));
  }
  StatRows.forEach(([key, label, ratio]) => {
    if (Math.trunc(base[key] + bonus[key]) === 0) return;
    rows.push({
      id: `stat-${key}`,
      kind: 'stat',
      value: `${label}： ${formatBase(base[key], ratio)}${formatBonus(bonus[key])}`,
      color: '#ff9933',
      bold: true,
    });
  });
  const instructionLines = splitInstruction(catalog.instruction);
  const instructionHeight = instructionLines.length * 17 + 10;
  const longestCopy = [
    strength ? `${definition.name}(+${strength})` : definition.name,
    ...rows.flatMap((row) => row.kind === 'metadata' ? [row.label ?? '', `  ${row.value}`] : [row.value]),
    `价值 : ${catalog.soulValue} 灵魂`,
  ].reduce((longest, copy) => estimatedWidth(copy, 16) > estimatedWidth(longest, 16) ? copy : longest, '');
  const infoWidth = Math.max(135, estimatedWidth(longestCopy, 16) + 10);
  return {
    name: strength ? `${definition.name}(+${strength})` : definition.name,
    nameColor: normalizeColor(definition.color),
    rows,
    instructionLines,
    soulValue: `价值 : ${catalog.soulValue} 灵魂`,
    infoWidth,
    width: infoWidth + 35,
    height: rows.length * 25 + instructionHeight + 70,
  };
}

export function getEquipmentTooltipFixtureBounds(
  stateId: keyof typeof EquipmentTooltipRuntimeTruth.fixtureRootBoundsByState,
): Readonly<{ left: number; top: number; width: number; height: number }> {
  return EquipmentTooltipRuntimeTruth.fixtureRootBoundsByState[stateId];
}

export function placeEquipmentTooltip(
  pointerX: number,
  pointerY: number,
  presentation: Pick<EquipmentTooltipPresentation, 'width' | 'height'>,
): Readonly<{ x: number; y: number }> {
  return {
    x: pointerX + presentation.width > 930 ? pointerX - presentation.width - 10 : pointerX + 10,
    y: 590 - presentation.height > pointerY ? pointerY : 590 - presentation.height,
  };
}

function metadata(id: string, label: string, value: string, color: string): TooltipRow {
  return { id: `meta-${id}`, kind: 'metadata', label, value, color, bold: false };
}

function splitInstruction(value: string): readonly string[] {
  const copy = value.replace(/<[^>]*>/g, '').replace(/\r?\n/g, '');
  return copy.match(/.{1,9}/gu) ?? [''];
}

function estimatedWidth(copy: string, size: number): number {
  return [...copy].reduce((sum, char) => sum + (/^[\x00-\xff]$/.test(char) ? size * 0.56 : size), 0);
}

function formatBase(value: number, ratio: boolean): string {
  return ratio ? `${Number(value.toFixed(2))}%` : String(Math.trunc(value));
}

function formatBonus(value: number): string {
  const shown = Number(value.toFixed(2));
  return shown === 0 ? '' : shown > 0 ? `(+${shown})` : `(${shown})`;
}

function normalizeColor(value: string): string {
  return value.replace(/^0x/i, '#').toLowerCase();
}
