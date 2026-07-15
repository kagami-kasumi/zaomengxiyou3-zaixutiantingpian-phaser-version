// boundary: setup helpers create scene views and debug controls; they do not
// own runtime combat, drop, pet, or magic weapon rules.
import Phaser from 'phaser';
import { AssetKeys } from '../../assets/AssetManifest';
import { GameSettings } from '../../core/GameSettings';
import {
  canLearnSkill,
  canUpgradeSkill,
  canUpgradeTree,
  createHeroCombat,
  createHeroMovement,
  createHeroNormalAttack,
  createHeroProgression,
  createHeroSkillModel,
  defaultClimbTuning,
  getHeroBaseStats,
  getPassiveSkillMaxLevel,
  getSkillMaxLevel,
  getSkillTreeForHero,
  getTotalLearnedSkillCount,
  MAX_TREE_LEVEL,
  InventoryOwnerKeyCodes,
  PetUiKeyCodes,
  SKILL_LEARN_LIMIT,
  SkillSlotKeyLabels,
  TREE_UPGRADE_COSTS,
  type CapturablePetTarget,
  type HeroId,
  type HeroSkillLearningState,
  type PlayerSlot,
  type SkillUIState,
} from './TestSceneSystems';
import { createTestSceneDebugKeys } from './TestSceneDebugKeys';
import { formatHeroLabel } from './TestSceneFormatters';

type SkillBarView = {
  container: Phaser.GameObjects.Container;
  slotBgs: Phaser.GameObjects.Rectangle[];
  slotLabels: Phaser.GameObjects.Text[];
  highlight: Phaser.GameObjects.Rectangle;
  panelIndicator: Phaser.GameObjects.Text;
};

type SkillPanelView = {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Graphics;
  texts: Phaser.GameObjects.Text[];
};

type InventoryPanelView = {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Graphics;
  text: Phaser.GameObjects.Text;
};

export function createStage(this: any): void {
    const { worldWidth, worldHeight } = defaultClimbTuning;
    this.add.rectangle(
      worldWidth / 2,
      worldHeight / 2,
      worldWidth,
      worldHeight,
      0x101724,
    );

    this.add.rectangle(worldWidth / 2, worldHeight, worldWidth, 70, 0x24354c);
    this.add.rectangle(worldWidth / 2, worldHeight - 15, worldWidth, 8, 0xe2b84d);

    for (let i = 0; i < 9; i += 1) {
      this.add.rectangle(
        72 + i * 104,
        worldHeight - 20,
        54,
        14,
        0x182233,
        0.65,
      );
    }
  }

export function createPlayerMarkers(this: any, playerCount: 1 | 2): any[] {
    const groundY = defaultClimbTuning.worldHeight - 45;
    const p1 = this.createPlayerView(
      'p1',
      2,
      defaultClimbTuning.worldWidth * (playerCount === 1 ? 0.5 : 0.34),
      groundY,
    );
    p1.movement = createHeroMovement(p1.sprite.x, p1.sprite.y);
    p1.movement.currentPlatformId = 'climb-ground';

    if (playerCount === 1) {
      return [p1];
    }

    const p2 = this.createPlayerView(
      'p2',
      3,
      defaultClimbTuning.worldWidth * 0.58,
      groundY,
    );
    p2.movement = createHeroMovement(p2.sprite.x, p2.sprite.y);
    p2.movement.currentPlatformId = 'climb-ground';

    return [p1, p2];
  }

export function createCapturablePetTargets(this: any): CapturablePetTarget[] {
    const groundY = defaultClimbTuning.worldHeight - 45;
    return [
      {
        id: 'catch-monster72',
        monsterId: 'Monster72',
        x: defaultClimbTuning.worldWidth * 0.34 + 108,
        y: groundY - 34,
        width: 72,
        height: 68,
        level: 6,
        removed: false,
        feedback: 'Monster72 monkey1 40%',
      },
    ];
  }

export function createClimbingPlatforms(this: any): void {
    const { worldWidth, worldHeight } = defaultClimbTuning;

    this.add.rectangle(
      worldWidth / 2,
      worldHeight - 45,
      worldWidth - 60,
      8,
      0xe2b84d,
    );

    const climbHeights = [2300, 2000, 1700, 1400, 1100, 800, 500];
    for (const y of climbHeights) {
      const w = 220 + Math.abs(Math.sin(y * 0.003)) * 260;
      const x = worldWidth / 2 + Math.sin(y * 0.0017) * 100;
      this.add.rectangle(x, y, w, 8, 0x72d2b1, 0.7);
    }

    const { height } = GameSettings;
    this.add.rectangle(
      worldWidth / 2,
      worldHeight - height + 420,
      worldWidth,
      3,
      0x597a9e,
      0.5,
    );
    this.add.text(worldWidth / 2, worldHeight - height + 400, '↓↓ BOSS ARENA ABOVE ↓↓', {
      color: '#597a9e',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
    }).setOrigin(0.5, 0.5);

    for (const sp of defaultClimbTuning.stopPoints) {
      this.add.rectangle(worldWidth - 20, sp.y, 40, 3, 0xf2c14e, 0.4);
      this.add.text(worldWidth - 80, sp.y - 10, `STOP ${sp.y}`, {
        color: '#f2c14e',
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
      }).setOrigin(1, 0.5);
    }
  }

