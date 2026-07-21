export type Stage12FbEnterPhase = 'sealed' | 'opening' | 'open' | 'transitioned';

export type Stage12FbEnterModel = {
  phase: Stage12FbEnterPhase;
  remainingHits: number;
  hitCooldownRemainingMs: number;
  frameIndex: number;
  animationElapsedMs: number;
  stayFramesRemaining: number;
};

export const Stage12FbEnterRequiredHits = 5;
export const Stage12FbEnterHitCooldownMs = 1_000;
export const Stage12FbEnterFrameCount = 30;
export const Stage12FbEnterStayFrames = 72;
export const Stage12FbEnterAnimationFps = 24;

const animationFrameMs = 1_000 / Stage12FbEnterAnimationFps;

export function createStage12FbEnter(): Stage12FbEnterModel {
  return {
    phase: 'sealed',
    remainingHits: Stage12FbEnterRequiredHits,
    hitCooldownRemainingMs: 0,
    frameIndex: 0,
    animationElapsedMs: 0,
    stayFramesRemaining: Stage12FbEnterStayFrames,
  };
}

export function registerStage12FbEnterHit(model: Stage12FbEnterModel): boolean {
  if (model.phase !== 'sealed' || model.hitCooldownRemainingMs > 0) return false;
  model.remainingHits = Math.max(0, model.remainingHits - 1);
  model.hitCooldownRemainingMs = Stage12FbEnterHitCooldownMs;
  if (model.remainingHits === 0) {
    model.phase = 'opening';
    model.frameIndex = 1;
    model.animationElapsedMs = 0;
  }
  return true;
}

export function updateStage12FbEnter(
  model: Stage12FbEnterModel,
  deltaMs: number,
  insidePlayerCount: number,
): boolean {
  if (model.phase === 'transitioned') return false;
  const elapsedMs = Math.max(0, deltaMs);
  model.hitCooldownRemainingMs = Math.max(0, model.hitCooldownRemainingMs - elapsedMs);

  if (model.phase === 'opening') {
    model.animationElapsedMs += elapsedMs;
    while (
      model.animationElapsedMs >= animationFrameMs
      && model.frameIndex < Stage12FbEnterFrameCount - 1
    ) {
      model.animationElapsedMs -= animationFrameMs;
      model.frameIndex += 1;
    }
    if (model.frameIndex === Stage12FbEnterFrameCount - 1) model.phase = 'open';
  }

  if (model.phase !== 'open') return false;
  if (insidePlayerCount <= 0) {
    model.stayFramesRemaining = Stage12FbEnterStayFrames;
    return false;
  }
  model.stayFramesRemaining = Math.max(0, model.stayFramesRemaining - 1);
  if (model.stayFramesRemaining > 0) return false;
  model.phase = 'transitioned';
  return true;
}
