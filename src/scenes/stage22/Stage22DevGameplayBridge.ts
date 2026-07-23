// boundary: DEV-only Stage 2-2 bridge adapts input, shared movement, true fire pixels,
// camera, and disposable QA feedback. It owns no wave, monster, result, or save state.
import Phaser from 'phaser';
import { stage22Assets } from '../../assets/AssetManifest';
import { createInputSystem } from '../../systems/InputSystem';
import {
  createLevelHeroMovementRuntime,
  updateLevelHeroMovementRuntime,
} from '../../systems/LevelHeroMovementSystem';
import {
  createStage22FireHazards,
  Stage22FireTuning,
  updateStage22FireHazards,
  type Stage22FireHazardModel,
  type Stage22FireTarget,
} from '../../systems/Stage22FireHazardSystem';
import {
  STAGE22_GROUND_PLATFORM_ID,
  STAGE22_TRAVEL_LEFT,
  STAGE22_TRAVEL_RIGHT,
} from '../../systems/Stage22Layout';
import {
  getStage22CameraScrollX,
  stage22MovementPlatforms,
} from '../../systems/Stage22TraversalSystem';

type DevPlayer = {
  slot: 'p1' | 'p2';
  view: Phaser.GameObjects.Image;
  hp: number;
  alive: boolean;
};

export type Stage22DevGameplayHandle = Readonly<{
  hazards: readonly Stage22FireHazardModel[];
  update: (deltaMs: number) => void;
  destroy: () => void;
}>;

export function createStage22DevGameplay(
  scene: Phaser.Scene,
  playerViews: readonly Phaser.GameObjects.Image[],
  updateFireViews: (hazards: readonly Stage22FireHazardModel[]) => void,
  noDamage = false,
  freezeFireFrame?: number,
): Stage22DevGameplayHandle {
  const input = createInputSystem(scene);
  const players: DevPlayer[] = playerViews.map((view, index) => ({
    slot: index === 0 ? 'p1' : 'p2',
    view,
    hp: 500,
    alive: true,
  }));
  const movement = createLevelHeroMovementRuntime(playerViews.map((view) => ({
    x: view.x,
    y: view.y,
    width: view.displayWidth,
    currentPlatformId: STAGE22_GROUND_PLATFORM_ID,
  })));
  const hazards = createStage22FireHazards();
  if (freezeFireFrame !== undefined) {
    hazards.forEach((hazard) => { hazard.frame = freezeFireFrame; });
    updateFireViews(hazards);
  }
  const status = scene.add.text(18, 51, '', {
    color: '#dce8ff',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    backgroundColor: '#101724cc',
    padding: { x: 8, y: 5 },
  }).setScrollFactor(0).setDepth(100);

  return {
    hazards,
    update: (deltaMs) => {
      const state = input.read();
      const inputs = [state.p1, state.p2];
      updateLevelHeroMovementRuntime(
        movement,
        inputs,
        players.map((player) => player.alive),
        () => ({
          platforms: stage22MovementPlatforms,
          bounds: { left: STAGE22_TRAVEL_LEFT, right: STAGE22_TRAVEL_RIGHT },
        }),
        scene.time.now,
        deltaMs,
      );
      movement.members.forEach((member, index) => {
        const player = players[index];
        if (!player) return;
        player.view.setPosition(member.movement.x, member.movement.y);
        player.view.clearTint();
      });

      const targets: Stage22FireTarget[] = players.map((player, index) => {
        const member = movement.members[index]!;
        return {
          slot: player.slot,
          x: member.movement.x,
          y: member.movement.y,
          width: player.view.displayWidth,
          height: player.view.displayHeight,
          facingX: member.movement.facingX,
          alive: player.alive,
          isYourFather: false,
        };
      });
      const hits = updateStage22FireHazards(
        hazards,
        targets,
        deltaMs,
        (hazard, target) => hasVisibleFirePixel(scene, hazard, target),
      );
      if (freezeFireFrame !== undefined) {
        hazards.forEach((hazard) => {
          hazard.frame = freezeFireFrame;
          hazard.frameElapsedMs = 0;
        });
      }
      for (const hit of hits) {
        if (noDamage) continue;
        const index = hit.target === 'p1' ? 0 : 1;
        const player = players[index];
        const member = movement.members[index];
        if (!player || !member) continue;
        player.hp = Math.max(0, player.hp - hit.damage);
        player.alive = player.hp > 0;
        member.movement.x = Phaser.Math.Clamp(
          member.movement.x + hit.knockbackX,
          STAGE22_TRAVEL_LEFT + member.movement.width / 2,
          STAGE22_TRAVEL_RIGHT - member.movement.width / 2,
        );
        player.view.setPosition(member.movement.x, member.movement.y)
          .setTint(player.alive ? 0xff7777 : 0x555555);
      }
      updateFireViews(hazards);
      const living = players.filter((player) => player.alive);
      if (living.length > 0) {
        scene.cameras.main.scrollX = getStage22CameraScrollX(
          Math.max(...living.map((player) => player.view.x)),
          undefined,
        );
      }
      const nearest = hazards.reduce((best, hazard) =>
        Math.abs(hazard.source.x - players[0]!.view.x)
          < Math.abs(best.source.x - players[0]!.view.x) ? hazard : best, hazards[0]!);
      status.setText(
        `${players.map((player) => `${player.slot.toUpperCase()} HP ${Math.ceil(player.hp)}`).join(' · ')}`
        + ` · nearest ${nearest.source.id} frame ${nearest.frame}/130`
        + ` · fires ${hazards.filter((hazard) => hazard.frame !== 1).length}/9`,
      );
    },
    destroy: () => status.destroy(),
  };
}

function hasVisibleFirePixel(
  scene: Phaser.Scene,
  hazard: Stage22FireHazardModel,
  target: Stage22FireTarget,
): boolean {
  const source = hazard.source;
  const renderLeft = source.x + Stage22FireTuning.sourceLeft * source.scaleX;
  const renderTop = source.y + Stage22FireTuning.sourceTop;
  const renderRight = renderLeft + Stage22FireTuning.sourceWidth * source.scaleX;
  const renderBottom = renderTop + Stage22FireTuning.sourceHeight;
  const targetLeft = target.x - target.width / 2;
  const targetRight = target.x + target.width / 2;
  const targetTop = target.y - target.height;
  const overlapLeft = Math.max(renderLeft, targetLeft);
  const overlapRight = Math.min(renderRight, targetRight);
  const overlapTop = Math.max(renderTop, targetTop);
  const overlapBottom = Math.min(renderBottom, target.y);
  if (overlapLeft > overlapRight || overlapTop > overlapBottom) return false;

  const frameKey = stage22Assets.fireThorn.frameKeys[hazard.frame - 1];
  if (!frameKey) return false;
  const sampleStep = 4;
  for (let worldY = overlapTop; worldY <= overlapBottom; worldY += sampleStep) {
    for (let worldX = overlapLeft; worldX <= overlapRight; worldX += sampleStep) {
      const textureX = Math.floor((worldX - renderLeft) / source.scaleX);
      const textureY = Math.floor(worldY - renderTop);
      const alpha = scene.textures.getPixelAlpha(textureX, textureY, frameKey);
      if (alpha !== null && alpha > Stage22FireTuning.alphaThreshold) return true;
    }
  }
  return false;
}
