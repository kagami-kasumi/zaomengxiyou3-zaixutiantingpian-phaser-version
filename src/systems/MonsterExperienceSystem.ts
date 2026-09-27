import type { PlayerSlot } from './InputSystem';

/** A retained runtime object, never a lookup of the owner's currently selected pet. */
export type MonsterAttackTarget = Readonly<{
  kind: 'hero' | 'pet';
  ownerSlot: PlayerSlot;
  runtimeId: string;
  petId?: string;
  position: () => Readonly<{ x: number; y: number }>;
  /** Existing movement adapters can use foot coordinates without changing source selection roots. */
  movementPosition?: () => Readonly<{ x: number; y: number }>;
  isDead: () => boolean;
  isReadyToDestroy: () => boolean;
  addExperience: (amount: number) => void;
  currentPet?: () => MonsterAttackTarget | undefined;
  onMonsterDefeated?: () => void;
}>;

export type MonsterExperienceBinding = {
  target?: MonsterAttackTarget;
  settled: boolean;
  experience: number;
  heroes: () => readonly MonsterAttackTarget[];
  persist: () => void;
  settlement?: Readonly<{ target: MonsterAttackTarget; heroExperience: number; petExperience: number }>;
};

export type MonsterExperienceHost = { experienceBinding?: MonsterExperienceBinding };

export function acceptMonsterAttackTarget(host: MonsterExperienceHost, target: MonsterAttackTarget | undefined): void {
  if (host.experienceBinding && !host.experienceBinding.settled) host.experienceBinding.target = target;
}

/** Called only after the existing hurt/debuff gates, before movement or attack decisions. */
export function selectMonsterAttackTarget(
  host: MonsterExperienceHost, x: number, y: number, alertRange: number,
): MonsterAttackTarget | undefined {
  const binding = host.experienceBinding;
  if (!binding || binding.settled) return undefined;
  if (binding.target) {
    if (binding.target.isDead()) binding.target = undefined;
    return binding.target;
  }
  const candidates = binding.heroes().filter(hero => !hero.isDead());
  const distances = candidates.map(hero => {
    const point = hero.position();
    return Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
  });
  // Native AUtils uses Array.sort(RETURNINDEXEDARRAY), without NUMERIC.
  let chosen = 0;
  for (let index = 1; index < candidates.length; index++) {
    if (String(distances[index]) < String(distances[chosen])) chosen = index;
  }
  if (candidates[chosen] && distances[chosen]! <= alertRange) binding.target = candidates[chosen];
  return binding.target;
}

/** World-step tail, including frozen/hurt frames; effects have already had their turn. */
export function clearUnavailableMonsterAttackTarget(host: MonsterExperienceHost): void {
  const binding = host.experienceBinding, target = binding?.target;
  if (binding && target && (target.isDead() || target.isReadyToDestroy())) binding.target = undefined;
}

/** Synchronous first death transition. A missing target is also a completed settlement. */
export function settleMonsterExperience(host: MonsterExperienceHost): void {
  const binding = host.experienceBinding;
  if (!binding || binding.settled) return;
  binding.settled = true;
  const target = binding.target;
  if (!target) return;
  const experience = binding.experience;
  if (target.kind === 'pet') {
    const amount = experience | 0;
    binding.settlement = { target, heroExperience: 0, petExperience: amount };
    target.addExperience(amount);
  } else if (target.currentPet?.()) {
    const amount = (experience * 0.6) | 0;
    binding.settlement = { target, heroExperience: amount, petExperience: amount };
    target.addExperience(amount);
    // The original reads getPet again after the hero setter and its callbacks.
    target.currentPet()?.addExperience(amount);
  } else {
    const amount = experience | 0;
    binding.settlement = { target, heroExperience: amount, petExperience: 0 };
    target.addExperience(amount);
  }
  if (target.kind === 'hero') target.onMonsterDefeated?.();
  binding.persist();
}
