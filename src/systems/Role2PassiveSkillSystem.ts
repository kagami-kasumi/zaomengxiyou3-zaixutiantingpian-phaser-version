import { SkillFixedDamageCount, SkillFactorBase, SkillFactorPerLevel } from './SkillTuning';
import { HeroNormalAttackEffectKeys } from '../assets/AssetManifest';

const skillFixedDamage = [
  481, 1333, 2687, 3547, 4456, 6218, 7341, 9622, 12266,
  15279, 17075, 20724, 24783, 29287, 34223, 39640, 42814, 49006,
] as const;

const frameMs = 1000 / 60;

export type Role2ChargeAttack = {
  heroId: number;
  actionName: string;
  effectKey: string;
  sourceSymbol: string;
  startedAtMs: number;
  hitboxActiveFromMs: number;
  hitboxActiveUntilMs: number;
  endsAtMs: number;
  damage: number;
  attackKind: 'physics' | 'magic';
  hitboxOffsetX: number;
  hitboxOffsetY: number;
  hitboxWidth: number;
  hitboxHeight: number;
  role2ChargePrepared?: boolean;
  role2ExtraDamageMultiplier?: number;
};

export type Role2ChargeResource = {
  mp: number;
  lastResult: string;
};

export type Role2ChargedAttackUpdateState =
  | 'charging'
  | 'released-hit1'
  | 'converted-hit2';

export type Role2ChargedAttackUpdate<TAttack extends Role2ChargeAttack = Role2ChargeAttack> = {
  state: Role2ChargedAttackUpdateState;
  attack: TAttack;
};

export const Role2PassiveTuning = {
  normalChargeFrames: 48,
  sjtChargeFrames: 12,
  releaseDurationMs: 230,
  releaseHitboxStartMs: 45,
  releaseHitboxEndMs: 170,
  hit2Width: 224,
  hit2Height: 136,
} as const;

export function getRole2SjtDamageMultiplier(sjtLevel: number): number {
  if (sjtLevel <= 0) return 1;
  return 1.1 + 0.005 * (Math.min(18, Math.max(1, Math.floor(sjtLevel))) - 1);
}

export function getRole2BlbMpCost(blbLevel: number): number {
  const levelIndex = Math.min(18, Math.max(1, Math.floor(blbLevel))) - 1;
  return Math.floor(
    15 * Math.pow(
      35173 * 0.065 / 15,
      Math.pow(levelIndex / 17, 0.55),
    ),
  );
}

export function calculateRole2BlbDamage(
  blbLevel: number,
  sourcePower: number,
  damageMultiplier = 1,
): number {
  const levelIndex = Math.min(18, Math.max(1, Math.floor(blbLevel))) - 1;
  const fixedPart = skillFixedDamage[levelIndex] * SkillFixedDamageCount[levelIndex];
  const powerPart = (
    SkillFactorBase + SkillFactorPerLevel * levelIndex
  ) * 6201 / 6550 * Math.max(0, sourcePower);
  const baseDamage = Math.floor(0.6 * (fixedPart + powerPart) / 7);
  return baseDamage * 1.178 * damageMultiplier;
}

export function updateRole2ChargedAttack<TAttack extends Role2ChargeAttack>(params: {
  attack: TAttack | undefined;
  attackHeld: boolean;
  timeMs: number;
  blbLevel: number;
  sjtLevel: number;
  sourcePower: number;
  resource: Role2ChargeResource;
  extraDamageMultiplier?: number | (() => number);
}): Role2ChargedAttackUpdate<TAttack> | undefined {
  const { attack } = params;
  if (!attack || attack.heroId !== 2 || attack.actionName !== 'hit1') {
    return undefined;
  }

  let nextAttack: TAttack = { ...attack };

  if (!nextAttack.role2ChargePrepared) {
    const role2ExtraDamageMultiplier = typeof params.extraDamageMultiplier === 'function'
      ? params.extraDamageMultiplier()
      : params.extraDamageMultiplier ?? 1;
    nextAttack = {
      ...nextAttack,
      role2ChargePrepared: true,
      role2ExtraDamageMultiplier,
      damage: nextAttack.damage * getRole2SjtDamageMultiplier(params.sjtLevel) *
        role2ExtraDamageMultiplier,
    };
  }

  if (params.blbLevel <= 0) return undefined;

  const mpCost = getRole2BlbMpCost(params.blbLevel);
  if (params.resource.mp < mpCost) {
    params.resource.lastResult = `blb mp ${params.resource.mp}/${mpCost}`;
    return undefined;
  }

  const chargeFrames = params.sjtLevel > 0
    ? Role2PassiveTuning.sjtChargeFrames
    : Role2PassiveTuning.normalChargeFrames;
  const thresholdMs = chargeFrames * frameMs;

  if (!params.attackHeld) {
    nextAttack = {
      ...nextAttack,
      startedAtMs: params.timeMs,
      hitboxActiveFromMs: params.timeMs + Role2PassiveTuning.releaseHitboxStartMs,
      hitboxActiveUntilMs: params.timeMs + Role2PassiveTuning.releaseHitboxEndMs,
      endsAtMs: params.timeMs + Role2PassiveTuning.releaseDurationMs,
    };
    params.resource.lastResult = 'blb released early: hit1';
    return { state: 'released-hit1', attack: nextAttack };
  }

  nextAttack = {
    ...nextAttack,
    hitboxActiveFromMs: nextAttack.startedAtMs + thresholdMs,
    hitboxActiveUntilMs: nextAttack.startedAtMs + thresholdMs + Role2PassiveTuning.releaseHitboxEndMs,
    endsAtMs: nextAttack.startedAtMs + thresholdMs + Role2PassiveTuning.releaseDurationMs,
  };

  if (params.timeMs - nextAttack.startedAtMs < thresholdMs) {
    params.resource.lastResult = `blb charging ${chargeFrames}`;
    return { state: 'charging', attack: nextAttack };
  }

  nextAttack = {
    ...nextAttack,
    actionName: 'hit2',
    effectKey: HeroNormalAttackEffectKeys.role2Hit2,
    sourceSymbol: 'Role2Bullet2',
    startedAtMs: params.timeMs,
    hitboxActiveFromMs: params.timeMs,
    hitboxActiveUntilMs: params.timeMs + Role2PassiveTuning.releaseHitboxEndMs,
    endsAtMs: params.timeMs + Role2PassiveTuning.releaseDurationMs,
    hitboxWidth: Role2PassiveTuning.hit2Width,
    hitboxHeight: Role2PassiveTuning.hit2Height,
    damage: calculateRole2BlbDamage(
      params.blbLevel,
      params.sourcePower,
      getRole2SjtDamageMultiplier(params.sjtLevel) * (nextAttack.role2ExtraDamageMultiplier ?? 1),
    ),
    attackKind: 'magic',
  };
  params.resource.mp -= mpCost;
  params.resource.lastResult = `blb hit2 mp ${params.resource.mp}`;
  return { state: 'converted-hit2', attack: nextAttack };
}

