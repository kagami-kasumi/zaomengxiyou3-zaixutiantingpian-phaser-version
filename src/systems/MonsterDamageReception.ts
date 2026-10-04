import type { AttackKind } from './CombatSystem';

/** Processed source properties, not a second monster or HP owner. */
export type MonsterDamageSource = {
  boss: boolean;
  hit: number;
  criticalPercent: number;
  magicDefenseReduction: number;
  flower: boolean;
  random: () => number;
};

export type MonsterDamageRequest = Readonly<{
  source: MonsterDamageSource;
  sourceId: string;
  attackId: string;
  actionName: string;
  power: number;
  attackKind: AttackKind;
  geometryHit: boolean;
  bingo: boolean;
  difficulty: number;
  timeMs: number;
  hostFps: number;
  knockbackX: number;
  knockbackY: number;
}>;

export type MonsterDamageReception = Readonly<{
  accepted: boolean;
  missed: boolean;
  /** AVM2 returnvoid at the pet Bingo branch must not register a bullet hit. */
  returnVoid: boolean;
  amount: number;
  hpBefore: number;
  hpAfter: number;
}>;

export type MonsterDamageTarget = Readonly<{
  kind: 'hero' | 'pet';
  protected: boolean;
  missRate: number;
  defense: number;
  magicDefenseRate: number;
  maxHp: number;
  rabbitDodgeRate?: number;
}>;

export function monsterSourceHit(source: MonsterDamageSource): number {
  if (source.flower) {
    source.hit = source.hit / 2 + (source.boss ? 3 : 0);
    return source.hit;
  }
  return source.hit + (source.boss ? 6 : 0);
}

export function monsterSourcePower(source: MonsterDamageSource, power: number, critical = true): number {
  const roll = source.random(); // getRealPower(false) still consumes this draw.
  const multiplier = critical && roll <= source.criticalPercent / 100 ? 2 : 1;
  return power * multiplier * (source.flower ? 0.925 : 1);
}

/** Receiver preparation has no HP writes, target ID registration or callbacks. */
export function prepareMonsterDamage(request: MonsterDamageRequest, target: MonsterDamageTarget):
  Pick<MonsterDamageReception, 'accepted' | 'missed' | 'returnVoid' | 'amount'> {
  if (target.protected || !request.geometryHit) {
    return { accepted: false, missed: false, returnVoid: false, amount: 0 };
  }
  const source = request.source;
  const rabbitMiss = target.rabbitDodgeRate !== undefined && source.random() < target.rabbitDodgeRate;
  const roll = source.random();
  const threshold = target.missRate - monsterSourceHit(source) / 100;
  const missed = (target.kind === 'hero' ? roll <= threshold : roll < threshold) || rabbitMiss;
  if (missed) return { accepted: true, missed: true, returnVoid: false, amount: 0 };
  if (request.bingo) {
    if (request.difficulty !== 2) throw new Error('Monster reception: Bingo outside verified difficulty-2 domain');
    return { accepted: target.kind === 'hero', missed: false, returnVoid: target.kind === 'pet', amount: target.maxHp * 99 };
  }
  if (target.kind === 'hero') source.random(); // BaseHero's unused random damage offset.
  const power = Math.trunc(monsterSourcePower(source, request.power));
  if (target.kind === 'pet') monsterSourcePower(source, request.power, false);
  let amount = Math.max(1, power - target.defense);
  if (request.attackKind === 'magic') {
    const defense = target.magicDefenseRate;
    if (target.kind === 'hero') {
      const reduced = defense - source.magicDefenseReduction;
      amount = reduced >= 1 ? 1 : Math.trunc(power * Math.min(1.1, 1 - reduced));
    } else amount = Math.trunc(power * (1 - (defense > 1 ? 0 : defense)));
  }
  return { accepted: true, missed: false, returnVoid: false, amount: Math.trunc(amount) };
}
