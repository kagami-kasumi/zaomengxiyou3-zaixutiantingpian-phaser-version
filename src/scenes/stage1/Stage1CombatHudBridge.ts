import Phaser from 'phaser';
import { CombatHudAssetKeys } from '../../assets/AssetManifest';
import {
  clearCombatHudBossRuntime,
  createCombatHudBossRuntime,
  updateCombatHudBossRuntime,
  type CombatHudBossBar,
  type CombatHudEnemySnapshot,
  type CombatHudPlayerSnapshot,
} from '../../systems/Stage1CombatHudSystem';

export type Stage1CombatHudBridge = Readonly<{
  update: (deltaMs: number) => void;
  destroy: () => void;
  getViewCount: () => number;
}>;

type PlayerHudView = Readonly<{
  root: Phaser.GameObjects.Container;
  gauges: Phaser.GameObjects.Graphics;
  hpText: Phaser.GameObjects.Text;
  mpText: Phaser.GameObjects.Text;
  expText: Phaser.GameObjects.Text;
  levelText: Phaser.GameObjects.Text;
  skillTexts: readonly Phaser.GameObjects.Text[];
  shortcutText: Phaser.GameObjects.Text;
}>;

type BossHudView = Readonly<{
  root: Phaser.GameObjects.Container;
  gauges: Phaser.GameObjects.Graphics;
  name: Phaser.GameObjects.Text;
}>;

const PLAYER_SKILL_X: Record<'p1' | 'p2', readonly number[]> = {
  p1: [130.5, 170.5, 210.5, 250.45, 290.45],
  p2: [630.5, 669.5, 709.5, 749.55, 788.55],
};

export function createStage1CombatHudBridge(
  scene: Phaser.Scene,
  getPlayers: () => readonly CombatHudPlayerSnapshot[],
  getEnemies: () => readonly CombatHudEnemySnapshot[],
): Stage1CombatHudBridge {
  const bossRuntime = createCombatHudBossRuntime();
  const playerViews = new Map<string, PlayerHudView>();
  const bossViews = new Map<string, BossHudView>();
  let destroyed = false;

  const update = (deltaMs: number): void => {
    if (destroyed) return;
    const players = getPlayers();
    const activeSlots = new Set(players.map((player) => player.slot));
    for (const player of players) {
      const view = playerViews.get(player.slot) ?? createPlayerHudView(scene, player.slot);
      playerViews.set(player.slot, view);
      updatePlayerHudView(view, player);
    }
    for (const [slot, view] of playerViews) {
      if (activeSlots.has(slot as 'p1' | 'p2')) continue;
      view.root.destroy(true);
      playerViews.delete(slot);
    }

    const bars = updateCombatHudBossRuntime(bossRuntime, getEnemies(), deltaMs);
    syncBossViews(scene, bossViews, bars);
  };

  const destroy = (): void => {
    if (destroyed) return;
    destroyed = true;
    for (const view of playerViews.values()) view.root.destroy(true);
    for (const view of bossViews.values()) view.root.destroy(true);
    playerViews.clear();
    bossViews.clear();
    clearCombatHudBossRuntime(bossRuntime);
  };

  update(0);
  return {
    update,
    destroy,
    getViewCount: () => playerViews.size + bossViews.size,
  };
}

function createPlayerHudView(scene: Phaser.Scene, slot: 'p1' | 'p2'): PlayerHudView {
  const root = scene.add.container(0, 0).setScrollFactor(0).setDepth(110);
  const shell = scene.add.image(slot === 'p1' ? -62.15 : 982.15, -19, CombatHudAssetKeys.roleInfo)
    .setOrigin(0, 0)
    .setAlpha(0.92);
  if (slot === 'p2') shell.setScale(-1, 1);
  const gauges = scene.add.graphics();
  const textOrigin = slot === 'p1' ? 0.5 : 0.5;
  const panelTextX = slot === 'p1' ? 151 : 769;
  const hpText = hudText(scene, panelTextX, 16, '');
  const mpText = hudText(scene, panelTextX, 35, '');
  const expText = hudText(scene, panelTextX, 54, '');
  const levelText = hudText(scene, slot === 'p1' ? 21 : 899, 63, '').setFontSize(14);
  const skillTexts = PLAYER_SKILL_X[slot].map((x) => hudText(scene, x, 520, '').setFontSize(11));
  const shortcutText = hudText(scene, slot === 'p1' ? 72 : 848, 472, '')
    .setFontSize(10).setOrigin(textOrigin, 0.5);
  root.add([shell, gauges, hpText, mpText, expText, levelText, ...skillTexts, shortcutText]);
  return { root, gauges, hpText, mpText, expText, levelText, skillTexts, shortcutText };
}

