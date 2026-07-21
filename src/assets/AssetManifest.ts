import craftingIconCatalog from '../../docs/reverse-engineering/reference/crafting-icon-catalog-1.1.json';

export type AssetStatus = 'ready' | 'placeholder' | 'missing-original';
export type AssetSourceKind = 'generated' | 'extracted-flash';

type LoadableAssetDefinition = {
  key: string;
  path: string;
  status: Exclude<AssetStatus, 'missing-original'>;
  source: AssetSourceKind;
};

type ExtractedImageAssetDefinition = LoadableAssetDefinition & {
  status: 'ready';
  source: 'extracted-flash';
  sourcePackage: string;
  sourceSymbol: string;
  sourceCharacterId: number;
};

type ExtractedStageImageAssetDefinition = ExtractedImageAssetDefinition & {
  sourceTag: string;
  derivedCharacterId?: number;
  width: number;
  height: number;
  sourceBounds: Readonly<{ width: number; height: number }>;
};

export type FrameSequenceAssetDefinition = {
  key: string;
  frameKeys: readonly string[];
  framePaths: readonly string[];
  status: 'ready';
  source: 'extracted-flash';
  sourcePackage: string;
  sourceSymbol: string;
};

type ExtractedStageSequenceAssetDefinition = FrameSequenceAssetDefinition & {
  sourceCharacterId: number;
  sourceTag: string;
  frameCount: number;
  width: number;
  height: number;
  sourceBounds: Readonly<{ width: number; height: number }>;
};

type ExtractedStage12ImageAssetDefinition = ExtractedStageImageAssetDefinition & {
  frameCount: 1;
};

type MissingSourceAssetFamily = {
  status: 'missing-original';
  sourceSymbols: readonly string[];
  notes: string;
};

export const AssetKeys = {
  playerPlaceholder: 'player-placeholder',
} as const;

export const Stage11AssetKeys = {
  floor: 'stage.stage1.floor',
  background: 'stage.stage1-1.background',
  foreground: 'stage.stage1-1.layout',
} as const;

export const Stage12AssetKeys = {
  floor: Stage11AssetKeys.floor,
  background: 'stage.stage1-2.background',
  foreground: 'stage.stage1-2.layout',
  fbEnter: 'stage.stage1-2.fb-enter',
  transferDoor: 'stage.stage1-2.transfer-door',
  transferDoorPrimary: 'stage.stage1-2.transfer-door.primary',
  transferDoorAccent: 'stage.stage1-2.transfer-door.accent',
} as const;

export const Stage13AssetKeys = {
  floor: Stage11AssetKeys.floor,
  background: 'stage.stage1-3.background',
  foreground: 'stage.stage1-3.layout',
  transferDoor: 'stage.stage1-3.transfer-door',
} as const;

const CraftingUIAssetKeys = {
  container: 'crafting-ui.container',
  fusionPanel: 'crafting-ui.fusion-panel',
  role1Unselected: 'crafting-ui.selector.role1.unselected',
  role1Selected: 'crafting-ui.selector.role1.selected',
  role2Unselected: 'crafting-ui.selector.role2.unselected',
  role2Selected: 'crafting-ui.selector.role2.selected',
  role3Unselected: 'crafting-ui.selector.role3.unselected',
  role3Selected: 'crafting-ui.selector.role3.selected',
  role4Unselected: 'crafting-ui.selector.role4.unselected',
  role4Selected: 'crafting-ui.selector.role4.selected',
  role5Unselected: 'crafting-ui.selector.role5.unselected',
  role5Selected: 'crafting-ui.selector.role5.selected',
} as const;

const integratedCraftingIconItems = craftingIconCatalog.items.filter((item) => item.integrated);

export const CraftingItemTextureKeys: Readonly<Record<string, string>> = Object.fromEntries(
  integratedCraftingIconItems.map((item) => [item.fillName, item.stableKey]),
);

export const CraftingAssetKeys = {
  ...CraftingUIAssetKeys,
  ...CraftingItemTextureKeys,
} as const;

