import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { CombatHitFeedbackTruthId, combatHitFeedbackAssets } from '../src/assets/CombatHitFeedbackAssets';
import { createDamageEvent } from '../src/systems/CombatSystem';
import {
  advanceCombatFeedbackHostTick,
  CombatFeedbackTuning,
  createCombatFeedbackModel,
  flushCombatFeedbackQueue,
  getCombatComboDigitStartX,
  getCombatFeedbackTargetAnchor,
  recordCombatFeedback,
  type CombatFeedbackSource,
} from '../src/systems/CombatFeedbackSystem';
import {
  createStage1CombatEnemy,
  createStage1CombatRuntime,
  resolveStage1HeroHit,
  resolveStage1PetHit,
} from '../src/systems/Stage1CombatSystem';

const repoRoot = process.cwd();

function event(id: string, amount = 10, critical = false) {
  return createDamageEvent({
    sourceId: 'p1', targetId: 'monster-30', attackId: id, actionName: 'hit1',
    amount, attackKind: 'physics', knockbackX: 0, knockbackY: 0, occurredAtMs: 100,
    critical,
  });
}

function record(
  source: CombatFeedbackSource,
  id: string,
  options: Readonly<{ amount?: number; hpBefore?: number; hpAfter?: number; combo?: boolean; owner?: 'p1' | 'p2'; critical?: boolean }> = {},
) {
  const model = createCombatFeedbackModel();
  const amount = options.amount ?? 10;
  const hpBefore = options.hpBefore ?? 100;
  const hpAfter = options.hpAfter ?? hpBefore - amount;
  const result = recordCombatFeedback(model, {
    damageEvent: event(id, amount, options.critical),
    hpBefore,
    hpAfter,
    source,
    ownerSlot: options.owner ?? 'p1',
    target: { id: 'monster-30', x: 470, y: 350, height: 120 },
    incrementsCombo: options.combo ?? true,
  });
  return { model, result };
}

function testActualHpDecreaseIsTheOnlyProducer(): void {
  for (const source of ['hero', 'pet', 'magic-weapon', 'effect'] as const) {
    const { model, result } = record(source, `${source}-attack`, { combo: source !== 'effect' });
    assert.ok(result);
    assert.equal(result.amount, 10);
    assert.equal(result.source, source);
    assert.equal(model.trace.length, 1);
    assert.equal(model.currentCombo, source === 'effect' ? 0 : 1);
  }
  assert.equal(record('hero', 'zero', { amount: 0, hpAfter: 100 }).result, undefined);
  assert.equal(record('hero', 'mismatch', { amount: 10, hpAfter: 95 }).result, undefined);

  const model = createCombatFeedbackModel();
  const input = {
    damageEvent: event('same'), hpBefore: 100, hpAfter: 90,
    source: 'hero' as const, ownerSlot: 'p1' as const,
    target: { id: 'monster-30', x: 470, y: 350, height: 120 }, incrementsCombo: true,
  };
  assert.ok(recordCombatFeedback(model, input));
  assert.equal(recordCombatFeedback(model, input), undefined);
  assert.equal(model.trace.length, 1);
}

function testQueueFanOutAndTwoTickCadence(): void {
  const model = createCombatFeedbackModel();
  for (let index = 0; index < 6; index += 1) {
    recordCombatFeedback(model, {
      damageEvent: event(`rapid-${index}`, 11 + index),
      hpBefore: 100,
      hpAfter: 89 - index,
      source: index % 2 === 0 ? 'hero' : 'pet',
      ownerSlot: index % 2 === 0 ? 'p1' : 'p2',
      target: { id: 'monster-30', x: 470, y: 350, height: 120 },
      incrementsCombo: true,
    });
  }
  const first = flushCombatFeedbackQueue(model);
  assert.equal(first.length, 5);
  assert.deepEqual(first.map(({ offsetX, offsetY }) => [offsetX, offsetY]), [
    [-20, -20], [-10, -10], [0, 0], [10, -10], [20, -20],
  ]);
  assert.equal(advanceCombatFeedbackHostTick(model).length, 0);
  assert.equal(advanceCombatFeedbackHostTick(model).length, 1);
  assert.equal(model.queuedEvents.length, 0);
}

