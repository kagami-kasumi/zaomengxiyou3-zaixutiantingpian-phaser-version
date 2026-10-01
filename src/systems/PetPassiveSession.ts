import type { PetState } from './PetTypes';
import type { HeroPetBuffName } from './HeroPetBuffSystem';

export const petAutoBuffNames = ['sxkb', 'fsnl', 'smjc', 'mfjc', 'gjjc', 'fyjc'] as const;
type Name = typeof petAutoBuffNames[number];
type Effect = { name: Name; value: number; time: number; isFirst: boolean; startTime?: number };

/** Instance-owned BasePet counters. No persistent roster fields or independent clock. */
export class PetPassiveSession {
  private attached = true;
  private tCount = 0;
  private hpRecovery = 0;
  private mpRecovery = 0;
  private count = 0;
  private counters = [300, 300, 300, 300, 300, 300];
  private effects: Array<Effect | null> = [];

  recover(pet: PetState, fps: number): boolean {
    if (this.tCount++ < fps) return false;
    this.tCount = 0;
    if (pet.hp > 0) pet.hp = Math.min(pet.maxHp, pet.hp + this.hpRecovery);
    pet.mp = Math.min(pet.maxMp, pet.mp + this.mpRecovery);
    return true;
  }

  check(pet: PetState, fps: number, ownerAdd?: (name: HeroPetBuffName, value: number, ticks: number) => void): void {
    this.counters = this.counters.map(value => Math.max(0, value - 1));
    const technique = readPetAptitude(pet.technique), warpower = readPetAptitude(pet.warpower);
    const values = [pet.form * 0.07 * technique * 0.27 * 1.05,
      ...[30, 70, 70, 6, 5].map(factor => pet.form * factor * technique * 1.05)];
    const time = (((30 + pet.form * 5) * warpower / 2 * 0.6) >>> 0) * fps;
    petAutoBuffNames.forEach((name, index) => {
      if (this.counters[index] !== 0 || !pet.skills.includes(name) || pet.mp < 20) return;
      if (this.attached) {
        if (name === 'sxkb' || name === 'fsnl') this.add(name, values[index]!, time);
        else ownerAdd?.(name, values[index]!, time);
      }
      pet.mp -= 20;
      this.counters[index] = index === 0 ? 4320 : 5400;
    });
  }

  refresh(pet: PetState): void {
    const quotient = (pet.level / 5) | 0;
    this.hpRecovery = quotient * 3;
    this.mpRecovery = quotient;
  }

  add(name: Name, value: number, time: number): void {
    const old = this.effects.find(effect => effect?.name === name);
    if (old) { old.time = time; old.startTime = this.count; }
    else this.effects.push({ name, value, time, isFirst: true });
  }

  stepEffects(): void {
    this.effects.forEach((effect, index) => {
      if (!effect) return;
      if (effect.isFirst) { effect.isFirst = false; effect.startTime = this.count; }
      if (this.count - effect.startTime! >= effect.time) this.effects[index] = null;
    });
    this.count++;
  }

  bonuses(): Readonly<{ crit: number; magic: number }> {
    return { crit: this.effects.find(effect => effect?.name === 'sxkb')?.value ?? 0,
      magic: (this.effects.find(effect => effect?.name === 'fsnl')?.value ?? 0) >>> 0 };
  }

  snapshot() {
    return { tCount: this.tCount, ehp: this.hpRecovery, emp: this.mpRecovery,
      counts: [...this.counters], pet: this.effects.map(effect => effect ? { ...effect } : null) };
  }

  destroy(): void { this.effects = []; this.count = 0; this.attached = false; }
}

/** Raw current PetInfo getter semantics, including externally loaded fractional values. */
export function readPetAptitude(value: number): number { return value > 8 ? 4 : value | 0; }
