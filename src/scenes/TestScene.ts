// boundary: TestScene wires the playable debug slice; it does not directly own
// pet, magic weapon, boss, drop, or panel domain rules.
import Phaser from 'phaser';
import { createGameContext, findPlayerBySlot } from '../core/GameContext';
import { GameSettings } from '../core/GameSettings';
import {
  createDefaultLevelUnlockProgress,
  type LevelUnlockProgress,
  type Stage11FlowModel,
} from '../systems/Stage11FlowSystem';
import {
  createHitRegistry,
  formatDamageEvent,
  type DamageEvent,
  type HitRegistry,
} from './test-scene/TestSceneSystems';
import {
  isHeroCombatDead,
  resetHeroCombat,
  updateHeroCombat,
  type HeroCombatModel,
} from './test-scene/TestSceneSystems';
import {
  createInputSystem,
  type InputState,
  type InputSystem,
  type PlayerSlot,
} from './test-scene/TestSceneSystems';
import {
  updateHeroMovement,
  type HeroMovementBounds,
  type HeroMovementModel,
  type MovementPlatform,
} from './test-scene/TestSceneSystems';
import {
  type Monster30Model,
} from './test-scene/TestSceneSystems';
import {
  setHeroId,
  updateHeroNormalAttack,
  updateRole5NormalAttackState,
  type HeroId,
  type HeroNormalAttackModel,
} from './test-scene/TestSceneSystems';
import {
  createProjectileSystem,
  getActiveProjectiles,
  updateProjectiles,
  type ProjectileSourceSnapshot,
  type ProjectileSystemModel,
} from './test-scene/TestSceneSystems';
import {
  resetHeroSkill,
  getTestHeroSkillLoadoutPreset,
  getTestHeroSkillLoadoutPresetCount,
  takeRole2NormalAttackExtraMultiplier,
  type HeroSkillCastEvent,
  type HeroSkillModel,
} from './test-scene/TestSceneSystems';
import {
  createSkillLearningState,
  createSkillUIState,
  type HeroSkillLearningState,
  type SkillUIState,
} from './test-scene/TestSceneSystems';
import {
  createBossArena,
  createVerticalClimbState,
  defaultClimbTuning,
  type BossArenaModel,
  type VerticalClimbState,
} from './test-scene/TestSceneSystems';
import { consumeRole3NextDamageMultiplier } from '../systems/Role3ControlSkillSystem';
import { isRole3SspComboRequested } from '../systems/Role3ImpactSkillSystem';
import { isRole1HytjRunAttackRequested, isRole1SlzComboRequested } from '../systems/Role1BasicSkillSystem';
import { isRole5YybComboRequested, triggerRole5JrjlArrow } from '../systems/Role5SkillSystem';
import { updateHeroSkillProjectiles as updateHeroSkillProjectilesImpl } from './test-scene/TestSceneHeroSkillPipeline';
import { toggleTestHeroWeaponMode } from './test-scene/TestSceneHeroWeaponBridge';
import { updateRole4DollCombat as updateRole4DollCombatImpl } from './test-scene/TestSceneRole4DollCombatBridge';
import {
  calculateEffectiveStats,
  createSeedEquipmentRegistry,
  HeroNamesById,
  type EquipmentDefinition,
  type EquipmentLoadout,
  type HeroBaseStats,
} from './test-scene/TestSceneSystems';
import { type InventoryStore } from './test-scene/TestSceneSystems';
import { type InventoryUIState } from './test-scene/TestSceneSystems';
import {
  createDropSystem,
  getWorldDrops,
  updateWorldDrops,
  type DropSystemModel,
} from './test-scene/TestSceneSystems';
import {
  awardMonsterExperienceByTarget,
  createPetPanelSession,
  createPlayerPetRosters,
  getActivePet,
  type CapturablePetTarget,
  type MagicBottleCaptureModel,
  type MonsterExperienceShareResult,
  type PetRoster,
  type PetPanelSession,
  type PlayerPetRosters,
  type PetRuntimeModel,
} from './test-scene/TestSceneSystems';
import { formatMagicWeaponState, type MagicWeaponModel } from './test-scene/TestSceneSystems';
import {
  createPlayerInventoryRuntimes,
  type PlayerInventoryRuntimes,
} from './test-scene/TestSceneSystems';
import {
  addHeroExperience,
  getHeroBaseStats,
  setHeroProgressionHero,
  type HeroProgressionModel,
} from './test-scene/TestSceneSystems';
import {
  type TestSceneDebugKeys,
} from './test-scene/TestSceneDebugKeys';
import {
  createAttackEffectView,
  createAttackFlash,
  createBossView,
  createTransferDoorView,
  type AttackEffectView,
  type AttackFlash,
  type BossView,
  type DropView,
  type MonsterView,
  type PetView,
  type ProjectileEffectView,
  type TransferDoorView,
} from './test-scene/TestSceneViews';
import {
  createTestSceneUpdatePipeline,
  type TestSceneUpdatePipeline,
} from './test-scene/TestSceneUpdatePipeline';
import {
  formatBossArenaState,
  formatCapturablePetTargets,
  formatDropState,
  formatHeroCombatState,
  formatHeroLabel,
  formatHeroMovementState,
  formatHeroNormalAttackState,
  formatHeroProgressionState,
  formatHeroSkillState,
  formatInventoryUIState,
  formatMagicWeaponPlatforms,
  formatMonsterMagicFlagDebuff,
  formatMonsterMagicFlowerDebuff,
  formatMonsterMagicPearlEffects,
  formatPetState,
  formatPlayerInput,
  formatProjectileState,
  formatSkillEvent,
  formatSkillUIState,
} from './test-scene/TestSceneFormatters';
import {
  handleInventoryUIKeys as handleInventoryUIKeysImpl,
  handlePetUIKeys as handlePetUIKeysImpl,
  selectPetFromPanel as selectPetFromPanelImpl,
  togglePetFromPanel as togglePetFromPanelImpl,
  handleSkillUIForPlayer as handleSkillUIForPlayerImpl,
  handleSkillUIKeys as handleSkillUIKeysImpl,
  tryUseSelectedPetConsumable as tryUseSelectedPetConsumableImpl,
  updateInventoryPanel as updateInventoryPanelImpl,
  updatePetPanel as updatePetPanelImpl,
  upgradeCurrentMagicWeapon as upgradeCurrentMagicWeaponImpl,
} from './test-scene/TestSceneUIHandlers';
import {
  createPetPanel as createPetPanelImpl,
  createPetUIKeys as createPetUIKeysImpl,
  type PetPanelView,
} from './test-scene/TestScenePetPanelBridge';
import { updateP2PetSystem as updateP2PetSystemImpl } from './test-scene/TestSceneP2PetBridge';
import {
  activateBossFight as activateBossFightImpl,
  applyBossAttack as applyBossAttackImpl,
  applyPlayerHitOnBoss as applyPlayerHitOnBossImpl,
  getBossBounds as getBossBoundsImpl,
  getMonster3Targets as getMonster3TargetsImpl,
  updateBossArena as updateBossArenaImpl,
  updateBossArenaVisuals as updateBossArenaVisualsImpl,
  updateBossHitByPlayers as updateBossHitByPlayersImpl,
} from './test-scene/TestSceneBossArena';
import {
  createFallbackMagicWeaponTarget as createFallbackMagicWeaponTargetImpl,
  createMagicWeaponEnemyTargets as createMagicWeaponEnemyTargetsImpl,
  getActiveMagicWeaponPets as getActiveMagicWeaponPetsImpl,
  getActiveMovementPlatforms as getActiveMovementPlatformsImpl,
  getOrCreateMagicWeaponPlatformView as getOrCreateMagicWeaponPlatformViewImpl,
  syncMagicWeaponPlatformView as syncMagicWeaponPlatformViewImpl,
  syncMagicWeaponPlatformViews as syncMagicWeaponPlatformViewsImpl,
  updatePetSystem as updatePetSystemImpl,
} from './test-scene/TestScenePetMagicBridge';
import {
  updateMagicBottleCapture as updateMagicBottleCaptureImpl,
  updateMagicWeapon as updateMagicWeaponImpl,
} from './test-scene/TestSceneMagicOwnershipBridge';
import {
  createPetSkillTargets as createPetSkillTargetsImpl,
  destroyPetView as destroyPetViewImpl,
  syncPetView as syncPetViewImpl,
} from './test-scene/TestScenePetViewBridge';
import {
  initializeSceneSave as initializeSceneSaveImpl,
  saveSceneNow as saveSceneNowImpl,
  updateSceneSave as updateSceneSaveImpl,
} from './test-scene/TestSceneSaveBridge';
import {
  initializeStage11Flow as initializeStage11FlowImpl,
  showStage11ClearOverlay as showClearOverlayImpl,
  updateStage11Flow as updateStage11FlowImpl,
} from './test-scene/TestSceneStage11FlowBridge';
import {
  buildSkillPanelLines as buildSkillPanelLinesImpl,
  createCapturablePetTargets as createCapturablePetTargetsImpl,
  createDebugKeys as createDebugKeysImpl,
  createHeroDebugKeys as createHeroDebugKeysImpl,
  createInventoryUIKeys as createInventoryUIKeysImpl,
  createPlayerMarkers as createPlayerMarkersImpl,
  createPlayerView as createPlayerViewImpl,
  createSkillBar as createSkillBarImpl,
  createSkillPanel as createSkillPanelImpl,
  createSkillUIKeys as createSkillUIKeysImpl,
  updateSkillBar as updateSkillBarImpl,
  updateSkillBars as updateSkillBarsImpl,
  updateSkillPanel as updateSkillPanelImpl,
  updateSkillPanels as updateSkillPanelsImpl,
} from './test-scene/TestSceneSetup';
import { createStage11World } from './test-scene/TestSceneStage11Bridge';
import {
  createCraftingPanel as createInventoryPanelImpl,
  type CraftingPanelView as InventoryPanelView,
} from './test-scene/TestSceneCraftingView';
import {
  applyAllMonster30Attacks as applyAllMonster30AttacksImpl,
  applyCombatBridgeResult as applyCombatBridgeResultImpl,
  applyHeroAttackHit as applyHeroAttackHitImpl,
  applyProjectileHits as applyProjectileHitsImpl,
  applySingleMonster30Attack as applySingleMonster30AttackImpl,
  applyBossArenaClamp as applyBossArenaClampImpl,
  createAuraTargetSnapshots as createAuraTargetSnapshotsImpl,
  createCapturablePetTargetView as createCapturablePetTargetViewImpl,
  createCurrentDropContext as createCurrentDropContextImpl,
  destroyMonsterView as destroyMonsterViewImpl,
  finalizeCameraPosition as finalizeCameraPositionImpl,
  findDropSettleY as findDropSettleYImpl,
  getDropBounds as getDropBoundsImpl,
  getDropLabel as getDropLabelImpl,
  getPlayerMinY as getPlayerMinYImpl,
  handleAuraDebugKeys as handleAuraDebugKeysImpl,
  handleConfiguredDropDebugKeys as handleConfiguredDropDebugKeysImpl,
  handleDropPickup as handleDropPickupImpl,
  handleMedicineDebugKeys as handleMedicineDebugKeysImpl,
  handleStoneDebugKey as handleStoneDebugKeyImpl,
  spawnAuraDropNearP1 as spawnAuraDropNearP1Impl,
  spawnConfiguredDropNearP1 as spawnConfiguredDropNearP1Impl,
  spawnMedicineDropNearP1 as spawnMedicineDropNearP1Impl,
  spawnMonster30DropSlice as spawnMonster30DropSliceImpl,
  spawnMonster30Wave as spawnMonster30WaveImpl,
  spawnStrengthStoneNearP1 as spawnStrengthStoneNearP1Impl,
  syncCapturablePetTargetView as syncCapturablePetTargetViewImpl,
  syncMonsterView as syncMonsterViewImpl,
  tryPetQlfjCounterAttack as tryPetQlfjCounterAttackImpl,
  updateAllMonsterViews as updateAllMonsterViewsImpl,
  updateAttackEffectViews as updateAttackEffectViewsImpl,
  updateAttackFlashes as updateAttackFlashesImpl,
  updateCapturablePetTargetViews as updateCapturablePetTargetViewsImpl,
  updateCloudVisuals as updateCloudVisualsImpl,
  updateDropViews as updateDropViewsImpl,
  updateMonster30s as updateMonster30sImpl,
  updatePlayerCombatVisual as updatePlayerCombatVisualImpl,
  updateProjectileEffectViews as updateProjectileEffectViewsImpl,
  updateVerticalClimbLogic as updateVerticalClimbLogicImpl,
} from './test-scene/TestSceneWorldBridge';
import {
  createMagicBottleEffectView as createMagicBottleEffectViewImpl,
  updateMagicBottleEffectViews as updateMagicBottleEffectViewImpl,
  type MagicBottleEffectView,
} from './test-scene/TestSceneMagicBottleViewBridge';
import { getTestScenePlayerCount } from './test-scene/TestSceneConfig';

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

