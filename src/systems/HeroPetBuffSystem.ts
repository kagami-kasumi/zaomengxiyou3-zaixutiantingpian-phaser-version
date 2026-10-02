import type { Stage1CombatPlayer } from './Stage1CombatSystem';
import type { PetPassiveVisualPort } from './PetPassiveSession';

export type HeroPetBuffName = 'smjc' | 'mfjc' | 'gjjc' | 'fyjc';
type Effect = { name: HeroPetBuffName; value: number; time: number; startTime: number; isFirst: boolean };
export type HeroPetBuffState = {
  count: number;
  effects: Array<Effect | null>;
  applied: Partial<Record<HeroPetBuffName, boolean>>;
};

export function createHeroPetBuffState(): HeroPetBuffState {
  return { count: 0, effects: [], applied: {} };
}

/** BaseAddEffect.add: same-name refresh retains the old value and first-step flag. */
export function addHeroPetBuff(player: Stage1CombatPlayer, name: HeroPetBuffName, value: number, time: number): void {
  if (player.combat.state === 'dead') return;
  if (!Number.isFinite(value) || !Number.isInteger(time) || time < 0) throw new Error('Invalid hero pet effect');
  const state = player.petBuffs;
  const old = state.effects.find(effect => effect?.name === name);
  if (old) {
    old.time = time;
    old.startTime = state.count;
  } else state.effects.push({ name, value, time, startTime: 0, isFirst: true });
}

/** Called once by the shared world host, before that owner's pet step. */
export function stepHeroPetBuffs(player: Stage1CombatPlayer, visual?: PetPassiveVisualPort): void {
  if (player.combat.state === 'dead') { clearHeroPetBuffs(player); return; }
  const state = player.petBuffs;
  for (let index = 0; index < state.effects.length; index++) {
    const effect = state.effects[index];
    if (!effect) continue;
    if (effect.isFirst) {
      effect.isFirst = false; effect.startTime = state.count;
      visual?.({ type: 'show', name: effect.name });
    }
    if (state.count - effect.startTime >= effect.time) state.effects[index] = null;
  }
  state.count++;
  // BaseRoleProperies reads the incremented effect count; removal occurs one
  // property phase before the next BaseAddEffect step nulls the array entry.
  for (const effect of state.effects) {
    if (!effect) continue;
    const timeLeft = effect.time - (state.count - effect.startTime);
    if (!state.applied[effect.name]) {
      changeAttribute(player, effect.name, effect.value);
      state.applied[effect.name] = true;
    }
    if (state.applied[effect.name] && timeLeft === 0) {
      changeAttribute(player, effect.name, -effect.value);
      state.applied[effect.name] = false;
    }
  }
}

export function clearHeroPetBuffs(player: Stage1CombatPlayer): void {
  const state = player.petBuffs;
  for (const effect of state.effects) {
    if (effect && state.applied[effect.name]) changeAttribute(player, effect.name, -effect.value);
  }
  state.effects.length = 0;
  state.applied = {};
  state.count = 0;
}

function changeAttribute(player: Stage1CombatPlayer, name: HeroPetBuffName, value: number): void {
  const stats = player.effectiveStats;
  if (name === 'smjc') {
    const ratio = player.combat.hp / player.combat.maxHp;
    player.combat.maxHp = (player.combat.maxHp + value) | 0;
    player.combat.hp = Math.max(0, (player.combat.hp + value * ratio) | 0);
    if (player.combat.maxHp > 0) player.combat.hp = Math.min(player.combat.hp, player.combat.maxHp);
    stats.maxHp = player.combat.maxHp;
  } else if (name === 'mfjc') {
    const ratio = player.skill.mp / player.skill.maxMp;
    player.skill.maxMp = (player.skill.maxMp + value) | 0;
    player.skill.mp = Math.max(0, (player.skill.mp + value * ratio) | 0);
    if (player.skill.maxMp > 0) player.skill.mp = Math.min(player.skill.mp, player.skill.maxMp);
    player.maxMp = stats.maxMp = player.skill.maxMp;
    player.mp = player.skill.mp;
  } else if (name === 'gjjc') stats.power = (stats.power + value) | 0;
  else stats.defense = (stats.defense + value) | 0;
}
