import Phaser from 'phaser';
import { AssetKeys } from '../assets/AssetManifest';
import { GameSettings } from '../core/GameSettings';
import {
  createDamageEvent,
  createHitRegistry,
  formatDamageEvent,
  resolveHitOnce,
  type DamageEvent,
  type HitRegistry,
} from '../systems/CombatSystem';
import {
  applyHeroDamage,
  createHeroCombat,
  isHeroCombatDead,
  isHeroInvulnerable,
  resetHeroCombat,
  updateHeroCombat,
  type HeroCombatModel,
} from '../systems/HeroCombatSystem';
import {
  createInputSystem,
  type InputState,
  type InputSystem,
  type PlayerInputState,
  type PlayerSlot,
} from '../systems/InputSystem';
import {
  createHeroMovement,
  updateHeroMovement,
  type HeroMovementBounds,
  type HeroMovementModel,
  type MovementPlatform,
} from '../systems/HeroMovementSystem';
import {
  applyMonster30Hit,
  createMonster30,
  getMonster30AttackHitbox,
  updateMonster30,
  type Monster30Model,
} from '../systems/Monster30System';
import {
  createHeroNormalAttack,
  getActiveHeroHitbox,
  HeroDisplayNames,
  setHeroId,
  setHeroWeaponMode,
  updateHeroNormalAttack,
  type ActiveHeroNormalAttack,
  type HeroId,
  type HeroNormalAttackModel,
} from '../systems/HeroNormalAttackSystem';
import {
  createProjectileSystem,
  getActiveProjectiles,
  getProjectileAttackId,
  getProjectileHitbox,
  recordProjectileHit,
  updateProjectiles,
  type ProjectileModel,
  type ProjectileSourceSnapshot,
  type ProjectileSystemModel,
} from '../systems/ProjectileSystem';
import {
  createHeroSkillModel,
  requestRole2SkillFromInput,
  resetHeroSkill,
  type HeroSkillCastEvent,
  type HeroSkillModel,
} from '../systems/HeroSkillSystem';
import {
  assignSkillToSlot,
  canLearnSkill,
  canUpgradePassiveSkill,
  canUpgradeSkill,
  canUpgradeTree,
  createSkillLearningState,
  createSkillUIState,
  getPassiveSkillMaxLevel,
  getSkillMaxLevel,
  getSkillTreeForHero,
  getTotalLearnedSkillCount,
  learnSkill,
  MAX_TREE_LEVEL,
  SKILL_LEARN_LIMIT,
  TREE_UPGRADE_COSTS,
  upgradePassiveSkill,
  upgradeSkill,
  upgradeTree,
  SkillSlotKeyLabels,
  findSkillInState,
  type HeroSkillLearningState,
  type SkillPanelTab,
  type SkillUIState,
} from '../systems/SkillUISystem';
import {
  applyMonster3Hit,
  getMonster3AttackHitbox,
  isMonster3Removed,
  updateMonster3,
} from '../systems/Monster3System';
import {
  activateBossArena,
  checkBossArenaTrigger,
  createBossArena,
  createVerticalClimbState,
  defaultClimbTuning,
  getSpawnCount,
  getSpawnPosition,
  isBossDead,
  isBossZoneTriggered,
  markStopPointWaveSpawned,
  markBossTriggered,
  revealTransferDoor,
  tryClearArena,
  updateCloudScrolls,
  updateVerticalClimbCamera,
  updateVerticalClimbSpawn,
  type BossArenaModel,
  type VerticalClimbState,
} from '../systems/LevelSystem';
import {
  calculateEffectiveStats,
  createEmptyEquipmentLoadout,
  createSeedEquipmentRegistry,
  HeroNamesById,
  type EquipmentDefinition,
  type EquipmentLoadout,
  type HeroBaseStats,
} from '../systems/EquipmentSystem';
import {
  createSeedInventoryStore,
  type InventoryStore,
} from '../systems/InventorySystem';
import {
  buildInventoryPanelLines,
  createInventoryUIState,
  equipSelectedInventoryEntry,
  moveInventorySelection,
  selectNextInventoryCategory,
  setInventoryFocus,
  toggleInventoryUI,
  unequipSelectedLoadoutSlot,
  type InventoryUIState,
} from '../systems/EquipmentUISystem';
import {
  createDropSystem,
  DropTuning,
  getDropPickupAlpha,
  getWorldDrops,
  maybeSpawnMedicineDrop,
  Monster30DropEntries,
  pickupMedicineDrop,
  pickupWorldDrop,
  spawnMedicineDrop,
  spawnWorldDrop,
  updateWorldDrops,
  type DropSystemModel,
  type MedicineDropType,
  type WorldDrop,
} from '../systems/DropSystem';

type PlayerView = {
  slot: PlayerSlot;
  sprite: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
  movement?: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  skill: HeroSkillModel;
  baseStats: HeroBaseStats;
};

type MonsterView = {
  root: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Ellipse;
  wingLeft: Phaser.GameObjects.Ellipse;
  wingRight: Phaser.GameObjects.Ellipse;
  eye: Phaser.GameObjects.Ellipse;
  hpTrack: Phaser.GameObjects.Rectangle;
  hpFill: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  stateText: Phaser.GameObjects.Text;
};

type AttackFlash = {
  shape: Phaser.GameObjects.Rectangle;
  expiresAt: number;
};

type AttackEffectView = {
  slot: PlayerSlot;
  attack: ActiveHeroNormalAttack;
  shape: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Ellipse;
  label: Phaser.GameObjects.Text;
};

type ProjectileEffectView = {
  projectileId: number;
  shape: Phaser.GameObjects.Ellipse;
  core: Phaser.GameObjects.Ellipse;
  label: Phaser.GameObjects.Text;
};

type DropView = {
  root: Phaser.GameObjects.Container;
  shadow: Phaser.GameObjects.Ellipse;
  body: Phaser.GameObjects.Ellipse;
  shine: Phaser.GameObjects.Ellipse;
  label: Phaser.GameObjects.Text;
  feedback: Phaser.GameObjects.Text;
};

type BossView = {
  body: Phaser.GameObjects.Ellipse;
  crown: Phaser.GameObjects.Ellipse;
  eye: Phaser.GameObjects.Ellipse;
  hpTrack: Phaser.GameObjects.Rectangle;
  hpFill: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  stateText: Phaser.GameObjects.Text;
};

type TransferDoorView = {
  frame: Phaser.GameObjects.Rectangle;
  glow: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
};

type HeroSelectionKeys = Record<HeroId, Phaser.Input.Keyboard.Key>;

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

export class TestScene extends Phaser.Scene {
  private inputSystem?: InputSystem;
  private statusText?: Phaser.GameObjects.Text;
  private playerViews: PlayerView[] = [];
  private monster30s: Monster30Model[] = [];
  private monsterViews = new Map<Monster30Model, MonsterView>();
  private lastInput?: InputState;
  private verticalClimb: VerticalClimbState = createVerticalClimbState(GameSettings.height);
  private cloudSprites: Phaser.GameObjects.Ellipse[] = [];
  private cloudBaseY: number[] = [];
  private attackFlashes: AttackFlash[] = [];
  private attackEffectViews: AttackEffectView[] = [];
  private projectileSystem: ProjectileSystemModel = createProjectileSystem();
  private projectileEffectViews: ProjectileEffectView[] = [];
  private dropSystem: DropSystemModel = createDropSystem();
  private dropViews = new Map<string, DropView>();
  private hitRegistry: HitRegistry = createHitRegistry();
  private lastDamageEvent?: DamageEvent;
  private lastSkillEvent?: HeroSkillCastEvent;
  private renderedMonsterAttackIds = new Set<string>();
  private p1HeroSelectKeys?: HeroSelectionKeys;
  private p2HeroSelectKeys?: HeroSelectionKeys;
  private p1WeaponToggleKey?: Phaser.Input.Keyboard.Key;
  private p2WeaponToggleKey?: Phaser.Input.Keyboard.Key;
  private p1SkillPanelKey?: Phaser.Input.Keyboard.Key;
  private p2SkillPanelKey?: Phaser.Input.Keyboard.Key;
  private p1LoadoutCycleKey?: Phaser.Input.Keyboard.Key;
  private p2LoadoutCycleKey?: Phaser.Input.Keyboard.Key;
  private panelTabKey?: Phaser.Input.Keyboard.Key;
  private panelBindKey?: Phaser.Input.Keyboard.Key;
  private panelUpgradeKey?: Phaser.Input.Keyboard.Key;
  private panelLearnKey?: Phaser.Input.Keyboard.Key;
  private panelTreeUpgradeKey?: Phaser.Input.Keyboard.Key;
  private panelPassiveKey?: Phaser.Input.Keyboard.Key;
  private panelSkillSelectKeys?: Phaser.Input.Keyboard.Key[];
  private inventoryToggleKey?: Phaser.Input.Keyboard.Key;
  private inventoryTabKey?: Phaser.Input.Keyboard.Key;
  private inventoryUpKey?: Phaser.Input.Keyboard.Key;
  private inventoryDownKey?: Phaser.Input.Keyboard.Key;
  private inventoryLeftKey?: Phaser.Input.Keyboard.Key;
  private inventoryRightKey?: Phaser.Input.Keyboard.Key;
  private inventoryConfirmKey?: Phaser.Input.Keyboard.Key;
  private inventoryBackspaceKey?: Phaser.Input.Keyboard.Key;
  private inventoryDeleteKey?: Phaser.Input.Keyboard.Key;
  private medicineSpawnKeys?: Record<MedicineDropType, Phaser.Input.Keyboard.Key>;
  private p1SkillUI: SkillUIState = createSkillUIState();
  private p2SkillUI: SkillUIState = createSkillUIState();
  private p1SkillBar?: SkillBarView;
  private p2SkillBar?: SkillBarView;
  private p1SkillLearning: HeroSkillLearningState = createSkillLearningState(10, 5000);
  private p2SkillLearning: HeroSkillLearningState = createSkillLearningState(10, 5000);
  private p1SkillPanel?: SkillPanelView;
  private p2SkillPanel?: SkillPanelView;
  private bossArena: BossArenaModel = createBossArena();
  private bossView?: BossView;
  private bossDoorView?: TransferDoorView;
  private bossArenaLabel?: Phaser.GameObjects.Text;
  private clearOverlay?: Phaser.GameObjects.Container;
  private arenaWasActive = false;
  private bossSpawnedOnce = false;
  private equipmentRegistry: Record<string, EquipmentDefinition> = createSeedEquipmentRegistry();
  private inventoryStore: InventoryStore = createSeedInventoryStore(this.equipmentRegistry);
  private equipmentLoadout: EquipmentLoadout = createEmptyEquipmentLoadout();
  private inventoryUI: InventoryUIState = createInventoryUIState();
  private inventoryPanel?: InventoryPanelView;
  private movementPlatforms: MovementPlatform[] = [];
  private movementBounds: HeroMovementBounds = {
    left: 0,
    right: defaultClimbTuning.worldWidth,
    bottom: defaultClimbTuning.worldHeight,
  };
  public constructor() {
    super('TestScene');
  }

