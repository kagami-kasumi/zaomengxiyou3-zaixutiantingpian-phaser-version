import type { MovementPlatform } from './HeroMovementSystem';
import {
  STAGE13_GROUND_PLATFORM_ID,
  STAGE13_GROUND_TOP_Y,
  STAGE13_WORLD_LEFT,
  STAGE13_WORLD_WIDTH,
  stage13StopPoints,
} from './Stage13Layout';

export const STAGE13_VIEWPORT_WIDTH = 940;
export const STAGE13_SCREEN_LEFT_X = 20;
export const STAGE13_SCREEN_RIGHT_X = 920;
export const STAGE13_CAMERA_FOLLOW_X = STAGE13_VIEWPORT_WIDTH * 2 / 3;

export const stage13MovementPlatforms: readonly MovementPlatform[] = [{
  id: STAGE13_GROUND_PLATFORM_ID,
  kind: 'solid',
  left: STAGE13_WORLD_LEFT,
  right: STAGE13_WORLD_LEFT + STAGE13_WORLD_WIDTH,
  top: STAGE13_GROUND_TOP_Y,
}];

export function getStage13TravelRight(nextStopPointIdx: number | undefined): number {
  return nextStopPointIdx === undefined
    ? STAGE13_WORLD_LEFT + STAGE13_WORLD_WIDTH - 20
    : stage13StopPoints[nextStopPointIdx]?.x ?? STAGE13_WORLD_LEFT + STAGE13_WORLD_WIDTH - 20;
}

export function getStage13CameraScrollX(frontPlayerX: number, nextStopPointIdx: number | undefined): number {
  const worldMaxScroll = STAGE13_WORLD_LEFT + STAGE13_WORLD_WIDTH - STAGE13_VIEWPORT_WIDTH;
  const stopMaxScroll = nextStopPointIdx === undefined
    ? worldMaxScroll
    : Math.max(0, getStage13TravelRight(nextStopPointIdx) - STAGE13_SCREEN_RIGHT_X);
  return Math.min(Math.max(frontPlayerX - STAGE13_CAMERA_FOLLOW_X, 0), stopMaxScroll);
}

export function hasReachedStage13StopPoint(frontPlayerX: number, nextStopPointIdx: number | undefined): boolean {
  return nextStopPointIdx !== undefined && frontPlayerX >= getStage13TravelRight(nextStopPointIdx);
}
