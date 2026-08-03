import Phaser from 'phaser';
import type { FormalPartyRuntime } from '../../systems/FormalPartyRuntimeSystem';
import {
  isStage11DoorQaEnabled,
  stage11LevelDefinition,
} from '../../systems/Stage11LevelDefinition';
import { stage11TransferDoor } from '../../systems/Stage11Layout';
import type { Stage11FlowModel } from '../../systems/Stage11FlowSystem';
import { createPlayableLevelRuntime, type PlayableLevelRuntime } from '../PlayableLevelRuntime';
import { createTestSceneStage1HudBridge } from './TestSceneStage1HudBridge';
import { createStage11World, type Stage11WorldView } from './TestSceneStage11Bridge';
import { initializeStage11Flow, updateStage11Flow } from './TestSceneStage11FlowBridge';
import { createBossView } from './TestSceneViews';
import { createInputSystem } from './TestSceneSystems';
import { readStage11AttackGeometry } from '../stage11/Stage11MonsterVisualBridge';
import { createTestSceneHeroPartyRuntime } from './TestSceneHeroPartyRuntimeBridge';

// Stage 1-1 keeps its combat/pet/skill sandbox as a narrow encounter adapter.
// Common camera, party views, feature entries, result, routing and destruction
// remain owned by PlayableLevelRuntime.
export function createTestSceneStage11Runtime(
  scene: Phaser.Scene & any,
  partyRuntime: FormalPartyRuntime,
): PlayableLevelRuntime {
  return createPlayableLevelRuntime(scene, partyRuntime, stage11LevelDefinition, {
    configureCamera: (runtimeScene) => {
      runtimeScene.cameras.main.scrollY = stage11LevelDefinition.worldBounds.height - 590;
    },
    createWorld: createStage11World,
    createPlayerViews: () => {
      scene.heroPartyRuntime = createTestSceneHeroPartyRuntime(
        scene,
        partyRuntime.playerCount,
        partyRuntime.members.map((member) => member.heroId),
      );
      return scene.heroPartyRuntime.players().map((player: any) => player.sprite);
    },
    createEncounter: (_runtimeScene, _playerCount, _playerViews, world) => {
      initializeEncounter(scene, world);
      let reported = false;
      return {
        update: (deltaMs) => {
          if (reported || !scene.inputSystem || !scene.statusText) return undefined;
          if (updateStage11Flow.call(scene, deltaMs) === 'failed') {
            reported = true;
            return 'failed';
          }
          const input = scene.inputSystem.read();
          const previousCameraY = scene.verticalClimb.cameraY;
          scene.getUpdatePipeline().run(scene.time.now, deltaMs, input, previousCameraY);
          scene.stage1CombatHud?.update(deltaMs);
          if ((scene.stage11Flow as Stage11FlowModel | undefined)?.phase !== 'cleared') {
            return undefined;
          }
          scene.levelUnlockProgress = { ...scene.stage11Flow.unlockProgress };
          scene.saveSceneNow();
          reported = true;
          return 'cleared';
        },
        unlockProgress: () => scene.stage11Flow?.unlockProgress ?? scene.levelUnlockProgress,
        destroy: () => {
          scene.stage1CombatHud?.destroy();
          scene.stage1CombatHud = undefined;
          scene.heroPartyRuntime?.destroy();
          scene.heroPartyRuntime = undefined;
        },
      };
    },
  });
}

function initializeEncounter(scene: Phaser.Scene & any, world: Stage11WorldView): void {
  scene.initializeSceneSave();
  initializeStage11Flow.call(scene);
  scene.capturablePetTargets = [];
  scene.movementPlatforms = [...world.movementPlatforms];
  scene.inputSystem = createInputSystem(scene);
  scene.createHeroDebugKeys();
  scene.createSkillUIKeys();
  scene.createInventoryUIKeys();
  scene.createPetUIKeys();
  scene.createDebugKeys();
  scene.p1SkillBar = scene.createSkillBar('p1', 44, 540);
  scene.p1SkillBar.container.setScrollFactor(0).setDepth(80).setVisible(false);
  scene.p1SkillPanel = scene.createSkillPanel('p1');
  scene.p1SkillPanel.container.setScrollFactor(0).setDepth(85);
  if (scene.playerCount === 2) {
    scene.p2SkillBar = scene.createSkillBar('p2', 488, 540);
    scene.p2SkillBar.container.setScrollFactor(0).setDepth(80).setVisible(false);
    scene.p2SkillPanel = scene.createSkillPanel('p2');
    scene.p2SkillPanel.container.setScrollFactor(0).setDepth(85);
  }
  scene.inventoryPanel = scene.createInventoryPanel();
  scene.inventoryPanel.container.setScrollFactor(0).setDepth(95);
  scene.petPanel = scene.createPetPanel();
  scene.petPanel.container.setScrollFactor(0).setDepth(96);
  scene.stage11AttackGeometry = readStage11AttackGeometry(scene);
  scene.bossView = createBossView(scene, scene.stage11AttackGeometry);
  scene.bossDoorView = world.transferDoor;
  scene.bossArenaLabel = scene.add.text(470, 50, '', {
    color: '#f2c14e', fontFamily: 'Arial, sans-serif', fontSize: '18px',
  }).setOrigin(0.5, 0.5);
  scene.statusText = scene.add.text(24, 22, '', {
    color: '#f3f6ff', fontFamily: 'Arial, sans-serif', fontSize: '16px', lineSpacing: 6,
  }).setScrollFactor(0).setDepth(90).setVisible(false);
  scene.stage1CombatHud = createTestSceneStage1HudBridge(scene);
  applyDoorQa(scene);
}

function applyDoorQa(scene: Phaser.Scene & any): void {
  if (!isStage11DoorQaEnabled(globalThis.location?.search ?? '', globalThis.location?.hostname ?? '')) {
    return;
  }
  scene.activateBossFight();
  if (scene.bossArena.boss) {
    scene.bossArena.boss.hp = 0;
    scene.bossArena.boss.state = 'dead';
  }
  const doorCenterX = (stage11TransferDoor.bounds.left + stage11TransferDoor.bounds.right) / 2;
  const doorBottomY = stage11TransferDoor.bounds.bottom;
  for (const player of scene.playerViews) {
    player.sprite.setPosition(doorCenterX, doorBottomY);
    player.movement.x = doorCenterX;
    player.movement.y = doorBottomY;
  }
  scene.verticalClimb.cameraY = 50;
  scene.verticalClimb.targetCameraY = 50;
  scene.cameras.main.scrollY = 50;
}
