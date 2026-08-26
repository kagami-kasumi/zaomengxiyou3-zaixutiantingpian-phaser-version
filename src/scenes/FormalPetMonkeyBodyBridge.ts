// boundary: formal levels share one monkey presentation adapter. It reads the
// existing roster and hero movement owners without owning pet rules or saves.
import Phaser from 'phaser';
import {
  getPetMonkeyEffectUsages,
  isPetMonkeyProjectileAsset,
  type PetMonkeyEffectUsage,
} from '../assets/PetMonkeyAnimationAssets';
import type { PetCombatAnimationEvent } from '../systems/PetBehavior';
import type { PetCombatSnapshot } from '../systems/PetCombatRuntime';
import type { PetState } from '../systems/PetTypes';
import type { ProjectileModel } from '../systems/ProjectileSystem';
import {
  createPetMonkeyAnimationView,
  isSupportedPetMonkey,
  syncPetMonkeyAnimationView,
  type PetMonkeyAnimationView,
} from './PetMonkeyAnimationView';

type Slot = 'p1' | 'p2';
type FormalPetMonkeyMember = Readonly<{
  slot: Slot;
  pet?: PetState;
  snapshot: PetCombatSnapshot;
}>;

type SlotPresentation = {
  view?: PetMonkeyAnimationView;
  deadCompletionToken?: number;
};

type EffectFrameView = Readonly<{
  image: Phaser.GameObjects.Image;
  usage: PetMonkeyEffectUsage;
  startedAt: number;
}>;

export type FormalPetMonkeyBodyBridge = Readonly<{
  update: (
    members: readonly FormalPetMonkeyMember[],
    projectiles: readonly ProjectileModel[],
    timeMs: number,
  ) => readonly PetCombatAnimationEvent[];
  destroy: () => void;
}>;

export function createFormalPetMonkeyBodyBridge(
  scene: Phaser.Scene,
): FormalPetMonkeyBodyBridge {
  const slots: Record<Slot, SlotPresentation> = { p1: {}, p2: {} };
  const effects = new Map<number, readonly EffectFrameView[]>();

  const destroySlot = (slot: Slot) => {
    slots[slot].view?.root.destroy(true);
    slots[slot] = {};
  };

  return {
    update: (members, projectiles, timeMs) => {
      const animationEvents: PetCombatAnimationEvent[] = [];
      for (const slot of ['p1', 'p2'] as const) {
        const presentation = slots[slot];
        const member = members.find((candidate) => candidate.slot === slot);
        const pet = member?.pet;
        const runtime = member?.snapshot.runtime;
        if (!member || !pet || !runtime || !isSupportedPetMonkey(pet)) {
          destroySlot(slot);
          continue;
        }
        if (!presentation.view || presentation.view.petId !== pet.id || presentation.view.form !== pet.form) {
          presentation.view?.root.destroy(true);
          presentation.view = createPetMonkeyAnimationView(
            scene,
            pet,
            runtime.x,
            runtime.y,
            timeMs,
          );
        }
        syncPetMonkeyAnimationView(
          presentation.view,
          pet,
          runtime,
          projectiles,
          timeMs,
          scene.game.loop.targetFps,
        );
        if (
          member.snapshot.phase === 'dead-playing'
          && presentation.view.runtime.deadFinished
          && member.snapshot.actionToken !== undefined
          && presentation.deadCompletionToken !== member.snapshot.actionToken
        ) {
          presentation.deadCompletionToken = member.snapshot.actionToken;
          animationEvents.push({
            runtimeKey: runtime.runtimeKey,
            actionToken: member.snapshot.actionToken,
            eventName: 'dead-complete',
          });
        }
      }
      syncEffects(projectiles, timeMs);
      return animationEvents;
    },
    destroy: () => {
      destroySlot('p1');
      destroySlot('p2');
      for (const frames of effects.values()) frames.forEach(({ image }) => image.destroy());
      effects.clear();
    },
  };

  function syncEffects(projectiles: readonly ProjectileModel[], timeMs: number): void {
    for (const projectile of projectiles) {
      if (!isPetMonkeyProjectileAsset(projectile.assetKey) || effects.has(projectile.id)) continue;
      const source = (['p1', 'p2'] as const)
        .map((slot) => slots[slot].view)
        .find((view) => view?.petId === projectile.sourceId);
      const usages = getPetMonkeyEffectUsages(projectile.assetKey);
      effects.set(projectile.id, usages.map((usage) => ({
        usage,
        startedAt: timeMs,
        image: scene.add.image(
          (source?.root.x ?? projectile.x) + projectile.facingX * usage.offsetX,
          (source?.root.y ?? projectile.y) + usage.offsetY,
          usage.asset.frameKeys[0],
        ).setOrigin(usage.registrationOrigin.x, usage.registrationOrigin.y)
          .setFlipX(projectile.facingX > 0)
          .setDepth(usage.depth),
      })));
    }
    const activeIds = new Set(projectiles.map(({ id }) => id));
    for (const [projectileId, frames] of effects) {
      const projectile = projectiles.find(({ id }) => id === projectileId);
      const elapsedMs = timeMs - (frames[0]?.startedAt ?? timeMs);
      for (const { image, usage } of frames) {
        const frameMs = 1000 / normalizeHostFps(scene.game.loop.targetFps);
        const index = Math.floor(elapsedMs / frameMs) % usage.asset.frameKeys.length;
        image.setTexture(usage.asset.frameKeys[index]!);
        const source = (['p1', 'p2'] as const)
          .map((slot) => slots[slot].view)
          .find((view) => view?.petId === projectile?.sourceId);
        if (source && projectile) {
          image.setPosition(
            source.root.x + projectile.facingX * usage.offsetX,
            source.root.y + usage.offsetY,
          );
        }
      }
      const loops = frames.some(({ usage }) => usage.loopsForFourSeconds);
      if (activeIds.has(projectileId) || (loops && elapsedMs < 4_000)) continue;
      frames.forEach(({ image }) => image.destroy());
      effects.delete(projectileId);
    }
  }
}

function normalizeHostFps(value: number): number {
  if (value <= 22) return 20;
  if (value <= 27) return 24;
  return 30;
}
