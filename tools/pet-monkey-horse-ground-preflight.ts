/** Existing shared physics versus original AIR; zero exit is diagnostic collection only. */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { stepPetGroundMotion, type PetGroundMotion, type PetGroundWall } from '../src/systems/PetGroundMovementSystem';
import { toDragonSourceCoordinate } from '../src/systems/PetDragonCollisionSystem';

type Row = { family: string; form: number; initialAction: string; mode: string; direction: -1 | 0 | 1;
  tick: number; initial: { x: number; y: number; vx: number; vy: number };
  collision: { left: number; top: number; width: number; height: number };
  x: number; y: number; vx: number; vy: number; standing: boolean; head: boolean; left: boolean; right: boolean;
  beforeFlags: { attacking: boolean; hurt: boolean; immobileFloor: boolean }; moveCalls: number };
const native = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SLICE-226/ground-native.json', 'utf8')) as { cases: Row[] };
const failures: unknown[] = [];
const counts: Record<string, number> = {};
const quantize = process.env.PET226_GROUND_QUANTIZE === '1';
let motion: PetGroundMotion;
for (const row of native.cases) {
  if (row.tick === 1) motion = { x: row.initial.x, y: row.initial.y,
    velocityX: row.initial.vx, velocityY: row.initial.vy, direction: row.direction };
  let wall: PetGroundWall = { id: 'wall', left: -200, right: 200, top: 80, bottom: 100, usesWallTolerance: true };
  if (row.mode === 'ceiling') wall = { ...wall, top: -80, bottom: -60 };
  if (row.mode === 'left') wall = { ...wall, left: -70, right: -50, top: -200, bottom: 200 };
  if (row.mode === 'right') wall = { ...wall, left: 70, right: 90, top: -200, bottom: 200 };
  if (row.mode === 'through') wall = { ...wall, through: true, isThroughWallClass: true };
  const before = { ...motion! };
  const result = stepPetGroundMotion(motion!, {
    collision: { width: row.collision.width, height: row.collision.height,
      registration: { x: -row.collision.left, y: -row.collision.top } },
    speed: 5, gravity: 1.5, walls: row.mode === 'air' ? [] : [wall],
    attacking: row.beforeFlags.attacking, hurt: row.beforeFlags.hurt,
    mayMoveDuringGroundAttack: !row.beforeFlags.immobileFloor, suppressMove: row.moveCalls === 0,
  });
  if (quantize) {
    motion!.x = toDragonSourceCoordinate(motion!.x);
    motion!.y = toDragonSourceCoordinate(motion!.y);
  }
  const actual = { x: motion!.x, y: motion!.y, vx: motion!.velocityX, vy: motion!.velocityY,
    standing: !!motion!.standingOn, head: result.hitHead, side: result.hitSide };
  const expected = { x: row.x, y: row.y, vx: row.vx, vy: row.vy, standing: row.standing,
    head: row.head, side: row.left || row.right };
  const fields = Object.keys(expected).filter(key => {
    const a = actual[key as keyof typeof actual], e = expected[key as keyof typeof expected];
    return typeof a === 'number' && typeof e === 'number' ? Math.abs(a - e) > 1e-8 : a !== e;
  });
  if (fields.length) {
    const key = `${row.family}${row.form}/${row.mode}`;
    counts[key] = (counts[key] ?? 0) + 1;
    failures.push({ family: row.family, form: row.form, initialAction: row.initialAction,
      mode: row.mode, direction: row.direction, tick: row.tick, fields, before, actual, expected });
  }
}
assert(native.cases.length > 0);
export const groundMotionComparison = { totalStates: native.cases.length, failedStates: failures.length, quantize, counts };
writeFileSync(`docs/tasks/evidence/TASK-SLICE-226/ground-helper${quantize ? '-quantized' : '-current'}-preflight.json`, JSON.stringify({
  status: 'diagnostic-not-acceptance', totalStates: native.cases.length, failedStates: failures.length,
  quantize,
  scope: 'Shared static-wall helper with source action flags; optional final-coordinate truncation is diagnosis only. Does not test family mapping, intermediate setters, AI or Session integration.',
  counts, samples: failures.slice(0, 30),
}, null, 2) + '\n');
console.log(JSON.stringify({ totalStates: native.cases.length, failedStates: failures.length, counts, samples: failures.slice(0, 3) }));
