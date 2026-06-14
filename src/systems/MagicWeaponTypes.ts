import type { HeroEffectiveStats } from './EquipmentSystem';
import type { HeroCombatModel } from './HeroCombatSystem';
import type { HeroSkillModel } from './HeroSkillSystem';
import type { PetState } from './PetSystem';
import type { ProjectileModel } from './ProjectileSystem';
export type MagicWeaponFillName =
  | 'xhhl'
  | 'kyl'
  | 'syl'
  | 'lxj'
  | 'fbqpj'
  | 'hyzzs'
  | 'hywjs'
  | 'zjld'
  | 'zsTimer'
  | 'jyhl'
  | 'mdhf'
  | 'xhmt'
  | 'tjbg'
  | 'zltc'
  | 'qljfb'
  | 'stlp'
  | 'lxfb'
  | 'sxfb'
  | 'yxfb';

export type MagicWeaponAction = 'wait' | 'hit';

export type MagicWeaponEffectKind =
  | 'magicLeafCure'
  | 'magicLeafCure2'
  | 'magicSword2'
  | 'magicQpj'
  | 'magicUmbrella'
  | 'magicRing'
  | 'magicTimer'
  | 'magicFlower'
  | 'magicFlag'
  | 'magicBagua'
  | 'magicZlHummer'
  | 'magicBigBottle'
  | 'magicSnow'
  | 'magicPearl'
  | 'magicDemonBuff';

export type MagicWeaponEquipState = {
  fillName: MagicWeaponFillName;
  name: string;
  level: number;
  element: string;
};

export type MagicWeaponHealingEffect = {
  kind: 'magicLeafCure' | 'magicLeafCure2';
  totalMs: number;
  remainingMs: number;
  hpPerSecond: number;
  mpPerSecond: number;
};

export type MagicWeaponSword2Effect = {
  kind: 'magicSword2';
  totalMs: number;
  remainingMs: number;
  windupMs: number;
  sourceId: string;
  sourceX: number;
  sourceY: number;
  facingX: -1 | 1;
  hasSpawnedStrike: boolean;
  targetId?: string;
  projectileId?: number;
};

export type MagicWeaponQpjEffect = {
  kind: 'magicQpj';
  totalMs: number;
  remainingMs: number;
  sourceId: string;
  sourceX: number;
  sourceY: number;
  facingX: -1 | 1;
  hasSpawnedSwords: boolean;
  projectileIds: number[];
};

export type MagicWeaponUmbrellaEffect = {
  kind: 'magicUmbrella';
  shieldKind: 'magicUmbrellaDefend' | 'magicUmbrellaDefend2';
  totalMs: number;
  remainingMs: number;
  shieldAmount: number;
};

export type MagicWeaponRingEffect = {
  kind: 'magicRing';
  totalMs: number;
  remainingMs: number;
  invulnerableMs: number;
  hpRestore: number;
  mpRestore: number;
};

export type MagicWeaponTimerEffect = {
  kind: 'magicTimer';
  totalMs: number;
  remainingMs: number;
  recordedHp: number;
  recordedMp: number;
  recordedX: number;
  recordedY: number;
};

export type MagicWeaponDemonBuffEffect = {
  kind: 'magicDemonBuff';
  buffKind: 'xlfbBuff' | 'sxfbBuff' | 'yxfbBuff2';
  totalMs: number;
  remainingMs: number;
  attackBonusPercent: number;
  critBonusPercent: number;
  hpDrainPerSecond: number;
  drainCarryMs: number;
};

export type MagicWeaponFlowerEffect = {
  kind: 'magicFlower';
  totalMs: number;
  remainingMs: number;
  actionRemainingMs: number;
  attackBonusFlat: number;
  allyAttackMultiplier: number;
  enemyDamageMultiplier: number;
  affectedHeroIds: string[];
  affectedPetIds: string[];
  affectedEnemyIds: string[];
};

export type MagicWeaponFlagEffect = {
  kind: 'magicFlag';
  totalMs: number;
  remainingMs: number;
  actionRemainingMs: number;
  debuffMs: number;
};

export type MagicWeaponBaguaEffect = {
  kind: 'magicBagua';
  totalMs: number;
  remainingMs: number;
  durationMs: number;
  affectedEnemyIds: string[];
};

export type MagicWeaponZlHummerEffect = {
  kind: 'magicZlHummer';
  totalMs: number;
  remainingMs: number;
  sourceId: string;
  sourceX: number;
  sourceY: number;
  facingX: -1 | 1;
  hasSpawnedHammer: boolean;
  projectileId?: number;
  damage: number;
};

