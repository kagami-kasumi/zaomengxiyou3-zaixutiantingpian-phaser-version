import type { PlayerSlot } from './InputSystem';

export type IncomingDamageProducer = 'hero-reduce-hp' | 'pet-reduce-hp' | 'turtle-transfer'
  | 'environment-reduce-hp' | 'environment-explicit';

export type IncomingDamageFeedbackEvent = Readonly<{
  eventId: string;
  runtimeId: string;
  sourceId: string;
  attackId: string;
  producerKind: IncomingDamageProducer;
  producerOrdinal: number;
  targetKind: 'hero' | 'pet';
  ownerSlot: PlayerSlot;
  targetId: string;
  targetRuntimeId: string;
  occurredAtMs: number;
  settledAtMs: number;
  settledDamage: number;
  displayValue: number;
  hpBefore: number;
  hpAfter: number;
  worldAnchor: Readonly<{ x: number; y: number }>;
}>;

export type IncomingDamageFeedbackModel = {
  readonly runtimeId: string;
  readonly trace: IncomingDamageFeedbackEvent[];
  readonly processedIds: Set<string>;
  readonly listeners: Set<(event: IncomingDamageFeedbackEvent) => void>;
  destroyed: boolean;
};

export type IncomingDamageFeedbackTarget = Readonly<{
  model: IncomingDamageFeedbackModel;
  targetKind: 'hero' | 'pet';
  ownerSlot: PlayerSlot;
  targetId: string;
  targetRuntimeId: string;
  worldAnchor: () => Readonly<{ x: number; y: number }>;
}>;

let runtimeSerial = 0;
export function createIncomingDamageFeedbackModel(): IncomingDamageFeedbackModel {
  return { runtimeId: `incoming-${++runtimeSerial}`, trace: [], processedIds: new Set(), listeners: new Set(), destroyed: false };
}

export function recordIncomingDamageFeedback(
  target: IncomingDamageFeedbackTarget | undefined,
  input: Readonly<Pick<IncomingDamageFeedbackEvent,
    'sourceId' | 'attackId' | 'producerKind' | 'occurredAtMs' | 'settledAtMs' | 'settledDamage' | 'hpBefore' | 'hpAfter'>
    & Partial<Pick<IncomingDamageFeedbackEvent, 'producerOrdinal' | 'displayValue'>>>,
): IncomingDamageFeedbackEvent | undefined {
  if (!target || target.model.destroyed) return undefined;
  const { model } = target;
  const producerOrdinal = input.producerOrdinal ?? 0;
  const eventId = JSON.stringify([model.runtimeId, input.sourceId, input.attackId,
    target.ownerSlot, target.targetRuntimeId, input.producerKind, producerOrdinal]);
  if (model.processedIds.has(eventId)) return undefined;
  const event: IncomingDamageFeedbackEvent = Object.freeze({
    ...input, eventId, runtimeId: model.runtimeId, producerOrdinal,
    targetKind: target.targetKind, ownerSlot: target.ownerSlot, targetId: target.targetId,
    targetRuntimeId: target.targetRuntimeId,
    // ANumber's value is an int, independent of the HP clamp on lethal damage.
    displayValue: input.displayValue ?? Math.trunc(input.settledDamage),
    worldAnchor: Object.freeze({ ...target.worldAnchor() }),
  });
  model.processedIds.add(eventId);
  model.trace.push(event);
  for (const listener of model.listeners) listener(event);
  return event;
}

export function destroyIncomingDamageFeedbackModel(model: IncomingDamageFeedbackModel): void {
  model.destroyed = true;
  model.listeners.clear();
  model.trace.length = 0;
  model.processedIds.clear();
}
