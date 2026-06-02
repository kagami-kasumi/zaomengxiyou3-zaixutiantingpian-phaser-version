import type {
  HeroEffectiveStats,
  EquipmentInstance,
  EquipmentLoadout,
} from './EquipmentSystem';
import {
  applyHeroMagicFlagGuard,
  applyHeroMagicFlowerBuff,
  applyHeroMagicInvulnerability,
  applyHeroMagicShield,
  clearHeroMagicFlagGuard,
  clearHeroMagicFlowerBuff,
  type HeroCombatModel,
} from './HeroCombatSystem';
import type { HeroSkillModel } from './HeroSkillSystem';
import type { PlayerInputState } from './InputSystem';
import {
  applyPetMagicFlowerBuff,
  clearPetMagicFlowerBuff,
  type PetState,
} from './PetSystem';
import {
  spawnMagicQpjProjectile,
  spawnMagicPearlProjectile,
  spawnMagicSnowProjectile,
  spawnMagicSword2Projectile,
  spawnMagicZlHummerProjectile,
  type ProjectileModel,
  type ProjectileSystemModel,
} from './ProjectileSystem';

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

export const MagicWeaponTuning = {
  leafDurationMs: 8_000,
  leafWoodMultiplier: 1.5,
  leafHpPerSecond: 6,
  leaf2HpPerSecond: 6,
  leaf2MpPerSecond: 5,
  sword2WindupMs: 1_000,
  sword2ActionMs: 1_500,
  qpjAutoIntervalMs: 11_225,
  qpjActiveCount: 6,
  qpjActiveActionMs: 450,
  qpjActiveWoodActionMs: 400,
  umbrellaShieldDurationMs: 10_000,
  umbrellaActionMs: 500,
  umbrellaWoodMultiplier: 1.5,
  umbrella2WoodMultiplier: 2,
  ringActionMs: 500,
  ringInvulnerableMs: 2_000,
  ringWoodInvulnerableMultiplier: 1.5,
  ringRestoreRatePerLevel: 0.00904,
  ringMpRestoreScale: 0.5,
  timerWaitMs: 30_000,
  timerWoodWaitMs: 27_000,
  demonActionMs: 700,
  lxfbDurationMs: 7_000,
  lxfbWoodDurationMs: 10_000,
  lxfbAttackBonusPercent: 10,
  lxfbCritBonusPercent: 10,
  lxfbHpDrainRatePerSecond: 0.05,
  sxfbDurationMs: 7_000,
  sxfbWoodDurationMs: 11_000,
  sxfbAttackBonusPercent: 15,
  sxfbCritBonusPercent: 15,
  sxfbHpDrainRatePerSecond: 0.054,
  yxfbDurationMs: 8_000,
  yxfbWoodMultiplier: 2,
  yxfbAttackBonusPercent: 30,
  yxfbCritBonusPercent: 30,
  flowerActionMs: 500,
  flowerWoodActionMs: 450,
  flowerBaseDurationMs: 5_000,
  flowerDurationPerLevelMs: 500,
  flowerHeroAttackFlatRate: 0.21,
  flowerPetAttackMultiplier: 1.21,
  flowerEnemyDamageMultiplier: 0.925,
  flagGuardDurationMs: 10_000,
  flagActionMs: 1_000,
  flagWoodActionMs: 833,
  flagDebuffMs: 5_000,
  baguaActionMs: 400,
  baguaStunMs: 6_000,
  baguaWoodStunMs: 8_000,
  zlHummerActionMs: 417,
  zlHummerWoodActionMs: 333,
  zlHummerDamageLevelBase: 18,
  zlHummerDamageLevelStep: 3,
  zlHummerDamageDivisor: 4,
  zlHummerDamageMultiplier: 1.8,
  zlHummerFallbackPower: 10,
  bigBottleActionMs: 1_000,
  bigBottleWoodActionMs: 667,
  bigBottleDurationMs: 20_000,
  bigBottleWidth: 130,
  bigBottleHeight: 20,
  bigBottleInitialOffsetY: -100,
  bigBottleFollowDeadZoneX: 30,
  bigBottleFollowDeadZoneY: 62,
  bigBottleFollowOffsetY: 70,
  snowActionMs: 417,
  snowWoodActionMs: 333,
  snowCount: 120,
  snowCameraOffsetX: -500,
  snowCameraWidth: 1240,
  snowCameraOffsetY: -480,
  snowCameraHeight: 100,
  snowMinAngleDegrees: 50,
  snowAngleSpreadDegrees: 10,
  snowMinSpeed: 10,
  snowSpeedSpread: 5,
  snowDamageLevelRate: 0.09,
  snowFallbackPower: 200,
  pearlActionMs: 500,
  pearlBeginMs: 160,
  pearlFlyMs: 500,
  pearlEffectMs: 500,
  pearlFrame3Ms: 50,
  pearlFrame12Ms: 200,
  pearlFrame28Ms: 467,
  pearlDamageLevelRate: 0.0315,
  pearlFallbackDamage: 19,
  pearlMpRestoreRatePerLevel: 0.01,
  pearlStunDurationPerLevelMs: 125,
  pearlPoisonDurationPerLevelMs: 250,
  pearlPoisonDamageRate: 0.0413,
} as const;

export function createMagicWeaponModel(): MagicWeaponModel {
  return {
    action: 'wait',
    platforms: [],
    qpjAutoTimerMs: 0,
    message: '未装备法宝',
  };
}

export function syncMagicWeaponFromLoadout(
  model: MagicWeaponModel,
  loadout: EquipmentLoadout,
): void {
  const equipped = loadout.magicWeapon;
  const next = equipped ? createMagicWeaponEquipState(equipped) : undefined;
  const previousFillName = model.current?.fillName;

  model.current = next;

  if (previousFillName !== next?.fillName) {
    model.action = 'wait';
    model.activeEffect = undefined;
    model.platforms = [];
    model.qpjAutoTimerMs = 0;
    model.message = next ? `${next.name} 就绪` : '未装备法宝';
  }
}

