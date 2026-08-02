import Phaser from 'phaser';
import type { HeroCombatModel } from '../systems/HeroCombatSystem';
import type { HeroMovementModel } from '../systems/HeroMovementSystem';
import type { HeroNormalAttackModel } from '../systems/HeroNormalAttackSystem';
import type { HeroSkillActionName, HeroSkillModel } from '../systems/HeroSkillSystem';
import {
  createRole1CombatVisual,
  getRole1CombatVisual,
  syncRole1CombatVisual,
} from './Role1CombatVisualBridge';
import {
  createRole2CombatVisual,
  getRole2CombatVisual,
  syncRole2CombatVisual,
} from './Role2CombatVisualBridge';
import {
  createRole3CombatVisual,
  getRole3CombatVisual,
  syncRole3CombatVisual,
} from './Role3CombatVisualBridge';

type TimedVisualAction = Readonly<{
  actionName: HeroSkillActionName;
  startedAtMs: number;
  endsAtMs: number;
}>;

export type HeroCombatVisualInput = Readonly<{
  movement?: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  skill: HeroSkillModel;
  role1SkillAction?: TimedVisualAction;
  role2SkillAction?: TimedVisualAction;
  role3SkillAction?: TimedVisualAction;
}>;

export function createHeroCombatVisual(
  scene: Phaser.Scene,
  anchor: Phaser.GameObjects.Image,
  heroId: number | undefined,
): void {
  createRole1CombatVisual(scene, anchor, heroId);
  createRole2CombatVisual(scene, anchor, heroId);
  createRole3CombatVisual(scene, anchor, heroId);
}

export function hasHeroCombatVisual(anchor: Phaser.GameObjects.Image): boolean {
  return Boolean(
    getRole1CombatVisual(anchor)
    || getRole2CombatVisual(anchor)
    || getRole3CombatVisual(anchor),
  );
}

export function syncHeroCombatVisual(
  anchor: Phaser.GameObjects.Image,
  input: HeroCombatVisualInput,
  timeMs: number,
): boolean {
  const role1 = getRole1CombatVisual(anchor);
  if (role1) {
    syncRole1CombatVisual(role1, { ...input, skillAction: input.role1SkillAction }, timeMs);
    return true;
  }
  const role2 = getRole2CombatVisual(anchor);
  if (role2) {
    syncRole2CombatVisual(role2, { ...input, skillAction: input.role2SkillAction }, timeMs);
    return true;
  }
  const role3 = getRole3CombatVisual(anchor);
  if (role3) {
    syncRole3CombatVisual(role3, {
      ...input,
      runtime: input.skill.role3Runtime,
      skillAction: input.role3SkillAction,
    }, timeMs);
    return true;
  }
  return false;
}
