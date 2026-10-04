/** Finite natural-selection contract from TASK-SETTINGS-250. Host owns position,
 * action and target; this state only adds the original world count/CD. */
export type Monster3Selection = { count: number; cooldown: number; hostFps: number; rate: number };
export type Monster3DecisionTarget = Readonly<{ x: number; y: number; dead: boolean }>;
export type Monster3DecisionHost = {
  x: number; y: number; hp: number; state: string; facingX: -1 | 1; attackSerial: number;
};

export function createMonster3Selection(hostFps: number, boss: boolean, difficulty: number): Monster3Selection {
  if (!(hostFps > 0) || ![0, 1, 2].includes(difficulty)) throw new Error('Unverified Monster3 selection configuration');
  return { count: 0, cooldown: hostFps * 2, hostFps,
    rate: difficulty === 1 ? 0.85 : difficulty === 2 ? 0.89 : boss ? 0.423 : 0.366 };
}

/** Called after body and effects, even while busy/frozen/dead; ready objects
 * skip CD. The owner handles normalWalk→selectTarget when target is absent. */
export function stepMonster3Selection(state: Monster3Selection, host: Monster3DecisionHost,
  target: Monster3DecisionTarget | undefined, frozen: boolean, ready: boolean, random: () => number): void {
  state.count = state.count > state.hostFps * 10 ? 0 : state.count + 1;
  if (host.hp > 0 && !frozen && !['hurt', 'hurt_1', 'hurt_2', 'hurt_3', 'afterHurt', 'dead', 'hit1', 'hit2', 'hit3'].includes(host.state)
    && target && !target.dead) {
    random(); // Original unused ceil(random * 4) is observable stream consumption.
    const dx = target.x - host.x;
    if (state.cooldown === 0 && Math.hypot(dx, target.y - host.y) < 200) {
      host.state = 'hit2'; host.attackSerial++; state.cooldown = state.hostFps * 4;
    } else if (state.count % state.hostFps === 0) {
      if (Math.abs(dx) <= 150) {
        if (random() <= state.rate) {
          host.state = 'hit1'; host.attackSerial++; host.facingX = dx > 0 ? 1 : -1;
        } else host.state = 'wait';
      } else { host.state = 'walk'; host.facingX = dx > 0 ? 1 : -1; }
    }
  }
  if (!ready) state.cooldown = Math.max(0, state.cooldown - 1);
}
