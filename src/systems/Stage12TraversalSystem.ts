import type { MovementPlatform } from './HeroMovementSystem';
import {
  STAGE12_GROUND_PLATFORM_ID,
  STAGE12_GROUND_TOP_Y,
  STAGE12_WORLD_LEFT,
  STAGE12_WORLD_WIDTH,
  stage12StopPoints,
} from './Stage12Layout';

export const STAGE12_VIEWPORT_WIDTH = 940;
export const STAGE12_SCREEN_LEFT_X = 20;
export const STAGE12_SCREEN_RIGHT_X = 920;
export const STAGE12_CAMERA_FOLLOW_X = STAGE12_VIEWPORT_WIDTH * 2 / 3;

export const stage12MovementPlatforms: readonly MovementPlatform[] = [{
  id: STAGE12_GROUND_PLATFORM_ID,
  kind: 'solid',
  left: STAGE12_WORLD_LEFT,
  right: STAGE12_WORLD_LEFT + STAGE12_WORLD_WIDTH,
  top: STAGE12_GROUND_TOP_Y,
}];

export function getStage12TravelRight(nextStopPointIdx: number | undefined): number {
  return nextStopPointIdx === undefined
    ? STAGE12_WORLD_LEFT + STAGE12_WORLD_WIDTH - 20
    : stage12StopPoints[nextStopPointIdx]?.x ?? STAGE12_WORLD_LEFT + STAGE12_WORLD_WIDTH - 20;
}

export function getStage12CameraScrollX(
  frontPlayerX: number,
  nextStopPointIdx: number | undefined,
): number {
  const worldMaxScroll = STAGE12_WORLD_LEFT + STAGE12_WORLD_WIDTH - STAGE12_VIEWPORT_WIDTH;
  const stopMaxScroll = nextStopPointIdx === undefined
    ? worldMaxScroll
    : Math.max(0, getStage12TravelRight(nextStopPointIdx) - STAGE12_SCREEN_RIGHT_X);
  return Math.min(Math.max(frontPlayerX - STAGE12_CAMERA_FOLLOW_X, 0), stopMaxScroll);
}

export function hasReachedStage12StopPoint(
  frontPlayerX: number,
  nextStopPointIdx: number | undefined,
): boolean {
  return nextStopPointIdx !== undefined
    && frontPlayerX >= getStage12TravelRight(nextStopPointIdx);
}
