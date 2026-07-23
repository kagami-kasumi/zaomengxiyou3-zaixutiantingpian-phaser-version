import type { MovementPlatform } from './HeroMovementSystem';
import {
  STAGE21_GROUND_PLATFORM_ID,
  STAGE21_GROUND_TOP_Y,
  STAGE21_WORLD_LEFT,
  STAGE21_WORLD_WIDTH,
  stage21StopPoints,
  stage21WallMarkers,
} from './Stage21Layout';

export const STAGE21_VIEWPORT_WIDTH = 940;
export const STAGE21_SCREEN_LEFT_X = 20;
export const STAGE21_SCREEN_RIGHT_X = 920;
export const STAGE21_CAMERA_FOLLOW_X = STAGE21_VIEWPORT_WIDTH * 2 / 3;

export const stage21MovementPlatforms: readonly MovementPlatform[] = [
  {
    id: STAGE21_GROUND_PLATFORM_ID,
    kind: 'solid',
    left: STAGE21_WORLD_LEFT,
    right: STAGE21_WORLD_LEFT + STAGE21_WORLD_WIDTH,
    top: STAGE21_GROUND_TOP_Y,
  },
  ...stage21WallMarkers
    .filter((marker) => marker.kind === 'ThroughWall')
    .map((marker) => ({
      id: marker.id,
      kind: 'through' as const,
      left: marker.matrix.tx - marker.sourceSize.width * marker.matrix.a / 2,
      right: marker.matrix.tx + marker.sourceSize.width * marker.matrix.a / 2,
      top: marker.matrix.ty - marker.sourceSize.height / 2,
    })),
];

export function getStage21TravelRight(nextStopPointIdx: number | undefined): number {
  return nextStopPointIdx === undefined
    ? STAGE21_WORLD_LEFT + STAGE21_WORLD_WIDTH - 20
    : stage21StopPoints[nextStopPointIdx]?.x ?? STAGE21_WORLD_LEFT + STAGE21_WORLD_WIDTH - 20;
}

export function getStage21CameraScrollX(frontPlayerX: number, nextStopPointIdx: number | undefined): number {
  const worldMaxScroll = STAGE21_WORLD_LEFT + STAGE21_WORLD_WIDTH - STAGE21_VIEWPORT_WIDTH;
  const stopMaxScroll = nextStopPointIdx === undefined
    ? worldMaxScroll
    : Math.max(0, getStage21TravelRight(nextStopPointIdx) - STAGE21_SCREEN_RIGHT_X);
  return Math.min(Math.max(frontPlayerX - STAGE21_CAMERA_FOLLOW_X, 0), stopMaxScroll);
}

export function hasReachedStage21StopPoint(frontPlayerX: number, nextStopPointIdx: number | undefined): boolean {
  return nextStopPointIdx !== undefined && frontPlayerX >= getStage21TravelRight(nextStopPointIdx);
}