export function requestMagicWeaponTrigger(params: {
  model: MagicWeaponModel;
  target: MagicWeaponTarget;
  source?: MagicWeaponSourceSnapshot;
  friendlyPets?: readonly MagicWeaponFriendlyPetTarget[];
  enemyTargets?: readonly MagicWeaponEnemyTarget[];
  input: PlayerInputState;
  previousInput?: PlayerInputState;
}): MagicWeaponTriggerResult {
  if (!isMagicWeaponJustPressed(params.input, params.previousInput)) {
    return { triggered: false, message: params.model.message };
  }

  const current = params.model.current;
  if (!current) {
    params.model.message = '未装备法宝';
    return { triggered: false, message: params.model.message };
  }

  if (current.fillName === 'xhhl') {
    params.model.message = '宣花葫芦交由捕捉链路处理';
    return { triggered: false, message: params.model.message };
  }

  if (
    current.fillName === 'zsTimer' &&
    params.model.action === 'hit' &&
    params.model.activeEffect?.kind === 'magicTimer'
  ) {
    restoreMagicTimer(params.target, params.model.activeEffect);
    params.model.action = 'wait';
    params.model.activeEffect = undefined;
    params.model.message = `${current.name} 回溯完成`;
    return { triggered: true, message: params.model.message };
  }

  if (params.model.action === 'hit') {
    params.model.message = `${current.name} 正在使用`;
    return { triggered: false, message: params.model.message };
  }

  if (params.model.activeEffect?.kind === 'magicPearl') {
    params.model.message = `${current.name} 攻击链进行中`;
    return { triggered: false, message: params.model.message };
  }

  if (current.fillName === 'lxj') {
    if (!params.source) {
      params.model.message = '戮仙剑缺少释放源';
      return { triggered: false, message: params.model.message };
    }

    params.model.action = 'hit';
    params.model.activeEffect = createSword2Effect(params.source);
    params.model.message = `${current.name} 起手 MagicSword2_1`;
    return { triggered: true, message: params.model.message };
  }

  if (current.fillName === 'fbqpj') {
    if (!params.source) {
      params.model.message = '青萍剑缺少释放源';
      return { triggered: false, message: params.model.message };
    }

    params.model.action = 'hit';
    params.model.activeEffect = createQpjEffect(params.source, current);
    params.model.qpjAutoTimerMs = 0;
    params.model.message = `${current.name} 主动释放 6 剑`;
    return { triggered: true, message: params.model.message };
  }

  if (current.fillName === 'hyzzs' || current.fillName === 'hywjs') {
    const effect = createUmbrellaEffect(current, params.target.effectiveStats);
    params.model.action = 'hit';
    params.model.activeEffect = effect;
    params.model.message = `${current.name} 护盾 ${Math.round(effect.shieldAmount)}`;
    applyMagicWeaponShield(params.target, effect, current);
    return { triggered: true, message: params.model.message };
  }

  if (current.fillName === 'zjld') {
    const effect = createRingEffect(current, params.target);
    params.model.action = 'hit';
    params.model.activeEffect = effect;
    params.model.message = `${current.name} 无敌 ${formatSeconds(effect.invulnerableMs)}s`;
    applyMagicWeaponRing(params.target, effect, current);
    return { triggered: true, message: params.model.message };
  }

  if (current.fillName === 'zsTimer') {
    if (!params.source) {
      params.model.message = '烁时金轮缺少记录点';
      return { triggered: false, message: params.model.message };
    }

    const effect = createTimerEffect(current, params.target, params.source);
    params.model.action = 'hit';
    params.model.activeEffect = effect;
    params.model.message = `${current.name} 记录 ${formatSeconds(effect.totalMs)}s`;
    return { triggered: true, message: params.model.message };
  }

  if (
    current.fillName === 'lxfb' ||
    current.fillName === 'sxfb' ||
    current.fillName === 'yxfb'
  ) {
    const effect = createDemonBuffEffect(current, params.target);
    params.model.action = 'hit';
    params.model.activeEffect = effect;
    params.model.message = `${current.name} 入魔 ${formatSeconds(effect.totalMs)}s`;
    applyMagicWeaponDemonBuff(params.target, effect, current);
    return { triggered: true, message: params.model.message };
  }

  if (current.fillName === 'jyhl') {
    const effect = createFlowerEffect(current, params.target);
    params.model.action = 'hit';
    params.model.activeEffect = effect;
    applyMagicWeaponFlower({
      target: params.target,
      pets: params.friendlyPets ?? [],
      enemies: params.enemyTargets ?? [],
      effect,
      current,
    });
    params.model.message = `${current.name} 全体增减益 ${formatSeconds(effect.totalMs)}s`;
    return { triggered: true, message: params.model.message };
  }

  if (current.fillName === 'mdhf') {
    const effect = createFlagEffect(current);
    params.model.action = 'hit';
    params.model.activeEffect = effect;
    applyMagicWeaponFlag(params.target, effect, current);
    params.model.message = `${current.name} 护体 ${formatSeconds(effect.totalMs)}s`;
    return { triggered: true, message: params.model.message };
  }

  if (current.fillName === 'xhmt') {
    if (!params.source) {
      params.model.message = '血海魔童缺少释放源';
      return { triggered: false, message: params.model.message };
    }

    const effect = createPearlEffect(current, params.target, params.source);
    params.model.action = 'hit';
    params.model.activeEffect = effect;
    params.model.message = `${current.name} 起手 ${effect.attackCount} 段`;
    return { triggered: true, message: params.model.message };
  }

  if (current.fillName === 'tjbg') {
    if (current.level < 1) {
      params.model.message = `${current.name} level too low`;
      return { triggered: false, message: params.model.message };
    }

    const effect = createBaguaEffect(current);
    params.model.action = 'hit';
    params.model.activeEffect = effect;
    applyMagicWeaponBagua(params.enemyTargets ?? [], effect, current);
    params.model.message = `${current.name} stun ${effect.affectedEnemyIds.length} for ${formatSeconds(effect.durationMs)}s`;
    return { triggered: true, message: params.model.message };
  }

  if (current.fillName === 'zltc') {
    if (current.level < 1) {
      params.model.message = `${current.name} level too low`;
      return { triggered: false, message: params.model.message };
    }

    if (!params.source) {
      params.model.message = '震雷天锤缺少释放源';
      return { triggered: false, message: params.model.message };
    }

    params.model.action = 'hit';
    params.model.activeEffect = createZlHummerEffect(current, params.target, params.source);
    params.model.message = `${current.name} zltcskill`;
    return { triggered: true, message: params.model.message };
  }

  if (current.fillName === 'stlp') {
    if (!params.source) {
      params.model.message = '奢天化雪令缺少释放源';
      return { triggered: false, message: params.model.message };
    }

    params.model.action = 'hit';
    params.model.activeEffect = createSnowEffect(current, params.target, params.source);
    params.model.message = `${current.name} 起手 LingPaiEffect`;
    return { triggered: true, message: params.model.message };
  }

  if (current.fillName === 'qljfb') {
    if (!params.source) {
      params.model.message = '青龙剑缺少释放源';
      return { triggered: false, message: params.model.message };
    }

    params.model.action = 'hit';
    params.model.activeEffect = createBigBottleEffect(params.model, current, params.source);
    params.model.message = `${current.name} StageBoat`;
    return { triggered: true, message: params.model.message };
  }

  const effect = createHealingEffect(current);
  params.model.action = 'hit';
  params.model.activeEffect = effect;
  params.model.message = `${current.name} 释放 ${formatSeconds(effect.totalMs)}s`;
  applyMagicWeaponHealing(params.target, effect, 0);
  return { triggered: true, message: params.model.message };
}

