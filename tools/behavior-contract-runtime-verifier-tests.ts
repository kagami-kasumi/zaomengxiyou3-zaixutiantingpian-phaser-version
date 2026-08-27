import assert from 'node:assert/strict';
import monkeyFamilyTruth from '../docs/reverse-engineering/ground-truth/manifests/task-settings-207-pet-monkey-family.json';
import behaviorTraceSchema from '../docs/workflow/schemas/behavior-runtime-trace.schema.json';
import {
  behaviorRuntimeTraceRequiredFields,
  validateBehaviorContractCoverage,
  validateBehaviorRuntimeTrace,
  verifyRangeAttackDamageChain,
  type BehaviorRuntimeTraceFrame,
  type RangeAttackChainExpected,
} from './behavior-contract-runtime-verifier';
import { collectMonkeyRangeScenario } from './pet-monkey-behavior-contract-adapter';
import { monkeyBehaviorContractCoverage } from './pet-monkey-behavior-contract-coverage';

const expected: RangeAttackChainExpected = {
  contractId: 'monkey1.normal',
  attackRange: 40,
  minimumHitElapsedMs: 400,
  petSourceId: 'pet-monkey-1',
  targetId: 'target',
};
const passingTrace: readonly BehaviorRuntimeTraceFrame[] = [
  frame({ frame: 0, distance: 140, petX: 0 }),
  frame({ frame: 1, elapsedMs: 100, distance: 90, petX: 50 }),
  frame({ frame: 2, elapsedMs: 200, distance: 40, petX: 100, action: 'basic-attack', actionToken: 1, projectileId: 'projectile-1', projectileActionToken: 1, projectileX: 120, projectileY: 0, projectileElapsedMs: 0 }),
  frame({ frame: 3, elapsedMs: 600, distance: 40, petX: 100, projectileId: 'projectile-1', projectileActionToken: 1, projectileX: 120, projectileY: 0, projectileElapsedMs: 400, attackId: 'projectile-1:pet-monkey-1-normal-1:1', damageSourceId: 'pet-monkey-1', targetHpBefore: 100, targetHpAfter: 75, cleanupReason: 'hit' }),
];

assert.deepEqual(validateBehaviorRuntimeTrace(passingTrace), []);
assert.deepEqual(behaviorTraceSchema.items.required, [...behaviorRuntimeTraceRequiredFields]);
assert.deepEqual(verifyRangeAttackDamageChain(expected, passingTrace), []);
assert.deepEqual(validateBehaviorContractCoverage(
  monkeyFamilyTruth.p1rAcceptance.contractIds,
  monkeyBehaviorContractCoverage,
), []);

assert.ok(validateBehaviorRuntimeTrace([{
  ...passingTrace[0]!,
  runtimeKey: '',
}]).some((error) => error.includes('runtimeKey')));

const mutations = [
  { name: 'attackRange', expected: { ...expected, attackRange: 20 }, killedBy: 'EARLY_ATTACK' },
  { name: 'hit-frame', expected: { ...expected, minimumHitElapsedMs: 450 }, killedBy: 'EARLY_HIT' },
  { name: 'source-owner', expected: { ...expected, petSourceId: 'pet-monkey-2' }, killedBy: 'WRONG_DAMAGE_SOURCE' },
] as const;
for (const mutation of mutations) {
  const issues = verifyRangeAttackDamageChain(mutation.expected, passingTrace);
  assert.ok(issues.some(({ code }) => code === mutation.killedBy), `${mutation.name} mutation must be killed`);
}

const currentScenario = collectMonkeyRangeScenario(1, 'p1');
assert.deepEqual(verifyRangeAttackDamageChain(currentScenario.expected, currentScenario.trace), []);

console.log('Behavior contract trace schema, coverage, corrected runtime, and mutation-kill tests passed.');

function frame(overrides: Partial<BehaviorRuntimeTraceFrame>): BehaviorRuntimeTraceFrame {
  return {
    frame: 0,
    elapsedMs: 0,
    ownerSlot: 'p1',
    consumerPath: 'synthetic-black-box',
    runtimeKey: 'runtime-1',
    petId: 'pet-monkey-1',
    petX: 0,
    petY: 0,
    targetId: 'target',
    targetX: 140,
    targetY: 0,
    distance: 140,
    targetHpBefore: 100,
    targetHpAfter: 100,
    ...overrides,
  };
}
