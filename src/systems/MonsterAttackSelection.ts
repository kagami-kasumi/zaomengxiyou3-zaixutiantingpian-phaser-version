/** Shared BaseMonster decision order, verified separately for Monster2/3. Host owns position,
 * action and target; this state only adds the original world count/CD. */
export type MonsterAttackSelection = { count: number; cooldown: number; hostFps: number; rate: number };
export type MonsterAttackDecisionTarget = Readonly<{ x: number; y: number; dead: boolean }>;
export type MonsterAttackDecisionHost = {
  x: number; y: number; hp: number; state: string; facingX: -1 | 1; attackSerial: number;
};

export type MonsterAttackSelectionRules = Readonly<{ initialCooldown: number; resetCooldown: number; skillRange: number; normalRange: number }>;

export function createMonsterAttackSelection(hostFps: number, boss: boolean, difficulty: number, rules: MonsterAttackSelectionRules): MonsterAttackSelection {
  if (!(hostFps > 0) || ![0, 1, 2].includes(difficulty)) throw new Error('Unverified monster selection configuration');
  return { count: 0, cooldown: hostFps * rules.initialCooldown, hostFps,
    rate: difficulty === 1 ? 0.85 : difficulty === 2 ? 0.89 : boss ? 0.423 : 0.366 };
}

/** Called after body and effects, even while busy/frozen/dead; ready objects
 * skip CD. The owner handles normalWalk→selectTarget when target is absent. */
export function stepMonsterAttackSelection(state: MonsterAttackSelection, host: MonsterAttackDecisionHost,
  target: MonsterAttackDecisionTarget | undefined, frozen: boolean, ready: boolean, random: () => number, rules: MonsterAttackSelectionRules): void {
  state.count = state.count > state.hostFps * 10 ? 0 : state.count + 1;
  if (host.hp > 0 && !frozen && !['hurt', 'hurt_1', 'hurt_2', 'hurt_3', 'afterHurt', 'dead', 'hit1', 'hit2', 'hit3'].includes(host.state)
    && target && !target.dead) {
    random(); // Original unused ceil(random * 4) is observable stream consumption.
    const dx = target.x - host.x;
    if (state.cooldown === 0 && Math.hypot(dx, target.y - host.y) < rules.skillRange) {
      host.state = 'hit2'; host.attackSerial++; state.cooldown = state.hostFps * rules.resetCooldown;
    } else if (state.count % state.hostFps === 0) {
      if (Math.abs(dx) <= rules.normalRange) {
        if (random() <= state.rate) {
          host.state = 'hit1'; host.attackSerial++; host.facingX = dx > 0 ? 1 : -1;
        } else host.state = 'wait';
      } else { host.state = 'walk'; host.facingX = dx > 0 ? 1 : -1; }
    }
  }
  if (!ready) state.cooldown = Math.max(0, state.cooldown - 1);
}