export function updateMagicWeapon(
  model: MagicWeaponModel,
  target: MagicWeaponTarget,
  deltaMs: number,
  projectiles?: ProjectileSystemModel,
  enemyTargets: readonly MagicWeaponEnemyTarget[] = [],
  source?: MagicWeaponSourceSnapshot,
  friendlyPets: readonly MagicWeaponFriendlyPetTarget[] = [],
  random: () => number = Math.random,
): void {
  updateQpjAutoCast(model, deltaMs, projectiles, enemyTargets, source);
  updateMagicWeaponPlatforms(model, deltaMs, source);

  const effect = model.activeEffect;
  if (!effect) {
    return;
  }

  const elapsedMs = Math.min(effect.remainingMs, Math.max(0, deltaMs));
  if (isHealingEffect(effect)) {
    applyMagicWeaponHealing(target, effect, elapsedMs);
  } else if (effect.kind === 'magicSword2') {
    updateSword2Effect(model, effect, elapsedMs, projectiles, enemyTargets);
  } else if (effect.kind === 'magicQpj') {
    updateQpjEffect(model, effect, projectiles, enemyTargets);
  } else if (effect.kind === 'magicDemonBuff') {
    updateDemonBuffEffect(target, effect, elapsedMs);
  } else if (effect.kind === 'magicFlower') {
    updateFlowerEffect(model, target, friendlyPets, enemyTargets, effect, elapsedMs);
  } else if (effect.kind === 'magicFlag') {
    updateFlagEffect(model, target, effect, elapsedMs);
  } else if (effect.kind === 'magicBagua') {
    updateBaguaEffect(model, effect, elapsedMs);
  } else if (effect.kind === 'magicZlHummer') {
    updateZlHummerEffect(model, effect, projectiles);
  } else if (effect.kind === 'magicBigBottle') {
    updateBigBottleEffect(model, effect, source);
  } else if (effect.kind === 'magicSnow') {
    updateSnowEffect(model, effect, projectiles, random);
  } else if (effect.kind === 'magicPearl') {
    updatePearlEffect(model, target, effect, elapsedMs, projectiles, enemyTargets, random);
  }
  effect.remainingMs -= elapsedMs;

  if (effect.remainingMs <= 0) {
    if (effect.kind === 'magicDemonBuff') {
      target.combat.magicBuff = undefined;
    } else if (effect.kind === 'magicFlower') {
      clearMagicWeaponFlower(target, friendlyPets, effect, enemyTargets);
    } else if (effect.kind === 'magicFlag') {
      clearHeroMagicFlagGuard(target.combat);
    }
    model.action = 'wait';
    model.activeEffect = undefined;
    model.message = `${model.current?.name ?? '法宝'} 待机`;
  }
}

export function formatMagicWeaponState(model: MagicWeaponModel): string {
  const current = model.current;
  if (!current) {
    return `none | ${model.message}`;
  }

  const effect = model.activeEffect;
  const remaining = effect ? ` | remain ${formatSeconds(effect.remainingMs)}s` : '';
  return `${current.fillName}/${current.name} ${current.element} Lv.${current.level} ${model.action}${remaining} | ${model.message}`;
}

export function findClosestMagicWeaponTarget(
  source: Pick<MagicWeaponSourceSnapshot, 'x' | 'y'>,
  targets: readonly MagicWeaponEnemyTarget[],
): MagicWeaponEnemyTarget | undefined {
  let closest: MagicWeaponEnemyTarget | undefined;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const target of targets) {
    if (!target.isAlive) {
      continue;
    }

    const distance = Math.hypot(target.x - source.x, target.y - source.y);
    if (distance < closestDistance) {
      closestDistance = distance;
      closest = target;
    }
  }

  return closest;
}

function createMagicWeaponEquipState(
  equipped: EquipmentInstance,
): MagicWeaponEquipState | undefined {
  const fillName = equipped.definition.fillName;
  if (!isSupportedMagicWeapon(fillName)) {
    return undefined;
  }

  return {
    fillName,
    name: equipped.definition.name,
    level: equipped.definition.magicWeapon?.level ?? 1,
    element: equipped.definition.magicWeapon?.element ?? '无',
  };
}

function createHealingEffect(current: MagicWeaponEquipState): MagicWeaponHealingEffect {
  const woodMultiplier = current.element.includes('木')
    ? MagicWeaponTuning.leafWoodMultiplier
    : 1;
  const totalMs = MagicWeaponTuning.leafDurationMs * woodMultiplier;

  if (current.fillName === 'syl') {
    return {
      kind: 'magicLeafCure2',
      totalMs,
      remainingMs: totalMs,
      hpPerSecond: MagicWeaponTuning.leaf2HpPerSecond,
      mpPerSecond: MagicWeaponTuning.leaf2MpPerSecond,
    };
  }

  return {
    kind: 'magicLeafCure',
    totalMs,
    remainingMs: totalMs,
    hpPerSecond: MagicWeaponTuning.leafHpPerSecond,
    mpPerSecond: 0,
  };
}

function createSword2Effect(source: MagicWeaponSourceSnapshot): MagicWeaponSword2Effect {
  return {
    kind: 'magicSword2',
    totalMs: MagicWeaponTuning.sword2ActionMs,
    remainingMs: MagicWeaponTuning.sword2ActionMs,
    windupMs: MagicWeaponTuning.sword2WindupMs,
    sourceId: source.sourceId,
    sourceX: source.x,
    sourceY: source.y,
    facingX: source.facingX,
    hasSpawnedStrike: false,
  };
}

function createQpjEffect(
  source: MagicWeaponSourceSnapshot,
  current: MagicWeaponEquipState,
): MagicWeaponQpjEffect {
  const totalMs = current.element.includes('木')
    ? MagicWeaponTuning.qpjActiveWoodActionMs
    : MagicWeaponTuning.qpjActiveActionMs;
  return {
    kind: 'magicQpj',
    totalMs,
    remainingMs: totalMs,
    sourceId: source.sourceId,
    sourceX: source.x,
    sourceY: source.y,
    facingX: source.facingX,
    hasSpawnedSwords: false,
    projectileIds: [],
  };
}

function createUmbrellaEffect(
  current: MagicWeaponEquipState,
  effectiveStats: Pick<HeroEffectiveStats, 'defense' | 'magicDefensePercent'> | undefined,
): MagicWeaponUmbrellaEffect {
  const defense = Math.max(1, effectiveStats?.defense ?? 1);
  const magicDefense = Math.max(0, effectiveStats?.magicDefensePercent ?? 0);
  const level = Math.max(1, current.level);
  const isWood = current.element.includes('木');
  const isUmbrella2 = current.fillName === 'hywjs';
  const baseAmount = isUmbrella2
    ? defense * level + magicDefense * level * 20
    : defense * level;
  const multiplier = isWood
    ? (isUmbrella2
      ? MagicWeaponTuning.umbrella2WoodMultiplier
      : MagicWeaponTuning.umbrellaWoodMultiplier)
    : 1;
  const shieldAmount = baseAmount * multiplier;

  return {
    kind: 'magicUmbrella',
    shieldKind: isUmbrella2 ? 'magicUmbrellaDefend2' : 'magicUmbrellaDefend',
    totalMs: MagicWeaponTuning.umbrellaActionMs,
    remainingMs: MagicWeaponTuning.umbrellaActionMs,
    shieldAmount,
  };
}

function createRingEffect(
  current: MagicWeaponEquipState,
  target: MagicWeaponTarget,
): MagicWeaponRingEffect {
  const isWood = current.element.includes('木');
  const baseRestoreRate = Math.max(1, current.level) * MagicWeaponTuning.ringRestoreRatePerLevel;
  const restoreRate = isWood ? baseRestoreRate * 2 : baseRestoreRate;
  const invulnerableMs = MagicWeaponTuning.ringInvulnerableMs *
    (isWood ? MagicWeaponTuning.ringWoodInvulnerableMultiplier : 1);

  return {
    kind: 'magicRing',
    totalMs: MagicWeaponTuning.ringActionMs,
    remainingMs: MagicWeaponTuning.ringActionMs,
    invulnerableMs,
    hpRestore: target.combat.maxHp * restoreRate,
    mpRestore: target.skill.maxMp * restoreRate * MagicWeaponTuning.ringMpRestoreScale,
  };
}

