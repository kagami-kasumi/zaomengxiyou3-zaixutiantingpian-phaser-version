import type { PetState } from './PetTypes';
import { createPetSkillState } from './PetSkillStateSystem';

/** PetDragon1.doHit2 creates a fresh PetInfo and copies these five current stats. */
export function createDragon1CloneState(parent: Readonly<PetState>, form = 1): PetState {
  return {
    id: '', species: 'dragon', form, displayName: parent.displayName,
    level: parent.level, hp: parent.hp, maxHp: parent.hp, mp: parent.mp, maxMp: parent.mp,
    atk: parent.atk, def: parent.def, exp: 0, expToNext: 0,
    critBonusRate: 0, skillDamageBonus: 0, moveSpeed: 5, lifetime: 0,
    quality: 0, hpQuality: 0, mpQuality: 0, atkQuality: 0, defQuality: 0,
    perception: 0, technique: 0, warpower: 0, isActive: true, skills: [],
    skillState: createPetSkillState(),
  };
}

/** PetDragon4.createFenshen applies each multiplier twice when setting the maxima. */
export function createDragon4CloneState(parent: Readonly<PetState>): PetState {
  return { ...createDragon1CloneState(parent, 4),
    hp: (parent.hp * 20) | 0, maxHp: ((parent.hp * 20) | 0) * 20,
    mp: (parent.mp * 99) | 0, maxMp: ((parent.mp * 99) | 0) * 99,
    critBonusRate: parent.critBonusRate, moveSpeed: parent.moveSpeed, skills: [...parent.skills] };
}
