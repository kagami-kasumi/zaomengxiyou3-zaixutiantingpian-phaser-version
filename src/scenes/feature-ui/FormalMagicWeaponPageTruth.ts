import magicWeaponPageTruth from '../../../docs/reverse-engineering/ground-truth/manifests/task-settings-175b-magic-weapon-page.json';

export type MagicWeaponTruthBounds = Readonly<{
  left: number;
  top: number;
  width: number;
  height: number;
}>;

export const MagicWeaponPageTruthId = 'task-settings-175b.magic-weapon-page' as const;

export function assertVerifiedMagicWeaponPageTruth(): void {
  if (magicWeaponPageTruth.truthId !== MagicWeaponPageTruthId
    || magicWeaponPageTruth.status !== 'verified') {
    throw new Error(`${magicWeaponPageTruth.truthId} is not the verified magic-weapon-page truth.`);
  }
  if (magicWeaponPageTruth.displayObjects.length !== 28
    || magicWeaponPageTruth.states.length !== 21) {
    throw new Error(`${MagicWeaponPageTruthId} completeness drifted.`);
  }
  if (magicWeaponPageTruth.completeness.unresolved.length > 0) {
    throw new Error(`${MagicWeaponPageTruthId} contains unresolved evidence.`);
  }
}

export function getMagicWeaponTruthBounds(id: string): MagicWeaponTruthBounds {
  assertVerifiedMagicWeaponPageTruth();
  const object = magicWeaponPageTruth.displayObjects.find((candidate) => candidate.id === id);
  const bounds = object?.placements[0]?.stageBounds;
  if (!bounds) throw new Error(`${MagicWeaponPageTruthId} is missing ${id}.`);
  return bounds;
}

export function getMagicWeaponTruthCharacterId(id: string): number | undefined {
  assertVerifiedMagicWeaponPageTruth();
  const characterId = magicWeaponPageTruth.displayObjects.find((candidate) => candidate.id === id)
    ?.sourceIdentity.characterId;
  return typeof characterId === 'number' ? characterId : undefined;
}

export function getMagicWeaponTruthStateIds(): readonly string[] {
  assertVerifiedMagicWeaponPageTruth();
  return magicWeaponPageTruth.states.map((state) => state.id);
}
