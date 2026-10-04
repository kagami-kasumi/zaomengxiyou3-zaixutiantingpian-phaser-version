import { advanceMonsterPetTargetEffects, type MonsterPetTargetEffectState } from './MonsterPetTargetEffectSystem';
import { stepMonster3AttackBody, stepMonster3ExistingAttacks, syncMonster3BodyState,
  type Monster3AttackRuntime, type Monster3AttackHost, type Monster3Attack, type Monster3ReceptionPair } from './Monster3AttackRuntime';
import { stepMonster3Selection, type Monster3Selection, type Monster3DecisionHost,
  type Monster3DecisionTarget } from './Monster3Selection';
import type { MonsterDamageSource } from './MonsterDamageReception';

/** Both Scene owners supply their current state/targets. The existing effect
 * accumulator remains the sole host clock; this adapter owns neither HP nor AI
 * target retention. Receivers run synchronously before this tick's body. */
export function stepMonster3World(params: Readonly<{
  runtime: Monster3AttackRuntime;
  host: Monster3AttackHost & Monster3DecisionHost;
  effects: MonsterPetTargetEffectState;
  selection: Monster3Selection;
  source: MonsterDamageSource;
  deltaMs: number;
  timeMs: number;
  difficulty: number;
  targets: (attack: Monster3Attack) => readonly Monster3ReceptionPair[];
  readDecisionTarget: () => Monster3DecisionTarget | undefined;
  ready: () => boolean;
  afterSelection: () => void;
}>): void {
  const { runtime, host, effects, selection, source } = params;
  if (runtime.destroyed) return;
  const stepMs = 1000 / selection.hostFps;
  // A fractional prior host tick belongs before this update's elapsed interval.
  let tickTime = params.timeMs - Math.max(0, params.deltaMs) - effects.pendingTicks * stepMs;
  advanceMonsterPetTargetEffects(effects, params.deltaMs, selection.hostFps, stopped => {
    tickTime += stepMs;
    stepMonster3ExistingAttacks(runtime, tickTime, selection.hostFps, params.difficulty, params.targets);
    const previousAction = runtime.body.action;
    stepMonster3AttackBody(runtime, host, stopped, source, tickTime, selection.hostFps, params.difficulty);
    if (host.state === previousAction && (previousAction === 'hit1' || previousAction === 'hit2' || previousAction === 'hurt')
      && runtime.body.action === 'wait') host.state = 'wait';
  }, () => {
    stepMonster3Selection(selection, host, params.readDecisionTarget(),
      !!effects.effects.snapshot('pethorse_ice'), params.ready(), source.random);
    params.afterSelection();
    syncMonster3BodyState(runtime, host);
  });
}
