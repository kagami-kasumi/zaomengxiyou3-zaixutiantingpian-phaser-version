import {
  Monster5AssetKeys,
  Monster16AssetKeys,
  MonsterFamily2478AssetKeys,
  MonsterFamily330AssetKeys,
  MonsterFamily691019AssetKeys,
  monster5Atlas,
  monster5AttackAssets,
  monster16Atlas,
  monster16AttackAssets,
  monsterFamily2478Atlases,
  monsterFamily2478AttackAssets,
  monsterFamily330Atlases,
  monsterFamily330AttackAssets,
  monsterFamily691019Atlases,
  monsterFamily691019AttackAssets,
  type MonsterAtlasAssetDefinition,
  type MonsterAttackAssetDefinition,
} from './AssetManifest';

export {
  Monster5AssetKeys,
  Monster16AssetKeys,
  MonsterFamily2478AssetKeys,
  MonsterFamily330AssetKeys,
  MonsterFamily691019AssetKeys,
  monster5Atlas,
  monster5AttackAssets,
  monster16Atlas,
  monster16AttackAssets,
  monsterFamily2478Atlases,
  monsterFamily2478AttackAssets,
  monsterFamily330Atlases,
  monsterFamily330AttackAssets,
  monsterFamily691019Atlases,
  monsterFamily691019AttackAssets,
};

export type MonsterResourceId = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 16 | 19 | 30;

export type MonsterResourceFamilyId =
  | 'monster-family-2-4-7-8'
  | 'monster-family-3-30'
  | 'monster-5'
  | 'monster-family-6-9-10-19'
  | 'monster-16';

type MonsterResourceFamily = Readonly<{
  monsterIds: readonly MonsterResourceId[];
  atlases: Readonly<Record<string, MonsterAtlasAssetDefinition>>;
  attacks: Readonly<Record<string, MonsterAttackAssetDefinition>>;
  attackAssetKind: 'image' | 'svg';
  geometry: Readonly<{ key: string; path: string }>;
}>;

export const monsterResourceFamilies = {
  'monster-family-2-4-7-8': {
    monsterIds: [2, 4, 7, 8],
    atlases: monsterFamily2478Atlases,
    attacks: monsterFamily2478AttackAssets,
    attackAssetKind: 'image',
    geometry: {
      key: MonsterFamily2478AssetKeys.attackGeometry,
      path: '/assets/monsters/family-2-4-7-8/attack-frame-geometry.csv',
    },
  },
  'monster-family-3-30': {
    monsterIds: [3, 30],
    atlases: monsterFamily330Atlases,
    attacks: monsterFamily330AttackAssets,
    attackAssetKind: 'image',
    geometry: {
      key: MonsterFamily330AssetKeys.attackGeometry,
      path: '/assets/monsters/family-3-30/attack-frame-geometry.csv',
    },
  },
  'monster-5': {
    monsterIds: [5],
    atlases: { monster5: monster5Atlas },
    attacks: monster5AttackAssets,
    attackAssetKind: 'image',
    geometry: {
      key: Monster5AssetKeys.attackGeometry,
      path: '/assets/monsters/monster-5/attack-frame-geometry.csv',
    },
  },
  'monster-family-6-9-10-19': {
    monsterIds: [6, 9, 10, 19],
    atlases: monsterFamily691019Atlases,
    attacks: monsterFamily691019AttackAssets,
    attackAssetKind: 'image',
    geometry: {
      key: MonsterFamily691019AssetKeys.attackGeometry,
      path: '/assets/monsters/family-6-9-10-19/attack-frame-geometry.csv',
    },
  },
  'monster-16': {
    monsterIds: [16],
    atlases: { monster16: monster16Atlas },
    attacks: monster16AttackAssets,
    attackAssetKind: 'svg',
    geometry: {
      key: Monster16AssetKeys.attackGeometry,
      path: '/assets/monsters/monster-16/attack-frame-geometry.csv',
    },
  },
} as const satisfies Readonly<Record<MonsterResourceFamilyId, MonsterResourceFamily>>;

export const monsterResourceCatalog = Object.fromEntries(
  Object.entries(monsterResourceFamilies).flatMap(([familyId, family]) =>
    family.monsterIds.map((monsterId) => [monsterId, { familyId }] as const)),
) as Readonly<Record<MonsterResourceId, Readonly<{ familyId: MonsterResourceFamilyId }>>>;

export function getMonsterResourceFamilyId(monsterId: MonsterResourceId): MonsterResourceFamilyId {
  return monsterResourceCatalog[monsterId].familyId;
}
