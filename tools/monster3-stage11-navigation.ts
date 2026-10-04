// Browser driver only: follow the existing Stage11 audit route using keys.
const route = [2, 3, 4, 5, 9, 11, 12, 6, 13, 7, 14, 15]
  .map(n => `stage11-through-${n}`).concat('stage11-through-up-down-1');
const navigation = new WeakMap<object, { index: number; jumpAt: number; longJump: boolean }>();

export function stage11Navigation(scene: any, movement: any, ticks: number, fps: number, canFight: boolean) {
  let state = navigation.get(movement);
  if (!state) { state = { index: 0, jumpAt: -Infinity, longJump: false }; navigation.set(movement, state); }
  if (movement.grounded) {
    state.index = Math.max(0, route.indexOf(movement.currentPlatformId) + 1);
    if (canFight) { state.jumpAt = -Infinity; return undefined; }
  } else if (state.jumpAt === -Infinity && canFight) return undefined;
  const target = scene.movementPlatforms.find((p: any) => p.id === route[Math.min(state.index, route.length - 1)]);
  if (!target) throw new Error('Stage11 navigation target platform is missing');
  let targetX = Math.min(Math.max(movement.x, target.left + 20), target.right - 20);
  const source = scene.movementPlatforms.find((p: any) => p.id === movement.currentPlatformId);
  const edgeX = source && (targetX < movement.x ? source.left - movement.width / 4 : source.right + movement.width / 4);
  const needsEdge = movement.grounded && source && Math.abs(targetX - movement.x) > 300
    && Math.abs(edgeX - movement.x) > 8;
  if (needsEdge) targetX = edgeX;
  if (!needsEdge && movement.grounded && ticks - state.jumpAt > fps * 0.45) {
    state.jumpAt = ticks; state.longJump = Math.abs(targetX - movement.x) > 400;
  }
  const elapsed = (ticks - state.jumpAt) / fps;
  const secondJump = state.longJump ? 0.35 : 0.22;
  // Release/repress the direction once to request the game's existing double-tap run.
  return { dx: ticks === state.jumpAt || ticks - state.jumpAt === 3 ? 0 : targetX - movement.x,
    jump: elapsed < 0.09 || elapsed >= secondJump && elapsed < secondJump + 0.09 };
}
