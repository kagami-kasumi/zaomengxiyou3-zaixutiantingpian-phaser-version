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

export type MonsterAtlasAssetDefinition = ExtractedImageAssetDefinition & {
  cellWidth: number;
  cellHeight: number;
  columns: number;
  rows: number;
  reachableFrameCount: number;
  registrationOffset: Readonly<{ x: number; y: number }>;
};

export type MonsterAttackAssetDefinition = FrameSequenceAssetDefinition & {
  sourceCharacterId: number;
  frameCount: number;
  geometryPath: string;
};

export type Stage21MonsterAtlasAssetDefinition = MonsterAtlasAssetDefinition;
export type Stage21AttackAssetDefinition = MonsterAttackAssetDefinition;

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

export const LevelResultAssetKeys = {
  win: 'level-result.game-win',
  fail: 'level-result.game-fail',
  nextUp: 'level-result.next.up',
  nextOver: 'level-result.next.over',
  nextDown: 'level-result.next.down',
  retryUp: 'level-result.retry.up',
  retryOver: 'level-result.retry.over',
  retryDown: 'level-result.retry.down',
  backUp: 'level-result.back.up',
  backOver: 'level-result.back.over',
  backDown: 'level-result.back.down',
} as const;

export const Stage11AssetKeys = {
  floor: 'stage.stage1.floor',
  background: 'stage.stage1-1.background',
  foreground: 'stage.stage1-1.layout',
  transferDoor: 'stage.stage1-1.transfer-door',
} as const;

export const Stage11MonsterAssetKeys = {
  monster30: 'monster.stage1.monster30.atlas',
  monster3: 'monster.stage1.monster3.atlas',
  monster30Hit1: 'projectile.stage1.monster30.hit1',
  monster3Hit1: 'projectile.stage1.monster3.hit1',
  monster3Hit2: 'projectile.stage1.monster3.hit2',
  attackGeometry: 'stage1.monster-attack-geometry',
} as const;

