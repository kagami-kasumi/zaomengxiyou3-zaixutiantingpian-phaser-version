import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createMonster30, updateMonster30 } from '../src/systems/Monster30System';
import { consumeMonsterPetBodyDelta } from '../src/systems/MonsterPetTargetEffectSystem';
import { createStage11MonsterVisual, updateStage11MonsterVisual, Stage11VisualTickMs } from '../src/systems/Stage11MonsterVisualSystem';

// Diagnostic, deliberately NOT an acceptance test. Replays the current world ->
// view order through actual model/visual functions. The alternate order is a
// source-informed comparison, not execution of the original AIR runtime.
const results = [];
for (const fps of [20, 24, 30]) {
  const monster = createMonster30(300, 200);
  monster.hp = 1;
  monster.state = 'hit1'; monster.attackSerial = 1;
  monster.stateTimerMs = 500;
  const state = monster.petTargetEffectState!;
  const visual = createStage11MonsterVisual(30);
  const snapshot = () => ({ state: monster.state, attackSerial: monster.attackSerial, facingX: monster.facingX });
  updateStage11MonsterVisual(visual, snapshot(), 0);
  const beforeEffects = structuredClone(visual);
  const expectedEvents = updateStage11MonsterVisual(beforeEffects, snapshot(), Stage11VisualTickMs);
  state.effects.add({ name: 'petmonkey_fire', time: fps * 2, hurt: 1 });
  updateMonster30(monster, [], 1000 / fps, () => 0.99, fps);
  const actualEvents = updateStage11MonsterVisual(visual, snapshot(),
    consumeMonsterPetBodyDelta(state, Stage11VisualTickMs, 1000 / fps));
  assert.equal(monster.state, 'dead');
  assert.equal(expectedEvents.length, 1);
  assert.equal(actualEvents.length, 0);
  assert.equal(visual.action, 'dead');
  assert.equal(visual.actionTick, 1);
  results.push({ fps, priorAction: 'hit1', expectedBodyFirstEvents: expectedEvents.length,
    actualWorldThenViewEvents: actualEvents.length, actualDeathActionTick: visual.actionTick });
}
const report = { status: 'confirmed-modern-order-gap-not-acceptance', results,
  source: 'BaseObject.step:169 body before :228 effects; BaseMonster.reduceHp switches to dead; Monster30.enterFrameFunc owns hit1 callback.',
  limitations: 'Controlled attack-ready/first-fire-tick boundary; actual model and visual functions, not full Scene, collision, original AIR execution or canvas. Requires production ordering fix and independent source verification.' };
mkdirSync('docs/tasks/evidence/TASK-SLICE-226', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SLICE-226/target-body-order-preflight.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