export const HeroNormalAttackEffectKeys = {
  role1Hit1: 'normal-attack-effect.hero1.hit1',
  role1Hit3: 'normal-attack-effect.hero1.hit3',
  role1Hit4: 'normal-attack-effect.hero1.hit4',
  role1Hit5: 'normal-attack-effect.hero1.hit5',
  role2Hit1: 'normal-attack-effect.hero2.hit1',
  role2Hit2: 'normal-attack-effect.hero2.hit2',
  role3Hit1: 'normal-attack-effect.hero3.hit1',
  role3Hit2: 'normal-attack-effect.hero3.hit2',
  role3Hit3: 'normal-attack-effect.hero3.hit3',
  role4ShovelHit1: 'normal-attack-effect.hero4.shovel.hit1',
  role4ShovelHit2: 'normal-attack-effect.hero4.shovel.hit2',
  role4ShovelHit3: 'normal-attack-effect.hero4.shovel.hit3',
  role4ArrowHit1: 'normal-attack-effect.hero4.arrow.hit1',
  role4ArrowHit3: 'normal-attack-effect.hero4.arrow.hit3',
  role5SpearUnknown: 'normal-attack-effect.hero5.spear.unresolved',
  role5SwordHit1: 'normal-attack-effect.hero5.sword.hit1',
  role5SwordHit2: 'normal-attack-effect.hero5.sword.hit2',
  role5SwordHit3: 'normal-attack-effect.hero5.sword.hit3',
  role5SwordHit4: 'normal-attack-effect.hero5.sword.hit4',
  role5SwordHit5: 'normal-attack-effect.hero5.sword.hit5',
  role5SwordRunHit: 'normal-attack-effect.hero5.sword.run-hit',
} as const;

