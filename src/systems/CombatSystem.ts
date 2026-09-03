export type AttackKind = 'physics' | 'magic';

export type DamageEvent = {
  sourceId: string;
  targetId: string;
  attackId: string;
  actionName: string;
  amount: number;
  attackKind: AttackKind;
  knockbackX: number;
  knockbackY: number;
  occurredAtMs: number;
  critical: boolean;
};

export type HitRegistry = {
  resolvedHitIds: Set<string>;
};

export function createHitRegistry(): HitRegistry {
  return {
    resolvedHitIds: new Set<string>(),
  };
}

export function resolveHitOnce(
  registry: HitRegistry,
  attackId: string,
  targetId: string,
): boolean {
  const hitId = `${attackId}->${targetId}`;

  if (registry.resolvedHitIds.has(hitId)) {
    return false;
  }

  registry.resolvedHitIds.add(hitId);
  return true;
}

export function createDamageEvent(
  params: Omit<DamageEvent, 'critical'> & Partial<Pick<DamageEvent, 'critical'>>,
): DamageEvent {
  return { ...params, critical: params.critical ?? false };
}

export function formatDamageEvent(event: DamageEvent | undefined): string {
  if (!event) {
    return 'none';
  }

  return [
    `${event.sourceId}->${event.targetId}`,
    event.actionName,
    `${event.attackKind}:${event.amount}`,
  ].join(' | ');
}
