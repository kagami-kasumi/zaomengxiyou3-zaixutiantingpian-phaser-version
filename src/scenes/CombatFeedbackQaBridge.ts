import type { Scene } from 'phaser';
import type { CombatFeedbackModel } from '../systems/CombatFeedbackSystem';

export type CombatFeedbackQaBridge = Readonly<{
  sync: () => void;
  destroy: () => void;
}>;

export function createCombatFeedbackQaBridge(
  scene: Scene,
  model: CombatFeedbackModel,
): CombatFeedbackQaBridge {
  const enabled = isLocalCombatFeedbackQa();
  const sync = (): void => {
    if (!enabled) return;
    scene.game.canvas.dataset.combatFeedbackQa = JSON.stringify({
      currentCombo: model.currentCombo,
      highestCombo: model.highestCombo,
      queuedEventCount: model.queuedEvents.length,
      trace: model.trace.slice(-20).map((event) => ({
        eventId: event.eventId,
        source: event.source,
        ownerSlot: event.ownerSlot,
        targetId: event.target.id,
        amount: event.amount,
        critical: event.critical,
        incrementsCombo: event.incrementsCombo,
      })),
    });
  };
  sync();
  return {
    sync,
    destroy: () => {
      if (enabled) delete scene.game.canvas.dataset.combatFeedbackQa;
    },
  };
}

function isLocalCombatFeedbackQa(): boolean {
  const hostname = globalThis.location?.hostname ?? '';
  const local = hostname === 'localhost' || hostname === '127.0.0.1';
  return local && new URLSearchParams(globalThis.location?.search ?? '').get('qaCombatFeedback') === '1';
}
