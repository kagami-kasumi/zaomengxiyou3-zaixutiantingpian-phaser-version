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
  registrationOrigin?: Readonly<{ x: number; y: number }>;
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

export const MonsterFamily330AssetKeys = {
  monster30: 'monster.monster30.atlas',
  monster3: 'monster.monster3.atlas',
  monster30Hit1: 'projectile.monster30.hit1',
  monster3Hit1: 'projectile.monster3.hit1',
  monster3Hit2: 'projectile.monster3.hit2',
  attackGeometry: 'monster.family-3-30.attack-geometry',
} as const;

export const MonsterFamily2478AssetKeys = {
  monster2: 'monster.monster2.atlas',
  monster4: 'monster.monster4.atlas',
  monster7: 'monster.monster7.atlas',
  monster8: 'monster.monster8.atlas',
  monster2Hit1Start: 'projectile.monster2.hit1-start',
  monster2Hit1End: 'projectile.monster2.hit1-followup',
  monster2Hit2: 'effect.monster2.hit2',
  monster4Hit1: 'projectile.monster4.hit1',
  monster4Hit2Start: 'effect.monster4.hit2-start',
  monster4Hit2End: 'projectile.monster4.hit2-followup',
  monster7Hit1: 'projectile.monster7.hit1',
  monster8Hit1: 'projectile.monster8.hit1',
  monster8Hit2: 'projectile.monster8.hit2',
  attackGeometry: 'monster.family-2-4-7-8.attack-geometry',
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

export const Monster5AssetKeys = {
  monster5: 'monster.monster5.atlas',
  monster5Hit1: 'projectile.monster5.hit1',
  monster5Hit2Start: 'projectile.monster5.hit2-start',
  monster5Hit2End: 'projectile.monster5.hit2-followup',
  monster5Hit3: 'projectile.monster5.hit3',
  attackGeometry: 'monster.monster5.attack-geometry',
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
} as const;

export const Monster16AssetKeys = {
  monster16: 'monster.monster16.atlas',
  monster16Hit1: 'projectile.monster16.hit1',
  monster16Hit2Start: 'projectile.monster16.hit2-start',
  monster16Hit2Followup: 'projectile.monster16.hit2-followup',
  monster16Hit3: 'projectile.monster16.hit3',
  monster16Hit4Start: 'projectile.monster16.hit4-start',
  monster16Hit4Followup: 'projectile.monster16.hit4-followup',
  attackGeometry: 'monster.monster16.attack-geometry',
} as const;

export const MonsterFamily691019AssetKeys = {
  monster6: 'monster.monster6.atlas',
  monster9: 'monster.monster9.atlas',
  monster10: 'monster.monster10.atlas',
  monster19: 'monster.monster19.atlas',
  monster6Hit1: 'projectile.monster6.hit1',
  monster6Hit2Start: 'projectile.monster6.hit2-start',
  monster6Hit2Rain: 'projectile.monster6.hit2-rain',
  monster6Hit3: 'projectile.monster6.hit3',
  monster9Hit1: 'projectile.monster9.hit1',
  monster10Hit1: 'projectile.monster10.hit1',
  monster19Hit1: 'projectile.monster19.hit1',
  attackGeometry: 'monster.family-6-9-10-19.attack-geometry',
} as const;

export const CombatHudAssetKeys = {
  roleInfo: 'combat-hud.role-info',
  role2Portrait: 'combat-hud.role2-portrait',
  role3Portrait: 'combat-hud.role3-portrait',
  role4Portrait: 'combat-hud.role4-portrait',
  role5Portrait: 'combat-hud.role5-portrait',
  bossBlood: 'combat-hud.boss-blood',
} as const;

export const PetCombatHudAssetKeys = {
  shell: 'combat-hud.pet.shell',
  hpFramePrefix: 'combat-hud.pet.hp',
  mpFramePrefix: 'combat-hud.pet.mp',
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
  strengthButtonUp: 'crafting-ui.strength-button.up',
  strengthButtonOver: 'crafting-ui.strength-button.over',
  strengthButtonDown: 'crafting-ui.strength-button.down',
  fusionButtonUp: 'crafting-ui.fusion-button.up',
  fusionButtonOver: 'crafting-ui.fusion-button.over',
  fusionButtonDown: 'crafting-ui.fusion-button.down',
  resolutionButtonUp: 'crafting-ui.resolution-button.up',
  resolutionButtonOver: 'crafting-ui.resolution-button.over',
  resolutionButtonDown: 'crafting-ui.resolution-button.down',
  makingButtonUp: 'crafting-ui.making-button.up',
  makingButtonOver: 'crafting-ui.making-button.over',
  makingButtonDown: 'crafting-ui.making-button.down',
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
  role5SpearHit1: 'normal-attack-effect.hero5.spear.hit1',
  role5SpearHit2: 'normal-attack-effect.hero5.spear.hit2',
  role5SpearHit3: 'normal-attack-effect.hero5.spear.hit3',
  role5SpearHit4: 'normal-attack-effect.hero5.spear.hit4',
  role5SpearHit5: 'normal-attack-effect.hero5.spear.hit5',
  role5SpearRunMissing: 'normal-attack-effect.hero5.spear.unresolved',
  role5SwordHit1: 'normal-attack-effect.hero5.sword.hit1',
  role5SwordHit1Enhanced: 'normal-attack-effect.hero5.sword.hit1.enhanced',
  role5SwordHit2: 'normal-attack-effect.hero5.sword.hit2',
  role5SwordHit2Enhanced: 'normal-attack-effect.hero5.sword.hit2.enhanced',
  role5SwordHit3: 'normal-attack-effect.hero5.sword.hit3',
  role5SwordHit3Enhanced: 'normal-attack-effect.hero5.sword.hit3.enhanced',
  role5SwordHit4: 'normal-attack-effect.hero5.sword.hit4',
  role5SwordHit4Enhanced: 'normal-attack-effect.hero5.sword.hit4.enhanced',
  role5SwordHit5: 'normal-attack-effect.hero5.sword.hit5',
  role5SwordHit5Enhanced: 'normal-attack-effect.hero5.sword.hit5.enhanced',
  role5SwordRunHit: 'normal-attack-effect.hero5.sword.run-hit',
  role5SwordRunHitEnhanced: 'normal-attack-effect.hero5.sword.run-hit.enhanced',
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

export const Role3CombatAssetKeys = {
  body: 'hero-animation.hero3.body',
  equipment: 'hero-animation.hero3.equipment',
  shieldBuff: 'skill-buff.role3.sd.shield',
} as const;

export const Role4CombatAssetKeys = {
  shovelBody0: 'hero-animation.hero4.shovel.body.0',
  arrowBody0: 'hero-animation.hero4.arrow.body.0',
  shovelEquipment0: 'hero-animation.hero4.equipment.0',
  arrowEquipment4: 'hero-animation.hero4.equipment.4',
  mdsBomb: 'skill-effect.role4.mds.bomb',
  speedUp: 'skill-buff.role4.mds.speedup',
} as const;

export const Role5CombatAssetKeys = {
  spearBody0: 'hero-animation.hero5.spear.body.0',
  spearEquipment0: 'hero-animation.hero5.spear.equipment.0',
  yybStatus: 'skill-buff.role5.yyb.status',
  tljStatus: 'skill-effect.role5.tlj.status',
  jrjlCast: 'skill-effect.role5.jrjl.cast',
  jrjlStatus: 'skill-buff.role5.jrjl.status',
  lyshRelease: 'skill-effect.role5.lysh.release',
  escapeBefore: 'normal-attack-effect.hero5.escape.before',
  escapeAfter: 'normal-attack-effect.hero5.escape.after',
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
    monkey1Normal: 'pet-skill.monkey1.normal',
    monkey2Normal: 'pet-skill.monkey2.normal',
    monkey3Normal: 'pet-skill.monkey3.normal',
    monkey4Normal: 'pet-skill.monkey4.normal',
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
    path: '/assets/stages/shared/floors/floor-bg-1.png',
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
    path: '/assets/stages/stage-1-1/scene/background.png',
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
    path: '/assets/stages/stage-1-1/scene/foreground.png',
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
    framePaths: stageFramePaths('/assets/stages/stage-1-1/objects/transfer-door/frames', 20),
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
  role3Portrait: {
    key: CombatHudAssetKeys.role3Portrait,
    path: '/assets/ui/combat-hud/portraits/role3.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/OtherMat1.swf',
    sourceSymbol: 'OtherMat_fla._2233_62 frame 3',
    sourceCharacterId: 505,
  },
  role4Portrait: {
    key: CombatHudAssetKeys.role4Portrait,
    path: '/assets/ui/combat-hud/portraits/role4.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/OtherMat1.swf',
    sourceSymbol: 'OtherMat_fla._2233_62 frame 4',
    sourceCharacterId: 505,
  },
  role5Portrait: {
    key: CombatHudAssetKeys.role5Portrait,
    path: '/assets/ui/combat-hud/portraits/role5.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/OtherMat1.swf',
    sourceSymbol: 'OtherMat_fla._2233_62 frame 5',
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

const petCombatHudBar = (
  keyPrefix: string,
  directory: 'hp' | 'mp',
  sourceCharacterId: 610 | 614,
): FrameSequenceAssetDefinition => ({
  key: keyPrefix,
  frameKeys: Array.from({ length: 25 }, (_, index) => `${keyPrefix}.${index + 1}`),
  framePaths: numberedFramePaths(`/assets/ui/combat-hud/pet/${directory}`, 25),
  status: 'ready',
  source: 'extracted-flash',
  sourcePackage: 'assets/pet1.swf',
  sourceSymbol: `character ${sourceCharacterId} frames 1..25`,
});

export const petCombatHudAssets = {
  shell: {
    key: PetCombatHudAssetKeys.shell,
    path: '/assets/ui/combat-hud/pet/shell.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/pet1.swf',
    sourceSymbol: 'export.pet.ShowPetInfo character 662 / shell character 605',
    sourceCharacterId: 605,
  },
  hp: petCombatHudBar(PetCombatHudAssetKeys.hpFramePrefix, 'hp', 610),
  mp: petCombatHudBar(PetCombatHudAssetKeys.mpFramePrefix, 'mp', 614),
} as const;

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
  root: taskUiAsset('map-service.tasks.root', 'root-static.svg', 'character 85 static children only', 85),
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
    path: '/assets/stages/stage-1-2/scene/background.png',
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
    path: '/assets/stages/stage-1-2/scene/foreground.png',
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
    framePaths: stageFramePaths('/assets/stages/stage-1-2/objects/fb-enter/frames', 30),
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
    path: '/assets/stages/stage-1-2/objects/transfer-door/base.png',
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
    framePaths: stageFramePaths('/assets/stages/stage-1-2/objects/transfer-door/primary', 20),
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
    framePaths: stageFramePaths('/assets/stages/stage-1-2/objects/transfer-door/accent', 19),
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
    path: '/assets/stages/stage-1-3/scene/background.png',
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
    path: '/assets/stages/stage-1-3/scene/foreground.png',
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
    path: '/assets/stages/stage-1-3/objects/transfer-door/base.png',
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
    path: '/assets/stages/shared/floors/floor-bg-2.png',
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
    path: '/assets/stages/stage-2-1/scene/background.png',
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
    path: '/assets/stages/stage-2-1/scene/midground.svg',
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
    path: '/assets/stages/stage-2-1/scene/foreground.svg',
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
    path: '/assets/stages/stage-2-1/objects/transfer-door/base.png',
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
    framePaths: numberedFramePaths('/assets/stages/stage-2-1/hazards/ice-thorn/frames', 66),
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
    path: '/assets/stages/stage-2-2/scene/background.svg',
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
    path: '/assets/stages/stage-2-2/scene/midground.svg',
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
    path: '/assets/stages/stage-2-2/scene/foreground.svg',
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
    path: '/assets/stages/stage-2-2/objects/transfer-door/base.svg',
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
    framePaths: numberedFramePaths('/assets/stages/stage-2-2/hazards/fire-thorn/frames', 130, 'svg'),
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

export const monster16Atlas: Stage21MonsterAtlasAssetDefinition = {
  key: Monster16AssetKeys.monster16,
  path: '/assets/monsters/monster-16/monster16.png',
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

const monster16Attack = (
  key: string,
  directory: string,
  sourceSymbol: string,
  sourceCharacterId: number,
  frameCount: number,
): Stage21AttackAssetDefinition => ({
  key,
  frameKeys: stageFrameKeys(key, frameCount),
  framePaths: numberedFramePaths(`/assets/monsters/monster-16/attacks/${directory}`, frameCount, 'svg'),
  status: 'ready',
  source: 'extracted-flash',
  sourcePackage: 'assets/2.swf',
  sourceSymbol,
  sourceCharacterId,
  frameCount,
  geometryPath: '/assets/monsters/monster-16/attack-frame-geometry.csv',
});

export const monster16AttackAssets = {
  monster16Hit1: monster16Attack(
    Monster16AssetKeys.monster16Hit1,
    'DefineSprite_235_Monster16Bullet1',
    'Monster16Bullet1',
    235,
    20,
  ),
  monster16Hit2Start: monster16Attack(
    Monster16AssetKeys.monster16Hit2Start,
    'DefineSprite_229_Monster16Bullet2_1',
    'Monster16Bullet2_1',
    229,
    4,
  ),
  monster16Hit2Followup: monster16Attack(
    Monster16AssetKeys.monster16Hit2Followup,
    'DefineSprite_225_Monster16Bullet2_2',
    'Monster16Bullet2_2',
    225,
    29,
  ),
  monster16Hit3: monster16Attack(
    Monster16AssetKeys.monster16Hit3,
    'DefineSprite_191_Monster16Bullet3',
    'Monster16Bullet3',
    191,
    15,
  ),
  monster16Hit4Start: monster16Attack(
    Monster16AssetKeys.monster16Hit4Start,
    'DefineSprite_160_Monster16Bullet4_1',
    'Monster16Bullet4_1',
    160,
    16,
  ),
  monster16Hit4Followup: monster16Attack(
    Monster16AssetKeys.monster16Hit4Followup,
    'DefineSprite_143_Monster16Bullet4_2',
    'Monster16Bullet4_2',
    143,
    20,
  ),
} as const;

const monsterFamily691019Attack = (
  key: string,
  directory: string,
  sourceSymbol: string,
  sourceCharacterId: number,
  frameCount: number,
): Stage21AttackAssetDefinition => ({
  key,
  frameKeys: stageFrameKeys(key, frameCount),
  framePaths: numberedFramePaths(`/assets/monsters/family-6-9-10-19/attacks/${directory}`, frameCount),
  status: 'ready',
  source: 'extracted-flash',
  sourcePackage: 'assets/2.swf',
  sourceSymbol,
  sourceCharacterId,
  frameCount,
  geometryPath: '/assets/monsters/family-6-9-10-19/attack-frame-geometry.csv',
});

const extractedSvgMonsterAttack = (
  familyDirectory: 'family-3-30' | 'family-2-4-7-8' | 'monster-5',
  key: string,
  directory: string,
  sourceSymbol: string,
  sourceCharacterId: number,
  frameCount: number,
): MonsterAttackAssetDefinition => ({
  key,
  frameKeys: stageFrameKeys(key, frameCount),
  framePaths: numberedFramePaths(
    `/assets/monsters/${familyDirectory}/attacks/${directory}`,
    frameCount,
    'svg',
  ),
  status: 'ready',
  source: 'extracted-flash',
  sourcePackage: 'assets/1.swf',
  sourceSymbol,
  sourceCharacterId,
  frameCount,
  geometryPath: `/assets/monsters/${familyDirectory}/attack-frame-geometry.csv`,
});

type SvgMonsterAttackArgs = Parameters<typeof extractedSvgMonsterAttack> extends readonly [unknown, ...infer Rest]
  ? Rest
  : never;
const monsterFamily330Attack = (...args: SvgMonsterAttackArgs) =>
  extractedSvgMonsterAttack('family-3-30', ...args);
const monsterFamily2478Attack = (...args: SvgMonsterAttackArgs) =>
  extractedSvgMonsterAttack('family-2-4-7-8', ...args);
const monster5Attack = (...args: SvgMonsterAttackArgs) =>
  extractedSvgMonsterAttack('monster-5', ...args);

export const monsterFamily330Atlases = {
  monster30: {
    key: MonsterFamily330AssetKeys.monster30,
    path: '/assets/monsters/family-3-30/atlases/monster30.png',
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
    key: MonsterFamily330AssetKeys.monster3,
    path: '/assets/monsters/family-3-30/atlases/monster3.png',
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

export const monsterFamily330AttackAssets = {
  monster30Hit1: monsterFamily330Attack(
    MonsterFamily330AssetKeys.monster30Hit1,
    'monster30-hit1',
    'Monster30Bullet1',
    21,
    10,
  ),
  monster3Hit1: monsterFamily330Attack(
    MonsterFamily330AssetKeys.monster3Hit1,
    'monster3-hit1',
    'Monster3Bullet1',
    70,
    5,
  ),
  monster3Hit2: monsterFamily330Attack(
    MonsterFamily330AssetKeys.monster3Hit2,
    'monster3-hit2',
    'Monster3Bullet2',
    74,
    10,
  ),
} as const satisfies Record<string, MonsterAttackAssetDefinition>;

export const monsterFamily2478Atlases = {
  monster2: {
    key: MonsterFamily2478AssetKeys.monster2,
    path: '/assets/monsters/family-2-4-7-8/atlases/monster2.png',
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
    key: MonsterFamily2478AssetKeys.monster4,
    path: '/assets/monsters/family-2-4-7-8/atlases/monster4.png',
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
    key: MonsterFamily2478AssetKeys.monster7,
    path: '/assets/monsters/family-2-4-7-8/atlases/monster7.png',
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
    key: MonsterFamily2478AssetKeys.monster8,
    path: '/assets/monsters/family-2-4-7-8/atlases/monster8.png',
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

export const monsterFamily2478AttackAssets = {
  monster2Hit1Start: monsterFamily2478Attack(
    MonsterFamily2478AssetKeys.monster2Hit1Start,
    'monster2-hit1-1',
    'Monster2Bullet1_1',
    49,
    14,
  ),
  monster2Hit1End: monsterFamily2478Attack(
    MonsterFamily2478AssetKeys.monster2Hit1End,
    'monster2-hit1-2',
    'Monster2Bullet1_2',
    34,
    20,
  ),
  monster2Hit2: monsterFamily2478Attack(
    MonsterFamily2478AssetKeys.monster2Hit2,
    'monster2-hit2',
    'Monster2Bullet2',
    30,
    14,
  ),
  monster4Hit1: monsterFamily2478Attack(
    MonsterFamily2478AssetKeys.monster4Hit1,
    'monster4-hit1',
    'Monster4Bullet1',
    52,
    13,
  ),
  monster4Hit2Start: monsterFamily2478Attack(
    MonsterFamily2478AssetKeys.monster4Hit2Start,
    'monster4-hit2-1',
    'Monster4Bullet2_1',
    61,
    35,
  ),
  monster4Hit2End: monsterFamily2478Attack(
    MonsterFamily2478AssetKeys.monster4Hit2End,
    'monster4-hit2-2',
    'Monster4Bullet2_2',
    65,
    20,
  ),
  monster7Hit1: monsterFamily2478Attack(
    MonsterFamily2478AssetKeys.monster7Hit1,
    'monster7-hit1',
    'Monster7Bullet1',
    75,
    1,
  ),
  monster8Hit1: monsterFamily2478Attack(
    MonsterFamily2478AssetKeys.monster8Hit1,
    'monster8-hit1',
    'Monster8Bullet1',
    23,
    1,
  ),
  monster8Hit2: monsterFamily2478Attack(
    MonsterFamily2478AssetKeys.monster8Hit2,
    'monster8-hit2',
    'Monster8Bullet2',
    28,
    4,
  ),
} as const satisfies Record<string, MonsterAttackAssetDefinition>;

export const monster5Atlas = {
  key: Monster5AssetKeys.monster5,
  path: '/assets/monsters/monster-5/atlases/monster5.png',
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

export const monster5AttackAssets = {
  monster5Hit1: monster5Attack(
    Monster5AssetKeys.monster5Hit1,
    'monster5-hit1',
    'Monster5Bullet1',
    105,
    4,
  ),
  monster5Hit2Start: monster5Attack(
    Monster5AssetKeys.monster5Hit2Start,
    'monster5-hit2-1',
    'Monster5Bullet2_1',
    102,
    10,
  ),
  monster5Hit2End: monster5Attack(
    Monster5AssetKeys.monster5Hit2End,
    'monster5-hit2-2',
    'Monster5Bullet2_2',
    93,
    6,
  ),
  monster5Hit3: monster5Attack(
    Monster5AssetKeys.monster5Hit3,
    'monster5-hit3',
    'Monster5Bullet3',
    80,
    4,
  ),
} as const satisfies Record<string, MonsterAttackAssetDefinition>;

export const monsterFamily691019Atlases = {
  monster6: {
    key: MonsterFamily691019AssetKeys.monster6,
    path: '/assets/monsters/family-6-9-10-19/atlases/monster6.png',
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
    key: MonsterFamily691019AssetKeys.monster9,
    path: '/assets/monsters/family-6-9-10-19/atlases/monster9.png',
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
    key: MonsterFamily691019AssetKeys.monster10,
    path: '/assets/monsters/family-6-9-10-19/atlases/monster10.png',
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
    key: MonsterFamily691019AssetKeys.monster19,
    path: '/assets/monsters/family-6-9-10-19/atlases/monster19.png',
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

export const monsterFamily691019AttackAssets = {
  monster6Hit1: monsterFamily691019Attack(
    MonsterFamily691019AssetKeys.monster6Hit1, 'monster6-hit1', 'Monster6Bullet1', 238, 5,
  ),
  monster6Hit2Start: monsterFamily691019Attack(
    MonsterFamily691019AssetKeys.monster6Hit2Start, 'monster6-hit2-start', 'Monster6Bullet2_1', 271, 43,
  ),
  monster6Hit2Rain: monsterFamily691019Attack(
    MonsterFamily691019AssetKeys.monster6Hit2Rain, 'monster6-hit2-rain', 'Monster6Bullet2_2', 261, 30,
  ),
  monster6Hit3: monsterFamily691019Attack(
    MonsterFamily691019AssetKeys.monster6Hit3, 'monster6-hit3', 'Monster6Bullet3', 244, 21,
  ),
  monster9Hit1: monsterFamily691019Attack(
    MonsterFamily691019AssetKeys.monster9Hit1, 'monster9-hit1', 'Monster9Bullet1', 19, 4,
  ),
  monster10Hit1: monsterFamily691019Attack(
    MonsterFamily691019AssetKeys.monster10Hit1, 'monster10-hit1', 'Monster10Bullet1', 11, 4,
  ),
  monster19Hit1: monsterFamily691019Attack(
    MonsterFamily691019AssetKeys.monster19Hit1, 'monster19-hit1', 'Monster19Bullet1', 15, 25,
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
  container: extractedCraftingImage(CraftingAssetKeys.container, '/assets/ui/crafting/container-native.svg', 'assets/backpack1.swf', 'export.strength.StrengthEquipment frame 1 with runtime-projected txtlh/pager objects removed', 119),
  fusionPanel: extractedCraftingImage(CraftingAssetKeys.fusionPanel, '/assets/ui/crafting/fusion-panel.png', 'assets/backpack1.swf', 'export.strength.Fusion', 169),
  strengthPanel: extractedCraftingImage(CraftingAssetKeys.strengthPanel, '/assets/ui/crafting/equipment-strength.svg', 'assets/backpack1.swf', 'export.strength.Strength', 198),
  resolutionPanel: extractedCraftingImage(CraftingAssetKeys.resolutionPanel, '/assets/ui/crafting/equipment-resolution.svg', 'assets/backpack1.swf', 'export.strength.Resolution', 177),
  makingPanel: extractedCraftingImage(CraftingAssetKeys.makingPanel, '/assets/ui/crafting/equipment-making.svg', 'assets/backpack1.swf', 'export.strength.Making', 152),
  strengthButtonUp: extractedCraftingImage(CraftingAssetKeys.strengthButtonUp, '/assets/ui/crafting/buttons/strength-up.svg', 'assets/backpack1.swf', 'export.strength.Strength qhbtn up', 182),
  strengthButtonOver: extractedCraftingImage(CraftingAssetKeys.strengthButtonOver, '/assets/ui/crafting/buttons/strength-over.svg', 'assets/backpack1.swf', 'export.strength.Strength qhbtn over', 184),
  strengthButtonDown: extractedCraftingImage(CraftingAssetKeys.strengthButtonDown, '/assets/ui/crafting/buttons/strength-down.svg', 'assets/backpack1.swf', 'export.strength.Strength qhbtn down', 184),
  fusionButtonUp: extractedCraftingImage(CraftingAssetKeys.fusionButtonUp, '/assets/ui/crafting/buttons/fusion-up.svg', 'assets/backpack1.swf', 'export.strength.Fusion rlbtn up', 161),
  fusionButtonOver: extractedCraftingImage(CraftingAssetKeys.fusionButtonOver, '/assets/ui/crafting/buttons/fusion-over.svg', 'assets/backpack1.swf', 'export.strength.Fusion rlbtn over', 163),
  fusionButtonDown: extractedCraftingImage(CraftingAssetKeys.fusionButtonDown, '/assets/ui/crafting/buttons/fusion-down.svg', 'assets/backpack1.swf', 'export.strength.Fusion rlbtn down', 163),
  resolutionButtonUp: extractedCraftingImage(CraftingAssetKeys.resolutionButtonUp, '/assets/ui/crafting/buttons/resolution-up.svg', 'assets/backpack1.swf', 'export.strength.Resolution fjbtn up', 173),
  resolutionButtonOver: extractedCraftingImage(CraftingAssetKeys.resolutionButtonOver, '/assets/ui/crafting/buttons/resolution-over.svg', 'assets/backpack1.swf', 'export.strength.Resolution fjbtn over', 175),
  resolutionButtonDown: extractedCraftingImage(CraftingAssetKeys.resolutionButtonDown, '/assets/ui/crafting/buttons/resolution-down.svg', 'assets/backpack1.swf', 'export.strength.Resolution fjbtn down', 175),
  makingButtonUp: extractedCraftingImage(CraftingAssetKeys.makingButtonUp, '/assets/ui/crafting/buttons/making-up.svg', 'assets/backpack1.swf', 'export.strength.Making dzbtn up', 136),
  makingButtonOver: extractedCraftingImage(CraftingAssetKeys.makingButtonOver, '/assets/ui/crafting/buttons/making-over.svg', 'assets/backpack1.swf', 'export.strength.Making dzbtn over', 138),
  makingButtonDown: extractedCraftingImage(CraftingAssetKeys.makingButtonDown, '/assets/ui/crafting/buttons/making-down.svg', 'assets/backpack1.swf', 'export.strength.Making dzbtn down', 138),
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

function magicWeaponNativeImage(
  key: string,
  path: string,
  sourceSymbol: string,
  sourceCharacterId: number,
): ExtractedImageAssetDefinition {
  return extractedCraftingImage(key, path, 'assets/backpack1.swf', sourceSymbol, sourceCharacterId);
}

export const magicWeaponNativeUiAssets = {
  overlays: {
    upgrade: magicWeaponNativeImage(
      'full-ui.magic-weapon-native.upgrade-confirm',
      '/assets/ui/feature/magic-weapon/native/overlays/upgrade-confirm.svg',
      'updataFBWithLvdyl',
      200,
    ),
    shared: magicWeaponNativeImage(
      'full-ui.magic-weapon-native.shared-confirm',
      '/assets/ui/feature/magic-weapon/native/overlays/shared-confirm.svg',
      'renewalseThisSZ',
      34,
    ),
  },
  buttons: Object.fromEntries([19, 24, 31, 368, 436].map((characterId) => [
    characterId,
    Object.fromEntries((['up', 'over', 'down'] as const).map((state) => [
      state,
      magicWeaponNativeImage(
        `full-ui.magic-weapon-native.button-${characterId}-${state}`,
        `/assets/ui/feature/magic-weapon/native/buttons/${characterId}/${state}.png`,
        `DefineButton2 ${characterId} ${state}`,
        characterId,
      ),
    ])),
  ])) as Record<number, Record<'up' | 'over' | 'down', ExtractedImageAssetDefinition>>,
} as const;

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

const PetNativeHeadCharacterByPetName = {
  dragon1: 9, dragon2: 13, dragon3: 16, dragon4: 23,
  horse1: 1, horse2: 3, horse3: 5, horse4: 19,
  ufo1: 10, ufo2: 21, ufo3: 6,
  monkey1: 14, monkey2: 2, monkey3: 4, monkey4: 20,
  phoenix1: 12, phoenix2: 17, phoenix3: 8, phoenix4: 24,
  tigress4: 18,
  turtle1: 7, turtle2: 11, turtle3: 15, turtle4: 22,
} as const;

const PetNativeSkillCharacterByKey = {
  tsml: 130, zrsh: 157, smzf: 136, mfby: 806, qlfj: 79,
  sxkb: 707, fsnl: 234, smjc: 134, mfjc: 830, gjjc: 77, fyjc: 109,
  xj: 127, lj: 478, lyq: 224, jgaoyi: 326,
  sp: 107, bd: 731, bz: 755, tmaoyi: 574,
  fs: 305, sdcc: 514, ltwj: 335, qlaoyi: 106,
  sld: 206, txlj: 189, sybh: 173, xwaoyi: 609,
  pms: 312, ss: 280, kmsk: 296,
  hy: 469, sxhz: 282, hsqj: 447, bhaoyi: 658,
  np: 118, bshn: 120, dhly: 115, zqaoyi: 655,
  yg: 633, jf: 550, bs: 360, ysaoyi: 145,
  sc: 683, hxfb: 132, zsaoyi: 877,
} as const;

function petNativeImage(
  key: string,
  path: string,
  sourcePackage: string,
  sourceSymbol: string,
  sourceCharacterId: number,
): ExtractedImageAssetDefinition {
  return extractedCraftingImage(key, path, sourcePackage, sourceSymbol, sourceCharacterId);
}

export const petNativeUiAssets = {
  row: petNativeImage('full-ui.pet-native.row', '/assets/ui/feature/pets/native/pet-list-row.svg', 'assets/pet1.swf', 'petlist', 1224),
  tooltip: petNativeImage('full-ui.pet-native.tooltip', '/assets/ui/feature/pets/native/skill-tooltip.svg', 'assets/pet1.swf', 'skillIntro', 1228),
  releaseConfirm: petNativeImage('full-ui.pet-native.release-confirm', '/assets/ui/feature/pets/native/release-confirm.svg', 'assets/pet1.swf', 'giveUpThisPet', 1221),
  buttons: Object.fromEntries([835, 840, 845, 883].map((characterId) => [
    characterId,
    Object.fromEntries((['up', 'over', 'down'] as const).map((state) => [
      state,
      petNativeImage(
        `full-ui.pet-native.button-${characterId}-${state}`,
        `/assets/ui/feature/pets/native/buttons/${characterId}/${state}.png`,
        'assets/pet1.swf',
        `DefineButton2 ${characterId} ${state}`,
        characterId,
      ),
    ])),
  ])) as Record<number, Record<'up' | 'over' | 'down', ExtractedImageAssetDefinition>>,
} as const;

function getPetHeadSymbol(petName: string): string {
  const species = petName.slice(0, -1);
  const prefix = species === 'ufo'
    ? 'Kabu'
    : species === 'tigress'
      ? 'Tiger'
      : `${species[0].toUpperCase()}${species.slice(1)}`;
  return `Pet${prefix}Bmd${petName.at(-1)}`;
}

export const petNativeHeadAssets = Object.fromEntries(
  Object.entries(PetNativeHeadCharacterByPetName).map(([petName, characterId]) => {
    const symbol = getPetHeadSymbol(petName);
    return [petName, petNativeImage(
      `full-ui.pet-native.head-${petName}`,
      `/assets/ui/feature/pets/native/heads/${symbol}.png`,
      'assets/pet1.swf',
      symbol,
      characterId,
    )];
  }),
) as Record<keyof typeof PetNativeHeadCharacterByPetName, ExtractedImageAssetDefinition>;

export const petNativeSkillAssets = Object.fromEntries(
  Object.entries(PetNativeSkillCharacterByKey).map(([skillKey, characterId]) => [
    skillKey,
    petNativeImage(
      `full-ui.pet-native.skill-${skillKey}`,
      `/assets/ui/feature/pets/native/skills/petskill_${skillKey}.png`,
      'assets/EIcon1.swf',
      `petskill_${skillKey}`,
      characterId,
    ),
  ]),
) as Record<keyof typeof PetNativeSkillCharacterByKey, ExtractedImageAssetDefinition>;

export function getPetNativeHeadAsset(petName: string): ExtractedImageAssetDefinition | undefined {
  return petNativeHeadAssets[petName as keyof typeof petNativeHeadAssets];
}

export function getPetNativeSkillAsset(skillKey: string): ExtractedImageAssetDefinition | undefined {
  return petNativeSkillAssets[skillKey as keyof typeof petNativeSkillAssets];
}

export function getPetNativeProgressAsset(characterId: number, frame: number): ExtractedImageAssetDefinition {
  return petNativeImage(
    `full-ui.pet-native.progress-${characterId}-${frame}`,
    `/assets/ui/feature/pets/native/progress/${characterId}/${frame}.svg`,
    'assets/pet1.swf',
    `character ${characterId} frame ${frame}`,
    characterId,
  );
}

export function getPetNativeQualityAsset(frame: number): ExtractedImageAssetDefinition {
  return petNativeImage(
    `full-ui.pet-native.quality-${frame}`,
    `/assets/ui/feature/pets/native/quality/${frame}.svg`,
    'assets/pet1.swf',
    `character 891 frame ${frame}`,
    891,
  );
}

function createRole1NormalAttackFrames(
  symbol: string,
  frameCount: number,
  registrationOrigin: Readonly<{ x: number; y: number }>,
) {
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
    registrationOrigin,
  } as const;
}

export const role1NormalAttackAssets = {
  [HeroNormalAttackEffectKeys.role1Hit1]: createRole1NormalAttackFrames('Role1Bullet1', 8, { x: 40 / 207, y: 25 / 89 }),
  [HeroNormalAttackEffectKeys.role1Hit3]: createRole1NormalAttackFrames('Role1Bullet3', 11, { x: 208.45 / 380, y: 53.25 / 295 }),
  [HeroNormalAttackEffectKeys.role1Hit4]: createRole1NormalAttackFrames('Role1Bullet4', 4, { x: 15.95 / 379, y: 18.65 / 83 }),
  [HeroNormalAttackEffectKeys.role1Hit5]: createRole1NormalAttackFrames('Role1Bullet5', 4, { x: 70.5 / 390, y: 6.95 / 73 }),
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
  [HeroNormalAttackEffectKeys.role2Hit1]: {
    ...createRole2EffectFrames(HeroNormalAttackEffectKeys.role2Hit1, 274, 'Role2Bullet1', 24),
    registrationOrigin: { x: 493 / 592, y: 94.95 / 180 },
  },
  [HeroNormalAttackEffectKeys.role2Hit2]: {
    ...createRole2EffectFrames(HeroNormalAttackEffectKeys.role2Hit2, 232, 'Role2Bullet2', 24),
    registrationOrigin: { x: 1289 / 1414, y: 130 / 259 },
  },
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

function createRole3EffectFrames(
  key: string,
  characterId: number,
  symbol: string,
  frameCount: number,
  registrationOrigin: Readonly<{ x: number; y: number }>,
) {
  const folder = `DefineSprite_${characterId}_${symbol}`;
  return {
    key,
    frameKeys: Array.from({ length: frameCount }, (_, index) => `${key}.frame${index + 1}`),
    framePaths: Array.from(
      { length: frameCount },
      (_, index) => `/assets/combat/role3/skills/${folder}/${index + 1}.png`,
    ),
    registrationOrigin,
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/BaJie.swf',
    sourceSymbol: symbol,
  } as const;
}

export const role3CombatAtlases = {
  body: {
    key: Role3CombatAssetKeys.body,
    path: '/assets/combat/role3/body/body.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/BaJie.swf',
    sourceSymbol: 'ROLE3_0',
    sourceCharacterId: 20,
    cellWidth: 300,
    cellHeight: 200,
    columns: 6,
    rows: 14,
    reachableFrameCount: 58,
    registrationOffset: { x: -15, y: 0 },
  },
  equipment: {
    key: Role3CombatAssetKeys.equipment,
    path: '/assets/combat/role3/body/equipment.png',
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/BaJie.swf',
    sourceSymbol: 'ROLE3_EQUIP_0',
    sourceCharacterId: 15,
    cellWidth: 300,
    cellHeight: 200,
    columns: 6,
    rows: 14,
    reachableFrameCount: 58,
    registrationOffset: { x: -15, y: 0 },
  },
} as const satisfies Record<string, MonsterAtlasAssetDefinition>;

export const role3NormalAttackAssets = {
  [HeroNormalAttackEffectKeys.role3Hit1]: createRole3EffectFrames(
    HeroNormalAttackEffectKeys.role3Hit1, 45, 'Role3Bullet1', 11, { x: 24.7 / 232.6, y: 25.05 / 176.1 },
  ),
  [HeroNormalAttackEffectKeys.role3Hit2]: createRole3EffectFrames(
    HeroNormalAttackEffectKeys.role3Hit2, 81, 'Role3Bullet2', 13, { x: 253 / 948, y: 132 / 353 },
  ),
  [HeroNormalAttackEffectKeys.role3Hit3]: createRole3EffectFrames(
    HeroNormalAttackEffectKeys.role3Hit3, 54, 'Role3Bullet3', 5, { x: 36 / 295.8, y: -4 / 253.7 },
  ),
} as const satisfies Record<string, FrameSequenceAssetDefinition>;

export const role3ShieldBuffAsset = createRole3EffectFrames(
  Role3CombatAssetKeys.shieldBuff, 256, 'Role3Bullet5Buff', 19, { x: 53 / 152, y: 9 / 175 },
);

export const role3SkillVisualAssets = {
  [SkillProjectileEffectKeys.role3DjHit4]: createRole3EffectFrames(
    SkillProjectileEffectKeys.role3DjHit4, 288, 'Role3Bullet4', 30, { x: 90.7 / 190, y: -12.9 / 73 },
  ),
  [SkillProjectileEffectKeys.role3SdHit5]: createRole3EffectFrames(
    SkillProjectileEffectKeys.role3SdHit5, 281, 'Role3Bullet5', 12, { x: 77.1 / 309, y: 11.05 / 206 },
  ),
  [SkillProjectileEffectKeys.role3ZznhHit6]: createRole3EffectFrames(
    SkillProjectileEffectKeys.role3ZznhHit6, 340, 'Role3Bullet6', 15, { x: -5 / 182, y: -6 / 186 },
  ),
  [SkillProjectileEffectKeys.role3SyzqHit7_1]: createRole3EffectFrames(
    SkillProjectileEffectKeys.role3SyzqHit7_1, 203, 'Role3Bullet7_1', 11, { x: 61 / 250, y: 35 / 300 },
  ),
  [SkillProjectileEffectKeys.role3SyzqHit7_2]: createRole3EffectFrames(
    SkillProjectileEffectKeys.role3SyzqHit7_2, 169, 'Role3Bullet7_2', 12, { x: 42 / 350, y: 79.35 / 321 },
  ),
  [SkillProjectileEffectKeys.role3SspHit8_1]: createRole3EffectFrames(
    SkillProjectileEffectKeys.role3SspHit8_1, 144, 'Role3Bullet8_1', 4, { x: 7.25 / 76, y: 0 },
  ),
  [SkillProjectileEffectKeys.role3SspHit8_2]: createRole3EffectFrames(
    SkillProjectileEffectKeys.role3SspHit8_2, 134, 'Role3Bullet8_2', 30, { x: 618.7 / 880, y: 16.2 / 162 },
  ),
  [SkillProjectileEffectKeys.role3JspHit9]: createRole3EffectFrames(
    SkillProjectileEffectKeys.role3JspHit9, 238, 'Role3Bullet9', 17, { x: 49.7 / 398, y: 38.6 / 275 },
  ),
  [SkillProjectileEffectKeys.role3DgqHit10]: createRole3EffectFrames(
    SkillProjectileEffectKeys.role3DgqHit10, 309, 'Role3Bullet10', 30, { x: 25 / 200, y: 19 / 120 },
  ),
  [SkillProjectileEffectKeys.role3XgqHit11]: createRole3EffectFrames(
    SkillProjectileEffectKeys.role3XgqHit11, 93, 'Role3Bullet11', 27, { x: 90.2 / 672, y: 180.95 / 326 },
  ),
  [SkillProjectileEffectKeys.role3TmcHit12_1]: createRole3EffectFrames(
    SkillProjectileEffectKeys.role3TmcHit12_1, 108, 'Role3Bullet12_1', 160, { x: 99 / 183, y: 111.1 / 180 },
  ),
  [SkillProjectileEffectKeys.role3TmcHit12_2]: createRole3EffectFrames(
    SkillProjectileEffectKeys.role3TmcHit12_2, 125, 'Role3Bullet12_2', 1, { x: 35 / 71, y: 36.55 / 71 },
  ),
} as const satisfies Record<string, FrameSequenceAssetDefinition>;

type Role4BodyFamilyAssetDefinition = LoadableAssetDefinition & Readonly<{
  form: 'shovel' | 'arrow' | 'equipment';
  appearanceId: number;
  sourcePackage: string;
  sourceSymbol: string;
  cellWidth: 200;
  cellHeight: 200;
  columns: 6;
  rows: 14;
}>;

const role4Sheet = (
  form: Role4BodyFamilyAssetDefinition['form'],
  appearanceId: number,
  fileName: string,
  sourcePackage = 'assets/ShaShen.swf',
): Role4BodyFamilyAssetDefinition => ({
  key: `hero-animation.hero4.${form === 'equipment' ? 'equipment' : `${form}.body`}.${appearanceId}`,
  path: `/assets/combat/role4/body/${sourcePackage === 'assets/ShaShen.swf' ? 'main' : 'extra'}/${fileName}`,
  status: 'ready',
  source: 'extracted-flash',
  form,
  appearanceId,
  sourcePackage,
  sourceSymbol: `ROLE4_${form === 'equipment' ? 'EQUIP' : form.toUpperCase()}_${appearanceId}`,
  cellWidth: 200,
  cellHeight: 200,
  columns: 6,
  rows: 14,
});

export const role4BodyFamilyAssets = {
  shovel0: role4Sheet('shovel', 0, '36_ROLE4_SHOVEL_0.png'),
  shovel1: role4Sheet('shovel', 1, '38_ROLE4_SHOVEL_1.png'),
  shovel2: role4Sheet('shovel', 2, '32_ROLE4_SHOVEL_2.png'),
  shovel3: role4Sheet('shovel', 3, '26_ROLE4_SHOVEL_3.png'),
  shovel4: role4Sheet('shovel', 4, '24_ROLE4_SHOVEL_4.png'),
  shovel5: role4Sheet('shovel', 5, '8_ROLE4_SHOVEL_5.png', 'assets/20120119.swf'),
  shovel6: role4Sheet('shovel', 6, '3_ROLE4_SHOVEL_6.png', 'assets/20120117.swf'),
  shovel7: role4Sheet('shovel', 7, '12_ROLE4_SHOVEL_7.png', 'assets/20120119.swf'),
  shovel8: role4Sheet('shovel', 8, '4_ROLE4_SHOVEL_8.png', 'assets/20120203.swf'),
  shovel9: role4Sheet('shovel', 9, '28_ROLE4_SHOVEL_9.png'),
  shovel10: role4Sheet('shovel', 10, '9_ROLE4_SHOVEL_10.png', 'assets/20120808.swf'),
  shovel11: role4Sheet('shovel', 11, '6_ROLE4_SHOVEL_11.png'),
  shovel112: role4Sheet('shovel', 112, '17_ROLE4_SHOVEL_112.png'),
  shovel113: role4Sheet('shovel', 113, '15_ROLE4_SHOVEL_113.png'),
  shovel114: role4Sheet('shovel', 114, '13_ROLE4_SHOVEL_114.png'),
  shovel115: role4Sheet('shovel', 115, '19_ROLE4_SHOVEL_115.png'),
  shovel222: role4Sheet('shovel', 222, '11_ROLE4_SHOVEL_222.png'),
  shovel6666: role4Sheet('shovel', 6666, '2_ROLE4_SHOVEL_6666.png'),
  arrow0: role4Sheet('arrow', 0, '37_ROLE4_ARROW_0.png'),
  arrow1: role4Sheet('arrow', 1, '4_ROLE4_ARROW_1.png'),
  arrow2: role4Sheet('arrow', 2, '33_ROLE4_ARROW_2.png'),
  arrow3: role4Sheet('arrow', 3, '27_ROLE4_ARROW_3.png'),
  arrow4: role4Sheet('arrow', 4, '25_ROLE4_ARROW_4.png'),
  arrow5: role4Sheet('arrow', 5, '14_ROLE4_ARROW_5.png', 'assets/20120119.swf'),
  arrow6: role4Sheet('arrow', 6, '4_ROLE4_ARROW_6.png', 'assets/20120117.swf'),
  arrow7: role4Sheet('arrow', 7, '13_ROLE4_ARROW_7.png', 'assets/20120119.swf'),
  arrow8: role4Sheet('arrow', 8, '3_ROLE4_ARROW_8.png', 'assets/20120203.swf'),
  arrow9: role4Sheet('arrow', 9, '21_ROLE4_ARROW_9.png'),
  arrow10: role4Sheet('arrow', 10, '8_ROLE4_ARROW_10.png', 'assets/20120808.swf'),
  arrow11: role4Sheet('arrow', 11, '7_ROLE4_ARROW_11.png'),
  arrow112: role4Sheet('arrow', 112, '16_ROLE4_ARROW_112.png'),
  arrow113: role4Sheet('arrow', 113, '14_ROLE4_ARROW_113.png'),
  arrow114: role4Sheet('arrow', 114, '12_ROLE4_ARROW_114.png'),
  arrow115: role4Sheet('arrow', 115, '18_ROLE4_ARROW_115.png'),
  arrow222: role4Sheet('arrow', 222, '10_ROLE4_ARROW_222.png'),
  arrow6666: role4Sheet('arrow', 6666, '3_ROLE4_ARROW_6666.png'),
  equipment0: role4Sheet('equipment', 0, '31_ROLE4_EQUIP_0.png'),
  equipment1: role4Sheet('equipment', 1, '23_ROLE4_EQUIP_1.png'),
  equipment2: role4Sheet('equipment', 2, '29_ROLE4_EQUIP_2.png'),
  equipment3: role4Sheet('equipment', 3, '30_ROLE4_EQUIP_3.png'),
  equipment4: role4Sheet('equipment', 4, '22_ROLE4_EQUIP_4.png'),
  equipment5: role4Sheet('equipment', 5, '34_ROLE4_EQUIP_5.png'),
  equipment6: role4Sheet('equipment', 6, '6_ROLE4_EQUIP_6.png', 'assets/20120119.swf'),
  equipment9: role4Sheet('equipment', 9, '20_ROLE4_EQUIP_9.png'),
  equipment10: role4Sheet('equipment', 10, '5_ROLE4_EQUIP_10.png'),
  equipment11: role4Sheet('equipment', 11, '39_ROLE4_EQUIP_11.png'),
  equipment222: role4Sheet('equipment', 222, '9_ROLE4_EQUIP_222.png'),
  equipment998: role4Sheet('equipment', 998, '19_ROLE4_EQUIP_998.png', 'assets/MagicWeapon2.swf'),
  equipment999: role4Sheet('equipment', 999, '8_ROLE4_EQUIP_999.png'),
  equipment6666: role4Sheet('equipment', 6666, '1_ROLE4_EQUIP_6666.png'),
} as const satisfies Record<string, Role4BodyFamilyAssetDefinition>;

const role4Origin = (bounds: readonly [number, number, number, number]) => ({
  x: -bounds[0] / (bounds[2] - bounds[0]),
  y: -bounds[1] / (bounds[3] - bounds[1]),
});

function createRole4EffectFrames(
  key: string,
  characterId: number,
  symbol: string,
  frameCount: number,
  bounds: readonly [number, number, number, number],
  folder = 'skills',
  sourcePackage = 'assets/ShaShen.swf',
) {
  const directory = `DefineSprite_${characterId}_${symbol}`;
  return {
    key,
    frameKeys: Array.from({ length: frameCount }, (_, index) => `${key}.frame${index + 1}`),
    framePaths: Array.from(
      { length: frameCount },
      (_, index) => `/assets/combat/role4/${folder}/${directory}/${index + 1}.svg`,
    ),
    registrationOrigin: role4Origin(bounds),
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage,
    sourceSymbol: symbol,
  } as const;
}

export const role4NormalAttackAssets = {
  [HeroNormalAttackEffectKeys.role4ShovelHit1]: createRole4EffectFrames(HeroNormalAttackEffectKeys.role4ShovelHit1, 256, 'Role4Bullet1', 7, [-104, -51, 108, 44.7]),
  [HeroNormalAttackEffectKeys.role4ShovelHit2]: createRole4EffectFrames(HeroNormalAttackEffectKeys.role4ShovelHit2, 286, 'Role4Bullet2', 11, [-143, -103, 71, 81]),
  [HeroNormalAttackEffectKeys.role4ShovelHit3]: createRole4EffectFrames(HeroNormalAttackEffectKeys.role4ShovelHit3, 265, 'Role4Bullet3', 4, [-113, -46, 114.85, 52.8]),
  [HeroNormalAttackEffectKeys.role4ArrowHit1]: createRole4EffectFrames(HeroNormalAttackEffectKeys.role4ArrowHit1, 68, 'Role4BulletArrow1', 12, [-374.4, -44, 159, 64]),
  [HeroNormalAttackEffectKeys.role4ArrowHit3]: createRole4EffectFrames(HeroNormalAttackEffectKeys.role4ArrowHit3, 71, 'Role4BulletArrow2', 15, [-366.1, -150.65, 169.8, 134.9]),
} as const satisfies Record<string, FrameSequenceAssetDefinition>;

const role4DollAsset = {
  key: SkillProjectileEffectKeys.role4WdwwDoll,
  frameKeys: Array.from({ length: 6 }, (_, index) => `${SkillProjectileEffectKeys.role4WdwwDoll}.frame${index + 1}`),
  framePaths: Array.from({ length: 6 }, (_, index) => `/assets/combat/role4/summons/${index + 1}.png`),
  registrationOrigin: { x: 0.5, y: 0.5 },
  status: 'ready',
  source: 'extracted-flash',
  sourcePackage: 'assets/ShaShen.swf',
  sourceSymbol: 'Role4Hit5',
} as const;

export const role4SkillVisualAssets = {
  [SkillProjectileEffectKeys.role4ZqShovelHit4]: createRole4EffectFrames(SkillProjectileEffectKeys.role4ZqShovelHit4, 328, 'Role4Bullet4', 20, [13, 10.9, 252.95, 170.85]),
  [SkillProjectileEffectKeys.role4ZqArrowHit4]: createRole4EffectFrames(SkillProjectileEffectKeys.role4ZqArrowHit4, 75, 'Role4BulletArrow4', 13, [-543.5, -30.85, 43.9, 34.65]),
  [SkillProjectileEffectKeys.role4JdzHit7_1]: createRole4EffectFrames(SkillProjectileEffectKeys.role4JdzHit7_1, 418, 'Role4Bullet7_1', 238, [-41.55, 71.6, 244.8, 126.9]),
  [SkillProjectileEffectKeys.role4JdzHit7_2]: createRole4EffectFrames(SkillProjectileEffectKeys.role4JdzHit7_2, 423, 'Role4Bullet7_2', 230, [-768, -384, 960, 576]),
  [SkillProjectileEffectKeys.role4WdwwHit5]: createRole4EffectFrames(SkillProjectileEffectKeys.role4WdwwHit5, 332, 'Role4Bullet5', 15, [-648.4, -874.7, 950.95, 1101.75]),
  [SkillProjectileEffectKeys.role4WdwwDoll]: role4DollAsset,
  [SkillProjectileEffectKeys.role4MbyjHit6]: createRole4EffectFrames(SkillProjectileEffectKeys.role4MbyjHit6, 411, 'Role4Bullet6', 1, [-28, -29, 69.2, 72.3]),
  [SkillProjectileEffectKeys.role4QljShovelHit8]: createRole4EffectFrames(SkillProjectileEffectKeys.role4QljShovelHit8, 373, 'Role4Bullet8', 5, [-69.05, -8.7, 135.9, 88.05]),
  [SkillProjectileEffectKeys.role4QljArrowHit8_1]: createRole4EffectFrames(SkillProjectileEffectKeys.role4QljArrowHit8_1, 157, 'Role4BulletArrow8_1', 9, [0, 0, 124.2, 128.1]),
  [SkillProjectileEffectKeys.role4QljArrowHit8_2]: createRole4EffectFrames(SkillProjectileEffectKeys.role4QljArrowHit8_2, 153, 'Role4BulletArrow8_2', 17, [-91.4, -22.05, 59.3, 102.25]),
  [SkillProjectileEffectKeys.role4TkjShovelHit9_1]: createRole4EffectFrames(SkillProjectileEffectKeys.role4TkjShovelHit9_1, 366, 'Role4Bullet9_1', 9, [-52.55, -22.8, 67.2, 57.85]),
  [SkillProjectileEffectKeys.role4TkjShovelHit9_2]: createRole4EffectFrames(SkillProjectileEffectKeys.role4TkjShovelHit9_2, 347, 'Role4Bullet9_2', 7, [-48, -143.2, 61.35, 127.6]),
  [SkillProjectileEffectKeys.role4TkjArrowHit9_1]: createRole4EffectFrames(SkillProjectileEffectKeys.role4TkjArrowHit9_1, 137, 'Role4BulletArrow9_1', 20, [-1.65, -1.7, 149.25, 157.4]),
  [SkillProjectileEffectKeys.role4TkjArrowHit9_2]: createRole4EffectFrames(SkillProjectileEffectKeys.role4TkjArrowHit9_2, 123, 'Role4BulletArrow9_2', 18, [-99.95, -125.55, 214, 436.7]),
  [SkillProjectileEffectKeys.role4DzjShovelHit10]: createRole4EffectFrames(SkillProjectileEffectKeys.role4DzjShovelHit10, 479, 'Role4Bullet10', 37, [-130.65, -35.3, 222.5, 139.4]),
  [SkillProjectileEffectKeys.role4DzjArrowHit10_1]: createRole4EffectFrames(SkillProjectileEffectKeys.role4DzjArrowHit10_1, 241, 'Role4BulletArrow10_1', 13, [-145.1, -73, 29.3, 79]),
  [SkillProjectileEffectKeys.role4DzjArrowHit10_2]: createRole4EffectFrames(SkillProjectileEffectKeys.role4DzjArrowHit10_2, 214, 'Role4BulletArrow10_2', 12, [-84.75, 15.35, 190.95, 128.35]),
  [SkillProjectileEffectKeys.role4LybjMarker]: createRole4EffectFrames(SkillProjectileEffectKeys.role4LybjMarker, 414, 'Role4Bullet11', 1, [-48.05, -21.85, 49.6, 22.45]),
  [SkillProjectileEffectKeys.role4MmwShovelHit12]: createRole4EffectFrames(SkillProjectileEffectKeys.role4MmwShovelHit12, 443, 'Role4Bullet12', 91, [-507.45, -59.5, 501.55, 71]),
  [SkillProjectileEffectKeys.role4MmwArrowHit12_1]: createRole4EffectFrames(SkillProjectileEffectKeys.role4MmwArrowHit12_1, 201, 'Role4BulletArrow12_1', 20, [-52, -17, 188, 201]),
  [SkillProjectileEffectKeys.role4MmwArrowHit12_2]: createRole4EffectFrames(SkillProjectileEffectKeys.role4MmwArrowHit12_2, 171, 'Role4BulletArrow12_2', 20, [-86.95, -64.9, 63.55, 81.45]),
  [SkillProjectileEffectKeys.role4MmwArrowHit12_3]: createRole4EffectFrames(SkillProjectileEffectKeys.role4MmwArrowHit12_3, 176, 'Role4BulletArrow12_3', 10, [-362.45, -47.65, 167.45, 285.4]),
} as const satisfies Record<string, FrameSequenceAssetDefinition>;

export const role4MdsBombAsset = createRole4EffectFrames(
  Role4CombatAssetKeys.mdsBomb, 409, 'Role4MDS', 20, [-48, -89, 67.2, 38.4],
);

export const role4SpeedUpAsset = createRole4EffectFrames(
  Role4CombatAssetKeys.speedUp, 38, 'SpeedUp', 16, [-46.4, -48.5, 66.6, 32.85],
  'status', 'assets/StageCommon.swf',
);

type Role5SpearSheetAssetDefinition = LoadableAssetDefinition & Readonly<{
  form: 'body' | 'equipment';
  appearanceId: number;
  sourcePackage: 'assets/bailong.swf';
  sourceSymbol: string;
  cellWidth: 350;
  cellHeight: 350;
  columns: 8;
  rows: 17;
}>;

const role5SpearSheet = (
  form: Role5SpearSheetAssetDefinition['form'],
  appearanceId: number,
  fileName: string,
): Role5SpearSheetAssetDefinition => ({
  key: `hero-animation.hero5.spear.${form}.${appearanceId}`,
  path: `/assets/combat/role5/body/spear/${fileName}`,
  status: 'ready',
  source: 'extracted-flash',
  form,
  appearanceId,
  sourcePackage: 'assets/bailong.swf',
  sourceSymbol: form === 'body' ? `ROLE5_${appearanceId}` : `ROLE5_EQUIP_${appearanceId}`,
  cellWidth: 350,
  cellHeight: 350,
  columns: 8,
  rows: 17,
});

export const role5SpearBodyFamilyAssets = {
  body0: role5SpearSheet('body', 0, '25_ROLE5_0.png'),
  body1: role5SpearSheet('body', 1, '24_ROLE5_1.png'),
  body2: role5SpearSheet('body', 2, '21_ROLE5_2.png'),
  body3: role5SpearSheet('body', 3, '20_ROLE5_3.png'),
  body4: role5SpearSheet('body', 4, '19_ROLE5_4.png'),
  body5: role5SpearSheet('body', 5, '18_ROLE5_5.png'),
  body6: role5SpearSheet('body', 6, '17_ROLE5_6.png'),
  body7: role5SpearSheet('body', 7, '16_ROLE5_7.png'),
  body11: role5SpearSheet('body', 11, '23_ROLE5_11.png'),
  body12: role5SpearSheet('body', 12, '6_ROLE5_12.png'),
  body14: role5SpearSheet('body', 14, '2_ROLE5_14.png'),
  body15: role5SpearSheet('body', 15, '4_ROLE5_15.png'),
  body16: role5SpearSheet('body', 16, '22_ROLE5_16.png'),
  equipment0: role5SpearSheet('equipment', 0, '15_ROLE5_EQUIP_0.png'),
  equipment1: role5SpearSheet('equipment', 1, '14_ROLE5_EQUIP_1.png'),
  equipment2: role5SpearSheet('equipment', 2, '12_ROLE5_EQUIP_2.png'),
  equipment3: role5SpearSheet('equipment', 3, '11_ROLE5_EQUIP_3.png'),
  equipment4: role5SpearSheet('equipment', 4, '10_ROLE5_EQUIP_4.png'),
  equipment5: role5SpearSheet('equipment', 5, '9_ROLE5_EQUIP_5.png'),
  equipment9: role5SpearSheet('equipment', 9, '8_ROLE5_EQUIP_9.png'),
  equipment12: role5SpearSheet('equipment', 12, '7_ROLE5_EQUIP_12.png'),
  equipment13: role5SpearSheet('equipment', 13, '1_ROLE5_EQUIP_13.png'),
  equipment14: role5SpearSheet('equipment', 14, '3_ROLE5_EQUIP_14.png'),
  equipment15: role5SpearSheet('equipment', 15, '5_ROLE5_EQUIP_15.png'),
  equipment16: role5SpearSheet('equipment', 16, '13_ROLE5_EQUIP_16.png'),
} as const satisfies Record<string, Role5SpearSheetAssetDefinition>;

const role5Origin = (bounds: readonly [number, number, number, number]) => ({
  x: -bounds[0] / (bounds[2] - bounds[0]),
  y: -bounds[1] / (bounds[3] - bounds[1]),
});

function createRole5Frames(
  key: string,
  characterId: number,
  symbol: string,
  frameCount: number,
  bounds: readonly [number, number, number, number],
  family: 'spear' | 'sword' = 'sword',
) {
  const directory = `DefineSprite_${characterId}_${symbol}`;
  return {
    key,
    frameKeys: Array.from({ length: frameCount }, (_, index) => `${key}.frame${index + 1}`),
    framePaths: Array.from(
      { length: frameCount },
      (_, index) => `/assets/combat/role5/effects/${family}/${directory}/${index + 1}.svg`,
    ),
    registrationOrigin: role5Origin(bounds),
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: family === 'spear' ? 'assets/bailong.swf' : 'assets/bailongSword.swf',
    sourceSymbol: symbol,
  } as const;
}

function createRole5SwordBodyFrames(key: string, characterId: number, symbol: string, frameCount: number) {
  const directory = characterId === 273 ? 'DefineSprite_273' : `DefineSprite_${characterId}_${symbol}`;
  return {
    key,
    frameKeys: Array.from({ length: frameCount }, (_, index) => `${key}.frame${index + 1}`),
    framePaths: Array.from(
      { length: frameCount },
      (_, index) => `/assets/combat/role5/body/sword/${directory}/${index + 1}.svg`,
    ),
    registrationOrigin: { x: 158 / 290, y: 142 / 290 },
    status: 'ready',
    source: 'extracted-flash',
    sourcePackage: 'assets/bailongSword.swf',
    sourceSymbol: symbol,
  } as const;
}

export const role5SwordBodyAssets = {
  idle: createRole5SwordBodyFrames('hero-animation.hero5.sword.idle', 296, 'jidle', 6),
  walk: createRole5SwordBodyFrames('hero-animation.hero5.sword.walk', 318, 'jwalk', 4),
  run: createRole5SwordBodyFrames('hero-animation.hero5.sword.run', 289, 'jrunNormal', 4),
  jump1: createRole5SwordBodyFrames('hero-animation.hero5.sword.jump1', 287, 'jjumpNormal', 1),
  jump2: createRole5SwordBodyFrames('hero-animation.hero5.sword.jump2', 285, 'jjumpTwo', 4),
  jump3: createRole5SwordBodyFrames('hero-animation.hero5.sword.jump3', 283, 'jjumpDown', 1),
  attack1: createRole5SwordBodyFrames('hero-animation.hero5.sword.attack1', 316, 'jattack1', 4),
  attack2: createRole5SwordBodyFrames('hero-animation.hero5.sword.attack2', 312, 'jattack2', 5),
  attack3: createRole5SwordBodyFrames('hero-animation.hero5.sword.attack3', 308, 'jattack3', 4),
  attack4: createRole5SwordBodyFrames('hero-animation.hero5.sword.attack4', 304, 'jattack4', 4),
  jumpAttack: createRole5SwordBodyFrames('hero-animation.hero5.sword.jump-attack', 281, 'jjumpattack', 3),
  runAttack: createRole5SwordBodyFrames('hero-animation.hero5.sword.run-attack', 270, 'jrunattack', 4),
  hurt: createRole5SwordBodyFrames('hero-animation.hero5.sword.hurt', 300, 'jhurtStand', 1),
  skill1: createRole5SwordBodyFrames('hero-animation.hero5.sword.skill1', 294, 'jskill1', 6),
  skill2: createRole5SwordBodyFrames('hero-animation.hero5.sword.skill2', 321, 'jskill2', 6),
  skill4: createRole5SwordBodyFrames('hero-animation.hero5.sword.skill4', 275, 'jskill4', 3),
  skill5_1: createRole5SwordBodyFrames('hero-animation.hero5.sword.skill5-1', 266, 'jskill5_1', 3),
  skill5_2: createRole5SwordBodyFrames('hero-animation.hero5.sword.skill5-2', 264, 'jskill5_2', 3),
  tlj: createRole5SwordBodyFrames('hero-animation.hero5.sword.tlj', 336, 'jtlj', 3),
  mlsz: createRole5SwordBodyFrames('hero-animation.hero5.sword.mlsz', 273, 'mlsz-inner', 7),
} as const;

export const role5NormalAttackAssets = {
  [HeroNormalAttackEffectKeys.role5SpearHit1]: createRole5Frames(HeroNormalAttackEffectKeys.role5SpearHit1, 76, 'Role5Bullet1', 8, [-102.55, -214.55, 153.3, 55.15], 'spear'),
  [HeroNormalAttackEffectKeys.role5SpearHit2]: createRole5Frames(HeroNormalAttackEffectKeys.role5SpearHit2, 87, 'Role5Bullet2', 10, [-105.75, -59.5, 153.15, 19.5], 'spear'),
  [HeroNormalAttackEffectKeys.role5SpearHit3]: createRole5Frames(HeroNormalAttackEffectKeys.role5SpearHit3, 96, 'Role5Bullet3', 8, [2.2, -180.9, 199.65, 27.1], 'spear'),
  [HeroNormalAttackEffectKeys.role5SpearHit4]: createRole5Frames(HeroNormalAttackEffectKeys.role5SpearHit4, 113, 'Role5Bullet4', 16, [-164.95, -83.8, 188.85, 9.2], 'spear'),
  [HeroNormalAttackEffectKeys.role5SpearHit5]: createRole5Frames(HeroNormalAttackEffectKeys.role5SpearHit5, 175, 'Role5Bullet5', 8, [-141, -190.7, 174, 61.25], 'spear'),
  [HeroNormalAttackEffectKeys.role5SwordHit1]: createRole5Frames(HeroNormalAttackEffectKeys.role5SwordHit1, 807, 'swordhit1', 10, [-88.8, -219.25, 148, 44.75]),
  [HeroNormalAttackEffectKeys.role5SwordHit1Enhanced]: createRole5Frames(HeroNormalAttackEffectKeys.role5SwordHit1Enhanced, 467, 'swordhit1_1', 15, [-106, -177, 171, 60]),
  [HeroNormalAttackEffectKeys.role5SwordHit2]: createRole5Frames(HeroNormalAttackEffectKeys.role5SwordHit2, 802, 'swordhit2', 9, [-63, -188.65, 205, 30.35]),
  [HeroNormalAttackEffectKeys.role5SwordHit2Enhanced]: createRole5Frames(HeroNormalAttackEffectKeys.role5SwordHit2Enhanced, 444, 'swordhit2_1', 15, [-75.05, -158, 196.95, 68]),
  [HeroNormalAttackEffectKeys.role5SwordHit3]: createRole5Frames(HeroNormalAttackEffectKeys.role5SwordHit3, 793, 'swordhit3', 9, [-194, -117.75, 172, 35.25]),
  [HeroNormalAttackEffectKeys.role5SwordHit3Enhanced]: createRole5Frames(HeroNormalAttackEffectKeys.role5SwordHit3Enhanced, 421, 'swordhit3_1', 15, [-120, -158, 201, 62]),
  [HeroNormalAttackEffectKeys.role5SwordHit4]: createRole5Frames(HeroNormalAttackEffectKeys.role5SwordHit4, 786, 'swordhit4', 19, [-256, -98.95, 183, 23.05]),
  [HeroNormalAttackEffectKeys.role5SwordHit4Enhanced]: createRole5Frames(HeroNormalAttackEffectKeys.role5SwordHit4Enhanced, 398, 'swordhit4_1', 19, [-271.85, -102.25, 174.15, 41.75]),
  [HeroNormalAttackEffectKeys.role5SwordHit5]: createRole5Frames(HeroNormalAttackEffectKeys.role5SwordHit5, 556, 'swordhit5', 15, [-128, -136.25, 153, 51]),
  [HeroNormalAttackEffectKeys.role5SwordHit5Enhanced]: createRole5Frames(HeroNormalAttackEffectKeys.role5SwordHit5Enhanced, 369, 'swordhit5_1', 15, [-184.6, -199.1, 209.4, 93.9]),
  [HeroNormalAttackEffectKeys.role5SwordRunHit]: createRole5Frames(HeroNormalAttackEffectKeys.role5SwordRunHit, 563, 'swordhit6', 15, [-163, -56.65, 198, 1.35]),
  [HeroNormalAttackEffectKeys.role5SwordRunHitEnhanced]: createRole5Frames(HeroNormalAttackEffectKeys.role5SwordRunHitEnhanced, 378, 'swordhit6_1', 20, [-229, -97.1, 221, 49.9]),
} as const satisfies Record<string, FrameSequenceAssetDefinition>;

const role5EnhancedNormalAttackKeyByBase = {
  [HeroNormalAttackEffectKeys.role5SwordHit1]: HeroNormalAttackEffectKeys.role5SwordHit1Enhanced,
  [HeroNormalAttackEffectKeys.role5SwordHit2]: HeroNormalAttackEffectKeys.role5SwordHit2Enhanced,
  [HeroNormalAttackEffectKeys.role5SwordHit3]: HeroNormalAttackEffectKeys.role5SwordHit3Enhanced,
  [HeroNormalAttackEffectKeys.role5SwordHit4]: HeroNormalAttackEffectKeys.role5SwordHit4Enhanced,
  [HeroNormalAttackEffectKeys.role5SwordHit5]: HeroNormalAttackEffectKeys.role5SwordHit5Enhanced,
  [HeroNormalAttackEffectKeys.role5SwordRunHit]: HeroNormalAttackEffectKeys.role5SwordRunHitEnhanced,
} as const;

export function getRole5NormalAttackVisualAsset(effectKey: string, enhanced: boolean) {
  const key = enhanced
    ? role5EnhancedNormalAttackKeyByBase[effectKey as keyof typeof role5EnhancedNormalAttackKeyByBase] ?? effectKey
    : effectKey;
  return role5NormalAttackAssets[key as keyof typeof role5NormalAttackAssets];
}

export const role5SkillVisualAssets = {
  [SkillProjectileEffectKeys.role5XlcHit6]: createRole5Frames(SkillProjectileEffectKeys.role5XlcHit6, 544, 'sword_xlc', 16, [-179, -70, 170, 13]),
  [SkillProjectileEffectKeys.role5LxuanjHit7_1]: createRole5Frames(SkillProjectileEffectKeys.role5LxuanjHit7_1, 359, 'sword_lxuanj1', 10, [0, 0, 205, 205]),
  [SkillProjectileEffectKeys.role5LxuanjHit8]: createRole5Frames(SkillProjectileEffectKeys.role5LxuanjHit8, 360, 'sword_lxuanj2', 10, [0, 0, 205, 205]),
  [SkillProjectileEffectKeys.role5YybHit9]: createRole5Frames(SkillProjectileEffectKeys.role5YybHit9, 166, 'Role5Bullet9', 16, [-55.05, -133.85, 60.95, 30.95], 'spear'),
  [SkillProjectileEffectKeys.role5XkjzHit10]: createRole5Frames(SkillProjectileEffectKeys.role5XkjzHit10, 777, 'sword_xkjz', 57, [0, 0, 407, 562]),
  [SkillProjectileEffectKeys.role5TljHit11]: createRole5Frames(SkillProjectileEffectKeys.role5TljHit11, 888, 'sword_tlj1', 38, [-112, -76, 95, 82]),
  [SkillProjectileEffectKeys.role5PkzHit24_1]: createRole5Frames(SkillProjectileEffectKeys.role5PkzHit24_1, 854, 'swordskill2_1', 15, [-84, -180.7, 185.1, 91.9]),
  [SkillProjectileEffectKeys.role5PkzHit24_1Enhanced]: createRole5Frames(SkillProjectileEffectKeys.role5PkzHit24_1Enhanced, 835, 'swordqhskill2_1', 15, [-324.4, -195, 182.95, 91.9]),
  [SkillProjectileEffectKeys.role5PkzHit24_2]: createRole5Frames(SkillProjectileEffectKeys.role5PkzHit24_2, 853, 'swordskill2_2', 9, [-101, -232, 50, 18]),
  [SkillProjectileEffectKeys.role5PkzHit24_3]: createRole5Frames(SkillProjectileEffectKeys.role5PkzHit24_3, 846, 'swordskill2_3', 15, [-292.5, -169.5, 90.55, 65.5]),
  [SkillProjectileEffectKeys.role5LxjHit26]: createRole5Frames(SkillProjectileEffectKeys.role5LxjHit26, 480, 'swordskill4', 20, [-71.2, -220.55, 61.8, -21.55]),
  [SkillProjectileEffectKeys.role5LyshCompanion]: createRole5Frames(SkillProjectileEffectKeys.role5LyshCompanion, 493, 'swordskill5_3', 6, [-50.5, -162.55, 46.5, 53.45]),
  [SkillProjectileEffectKeys.role5LyshShot]: createRole5Frames(SkillProjectileEffectKeys.role5LyshShot, 511, 'swordskill5_2', 12, [-50, -80, 110, 80]),
  [SkillProjectileEffectKeys.role5JrjlCompanion]: createRole5Frames(SkillProjectileEffectKeys.role5JrjlCompanion, 602, 'sword_jrjlsxj', 6, [-169, 12, -12, 61]),
  [SkillProjectileEffectKeys.role5JrjlShot]: createRole5Frames(SkillProjectileEffectKeys.role5JrjlShot, 41, 'sword_jrjljq', 20, [-171, -20, 140, 89]),
  [Role5CombatAssetKeys.yybStatus]: createRole5Frames(Role5CombatAssetKeys.yybStatus, 36, 'Role5Skill4Effect', 15, [-41.5, -138.25, 46.5, 17.25], 'spear'),
  [Role5CombatAssetKeys.tljStatus]: createRole5Frames(Role5CombatAssetKeys.tljStatus, 871, 'sword_tlj2', 38, [-112, -76, 95, 82]),
  [Role5CombatAssetKeys.jrjlCast]: createRole5Frames(Role5CombatAssetKeys.jrjlCast, 589, 'sword_jrjlsf', 10, [-88, -88, 93, 89]),
  [Role5CombatAssetKeys.jrjlStatus]: createRole5Frames(Role5CombatAssetKeys.jrjlStatus, 621, 'jrjlbuff', 27, [-108, -100, 80, 92]),
  [Role5CombatAssetKeys.lyshRelease]: createRole5Frames(Role5CombatAssetKeys.lyshRelease, 504, 'swordskill5_1', 15, [-80, -100, 100, 100]),
  [Role5CombatAssetKeys.escapeBefore]: createRole5Frames(Role5CombatAssetKeys.escapeBefore, 263, 'Role5cloneEf2', 27, [-328.55, -231.85, 125.5, 40.15], 'spear'),
  [Role5CombatAssetKeys.escapeAfter]: createRole5Frames(Role5CombatAssetKeys.escapeAfter, 271, 'Role5escapeEffect', 10, [-112.15, -110.8, 113.85, 108.2], 'spear'),
  'role5.mlsz.1': createRole5Frames('role5.mlsz.1', 698, 'sword_mlsz1', 11, [-170, -210, 170, 130]),
  'role5.mlsz.2': createRole5Frames('role5.mlsz.2', 685, 'sword_mlsz2', 11, [-170, -210, 170, 130]),
  'role5.mlsz.3': createRole5Frames('role5.mlsz.3', 672, 'sword_mlsz3', 9, [-170, -210, 170, 130]),
  'role5.mlsz.4': createRole5Frames('role5.mlsz.4', 661, 'sword_mlsz4', 11, [-170, -210, 170, 130]),
  'role5.mlsz.5': createRole5Frames('role5.mlsz.5', 648, 'sword_mlsz5', 9, [-170, -210, 170, 130]),
  'role5.mlsz.1.enhanced': createRole5Frames('role5.mlsz.1.enhanced', 827, 'sword_mlsz1_1', 15, [-775, -210, 170, 130]),
  'role5.mlsz.2.enhanced': createRole5Frames('role5.mlsz.2.enhanced', 825, 'sword_mlsz2_1', 15, [-775, -210, 170, 130]),
  'role5.mlsz.3.enhanced': createRole5Frames('role5.mlsz.3.enhanced', 823, 'sword_mlsz3_1', 15, [-775, -210, 170, 130]),
  'role5.mlsz.4.enhanced': createRole5Frames('role5.mlsz.4.enhanced', 821, 'sword_mlsz4_1', 15, [-775, -210, 170, 130]),
  'role5.mlsz.5.enhanced': createRole5Frames('role5.mlsz.5.enhanced', 819, 'sword_mlsz5_1', 15, [-775, -210, 170, 130]),
} as const;

export function getRole5SkillVisualAsset(assetKey: string, sourceSymbol: string) {
  if (assetKey === SkillProjectileEffectKeys.role5MlszHit29 ||
      assetKey === SkillProjectileEffectKeys.role5MlszHit29Enhanced) {
    const match = /sword_mlsz([1-5])(_1)?/.exec(sourceSymbol);
    if (match) return role5SkillVisualAssets[
      `role5.mlsz.${match[1]}${match[2] ? '.enhanced' : ''}` as keyof typeof role5SkillVisualAssets
    ];
  }
  return role5SkillVisualAssets[assetKey as keyof typeof role5SkillVisualAssets];
}

export const sourceAssetFamilies = {
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
    notes: 'Dragon, turtle, and UFO projectile families listed here remain represented by modern placeholder effects. Monkey resources moved to TASK-SLICE-193B and horse resources moved to TASK-SLICE-193D verified runtime bundles.',
  },
} as const satisfies Record<string, MissingSourceAssetFamily>;

export const assetBundles = {
  scaffold: [scaffoldAssets.playerPlaceholder],
  role1NormalAttacks: Object.values(role1NormalAttackAssets),
  crafting: Object.values(craftingAssets),
  stage11: [
    ...Object.values(stage11Assets),
    ...Object.values(monsterFamily330Atlases),
    ...Object.values(monsterFamily330AttackAssets),
  ],
  stage12: [stage11Assets.floor, ...Object.values(stage12Assets)],
  stage13: [
    stage11Assets.floor,
    ...Object.values(stage13Assets),
    monster5Atlas,
    ...Object.values(monster5AttackAssets),
  ],
  stage21: [
    ...Object.values(stage21Assets),
    ...Object.values(monsterFamily691019Atlases),
    ...Object.values(monsterFamily691019AttackAssets),
  ],
  stage22: Object.values(stage22Assets),
} as const;
