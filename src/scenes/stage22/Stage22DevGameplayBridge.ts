// boundary: DEV-only Stage 2-2 bridge submits input/environment/fire hits to HeroPartyRuntime;
// it keeps true fire-pixel sampling, camera, and disposable QA feedback only.
import Phaser from 'phaser';
import { stage22Assets } from '../../assets/AssetManifest';
import { createInputSystem } from '../../systems/InputSystem';
import {
  createStage22FireHazards,
  Stage22FireTuning,
  updateStage22FireHazards,
  type Stage22FireHazardModel,
  type Stage22FireTarget,
} from '../../systems/Stage22FireHazardSystem';
import {
  STAGE22_GROUND_PLATFORM_ID,
  STAGE22_GROUND_TOP_Y,
  STAGE22_TRAVEL_LEFT,
  STAGE22_TRAVEL_RIGHT,
} from '../../systems/Stage22Layout';
import {
  getStage22CameraScrollX,
  stage22MovementPlatforms,
} from '../../systems/Stage22TraversalSystem';
import { createHeroPartyRuntime } from '../HeroPartyRuntimeBridge';

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
  const heroes = createHeroPartyRuntime(scene, playerViews, {
    groundY: STAGE22_GROUND_TOP_Y,
    groundPlatformId: STAGE22_GROUND_PLATFORM_ID,
  });
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
      heroes.update({
        inputs,
        timeMs: scene.time.now,
        deltaMs,
        environmentFor: () => ({
          platforms: stage22MovementPlatforms,
          bounds: { left: STAGE22_TRAVEL_LEFT, right: STAGE22_TRAVEL_RIGHT },
        }),
      });

      const snapshots = heroes.snapshots();
      const targets: Stage22FireTarget[] = snapshots.map((hero) => ({
        slot: hero.slot,
        x: hero.x,
        y: hero.y,
        width: hero.view.displayWidth,
        height: hero.view.displayHeight,
        facingX: hero.facingX,
        alive: hero.alive,
        isYourFather: false,
      }));
      const hits = updateStage22FireHazards(
        hazards,
        targets,
        deltaMs,
        (hazard, target) => hasVisibleStage22FirePixel(scene, hazard, target),
      );
      if (freezeFireFrame !== undefined) {
        hazards.forEach((hazard) => {
          hazard.frame = freezeFireFrame;
          hazard.frameElapsedMs = 0;
        });
      }
      if (!noDamage) {
        heroes.applyEnvironmentHits(hits.map((hit) => {
          const hero = snapshots.find((candidate) => candidate.slot === hit.target);
          const halfWidth = (hero?.width ?? 0) / 2;
          return {
            target: hit.target,
            damage: hit.damage,
            knockbackX: hit.knockbackX,
            bounds: {
              left: STAGE22_TRAVEL_LEFT + halfWidth,
              right: STAGE22_TRAVEL_RIGHT - halfWidth,
            },
            deathReason: 'movement-trap',
          };
        }));
      }
      updateFireViews(hazards);
      const settledSnapshots = heroes.snapshots();
      const living = settledSnapshots.filter((hero) => hero.alive);
      if (living.length > 0) {
        scene.cameras.main.scrollX = getStage22CameraScrollX(
          Math.max(...living.map((hero) => hero.x)),
          undefined,
        );
      }
      const nearest = hazards.reduce((best, hazard) =>
        Math.abs(hazard.source.x - settledSnapshots[0]!.x)
          < Math.abs(best.source.x - settledSnapshots[0]!.x) ? hazard : best, hazards[0]!);
      status.setText(
        `${settledSnapshots.map((hero) => `${hero.slot.toUpperCase()} HP ${Math.ceil(hero.hp)}`).join(' · ')}`
        + ` · nearest ${nearest.source.id} frame ${nearest.frame}/130`
        + ` · fires ${hazards.filter((hazard) => hazard.frame !== 1).length}/9`,
      );
    },
    destroy: () => {
      status.destroy();
      heroes.destroy();
    },
  };
}

export function hasVisibleStage22FirePixel(
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