type CapturablePetTargetView = {
  root: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Ellipse;
  mark: Phaser.GameObjects.Ellipse;
  label: Phaser.GameObjects.Text;
  feedback: Phaser.GameObjects.Text;
};


type MagicWeaponPlatformView = {
  root: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Rectangle;
  glow: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
};

export class TestScene extends Phaser.Scene {
  public playerCount: 1 | 2 = getTestScenePlayerCount();
  public levelUnlockProgress: LevelUnlockProgress = createDefaultLevelUnlockProgress();
  public stage11Flow?: Stage11FlowModel;
  private inputSystem?: InputSystem;
  private statusText?: Phaser.GameObjects.Text;
  private playerViews: PlayerView[] = [];
  private monster30s: Monster30Model[] = [];
  public monsterViews = new Map<Monster30Model, MonsterView>();
  private lastInput?: InputState;
  private verticalClimb: VerticalClimbState = createVerticalClimbState(GameSettings.height);
  public cloudSprites: Phaser.GameObjects.Ellipse[] = [];
  public cloudBaseY: number[] = [];
  private attackFlashes: AttackFlash[] = [];
  private attackEffectViews: AttackEffectView[] = [];
  private projectileSystem: ProjectileSystemModel = createProjectileSystem();
  public projectileEffectViews: ProjectileEffectView[] = [];
  private dropSystem: DropSystemModel = createDropSystem();
  public dropViews = new Map<string, DropView>();
  public monster30AuraTargets = new Map<string, PlayerSlot>();
  public hitRegistry: HitRegistry = createHitRegistry();
  private lastDamageEvent?: DamageEvent;
  private lastSkillEvent?: HeroSkillCastEvent;
  public renderedMonsterAttackIds = new Set<string>();
  private p1HeroSelectKeys?: HeroSelectionKeys;
  private p2HeroSelectKeys?: HeroSelectionKeys;
  private heroLoadoutPresetIndexes: Record<PlayerSlot, Partial<Record<HeroId, number>>> = {
    p1: {},
    p2: {},
  };
  private p1WeaponToggleKey?: Phaser.Input.Keyboard.Key;
  private p2WeaponToggleKey?: Phaser.Input.Keyboard.Key;
  public p1SkillPanelKey?: Phaser.Input.Keyboard.Key;
  public p2SkillPanelKey?: Phaser.Input.Keyboard.Key;
  public p1LoadoutCycleKey?: Phaser.Input.Keyboard.Key;
  public p2LoadoutCycleKey?: Phaser.Input.Keyboard.Key;
  public panelTabKey?: Phaser.Input.Keyboard.Key;
  public panelBindKey?: Phaser.Input.Keyboard.Key;
  public panelUpgradeKey?: Phaser.Input.Keyboard.Key;
  public panelLearnKey?: Phaser.Input.Keyboard.Key;
  public panelTreeUpgradeKey?: Phaser.Input.Keyboard.Key;
  public panelPassiveKey?: Phaser.Input.Keyboard.Key;
  public panelSkillSelectKeys?: Phaser.Input.Keyboard.Key[];
  public inventoryToggleKey?: Phaser.Input.Keyboard.Key;
  public p2InventoryToggleKey?: Phaser.Input.Keyboard.Key;
  public inventoryTabKey?: Phaser.Input.Keyboard.Key;
  public inventoryUpKey?: Phaser.Input.Keyboard.Key;
  public inventoryDownKey?: Phaser.Input.Keyboard.Key;
  public inventoryLeftKey?: Phaser.Input.Keyboard.Key;
  public inventoryRightKey?: Phaser.Input.Keyboard.Key;
  public inventoryConfirmKey?: Phaser.Input.Keyboard.Key;
  public inventoryBackspaceKey?: Phaser.Input.Keyboard.Key;
  public inventoryDeleteKey?: Phaser.Input.Keyboard.Key;
  public inventoryMagicWeaponUpgradeKey?: Phaser.Input.Keyboard.Key;
  public petPanelToggleKey?: Phaser.Input.Keyboard.Key;
  public p2PetPanelToggleKey?: Phaser.Input.Keyboard.Key;
  public debugKeys?: TestSceneDebugKeys;
  private p1SkillUI: SkillUIState = createSkillUIState();
  private p2SkillUI: SkillUIState = createSkillUIState();
  private p1SkillBar?: SkillBarView;
  private p2SkillBar?: SkillBarView;
  public p1SkillLearning: HeroSkillLearningState = createSkillLearningState(10, 5000);
  public p2SkillLearning: HeroSkillLearningState = createSkillLearningState(10, 5000);
  private p1SkillPanel?: SkillPanelView;
  private p2SkillPanel?: SkillPanelView;
  private bossArena: BossArenaModel = createBossArena();
  public bossView?: BossView;
  public bossDoorView?: TransferDoorView;
  public bossArenaLabel?: Phaser.GameObjects.Text;
  public clearOverlay?: Phaser.GameObjects.Container;
  public arenaWasActive = false;
  public bossSpawnedOnce = false;
  private equipmentRegistry: Record<string, EquipmentDefinition> = createSeedEquipmentRegistry();
  public playerInventoryRuntimes: PlayerInventoryRuntimes = createPlayerInventoryRuntimes(this.equipmentRegistry);
  public inventoryOwner: PlayerSlot = 'p1';
  public inventoryStore: InventoryStore = this.playerInventoryRuntimes.p1.store;
  private inventoryUI: InventoryUIState = this.playerInventoryRuntimes.p1.ui;
  private inventoryPanel?: InventoryPanelView;
  private magicWeapon: MagicWeaponModel = this.playerInventoryRuntimes.p1.magicWeapon;
  private magicWeaponSoul = this.playerInventoryRuntimes.p1.magicWeaponSoul;
  private playerPetRosters: PlayerPetRosters = createPlayerPetRosters();
  private petRoster: PetRoster = this.playerPetRosters.p1;
  public p2PetRoster: PetRoster = this.playerPetRosters.p2;
  private magicBottle: MagicBottleCaptureModel = this.playerInventoryRuntimes.p1.magicBottle;
  private capturablePetTargets: CapturablePetTarget[] = [];
  public capturablePetTargetViews = new Map<string, CapturablePetTargetView>();
  public magicBottleEffectViews = new Map<PlayerSlot, MagicBottleEffectView>();
  private petPanelOpen = false;
  public petPanelSession: PetPanelSession = createPetPanelSession();
  private petRuntime?: PetRuntimeModel;
  public p2PetRuntime?: PetRuntimeModel;
  public petView?: PetView;
  public p2PetView?: PetView;
  private petPanel?: PetPanelView;
  public magicWeaponPlatformViews = new Map<string, MagicWeaponPlatformView>();
  private updatePipeline?: TestSceneUpdatePipeline;
  public movementPlatforms: MovementPlatform[] = [];
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

