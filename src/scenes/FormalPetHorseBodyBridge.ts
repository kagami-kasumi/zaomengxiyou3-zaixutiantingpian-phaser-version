// boundary: formal levels share one horse presentation adapter. It consumes the
// public PetCombatSnapshot/projectile stream and never owns pet movement or damage.
import Phaser from 'phaser';
import {
  getPetHorseEffectUsage,
  type PetHorseEffectUsage,
} from '../assets/PetHorseAnimationAssets';
import type { PetCombatAnimationEvent } from '../systems/PetBehavior';
import type { PetCombatSnapshot } from '../systems/PetCombatRuntime';
import type { PetState } from '../systems/PetTypes';
import type { ProjectileModel } from '../systems/ProjectileSystem';
import {
  createPetHorseAnimationView,
  isSupportedPetHorse,
  syncPetHorseAnimationView,
  type PetHorseAnimationView,
} from './PetHorseAnimationView';

type Slot = 'p1' | 'p2';
type FormalPetHorseMember = Readonly<{
  slot: Slot;
  pet?: PetState;
  snapshot: PetCombatSnapshot;
}>;

type SlotPresentation = {
  view?: PetHorseAnimationView;
};

type EffectView = Readonly<{
  projectile: ProjectileModel;
  image: Phaser.GameObjects.Image;
  usage: PetHorseEffectUsage;
  startedAt: number;
}>;

export type FormalPetHorseBodyBridge = Readonly<{
  update: (
    members: readonly FormalPetHorseMember[],
    projectiles: readonly ProjectileModel[],
    timeMs: number,
  ) => readonly PetCombatAnimationEvent[];
  destroy: () => void;
}>;

export function createFormalPetHorseBodyBridge(scene: Phaser.Scene): FormalPetHorseBodyBridge {
  const slots: Record<Slot, SlotPresentation> = { p1: {}, p2: {} };
  const effects = new Map<number, EffectView>();
  let latestProjectiles: readonly ProjectileModel[] = [], latestSceneTime = 0;
  // World timers may append an effect while Scene.update is paused.
  const syncNativeFrames = () => syncEffects(latestProjectiles, latestSceneTime);
  scene.game.events.on('poststep', syncNativeFrames);
  const destroySlot = (slot: Slot) => {
    slots[slot].view?.root.destroy(true);
    slots[slot] = {};
  };

  return {
    update: (members, projectiles, timeMs) => {
      latestProjectiles = projectiles; latestSceneTime = timeMs;
      const animationEvents: PetCombatAnimationEvent[] = [];
      for (const slot of ['p1', 'p2'] as const) {
        const presentation = slots[slot];
        const member = members.find((candidate) => candidate.slot === slot);
        const pet = member?.pet;
        const runtime = member?.snapshot.runtime;
        if (!member || !pet || !runtime || !isSupportedPetHorse(pet)) {
          destroySlot(slot);
          continue;
        }
        if (!presentation.view || presentation.view.petId !== pet.id || presentation.view.form !== pet.form) {
          presentation.view?.root.destroy(true);
          presentation.view = createPetHorseAnimationView(scene, pet, runtime.x, runtime.y);
        }
        const animation = member.snapshot.animation;
        if (!animation) throw new Error('Horse presentation requires the combat body clock.');
        syncPetHorseAnimationView(presentation.view, runtime, animation);
      }
      syncEffects(projectiles, timeMs);
      return animationEvents;
    },
    destroy: () => {
      scene.game.events.off('poststep', syncNativeFrames);
      destroySlot('p1');
      destroySlot('p2');
      for (const effect of effects.values()) effect.image.destroy();
      effects.clear();
      latestProjectiles = [];
    },
  };

  function syncEffects(projectiles: readonly ProjectileModel[], timeMs: number): void {
    for (const projectile of projectiles) {
      if (projectile.isExpired || effects.has(projectile.id) || projectile.elapsedMs < (projectile.activeAfterMs ?? 0)) continue;
      const usage = getPetHorseEffectUsage(projectile.assetKey);
      if (!usage) continue;
      const source = (['p1', 'p2'] as const)
        .map((slot) => slots[slot].view)
        .find((view) => view?.petId === projectile.sourceId);
      const image = scene.add.image(
        (usage.followsPet ? source?.root.x : projectile.x) ?? projectile.x,
        (usage.followsPet ? source?.root.y : projectile.y) ?? projectile.y,
        usage.asset.frames[0]!.key,
      ).setOrigin(
        usage.asset.frames[0]!.registrationOrigin.x,
        usage.asset.frames[0]!.registrationOrigin.y,
      ).setDepth(usage.depth);
      if (!usage.fixedDirection) image.setFlipX(projectile.facingX > 0);
      effects.set(projectile.id, { image, usage, startedAt: timeMs, projectile });
    }
    const activeIds = new Set(projectiles.filter(p => !p.isExpired).map(({ id }) => id));
    for (const [projectileId, effect] of effects) {
      const projectile = projectiles.find(({ id }) => id === projectileId);
      if (!projectile) {
        effect.image.destroy();
        effects.delete(projectileId);
        continue;
      }
      const elapsed = Math.max(0, timeMs - effect.startedAt);
      const frameMs = 1000 / normalizeHostFps(scene.game.loop.targetFps);
      const observedFrame = effect.usage.hostFrameIndices?.[projectile.petNativePhaseTick?.() ?? projectile.petHostTick ?? 0];
      if (effect.usage.hostFrameIndices && observedFrame === undefined) {
        throw new Error(`Unknown horse display phase ${projectile.sourceSymbol}/${projectile.petHostTick}`);
      }
      const frame = effect.usage.asset.frames[Math.min(
        effect.usage.asset.frames.length - 1,
        observedFrame ?? (projectile.petNativeFrame ? projectile.petNativeFrame() - 1
          : projectile.petHostTick !== undefined ? Math.max(0, projectile.petHostTick - 1) : Math.floor(elapsed / frameMs)),
      )]!;
      effect.image.setTexture(frame.key).setOrigin(frame.registrationOrigin.x, frame.registrationOrigin.y);
      if (projectile.petHostTick !== undefined) {
        // Phaser flipX mirrors the texture center; Flash mirrors the source registration point.
        effect.image.setFlipX(false).setScale(projectile.petRenderDirection ?? -projectile.facingX, 1);
      }
      const source = (['p1', 'p2'] as const)
        .map((slot) => slots[slot].view)
        .find((view) => view?.petId === projectile.sourceId);
      effect.image.setPosition(
        (projectile.petHostTick === undefined && effect.usage.followsPet ? source?.root.x : projectile.x) ?? projectile.x,
        (projectile.petHostTick === undefined && effect.usage.followsPet ? source?.root.y : projectile.y) ?? projectile.y,
      );
      if (!activeIds.has(projectileId)) {
        effect.image.destroy();
        effects.delete(projectileId);
      }
    }
  }
}

function normalizeHostFps(value: number): number {
  if (value <= 22) return 20;
  if (value <= 27) return 24;
  return 30;
}
