import {
  combatHudAssets,
  craftingAssets,
  fullFeatureUiAssets,
  getSkillNativeHeroUiAssets,
  heavenMapAssets,
  immortalityUiAssets,
  levelResultAssets,
  pickupAssets,
  role1CombatAtlases,
  role1NormalAttackAssets,
  role1SkillVisualAssets,
  role2CombatAtlases,
  role2NormalAttackAssets,
  role2SkillVisualAssets,
  role3CombatAtlases,
  role3NormalAttackAssets,
  role3ShieldBuffAsset,
  role3SkillVisualAssets,
  role4BodyFamilyAssets,
  role4MdsBombAsset,
  role4NormalAttackAssets,
  role4SkillVisualAssets,
  role4SpeedUpAsset,
  role5NormalAttackAssets,
  role5SkillVisualAssets,
  role5SpearBodyFamilyAssets,
  role5SwordBodyAssets,
  savePartyAssets,
  saveSlotAssets,
  scaffoldAssets,
  settingsUiAssets,
  stageFeatureEntryButtonAssets,
  stageSettingsAssets,
  taskUiAssets,
  shopUiAssets,
  skillNativeUiCommonAssets,
  stage11Assets,
  stage11MonsterAtlases,
  stage11MonsterAttackAssets,
  stage12MonsterAtlases,
  stage12MonsterAttackAssets,
  Stage11MonsterAssetKeys,
  Stage12MonsterAssetKeys,
  stage12Assets,
  stage13Assets,
  stage13Monster5Atlas,
  stage13Monster5AttackAssets,
  Stage13MonsterAssetKeys,
  stage21Assets,
  stage21AttackAssets,
  stage21MonsterAtlases,
  Stage21MonsterAssetKeys,
  stage22Assets,
  stage22Monster16Atlas,
  stage22Monster16AttackAssets,
  Stage22AssetKeys,
} from './AssetManifest';
import { inventoryItemAssets } from './InventoryItemAssets';
import { inventoryUiAssetList } from './InventoryUiAssets';

export type AssetBundleId =
  | 'shell'
  | 'save-party'
  | 'heaven-map'
  | 'inventory-items-immortality'
  | 'map-service-immortality'
  | 'inventory-items-shop'
  | 'map-service-shop'
  | 'map-service-tasks'
  | 'feature-ui'
  | 'feature-ui-backpack'
  | 'feature-ui-skills-common'
  | 'feature-ui-skills-hero-1'
  | 'feature-ui-skills-hero-2'
  | 'feature-ui-skills-hero-3'
  | 'feature-ui-skills-hero-4'
  | 'feature-ui-skills-hero-5'
  | 'feature-ui-pets'
  | 'feature-ui-workshop'
  | 'feature-ui-magic-weapon'
  | 'combat-common'
  | 'combat-hero-1'
  | 'combat-hero-2'
  | 'combat-hero-3'
  | 'combat-hero-4'
  | 'combat-hero-5'
  | 'combat-hero-1-skills'
  | 'combat-hero-2-skills'
  | 'combat-hero-3-skills'
  | 'combat-hero-4-skills'
  | 'combat-hero-5-skills'
  | 'stage-1-common'
  | 'stage-1-monsters-11'
  | 'stage-1-monsters-12'
  | 'stage-1-monsters-13'
  | 'stage-2-common'
  | 'stage-2-monsters'
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
const heavenMapBundleAssets = [
  ...Object.values(heavenMapAssets).map(svg),
  svg(settingsUiAssets.root),
  ...Object.values(settingsUiAssets.close).map(svg),
];
const immortalityPillFillNames = new Set(
  ['wpsmd', 'wpmfd', 'wpbjd', 'wphxd', 'wphld']
    .flatMap((prefix) => Array.from({ length: 5 }, (_, index) => `${prefix}${index + 1}`)),
);
const immortalityPillAssets = [...immortalityPillFillNames]
  .map((fillName) => image(inventoryItemAssets[fillName]!));