  public init(data?: { playerCount?: 1 | 2 }): void {
    this.playerCount = data?.playerCount === 2 ? 2 : data?.playerCount === 1
      ? 1
      : getTestScenePlayerCount();
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

    const stage11World = createStage11World(this);
    this.playerViews = this.createPlayerMarkers(this.playerCount);
    this.initializeSceneSave();
    this.initializeStage11Flow();
    this.capturablePetTargets = this.createCapturablePetTargets();

    this.movementPlatforms = [...stage11World.movementPlatforms];
    this.inputSystem = createInputSystem(this);
    this.createHeroDebugKeys();
    this.createSkillUIKeys();
    this.createInventoryUIKeys();
    this.createPetUIKeys();
    this.createDebugKeys();
    this.p1SkillBar = this.createSkillBar('p1', 44, 540);
    this.p1SkillBar.container.setScrollFactor(0).setDepth(80);
    this.p1SkillPanel = this.createSkillPanel('p1');
    this.p1SkillPanel.container.setScrollFactor(0).setDepth(85);
    if (this.playerCount === 2) {
      this.p2SkillBar = this.createSkillBar('p2', 488, 540);
      this.p2SkillBar.container.setScrollFactor(0).setDepth(80);
      this.p2SkillPanel = this.createSkillPanel('p2');
      this.p2SkillPanel.container.setScrollFactor(0).setDepth(85);
    }
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
    this.statusText = this.add.text(24, 22, '', {
      color: '#f3f6ff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      lineSpacing: 6,
    }).setScrollFactor(0).setDepth(90);
  }

