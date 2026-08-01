import {
  createStage11Flow,
  type Stage11FlowModel,
} from '../../systems/Stage11FlowSystem';
import { isHeroCombatDead } from './TestSceneSystems';

export function initializeStage11Flow(this: any): void {
  this.stage11Flow = createStage11Flow(this.playerCount, this.levelUnlockProgress);
}

export function updateStage11Flow(this: any, deltaMs: number): 'failed' | undefined {
  const flow = this.stage11Flow as Stage11FlowModel | undefined;
  if (!flow) return undefined;
  const alivePlayerCount = this.playerViews.filter(
    (player: any) => !isHeroCombatDead(player.combat),
  ).length;
  return flow.updatePartyFailure(alivePlayerCount, deltaMs) === 'failed'
    ? 'failed'
    : undefined;
}
