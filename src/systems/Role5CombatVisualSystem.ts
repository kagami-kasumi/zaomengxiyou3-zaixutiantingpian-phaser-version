import { role5SwordBodyAssets } from '../assets/AssetManifest';
import type { HeroWeaponMode } from './HeroNormalAttackSystem';

export type Role5ActionFrames = Readonly<{
  frames: readonly number[];
  holds: readonly number[];
  loop: boolean;
}>;

export type Role5SwordActionFrames = Readonly<{
  frameKeys: readonly string[];
  holds: readonly number[];
  loop: boolean;
}>;

const range = (start: number, count: number): number[] =>
  Array.from({ length: count }, (_, index) => start + index);

export const Role5SpearBodyAnimations: Readonly<Record<string, Role5ActionFrames>> = {
  wait: { frames: range(0, 6), holds: [3, 3, 4, 3, 3, 4], loop: true },
  wait2: { frames: range(8, 8), holds: [6, 3, 3, 3, 3, 3, 3, 4], loop: false },
  walk: { frames: range(16, 4), holds: [4, 4, 4, 4], loop: true },
  run: { frames: range(24, 4), holds: [3, 3, 3, 3], loop: true },
  jump1: { frames: [32], holds: [1], loop: false },
  jump2: { frames: range(40, 4), holds: [2, 2, 2, 2], loop: false },
  jump3: { frames: [33], holds: [1], loop: false },
  hurt: { frames: [34], holds: [10], loop: false },
  hit1: { frames: range(48, 4), holds: [2, 4, 2, 7], loop: false },
  hit2: { frames: range(56, 4), holds: [2, 3, 2, 8], loop: false },
  hit3: { frames: range(64, 5), holds: [2, 5, 1, 2, 8], loop: false },
  hit4: {
    frames: [72, 73, 74, 75, 76, 77, 78, 77, 76, 75, 74],
    holds: [3, 4, 1, 1, 1, 1, 1, 1, 2, 2, 6],
    loop: false,
  },
  hit5: { frames: range(80, 3), holds: [2, 4, 6], loop: false },
  hit114: { frames: range(88, 4), holds: [2, 3, 2, 8], loop: false },
};

const sword = (
  frameKeys: readonly string[],
  holds: readonly number[],
  loop = false,
): Role5SwordActionFrames => ({ frameKeys, holds, loop });

export const Role5SwordBodyAnimations: Readonly<Record<string, Role5SwordActionFrames>> = {
  wait: sword(role5SwordBodyAssets.idle.frameKeys, [3, 3, 4, 3, 3, 4], true),
  wait2: sword(role5SwordBodyAssets.idle.frameKeys, [6, 3, 3, 3, 3, 4]),
  walk: sword(role5SwordBodyAssets.walk.frameKeys, [4, 4, 4, 4], true),
  run: sword(role5SwordBodyAssets.run.frameKeys, [3, 3, 3, 3], true),
  jump1: sword(role5SwordBodyAssets.jump1.frameKeys, [1]),
  jump2: sword(role5SwordBodyAssets.jump2.frameKeys, [2, 2, 2, 2]),
  jump3: sword(role5SwordBodyAssets.jump3.frameKeys, [1]),
  hurt: sword(role5SwordBodyAssets.hurt.frameKeys, [7]),
  hit18: sword(role5SwordBodyAssets.attack1.frameKeys, [2, 3, 2, 3]),
  hit19: sword(role5SwordBodyAssets.attack2.frameKeys, [2, 1, 3, 2, 1]),
  hit20: sword(role5SwordBodyAssets.attack3.frameKeys, [3, 2, 2, 2]),
  hit21: sword(role5SwordBodyAssets.attack4.frameKeys, [2, 7, 2, 8]),
  hit22: sword(role5SwordBodyAssets.jumpAttack.frameKeys, [2, 4, 6]),
  hit114_1: sword(role5SwordBodyAssets.runAttack.frameKeys, [2, 4, 2, 7]),
  hit6: sword(role5SwordBodyAssets.runAttack.frameKeys, [2, 2, 11, 1]),
  hit7: sword(role5SwordBodyAssets.skill5_2.frameKeys, [2, 3, 5]),
  hit8: sword(role5SwordBodyAssets.skill5_1.frameKeys, [2, 2, 6]),
  hit9: sword(role5SwordBodyAssets.skill5_1.frameKeys, [3, 3, 9]),
  hit10: sword(role5SwordBodyAssets.skill5_2.frameKeys, [2, 3, 5]),
  hit11: sword(role5SwordBodyAssets.tlj.frameKeys, [2, 2, 6]),
  hit24_1: sword(role5SwordBodyAssets.skill2.frameKeys, [2, 2, 2, 2, 2, 5]),
  hit26: sword(role5SwordBodyAssets.skill4.frameKeys, [4, 4, 12]),
  hit27_1: sword(role5SwordBodyAssets.skill5_1.frameKeys, [3, 2, 12]),
  hit27_2: sword(role5SwordBodyAssets.skill5_2.frameKeys, [4, 2, 9]),
  hit28: sword(role5SwordBodyAssets.skill5_2.frameKeys, [1, 3, 7]),
  hit29: sword(role5SwordBodyAssets.mlsz.frameKeys, [1, 2, 10, 10, 8, 10, 8]),
};

export function readRole5HeldIndex(holds: readonly number[], elapsedMs: number, loop: boolean): number {
  const ticks = Math.floor(Math.max(0, elapsedMs) / (1000 / 30));
  const totalTicks = holds.reduce((sum, hold) => sum + hold, 0);
  const cursor = loop && totalTicks > 0
    ? ticks % totalTicks
    : Math.min(ticks, Math.max(0, totalTicks - 1));
  let end = 0;
  for (let index = 0; index < holds.length; index += 1) {
    end += holds[index] ?? 1;
    if (cursor < end) return index;
  }
  return Math.max(0, holds.length - 1);
}

export function getRole5BodyActionDurationMs(action: string, mode: HeroWeaponMode): number {
  const sequence = mode === 'sword'
    ? Role5SwordBodyAnimations[action]
    : Role5SpearBodyAnimations[action];
  return sequence ? sequence.holds.reduce((sum, hold) => sum + hold, 0) * (1000 / 30) : 0;
}

export function role5ActionUsesSword(action: string, mode: HeroWeaponMode): boolean {
  return mode === 'sword' || action === 'hit6' || action === 'hit7' || action === 'hit8' ||
    action === 'hit9' || action === 'hit10' || action === 'hit11' || action === 'hit23' ||
    action === 'hit24_1' || action === 'hit25_1' || action === 'hit25_2' || action === 'hit26' ||
    action === 'hit27_1' || action === 'hit27_2' || action === 'hit28' || action === 'hit29';
}