export const SkillProjectileEffectKeys = {
  role1SlzHit6: 'skill-projectile.role1.slz.hit6',
  role1HytjHit7: 'skill-projectile.role1.hytj.hit7',
  role1LyfbHit8: 'skill-projectile.role1.lyfb.hit8',
  role1LyfbHit8_2: 'skill-projectile.role1.lyfb.hit8_2',
  role1LysHit9: 'skill-projectile.role1.lys.hit9',
  role1JdyHit11_1: 'skill-projectile.role1.jdy.hit11_1',
  role1JdyHit11_2: 'skill-projectile.role1.jdy.hit11_2',
  role1QsezHit13: 'skill-projectile.role1.qsez.hit13',
  role1ZzHit14_1: 'skill-projectile.role1.zz.hit14_1',
  role1ZzHit14_2: 'skill-projectile.role1.zz.hit14_2',
  role1HmzHit10_2: 'skill-projectile.role1.hmz.hit10_2',
  role1HmzHit10_4: 'skill-projectile.role1.hmz.hit10_4',
  role1HyjjHit12: 'skill-projectile.role1.hyjj.hit12',
  role1HyjjHit12_1: 'skill-effect.role1.hyjj.hit12_1',
  role2SgqHit5: 'skill-projectile.role2.sgq.hit5',
  role2SmbHit4_1: 'skill-projectile.role2.smb.hit4_1',
  role2SmbHit4_2: 'skill-projectile.role2.smb.hit4_2',
  role2XbzHit3: 'skill-projectile.role2.xbz.hit3',
  role2MyhcHit6: 'skill-effect.role2.myhc.hit6',
  role2JgzHit7: 'skill-effect.role2.jgz.hit7',
  role2TjglHit8: 'skill-effect.role2.tjgl.hit8',
  role2JhsjHit9_1: 'skill-projectile.role2.jhsj.hit9_1',
  role2JhsjHit9_2: 'skill-projectile.role2.jhsj.hit9_2',
  role2ShyShadow: 'skill-summon.role2.shy.shadow',
  role3DjHit4: 'skill-projectile.role3.dj.hit4',
  role3SdHit5: 'skill-effect.role3.sd.hit5',
  role3ZznhHit6: 'skill-effect.role3.zznh.hit6',
  role3SyzqHit7_1: 'skill-effect.role3.syzq.hit7_1',
  role3SyzqHit7_2: 'skill-projectile.role3.syzq.hit7_2',
  role3SspHit8_1: 'skill-effect.role3.ssp.hit8_1',
  role3SspHit8_2: 'skill-effect.role3.ssp.hit8_2',
  role3JspHit9: 'skill-effect.role3.jsp.hit9',
  role3DgqHit10: 'skill-projectile.role3.dgq.hit10',
  role3XgqHit11Cast: 'skill-effect.role3.xgq.hit11-cast',
  role3XgqHit11: 'skill-projectile.role3.xgq.hit11',
  role3TmcHit12_1: 'skill-effect.role3.tmc.hit12_1',
  role3TmcHit12_2: 'skill-projectile.role3.tmc.hit12_2',
  role4ZqShovelHit4: 'skill-projectile.role4.zq.shovel.hit4',
  role4ZqArrowHit4: 'skill-projectile.role4.zq.arrow.hit4',
  role4JdzHit7_1: 'skill-effect.role4.jdz.hit7_1',
  role4JdzHit7_2: 'skill-projectile.role4.jdz.hit7_2',
  role4WdwwHit5: 'skill-effect.role4.wdww.hit5',
  role4WdwwDoll: 'skill-summon.role4.wdww.doll',
  role4MbyjHit6: 'skill-projectile.role4.mbyj.hit6',
  role4QljShovelHit8: 'skill-projectile.role4.qlj.shovel.hit8',
  role4QljArrowHit8_1: 'skill-effect.role4.qlj.arrow.hit8-1',
  role4QljArrowHit8_2: 'skill-projectile.role4.qlj.arrow.hit8-2',
  role4TkjShovelHit9_1: 'skill-effect.role4.tkj.shovel.hit9-1',
  role4TkjShovelHit9_2: 'skill-projectile.role4.tkj.shovel.hit9-2',
  role4TkjArrowHit9_1: 'skill-effect.role4.tkj.arrow.hit9-1',
  role4TkjArrowHit9_2: 'skill-projectile.role4.tkj.arrow.hit9-2',
  role4DzjShovelHit10: 'skill-projectile.role4.dzj.shovel.hit10',
  role4DzjArrowHit10_1: 'skill-effect.role4.dzj.arrow.hit10-1',
  role4DzjArrowHit10_2: 'skill-projectile.role4.dzj.arrow.hit10-2',
  role4LybjMarker: 'skill-effect.role4.lybj.marker',
  role4MmwShovelHit12: 'skill-projectile.role4.mmw.shovel.hit12',
  role4MmwArrowHit12_1: 'skill-effect.role4.mmw.arrow.hit12-1',
  role4MmwArrowHit12_2: 'skill-projectile.role4.mmw.arrow.hit12-2',
  role4MmwArrowHit12_3: 'skill-projectile.role4.mmw.arrow.hit12-3',
  role5XlcHit6: 'skill-projectile.role5.xlc.hit6',
  role5LxuanjHit7_1: 'skill-projectile.role5.lxuanj.hit7_1',
  role5LxuanjHit8: 'skill-projectile.role5.lxuanj.hit8',
  role5YybHit9: 'skill-effect.role5.yyb.hit9',
  role5XkjzHit10: 'skill-projectile.role5.xkjz.hit10',
  role5TljHit11: 'skill-effect.role5.tlj.hit11',
  role5PkzHit24_1: 'skill-projectile.role5.pkz.hit24_1',
  role5PkzHit24_1Enhanced: 'skill-projectile.role5.pkz.hit24_1.enhanced',
  role5PkzHit24_2: 'skill-projectile.role5.pkz.hit24_2',
  role5PkzHit24_3: 'skill-projectile.role5.pkz.hit24_3',
  role5LxjHit26: 'skill-effect.role5.lxj.hit26',
  role5MlszHit29: 'skill-projectile.role5.mlsz.hit29',
  role5MlszHit29Enhanced: 'skill-projectile.role5.mlsz.hit29.enhanced',
  role5LyshCompanion: 'skill-effect.role5.lysh.companion',
  role5LyshShot: 'skill-projectile.role5.lysh.shot',
  role5JrjlCompanion: 'skill-effect.role5.jrjl.companion',
  role5JrjlShot: 'skill-projectile.role5.jrjl.shot',
} as const;

export const MagicWeaponEffectKeys = {
  magicSword2: 'magic-weapon.lxj.magic-sword2',
  magicQpj: 'magic-weapon.fbqpj.qpjeffect',
  magicPearlBullet1: 'magic-weapon.xhmt.magic-pearl-bullet1',
  magicPearlBullet2: 'magic-weapon.xhmt.magic-pearl-bullet2',
  magicPearlBullet3: 'magic-weapon.xhmt.magic-pearl-bullet3',
  magicZlHummer: 'magic-weapon.zltc.zltcskill',
  magicBigBottleBody: 'magic-weapon.qljfb.magic-big-sword',
  magicBigBottlePlatform: 'magic-weapon.qljfb.magic-big-bottle-data',
  magicSnowStart: 'magic-weapon.stlp.ling-pai-effect',
  magicSnow: 'magic-weapon.stlp.ef-snow',
} as const;

