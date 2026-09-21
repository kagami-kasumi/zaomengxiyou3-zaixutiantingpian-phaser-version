import type { HeroCombatModel } from './HeroCombatSystem';
import type { PetState } from './PetTypes';
import type { DamageEvent } from './CombatSystem';

/** BaseAddEffect's same-name entry. Each existing combat owner advances its own entry. */
export type PetTurtleLinkBuff = {
  runtimeKey: string;
  value: number;
  durationTicks: number;
  age: number;
  started: boolean;
  active: boolean;
  hostFps: number;
  pendingMs: number;
  peer?: () => PetTurtleLinkBuff | undefined;
  pet?: PetState;
  reduceHp?: (amount: number, event: DamageEvent, timeMs: number) => void;
};

export function refreshTurtleLink(previous: PetTurtleLinkBuff | undefined, pet: PetState,
  runtimeKey: string, value: number, durationTicks: number, hostFps: number): PetTurtleLinkBuff {
  if (previous?.active) {
    // Original add() updates time/startTime, but retains value and the display node.
    previous.durationTicks = durationTicks;
    previous.age = 0;
    return previous;
  }
  return { runtimeKey, pet, value, durationTicks, hostFps, age: 0,
    pendingMs: 0, started: false, active: true };
}

export function stepTurtleLink(buff: PetTurtleLinkBuff | undefined): void {
  if (!buff?.active) return;
  if (!buff.started) { buff.started = true; buff.age = 0; }
  if (buff.age >= buff.durationTicks) buff.active = false;
  buff.age++;
}

export function updateHeroTurtleLink(hero: HeroCombatModel, deltaMs: number): void {
  const buff = hero.turtleLink;
  if (!buff?.active) return;
  buff.pendingMs += Math.max(0, deltaMs);
  const stepMs = 1000 / buff.hostFps;
  while (buff.pendingMs + 1e-7 >= stepMs && buff.active) {
    buff.pendingMs = Math.max(0, buff.pendingMs - stepMs);
    stepTurtleLink(buff);
  }
}

export function isTurtleLinkPaired(buff: PetTurtleLinkBuff | undefined): buff is PetTurtleLinkBuff {
  return !!(buff?.active && buff.peer?.()?.active && buff.peer()?.peer?.() === buff);
}

/** Keep the hero's original display lifetime, release references to the departed session. */
export function detachTurtleLink(buff: PetTurtleLinkBuff | undefined): void {
  if (!buff) return;
  const peer = buff.peer?.();
  if (peer?.peer?.() === buff) {
    peer.peer = undefined;
    peer.reduceHp = undefined;
    peer.pet = undefined;
  }
  buff.active = false;
  buff.peer = undefined;
  buff.reduceHp = undefined;
  buff.pet = undefined;
}

export function redirectTurtleLinkDamage(hero: HeroCombatModel, amount: number, event: DamageEvent, timeMs: number): number {
  const buff = hero.turtleLink;
  if (!isTurtleLinkPaired(buff)) return amount;
  // BaseHero checks both buffs, not pet HP. The existing entity session settles damage.
  const damage = Math.ceil(amount * 0.05);
  buff.reduceHp?.(damage, event, timeMs);
  return Math.trunc(amount * 0.95);
}

/** Shared healing entry; applies BaseHero.cureHp's linked integer sequence.
 * Unlinked callers retain their existing fractional healing contract. */
export function applyHeroHealing(hero: HeroCombatModel, amount: number): number {
  if (hero.state === 'dead') return 0;
  let heal = Math.max(0, amount);
  const buff = hero.turtleLink;
  if (isTurtleLinkPaired(buff)) {
    heal = (((heal | 0) * 1.05) | 0);
    if (buff.pet && buff.pet.hp > 0) buff.pet.hp = Math.min(buff.pet.maxHp, buff.pet.hp + heal);
  }
  const before = hero.hp;
  hero.hp = Math.min(hero.maxHp, hero.hp + heal);
  return hero.hp - before;
}
