import {
  calculateEffectiveStats,
  calculatePreviewStats,
  EquipmentSlotLabels,
  EquipmentTypeLabels,
  formatEquipmentStats,
  type EquipmentLoadout,
  type EquipmentSlot,
  type HeroBaseStats,
  type HeroEffectiveStats,
} from './EquipmentSystem';
import {
  equipInventoryItem,
  getInventoryEntries,
  InventoryCategories,
  InventoryCategoryLabels,
  unequipInventorySlot,
  type InventoryCategory,
  type InventoryEntry,
  type InventoryStore,
} from './InventorySystem';

export type InventoryUIFocus = 'inventory' | 'loadout';

export type InventoryUIState = {
  isOpen: boolean;
  activeCategory: InventoryCategory;
  focus: InventoryUIFocus;
  selectedIndex: number;
  selectedSlotIndex: number;
  message: string;
};

export type InventoryPanelLinesParams = {
  store: InventoryStore;
  loadout: EquipmentLoadout;
  baseStats: HeroBaseStats;
  playerLabel: string;
  heroName: string;
  ui: InventoryUIState;
};

export const EquipmentSlotOrder: readonly EquipmentSlot[] = [
  'weapon',
  'armor',
  'accessory',
  'fashion',
  'magicWeapon',
  'title',
];

export function createInventoryUIState(): InventoryUIState {
  return {
    isOpen: false,
    activeCategory: 'equipment',
    focus: 'inventory',
    selectedIndex: 0,
    selectedSlotIndex: 0,
    message: 'Ready',
  };
}

export function toggleInventoryUI(ui: InventoryUIState): void {
  ui.isOpen = !ui.isOpen;
  ui.message = ui.isOpen ? 'Inventory opened' : 'Inventory closed';
}

export function selectNextInventoryCategory(
  ui: InventoryUIState,
  store: InventoryStore,
  direction: 1 | -1,
): void {
  const current = InventoryCategories.indexOf(ui.activeCategory);
  const next = (current + direction + InventoryCategories.length) % InventoryCategories.length;
  ui.activeCategory = InventoryCategories[next];
  ui.focus = 'inventory';
  ui.selectedIndex = 0;
  clampInventorySelection(ui, store);
}

export function moveInventorySelection(
  ui: InventoryUIState,
  store: InventoryStore,
  direction: 1 | -1,
): void {
  if (ui.focus === 'loadout') {
    ui.selectedSlotIndex = clampNumber(
      ui.selectedSlotIndex + direction,
      0,
      EquipmentSlotOrder.length - 1,
    );
    return;
  }

  ui.selectedIndex += direction;
  clampInventorySelection(ui, store);
}

export function setInventoryFocus(ui: InventoryUIState, focus: InventoryUIFocus): void {
  ui.focus = focus;
}

export function equipSelectedInventoryEntry(params: {
  ui: InventoryUIState;
  store: InventoryStore;
  loadout: EquipmentLoadout;
  heroName: string;
}): boolean {
  const selected = getSelectedInventoryEntry(params.ui, params.store);
  if (!selected || selected.kind !== 'equipment') {
    params.ui.message = '请选择装备或时装';
    return false;
  }

  const result = equipInventoryItem(
    params.store,
    params.loadout,
    selected.instanceId,
    params.heroName,
  );
  params.ui.message = result.message;
  clampInventorySelection(params.ui, params.store);
  return result.ok;
}

export function unequipSelectedLoadoutSlot(params: {
  ui: InventoryUIState;
  store: InventoryStore;
  loadout: EquipmentLoadout;
}): boolean {
  const slot = getSelectedEquipmentSlot(params.ui);
  const result = unequipInventorySlot(params.store, params.loadout, slot);
  params.ui.message = result.message;
  return result.ok;
}

export function getSelectedInventoryEntry(
  ui: InventoryUIState,
  store: InventoryStore,
): InventoryEntry | undefined {
  const entries = getInventoryEntries(store, ui.activeCategory);
  return entries[ui.selectedIndex];
}

export function getSelectedEquipmentSlot(ui: InventoryUIState): EquipmentSlot {
  return EquipmentSlotOrder[ui.selectedSlotIndex];
}

