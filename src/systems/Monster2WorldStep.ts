import { advanceMonsterPetTargetEffects, type MonsterPetTargetEffectState } from './MonsterPetTargetEffectSystem';
import { stepMonster2AttackBody, stepMonster2ExistingAttacks, syncMonster2BodyState,
  type Monster2AttackRuntime, type Monster2AttackHost, type Monster2Attack, type Monster2ReceptionPair, type Monster2RawSpawn } from './Monster2AttackRuntime';
import { stepMonster2Selection, type Monster2Selection, type Monster2DecisionHost,
  type Monster2DecisionTarget } from './Monster2Selection';
import type { MonsterDamageSource } from './MonsterDamageReception';

/** The existing combat owner supplies their current state/targets. The existing effect
 * accumulator remains the sole host clock; this adapter owns neither HP nor AI
 * target retention. Receivers run synchronously before this tick's body. */
export function stepMonster2World(params: Readonly<{
  runtime: Monster2AttackRuntime;
  host: Monster2AttackHost & Monster2DecisionHost;
  effects: MonsterPetTargetEffectState;
  selection: Monster2Selection;
  source: MonsterDamageSource;
  deltaMs: number;
  timeMs: number;
  difficulty: number;
  registeredAttacksPaused?: boolean;
  targets: (attack: Monster2Attack) => readonly Monster2ReceptionPair[];
  readDecisionTarget: () => Monster2DecisionTarget | undefined;
  ready: () => boolean;
  afterSelection: () => void;
  emitRaw: (spawn: Monster2RawSpawn) => void;
  gather: (point: Readonly<{ x: number; y: number }>) => void;
}>): void {
  const { runtime, host, effects, selection, source } = params;
  if (runtime.destroyed) return;
  const stepMs = 1000 / selection.hostFps;
  // A fractional prior host tick belongs before this update's elapsed interval.
  let tickTime = params.timeMs - Math.max(0, params.deltaMs) - effects.pendingTicks * stepMs;
  advanceMonsterPetTargetEffects(effects, params.deltaMs, selection.hostFps, stopped => {
    tickTime += stepMs;
    if (!params.registeredAttacksPaused) stepMonster2ExistingAttacks(runtime, tickTime, selection.hostFps,
      params.difficulty, params.targets, host.state === 'hurt');
    const previousAction = runtime.body.action;
    stepMonster2AttackBody(runtime, host, stopped, source, tickTime, selection.hostFps, params.difficulty, params.emitRaw, params.gather);
    if (host.state === previousAction && (previousAction === 'hit1' || previousAction === 'hit2' || previousAction === 'hurt')
      && runtime.body.action === 'wait') host.state = 'wait';
  }, () => {
    stepMonster2Selection(selection, host, params.readDecisionTarget(),
      !!effects.effects.snapshot('pethorse_ice'), params.ready(), source.random);
    params.afterSelection();
    syncMonster2BodyState(runtime, host);
  });
}
