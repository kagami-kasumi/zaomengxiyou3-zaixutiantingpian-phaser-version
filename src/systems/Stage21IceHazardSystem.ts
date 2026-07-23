import { stage21IceThorns, type Stage21IceThorn } from './Stage21Layout';

export type Stage21PlayerSlot = 'p1' | 'p2';

export type Stage21IceHazardModel = {
  source: Stage21IceThorn;
  frame: number;
  frameElapsedMs: number;
  attackElapsedMs: number;
  attackId: number;
  hitKeys: Set<string>;
};

export type Stage21IceTarget = Readonly<{
  slot: Stage21PlayerSlot;
  x: number;
  y: number;
  width: number;
  height: number;
  facingX: -1 | 1;
  alive: boolean;
}>;

export type Stage21IceHit = Readonly<{
  hazardId: string;
  attackId: number;
  target: Stage21PlayerSlot;
  damage: number;
  knockbackX: -10 | 10;
}>;

export const Stage21IceTuning = {
  fps: 30,
  frameCount: 66,
  activeFrameEnd: 32,
  triggerDistanceX: 200,
  attackIdIntervalMs: 2_000,
  sourceWidth: 59,
  sourceHeight: 588,
} as const;

const frameDurationMs = 1000 / Stage21IceTuning.fps;

export function createStage21IceHazards(): Stage21IceHazardModel[] {
  return stage21IceThorns.map((source) => ({
    source,
    frame: 1,
    frameElapsedMs: 0,
    attackElapsedMs: 0,
    attackId: 0,
    hitKeys: new Set(),
  }));
}

export function updateStage21IceHazards(
  hazards: Stage21IceHazardModel[],
  targets: readonly Stage21IceTarget[],
  deltaMs: number,
  random: () => number = Math.random,
): readonly Stage21IceHit[] {
  const elapsed = Math.max(0, deltaMs);
  const hits: Stage21IceHit[] = [];
  for (const hazard of hazards) {
    advanceAttackId(hazard, elapsed);
    if (
      hazard.source.orientation === 'ceiling'
      && hazard.frame === 1
      && targets.some((target) => target.alive
        && Math.abs(target.x - hazard.source.x) <= Stage21IceTuning.triggerDistanceX + Number.EPSILON * 1_000)
    ) {
      hazard.frame = 2;
      hazard.frameElapsedMs = 0;
    }
    advanceAnimation(hazard, elapsed);
    for (const target of targets) {
      if (!target.alive || !intersectsVisibleThorn(hazard, target)) continue;
      const hitKey = `${target.slot}:${hazard.attackId}`;
      if (hazard.hitKeys.has(hitKey)) continue;
      hazard.hitKeys.add(hitKey);
      hits.push({
        hazardId: hazard.source.id,
        attackId: hazard.attackId,
        target: target.slot,
        damage: 10 + random() * 10,
        knockbackX: target.facingX === 1 ? 10 : -10,
      });
    }
  }
  return hits;
}

function advanceAttackId(hazard: Stage21IceHazardModel, deltaMs: number): void {
  hazard.attackElapsedMs += deltaMs;
  while (hazard.attackElapsedMs >= Stage21IceTuning.attackIdIntervalMs) {
    hazard.attackElapsedMs -= Stage21IceTuning.attackIdIntervalMs;
    hazard.attackId += 1;
    hazard.hitKeys.clear();
  }
}

function advanceAnimation(hazard: Stage21IceHazardModel, deltaMs: number): void {
  if (hazard.source.orientation === 'floor' || hazard.frame === 1) return;
  hazard.frameElapsedMs += deltaMs;
  while (hazard.frameElapsedMs >= frameDurationMs) {
    hazard.frameElapsedMs -= frameDurationMs;
    hazard.frame += 1;
    if (hazard.frame > Stage21IceTuning.frameCount) {
      hazard.frame = 1;
      hazard.frameElapsedMs = 0;
      break;
    }
  }
}

function intersectsVisibleThorn(
  hazard: Stage21IceHazardModel,
  target: Stage21IceTarget,
): boolean {
  if (hazard.frame > Stage21IceTuning.activeFrameEnd) return false;
  const source = hazard.source;
  const progress = source.orientation === 'floor' ? 0 : (hazard.frame - 1) / 31;
  const visibleTop = source.orientation === 'floor'
    ? source.y - 54
    : source.y + progress * 497;
  const visibleBottom = visibleTop + 54;
  const left = source.orientation === 'floor' ? source.x - 39 : source.x + 1;
  const right = left + 38;
  const targetLeft = target.x - target.width / 2;
  const targetRight = target.x + target.width / 2;
  const targetTop = target.y - target.height;
  return targetRight >= left && targetLeft <= right
    && target.y >= visibleTop && targetTop <= visibleBottom;
}
