import type { InventoryEntry } from './InventorySystem';

export const InventoryGridColumns = 5;
export const InventoryGridRows = 5;
export const InventoryGridCellWidth = 50;
export const InventoryGridCellHeight = 51;
export const InventoryGridStepX = 61;
export const InventoryGridStepY = 60;

export type InventoryItemCell = Readonly<{
  index: number;
  x: number;
  y: number;
  empty: boolean;
  selected: boolean;
  entry?: InventoryEntry;
}>;

export function createInventoryGridProjection(
  entries: readonly InventoryEntry[],
  selectedIndex: number | undefined,
): readonly InventoryItemCell[] {
  return Array.from({ length: InventoryGridColumns * InventoryGridRows }, (_, index) => ({
    index,
    x: (index % InventoryGridColumns) * InventoryGridStepX,
    y: Math.floor(index / InventoryGridColumns) * InventoryGridStepY,
    empty: entries[index] === undefined,
    selected: selectedIndex === index,
    ...(entries[index] === undefined ? {} : { entry: entries[index] }),
  }));
}
