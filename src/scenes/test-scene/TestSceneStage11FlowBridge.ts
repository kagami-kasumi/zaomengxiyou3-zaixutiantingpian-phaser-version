import Phaser from 'phaser';
import {
  createStage11Flow,
  type Stage11FlowModel,
} from '../../systems/Stage11FlowSystem';
import { isHeroCombatDead } from './TestSceneSystems';
import { installFormalFeatureUiEntries } from '../feature-ui/FormalFeatureUiEntryBridge';
import { createFormalPartyRetryData } from '../../systems/FormalPartyRuntimeSystem';
import { startSceneWithBundle } from '../SceneAssetBundleBridge';
import {
  createLevelResultStats,
  markLevelResultStarted,
  showLevelResult,
} from '../LevelResultView';

export function initializeStage11Flow(this: any): void {
  this.stage11Flow = createStage11Flow(this.playerCount, this.levelUnlockProgress);
  markLevelResultStarted(this);
}

export function installStage11FeatureUiEntries(this: any): void {
  if (!this.formalPartyRuntime) return;
  installFormalFeatureUiEntries(this, {
    originKind: 'combat',
    party: this.formalPartyRuntime.party,
  });
}

export function updateStage11Flow(this: any, deltaMs: number): boolean {
  const flow = this.stage11Flow as Stage11FlowModel | undefined;
  if (!flow) return true;
  const alivePlayerCount = this.playerViews.filter(
    (player: any) => !isHeroCombatDead(player.combat),
  ).length;
  const phase = flow.updatePartyFailure(alivePlayerCount, deltaMs);
  if (phase === 'failed') showFailureOverlay.call(this);
  return phase === 'playing' || phase === 'failure-pending';
}

export function showStage11ClearOverlay(this: any): void {
  const flow = this.stage11Flow as Stage11FlowModel | undefined;
  if (!flow || flow.phase !== 'cleared' || this.clearOverlay) return;

  this.levelUnlockProgress = { ...flow.unlockProgress };
  this.saveSceneNow();
  const retryData = createFormalPartyRetryData(this.formalPartyRuntime);
  this.clearOverlay = showLevelResult(this, {
    result: 'cleared',
    stats: createLevelResultStats(this),
    onRetry: () => restartFreshTestScene(this),
    onNext: () => void startSceneWithBundle(this, 'Stage12Scene', retryData),
    onBack: () => void startSceneWithBundle(this, 'HeavenMapScene'),
  });
}

function showFailureOverlay(this: any): void {
  if (this.clearOverlay) return;
  this.clearOverlay = showLevelResult(this, {
    result: 'failed',
    stats: createLevelResultStats(this, 0),
    onRetry: () => restartFreshTestScene(this),
    onBack: () => void startSceneWithBundle(this, 'HeavenMapScene'),
  });
}

function restartFreshTestScene(scene: any): void {
  const retryData = createFormalPartyRetryData(scene.formalPartyRuntime);
  const SceneConstructor = scene.constructor as new () => Phaser.Scene;
  scene.game.events.once(Phaser.Core.Events.POST_RENDER, () => {
    const manager = scene.scene.manager;
    manager.remove('TestScene');
    manager.add('TestScene', new SceneConstructor(), true, retryData);
  });
}