export function createClouds(this: any): void {
    const { worldWidth, cloudLayers } = defaultClimbTuning;
    const cloudColors = [0x597a9e, 0x4a6d8c, 0x3d5e7a];

    for (let layer = 0; layer < cloudLayers.length; layer += 1) {
      const { count } = cloudLayers[layer];
      const color = cloudColors[layer];

      for (let i = 0; i < count; i += 1) {
        const x = (worldWidth / (count + 1)) * (i + 1) + Math.sin(i * 3.7) * 60;
        const y = 100 + i * 400 + layer * 130;
        const w = 80 + Math.sin(i * 2.3) * 40;
        const cloud = this.add.ellipse(x, y, w, 16 + layer * 5, color, 0.18 + layer * 0.08);
        this.cloudSprites.push(cloud);
        this.cloudBaseY.push(y);
      }
    }
  }

export function createPlayerView(this: any,
    slot: PlayerSlot,
    heroId: HeroId,
    x: number,
    y: number,
  ): any {
    const sprite = this.add.image(x, y, AssetKeys.playerPlaceholder);
    sprite.setOrigin(0.5, 1);
    sprite.setTint(getHeroTint(heroId));

    const label = this.add.text(x - 18, y + 14, slot.toUpperCase(), {
      color: '#f3f6ff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
    });

    const normalAttack = createHeroNormalAttack(heroId);
    const progression = createHeroProgression(heroId);
    const baseStats = getHeroBaseStats(heroId, progression.level);
    const combat = createHeroCombat(slot);
    combat.maxHp = baseStats.maxHp;
    combat.hp = combat.maxHp;
    const skill = createHeroSkillModel(undefined, baseStats.maxMp);
    label.setText(formatHeroLabel(slot, normalAttack, combat));

    return { slot, sprite, label, combat, normalAttack, skill, baseStats, progression };
  }

export function createHeroDebugKeys(this: any): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    this.p1HeroSelectKeys = {
      1: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      2: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      3: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      4: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      5: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
    };
    this.p2HeroSelectKeys = {
      1: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SIX),
      2: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SEVEN),
      3: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.EIGHT),
      4: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NINE),
      5: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO),
    };
    this.p1WeaponToggleKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.p2WeaponToggleKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
  }

export function createSkillUIKeys(this: any): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    this.p1SkillPanelKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V);
    this.p2SkillPanelKey = keyboard.addKey(PetUiKeyCodes.p2SkillPanel);
    this.p1LoadoutCycleKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.p2LoadoutCycleKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ADD);
    this.panelTabKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    this.panelBindKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    this.panelUpgradeKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U);
    this.panelLearnKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    this.panelTreeUpgradeKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
    this.panelPassiveKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.panelSkillSelectKeys = [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
    ];
  }

export function createInventoryUIKeys(this: any): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    this.inventoryToggleKey = keyboard.addKey(InventoryOwnerKeyCodes.p1Panel);
    this.p2InventoryToggleKey = keyboard.addKey(InventoryOwnerKeyCodes.p2Panel);
    this.inventoryTabKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    this.inventoryUpKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.inventoryDownKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.inventoryLeftKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.inventoryRightKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.inventoryConfirmKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.inventoryBackspaceKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);
    this.inventoryDeleteKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DELETE);
    this.inventoryMagicWeaponUpgradeKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U);
    this.inventoryCraftKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.inventoryCraftStageKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.inventoryCraftRemoveKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }

export function createDebugKeys(this: any): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    this.debugKeys = createTestSceneDebugKeys(keyboard);
  }

export function createInventoryPanel(this: any): InventoryPanelView {
    const container = this.add.container(0, 0);
    container.setVisible(false);

    const bg = this.add.graphics();
    bg.fillStyle(0x101724, 0.96);
    bg.fillRoundedRect(24, 54, 560, 480, 8);
    bg.lineStyle(1, 0x72d2b1, 0.85);
    bg.strokeRoundedRect(24, 54, 560, 480, 8);
    container.add(bg);

    const text = this.add.text(40, 68, '', {
      color: '#dfe8f5',
      fontFamily: 'Courier New, monospace',
      fontSize: '12px',
      lineSpacing: 3,
    });
    container.add(text);

    return { container, bg, text };
  }

