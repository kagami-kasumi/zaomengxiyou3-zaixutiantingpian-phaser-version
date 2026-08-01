import type { HeroMovementState } from './HeroMovementSystem';
import type { HeroSkillActionName } from './HeroSkillSystem';
import { Role2PassiveTuning } from './Role2PassiveSkillSystem';

export type Role2BodyAction = HeroMovementState | 'hurt' | HeroSkillActionName | string;

export type Role2ActionFrames = Readonly<{
  frames: readonly number[];
  holds: readonly number[];
  loop: boolean;
}>;

export type Role2ShadowAction = 'walk' | 'hit1' | 'hit2' | 'hit3' | 'hit4';

export type Role2ChargeBarState = Readonly<{
  visible: boolean;
  progress: number;
  fillColor: number;
}>;

const row = (index: number, columns: readonly number[]): number[] =>
  columns.map((column) => index * 6 + column);

export const Role2BodyAnimations: Readonly<Record<string, Role2ActionFrames>> = {
  wait: {
    frames: [...row(0, [0, 1, 2, 3, 4, 5]), ...row(1, [0, 1, 2, 3])],
    holds: [2, 2, 2, 3, 2, 4, 2, 2, 2, 14],
    loop: true,
  },
  walk: { frames: row(2, [0, 1, 2, 3]), holds: [4, 4, 4, 4], loop: true },
  run: { frames: row(3, [0, 1, 2, 3]), holds: [2, 2, 2, 2], loop: true },
  jump1: { frames: row(4, [0]), holds: [1], loop: false },
  jump2: { frames: row(5, [0, 1, 2, 3, 4]), holds: [2, 2, 2, 2, 2], loop: false },
  jump3: { frames: row(4, [1]), holds: [1], loop: false },
  hit1: { frames: row(6, [0, 1, 2]), holds: [2, 4, 12], loop: false },
  hit2: { frames: row(6, [0, 1, 2]), holds: [2, 4, 12], loop: false },
  hit3: { frames: row(7, [0, 1, 2, 3]), holds: [2, 10, 2, 20], loop: false },
  hit4_1: { frames: row(8, [0, 1]), holds: [12, 12], loop: false },
  hit4_2: { frames: row(9, [0, 1, 2]), holds: [2, 2, 6], loop: false },
  hit5: { frames: row(10, [0, 1, 2]), holds: [48, 2, 15], loop: false },
  hit6: { frames: row(11, [0, 1, 2]), holds: [2, 2, 20], loop: false },
  hit7: { frames: row(12, [0, 1, 2]), holds: [2, 2, 10], loop: false },
  hit8: { frames: row(4, [2]), holds: [30], loop: false },
  hit9: { frames: row(4, [3]), holds: [55], loop: false },
  hurt: { frames: row(4, [4]), holds: [15], loop: false },
};

const shadowRow = (index: number, columns: readonly number[]): number[] =>
  columns.map((column) => index * 4 + column);

export const Role2ShadowAnimations: Readonly<Record<Role2ShadowAction, Role2ActionFrames>> = {
  walk: { frames: shadowRow(0, [0, 1, 2, 3]), holds: [4, 4, 4, 4], loop: true },
  hit1: { frames: shadowRow(1, [0, 1, 2, 3]), holds: [2, 5, 2, 20], loop: false },
  hit2: { frames: shadowRow(2, [0, 1, 2]), holds: [2, 2, 20], loop: false },
  hit3: { frames: shadowRow(3, [0]), holds: [30], loop: false },
  hit4: { frames: shadowRow(4, [0]), holds: [55], loop: false },
};

export function readRole2HeldFrame(sequence: Role2ActionFrames, elapsedMs: number): number {
  const ticks = Math.floor(elapsedMs / (1000 / 30));
  const totalTicks = sequence.holds.reduce((sum, hold) => sum + hold, 0);
  const cursor = sequence.loop && totalTicks > 0 ? ticks % totalTicks : Math.min(ticks, totalTicks - 1);
  let end = 0;
  for (let index = 0; index < sequence.frames.length; index += 1) {
    end += sequence.holds[index] ?? 1;
    if (cursor < end) return sequence.frames[index]!;
  }
  return sequence.frames.at(-1) ?? 0;
}

export function projectRole2ShadowFrame(action: Role2ShadowAction, elapsedMs: number): number {
  const sequence = Role2ShadowAnimations[action];
  const totalTicks = sequence.holds.reduce((sum, hold) => sum + hold, 0);
  const elapsedTicks = Math.floor(elapsedMs / (1000 / 30));
  if (!sequence.loop && elapsedTicks >= totalTicks) {
    return readRole2HeldFrame(
      Role2ShadowAnimations.walk,
      (elapsedTicks - totalTicks) * (1000 / 30),
    );
  }
  return readRole2HeldFrame(sequence, elapsedMs);
}

export function getRole2ShadowActionDurationMs(action: Role2ShadowAction): number {
  return Role2ShadowAnimations[action].holds.reduce((sum, hold) => sum + hold, 0) * (1000 / 30);
}

export function projectRole2ChargeBarState(
  attack: Readonly<{
    actionName: string;
    role2ChargePrepared?: boolean;
    startedAtMs: number;
    endsAtMs: number;
  }> | undefined,
  timeMs: number,
  heroVisible: boolean,
): Role2ChargeBarState {
  const chargeDurationMs = attack?.actionName === 'hit1' && attack.role2ChargePrepared
    ? attack.endsAtMs - attack.startedAtMs - Role2PassiveTuning.releaseDurationMs
    : 0;
  const visible = heroVisible && chargeDurationMs > 0 && timeMs < (attack?.endsAtMs ?? 0);
  const progress = visible
    ? Math.min(Math.max((timeMs - attack!.startedAtMs) / chargeDurationMs, 0), 1)
    : 0;
  return {
    visible,
    progress,
    fillColor: progress >= 1 && Math.floor(timeMs / 500) % 2 === 0 ? 0xaabbcc : 0x00ff00,
  };
}
