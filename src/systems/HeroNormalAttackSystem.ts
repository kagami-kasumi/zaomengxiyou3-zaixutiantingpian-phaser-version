import { HeroNormalAttackEffectKeys } from '../assets/AssetManifest';
import type { AttackKind } from './CombatSystem';
import type { PlayerInputState } from './InputSystem';
import type { HeroMovementModel } from './HeroMovementSystem';
import {
  updateRole2ChargedAttack,
  type Role2ChargeResource,
} from './Role2PassiveSkillSystem';

export type HeroId = 1 | 2 | 3 | 4 | 5;
export type HeroWeaponMode = 'shovel' | 'arrow' | 'spear' | 'sword';

export type Hitbox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type HeroNormalAttackModel = {
  heroId: HeroId;
  comboIndex: number;
  lastAttackAtMs: number;
  cooldownUntilMs: number;
  weaponMode: HeroWeaponMode;
  activeAttack?: ActiveHeroNormalAttack;
  attackSerial: number;
};

export type HeroNormalAttackEvent = {
  attack: ActiveHeroNormalAttack;
  hitbox: Hitbox;
};

export type ActiveHeroNormalAttack = {
  id: number;
  heroId: HeroId;
  actionName: string;
  effectKey: string;
  sourceSymbol: string;
  followsHero: boolean;
  startedAtMs: number;
  hitboxActiveFromMs: number;
  hitboxActiveUntilMs: number;
  endsAtMs: number;
  facingX: -1 | 1;
  hitboxOffsetX: number;
  hitboxOffsetY: number;
  hitboxWidth: number;
  hitboxHeight: number;
  damage: number;
  attackKind: AttackKind;
  role2ChargePrepared?: boolean;
  role2ExtraDamageMultiplier?: number;
};

export type Role2NormalAttackOptions = {
  blbLevel: number;
  sjtLevel: number;
  sourcePower: number;
  resource: Role2ChargeResource;
  extraDamageMultiplier?: number | (() => number);
};

type AttackStep = {
  actionName: string;
  effectKey: string;
  sourceSymbol: string;
  followsHero: boolean;
  durationMs: number;
  hitboxStartMs: number;
  hitboxEndMs: number;
  cooldownMs: number;
  hitboxOffsetX: number;
  hitboxOffsetY: number;
  hitboxWidth: number;
  hitboxHeight: number;
  damage: number;
  attackKind: AttackKind;
};

const comboResetMs = 1500;
const role5ComboResetMs = 1200;

export const HeroDisplayNames: Record<HeroId, string> = {
  1: '孙悟空',
  2: '唐僧',
  3: '八戒',
  4: '沙僧',
  5: '白龙',
};

export function createHeroNormalAttack(
  heroId: HeroId,
): HeroNormalAttackModel {
  return {
    heroId,
    comboIndex: 0,
    lastAttackAtMs: Number.NEGATIVE_INFINITY,
    cooldownUntilMs: 0,
    weaponMode: getDefaultWeaponMode(heroId),
    attackSerial: 0,
  };
}

export function setHeroId(
  model: HeroNormalAttackModel,
  heroId: HeroId,
): void {
  model.heroId = heroId;
  model.comboIndex = 0;
  model.lastAttackAtMs = Number.NEGATIVE_INFINITY;
  model.cooldownUntilMs = 0;
  model.weaponMode = getDefaultWeaponMode(heroId);
  model.activeAttack = undefined;
}

export function setHeroWeaponMode(
  model: HeroNormalAttackModel,
  weaponMode: HeroWeaponMode,
): void {
  model.weaponMode = weaponMode;
  model.comboIndex = 0;
  model.lastAttackAtMs = Number.NEGATIVE_INFINITY;
  model.activeAttack = undefined;
}

