import type Phaser from 'phaser';
import { incomingDamageFeedbackProjection as truth } from '../assets/IncomingDamageFeedbackAssets';
import type { PlayerSlot } from '../systems/InputSystem';
import { useIncomingDamageBitmapSampling } from './IncomingDamageBitmapSampling';

/** A settled producer supplies its display value and target's world root, never a HP-diff guess. */
export type IncomingDamageFeedbackDisplay = Readonly<{
  eventId: string;
  targetKind: 'hero' | 'pet';
  ownerSlot: PlayerSlot;
  targetId: string;
  displayValue: number;
  /** Scene clock at display creation; combat simulations may use their own clock. */
  displayStartedAtMs?: number;
  worldAnchor: Readonly<{ x: number; y: number }>;
}>;

export type IncomingDamageFeedbackView = Readonly<{
  show: (input: IncomingDamageFeedbackDisplay) => boolean;
  update: (deltaMs: number) => void;
  destroyEvent: (eventId: string) => void;
  destroy: () => void;
}>;

/** World-space display only. Incoming damage is direct: no monster queue, fan-out or combo. */
export function createIncomingDamageFeedbackView(scene: Phaser.Scene): IncomingDamageFeedbackView {
  const live = new Map<string, { view: Phaser.GameObjects.Container; elapsedMs: number; startY: number }>();
  const shown = new Set<string>();
  let destroyed = false;
  const animation = truth.animation;
  const destroyEvent = (eventId: string): void => {
    const entry = live.get(eventId);
    if (!entry) return;
    entry.view.destroy(true);
    live.delete(eventId);
  };
  const view: IncomingDamageFeedbackView = {
    show: (input) => {
      if (destroyed || shown.has(input.eventId)) return false;
      if (!Number.isFinite(input.displayValue) || !Number.isInteger(input.displayValue)
        || input.displayValue < -2_147_483_648 || input.displayValue > 2_147_483_647
        || !Number.isFinite(input.worldAnchor.x) || !Number.isFinite(input.worldAnchor.y)) {
        throw new Error('Incoming display expects a finite AS3 integer and world anchor');
      }
      // ANumber converts the non-digit '-' to int(0); preserve the measured negative API boundary.
      const children = [...String(input.displayValue)].map((character, index) => {
        const digit = Number(character) || 0;
        const glyph = truth.glyphs[digit]!;
        const image = scene.add.image(index * animation.digitStride, 0, glyph.key)
          .setOrigin(truth.registrationPoint.x / glyph.width, truth.registrationPoint.y / glyph.height);
        image.texture.setFilter(1); // Phaser.Textures.FilterMode.NEAREST: original Bitmap smoothing=false.
        useIncomingDamageBitmapSampling(image);
        return image;
      });
      const container = scene.add.container(
        // ANumber.aNumImage receives param3/param4 as int, after the caller's offset.
        (input.worldAnchor.x + animation.anchorOffset.x) | 0,
        (input.worldAnchor.y + animation.anchorOffset.y) | 0,
        children,
      ).setScale(animation.popScale).setDepth(95).setName(`IncomingDamage:${input.eventId}`);
      container.setData('incomingDamage', { ...input, worldAnchor: { ...input.worldAnchor } });
      live.set(input.eventId, { view: container, elapsedMs: 0, startY: container.y });
      shown.add(input.eventId);
      return true;
    },
    update: (deltaMs) => {
      if (destroyed) return;
      if (!Number.isFinite(deltaMs)) throw new Error('Incoming display requires a finite elapsed time');
      for (const [id, entry] of live) {
        entry.elapsedMs += Math.max(0, deltaMs);
        const seconds = entry.elapsedMs / 1_000;
        if (seconds >= animation.destroySeconds) {
          destroyEvent(id);
          continue;
        }
        const pop = Math.min(1, seconds / animation.popSeconds);
        const fade = Math.min(1, Math.max(0, (seconds - animation.delaySeconds) / animation.fadeSeconds));
        entry.view.setScale(1 + (animation.popScale - 1) * (1 - pop) ** 2);
        const alpha = (1 - fade) ** 2;
        entry.view.setAlpha(alpha).setY(entry.startY - animation.risePixels * (1 - alpha));
      }
    },
    destroyEvent,
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      for (const id of live.keys()) destroyEvent(id);
      shown.clear();
      scene.events.off('shutdown', view.destroy);
    },
  };
  scene.events.once('shutdown', view.destroy);
  return view;
}