function testSharedComboAndTimeout(): void {
  const model = createCombatFeedbackModel();
  for (let index = 0; index < 10; index += 1) {
    recordCombatFeedback(model, {
      damageEvent: event(`combo-${index}`), hpBefore: 100, hpAfter: 90,
      source: index % 3 === 0 ? 'magic-weapon' : index % 2 === 0 ? 'pet' : 'hero',
      ownerSlot: index % 2 === 0 ? 'p1' : 'p2',
      target: { id: 'monster-30', x: 470, y: 350, height: 120 }, incrementsCombo: true,
    });
  }
  assert.equal(model.currentCombo, 10);
  assert.equal(model.highestCombo, 10);
  for (let tick = 0; tick < 40; tick += 1) advanceCombatFeedbackHostTick(model);
  assert.equal(model.currentCombo, 10);
  for (let tick = 0; tick < 40; tick += 1) advanceCombatFeedbackHostTick(model);
  assert.equal(model.currentCombo, 0);
  assert.equal(model.highestCombo, 10);
}

function testStageResolversProduceOneTracePerHpDecrease(): void {
  const runtime = createStage1CombatRuntime();
  const heroTarget = createStage1CombatEnemy({ id: 'hero-target', enemyType: 30, x: 470, y: 350 });
  const hero = resolveStage1HeroHit({
    runtime, enemy: heroTarget, sourceId: 'p2', attackId: 'hero-1', actionName: 'hit1',
    attackKind: 'physics', damage: 42, knockbackX: 1, knockbackY: -1, timeMs: 10,
  });
  assert.ok(hero);
  assert.equal(runtime.feedback.trace[0]?.ownerSlot, 'p2');
  assert.equal(runtime.feedback.trace[0]?.source, 'hero');

  const petTarget = createStage1CombatEnemy({ id: 'pet-target', enemyType: 30, x: 520, y: 350 });
  const pet = resolveStage1PetHit({
    runtime, enemy: petTarget, ownerSlot: 'p1', petId: 'p1-horse4', attackId: 'pet-1',
    actionName: 'hit5_1', attackKind: 'magic', damage: 73, knockbackX: 0, knockbackY: 0,
    timeMs: 20, critical: true,
  });
  assert.ok(pet);
  assert.equal(runtime.feedback.trace[1]?.source, 'pet');
  assert.equal(runtime.feedback.trace[1]?.critical, true);
  assert.equal(resolveStage1PetHit({
    runtime, enemy: petTarget, ownerSlot: 'p1', petId: 'p1-horse4', attackId: 'pet-1',
    actionName: 'hit5_1', attackKind: 'magic', damage: 73, knockbackX: 0, knockbackY: 0,
    timeMs: 21, critical: true,
  }), undefined);
  assert.equal(runtime.feedback.trace.length, 2);
}

function testTruthGeometryAndAssets(): void {
  assert.equal(CombatFeedbackTuning.truthId, CombatHitFeedbackTruthId);
  assert.deepEqual(getCombatFeedbackTargetAnchor({ id: 'm', x: 470, y: 350, height: 120 }), { x: 450, y: 290 });
  assert.deepEqual(getCombatFeedbackTargetAnchor({ id: 'm', x: 470, y: 350, height: 400 }), { x: 450, y: 200 });
  assert.equal(getCombatComboDigitStartX(2), 4);
  assert.equal(getCombatComboDigitStartX(10), -44.6);
  assert.equal(getCombatComboDigitStartX(100), -95.6);
  assert.equal(CombatFeedbackTuning.comboDigitAssetScale, 175 / 315);
  assert.equal(CombatFeedbackTuning.hostFrameRate, 30);
  assert.equal(CombatFeedbackTuning.hostTickMs, 1_000 / 30);
  const assets = [
    combatHitFeedbackAssets.batter,
    ...combatHitFeedbackAssets.ordinaryDigits,
    ...combatHitFeedbackAssets.criticalDigits,
    ...combatHitFeedbackAssets.comboDigitFrames,
  ];
  assert.equal(assets.length, 71);
  for (const asset of assets) {
    assert.equal(fs.existsSync(path.join(repoRoot, 'public', asset.path.replace(/^\//u, ''))), true, asset.path);
  }
}

testActualHpDecreaseIsTheOnlyProducer();
testQueueFanOutAndTwoTickCadence();
testSharedComboAndTimeout();
testStageResolversProduceOneTracePerHpDecrease();
testTruthGeometryAndAssets();

console.log('Combat feedback tests passed.');
