import monkeyFamilyTruth from '../docs/reverse-engineering/ground-truth/manifests/task-settings-207-pet-monkey-family.json';
import {
  formatBehaviorVerificationIssues,
  validateBehaviorContractCoverage,
  verifyRangeAttackDamageChain,
} from './behavior-contract-runtime-verifier';
import { collectMonkeyRangeScenarios } from './pet-monkey-behavior-contract-adapter';
import { monkeyBehaviorContractCoverage } from './pet-monkey-behavior-contract-coverage';

const coverageErrors = validateBehaviorContractCoverage(
  monkeyFamilyTruth.p1rAcceptance.contractIds,
  monkeyBehaviorContractCoverage,
);
if (coverageErrors.length > 0) {
  throw new Error(`Monkey behavior contract coverage is incomplete:\n${coverageErrors.join('\n')}`);
}

const failures = collectMonkeyRangeScenarios().flatMap((scenario) => (
  verifyRangeAttackDamageChain(scenario.expected, scenario.trace)
    .map((issue) => ({ scenarioId: scenario.id, issue }))
));
if (failures.length > 0) {
  const report = failures.map(({ scenarioId, issue }) => (
    `${scenarioId}: ${formatBehaviorVerificationIssues([issue])}`
  )).join('\n');
  throw new Error(`Behavior runtime semantics verifier rejected monkey P1R:\n${report}`);
}

console.log('Monkey behavior contract runtime semantics verifier passed.');
