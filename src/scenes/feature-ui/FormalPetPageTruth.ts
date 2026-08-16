import petPageTruth from '../../../docs/reverse-engineering/ground-truth/manifests/task-settings-175a-pet-page.json';

export type PetTruthBounds = Readonly<{ left: number; top: number; width: number; height: number }>;

export const PetPageTruthId = 'task-settings-175a.pet-page' as const;

export function assertVerifiedPetPageTruth(): void {
  if (petPageTruth.truthId !== PetPageTruthId || petPageTruth.status !== 'verified') {
    throw new Error(`${petPageTruth.truthId} is not the verified pet-page truth.`);
  }
  if (petPageTruth.displayObjects.length !== 74 || petPageTruth.states.length !== 16) {
    throw new Error(`${PetPageTruthId} completeness drifted.`);
  }
  if (petPageTruth.completeness.unresolved.length > 0) {
    throw new Error(`${PetPageTruthId} contains unresolved evidence.`);
  }
}

export function getPetTruthBounds(id: string): PetTruthBounds {
  assertVerifiedPetPageTruth();
  const object = petPageTruth.displayObjects.find((candidate) => candidate.id === id);
  const bounds = object?.placements[0]?.stageBounds;
  if (!bounds) throw new Error(`${PetPageTruthId} is missing ${id}.`);
  return bounds;
}

export function getPetTruthCharacterId(id: string): number | undefined {
  assertVerifiedPetPageTruth();
  const characterId = petPageTruth.displayObjects.find((candidate) => candidate.id === id)
    ?.sourceIdentity.characterId;
  return typeof characterId === 'number' ? characterId : undefined;
}

export function getPetTruthStateIds(): readonly string[] {
  assertVerifiedPetPageTruth();
  return petPageTruth.states.map((state) => state.id);
}
