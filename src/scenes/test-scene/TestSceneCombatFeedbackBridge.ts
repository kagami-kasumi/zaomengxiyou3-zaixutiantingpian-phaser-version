import Phaser from 'phaser';
import type { DamageEvent } from '../../systems/CombatSystem';
import {
  createCombatFeedbackModel,
  destroyCombatFeedbackModel,
  recordCombatFeedback,
  type CombatFeedbackModel,
  type CombatFeedbackSource,
} from '../../systems/CombatFeedbackSystem';
import type { PlayerSlot } from '../../systems/InputSystem';
import type { ProjectileModel } from '../../systems/ProjectileTypes';
import { createCombatFeedbackView, type CombatFeedbackView } from '../CombatFeedbackView';

export type TestSceneCombatFeedback = Readonly<{
  model: CombatFeedbackModel;
  view: CombatFeedbackView;
}>;

export function createTestSceneCombatFeedback(scene: Phaser.Scene): TestSceneCombatFeedback {
  const model = createCombatFeedbackModel();
  return { model, view: createCombatFeedbackView(scene, model) };
}

export function recordTestSceneCombatFeedback(
  feedback: TestSceneCombatFeedback | undefined,
  input: Readonly<{
    damageEvent: DamageEvent;
    hpBefore: number;
    hpAfter: number;
    source: CombatFeedbackSource;
    ownerSlot: PlayerSlot;
    target: Readonly<{ id: string; x: number; y: number; height: number }>;
    incrementsCombo?: boolean;
  }>,
): void {
  if (!feedback) return;
  recordCombatFeedback(feedback.model, {
    ...input,
    critical: input.damageEvent.critical,
    incrementsCombo: input.incrementsCombo ?? true,
  });
  feedback.view.flush();
}

export function classifyProjectileFeedbackSource(
  projectile: Pick<ProjectileModel, 'variant'>,
): CombatFeedbackSource {
  if (projectile.variant.startsWith('magic-weapon-')) return 'magic-weapon';
  if (projectile.variant.startsWith('pet-')) return 'pet';
  return 'hero';
}

export function combatFeedbackOwnerSlot(sourceId: string): PlayerSlot {
  return sourceId === 'p2' || sourceId.startsWith('p2-') ? 'p2' : 'p1';
}

export function destroyTestSceneCombatFeedback(feedback: TestSceneCombatFeedback | undefined): void {
  if (!feedback) return;
  feedback.view.destroy();
  destroyCombatFeedbackModel(feedback.model);
}
