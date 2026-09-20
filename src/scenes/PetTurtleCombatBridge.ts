import type Phaser from 'phaser';
import type { PetRoster } from '../systems/PetTypes';
import type { PetCombatSnapshot } from '../systems/PetCombatTypes';
import type { ProjectileModel } from '../systems/ProjectileTypes';
import { createDefaultPetBehaviorRegistry } from '../systems/pet-behaviors/createDefaultPetBehaviorRegistry';
import { ensureSceneAssetBundle } from './SceneAssetBundleBridge';
import { hasTurtleAssets, requireTurtleAssets } from './PetTurtleAssetBridge';
import { createPetTurtlePresentationBridge } from './PetTurtlePresentationBridge';

/** Resource readiness and read-only views; no second combat runtime or animation clock. */
export function createPetTurtleCombatBridge(scene: Phaser.Scene) {
  let loading: Promise<void> | undefined, failure: unknown, disposed = false;
  const views = new Map<string, { presenter: ReturnType<typeof createPetTurtlePresentationBridge>; signature: string }>();
  const destroy = () => {
    if (disposed) return;
    disposed = true;
    for (const view of views.values()) view.presenter.destroy();
    views.clear(); scene.events.off('shutdown', destroy);
  };
  scene.events.once('shutdown', destroy);
  return {
    registry: createDefaultPetBehaviorRegistry(() => requireTurtleAssets(scene)),
    readyRoster(roster: PetRoster | undefined): PetRoster | undefined {
      const pet = roster?.pets.find(pet => pet.isActive && pet.lifetime > 0);
      if (pet?.species !== 'turtle' || hasTurtleAssets(scene)) return roster;
      if (failure) throw failure;
      if (!disposed && !loading) loading = ensureSceneAssetBundle(scene, 'pet-turtle')
        .then(() => {}).catch(error => { if (!disposed) failure = error; });
      // The stored roster remains authoritative; synchronize the public runtime
      // to no active entity while its replacement's resource transaction completes.
      return { ...roster!, pets: [] };
    },
    update(snapshots: Partial<Record<'p1' | 'p2', PetCombatSnapshot>>, projectiles: readonly ProjectileModel[],
      owners: readonly Readonly<{ slot: string; x: number; y: number; turtleLinkVisible: boolean }>[] = []) {
      if (disposed) return;
      const live = new Set<string>(), sources = new Set<string>();
      const viewport = { x: Math.round(scene.cameras.main.scrollX), y: Math.round(scene.cameras.main.scrollY) };
      const draw = (key: string, stateId: string, x: number, y: number, depth: number) => {
        live.add(key);
        let view = views.get(key);
        if (!view) {
          view = { presenter: createPetTurtlePresentationBridge(scene, requireTurtleAssets(scene), depth), signature: '' };
          views.set(key, view);
        }
        const root = { x: Math.round(x), y: Math.round(y) };
        const signature = `${stateId}/${root.x}/${root.y}/${viewport.x}/${viewport.y}`;
        if (view.signature !== signature) { view.presenter.update(stateId, { root }, viewport); view.signature = signature; }
      };
      for (const [slot, snapshot] of Object.entries(snapshots)) {
        if (snapshot.species !== 'turtle' || !snapshot.runtime || !snapshot.animation || !snapshot.petId) continue;
        const { runtime, animation } = snapshot;
        sources.add(snapshot.petId);
        const state = requireTurtleAssets(scene).body(snapshot.form!, animation.row, animation.column,
          runtime.facingX > 0 ? 1 : 0, slot === 'p1' ? 'P1' : 'P2');
        draw(runtime.runtimeKey, state.id, runtime.x, runtime.y, 42);
        const linkOffset = requireTurtleAssets(scene).linkOffset();
        if (snapshot.turtleLinkVisible) draw(`${runtime.runtimeKey}:link`,
          'effect:PetTurtle2Buff:0:s1:d1', runtime.x + linkOffset.x, runtime.y + linkOffset.y, 44);
      }
      for (const owner of owners) if (owner.turtleLinkVisible) {
        const offset = requireTurtleAssets(scene).linkOffset();
        draw(`${owner.slot}:link`, 'effect:PetTurtle2Buff:0:s1:d1', owner.x + offset.x, owner.y + offset.y, 44);
      }
      for (const projectile of projectiles) {
        if (projectile.isExpired || !sources.has(projectile.sourceId) || projectile.petHostTick === undefined
          || !['pet-turtle-normal', 'pet-turtle-sld'].includes(projectile.variant)) continue;
        const state = requireTurtleAssets(scene).effect(projectile.sourceSymbol, Math.max(0, projectile.petHostTick - 1),
          1, -projectile.facingX as -1 | 1);
        draw(projectile.projectileId, state.id, projectile.x, projectile.y, 43);
      }
      for (const [key, view] of views) if (!live.has(key)) { view.presenter.destroy(); views.delete(key); }
    },
    destroy,
  };
}
