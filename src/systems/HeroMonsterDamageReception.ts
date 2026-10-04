import { applyHeroDamage, type HeroCombatModel } from './HeroCombatSystem';
import { createDamageEvent } from './CombatSystem';
import { prepareMonsterDamage, type MonsterDamageRequest, type MonsterDamageReception } from './MonsterDamageReception';
import type { Stage1CombatPlayer } from './Stage1CombatSystem';

/** Read from the existing hero/skill/effective-stat owners at the time of reception. */
export type HeroMonsterReceptionInput = Readonly<{
  heroId: number;
  action: string;
  sdLevel: number;
  gxp: boolean;
  missRate: number;
  defense: number;
  magicDefenseRate: number;
  protected: boolean;
}>;

/** The caller supplies explicit effect gates; numeric stats and selected action
 * are read from the existing player each time, including after equipment changes.
 * This does not invent absent subactions (e.g. Role5 hit10_1) from elapsed time. */
export function readHeroMonsterReceptionInput(player: Stage1CombatPlayer,
  effects: Readonly<{ gxp: boolean; protected: boolean }>): HeroMonsterReceptionInput {
  return { heroId: player.normalAttack.heroId,
    action: player.combat.state === 'hurt' ? 'hurt' : player.combat.state === 'dead' ? 'dead'
      : player.skill.activeAction?.actionName ?? player.normalAttack.activeAttack?.actionName ?? 'wait',
    sdLevel: player.skill.role3Runtime.sdLevel,
    gxp: effects.gxp, protected: effects.protected,
    missRate: player.effectiveStats.missPercent / 100,
    defense: player.effectiveStats.defense,
    magicDefenseRate: player.effectiveStats.magicDefensePercent / 100 };
}

export function receiveHeroMonsterDamage(hero: HeroCombatModel, input: HeroMonsterReceptionInput,
  request: MonsterDamageRequest, redirectDamage?: (amount: number) => number): MonsterDamageReception {
  const hpBefore = hero.hp;
  const prepared = prepareMonsterDamage(request, { kind: 'hero',
    protected: input.protected || hero.state === 'dead' || request.timeMs < hero.invulnerableUntilMs || !!hero.magicInvulnerability,
    missRate: input.missRate, defense: input.defense, magicDefenseRate: input.magicDefenseRate, maxHp: hero.maxHp });
  if (!prepared.accepted) return { ...prepared, hpBefore, hpAfter: hero.hp };
  if (!prepared.missed) {
    const role3 = input.heroId === 3;
    const role5Guard = input.heroId === 5 && (input.action === 'hit10_1' || input.action === 'hit10_2');
    const reduction = role3 ? (input.action === 'hit12' ? Math.min(input.sdLevel, 8) * 0.01 : 0) + (input.gxp ? 0.125 : 0) : 0;
    const reactsToHit = !(role5Guard || (input.action === 'hit12' && (role3 || input.heroId === 4))
      || (input.gxp && [1, 4, 5].includes(input.heroId))
      || (hero.magicShield?.kind === 'role2Tjgl' && [2, 4].includes(input.heroId)
        && hero.magicShield.remainingAmount > prepared.amount));
    applyHeroDamage(hero, createDamageEvent({ sourceId: request.sourceId, targetId: hero.id,
      attackId: request.attackId, actionName: request.actionName, attackKind: request.attackKind,
      amount: prepared.amount, occurredAtMs: request.timeMs,
      knockbackX: request.knockbackX, knockbackY: request.knockbackY }), request.timeMs, redirectDamage, {
      reduce: amount => Math.trunc(Math.trunc(amount) * (role5Guard ? 0.75 : 1 - reduction)),
      reactsToHit, protectionMs: 0,
    });
    if (request.bingo) hero.invulnerableUntilMs = request.timeMs + 1000;
  }
  // Bingo's early return does not append a receiver-side ID (the bullet still does).
  if (!request.bingo || prepared.missed) (hero.monsterHitIds ??= []).push(request.attackId);
  return { ...prepared, hpBefore, hpAfter: hero.hp };
}
