import type { HeroEffectiveStats, EquipmentInstance } from './EquipmentSystem';
import { MagicWeaponTuning } from './MagicWeaponTuning';
import type {
  MagicWeaponBaguaEffect,
  MagicWeaponBigBottleEffect,
  MagicWeaponDemonBuffEffect,
  MagicWeaponEquipState,
  MagicWeaponFillName,
  MagicWeaponFlagEffect,
  MagicWeaponFlowerEffect,
  MagicWeaponHealingEffect,
  MagicWeaponModel,
  MagicWeaponPearlEffect,
  MagicWeaponQpjEffect,
  MagicWeaponRingEffect,
  MagicWeaponSnowEffect,
  MagicWeaponSourceSnapshot,
  MagicWeaponSword2Effect,
  MagicWeaponTarget,
  MagicWeaponTimerEffect,
  MagicWeaponUmbrellaEffect,
  MagicWeaponZlHummerEffect,
} from './MagicWeaponTypes';
export function createMagicWeaponEquipState(
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

export function createHealingEffect(current: MagicWeaponEquipState): MagicWeaponHealingEffect {
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

export function createSword2Effect(source: MagicWeaponSourceSnapshot): MagicWeaponSword2Effect {
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

export function createQpjEffect(
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

export function createUmbrellaEffect(
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

export function createRingEffect(
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

export function createTimerEffect(
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

export function createDemonBuffEffect(
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

export function createFlowerEffect(
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

export function createFlagEffect(current: MagicWeaponEquipState): MagicWeaponFlagEffect {
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

export function createBaguaEffect(current: MagicWeaponEquipState): MagicWeaponBaguaEffect {
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

export function createZlHummerEffect(
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

export function createBigBottleEffect(
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

export function createSnowEffect(
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

export function createPearlEffect(
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


