import Phaser from 'phaser';
import { AssetKeys } from '../assets/AssetManifest';
import { createGameContext, findPlayerBySlot } from '../core/GameContext';
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
  applyMonster30MagicFlowerDebuff,
  applyMonster30MagicBaguaStun,
  applyMonster30MagicPearlPoison,
  applyMonster30MagicPearlStun,
  applyMonster30MagicSnowIce,
  applyMonster30MagicZlHummerStun,
  clearMonster30MagicBaguaStun,
  clearMonster30MagicFlagDebuff,
  applyMonster30Hit,
  applyMonster30MagicFlagDebuff,
  clearMonster30MagicFlowerDebuff,
  clearMonster30MagicSnowIce,
  clearMonster30MagicPearlPoison,
  clearMonster30MagicPearlStun,
  clearMonster30MagicZlHummerStun,
  createMonster30,
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
  upgradeEquippedMagicWeapon,
  type EquipmentDefinition,
  type EquipmentInstance,
  type EquipmentLoadout,
  type HeroBaseStats,
  type HeroEffectiveStats,
} from '../systems/EquipmentSystem';
import {
  consumeStackByFillName,
  createSeedInventoryStore,
  type InventoryStore,
} from '../systems/InventorySystem';
import {
  buildInventoryPanelLines,
  createInventoryUIState,
  equipSelectedInventoryEntry,
  getSelectedInventoryEntry,
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
  type AuraDropType,
  type AuraTargetSnapshot,
  getDropPickupAlpha,
  getWorldDrops,
  maybeSpawnMedicineDrop,
  pickupMedicineDrop,
  pickupWorldDrop,
  spawnAuraDrop,
  spawnAuraDrops,
  spawnConfiguredMonsterDrop,
  spawnMedicineDrop,
  spawnStrengthStoneDrop,
  updateWorldDrops,
  type DropSystemModel,
  type MedicineDropType,
  type MonsterDropContext,
  type MonsterDropId,
  type WorldDrop,
} from '../systems/DropSystem';
import {
  buildPetPanelLines,
  awardMonsterExperienceWithCurrentPet,
  createMagicBottleCaptureModel,
  createSeedPetRoster,
  getActivePet,
  isPetConsumableFillName,
  requestMagicBottleCapture,
  resolveMagicBottleCaptureHit,
  selectPet,
  syncPetRuntimeWithRoster,
  toggleSelectedPetActive,
  updateMagicBottleCapture,
  updatePetRuntime,
  usePetConsumable,
  type CapturablePetTarget,
  type MagicBottleCaptureModel,
  type MonsterExperienceShareResult,
  type PetRoster,
  type PetRuntimeModel,
} from '../systems/PetSystem';
import {
  createMagicWeaponModel,
  formatMagicWeaponState,
  requestMagicWeaponTrigger,
  syncMagicWeaponFromLoadout,
  updateMagicWeapon,
  type MagicWeaponEnemyTarget,
  type MagicWeaponModel,
  type MagicWeaponPlatform,
} from '../systems/MagicWeaponSystem';
import {
  addHeroExperience,
  createHeroProgression,
  formatHeroProgression,
  getHeroBaseStats,
  setHeroProgressionHero,
  type HeroProgressionModel,
} from '../systems/ProgressionSystem';
import {
  applyHeroNormalAttackToMonster30s,
  applyMonster30AttackToPlayers,
  getMonster30Bounds,
  getPlayerBounds,
  type CombatBridgeResult,
} from './test-scene/TestSceneCombatBridge';
import {
  collectAuraDebugActions,
  collectConfiguredDropDebugActions,
  collectMedicineDebugActions,
  createTestSceneDebugKeys,
  isStoneDebugJustDown,
  type TestSceneDebugKeys,
} from './test-scene/TestSceneDebugKeys';
import {
  createAttackEffectView,
  createAttackFlash,
  createBossView,
  createDropView,
  createMonsterView,
  createPetView,
  createProjectileEffectView,
  createTransferDoorView,
  destroyDropView,
  drawBossArenaStage,
  type AttackEffectView,
  type AttackFlash,
  type BossView,
  type DropView,
  type MonsterView,
  type PetView,
  type ProjectileEffectView,
  type TransferDoorView,
  syncDropView,
} from './test-scene/TestSceneViews';
import {
  createTestSceneUpdatePipeline,
  type TestSceneUpdatePipeline,
} from './test-scene/TestSceneUpdatePipeline';

