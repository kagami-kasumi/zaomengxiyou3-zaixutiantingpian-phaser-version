// boundary: magic-bottle view bridge renders owner-scoped capture effects;
// capture state and ownership rules remain in systems and scene adapters.
import Phaser from 'phaser';
import type { PlayerSlot } from './TestSceneSystems';

export type MagicBottleEffectView = {
  root: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Ellipse;
  glow: Phaser.GameObjects.Ellipse;
  label: Phaser.GameObjects.Text;
};

export function updateMagicBottleEffectViews(this: any): void {
  updateOwnedMagicBottleEffectView(this, 'p1');
  updateOwnedMagicBottleEffectView(this, 'p2');
}

export function createMagicBottleEffectView(
  this: any,
  ownerSlot: PlayerSlot,
): MagicBottleEffectView {
  const root = this.add.container(0, 0);
  const body = this.add.ellipse(0, 0, 112, 86, 0x7ee7ff, 0.18);
  const glow = this.add.ellipse(0, 0, 58, 44, 0xf2c14e, 0.32);
  const label = this.add.text(-58, -66, `${ownerSlot.toUpperCase()} MagicBottleEffect3`, {
    color: '#dff7ef',
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
  });
  body.setStrokeStyle(2, 0x7ee7ff, 0.95);
  glow.setStrokeStyle(1, 0xf2c14e, 0.75);
  root.add([body, glow, label]);
  root.setDepth(63);
  return { root, body, glow, label };
}

function updateOwnedMagicBottleEffectView(scene: any, ownerSlot: PlayerSlot): void {
  const effect = scene.playerInventoryRuntimes[ownerSlot].magicBottle.effect;
  let view = scene.magicBottleEffectViews.get(ownerSlot) as MagicBottleEffectView | undefined;
  if (!effect) {
    if (view) {
      view.root.destroy(true);
      scene.magicBottleEffectViews.delete(ownerSlot);
    }
    return;
  }

  if (!view) {
    view = createMagicBottleEffectView.call(scene, ownerSlot);
    scene.magicBottleEffectViews.set(ownerSlot, view);
  }
  const progress = Math.min(effect.ageMs / 2_000, 1);
  view.root.setPosition(effect.x, effect.y);
  view.root.setScale(effect.facingX, 1);
  view.root.setAlpha(0.9 - progress * 0.45);
  view.body.setSize(effect.width, effect.height);
  view.glow.setScale(1 + Math.sin(effect.ageMs * 0.018) * 0.08);
}