export const Stage12MonsterAssetKeys = {
  monster2: 'monster.stage1.monster2.atlas',
  monster4: 'monster.stage1.monster4.atlas',
  monster7: 'monster.stage1.monster7.atlas',
  monster8: 'monster.stage1.monster8.atlas',
  monster2Hit1Start: 'projectile.stage1.monster2.hit1-start',
  monster2Hit1End: 'projectile.stage1.monster2.hit1-followup',
  monster2Hit2: 'effect.stage1.monster2.hit2',
  monster4Hit1: 'projectile.stage1.monster4.hit1',
  monster4Hit2Start: 'effect.stage1.monster4.hit2-start',
  monster4Hit2End: 'projectile.stage1.monster4.hit2-followup',
  monster7Hit1: 'projectile.stage1.monster7.hit1',
  monster8Hit1: 'projectile.stage1.monster8.hit1',
  monster8Hit2: 'projectile.stage1.monster8.hit2',
  attackGeometry: 'stage12.monster-attack-geometry',
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

export const Stage13MonsterAssetKeys = {
  monster5: 'monster.stage1.monster5.atlas',
  monster5Hit1: 'projectile.stage1.monster5.hit1',
  monster5Hit2Start: 'projectile.stage1.monster5.hit2-start',
  monster5Hit2End: 'projectile.stage1.monster5.hit2-followup',
  monster5Hit3: 'projectile.stage1.monster5.hit3',
  attackGeometry: 'stage13.monster5-attack-geometry',
} as const;

export const Stage21AssetKeys = {
  floor: 'stage.stage2.floor',
  background: 'stage.stage2-1.background',
  midground: 'stage.stage2-1.midground',
  foreground: 'stage.stage2-1.layout',
  transferDoor: 'stage.stage2-1.transfer-door',
  iceThorn: 'stage.stage2-1.ice-thorn',
} as const;

const levelResultImage = (
  key: string,
  filename: string,
  sourceSymbol: string,
  sourceCharacterId: number,
): ExtractedImageAssetDefinition => ({
  key,
  path: `/assets/ui/level-results/${filename}`,
  status: 'ready',
  source: 'extracted-flash',
  sourcePackage: 'assets/OtherMat1.swf',
  sourceSymbol,
  sourceCharacterId,
});

export const levelResultAssets = {
  win: levelResultImage(LevelResultAssetKeys.win, 'game-win.png', 'export.win.GameWin/base', 320),
  fail: levelResultImage(LevelResultAssetKeys.fail, 'game-fail.png', 'export.lose.GameFail/base', 302),
  nextUp: levelResultImage(LevelResultAssetKeys.nextUp, 'next-up.png', 'GameWin.nextStageButton/up', 329),
  nextOver: levelResultImage(LevelResultAssetKeys.nextOver, 'next-over.png', 'GameWin.nextStageButton/over', 329),
  nextDown: levelResultImage(LevelResultAssetKeys.nextDown, 'next-down.png', 'GameWin.nextStageButton/down', 329),
  retryUp: levelResultImage(LevelResultAssetKeys.retryUp, 'retry-up.png', 'GameFail.rePlayButton/up', 307),
  retryOver: levelResultImage(LevelResultAssetKeys.retryOver, 'retry-over.png', 'GameFail.rePlayButton/over', 307),
  retryDown: levelResultImage(LevelResultAssetKeys.retryDown, 'retry-down.png', 'GameFail.rePlayButton/down', 307),
  backUp: levelResultImage(LevelResultAssetKeys.backUp, 'back-up.png', 'GameWin.backTochooseButton/up', 312),
  backOver: levelResultImage(LevelResultAssetKeys.backOver, 'back-over.png', 'GameWin.backTochooseButton/over', 312),
  backDown: levelResultImage(LevelResultAssetKeys.backDown, 'back-down.png', 'GameWin.backTochooseButton/down', 312),
} as const satisfies Record<string, ExtractedImageAssetDefinition>;

export const Stage22AssetKeys = {
  floor: Stage21AssetKeys.floor,
  background: 'stage.stage2-2.background',
  midground: 'stage.stage2-2.midground',
  foreground: 'stage.stage2-2.layout',
  transferDoor: 'stage.stage2-2.transfer-door',
  fireThorn: 'stage.stage2-2.fire-thorn',
  monster16: 'monster.stage2-2.monster16.atlas',
  monster16Hit1: 'projectile.stage2-2.monster16.hit1',
  monster16Hit2Start: 'projectile.stage2-2.monster16.hit2-start',
  monster16Hit2Followup: 'projectile.stage2-2.monster16.hit2-followup',
  monster16Hit3: 'projectile.stage2-2.monster16.hit3',
  monster16Hit4Start: 'projectile.stage2-2.monster16.hit4-start',
  monster16Hit4Followup: 'projectile.stage2-2.monster16.hit4-followup',
  monster16AttackGeometry: 'stage2-2.monster16-attack-geometry',
} as const;

export const Stage21MonsterAssetKeys = {
  monster6: 'monster.stage2-1.monster6.atlas',
  monster9: 'monster.stage2-1.monster9.atlas',
  monster10: 'monster.stage2-1.monster10.atlas',
  monster19: 'monster.stage2-1.monster19.atlas',
  monster6Hit1: 'projectile.stage2-1.monster6.hit1',
  monster6Hit2Start: 'projectile.stage2-1.monster6.hit2-start',
  monster6Hit2Rain: 'projectile.stage2-1.monster6.hit2-rain',
  monster6Hit3: 'projectile.stage2-1.monster6.hit3',
  monster9Hit1: 'projectile.stage2-1.monster9.hit1',
  monster10Hit1: 'projectile.stage2-1.monster10.hit1',
  monster19Hit1: 'projectile.stage2-1.monster19.hit1',
  attackGeometry: 'stage2-1.monster-attack-geometry',
} as const;

export const CombatHudAssetKeys = {
  roleInfo: 'combat-hud.role-info',
  role2Portrait: 'combat-hud.role2-portrait',
  bossBlood: 'combat-hud.boss-blood',
} as const;

export const StageFeatureEntryAssetKeys = {
  settings: 'stage-feature-entry.settings',
  backpack: 'stage-feature-entry.backpack',
  skills: 'stage-feature-entry.skills',
  magicWeapon: 'stage-feature-entry.magic-weapon',
  pets: 'stage-feature-entry.pets',
} as const;

export const SaveSlotAssetKeys = {
  startMenu: 'save-slots.start-menu',
  slotPanel: 'save-slots.slot-panel',
  confirmDialog: 'save-slots.confirm-dialog',
} as const;

export const SavePartyAssetKeys = {
  numberUp: 'save-party.number.up',
  numberOneOver: 'save-party.number.1p-over',
  numberOneDown: 'save-party.number.1p-down',
  numberTwoOver: 'save-party.number.2p-over',
  numberTwoDown: 'save-party.number.2p-down',
  numberBackOver: 'save-party.number.back-over',
  numberBackDown: 'save-party.number.back-down',
  roleUp: 'save-party.role.up',
  markerP1: 'save-party.marker.p1',
  markerP2: 'save-party.marker.p2',
  role1Up: 'save-party.role1.up',
  role1Over: 'save-party.role1.over',
  role1Down: 'save-party.role1.down',
  role2Up: 'save-party.role2.up',
  role2Over: 'save-party.role2.over',
  role2Down: 'save-party.role2.down',
  role3Up: 'save-party.role3.up',
  role3Over: 'save-party.role3.over',
  role3Down: 'save-party.role3.down',
  role4Up: 'save-party.role4.up',
  role4Over: 'save-party.role4.over',
  role4Down: 'save-party.role4.down',
  role5Up: 'save-party.role5.up',
  role5Over: 'save-party.role5.over',
  role5Down: 'save-party.role5.down',
} as const;

export const FullFeatureUiAssetKeys = {
  backpack: 'full-ui.backpack',
  backpackGrid: 'full-ui.backpack-grid',
  soulBadge: 'full-ui.soul-badge',
  soulDigits: 'full-ui.soul-digits',
  skillHub: 'full-ui.skill-hub',
  skillActive: 'full-ui.skill-active',
  skillBind: 'full-ui.skill-bind',
  skillPassive: 'full-ui.skill-passive',
  petPage: 'full-ui.pet-page',
  magicWeaponPage: 'full-ui.magic-weapon',
} as const;

export const SkillNativeUiButtonCharacters = [207, 240, 244, 248, 337, 580, 638] as const;
export const SkillNativeUiSelectorCharacters = [218, 223, 228, 233, 871] as const;
export const SkillNativeUiSlotCharacters = [393, 398, 403, 408, 413] as const;
export const SkillNativeUiIconCharacters = [
  615, 620, 625, 630, 635, 644, 649, 654, 659, 664,
  671, 676, 681, 686, 691, 696, 702, 707, 712, 717,
  722, 727, 732, 737, 742, 749, 754, 759, 764, 769,
  774, 779, 784, 789, 794, 800, 805, 810, 815, 820,
  826, 830, 835, 839, 842, 846, 850, 854, 859, 863,
] as const;

export const HeavenMapAssetKeys = {
  world: 'heaven-map.world',
  menu: 'heaven-map.menu',
  stage11: 'heaven-map.stage-1-1',
  stage12: 'heaven-map.stage-1-2',
  stage13: 'heaven-map.stage-1-3',
  stage21: 'heaven-map.stage-2-1',
} as const;

export const PickupAssetKeys = {
  healthSmall: 'pickup.health.small',
  healthBig: 'pickup.health.big',
  manaSmall: 'pickup.mana.small',
  soulPrimary: 'pickup.soul.primary',
  soulBonus: 'pickup.soul.bonus',
} as const;

const CraftingUIAssetKeys = {
  container: 'crafting-ui.container',
  fusionPanel: 'crafting-ui.fusion-panel',
  strengthPanel: 'full-ui.equipment-strength',
  resolutionPanel: 'full-ui.equipment-resolution',
  makingPanel: 'full-ui.equipment-making',
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

export const Role1CombatAssetKeys = {
  body: 'hero-animation.hero1.body',
  equipment: 'hero-animation.hero1.equipment',
  shadow: 'hero-animation.hero1.shadow',
} as const;

export const Role2CombatAssetKeys = {
  body: 'hero-animation.hero2.body',
  equipment: 'hero-animation.hero2.equipment',
  shadow: 'skill-summon.role2.shy.shadow',
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

const stageFrameKeys = (key: string, frameCount: number): readonly string[] =>
  Array.from({ length: frameCount }, (_, index) => `${key}.frame-${String(index + 1).padStart(2, '0')}`);

const stageFramePaths = (directory: string, frameCount: number): readonly string[] =>
  Array.from({ length: frameCount }, (_, index) => `${directory}/frame-${String(index + 1).padStart(2, '0')}.png`);

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
  transferDoor: {
    key: Stage11AssetKeys.transferDoor,
    frameKeys: stageFrameKeys(Stage11AssetKeys.transferDoor, 20),
    framePaths: stageFramePaths('/assets/stage/stage1-1/transfer-door', 20),
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/levels/level11.swf',
    sourceSymbol: 'character 45 / isTransferDoor; animated children 41/44',
    sourceCharacterId: 45,
    sourceTag: 'DefineSprite tag 39; child 41 (20 frames) and child 44 (19 frames)',
    frameCount: 20,
    width: 196,
    height: 175,
    sourceBounds: { width: 195.75, height: 174.45 },
  },
} as const satisfies Record<string, ExtractedStageImageAssetDefinition | ExtractedStageSequenceAssetDefinition>;

const numberedFramePaths = (
  directory: string,
  frameCount: number,
  extension = 'png',
): readonly string[] =>
  Array.from({ length: frameCount }, (_, index) => `${directory}/${index + 1}.${extension}`);

export const combatHudAssets = {
  roleInfo: {
    key: CombatHudAssetKeys.roleInfo,
    path: '/assets/ui/combat-hud/role-info.svg',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/OtherMat1.swf',
    sourceSymbol: 'export.RoleInfo frame 1',
    sourceCharacterId: 574,
  },
  role2Portrait: {
    key: CombatHudAssetKeys.role2Portrait,
    path: '/assets/ui/combat-hud/portraits/role2.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/OtherMat1.swf',
    sourceSymbol: 'OtherMat_fla._2233_62 frame 2',
    sourceCharacterId: 505,
  },
  bossBlood: {
    key: CombatHudAssetKeys.bossBlood,
    path: '/assets/ui/combat-hud/boss-blood.svg',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/bossblood.swf',
    sourceSymbol: 'BossBlood frame 1',
    sourceCharacterId: 110,
  },
} as const satisfies Record<string, ExtractedImageAssetDefinition>;

const stageFeatureEntryButton = (
  key: string,
  directory: string,
  sourceCharacterId: number,
): Readonly<{
  up: ExtractedImageAssetDefinition;
  over: ExtractedImageAssetDefinition;
  down: ExtractedImageAssetDefinition;
  hit: ExtractedImageAssetDefinition;
}> => {
  const state = (name: 'up' | 'over' | 'down' | 'hit'): ExtractedImageAssetDefinition => ({
    key: `${key}.${name}`,
    path: `/assets/ui/combat-hud/feature-entry/${directory}/${name}.png`,
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/OtherMat1.swf',
    sourceSymbol: `export.RoleInfo ${directory} button ${name}`,
    sourceCharacterId,
  });
  return {
    up: state('up'),
    over: state('over'),
    down: state('down'),
    hit: state('hit'),
  };
};

export const stageFeatureEntryButtonAssets = {
  settings: stageFeatureEntryButton(StageFeatureEntryAssetKeys.settings, 'settings', 549),
  backpack: stageFeatureEntryButton(StageFeatureEntryAssetKeys.backpack, 'backpack', 555),
  skills: stageFeatureEntryButton(StageFeatureEntryAssetKeys.skills, 'skills', 561),
  magicWeapon: stageFeatureEntryButton(
    StageFeatureEntryAssetKeys.magicWeapon,
    'magic-weapon',
    567,
  ),
  pets: stageFeatureEntryButton(StageFeatureEntryAssetKeys.pets, 'pets', 573),
} as const;

const StageSettingsAssetRoot = '/assets/ui/stage-settings';

function stageSettingsAsset(
  key: string,
  path: string,
  sourceSymbol: string,
  sourceCharacterId: number,
): ExtractedImageAssetDefinition {
  return {
    key,
    path: `${StageSettingsAssetRoot}/${path}`,
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/OtherMat1.swf',
    sourceSymbol,
    sourceCharacterId,
  };
}

function stageSettingsButton(name: string, sourceCharacterId: number) {
  const state = (stateName: 'up' | 'over' | 'down' | 'hit') =>
    stageSettingsAsset(
      `stage-settings.${name}.${stateName}`,
      `buttons/${name}-${stateName}.png`,
      `DefineButton2 ${sourceCharacterId} ${stateName}`,
      sourceCharacterId,
    );
  return {
    up: state('up'),
    over: state('over'),
    down: state('down'),
    hit: state('hit'),
  };
}

function stageHelpButton(name: string, sourceCharacterId: number) {
  const state = (stateName: 'up' | 'over' | 'down' | 'hit') =>
    stageSettingsAsset(
      `stage-settings.help.${name}.${stateName}`,
      `help-buttons/${name}-${stateName}.png`,
      `export.Help DefineButton2 ${sourceCharacterId} ${stateName}`,
      sourceCharacterId,
    );
  return {
    up: state('up'),
    over: state('over'),
    down: state('down'),
    hit: state('hit'),
  };
}

export const stageSettingsAssets = {
  root: stageSettingsAsset(
    'stage-settings.root',
    'root.png',
    'export.setmenu.SetMenu character 371 frame 1',
    371,
  ),
  helpFrames: [
    stageSettingsAsset(
      'stage-settings.help.frame-1',
      'help-1.png',
      'export.Help character 444 frame 1',
      444,
    ),
    stageSettingsAsset(
      'stage-settings.help.frame-2',
      'help-2.png',
      'export.Help character 444 frame 2',
      444,
    ),
  ],
  spawnSpeedFrames: [
    stageSettingsAsset(
      'stage-settings.spawn-speed.1',
      'spawn-speed-1.png',
      'character 366 frame 1 (x1)',
      366,
    ),
    stageSettingsAsset(
      'stage-settings.spawn-speed.2',
      'spawn-speed-2.png',
      'character 366 frame 2 (x2)',
      366,
    ),
    stageSettingsAsset(
      'stage-settings.spawn-speed.4',
      'spawn-speed-4.png',
      'character 366 frame 3 (x4)',
      366,
    ),
  ],
  buttons: {
    close: stageSettingsButton('close', 337),
    continue: stageSettingsButton('continue', 342),
    map: stageSettingsButton('map', 347),
    help: stageSettingsButton('help', 351),
    menu: stageSettingsButton('menu', 355),
    soundOpen: stageSettingsButton('sound-open', 359),
    soundClose: stageSettingsButton('sound-close', 362),
    spawnSpeed: stageSettingsButton('spawn-speed', 370),
  },
  helpButtons: {
    action: stageHelpButton('action', 436),
    pet: stageHelpButton('pet', 440),
    back: stageHelpButton('back', 441),
  },
} as const;

export const saveSlotAssets = {
  startMenu: {
    key: SaveSlotAssetKeys.startMenu,
    path: '/assets/ui/save-slots/start-menu.svg',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/OtherMat1.swf',
    sourceSymbol: 'export.GameMenu frame 1',
    sourceCharacterId: 1149,
  },
  slotPanel: {
    key: SaveSlotAssetKeys.slotPanel,
    path: '/assets/ui/save-slots/slot-panel.svg',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/Common1.swf',
    sourceSymbol: 'export.saveInterface.SaveInter frame 1',
    sourceCharacterId: 69,
  },
  confirmDialog: {
    key: SaveSlotAssetKeys.confirmDialog,
    path: '/assets/ui/save-slots/confirm-dialog.svg',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/Common1.swf',
    sourceSymbol: 'IsCover frame 1',
    sourceCharacterId: 18,
  },
} as const satisfies Record<string, ExtractedImageAssetDefinition>;

const SavePartyAssetRoot = '/assets/ui/save-party';

export const savePartyAssets = {
  numberUp: savePartyAsset(SavePartyAssetKeys.numberUp, 'select-number-up.png', 'export.GameMenu number selector', 1149),
  numberOneOver: savePartyAsset(SavePartyAssetKeys.numberOneOver, 'select-number-1p-over.png', 'simpleGame over', 1111),
  numberOneDown: savePartyAsset(SavePartyAssetKeys.numberOneDown, 'select-number-1p-down.png', 'simpleGame down', 1111),
  numberTwoOver: savePartyAsset(SavePartyAssetKeys.numberTwoOver, 'select-number-2p-over.png', 'doubleGame over', 1115),
  numberTwoDown: savePartyAsset(SavePartyAssetKeys.numberTwoDown, 'select-number-2p-down.png', 'doubleGame down', 1115),
  numberBackOver: savePartyAsset(SavePartyAssetKeys.numberBackOver, 'select-number-back-over.png', 'backbtn over', 1136),
  numberBackDown: savePartyAsset(SavePartyAssetKeys.numberBackDown, 'select-number-back-down.png', 'backbtn down', 1136),
  roleUp: savePartyAsset(SavePartyAssetKeys.roleUp, 'select-role-up.png', 'export.SelectRole up composition', 901),
  markerP1: savePartyAsset(SavePartyAssetKeys.markerP1, 'marker-p1.png', 'SelectRole 1P marker image', 115),
  markerP2: savePartyAsset(SavePartyAssetKeys.markerP2, 'marker-p2.png', 'SelectRole 2P marker image', 108),
  role1Up: savePartyAsset(SavePartyAssetKeys.role1Up, 'role1-1_up.png', 'SelectRole btn1 up', 877),
  role1Over: savePartyAsset(SavePartyAssetKeys.role1Over, 'role1-2_over.png', 'SelectRole btn1 over', 877),
  role1Down: savePartyAsset(SavePartyAssetKeys.role1Down, 'role1-3_down.png', 'SelectRole btn1 down', 877),
  role2Up: savePartyAsset(SavePartyAssetKeys.role2Up, 'role2-1_up.png', 'SelectRole btn2 up', 883),
  role2Over: savePartyAsset(SavePartyAssetKeys.role2Over, 'role2-2_over.png', 'SelectRole btn2 over', 883),
  role2Down: savePartyAsset(SavePartyAssetKeys.role2Down, 'role2-3_down.png', 'SelectRole btn2 down', 883),
  role3Up: savePartyAsset(SavePartyAssetKeys.role3Up, 'role3-1_up.png', 'SelectRole btn3 up', 888),
  role3Over: savePartyAsset(SavePartyAssetKeys.role3Over, 'role3-2_over.png', 'SelectRole btn3 over', 888),
  role3Down: savePartyAsset(SavePartyAssetKeys.role3Down, 'role3-3_down.png', 'SelectRole btn3 down', 888),
  role4Up: savePartyAsset(SavePartyAssetKeys.role4Up, 'role4-1_up.png', 'SelectRole btn4 up', 894),
  role4Over: savePartyAsset(SavePartyAssetKeys.role4Over, 'role4-2_over.png', 'SelectRole btn4 over', 894),
  role4Down: savePartyAsset(SavePartyAssetKeys.role4Down, 'role4-3_down.png', 'SelectRole btn4 down', 894),
  role5Up: savePartyAsset(SavePartyAssetKeys.role5Up, 'role5-1_up.png', 'SelectRole btn5 up', 900),
  role5Over: savePartyAsset(SavePartyAssetKeys.role5Over, 'role5-2_over.png', 'SelectRole btn5 over', 900),
  role5Down: savePartyAsset(SavePartyAssetKeys.role5Down, 'role5-3_down.png', 'SelectRole btn5 down', 900),
} as const satisfies Record<string, ExtractedImageAssetDefinition>;

function savePartyAsset(
  key: string,
  fileName: string,
  sourceSymbol: string,
  sourceCharacterId: number,
): ExtractedImageAssetDefinition {
  return {
    key,
    path: `${SavePartyAssetRoot}/${fileName}`,
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/OtherMat1.swf',
    sourceSymbol,
    sourceCharacterId,
  };
}

export const heavenMapAssets = {
  world: {
    key: HeavenMapAssetKeys.world,
    path: '/assets/ui/heaven-map/world.svg',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/OtherMat1.swf',
    sourceSymbol: 'export.SelectPLace frame 1; cropped to visible 940x590 stage',
    sourceCharacterId: 1343,
  },
  menu: {
    key: HeavenMapAssetKeys.menu,
    path: '/assets/ui/heaven-map/menu.svg',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/OtherMat1.swf',
    sourceSymbol: 'export.MapMenu frame 1; cropped to visible 940x590 stage',
    sourceCharacterId: 963,
  },
  stage11: {
    key: HeavenMapAssetKeys.stage11,
    path: '/assets/ui/heaven-map/stage-1-1.svg',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/OtherMat1.swf',
    sourceSymbol: 'OtherMat_fla.Timeline_188 frame 1 / instance s1_1',
    sourceCharacterId: 1311,
  },
  stage12: {
    key: HeavenMapAssetKeys.stage12,
    path: '/assets/ui/heaven-map/stage-1-2.svg',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/OtherMat1.swf',
    sourceSymbol: 'OtherMat_fla.Timeline_194 frame 1 / instance s1_2',
    sourceCharacterId: 1297,
  },
  stage13: {
    key: HeavenMapAssetKeys.stage13,
    path: '/assets/ui/heaven-map/stage-1-3.svg',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/OtherMat1.swf',
    sourceSymbol: 'OtherMat_fla.Timeline_191 frame 1 / instance s1_3',
    sourceCharacterId: 1304,
  },
  stage21: {
    key: HeavenMapAssetKeys.stage21,
    path: '/assets/ui/heaven-map/stage-2-1.svg',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/OtherMat1.swf',
    sourceSymbol: 'OtherMat_fla.Timeline_197 frame 1 / instance s2_1',
    sourceCharacterId: 1290,
  },
} as const satisfies Record<string, ExtractedImageAssetDefinition>;

const ImmortalityUiAssetRoot = '/assets/ui/map-services/immortality';

function immortalityUiAsset(
  key: string,
  fileName: string,
  sourceSymbol: string,
  sourceCharacterId: number,
): ExtractedImageAssetDefinition {
  return {
    key,
    path: `${ImmortalityUiAssetRoot}/${fileName}`,
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/OtherMat1.swf',
    sourceSymbol,
    sourceCharacterId,
  };
}

function immortalityButtonAssets(
  name: string,
  sourceCharacterId: number,
): Record<'up' | 'over' | 'down', ExtractedImageAssetDefinition> {
  return {
    up: immortalityUiAsset(
      `map-service.immortality.${name}.up`,
      `${name}-up.png`,
      `DefineButton2 ${sourceCharacterId} up`,
      sourceCharacterId,
    ),
    over: immortalityUiAsset(
      `map-service.immortality.${name}.over`,
      `${name}-over.png`,
      `DefineButton2 ${sourceCharacterId} over`,
      sourceCharacterId,
    ),
    down: immortalityUiAsset(
      `map-service.immortality.${name}.down`,
      `${name}-down.png`,
      `DefineButton2 ${sourceCharacterId} down`,
      sourceCharacterId,
    ),
  };
}

function immortalityOwnerAssets(
  heroId: number,
  sourceSymbol: string,
  sourceCharacterId: number,
): Record<'normal' | 'selected', ExtractedImageAssetDefinition> {
  return {
    normal: immortalityUiAsset(
      `map-service.immortality.owner-${heroId}.normal`,
      `owner-${heroId}-normal.svg`,
      `${sourceSymbol} frame 1`,
      sourceCharacterId,
    ),
    selected: immortalityUiAsset(
      `map-service.immortality.owner-${heroId}.selected`,
      `owner-${heroId}-selected.svg`,
      `${sourceSymbol} frame 2`,
      sourceCharacterId,
    ),
  };
}

export const immortalityUiAssets = {
  root: immortalityUiAsset(
    'map-service.immortality.root',
    'root-static.svg',
    'export.immortality.ImmortalityInterface character 990; dynamic text/eat children removed',
    990,
  ),
  exchange: immortalityUiAsset(
    'map-service.immortality.exchange',
    'exchange.svg',
    'export.immortality.ExchangeImmortality character 1006',
    1006,
  ),
  buttons: {
    eat: immortalityButtonAssets('eat', 968),
    back: immortalityButtonAssets('back', 973),
    compound: immortalityButtonAssets('compound', 989),
    close: immortalityButtonAssets('close', 997),
  },
  owners: {
    1: immortalityOwnerAssets(1, 'export.shop.SelectWK', 218),
    2: immortalityOwnerAssets(2, 'export.shop.SelectTS', 223),
    3: immortalityOwnerAssets(3, 'export.shop.SelectBJ', 233),
    4: immortalityOwnerAssets(4, 'export.shop.SelectSS', 228),
    5: immortalityOwnerAssets(5, 'export.shop.SelectBL', 871),
  },
} as const;

const SettingsUiAssetRoot = '/assets/ui/map-services/settings';

function settingsUiAsset(
  key: string,
  fileName: string,
  sourceSymbol: string,
  sourceCharacterId: number,
): ExtractedImageAssetDefinition {
  return {
    key,
    path: `${SettingsUiAssetRoot}/${fileName}`,
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/StageCommon.swf',
    sourceSymbol,
    sourceCharacterId,
  };
}

export const settingsUiAssets = {
  root: settingsUiAsset(
    'map-service.settings.root',
    'root-static.svg',
    'export.setmenu.gameSetting character 148; dynamic values and close button removed',
    148,
  ),
  close: {
    up: settingsUiAsset(
      'map-service.settings.close.up',
      'close-up.svg',
      'DefineButton2 144 up',
      144,
    ),
    over: settingsUiAsset(
      'map-service.settings.close.over',
      'close-over.svg',
      'DefineButton2 144 over',
      144,
    ),
    down: settingsUiAsset(
      'map-service.settings.close.down',
      'close-down.svg',
      'DefineButton2 144 down',
      144,
    ),
  },
} as const;

const TaskUiAssetRoot = '/assets/ui/map-services/tasks';

function taskUiAsset(
  key: string,
  fileName: string,
  sourceSymbol: string,
  sourceCharacterId: number,
): ExtractedImageAssetDefinition {
  return {
    key,
    path: `${TaskUiAssetRoot}/${fileName}`,
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/backpack1.swf',
    sourceSymbol,
    sourceCharacterId,
  };
}

function taskButtonAssets(name: string, sourceCharacterId: number) {
  return {
    up: taskUiAsset(`map-service.tasks.${name}.up`, `${name}-up.svg`, `DefineButton2 ${sourceCharacterId} up`, sourceCharacterId),
    over: taskUiAsset(`map-service.tasks.${name}.over`, `${name}-over.svg`, `DefineButton2 ${sourceCharacterId} over`, sourceCharacterId),
    down: taskUiAsset(`map-service.tasks.${name}.down`, `${name}-down.svg`, `DefineButton2 ${sourceCharacterId} down`, sourceCharacterId),
  };
}

export const taskUiAssets = {
  root: taskUiAsset('map-service.tasks.root', 'root.svg', 'export.taskInterface.TaskInterface character 85', 85),
  daily: {
    normal: taskUiAsset('map-service.tasks.daily.normal', 'daily-normal.svg', 'character 44 frame 1', 44),
    selected: taskUiAsset('map-service.tasks.daily.selected', 'daily-selected.svg', 'character 44 frame 2', 44),
  },
  activity: {
    normal: taskUiAsset('map-service.tasks.activity.normal', 'activity-normal.svg', 'character 49 frame 1', 49),
    selected: taskUiAsset('map-service.tasks.activity.selected', 'activity-selected.svg', 'character 49 frame 2', 49),
  },
  claim: {
    disabled: taskUiAsset('map-service.tasks.claim.disabled', 'claim-disabled.svg', 'character 54 frame 1', 54),
    enabled: taskUiAsset('map-service.tasks.claim.enabled', 'claim-enabled.svg', 'character 54 frame 2', 54),
  },
  tile: {
    normal: taskUiAsset('map-service.tasks.tile.normal', 'tile-normal.svg', 'character 60 frame 1', 60),
    selected: taskUiAsset('map-service.tasks.tile.selected', 'tile-selected.svg', 'character 60 frame 2', 60),
  },
  awardCell: taskUiAsset('map-service.tasks.award-cell', 'award-cell.svg', 'character 73 frame 1', 73),
  received: taskUiAsset('map-service.tasks.received', 'received.png', 'hasReceive character 9', 9),
  buttons: {
    close: taskButtonAssets('close', 31),
    prev: taskButtonAssets('prev', 78),
    next: taskButtonAssets('next', 83),
  },
  rewards: {
    exp: {
      ...taskUiAsset('map-service.tasks.reward.exp', 'reward-exp.png', 'rw_exp character 623', 623),
      sourcePackage: 'assets/EIcon1.swf',
    },
    soul: {
      ...taskUiAsset('map-service.tasks.reward.soul', 'reward-soul.png', 'rw_lh character 560', 560),
      sourcePackage: 'assets/EIcon1.swf',
    },
    stone: {
      ...taskUiAsset('map-service.tasks.reward.stone', 'reward-stone.png', 'rw_bs character 608', 608),
      sourcePackage: 'assets/EIcon1.swf',
    },
    horse: {
      ...taskUiAsset('map-service.tasks.reward.horse', 'reward-roomhorse.png', 'rw_roomhorse character 512', 512),
      sourcePackage: 'assets/EIcon1.swf',
    },
  },
} as const;

const ShopUiAssetRoot = '/assets/ui/map-services/shop';

function shopUiAsset(
  key: string,
  fileName: string,
  sourceSymbol: string,
  sourceCharacterId: number,
): ExtractedImageAssetDefinition {
  return {
    key,
    path: `${ShopUiAssetRoot}/${fileName}`,
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/backpack1.swf',
    sourceSymbol,
    sourceCharacterId,
  };
}

function shopButtonAssets(
  name: string,
  sourceCharacterId: number,
): Record<'up' | 'over' | 'down', ExtractedImageAssetDefinition> {
  return {
    up: shopUiAsset(
      `map-service.shop.${name}.up`,
      `${name}-up.png`,
      `DefineButton2 ${sourceCharacterId} up`,
      sourceCharacterId,
    ),
    over: shopUiAsset(
      `map-service.shop.${name}.over`,
      `${name}-over.png`,
      `DefineButton2 ${sourceCharacterId} over`,
      sourceCharacterId,
    ),
    down: shopUiAsset(
      `map-service.shop.${name}.down`,
      `${name}-down.png`,
      `DefineButton2 ${sourceCharacterId} down`,
      sourceCharacterId,
    ),
  };
}

export const shopUiAssets = {
  root: shopUiAsset(
    'map-service.shop.root',
    'root-static.svg',
    'export.microshop.Micropayment character 721; dynamic children removed',
    721,
  ),
  card: shopUiAsset(
    'map-service.shop.card',
    'card-static.svg',
    'export.microshop.ShopThing character 717; dynamic children removed',
    717,
  ),
  confirm: shopUiAsset(
    'map-service.shop.confirm',
    'confirm-static.svg',
    'export.microshop.SumInterface character 624; dynamic children removed',
    624,
  ),
  buttons: {
    categoryAll: shopButtonAssets('category-all', 658),
    categoryGem: shopButtonAssets('category-gem', 643),
    categoryItem: shopButtonAssets('category-item', 636),
    categoryFashion: shopButtonAssets('category-fashion', 653),
    categoryPet: shopButtonAssets('category-pet', 648),
    charge: shopButtonAssets('charge', 668),
    ownerP1: shopButtonAssets('owner-p1', 675),
    ownerP2: shopButtonAssets('owner-p2', 680),
    pagePrev: shopButtonAssets('page-prev', 685),
    pageNext: shopButtonAssets('page-next', 690),
    back: shopButtonAssets('back', 719),
    buy: shopButtonAssets('buy', 703),
    quantityUp: shopButtonAssets('quantity-up', 711),
    quantityDown: shopButtonAssets('quantity-down', 716),
    confirmOk: shopButtonAssets('confirm-ok', 617),
    confirmCancel: shopButtonAssets('confirm-cancel', 622),
  },
} as const;

export const pickupAssets = {
  healthSmall: {
    key: PickupAssetKeys.healthSmall,
    path: '/assets/combat/pickups/health-small.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/OtherMat1.swf',
    sourceSymbol: 'export.cure.SmallHP',
    sourceCharacterId: 428,
  },
  healthBig: {
    key: PickupAssetKeys.healthBig,
    path: '/assets/combat/pickups/health-big.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/OtherMat1.swf',
    sourceSymbol: 'export.cure.BigHP',
    sourceCharacterId: 426,
  },
  manaSmall: {
    key: PickupAssetKeys.manaSmall,
    path: '/assets/combat/pickups/mana-small.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/OtherMat1.swf',
    sourceSymbol: 'export.cure.SmallMP',
    sourceCharacterId: 430,
  },
  soulPrimary: {
    key: PickupAssetKeys.soulPrimary,
    frameKeys: stageFrameKeys(PickupAssetKeys.soulPrimary, 19),
    framePaths: numberedFramePaths('/assets/combat/pickups/soul-primary', 19),
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/Common1.swf',
    sourceSymbol: 'export.aura.auraRed',
  },
  soulBonus: {
    key: PickupAssetKeys.soulBonus,
    frameKeys: stageFrameKeys(PickupAssetKeys.soulBonus, 19),
    framePaths: numberedFramePaths('/assets/combat/pickups/soul-bonus', 19),
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/Common1.swf',
    sourceSymbol: 'export.aura.auraWhile',
  },
} as const;

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

export const stage21Assets = {
  floor: {
    key: Stage21AssetKeys.floor,
    path: '/assets/stage/stage2-1/floor.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/2.swf',
    sourceSymbol: 'floorBg2',
    sourceCharacterId: 3,
    sourceTag: 'DefineBitsLossless2',
    width: 631,
    height: 549,
    sourceBounds: { width: 631, height: 549 },
  },
  background: {
    key: Stage21AssetKeys.background,
    path: '/assets/stage/stage2-1/background.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/2.swf',
    sourceSymbol: 'bg21',
    sourceCharacterId: 282,
    sourceTag: 'DefineSprite frame 1; wraps character 281',
    width: 4700,
    height: 590,
    sourceBounds: { width: 4700, height: 590 },
  },
  midground: {
    key: Stage21AssetKeys.midground,
    path: '/assets/stage/stage2-1/midground.svg',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/levels/level21.swf',
    sourceSymbol: 'export.gameSence.sl21 character 19',
    sourceCharacterId: 19,
    sourceTag: 'DefineShape2',
    width: 2554,
    height: 104,
    sourceBounds: { width: 2553.6, height: 103.8 },
  },
  foreground: {
    key: Stage21AssetKeys.foreground,
    path: '/assets/stage/stage2-1/foreground.svg',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/levels/level21.swf',
    sourceSymbol: 'export.gameSence.sl21 character 21',
    sourceCharacterId: 21,
    sourceTag: 'DefineShape2',
    width: 4700,
    height: 94,
    sourceBounds: { width: 4700, height: 94 },
  },
  transferDoor: {
    key: Stage21AssetKeys.transferDoor,
    path: '/assets/stage/stage2-1/transfer-door.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/levels/level21.swf',
    sourceSymbol: 'ordinary transfer door / isTransferDoor',
    sourceCharacterId: 48,
    sourceTag: 'DefineSprite frame 1',
    width: 196,
    height: 175,
    sourceBounds: { width: 167, height: 163.45 },
  },
  iceThorn: {
    key: Stage21AssetKeys.iceThorn,
    frameKeys: stageFrameKeys(Stage21AssetKeys.iceThorn, 66),
    framePaths: numberedFramePaths('/assets/stage/stage2-1/ice-thorn', 66),
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/levels/level21.swf',
    sourceSymbol: 'export.mapObject.IceThron',
    sourceCharacterId: 16,
    sourceTag: 'DefineSprite 66 frames at 30fps',
    frameCount: 66,
    width: 59,
    height: 588,
    sourceBounds: { width: 59, height: 588 },
  },
} as const;

export const stage22Assets = {
  floor: stage21Assets.floor,
  background: {
    key: Stage22AssetKeys.background,
    path: '/assets/stage22/background.svg',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/2.swf',
    sourceSymbol: 'bg22',
    sourceCharacterId: 279,
    sourceTag: 'DefineSprite frame 1; wraps character 278',
    width: 4700,
    height: 590,
    sourceBounds: { width: 4700, height: 590 },
  },
  midground: {
    key: Stage22AssetKeys.midground,
    path: '/assets/stage22/midground.svg',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/levels/level22.swf',
    sourceSymbol: 'export.gameSence.sl22 character 36',
    sourceCharacterId: 36,
    sourceTag: 'DefineShape2',
    width: 1746,
    height: 53,
    sourceBounds: { width: 1745.1, height: 52.45 },
  },
  foreground: {
    key: Stage22AssetKeys.foreground,
    path: '/assets/stage22/foreground.svg',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/levels/level22.swf',
    sourceSymbol: 'export.gameSence.sl22 character 34',
    sourceCharacterId: 34,
    sourceTag: 'DefineShape2',
    width: 4701,
    height: 94,
    sourceBounds: { width: 4701, height: 94 },
  },
  transferDoor: {
    key: Stage22AssetKeys.transferDoor,
    path: '/assets/stage22/transfer-door.svg',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/levels/level22.swf',
    sourceSymbol: 'ordinary transfer door / isTransferDoor',
    sourceCharacterId: 63,
    sourceTag: 'DefineSprite frame 1; child characters 59/62',
    width: 186,
    height: 165,
    sourceBounds: { width: 185.8, height: 165 },
  },
  fireThorn: {
    key: Stage22AssetKeys.fireThorn,
    frameKeys: stageFrameKeys(Stage22AssetKeys.fireThorn, 130),
    framePaths: numberedFramePaths('/assets/stage22/fire-thorn', 130, 'svg'),
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/levels/level22.swf',
    sourceSymbol: 'export.mapObject.FireThron',
    sourceCharacterId: 31,
    sourceTag: 'DefineSprite 130 frames at 30fps',
    frameCount: 130,
    width: 143,
    height: 315,
    sourceBounds: { width: 143, height: 314.35 },
  },
} as const;

export const stage22Monster16Atlas: Stage21MonsterAtlasAssetDefinition = {
  key: Stage22AssetKeys.monster16,
  path: '/assets/stage22/monster16/monster16.png',
  status: 'ready',
  source: 'extracted-flash',
  sourcePackage: 'assets/2.swf',
  sourceSymbol: 'Monster16',
  sourceCharacterId: 6,
  cellWidth: 300,
  cellHeight: 300,
  columns: 6,
  rows: 8,
  reachableFrameCount: 36,
  registrationOffset: { x: 0, y: -20 },
};

const stage22Monster16Attack = (
  key: string,
  directory: string,
  sourceSymbol: string,
  sourceCharacterId: number,
  frameCount: number,
): Stage21AttackAssetDefinition => ({
  key,
  frameKeys: stageFrameKeys(key, frameCount),
  framePaths: numberedFramePaths(`/assets/stage22/monster16/attacks/${directory}`, frameCount, 'svg'),
  status: 'ready',
  source: 'extracted-flash',
  sourcePackage: 'assets/2.swf',
  sourceSymbol,
  sourceCharacterId,
  frameCount,
  geometryPath: '/assets/stage22/monster16/bullet-frame-geometry.csv',
});

export const stage22Monster16AttackAssets = {
  monster16Hit1: stage22Monster16Attack(
    Stage22AssetKeys.monster16Hit1,
    'DefineSprite_235_Monster16Bullet1',
    'Monster16Bullet1',
    235,
    20,
  ),
  monster16Hit2Start: stage22Monster16Attack(
    Stage22AssetKeys.monster16Hit2Start,
    'DefineSprite_229_Monster16Bullet2_1',
    'Monster16Bullet2_1',
    229,
    4,
  ),
  monster16Hit2Followup: stage22Monster16Attack(
    Stage22AssetKeys.monster16Hit2Followup,
    'DefineSprite_225_Monster16Bullet2_2',
    'Monster16Bullet2_2',
    225,
    29,
  ),
  monster16Hit3: stage22Monster16Attack(
    Stage22AssetKeys.monster16Hit3,
    'DefineSprite_191_Monster16Bullet3',
    'Monster16Bullet3',
    191,
    15,
  ),
  monster16Hit4Start: stage22Monster16Attack(
    Stage22AssetKeys.monster16Hit4Start,
    'DefineSprite_160_Monster16Bullet4_1',
    'Monster16Bullet4_1',
    160,
    16,
  ),
  monster16Hit4Followup: stage22Monster16Attack(
    Stage22AssetKeys.monster16Hit4Followup,
    'DefineSprite_143_Monster16Bullet4_2',
    'Monster16Bullet4_2',
    143,
    20,
  ),
} as const;

const stage21Attack = (
  key: string,
  directory: string,
  sourceSymbol: string,
  sourceCharacterId: number,
  frameCount: number,
): Stage21AttackAssetDefinition => ({
  key,
  frameKeys: stageFrameKeys(key, frameCount),
  framePaths: numberedFramePaths(`/assets/stage21/attacks/${directory}`, frameCount),
  status: 'ready',
  source: 'extracted-flash',
  sourcePackage: 'assets/2.swf',
  sourceSymbol,
  sourceCharacterId,
  frameCount,
  geometryPath: '/assets/stage21/bullet-frame-geometry.csv',
});

const stage11MonsterAttack = (
  key: string,
  directory: string,
  sourceSymbol: string,
  sourceCharacterId: number,
  frameCount: number,
): MonsterAttackAssetDefinition => ({
  key,
  frameKeys: stageFrameKeys(key, frameCount),
  framePaths: numberedFramePaths(
    `/assets/stage1/monsters/attacks/${directory}`,
    frameCount,
    'svg',
  ),
  status: 'ready',
  source: 'extracted-flash',
  sourcePackage: 'assets/1.swf',
  sourceSymbol,
  sourceCharacterId,
  frameCount,
  geometryPath: '/assets/stage1/monsters/attack-frame-geometry.csv',
});

const stage12MonsterAttack = stage11MonsterAttack;

export const stage11MonsterAtlases = {
  monster30: {
    key: Stage11MonsterAssetKeys.monster30,
    path: '/assets/stage1/monsters/monster30.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/1.swf',
    sourceSymbol: 'Monster30',
    sourceCharacterId: 8,
    cellWidth: 150,
    cellHeight: 150,
    columns: 6,
    rows: 4,
    reachableFrameCount: 13,
    registrationOffset: { x: 5, y: -2 },
  },
  monster3: {
    key: Stage11MonsterAssetKeys.monster3,
    path: '/assets/stage1/monsters/monster3.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/1.swf',
    sourceSymbol: 'Monster3',
    sourceCharacterId: 4,
    cellWidth: 180,
    cellHeight: 180,
    columns: 6,
    rows: 6,
    reachableFrameCount: 27,
    registrationOffset: { x: 20, y: -5 },
  },
} as const satisfies Record<string, MonsterAtlasAssetDefinition>;

export const stage11MonsterAttackAssets = {
  monster30Hit1: stage11MonsterAttack(
    Stage11MonsterAssetKeys.monster30Hit1,
    'monster30-hit1',
    'Monster30Bullet1',
    21,
    10,
  ),
  monster3Hit1: stage11MonsterAttack(
    Stage11MonsterAssetKeys.monster3Hit1,
    'monster3-hit1',
    'Monster3Bullet1',
    70,
    5,
  ),
  monster3Hit2: stage11MonsterAttack(
    Stage11MonsterAssetKeys.monster3Hit2,
    'monster3-hit2',
    'Monster3Bullet2',
    74,
    10,
  ),
} as const satisfies Record<string, MonsterAttackAssetDefinition>;

export const stage12MonsterAtlases = {
  monster2: {
    key: Stage12MonsterAssetKeys.monster2,
    path: '/assets/stage1/monsters/monster2.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/1.swf',
    sourceSymbol: 'Monster2',
    sourceCharacterId: 2,
    cellWidth: 190,
    cellHeight: 190,
    columns: 6,
    rows: 6,
    reachableFrameCount: 25,
    registrationOffset: { x: -20, y: -10 },
  },
  monster4: {
    key: Stage12MonsterAssetKeys.monster4,
    path: '/assets/stage1/monsters/monster4.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/1.swf',
    sourceSymbol: 'Monster4',
    sourceCharacterId: 3,
    cellWidth: 190,
    cellHeight: 190,
    columns: 6,
    rows: 6,
    reachableFrameCount: 26,
    registrationOffset: { x: 0, y: -10 },
  },
  monster7: {
    key: Stage12MonsterAssetKeys.monster7,
    path: '/assets/stage1/monsters/monster7.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/1.swf',
    sourceSymbol: 'Monster7',
    sourceCharacterId: 7,
    cellWidth: 150,
    cellHeight: 150,
    columns: 6,
    rows: 5,
    reachableFrameCount: 20,
    registrationOffset: { x: 3, y: 0 },
  },
  monster8: {
    key: Stage12MonsterAssetKeys.monster8,
    path: '/assets/stage1/monsters/monster8.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/1.swf',
    sourceSymbol: 'Monster8',
    sourceCharacterId: 6,
    cellWidth: 150,
    cellHeight: 150,
    columns: 6,
    rows: 6,
    reachableFrameCount: 25,
    registrationOffset: { x: 14, y: 7 },
  },
} as const satisfies Record<string, MonsterAtlasAssetDefinition>;

export const stage12MonsterAttackAssets = {
  monster2Hit1Start: stage12MonsterAttack(
    Stage12MonsterAssetKeys.monster2Hit1Start,
    'monster2-hit1-1',
    'Monster2Bullet1_1',
    49,
    14,
  ),
  monster2Hit1End: stage12MonsterAttack(
    Stage12MonsterAssetKeys.monster2Hit1End,
    'monster2-hit1-2',
    'Monster2Bullet1_2',
    34,
    20,
  ),
  monster2Hit2: stage12MonsterAttack(
    Stage12MonsterAssetKeys.monster2Hit2,
    'monster2-hit2',
    'Monster2Bullet2',
    30,
    14,
  ),
  monster4Hit1: stage12MonsterAttack(
    Stage12MonsterAssetKeys.monster4Hit1,
    'monster4-hit1',
    'Monster4Bullet1',
    52,
    13,
  ),
  monster4Hit2Start: stage12MonsterAttack(
    Stage12MonsterAssetKeys.monster4Hit2Start,
    'monster4-hit2-1',
    'Monster4Bullet2_1',
    61,
    35,
  ),
  monster4Hit2End: stage12MonsterAttack(
    Stage12MonsterAssetKeys.monster4Hit2End,
    'monster4-hit2-2',
    'Monster4Bullet2_2',
    65,
    20,
  ),
  monster7Hit1: stage12MonsterAttack(
    Stage12MonsterAssetKeys.monster7Hit1,
    'monster7-hit1',
    'Monster7Bullet1',
    75,
    1,
  ),
  monster8Hit1: stage12MonsterAttack(
    Stage12MonsterAssetKeys.monster8Hit1,
    'monster8-hit1',
    'Monster8Bullet1',
    23,
    1,
  ),
  monster8Hit2: stage12MonsterAttack(
    Stage12MonsterAssetKeys.monster8Hit2,
    'monster8-hit2',
    'Monster8Bullet2',
    28,
    4,
  ),
} as const satisfies Record<string, MonsterAttackAssetDefinition>;

export const stage13Monster5Atlas = {
  key: Stage13MonsterAssetKeys.monster5,
  path: '/assets/stage1/monsters/monster5.png',
  status: 'ready',
  source: 'extracted-flash',
  sourcePackage: 'assets/1.swf',
  sourceSymbol: 'Monster5',
  sourceCharacterId: 5,
  cellWidth: 350,
  cellHeight: 350,
  columns: 6,
  rows: 7,
  reachableFrameCount: 31,
  registrationOffset: { x: 30, y: -55 },
} as const satisfies MonsterAtlasAssetDefinition;

export const stage13Monster5AttackAssets = {
  monster5Hit1: stage11MonsterAttack(
    Stage13MonsterAssetKeys.monster5Hit1,
    'monster5-hit1',
    'Monster5Bullet1',
    105,
    4,
  ),
  monster5Hit2Start: stage11MonsterAttack(
    Stage13MonsterAssetKeys.monster5Hit2Start,
    'monster5-hit2-1',
    'Monster5Bullet2_1',
    102,
    10,
  ),
  monster5Hit2End: stage11MonsterAttack(
    Stage13MonsterAssetKeys.monster5Hit2End,
    'monster5-hit2-2',
    'Monster5Bullet2_2',
    93,
    6,
  ),
  monster5Hit3: stage11MonsterAttack(
    Stage13MonsterAssetKeys.monster5Hit3,
    'monster5-hit3',
    'Monster5Bullet3',
    80,
    4,
  ),
} as const satisfies Record<string, MonsterAttackAssetDefinition>;

export const stage21MonsterAtlases = {
  monster6: {
    key: Stage21MonsterAssetKeys.monster6,
    path: '/assets/stage21/monsters/monster6.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/2.swf',
    sourceSymbol: 'Monster6',
    sourceCharacterId: 4,
    cellWidth: 300,
    cellHeight: 400,
    columns: 7,
    rows: 7,
    reachableFrameCount: 32,
    registrationOffset: { x: 0, y: -55 },
  },
  monster9: {
    key: Stage21MonsterAssetKeys.monster9,
    path: '/assets/stage21/monsters/monster9.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/2.swf',
    sourceSymbol: 'Monster9',
    sourceCharacterId: 2,
    cellWidth: 200,
    cellHeight: 200,
    columns: 6,
    rows: 5,
    reachableFrameCount: 20,
    registrationOffset: { x: 9, y: -15 },
  },
  monster10: {
    key: Stage21MonsterAssetKeys.monster10,
    path: '/assets/stage21/monsters/monster10.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/2.swf',
    sourceSymbol: 'Monster10',
    sourceCharacterId: 1,
    cellWidth: 200,
    cellHeight: 200,
    columns: 6,
    rows: 5,
    reachableFrameCount: 20,
    registrationOffset: { x: 22, y: -17 },
  },
  monster19: {
    key: Stage21MonsterAssetKeys.monster19,
    path: '/assets/stage21/monsters/monster19.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/2.swf',
    sourceSymbol: 'Monster19',
    sourceCharacterId: 5,
    cellWidth: 200,
    cellHeight: 200,
    columns: 6,
    rows: 5,
    reachableFrameCount: 22,
    registrationOffset: { x: -35, y: -30 },
  },
} as const satisfies Record<string, Stage21MonsterAtlasAssetDefinition>;

export const stage21AttackAssets = {
  monster6Hit1: stage21Attack(
    Stage21MonsterAssetKeys.monster6Hit1, 'monster6-hit1', 'Monster6Bullet1', 238, 5,
  ),
  monster6Hit2Start: stage21Attack(
    Stage21MonsterAssetKeys.monster6Hit2Start, 'monster6-hit2-start', 'Monster6Bullet2_1', 271, 43,
  ),
  monster6Hit2Rain: stage21Attack(
    Stage21MonsterAssetKeys.monster6Hit2Rain, 'monster6-hit2-rain', 'Monster6Bullet2_2', 261, 30,
  ),
  monster6Hit3: stage21Attack(
    Stage21MonsterAssetKeys.monster6Hit3, 'monster6-hit3', 'Monster6Bullet3', 244, 21,
  ),
  monster9Hit1: stage21Attack(
    Stage21MonsterAssetKeys.monster9Hit1, 'monster9-hit1', 'Monster9Bullet1', 19, 4,
  ),
  monster10Hit1: stage21Attack(
    Stage21MonsterAssetKeys.monster10Hit1, 'monster10-hit1', 'Monster10Bullet1', 11, 4,
  ),
  monster19Hit1: stage21Attack(
    Stage21MonsterAssetKeys.monster19Hit1, 'monster19-hit1', 'Monster19Bullet1', 15, 25,
  ),
} as const satisfies Record<string, Stage21AttackAssetDefinition>;

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
  container: extractedCraftingImage(CraftingAssetKeys.container, '/assets/ui/crafting/container-native.svg', 'assets/backpack1.swf', 'export.strength.StrengthEquipment frame 1 with dynamic txtlh removed', 119),
  fusionPanel: extractedCraftingImage(CraftingAssetKeys.fusionPanel, '/assets/ui/crafting/fusion-panel.png', 'assets/backpack1.swf', 'export.strength.Fusion', 169),
  strengthPanel: extractedCraftingImage(CraftingAssetKeys.strengthPanel, '/assets/ui/crafting/equipment-strength.svg', 'assets/backpack1.swf', 'export.strength.Strength', 198),
  resolutionPanel: extractedCraftingImage(CraftingAssetKeys.resolutionPanel, '/assets/ui/crafting/equipment-resolution.svg', 'assets/backpack1.swf', 'export.strength.Resolution', 177),
  makingPanel: extractedCraftingImage(CraftingAssetKeys.makingPanel, '/assets/ui/crafting/equipment-making.svg', 'assets/backpack1.swf', 'export.strength.Making', 152),
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

export const fullFeatureUiAssets = {
  soulBadge: extractedCraftingImage(
    FullFeatureUiAssetKeys.soulBadge,
    '/assets/ui/feature/shared/soul-badge.png',
    'assets/OtherMat1.swf',
    'export.shop.BuySkill character 250 / shape 236 PatternID_236_2',
    236,
  ),
  soulDigits: extractedCraftingImage(
    FullFeatureUiAssetKeys.soulDigits,
    '/assets/ui/feature/shared/soul-digits.svg',
    'assets/backpack1.swf',
    'DefineEditText 103 embedded FZCuYuan-M03 glyphs 0-9',
    103,
  ),
  backpack: extractedCraftingImage(
    FullFeatureUiAssetKeys.backpack,
    '/assets/ui/feature/backpack/backpack.svg',
    'assets/backpack1.swf',
    'export.pack.BackPack',
    304,
  ),
  backpackGrid: extractedCraftingImage(
    FullFeatureUiAssetKeys.backpackGrid,
    '/assets/ui/feature/backpack/backpack-grid.svg',
    'assets/backpack1.swf',
    'export.pack.BackPackElement',
    246,
  ),
  skillHub: extractedCraftingImage(
    FullFeatureUiAssetKeys.skillHub,
    '/assets/ui/feature/skills/native/base/skill-hub.svg',
    'assets/OtherMat1.swf',
    'export.shop.BuySkill',
    250,
  ),
  skillActive: extractedCraftingImage(
    FullFeatureUiAssetKeys.skillActive,
    '/assets/ui/feature/skills/native/base/skill-active.svg',
    'assets/OtherMat1.swf',
    'export.shop.SkillControl',
    868,
  ),
  skillBind: extractedCraftingImage(
    FullFeatureUiAssetKeys.skillBind,
    '/assets/ui/feature/skills/skill-bind.svg',
    'assets/OtherMat1.swf',
    'export.shop.SkillSetControl',
    417,
  ),
  skillPassive: extractedCraftingImage(
    FullFeatureUiAssetKeys.skillPassive,
    '/assets/ui/feature/skills/native/base/skill-passive.svg',
    'assets/OtherMat1.swf',
    'export.shop.PassiveSkillControl',
    213,
  ),
  petPage: extractedCraftingImage(
    FullFeatureUiAssetKeys.petPage,
    '/assets/ui/feature/pets/pet-page.svg',
    'assets/pet1.swf',
    'export.pet.PetInterface',
    932,
  ),
  magicWeaponPage: extractedCraftingImage(
    FullFeatureUiAssetKeys.magicWeaponPage,
    '/assets/ui/feature/magic-weapon/magic-weapon-page.svg',
    'assets/backpack1.swf',
    'export.strength.SutraInterface',
    596,
  ),
} as const satisfies Record<string, ExtractedImageAssetDefinition>;

function skillNativeSprite(characterId: number, frame: number): ExtractedImageAssetDefinition {
  return extractedCraftingImage(
    `full-ui.skill-native.sprite-${characterId}-${frame}`,
    `/assets/ui/feature/skills/native/sprites/${characterId}/${frame}.svg`,
    'assets/OtherMat1.swf',
    `character ${characterId} frame ${frame}`,
    characterId,
  );
}

function skillNativeButton(
  characterId: number,
  state: 'up' | 'over' | 'down',
): ExtractedImageAssetDefinition {
  return extractedCraftingImage(
    `full-ui.skill-native.button-${characterId}-${state}`,
    `/assets/ui/feature/skills/native/buttons/${characterId}/${state}.svg`,
    'assets/OtherMat1.swf',
    `DefineButton2 ${characterId} ${state}`,
    characterId,
  );
}

export const skillNativeUiCommonAssets = [
  ...SkillNativeUiButtonCharacters.flatMap((characterId) =>
    (['up', 'over', 'down'] as const).map((state) => skillNativeButton(characterId, state))),
  ...SkillNativeUiSelectorCharacters.flatMap((characterId) =>
    [1, 2].map((frame) => skillNativeSprite(characterId, frame))),
  ...SkillNativeUiSlotCharacters.flatMap((characterId) =>
    [1, 2].map((frame) => skillNativeSprite(characterId, frame))),
  ...[597, 608].flatMap((characterId) =>
    [1, 2, 3, 4, 5].map((frame) => skillNativeSprite(characterId, frame))),
  ...[1, 2, 3, 4, 5].map((frame) => skillNativeSprite(212, frame)),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((frame) => skillNativeSprite(865, frame)),
] as const;

export function getSkillNativeHeroUiAssets(
  heroId: number,
): readonly ExtractedImageAssetDefinition[] {
  if (!Number.isInteger(heroId) || heroId < 1 || heroId > 5) {
    throw new RangeError(`Unknown skill UI hero ${heroId}.`);
  }
  return SkillNativeUiIconCharacters
    .slice((heroId - 1) * 10, heroId * 10)
    .flatMap((characterId) =>
      [1, 2, 3].map((frame) => skillNativeSprite(characterId, frame)));
}

export const skillNativeUiAssets = [
  ...skillNativeUiCommonAssets,
  ...[1, 2, 3, 4, 5].flatMap((heroId) => getSkillNativeHeroUiAssets(heroId)),
] as const;

export function getSkillNativeSpriteAsset(
  characterId: number,
  frame: number,
): ExtractedImageAssetDefinition {
  return skillNativeSprite(characterId, frame);
}

export function getSkillNativeButtonAsset(
  characterId: number,
  state: 'up' | 'over' | 'down',
): ExtractedImageAssetDefinition {
  return skillNativeButton(characterId, state);
}

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

export const role1CombatAtlases = {
  body: {
    key: Role1CombatAssetKeys.body,
    path: '/assets/combat/role1/body/body.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/WuKong.swf',
    sourceSymbol: 'ROLE1_0',
    sourceCharacterId: 22,
    cellWidth: 200,
    cellHeight: 200,
    columns: 6,
    rows: 14,
    reachableFrameCount: 58,
    registrationOffset: { x: 5, y: -15 },
  },
  equipment: {
    key: Role1CombatAssetKeys.equipment,
    path: '/assets/combat/role1/body/equipment.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/WuKong.swf',
    sourceSymbol: 'ROLE1_EQUIP_0',
    sourceCharacterId: 21,
    cellWidth: 200,
    cellHeight: 200,
    columns: 6,
    rows: 14,
    reachableFrameCount: 58,
    registrationOffset: { x: 5, y: -15 },
  },
  shadow: {
    key: Role1CombatAssetKeys.shadow,
    path: '/assets/combat/role1/body/1_ROLE1_SHALLDOW.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/WuKong.swf',
    sourceSymbol: 'ROLE1_SHALLDOW',
    sourceCharacterId: 1,
    cellWidth: 200,
    cellHeight: 200,
    columns: 5,
    rows: 3,
    reachableFrameCount: 13,
    registrationOffset: { x: 15, y: -5 },
  },
} as const satisfies Record<string, MonsterAtlasAssetDefinition>;

function createRole1SkillFrames(
  key: string,
  characterId: number,
  symbol: string,
  frameCount: number,
  sourcePackage = 'assets/WuKong.swf',
) {
  const folder = `DefineSprite_${characterId}_${symbol}`;
  return {
    key,
    frameKeys: Array.from({ length: frameCount }, (_, index) => `${key}.frame${index + 1}`),
    framePaths: Array.from(
      { length: frameCount },
      (_, index) => `/assets/combat/role1/skills/${folder}/${index + 1}.png`,
    ),
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage,
    sourceSymbol: symbol,
  } as const;
}

function createRole1CombinedSkillFrames(
  key: string,
  segments: readonly Readonly<{ characterId: number; symbol: string; frameCount: number }>[],
) {
  const frames = segments.flatMap((segment) => Array.from(
    { length: segment.frameCount },
    (_, index) => ({
      key: `${key}.frame${index + 1 + segments
        .slice(0, segments.indexOf(segment))
        .reduce((sum, previous) => sum + previous.frameCount, 0)}`,
      path: `/assets/combat/role1/skills/DefineSprite_${segment.characterId}_${segment.symbol}/${index + 1}.png`,
    }),
  ));
  return {
    key,
    frameKeys: frames.map((frame) => frame.key),
    framePaths: frames.map((frame) => frame.path),
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/WuKong.swf',
    sourceSymbol: segments.map((segment) => segment.symbol).join(' -> '),
  } as const;
}

export const role1SkillVisualAssets = {
  [SkillProjectileEffectKeys.role1SlzHit6]: createRole1SkillFrames(SkillProjectileEffectKeys.role1SlzHit6, 67, 'Role1Bullet6', 6),
  [SkillProjectileEffectKeys.role1HytjHit7]: createRole1SkillFrames(SkillProjectileEffectKeys.role1HytjHit7, 289, 'Role1Bullet7', 15),
  [SkillProjectileEffectKeys.role1LyfbHit8]: createRole1SkillFrames(SkillProjectileEffectKeys.role1LyfbHit8, 305, 'Role1Bullet8_1', 12, 'assets/Role1Effect.swf'),
  [SkillProjectileEffectKeys.role1LyfbHit8_2]: createRole1SkillFrames(SkillProjectileEffectKeys.role1LyfbHit8_2, 252, 'Role1Bullet8_2', 13, 'assets/Role1Effect.swf'),
  [SkillProjectileEffectKeys.role1LysHit9]: createRole1SkillFrames(SkillProjectileEffectKeys.role1LysHit9, 99, 'Role1Bullet9', 10),
  [SkillProjectileEffectKeys.role1HmzHit10_2]: createRole1SkillFrames(SkillProjectileEffectKeys.role1HmzHit10_2, 149, 'Role1Bullet10_2', 25),
  [SkillProjectileEffectKeys.role1HmzHit10_4]: createRole1SkillFrames(SkillProjectileEffectKeys.role1HmzHit10_4, 164, 'Role1Bullet10_4_tmp', 14),
  [SkillProjectileEffectKeys.role1JdyHit11_1]: createRole1SkillFrames(SkillProjectileEffectKeys.role1JdyHit11_1, 311, 'Role1Bullet11_1', 35),
  [SkillProjectileEffectKeys.role1JdyHit11_2]: createRole1SkillFrames(SkillProjectileEffectKeys.role1JdyHit11_2, 312, 'Role1Bullet11_2', 35),
  [SkillProjectileEffectKeys.role1HyjjHit12]: createRole1SkillFrames(SkillProjectileEffectKeys.role1HyjjHit12, 42, 'Role1Bullet12', 15),
  [SkillProjectileEffectKeys.role1HyjjHit12_1]: createRole1CombinedSkillFrames(
    SkillProjectileEffectKeys.role1HyjjHit12_1,
    [
      { characterId: 348, symbol: 'Role1Bullet12_1_1', frameCount: 14 },
      { characterId: 318, symbol: 'Role1Bullet12_1_2', frameCount: 17 },
    ],
  ),
  [SkillProjectileEffectKeys.role1QsezHit13]: createRole1SkillFrames(SkillProjectileEffectKeys.role1QsezHit13, 53, 'Role1Bullet13', 16),
  [SkillProjectileEffectKeys.role1ZzHit14_1]: createRole1SkillFrames(SkillProjectileEffectKeys.role1ZzHit14_1, 362, 'Role1Bullet14_1', 15),
  [SkillProjectileEffectKeys.role1ZzHit14_2]: createRole1SkillFrames(SkillProjectileEffectKeys.role1ZzHit14_2, 373, 'Role1Bullet14_2', 7),
} as const satisfies Record<string, FrameSequenceAssetDefinition>;

function createRole2EffectFrames(
  key: string,
  characterId: number,
  symbol: string,
  frameCount: number,
) {
  const folder = `DefineSprite_${characterId}_${symbol}`;
  return {
    key,
    frameKeys: Array.from({ length: frameCount }, (_, index) => `${key}.frame${index + 1}`),
    framePaths: Array.from(
      { length: frameCount },
      (_, index) => `/assets/combat/role2/skills/${folder}/${index + 1}.png`,
    ),
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/TangSeng1.swf',
    sourceSymbol: symbol,
  } as const;
}

export const role2NormalAttackAssets = {
  [HeroNormalAttackEffectKeys.role2Hit1]: createRole2EffectFrames(
    HeroNormalAttackEffectKeys.role2Hit1, 274, 'Role2Bullet1', 24,
  ),
  [HeroNormalAttackEffectKeys.role2Hit2]: createRole2EffectFrames(
    HeroNormalAttackEffectKeys.role2Hit2, 232, 'Role2Bullet2', 24,
  ),
} as const satisfies Record<string, FrameSequenceAssetDefinition>;

export const role2CombatAtlases = {
  body: {
    key: Role2CombatAssetKeys.body,
    path: '/assets/combat/role2/body/body.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/TangSeng1.swf',
    sourceSymbol: 'ROLE2_0',
    sourceCharacterId: 5,
    cellWidth: 200,
    cellHeight: 200,
    columns: 6,
    rows: 13,
    reachableFrameCount: 50,
    registrationOffset: { x: 15, y: 0 },
  },
  equipment: {
    key: Role2CombatAssetKeys.equipment,
    path: '/assets/combat/role2/body/equipment.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/TangSeng1.swf',
    sourceSymbol: 'ROLE2_EQUIP_0',
    sourceCharacterId: 6,
    cellWidth: 200,
    cellHeight: 200,
    columns: 6,
    rows: 13,
    reachableFrameCount: 50,
    registrationOffset: { x: 15, y: 0 },
  },
  shadow: {
    key: Role2CombatAssetKeys.shadow,
    path: '/assets/combat/role2/body/13_ROLE2_SHALLDOW.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/TangSeng1.swf',
    sourceSymbol: 'ROLE2_SHALLDOW',
    sourceCharacterId: 13,
    cellWidth: 200,
    cellHeight: 200,
    columns: 4,
    rows: 5,
    reachableFrameCount: 14,
    registrationOffset: { x: 15, y: -5 },
  },
} as const satisfies Record<string, MonsterAtlasAssetDefinition>;

export const role2SkillVisualAssets = {
  [SkillProjectileEffectKeys.role2SgqHit5]: createRole2EffectFrames(SkillProjectileEffectKeys.role2SgqHit5, 96, 'Role2Bullet5', 180),
  [SkillProjectileEffectKeys.role2SmbHit4_1]: createRole2EffectFrames(SkillProjectileEffectKeys.role2SmbHit4_1, 281, 'Role2Bullet4_1', 48),
  [SkillProjectileEffectKeys.role2SmbHit4_2]: createRole2EffectFrames(SkillProjectileEffectKeys.role2SmbHit4_2, 325, 'Role2Bullet4_2', 21),
  [SkillProjectileEffectKeys.role2XbzHit3]: createRole2EffectFrames(SkillProjectileEffectKeys.role2XbzHit3, 74, 'Role2Bullet3', 40),
  [SkillProjectileEffectKeys.role2MyhcHit6]: createRole2EffectFrames(SkillProjectileEffectKeys.role2MyhcHit6, 123, 'Role2Bullet6', 26),
  [SkillProjectileEffectKeys.role2JgzHit7]: createRole2EffectFrames(SkillProjectileEffectKeys.role2JgzHit7, 154, 'Role2Bullet7', 22),
  [SkillProjectileEffectKeys.role2TjglHit8]: createRole2EffectFrames(SkillProjectileEffectKeys.role2TjglHit8, 346, 'Role2Bullet8', 25),
  [SkillProjectileEffectKeys.role2JhsjHit9_1]: createRole2EffectFrames(SkillProjectileEffectKeys.role2JhsjHit9_1, 178, 'Role2Bullet9_1', 57),
  [SkillProjectileEffectKeys.role2JhsjHit9_2]: createRole2EffectFrames(SkillProjectileEffectKeys.role2JhsjHit9_2, 159, 'Role2Bullet9_2', 45),
} as const satisfies Record<string, FrameSequenceAssetDefinition>;

export const sourceAssetFamilies = {
  role3To4NormalAttackEffects: {
    status: 'missing-original',
    sourceSymbols: [
      'Role3Bullet1',
      'Role3Bullet2',
      'Role3Bullet3',
      'Role4Bullet1',
      'Role4Bullet2',
      'Role4Bullet3',
      'Role4BulletArrow1',
      'Role4BulletArrow2',
    ],
    notes: 'Normal-attack attachments referenced by Role3 and Role4 but not yet exported from the restored source packages.',
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
  stage11: [
    ...Object.values(stage11Assets),
    ...Object.values(stage11MonsterAtlases),
    ...Object.values(stage11MonsterAttackAssets),
  ],
  stage12: [stage11Assets.floor, ...Object.values(stage12Assets)],
  stage13: [
    stage11Assets.floor,
    ...Object.values(stage13Assets),
    stage13Monster5Atlas,
    ...Object.values(stage13Monster5AttackAssets),
  ],
  stage21: [
    ...Object.values(stage21Assets),
    ...Object.values(stage21MonsterAtlases),
    ...Object.values(stage21AttackAssets),
  ],
  stage22: Object.values(stage22Assets),
} as const;
