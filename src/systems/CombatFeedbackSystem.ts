import type { DamageEvent } from './CombatSystem';
import type { PlayerSlot } from './InputSystem';

export type CombatFeedbackSource = 'hero' | 'pet' | 'magic-weapon' | 'effect';

export type CombatFeedbackEvent = Readonly<{
  eventId: string;
  damageEvent: DamageEvent;
  source: CombatFeedbackSource;
  ownerSlot: PlayerSlot;
  target: Readonly<{
    id: string;
    x: number;
    y: number;
    height: number;
  }>;
  amount: number;
  critical: boolean;
  incrementsCombo: boolean;
}>;

export type CombatFeedbackEmission = Readonly<{
  event: CombatFeedbackEvent;
  offsetX: number;
  offsetY: number;
}>;

export type CombatFeedbackModel = {
  readonly processedEventIds: Set<string>;
  readonly queuedEvents: CombatFeedbackEvent[];
  readonly trace: CombatFeedbackEvent[];
  currentCombo: number;
  highestCombo: number;
  previousCheckpointCombo: number;
  hostTick: number;
  queueCooldownTicks: number;
  comboRevision: number;
};

export const CombatFeedbackTuning = {
  truthId: 'task-settings-211.combat-hit-feedback',
  targetOffsetX: -20,
  targetMaxHeight: 300,
  damageDigitStride: 20,
  comboDigitStride: 50,
  comboDigitAssetScale: 175 / 315,
  hostFrameRate: 30,
  hostTickMs: 1_000 / 30,
  comboAnchorX: 694.95,
  comboAnchorY: 234.95,
  comboDigitY: 28.3,
  comboCheckpointTicks: 40,
  queueLimit: 11,
  queueCooldownTicks: 1,
  fanOutThreshold: 5,
  fanOutOffsets: [
    { x: -20, y: -20 },
    { x: -10, y: -10 },
    { x: 0, y: 0 },
    { x: 10, y: -10 },
    { x: 20, y: -20 },
  ],
} as const;

export function createCombatFeedbackModel(): CombatFeedbackModel {
  return {
    processedEventIds: new Set<string>(),
    queuedEvents: [],
    trace: [],
    currentCombo: 0,
    highestCombo: 0,
    previousCheckpointCombo: 0,
    hostTick: 0,
    queueCooldownTicks: 0,
    comboRevision: 0,
  };
}

export function recordCombatFeedback(
  model: CombatFeedbackModel,
  input: Readonly<{
    damageEvent: DamageEvent;
    hpBefore: number;
    hpAfter: number;
    source: CombatFeedbackSource;
    ownerSlot: PlayerSlot;
    target: Readonly<{ id: string; x: number; y: number; height: number }>;
    critical?: boolean;
    incrementsCombo: boolean;
  }>,
): CombatFeedbackEvent | undefined {
  const actualDecrease = Math.max(0, input.hpBefore - input.hpAfter);
  const eventId = `${input.damageEvent.attackId}->${input.damageEvent.targetId}`;
  if (actualDecrease <= 0
    || input.damageEvent.amount !== actualDecrease
    || input.target.id !== input.damageEvent.targetId
    || model.processedEventIds.has(eventId)
    || model.queuedEvents.length >= CombatFeedbackTuning.queueLimit) {
    return undefined;
  }
  const event: CombatFeedbackEvent = {
    eventId,
    damageEvent: input.damageEvent,
    source: input.source,
    ownerSlot: input.ownerSlot,
    target: { ...input.target, height: Math.max(0, input.target.height) },
    amount: actualDecrease,
    critical: input.critical ?? input.damageEvent.critical,
    incrementsCombo: input.incrementsCombo,
  };
  model.processedEventIds.add(eventId);
  model.queuedEvents.push(event);
  model.trace.push(event);
  if (event.incrementsCombo) {
    model.currentCombo += 1;
    model.highestCombo = Math.max(model.highestCombo, model.currentCombo);
    model.comboRevision += 1;
  }
  return event;
}

export function advanceCombatFeedbackHostTick(model: CombatFeedbackModel): readonly CombatFeedbackEmission[] {
  model.hostTick += 1;
  if (model.hostTick % CombatFeedbackTuning.comboCheckpointTicks === 0) {
    if (model.currentCombo === model.previousCheckpointCombo) {
      if (model.currentCombo !== 0) model.comboRevision += 1;
      model.currentCombo = 0;
      model.previousCheckpointCombo = 0;
    } else {
      model.previousCheckpointCombo = model.currentCombo;
    }
  }
  if (model.queueCooldownTicks > 0) {
    model.queueCooldownTicks -= 1;
    return [];
  }
  return flushCombatFeedbackQueue(model);
}

export function flushCombatFeedbackQueue(model: CombatFeedbackModel): readonly CombatFeedbackEmission[] {
  if (model.queueCooldownTicks > 0 || model.queuedEvents.length === 0) return [];
  const count = model.queuedEvents.length > CombatFeedbackTuning.fanOutThreshold
    ? CombatFeedbackTuning.fanOutOffsets.length
    : 1;
  const events = model.queuedEvents.splice(0, count);
  model.queueCooldownTicks = CombatFeedbackTuning.queueCooldownTicks;
  return events.map((event, index) => {
    const offset = count === 1
      ? CombatFeedbackTuning.fanOutOffsets[2]
      : CombatFeedbackTuning.fanOutOffsets[index];
    return { event, offsetX: offset.x, offsetY: offset.y };
  });
}

export function getCombatFeedbackTargetAnchor(
  target: CombatFeedbackEvent['target'],
): Readonly<{ x: number; y: number }> {
  return {
    x: target.x + CombatFeedbackTuning.targetOffsetX,
    y: target.y - Math.min(CombatFeedbackTuning.targetMaxHeight, target.height) / 2,
  };
}

export function getCombatComboDigitStartX(value: number): number {
  const digitCount = `${Math.max(0, Math.floor(value))}`.length;
  if (digitCount === 1) return 4;
  if (digitCount === 2) return -44.6;
  return -95.6;
}

export function destroyCombatFeedbackModel(model: CombatFeedbackModel): void {
  model.processedEventIds.clear();
  model.queuedEvents.length = 0;
  model.trace.length = 0;
  model.currentCombo = 0;
  model.highestCombo = 0;
  model.previousCheckpointCombo = 0;
}