function createTimerEffect(
  current: MagicWeaponEquipState,
  target: MagicWeaponTarget,
  source: MagicWeaponSourceSnapshot,
): MagicWeaponTimerEffect {
  const totalMs = current.element.includes('木')
    ? MagicWeaponTuning.timerWoodWaitMs
    : MagicWeaponTuning.timerWaitMs;

  return {
    kind: 'magicTimer',
    totalMs,
    remainingMs: totalMs,
    recordedHp: target.combat.hp,
    recordedMp: target.skill.mp,
    recordedX: source.x,
    recordedY: source.y,
  };
}

function createDemonBuffEffect(
  current: MagicWeaponEquipState,
  target: MagicWeaponTarget,
): MagicWeaponDemonBuffEffect {
  if (current.fillName === 'sxfb') {
    const totalMs = current.element.includes('木')
      ? MagicWeaponTuning.sxfbWoodDurationMs
      : MagicWeaponTuning.sxfbDurationMs;
    return {
      kind: 'magicDemonBuff',
      buffKind: 'sxfbBuff',
      totalMs,
      remainingMs: totalMs,
      attackBonusPercent: MagicWeaponTuning.sxfbAttackBonusPercent,
      critBonusPercent: MagicWeaponTuning.sxfbCritBonusPercent,
      hpDrainPerSecond: target.combat.maxHp * MagicWeaponTuning.sxfbHpDrainRatePerSecond,
      drainCarryMs: 0,
    };
  }

  if (current.fillName === 'yxfb') {
    const totalMs = MagicWeaponTuning.yxfbDurationMs *
      (current.element.includes('木') ? MagicWeaponTuning.yxfbWoodMultiplier : 1);
    return {
      kind: 'magicDemonBuff',
      buffKind: 'yxfbBuff2',
      totalMs,
      remainingMs: totalMs,
      attackBonusPercent: MagicWeaponTuning.yxfbAttackBonusPercent,
      critBonusPercent: MagicWeaponTuning.yxfbCritBonusPercent,
      hpDrainPerSecond: 0,
      drainCarryMs: 0,
    };
  }

  const totalMs = current.element.includes('木')
    ? MagicWeaponTuning.lxfbWoodDurationMs
    : MagicWeaponTuning.lxfbDurationMs;
  return {
    kind: 'magicDemonBuff',
    buffKind: 'xlfbBuff',
    totalMs,
    remainingMs: totalMs,
    attackBonusPercent: MagicWeaponTuning.lxfbAttackBonusPercent,
    critBonusPercent: MagicWeaponTuning.lxfbCritBonusPercent,
    hpDrainPerSecond: target.combat.maxHp * MagicWeaponTuning.lxfbHpDrainRatePerSecond,
    drainCarryMs: 0,
  };
}

function createFlowerEffect(
  current: MagicWeaponEquipState,
  target: MagicWeaponTarget,
): MagicWeaponFlowerEffect {
  const level = Math.max(1, current.level);
  const totalMs = MagicWeaponTuning.flowerBaseDurationMs +
    level * MagicWeaponTuning.flowerDurationPerLevelMs;
  const actionRemainingMs = current.element.includes('木')
    ? MagicWeaponTuning.flowerWoodActionMs
    : MagicWeaponTuning.flowerActionMs;
  const basePower = Math.max(0, target.effectiveStats?.power ?? 0);

  return {
    kind: 'magicFlower',
    totalMs,
    remainingMs: totalMs,
    actionRemainingMs,
    attackBonusFlat: basePower * MagicWeaponTuning.flowerHeroAttackFlatRate,
    allyAttackMultiplier: MagicWeaponTuning.flowerPetAttackMultiplier,
    enemyDamageMultiplier: MagicWeaponTuning.flowerEnemyDamageMultiplier,
    affectedHeroIds: [],
    affectedPetIds: [],
    affectedEnemyIds: [],
  };
}

function createFlagEffect(current: MagicWeaponEquipState): MagicWeaponFlagEffect {
  const actionRemainingMs = current.element.includes('木')
    ? MagicWeaponTuning.flagWoodActionMs
    : MagicWeaponTuning.flagActionMs;

  return {
    kind: 'magicFlag',
    totalMs: MagicWeaponTuning.flagGuardDurationMs,
    remainingMs: MagicWeaponTuning.flagGuardDurationMs,
    actionRemainingMs,
    debuffMs: MagicWeaponTuning.flagDebuffMs,
  };
}

function createBaguaEffect(current: MagicWeaponEquipState): MagicWeaponBaguaEffect {
  const durationMs = current.element === 'wood' || current.element.includes('木')
    ? MagicWeaponTuning.baguaWoodStunMs
    : MagicWeaponTuning.baguaStunMs;

  return {
    kind: 'magicBagua',
    totalMs: MagicWeaponTuning.baguaActionMs,
    remainingMs: MagicWeaponTuning.baguaActionMs,
    durationMs,
    affectedEnemyIds: [],
  };
}

function createZlHummerEffect(
  current: MagicWeaponEquipState,
  target: MagicWeaponTarget,
  source: MagicWeaponSourceSnapshot,
): MagicWeaponZlHummerEffect {
  const totalMs = current.element.includes('木')
    ? MagicWeaponTuning.zlHummerWoodActionMs
    : MagicWeaponTuning.zlHummerActionMs;
  const level = Math.max(1, current.level);
  const basePower = Math.max(
    1,
    target.effectiveStats?.power ?? MagicWeaponTuning.zlHummerFallbackPower,
  );
  const damage = basePower *
    (MagicWeaponTuning.zlHummerDamageLevelBase +
      (level - 1) * MagicWeaponTuning.zlHummerDamageLevelStep) /
    MagicWeaponTuning.zlHummerDamageDivisor *
    MagicWeaponTuning.zlHummerDamageMultiplier;

  return {
    kind: 'magicZlHummer',
    totalMs,
    remainingMs: totalMs,
    sourceId: source.sourceId,
    sourceX: source.x,
    sourceY: source.y,
    facingX: source.facingX,
    hasSpawnedHammer: false,
    damage,
  };
}

function createBigBottleEffect(
  model: MagicWeaponModel,
  current: MagicWeaponEquipState,
  source: MagicWeaponSourceSnapshot,
): MagicWeaponBigBottleEffect {
  const totalMs = current.element.includes('木')
    ? MagicWeaponTuning.bigBottleWoodActionMs
    : MagicWeaponTuning.bigBottleActionMs;
  const platformId = `magic-big-bottle-${source.sourceId}`;

  model.platforms = model.platforms.filter((platform) => platform.id !== platformId && platform.active);
  model.platforms.push({
    id: platformId,
    sourceId: source.sourceId,
    x: source.x,
    y: source.y + MagicWeaponTuning.bigBottleInitialOffsetY,
    width: MagicWeaponTuning.bigBottleWidth,
    height: MagicWeaponTuning.bigBottleHeight,
    totalMs: MagicWeaponTuning.bigBottleDurationMs,
    remainingMs: MagicWeaponTuning.bigBottleDurationMs,
    active: true,
  });

  return {
    kind: 'magicBigBottle',
    totalMs,
    remainingMs: totalMs,
    sourceId: source.sourceId,
    platformId,
  };
}