const immortalityBundleAssets = [
  svg(immortalityUiAssets.root),
  svg(immortalityUiAssets.exchange),
  ...Object.values(immortalityUiAssets.buttons).flatMap((button) =>
    Object.values(button).map(image)),
  ...Object.values(immortalityUiAssets.owners).flatMap((owner) =>
    Object.values(owner).map(svg)),
];
const shopItemFillNames = [
  'wpqhs1', 'wpqhs2', 'wpqhs3', 'wpqhs4', 'sms2', 'sms3', 'mfs2', 'mfs3',
  'gjs2', 'gjs3', 'fys2', 'fys3', 'wphlz', 'wpslz', 'wptlz', 'wpllz', 'wpflz',
  'wpxyf', 'wpbdf', 'wpcsd', 'wphhd', 'cwjnxld', 'cwzzxld', 'djyys', 'ptnmwsz',
  'ptzlwsz', 'ptsmsrsz', 'ptttzssz', 'lzysz', 'hzysz', 'mrsz', 'bssz', 'jtl',
  'zylhys', 'mpyj', 'css6', 'css12', 'css18', 'css24', 'css_2', 'css_3', 'css_4',
  'wwdgl', 'yll', 'wplwl', 'wpbsz', 'ttlpsp1', 'ttlpsp2', 'ttlpsp3',
] as const;
const shopItemAssets = shopItemFillNames.map((fillName) => image(inventoryItemAssets[fillName]!));
const shopBundleAssets = [
  svg(shopUiAssets.root),
  svg(shopUiAssets.card),
  svg(shopUiAssets.confirm),
  ...Object.values(shopUiAssets.buttons).flatMap((button) =>
    Object.values(button).map(image)),
];
const taskBundleAssets = [
  svg(taskUiAssets.root),
  ...Object.values(taskUiAssets.daily).map(svg),
  ...Object.values(taskUiAssets.activity).map(svg),
  ...Object.values(taskUiAssets.claim).map(svg),
  ...Object.values(taskUiAssets.tile).map(svg),
  svg(taskUiAssets.awardCell),
  image(taskUiAssets.received),
  ...Object.values(taskUiAssets.buttons).flatMap((button) => Object.values(button).map(svg)),
  ...Object.values(taskUiAssets.rewards).map(image),
];
const skillBaseAssets = [
  fullFeatureUiAssets.skillHub,
  fullFeatureUiAssets.skillActive,
  fullFeatureUiAssets.skillBind,
  fullFeatureUiAssets.skillPassive,
].map((asset) => asset.path.includes('/skills/native/base/') ? image(asset) : svg(asset));
const skillCommonAssets = [
  ...skillBaseAssets,
  ...skillNativeUiCommonAssets.map(svg),
];
const role1CombatBundleAssets = [
  ...Object.values(role1NormalAttackAssets).flatMap(images),
  ...[role1CombatAtlases.body, role1CombatAtlases.equipment].map((asset) => ({
    kind: 'spritesheet' as const,
    key: asset.key,
    path: asset.path,
    frameWidth: asset.cellWidth,
    frameHeight: asset.cellHeight,
  })),
];
const role1CombatSkillBundleAssets = [
  {
    kind: 'spritesheet' as const,
    key: role1CombatAtlases.shadow.key,
    path: role1CombatAtlases.shadow.path,
    frameWidth: role1CombatAtlases.shadow.cellWidth,
    frameHeight: role1CombatAtlases.shadow.cellHeight,
  },
  ...Object.values(role1SkillVisualAssets).flatMap(images),
];
const role2CombatBundleAssets = [
  ...Object.values(role2NormalAttackAssets).flatMap(images),
  ...[role2CombatAtlases.body, role2CombatAtlases.equipment].map((asset) => ({
    kind: 'spritesheet' as const,
    key: asset.key,
    path: asset.path,
    frameWidth: asset.cellWidth,
    frameHeight: asset.cellHeight,
  })),
  image(combatHudAssets.role2Portrait),
];
const role2CombatSkillBundleAssets = [
  {
    kind: 'spritesheet' as const,
    key: role2CombatAtlases.shadow.key,
    path: role2CombatAtlases.shadow.path,
    frameWidth: role2CombatAtlases.shadow.cellWidth,
    frameHeight: role2CombatAtlases.shadow.cellHeight,
  },
  ...Object.values(role2SkillVisualAssets).flatMap(images),
];
const role3CombatBundleAssets = [
  ...Object.values(role3NormalAttackAssets).flatMap(images),
  ...Object.values(role3CombatAtlases).map((asset) => ({
    kind: 'spritesheet' as const,
    key: asset.key,
    path: asset.path,
    frameWidth: asset.cellWidth,
    frameHeight: asset.cellHeight,
  })),
  image(combatHudAssets.role3Portrait),
];
const role3CombatSkillBundleAssets = [
  ...Object.values(role3SkillVisualAssets).flatMap(images),
  ...images(role3ShieldBuffAsset),
];
const role4CombatBundleAssets = [
  ...Object.values(role4NormalAttackAssets).flatMap(svgs),
  ...[
    role4BodyFamilyAssets.shovel0,
    role4BodyFamilyAssets.arrow0,
    role4BodyFamilyAssets.equipment0,
    role4BodyFamilyAssets.equipment4,
  ].map((asset) => ({
    kind: 'spritesheet' as const,
    key: asset.key,
    path: asset.path,
    frameWidth: asset.cellWidth,
    frameHeight: asset.cellHeight,
  })),
  image(combatHudAssets.role4Portrait),
];
const role4CombatSkillBundleAssets = [
  ...Object.values(role4SkillVisualAssets).flatMap((asset) =>
    asset.framePaths[0]?.endsWith('.svg') ? svgs(asset) : images(asset)),
  ...svgs(role4MdsBombAsset),
  ...svgs(role4SpeedUpAsset),
];
const role5CombatBundleAssets = [
  ...Object.values(role5NormalAttackAssets).flatMap(svgs),
  ...[
    role5SpearBodyFamilyAssets.body0,
    role5SpearBodyFamilyAssets.equipment0,
  ].map((asset) => ({
    kind: 'spritesheet' as const,
    key: asset.key,
    path: asset.path,
    frameWidth: asset.cellWidth,
    frameHeight: asset.cellHeight,
  })),
  ...Object.values(role5SwordBodyAssets).flatMap(svgs),
  image(combatHudAssets.role5Portrait),
];
const role5CombatSkillBundleAssets = Object.values(role5SkillVisualAssets).flatMap(svgs);
const combatCommonAssets = [
  ...Object.values(scaffoldAssets).map(svg),
  ...Object.values(levelResultAssets).map(image),
  svg(combatHudAssets.roleInfo),
  svg(combatHudAssets.bossBlood),
  ...Object.values(stageFeatureEntryButtonAssets).flatMap((states) =>
    Object.values(states).map(image)),
  image(stageSettingsAssets.root),
  ...stageSettingsAssets.helpFrames.map(image),
  ...stageSettingsAssets.spawnSpeedFrames.map(image),
  ...Object.values(stageSettingsAssets.buttons).flatMap((states) =>
    Object.values(states).map(image)),
  ...Object.values(stageSettingsAssets.helpButtons).flatMap((states) =>
    Object.values(states).map(image)),
  ...Object.values(pickupAssets).flatMap((asset) =>
    'framePaths' in asset ? images(asset) : [image(asset)]),
];
const stage11BundleAssets = Object.entries(stage11Assets)
  .filter(([name]) => name !== 'floor')
  .flatMap(([, asset]) => 'framePaths' in asset ? images(asset) : [image(asset)]);