  public override update(time: number, delta: number): void {
    if (!this.inputSystem || !this.statusText || !this.updateStage11Flow(delta)) {
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
      updatePetSystem: (delta) => {
        this.updatePetSystem(delta);
        if (this.playerCount === 2) {
          this.updateP2PetSystem(delta);
        }
      },
      updateMagicWeapon: (input, delta) => this.updateMagicWeapon(input, delta),
      updateMagicBottleCapture: (input, delta) => this.updateMagicBottleCapture(input, delta),
      updateBossHitByPlayers: (time) => this.updateBossHitByPlayers(time),
      updateHeroSkillProjectiles: (input, time, delta) => this.updateHeroSkillProjectiles(input, time, delta),
      updateProjectileSystem: (time, delta) => this.updateProjectileSystem(time, delta),
      updateRole4DollCombat: (time) => this.updateRole4DollCombat(time),
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
      canHandleSkillUI: () => !this.playerInventoryRuntimes.p1.ui.isOpen
        && !this.playerInventoryRuntimes.p2.ui.isOpen
        && !this.petPanelOpen,
      handleSkillUIKeys: () => this.handleSkillUIKeys(),
      updateSkillBars: () => this.updateSkillBars(),
      updateSkillPanels: () => this.updateSkillPanels(),
      updateBossArena: (input, time, delta) => this.updateBossArena(input, time, delta),
      updateBossArenaVisuals: () => this.updateBossArenaVisuals(),
      updateCloudVisuals: () => this.updateCloudVisuals(),
      updateInventoryPanel: () => this.updateInventoryPanel(),
      updatePetPanel: () => this.updatePetPanel(),
      updateSaveSystem: (delta) => this.updateSceneSave(delta),
      updateStatusText: (input) => this.updateStatusText(input),
      rememberInput: (input) => {
        this.lastInput = input;
      },
    });
  }

  private initializeSceneSave = initializeSceneSaveImpl;
  public saveSceneNow = saveSceneNowImpl;
  private updateSceneSave = updateSceneSaveImpl;
  private initializeStage11Flow = initializeStage11FlowImpl;
  private updateStage11Flow = updateStage11FlowImpl;
  private createPlayerMarkers = createPlayerMarkersImpl;
  public createCapturablePetTargets = createCapturablePetTargetsImpl;
  public createPlayerView = createPlayerViewImpl;
  private createHeroDebugKeys = createHeroDebugKeysImpl;
  private createSkillUIKeys = createSkillUIKeysImpl;
  private createInventoryUIKeys = createInventoryUIKeysImpl;
  private createPetUIKeys = createPetUIKeysImpl;
  private createDebugKeys = createDebugKeysImpl;
  private createInventoryPanel = createInventoryPanelImpl;
  private createPetPanel = createPetPanelImpl;
  private createSkillBar = createSkillBarImpl;
  private createSkillPanel = createSkillPanelImpl;
  public updateSkillPanel = updateSkillPanelImpl;
  public buildSkillPanelLines = buildSkillPanelLinesImpl;
  private updateSkillBars = updateSkillBarsImpl;
  private updateSkillPanels = updateSkillPanelsImpl;
  public updateSkillBar = updateSkillBarImpl;
  private handleInventoryUIKeys = handleInventoryUIKeysImpl;
  public tryUseSelectedPetConsumable = tryUseSelectedPetConsumableImpl;
  private updateInventoryPanel = updateInventoryPanelImpl;
  public upgradeCurrentMagicWeapon = upgradeCurrentMagicWeaponImpl;
  private handlePetUIKeys = handlePetUIKeysImpl;
  public selectPetFromPanel = selectPetFromPanelImpl;
  public togglePetFromPanel = togglePetFromPanelImpl;
  private updatePetPanel = updatePetPanelImpl;
  private handleSkillUIKeys = handleSkillUIKeysImpl;
  public handleSkillUIForPlayer = handleSkillUIForPlayerImpl;
  private updateBossArena = updateBossArenaImpl;
  public activateBossFight = activateBossFightImpl;
  public getMonster3Targets = getMonster3TargetsImpl;
  public applyBossAttack = applyBossAttackImpl;
  public applyPlayerHitOnBoss = applyPlayerHitOnBossImpl;
  public getBossBounds = getBossBoundsImpl;
  private updateBossHitByPlayers = updateBossHitByPlayersImpl;
  private updateBossArenaVisuals = updateBossArenaVisualsImpl;
  public showClearOverlay = showClearOverlayImpl;
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
          const previousHeroId = player.normalAttack.heroId;
          const presetCount = getTestHeroSkillLoadoutPresetCount(heroId);
          const previousPresetIndex = this.heroLoadoutPresetIndexes[slot][heroId] ?? 0;
          const presetIndex = previousHeroId === heroId
            ? (previousPresetIndex + 1) % presetCount
            : 0;
          this.heroLoadoutPresetIndexes[slot][heroId] = presetIndex;
          setHeroId(player.normalAttack, heroId);
          setHeroProgressionHero(player.progression, heroId);
          player.baseStats = getHeroBaseStats(heroId, player.progression.level);
          resetHeroCombat(player.combat);
          resetHeroSkill(player.skill);
          player.skill.loadout = getTestHeroSkillLoadoutPreset(heroId, presetIndex);
          player.skill.lastResult = `role${heroId} loadout ${presetIndex + 1}/${presetCount}`;
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
    const model = toggleTestHeroWeaponMode({ players: this.playerViews, slot, key });
    const player = model ? this.playerViews.find((view) => view.slot === slot) : undefined;
    if (player) this.refreshPlayerHeroView(player);
  }

  public getMonsterTargets(): readonly { slot: PlayerSlot; x: number; y: number }[] {
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

  private updatePetSystem = updatePetSystemImpl;
  private updateP2PetSystem = updateP2PetSystemImpl;
  private updateMagicWeapon = updateMagicWeaponImpl;
  private updateMagicBottleCapture = updateMagicBottleCaptureImpl;
  private getActiveMovementPlatforms = getActiveMovementPlatformsImpl;
  public syncMagicWeaponPlatformViews = syncMagicWeaponPlatformViewsImpl;
  public getOrCreateMagicWeaponPlatformView = getOrCreateMagicWeaponPlatformViewImpl;
  public syncMagicWeaponPlatformView = syncMagicWeaponPlatformViewImpl;
  public createFallbackMagicWeaponTarget = createFallbackMagicWeaponTargetImpl;
  public syncPetView = syncPetViewImpl;
  public destroyPetView = destroyPetViewImpl;
  private updateHeroNormalAttacks(input: InputState, time: number): void {
    for (const player of this.playerViews) {
      if (!player.movement || isHeroCombatDead(player.combat)) {
        continue;
      }

      if (isRole3SspComboRequested({
        heroId: player.normalAttack.heroId,
        skill: player.skill,
        input: input[player.slot],
        previousInput: this.lastInput?.[player.slot],
      })) {
        continue;
      }
      if (isRole1SlzComboRequested({
        heroId: player.normalAttack.heroId,
        skill: player.skill,
        input: input[player.slot],
        previousInput: this.lastInput?.[player.slot],
      })) {
        continue;
      }
      if (isRole1HytjRunAttackRequested({
        heroId: player.normalAttack.heroId,
        skill: player.skill,
        input: input[player.slot],
        previousInput: this.lastInput?.[player.slot],
        movement: player.movement,
      })) {
        continue;
      }
      if (isRole5YybComboRequested({
        heroId: player.normalAttack.heroId,
        skill: player.skill,
        input: input[player.slot],
        previousInput: this.lastInput?.[player.slot],
      })) {
        continue;
      }

      const attackEvent = updateHeroNormalAttack(
        player.normalAttack,
        input[player.slot],
        this.lastInput?.[player.slot],
        player.movement,
        time,
        player.normalAttack.heroId === 2 ? {
          ...player.skill.learnedRole2Skills,
          sourcePower: player.baseStats.power,
          resource: player.skill,
          extraDamageMultiplier: () => takeRole2NormalAttackExtraMultiplier(player.skill),
        } : undefined,
        player.normalAttack.heroId === 3
          ? () => consumeRole3NextDamageMultiplier(player.skill.role3Runtime)
          : undefined,
      );

      if (attackEvent) {
        this.attackEffectViews.push(createAttackEffectView(
          this,
          { slot: player.slot, x: player.sprite.x, y: player.sprite.y },
          attackEvent.attack,
          getHeroTint(attackEvent.attack.heroId),
        ));
        this.attackFlashes.push(createAttackFlash(this, toPhaserRect(attackEvent.hitbox), time));
        if (player.normalAttack.heroId === 5) {
          triggerRole5JrjlArrow({
            runtime: player.skill.role5Runtime,
            projectiles: this.projectileSystem,
            point: {
              sourceId: player.combat.id,
              x: player.movement.x,
              y: player.movement.y,
              facingX: player.movement.facingX,
            },
            sourcePower: player.baseStats.power,
          });
        }
      }

      updateRole5NormalAttackState(player.normalAttack, this.game.loop.delta);
      this.applyHeroAttackHit(player, time);
    }
  }

  private updateHeroSkillProjectiles = updateHeroSkillProjectilesImpl;
  private updateRole4DollCombat(time: number): void {
    updateRole4DollCombatImpl({
      playerViews: this.playerViews,
      monster30s: this.monster30s,
      projectileSystem: this.projectileSystem,
      hitRegistry: this.hitRegistry,
      time,
    });
  }

  private updateProjectileSystem(time: number, delta: number): void {
    updateProjectiles(this.projectileSystem, this.createProjectileSourceSnapshots(), delta);
    this.applyProjectileHits(time);
    this.updateProjectileEffectViews();
  }

  private createProjectileSourceSnapshots(): readonly ProjectileSourceSnapshot[] {
    const playerSnapshots = this.playerViews.map((player) => ({
      id: player.slot,
      state: player.combat.state,
    }));
    const shadowSnapshots = this.playerViews.flatMap((player) => {
      const shadow = player.skill.role2Runtime.shadow;
      return shadow ? [{ id: shadow.id, state: 'ready' as const }] : [];
    });
    const activePet = getActivePet(this.petRoster);
    if (!activePet) {
      return [...playerSnapshots, ...shadowSnapshots];
    }

    return [
      ...playerSnapshots,
      ...shadowSnapshots,
      {
        id: activePet.id,
        state: activePet.hp <= 0 ? 'dead' as const : 'ready' as const,
      },
    ];
  }

  public createPetSkillTargets = createPetSkillTargetsImpl;
  public createMagicWeaponEnemyTargets = createMagicWeaponEnemyTargetsImpl;
  public getActiveMagicWeaponPets = getActiveMagicWeaponPetsImpl;
  private updateMonster30s = updateMonster30sImpl;
  private applyAllMonster30Attacks = applyAllMonster30AttacksImpl;
  public applySingleMonster30Attack = applySingleMonster30AttackImpl;
  public tryPetQlfjCounterAttack = tryPetQlfjCounterAttackImpl;
  private updateAllMonsterViews = updateAllMonsterViewsImpl;
  public syncMonsterView = syncMonsterViewImpl;
  public destroyMonsterView = destroyMonsterViewImpl;
  private updateCapturablePetTargetViews = updateCapturablePetTargetViewsImpl;
  public createCapturablePetTargetView = createCapturablePetTargetViewImpl;
  public syncCapturablePetTargetView = syncCapturablePetTargetViewImpl;
  private updateMagicBottleEffectView = updateMagicBottleEffectViewImpl;
  public createMagicBottleEffectView = createMagicBottleEffectViewImpl;
  private updateVerticalClimbLogic = updateVerticalClimbLogicImpl;
  public getPlayerMinY = getPlayerMinYImpl;
  public applyBossArenaClamp = applyBossArenaClampImpl;
  public spawnMonster30Wave = spawnMonster30WaveImpl;
  public spawnMonster30DropSlice = spawnMonster30DropSliceImpl;
  private createAuraTargetSnapshots = createAuraTargetSnapshotsImpl;
  public findDropSettleY = findDropSettleYImpl;
  private handleMedicineDebugKeys = handleMedicineDebugKeysImpl;
  public spawnMedicineDropNearP1 = spawnMedicineDropNearP1Impl;
  private handleAuraDebugKeys = handleAuraDebugKeysImpl;
  public spawnAuraDropNearP1 = spawnAuraDropNearP1Impl;
  private handleStoneDebugKey = handleStoneDebugKeyImpl;
  public spawnStrengthStoneNearP1 = spawnStrengthStoneNearP1Impl;
  private handleConfiguredDropDebugKeys = handleConfiguredDropDebugKeysImpl;
  public spawnConfiguredDropNearP1 = spawnConfiguredDropNearP1Impl;
  public createCurrentDropContext = createCurrentDropContextImpl;
  private finalizeCameraPosition = finalizeCameraPositionImpl;
  private updateCloudVisuals = updateCloudVisualsImpl;
  public applyCombatBridgeResult = applyCombatBridgeResultImpl;
  private applyHeroAttackHit = applyHeroAttackHitImpl;
  private applyProjectileHits = applyProjectileHitsImpl;
  private updatePlayerCombatVisual = updatePlayerCombatVisualImpl;
  private updateProjectileEffectViews = updateProjectileEffectViewsImpl;
  private handleDropPickup = handleDropPickupImpl;
  private updateDropViews = updateDropViewsImpl;
  public getDropBounds = getDropBoundsImpl;
  public getDropLabel = getDropLabelImpl;
  private updateAttackEffectViews = updateAttackEffectViewsImpl;
  private updateAttackFlashes = updateAttackFlashesImpl;
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
      `Vertical Climb | ${this.playerCount === 1 ? 'single player' : 'two players'} | monsters:${monster30s.length} alive:${activeMonsters.length}`,
      formatPlayerInput('P1', input.p1),
      ...(this.playerCount === 2 ? [formatPlayerInput('P2', input.p2)] : []),
      '',
      `camera:${Math.round(climb.cameraY)} target:${Math.round(climb.targetCameraY)}`,
      `stopPts:${climb.stopPoints.filter((s) => s.cleared).length}/${climb.stopPoints.length}`,
      `activeStop:${activeStop}`,
      `spawnTimer:${Math.round(climb.spawnTimerMs)}ms`,
      `boss:${climb.bossTriggered ? 'triggered' : 'pending'}`,
      `arena:${formatBossArenaState(this.getBossArena())}`,
      ...activeMonsters.map((m) => `  m30:${m.state} hp:${m.hp}/${m.maxHp} target:${m.targetSlot ?? '-'}${formatMonsterMagicFlowerDebuff(m)}${formatMonsterMagicFlagDebuff(m)}${formatMonsterMagicPearlEffects(m)}`),
      `hero p1:${formatHeroMovementState(p1?.movement)}`,
      ...(this.playerCount === 2 ? [`hero p2:${formatHeroMovementState(p2?.movement)}`] : []),
      `combat p1:${formatHeroCombatState(p1?.combat)}`,
      ...(this.playerCount === 2 ? [`combat p2:${formatHeroCombatState(p2?.combat)}`] : []),
      `progress p1:${formatHeroProgressionState(
        p1,
        p1 ? calculateEffectiveStats(p1.baseStats, this.getEquipmentLoadoutForPlayer(p1)) : undefined,
      )}`,
      ...(this.playerCount === 2 ? [`progress p2:${formatHeroProgressionState(
        p2,
        p2 ? calculateEffectiveStats(p2.baseStats, this.getEquipmentLoadoutForPlayer(p2)) : undefined,
      )}`] : []),
      `normal p1:${formatHeroNormalAttackState(p1?.normalAttack)}`,
      ...(this.playerCount === 2 ? [`normal p2:${formatHeroNormalAttackState(p2?.normalAttack)}`] : []),
      `skill p1:${formatHeroSkillState(p1?.skill)}`,
      ...(this.playerCount === 2 ? [`skill p2:${formatHeroSkillState(p2?.skill)}`] : []),
      `projectiles:${formatProjectileState(getActiveProjectiles(this.getProjectileSystem()))}`,
      `skill cast:${formatSkillEvent(this.lastSkillEvent)}`,
      `skill ui p1:${formatSkillUIState(this.p1SkillUI)}`,
      ...(this.playerCount === 2 ? [`skill ui p2:${formatSkillUIState(this.p2SkillUI)}`] : []),
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

  public getInventoryPlayer(): PlayerView | undefined {
    return this.getPlayer('p1');
  }

  private getPlayer(slot: PlayerSlot): PlayerView | undefined {
    return findPlayerBySlot(this.gameContext, slot);
  }

  public getPlayers(): readonly PlayerView[] {
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

  public getInventoryHeroName(slot: PlayerSlot = 'p1'): string {
    const player = this.getPlayer(slot);
    if (!player) {
      return HeroNamesById[2];
    }

    return HeroNamesById[player.normalAttack.heroId] ?? `R${player.normalAttack.heroId}`;
  }

  public syncInventoryHeroStats(slot: PlayerSlot = 'p1'): void {
    const player = this.getPlayer(slot);
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

  public awardMonsterExperience(
    slot: PlayerSlot,
    experience: number,
  ): MonsterExperienceShareResult | undefined {
    const player = this.getPlayer(slot);
    if (!player) {
      return undefined;
    }

    const share = awardMonsterExperienceByTarget(
      this.playerPetRosters,
      { kind: 'hero', ownerSlot: slot },
      experience,
    );
    const result = addHeroExperience(player.progression, share.heroExperience);
    if (result.levelsGained > 0) {
      player.baseStats = result.baseStatsAfter;
      this.syncPlayerEffectiveStats(player, { refill: true });
    }
    return share;
  }

  private getEquipmentLoadoutForPlayer(player: PlayerView): EquipmentLoadout {
    return this.playerInventoryRuntimes[player.slot].loadout;
  }

  private refreshPlayerHeroView(player: PlayerView): void {
    player.sprite.setTint(getHeroTint(player.normalAttack.heroId));
    player.label.setText(formatHeroLabel(player.slot, player.normalAttack, player.combat));
  }
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
