export function createSkillBar(this: any, slot: PlayerSlot, x: number, y: number): SkillBarView {
    const keyLabels = SkillSlotKeyLabels[slot];
    const container = this.add.container(x, y);
    const slotBgs: Phaser.GameObjects.Rectangle[] = [];
    const slotLabels: Phaser.GameObjects.Text[] = [];

    for (let i = 0; i < 5; i += 1) {
      const sx = i * 88;
      const bg = this.add.rectangle(sx, 0, 84, 34, 0x182233, 0.9);
      bg.setStrokeStyle(1, 0x3a4d6b);
      bg.setOrigin(0, 0);
      container.add(bg);
      slotBgs.push(bg);

      const label = this.add.text(sx + 4, 2, `${keyLabels[i]}: -`, {
        color: '#8a9bb5',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
      });
      container.add(label);
      slotLabels.push(label);
    }

    const highlight = this.add.rectangle(0, 0, 84, 34, 0x000000, 0);
    highlight.setStrokeStyle(2, 0xf2c14e);
    highlight.setOrigin(0, 0);
    container.add(highlight);

    const panelIndicator = this.add.text(x + 410, y - 16, '', {
      color: '#f2c14e',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
    });

    return { container, slotBgs, slotLabels, highlight, panelIndicator };
  }

export function createSkillPanel(this: any, slot: PlayerSlot): SkillPanelView {
    const panelX = slot === 'p1' ? 40 : 490;
    const panelY = 50;
    const container = this.add.container(0, 0);
    container.setDepth(50);
    container.setVisible(false);

    const bg = this.add.graphics();
    bg.fillStyle(0x101724, 0.95);
    bg.fillRoundedRect(panelX, panelY, 460, 470, 8);
    bg.lineStyle(1, 0x597a9e, 0.8);
    bg.strokeRoundedRect(panelX, panelY, 460, 470, 8);
    container.add(bg);

    const panelText = this.add.text(panelX + 12, panelY + 10, '', {
      color: '#c8d3e2',
      fontFamily: 'Courier New, monospace',
      fontSize: '12px',
    });
    container.add(panelText);

    return { container, bg, texts: [panelText] };
  }

export function updateSkillPanel(this: any,
    panel: SkillPanelView,
    slot: PlayerSlot,
    player: any | undefined,
    ui: SkillUIState,
    learning: HeroSkillLearningState,
  ): void {
    if (!ui.skillPanelOpen) {
      panel.container.setVisible(false);
      return;
    }

    panel.container.setVisible(true);
    const heroId = player?.normalAttack.heroId ?? 2;
    const lines = this.buildSkillPanelLines(slot, heroId, ui, learning);
    panel.texts[0].setText(lines.join('\n'));
  }

