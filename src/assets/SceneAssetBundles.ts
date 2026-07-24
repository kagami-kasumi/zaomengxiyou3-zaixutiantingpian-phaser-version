import {
  combatHudAssets,
  craftingAssets,
  fullFeatureUiAssets,
  heavenMapAssets,
  pickupAssets,
  role1NormalAttackAssets,
  savePartyAssets,
  saveSlotAssets,
  scaffoldAssets,
  skillNativeUiAssets,
  stage11Assets,
  stage12Assets,
  stage13Assets,
  stage21Assets,
  stage21AttackAssets,
  stage21MonsterAtlases,
  Stage21MonsterAssetKeys,
  stage22Assets,
  stage22Monster16Atlas,
  stage22Monster16AttackAssets,
  Stage22AssetKeys,
} from './AssetManifest';

export type AssetBundleId =
  | 'shell'
  | 'save-party'
  | 'heaven-map'
  | 'feature-ui'
  | 'combat-common'
  | 'stage-1-common'
  | 'stage-2-common'
  | 'stage-11'
  | 'stage-12'
  | 'stage-13'
  | 'stage-21'
  | 'stage-22';

export type BundleAssetDefinition =
  | Readonly<{ kind: 'image' | 'svg' | 'text'; key: string; path: string }>
  | Readonly<{
    kind: 'spritesheet';
    key: string;
    path: string;
    frameWidth: number;
    frameHeight: number;
  }>;

export type SceneAssetBundleDefinition = Readonly<{
  dependencies: readonly AssetBundleId[];
  assets: readonly BundleAssetDefinition[];
}>;

type SingleAsset = Readonly<{ key: string; path: string }>;
type FrameSequenceAsset = Readonly<{
  frameKeys: readonly string[];
  framePaths: readonly string[];
}>;

const image = (asset: SingleAsset): BundleAssetDefinition => ({
  kind: 'image',
  key: asset.key,
  path: asset.path,
});

const svg = (asset: SingleAsset): BundleAssetDefinition => ({
  kind: 'svg',
  key: asset.key,
  path: asset.path,
});

const images = (asset: FrameSequenceAsset): readonly BundleAssetDefinition[] =>
  asset.frameKeys.map((key, index) => ({
    kind: 'image',
    key,
    path: asset.framePaths[index]!,
  }));

const svgs = (asset: FrameSequenceAsset): readonly BundleAssetDefinition[] =>
  asset.frameKeys.map((key, index) => ({
    kind: 'svg',
    key,
    path: asset.framePaths[index]!,
  }));

const shellAssets = Object.values(saveSlotAssets).map(svg);
const savePartyBundleAssets = Object.values(savePartyAssets).map(image);
const heavenMapBundleAssets = Object.values(heavenMapAssets).map(svg);
const featureUiAssets = [
  ...Object.values(craftingAssets).map(image),
  ...Object.values(fullFeatureUiAssets).map((asset) =>
    asset.path.includes('/skills/native/base/') ? image(asset) : svg(asset)),
  ...skillNativeUiAssets.map(svg),
];
const combatCommonAssets = [
  ...Object.values(scaffoldAssets).map(svg),
  ...Object.values(role1NormalAttackAssets).flatMap(images),
  ...Object.values(combatHudAssets).map(svg),
  ...Object.values(pickupAssets).flatMap((asset) =>
    'framePaths' in asset ? images(asset) : [image(asset)]),
];
const stage11BundleAssets = Object.entries(stage11Assets)
  .filter(([name]) => name !== 'floor')
  .map(([, asset]) => image(asset));
const stage12BundleAssets = Object.values(stage12Assets).flatMap((asset) =>
  'framePaths' in asset ? images(asset) : [image(asset)]);
