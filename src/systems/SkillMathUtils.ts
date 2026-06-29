export function clampSkillLevel(level: number, max = 18): number {
  return Math.min(max, Math.max(1, Math.floor(level)));
}

export function clampSkillLevelOrZero(level: number, max = 18): number {
  return level > 0 ? clampSkillLevel(level, max) : 0;
}

export function distance2d(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}
