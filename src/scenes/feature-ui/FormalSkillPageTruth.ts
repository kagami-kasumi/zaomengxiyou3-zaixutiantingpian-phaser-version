import skillPagesTruth from '../../../docs/reverse-engineering/ground-truth/manifests/task-settings-175d-skill-pages.json';

export type SkillTruthBounds = Readonly<{
  left: number;
  top: number;
  width: number;
  height: number;
}>;

type TruthObject = (typeof skillPagesTruth.displayObjects)[number];

export const SkillPagesTruthId = 'task-settings-175d.skill-pages' as const;

export function assertVerifiedSkillPagesTruth(): void {
  if (skillPagesTruth.truthId !== SkillPagesTruthId || skillPagesTruth.status !== 'verified') {
    throw new Error(`${skillPagesTruth.truthId} is not the verified skill-pages truth.`);
  }
  if (skillPagesTruth.displayObjects.length !== 250 || skillPagesTruth.states.length !== 32) {
    throw new Error(`${SkillPagesTruthId} completeness drifted.`);
  }
  if (!skillPagesTruth.completeness.displayListMatched
    || !skillPagesTruth.completeness.stateSetMatched
    || skillPagesTruth.completeness.unresolved.length > 0) {
    throw new Error(`${SkillPagesTruthId} contains unresolved or unmatched evidence.`);
  }
}

export function getSkillTruthBounds(id: string): SkillTruthBounds {
  return visibleBounds(findObject(id));
}

export function getSkillTruthCharacterId(id: string): number {
  const characterId = findObject(id).sourceIdentity.characterId;
  if (typeof characterId !== 'number') throw new Error(`${SkillPagesTruthId} ${id} has no character id.`);
  return characterId;
}

export function getSkillTruthFrame(id: string): number {
  const frame = findObject(id).sourceIdentity.frame;
  if (typeof frame !== 'number') throw new Error(`${SkillPagesTruthId} ${id} has no source frame.`);
  return frame;
}

export function getSkillTruthObjectId(prefix: string): string {
  assertVerifiedSkillPagesTruth();
  const matches = skillPagesTruth.displayObjects.filter(({ id }) => id.startsWith(prefix));
  if (matches.length !== 1) {
    throw new Error(`${SkillPagesTruthId} expected one object for ${prefix}, found ${matches.length}.`);
  }
  return matches[0].id;
}

export function getSkillTreeRootId(heroId: number, treeIndex: 0 | 1): string {
  assertVerifiedSkillPagesTruth();
  const statePrefix = `active-role${heroId}-tree${treeIndex + 1}-`;
  const object = skillPagesTruth.displayObjects.find((candidate) =>
    /^active-page-root\.tree-frame-\d+$/.test(candidate.id)
    && candidate.placements.some(({ stateId, visible }) => visible && stateId.startsWith(statePrefix)));
  if (!object) throw new Error(`${SkillPagesTruthId} is missing ${statePrefix}.`);
  return object.id;
}

export function getSkillTreeChildId(
  heroId: number,
  treeIndex: 0 | 1,
  child: 'skill' | 'skillset' | 'upgrade',
  childIndex: number,
): string {
  const rootId = getSkillTreeRootId(heroId, treeIndex);
  return getSkillTruthObjectId(`${rootId}.${child}${childIndex + 1}-`);
}

export function getSkillSelectorCharacterId(heroId: number): number {
  assertVerifiedSkillPagesTruth();
  const matches = skillPagesTruth.displayObjects.filter(({ id }) =>
    id.startsWith(`skill-hub-root.role${heroId}-selector-frame-`));
  const characterIds = [...new Set(matches.map(({ sourceIdentity }) => sourceIdentity.characterId))];
  if (characterIds.length !== 1 || typeof characterIds[0] !== 'number') {
    throw new Error(`${SkillPagesTruthId} has no unique selector character for role ${heroId}.`);
  }
  return characterIds[0];
}

export function getSkillOwnerSelectorBounds(ownerIndex: number): SkillTruthBounds {
  return getSkillTruthBounds(getSkillTruthObjectId(
    `skill-hub-root.role${ownerIndex + 1}-selector-frame-1`,
  ));
}

export function getSkillTruthStateIds(): readonly string[] {
  assertVerifiedSkillPagesTruth();
  return skillPagesTruth.states.map(({ id }) => id);
}

function findObject(id: string): TruthObject {
  assertVerifiedSkillPagesTruth();
  const object = skillPagesTruth.displayObjects.find((candidate) => candidate.id === id);
  if (!object) throw new Error(`${SkillPagesTruthId} is missing ${id}.`);
  return object;
}

function visibleBounds(object: TruthObject): SkillTruthBounds {
  const bounds = object.placements.find(({ visible }) => visible)?.stageBounds;
  if (!bounds) throw new Error(`${SkillPagesTruthId} ${object.id} has no visible stage bounds.`);
  return bounds;
}
