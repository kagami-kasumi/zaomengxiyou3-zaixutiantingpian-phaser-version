import equipmentVisualCatalog from '../../docs/reverse-engineering/reference/equipment-visual-resource-catalog-1.1.json';

import {
  EquipmentPreviewAssetCatalog,
  getEquipmentPreviewAssetKey,
  type EquipmentPreviewAssetDefinition,
} from '../assets/EquipmentPreviewAssets';
import type { EquipmentInstance, EquipmentLoadout } from './EquipmentSystem';

export type EquipmentPreviewMode =
  | 'layered-role-resource'
  | 'role4-dual-body-branch'
  | 'role5-dynamic-fashion-layers'
  | 'title-overlay'
  | 'no-head-preview-change';

type CatalogResource = Readonly<{
  sourcePackage: string;
  characterId: number;
  symbolClass: string;
  status: string;
  details?: Readonly<{ kind?: string; showId?: number }>;
}>;

type CatalogPreview = Readonly<{
  mode: EquipmentPreviewMode;
  role?: number;
  resources?: readonly CatalogResource[];
  branch?: Readonly<{ arrowWeaponIds: readonly number[]; otherwise: string }>;
  dynamicLayer?: string;
  selectedFrame?: number;
  placement?: Readonly<{ x: number; y: number }>;
}>;

type CatalogItem = Readonly<{
  fillName: string;
  slot: string;
  icon: Readonly<{ status: string }>;
  preview: CatalogPreview;
}>;

export type EquipmentPreviewLayer = Readonly<{
  fillName: string;
  mode: EquipmentPreviewMode;
  asset: EquipmentPreviewAssetDefinition;
  offset: Readonly<{ x: number; y: number }>;
  selectedFrame?: number;
}>;

const items = equipmentVisualCatalog.items as readonly unknown[] as readonly CatalogItem[];
export const EquipmentVisualCatalog = Object.fromEntries(
  items.map((item) => [item.fillName, item]),
) as Readonly<Record<string, CatalogItem>>;

function getItem(instance: EquipmentInstance | null): CatalogItem | undefined {
  return instance ? EquipmentVisualCatalog[instance.definition.fillName] : undefined;
}

function selectResources(item: CatalogItem, loadout: EquipmentLoadout): readonly CatalogResource[] {
  const resources = item.preview.resources ?? [];
  if (item.preview.mode !== 'role4-dual-body-branch') return resources;
  const weaponShowId = loadout.weapon?.definition.showId ?? 0;
  const useArrow = item.preview.branch?.arrowWeaponIds.includes(weaponShowId) ?? false;
  return resources.filter((resource) => resource.symbolClass.includes(useArrow ? '_ARROW_' : '_SHOVEL_'));
}

export function getEquipmentPreviewLayers(
  heroId: number,
  loadout: EquipmentLoadout,
): readonly EquipmentPreviewLayer[] {
  const candidates = [getItem(loadout.armor), getItem(loadout.weapon), getItem(loadout.title)]
    .filter((item): item is CatalogItem => item !== undefined)
    .filter((item) => item.preview.mode === 'title-overlay' || item.preview.role === heroId);
  const layers: EquipmentPreviewLayer[] = [];
  for (const item of candidates) {
    for (const resource of selectResources(item, loadout)) {
      if (resource.status !== 'located') continue;
      const asset = EquipmentPreviewAssetCatalog[
        getEquipmentPreviewAssetKey(resource.sourcePackage, resource.characterId)
      ];
      if (!asset) continue;
      const layer: EquipmentPreviewLayer = {
        fillName: item.fillName,
        mode: item.preview.mode,
        asset,
        offset: item.preview.placement
          ? { x: item.preview.placement.x, y: item.preview.placement.y }
          : { x: 0, y: 0 },
        ...(item.preview.selectedFrame === undefined ? {} : { selectedFrame: item.preview.selectedFrame }),
      };
      const duplicate = layers.findIndex((existing) => existing.asset.key === asset.key);
      if (duplicate >= 0) layers[duplicate] = layer;
      else layers.push(layer);
    }
  }
  return layers;
}

export function equipmentPreviewPreservesOriginalDefect(fillName: string): boolean {
  const item = EquipmentVisualCatalog[fillName];
  return fillName === 'fmtstx' ? item?.icon.status === 'known-broken-original-lookup'
    : fillName === 'mksddf' && (item?.preview.resources?.length ?? 0) === 1
      && item?.preview.resources?.[0]?.status !== 'located';
}

export function getEquipmentPreviewAssetsForItems(
  heroId: number,
  fillNames: readonly string[],
): readonly EquipmentPreviewAssetDefinition[] {
  const assets = new Map<string, EquipmentPreviewAssetDefinition>();
  for (const fillName of fillNames) {
    const item = EquipmentVisualCatalog[fillName];
    if (!item || (item.preview.mode !== 'title-overlay' && item.preview.role !== heroId)) continue;
    for (const resource of item.preview.resources ?? []) {
      if (resource.status !== 'located') continue;
      const asset = EquipmentPreviewAssetCatalog[
        getEquipmentPreviewAssetKey(resource.sourcePackage, resource.characterId)
      ];
      if (asset) assets.set(asset.key, asset);
    }
  }
  return [...assets.values()];
}
