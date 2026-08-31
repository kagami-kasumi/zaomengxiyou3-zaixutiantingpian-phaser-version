import assert from 'node:assert/strict';
import horseFamilyTruth from '../docs/reverse-engineering/ground-truth/manifests/task-settings-209-pet-horse-family.json';
import {
  formatBehaviorVerificationIssues,
  validateBehaviorContractCoverage,
  verifyRangeAttackDamageChain,
} from './behavior-contract-runtime-verifier';
import {
  collectHorseRangeScenario,
  collectHorseRangeScenarios,
} from './pet-horse-behavior-contract-adapter';
import { horseBehaviorContractCoverage } from './pet-horse-behavior-contract-coverage';

assert.deepEqual(validateBehaviorContractCoverage(
  horseFamilyTruth.p1rAcceptance.contractIds,
  horseBehaviorContractCoverage,
), []);

const failures = collectHorseRangeScenarios().flatMap((scenario) => (
  verifyRangeAttackDamageChain(scenario.expected, scenario.trace)
    .map((issue) => ({ scenarioId: scenario.id, issue }))
));
if (failures.length > 0) {
  const report = failures.map(({ scenarioId, issue }) => (
    `${scenarioId}: ${formatBehaviorVerificationIssues([issue])}`
  )).join('\n');
  throw new Error(`Behavior runtime semantics verifier rejected horse P1H:\n${report}`);
}

const representative = collectHorseRangeScenario(1, 'p1');
for (const mutation of [
  { name: 'range', expected: { ...representative.expected, attackRange: 20 }, killedBy: 'EARLY_ATTACK' },
  { name: 'hit timing', expected: { ...representative.expected, minimumHitElapsedMs: representative.expected.minimumHitElapsedMs + 200 }, killedBy: 'EARLY_HIT' },
  { name: 'source owner', expected: { ...representative.expected, petSourceId: 'mutated-owner' }, killedBy: 'WRONG_DAMAGE_SOURCE' },
] as const) {
  const issues = verifyRangeAttackDamageChain(mutation.expected, representative.trace);
  assert.ok(issues.some(({ code }) => code === mutation.killedBy), `${mutation.name} mutation must be killed`);
}

console.log('Horse behavior contract coverage, P1/P2 range traces, and mutation-kill passed.');