export function updateHeroNormalAttack(
  model: HeroNormalAttackModel,
  input: PlayerInputState,
  previousInput: PlayerInputState | undefined,
  movement: HeroMovementModel,
  timeMs: number,
  role2Options?: Role2NormalAttackOptions,
): HeroNormalAttackEvent | undefined {
  const activeBeforeExpire = model.activeAttack;
  if (activeBeforeExpire && role2Options) {
    const chargeResult = updateRole2ChargedAttack({
      attack: activeBeforeExpire,
      attackHeld: input.attack,
      timeMs,
      ...role2Options,
    });
    if (chargeResult === 'converted-hit2') {
      return { attack: activeBeforeExpire, hitbox: createHitboxFromAttack(activeBeforeExpire, movement) };
    }
  }
  expireActiveAttack(model, timeMs);

  const justPressedAttack = input.attack && !(previousInput?.attack ?? false);
  if (!justPressedAttack || model.activeAttack || timeMs < model.cooldownUntilMs) {
    return undefined;
  }

  const step = chooseAttackStep(model, movement, timeMs);
  const attack: ActiveHeroNormalAttack = {
    id: model.attackSerial + 1,
    heroId: model.heroId,
    actionName: step.actionName,
    effectKey: step.effectKey,
    sourceSymbol: step.sourceSymbol,
    followsHero: step.followsHero,
    startedAtMs: timeMs,
    hitboxActiveFromMs: timeMs + step.hitboxStartMs,
    hitboxActiveUntilMs: timeMs + step.hitboxEndMs,
    endsAtMs: timeMs + step.durationMs,
    facingX: movement.facingX,
    hitboxOffsetX: step.hitboxOffsetX,
    hitboxOffsetY: step.hitboxOffsetY,
    hitboxWidth: step.hitboxWidth,
    hitboxHeight: step.hitboxHeight,
    damage: step.damage,
    attackKind: step.attackKind,
  };

  model.attackSerial = attack.id;
  model.activeAttack = attack;
  model.lastAttackAtMs = timeMs;
  model.cooldownUntilMs = timeMs + step.cooldownMs;

  if (role2Options) {
    updateRole2ChargedAttack({
      attack,
      attackHeld: input.attack,
      timeMs,
      ...role2Options,
    });
  }

  return {
    attack,
    hitbox: createHitboxFromAttack(attack, movement),
  };
}

export function getActiveHeroHitbox(
  model: HeroNormalAttackModel,
  movement: HeroMovementModel,
  timeMs: number,
): Hitbox | undefined {
  const attack = model.activeAttack;
  if (
    !attack ||
    timeMs < attack.hitboxActiveFromMs ||
    timeMs > attack.hitboxActiveUntilMs
  ) {
    return undefined;
  }

  return createHitboxFromAttack(attack, movement);
}

export function expireActiveAttack(
  model: HeroNormalAttackModel,
  timeMs: number,
): void {
  if (model.activeAttack && timeMs >= model.activeAttack.endsAtMs) {
    model.activeAttack = undefined;
  }
}

function chooseAttackStep(
  model: HeroNormalAttackModel,
  movement: HeroMovementModel,
  timeMs: number,
): AttackStep {
  if (model.heroId === 5) {
    return chooseRole5AttackStep(model, movement, timeMs);
  }

  if (!movement.grounded) {
    return chooseAirAttackStep(model);
  }

  const timedOut = timeMs - model.lastAttackAtMs > comboResetMs;
  if (timedOut) {
    model.comboIndex = 0;
  }

  return chooseGroundAttackStep(model);
}

function chooseAirAttackStep(model: HeroNormalAttackModel): AttackStep {
  model.comboIndex = 0;

  switch (model.heroId) {
    case 1:
      return createStep('hit3', HeroNormalAttackEffectKeys.role1Hit3, 'Role1Bullet3', true, 200, 50, 150, 210, 180, 112, 30);
    case 2:
      return createStep('hit1', HeroNormalAttackEffectKeys.role2Hit1, 'Role2Bullet1', false, 230, 45, 170, 230, 210, 126, 26, 'magic');
    case 3:
      return createStep('hit1', HeroNormalAttackEffectKeys.role3Hit1, 'Role3Bullet1', true, 250, 55, 180, 250, 178, 118, 32);
    case 4:
      if (model.weaponMode === 'arrow') {
        return createStep('hit3', HeroNormalAttackEffectKeys.role4ArrowHit3, 'Role4BulletArrow2', false, 250, 55, 190, 250, 245, 105, 29, 'magic');
      }
      return createStep('hit2', HeroNormalAttackEffectKeys.role4ShovelHit2, 'Role4Bullet2', true, 250, 55, 180, 250, 190, 118, 31, 'magic');
  }

  throw new Error(`Unhandled air attack hero id: ${model.heroId}`);
}

