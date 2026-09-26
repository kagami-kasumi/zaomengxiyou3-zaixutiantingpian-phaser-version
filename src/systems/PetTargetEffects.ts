export type PetTargetEffectName = 'petmonkey_fire' | 'pethorse_ice';
export type PetTargetEffect = { name: PetTargetEffectName; time: number; hurt?: number;
  startTime?: number; isFirst: boolean };

/** The victim's BaseAddEffect clock. Its caller supplies one original host step. */
export class PetTargetEffects {
  private count = 0;
  private effects: (PetTargetEffect | undefined)[] = [];
  private attached = true;

  constructor(private readonly frameClips: number, private readonly port: Readonly<{
    show: (name: PetTargetEffectName) => void;
    hide: (name: PetTargetEffectName) => void;
    reduceHp: (hurt: number) => void;
  }>) {}

  add(input: Readonly<{ name: PetTargetEffectName; time: number; hurt?: number }>): void {
    if (!this.attached) throw new Error('Cannot add an effect to a detached victim');
    const current = this.effects.find(effect => effect?.name === input.name);
    if (current) {
      current.time = input.time;
      current.startTime = this.count;
      // Source refresh preserves both the first damage seed and isFirst.
    } else this.effects.push({ ...input, isFirst: true });
  }

  step(frameClips = this.frameClips): void {
    for (let index = 0; index < this.effects.length; index++) {
      const effect = this.effects[index];
      if (!effect || !this.attached) continue;
      if (effect.isFirst) {
        effect.startTime = this.count; effect.isFirst = false;
        this.port.show(effect.name);
      }
      if (this.count - effect.startTime! >= effect.time) this.remove(index);
      // remove nulls the array slot; the selected item still executes this tick.
      if (effect.name === 'petmonkey_fire' && this.count % frameClips === 0) {
        this.port.reduceHp(effect.hurt!);
      }
    }
    this.count++;
  }

  cancel(): void {
    for (let index = 0; index < this.effects.length; index++) {
      if (this.effects[index]) this.remove(index);
    }
  }

  destroy(): void {
    this.effects = []; this.count = 0; this.attached = false;
    // Original destroy does not hide either of these two displays. World removal owns them.
  }

  snapshot(name: PetTargetEffectName): Readonly<PetTargetEffect> | undefined {
    const effect = this.effects.find(effect => effect?.name === name);
    return effect ? { ...effect } : undefined;
  }

  private remove(index: number): void {
    const effect = this.effects[index]!;
    this.effects[index] = undefined;
    this.port.hide(effect.name);
  }
}