export const PetSkillEffectKeys = {
  monkey1Xj: 'pet-skill.monkey1.xj',
  monkey2Lj: 'pet-skill.monkey2.lj',
  monkey2Xj: 'pet-skill.monkey2.xj',
  monkey3Lyq: 'pet-skill.monkey3.lyq',
  monkey3Xj: 'pet-skill.monkey3.xj',
  monkey3Lj: 'pet-skill.monkey3.lj',
  monkey4Jgaoyi: 'pet-skill.monkey4.jgaoyi',
  horse1Sp: 'pet-skill.horse1.sp',
  horse2Bd: 'pet-skill.horse2.bd',
  horse3Bz: 'pet-skill.horse3.bz',
  horse4Tmaoyi: 'pet-skill.horse4.tmaoyi',
  horse4TmaoyiExplode: 'pet-skill.horse4.tmaoyi.explode',
  dragon1Fs: 'pet-skill.dragon1.fs',
  dragon2Sdcc: 'pet-skill.dragon2.sdcc',
  dragon3Ltwj: 'pet-skill.dragon3.ltwj',
  dragon4Qlaoyi: 'pet-skill.dragon4.qlaoyi',
  turtle1Sld: 'pet-skill.turtle1.sld',
  turtle3Sybh: 'pet-skill.turtle3.sybh',
  turtle4Xwaoyi: 'pet-skill.turtle4.xwaoyi',
  ufo1Pms: 'pet-skill.ufo1.pms',
  ufo3Kmsk: 'pet-skill.ufo3.kmsk',
  tigressHy: 'pet-skill.tigress.hy',
  tigressSxhz: 'pet-skill.tigress.sxhz',
  tigressHsqj: 'pet-skill.tigress.hsqj',
} as const;

export const scaffoldAssets = {
  playerPlaceholder: {
    key: AssetKeys.playerPlaceholder,
    path: '/assets/scaffold/player-placeholder.svg',
    status: 'placeholder',
    source: 'generated',
  },
} as const satisfies Record<string, LoadableAssetDefinition>;

export const stage11Assets = {
  floor: {
    key: Stage11AssetKeys.floor,
    path: '/assets/stage/stage1-1/floor.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/1.swf',
    sourceSymbol: 'floorBg1',
    sourceCharacterId: 1,
    sourceTag: 'DefineBitsJPEG2 tag 21',
    width: 1440,
    height: 690,
    sourceBounds: { width: 1440, height: 690 },
  },
  background: {
    key: Stage11AssetKeys.background,
    path: '/assets/stage/stage1-1/background.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/1.swf',
    sourceSymbol: 'bg11',
    sourceCharacterId: 141,
    sourceTag: 'DefineSprite tag 39, frame 1; wraps character 140 / JPEG 139',
    width: 1132,
    height: 3051,
    sourceBounds: { width: 1132, height: 3051 },
  },
  foreground: {
    key: Stage11AssetKeys.foreground,
    path: '/assets/stage/stage1-1/foreground.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/levels/level11.swf',
    sourceSymbol: 'export.gameSence.sl11 frame 1 foreground child',
    sourceCharacterId: 46,
    derivedCharacterId: 18,
    sourceTag: 'DefineSprite tag 39 / DefineShape2 tag 22',
    width: 1298,
    height: 2756,
    sourceBounds: { width: 1297.2, height: 2755.55 },
  },
} as const satisfies Record<string, ExtractedStageImageAssetDefinition>;

const stageFrameKeys = (key: string, frameCount: number): readonly string[] =>
  Array.from({ length: frameCount }, (_, index) => `${key}.frame-${String(index + 1).padStart(2, '0')}`);

const stageFramePaths = (directory: string, frameCount: number): readonly string[] =>
  Array.from({ length: frameCount }, (_, index) => `${directory}/frame-${String(index + 1).padStart(2, '0')}.png`);

