export type BehaviorTraceOwnerSlot = 'p1' | 'p2';

export type BehaviorRuntimeTraceFrame = Readonly<{
  frame: number;
  elapsedMs: number;
  ownerSlot: BehaviorTraceOwnerSlot;
  consumerPath: string;
  runtimeKey: string;
  petId: string;
  petX: number;
  petY: number;
  targetId: string;
  targetX: number;
  targetY: number;
  distance: number;
  action?: string;
  actionToken?: number;
  projectileId?: string;
  projectileX?: number;
  projectileY?: number;
  projectileElapsedMs?: number;
  attackId?: string;
  damageSourceId?: string;
  targetHpBefore: number;
  targetHpAfter: number;
  cleanupReason?: 'hit' | 'expired' | 'source-destroyed' | 'runtime-destroyed';
}>;

export type BehaviorContractCoverage = Readonly<{
  contractId: string;
  expectedFields: readonly string[];
  scenarioIds: readonly string[];
  actualTraceFields: readonly string[];
  assertions: readonly string[];
  verificationKind: 'trace' | 'external-gate';
}>;

export type RangeAttackChainExpected = Readonly<{
  contractId: string;
  attackRange: number;
  minimumHitElapsedMs: number;
  petSourceId: string;
  targetId: string;
}>;

export type BehaviorVerificationIssue = Readonly<{
  code:
    | 'TRACE_SCHEMA'
    | 'INITIAL_PRECONDITION'
    | 'EARLY_ATTACK'
    | 'NO_CHASE'
    | 'NO_IN_RANGE'
    | 'NO_ATTACK'
    | 'EARLY_HIT'
    | 'NO_HIT'
    | 'WRONG_DAMAGE_SOURCE'
    | 'NO_DAMAGE'
    | 'NO_CLEANUP';
  contractId: string;
  message: string;
  frame?: number;
}>;

export const behaviorRuntimeTraceRequiredFields = [
  'frame',
  'elapsedMs',
  'ownerSlot',
  'consumerPath',
  'runtimeKey',
  'petId',
  'petX',
  'petY',
  'targetId',
  'targetX',
  'targetY',
  'distance',
  'targetHpBefore',
  'targetHpAfter',
] as const;

export function validateBehaviorRuntimeTrace(
  trace: readonly BehaviorRuntimeTraceFrame[],
): readonly string[] {
  const errors: string[] = [];
  if (trace.length === 0) return ['trace must contain at least one frame'];
  trace.forEach((entry, index) => {
    for (const field of behaviorRuntimeTraceRequiredFields) {
      if (entry[field] === undefined || entry[field] === null) {
        errors.push(`trace[${index}] missing ${field}`);
      }
    }
    for (const field of ['frame', 'elapsedMs', 'petX', 'petY', 'targetX', 'targetY', 'distance', 'targetHpBefore', 'targetHpAfter'] as const) {
      if (!Number.isFinite(entry[field])) errors.push(`trace[${index}].${field} must be finite`);
    }
    if (!Number.isSafeInteger(entry.frame) || entry.frame < 0) errors.push(`trace[${index}].frame must be a non-negative integer`);
    if (entry.elapsedMs < 0) errors.push(`trace[${index}].elapsedMs must be non-negative`);
    if (entry.distance < 0) errors.push(`trace[${index}].distance must be non-negative`);
    if (entry.ownerSlot !== 'p1' && entry.ownerSlot !== 'p2') errors.push(`trace[${index}].ownerSlot must be p1 or p2`);
    for (const field of ['consumerPath', 'runtimeKey', 'petId', 'targetId'] as const) {
      if (typeof entry[field] !== 'string' || entry[field].length === 0) errors.push(`trace[${index}].${field} must be non-empty`);
    }
    if (entry.projectileId && (!Number.isFinite(entry.projectileX) || !Number.isFinite(entry.projectileY))) {
      errors.push(`trace[${index}] projectile coordinates must accompany projectileId`);
    }
    if (entry.attackId && !entry.projectileId) errors.push(`trace[${index}] attackId requires projectileId`);
    if (entry.damageSourceId && !entry.attackId) errors.push(`trace[${index}] damageSourceId requires attackId`);
  });
  return errors;
}

