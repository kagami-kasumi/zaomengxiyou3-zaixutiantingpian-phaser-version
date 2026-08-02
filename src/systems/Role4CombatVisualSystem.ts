import type { HeroMovementState } from './HeroMovementSystem';
import type { HeroSkillActionName } from './HeroSkillSystem';
import type { HeroWeaponMode } from './HeroNormalAttackSystem';

export type Role4BodyAction = HeroMovementState | 'hurt' | HeroSkillActionName | string;

export type Role4ActionFrames = Readonly<{
  frames: readonly number[];
  holds: readonly number[];
  loop: boolean;
}>;

const row = (index: number, columns: readonly number[]): number[] =>
  columns.map((column) => index * 6 + column);

const repeated = (values: readonly number[], count: number): number[] =>
  Array.from({ length: count }, () => values).flat();

const common: Readonly<Record<string, Role4ActionFrames>> = {
  wait: {
    frames: [
      ...repeated(row(0, [0, 1, 2, 3, 4, 5]), 6),
      ...row(1, [0, 1, 2, 3, 4, 5]),
    ],
    holds: [
      ...repeated([2, 2, 2, 3, 2, 4], 6),
      2, 2, 2, 13, 2, 24,
    ],
    loop: true,
  },
  wait2: { frames: row(1, [0, 1, 2, 3, 4, 5]), holds: [2, 2, 2, 13, 2, 24], loop: false },
  walk: { frames: row(2, [0, 1, 2, 3]), holds: [4, 4, 4, 4], loop: true },
  run: { frames: row(3, [0, 1, 2, 3]), holds: [2, 2, 2, 2], loop: true },
  jump1: { frames: row(4, [0]), holds: [1], loop: false },
  jump2: { frames: row(5, [0, 1, 2, 3, 4]), holds: [2, 2, 2, 2, 2], loop: false },
  jump3: { frames: row(4, [1]), holds: [1], loop: false },
  hurt: { frames: row(4, [2]), holds: [15], loop: false },
  hit11: { frames: row(4, [5]), holds: [4], loop: false },
};

export const Role4BodyAnimations: Readonly<
  Record<'shovel' | 'arrow', Readonly<Record<string, Role4ActionFrames>>>
> = {
  shovel: {
    ...common,
    hit1: { frames: row(6, [0, 1, 2]), holds: [2, 2, 6], loop: false },
    hit2: { frames: row(7, [0, 1, 2]), holds: [2, 2, 11], loop: false },
    hit3: { frames: repeated(row(8, [0, 1, 2, 3]), 3), holds: repeated([1, 1, 1, 2], 3), loop: false },
    hit4: { frames: row(9, [0, 1]), holds: [2, 19], loop: false },
    hit5: { frames: row(9, [0, 1]), holds: [2, 19], loop: false },
    hit6: { frames: row(4, [4]), holds: [10], loop: false },
    hit7: { frames: row(10, [0, 1, 2]), holds: [2, 2, 30], loop: false },
    hit8: { frames: row(11, [0, 1, 2, 3]), holds: [2, 2, 2, 15], loop: false },
    hit9: { frames: row(12, [0, 1, 2]), holds: [2, 2, 16], loop: false },
    hit10: { frames: row(10, [0, 1, 2]), holds: [2, 2, 30], loop: false },
    hit12: { frames: row(13, [0, 1, 2]), holds: [2, 2, 14], loop: false },
  },
  arrow: {
    ...common,
    hit1: { frames: row(6, [0, 1, 2, 3, 4]), holds: [2, 2, 1, 1, 3], loop: false },
    hit2: { frames: row(6, [0, 1, 2, 3, 4]), holds: [2, 2, 1, 1, 3], loop: false },
    hit3: { frames: row(7, [0, 1, 2, 3, 4, 5]), holds: [2, 2, 2, 2, 2, 4], loop: false },
    hit4: { frames: row(8, [0, 1, 2, 3, 4]), holds: [2, 4, 1, 1, 10], loop: false },
    hit5: { frames: row(4, [4]), holds: [20], loop: false },
    hit6: { frames: row(4, [3]), holds: [10], loop: false },
    hit7: { frames: row(9, [0, 1, 2]), holds: [2, 2, 30], loop: false },
    hit8: { frames: row(10, [0, 1, 2, 3, 4]), holds: [2, 2, 1, 1, 12], loop: false },
    hit9: { frames: row(11, [0, 1, 2, 3, 4, 5]), holds: [2, 2, 2, 2, 2, 20], loop: false },
    hit10: { frames: row(12, [0, 1, 2, 3, 4]), holds: [2, 7, 1, 1, 25], loop: false },
    hit12: { frames: row(13, [0, 1, 2, 3, 4, 5]), holds: [2, 18, 2, 2, 2, 24], loop: false },
  },
};

export function getRole4VisualWeaponMode(mode: HeroWeaponMode): 'shovel' | 'arrow' {
  return mode === 'arrow' ? 'arrow' : 'shovel';
}

export function readRole4HeldFrame(sequence: Role4ActionFrames, elapsedMs: number): number {
  const ticks = Math.floor(Math.max(0, elapsedMs) / (1000 / 30));
  const totalTicks = sequence.holds.reduce((sum, hold) => sum + hold, 0);
  const cursor = sequence.loop && totalTicks > 0
    ? ticks % totalTicks
    : Math.min(ticks, Math.max(0, totalTicks - 1));
  let end = 0;
  for (let index = 0; index < sequence.frames.length; index += 1) {
    end += sequence.holds[index] ?? 1;
    if (cursor < end) return sequence.frames[index]!;
  }
  return sequence.frames.at(-1) ?? 0;
}

export function getRole4BodyActionDurationMs(action: string, mode: HeroWeaponMode): number {
  const sequence = Role4BodyAnimations[getRole4VisualWeaponMode(mode)][action];
  return sequence
    ? sequence.holds.reduce((sum, hold) => sum + hold, 0) * (1000 / 30)
    : 0;
}

export function projectRole4SpeedUpFrame(elapsedMs: number): number {
  return Math.floor(Math.max(0, elapsedMs) / (1000 / 24)) % 16;
}
