import type {
  EquipmentLoadout,
} from './EquipmentSystem';
import {
  applyHeroMagicFlagGuard,
  applyHeroMagicFlowerBuff,
  applyHeroMagicInvulnerability,
  applyHeroMagicShield,
  clearHeroMagicFlagGuard,
  clearHeroMagicFlowerBuff,
} from './HeroCombatSystem';
import type { PlayerInputState } from './InputSystem';
import {
  applyPetMagicFlowerBuff,
  clearPetMagicFlowerBuff,
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
import { MagicWeaponTuning } from './MagicWeaponTuning';
import type {
  MagicWeaponActiveEffect,
  MagicWeaponBaguaEffect,
  MagicWeaponBigBottleEffect,
  MagicWeaponDemonBuffEffect,
  MagicWeaponEnemyTarget,
  MagicWeaponEquipState,
  MagicWeaponFlagEffect,
  MagicWeaponFlowerEffect,
  MagicWeaponFriendlyPetTarget,
  MagicWeaponHealingEffect,
  MagicWeaponModel,
  MagicWeaponPearlEndEffect,
  MagicWeaponPearlEffect,
  MagicWeaponPlatform,
  MagicWeaponQpjEffect,
  MagicWeaponRingEffect,
  MagicWeaponSnowEffect,
  MagicWeaponSourceSnapshot,
  MagicWeaponSword2Effect,
  MagicWeaponTarget,
  MagicWeaponTimerEffect,
  MagicWeaponTriggerResult,
  MagicWeaponUmbrellaEffect,
  MagicWeaponZlHummerEffect,
} from './MagicWeaponTypes';
import {
  createBaguaEffect,
  createBigBottleEffect,
  createDemonBuffEffect,
  createFlagEffect,
  createFlowerEffect,
  createHealingEffect,
  createMagicWeaponEquipState,
  createPearlEffect,
  createQpjEffect,
  createRingEffect,
  createSnowEffect,
  createSword2Effect,
  createTimerEffect,
  createUmbrellaEffect,
  createZlHummerEffect,
} from './MagicWeaponEffectFactory';

export { MagicWeaponTuning } from './MagicWeaponTuning';
export type {
  MagicWeaponAction,
  MagicWeaponActiveEffect,
  MagicWeaponBaguaEffect,
  MagicWeaponBigBottleEffect,
  MagicWeaponDemonBuffEffect,
  MagicWeaponEffectKind,
  MagicWeaponEnemyTarget,
  MagicWeaponEquipState,
  MagicWeaponFlagEffect,
  MagicWeaponFlowerEffect,
  MagicWeaponFriendlyPetTarget,
  MagicWeaponHealingEffect,
  MagicWeaponModel,
  MagicWeaponPearlEndEffect,
  MagicWeaponPearlEffect,
  MagicWeaponPlatform,
  MagicWeaponQpjEffect,
  MagicWeaponRingEffect,
  MagicWeaponSnowEffect,
  MagicWeaponSourceSnapshot,
  MagicWeaponSword2Effect,
  MagicWeaponTarget,
  MagicWeaponTimerEffect,
  MagicWeaponTriggerResult,
  MagicWeaponUmbrellaEffect,
  MagicWeaponZlHummerEffect,
} from './MagicWeaponTypes';
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
  const endEffect = resolvePearlEndEffect(model.current, target, targets, random);
  effect.endEffect = endEffect;
  if (endEffect.kind === 'mp') {
    target.skill.mp = Math.min(target.skill.maxMp, target.skill.mp + endEffect.amount);
    model.message = `${model.current?.name ?? '血海魔童'} 结束回蓝 ${Math.round(endEffect.amount)}`;
  } else if (endEffect.kind === 'stun') {
    model.message = `${model.current?.name ?? '血海魔童'} 结束眩晕 ${endEffect.affectedEnemyIds.length} 个`;
  } else {
    model.message = `${model.current?.name ?? '血海魔童'} 结束中毒 ${endEffect.affectedEnemyIds.length} 个`;
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

function formatSeconds(ms: number): string {
  return (ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1);
}