export const stage12Assets = {
  background: {
    key: Stage12AssetKeys.background,
    path: '/assets/stage/stage1-2/background.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/1.swf',
    sourceSymbol: 'bg12',
    sourceCharacterId: 135,
    sourceTag: 'DefineSprite tag 39, frame 1; wraps character 134 / DefineShape2 tag 22',
    frameCount: 1,
    width: 4890,
    height: 596,
    sourceBounds: { width: 4889.65, height: 595.8 },
  },
  foreground: {
    key: Stage12AssetKeys.foreground,
    path: '/assets/stage/stage1-2/foreground.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/levels/level12.swf',
    sourceSymbol: 'export.gameSence.sl12 frame 1 foreground child',
    sourceCharacterId: 25,
    sourceTag: 'DefineShape2 tag 22',
    frameCount: 1,
    width: 5378,
    height: 96,
    sourceBounds: { width: 5377.75, height: 95.4 },
  },
  fbEnter: {
    key: Stage12AssetKeys.fbEnter,
    frameKeys: stageFrameKeys(Stage12AssetKeys.fbEnter, 30),
    framePaths: stageFramePaths('/assets/stage/stage1-2/fb-enter', 30),
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/levels/level12.swf',
    sourceSymbol: 'fbEnter / Main_fla.Timeline_47',
    sourceCharacterId: 22,
    sourceTag: 'DefineSprite tag 39',
    frameCount: 30,
    width: 1537,
    height: 184,
    sourceBounds: { width: 1536.8, height: 184 },
  },
  transferDoor: {
    key: Stage12AssetKeys.transferDoor,
    path: '/assets/stage/stage1-2/transfer-door.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/levels/level12.swf',
    sourceSymbol: 'ordinary transfer door / isTransferDoor',
    sourceCharacterId: 52,
    sourceTag: 'DefineSprite tag 39, frame 1',
    frameCount: 1,
    width: 186,
    height: 165,
    sourceBounds: { width: 185.8, height: 165 },
  },
  transferDoorPrimary: {
    key: Stage12AssetKeys.transferDoorPrimary,
    frameKeys: stageFrameKeys(Stage12AssetKeys.transferDoorPrimary, 20),
    framePaths: stageFramePaths('/assets/stage/stage1-2/transfer-door-primary', 20),
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/levels/level12.swf',
    sourceSymbol: 'ordinary transfer door primary child',
    sourceCharacterId: 48,
    sourceTag: 'DefineSprite tag 39',
    frameCount: 20,
    width: 186,
    height: 165,
    sourceBounds: { width: 185.8, height: 165 },
  },
  transferDoorAccent: {
    key: Stage12AssetKeys.transferDoorAccent,
    frameKeys: stageFrameKeys(Stage12AssetKeys.transferDoorAccent, 19),
    framePaths: stageFramePaths('/assets/stage/stage1-2/transfer-door-accent', 19),
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/levels/level12.swf',
    sourceSymbol: 'ordinary transfer door accent child',
    sourceCharacterId: 51,
    sourceTag: 'DefineSprite tag 39',
    frameCount: 19,
    width: 29,
    height: 24,
    sourceBounds: { width: 28.8, height: 23.2 },
  },
} as const satisfies {
  background: ExtractedStage12ImageAssetDefinition;
  foreground: ExtractedStage12ImageAssetDefinition;
  fbEnter: ExtractedStageSequenceAssetDefinition;
  transferDoor: ExtractedStage12ImageAssetDefinition;
  transferDoorPrimary: ExtractedStageSequenceAssetDefinition;
  transferDoorAccent: ExtractedStageSequenceAssetDefinition;
};

export const stage13Assets = {
  background: {
    key: Stage13AssetKeys.background,
    path: '/assets/stage/stage1-3/background.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/1.swf',
    sourceSymbol: 'bg13',
    sourceCharacterId: 119,
    sourceTag: 'DefineSprite frame 1; wraps character 118 / DefineShape2',
    width: 4904,
    height: 678,
    sourceBounds: { width: 4903.15, height: 677.85 },
  },
  foreground: {
    key: Stage13AssetKeys.foreground,
    path: '/assets/stage/stage1-3/foreground.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/levels/level13.swf',
    sourceSymbol: 'export.gameSence.sl13 frame 1 foreground child',
    sourceCharacterId: 13,
    sourceTag: 'DefineShape2',
    width: 5660,
    height: 95,
    sourceBounds: { width: 5659.35, height: 95 },
  },
  transferDoor: {
    key: Stage13AssetKeys.transferDoor,
    path: '/assets/stage/stage1-3/transfer-door.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/levels/level13.swf',
    sourceSymbol: 'ordinary transfer door / isTransferDoor',
    sourceCharacterId: 40,
    sourceTag: 'DefineSprite frame 1; child characters 36/39 (20/19 frames)',
    width: 196,
    height: 175,
    sourceBounds: { width: 185.8, height: 165 },
  },
} as const satisfies Record<string, ExtractedStageImageAssetDefinition>;

function extractedCraftingImage(
  key: string,
  path: string,
  sourcePackage: string,
  sourceSymbol: string,
  sourceCharacterId: number,
): ExtractedImageAssetDefinition {
  return {
    key,
    path,
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage,
    sourceSymbol,
    sourceCharacterId,
  };
}

