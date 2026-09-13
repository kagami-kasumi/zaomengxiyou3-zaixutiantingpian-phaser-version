import type { PetState } from './PetTypes';
import { createPetSkillState } from './PetSkillStateSystem';

/** PetDragon1.doHit2 creates a fresh PetInfo and copies these five current stats. */
export function createDragon1CloneState(parent: Readonly<PetState>): PetState {
  return {
    id: '', species: 'dragon', form: 1, displayName: parent.displayName,
    level: parent.level, hp: parent.hp, maxHp: parent.hp, mp: parent.mp, maxMp: parent.mp,
    atk: parent.atk, def: parent.def, exp: 0, expToNext: 0,
    critBonusRate: 0, skillDamageBonus: 0, moveSpeed: 5, lifetime: 0,
    quality: 0, hpQuality: 0, mpQuality: 0, atkQuality: 0, defQuality: 0,
    perception: 0, technique: 0, warpower: 0, isActive: true, skills: [],
    skillState: createPetSkillState(),
  };
}