function createSnowEffect(
  current: MagicWeaponEquipState,
  target: MagicWeaponTarget,
  source: MagicWeaponSourceSnapshot,
): MagicWeaponSnowEffect {
  const totalMs = current.element.includes('木')
    ? MagicWeaponTuning.snowWoodActionMs
    : MagicWeaponTuning.snowActionMs;
  const level = Math.max(1, current.level);
  const basePower = Math.max(
    1,
    target.effectiveStats?.power ?? MagicWeaponTuning.snowFallbackPower,
  );

  return {
    kind: 'magicSnow',
    totalMs,
    remainingMs: totalMs,
    sourceId: source.sourceId,
    cameraX: source.cameraX ?? source.x - 470,
    cameraY: source.cameraY ?? source.y - 300,
    hasSpawnedSnow: false,
    projectileIds: [],
    damage: Math.max(1, basePower * level * MagicWeaponTuning.snowDamageLevelRate),
  };
}

function createPearlEffect(
  current: MagicWeaponEquipState,
  target: MagicWeaponTarget,
  source: MagicWeaponSourceSnapshot,
): MagicWeaponPearlEffect {
  const level = Math.max(1, current.level);
  const attackCount = 3 + Math.floor(level / 3) + (current.element.includes('木') ? 2 : 0);
  const totalMs = MagicWeaponTuning.pearlBeginMs +
    attackCount * (MagicWeaponTuning.pearlFlyMs + MagicWeaponTuning.pearlEffectMs) +
    1;
  const basePower = Math.max(0, target.effectiveStats?.power ?? 0);
  const pearlDamage = Math.max(
    1,
    basePower > 0
      ? basePower * level * MagicWeaponTuning.pearlDamageLevelRate
      : MagicWeaponTuning.pearlFallbackDamage,
  );

  return {
    kind: 'magicPearl',
    totalMs,
    remainingMs: totalMs,
    actionRemainingMs: MagicWeaponTuning.pearlActionMs,
    sourceId: source.sourceId,
    sourceX: source.x,
    sourceY: source.y,
    facingX: source.facingX,
    attackCount,
    completedAttacks: 0,
    phase: 'begin',
    phaseElapsedMs: 0,
    lastX: source.x,
    lastY: source.y,
    targetX: source.x,
    targetY: source.y,
    targetLog: [],
    spawnedFrames: [],
    projectileIds: [],
    pearlDamage,
  };
}

function applyMagicWeaponHealing(
  target: MagicWeaponTarget,
  effect: MagicWeaponHealingEffect,
  elapsedMs: number,
): void {
  if (elapsedMs <= 0) {
    return;
  }

  const seconds = elapsedMs / 1000;
  target.combat.hp = Math.min(
    target.combat.maxHp,
    target.combat.hp + effect.hpPerSecond * seconds,
  );
  target.skill.mp = Math.min(
    target.skill.maxMp,
    target.skill.mp + effect.mpPerSecond * seconds,
  );
}

function applyMagicWeaponShield(
  target: MagicWeaponTarget,
  effect: MagicWeaponUmbrellaEffect,
  current: MagicWeaponEquipState,
): void {
  applyHeroMagicShield(target.combat, {
    kind: effect.shieldKind,
    sourceName: current.name,
    initialAmount: effect.shieldAmount,
    remainingAmount: effect.shieldAmount,
    totalMs: MagicWeaponTuning.umbrellaShieldDurationMs,
    remainingMs: MagicWeaponTuning.umbrellaShieldDurationMs,
  });
}

function applyMagicWeaponRing(
  target: MagicWeaponTarget,
  effect: MagicWeaponRingEffect,
  current: MagicWeaponEquipState,
): void {
  applyHeroMagicInvulnerability(target.combat, {
    sourceName: current.name,
    totalMs: effect.invulnerableMs,
    remainingMs: effect.invulnerableMs,
  });
  target.combat.hp = Math.min(target.combat.maxHp, target.combat.hp + effect.hpRestore);
  target.skill.mp = Math.min(target.skill.maxMp, target.skill.mp + effect.mpRestore);
}

function restoreMagicTimer(
  target: MagicWeaponTarget,
  effect: MagicWeaponTimerEffect,
): void {
  target.combat.hp = Math.min(target.combat.maxHp, Math.max(0, effect.recordedHp));
  target.skill.mp = Math.min(target.skill.maxMp, Math.max(0, effect.recordedMp));
  if (target.movement) {
    target.movement.x = effect.recordedX;
    target.movement.y = effect.recordedY;
  }
}

function applyMagicWeaponDemonBuff(
  target: MagicWeaponTarget,
  effect: MagicWeaponDemonBuffEffect,
  current: MagicWeaponEquipState,
): void {
  if (effect.buffKind === 'yxfbBuff2') {
    target.combat.hp = Math.max(1, target.combat.hp / 2);
  }

  target.combat.magicBuff = {
    kind: effect.buffKind,
    sourceName: current.name,
    attackBonusPercent: effect.attackBonusPercent,
    critBonusPercent: effect.critBonusPercent,
    totalMs: effect.totalMs,
    remainingMs: effect.remainingMs,
  };
}

function applyMagicWeaponFlower(params: {
  target: MagicWeaponTarget;
  pets: readonly MagicWeaponFriendlyPetTarget[];
  enemies: readonly MagicWeaponEnemyTarget[];
  effect: MagicWeaponFlowerEffect;
  current: MagicWeaponEquipState;
}): void {
  applyHeroMagicFlowerBuff(params.target.combat, {
    kind: 'magicFlowerAddBuff',
    sourceName: params.current.name,
    attackBonusFlat: params.effect.attackBonusFlat,
    attackMultiplier: params.effect.allyAttackMultiplier,
    totalMs: params.effect.totalMs,
    remainingMs: params.effect.remainingMs,
  });
  params.effect.affectedHeroIds.push(params.target.combat.id);

  for (const pet of params.pets) {
    applyPetMagicFlowerBuff(pet, {
      kind: 'magicFlowerAddBuff',
      sourceName: params.current.name,
      attackMultiplier: params.effect.allyAttackMultiplier,
      totalMs: params.effect.totalMs,
      remainingMs: params.effect.remainingMs,
    });
    params.effect.affectedPetIds.push(pet.id);
  }

  for (const enemy of params.enemies) {
    if (!enemy.isAlive || !enemy.applyMagicFlowerDebuff) {
      continue;
    }

    enemy.applyMagicFlowerDebuff({
      sourceName: params.current.name,
      totalMs: params.effect.totalMs,
      remainingMs: params.effect.remainingMs,
      damageMultiplier: params.effect.enemyDamageMultiplier,
    });
    params.effect.affectedEnemyIds.push(enemy.id);
  }
}

function applyMagicWeaponFlag(
  target: MagicWeaponTarget,
  effect: MagicWeaponFlagEffect,
  current: MagicWeaponEquipState,
): void {
  applyHeroMagicFlagGuard(target.combat, {
    kind: 'magicFlagEffect',
    sourceName: current.name,
    totalMs: effect.totalMs,
    remainingMs: effect.remainingMs,
    debuffMs: effect.debuffMs,
  });
}

