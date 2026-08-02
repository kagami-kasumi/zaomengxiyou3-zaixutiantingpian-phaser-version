import type { HeroMovementState } from './HeroMovementSystem';
import type { HeroSkillActionName } from './HeroSkillSystem';

export type Role3BodyAction = HeroMovementState | 'hurt' | HeroSkillActionName | string;

export type Role3ActionFrames = Readonly<{
  frames: readonly number[];
  holds: readonly number[];
  loop: boolean;
}>;

const row = (index: number, columns: readonly number[]): number[] =>
  columns.map((column) => index * 6 + column);

export const Role3BodyAnimations: Readonly<Record<string, Role3ActionFrames>> = {
  wait: {
    frames: [...row(0, [0, 1, 2, 3, 4, 5]), ...row(1, [0, 1, 2, 3, 4, 5])],
    holds: [2, 2, 2, 3, 2, 4, 3, 3, 3, 9, 5, 9],
    loop: true,
  },
  wait2: {
    frames: [...row(1, [0, 1, 2, 3, 4, 5]), ...row(0, [0, 1, 2, 3, 4, 5])],
    holds: [3, 3, 3, 9, 5, 9, 2, 2, 2, 3, 2, 4],
    loop: true,
  },
  walk: { frames: row(2, [0, 1, 2, 3]), holds: [4, 4, 4, 4], loop: true },
  run: { frames: row(3, [0, 1, 2, 3]), holds: [2, 2, 2, 2], loop: true },
  jump1: { frames: row(4, [0]), holds: [1], loop: false },
  jump2: { frames: row(5, [0, 1, 2, 3, 4]), holds: [2, 2, 2, 2, 2], loop: false },
  jump3: { frames: row(4, [1]), holds: [1], loop: false },
  hit1: { frames: row(6, [0, 1, 2]), holds: [2, 2, 6], loop: false },
  hit2: { frames: row(7, [0, 1, 2]), holds: [2, 2, 6], loop: false },
  hit3: { frames: row(8, [0, 1, 2, 3]), holds: [2, 2, 2, 10], loop: false },
  hit4: { frames: row(9, [0, 1, 2]), holds: [24, 2, 8], loop: false },
  hit5: { frames: row(4, [5]), holds: [160], loop: false },
  hit6: { frames: row(4, [3]), holds: [6], loop: false },
  hit7: { frames: row(10, [0, 1, 2]), holds: [2, 2, 20], loop: false },
  hit8: { frames: row(11, [0, 1, 2, 3]), holds: [2, 2, 2, 20], loop: false },
  hit9: { frames: row(12, [0, 1, 2, 3]), holds: [2, 2, 2, 20], loop: false },
  hit10: { frames: row(13, [0, 1, 2]), holds: [4, 3, 25], loop: false },
  hit11: { frames: row(4, [4, 5]), holds: [2, 160], loop: false },
  hit12: { frames: row(4, [5]), holds: [160], loop: false },
  hurt: { frames: row(4, [2]), holds: [15], loop: false },
};

export function readRole3HeldFrame(sequence: Role3ActionFrames, elapsedMs: number): number {
  const ticks = Math.floor(elapsedMs / (1000 / 30));
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

export function getRole3BodyActionDurationMs(action: string): number {
  const sequence = Role3BodyAnimations[action];
  return sequence
    ? sequence.holds.reduce((sum, hold) => sum + hold, 0) * (1000 / 30)
    : 0;
}

export function projectRole3ShieldFrame(elapsedMs: number): number {
  return Math.floor(Math.max(0, elapsedMs) / (1000 / 24)) % 19;
}
