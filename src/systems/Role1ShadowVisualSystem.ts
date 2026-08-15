import type { Role1ShadowModel } from './Role1ShadowSkillSystem';
import {
  getRole1ShadowActionCell,
  getRole1ShadowPlacement,
  type Role1ShadowDirection,
} from './Role1ShadowTruth';

export type Role1ShadowVisualProjection = Readonly<{
  stateId: string;
  frame: number;
  x: number;
  y: number;
  originX: number;
  originY: number;
  flipX: boolean;
}>;

export function projectRole1ShadowVisual(shadow: Role1ShadowModel): Role1ShadowVisualProjection {
  const direction: Role1ShadowDirection = shadow.facingX < 0 ? 'left' : 'right';
  const state = getRole1ShadowActionCell(shadow.action, shadow.candidate, shadow.actionTick);
  const placement = getRole1ShadowPlacement(shadow.action, state.cell, direction);
  const bounds = placement.localBounds!;
  const registration = placement.registrationPoint!;
  return {
    stateId: `${shadow.action}-${state.cell}-${direction}`,
    frame: state.frame,
    x: shadow.x,
    y: shadow.y,
    originX: registration.x / bounds.width,
    originY: registration.y / bounds.height,
    flipX: shadow.facingX > 0,
  };
}
