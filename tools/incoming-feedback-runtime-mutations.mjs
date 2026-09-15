import { mutationPlugin } from './incoming-settlement-mutations.mjs';
export { mutationPlugin };
export const mutations = [
  { name: 'hp-delta-display', file: 'IncomingDamageFeedbackSystem.ts', edits: [
    ['input.displayValue ?? Math.trunc(input.settledDamage)', 'Math.trunc(input.hpBefore - input.hpAfter)'],
  ] },
  { name: 'drop-zero', file: 'IncomingDamageFeedbackSystem.ts', edits: [
    ['if (!target || target.model.destroyed)', 'if (input.settledDamage === 0 || !target || target.model.destroyed)'],
  ] },
  { name: 'merge-producers', file: 'IncomingDamageFeedbackSystem.ts', edits: [
    ['target.ownerSlot, target.targetRuntimeId, input.producerKind, producerOrdinal', 'target.ownerSlot, target.targetRuntimeId'],
  ] },
  { name: 'no-replay-dedup', file: 'IncomingDamageFeedbackSystem.ts', edits: [
    ['if (model.processedIds.has(eventId))', 'if (false)'],
  ] },
  { name: 'wrong-owner', file: 'IncomingDamageFeedbackSystem.ts', edits: [
    ['ownerSlot: target.ownerSlot', "ownerSlot: 'p1'"],
  ] },
  { name: 'wrong-anchor', file: 'IncomingDamageFeedbackSystem.ts', edits: [
    ['Object.freeze({ ...target.worldAnchor() })', 'Object.freeze({ x: 0, y: 0 })'],
  ] },
  { name: 'stale-after-destroy', file: 'IncomingDamageFeedbackSystem.ts', edits: [
    ['!target || target.model.destroyed', '!target'],
  ] },
  { name: 'lost-pet-attack', file: 'Stage1CombatSystem.ts', edits: [
    ['attackId: enemy.activeAttack.attackId,\n    occurredAtMs: params.timeMs ?? 0', "attackId: 'wrong',\n    occurredAtMs: params.timeMs ?? 0"],
  ] },
  { name: 'lost-pet-time', file: 'PetCombatEntitySession.ts', edits: [
    ['occurredAtMs: event.occurredAtMs, settledAtMs: feedback.timeMs', 'occurredAtMs: feedback.timeMs, settledAtMs: event.occurredAtMs'],
  ] },
  { name: 'drop-transfer', file: 'PetBattleOwnershipSystem.ts', edits: [
    ['if (result.active) onRedirect?.(result);', '/* transfer publication missing */'],
  ] },
];