export type MagicWeaponSnowEffect = {
  kind: 'magicSnow';
  totalMs: number;
  remainingMs: number;
  sourceId: string;
  cameraX: number;
  cameraY: number;
  hasSpawnedSnow: boolean;
  projectileIds: number[];
  damage: number;
};

export type MagicWeaponPlatform = {
  id: string;
  sourceId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  totalMs: number;
  remainingMs: number;
  active: boolean;
};

export type MagicWeaponBigBottleEffect = {
  kind: 'magicBigBottle';
  totalMs: number;
  remainingMs: number;
  sourceId: string;
  platformId: string;
};

export type MagicWeaponPearlEffect = {
  kind: 'magicPearl';
  totalMs: number;
  remainingMs: number;
  actionRemainingMs: number;
  sourceId: string;
  sourceX: number;
  sourceY: number;
  facingX: -1 | 1;
  attackCount: number;
  completedAttacks: number;
  phase: 'begin' | 'fly' | 'effect' | 'finished';
  phaseElapsedMs: number;
  lastX: number;
  lastY: number;
  targetX: number;
  targetY: number;
  targetId?: string;
  targetLog: string[];
  spawnedFrames: number[];
  projectileIds: number[];
  pearlDamage: number;
  endEffect?: MagicWeaponPearlEndEffect;
};

export type MagicWeaponPearlEndEffect =
  | {
    kind: 'mp';
    amount: number;
  }
  | {
    kind: 'stun';
    durationMs: number;
    affectedEnemyIds: string[];
  }
  | {
    kind: 'poison';
    durationMs: number;
    damagePerSecond: number;
    affectedEnemyIds: string[];
  };

export type MagicWeaponActiveEffect =
  | MagicWeaponHealingEffect
  | MagicWeaponSword2Effect
  | MagicWeaponQpjEffect
  | MagicWeaponUmbrellaEffect
  | MagicWeaponRingEffect
  | MagicWeaponTimerEffect
  | MagicWeaponFlowerEffect
  | MagicWeaponFlagEffect
  | MagicWeaponBaguaEffect
  | MagicWeaponZlHummerEffect
  | MagicWeaponBigBottleEffect
  | MagicWeaponSnowEffect
  | MagicWeaponPearlEffect
  | MagicWeaponDemonBuffEffect;

export type MagicWeaponModel = {
  current?: MagicWeaponEquipState;
  action: MagicWeaponAction;
  activeEffect?: MagicWeaponActiveEffect;
  platforms: MagicWeaponPlatform[];
  qpjAutoTimerMs: number;
  message: string;
};

export type MagicWeaponTarget = {
  combat: HeroCombatModel;
  skill: HeroSkillModel;
  effectiveStats?: Pick<HeroEffectiveStats, 'defense' | 'magicDefensePercent' | 'power'>;
  movement?: {
    x: number;
    y: number;
  };
};

export type MagicWeaponFriendlyPetTarget = PetState;

export type MagicWeaponSourceSnapshot = {
  sourceId: string;
  x: number;
  y: number;
  facingX: -1 | 1;
  cameraX?: number;
  cameraY?: number;
};

export type MagicWeaponEnemyTarget = {
  id: string;
  x: number;
  y: number;
  isAlive: boolean;
  applyMagicFlowerDebuff?: (debuff: {
    sourceName: string;
    totalMs: number;
    remainingMs: number;
    damageMultiplier: number;
  }) => void;
  clearMagicFlowerDebuff?: () => void;
  applyMagicFlagDebuff?: (debuff: {
    sourceName: string;
    totalMs: number;
    remainingMs: number;
  }) => void;
  clearMagicFlagDebuff?: () => void;
  applyMagicBaguaStun?: (effect: {
    sourceName: string;
    totalMs: number;
    remainingMs: number;
  }) => void;
  clearMagicBaguaStun?: () => void;
  applyMagicZlHummerStun?: (effect: {
    sourceName: string;
    totalMs: number;
    remainingMs: number;
  }) => void;
  clearMagicZlHummerStun?: () => void;
  applyMagicSnowIce?: (effect: {
    sourceName: string;
    totalMs: number;
    remainingMs: number;
  }) => void;
  clearMagicSnowIce?: () => void;
  applyMagicPearlStun?: (effect: {
    sourceName: string;
    totalMs: number;
    remainingMs: number;
  }) => void;
  clearMagicPearlStun?: () => void;
  applyMagicPearlPoison?: (effect: {
    sourceName: string;
    totalMs: number;
    remainingMs: number;
    damagePerSecond: number;
  }) => void;
  clearMagicPearlPoison?: () => void;
};

export type MagicWeaponTriggerResult = {
  triggered: boolean;
  message: string;
  projectile?: ProjectileModel;
};