export const craftingAssets = {
  container: extractedCraftingImage(CraftingAssetKeys.container, '/assets/ui/crafting/container.png', 'assets/backpack1.swf', 'export.strength.StrengthEquipment', 119),
  fusionPanel: extractedCraftingImage(CraftingAssetKeys.fusionPanel, '/assets/ui/crafting/fusion-panel.png', 'assets/backpack1.swf', 'export.strength.Fusion', 169),
  role1Unselected: extractedCraftingImage(CraftingAssetKeys.role1Unselected, '/assets/ui/crafting/selectors/role1-unselected.png', 'assets/OtherMat1.swf', 'export.shop.SelectWK frame 1', 218),
  role1Selected: extractedCraftingImage(CraftingAssetKeys.role1Selected, '/assets/ui/crafting/selectors/role1-selected.png', 'assets/OtherMat1.swf', 'export.shop.SelectWK frame 2', 218),
  role2Unselected: extractedCraftingImage(CraftingAssetKeys.role2Unselected, '/assets/ui/crafting/selectors/role2-unselected.png', 'assets/OtherMat1.swf', 'export.shop.SelectTS frame 1', 223),
  role2Selected: extractedCraftingImage(CraftingAssetKeys.role2Selected, '/assets/ui/crafting/selectors/role2-selected.png', 'assets/OtherMat1.swf', 'export.shop.SelectTS frame 2', 223),
  role3Unselected: extractedCraftingImage(CraftingAssetKeys.role3Unselected, '/assets/ui/crafting/selectors/role3-unselected.png', 'assets/OtherMat1.swf', 'export.shop.SelectBJ frame 1', 233),
  role3Selected: extractedCraftingImage(CraftingAssetKeys.role3Selected, '/assets/ui/crafting/selectors/role3-selected.png', 'assets/OtherMat1.swf', 'export.shop.SelectBJ frame 2', 233),
  role4Unselected: extractedCraftingImage(CraftingAssetKeys.role4Unselected, '/assets/ui/crafting/selectors/role4-unselected.png', 'assets/OtherMat1.swf', 'export.shop.SelectSS frame 1', 228),
  role4Selected: extractedCraftingImage(CraftingAssetKeys.role4Selected, '/assets/ui/crafting/selectors/role4-selected.png', 'assets/OtherMat1.swf', 'export.shop.SelectSS frame 2', 228),
  role5Unselected: extractedCraftingImage(CraftingAssetKeys.role5Unselected, '/assets/ui/crafting/selectors/role5-unselected.png', 'assets/OtherMat1.swf', 'export.shop.SelectBL frame 1', 871),
  role5Selected: extractedCraftingImage(CraftingAssetKeys.role5Selected, '/assets/ui/crafting/selectors/role5-selected.png', 'assets/OtherMat1.swf', 'export.shop.SelectBL frame 2', 871),
  ...Object.fromEntries(integratedCraftingIconItems.map((item) => {
    const source = item.requiredSymbols[0];
    if (!source?.sourcePackage || !source.symbol || !source.characterId) {
      throw new Error(`Integrated crafting icon provenance is incomplete: ${item.fillName}`);
    }
    return [item.fillName, extractedCraftingImage(
      item.stableKey,
      `/assets/ui/crafting/items/${item.fillName}.png`,
      source.sourcePackage,
      source.symbol,
      source.characterId,
    )];
  })),
} as const satisfies Record<string, ExtractedImageAssetDefinition>;

function createRole1NormalAttackFrames(symbol: string, frameCount: number) {
  const folder = symbol.replace('Role1Bullet', 'role1-bullet');
  return {
    key: HeroNormalAttackEffectKeys[`role1Hit${symbol.slice(-1)}` as keyof Pick<
      typeof HeroNormalAttackEffectKeys,
      'role1Hit1' | 'role1Hit3' | 'role1Hit4' | 'role1Hit5'
    >],
    frameKeys: Array.from({ length: frameCount }, (_, index) => `${symbol}.frame${index + 1}`),
    framePaths: Array.from(
      { length: frameCount },
      (_, index) => `/assets/combat/role1-normal-attack/${folder}/${index + 1}.png`,
    ),
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'WuKong.swf',
    sourceSymbol: symbol,
  } as const;
}

