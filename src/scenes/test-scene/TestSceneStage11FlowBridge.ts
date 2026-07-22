import Phaser from 'phaser';
import {
  completeStage11,
  createStage11Flow,
  updateStage11PartyFailure,
  type Stage11FlowModel,
} from '../../systems/Stage11FlowSystem';
import { isHeroCombatDead } from './TestSceneSystems';
import { installFormalFeatureUiEntries } from '../feature-ui/FormalFeatureUiEntryBridge';

export function initializeStage11Flow(this: any): void {
  this.stage11Flow = createStage11Flow(this.playerCount, this.levelUnlockProgress);
  const returnToMap = () => this.scene.start('HeavenMapScene');
  this.input.keyboard?.on('keydown-ESC', returnToMap);
  this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    this.input.keyboard?.off('keydown-ESC', returnToMap);
  });
}

export function installStage11FeatureUiEntries(this: any): void {
  installFormalFeatureUiEntries(this, { originKind: 'combat', playerCount: this.playerCount });
}

export function updateStage11Flow(this: any, deltaMs: number): boolean {
  const flow = this.stage11Flow as Stage11FlowModel | undefined;
  if (!flow) return true;
  const alivePlayerCount = this.playerViews.filter(
    (player: any) => !isHeroCombatDead(player.combat),
  ).length;
  const phase = updateStage11PartyFailure(flow, alivePlayerCount, deltaMs);
  if (phase === 'failed') showFailureOverlay.call(this);
  return phase === 'playing' || phase === 'failure-pending';
}

export function showStage11ClearOverlay(this: any): void {
  const flow = this.stage11Flow as Stage11FlowModel | undefined;
  if (!flow || !completeStage11(flow)) return;

  this.levelUnlockProgress = { ...flow.unlockProgress };
  this.saveSceneNow();
  this.clearOverlay = createResultOverlay(this, {
    title: '关卡胜利',
    subtitle: 'Stage 1-1 · 巫鹰已击败',
    detail: '已解锁 1-2（内容尚未接入）',
    accent: 0xf2c14e,
  });
}

function showFailureOverlay(this: any): void {
  if (this.clearOverlay) return;
  this.clearOverlay = createResultOverlay(this, {
    title: '全员战败',
    subtitle: 'Stage 1-1',
    detail: '2.5 秒全灭检查已完成',
    accent: 0xc96a6a,
  });
}

function createResultOverlay(
  scene: any,
  copy: { title: string; subtitle: string; detail: string; accent: number },
): Phaser.GameObjects.Container {
  const background = scene.add.rectangle(470, 295, 940, 590, 0x000000, 0.82).setScrollFactor(0);
  const title = scene.add.text(470, 176, copy.title, {
    color: `#${copy.accent.toString(16).padStart(6, '0')}`,
    fontFamily: 'Arial, sans-serif', fontSize: '42px',
  }).setOrigin(0.5).setScrollFactor(0);
  const subtitle = scene.add.text(470, 244, copy.subtitle, {
    color: '#f3f6ff', fontFamily: 'Arial, sans-serif', fontSize: '22px',
  }).setOrigin(0.5).setScrollFactor(0);
  const detail = scene.add.text(470, 286, copy.detail, {
    color: '#9ed7b5', fontFamily: 'Arial, sans-serif', fontSize: '16px',
  }).setOrigin(0.5).setScrollFactor(0);
  const retry = createResultButton(scene, 350, 382, '重玩 1-1', () => {
    restartFreshTestScene(scene);
  });
  const back = createResultButton(scene, 590, 382, '返回天庭地图', () => {
    scene.scene.start('HeavenMapScene');
  });
  const container = scene.add.container(0, 0, [background, title, subtitle, detail, ...retry, ...back]);
  container.setScrollFactor(0).setDepth(200);
  return container;
}

function restartFreshTestScene(scene: any): void {
  const playerCount = scene.playerCount as 1 | 2;
  const SceneConstructor = scene.constructor as new () => Phaser.Scene;
  scene.game.events.once(Phaser.Core.Events.POST_RENDER, () => {
    const manager = scene.scene.manager;
    manager.remove('TestScene');
    manager.add('TestScene', new SceneConstructor(), true, { playerCount });
  });
}

function createResultButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
): [Phaser.GameObjects.Rectangle, Phaser.GameObjects.Text] {
  const background = scene.add.rectangle(x, y, 200, 50, 0x23314a)
    .setStrokeStyle(2, 0xf2c14e)
    .setScrollFactor(0)
    .setInteractive({ useHandCursor: true });
  const text = scene.add.text(x, y, label, {
    color: '#f3f6ff', fontFamily: 'Arial, sans-serif', fontSize: '17px',
  }).setOrigin(0.5).setScrollFactor(0);
  background.on('pointerover', () => background.setFillStyle(0x344867));
  background.on('pointerout', () => background.setFillStyle(0x23314a));
  background.on('pointerdown', onClick);
  return [background, text];
}
