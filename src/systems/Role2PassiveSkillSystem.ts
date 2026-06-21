import { HeroNormalAttackEffectKeys } from '../assets/AssetManifest';

const skillFixedDamage = [
  481, 1333, 2687, 3547, 4456, 6218, 7341, 9622, 12266,
  15279, 17075, 20724, 24783, 29287, 34223, 39640, 42814, 49006,
] as const;
const fixedDamageCount = [
  1, 1, 1, 1, 2, 2, 2, 2.5, 2.5,
  2.5, 2.8, 2.8, 2.8, 3.05, 3.05, 3.05, 3.25, 3.25,
] as const;
const skillFactorBase = 0.3407 * 8 + 2.075;
const skillFactorPerLevel = 0.0135 * 10 * 8 + 0.075 * 10;
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
  const fixedPart = skillFixedDamage[levelIndex] * fixedDamageCount[levelIndex];
  const powerPart = (
    skillFactorBase + skillFactorPerLevel * levelIndex
  ) * 6201 / 6550 * Math.max(0, sourcePower);
  const baseDamage = Math.floor(0.6 * (fixedPart + powerPart) / 7);
  return baseDamage * 1.178 * damageMultiplier;
}

export function updateRole2ChargedAttack(params: {
  attack: Role2ChargeAttack | undefined;
  attackHeld: boolean;
  timeMs: number;
  blbLevel: number;
  sjtLevel: number;
  sourcePower: number;
  resource: Role2ChargeResource;
  extraDamageMultiplier?: number | (() => number);
}): 'charging' | 'released-hit1' | 'converted-hit2' | undefined {
  const { attack } = params;
  if (!attack || attack.heroId !== 2 || attack.actionName !== 'hit1') {
    return undefined;
  }

  if (!attack.role2ChargePrepared) {
    attack.role2ChargePrepared = true;
    attack.role2ExtraDamageMultiplier = typeof params.extraDamageMultiplier === 'function'
      ? params.extraDamageMultiplier()
      : params.extraDamageMultiplier ?? 1;
    attack.damage *= getRole2SjtDamageMultiplier(params.sjtLevel) * attack.role2ExtraDamageMultiplier;
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
    attack.startedAtMs = params.timeMs;
    attack.hitboxActiveFromMs = params.timeMs + Role2PassiveTuning.releaseHitboxStartMs;
    attack.hitboxActiveUntilMs = params.timeMs + Role2PassiveTuning.releaseHitboxEndMs;
    attack.endsAtMs = params.timeMs + Role2PassiveTuning.releaseDurationMs;
    params.resource.lastResult = 'blb released early: hit1';
    return 'released-hit1';
  }

  attack.hitboxActiveFromMs = attack.startedAtMs + thresholdMs;
  attack.hitboxActiveUntilMs = attack.startedAtMs + thresholdMs + Role2PassiveTuning.releaseHitboxEndMs;
  attack.endsAtMs = attack.startedAtMs + thresholdMs + Role2PassiveTuning.releaseDurationMs;

  if (params.timeMs - attack.startedAtMs < thresholdMs) {
    params.resource.lastResult = `blb charging ${chargeFrames}`;
    return 'charging';
  }

  attack.actionName = 'hit2';
  attack.effectKey = HeroNormalAttackEffectKeys.role2Hit2;
  attack.sourceSymbol = 'Role2Bullet2';
  attack.startedAtMs = params.timeMs;
  attack.hitboxActiveFromMs = params.timeMs;
  attack.hitboxActiveUntilMs = params.timeMs + Role2PassiveTuning.releaseHitboxEndMs;
  attack.endsAtMs = params.timeMs + Role2PassiveTuning.releaseDurationMs;
  attack.hitboxWidth = Role2PassiveTuning.hit2Width;
  attack.hitboxHeight = Role2PassiveTuning.hit2Height;
  attack.damage = calculateRole2BlbDamage(
    params.blbLevel,
    params.sourcePower,
    getRole2SjtDamageMultiplier(params.sjtLevel) * (attack.role2ExtraDamageMultiplier ?? 1),
  );
  attack.attackKind = 'magic';
  params.resource.mp -= mpCost;
  params.resource.lastResult = `blb hit2 mp ${params.resource.mp}`;
  return 'converted-hit2';
}
