export type AssetStatus = 'ready' | 'placeholder' | 'missing-original';
export type AssetSourceKind = 'generated' | 'extracted-flash';

type LoadableAssetDefinition = {
  key: string;
  path: string;
  status: Exclude<AssetStatus, 'missing-original'>;
  source: AssetSourceKind;
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
  role2SgqHit5: 'skill-projectile.role2.sgq.hit5',
  role2SmbHit4_1: 'skill-projectile.role2.smb.hit4_1',
  role2SmbHit4_2: 'skill-projectile.role2.smb.hit4_2',
} as const;

export const MagicWeaponEffectKeys = {
  magicSword2: 'magic-weapon.lxj.magic-sword2',
  magicQpj: 'magic-weapon.fbqpj.qpjeffect',
  magicPearlBullet1: 'magic-weapon.xhmt.magic-pearl-bullet1',
  magicPearlBullet2: 'magic-weapon.xhmt.magic-pearl-bullet2',
  magicPearlBullet3: 'magic-weapon.xhmt.magic-pearl-bullet3',
  magicZlHummer: 'magic-weapon.zltc.zltcskill',
} as const;

export const scaffoldAssets = {
  playerPlaceholder: {
    key: AssetKeys.playerPlaceholder,
    path: '/assets/scaffold/player-placeholder.svg',
    status: 'placeholder',
    source: 'generated',
  },
} as const satisfies Record<string, LoadableAssetDefinition>;

export const sourceAssetFamilies = {
  role1To4NormalAttackEffects: {
    status: 'missing-original',
    sourceSymbols: [
      'Role1Bullet1',
      'Role1Bullet3',
      'Role1Bullet4',
      'Role1Bullet5',
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
    notes: 'Normal-attack attachments referenced by Role1 to Role4 but absent from current exports.',
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
    ],
    notes: 'Role2 skill projectile/effect family; absent from current symbol and image exports, expected in TangSeng or SpecialUI/TangSeng resource packages.',
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
    ],
    notes: 'Damage magic-weapon projectile families for lxj/MagicSword2, fbqpj/MagicQPJ, xhmt/MagicPearl, and zltc/MagicZLHummer; absent from current exported bitmap resources, represented by modern placeholder effects.',
  },
  stage11: {
    status: 'missing-original',
    sourceSymbols: ['export.gameSence.sl11', 'bg11', 'floorBg1', 'StageListener11'],
    notes: 'First mainline scene family and level listener.',
  },
} as const satisfies Record<string, MissingSourceAssetFamily>;

export const assetBundles = {
  scaffold: [scaffoldAssets.playerPlaceholder],
} as const;
