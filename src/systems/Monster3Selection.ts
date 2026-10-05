import { createMonsterAttackSelection, stepMonsterAttackSelection,
  type MonsterAttackSelection, type MonsterAttackDecisionHost, type MonsterAttackDecisionTarget } from './MonsterAttackSelection';

export type Monster3Selection = MonsterAttackSelection;
export type Monster3DecisionHost = MonsterAttackDecisionHost;
export type Monster3DecisionTarget = MonsterAttackDecisionTarget;
const rules = { initialCooldown: 2, resetCooldown: 4, skillRange: 200, normalRange: 150 };

export function createMonster3Selection(hostFps: number, boss: boolean, difficulty: number): Monster3Selection {
  return createMonsterAttackSelection(hostFps, boss, difficulty, rules);
}

export function stepMonster3Selection(state: Monster3Selection, host: Monster3DecisionHost,
  target: Monster3DecisionTarget | undefined, frozen: boolean, ready: boolean, random: () => number): void {
  stepMonsterAttackSelection(state, host, target, frozen, ready, random, rules);
}
