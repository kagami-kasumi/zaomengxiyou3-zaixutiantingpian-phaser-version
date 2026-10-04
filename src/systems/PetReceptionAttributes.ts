import type { PetReceptionAttributes, PetSkillRandomSource, PetState } from './PetTypes';

/** PetInfo constructor values, including newly captured high-level pets (252). */
export function createPetReceptionAttributes(): Required<Omit<PetReceptionAttributes, 'receptionBaselineFields'>> {
  return { missRate: 0, magicDefenseRate: 0, receptionAttributeSource: 'known' };
}

/** Call once per actual level gained, after the new level is assigned (252). */
export function growPetReceptionAttributes(pet: PetState, random: PetSkillRandomSource): void {
  if (pet.level < 60) return;
  const missIncrement = 0.01 * Math.floor(random() * 2);
  const magicDefenseIncrement = 0.01 + 0.01 * Math.floor(random() * 1);
  // PetInfo next grows crit with this draw. It is not modern critBonusRate.
  random();
  if (typeof pet.missRate === 'number' && Number.isFinite(pet.missRate)) {
    pet.missRate += missIncrement;
  }
  if (typeof pet.magicDefenseRate === 'number' && Number.isFinite(pet.magicDefenseRate)) {
    pet.magicDefenseRate += magicDefenseIncrement;
  }
  // Unknown historical totals stay unknown; this is not a legacy migration.
}

/** Original upper bounds apply only on load. Missing/invalid history stays absent. */
export function restorePetReceptionAttributes(saved: {
  missRate?: unknown;
  magicDefenseRate?: unknown;
  receptionAttributeSource?: unknown;
  receptionBaselineFields?: unknown;
}): PetReceptionAttributes {
  const missRate = readRate(saved.missRate, 0.48);
  const magicDefenseRate = readRate(saved.magicDefenseRate, 0.36);
  return {
    ...(missRate === undefined ? {} : { missRate }),
    ...(magicDefenseRate === undefined ? {} : { magicDefenseRate }),
    ...(saved.receptionAttributeSource === 'legacy-missing-baseline'
      ? { receptionAttributeSource: 'legacy-missing-baseline' as const,
        receptionBaselineFields: (['missRate', 'magicDefenseRate'] as const)
          .filter(field => Array.isArray(saved.receptionBaselineFields) && saved.receptionBaselineFields.includes(field)) }
      : missRate !== undefined && magicDefenseRate !== undefined
        ? { receptionAttributeSource: 'known' as const } : {}),
  };
}

function readRate(value: unknown, upperBound: number): number | undefined {
  // Modern malformed-data handling; AS3's NaN/partial-load failure is not copied.
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(value, upperBound) : undefined;
}