function applyMagicWeaponBagua(
  enemies: readonly MagicWeaponEnemyTarget[],
  effect: MagicWeaponBaguaEffect,
  current: MagicWeaponEquipState,
): void {
  for (const enemy of enemies) {
    if (!enemy.isAlive || !enemy.applyMagicBaguaStun) {
      continue;
    }

    enemy.applyMagicBaguaStun({
      sourceName: current.name,
      totalMs: effect.durationMs,
      remainingMs: effect.durationMs,
    });
    effect.affectedEnemyIds.push(enemy.id);
  }
}

function clearMagicWeaponFlower(
  target: MagicWeaponTarget,
  pets: readonly MagicWeaponFriendlyPetTarget[],
  effect: MagicWeaponFlowerEffect,
  enemies: readonly MagicWeaponEnemyTarget[],
): void {
  clearHeroMagicFlowerBuff(target.combat);
  for (const pet of pets) {
    if (effect.affectedPetIds.includes(pet.id)) {
      clearPetMagicFlowerBuff(pet);
    }
  }
  for (const enemy of enemies) {
    if (effect.affectedEnemyIds.includes(enemy.id)) {
      enemy.clearMagicFlowerDebuff?.();
    }
  }
}

function updateFlagEffect(
  model: MagicWeaponModel,
  target: MagicWeaponTarget,
  effect: MagicWeaponFlagEffect,
  elapsedMs: number,
): void {
  effect.actionRemainingMs = Math.max(0, effect.actionRemainingMs - elapsedMs);
  if (target.combat.magicFlagGuard) {
    target.combat.magicFlagGuard.remainingMs = Math.max(0, effect.remainingMs - elapsedMs);
  }
  if (effect.actionRemainingMs <= 0) {
    model.message = `${model.current?.name ?? '摩多魂幡'} 动作完成，护体持续`;
  }
}

function updateBaguaEffect(
  model: MagicWeaponModel,
  effect: MagicWeaponBaguaEffect,
  elapsedMs: number,
): void {
  if (elapsedMs > 0 && effect.remainingMs - elapsedMs <= 0) {
    model.message = `${model.current?.name ?? 'tjbg'} action done`;
  }
}

function updateZlHummerEffect(
  model: MagicWeaponModel,
  effect: MagicWeaponZlHummerEffect,
  projectiles: ProjectileSystemModel | undefined,
): void {
  if (effect.hasSpawnedHammer) {
    return;
  }

  effect.hasSpawnedHammer = true;
  if (!projectiles) {
    model.message = `${model.current?.name ?? 'zltc'} zltcskill`;
    return;
  }

  const projectile = spawnMagicZlHummerProjectile(projectiles, {
    sourceId: effect.sourceId,
    x: effect.sourceX,
    y: effect.sourceY,
    facingX: effect.facingX,
  }, effect.damage);
  effect.projectileId = projectile.id;
  model.message = `${model.current?.name ?? 'zltc'} ${projectile.runtimeName}`;
}

function updateSnowEffect(
  model: MagicWeaponModel,
  effect: MagicWeaponSnowEffect,
  projectiles: ProjectileSystemModel | undefined,
  random: () => number,
): void {
  if (effect.hasSpawnedSnow) {
    return;
  }

  effect.hasSpawnedSnow = true;
  if (!projectiles) {
    model.message = `${model.current?.name ?? 'stlp'} ef_snow x${MagicWeaponTuning.snowCount}`;
    return;
  }

  for (let index = 0; index < MagicWeaponTuning.snowCount; index += 1) {
    const x = effect.cameraX +
      MagicWeaponTuning.snowCameraOffsetX +
      random() * MagicWeaponTuning.snowCameraWidth;
    const y = effect.cameraY +
      MagicWeaponTuning.snowCameraOffsetY +
      random() * MagicWeaponTuning.snowCameraHeight;
    const angleDegrees = MagicWeaponTuning.snowMinAngleDegrees +
      random() * MagicWeaponTuning.snowAngleSpreadDegrees;
    const speed = MagicWeaponTuning.snowMinSpeed +
      random() * MagicWeaponTuning.snowSpeedSpread;
    const projectile = spawnMagicSnowProjectile(projectiles, {
      sourceId: effect.sourceId,
      x,
      y,
      facingX: 1,
    }, {
      angleDegrees,
      speed,
      damage: effect.damage,
    });
    effect.projectileIds.push(projectile.id);
  }

  model.message = `${model.current?.name ?? 'stlp'} ef_snow x${effect.projectileIds.length}`;
}

function updateBigBottleEffect(
  model: MagicWeaponModel,
  effect: MagicWeaponBigBottleEffect,
  _source: MagicWeaponSourceSnapshot | undefined,
): void {
  const platform = model.platforms.find((candidate) => candidate.id === effect.platformId);
  if (!platform || !platform.active) {
    model.message = `${model.current?.name ?? 'qljfb'} platform ended`;
    return;
  }

  model.message = `${model.current?.name ?? 'qljfb'} platform ${formatSeconds(platform.remainingMs)}s`;
}

function updateMagicWeaponPlatforms(
  model: MagicWeaponModel,
  deltaMs: number,
  source: MagicWeaponSourceSnapshot | undefined,
): void {
  const nextPlatforms: MagicWeaponPlatform[] = [];

  for (const platform of model.platforms) {
    if (!platform.active) {
      continue;
    }

    if (!source || source.sourceId !== platform.sourceId) {
      platform.active = false;
      continue;
    }

    followBigBottlePlatform(platform, source);
    platform.remainingMs -= Math.max(0, deltaMs);
    if (platform.remainingMs > 0) {
      nextPlatforms.push(platform);
    } else {
      platform.active = false;
    }
  }

  model.platforms = nextPlatforms;
}

function followBigBottlePlatform(
  platform: MagicWeaponPlatform,
  source: MagicWeaponSourceSnapshot,
): void {
  const deltaX = source.x - platform.x;
  if (Math.abs(deltaX) > MagicWeaponTuning.bigBottleFollowDeadZoneX) {
    platform.x += deltaX;
  }

  const deltaY = source.y - platform.y;
  if (Math.abs(deltaY) > MagicWeaponTuning.bigBottleFollowDeadZoneY) {
    platform.y += deltaY + MagicWeaponTuning.bigBottleFollowOffsetY;
  }
}

function updateDemonBuffEffect(
  target: MagicWeaponTarget,
  effect: MagicWeaponDemonBuffEffect,
  elapsedMs: number,
): void {
  if (target.combat.magicBuff) {
    target.combat.magicBuff.remainingMs = Math.max(0, effect.remainingMs - elapsedMs);
  }

  if (effect.hpDrainPerSecond <= 0 || elapsedMs <= 0) {
    return;
  }

  effect.drainCarryMs += elapsedMs;
  while (effect.drainCarryMs >= 1_000) {
    effect.drainCarryMs -= 1_000;
    target.combat.hp = Math.max(1, target.combat.hp - effect.hpDrainPerSecond);
  }
}

