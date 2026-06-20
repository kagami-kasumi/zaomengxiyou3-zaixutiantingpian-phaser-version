export type AdvancedPetSkillSpecies = 'phoenix' | 'rabbit' | 'mouse' | 'tigress';

const PriorityBySpecies = {
  phoenix: ['np', 'bshn', 'dhly', 'zqaoyi'],
  rabbit: ['yg', 'jf', 'bs', 'ysaoyi'],
  mouse: ['sc', 'hxfb', 'zsaoyi'],
  tigress: ['hy', 'sxhz', 'hsqj', 'bhaoyi'],
} as const satisfies Record<AdvancedPetSkillSpecies, readonly string[]>;

export function getAdvancedPetSkillPriority(species: AdvancedPetSkillSpecies): readonly string[] {
  return PriorityBySpecies[species];
}
