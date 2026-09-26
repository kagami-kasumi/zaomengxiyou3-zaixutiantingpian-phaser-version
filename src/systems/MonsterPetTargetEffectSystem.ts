import type { Stage1CombatEnemy } from './Stage1CombatSystem';
import { PetTargetEffects } from './PetTargetEffects';
import type { PetTargetEffectInput } from './PetTargetEffectPayload';
import { DefaultGlobalSettings } from './GlobalSettingsSystem';

export type MonsterPetTargetEffectState = {
  effects: PetTargetEffects; pendingTicks: number; fireVisible: boolean; iceVisible: boolean;
  bodyClockStarted: boolean; pendingBodyTicks: number;
  displaySerial: number; fireDisplayId: number; iceDisplayId: number;
};

export function initializeMonsterPetTargetEffects(enemy: Stage1CombatEnemy): MonsterPetTargetEffectState {
  if (enemy.petTargetEffectState) return enemy.petTargetEffectState;
  const state = createMonsterPetTargetEffectState(hurt => {
    // BaseMonster.reduceHp(int, false): no defense, hurt reaction, knockback or attacker change.
    if (enemy.hp <= 0 || enemy.phase === 'dead') return;
    enemy.hp = Math.max(0, enemy.hp - (hurt | 0));
    if (enemy.hp === 0) {
      enemy.phase = 'dead'; enemy.phaseRemainingMs = 0; enemy.activeAttack = undefined;
    }
  });
  enemy.petTargetEffectState = state;
  return state;
}

/** Both existing monster representations provide their own HP/death sink. */
export function createMonsterPetTargetEffectState(reduceHp: (hurt: number) => void): MonsterPetTargetEffectState {
  const state: MonsterPetTargetEffectState = {
    pendingTicks: 0, fireVisible: false, iceVisible: false,
    bodyClockStarted: false, pendingBodyTicks: 0,
    displaySerial: 0, fireDisplayId: 0, iceDisplayId: 0,
    effects: new PetTargetEffects(DefaultGlobalSettings.frameRate, {
      show: name => {
        if (name === 'petmonkey_fire') {
          if (!state.fireVisible) state.fireDisplayId = ++state.displaySerial;
          state.fireVisible = true;
        } else {
          if (!state.iceVisible) state.iceDisplayId = ++state.displaySerial;
          state.iceVisible = true;
        }
      },
      hide: name => { if (name === 'petmonkey_fire') state.fireVisible = false; else state.iceVisible = false; },
      reduceHp,
    }),
  };
  return state;
}

export function addMonsterPetTargetEffects(enemy: Stage1CombatEnemy, effects: readonly PetTargetEffectInput[]): void {
  const state = initializeMonsterPetTargetEffects(enemy);
  for (const effect of effects) state.effects.add(effect);
}

/** Called after monster physics and before AI, including frames that hold recovery for visuals. */
export function stepMonsterPetTargetEffects(enemy: Stage1CombatEnemy, deltaMs: number,
  hostFps: number = DefaultGlobalSettings.frameRate): void {
  const state = initializeMonsterPetTargetEffects(enemy);
  advanceMonsterPetTargetEffects(state, deltaMs, hostFps);
}

export function advanceMonsterPetTargetEffects(state: MonsterPetTargetEffectState, deltaMs: number,
  hostFps: number = DefaultGlobalSettings.frameRate): void {
  state.bodyClockStarted = true;
  state.pendingTicks += Math.max(0, deltaMs) * hostFps / 1000;
  const ticks = Math.floor(state.pendingTicks + 1e-9);
  state.pendingTicks = Math.max(0, state.pendingTicks - ticks);
  for (let tick = 0; tick < ticks; tick++) {
    // BaseObject.step calls BBDC before BaseAddEffect: first show follows a body
    // step, and an expiry step still has a stopped body until continueFrame.
    if (!state.iceVisible) state.pendingBodyTicks++;
    state.effects.step(hostFps);
  }
}

/** Convert source host steps to the existing atlas model's tick unit, once per view update. */
export function consumeMonsterPetBodyDelta(state: MonsterPetTargetEffectState | undefined,
  visualTickMs: number, fallbackDeltaMs: number): number {
  if (!state?.bodyClockStarted) return fallbackDeltaMs;
  const ticks = state.pendingBodyTicks;
  state.pendingBodyTicks = 0;
  return ticks * visualTickMs;
}

export function isMonsterPetIceActive(enemy: Stage1CombatEnemy): boolean {
  return !!enemy.petTargetEffectState?.effects.snapshot('pethorse_ice');
}
