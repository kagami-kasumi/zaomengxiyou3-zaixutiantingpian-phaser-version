import type Phaser from 'phaser';
import type { IncomingDamageFeedbackModel, IncomingDamageFeedbackEvent } from '../systems/IncomingDamageFeedbackSystem';
import { createIncomingDamageFeedbackView } from './IncomingDamageFeedbackView';

const models = new WeakMap<Phaser.Scene, IncomingDamageFeedbackModel>();
export function readIncomingDamageFeedbackTrace(scene: Phaser.Scene): readonly IncomingDamageFeedbackEvent[] {
  return models.get(scene)?.trace.slice() ?? [];
}

/** Direct settlement notification, independent of monster combo/queue state. */
export function createIncomingDamageFeedbackBridge(scene: Phaser.Scene, model: IncomingDamageFeedbackModel) {
  const view = createIncomingDamageFeedbackView(scene);
  models.set(scene, model);
  const show = (event: Parameters<typeof view.show>[0]) => { view.show({ ...event, displayStartedAtMs: scene.time.now }); };
  const update = (_time: number, delta: number) => view.update(delta);
  let destroyed = false;
  model.listeners.add(show);
  scene.events.on('update', update);
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    model.listeners.delete(show);
    scene.events.off('update', update);
    scene.events.off('shutdown', destroy);
    models.delete(scene);
    view.destroy();
  };
  scene.events.once('shutdown', destroy);
  return { destroy };
}