function updatePlayerHudView(view: PlayerHudView, player: CombatHudPlayerSnapshot): void {
  const isP1 = player.slot === 'p1';
  const gaugeLeft = isP1 ? 86 : 734;
  drawGauge(view.gauges, gaugeLeft, 16, 100, player.hpRatio, 0xb73434, !isP1);
  drawGauge(view.gauges, gaugeLeft, 35, 100, player.mpRatio, 0x376bc4, !isP1);
  drawGauge(view.gauges, gaugeLeft, 54, 100, player.expRatio, 0xc49a37, !isP1);
  view.hpText.setText(player.hpText);
  view.mpText.setText(player.mpText);
  view.expText.setText(player.expText);
  view.levelText.setText(`Lv.${player.level}`);
  player.skillSlots.forEach((slot, index) => {
    const state = slot.binding?.usableState === 'active' ? ' ★'
      : slot.binding?.usableState === 'unavailable' ? ' ×' : '';
    const skill = slot.binding ? `${slot.binding.skillName}${state}` : '—';
    view.skillTexts[index]?.setText(`${slot.displayKey}\n${skill}`);
  });
  const magic = player.magicWeaponAvailable ? '法宝' : '法宝—';
  const pet = player.petAvailable ? '宠物' : '宠物—';
  view.shortcutText.setText(`${magic}  ${pet}${player.specialReady ? '  ★' : ''}`);
}

function syncBossViews(
  scene: Phaser.Scene,
  views: Map<string, BossHudView>,
  bars: readonly CombatHudBossBar[],
): void {
  const ids = new Set(bars.map((bar) => bar.enemyId));
  bars.forEach((bar, index) => {
    const view = views.get(bar.enemyId) ?? createBossHudView(scene);
    views.set(bar.enemyId, view);
    view.root.y = 50 + index * 50;
    view.name.setText(bar.displayName);
    view.gauges.clear();
    view.gauges.fillStyle(0x712727, 0.8).fillRect(-145, -8, 290 * bar.trailingRatio, 16);
    view.gauges.fillStyle(0xd43f3f, 1).fillRect(-145, -8, 290 * bar.hpRatio, 16);
  });
  for (const [id, view] of views) {
    if (ids.has(id)) continue;
    view.root.destroy(true);
    views.delete(id);
  }
}

function createBossHudView(scene: Phaser.Scene): BossHudView {
  const root = scene.add.container(465, 50).setScrollFactor(0).setDepth(112);
  const shell = scene.add.image(0, 0, CombatHudAssetKeys.bossBlood)
    .setDisplaySize(364.4, 23.4)
    .setAlpha(0.95);
  const gauges = scene.add.graphics();
  const name = hudText(scene, -205, 0, '').setOrigin(0.5).setFontSize(14);
  root.add([shell, gauges, name]);
  return { root, gauges, name };
}

function drawGauge(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  ratio: number,
  color: number,
  rightAligned: boolean,
): void {
  if (y === 16) graphics.clear();
  graphics.fillStyle(0x151922, 0.9).fillRect(x, y, width, 11);
  const fillWidth = width * ratio;
  graphics.fillStyle(color, 0.95).fillRect(rightAligned ? x + width - fillWidth : x, y, fillWidth, 11);
}

function hudText(scene: Phaser.Scene, x: number, y: number, value: string): Phaser.GameObjects.Text {
  return scene.add.text(x, y, value, {
    color: '#fff4cf',
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
    stroke: '#251506',
    strokeThickness: 2,
    align: 'center',
  }).setOrigin(0.5);
}