export function buildSkillPanelLines(this: any,
    slot: PlayerSlot,
    heroId: number,
    ui: SkillUIState,
    learning: HeroSkillLearningState,
  ): string[] {
    const heroName = ['', '悟空', '唐僧', '八戒', '沙僧', '白龙'][heroId] ?? `R${heroId}`;
    const lines: string[] = [];
    const totalLearned = getTotalLearnedSkillCount(learning);

    lines.push(`══ SKILLS: ${heroName} R${heroId} Lv.${learning.heroLevel} ══  Souls: ${learning.soulCount}`);
    lines.push(`Learned: ${totalLearned}/${SKILL_LEARN_LIMIT}`);
    lines.push('');

    for (let t = 0; t < 2; t += 1) {
      const tree = learning.trees[t];
      const treeConfig = getSkillTreeForHero(heroId, t);
      if (!treeConfig) continue;

      const isActive = (ui.activeTab === 'tree1' && t === 0) || (ui.activeTab === 'tree2' && t === 1);
      const prefix = isActive ? '▶' : ' ';
      const canUpT = canUpgradeTree(learning, t);
      const upCost = tree.treeLevel < MAX_TREE_LEVEL ? TREE_UPGRADE_COSTS[tree.treeLevel] : 0;
      const upInfo = tree.treeLevel >= MAX_TREE_LEVEL
        ? 'MAX'
        : canUpT === true ? `[G]Upgrade(${upCost})` : `[G]${canUpT}`;

      lines.push(`${prefix} Tree${t + 1}: ${treeConfig.name}  Lv.${tree.treeLevel}/${MAX_TREE_LEVEL}  ${upInfo}`);

      for (let s = 0; s < 5; s += 1) {
        const skillName = treeConfig.skills[s];
        const unlocked = s < tree.treeLevel;
        const learned = tree.learnedSkills.find((ls) => ls.skillName === skillName);
        const isSelected = isActive && ui.selectedSkillIndex === s;
        const sel = isSelected ? '★' : ' ';
        const num = s + 1;

        if (learned) {
          const maxLv = getSkillMaxLevel(skillName);
          const canUp = canUpgradeSkill(learning, skillName);
          const upStatus = canUp === true ? `[U]↑` : `[U]${canUp}`;
          lines.push(`  ${sel}${num}.✓ ${skillName.padEnd(5)} Lv.${String(learned.level).padStart(2)}/${String(maxLv).padStart(2)} ${upStatus}`);
        } else if (!unlocked) {
          lines.push(`  ${sel}${num}.○ ${skillName.padEnd(5)} (need tree Lv.${s + 1})`);
        } else {
          const canLearn = canLearnSkill(learning, heroId, t, s);
          const learnInfo = canLearn === true ? '[L]learn' : `[L]${canLearn}`;
          lines.push(`  ${sel}${num}.○ ${skillName.padEnd(5)} ${learnInfo}`);
        }
      }
      lines.push('');
    }

    const keyLabels = SkillSlotKeyLabels[slot];
    const player = this.getPlayer(slot);
    const loadout = player?.skill.loadout;
    const bindParts: string[] = [];
    if (loadout) {
      for (let i = 0; i < 5; i += 1) {
        const binding = loadout.slots[i];
        const isSel = i === ui.selectedSlotIndex;
        const label = binding
          ? `${binding.skillName}.${binding.level}`
          : '-';
        bindParts.push(isSel ? `[▶${keyLabels[i]}:${label}]` : `[${keyLabels[i]}:${label}]`);
      }
    }
    lines.push(`BIND: ${bindParts.join(' ')}`);

    const passiveMax = Math.min(getPassiveSkillMaxLevel(learning.heroLevel), 5);
    const passiveParts: string[] = [];
    for (let p = 0; p < 5; p += 1) {
      passiveParts.push(`[${learning.passiveSkills[p]}]`);
    }
    lines.push(`PASSIVE: ${passiveParts.join(' ')}  cap:${passiveMax}`);

    lines.push('');
    lines.push('[1-5]pick [B]bind [U]upgrade [L]learn [G]tree [P]passive [Tab]switch');
    lines.push(`[Z]slot▶${ui.selectedSlotIndex} [V]close | ${ui.message || 'Ready'}`);

    return lines;
  }

export function updateSkillBars(this: any): void {
    if (this.p1SkillBar) {
      this.updateSkillBar(
        this.p1SkillBar,
        this.getPlayer('p1'),
        this.p1SkillUI,
        'p1',
      );
    }

    if (this.p2SkillBar) {
      this.updateSkillBar(
        this.p2SkillBar,
        this.getPlayer('p2'),
        this.p2SkillUI,
        'p2',
      );
    }
  }

export function updateSkillPanels(this: any): void {
    if (this.p1SkillPanel) {
      this.updateSkillPanel(
        this.p1SkillPanel,
        'p1',
        this.getPlayer('p1'),
        this.p1SkillUI,
        this.p1SkillLearning,
      );
    }

    if (this.p2SkillPanel) {
      this.updateSkillPanel(
        this.p2SkillPanel,
        'p2',
        this.getPlayer('p2'),
        this.p2SkillUI,
        this.p2SkillLearning,
      );
    }
  }

export function updateSkillBar(this: any,
    bar: SkillBarView,
    player: any | undefined,
    ui: SkillUIState,
    slot: PlayerSlot,
  ): void {
    if (!player) {
      return;
    }

    const keyLabels = SkillSlotKeyLabels[slot];
    const loadout = player.skill.loadout;

    for (let i = 0; i < 5; i += 1) {
      const binding = loadout.slots[i];
      const name = binding?.skillName ?? '-';
      const lvl = binding ? `.${binding.level}` : '';
      bar.slotLabels[i].setText(`${keyLabels[i]}: ${name}${lvl}`);
      bar.slotLabels[i].setColor(i === ui.selectedSlotIndex ? '#f3f6ff' : '#8a9bb5');
      bar.slotBgs[i].setStrokeStyle(1, i === ui.selectedSlotIndex ? 0x597a9e : 0x3a4d6b);
    }

    const hx = ui.selectedSlotIndex * 88;
    bar.highlight.setPosition(hx, 0);
    bar.highlight.setAlpha(1);

    bar.panelIndicator.setText(ui.skillPanelOpen ? '[V] panel open' : '');
  }

function getHeroTint(heroId: HeroId): number {
  switch (heroId) {
    case 1:
      return 0xf4d35e;
    case 2:
      return 0xf3f6ff;
    case 3:
      return 0xee8f55;
    case 4:
      return 0x74c0fc;
    case 5:
      return 0x91f5d6;
  }
}



