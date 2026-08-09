import equipmentVisualCatalog from '../../docs/reverse-engineering/reference/equipment-visual-resource-catalog-1.1.json';

type SourceResource = Readonly<{
  sourcePackage: string;
  characterId: number;
  symbolClass: string;
  definitionTag: string | null;
  visibleBounds: Readonly<{ left: number; top: number; width: number; height: number }> | null;
  status: string;
}>;

export type EquipmentPreviewAssetDefinition = Readonly<{
  key: string;
  path: string;
  sourcePackage: string;
  sourceCharacterId: number;
  sourceSymbol: string;
  kind: 'image' | 'spritesheet';
  frameWidth?: number;
  frameHeight?: number;
  visibleBounds: Readonly<{ left: number; top: number; width: number; height: number }>;
}>;

const stableSlug = (value: string) => value
  .replace(/[^a-zA-Z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .toLowerCase();

export function getEquipmentPreviewAssetKey(sourcePackage: string, characterId: number): string {
  return `equipment-preview.${stableSlug(sourcePackage)}.${characterId}`;
}

function getSheetFrame(resource: SourceResource): Readonly<{ width: number; height: number }> | undefined {
  if (resource.definitionTag !== 'DefineBitsLossless' && resource.definitionTag !== 'DefineBitsJPEGWithAlpha') {
    return undefined;
  }
  if (!resource.symbolClass.startsWith('ROLE')) return undefined;
  if (resource.symbolClass.startsWith('ROLE3_')) return { width: 300, height: 200 };
  if (resource.symbolClass.startsWith('ROLE1_') || resource.symbolClass.startsWith('ROLE2_')
    || resource.symbolClass.startsWith('ROLE4_')) return { width: 200, height: 200 };
  return undefined;
}

const uniqueResources = new Map<string, SourceResource>();
for (const item of equipmentVisualCatalog.items) {
  for (const raw of item.preview.resources ?? []) {
    const resource = raw as SourceResource;
    if (resource.status !== 'located' || !resource.visibleBounds) continue;
    uniqueResources.set(`${resource.sourcePackage}|${resource.characterId}`, resource);
  }
}

export const equipmentPreviewAssets: readonly EquipmentPreviewAssetDefinition[] = [
  ...uniqueResources.values(),
].map((resource) => {
  const frame = getSheetFrame(resource);
  return {
    key: getEquipmentPreviewAssetKey(resource.sourcePackage, resource.characterId),
    path: `/assets/ui/inventory/equipment-preview/${stableSlug(resource.sourcePackage)}-${resource.characterId}.png`,
    sourcePackage: resource.sourcePackage,
    sourceCharacterId: resource.characterId,
    sourceSymbol: resource.symbolClass,
    kind: frame ? 'spritesheet' : 'image',
    ...(frame ? { frameWidth: frame.width, frameHeight: frame.height } : {}),
    visibleBounds: resource.visibleBounds!,
  };
});

export const EquipmentPreviewAssetCatalog = Object.fromEntries(
  equipmentPreviewAssets.map((asset) => [asset.key, asset]),
) as Readonly<Record<string, EquipmentPreviewAssetDefinition>>;
