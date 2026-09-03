import Phaser from 'phaser';
import { CombatHitFeedbackAssetKeys } from '../assets/CombatHitFeedbackAssets';
import {
  advanceCombatFeedbackHostTick,
  CombatFeedbackTuning,
  flushCombatFeedbackQueue,
  getCombatComboDigitStartX,
  getCombatFeedbackTargetAnchor,
  type CombatFeedbackEmission,
  type CombatFeedbackModel,
} from '../systems/CombatFeedbackSystem';

export type CombatFeedbackView = Readonly<{
  update: () => void;
  flush: () => void;
  destroy: () => void;
}>;

const combatFeedbackModelByScene = new WeakMap<Phaser.Scene, CombatFeedbackModel>();

export function readCombatFeedbackHighestCombo(scene: Phaser.Scene): number {
  return combatFeedbackModelByScene.get(scene)?.highestCombo ?? 0;
}

export function createCombatFeedbackView(
  scene: Phaser.Scene,
  model: CombatFeedbackModel,
): CombatFeedbackView {
  combatFeedbackModelByScene.set(scene, model);
  const damageViews = new Set<Phaser.GameObjects.Container>();
  let comboView: Phaser.GameObjects.Container | undefined;
  let renderedComboRevision = model.comboRevision;
  let comboFrame = 1;
  let hostTickCarryMs = 0;

  const renderEmissions = (emissions: readonly CombatFeedbackEmission[]): void => {
    for (const emission of emissions) {
      const anchor = getCombatFeedbackTargetAnchor(emission.event.target);
      const digits = `${Math.floor(emission.event.amount)}`;
      const children = [...digits].map((digit, index) => scene.add.image(
        index * CombatFeedbackTuning.damageDigitStride,
        0,
        emission.event.critical
          ? CombatHitFeedbackAssetKeys.criticalDigit(Number(digit))
          : CombatHitFeedbackAssetKeys.ordinaryDigit(Number(digit)),
      ).setOrigin(0));
      const container = scene.add.container(
        anchor.x + emission.offsetX,
        anchor.y + emission.offsetY,
        children,
      ).setScale(4).setDepth(95);
      damageViews.add(container);
      scene.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Quad.easeOut',
        onComplete: () => scene.tweens.add({
          targets: container,
          y: container.y - 100,
          alpha: 0,
          delay: 50,
          duration: 1_000,
          onComplete: () => {
            damageViews.delete(container);
            container.destroy(true);
          },
        }),
      });
    }
  };

  const syncCombo = (): void => {
    if (renderedComboRevision === model.comboRevision) return;
    renderedComboRevision = model.comboRevision;
    comboView?.destroy(true);
    comboView = undefined;
    if (model.currentCombo < 2) return;
    comboFrame = 1;
    const value = `${model.currentCombo}`;
    const children: Phaser.GameObjects.GameObject[] = [
      scene.add.image(0, 0, CombatHitFeedbackAssetKeys.batter).setOrigin(0),
      ...[...value].map((digit, index) => scene.add.image(
        getCombatComboDigitStartX(model.currentCombo) + index * CombatFeedbackTuning.comboDigitStride,
        CombatFeedbackTuning.comboDigitY,
        CombatHitFeedbackAssetKeys.comboDigitFrame(Number(digit), comboFrame),
      ).setOrigin(0.5).setScale(CombatFeedbackTuning.comboDigitAssetScale)),
    ];
    comboView = scene.add.container(
      CombatFeedbackTuning.comboAnchorX,
      CombatFeedbackTuning.comboAnchorY,
      children,
    ).setScrollFactor(0).setDepth(105);
    const renderedComboView = comboView;
    scene.tweens.add({
      targets: renderedComboView,
      alpha: 0,
      duration: 2_000,
      onComplete: () => {
        renderedComboView.destroy(true);
        if (comboView === renderedComboView) comboView = undefined;
      },
    });
  };

  const advanceComboFrame = (): void => {
    if (!comboView || model.currentCombo < 2) return;
    comboFrame = comboFrame % 5 + 1;
    const digits = `${model.currentCombo}`;
    comboView.list.slice(1).forEach((child, index) => {
      (child as Phaser.GameObjects.Image).setTexture(
        CombatHitFeedbackAssetKeys.comboDigitFrame(Number(digits[index]), comboFrame),
      );
    });
  };

  return {
    update: () => {
      hostTickCarryMs += Math.max(0, scene.game.loop.delta);
      while (hostTickCarryMs >= CombatFeedbackTuning.hostTickMs) {
        hostTickCarryMs -= CombatFeedbackTuning.hostTickMs;
        renderEmissions(advanceCombatFeedbackHostTick(model));
        syncCombo();
        advanceComboFrame();
      }
    },
    flush: () => {
      renderEmissions(flushCombatFeedbackQueue(model));
      syncCombo();
    },
    destroy: () => {
      for (const view of damageViews) view.destroy(true);
      damageViews.clear();
      comboView?.destroy(true);
      comboView = undefined;
      hostTickCarryMs = 0;
      if (combatFeedbackModelByScene.get(scene) === model) {
        combatFeedbackModelByScene.delete(scene);
      }
    },
  };
}
