import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { HeroNormalAttackEffectKeys } from '../src/assets/AssetManifest';
import {
  projectHeroCombatVisualRootPoint,
  projectHeroVisualRootY,
  projectNormalAttackOriginX,
  projectNormalAttackVisualPoint,
  shouldFlipNormalAttackVisual,
} from '../src/scenes/HeroCombatVisualCoordinates';

assert.equal(projectHeroVisualRootY(590), 540, 'platform y must remain the hero foot point');
assert.deepEqual(projectHeroCombatVisualRootPoint(1, 300, 590), { x: 305, y: 525 });
assert.deepEqual(projectHeroCombatVisualRootPoint(2, 300, 590), { x: 315, y: 540 });
assert.deepEqual(projectHeroCombatVisualRootPoint(3, 300, 590), { x: 300, y: 540 });
assert.deepEqual(
  projectNormalAttackVisualPoint(
    { heroId: 1, effectKey: HeroNormalAttackEffectKeys.role1Hit1, facingX: 1 },
    300,
    590,
  ),
  { x: 425, y: 530 },
);
assert.equal(shouldFlipNormalAttackVisual({ heroId: 2, facingX: -1 }), false);
assert.equal(shouldFlipNormalAttackVisual({ heroId: 2, facingX: 1 }), true);
assert.equal(shouldFlipNormalAttackVisual({ heroId: 1, facingX: -1 }), true);
assert.equal(projectNormalAttackOriginX(493 / 592, false), 493 / 592);
assert.ok(Math.abs(projectNormalAttackOriginX(493 / 592, true) - 99 / 592) < Number.EPSILON);

const stage12Source = readFileSync(
  path.join(process.cwd(), 'src/scenes/stage12/Stage12GameplayBridge.ts'),
  'utf8',
);
assert.match(stage12Source, /createHeroPartyRuntime\(scene/, 'Stage 1-2 must delegate hero visuals');
const stage13Source = readFileSync(
  path.join(process.cwd(), 'src/scenes/stage13/Stage13GameplayBridge.ts'),
  'utf8',
);
assert.match(stage13Source, /createHeroPartyRuntime\(scene/, 'Stage 1-3 must delegate hero visuals');
const stage21Source = readFileSync(
  path.join(process.cwd(), 'src/scenes/stage21/Stage21GameplayBridge.ts'),
  'utf8',
);
assert.match(stage21Source, /createHeroPartyRuntime\(scene/, 'Stage 2-1 must delegate hero visuals');
const heroPartySource = readFileSync(
  path.join(process.cwd(), 'src/scenes/HeroPartyRuntimeBridge.ts'),
  'utf8',
);
assert.match(heroPartySource, /createHeroNormalAttackVisualBridge\(scene\)/, 'hero runtime must create attack visuals');
assert.match(heroPartySource, /attackVisuals\.update\(/, 'hero runtime must sync attack visuals');
assert.match(heroPartySource, /attackVisuals\.destroy\(\)/, 'hero runtime must release attack visuals');

for (const file of [
  'src/scenes/stage22/Stage22GameplayBridge.ts',
  'src/scenes/stage22/Stage22DevGameplayBridge.ts',
]) {
  const source = readFileSync(path.join(process.cwd(), file), 'utf8');
  assert.match(source, /createHeroPartyRuntime\(scene/, `${file} must delegate hero visuals`);
  assert.doesNotMatch(source, /createHeroNormalAttackVisualBridge\(scene\)/, `${file} must not own attack visuals`);
}
assert.deepEqual(
  projectNormalAttackVisualPoint(
    { heroId: 3, effectKey: HeroNormalAttackEffectKeys.role3Hit3, facingX: -1 },
    300,
    590,
  ),
  { x: 120, y: 400 },
);
assert.deepEqual(
  projectNormalAttackVisualPoint(
    { heroId: 5, effectKey: HeroNormalAttackEffectKeys.role5SwordHit4, facingX: 1 },
    300,
    590,
  ),
  { x: 347.1, y: 594.2 },
);

console.log('Hero foot/root and normal-attack registration coordinate tests passed.');