function chooseGroundAttackStep(model: HeroNormalAttackModel): AttackStep {
  switch (model.heroId) {
    case 1:
      return nextComboStep(model, [
        createStep('hit1', HeroNormalAttackEffectKeys.role1Hit1, 'Role1Bullet1', true, 170, 45, 135, 170, 178, 112, 30),
        createStep('hit2', HeroNormalAttackEffectKeys.role1Hit1, 'Role1Bullet1', true, 170, 45, 135, 170, 178, 112, 30),
        createStep('hit3', HeroNormalAttackEffectKeys.role1Hit3, 'Role1Bullet3', true, 170, 45, 135, 170, 188, 116, 31),
        createStep('hit4', HeroNormalAttackEffectKeys.role1Hit4, 'Role1Bullet4', true, 170, 45, 135, 170, 200, 120, 32),
        createStep('hit5', HeroNormalAttackEffectKeys.role1Hit5, 'Role1Bullet5', true, 170, 45, 135, 170, 215, 124, 34),
      ]);
    case 2:
      model.comboIndex = 0;
      return createStep('hit1', HeroNormalAttackEffectKeys.role2Hit1, 'Role2Bullet1', false, 230, 45, 170, 230, 210, 126, 26, 'magic');
    case 3:
      return nextComboStep(model, [
        createStep('hit2', HeroNormalAttackEffectKeys.role3Hit2, 'Role3Bullet2', true, 230, 55, 180, 230, 188, 118, 34),
        createStep('hit1', HeroNormalAttackEffectKeys.role3Hit1, 'Role3Bullet1', true, 230, 55, 180, 230, 178, 118, 32),
        createStep('hit3', HeroNormalAttackEffectKeys.role3Hit3, 'Role3Bullet3', true, 230, 55, 180, 230, 205, 124, 36),
      ]);
    case 4:
      if (model.weaponMode === 'arrow') {
        return nextComboStep(model, [
          createStep('hit1', HeroNormalAttackEffectKeys.role4ArrowHit1, 'Role4BulletArrow1', false, 190, 45, 145, 190, 238, 100, 28, 'magic'),
          createStep('hit2', HeroNormalAttackEffectKeys.role4ArrowHit1, 'Role4BulletArrow1', false, 190, 45, 145, 190, 238, 100, 28, 'magic'),
          createStep('hit3', HeroNormalAttackEffectKeys.role4ArrowHit3, 'Role4BulletArrow2', false, 190, 45, 145, 190, 255, 106, 30, 'magic'),
        ]);
      }
      return nextComboStep(model, [
        createStep('hit1', HeroNormalAttackEffectKeys.role4ShovelHit1, 'Role4Bullet1', true, 190, 45, 145, 190, 190, 118, 31, 'magic'),
        createStep('hit2', HeroNormalAttackEffectKeys.role4ShovelHit2, 'Role4Bullet2', true, 190, 45, 145, 190, 200, 118, 32, 'magic'),
        createStep('hit3', HeroNormalAttackEffectKeys.role4ShovelHit3, 'Role4Bullet3', true, 190, 45, 145, 190, 212, 122, 34, 'magic'),
      ]);
  }

  throw new Error(`Unhandled ground attack hero id: ${model.heroId}`);
}

