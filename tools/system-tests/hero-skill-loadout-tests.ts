import assert from 'node:assert/strict';
import {
  createHeroSkillModel,
  getTestHeroSkillLoadoutPreset,
  getTestHeroSkillLoadoutPresetCount,
  resetHeroSkill,
} from '../../src/systems/HeroSkillSystem';
import { getSkillTreeForHero, type AllSkillName } from '../../src/systems/SkillUISystem';

export function runHeroSkillLoadoutTests(): void {
  testHeroSkillRuntimeBundlesAreLazy();
  for (const heroId of [1, 2, 3, 4, 5] as const) {
    const expected = new Set<AllSkillName>();
    for (const treeIndex of [0, 1] as const) {
      for (const skillName of getSkillTreeForHero(heroId, treeIndex)?.skills ?? []) {
        expected.add(skillName);
      }
    }

    const actual = new Set<AllSkillName>();
    for (let presetIndex = 0; presetIndex < getTestHeroSkillLoadoutPresetCount(heroId); presetIndex += 1) {
      for (const binding of getTestHeroSkillLoadoutPreset(heroId, presetIndex).slots) {
        if (binding) actual.add(binding.skillName);
      }
    }

    assert.deepEqual(actual, expected);
  }
}

function testHeroSkillRuntimeBundlesAreLazy(): void {
  const skill = createHeroSkillModel();
  assert.deepEqual(Object.keys(skill.roleRuntimes), []);
  skill.role5Runtime.jrjlLevel = 3;
  assert.deepEqual(Object.keys(skill.roleRuntimes), ['5']);
  assert.equal(skill.role5Runtime.jrjlLevel, 3);
  resetHeroSkill(skill);
  assert.deepEqual(Object.keys(skill.roleRuntimes), []);
}
