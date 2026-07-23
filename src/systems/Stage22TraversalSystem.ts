import type { MovementPlatform } from './HeroMovementSystem';
import {
  STAGE22_GROUND_PLATFORM_ID,
  STAGE22_GROUND_TOP_Y,
  STAGE22_TRAVEL_LEFT,
  STAGE22_TRAVEL_RIGHT,
  stage22StopPoints,
  stage22WallMarkers,
} from './Stage22Layout';

export const STAGE22_VIEWPORT_WIDTH = 940;
export const STAGE22_SCREEN_LEFT_X = 20;
export const STAGE22_SCREEN_RIGHT_X = 920;
export const STAGE22_CAMERA_FOLLOW_X = STAGE22_VIEWPORT_WIDTH * 2 / 3;

export const stage22MovementPlatforms: readonly MovementPlatform[] = [
  {
    id: STAGE22_GROUND_PLATFORM_ID,
    kind: 'solid',
    left: STAGE22_TRAVEL_LEFT,
    right: STAGE22_TRAVEL_RIGHT,
    top: STAGE22_GROUND_TOP_Y,
  },
  ...stage22WallMarkers
    .filter((marker) => marker.kind === 'ThroughWall')
    .map((marker) => ({
      id: marker.id,
      kind: 'through' as const,
      left: marker.matrix.tx - marker.sourceSize.width * marker.matrix.a / 2,
      right: marker.matrix.tx + marker.sourceSize.width * marker.matrix.a / 2,
      top: marker.matrix.ty - marker.sourceSize.height * marker.matrix.d / 2,
    })),
];

export function getStage22TravelRight(nextStopPointIdx: number | undefined): number {
  return nextStopPointIdx === undefined
    ? STAGE22_TRAVEL_RIGHT
    : stage22StopPoints[nextStopPointIdx]?.x ?? STAGE22_TRAVEL_RIGHT;
}

export function getStage22CameraScrollX(
  frontPlayerX: number,
  nextStopPointIdx: number | undefined,
): number {
  const worldMaxScroll = STAGE22_TRAVEL_RIGHT - STAGE22_VIEWPORT_WIDTH;
  const stopMaxScroll = nextStopPointIdx === undefined
    ? worldMaxScroll
    : Math.max(0, getStage22TravelRight(nextStopPointIdx) - STAGE22_SCREEN_RIGHT_X);
  return Math.min(Math.max(frontPlayerX - STAGE22_CAMERA_FOLLOW_X, 0), stopMaxScroll);
}

export function hasReachedStage22StopPoint(
  frontPlayerX: number,
  nextStopPointIdx: number | undefined,
): boolean {
  return nextStopPointIdx !== undefined
    && frontPlayerX >= getStage22TravelRight(nextStopPointIdx);
}