const stage11MonsterBundleAssets = [
  ...Object.values(stage11MonsterAtlases).map((asset) => ({
    kind: 'spritesheet' as const,
    key: asset.key,
    path: asset.path,
    frameWidth: asset.cellWidth,
    frameHeight: asset.cellHeight,
  })),
  ...Object.values(stage11MonsterAttackAssets).flatMap(images),
  {
    kind: 'text' as const,
    key: Stage11MonsterAssetKeys.attackGeometry,
    path: '/assets/stage1/monsters/attack-frame-geometry.csv',
  },
];
const stage12MonsterBundleAssets = [
  ...Object.values(stage12MonsterAtlases).map((asset) => ({
    kind: 'spritesheet' as const,
    key: asset.key,
    path: asset.path,
    frameWidth: asset.cellWidth,
    frameHeight: asset.cellHeight,
  })),
  ...Object.values(stage12MonsterAttackAssets).flatMap(images),
  {
    kind: 'text' as const,
    key: Stage12MonsterAssetKeys.attackGeometry,
    path: '/assets/stage1/monsters/attack-frame-geometry.csv',
  },
];
const stage13MonsterBundleAssets = [
  {
    kind: 'spritesheet' as const,
    key: stage13Monster5Atlas.key,
    path: stage13Monster5Atlas.path,
    frameWidth: stage13Monster5Atlas.cellWidth,
    frameHeight: stage13Monster5Atlas.cellHeight,
  },
  ...Object.values(stage13Monster5AttackAssets).flatMap(images),
  {
    kind: 'text' as const,
    key: Stage13MonsterAssetKeys.attackGeometry,
    path: '/assets/stage1/monsters/attack-frame-geometry.csv',
  },
];
const stage12BundleAssets = Object.values(stage12Assets).flatMap((asset) =>
  'framePaths' in asset ? images(asset) : [image(asset)]);
