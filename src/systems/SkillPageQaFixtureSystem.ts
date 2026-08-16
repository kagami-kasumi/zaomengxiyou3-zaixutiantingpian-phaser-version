import { getPartyPlayerSlots, type PartyConfiguration } from './PartyConfigurationSystem';
import { createDefaultGameSave, createSaveSlot } from './SaveSlotSystem';
import type { SaveStorage } from './SaveSystem';
import { HERO_SKILL_TREES } from './SkillUISystem';

export function isSkillPageQaRequested(search: string, allowed: boolean): boolean {
  return allowed && new URLSearchParams(search).get('qaSkillFixture') === 'ready';
}

export function createSkillPageQaStorage(party: PartyConfiguration): SaveStorage {
  const storage = createMemoryStorage();
  const save = createDefaultGameSave(new Date('2026-08-16T00:00:00.000Z'), party);
  for (const owner of getPartyPlayerSlots(party)) {
    const player = owner === 'p1' ? save.player1 : save.player2;
    const heroId = owner === 'p1'
      ? party.members.p1.heroId
      : party.playerCount === 2
        ? party.members.p2.heroId
        : party.members.p1.heroId;
    const skillName = HERO_SKILL_TREES[heroId][0].skills[0];
    player.level = 20;
    player.skillLearning.heroLevel = 20;
    player.skillLearning.trees[0].treeLevel = 1;
    player.skillLearning.trees[0].learnedSkills = [{ skillName, level: 1 }];
    player.skillLearning.passiveSkills = [1, 2, 3, 4, 5];
    player.skillLoadout[0] = { skillName, level: 1 };
    player.soulCount = 20_000;
  }
  if (!createSaveSlot(storage, 0, save)) throw new Error('Failed to create skill-page QA fixture save.');
  return storage;
}

function createMemoryStorage(): SaveStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}