export function validateBehaviorContractCoverage(
  contractIds: readonly string[],
  coverage: readonly BehaviorContractCoverage[],
): readonly string[] {
  const errors: string[] = [];
  const expected = new Set(contractIds);
  const seen = new Set<string>();
  for (const entry of coverage) {
    if (seen.has(entry.contractId)) errors.push(`duplicate coverage entry: ${entry.contractId}`);
    seen.add(entry.contractId);
    if (!expected.has(entry.contractId)) errors.push(`coverage contains undeclared contract: ${entry.contractId}`);
    if (entry.expectedFields.length === 0) errors.push(`${entry.contractId} has no expected field`);
    if (entry.scenarioIds.length === 0) errors.push(`${entry.contractId} has no scenario`);
    if (entry.actualTraceFields.length === 0) errors.push(`${entry.contractId} has no actual field`);
    if (entry.assertions.length === 0) errors.push(`${entry.contractId} has no assertion`);
  }
  for (const contractId of contractIds) {
    if (!seen.has(contractId)) errors.push(`missing coverage entry: ${contractId}`);
  }
  return errors;
}

export function verifyRangeAttackDamageChain(
  expected: RangeAttackChainExpected,
  trace: readonly BehaviorRuntimeTraceFrame[],
): readonly BehaviorVerificationIssue[] {
  const issues: BehaviorVerificationIssue[] = validateBehaviorRuntimeTrace(trace).map((message) => ({
    code: 'TRACE_SCHEMA',
    contractId: expected.contractId,
    message,
  }));
  if (issues.length > 0) return issues;

  const first = trace[0]!;
  if (first.distance <= expected.attackRange) {
    issues.push({
      code: 'INITIAL_PRECONDITION',
      contractId: expected.contractId,
      message: `initial distance ${first.distance.toFixed(2)} must exceed attackRange ${expected.attackRange}`,
      frame: first.frame,
    });
  }

  const outside = trace.filter(({ distance }) => distance > expected.attackRange);
  for (const entry of outside) {
    if (entry.action || entry.projectileId || entry.attackId || entry.damageSourceId) {
      issues.push({
        code: 'EARLY_ATTACK',
        contractId: expected.contractId,
        message: `attack evidence appeared at distance ${entry.distance.toFixed(2)} > ${expected.attackRange}`,
        frame: entry.frame,
      });
      break;
    }
  }

  if (outside.length > 1) {
    const madeProgress = outside.slice(1).some((entry, index) => entry.distance < outside[index]!.distance - 0.01);
    if (!madeProgress) {
      issues.push({
        code: 'NO_CHASE',
        contractId: expected.contractId,
        message: 'pet-target distance never decreased while outside attackRange',
      });
    }
  }

  const firstInRange = trace.findIndex(({ distance }) => distance <= expected.attackRange);
  if (firstInRange < 0) {
    issues.push({
      code: 'NO_IN_RANGE',
      contractId: expected.contractId,
      message: `pet never entered attackRange ${expected.attackRange}`,
    });
    return issues;
  }

  const attack = trace.slice(firstInRange).find((entry) => entry.action === 'basic-attack' && entry.projectileId);
  if (!attack) {
    issues.push({ code: 'NO_ATTACK', contractId: expected.contractId, message: 'no in-range basic attack projectile' });
    return issues;
  }

  const hit = trace.slice(firstInRange).find((entry) => entry.attackId && entry.damageSourceId);
  if (!hit) {
    issues.push({ code: 'NO_HIT', contractId: expected.contractId, message: 'no projectile hit event linked to damage' });
    return issues;
  }
  if ((hit.projectileElapsedMs ?? -1) < expected.minimumHitElapsedMs) {
    issues.push({
      code: 'EARLY_HIT',
      contractId: expected.contractId,
      message: `hit at ${hit.projectileElapsedMs ?? 'missing'}ms before ${expected.minimumHitElapsedMs.toFixed(2)}ms`,
      frame: hit.frame,
    });
  }
  if (hit.damageSourceId !== expected.petSourceId || hit.targetId !== expected.targetId) {
    issues.push({
      code: 'WRONG_DAMAGE_SOURCE',
      contractId: expected.contractId,
      message: `damage source ${hit.damageSourceId ?? 'missing'} -> ${hit.targetId} does not match ${expected.petSourceId} -> ${expected.targetId}`,
      frame: hit.frame,
    });
  }
  if (hit.targetHpAfter >= hit.targetHpBefore) {
    issues.push({
      code: 'NO_DAMAGE',
      contractId: expected.contractId,
      message: `target HP did not decrease (${hit.targetHpBefore} -> ${hit.targetHpAfter})`,
      frame: hit.frame,
    });
  }
  if (!trace.slice(trace.indexOf(hit)).some(({ cleanupReason }) => cleanupReason === 'hit')) {
    issues.push({ code: 'NO_CLEANUP', contractId: expected.contractId, message: 'hit projectile was not cleaned up' });
  }
  return issues;
}

export function formatBehaviorVerificationIssues(
  issues: readonly BehaviorVerificationIssue[],
): string {
  return issues.map((issue) => (
    `[${issue.code}] ${issue.contractId}${issue.frame === undefined ? '' : ` frame=${issue.frame}`}: ${issue.message}`
  )).join('\n');
}