  public create(): void {
    this.cameras.main.setBounds(
      0,
      0,
      defaultClimbTuning.worldWidth,
      defaultClimbTuning.worldHeight,
    );
    this.cameras.main.scrollY =
      defaultClimbTuning.worldHeight - GameSettings.height;

    const { worldHeight } = defaultClimbTuning;

    this.createStage();
    this.createClimbingPlatforms();
    this.createClouds();
    this.playerViews = this.createPlayerMarkers();

    this.movementPlatforms = [
      {
        id: 'climb-ground',
        kind: 'solid' as const,
        left: 30,
        right: defaultClimbTuning.worldWidth - 30,
        top: worldHeight - 45,
      },
      {
        id: 'platform-500',
        kind: 'through' as const,
        left: 230,
        right: 670,
        top: 500,
      },
      {
        id: 'platform-800',
        kind: 'through' as const,
        left: 200,
        right: 720,
        top: 800,
      },
      {
        id: 'platform-1100',
        kind: 'through' as const,
        left: 260,
        right: 700,
        top: 1100,
      },
      {
        id: 'platform-1400',
        kind: 'through' as const,
        left: 180,
        right: 740,
        top: 1400,
      },
      {
        id: 'platform-1700',
        kind: 'through' as const,
        left: 240,
        right: 690,
        top: 1700,
      },
      {
        id: 'platform-2000',
        kind: 'through' as const,
        left: 210,
        right: 710,
        top: 2000,
      },
      {
        id: 'platform-2300',
        kind: 'through' as const,
        left: 190,
        right: 730,
        top: 2300,
      },
      {
        id: 'through-platform',
        kind: 'through' as const,
        left: 280,
        right: 660,
        top: 330,
      },
      {
        id: 'arena-step1',
        kind: 'solid' as const,
        left: 200,
        right: 740,
        top: 280,
      },
      {
        id: 'arena-floor',
        kind: 'solid' as const,
        left: 100,
        right: 840,
        top: 200,
      },
    ];
    this.inputSystem = createInputSystem(this);
    this.createHeroDebugKeys();
    this.createSkillUIKeys();
    this.createInventoryUIKeys();
    this.createMedicineDebugKeys();
    this.p1SkillBar = this.createSkillBar('p1', 44, 540);
    this.p2SkillBar = this.createSkillBar('p2', 488, 540);
    this.p1SkillBar.container.setScrollFactor(0).setDepth(80);
    this.p2SkillBar.container.setScrollFactor(0).setDepth(80);
    this.p1SkillPanel = this.createSkillPanel('p1');
    this.p2SkillPanel = this.createSkillPanel('p2');
    this.p1SkillPanel.container.setScrollFactor(0).setDepth(85);
    this.p2SkillPanel.container.setScrollFactor(0).setDepth(85);
    this.inventoryPanel = this.createInventoryPanel();
    this.inventoryPanel.container.setScrollFactor(0).setDepth(95);
    this.bossView = this.createBossView();
    this.bossDoorView = this.createTransferDoorView();
    this.bossArenaLabel = this.add.text(470, 50, '', {
      color: '#f2c14e',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
    }).setOrigin(0.5, 0.5);
    this.drawBossArenaStage();
    this.statusText = this.add.text(24, 22, '', {
      color: '#f3f6ff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      lineSpacing: 6,
    }).setScrollFactor(0).setDepth(90);
  }

  public override update(time: number, delta: number): void {
    if (!this.inputSystem || !this.statusText) {
      return;
    }

    const input = this.inputSystem.read();
    const previousCameraY = this.verticalClimb.cameraY;

    this.updateHeroDebugSelection();
    this.updateHeroMovement(input, time, delta);
    this.updateHeroCombatStates(time, delta);
    this.updateHeroNormalAttacks(input, time);
    this.updateBossHitByPlayers(time);
    this.updateHeroSkillProjectiles(input);
    this.updateProjectileSystem(time, delta);

    this.updateMonster30s(delta);
    this.handleMedicineDebugKeys();
    updateWorldDrops(this.dropSystem, delta);
    this.handleDropPickup();
    this.applyAllMonster30Attacks(time);
    this.updateAllMonsterViews();
    this.updateDropViews();
    this.updateVerticalClimbLogic(input, time, delta, previousCameraY);
    this.finalizeCameraPosition();

    this.updateAttackEffectViews(time);
    this.updateAttackFlashes(time);
    this.handleInventoryUIKeys();
    if (!this.inventoryUI.isOpen) {
      this.handleSkillUIKeys();
    }
    this.updateSkillBars();
    if (this.p1SkillPanel) {
      this.updateSkillPanel(
        this.p1SkillPanel,
        'p1',
        this.playerViews.find((p) => p.slot === 'p1'),
        this.p1SkillUI,
        this.p1SkillLearning,
      );
    }
    if (this.p2SkillPanel) {
      this.updateSkillPanel(
        this.p2SkillPanel,
        'p2',
        this.playerViews.find((p) => p.slot === 'p2'),
        this.p2SkillUI,
        this.p2SkillLearning,
      );
    }
    this.updateBossArena(input, time, delta);
    this.updateBossArenaVisuals();
    this.updateCloudVisuals();
    this.updateInventoryPanel();
    this.updateStatusText(input);
    this.lastInput = input;
  }

