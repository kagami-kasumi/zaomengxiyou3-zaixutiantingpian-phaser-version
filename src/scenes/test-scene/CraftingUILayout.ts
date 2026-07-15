export const CraftingUILayout = {
  baseWidth: 1000,
  baseHeight: 600,
  sourceOffset: { x: 30, y: 3 },
  sourceSize: { width: 940, height: 594 },
  fusionPanel: { x: 175.6, y: 128.45 },
  selectors: [
    { x: 42, y: 14.85 },
    { x: 132, y: 14.85 },
  ],
  materialSlots: [
    { x: 183.6, y: 222.4 },
    { x: 281.45, y: 142.45 },
    { x: 379.45, y: 222.4 },
  ],
  preview: { x: 188.6, y: 373.35 },
  product: { x: 283.45, y: 298.4 },
  craftButton: { x: 258.6, y: 441.4, width: 132, height: 48 },
  closeButton: { x: 854, y: 15.05, width: 86, height: 50 },
  soul: { x: 802, y: 550.15 },
  inventory: { x: 512.8, y: 130, columns: 5, rows: 5, cell: 58 },
} as const;

export function getCraftingCanvasTransform(width: number, height: number): {
  scale: number;
  x: number;
  y: number;
} {
  const scale = Math.min(width / CraftingUILayout.baseWidth, height / CraftingUILayout.baseHeight);
  return {
    scale,
    x: (width - CraftingUILayout.baseWidth * scale) / 2,
    y: (height - CraftingUILayout.baseHeight * scale) / 2,
  };
}