const stage13BundleAssets = Object.values(stage13Assets).map(image);
const stage21BundleAssets = [
  ...Object.entries(stage21Assets)
    .filter(([name]) => name !== 'floor')
    .flatMap(([, asset]) => 'framePaths' in asset ? images(asset) : [image(asset)]),
  ...Object.values(stage21MonsterAtlases).map((asset) => ({
    kind: 'spritesheet' as const,
    key: asset.key,
    path: asset.path,
    frameWidth: asset.cellWidth,
    frameHeight: asset.cellHeight,
  })),
  ...Object.values(stage21AttackAssets).flatMap(images),
  {
    kind: 'text' as const,
    key: Stage21MonsterAssetKeys.attackGeometry,
    path: '/assets/stage21/bullet-frame-geometry.csv',
  },
];
const stage22BundleAssets = [
  ...Object.entries(stage22Assets)
    .filter(([name]) => name !== 'floor')
    .flatMap(([, asset]) => 'framePaths' in asset ? svgs(asset) : [svg(asset)]),
  {
    kind: 'spritesheet' as const,
    key: stage22Monster16Atlas.key,
    path: stage22Monster16Atlas.path,
    frameWidth: stage22Monster16Atlas.cellWidth,
    frameHeight: stage22Monster16Atlas.cellHeight,
  },
  ...Object.values(stage22Monster16AttackAssets).flatMap(svgs),
  {
    kind: 'text' as const,
    key: Stage22AssetKeys.monster16AttackGeometry,
    path: '/assets/stage22/monster16/bullet-frame-geometry.csv',
  },
];

export const sceneAssetBundles = {
  shell: {
    dependencies: [],
    assets: shellAssets,
  },
  'save-party': {
    dependencies: ['shell'],
    assets: savePartyBundleAssets,
  },
  'heaven-map': {
    dependencies: ['shell'],
    assets: heavenMapBundleAssets,
  },
  'feature-ui': {
    dependencies: [],
    assets: featureUiAssets,
  },
  'combat-common': {
    dependencies: [],
    assets: combatCommonAssets,
  },
  'stage-1-common': {
    dependencies: [],
    assets: [image(stage11Assets.floor)],
  },
  'stage-2-common': {
    dependencies: [],
    assets: [image(stage21Assets.floor)],
  },
  'stage-11': {
    dependencies: ['combat-common', 'stage-1-common'],
    assets: stage11BundleAssets,
  },
  'stage-12': {
    dependencies: ['combat-common', 'stage-1-common'],
    assets: stage12BundleAssets,
  },
  'stage-13': {
    dependencies: ['combat-common', 'stage-1-common'],
    assets: stage13BundleAssets,
  },
  'stage-21': {
    dependencies: ['combat-common', 'stage-2-common'],
    assets: stage21BundleAssets,
  },
  'stage-22': {
    dependencies: ['combat-common', 'stage-2-common'],
    assets: stage22BundleAssets,
  },
} as const satisfies Record<AssetBundleId, SceneAssetBundleDefinition>;

export const sceneBundleBySceneKey = {
  SaveSlotScene: 'shell',
  HeavenMapScene: 'heaven-map',
  FeatureUiScene: 'feature-ui',
  TestScene: 'stage-11',
  Stage12Scene: 'stage-12',
  Stage13Scene: 'stage-13',
  Stage21Scene: 'stage-21',
  Stage22Scene: 'stage-22',
  Stage22DevScene: 'stage-22',
} as const satisfies Readonly<Record<string, AssetBundleId>>;

export function getSceneAssetBundleId(sceneKey: string): AssetBundleId | undefined {
  return sceneBundleBySceneKey[sceneKey as keyof typeof sceneBundleBySceneKey];
}

export function validateSceneAssetBundles(
  catalog: Readonly<Record<string, SceneAssetBundleDefinition>> = sceneAssetBundles,
): ReadonlyMap<string, string> {
  const owners = new Map<string, string>();
  for (const [bundleId, bundle] of Object.entries(catalog)) {
    for (const dependency of bundle.dependencies) {
      if (!(dependency in catalog)) {
        throw new Error(`Asset bundle "${bundleId}" has unknown dependency "${dependency}".`);
      }
    }
    for (const asset of bundle.assets) {
      const previousOwner = owners.get(asset.key);
      if (previousOwner) {
        throw new Error(
          `Runtime asset "${asset.key}" has multiple bundle owners: "${previousOwner}" and "${bundleId}".`,
        );
      }
      owners.set(asset.key, bundleId);
    }
  }
  return owners;
}

export const runtimeAssetBundleOwners = validateSceneAssetBundles();

