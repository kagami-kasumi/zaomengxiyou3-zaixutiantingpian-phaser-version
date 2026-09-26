import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { PetMonkeyHorseCollisionAssets } from '../../src/assets/PetMonkeyHorseCollisionAssets';
import type { PetProjectileCombatPort } from '../../src/systems/PetProjectileCombatPort';

/** Explicit isolation port for original body/AI fixtures that do not run target damage. */
export const bodyFixtureCollisionAssets = new PetMonkeyHorseCollisionAssets(JSON.parse(gunzipSync(
  readFileSync('public/assets/pets/monkey-horse/collision.json.gz'),
).toString()));
export const noTargetBodyFixturePort: PetProjectileCombatPort = {
  monkeyHorseCollision: () => bodyFixtureCollisionAssets,
  target: () => undefined,
  mask: () => { throw new Error('Body fixture does not supply dragon geometry'); },
  hit: () => { throw new Error('Body fixture has no damage target'); },
};