export const role1NormalAttackAssets = {
  [HeroNormalAttackEffectKeys.role1Hit1]: createRole1NormalAttackFrames('Role1Bullet1', 8),
  [HeroNormalAttackEffectKeys.role1Hit3]: createRole1NormalAttackFrames('Role1Bullet3', 11),
  [HeroNormalAttackEffectKeys.role1Hit4]: createRole1NormalAttackFrames('Role1Bullet4', 4),
  [HeroNormalAttackEffectKeys.role1Hit5]: createRole1NormalAttackFrames('Role1Bullet5', 4),
} as const satisfies Record<string, FrameSequenceAssetDefinition>;

export const sourceAssetFamilies = {
  role2To4NormalAttackEffects: {
    status: 'missing-original',
    sourceSymbols: [
      'Role2Bullet1',
      'Role2Bullet2',
      'Role3Bullet1',
      'Role3Bullet2',
      'Role3Bullet3',
      'Role4Bullet1',
      'Role4Bullet2',
      'Role4Bullet3',
      'Role4BulletArrow1',
      'Role4BulletArrow2',
    ],
    notes: 'Normal-attack attachments referenced by Role2 to Role4 but not yet exported from the restored source packages.',
  },
  role5NormalAttackAnimations: {
    status: 'missing-original',
    sourceSymbols: [
      'attack1_spear',
      'attack2_spear',
      'attack3_spear',
      'attack4_spear',
      'jumpattack_spear',
      'runattack_spear',
      'attack1_sword',
      'attack2_sword',
      'attack3_sword',
      'attack4_sword',
      'jumpattack_sword',
      'runattack_sword',
    ],
    notes: 'Role5 body animation resources loaded through the separate ZM4 resource path.',
  },
  role5NormalAttackEffects: {
    status: 'missing-original',
    sourceSymbols: [
      'Role5runattack',
      'swordhit1',
      'swordhit2',
      'swordhit3',
      'swordhit4',
      'swordhit5',
      'swordhit6',
      'swordhit1_1',
      'swordhit2_1',
      'swordhit3_1',
      'swordhit4_1',
      'swordhit5_1',
      'swordhit6_1',
    ],
    notes: 'Sword-mode mappings are known; spear-mode helper symbols remain unresolved.',
  },
  monster30: {
    status: 'missing-original',
    sourceSymbols: ['Monster30', 'Monster30Bullet1'],
    notes: 'First monster body and attack effect.',
  },
  role2SkillProjectiles: {
    status: 'missing-original',
    sourceSymbols: [
      'Role2Bullet5',
      'Role2_hit5',
      'Role2Bullet4_1',
      'Role1Bullet4_1',
      'Role2Bullet4_2',
      'Role2_hit4',
      'Role2Bullet3',
      'Role2_hit3',
      'Role2Bullet6',
      'Role2_hit6',
      'Role2Bullet7',
      'Role2_hit7',
      'Role2Bullet8',
      'Role2_hit8',
      'Role2Bullet9_1',
      'Role2Bullet9_2',
      'Role2_hit9',
      'ROLE2_SHALLDOW',
      'Role2_hit10',
    ],
    notes: 'Role2 skill projectile/effect family; absent from current symbol and image exports, expected in TangSeng or SpecialUI/TangSeng resource packages.',
  },
  role1SkillProjectiles: {
    status: 'missing-original',
    sourceSymbols: ['Role1Bullet6', 'Role1_hit6', 'Role1Bullet7', 'Role1_hit7', 'Role1Bullet8_1', 'Role1Bullet8_2', 'Role1_hit8', 'Role1Bullet9', 'Role1_hit9', 'Role1Bullet10_2', 'Role1Bullet10_4', 'Role1_hit10_2', 'Role1_hit10_4', 'Role1Bullet11_1', 'Role1Bullet11_2', 'Role1_hit11', 'Role1Bullet12', 'Role1Bullet12_1_1', 'Role1Bullet12_1_2', 'Role1_hit12_1', 'Role1_hit12_2', 'Role1Bullet13', 'Role1_hit13', 'Role1Bullet14_1', 'Role1Bullet14_2', 'Role1_hit14', 'ROLE1_SHALLDOW'],
    notes: 'Role1 skill effects are absent from current exports and use stable placeholders.',
  },
  role3SkillProjectiles: {
    status: 'missing-original',
    sourceSymbols: ['Role3Bullet4', 'Role3_hit4', 'Role3Bullet5', 'Role3_hit5', 'Role3Bullet5Buff', 'Role3Bullet6', 'Role3_hit6', 'Role3Bullet7_1', 'Role3Bullet7_2', 'Role3_hit7', 'Role3Bullet8_1', 'Role3Bullet8_2', 'Role3_hit8', 'Role3Bullet9', 'Role3_hit9', 'Role3Bullet10', 'Role3_hit10', 'Role3Bullet11', 'Role3_hit11', 'Role3Bullet12_1', 'Role3Bullet12_2', 'Role3_hit12_1', 'Role3_hit12_2'],
    notes: 'Role3 skill effects are absent from current exports and use stable placeholders.',
  },
  role4FinisherProjectiles: {
    status: 'missing-original',
    sourceSymbols: ['Role4Bullet11', 'Role4Bullet12', 'Role4BulletArrow12_1', 'Role4BulletArrow12_2', 'Role4BulletArrow12_3'],
    notes: 'Role4 lybj/mmw marker and finisher effects are absent from current exports and use stable placeholders.',
  },
  magicWeaponProjectiles: {
    status: 'missing-original',
    sourceSymbols: [
      'MagicSwordBmd2',
      'MagicSword2_1',
      'MagicSword2_2',
      'QPJBmd',
      'qpjeffect',
      'qpjeffect_box',
      'MagicPearlBmd2',
      'MagicPearlBegin',
      'MagicPearlRun',
      'MagicPearlBack',
      'MagicPearlEffect',
      'MagicPearlBullet1',
      'MagicPearlBullet2',
      'MagicPearlBullet3',
      'ZLHummerBmd',
      'zltcskill',
      'zltcbox',
      'MagicBigSwordBmd',
      'MagicBigBottleData',
      'LingBmd',
      'LingPaiEffect',
      'ef_snow',
    ],
    notes: 'Magic-weapon effect families for lxj/MagicSword2, fbqpj/MagicQPJ, xhmt/MagicPearl, zltc/MagicZLHummer, qljfb/MagicBigBottle, and stlp/Ling; absent from current exported bitmap resources, represented by modern placeholder effects.',
  },
  petSkillProjectiles: {
    status: 'missing-original',
    sourceSymbols: [
      'PetMonkey1Bullet2',
      'PetMonkey2Bullet2',
      'PetMonkey2Bullet3',
      'PetMonkey3Bullet2',
      'PetMonkey3Bullet3_1',
      'PetMonkey3Bullet3_2',
      'PetMonkey4 hit5',
      'PetHorseBmd1',
      'PetHorse1Bullet1',
      'PetHorse1Bullet2',
      'PetHorseBmd2',
      'PetHorse2Bullet1',
      'PetHorse2Bullet2',
      'PetHorseBmd3',
      'PetHorse3Bullet1',
      'PetHorse3Bullet2',
      'PetHorse3Bullet3',
      'PetHorse3Bullet4',
      'PetHorseBmd4',
      'PetHorse4Bullet5',
      'PetHorse4Bullet5Explode',
      'PetHorseIceEffect',
      'PetDragonBmd1',
      'PetDragon1Bullet1',
      'PetDragonBmd2',
      'PetDragon2Bullet1',
      'PetDragon2Bullet2',
      'PetDragonBmd3',
      'PetDragon3Bullet1',
      'PetDragon3Bullet3',
      'PetDragonBmd4',
      'PetDragonBullet4',
      'PetTurtleBmd1',
      'PetTurtle1Bullet2',
      'PetTurtleBmd3',
      'PetTurtle3Bullet3',
      'PetTurtleBmd4',
      'PetTurtle4Hit5',
      'PetKabuBmd1',
      'PetKabu1Bullet2',
      'PetKabuBmd3',
      'PetKabu3Bullet4',
    ],
    notes: 'Pet monkey xj/lj/lyq/jgaoyi, horse1/sp, horse2/bd, horse3/bz, horse4/tmaoyi, dragon1/fs, dragon2/sdcc, dragon3/ltwj, dragon4/qlaoyi, turtle1/sld, turtle3/sybh, turtle4/xwaoyi, and ufo1/pms, ufo3/kmsk projectile families; represented by modern placeholder effects for VS-016 through VS-022, VS-033 through VS-036.',
  },
} as const satisfies Record<string, MissingSourceAssetFamily>;

export const assetBundles = {
  scaffold: [scaffoldAssets.playerPlaceholder],
  role1NormalAttacks: Object.values(role1NormalAttackAssets),
  crafting: Object.values(craftingAssets),
  stage11: Object.values(stage11Assets),
  stage12: [stage11Assets.floor, ...Object.values(stage12Assets)],
  stage13: [stage11Assets.floor, ...Object.values(stage13Assets)],
} as const;
