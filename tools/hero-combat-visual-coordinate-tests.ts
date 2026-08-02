import assert from 'node:assert/strict';
import { HeroNormalAttackEffectKeys } from '../src/assets/AssetManifest';
import {
  projectHeroVisualRootY,
  projectNormalAttackVisualPoint,
} from '../src/scenes/HeroCombatVisualCoordinates';

assert.equal(projectHeroVisualRootY(590), 540, 'platform y must remain the hero foot point');
assert.deepEqual(
  projectNormalAttackVisualPoint(
    { effectKey: HeroNormalAttackEffectKeys.role1Hit1, facingX: 1 },
    300,
    590,
  ),
  { x: 420, y: 545 },
);
assert.deepEqual(
  projectNormalAttackVisualPoint(
    { effectKey: HeroNormalAttackEffectKeys.role3Hit3, facingX: -1 },
    300,
    590,
  ),
  { x: 120, y: 400 },
);
assert.deepEqual(
  projectNormalAttackVisualPoint(
    { effectKey: HeroNormalAttackEffectKeys.role5SwordHit4, facingX: 1 },
    300,
    590,
  ),
  { x: 347.1, y: 594.2 },
);

console.log('Hero foot/root and normal-attack registration coordinate tests passed.');