export function buildInventoryPanelLines(
  params: InventoryPanelLinesParams,
): string[] {
  clampInventorySelection(params.ui, params.store);

  const lines: string[] = [];
  const selectedEntry = getSelectedInventoryEntry(params.ui, params.store);
  const currentStats = calculateEffectiveStats(params.baseStats, params.loadout);
  const previewStats = calculatePreviewStats(
    params.baseStats,
    params.loadout,
    selectedEntry?.kind === 'equipment' ? selectedEntry : undefined,
  );

  lines.push(`══ INVENTORY ${params.playerLabel} ${params.heroName} ══`);
  lines.push(formatCategoryTabs(params.ui));
  lines.push(`Focus: ${params.ui.focus} | ${params.ui.message}`);
  lines.push('');
  lines.push('Equipped');
  for (let i = 0; i < EquipmentSlotOrder.length; i += 1) {
    const slot = EquipmentSlotOrder[i];
    const equipped = params.loadout[slot];
    const pointer = params.ui.focus === 'loadout' && params.ui.selectedSlotIndex === i
      ? '▶'
      : ' ';
    lines.push(
      `${pointer}${EquipmentSlotLabels[slot].padEnd(4)} ${equipped ? formatEquipmentName(equipped) : '-'}`,
    );
  }

  lines.push('');
  lines.push(`${InventoryCategoryLabels[params.ui.activeCategory]} (${getInventoryEntries(params.store, params.ui.activeCategory).length}/${params.store.capacityPerCategory})`);
  const entries = getInventoryEntries(params.store, params.ui.activeCategory);
  if (entries.length === 0) {
    lines.push('  - empty -');
  } else {
    for (let i = 0; i < Math.min(entries.length, 10); i += 1) {
      const entry = entries[i];
      const pointer = params.ui.focus === 'inventory' && params.ui.selectedIndex === i
        ? '▶'
        : ' ';
      lines.push(`${pointer}${formatInventoryEntry(entry)}`);
    }
  }

  lines.push('');
  lines.push('Stats');
  lines.push(...formatStatsPreview(currentStats, previewStats));

  if (selectedEntry?.kind === 'equipment') {
    lines.push('');
    lines.push(`Selected: ${formatEquipmentName(selectedEntry)}`);
    lines.push(`fillName:${selectedEntry.definition.fillName} type:${EquipmentTypeLabels[selectedEntry.definition.type]}`);
    lines.push(`main:${formatEquipmentStats(selectedEntry.definition.stats).join(' ')}`);
  }

  return lines;
}

function clampInventorySelection(
  ui: InventoryUIState,
  store: InventoryStore,
): void {
  const entries = getInventoryEntries(store, ui.activeCategory);
  ui.selectedIndex = clampNumber(
    ui.selectedIndex,
    0,
    Math.max(0, entries.length - 1),
  );
  ui.selectedSlotIndex = clampNumber(
    ui.selectedSlotIndex,
    0,
    EquipmentSlotOrder.length - 1,
  );
}

function formatCategoryTabs(ui: InventoryUIState): string {
  return InventoryCategories
    .map((category) => {
      const label = InventoryCategoryLabels[category];
      return category === ui.activeCategory ? `[${label}]` : ` ${label} `;
    })
    .join(' ');
}

function formatInventoryEntry(entry: InventoryEntry): string {
  if (entry.kind === 'stack') {
    return [
      entry.definition.fillName.padEnd(8),
      entry.definition.name,
      EquipmentTypeLabels[entry.definition.type],
      entry.definition.quality,
      `x${entry.quantity}`,
    ].join(' | ');
  }

  return [
    entry.definition.fillName.padEnd(8),
    entry.definition.name,
    EquipmentTypeLabels[entry.definition.type],
    entry.definition.quality,
    `x${entry.quantity}`,
  ].join(' | ');
}

function formatEquipmentName(entry: InventoryEntry): string {
  return `${entry.definition.name} (${entry.definition.fillName}, ${entry.definition.quality})`;
}

function formatStatsPreview(
  current: HeroEffectiveStats,
  preview: HeroEffectiveStats,
): string[] {
  return [
    formatStatLine('HP', current.maxHp, preview.maxHp),
    formatStatLine('MP', current.maxMp, preview.maxMp),
    formatStatLine('ATK', current.power, preview.power),
    formatStatLine('DEF', current.defense, preview.defense),
    formatStatLine('CRIT%', current.critPercent, preview.critPercent),
    formatStatLine('MDEF%', current.magicDefensePercent, preview.magicDefensePercent),
    formatStatLine('PIERCE%', current.piercePercent, preview.piercePercent),
    formatStatLine('SHIELD', current.shield, preview.shield),
  ];
}

function formatStatLine(label: string, current: number, preview: number): string {
  if (current === preview) {
    return `${label.padEnd(7)} ${formatNumber(current)}`;
  }

  const marker = preview > current ? '↑' : '↓';
  return `${label.padEnd(7)} ${formatNumber(current)} -> ${formatNumber(preview)} ${marker}`;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
