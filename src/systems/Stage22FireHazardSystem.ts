import { stage22FireThorns, type Stage22FireThorn } from './Stage22Layout';

export type Stage22FirePlayerSlot = 'p1' | 'p2';

export type Stage22FireHazardModel = {
  source: Stage22FireThorn;
  frame: number;
  frameElapsedMs: number;
  attackElapsedMs: number;
  attackId: number;
  hitKeys: Set<string>;
};

export type Stage22FireTarget = Readonly<{
  slot: Stage22FirePlayerSlot;
  x: number;
  y: number;
  width: number;
  height: number;
  facingX: -1 | 1;
  alive: boolean;
  isYourFather: boolean;
}>;

export type Stage22FireHit = Readonly<{
  hazardId: string;
  attackId: number;
  target: Stage22FirePlayerSlot;
  damage: number;
  knockbackX: -10 | 10;
}>;

export type Stage22FirePixelHitTest = (
  hazard: Stage22FireHazardModel,
  target: Stage22FireTarget,
) => boolean;

export const Stage22FireTuning = {
  fps: 30,
  frameCount: 130,
  activeFrameStart: 2,
  activeFrameEnd: 19,
  triggerDistanceX: 200,
  attackIdIntervalMs: 2_000,
  sourceWidth: 143,
  sourceHeight: 314.35,
  sourceLeft: -71.5,
  sourceTop: -285.7,
  alphaThreshold: 8,
} as const;

const frameDurationMs = 1000 / Stage22FireTuning.fps;

export function createStage22FireHazards(): Stage22FireHazardModel[] {
  return stage22FireThorns.map((source) => ({
    source,
    frame: 1,
    frameElapsedMs: 0,
    attackElapsedMs: 0,
    attackId: 1,
    hitKeys: new Set(),
  }));
}

export function updateStage22FireHazards(
  hazards: Stage22FireHazardModel[],
  targets: readonly Stage22FireTarget[],
  deltaMs: number,
  pixelHitTest: Stage22FirePixelHitTest,
  random: () => number = Math.random,
): readonly Stage22FireHit[] {
  const elapsed = Math.max(0, deltaMs);
  const hits: Stage22FireHit[] = [];
  for (const hazard of hazards) {
    advanceAttackId(hazard, elapsed);
    if (
      hazard.frame === 1
      && targets.some((target) => target.alive
        && Math.abs(target.x - hazard.source.x)
          <= Stage22FireTuning.triggerDistanceX + Number.EPSILON * 1_000)
    ) {
      hazard.frame = 2;
      hazard.frameElapsedMs = 0;
    }
    advanceAnimation(hazard, elapsed);
    if (
      hazard.frame < Stage22FireTuning.activeFrameStart
      || hazard.frame > Stage22FireTuning.activeFrameEnd
    ) continue;
    for (const target of targets) {
      if (!target.alive || target.isYourFather || !pixelHitTest(hazard, target)) continue;
      const hitKey = `${target.slot}:${hazard.attackId}`;
      if (hazard.hitKeys.has(hitKey)) continue;
      hazard.hitKeys.add(hitKey);
      hits.push({
        hazardId: hazard.source.id,
        attackId: hazard.attackId,
        target: target.slot,
        damage: 40 + random() * 10,
        knockbackX: target.facingX === 1 ? 10 : -10,
      });
    }
  }
  return hits;
}

function advanceAttackId(hazard: Stage22FireHazardModel, deltaMs: number): void {
  hazard.attackElapsedMs += deltaMs;
  while (hazard.attackElapsedMs >= Stage22FireTuning.attackIdIntervalMs) {
    hazard.attackElapsedMs -= Stage22FireTuning.attackIdIntervalMs;
    hazard.attackId += 1;
    hazard.hitKeys.clear();
  }
}

function advanceAnimation(hazard: Stage22FireHazardModel, deltaMs: number): void {
  if (hazard.frame === 1) return;
  hazard.frameElapsedMs += deltaMs;
  while (hazard.frameElapsedMs + 0.0001 >= frameDurationMs) {
    hazard.frameElapsedMs -= frameDurationMs;
    hazard.frame += 1;
    if (hazard.frame > Stage22FireTuning.frameCount) {
      hazard.frame = 1;
      hazard.frameElapsedMs = 0;
      break;
    }
  }
}