  private createStage(): void {
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

  private createPlayerMarkers(): PlayerView[] {
    const groundY = defaultClimbTuning.worldHeight - 45;
    const p1 = this.createPlayerView(
      'p1',
      2,
      defaultClimbTuning.worldWidth * 0.34,
      groundY,
    );
    const p2 = this.createPlayerView(
      'p2',
      3,
      defaultClimbTuning.worldWidth * 0.58,
      groundY,
    );
    p1.movement = createHeroMovement(p1.sprite.x, p1.sprite.y);
    p2.movement = createHeroMovement(p2.sprite.x, p2.sprite.y);
    p1.movement.currentPlatformId = 'climb-ground';
    p2.movement.currentPlatformId = 'climb-ground';

    return [p1, p2];
  }

  private createClimbingPlatforms(): void {
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

  private createClouds(): void {
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

  private createPlayerView(
    slot: PlayerSlot,
    heroId: HeroId,
    x: number,
    y: number,
  ): PlayerView {
    const sprite = this.add.image(x, y, AssetKeys.playerPlaceholder);
    sprite.setOrigin(0.5, 1);
    sprite.setTint(getHeroTint(heroId));

    const label = this.add.text(x - 18, y + 14, slot.toUpperCase(), {
      color: '#f3f6ff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
    });

    const normalAttack = createHeroNormalAttack(heroId);
    const combat = createHeroCombat(slot);
    const skill = createHeroSkillModel();
    const baseStats = {
      maxHp: combat.maxHp,
      maxMp: skill.maxMp,
      power: 0,
      defense: 0,
    };
    label.setText(formatHeroLabel(slot, normalAttack, combat));

    return { slot, sprite, label, combat, normalAttack, skill, baseStats };
  }

  private createMonsterView(monster: Monster30Model): MonsterView {
    const root = this.add.container(monster.x, monster.y);
    const wingLeft = this.add.ellipse(-28, 2, 34, 18, 0x445d7e);
    const wingRight = this.add.ellipse(28, 2, 34, 18, 0x445d7e);
    const body = this.add.ellipse(0, 0, 72, 56, 0x7b4e79);
    const eye = this.add.ellipse(14, -8, 12, 12, 0xf5d27a);
    const hpTrack = this.add.rectangle(0, -48, 82, 8, 0x182233);
    const hpFill = this.add.rectangle(-41, -48, 82, 8, 0xe3646d);
    hpFill.setOrigin(0, 0.5);
    const label = this.add.text(-42, -78, 'Monster30', {
      color: '#f3f6ff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
    });
    const stateText = this.add.text(-42, -62, '', {
      color: '#c8d3e2',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
    });

    root.add([wingLeft, wingRight, body, eye, hpTrack, hpFill, label, stateText]);

    return {
      root,
      body,
      wingLeft,
      wingRight,
      eye,
      hpTrack,
      hpFill,
      label,
      stateText,
    };
  }

  private createHeroDebugKeys(): void {
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

  private createSkillUIKeys(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    this.p1SkillPanelKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V);
    this.p2SkillPanelKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_SUBTRACT);
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

  private createInventoryUIKeys(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    this.inventoryToggleKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    this.inventoryTabKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    this.inventoryUpKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.inventoryDownKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.inventoryLeftKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.inventoryRightKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.inventoryConfirmKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.inventoryBackspaceKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);
    this.inventoryDeleteKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DELETE);
  }

  private createMedicineDebugKeys(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    this.medicineSpawnKeys = {
      SmallHP: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SIX),
      BigHP: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SEVEN),
      SmallMP: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.EIGHT),
    };
  }

  private createInventoryPanel(): InventoryPanelView {
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

  private createSkillBar(slot: PlayerSlot, x: number, y: number): SkillBarView {
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

  private createSkillPanel(slot: PlayerSlot): SkillPanelView {
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

  private updateSkillPanel(
    panel: SkillPanelView,
    slot: PlayerSlot,
    player: PlayerView | undefined,
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

  private buildSkillPanelLines(
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
    const player = this.playerViews.find((p) => p.slot === slot);
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

  private updateSkillBars(): void {
    if (this.p1SkillBar) {
      this.updateSkillBar(
        this.p1SkillBar,
        this.playerViews.find((p) => p.slot === 'p1'),
        this.p1SkillUI,
        'p1',
      );
    }

    if (this.p2SkillBar) {
      this.updateSkillBar(
        this.p2SkillBar,
        this.playerViews.find((p) => p.slot === 'p2'),
        this.p2SkillUI,
        'p2',
      );
    }
  }

  private updateSkillBar(
    bar: SkillBarView,
    player: PlayerView | undefined,
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

  private handleInventoryUIKeys(): void {
    if (this.inventoryToggleKey && Phaser.Input.Keyboard.JustDown(this.inventoryToggleKey)) {
      toggleInventoryUI(this.inventoryUI);
      if (this.inventoryUI.isOpen) {
        this.p1SkillUI.skillPanelOpen = false;
        this.p2SkillUI.skillPanelOpen = false;
      }
    }

    if (!this.inventoryUI.isOpen) {
      return;
    }

    if (this.inventoryTabKey && Phaser.Input.Keyboard.JustDown(this.inventoryTabKey)) {
      selectNextInventoryCategory(this.inventoryUI, this.inventoryStore, 1);
    }

    if (this.inventoryLeftKey && Phaser.Input.Keyboard.JustDown(this.inventoryLeftKey)) {
      setInventoryFocus(this.inventoryUI, 'inventory');
    }

    if (this.inventoryRightKey && Phaser.Input.Keyboard.JustDown(this.inventoryRightKey)) {
      setInventoryFocus(this.inventoryUI, 'loadout');
    }

    if (this.inventoryUpKey && Phaser.Input.Keyboard.JustDown(this.inventoryUpKey)) {
      moveInventorySelection(this.inventoryUI, this.inventoryStore, -1);
    }

    if (this.inventoryDownKey && Phaser.Input.Keyboard.JustDown(this.inventoryDownKey)) {
      moveInventorySelection(this.inventoryUI, this.inventoryStore, 1);
    }

    if (this.inventoryConfirmKey && Phaser.Input.Keyboard.JustDown(this.inventoryConfirmKey)) {
      if (this.inventoryUI.focus === 'inventory') {
        if (equipSelectedInventoryEntry({
          ui: this.inventoryUI,
          store: this.inventoryStore,
          loadout: this.equipmentLoadout,
          heroName: this.getInventoryHeroName(),
        })) {
          this.syncInventoryHeroStats();
        }
      } else if (unequipSelectedLoadoutSlot({
        ui: this.inventoryUI,
        store: this.inventoryStore,
        loadout: this.equipmentLoadout,
      })) {
        this.syncInventoryHeroStats();
      }
    }

    const unequipPressed =
      (this.inventoryBackspaceKey && Phaser.Input.Keyboard.JustDown(this.inventoryBackspaceKey)) ||
      (this.inventoryDeleteKey && Phaser.Input.Keyboard.JustDown(this.inventoryDeleteKey));
    if (unequipPressed && unequipSelectedLoadoutSlot({
      ui: this.inventoryUI,
      store: this.inventoryStore,
      loadout: this.equipmentLoadout,
    })) {
      this.syncInventoryHeroStats();
    }
  }

  private updateInventoryPanel(): void {
    if (!this.inventoryPanel) {
      return;
    }

    if (!this.inventoryUI.isOpen) {
      this.inventoryPanel.container.setVisible(false);
      return;
    }

    this.inventoryPanel.container.setVisible(true);
    const player = this.getInventoryPlayer();
    const lines = buildInventoryPanelLines({
      store: this.inventoryStore,
      loadout: this.equipmentLoadout,
      baseStats: player?.baseStats ?? { maxHp: 120, maxMp: 160, power: 0, defense: 0 },
      playerLabel: player?.slot.toUpperCase() ?? 'P1',
      heroName: this.getInventoryHeroName(),
      ui: this.inventoryUI,
    });
    this.inventoryPanel.text.setText(lines.join('\n'));
  }

  private handleSkillUIKeys(): void {
    this.handleSkillUIForPlayer(
      'p1',
      this.p1SkillPanelKey,
      this.p1LoadoutCycleKey,
      this.p1SkillUI,
    );
    this.handleSkillUIForPlayer(
      'p2',
      this.p2SkillPanelKey,
      this.p2LoadoutCycleKey,
      this.p2SkillUI,
    );

    const p1Open = this.p1SkillUI.skillPanelOpen;
    const p2Open = this.p2SkillUI.skillPanelOpen;
    if (!p1Open && !p2Open) return;

    const activeSlot: PlayerSlot = p1Open ? 'p1' : 'p2';
    const activeUI = p1Open ? this.p1SkillUI : this.p2SkillUI;
    const activeLearning = p1Open ? this.p1SkillLearning : this.p2SkillLearning;
    const activePlayer = this.playerViews.find((p) => p.slot === activeSlot);
    activeUI.message = '';

    if (this.panelTabKey && Phaser.Input.Keyboard.JustDown(this.panelTabKey)) {
      const tabs: SkillPanelTab[] = ['tree1', 'tree2', 'binding', 'passive'];
      const idx = tabs.indexOf(activeUI.activeTab);
      activeUI.activeTab = tabs[(idx + 1) % tabs.length];
      activeUI.selectedSkillIndex = 0;
    }

    if (this.panelSkillSelectKeys) {
      for (let i = 0; i < this.panelSkillSelectKeys.length; i += 1) {
        if (Phaser.Input.Keyboard.JustDown(this.panelSkillSelectKeys[i])) {
          if (activeUI.activeTab === 'passive') {
            activeUI.selectedSkillIndex = i;
          } else {
            activeUI.selectedSkillIndex = i;
          }
        }
      }
    }

    const heroId = activePlayer?.normalAttack.heroId ?? 2;

    if (this.panelTreeUpgradeKey && Phaser.Input.Keyboard.JustDown(this.panelTreeUpgradeKey)) {
      const treeIdx = activeUI.activeTab === 'tree2' ? 1 : 0;
      if (upgradeTree(activeLearning, treeIdx)) {
        activeUI.message = `Tree ${treeIdx + 1} upgraded to Lv.${activeLearning.trees[treeIdx].treeLevel}`;
      } else {
        activeUI.message = String(canUpgradeTree(activeLearning, treeIdx));
      }
    }

    if (this.panelLearnKey && Phaser.Input.Keyboard.JustDown(this.panelLearnKey)) {
      const treeIdx = activeUI.activeTab === 'tree2' ? 1 : 0;
      const skillIdx = activeUI.selectedSkillIndex;
      const result = learnSkill(activeLearning, heroId, treeIdx, skillIdx);
      if (result) {
        activeUI.message = `Learned ${result}!`;
      } else {
        activeUI.message = String(canLearnSkill(activeLearning, heroId, treeIdx, skillIdx));
      }
    }

    if (this.panelUpgradeKey && Phaser.Input.Keyboard.JustDown(this.panelUpgradeKey)) {
      const treeIdx = activeUI.activeTab === 'tree2' ? 1 : 0;
      const treeConfig = getSkillTreeForHero(heroId, treeIdx);
      if (treeConfig) {
        const skillName = treeConfig.skills[activeUI.selectedSkillIndex];
        if (upgradeSkill(activeLearning, skillName)) {
          const entry = findSkillInState(activeLearning, skillName);
          activeUI.message = `${skillName} upgraded to Lv.${entry?.level}`;
        } else {
          activeUI.message = String(canUpgradeSkill(activeLearning, skillName));
        }
      }
    }

    if (this.panelBindKey && Phaser.Input.Keyboard.JustDown(this.panelBindKey)) {
      if (activePlayer) {
        const treeIdx = activeUI.activeTab === 'tree2' ? 1 : 0;
        const treeConfig = getSkillTreeForHero(heroId, treeIdx);
        if (treeConfig) {
          const skillName = treeConfig.skills[activeUI.selectedSkillIndex];
          const found = findSkillInState(activeLearning, skillName);
          if (found) {
            activePlayer.skill.loadout = assignSkillToSlot(
              activePlayer.skill.loadout,
              activeUI.selectedSlotIndex,
              skillName,
              found.level,
            );
            activeUI.message = `Bound ${skillName} to slot ${activeUI.selectedSlotIndex}`;
          } else {
            activeUI.message = `${skillName} not learned yet`;
          }
        }
      }
    }

    if (this.panelPassiveKey && Phaser.Input.Keyboard.JustDown(this.panelPassiveKey)) {
      const slotIdx = activeUI.selectedSkillIndex;
      if (upgradePassiveSkill(activeLearning, slotIdx)) {
        activeUI.message = `Passive ${slotIdx + 1} upgraded to Lv.${activeLearning.passiveSkills[slotIdx]}`;
      } else {
        activeUI.message = String(canUpgradePassiveSkill(activeLearning, slotIdx));
      }
    }
  }

  private handleSkillUIForPlayer(
    _slot: PlayerSlot,
    panelKey: Phaser.Input.Keyboard.Key | undefined,
    cycleKey: Phaser.Input.Keyboard.Key | undefined,
    ui: SkillUIState,
  ): void {
    if (panelKey && Phaser.Input.Keyboard.JustDown(panelKey)) {
      ui.skillPanelOpen = !ui.skillPanelOpen;
      ui.message = '';
      if (ui.skillPanelOpen) {
        ui.activeTab = 'tree1';
        ui.selectedSkillIndex = 0;
      }
    }

    if (cycleKey && Phaser.Input.Keyboard.JustDown(cycleKey)) {
      ui.selectedSlotIndex = (ui.selectedSlotIndex + 1) % 5;
    }
  }

  private drawBossArenaStage(): void {
    this.add.rectangle(470, 200, 760, 8, 0xd4a574);
    this.add.rectangle(470, 280, 560, 6, 0x888c94);
    this.add.rectangle(470, 220, 940, 20, 0x101724, 0.3);
    this.add.text(180, 164, 'BOSS ARENA', {
      color: '#d4a574',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
    });
    this.add.text(470, 190, '↑ enter to trigger ↑', {
      color: '#8a9bb5',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
    }).setOrigin(0.5, 0.5);
  }

  private createBossView(): BossView {
    const body = this.add.ellipse(470, 120, 90, 70, 0x8b2252);
    const crown = this.add.ellipse(470, 72, 48, 32, 0xd4a574);
    const eye = this.add.ellipse(482, 108, 14, 14, 0xf5d27a);
    const hpTrack = this.add.rectangle(470, 48, 96, 8, 0x182233);
    const hpFill = this.add.rectangle(422, 48, 96, 8, 0xe3646d);
    hpFill.setOrigin(0, 0.5);
    const label = this.add.text(410, 18, 'Monster3 巫鹰', {
      color: '#f3f6ff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
    });
    const stateText = this.add.text(410, 34, '', {
      color: '#c8d3e2',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
    });

    body.setVisible(false);
    crown.setVisible(false);
    eye.setVisible(false);
    hpTrack.setVisible(false);
    hpFill.setVisible(false);
    label.setVisible(false);
    stateText.setVisible(false);

    return { body, crown, eye, hpTrack, hpFill, label, stateText };
  }

  private createTransferDoorView(): TransferDoorView {
    const frame = this.add.rectangle(470, 270, 90, 110, 0x182233, 0.85);
    frame.setStrokeStyle(2, 0xf2c14e);
    const glow = this.add.rectangle(470, 270, 78, 98, 0xf2c14e, 0.1);
    glow.setStrokeStyle(1, 0xf2c14e, 0.5);
    const label = this.add.text(470, 300, 'DOOR\n[↑]', {
      color: '#f2c14e',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    frame.setVisible(false);
    glow.setVisible(false);
    label.setVisible(false);

    return { frame, glow, label };
  }

  private updateBossArena(input: InputState, time: number, delta: number): void {
    if (this.bossArena.state === 'cleared') {
      return;
    }

    if (this.bossArena.state === 'inactive') {
      for (const player of this.playerViews) {
        if (!player.movement || isHeroCombatDead(player.combat)) {
          continue;
        }

        if (checkBossArenaTrigger(this.bossArena, player.sprite.x, player.sprite.y)) {
          this.activateBossFight();
          break;
        }
      }
      return;
    }

    if (this.bossArena.state === 'active' && this.bossArena.boss) {
      updateMonster3(
        this.bossArena.boss,
        this.getMonster3Targets(),
        delta,
      );

      if (!this.bossSpawnedOnce && this.bossArena.boss.state !== 'dead') {
        this.bossSpawnedOnce = true;
      }

      this.applyBossAttack(time);

      if (isBossDead(this.bossArena.boss) && !this.bossArena.door.visible) {
        revealTransferDoor(this.bossArena);
        if (this.bossDoorView) {
          this.bossDoorView.frame.setVisible(true);
          this.bossDoorView.glow.setVisible(true);
          this.bossDoorView.label.setVisible(true);
        }
      }

      for (const player of this.playerViews) {
        if (!player.movement || isHeroCombatDead(player.combat)) {
          continue;
        }

        if (tryClearArena(
          this.bossArena,
          player.sprite.x,
          player.sprite.y,
          input[player.slot].up,
        )) {
          this.showClearOverlay();
          return;
        }
      }
    }
  }

  private activateBossFight(): void {
    if (this.bossArena.state !== 'inactive') {
      return;
    }

    activateBossArena(this.bossArena);
    this.arenaWasActive = true;
    this.bossSpawnedOnce = true;

    if (this.bossView) {
      this.bossView.body.setVisible(true);
      this.bossView.crown.setVisible(true);
      this.bossView.eye.setVisible(true);
      this.bossView.hpTrack.setVisible(true);
      this.bossView.hpFill.setVisible(true);
      this.bossView.label.setVisible(true);
      this.bossView.stateText.setVisible(true);
    }
  }

  private getMonster3Targets(): readonly { slot: PlayerSlot; x: number; y: number }[] {
    return this.playerViews
      .filter((player) => player.movement !== undefined && !isHeroCombatDead(player.combat))
      .map((player) => ({
        slot: player.slot,
        x: player.sprite.x,
        y: player.sprite.y,
      }));
  }

  private applyBossAttack(time: number): void {
    const boss = this.bossArena.boss;
    if (!boss) {
      return;
    }

    const hitbox = getMonster3AttackHitbox(boss);
    const activeAttack = boss.activeAttack;
    if (!hitbox || !activeAttack) {
      if (boss.state === 'hit1' || boss.state === 'hit2') {
        this.renderedMonsterAttackIds.add(activeAttack?.attackId ?? '');
      }
      return;
    }

    if (!this.renderedMonsterAttackIds.has(activeAttack.attackId)) {
      this.renderedMonsterAttackIds.add(activeAttack.attackId);
      this.showAttackFlash(toPhaserRect(hitbox), time, 0xff4444);
    }

    const attackBounds = toPhaserRect(hitbox);
    for (const player of this.playerViews) {
      if (!player.movement || isHeroCombatDead(player.combat)) {
        continue;
      }

      if (!Phaser.Geom.Intersects.RectangleToRectangle(attackBounds, this.getPlayerBounds(player))) {
        continue;
      }

      if (!resolveHitOnce(this.hitRegistry, activeAttack.attackId, player.slot)) {
        continue;
      }

      const damageEvent = createDamageEvent({
        sourceId: 'monster3',
        targetId: player.slot,
        attackId: activeAttack.attackId,
        actionName: activeAttack.actionName,
        amount: activeAttack.damage,
        attackKind: activeAttack.attackKind,
        knockbackX: activeAttack.facingX * activeAttack.knockbackX,
        knockbackY: activeAttack.knockbackY,
        occurredAtMs: time,
      });

      if (applyHeroDamage(player.combat, damageEvent, time)) {
        this.lastDamageEvent = damageEvent;
      }
    }
  }

  private applyPlayerHitOnBoss(player: PlayerView, time: number): void {
    const boss = this.bossArena.boss;
    if (!boss || !player.movement || isBossDead(boss)) {
      return;
    }

    const activeAttack = player.normalAttack.activeAttack;
    const hitbox = getActiveHeroHitbox(player.normalAttack, player.movement, time);
    if (!activeAttack || !hitbox) {
      return;
    }

    const attackId = `${player.slot}-vs-boss-${activeAttack.id}`;
    const attackBounds = toPhaserRect(hitbox);
    const bossBounds = this.getBossBounds();

    if (!Phaser.Geom.Intersects.RectangleToRectangle(attackBounds, bossBounds)) {
      return;
    }

    if (!resolveHitOnce(this.hitRegistry, attackId, 'monster3')) {
      return;
    }

    const damageEvent = createDamageEvent({
      sourceId: player.slot,
      targetId: 'monster3',
      attackId,
      actionName: activeAttack.actionName,
      amount: activeAttack.damage,
      attackKind: activeAttack.attackKind,
      knockbackX: activeAttack.facingX * 4,
      knockbackY: -2,
      occurredAtMs: time,
    });
    this.lastDamageEvent = damageEvent;
    applyMonster3Hit(boss, damageEvent.amount);
  }

  private getBossBounds(): Phaser.Geom.Rectangle {
    const boss = this.bossArena.boss;
    if (!boss) {
      return new Phaser.Geom.Rectangle();
    }

    return new Phaser.Geom.Rectangle(boss.x - 45, boss.y - 35, 90, 70);
  }

  private updateBossHitByPlayers(time: number): void {
    if (this.bossArena.state !== 'active' || !this.bossArena.boss) {
      return;
    }

    for (const player of this.playerViews) {
      if (player.movement && !isHeroCombatDead(player.combat)) {
        this.applyPlayerHitOnBoss(player, time);
      }
    }
  }

  private updateBossArenaVisuals(): void {
    const boss = this.bossArena.boss;
    if (!boss || !this.bossView || !this.bossArenaLabel) {
      return;
    }

    if (this.bossArena.state === 'inactive') {
      this.bossArenaLabel.setText('');
      return;
    }

    if (this.bossArena.state === 'cleared') {
      this.bossArenaLabel.setText('CLEARED');
      this.bossView.body.setAlpha(0.3);
      this.bossView.crown.setAlpha(0.3);
      this.bossView.eye.setVisible(false);
      return;
    }

    if (!this.arenaWasActive) {
      return;
    }

    const hpRatio = boss.maxHp === 0 ? 0 : boss.hp / boss.maxHp;
    this.bossView.body.setPosition(boss.x, boss.y);
    this.bossView.crown.setPosition(boss.x, boss.y - 36);
    this.bossView.eye.setPosition(boss.x + 12, boss.y - 12);
    this.bossView.hpTrack.setPosition(boss.x - 48, boss.y - 55);
    this.bossView.hpFill.setPosition(boss.x - 48, boss.y - 55);
    this.bossView.label.setPosition(boss.x - 58, boss.y - 80);
    this.bossView.stateText.setPosition(boss.x - 58, boss.y - 64);
    this.bossView.hpFill.width = 96 * hpRatio;
    this.bossView.body.setScale(boss.facingX < 0 ? -1 : 1, 1);
    this.bossView.stateText.setText(`state:${boss.state} | hp:${boss.hp}/${boss.maxHp}`);
    this.bossView.body.setFillStyle(
      boss.state === 'hurt' ? 0xc96a6a :
      boss.state === 'dead' ? 0x606b7b :
      0x8b2252,
    );
    this.bossView.eye.setVisible(boss.state !== 'dead' && !isMonster3Removed(boss));
    this.bossArenaLabel.setText(
      boss.state === 'dead' ? 'BOSS DEFEATED — enter the door' :
      'BOSS FIGHT',
    );
  }

  private showClearOverlay(): void {
    if (this.clearOverlay) {
      return;
    }

    const bg = this.add.rectangle(470, 295, 940, 590, 0x000000, 0.7);
    const title = this.add.text(470, 240, 'LEVEL CLEAR', {
      color: '#f2c14e',
      fontFamily: 'Arial, sans-serif',
      fontSize: '42px',
    }).setOrigin(0.5, 0.5);
    const sub = this.add.text(470, 310, '1-1 巫鹰 defeated', {
      color: '#f3f6ff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
    }).setOrigin(0.5, 0.5);

    this.clearOverlay = this.add.container(0, 0, [bg, title, sub]);
    this.clearOverlay.setDepth(100);
  }

  private updateHeroDebugSelection(): void {
    this.updateHeroSelectKeys('p1', this.p1HeroSelectKeys);
    this.updateHeroSelectKeys('p2', this.p2HeroSelectKeys);
    this.updateHeroWeaponToggle('p1', this.p1WeaponToggleKey);
    this.updateHeroWeaponToggle('p2', this.p2WeaponToggleKey);
  }

  private updateHeroSelectKeys(
    slot: PlayerSlot,
    keys: HeroSelectionKeys | undefined,
  ): void {
    if (!keys) {
      return;
    }

    const heroIds: readonly HeroId[] = [1, 2, 3, 4, 5];
    for (const heroId of heroIds) {
      if (Phaser.Input.Keyboard.JustDown(keys[heroId])) {
        const player = this.playerViews.find((view) => view.slot === slot);
        if (player) {
          setHeroId(player.normalAttack, heroId);
          resetHeroCombat(player.combat);
          resetHeroSkill(player.skill);
          this.refreshPlayerHeroView(player);
        }
      }
    }
  }

  private updateHeroWeaponToggle(
    slot: PlayerSlot,
    key: Phaser.Input.Keyboard.Key | undefined,
  ): void {
    if (!key || !Phaser.Input.Keyboard.JustDown(key)) {
      return;
    }

    const player = this.playerViews.find((view) => view.slot === slot);
    if (!player) {
      return;
    }

    const model = player.normalAttack;
    if (model.heroId === 4) {
      setHeroWeaponMode(model, model.weaponMode === 'arrow' ? 'shovel' : 'arrow');
    } else if (model.heroId === 5) {
      setHeroWeaponMode(model, model.weaponMode === 'sword' ? 'spear' : 'sword');
    }

    this.refreshPlayerHeroView(player);
  }

  private getMonsterTargets(): readonly { slot: PlayerSlot; x: number; y: number }[] {
    return this.playerViews
      .filter((player) => player.movement !== undefined && !isHeroCombatDead(player.combat))
      .map((player) => ({
        slot: player.slot,
        x: player.sprite.x,
        y: player.sprite.y,
      }));
  }

  private updateHeroMovement(input: InputState, time: number, delta: number): void {
    for (const player of this.playerViews) {
      if (!player.movement) {
        continue;
      }

      if (isHeroCombatDead(player.combat)) {
        player.sprite.setPosition(player.movement.x, player.movement.y);
        player.label.setPosition(player.sprite.x - 58, player.sprite.y + 14);
        continue;
      }

      updateHeroMovement(
        player.movement,
        input[player.slot],
        this.lastInput?.[player.slot],
        this.movementPlatforms,
        this.movementBounds,
        time,
        delta,
      );

      player.sprite.setPosition(player.movement.x, player.movement.y);
      player.sprite.setFlipX(player.movement.facingX < 0);
      player.label.setPosition(player.sprite.x - 58, player.sprite.y + 14);
    }
  }

  private updateHeroCombatStates(time: number, delta: number): void {
    for (const player of this.playerViews) {
      if (!player.movement) {
        continue;
      }

      updateHeroCombat(player.combat, player.movement, this.movementBounds, time, delta);
      player.sprite.setPosition(player.movement.x, player.movement.y);
      player.label.setPosition(player.sprite.x - 58, player.sprite.y + 14);
      player.label.setText(formatHeroLabel(player.slot, player.normalAttack, player.combat));
      this.updatePlayerCombatVisual(player, time);
    }
  }

  private updateHeroNormalAttacks(input: InputState, time: number): void {
    for (const player of this.playerViews) {
      if (!player.movement || isHeroCombatDead(player.combat)) {
        continue;
      }

      const attackEvent = updateHeroNormalAttack(
        player.normalAttack,
        input[player.slot],
        this.lastInput?.[player.slot],
        player.movement,
        time,
      );

      if (attackEvent) {
        this.attackEffectViews.push(this.createAttackEffectView(player, attackEvent.attack));
        this.showAttackFlash(toPhaserRect(attackEvent.hitbox), time);
      }

      this.applyHeroAttackHit(player, time);
    }
  }

  private updateHeroSkillProjectiles(input: InputState): void {
    for (const player of this.playerViews) {
      const movement = player.movement;
      if (!movement || player.normalAttack.heroId !== 2) {
        continue;
      }

      const skillEvent = requestRole2SkillFromInput({
        skill: player.skill,
        input: input[player.slot],
        previousInput: this.lastInput?.[player.slot],
        movement,
        combat: player.combat,
        normalAttack: player.normalAttack,
        projectiles: this.projectileSystem,
      });

      if (skillEvent) {
        this.lastSkillEvent = skillEvent;
        this.createProjectileEffectView(skillEvent.projectile);
      }
    }
  }

  private updateProjectileSystem(time: number, delta: number): void {
    updateProjectiles(this.projectileSystem, this.createProjectileSourceSnapshots(), delta);
    this.applyProjectileHits(time);
    this.updateProjectileEffectViews();
  }

  private createProjectileSourceSnapshots(): readonly ProjectileSourceSnapshot[] {
    return this.playerViews.map((player) => ({
      id: player.slot,
      state: player.combat.state,
    }));
  }

  private updateMonster30s(delta: number): void {
    const targets = this.getMonsterTargets();
    const surviving: Monster30Model[] = [];

    for (const monster of this.monster30s) {
      updateMonster30(monster, targets, delta);
      if (monster.state !== 'removed') {
        surviving.push(monster);
      } else {
        this.spawnMonster30DropSlice(monster);
      }
    }

    for (const [monster, view] of this.monsterViews) {
      if (monster.state === 'removed') {
        this.destroyMonsterView(view);
        this.monsterViews.delete(monster);
      }
    }

    this.monster30s = surviving;
  }

  private applyAllMonster30Attacks(time: number): void {
    for (const monster of this.monster30s) {
      this.applySingleMonster30Attack(monster, time);
    }
  }

  private applySingleMonster30Attack(monster: Monster30Model, time: number): void {
    if (monster.state === 'removed') {
      return;
    }

    const activeAttack = monster.activeAttack;
    const hitbox = getMonster30AttackHitbox(monster);
    if (!activeAttack || !hitbox) {
      return;
    }

    if (!this.renderedMonsterAttackIds.has(activeAttack.attackId)) {
      this.renderedMonsterAttackIds.add(activeAttack.attackId);
      this.showAttackFlash(toPhaserRect(hitbox), time, 0xff6b6b);
    }

    const attackBounds = toPhaserRect(hitbox);
    for (const player of this.playerViews) {
      if (!player.movement || isHeroCombatDead(player.combat)) {
        continue;
      }

      if (!Phaser.Geom.Intersects.RectangleToRectangle(
        attackBounds,
        this.getPlayerBounds(player),
      )) {
        continue;
      }

      if (!resolveHitOnce(this.hitRegistry, activeAttack.attackId, player.slot)) {
        continue;
      }

      const damageEvent = createDamageEvent({
        sourceId: monster.id,
        targetId: player.slot,
        attackId: activeAttack.attackId,
        actionName: activeAttack.actionName,
        amount: activeAttack.damage,
        attackKind: activeAttack.attackKind,
        knockbackX: activeAttack.facingX * activeAttack.knockbackX,
        knockbackY: activeAttack.knockbackY,
        occurredAtMs: time,
      });

      if (applyHeroDamage(player.combat, damageEvent, time)) {
        this.lastDamageEvent = damageEvent;
      }
    }
  }

  private updateAllMonsterViews(): void {
    for (const monster of this.monster30s) {
      let view = this.monsterViews.get(monster);
      if (!view) {
        view = this.createMonsterView(monster);
        this.monsterViews.set(monster, view);
      }
      this.syncMonsterView(monster, view);
    }

    for (const [monster, view] of this.monsterViews) {
      if (!this.monster30s.includes(monster)) {
        this.destroyMonsterView(view);
        this.monsterViews.delete(monster);
      }
    }
  }

  private syncMonsterView(monster: Monster30Model, view: MonsterView): void {
    const hpRatio = monster.maxHp === 0 ? 0 : monster.hp / monster.maxHp;
    view.root.setPosition(monster.x, monster.y);
    view.root.setVisible(monster.state !== 'removed');
    view.root.setAlpha(monster.state === 'dead' ? 0.45 : 1);
    view.root.setScale(monster.facingX < 0 ? -1 : 1, 1);
    view.hpFill.width = 82 * hpRatio;
    view.stateText.setText(`${monster.state} | hp:${monster.hp}/${monster.maxHp}`);
    view.body.setFillStyle(getMonsterColor(monster.state));
    view.wingLeft.setAlpha(monster.state === 'hit1' ? 0.95 : 0.7);
    view.wingRight.setAlpha(monster.state === 'hit1' ? 0.95 : 0.7);
    view.eye.setVisible(monster.state !== 'dead' && monster.state !== 'removed');
  }

  private destroyMonsterView(view: MonsterView): void {
    view.root.destroy();
  }

  private updateVerticalClimbLogic(
    _input: InputState,
    _time: number,
    delta: number,
    previousCameraY: number,
  ): void {
    const playerMinY = this.getPlayerMinY();

    if (!this.verticalClimb.bossTriggered) {
      updateVerticalClimbCamera(
        this.verticalClimb,
        playerMinY,
        delta,
        GameSettings.height,
      );

      const activeMonsterCount = this.monster30s.filter(
        (m) => m.state !== 'dead' && m.state !== 'removed',
      ).length;
      const alivePlayerCount = this.playerViews.filter(
        (p) => p.movement && !isHeroCombatDead(p.combat),
      ).length;
      const activeStopIndexBeforeSpawn = this.verticalClimb.activeStopIndex;
      if (updateVerticalClimbSpawn(this.verticalClimb, delta, activeMonsterCount, alivePlayerCount)) {
        const spawnedCount = this.spawnMonster30Wave();
        if (activeStopIndexBeforeSpawn >= 0) {
          markStopPointWaveSpawned(
            this.verticalClimb,
            activeStopIndexBeforeSpawn,
            spawnedCount,
          );
        }
      }

      if (isBossZoneTriggered(this.verticalClimb, playerMinY)) {
        markBossTriggered(this.verticalClimb);
        this.activateBossFight();
      }
    }

    const cameraDelta = this.verticalClimb.cameraY - previousCameraY;
    if (Math.abs(cameraDelta) > 0.01) {
      updateCloudScrolls(this.verticalClimb, cameraDelta);
    }

    this.applyBossArenaClamp();
  }

  private getPlayerMinY(): number {
    let minY = Number.POSITIVE_INFINITY;
    for (const player of this.playerViews) {
      if (player.movement && !isHeroCombatDead(player.combat)) {
        minY = Math.min(minY, player.movement.y);
      }
    }
    return Number.isFinite(minY) ? minY : defaultClimbTuning.worldHeight;
  }

  private applyBossArenaClamp(): void {
    if (this.bossArena.state !== 'active') {
      return;
    }

    const { arenaBounds } = this.bossArena;
    for (const player of this.playerViews) {
      if (player.movement && !isHeroCombatDead(player.combat)) {
        player.movement.x = Math.min(
          Math.max(player.movement.x, arenaBounds.left + 24),
          arenaBounds.right - 24,
        );
      }
    }
  }

  private spawnMonster30Wave(): number {
    const alivePlayers = this.playerViews.filter(
      (p) => p.movement && !isHeroCombatDead(p.combat),
    );
    if (alivePlayers.length === 0) {
      return 0;
    }

    const playerCount = alivePlayers.length;
    const count = getSpawnCount(playerCount);
    const hero = alivePlayers[0];

    for (let i = 0; i < count; i += 1) {
      const pos = getSpawnPosition(
        hero.sprite.x,
        hero.sprite.y,
        () => Math.random(),
      );
      const monster = createMonster30(pos.x, pos.y);
      this.monster30s.push(monster);
    }

    return count;
  }

  private spawnMonster30DropSlice(monster: Monster30Model): void {
    const medicineSpawnY = monster.y + DropTuning.spawnOffsetY;
    maybeSpawnMedicineDrop(
      this.dropSystem,
      monster.x,
      monster.y,
      this.findDropSettleY(monster.x, medicineSpawnY),
    );

    const offsets = [-24, 24];
    for (let i = 0; i < Monster30DropEntries.length; i += 1) {
      const entry = Monster30DropEntries[i];
      const x = monster.x + offsets[i % offsets.length];
      const spawnY = monster.y + DropTuning.spawnOffsetY;
      spawnWorldDrop(
        this.dropSystem,
        entry,
        x,
        monster.y,
        this.findDropSettleY(x, spawnY),
      );
    }
  }

  private findDropSettleY(x: number, spawnY: number): number {
    const surface = this.movementPlatforms
      .filter((platform) =>
        x >= platform.left - 24 &&
        x <= platform.right + 24 &&
        platform.top >= spawnY,
      )
      .sort((a, b) => a.top - b.top)[0];

    if (surface) {
      return Math.max(spawnY, surface.top - 14);
    }

    return Math.max(spawnY, (this.movementBounds.bottom ?? defaultClimbTuning.worldHeight) - 59);
  }

  private handleMedicineDebugKeys(): void {
    if (!this.medicineSpawnKeys) {
      return;
    }

    const types: readonly MedicineDropType[] = ['SmallHP', 'BigHP', 'SmallMP'];
    for (const type of types) {
      const key = this.medicineSpawnKeys[type];
      if (Phaser.Input.Keyboard.JustDown(key)) {
        this.spawnMedicineDropNearP1(type);
      }
    }
  }

  private spawnMedicineDropNearP1(type: MedicineDropType): void {
    const player = this.getInventoryPlayer();
    const x = player?.movement?.x ?? defaultClimbTuning.worldWidth / 2;
    const monsterY = (player?.movement?.y ?? defaultClimbTuning.worldHeight - 140) + 70;
    const spawnY = monsterY + DropTuning.spawnOffsetY;
    spawnMedicineDrop(
      this.dropSystem,
      type,
      x,
      monsterY,
      this.findDropSettleY(x, spawnY),
    );
  }

  private finalizeCameraPosition(): void {
    this.cameras.main.scrollY = this.verticalClimb.cameraY;
  }

  private updateCloudVisuals(): void {
    const { cloudLayers } = defaultClimbTuning;
    const { cloudScrolls } = this.verticalClimb;

    for (let i = 0; i < this.cloudSprites.length; i += 1) {
      let layer = 0;
      let countAccum = 0;
      for (let l = 0; l < cloudLayers.length; l += 1) {
        countAccum += cloudLayers[l].count;
        if (i < countAccum) {
          layer = l;
          break;
        }
      }
      this.cloudSprites[i].y = this.cloudBaseY[i] + cloudScrolls[layer];
    }
  }

  private applyHeroAttackHit(player: PlayerView, time: number): void {
    if (!player.movement) {
      return;
    }

    const activeAttack = player.normalAttack.activeAttack;
    const hitbox = getActiveHeroHitbox(player.normalAttack, player.movement, time);
    if (!activeAttack || !hitbox) {
      return;
    }

    const attackBounds = toPhaserRect(hitbox);
    for (const monster of this.monster30s) {
      if (monster.state === 'dead' || monster.state === 'removed') {
        continue;
      }

      if (!Phaser.Geom.Intersects.RectangleToRectangle(
        attackBounds,
        this.getMonster30Bounds(monster),
      )) {
        continue;
      }

      const attackId = `${player.slot}-normal-${activeAttack.id}-${monster.id}`;
      if (!resolveHitOnce(this.hitRegistry, attackId, monster.id)) {
        continue;
      }

      const damageEvent = createDamageEvent({
        sourceId: player.slot,
        targetId: monster.id,
        attackId,
        actionName: activeAttack.actionName,
        amount: activeAttack.damage,
        attackKind: activeAttack.attackKind,
        knockbackX: activeAttack.facingX * 4,
        knockbackY: -2,
        occurredAtMs: time,
      });
      this.lastDamageEvent = damageEvent;
      applyMonster30Hit(monster, damageEvent.amount);
    }
  }

  private applyProjectileHits(time: number): void {
    for (const monster of this.monster30s) {
      if (monster.state === 'dead' || monster.state === 'removed') {
        continue;
      }

      const monsterBounds = this.getMonster30Bounds(monster);
      for (const projectile of getActiveProjectiles(this.projectileSystem)) {
        const hitbox = getProjectileHitbox(projectile);
        const attackBounds = toPhaserRect(hitbox);

        if (!Phaser.Geom.Intersects.RectangleToRectangle(attackBounds, monsterBounds)) {
          continue;
        }

        const attackId = getProjectileAttackId(projectile);
        if (!resolveHitOnce(this.hitRegistry, attackId, monster.id)) {
          continue;
        }

        const damageEvent = createDamageEvent({
          sourceId: projectile.sourceId,
          targetId: monster.id,
          attackId,
          actionName: projectile.actionName,
          amount: projectile.damage,
          attackKind: projectile.attackKind,
          knockbackX: projectile.facingX * projectile.knockbackX,
          knockbackY: projectile.knockbackY,
          occurredAtMs: time,
        });

        if (applyMonster30Hit(monster, damageEvent.amount)) {
          this.lastDamageEvent = damageEvent;
          recordProjectileHit(projectile);
          this.showAttackFlash(attackBounds, time, 0x7ee7ff);
        }
      }
    }

    if (this.bossArena.state === 'active' && this.bossArena.boss) {
      const bossBounds = this.getBossBounds();
      for (const projectile of getActiveProjectiles(this.projectileSystem)) {
        const hitbox = getProjectileHitbox(projectile);
        const attackBounds = toPhaserRect(hitbox);

        if (!Phaser.Geom.Intersects.RectangleToRectangle(attackBounds, bossBounds)) {
          continue;
        }

        const attackId = getProjectileAttackId(projectile);
        if (!resolveHitOnce(this.hitRegistry, attackId, 'monster3')) {
          continue;
        }

        const damageEvent = createDamageEvent({
          sourceId: projectile.sourceId,
          targetId: 'monster3',
          attackId,
          actionName: projectile.actionName,
          amount: projectile.damage,
          attackKind: projectile.attackKind,
          knockbackX: projectile.facingX * projectile.knockbackX,
          knockbackY: projectile.knockbackY,
          occurredAtMs: time,
        });

        if (applyMonster3Hit(this.bossArena.boss, damageEvent.amount)) {
          this.lastDamageEvent = damageEvent;
          recordProjectileHit(projectile);
          this.showAttackFlash(attackBounds, time, 0x7ee7ff);
        }
      }
    }
  }


  private createAttackEffectView(
    player: PlayerView,
    attack: ActiveHeroNormalAttack,
  ): AttackEffectView {
    const effectColor = getHeroTint(attack.heroId);
    const shape = attack.followsHero
      ? this.add.ellipse(player.sprite.x + attack.facingX * 82, player.sprite.y - 80, 86, 36, effectColor, 0.35)
      : this.add.rectangle(player.sprite.x + attack.facingX * 105, player.sprite.y - 82, 102, 42, effectColor, 0.28);
    const label = this.add.text(player.sprite.x + attack.facingX * 54, player.sprite.y - 128, attack.actionName, {
      color: '#f3f6ff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
    });

    shape.setStrokeStyle(2, effectColor, 0.9);

    return {
      slot: player.slot,
      attack,
      shape,
      label,
    };
  }

  private createProjectileEffectView(projectile: ProjectileModel): void {
    const existingView = this.projectileEffectViews.find((view) => view.projectileId === projectile.id);
    if (existingView) {
      return;
    }

    const isMovingProjectile = projectile.velocityX !== 0 || projectile.velocityY !== 0;
    const color = isMovingProjectile ? 0xf2c14e : 0x7ee7ff;
    const shape = this.add.ellipse(
      projectile.x,
      projectile.y,
      projectile.width,
      projectile.height,
      color,
      0.18,
    );
    const core = this.add.ellipse(
      projectile.x,
      projectile.y,
      projectile.width * 0.48,
      projectile.height * 0.34,
      0xf3f6ff,
      0.28,
    );
    const label = this.add.text(
      projectile.x - 46,
      projectile.y - projectile.height / 2 - 18,
      `${projectile.runtimeName} ${projectile.actionName}`,
      {
        color: '#f3f6ff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
      },
    );

    shape.setStrokeStyle(2, color, 0.9);
    core.setStrokeStyle(1, 0xf3f6ff, 0.9);
    this.projectileEffectViews.push({
      projectileId: projectile.id,
      shape,
      core,
      label,
    });
  }

  private showAttackFlash(
    bounds: Phaser.Geom.Rectangle,
    time: number,
    color = 0xf2c14e,
  ): void {
    const shape = this.add.rectangle(
      bounds.centerX,
      bounds.centerY,
      bounds.width,
      bounds.height,
      color,
      0.16,
    );
    shape.setStrokeStyle(2, color, 0.85);
    this.attackFlashes.push({ shape, expiresAt: time + 120 });
  }

  private getMonster30Bounds(monster: Monster30Model): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(monster.x - 36, monster.y - 28, 72, 56);
  }

  private getPlayerBounds(player: PlayerView): Phaser.Geom.Rectangle {
    const movement = player.movement;
    if (!movement) {
      return new Phaser.Geom.Rectangle();
    }

    return new Phaser.Geom.Rectangle(movement.x - 24, movement.y - 96, 48, 96);
  }

  private updatePlayerCombatVisual(player: PlayerView, time: number): void {
    if (isHeroCombatDead(player.combat)) {
      player.sprite.setAlpha(0.42);
      player.sprite.setTint(0x697386);
      return;
    }

    player.sprite.setAlpha(isHeroInvulnerable(player.combat, time) ? 0.72 : 1);
    player.sprite.setTint(
      player.combat.state === 'hurt'
        ? 0xff7f7f
        : getHeroTint(player.normalAttack.heroId),
    );
  }

  private updateProjectileEffectViews(): void {
    const activeProjectiles = getActiveProjectiles(this.projectileSystem);
    const activeIds = new Set(activeProjectiles.map((projectile) => projectile.id));
    const activeViews: ProjectileEffectView[] = [];

    for (const view of this.projectileEffectViews) {
      const projectile = activeProjectiles.find((candidate) => candidate.id === view.projectileId);
      if (!projectile || !activeIds.has(view.projectileId)) {
        view.shape.destroy();
        view.core.destroy();
        view.label.destroy();
        continue;
      }

      const lifetimeRatio = Math.min(projectile.elapsedMs / projectile.lifetimeMs, 1);
      const pulse = 1 + (projectile.hitSerial % 2) * 0.08;
      view.shape.setPosition(projectile.x, projectile.y);
      view.core.setPosition(projectile.x, projectile.y);
      view.label.setPosition(projectile.x - 62, projectile.y - projectile.height / 2 - 18);
      view.shape.setScale(pulse, pulse);
      view.core.setScale(1 + Math.sin(lifetimeRatio * Math.PI * 6) * 0.08);
      view.shape.setAlpha(Math.max(0.08, 0.3 * (1 - lifetimeRatio)));
      view.core.setAlpha(Math.max(0.1, 0.36 * (1 - lifetimeRatio * 0.5)));
      view.label.setAlpha(Math.max(0.2, 1 - lifetimeRatio));
      activeViews.push(view);
    }

    this.projectileEffectViews = activeViews;
  }

  private handleDropPickup(): void {
    const player = this.getInventoryPlayer();
    if (!player?.movement || isHeroCombatDead(player.combat)) {
      return;
    }

    const playerBounds = this.getPlayerBounds(player);
    for (const drop of getWorldDrops(this.dropSystem)) {
      if (drop.state !== 'idle') {
        continue;
      }

      if (!Phaser.Geom.Intersects.RectangleToRectangle(
        playerBounds,
        this.getDropBounds(drop),
      )) {
        continue;
      }

      if (drop.kind === 'medicine') {
        const result = pickupMedicineDrop({
          model: this.dropSystem,
          drop,
          currentHp: player.combat.hp,
          maxHp: player.combat.maxHp,
          currentMp: player.skill.mp,
          maxMp: player.skill.maxMp,
        });
        if (result.ok) {
          if (result.target === 'hp') {
            player.combat.hp = result.after;
          } else {
            player.skill.mp = result.after;
          }
          this.refreshPlayerHeroView(player);
        }
        this.inventoryUI.message = result.message;
      } else {
        const result = pickupWorldDrop(
          this.dropSystem,
          drop,
          this.inventoryStore,
          this.equipmentRegistry,
        );
        this.inventoryUI.message = result.message;
      }
    }
  }

  private updateDropViews(): void {
    const activeDrops = getWorldDrops(this.dropSystem);
    const activeIds = new Set(activeDrops.map((drop) => drop.id));

    for (const drop of activeDrops) {
      let view = this.dropViews.get(drop.id);
      if (!view) {
        view = this.createDropView(drop);
        this.dropViews.set(drop.id, view);
      }

      this.syncDropView(drop, view);
    }

    for (const [dropId, view] of this.dropViews) {
      if (!activeIds.has(dropId)) {
        this.destroyDropView(view);
        this.dropViews.delete(dropId);
      }
    }
  }

  private createDropView(drop: WorldDrop): DropView {
    const root = this.add.container(drop.x, drop.y);
    const color = getDropColor(drop);
    const shadow = this.add.ellipse(0, 18, 44, 10, 0x000000, 0.22);
    const body = this.add.ellipse(0, 0, 30, 24, color, 0.88);
    const shine = this.add.ellipse(-6, -5, 9, 6, 0xf3f6ff, 0.46);
    const label = this.add.text(-46, -40, this.getDropLabel(drop), {
      color: '#f3f6ff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
    });
    const feedback = this.add.text(-52, -60, '', {
      color: '#f2c14e',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
    });

    body.setStrokeStyle(2, color, 1);
    root.add([shadow, body, shine, label, feedback]);
    root.setDepth(44);
    return { root, shadow, body, shine, label, feedback };
  }

  private syncDropView(drop: WorldDrop, view: DropView): void {
    const alpha = getDropPickupAlpha(drop);
    view.root.setPosition(drop.x, drop.y);
    view.root.setAlpha(alpha);
    view.shadow.setVisible(drop.state === 'idle');
    view.body.setFillStyle(getDropColor(drop), drop.state === 'idle' ? 0.88 : 0.4);
    view.body.setScale(drop.state === 'idle' ? 1 + Math.sin(drop.ageMs * 0.006) * 0.05 : 1);
    view.shine.setVisible(drop.state === 'idle');
    view.label.setText(this.getDropLabel(drop));
    view.feedback.setText(drop.state === 'picked' ? drop.feedback : '');
  }

  private destroyDropView(view: DropView): void {
    view.root.destroy(true);
  }

  private getDropBounds(drop: WorldDrop): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(
      drop.x - DropTuning.pickupWidth / 2,
      drop.y - DropTuning.pickupHeight / 2,
      DropTuning.pickupWidth,
      DropTuning.pickupHeight,
    );
  }

  private getDropLabel(drop: WorldDrop): string {
    if (drop.kind === 'medicine') {
      return drop.medicine.label;
    }

    const name = this.equipmentRegistry[drop.fillName]?.name ?? drop.fillName;
    return drop.quantity > 1 ? `${name} x${drop.quantity}` : name;
  }

  private updateAttackEffectViews(time: number): void {
    const activeViews: AttackEffectView[] = [];

    for (const effectView of this.attackEffectViews) {
      if (time >= effectView.attack.endsAtMs) {
        effectView.shape.destroy();
        effectView.label.destroy();
        continue;
      }

      const player = this.playerViews.find((view) => view.slot === effectView.slot);
      if (player && player.movement && effectView.attack.followsHero) {
        const progress = (time - effectView.attack.startedAtMs) /
          (effectView.attack.endsAtMs - effectView.attack.startedAtMs);
        const sweep = 28 * Math.min(Math.max(progress, 0), 1);
        effectView.shape.setPosition(
          player.sprite.x + effectView.attack.facingX * (78 + sweep),
          player.sprite.y - 80,
        );
        effectView.label.setPosition(
          player.sprite.x + effectView.attack.facingX * 54,
          player.sprite.y - 128,
        );
      }

      const remainingRatio = (effectView.attack.endsAtMs - time) /
        (effectView.attack.endsAtMs - effectView.attack.startedAtMs);
      effectView.shape.setAlpha(Math.max(0.1, remainingRatio * 0.5));
      effectView.label.setAlpha(Math.max(0.15, remainingRatio));
      activeViews.push(effectView);
    }

    this.attackEffectViews = activeViews;
  }

  private updateAttackFlashes(time: number): void {
    const activeFlashes: AttackFlash[] = [];

    for (const flash of this.attackFlashes) {
      if (time >= flash.expiresAt) {
        flash.shape.destroy();
        continue;
      }

      activeFlashes.push(flash);
    }

    this.attackFlashes = activeFlashes;
  }

  private updateStatusText(input: InputState): void {
    if (!this.statusText) {
      return;
    }

    const climb = this.verticalClimb;
    const activeMonsters = this.monster30s.filter(
      (m) => m.state !== 'dead' && m.state !== 'removed',
    );
    const activeStop = climb.activeStopIndex >= 0
      ? `stop@${climb.stopPoints[climb.activeStopIndex].y}`
      : 'none';

    this.statusText.setText([
      `Vertical Climb | monsters:${this.monster30s.length} alive:${activeMonsters.length}`,
      formatPlayerInput('P1', input.p1),
      formatPlayerInput('P2', input.p2),
      '',
      `camera:${Math.round(climb.cameraY)} target:${Math.round(climb.targetCameraY)}`,
      `stopPts:${climb.stopPoints.filter((s) => s.cleared).length}/${climb.stopPoints.length}`,
      `activeStop:${activeStop}`,
      `spawnTimer:${Math.round(climb.spawnTimerMs)}ms`,
      `boss:${climb.bossTriggered ? 'triggered' : 'pending'}`,
      `arena:${formatBossArenaState(this.bossArena)}`,
      ...activeMonsters.map((m) => `  m30:${m.state} hp:${m.hp}/${m.maxHp} target:${m.targetSlot ?? '-'}`),
      `hero p1:${formatHeroMovementState(this.playerViews.find((player) => player.slot === 'p1')?.movement)}`,
      `hero p2:${formatHeroMovementState(this.playerViews.find((player) => player.slot === 'p2')?.movement)}`,
      `combat p1:${formatHeroCombatState(this.playerViews.find((player) => player.slot === 'p1')?.combat)}`,
      `combat p2:${formatHeroCombatState(this.playerViews.find((player) => player.slot === 'p2')?.combat)}`,
      `normal p1:${formatHeroNormalAttackState(this.playerViews.find((player) => player.slot === 'p1')?.normalAttack)}`,
      `normal p2:${formatHeroNormalAttackState(this.playerViews.find((player) => player.slot === 'p2')?.normalAttack)}`,
      `skill p1:${formatHeroSkillState(this.playerViews.find((player) => player.slot === 'p1')?.skill)}`,
      `skill p2:${formatHeroSkillState(this.playerViews.find((player) => player.slot === 'p2')?.skill)}`,
      `projectiles:${formatProjectileState(getActiveProjectiles(this.projectileSystem))}`,
      `skill cast:${formatSkillEvent(this.lastSkillEvent)}`,
      `skill ui p1:${formatSkillUIState(this.p1SkillUI)}`,
      `skill ui p2:${formatSkillUIState(this.p2SkillUI)}`,
      `inventory:${formatInventoryUIState(this.inventoryUI)}`,
      `drops:${formatDropState(getWorldDrops(this.dropSystem))}`,
      `drop msg:${this.dropSystem.lastMessage}`,
      `damage:${formatDamageEvent(this.lastDamageEvent)}`,
    ]);
  }

  private getInventoryPlayer(): PlayerView | undefined {
    return this.playerViews.find((player) => player.slot === 'p1');
  }

  private getInventoryHeroName(): string {
    const player = this.getInventoryPlayer();
    if (!player) {
      return HeroNamesById[2];
    }

    return HeroNamesById[player.normalAttack.heroId] ?? `R${player.normalAttack.heroId}`;
  }

  private syncInventoryHeroStats(): void {
    const player = this.getInventoryPlayer();
    if (!player) {
      return;
    }

    const previousMaxHp = player.combat.maxHp;
    const previousMaxMp = player.skill.maxMp;
    const stats = calculateEffectiveStats(player.baseStats, this.equipmentLoadout);
    const hpDelta = stats.maxHp - previousMaxHp;
    const mpDelta = stats.maxMp - previousMaxMp;

    player.combat.maxHp = stats.maxHp;
    player.combat.hp = Math.min(
      Math.max(0, player.combat.hp + Math.max(0, hpDelta)),
      player.combat.maxHp,
    );
    player.skill.maxMp = stats.maxMp;
    player.skill.mp = Math.min(
      Math.max(0, player.skill.mp + Math.max(0, mpDelta)),
      player.skill.maxMp,
    );
    this.refreshPlayerHeroView(player);
  }

  private refreshPlayerHeroView(player: PlayerView): void {
    player.sprite.setTint(getHeroTint(player.normalAttack.heroId));
    player.label.setText(formatHeroLabel(player.slot, player.normalAttack, player.combat));
  }
}

function getDropColor(drop: WorldDrop): number {
  if (drop.kind === 'medicine') {
    return drop.medicine.color;
  }

  return drop.bigType === 'zb' ? 0xf2c14e : 0x72d2b1;
}

function formatDropState(drops: readonly WorldDrop[]): string {
  const idle = drops.filter((drop) => drop.state === 'idle');
  if (idle.length === 0) {
    return 'none';
  }

  return idle
    .map((drop) => `${drop.bigType}/${drop.fillName}@${Math.round(drop.x)},${Math.round(drop.y)}`)
    .join(', ');
}

function formatPlayerInput(label: string, input: PlayerInputState): string {
  return [
    `${label}`,
    `move:${formatMove(input.moveX)}`,
    `attack:${formatPressed(input.attack)}`,
    `jump:${formatPressed(input.jump)}`,
    `skills:${input.skillSlots.map(formatPressedBit).join('')}`,
    `special:${formatPressed(input.special)}`,
    `magic:${formatPressed(input.magicWeapon)}`,
  ].join(' | ');
}

function formatMove(moveX: PlayerInputState['moveX']): string {
  if (moveX < 0) {
    return 'left';
  }

  if (moveX > 0) {
    return 'right';
  }

  return 'neutral';
}

function formatPressed(isPressed: boolean): string {
  return isPressed ? 'on' : 'off';
}

function formatPressedBit(isPressed: boolean): string {
  return isPressed ? '1' : '0';
}

function formatBossArenaState(arena: BossArenaModel): string {
  if (arena.state === 'inactive') {
    return 'inactive';
  }

  if (arena.state === 'cleared') {
    return 'cleared';
  }

  if (!arena.boss) {
    return 'active (no boss)';
  }

  return [
    arena.state,
    `boss:${arena.boss.state}`,
    `hp:${arena.boss.hp}/${arena.boss.maxHp}`,
    `door:${arena.door.visible ? 'visible' : 'hidden'}`,
  ].join(' | ');
}

function formatHeroMovementState(movement: HeroMovementModel | undefined): string {
  if (!movement) {
    return 'missing';
  }

  return [
    movement.state,
    movement.grounded ? 'grounded' : 'air',
    `jump:${movement.jumpCount}`,
  ].join(' | ');
}

function formatHeroNormalAttackState(model: HeroNormalAttackModel | undefined): string {
  if (!model) {
    return 'missing';
  }

  return [
    `R${model.heroId} ${HeroDisplayNames[model.heroId]}`,
    model.weaponMode,
    model.activeAttack?.actionName ?? 'ready',
    model.activeAttack?.sourceSymbol ?? model.activeAttack?.effectKey ?? 'none',
  ].join(' | ');
}

function formatHeroSkillState(skill: HeroSkillModel | undefined): string {
  if (!skill) {
    return 'missing';
  }

  const slots = skill.loadout.slots
    .map((binding, index) => `${index}:${binding?.skillName ?? '-'}`)
    .join(' ');

  return [
    `mp:${skill.mp}/${skill.maxMp}`,
    `slots:${slots}`,
    `action:${skill.activeAction?.actionName ?? 'ready'}`,
    skill.lastResult,
  ].join(' | ');
}

function formatSkillEvent(event: HeroSkillCastEvent | undefined): string {
  if (!event) {
    return 'none';
  }

  return [
    `slot:${event.slotIndex}`,
    event.skillName,
    event.actionName,
    event.reentered ? 'reentry' : 'first',
    `mp:${event.mpBefore}->${event.mpAfter}`,
  ].join(' | ');
}

function formatHeroCombatState(combat: HeroCombatModel | undefined): string {
  if (!combat) {
    return 'missing';
  }

  return [
    combat.state,
    `hp:${combat.hp}/${combat.maxHp}`,
    `last:${combat.lastDamageEvent?.amount ?? 0}`,
  ].join(' | ');
}

function formatSkillUIState(ui: SkillUIState): string {
  return [
    `sel:${ui.selectedSlotIndex}`,
    `panel:${ui.skillPanelOpen ? 'open' : 'closed'}`,
  ].join(' | ');
}

function formatInventoryUIState(ui: InventoryUIState): string {
  return [
    ui.isOpen ? 'open' : 'closed',
    `cat:${ui.activeCategory}`,
    `focus:${ui.focus}`,
    `sel:${ui.focus === 'inventory' ? ui.selectedIndex : ui.selectedSlotIndex}`,
    ui.message,
  ].join(' | ');
}

function formatProjectileState(projectiles: readonly ProjectileModel[]): string {
  if (projectiles.length === 0) {
    return 'none';
  }

  return projectiles
    .map((projectile) => [
      projectile.sourceId,
      projectile.actionName,
      projectile.runtimeName,
      `serial:${projectile.hitSerial}`,
      `hits:${projectile.remainingHits}`,
    ].join('/'))
    .join(', ');
}

function formatHeroLabel(
  slot: PlayerSlot,
  model: HeroNormalAttackModel,
  combat: HeroCombatModel,
): string {
  return `${slot.toUpperCase()} R${model.heroId} ${HeroDisplayNames[model.heroId]} HP ${combat.hp}/${combat.maxHp}`;
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

function toPhaserRect(hitbox: {
  x: number;
  y: number;
  width: number;
  height: number;
}): Phaser.Geom.Rectangle {
  return new Phaser.Geom.Rectangle(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
}

function getMonsterColor(state: Monster30Model['state']): number {
  switch (state) {
    case 'hurt':
      return 0xc96a6a;
    case 'hit1':
      return 0x9d6b9b;
    case 'dead':
      return 0x606b7b;
    default:
      return 0x7b4e79;
  }
}
