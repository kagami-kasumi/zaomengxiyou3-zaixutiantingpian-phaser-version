import type { PetBehaviorContext } from './PetBehavior';
import type { MonkeyHorsePrivateProjectile } from './PetMonkeyHorsePrivateProjectile';
import { spawnProjectileFromTuning } from './ProjectileSystem';
import { toDragonSourceCoordinate } from './PetDragonCollisionSystem';
import source from '../assets/pet-horse-aoyi-buff.json';
import { createPetNativeFrameReader } from './PetNativeClipClock';

/** BasePet.addAoyiBuff: disabled Follow effect at release, before the body hit callback. */
export function emitHorseAoyiPrelude(context: PetBehaviorContext,
  adopt: (entry: MonkeyHorsePrivateProjectile) => void): void {
  context.castSkill(({ projectiles }) => {
    const x = toDragonSourceCoordinate(context.runtime.x), y = toDragonSourceCoordinate(context.runtime.y);
    const projectile = spawnProjectileFromTuning(projectiles, { sourceId: context.pet.id, x, y, facingX: -1 },
      'pet-horse4-tmaoyi', source.symbol, {
        actionName: 'null', assetKey: 'pet-skill.horse4.aoyi-buff', sourceSymbol: source.symbol,
        runtimeName: source.symbol, offsetX: 0, offsetY: 0, speedX: 0, speedY: 0, distance: undefined,
        width: 0, height: 0, lifetimeMs: source.naturalRemovalFrame * 1000 / context.hostFps,
        damage: 0, attackKind: 'magic', knockbackX: 0, knockbackY: 0,
        hitIntervalFrames: 1, maxHits: 0,
      });
    projectile.petHostTick = 0; projectile.petActionToken = context.actionToken;
    if (context.projectileCombat?.displayTick) {
      projectile.petNativeFrame = createPetNativeFrameReader(context.projectileCombat.displayTick, source.sourceFrameCount);
    }
    projectile.petRenderDirection = 1; projectile.visualOnly = true; projectile.destroyWhenSourceHurt = true;
    projectiles.projectiles.push(projectile);
    adopt({ projectile, cache: { hurt: 0, attack: 0, critical: false }, action: 'null',
      lastTick: source.naturalRemovalFrame, follows: true, sourceX: x, sourceY: y,
      sourceMatrixA: context.runtime.rootScaleX ?? 1 });
    return { ok: true, message: 'AoyiBuff', pet: context.pet, projectile,
      mpBefore: context.pet.mp, mpAfter: context.pet.mp };
  });
}