const stage13BundleAssets = Object.values(stage13Assets).map(image);
const sharedStage2MonsterAssets = [
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
const stage21BundleAssets = [
  ...Object.entries(stage21Assets)
    .filter(([name]) => name !== 'floor')
    .flatMap(([, asset]) => 'framePaths' in asset ? images(asset) : [image(asset)]),
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
  'inventory-items-immortality': {
    dependencies: [],
    assets: immortalityPillAssets,
  },
  'map-service-immortality': {
    dependencies: ['shell', 'inventory-items-immortality'],
    assets: immortalityBundleAssets,
  },
  'inventory-items-shop': {
    dependencies: [],
    assets: shopItemAssets,
  },
  'map-service-shop': {
    dependencies: ['shell', 'inventory-items-shop', 'feature-ui'],
    assets: shopBundleAssets,
  },
  'map-service-tasks': {
    dependencies: ['shell', 'heaven-map', 'feature-ui-backpack'],
    assets: taskBundleAssets,
  },
  'feature-ui': {
    dependencies: [],
    assets: [
      image(fullFeatureUiAssets.soulBadge),
      svg(fullFeatureUiAssets.soulDigits),
    ],
  },
  'feature-ui-backpack': {
    dependencies: [
      'feature-ui',
      'inventory-items-immortality',
      'inventory-items-shop',
      'combat-hero-1',
      'combat-hero-2',
      'combat-hero-3',
      'combat-hero-4',
      'combat-hero-5',
    ],
    assets: [
      svg(fullFeatureUiAssets.backpack),
      svg(fullFeatureUiAssets.backpackGrid),
      ...inventoryUiAssetList.map(image),
      ...Object.entries(inventoryItemAssets)
        .filter(([fillName]) =>
          !immortalityPillFillNames.has(fillName)
          && !shopItemFillNames.includes(fillName as typeof shopItemFillNames[number]))
        .map(([, asset]) => image(asset)),
    ],
  },
  'feature-ui-skills-common': {
    dependencies: ['feature-ui'],
    assets: skillCommonAssets,
  },
  'feature-ui-skills-hero-1': {
    dependencies: ['feature-ui-skills-common'],
    assets: getSkillNativeHeroUiAssets(1).map(svg),
  },
  'feature-ui-skills-hero-2': {
    dependencies: ['feature-ui-skills-common'],
    assets: getSkillNativeHeroUiAssets(2).map(svg),
  },
  'feature-ui-skills-hero-3': {
    dependencies: ['feature-ui-skills-common'],
    assets: getSkillNativeHeroUiAssets(3).map(svg),
  },
  'feature-ui-skills-hero-4': {
    dependencies: ['feature-ui-skills-common'],
    assets: getSkillNativeHeroUiAssets(4).map(svg),
  },
  'feature-ui-skills-hero-5': {
    dependencies: ['feature-ui-skills-common'],
    assets: getSkillNativeHeroUiAssets(5).map(svg),
  },
  'feature-ui-pets': {
    dependencies: ['feature-ui'],
    assets: [svg(fullFeatureUiAssets.petPage)],
  },
  'feature-ui-workshop': {
    dependencies: ['feature-ui-backpack'],
    assets: Object.values(craftingAssets).map(image),
  },
  'feature-ui-magic-weapon': {
    dependencies: ['feature-ui'],
    assets: [svg(fullFeatureUiAssets.magicWeaponPage)],
  },
  'combat-common': {
    dependencies: [],
    assets: combatCommonAssets,
  },
  'combat-hero-1': {
    dependencies: [],
    assets: role1CombatBundleAssets,
  },
  'combat-hero-2': {
    dependencies: [],
    assets: role2CombatBundleAssets,
  },
  'combat-hero-3': {
    dependencies: [],
    assets: role3CombatBundleAssets,
  },
  'combat-hero-4': {
    dependencies: [],
    assets: role4CombatBundleAssets,
  },
  'combat-hero-5': {
    dependencies: [],
    assets: role5CombatBundleAssets,
  },
  'combat-hero-1-skills': {
    dependencies: ['combat-hero-1'],
    assets: role1CombatSkillBundleAssets,
  },
  'combat-hero-2-skills': {
    dependencies: ['combat-hero-2'],
    assets: role2CombatSkillBundleAssets,
  },
  'combat-hero-3-skills': {
    dependencies: ['combat-hero-3'],
    assets: role3CombatSkillBundleAssets,
  },
  'combat-hero-4-skills': {
    dependencies: ['combat-hero-4'],
    assets: role4CombatSkillBundleAssets,
  },
  'combat-hero-5-skills': {
    dependencies: ['combat-hero-5'],
    assets: role5CombatSkillBundleAssets,
  },
  'stage-1-common': {
    dependencies: [],
    assets: [image(stage11Assets.floor)],
  },
  'stage-1-monsters-11': {
    dependencies: [],
    assets: stage11MonsterBundleAssets,
  },
  'stage-1-monsters-12': {
    dependencies: [],
    assets: stage12MonsterBundleAssets,
  },
  'stage-1-monsters-13': {
    dependencies: [],
    assets: stage13MonsterBundleAssets,
  },
  'stage-2-common': {
    dependencies: [],
    assets: [image(stage21Assets.floor)],
  },
  'stage-2-monsters': {
    dependencies: [],
    assets: sharedStage2MonsterAssets,
  },
  'stage-11': {
    dependencies: ['combat-common', 'stage-1-common', 'stage-1-monsters-11'],
    assets: stage11BundleAssets,
  },
  'stage-12': {
    dependencies: ['combat-common', 'stage-1-common', 'stage-1-monsters-12'],
    assets: stage12BundleAssets,
  },
  'stage-13': {
    dependencies: [
      'combat-common',
      'stage-1-common',
      'stage-1-monsters-11',
      'stage-1-monsters-12',
      'stage-1-monsters-13',
    ],
    assets: stage13BundleAssets,
  },
  'stage-21': {
    dependencies: ['combat-common', 'stage-2-common', 'stage-2-monsters'],
    assets: stage21BundleAssets,
  },
  'stage-22': {
    dependencies: ['combat-common', 'stage-2-common', 'stage-2-monsters'],
    assets: stage22BundleAssets,
  },
} as const satisfies Record<AssetBundleId, SceneAssetBundleDefinition>;

export const sceneBundleBySceneKey = {
  SaveSlotScene: 'shell',
  HeavenMapScene: 'heaven-map',
  ImmortalityScene: 'map-service-immortality',
  ShopScene: 'map-service-shop',
  TaskScene: 'map-service-tasks',
  FeatureUiScene: 'feature-ui',
  EquipmentPageQaScene: 'feature-ui-backpack',
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

export function getHeroCombatAssetBundleIds(heroIds: readonly number[]): AssetBundleId[] {
  return [...new Set(heroIds.map((heroId) => {
    if (!Number.isInteger(heroId) || heroId < 1 || heroId > 5) {
      throw new RangeError('Combat hero bundle requires hero ids from 1 to 5.');
    }
    return `combat-hero-${heroId}` as AssetBundleId;
  }))];
}

export function getHeroCombatSkillAssetBundleIds(heroIds: readonly number[]): AssetBundleId[] {
  return getHeroCombatAssetBundleIds(heroIds).map(
    (bundleId) => `${bundleId}-skills` as AssetBundleId,
  );
}

export function getFeatureUiAssetBundleId(
  page: 'backpack' | 'skills' | 'pets' | 'workshop' | 'magic-weapon',
  heroId?: number,
): AssetBundleId {
  if (page === 'skills') {
    if (!Number.isInteger(heroId) || heroId! < 1 || heroId! > 5) {
      throw new RangeError('Skills bundle requires a hero id from 1 to 5.');
    }
    return `feature-ui-skills-hero-${heroId}` as AssetBundleId;
  }
  if (page === 'backpack') return 'feature-ui-backpack';
  if (page === 'pets') return 'feature-ui-pets';
  if (page === 'workshop') return 'feature-ui-workshop';
  return 'feature-ui-magic-weapon';
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