function updateFlowerEffect(
  model: MagicWeaponModel,
  target: MagicWeaponTarget,
  pets: readonly MagicWeaponFriendlyPetTarget[],
  enemies: readonly MagicWeaponEnemyTarget[],
  effect: MagicWeaponFlowerEffect,
  elapsedMs: number,
): void {
  effect.actionRemainingMs = Math.max(0, effect.actionRemainingMs - elapsedMs);
  const nextRemainingMs = Math.max(0, effect.remainingMs - elapsedMs);
  if (target.combat.magicFlowerBuff) {
    target.combat.magicFlowerBuff.remainingMs = nextRemainingMs;
  }
  for (const pet of pets) {
    if (effect.affectedPetIds.includes(pet.id) && pet.magicFlowerBuff) {
      pet.magicFlowerBuff.remainingMs = nextRemainingMs;
    }
  }
  for (const enemy of enemies) {
    if (!effect.affectedEnemyIds.includes(enemy.id) || !enemy.applyMagicFlowerDebuff) {
      continue;
    }
    enemy.applyMagicFlowerDebuff({
      sourceName: model.current?.name ?? '九佑魂莲',
      totalMs: effect.totalMs,
      remainingMs: nextRemainingMs,
      damageMultiplier: effect.enemyDamageMultiplier,
    });
  }
  if (effect.actionRemainingMs <= 0) {
    model.message = `${model.current?.name ?? '九佑魂莲'} 动作完成，效果持续`;
  }
}

function updatePearlEffect(
  model: MagicWeaponModel,
  target: MagicWeaponTarget,
  effect: MagicWeaponPearlEffect,
  elapsedMs: number,
  projectiles: ProjectileSystemModel | undefined,
  targets: readonly MagicWeaponEnemyTarget[],
  random: () => number,
): void {
  effect.actionRemainingMs = Math.max(0, effect.actionRemainingMs - elapsedMs);
  if (effect.actionRemainingMs <= 0 && model.action === 'hit') {
    model.action = 'wait';
  }

  let remainingStepMs = elapsedMs;
  while (remainingStepMs > 0 && effect.phase !== 'finished') {
    const phaseDuration = getPearlPhaseDuration(effect.phase);
    const phaseRemainingMs = phaseDuration - effect.phaseElapsedMs;
    const stepMs = Math.min(remainingStepMs, phaseRemainingMs);
    effect.phaseElapsedMs += stepMs;
    remainingStepMs -= stepMs;

    if (effect.phase === 'effect') {
      spawnDuePearlBullets(effect, projectiles);
    }

    if (effect.phaseElapsedMs >= phaseDuration) {
      advancePearlPhase(model, target, effect, projectiles, targets, random);
    }
  }
}

function advancePearlPhase(
  model: MagicWeaponModel,
  target: MagicWeaponTarget,
  effect: MagicWeaponPearlEffect,
  projectiles: ProjectileSystemModel | undefined,
  targets: readonly MagicWeaponEnemyTarget[],
  random: () => number,
): void {
  effect.phaseElapsedMs = 0;

  if (effect.phase === 'begin' || effect.phase === 'effect') {
    if (effect.phase === 'effect') {
      effect.completedAttacks += 1;
      effect.lastX = effect.targetX;
      effect.lastY = effect.targetY;
    }

    if (effect.completedAttacks >= effect.attackCount) {
      finishPearlEffect(model, target, effect, targets, random);
      return;
    }

    const nextTarget = findClosestMagicWeaponTarget(
      { x: effect.sourceX, y: effect.sourceY },
      targets,
    );
    if (!nextTarget) {
      finishPearlEffect(model, target, effect, targets, random);
      return;
    }

    effect.phase = 'fly';
    effect.targetId = nextTarget.id;
    effect.targetX = nextTarget.x;
    effect.targetY = nextTarget.y;
    effect.facingX = (effect.completedAttacks === 0 ? effect.sourceX : effect.lastX) < nextTarget.x ? 1 : -1;
    effect.targetLog.push(nextTarget.id);
    model.message = `${model.current?.name ?? '血海魔童'} ${effect.completedAttacks + 1}/${effect.attackCount} 锁定 ${nextTarget.id}`;
    return;
  }

  if (effect.phase === 'fly') {
    effect.phase = 'effect';
    effect.spawnedFrames = [];
    spawnDuePearlBullets(effect, projectiles);
    model.message = `${model.current?.name ?? '血海魔童'} ${effect.targetId ?? '-'} 三段打击`;
  }
}

function finishPearlEffect(
  model: MagicWeaponModel,
  target: MagicWeaponTarget,
  effect: MagicWeaponPearlEffect,
  targets: readonly MagicWeaponEnemyTarget[],
  random: () => number,
): void {
  effect.phase = 'finished';
  effect.remainingMs = 0;
  effect.endEffect = resolvePearlEndEffect(model.current, target, targets, random);
  if (effect.endEffect.kind === 'mp') {
    target.skill.mp = Math.min(target.skill.maxMp, target.skill.mp + effect.endEffect.amount);
    model.message = `${model.current?.name ?? '血海魔童'} 结束回蓝 ${Math.round(effect.endEffect.amount)}`;
  } else if (effect.endEffect.kind === 'stun') {
    model.message = `${model.current?.name ?? '血海魔童'} 结束眩晕 ${effect.endEffect.affectedEnemyIds.length} 个`;
  } else {
    model.message = `${model.current?.name ?? '血海魔童'} 结束中毒 ${effect.endEffect.affectedEnemyIds.length} 个`;
  }
}

function resolvePearlEndEffect(
  current: MagicWeaponEquipState | undefined,
  target: MagicWeaponTarget,
  targets: readonly MagicWeaponEnemyTarget[],
  random: () => number,
): MagicWeaponPearlEndEffect {
  const level = Math.max(1, current?.level ?? 1) * (current?.element.includes('木') ? 1.5 : 1);
  const aliveTargets = targets.filter((enemy) => enemy.isAlive);
  const roll = random();
  const mpAmount = target.skill.maxMp * level * MagicWeaponTuning.pearlMpRestoreRatePerLevel;

  if (roll <= 0.33 || aliveTargets.length === 0) {
    return {
      kind: 'mp',
      amount: mpAmount,
    };
  }

  if (roll <= 0.66) {
    const durationMs = level * MagicWeaponTuning.pearlStunDurationPerLevelMs;
    const affectedEnemyIds: string[] = [];
    for (const enemy of aliveTargets) {
      if (!enemy.applyMagicPearlStun) {
        continue;
      }
      enemy.applyMagicPearlStun({
        sourceName: current?.name ?? '血海魔童',
        totalMs: durationMs,
        remainingMs: durationMs,
      });
      affectedEnemyIds.push(enemy.id);
    }
    if (affectedEnemyIds.length === 0) {
      return {
        kind: 'mp',
        amount: mpAmount,
      };
    }
    return {
      kind: 'stun',
      durationMs,
      affectedEnemyIds,
    };
  }

  const durationMs = level * MagicWeaponTuning.pearlPoisonDurationPerLevelMs;
  const basePower = Math.max(1, target.effectiveStats?.power ?? MagicWeaponTuning.pearlFallbackDamage);
  const damagePerSecond = basePower * level * MagicWeaponTuning.pearlPoisonDamageRate;
  const affectedEnemyIds: string[] = [];
  for (const enemy of aliveTargets) {
    if (!enemy.applyMagicPearlPoison) {
      continue;
    }
    enemy.applyMagicPearlPoison({
      sourceName: current?.name ?? '血海魔童',
      totalMs: durationMs,
      remainingMs: durationMs,
      damagePerSecond,
    });
    affectedEnemyIds.push(enemy.id);
  }
  if (affectedEnemyIds.length === 0) {
    return {
      kind: 'mp',
      amount: mpAmount,
    };
  }
  return {
    kind: 'poison',
    durationMs,
    damagePerSecond,
    affectedEnemyIds,
  };
}