type PlayerView = {
  slot: PlayerSlot;
  sprite: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
  movement?: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  skill: HeroSkillModel;
  baseStats: HeroBaseStats;
  progression: HeroProgressionModel;
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

type PetPanelView = {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Graphics;
  text: Phaser.GameObjects.Text;
};

type CapturablePetTargetView = {
  root: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Ellipse;
  mark: Phaser.GameObjects.Ellipse;
  label: Phaser.GameObjects.Text;
  feedback: Phaser.GameObjects.Text;
};

type MagicBottleEffectView = {
  root: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Ellipse;
  glow: Phaser.GameObjects.Ellipse;
  label: Phaser.GameObjects.Text;
};

type MagicWeaponPlatformView = {
  root: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Rectangle;
  glow: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
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
  private monster30AuraTargets = new Map<string, PlayerSlot>();
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
  private inventoryMagicWeaponUpgradeKey?: Phaser.Input.Keyboard.Key;
  private petPanelToggleKey?: Phaser.Input.Keyboard.Key;
  private petPanelUpKey?: Phaser.Input.Keyboard.Key;
  private petPanelDownKey?: Phaser.Input.Keyboard.Key;
  private petPanelConfirmKey?: Phaser.Input.Keyboard.Key;
  private debugKeys?: TestSceneDebugKeys;
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
  private emptyEquipmentLoadout: EquipmentLoadout = createEmptyEquipmentLoadout();
  private inventoryUI: InventoryUIState = createInventoryUIState();
  private inventoryPanel?: InventoryPanelView;
  private magicWeapon: MagicWeaponModel = createMagicWeaponModel();
  private magicWeaponSoul = 5_000;
  private petRoster: PetRoster = createSeedPetRoster();
  private magicBottle: MagicBottleCaptureModel = createMagicBottleCaptureModel();
  private capturablePetTargets: CapturablePetTarget[] = [];
  private capturablePetTargetViews = new Map<string, CapturablePetTargetView>();
  private magicBottleEffectView?: MagicBottleEffectView;
  private petPanelOpen = false;
  private petRuntime?: PetRuntimeModel;
  private petView?: PetView;
  private petPanel?: PetPanelView;
  private magicWeaponPlatformViews = new Map<string, MagicWeaponPlatformView>();
  private updatePipeline?: TestSceneUpdatePipeline;
  private movementPlatforms: MovementPlatform[] = [];
  private movementBounds: HeroMovementBounds = {
    left: 0,
    right: defaultClimbTuning.worldWidth,
    bottom: defaultClimbTuning.worldHeight,
  };
  private gameContext = createGameContext({
    players: () => this.playerViews,
    monster30s: () => this.monster30s,
    bossArena: () => this.bossArena,
    projectileSystem: () => this.projectileSystem,
    dropSystem: () => this.dropSystem,
    petRoster: () => this.petRoster,
    capturablePetTargets: () => this.capturablePetTargets,
  });

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
    this.equipDefaultMagicWeapon();
    this.playerViews = this.createPlayerMarkers();
    this.capturablePetTargets = this.createCapturablePetTargets();

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
    this.createPetUIKeys();
    this.createDebugKeys();
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
    this.petPanel = this.createPetPanel();
    this.petPanel.container.setScrollFactor(0).setDepth(96);
    this.bossView = createBossView(this);
    this.bossDoorView = createTransferDoorView(this);
    this.bossArenaLabel = this.add.text(470, 50, '', {
      color: '#f2c14e',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
    }).setOrigin(0.5, 0.5);
    drawBossArenaStage(this);
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

    this.getUpdatePipeline().run(time, delta, input, previousCameraY);
  }

  private getUpdatePipeline(): TestSceneUpdatePipeline {
    if (!this.updatePipeline) {
      this.updatePipeline = this.createUpdatePipeline();
    }

    return this.updatePipeline;
  }

  private createUpdatePipeline(): TestSceneUpdatePipeline {
    return createTestSceneUpdatePipeline({
      updateHeroDebugSelection: () => this.updateHeroDebugSelection(),
      updateHeroMovement: (input, time, delta) => this.updateHeroMovement(input, time, delta),
      updateHeroCombatStates: (time, delta) => this.updateHeroCombatStates(time, delta),
      updateHeroNormalAttacks: (input, time) => this.updateHeroNormalAttacks(input, time),
      updatePetSystem: (delta) => this.updatePetSystem(delta),
      updateMagicWeapon: (input, delta) => this.updateMagicWeapon(input, delta),
      updateMagicBottleCapture: (input, delta) => this.updateMagicBottleCapture(input, delta),
      updateBossHitByPlayers: (time) => this.updateBossHitByPlayers(time),
      updateHeroSkillProjectiles: (input) => this.updateHeroSkillProjectiles(input),
      updateProjectileSystem: (time, delta) => this.updateProjectileSystem(time, delta),
      updateMonster30s: (delta) => this.updateMonster30s(delta),
      handleMedicineDebugKeys: () => this.handleMedicineDebugKeys(),
      handleAuraDebugKeys: () => this.handleAuraDebugKeys(),
      handleStoneDebugKey: () => this.handleStoneDebugKey(),
      handleConfiguredDropDebugKeys: () => this.handleConfiguredDropDebugKeys(),
      updateWorldDrops: (delta) => updateWorldDrops(
        this.dropSystem,
        delta,
        this.createAuraTargetSnapshots(),
      ),
      handleDropPickup: () => this.handleDropPickup(),
      applyAllMonster30Attacks: (time) => this.applyAllMonster30Attacks(time),
      updateAllMonsterViews: () => this.updateAllMonsterViews(),
      updateCapturablePetTargetViews: () => this.updateCapturablePetTargetViews(),
      updateMagicBottleEffectView: () => this.updateMagicBottleEffectView(),
      updateDropViews: () => this.updateDropViews(),
      updateVerticalClimbLogic: (input, time, delta, previousCameraY) =>
        this.updateVerticalClimbLogic(input, time, delta, previousCameraY),
      finalizeCameraPosition: () => this.finalizeCameraPosition(),
      updateAttackEffectViews: (time) => this.updateAttackEffectViews(time),
      updateAttackFlashes: (time) => this.updateAttackFlashes(time),
      handleInventoryUIKeys: () => this.handleInventoryUIKeys(),
      handlePetUIKeys: () => this.handlePetUIKeys(),
      canHandleSkillUI: () => !this.inventoryUI.isOpen && !this.petPanelOpen,
      handleSkillUIKeys: () => this.handleSkillUIKeys(),
      updateSkillBars: () => this.updateSkillBars(),
      updateSkillPanels: () => this.updateSkillPanels(),
      updateBossArena: (input, time, delta) => this.updateBossArena(input, time, delta),
      updateBossArenaVisuals: () => this.updateBossArenaVisuals(),
      updateCloudVisuals: () => this.updateCloudVisuals(),
      updateInventoryPanel: () => this.updateInventoryPanel(),
      updatePetPanel: () => this.updatePetPanel(),
      updateStatusText: (input) => this.updateStatusText(input),
      rememberInput: (input) => {
        this.lastInput = input;
      },
    });
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

  private createCapturablePetTargets(): CapturablePetTarget[] {
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
    const progression = createHeroProgression(heroId);
    const baseStats = getHeroBaseStats(heroId, progression.level);
    const combat = createHeroCombat(slot);
    combat.maxHp = baseStats.maxHp;
    combat.hp = combat.maxHp;
    const skill = createHeroSkillModel(undefined, baseStats.maxMp);
    label.setText(formatHeroLabel(slot, normalAttack, combat));

    return { slot, sprite, label, combat, normalAttack, skill, baseStats, progression };
  }

  private equipDefaultMagicWeapon(): void {
    const definition = this.equipmentRegistry.xhhl;
    if (!definition) {
      return;
    }

    const equipped: EquipmentInstance = {
      kind: 'equipment',
      instanceId: 'seed-equipped-xhhl',
      definition,
      quantity: 1,
    };
    this.equipmentLoadout.magicWeapon = equipped;
    syncMagicWeaponFromLoadout(this.magicWeapon, this.equipmentLoadout);
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

    this.inventoryToggleKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.inventoryTabKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    this.inventoryUpKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.inventoryDownKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.inventoryLeftKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.inventoryRightKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.inventoryConfirmKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.inventoryBackspaceKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);
    this.inventoryDeleteKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DELETE);
    this.inventoryMagicWeaponUpgradeKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U);
  }

  private createPetUIKeys(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    this.petPanelToggleKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    this.petPanelUpKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.petPanelDownKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.petPanelConfirmKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  private createDebugKeys(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    this.debugKeys = createTestSceneDebugKeys(keyboard);
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

  private createPetPanel(): PetPanelView {
    const container = this.add.container(0, 0);
    container.setVisible(false);

    const bg = this.add.graphics();
    bg.fillStyle(0x101724, 0.96);
    bg.fillRoundedRect(600, 54, 316, 330, 8);
    bg.lineStyle(1, 0xf2c14e, 0.85);
    bg.strokeRoundedRect(600, 54, 316, 330, 8);
    container.add(bg);

    const text = this.add.text(616, 68, '', {
      color: '#dfe8f5',
      fontFamily: 'Courier New, monospace',
      fontSize: '12px',
      lineSpacing: 4,
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

  private updateSkillBars(): void {
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

  private updateSkillPanels(): void {
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
        this.petPanelOpen = false;
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
        if (this.tryUseSelectedPetConsumable()) {
          // Pet consumable handled by the inventory item branch.
        } else if (equipSelectedInventoryEntry({
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

    if (
      this.inventoryMagicWeaponUpgradeKey &&
      Phaser.Input.Keyboard.JustDown(this.inventoryMagicWeaponUpgradeKey)
    ) {
      this.upgradeCurrentMagicWeapon();
    }
  }

  private tryUseSelectedPetConsumable(): boolean {
    const selected = getSelectedInventoryEntry(this.inventoryUI, this.inventoryStore);
    if (
      this.inventoryUI.activeCategory !== 'items' ||
      !selected ||
      selected.kind !== 'stack' ||
      !isPetConsumableFillName(selected.definition.fillName)
    ) {
      return false;
    }

    const result = usePetConsumable(this.petRoster, selected.definition.fillName);
    if (!result.shouldConsume) {
      this.inventoryUI.message = result.message;
      return true;
    }

    const consume = consumeStackByFillName(
      this.inventoryStore,
      selected.definition.fillName,
      1,
    );
    this.inventoryUI.message = consume.ok
      ? `${consume.message}；${result.message}`
      : consume.message;
    return true;
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
      magicWeaponSoul: this.magicWeaponSoul,
    });
    this.inventoryPanel.text.setText(lines.join('\n'));
  }

  private upgradeCurrentMagicWeapon(): void {
    const result = upgradeEquippedMagicWeapon({
      loadout: this.equipmentLoadout,
      soul: this.magicWeaponSoul,
    });
    this.magicWeaponSoul = result.soulAfter;
    this.inventoryUI.message = result.message;
    if (!result.ok) {
      return;
    }

    this.syncInventoryHeroStats();
    syncMagicWeaponFromLoadout(this.magicWeapon, this.equipmentLoadout);
  }

  private handlePetUIKeys(): void {
    if (this.p1SkillUI.skillPanelOpen || this.p2SkillUI.skillPanelOpen) {
      return;
    }

    if (this.petPanelToggleKey && Phaser.Input.Keyboard.JustDown(this.petPanelToggleKey)) {
      this.petPanelOpen = !this.petPanelOpen;
      if (this.petPanelOpen) {
        this.inventoryUI.isOpen = false;
        this.p1SkillUI.skillPanelOpen = false;
        this.p2SkillUI.skillPanelOpen = false;
        this.petRoster.message = 'Pet panel opened';
      } else {
        this.petRoster.message = 'Pet panel closed';
      }
    }

    if (!this.petPanelOpen) {
      return;
    }

    if (this.petPanelUpKey && Phaser.Input.Keyboard.JustDown(this.petPanelUpKey)) {
      selectPet(this.petRoster, -1);
    }

    if (this.petPanelDownKey && Phaser.Input.Keyboard.JustDown(this.petPanelDownKey)) {
      selectPet(this.petRoster, 1);
    }

    if (this.petPanelConfirmKey && Phaser.Input.Keyboard.JustDown(this.petPanelConfirmKey)) {
      toggleSelectedPetActive(this.petRoster);
      this.petRuntime = undefined;
    }
  }

  private updatePetPanel(): void {
    if (!this.petPanel) {
      return;
    }

    if (!this.petPanelOpen) {
      this.petPanel.container.setVisible(false);
      return;
    }

    this.petPanel.container.setVisible(true);
    this.petPanel.text.setText(buildPetPanelLines(this.petRoster).join('\n'));
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
    return this.getPlayers()
      .filter((player) => player.movement !== undefined && !isHeroCombatDead(player.combat))
      .map((player) => ({
        slot: player.slot,
        x: player.sprite.x,
        y: player.sprite.y,
      }));
  }

  private applyBossAttack(time: number): void {
    const boss = this.getBossArena().boss;
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
      this.attackFlashes.push(createAttackFlash(this, toPhaserRect(hitbox), time, 0xff4444));
    }

    const attackBounds = toPhaserRect(hitbox);
    for (const player of this.getPlayers()) {
      if (!player.movement || isHeroCombatDead(player.combat)) {
        continue;
      }

      if (!Phaser.Geom.Intersects.RectangleToRectangle(attackBounds, getPlayerBounds(player))) {
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
    const boss = this.getBossArena().boss;
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
    const bossArena = this.getBossArena();
    if (bossArena.state !== 'active' || !bossArena.boss) {
      return;
    }

    for (const player of this.getPlayers()) {
      if (player.movement && !isHeroCombatDead(player.combat)) {
        this.applyPlayerHitOnBoss(player, time);
      }
    }
  }

  private updateBossArenaVisuals(): void {
    const bossArena = this.getBossArena();
    const boss = bossArena.boss;
    if (!boss || !this.bossView || !this.bossArenaLabel) {
      return;
    }

    if (bossArena.state === 'inactive') {
      this.bossArenaLabel.setText('');
      return;
    }

    if (bossArena.state === 'cleared') {
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
          setHeroProgressionHero(player.progression, heroId);
          player.baseStats = getHeroBaseStats(heroId, player.progression.level);
          resetHeroCombat(player.combat);
          resetHeroSkill(player.skill);
          this.syncPlayerEffectiveStats(player, { refill: true });
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
    const platforms = this.getActiveMovementPlatforms();
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
        platforms,
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

  private updatePetSystem(delta: number): void {
    const owner = this.getInventoryPlayer();
    if (!owner?.movement || isHeroCombatDead(owner.combat)) {
      this.petRuntime = undefined;
      this.destroyPetView();
      return;
    }

    this.petRuntime = syncPetRuntimeWithRoster(
      this.petRoster,
      this.petRuntime,
      {
        x: owner.movement.x,
        y: owner.movement.y,
        facingX: owner.movement.facingX,
      },
    );

    const activePet = getActivePet(this.petRoster);
    if (!this.petRuntime || !activePet) {
      this.destroyPetView();
      return;
    }

    updatePetRuntime(
      this.petRuntime,
      activePet,
      {
        x: owner.movement.x,
        y: owner.movement.y,
        facingX: owner.movement.facingX,
      },
      delta,
    );
    this.syncPetView(activePet);
  }

  private updateMagicWeapon(input: InputState, delta: number): void {
    const owner = this.getInventoryPlayer();
    syncMagicWeaponFromLoadout(this.magicWeapon, this.equipmentLoadout);

    if (!owner || isHeroCombatDead(owner.combat)) {
      updateMagicWeapon(
        this.magicWeapon,
        owner
          ? {
            combat: owner.combat,
            skill: owner.skill,
            effectiveStats: calculateEffectiveStats(owner.baseStats, this.equipmentLoadout),
            movement: owner.movement,
          }
          : this.createFallbackMagicWeaponTarget(),
        delta,
        this.projectileSystem,
        [],
        undefined,
        [],
      );
      this.syncMagicWeaponPlatformViews();
      return;
    }

    requestMagicWeaponTrigger({
      model: this.magicWeapon,
      target: {
        combat: owner.combat,
        skill: owner.skill,
        effectiveStats: calculateEffectiveStats(owner.baseStats, this.equipmentLoadout),
        movement: owner.movement,
      },
      source: owner.movement
        ? {
          sourceId: owner.slot,
          x: owner.movement.x,
          y: owner.movement.y,
          facingX: owner.movement.facingX,
          cameraX: this.cameras.main.scrollX,
          cameraY: this.cameras.main.scrollY,
        }
        : undefined,
      input: input.p1,
      previousInput: this.lastInput?.p1,
      friendlyPets: this.getActiveMagicWeaponPets(),
      enemyTargets: this.createMagicWeaponEnemyTargets(),
    });

    updateMagicWeapon(
      this.magicWeapon,
      {
        combat: owner.combat,
        skill: owner.skill,
        effectiveStats: calculateEffectiveStats(owner.baseStats, this.equipmentLoadout),
        movement: owner.movement,
      },
      delta,
      this.projectileSystem,
      this.createMagicWeaponEnemyTargets(),
      owner.movement
        ? {
          sourceId: owner.slot,
          x: owner.movement.x,
          y: owner.movement.y,
          facingX: owner.movement.facingX,
          cameraX: this.cameras.main.scrollX,
          cameraY: this.cameras.main.scrollY,
        }
        : undefined,
      this.getActiveMagicWeaponPets(),
    );
    this.syncMagicWeaponPlatformViews();
  }

  private updateMagicBottleCapture(input: InputState, delta: number): void {
    const owner = this.getInventoryPlayer();
    if (!owner?.movement || isHeroCombatDead(owner.combat)) {
      return;
    }

    if (this.magicWeapon.current?.fillName !== 'xhhl') {
      this.magicBottle.effect = undefined;
      if (this.magicBottle.lastResult.startsWith('宣花葫芦')) {
        this.magicBottle.lastResult = '宣花葫芦未装备';
      }
      return;
    }

    requestMagicBottleCapture({
      model: this.magicBottle,
      owner: {
        x: owner.movement.x,
        y: owner.movement.y,
        facingX: owner.movement.facingX,
      },
      inputMagicWeapon: input.p1.magicWeapon,
      previousInputMagicWeapon: this.lastInput?.p1.magicWeapon ?? false,
    });

    resolveMagicBottleCaptureHit({
      model: this.magicBottle,
      roster: this.petRoster,
      targets: this.capturablePetTargets,
    });
    updateMagicBottleCapture(this.magicBottle, delta);
  }

  private getActiveMovementPlatforms(): MovementPlatform[] {
    const magicPlatforms = this.magicWeapon.platforms
      .filter((platform) => platform.active)
      .map((platform) => ({
        id: platform.id,
        kind: 'through' as const,
        left: platform.x - platform.width / 2,
        right: platform.x + platform.width / 2,
        top: platform.y,
      }));
    return [...this.movementPlatforms, ...magicPlatforms];
  }

  private syncMagicWeaponPlatformViews(): void {
    const activeIds = new Set<string>();

    for (const platform of this.magicWeapon.platforms) {
      if (!platform.active) {
        continue;
      }
      activeIds.add(platform.id);
      const view = this.getOrCreateMagicWeaponPlatformView(platform);
      this.syncMagicWeaponPlatformView(view, platform);
    }

    for (const [id, view] of this.magicWeaponPlatformViews) {
      if (activeIds.has(id)) {
        continue;
      }
      view.root.destroy();
      this.magicWeaponPlatformViews.delete(id);
    }
  }

  private getOrCreateMagicWeaponPlatformView(
    platform: MagicWeaponPlatform,
  ): MagicWeaponPlatformView {
    const existing = this.magicWeaponPlatformViews.get(platform.id);
    if (existing) {
      return existing;
    }

    const root = this.add.container(platform.x, platform.y).setDepth(18);
    const glow = this.add.rectangle(0, 0, platform.width + 18, 12, 0x8ff4ff, 0.18);
    const body = this.add.rectangle(0, 0, platform.width, Math.max(6, platform.height), 0x7ee7ff, 0.78);
    const label = this.add.text(0, -18, 'MagicBigBottleData', {
      color: '#dffaff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
    }).setOrigin(0.5, 0.5);
    root.add([glow, body, label]);

    const view = { root, body, glow, label };
    this.magicWeaponPlatformViews.set(platform.id, view);
    return view;
  }

  private syncMagicWeaponPlatformView(
    view: MagicWeaponPlatformView,
    platform: MagicWeaponPlatform,
  ): void {
    const remainingRatio = Math.max(0, platform.remainingMs / platform.totalMs);
    view.root.setPosition(platform.x, platform.y);
    view.body.setSize(platform.width, Math.max(6, platform.height));
    view.glow.setSize(platform.width + 18, 12);
    view.body.setFillStyle(0x7ee7ff, 0.62 + remainingRatio * 0.24);
    view.glow.setFillStyle(0x8ff4ff, 0.1 + remainingRatio * 0.18);
    view.label.setAlpha(0.35 + remainingRatio * 0.45);
  }

  private createFallbackMagicWeaponTarget() {
    return {
      combat: createHeroCombat('magic-platform-fallback'),
      skill: createHeroSkillModel(),
    };
  }

  private syncPetView(activePet: NonNullable<ReturnType<typeof getActivePet>>): void {
    if (!this.petRuntime) {
      this.destroyPetView();
      return;
    }

    if (!this.petView) {
      this.petView = createPetView(
        this,
        activePet,
        this.petRuntime?.x ?? 0,
        this.petRuntime?.y ?? 0,
      );
    }

    this.petView.root.setPosition(this.petRuntime.x, this.petRuntime.y);
    this.petView.root.setScale(this.petRuntime.facingX < 0 ? -1 : 1, 1);
    this.petView.body.setFillStyle(this.petRuntime.state === 'warp' ? 0xf2c14e : 0x7ad7a8, 0.9);
    this.petView.ear.setFillStyle(0xf3f6ff, this.petRuntime.state === 'follow' ? 0.7 : 0.45);
    this.petView.label.setText(`${activePet.displayName} ${this.petRuntime.state}`);
  }

  private destroyPetView(): void {
    if (!this.petView) {
      return;
    }

    this.petView.root.destroy(true);
    this.petView = undefined;
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
        this.attackEffectViews.push(createAttackEffectView(
          this,
          { slot: player.slot, x: player.sprite.x, y: player.sprite.y },
          attackEvent.attack,
          getHeroTint(attackEvent.attack.heroId),
        ));
        this.attackFlashes.push(createAttackFlash(this, toPhaserRect(attackEvent.hitbox), time));
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
        const hasProjectileView = this.projectileEffectViews.some(
          (view) => view.projectileId === skillEvent.projectile.id,
        );
        if (!hasProjectileView) {
          this.projectileEffectViews.push(createProjectileEffectView(this, skillEvent.projectile));
        }
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

  private createMagicWeaponEnemyTargets(): MagicWeaponEnemyTarget[] {
    const targets: MagicWeaponEnemyTarget[] = this.monster30s.map((monster) => ({
      id: monster.id,
      x: monster.x,
      y: monster.y,
      isAlive: monster.state !== 'dead' && monster.state !== 'removed',
      applyMagicFlowerDebuff: (debuff) =>
        applyMonster30MagicFlowerDebuff(monster, {
          kind: 'magicFlowerDebuff',
          sourceName: debuff.sourceName,
          damageMultiplier: debuff.damageMultiplier,
          totalMs: debuff.totalMs,
          remainingMs: debuff.remainingMs,
        }),
      clearMagicFlowerDebuff: () => clearMonster30MagicFlowerDebuff(monster),
      applyMagicFlagDebuff: (debuff) =>
        applyMonster30MagicFlagDebuff(monster, {
          sourceName: debuff.sourceName,
          totalMs: debuff.totalMs,
          remainingMs: debuff.remainingMs,
        }),
      clearMagicFlagDebuff: () => clearMonster30MagicFlagDebuff(monster),
      applyMagicBaguaStun: (effect) =>
        applyMonster30MagicBaguaStun(monster, {
          sourceName: effect.sourceName,
          totalMs: effect.totalMs,
          remainingMs: effect.remainingMs,
        }),
      clearMagicBaguaStun: () => clearMonster30MagicBaguaStun(monster),
      applyMagicZlHummerStun: (effect) =>
        applyMonster30MagicZlHummerStun(monster, {
          sourceName: effect.sourceName,
          totalMs: effect.totalMs,
          remainingMs: effect.remainingMs,
        }),
      clearMagicZlHummerStun: () => clearMonster30MagicZlHummerStun(monster),
      applyMagicSnowIce: (effect) =>
        applyMonster30MagicSnowIce(monster, {
          sourceName: effect.sourceName,
          totalMs: effect.totalMs,
          remainingMs: effect.remainingMs,
        }),
      clearMagicSnowIce: () => clearMonster30MagicSnowIce(monster),
      applyMagicPearlStun: (effect) =>
        applyMonster30MagicPearlStun(monster, {
          sourceName: effect.sourceName,
          totalMs: effect.totalMs,
          remainingMs: effect.remainingMs,
        }),
      clearMagicPearlStun: () => clearMonster30MagicPearlStun(monster),
      applyMagicPearlPoison: (effect) =>
        applyMonster30MagicPearlPoison(monster, {
          sourceName: effect.sourceName,
          totalMs: effect.totalMs,
          remainingMs: effect.remainingMs,
          damagePerSecond: effect.damagePerSecond,
        }),
      clearMagicPearlPoison: () => clearMonster30MagicPearlPoison(monster),
    }));

    if (this.bossArena.state === 'active' && this.bossArena.boss) {
      targets.push({
        id: 'monster3',
        x: this.bossArena.boss.x,
        y: this.bossArena.boss.y,
        isAlive: !isBossDead(this.bossArena.boss),
      });
    }

    return targets;
  }

  private getActiveMagicWeaponPets(): NonNullable<ReturnType<typeof getActivePet>>[] {
    const activePet = getActivePet(this.petRoster);
    return activePet ? [activePet] : [];
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
    this.applyCombatBridgeResult(
      applyMonster30AttackToPlayers({
        monster,
        players: this.getPlayers(),
        hitRegistry: this.hitRegistry,
        renderedMonsterAttackIds: this.renderedMonsterAttackIds,
        time,
      }),
      time,
      0xff6b6b,
    );
  }

  private updateAllMonsterViews(): void {
    for (const monster of this.monster30s) {
      let view = this.monsterViews.get(monster);
      if (!view) {
        view = createMonsterView(this, monster);
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

  private updateCapturablePetTargetViews(): void {
    const activeTargets = this.capturablePetTargets.filter((target) => !target.removed);
    const activeIds = new Set(activeTargets.map((target) => target.id));

    for (const target of activeTargets) {
      let view = this.capturablePetTargetViews.get(target.id);
      if (!view) {
        view = this.createCapturablePetTargetView(target);
        this.capturablePetTargetViews.set(target.id, view);
      }
      this.syncCapturablePetTargetView(target, view);
    }

    for (const [targetId, view] of this.capturablePetTargetViews) {
      if (!activeIds.has(targetId)) {
        view.root.destroy(true);
        this.capturablePetTargetViews.delete(targetId);
      }
    }
  }

  private createCapturablePetTargetView(
    target: CapturablePetTarget,
  ): CapturablePetTargetView {
    const root = this.add.container(target.x, target.y);
    const body = this.add.ellipse(0, 0, target.width, target.height, 0x8bcf7a, 0.9);
    const mark = this.add.ellipse(14, -12, 12, 12, 0x182233, 0.9);
    const label = this.add.text(-58, -64, target.monsterId, {
      color: '#dff7ef',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
    });
    const feedback = this.add.text(-70, -84, target.feedback, {
      color: '#f2c14e',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
    });

    body.setStrokeStyle(2, 0xdff7ef, 0.85);
    root.add([body, mark, label, feedback]);
    root.setDepth(41);
    return { root, body, mark, label, feedback };
  }

  private syncCapturablePetTargetView(
    target: CapturablePetTarget,
    view: CapturablePetTargetView,
  ): void {
    view.root.setPosition(target.x, target.y);
    view.body.setScale(1 + Math.sin(this.time.now * 0.005) * 0.03);
    view.label.setText(`${target.monsterId} Lv.${target.level}`);
    view.feedback.setText(target.feedback);
  }

  private updateMagicBottleEffectView(): void {
    const effect = this.magicBottle.effect;
    if (!effect) {
      if (this.magicBottleEffectView) {
        this.magicBottleEffectView.root.destroy(true);
        this.magicBottleEffectView = undefined;
      }
      return;
    }

    if (!this.magicBottleEffectView) {
      this.magicBottleEffectView = this.createMagicBottleEffectView();
    }

    const view = this.magicBottleEffectView;
    const progress = Math.min(effect.ageMs / 2_000, 1);
    view.root.setPosition(effect.x, effect.y);
    view.root.setScale(effect.facingX, 1);
    view.root.setAlpha(0.9 - progress * 0.45);
    view.body.setSize(effect.width, effect.height);
    view.glow.setScale(1 + Math.sin(effect.ageMs * 0.018) * 0.08);
  }

  private createMagicBottleEffectView(): MagicBottleEffectView {
    const root = this.add.container(0, 0);
    const body = this.add.ellipse(0, 0, 112, 86, 0x7ee7ff, 0.18);
    const glow = this.add.ellipse(0, 0, 58, 44, 0xf2c14e, 0.32);
    const label = this.add.text(-58, -66, 'MagicBottleEffect3', {
      color: '#dff7ef',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
    });

    body.setStrokeStyle(2, 0x7ee7ff, 0.95);
    glow.setStrokeStyle(1, 0xf2c14e, 0.75);
    root.add([body, glow, label]);
    root.setDepth(63);
    return { root, body, glow, label };
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
    const auraTarget = this.monster30AuraTargets.get(monster.id) ??
      this.getInventoryPlayer()?.slot;
    if (auraTarget) {
      spawnAuraDrops({
        model: this.dropSystem,
        monsterX: monster.x,
        monsterY: monster.y,
        targetId: auraTarget,
        gxp: 1,
      });
    }
    this.monster30AuraTargets.delete(monster.id);

    const medicineSpawnY = monster.y + DropTuning.spawnOffsetY;
    maybeSpawnMedicineDrop(
      this.dropSystem,
      monster.x,
      monster.y,
      this.findDropSettleY(monster.x, medicineSpawnY),
    );

    const spawnY = monster.y + DropTuning.spawnOffsetY;
    spawnConfiguredMonsterDrop({
      model: this.dropSystem,
      monsterId: 'Monster30',
      context: this.createCurrentDropContext(),
      x: monster.x,
      monsterY: monster.y,
      settleY: this.findDropSettleY(monster.x, spawnY),
    });
  }

  private createAuraTargetSnapshots(): readonly AuraTargetSnapshot[] {
    return this.playerViews
      .filter((player) => player.movement && !isHeroCombatDead(player.combat))
      .map((player) => ({
        id: player.slot,
        x: player.movement?.x ?? player.sprite.x,
        y: (player.movement?.y ?? player.sprite.y) - 52,
      }));
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
    for (const type of collectMedicineDebugActions(this.debugKeys)) {
      this.spawnMedicineDropNearP1(type);
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

  private handleAuraDebugKeys(): void {
    for (const type of collectAuraDebugActions(this.debugKeys)) {
      this.spawnAuraDropNearP1(type);
    }
  }

  private spawnAuraDropNearP1(type: AuraDropType): void {
    const player = this.getInventoryPlayer();
    const x = player?.movement?.x ?? defaultClimbTuning.worldWidth / 2;
    const y = (player?.movement?.y ?? defaultClimbTuning.worldHeight - 140) - 54;
    spawnAuraDrop({
      model: this.dropSystem,
      auraType: type,
      x,
      y,
      targetId: player?.slot ?? 'p1',
      power: type === 'red' ? 2 : 5,
    });
  }

  private handleStoneDebugKey(): void {
    if (isStoneDebugJustDown(this.debugKeys)) {
      this.spawnStrengthStoneNearP1();
    }
  }

  private spawnStrengthStoneNearP1(): void {
    const player = this.getInventoryPlayer();
    const x = player?.movement?.x ?? defaultClimbTuning.worldWidth / 2;
    const monsterY = (player?.movement?.y ?? defaultClimbTuning.worldHeight - 140) + 70;
    const spawnY = monsterY + DropTuning.spawnOffsetY;
    spawnStrengthStoneDrop(
      this.dropSystem,
      x,
      monsterY,
      this.findDropSettleY(x, spawnY),
    );
  }

  private handleConfiguredDropDebugKeys(): void {
    const defaultContext = this.createCurrentDropContext();
    for (const action of collectConfiguredDropDebugActions(this.debugKeys, defaultContext)) {
      this.spawnConfiguredDropNearP1(
        action.monsterId,
        action.context,
        action.entryIndex,
        action.forceDrop,
      );
    }
  }

  private spawnConfiguredDropNearP1(
    monsterId: MonsterDropId,
    context: MonsterDropContext,
    entryIndex: number,
    forceDrop = true,
  ): void {
    const player = this.getInventoryPlayer();
    const x = player?.movement?.x ?? defaultClimbTuning.worldWidth / 2;
    const monsterY = (player?.movement?.y ?? defaultClimbTuning.worldHeight - 140) + 70;
    const spawnY = monsterY + DropTuning.spawnOffsetY;
    const drop = spawnConfiguredMonsterDrop({
      model: this.dropSystem,
      monsterId,
      context,
      x,
      monsterY,
      settleY: this.findDropSettleY(x, spawnY),
      forceDrop,
      entryIndex,
    });

    this.inventoryUI.message = drop
      ? `配置掉落 ${monsterId}: ${drop.fillName}`
      : this.dropSystem.lastMessage;
  }

  private createCurrentDropContext(): MonsterDropContext {
    return {
      curStage: 1,
      curLevel: 1,
    };
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

  private applyCombatBridgeResult(
    result: CombatBridgeResult,
    time: number,
    flashColor = 0xf2c14e,
  ): void {
    for (const damageEvent of result.damageEvents) {
      this.lastDamageEvent = damageEvent;
    }

    for (const flashBounds of result.flashBounds) {
      this.attackFlashes.push(createAttackFlash(this, flashBounds, time, flashColor));
    }

    for (const target of result.monsterAuraTargets) {
      this.monster30AuraTargets.set(target.monsterId, target.slot);
    }

    for (const award of result.monsterExperienceAwards) {
      this.awardMonsterExperience(award.slot, award.experience);
    }
  }

  private applyHeroAttackHit(player: PlayerView, time: number): void {
    this.applyCombatBridgeResult(
      applyHeroNormalAttackToMonster30s({
        player,
        monsters: this.getMonster30s(),
        hitRegistry: this.hitRegistry,
        time,
      }),
      time,
    );
  }

  private applyProjectileHits(time: number): void {
    for (const monster of this.monster30s) {
      if (monster.state === 'dead' || monster.state === 'removed') {
        continue;
      }

      const monsterBounds = getMonster30Bounds(monster);
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
          if (projectile.magicStunMs && projectile.magicStunMs > 0) {
            applyMonster30MagicZlHummerStun(monster, {
              sourceName: projectile.runtimeName,
              totalMs: projectile.magicStunMs,
            });
          }
          if (projectile.magicIceMs && projectile.magicIceMs > 0) {
            applyMonster30MagicSnowIce(monster, {
              sourceName: projectile.runtimeName,
              totalMs: projectile.magicIceMs,
            });
          }
          if (isPlayerSlot(projectile.sourceId)) {
            this.monster30AuraTargets.set(monster.id, projectile.sourceId);
            if (
              monster.hp <= 0 &&
              !monster.experienceAwardedTo &&
              monster.experience > 0
            ) {
              monster.experienceAwardedTo = projectile.sourceId;
              this.awardMonsterExperience(projectile.sourceId, monster.experience);
            }
          }
          this.lastDamageEvent = damageEvent;
          recordProjectileHit(projectile);
          this.attackFlashes.push(createAttackFlash(this, attackBounds, time, 0x7ee7ff));
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
          this.attackFlashes.push(createAttackFlash(this, attackBounds, time, 0x7ee7ff));
        }
      }
    }
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

    for (const projectile of activeProjectiles) {
      const hasView = this.projectileEffectViews.some((view) =>
        view.projectileId === projectile.id
      );
      if (!hasView) {
        this.projectileEffectViews.push(createProjectileEffectView(this, projectile));
      }
    }

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

    const playerBounds = getPlayerBounds(player);
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
      } else if (drop.kind === 'aura') {
        continue;
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
        view = createDropView(this, drop, this.getDropLabel(drop));
        this.dropViews.set(drop.id, view);
      }

      syncDropView(drop, view, getDropPickupAlpha(drop), this.getDropLabel(drop));
    }

    for (const [dropId, view] of this.dropViews) {
      if (!activeIds.has(dropId)) {
        destroyDropView(view);
        this.dropViews.delete(dropId);
      }
    }
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

    if (drop.kind === 'aura') {
      return drop.auraType === 'red' ? `Red aura +${drop.power}` : `White aura +${drop.power}`;
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
    const monster30s = this.getMonster30s();
    const activeMonsters = monster30s.filter(
      (m) => m.state !== 'dead' && m.state !== 'removed',
    );
    const activeStop = climb.activeStopIndex >= 0
      ? `stop@${climb.stopPoints[climb.activeStopIndex].y}`
      : 'none';
    const p1 = this.getPlayer('p1');
    const p2 = this.getPlayer('p2');

    this.statusText.setText([
      `Vertical Climb | monsters:${monster30s.length} alive:${activeMonsters.length}`,
      formatPlayerInput('P1', input.p1),
      formatPlayerInput('P2', input.p2),
      '',
      `camera:${Math.round(climb.cameraY)} target:${Math.round(climb.targetCameraY)}`,
      `stopPts:${climb.stopPoints.filter((s) => s.cleared).length}/${climb.stopPoints.length}`,
      `activeStop:${activeStop}`,
      `spawnTimer:${Math.round(climb.spawnTimerMs)}ms`,
      `boss:${climb.bossTriggered ? 'triggered' : 'pending'}`,
      `arena:${formatBossArenaState(this.getBossArena())}`,
      ...activeMonsters.map((m) => `  m30:${m.state} hp:${m.hp}/${m.maxHp} target:${m.targetSlot ?? '-'}${formatMonsterMagicFlowerDebuff(m)}${formatMonsterMagicFlagDebuff(m)}${formatMonsterMagicPearlEffects(m)}`),
      `hero p1:${formatHeroMovementState(p1?.movement)}`,
      `hero p2:${formatHeroMovementState(p2?.movement)}`,
      `combat p1:${formatHeroCombatState(p1?.combat)}`,
      `combat p2:${formatHeroCombatState(p2?.combat)}`,
      `progress p1:${formatHeroProgressionState(
        p1,
        p1 ? calculateEffectiveStats(p1.baseStats, this.getEquipmentLoadoutForPlayer(p1)) : undefined,
      )}`,
      `progress p2:${formatHeroProgressionState(
        p2,
        p2 ? calculateEffectiveStats(p2.baseStats, this.getEquipmentLoadoutForPlayer(p2)) : undefined,
      )}`,
      `normal p1:${formatHeroNormalAttackState(p1?.normalAttack)}`,
      `normal p2:${formatHeroNormalAttackState(p2?.normalAttack)}`,
      `skill p1:${formatHeroSkillState(p1?.skill)}`,
      `skill p2:${formatHeroSkillState(p2?.skill)}`,
      `projectiles:${formatProjectileState(getActiveProjectiles(this.getProjectileSystem()))}`,
      `skill cast:${formatSkillEvent(this.lastSkillEvent)}`,
      `skill ui p1:${formatSkillUIState(this.p1SkillUI)}`,
      `skill ui p2:${formatSkillUIState(this.p2SkillUI)}`,
      `inventory:${formatInventoryUIState(this.inventoryUI)}`,
      `pet:${formatPetState(this.getPetRoster(), this.petRuntime, this.petPanelOpen)}`,
      `magic weapon:${formatMagicWeaponState(this.magicWeapon)}`,
      `magic weapon soul:${this.magicWeaponSoul}`,
      `magic platforms:${formatMagicWeaponPlatforms(this.magicWeapon.platforms)}`,
      `magic bottle:${this.magicBottle.equippedFillName} H | soul ${this.magicBottle.soul} | ${this.magicBottle.lastResult}`,
      `catch targets:${formatCapturablePetTargets(this.getCapturablePetTargets())}`,
      'drop config keys:N Monster3 boss | M Monster7 | < Monster29 | F9 M1 | F10 M31 boss | F11 M207 default | F12 M601 zero',
      `drops:${formatDropState(getWorldDrops(this.getDropSystem()))}`,
      `drop msg:${this.getDropSystem().lastMessage}`,
      `aura total:gxp ${this.getDropSystem().auraRedGxp} | power ${this.getDropSystem().auraWhitePower}`,
      `aura msg:${this.getDropSystem().lastAuraMessage}`,
      `damage:${formatDamageEvent(this.lastDamageEvent)}`,
    ]);
  }

  private getInventoryPlayer(): PlayerView | undefined {
    return this.getPlayer('p1');
  }

  private getPlayer(slot: PlayerSlot): PlayerView | undefined {
    return findPlayerBySlot(this.gameContext, slot);
  }

  private getPlayers(): readonly PlayerView[] {
    return this.gameContext.players();
  }

  private getMonster30s(): readonly Monster30Model[] {
    return this.gameContext.monster30s();
  }

  private getBossArena(): BossArenaModel {
    return this.gameContext.bossArena();
  }

  private getProjectileSystem(): ProjectileSystemModel {
    return this.gameContext.projectileSystem();
  }

  private getDropSystem(): DropSystemModel {
    return this.gameContext.dropSystem();
  }

  private getPetRoster(): PetRoster {
    return this.gameContext.petRoster();
  }

  private getCapturablePetTargets(): readonly CapturablePetTarget[] {
    return this.gameContext.capturablePetTargets();
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

    this.syncPlayerEffectiveStats(player);
  }

  private syncPlayerEffectiveStats(
    player: PlayerView,
    options: { refill?: boolean } = {},
  ): void {
    const previousMaxHp = player.combat.maxHp;
    const previousMaxMp = player.skill.maxMp;
    const stats = calculateEffectiveStats(
      player.baseStats,
      this.getEquipmentLoadoutForPlayer(player),
    );
    const hpDelta = stats.maxHp - previousMaxHp;
    const mpDelta = stats.maxMp - previousMaxMp;

    player.combat.maxHp = stats.maxHp;
    player.skill.maxMp = stats.maxMp;
    if (options.refill) {
      player.combat.hp = player.combat.maxHp;
      player.skill.mp = player.skill.maxMp;
    } else {
      player.combat.hp = Math.min(
        Math.max(0, player.combat.hp + Math.max(0, hpDelta)),
        player.combat.maxHp,
      );
      player.skill.mp = Math.min(
        Math.max(0, player.skill.mp + Math.max(0, mpDelta)),
        player.skill.maxMp,
      );
    }
    this.refreshPlayerHeroView(player);
  }

  private awardMonsterExperience(
    slot: PlayerSlot,
    experience: number,
  ): MonsterExperienceShareResult | undefined {
    const player = this.getPlayer(slot);
    if (!player) {
      return undefined;
    }

    const share = slot === 'p1'
      ? awardMonsterExperienceWithCurrentPet(this.petRoster, experience)
      : {
          heroExperience: Math.max(0, Math.floor(experience)),
          petExperience: 0,
        };
    const result = addHeroExperience(player.progression, share.heroExperience);
    if (result.levelsGained > 0) {
      player.baseStats = result.baseStatsAfter;
      this.syncPlayerEffectiveStats(player, { refill: true });
    }
    return share;
  }

  private getEquipmentLoadoutForPlayer(player: PlayerView): EquipmentLoadout {
    return player.slot === 'p1'
      ? this.equipmentLoadout
      : this.emptyEquipmentLoadout;
  }

  private refreshPlayerHeroView(player: PlayerView): void {
    player.sprite.setTint(getHeroTint(player.normalAttack.heroId));
    player.label.setText(formatHeroLabel(player.slot, player.normalAttack, player.combat));
  }
}

function formatDropState(drops: readonly WorldDrop[]): string {
  const idle = drops.filter((drop) => drop.state === 'idle');
  if (idle.length === 0) {
    return 'none';
  }

  return idle
    .map((drop) => {
      if (drop.kind === 'aura') {
        return `${drop.auraType}Aura/${drop.phase}/${drop.power}@${Math.round(drop.x)},${Math.round(drop.y)}`;
      }

      return `${drop.bigType}/${drop.fillName}@${Math.round(drop.x)},${Math.round(drop.y)}`;
    })
    .join(', ');
}

function isPlayerSlot(value: string): value is PlayerSlot {
  return value === 'p1' || value === 'p2';
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

function formatMagicWeaponPlatforms(platforms: readonly MagicWeaponPlatform[]): string {
  const active = platforms.filter((platform) => platform.active);
  if (active.length === 0) {
    return 'none';
  }
  return active
    .map((platform) =>
      `${platform.id}@${Math.round(platform.x)},${Math.round(platform.y)} ${Math.ceil(platform.remainingMs)}ms`,
    )
    .join(' | ');
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

  const shield = combat.magicShield
    ? ` | shield:${Math.round(combat.magicShield.remainingAmount)}/${Math.round(combat.magicShield.initialAmount)} ${formatSeconds(combat.magicShield.remainingMs)}s`
    : '';
  const invincible = combat.magicInvulnerability
    ? ` | inv:${formatSeconds(combat.magicInvulnerability.remainingMs)}s`
    : '';
  const buff = combat.magicBuff
    ? ` | buff:${combat.magicBuff.kind} atk+${combat.magicBuff.attackBonusPercent}% crit+${combat.magicBuff.critBonusPercent}% ${formatSeconds(combat.magicBuff.remainingMs)}s`
    : '';
  const flower = combat.magicFlowerBuff
    ? ` | flower:+${combat.magicFlowerBuff.attackBonusFlat.toFixed(1)} x${combat.magicFlowerBuff.attackMultiplier.toFixed(2)} ${formatSeconds(combat.magicFlowerBuff.remainingMs)}s`
    : '';
  const flag = combat.magicFlagGuard
    ? ` | flag:${formatSeconds(combat.magicFlagGuard.remainingMs)}s debuff:${formatSeconds(combat.magicFlagGuard.debuffMs)}s`
    : '';
  return [
    combat.state,
    `hp:${combat.hp}/${combat.maxHp}`,
    `last:${combat.lastDamageEvent?.amount ?? 0}`,
  ].join(' | ') + shield + invincible + buff + flower + flag;
}

function formatHeroProgressionState(
  player: PlayerView | undefined,
  effectiveStats: HeroEffectiveStats | undefined,
): string {
  if (!player || !effectiveStats) {
    return 'missing';
  }

  return [
    formatHeroProgression(player.progression),
    `hp:${effectiveStats.maxHp}`,
    `mp:${effectiveStats.maxMp}`,
    `power:${effectiveStats.power}`,
    `def:${effectiveStats.defense}`,
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

function formatPetState(
  roster: PetRoster,
  runtime: PetRuntimeModel | undefined,
  panelOpen: boolean,
): string {
  const active = getActivePet(roster);
  const flower = active?.magicFlowerBuff
    ? ` flower:x${active.magicFlowerBuff.attackMultiplier.toFixed(2)} ${formatSeconds(active.magicFlowerBuff.remainingMs)}s`
    : '';
  return [
    panelOpen ? 'panel:open' : 'panel:closed',
    active
      ? `active:${active.displayName} Lv.${active.level} exp:${active.exp}/${active.expToNext} hp:${Math.round(active.hp)}/${Math.round(active.maxHp)} mp:${Math.round(active.mp)}/${Math.round(active.maxMp)} atk:${active.atk.toFixed(2)} def:${active.def}${flower}`
      : 'active:-',
    runtime
      ? `${runtime.state}@${Math.round(runtime.x)},${Math.round(runtime.y)}`
      : 'runtime:none',
    roster.message,
  ].join(' | ');
}

function formatCapturablePetTargets(targets: readonly CapturablePetTarget[]): string {
  const alive = targets.filter((target) => !target.removed);
  if (alive.length === 0) {
    return 'none';
  }

  return alive
    .map((target) =>
      `${target.monsterId} Lv.${target.level}@${Math.round(target.x)},${Math.round(target.y)} ${target.feedback}`
    )
    .join(', ');
}

function formatProjectileState(projectiles: readonly ProjectileModel[]): string {
  if (projectiles.length === 0) {
    return 'none';
  }

  const shownProjectiles = projectiles.slice(0, 8);
  const shown = shownProjectiles
    .map((projectile) => [
      projectile.sourceId,
      projectile.actionName,
      projectile.runtimeName,
      `serial:${projectile.hitSerial}`,
      `hits:${projectile.remainingHits}`,
    ].join('/'))
    .join(', ');
  return projectiles.length > shownProjectiles.length
    ? `${shown}, ... +${projectiles.length - shownProjectiles.length}`
    : shown;
}

function formatHeroLabel(
  slot: PlayerSlot,
  model: HeroNormalAttackModel,
  combat: HeroCombatModel,
): string {
  const shield = combat.magicShield
    ? ` S${Math.round(combat.magicShield.remainingAmount)}`
    : '';
  const invincible = combat.magicInvulnerability ? ' INV' : '';
  const buff = combat.magicBuff ? ` ${combat.magicBuff.kind}` : '';
  const flower = combat.magicFlowerBuff ? ' flower' : '';
  const flag = combat.magicFlagGuard ? ' flag' : '';
  return `${slot.toUpperCase()} R${model.heroId} ${HeroDisplayNames[model.heroId]} HP ${combat.hp}/${combat.maxHp}${shield}${invincible}${buff}${flower}${flag}`;
}

function formatMonsterMagicFlowerDebuff(monster: Monster30Model): string {
  const debuff = monster.magicFlowerDebuff;
  if (!debuff) {
    return '';
  }

  return ` flower:x${debuff.damageMultiplier.toFixed(3)} ${formatSeconds(debuff.remainingMs)}s`;
}

function formatMonsterMagicFlagDebuff(monster: Monster30Model): string {
  const debuff = monster.magicFlagDebuff;
  if (!debuff) {
    return '';
  }

  return ` flag:hitx${debuff.hitMultiplier.toFixed(2)} ${formatSeconds(debuff.remainingMs)}s tick:${debuff.lastTickDamage.toFixed(1)}`;
}

function formatMonsterMagicPearlEffects(monster: Monster30Model): string {
  const parts: string[] = [];
  if (monster.magicBaguaStun) {
    parts.push(`bagua-stun:${formatSeconds(monster.magicBaguaStun.remainingMs)}s`);
  }
  if (monster.magicZlHummerStun) {
    parts.push(`zltc-stun:${formatSeconds(monster.magicZlHummerStun.remainingMs)}s`);
  }
  if (monster.magicSnowIce) {
    parts.push(`snow-ice:${formatSeconds(monster.magicSnowIce.remainingMs)}s`);
  }
  if (monster.magicPearlStun) {
    parts.push(`pearl-stun:${formatSeconds(monster.magicPearlStun.remainingMs)}s`);
  }
  if (monster.magicPearlPoison) {
    parts.push(
      `pearl-poison:${formatSeconds(monster.magicPearlPoison.remainingMs)}s tick:${monster.magicPearlPoison.lastTickDamage.toFixed(1)}`,
    );
  }
  return parts.length > 0 ? ` ${parts.join(' ')}` : '';
}

function formatSeconds(ms: number): string {
  return (ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1);
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
