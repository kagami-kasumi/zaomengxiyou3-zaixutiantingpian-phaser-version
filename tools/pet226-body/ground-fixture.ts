import type { PetGroundEnvironment } from '../../src/assets/PetGroundEnvironmentAssets';
import { getPetMonkeyHorseGroundDefinition } from '../../src/systems/PetMonkeyHorseGroundDefinition';

/** Controlled horizontal Wall for isolated body/projectile tests, not a level oracle.
 * The real ground solver lands the original collider at the requested root; no
 * speed override, coordinate rewrite, or alternative Runtime is installed. */
export function bodyGroundFixture(
  family: 'monkey' | 'horse', form: 1 | 2 | 3 | 4, rootY: number,
  ownerRootOffsetY = 0,
): PetGroundEnvironment {
  const { collision } = getPetMonkeyHorseGroundDefinition(family, form);
  const top = rootY + collision.height / 2 + 0.1;
  return { ownerRootOffsetY, walls: [{ id: 'body-fixture-floor', left: -100000, right: 100000,
    top, bottom: top + 40, usesWallTolerance: true }] };
}
