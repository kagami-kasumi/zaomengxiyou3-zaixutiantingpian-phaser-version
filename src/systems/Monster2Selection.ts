import { createMonsterAttackSelection, stepMonsterAttackSelection,
  type MonsterAttackSelection, type MonsterAttackDecisionHost, type MonsterAttackDecisionTarget } from './MonsterAttackSelection';

export type Monster2Selection = MonsterAttackSelection;
export type Monster2DecisionHost = MonsterAttackDecisionHost;
export type Monster2DecisionTarget = MonsterAttackDecisionTarget;
const rules = { initialCooldown: 1, resetCooldown: 5, skillRange: 500, normalRange: 250 };

export function createMonster2Selection(hostFps: number, boss: boolean, difficulty: number): Monster2Selection {
  return createMonsterAttackSelection(hostFps, boss, difficulty, rules);
}

export function stepMonster2Selection(state: Monster2Selection, host: Monster2DecisionHost,
  target: Monster2DecisionTarget | undefined, frozen: boolean, ready: boolean, random: () => number): void {
  stepMonsterAttackSelection(state, host, target, frozen, ready, random, rules);
}