function spawnDuePearlBullets(
  effect: MagicWeaponPearlEffect,
  projectiles: ProjectileSystemModel | undefined,
): void {
  if (!projectiles) {
    return;
  }

  const frameChecks: readonly [number, 1 | 2 | 3][] = [
    [MagicWeaponTuning.pearlFrame3Ms, 1],
    [MagicWeaponTuning.pearlFrame12Ms, 2],
    [MagicWeaponTuning.pearlFrame28Ms, 3],
  ];

  for (const [dueMs, bulletIndex] of frameChecks) {
    if (effect.phaseElapsedMs < dueMs || effect.spawnedFrames.includes(bulletIndex)) {
      continue;
    }

    const projectile = spawnMagicPearlProjectile(projectiles, {
      sourceId: effect.sourceId,
      x: effect.targetX,
      y: effect.targetY,
      facingX: effect.facingX,
    }, bulletIndex, effect.pearlDamage);
    effect.spawnedFrames.push(bulletIndex);
    effect.projectileIds.push(projectile.id);
  }
}

function getPearlPhaseDuration(phase: MagicWeaponPearlEffect['phase']): number {
  if (phase === 'begin') {
    return MagicWeaponTuning.pearlBeginMs;
  }
  if (phase === 'fly') {
    return MagicWeaponTuning.pearlFlyMs;
  }
  if (phase === 'effect') {
    return MagicWeaponTuning.pearlEffectMs;
  }
  return 0;
}

function updateSword2Effect(
  model: MagicWeaponModel,
  effect: MagicWeaponSword2Effect,
  elapsedMs: number,
  projectiles: ProjectileSystemModel | undefined,
  targets: readonly MagicWeaponEnemyTarget[],
): void {
  if (elapsedMs <= 0 || effect.hasSpawnedStrike) {
    return;
  }

  const elapsedBefore = effect.totalMs - effect.remainingMs;
  const elapsedAfter = elapsedBefore + elapsedMs;
  if (elapsedAfter < effect.windupMs) {
    return;
  }

  effect.hasSpawnedStrike = true;
  const target = findClosestMagicWeaponTarget(
    { x: effect.sourceX, y: effect.sourceY },
    targets,
  );
  if (!target) {
    model.message = `${model.current?.name ?? '戮仙剑'} 没有目标`;
    return;
  }

  effect.targetId = target.id;
  if (!projectiles) {
    model.message = `${model.current?.name ?? '戮仙剑'} 锁定 ${target.id}`;
    return;
  }

  const projectile = spawnMagicSword2Projectile(projectiles, {
    sourceId: effect.sourceId,
    x: target.x,
    y: target.y,
    facingX: effect.facingX,
  });
  effect.projectileId = projectile.id;
  model.message = `${model.current?.name ?? '戮仙剑'} 命中 ${target.id}`;
}

function updateQpjEffect(
  model: MagicWeaponModel,
  effect: MagicWeaponQpjEffect,
  projectiles: ProjectileSystemModel | undefined,
  targets: readonly MagicWeaponEnemyTarget[],
): void {
  if (effect.hasSpawnedSwords) {
    return;
  }

  effect.hasSpawnedSwords = true;
  const spawned = spawnQpjProjectiles({
    projectiles,
    source: {
      sourceId: effect.sourceId,
      x: effect.sourceX,
      y: effect.sourceY,
      facingX: effect.facingX,
    },
    targets,
    count: MagicWeaponTuning.qpjActiveCount,
    mode: 'active',
  });
  effect.projectileIds = spawned.map((projectile) => projectile.id);
  model.message = spawned.length > 0
    ? `${model.current?.name ?? '青萍剑'} 主动 ${spawned.length} 剑`
    : `${model.current?.name ?? '青萍剑'} 没有目标`;
}

function updateQpjAutoCast(
  model: MagicWeaponModel,
  deltaMs: number,
  projectiles: ProjectileSystemModel | undefined,
  targets: readonly MagicWeaponEnemyTarget[],
  source: MagicWeaponSourceSnapshot | undefined,
): void {
  if (
    model.current?.fillName !== 'fbqpj' ||
    model.action !== 'wait' ||
    model.activeEffect ||
    !source
  ) {
    return;
  }

  model.qpjAutoTimerMs += Math.max(0, deltaMs);
  if (model.qpjAutoTimerMs < MagicWeaponTuning.qpjAutoIntervalMs) {
    return;
  }

  model.qpjAutoTimerMs = 0;
  const spawned = spawnQpjProjectiles({
    projectiles,
    source,
    targets,
    count: 1,
    mode: 'auto',
  });
  model.message = spawned.length > 0
    ? `${model.current.name} 自动飞剑`
    : `${model.current.name} 自动飞剑没有目标`;
}

function spawnQpjProjectiles(params: {
  projectiles: ProjectileSystemModel | undefined;
  source: MagicWeaponSourceSnapshot;
  targets: readonly MagicWeaponEnemyTarget[];
  count: number;
  mode: 'active' | 'auto';
}): ProjectileModel[] {
  if (!params.projectiles) {
    return [];
  }

  const target = findClosestMagicWeaponTarget(params.source, params.targets);
  if (!target) {
    return [];
  }

  const spawned: ProjectileModel[] = [];
  for (let i = 0; i < params.count; i += 1) {
    spawned.push(spawnMagicQpjProjectile(params.projectiles, {
      sourceId: params.source.sourceId,
      x: target.x,
      y: target.y,
      facingX: params.source.facingX,
    }, params.mode));
  }
  return spawned;
}

function isHealingEffect(effect: MagicWeaponActiveEffect): effect is MagicWeaponHealingEffect {
  return effect.kind === 'magicLeafCure' || effect.kind === 'magicLeafCure2';
}

function isMagicWeaponJustPressed(
  input: PlayerInputState,
  previousInput: PlayerInputState | undefined,
): boolean {
  return input.magicWeapon && !(previousInput?.magicWeapon ?? false);
}

function isSupportedMagicWeapon(fillName: string): fillName is MagicWeaponFillName {
  return fillName === 'xhhl' ||
    fillName === 'kyl' ||
    fillName === 'syl' ||
    fillName === 'lxj' ||
    fillName === 'fbqpj' ||
    fillName === 'hyzzs' ||
    fillName === 'hywjs' ||
    fillName === 'zjld' ||
    fillName === 'zsTimer' ||
    fillName === 'jyhl' ||
    fillName === 'mdhf' ||
    fillName === 'xhmt' ||
    fillName === 'tjbg' ||
    fillName === 'zltc' ||
    fillName === 'qljfb' ||
    fillName === 'stlp' ||
    fillName === 'lxfb' ||
    fillName === 'sxfb' ||
    fillName === 'yxfb';
}

function formatSeconds(ms: number): string {
  return (ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1);
}
