import type { PetBehavior, PetBehaviorFactory } from './PetBehavior';

export type PetBehaviorRegistration = Readonly<{
  species: string;
  form: number;
  create: PetBehaviorFactory;
}>;

export class PetBehaviorRegistry {
  private readonly factories = new Map<string, PetBehaviorFactory>();

  constructor(registrations: readonly PetBehaviorRegistration[] = []) {
    registrations.forEach(({ species, form, create }) => {
      this.register(species, form, create);
    });
  }

  register(species: string, form: number, create: PetBehaviorFactory): this {
    const key = this.getKey(species, form);
    if (this.factories.has(key)) {
      throw new Error(`Duplicate pet behavior registration: ${key}`);
    }
    this.factories.set(key, create);
    return this;
  }

  resolve(species: string, form: number): PetBehavior {
    const key = this.getKey(species, form);
    const create = this.factories.get(key);
    if (!create) throw new Error(`Missing pet behavior registration: ${key}`);
    const behavior = create();
    if (!behavior) throw new Error(`Pet behavior factory returned no behavior: ${key}`);
    return behavior;
  }

  has(species: string, form: number): boolean {
    return this.factories.has(this.getKey(species, form));
  }

  keys(): readonly string[] {
    return Object.freeze([...this.factories.keys()]);
  }

  private getKey(species: string, form: number): string {
    const normalizedSpecies = species.trim();
    if (!normalizedSpecies) throw new Error('Pet behavior species must not be empty.');
    if (!Number.isSafeInteger(form) || form < 1) {
      throw new Error(`Pet behavior form must be a positive integer: ${form}`);
    }
    return `${normalizedSpecies}:${form}`;
  }
}
