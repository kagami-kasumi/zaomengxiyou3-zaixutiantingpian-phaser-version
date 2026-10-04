import type Phaser from 'phaser';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createPetRuntime } from '../src/systems/PetRuntimeSystem';
import { attachPetReceptionBody } from '../src/systems/PetReceptionBodyOwner';
import { createPetView, syncPetViewPresentation } from '../src/scenes/test-scene/TestSceneViews';
import type { PetState } from '../src/systems/PetTypes';
import type { PetReceptionBodyForm } from '../src/systems/PetReceptionBodyClock';

/** Controlled entry cursor, real production view; not a natural combat journey. */
export async function capturePetReceptionProjection(scene: Phaser.Scene, pose: {
  form: PetReceptionBodyForm; action: 'hurt' | 'dead'; row: number; column: number; direct: 0 | 1; background: number;
}) {
  const match = /^(\w+)([1-4])$/.exec(pose.form)!;
  const pet = { ...structuredClone(createSeedPetRoster().pets[0]!), species: match[1] as PetState['species'], form: Number(match[2]) };
  const runtime = createPetRuntime(pet, { x: 470, y: 350, facingX: 1 });
  runtime.x = 470; runtime.y = 350; runtime.facingX = pose.direct === 1 ? 1 : -1;
  const body = attachPetReceptionBody(pet, runtime, { setStatic() {}, cleanup() {}, release() {} }, pose);
  const view = createPetView(scene, pet, 470, 350);
  const surface = scene.make.renderTexture({ x: 0, y: 0, width: 940, height: 590, add: false });
  try {
    const before = JSON.stringify(body.snapshot());
    for (let i = 0; i < 3; i++) syncPetViewPresentation(scene, view, pet, runtime, []);
    if (before !== JSON.stringify(body.snapshot())) throw new Error('View advanced body clock');
    if (view.kind !== 'placeholder' || !view.reception) throw new Error('Missing native reception image');
    surface.fill(pose.background, 1); surface.draw(view.root);
    const png = await new Promise<string>((resolve, reject) => surface.snapshot(result => {
      if (result instanceof HTMLImageElement) resolve(result.src); else reject(Error('Missing renderer image'));
    }));
    return { png, actual: { key: view.reception.texture.key, x: view.reception.x, y: view.reception.y,
      rootX: view.root.x, rootY: view.root.y, scaleX: view.root.scaleX, scaleY: view.root.scaleY,
      flipX: view.reception.flipX, originX: view.reception.originX, originY: view.reception.originY } };
  } finally { surface.destroy(); view.root.destroy(true); body.release('owner-exit'); }
}
