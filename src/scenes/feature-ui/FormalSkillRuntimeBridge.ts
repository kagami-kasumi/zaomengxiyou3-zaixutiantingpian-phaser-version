import type Phaser from 'phaser';
import type { FormalSkillPageModel } from '../../systems/FormalSkillPageSystem';
import { getFormalSkillPlayer } from '../../systems/FormalSkillPageSystem';
import type { HeroSkillLoadout } from '../../systems/HeroSkillSystem';
import type { HeroSkillLearningState } from '../../systems/SkillUISystem';
import { loadActiveGame } from '../../systems/SaveSlotSystem';
import { restoreGameState, type LoadedGameState, type SaveStorage } from '../../systems/SaveSystem';
import { createSeedEquipmentRegistry } from '../../systems/EquipmentSystem';

type SkillRuntimePlayer = {
  slot: 'p1' | 'p2';
  skill: { loadout: unknown };
};

type SkillRuntimeScene = Phaser.Scene & {
  getPlayers?: () => readonly SkillRuntimePlayer[];
  p1SkillLearning?: unknown;
  p2SkillLearning?: unknown;
};

export const FormalSkillsUpdatedEvent = 'feature-ui-skills-updated';

export type FormalSkillsUpdatedPayload = {
  owner: 'p1' | 'p2';
  skillLoadout: HeroSkillLoadout;
  skillLearning: HeroSkillLearningState;
};

export function readFormalSkillRuntime(storage: SaveStorage | undefined): LoadedGameState | undefined {
  if (!storage) return undefined;
  const save = loadActiveGame(storage);
  return save ? restoreGameState(save, createSeedEquipmentRegistry()) : undefined;
}

export function syncFormalSkillRuntime(
  origin: Phaser.Scene,
  model: FormalSkillPageModel,
): void {
  const playerState = getFormalSkillPlayer(model);
  const runtime = origin as SkillRuntimeScene;
  const player = runtime.getPlayers?.().find((candidate) => candidate.slot === model.owner);
  if (player) player.skill.loadout = playerState.skillLoadout;
  if (model.owner === 'p1') runtime.p1SkillLearning = playerState.skillLearning;
  if (model.owner === 'p2') runtime.p2SkillLearning = playerState.skillLearning;
  origin.events.emit(FormalSkillsUpdatedEvent, {
    owner: model.owner,
    skillLoadout: playerState.skillLoadout,
    skillLearning: playerState.skillLearning,
  } satisfies FormalSkillsUpdatedPayload);
}