function chooseRole5AttackStep(
  model: HeroNormalAttackModel,
  movement: HeroMovementModel,
  timeMs: number,
): AttackStep {
  const swordMode = model.weaponMode === 'sword';
  const timedOut = timeMs - model.lastAttackAtMs > role5ComboResetMs;
  if (timedOut) {
    model.comboIndex = 0;
  }

  if (!movement.grounded) {
    model.comboIndex = 0;
    return swordMode
      ? createStep('hit22', HeroNormalAttackEffectKeys.role5SwordHit5, 'swordhit5', true, 210, 45, 160, 210, 205, 118, 35)
      : createStep('hit5', HeroNormalAttackEffectKeys.role5SpearUnknown, 'doSingleHit unresolved', true, 210, 45, 160, 210, 205, 118, 35);
  }

  if (movement.runningDirection !== 0) {
    model.comboIndex = 0;
    return swordMode
      ? createStep('hit114_1', HeroNormalAttackEffectKeys.role5SwordRunHit, 'swordhit6', true, 210, 45, 160, 210, 240, 112, 36)
      : createStep('hit114', HeroNormalAttackEffectKeys.role5SpearUnknown, 'Role5runattack', false, 210, 45, 160, 210, 235, 112, 36);
  }

  if (swordMode) {
    return nextComboStep(model, [
      createStep('hit18', HeroNormalAttackEffectKeys.role5SwordHit1, 'swordhit1', true, 190, 40, 150, 190, 195, 112, 32),
      createStep('hit19', HeroNormalAttackEffectKeys.role5SwordHit2, 'swordhit2', true, 190, 40, 150, 190, 200, 114, 33),
      createStep('hit20', HeroNormalAttackEffectKeys.role5SwordHit3, 'swordhit3', true, 190, 40, 150, 190, 208, 116, 34),
      createStep('hit21', HeroNormalAttackEffectKeys.role5SwordHit4, 'swordhit4', true, 190, 40, 150, 190, 218, 120, 36),
    ]);
  }

  return nextComboStep(model, [
    createStep('hit1', HeroNormalAttackEffectKeys.role5SpearUnknown, 'doSingleHit unresolved', true, 190, 40, 150, 190, 190, 112, 32),
    createStep('hit2', HeroNormalAttackEffectKeys.role5SpearUnknown, 'doSingleHit unresolved', true, 190, 40, 150, 190, 198, 114, 33),
    createStep('hit3', HeroNormalAttackEffectKeys.role5SpearUnknown, 'doSingleHit unresolved', true, 190, 40, 150, 190, 208, 116, 34),
    createStep('hit4', HeroNormalAttackEffectKeys.role5SpearUnknown, 'doSingleHit unresolved', true, 190, 40, 150, 190, 220, 118, 35),
  ]);
}

function nextComboStep(model: HeroNormalAttackModel, steps: readonly AttackStep[]): AttackStep {
  const step = steps[model.comboIndex % steps.length];
  model.comboIndex = (model.comboIndex + 1) % steps.length;
  return step;
}

function createStep(
  actionName: string,
  effectKey: string,
  sourceSymbol: string,
  followsHero: boolean,
  durationMs: number,
  hitboxStartMs: number,
  hitboxEndMs: number,
  cooldownMs: number,
  hitboxWidth: number,
  hitboxHeight: number,
  damage: number,
  attackKind: AttackKind = 'physics',
): AttackStep {
  return {
    actionName,
    effectKey,
    sourceSymbol,
    followsHero,
    durationMs,
    hitboxStartMs,
    hitboxEndMs,
    cooldownMs,
    hitboxOffsetX: 44,
    hitboxOffsetY: -72,
    hitboxWidth,
    hitboxHeight,
    damage,
    attackKind,
  };
}

function createHitboxFromAttack(
  attack: ActiveHeroNormalAttack,
  movement: HeroMovementModel,
): Hitbox {
  const centerX = movement.x + attack.facingX * attack.hitboxOffsetX + attack.facingX * attack.hitboxWidth / 2;
  const centerY = movement.y + attack.hitboxOffsetY;

  return {
    x: centerX - attack.hitboxWidth / 2,
    y: centerY - attack.hitboxHeight / 2,
    width: attack.hitboxWidth,
    height: attack.hitboxHeight,
  };
}

function getDefaultWeaponMode(heroId: HeroId): HeroWeaponMode {
  switch (heroId) {
    case 4:
      return 'shovel';
    case 5:
      return 'spear';
    default:
      return 'shovel';
  }
}
