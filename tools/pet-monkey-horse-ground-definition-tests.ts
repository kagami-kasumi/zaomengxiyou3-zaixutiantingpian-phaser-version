/** Native physics samples against the actual movement class and family data projection.
 * This deliberately excludes EntitySession AI/body/lifecycle scheduling. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getPetMonkeyHorseGroundDefinition } from '../src/systems/PetMonkeyHorseGroundDefinition';
import { PetGroundSessionMovement } from '../src/systems/PetGroundSessionMovement';
import type { PetGroundWall } from '../src/systems/PetGroundMovementSystem';
import type { PetRuntimeModel } from '../src/systems/PetTypes';

type Row = { family: 'monkey' | 'horse'; form: 1 | 2 | 3 | 4; tick: number;
  direction: -1 | 0 | 1; mode: string; initialAction: string;
  initial: { x: number; y: number; vx: number; vy: number };
  beforeFlags: { action: string; attacking: boolean; hurt: boolean; immobileFloor: boolean };
  x: number; y: number; vx: number; vy: number; standing: boolean; moveCalls: number };
const native = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SLICE-226/ground-native.json', 'utf8')) as { cases: Row[] };
let movement: PetGroundSessionMovement;
for (const row of native.cases) {
  const definition = getPetMonkeyHorseGroundDefinition(row.family, row.form);
  if (row.tick === 1) {
    assert.deepEqual(definition.initialVelocity, { x: 0, y: 4 });
    assert.equal(definition.attackRate, 0.7, 'Final BasePet constructor assignment, not its earlier 0.8');
    const runtime: PetRuntimeModel = { petId: 'ground-fixture', runtimeKey: 'ground-fixture',
      x: row.initial.x, y: row.initial.y, facingX: 1, state: 'idle' };
    // Ceiling probe starts with controlled vy=-12; all other cases use the real constructor velocity.
    movement = new PetGroundSessionMovement(runtime, { ...definition,
      initialVelocity: { x: row.initial.vx, y: row.initial.vy } });
    if (row.direction) movement.face(row.direction);
  }
  const action = row.beforeFlags.action;
  assert.equal(movement!.isAttacking(action), row.beforeFlags.attacking);
  assert.equal(movement!.isHurt(action), row.beforeFlags.hurt);
  assert.equal(definition.immobileGroundActions.includes(action), row.beforeFlags.immobileFloor);
  assert.equal(definition.suppressMoveActions!.includes(action), row.moveCalls === 0);
  let wall: PetGroundWall = { id: 'wall', left: -200, right: 200, top: 80, bottom: 100, usesWallTolerance: true };
  if (row.mode === 'ceiling') wall = { ...wall, top: -80, bottom: -60 };
  if (row.mode === 'left') wall = { ...wall, left: -70, right: -50, top: -200, bottom: 200 };
  if (row.mode === 'right') wall = { ...wall, left: 70, right: 90, top: -200, bottom: 200 };
  if (row.mode === 'through') wall = { ...wall, through: true, isThroughWallClass: true };
  movement!.step({ walls: row.mode === 'air' ? [] : [wall], ownerRootOffsetY: 0 }, 999, action);
  const actual = movement!.snapshot();
  for (const [key, expected] of Object.entries({ x: row.x, y: row.y, velocityX: row.vx, velocityY: row.vy })) {
    assert.ok(Math.abs(actual[key as 'x' | 'y' | 'velocityX' | 'velocityY'] - expected) < 1e-8,
      `${row.family}${row.form}/${row.initialAction}/${row.mode}/${row.direction}/${row.tick} ${key}`);
  }
  assert.equal(!!actual.standingOn, row.standing);
}
assert.equal(native.cases.length, 25920);
// Public contracts: Monkey4 inherits the third form's skill names; ground locks differ from move suppression.
const monkey4 = getPetMonkeyHorseGroundDefinition('monkey', 4);
for (const action of ['basic-attack', 'monkey3-lyq', 'monkey3-lj']) assert(monkey4.suppressMoveActions!.includes(action), action);
for (const action of ['monkey3-xj', 'monkey4-jgaoyi']) assert(!monkey4.suppressMoveActions!.includes(action), action);
assert(monkey4.immobileGroundActions.includes('monkey3-xj'));
assert(!monkey4.immobileGroundActions.includes('monkey3-lj'));
assert.deepEqual(monkey4.intelligenceBlockedActions, ['hurt', 'dead']);
console.log('25920 native movement states matched family data and the real ground movement class; EntitySession integration excluded.');
