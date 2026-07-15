export type AssetStatus = 'ready' | 'placeholder' | 'missing-original';
export type AssetSourceKind = 'generated' | 'extracted-flash';

type LoadableAssetDefinition = {
  key: string;
  path: string;
  status: Exclude<AssetStatus, 'missing-original'>;
  source: AssetSourceKind;
};

type FrameSequenceAssetDefinition = {
  key: string;
  frameKeys: readonly string[];
  framePaths: readonly string[];
  status: 'ready';
  source: 'extracted-flash';
  sourcePackage: string;
  sourceSymbol: string;
};

type MissingSourceAssetFamily = {
  status: 'missing-original';
  sourceSymbols: readonly string[];
  notes: string;
};

export const AssetKeys = {
  playerPlaceholder: 'player-placeholder',
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
  stage11: {
    status: 'missing-original',
    sourceSymbols: ['export.gameSence.sl11', 'bg11', 'floorBg1', 'StageListener11'],
    notes: 'First mainline scene family and level listener.',
  },
} as const satisfies Record<string, MissingSourceAssetFamily>;

export const assetBundles = {
  scaffold: [scaffoldAssets.playerPlaceholder],
  role1NormalAttacks: Object.values(role1NormalAttackAssets),
} as const;
