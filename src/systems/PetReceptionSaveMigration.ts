import type { SaveStorage } from './SaveSystem';

/** Modern compatibility policy A, selected by the user on 2026-10-03. */
export function migratePetReceptionSave(raw: string): { raw: string; changed: boolean } {
  // The save owner validates the schema before invoking this bounded migration.
  const value = JSON.parse(raw);
  let changed = false;
  for (const player of [value.player1, value.player2]) {
    for (const pet of player.pets) {
      if (!pet || typeof pet !== 'object' || Array.isArray(pet)) continue;
      const missing = (['missRate', 'magicDefenseRate'] as const)
        .filter(field => typeof pet[field] !== 'number' || !Number.isFinite(pet[field]));
      if (missing.length === 0) continue;
      const previous = pet.receptionAttributeSource === 'legacy-missing-baseline' && Array.isArray(pet.receptionBaselineFields)
        ? pet.receptionBaselineFields.filter((field: unknown) => field === 'missRate' || field === 'magicDefenseRate') : [];
      for (const field of missing) pet[field] = 0;
      pet.receptionAttributeSource = 'legacy-missing-baseline';
      pet.receptionBaselineFields = [...new Set([...previous, ...missing])];
      changed = true;
    }
  }
  return { raw: changed ? JSON.stringify(value) : raw, changed };
}

/** Exact original bytes; slot reuse never overwrites an earlier migration backup. */
export function backupPetReceptionSave(storage: SaveStorage, storageKey: string, raw: string): string {
  const prefix = `${storageKey}.pet-reception-baseline-v1.backup`;
  for (let index = 0; ; index++) {
    const key = index === 0 ? prefix : `${prefix}.${index}`;
    const previous = storage.getItem(key);
    if (previous === raw) return key;
    if (previous !== null) continue;
    storage.setItem(key, raw);
    if (storage.getItem(key) !== raw) throw new Error('Pet reception migration backup could not be verified');
    return key;
  }
}
