import { HeroNormalAttackEffectKeys } from '../assets/AssetManifest';
import type { ActiveHeroNormalAttack } from '../systems/HeroNormalAttackSystem';

export const HeroVisualRootHeight = 100;

export function projectHeroVisualRootY(footY: number): number {
  return footY - HeroVisualRootHeight / 2;
}

type VisualOffset = Readonly<{ forward: number; y: number }>;

const normalAttackVisualOffsets: Readonly<Record<string, VisualOffset>> = {
  [HeroNormalAttackEffectKeys.role1Hit1]: { forward: 120, y: 5 },
  [HeroNormalAttackEffectKeys.role1Hit3]: { forward: 30, y: -110 },
  [HeroNormalAttackEffectKeys.role1Hit4]: { forward: 160, y: -10 },
  [HeroNormalAttackEffectKeys.role1Hit5]: { forward: 165, y: -20 },
  [HeroNormalAttackEffectKeys.role2Hit1]: { forward: 50, y: 10 },
  [HeroNormalAttackEffectKeys.role2Hit2]: { forward: 50, y: 10 },
  [HeroNormalAttackEffectKeys.role3Hit1]: { forward: 130, y: -72 },
  [HeroNormalAttackEffectKeys.role3Hit2]: { forward: 140, y: -30 },
  [HeroNormalAttackEffectKeys.role3Hit3]: { forward: 180, y: -140 },
  [HeroNormalAttackEffectKeys.role4ShovelHit1]: { forward: 20, y: 30 },
  [HeroNormalAttackEffectKeys.role4ShovelHit2]: { forward: 15, y: 0 },
  [HeroNormalAttackEffectKeys.role4ShovelHit3]: { forward: 0, y: 0 },
  [HeroNormalAttackEffectKeys.role4ArrowHit1]: { forward: 90, y: 0 },
  [HeroNormalAttackEffectKeys.role4ArrowHit3]: { forward: 115, y: -20 },
  [HeroNormalAttackEffectKeys.role5SpearHit1]: { forward: 37, y: 43 },
  [HeroNormalAttackEffectKeys.role5SpearHit2]: { forward: 57, y: 49 },
  [HeroNormalAttackEffectKeys.role5SpearHit3]: { forward: 187, y: 49 },
  [HeroNormalAttackEffectKeys.role5SpearHit4]: { forward: 23, y: 53 },
  [HeroNormalAttackEffectKeys.role5SpearHit5]: { forward: 95, y: 47 },
  [HeroNormalAttackEffectKeys.role5SwordHit1]: { forward: 54.8, y: 51.6 },
  [HeroNormalAttackEffectKeys.role5SwordHit2]: { forward: 50.2, y: 37.35 },
  [HeroNormalAttackEffectKeys.role5SwordHit3]: { forward: 43.5, y: 52.7 },
  [HeroNormalAttackEffectKeys.role5SwordHit4]: { forward: 47.1, y: 54.2 },
  [HeroNormalAttackEffectKeys.role5SwordHit5]: { forward: 42.2, y: 54 },
  [HeroNormalAttackEffectKeys.role5SwordRunHit]: { forward: 35, y: 52 },
};

export function projectNormalAttackVisualPoint(
  attack: Pick<ActiveHeroNormalAttack, 'effectKey' | 'facingX'>,
  footX: number,
  footY: number,
): Readonly<{ x: number; y: number }> {
  const offset = normalAttackVisualOffsets[attack.effectKey] ?? { forward: 0, y: 0 };
  return {
    x: footX + attack.facingX * offset.forward,
    y: projectHeroVisualRootY(footY) + offset.y,
  };
}
