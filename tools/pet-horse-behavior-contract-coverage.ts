import horseFamilyTruth from '../docs/reverse-engineering/ground-truth/manifests/task-settings-209-pet-horse-family.json';
import type { BehaviorContractCoverage } from './behavior-contract-runtime-verifier';

export const horseBehaviorContractCoverage: readonly BehaviorContractCoverage[] =
  horseFamilyTruth.p1rAcceptance.acceptanceMatrix.map((entry) => ({
    contractId: entry.id,
    expectedFields: entry.expectedFields,
    scenarioIds: entry.controlledScenarios,
    actualTraceFields: entry.traceFields,
    assertions: entry.semanticAssertions,
    verificationKind: 'trace',
  }));
